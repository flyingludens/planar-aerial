// lib/mosaic.js
import { newId } from '../domain/ids.js'
import {
  EMPTY_MOSAIC, ENTITY_KINDS, SHARED_FIELDS, KIND_FIELDS,
} from '../domain/schema.js'
import { createEntity, normalizeMosaic } from '../domain/board.js'

/**
 * The Mosaic board: one property graph per book.
 *
 * Entities are characters and setting cards; edges are formal relations between them. An edge
 * carries the AUTHOR'S truth plus one level of per-character beliefs — never nested — and a
 * change log appended by the proposal flow. Retiring an edge keeps it: the wall hides it, the
 * log explains it, and the writer can still find it again.
 */
// Kept on this module's surface: the board's constants and fact checks are what callers import
// from here, and splitting the file must not move every import.
export { EMPTY_MOSAIC, ENTITY_KINDS } from '../domain/schema.js'
export { normalizeMosaic } from '../domain/board.js'
export { factStatus, factStatuses } from './facts.js'

const str = (v) => (typeof v === 'string' ? v : '')

/** The kind's label, in the book's own language. Used by digests and prompts. */
export const KIND_LABELS = {
  character: '角色',
  place: '地点',
  faction: '组织',
  item: '物品',
  event: '事件',
}

/**
 * Apply one proposal's changes to a mosaic, purely: callers own persistence. Each op resolves
 * against entities the writer can see — characters by kind+name, edges by endpoint pair — so a
 * repeated suggestion updates instead of duplicating, the same contract the agent tools use.
 * Unknown ops and empty names are counted as skipped, never fatal: one bad line must not void
 * the proposals the writer already accepted.
 */
/** The provenance stamp for one fact written from a proposal: 'chapter' + what backed it. */
function stamp(provenance, note) {
  if (provenance === undefined || typeof provenance.chapterId !== 'string' || provenance.chapterId === '') {
    return { source: 'board' }
  }
  return {
    source: 'chapter',
    evidence: [str(note)].filter((line) => line !== ''),
    basedOn: { chapter: provenance.chapterId, hash: str(provenance.hash) },
  }
}

export function applyMosaicProposal(mosaic, proposal, provenance) {
  // structuredClone is a runtime global in Node and the host realm, but this repo's lint config
  // names globals explicitly and adding one there is outside this change; globalThis keeps the
  // no-undef rule's typo protection intact.
  const deepClone = (v) => globalThis.structuredClone(v)
  const next = {
    schemaVersion: 4,
    entities: (mosaic?.entities ?? []).map(deepClone),
    edges: (mosaic?.edges ?? []).map(deepClone),
  }
  const applied = []
  let skipped = 0
  const log = (edge, what, before, after) => {
    edge.log.push({ at: Date.now(), what, before, after })
  }
  for (const raw of Array.isArray(proposal?.changes) ? proposal.changes : []) {
    const op = typeof raw?.op === 'string' ? raw.op : ''
    if (op === 'entity.upsert') {
      const kind = ENTITY_KINDS.includes(raw.kind) ? raw.kind : null
      const name = str(raw?.name).trim()
      if (kind === null || name === '') { skipped += 1; continue }
      let entity = next.entities.find((e) => e.kind === kind && e.name === name)
      if (entity === undefined) {
        entity = createEntity(kind, name)
        Object.assign(entity, stamp(provenance, str(raw.summary ?? raw.description ?? '')))
        next.entities.push(entity)
      }
      // Only the fields the proposal actually supplied are written, so a partial suggestion can
      // never blank a card the writer filled in by hand.
      for (const field of SHARED_FIELDS) {
        if (typeof raw[field] === 'string') entity[field] = raw[field]
      }
      for (const field of KIND_FIELDS[kind]) {
        if (typeof raw[field] === 'string') entity[field] = raw[field]
      }
      if (Array.isArray(raw.aliases)) entity.aliases = raw.aliases.map(str).map((s) => s.trim()).filter((s) => s !== '')
      if (Array.isArray(raw.tags)) entity.tags = raw.tags.map(str).filter((s) => s !== '')
      // A custom row is matched by label, so "血型" written twice updates one row instead of
      // stacking a second one with the same name.
      for (const row of Array.isArray(raw.custom) ? raw.custom : []) {
        const label = str(row?.label).trim()
        if (label === '') continue
        const existing = (entity.custom ?? []).find((held) => held.label === label)
        if (existing === undefined) entity.custom = [...(entity.custom ?? []), { id: newId('c'), label, value: str(row.value) }]
        else existing.value = str(row.value)
      }
      if (provenance !== undefined && typeof provenance.chapterId === 'string' && provenance.chapterId !== '') {
        entity.source = 'chapter'
        entity.evidence = [str(raw.summary ?? raw.description ?? '')].filter((line) => line !== '')
        entity.basedOn = { chapter: provenance.chapterId, hash: str(provenance.hash) }
      }
      applied.push(`entity.upsert ${name}`)
      continue
    }
    if (op === 'edge.upsert') {
      const from = str(raw?.from)
      const to = str(raw?.to)
      if (!next.entities.some((e) => e.id === from) || !next.entities.some((e) => e.id === to)) { skipped += 1; continue }
      const truth = {
        kind: str(raw?.truth?.kind).trim(),
        note: str(raw?.truth?.note),
      }
      let edge = next.edges.find((e) => e.from === from && e.to === to)
      if (edge === undefined) {
        edge = { id: newId(), from, to, truth, beliefs: [], retired: false, log: [], ...stamp(provenance, truth.note) }
        next.edges.push(edge)
        applied.push(`edge.upsert ${truth.kind}`)
        continue
      }
      if (edge.truth.kind !== truth.kind) log(edge, 'truth.updated', { kind: edge.truth.kind }, { kind: truth.kind })
      edge.truth = truth
      edge.retired = false
      Object.assign(edge, stamp(provenance, truth.note))
      applied.push(`edge.upsert ${truth.kind}`)
      continue
    }
    if (op === 'belief.add') {
      const edge = next.edges.find((e) => e.id === raw?.edgeId)
      const holderId = str(raw?.holderId)
      const kind = str(raw?.kind).trim()
      if (edge === undefined || !next.entities.some((e) => e.id === holderId) || kind === '') { skipped += 1; continue }
      const belief = { holderId, kind, note: str(raw?.note) }
      const existing = edge.beliefs.findIndex((b) => b.holderId === holderId)
      if (existing >= 0) edge.beliefs[existing] = belief
      else edge.beliefs.push(belief)
      applied.push(`belief.add ${kind}`)
      continue
    }
    if (op === 'status.add' || op === 'status.remove') {
      const entity = next.entities.find((e) => e.id === raw?.entityId)
      const label = str(raw?.label).trim()
      // Statuses belong to every kind now: "已被查封" is a place's state, "丢失" an item's. The
      // character-only restriction was an accident of the first schema, not a rule about stories.
      if (entity === undefined || label === '') { skipped += 1; continue }
      entity.statuses = entity.statuses ?? []
      if (op === 'status.add') {
        if (!entity.statuses.some((s) => s.label === label)) entity.statuses.push({ id: newId('s'), label })
      } else {
        entity.statuses = entity.statuses.filter((s) => s.label !== label)
      }
      applied.push(`${op} ${label}`)
      continue
    }
    if (op === 'edge.retire') {
      const edge = next.edges.find((e) => e.id === raw?.edgeId)
      if (edge === undefined) { skipped += 1; continue }
      if (!edge.retired) log(edge, 'edge.retired', null, { reason: str(raw?.reason) })
      edge.retired = true
      applied.push('edge.retire')
      continue
    }
    skipped += 1
  }
  return { mosaic: next, applied, skipped }
}

/**
 * The compact board summary that rides with every mosaic request and every chat turn: one line
 * per entity, one per live relation. Each line carries the entity's id in brackets, because the
 * proposal ops (`edge.upsert` from/to, `belief.add` holderId, `status.*` entityId) resolve by id
 * and the check prompt asks for ids — a digest of names alone would hand the model a protocol it
 * could not satisfy. Retired edges stay out — they are history, not present state — and the full
 * board is a tool call away (story_mosaic_query).
 */
export function mosaicDigest(mosaic) {
  const m = mosaic ?? EMPTY_MOSAIC
  const lines = []
  for (const e of m.entities) {
    // One line per card, in the same shape whatever it is: kind label, name, id, and the one or two
    // facts a writer would use to tell two similar cards apart. The id is what makes the proposal
    // protocol work, so it stays on every line.
    const traits = digestTraits(e)
    lines.push(`${KIND_LABELS[e.kind] ?? e.kind} ${e.name} [${e.id}]${traits === '' ? '' : `（${traits}）`}`)
  }
  for (const edge of m.edges) {
    if (edge.retired) continue
    const from = m.entities.find((e) => e.id === edge.from)
    const to = m.entities.find((e) => e.id === edge.to)
    if (from === undefined || to === undefined) continue
    lines.push(`${from.name} [${from.id}] —${edge.truth.kind} [${edge.id}]→ ${to.name} [${to.id}]`)
  }
  return lines.join('\n')
}

/**
 * The few facts worth putting in a one-line digest. Chosen per kind, and deliberately short: this
 * line rides with every board request, so it carries what identifies the card, not its biography —
 * the full record is a story_mosaic_query away.
 */
function digestTraits(entity) {
  const parts = []
  if (entity.kind === 'character') {
    if (entity.role) parts.push(entity.role)
    // Gender, age and nationality are the three a writer asks for first when checking a name.
    const who = [entity.gender, entity.age, entity.nationality].filter((v) => str(v) !== '').join('·')
    if (who !== '') parts.push(who)
  } else if (entity.summary) {
    parts.push(str(entity.summary).slice(0, 40))
  }
  return parts.join('，')
}

/**
 * Merge a chat proposal into a book in place, on the BOARD.
 *
 * Schema 3 has one place for "who is in this story": the mosaic. A chat reply saying "林 is a
 * photographer" therefore becomes an entity, and "林 认识 周" becomes an edge — the same records
 * the board page edits by hand. Matched by name (entities) and endpoint pair (edges), so a repeated
 * suggestion updates rather than duplicating, and unsupplied fields survive.
 *
 * The returned lists are what the reply reports back to the writer, so they keep the words the
 * proposal used (names, titles) rather than ids nobody typed.
 */
export function applyProposalToBook(book, proposal) {
  const applied = { characters: [], settings: [], relationships: [] }
  const mosaic = normalizeMosaic(book.mosaic)
  // Ids are resolved against the board as it is NOW, including entities added earlier in this
  // same proposal, so a character and the relation naming them can arrive in one reply.
  const idByName = new Map(mosaic.entities.map((e) => [e.name, e.id]))
  const ensure = (name, kind, fields) => {
    let entity = mosaic.entities.find((e) => e.kind === kind && e.name === name)
    if (entity === undefined) {
      // The shared constructor, then the kind's own fields: a chat proposal and a hand-made card
      // must produce the same shape, or the detail page would render two kinds of record.
      entity = createEntity(kind, name)
      mosaic.entities.push(entity)
      idByName.set(name, entity.id)
    }
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) entity[key] = value
    }
    return entity
  }
  for (const raw of proposal.characters ?? []) {
    const name = String(raw?.name ?? '').trim()
    if (name === '') continue
    // `goal/traits/notes/aliases` have no home on a board entity, so they are folded into the
    // free-text summary rather than dropped: the writer wrote them, and silence loses information.
    const extras = [
      Array.isArray(raw.aliases) && raw.aliases.length > 0 ? `别名：${raw.aliases.join('、')}` : '',
      raw.goal ? `目标：${raw.goal}` : '',
      Array.isArray(raw.traits) && raw.traits.length > 0 ? `性格：${raw.traits.join('、')}` : '',
      raw.notes ?? '',
    ].filter(Boolean)
    const existing = mosaic.entities.find((e) => e.kind === 'character' && e.name === name)
    const summary = raw.summary !== undefined ? String(raw.summary)
      : (existing === undefined ? extras.join('。') : undefined)
    ensure(name, 'character', {
      role: raw.role === undefined ? undefined : String(raw.role),
      summary,
    })
    applied.characters.push(name)
  }
  for (const raw of proposal.settings ?? []) {
    const title = String(raw?.title ?? '').trim()
    if (title === '') continue
    const kind = ['place', 'faction', 'item', 'event'].includes(raw.kind) ? raw.kind : 'place'
    // A chat proposal may carry the same fields the board page edits: the one-liner, the long
    // description, and any custom rows. Only what it actually supplied is written.
    const fields = {
      description: raw.body === undefined ? undefined : String(raw.body),
      summary: raw.summary === undefined ? undefined : String(raw.summary),
    }
    const entity = ensure(title, kind, fields)
    if (Array.isArray(raw.custom)) {
      for (const row of raw.custom) {
        const label = String(row?.label ?? '').trim()
        if (label === '') continue
        const held = (entity.custom ?? []).find((each) => each.label === label)
        if (held === undefined) entity.custom = [...(entity.custom ?? []), { id: newId('c'), label, value: String(row.value ?? '') }]
        else held.value = String(row.value ?? '')
      }
    }
    applied.settings.push(title)
  }
  for (const raw of proposal.relationships ?? []) {
    const fromId = idByName.get(String(raw?.from ?? '').trim())
    const toId = idByName.get(String(raw?.to ?? '').trim())
    if (fromId === undefined || toId === undefined) continue
    const kind = String(raw.kind ?? '').trim()
    if (kind === '') continue
    let edge = mosaic.edges.find((e) => e.from === fromId && e.to === toId)
    if (edge === undefined) {
      mosaic.edges.push({ id: newId(), from: fromId, to: toId, truth: { kind, note: String(raw.note ?? '') }, beliefs: [], retired: false, log: [] })
    } else {
      edge.truth = { kind, note: raw.note === undefined ? edge.truth.note : String(raw.note) }
      edge.retired = false
    }
    applied.relationships.push(`${raw.from}-${raw.to}`)
  }
  book.mosaic = mosaic
  return applied
}
