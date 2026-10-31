/**
 * The board's data: cards, edges, and the rules for reading them into their canonical form.
 *
 * The same module serves `lib/` and the browser bundle, so it may not import Node built-ins,
 * React, `fetch` or either half of the app. It mints ids through `ids.js` and knows nothing
 * about files: `store.js` is the only place that decides where a board lives.
 */
import { newId } from './ids.js'
import {
  BOARD_SCHEMA_VERSION, ENTITY_KINDS, SHARED_FIELDS, KIND_FIELDS,
  REFERENCE_FIELDS, REFERENCE_LIST_FIELDS, EMPTY_MOSAIC, emptyBoard,
} from './schema.js'

const str = (v) => (typeof v === 'string' ? v : '')
const arr = (v) => (Array.isArray(v) ? v : [])

/**
 * The provenance of a fact whose source is the PROSE: which chapter said it, and the hash of that
 * chapter's text when the fact was accepted. Absent for hand-made facts — they are the author's
 * word and owe nothing to the prose, so there is nothing to check against. `evidence` carries the
 * verbatim sentence(s) the fact was extracted from; the relate route already required verbatim
 * quotes for `truth.note`, so this generalizes a rule the prompt had.
 */
function provenanceOf(raw) {
  const evidence = arr(raw.evidence).map(str).filter((s) => s !== '')
  const basedOn = raw.basedOn && typeof raw.basedOn === 'object'
    ? { chapter: str(raw.basedOn.chapter), hash: str(raw.basedOn.hash) }
    : null
  const usable = basedOn !== null && basedOn.chapter !== ''
  if (!usable && evidence.length === 0) return {}
  return {
    ...(evidence.length > 0 ? { evidence } : {}),
    ...(usable ? { basedOn } : {}),
  }
}

/** Normalize one entity. Unknown kinds (including the retired 'card'), empty names, and card
 * statuses are dropped. */
export function normalizeEntity(raw, idSet) {
  if (!raw || typeof raw !== 'object') return null
  const kind = ENTITY_KINDS.includes(raw.kind) ? raw.kind : null
  if (kind === null) return null
  const name = str(raw.name).trim()
  if (name === '') return null
  const entity = {
    id: str(raw.id),
    kind,
    name,
    // Aliases, translations and former names: what the writer calls this card in another scene.
    // They matter to search and to the check prompt ("is 阿九 the same person as 九爷?").
    aliases: arr(raw.aliases).map(str).map((s) => s.trim()).filter((s) => s !== ''),
    tags: arr(raw.tags).map(str).filter((s) => s !== ''),
    layout: raw.layout && Number.isFinite(raw.layout.x) && Number.isFinite(raw.layout.y)
      ? { x: raw.layout.x, y: raw.layout.y } : null,
    // The portrait is a PATH into the book's own portraits directory, never the bytes: the file
    // already lives beside the book, and inlining a megabyte of base64 here would be rewritten on
    // every save. It used to be missing from this whitelist, so a generated picture appeared and
    // then vanished on the next reload — the file was still on disk, nothing pointed at it.
    portrait: str(raw.portrait),
    /**
     * Where this card's facts claim to come from. 'board' is the author's own word (a card made by
     * hand, which the prose owes nothing to); 'chapter' claims the PROSE states it, and that claim
     * is checkable — see factStatus in lib/facts.js. Absent stays 'board': every card that predates
     * provenance was written by hand.
     */
    source: raw.source === 'chapter' ? 'chapter' : 'board',
    ...provenanceOf(raw),
  }
  for (const field of SHARED_FIELDS) entity[field] = str(raw[field])
  // Statuses are the one list on every kind: "重伤", "已被查封", "丢失" are as true of an item or a
  // place as of a person, and restricting them to characters was an accident of the first schema.
  entity.statuses = arr(raw.statuses)
    .filter((s) => s && typeof s === 'object' && str(s.label).trim() !== '')
    .map((s) => ({ id: str(s.id), label: str(s.label).trim() }))
  for (const field of KIND_FIELDS[kind]) entity[field] = str(raw[field])
  // Cross-card references resolve only against cards that exist in THIS mosaic: a dangling id is
  // cleared rather than kept, so a detail page never offers a link to nowhere.
  for (const field of REFERENCE_FIELDS) {
    if (KIND_FIELDS[kind].includes(field)) {
      const target = str(raw[field])
      entity[field] = idSet !== undefined && target !== '' && !idSet.has(target) ? '' : target
    }
  }
  for (const field of REFERENCE_LIST_FIELDS) {
    if (!KIND_FIELDS[kind].includes(field)) continue
    const ids = arr(raw[field]).map(str).filter((id) => id !== '')
    entity[field] = idSet === undefined ? ids : ids.filter((id) => idSet.has(id))
  }
  // The escape hatch: anything the preset fields do not cover. Label+value pairs, so a writer can
  // record "血型: O" or "首次出场: 第三章" without the schema having to know about it.
  entity.custom = arr(raw.custom)
    .filter((row) => row && typeof row === 'object' && str(row.label).trim() !== '')
    .map((row) => ({ id: str(row.id), label: str(row.label).trim(), value: str(row.value) }))
  return entity
}

/** Normalize one edge's truth and one level of beliefs. */
export function normalizeEdge(raw, idSet) {
  if (!raw || typeof raw !== 'object') return null
  const from = str(raw.from)
  const to = str(raw.to)
  // An edge whose endpoints do not exist is unreadable: drop it rather than draw a dangling line.
  if (!idSet.has(from) || !idSet.has(to)) return null
  const truth = raw.truth && typeof raw.truth === 'object'
    ? { kind: str(raw.truth.kind).trim(), note: str(raw.truth.note) } : { kind: '', note: '' }
  const beliefs = arr(raw.beliefs)
    .filter((b) => b && typeof b === 'object' && idSet.has(str(b.holderId)))
    .map((b) => ({ holderId: str(b.holderId), kind: str(b.kind).trim(), note: str(b.note) }))
  return {
    id: str(raw.id), from, to, truth, beliefs,
    retired: raw.retired === true,
    source: raw.source === 'chapter' ? 'chapter' : 'board',
    ...provenanceOf(raw),
    log: arr(raw.log).filter((l) => l && typeof l === 'object' && typeof l.at === 'number')
      .map((l) => ({ at: l.at, what: str(l.what), before: l.before ?? null, after: l.after ?? null })),
  }
}

/**
 * Read any mosaic-shaped value into the canonical form. Empty and duplicate ids are what make an
 * edit land on the wrong entity; only offenders get a fresh uuid, matching book.js.
 */
export function normalizeMosaic(raw) {
  const source = raw && typeof raw === 'object' ? raw : {}
  const entities = []
  // Ids are assigned in a first pass and the cards are normalized in a second: a reference field
  // (`holder`, `leader`) can point at a card that comes LATER in the array, and resolving against
  // a half-built set would clear a perfectly good link.
  const provisional = []
  for (const rawEntity of arr(source.entities)) {
    if (!rawEntity || typeof rawEntity !== 'object') continue
    provisional.push(rawEntity)
  }
  const knownIds = new Set(provisional.map((rawEntity) => str(rawEntity.id)).filter((id) => id !== ''))
  for (const rawEntity of provisional) {
    const entity = normalizeEntity(rawEntity, knownIds)
    if (entity === null) continue
    if (entity.id === '' || entities.some((e) => e.id === entity.id)) entity.id = newId()
    entities.push(entity)
  }
  const idSet = new Set(entities.map((e) => e.id))
  const edges = []
  for (const rawEdge of arr(source.edges)) {
    const edge = normalizeEdge(rawEdge, idSet)
    if (edge === null) continue
    // Two relations between the same pair of endpoints are the same fact told twice; the first
    // one written wins, so later copies never overwrite the author's original wording.
    if (edges.some((e) => e.from === edge.from && e.to === edge.to)) continue
    if (edge.id === '' || edges.some((e) => e.id === edge.id)) edge.id = newId()
    edges.push(edge)
  }
  return { schemaVersion: BOARD_SCHEMA_VERSION, entities, edges }
}

/**
 * A new card of one kind, with every field the kind carries present.
 *
 * The browser's create form, the agent tools and the proposal applier all need this shape. They
 * each built it by hand, which is how a field could be present in one and missing in another and
 * then silently dropped by the normalizer on the next read.
 *
 * Only known fields are copied: a typo in a caller's field name is a programming mistake, and
 * letting it through would mean it survives until the next save and then disappears.
 */
export function createEntity(kind, name, fields = {}) {
  if (!ENTITY_KINDS.includes(kind)) throw new Error(`unknown entity kind: ${String(kind)}`)
  const entity = {
    id: newId(), kind, name: str(name).trim(),
    aliases: [], tags: [], layout: null, portrait: '',
    summary: '', description: '', notes: '', statuses: [], custom: [],
  }
  for (const field of KIND_FIELDS[kind]) entity[field] = ''
  for (const field of REFERENCE_LIST_FIELDS) {
    if (KIND_FIELDS[kind].includes(field)) entity[field] = []
  }
  for (const field of SHARED_FIELDS) {
    if (typeof fields[field] === 'string') entity[field] = fields[field]
  }
  for (const field of KIND_FIELDS[kind]) {
    if (typeof fields[field] === 'string') entity[field] = fields[field]
  }
  if (Array.isArray(fields.aliases)) {
    entity.aliases = fields.aliases.map(str).map((s) => s.trim()).filter((s) => s !== '')
  }
  if (Array.isArray(fields.tags)) entity.tags = fields.tags.map(str).filter((s) => s !== '')
  if (Array.isArray(fields.statuses)) {
    entity.statuses = fields.statuses
      .filter((s) => s && typeof s === 'object' && str(s.label).trim() !== '')
      .map((s) => ({ id: str(s.id) || newId('s'), label: str(s.label).trim() }))
  }
  if (Array.isArray(fields.custom)) {
    entity.custom = fields.custom
      .filter((row) => row && typeof row === 'object' && str(row.label).trim() !== '')
      .map((row) => ({ id: str(row.id) || newId('c'), label: str(row.label).trim(), value: str(row.value) }))
  }
  if (fields.layout && Number.isFinite(fields.layout.x) && Number.isFinite(fields.layout.y)) {
    entity.layout = { x: fields.layout.x, y: fields.layout.y }
  }
  if (typeof fields.portrait === 'string') entity.portrait = fields.portrait
  return entity
}

/**
 * Change one card's fields, returning a new board. The patched card goes back through the
 * normalizer, so a field the board does not know is dropped here rather than surviving until
 * the next save.
 */
export function patchEntity(board, entityId, fields) {
  const current = board ?? emptyBoard()
  const ids = new Set(current.entities.map((entity) => entity.id))
  return {
    ...current,
    entities: current.entities.map((entity) => {
      if (entity.id !== entityId) return entity
      return normalizeEntity({ ...entity, ...fields }, ids) ?? entity
    }),
  }
}

/**
 * Remove one card, and every edge that pointed at it.
 *
 * A wire with one endpoint gone is a line to nothing; the normalizer would drop it on the next
 * read anyway, so removing it here is what keeps what is on screen and what is on disk the same.
 */
export function removeEntity(board, entityId) {
  const current = board ?? emptyBoard()
  return {
    ...current,
    entities: current.entities.filter((entity) => entity.id !== entityId),
    edges: current.edges.filter((edge) => edge.from !== entityId && edge.to !== entityId),
  }
}

export { EMPTY_MOSAIC, emptyBoard }
