/**
 * What a board entry is CALLED: the kind label, the one-line change description, and the
 * manuscript renderer.
 *
 * All three turn structured data into the words a writer reads. They are separate from the
 * components because they are the only part of the board that can be pinned without rendering:
 * a label for every kind, a description for every operation.
 */
import { h } from '../shared/react.js'
import { renderMarkdownBlocks } from '../shared/logic.js'
import { KIND_FIELDS, REFERENCE_FIELDS, REFERENCE_LIST_FIELDS } from '../../../domain/schema.js'

/**
 * The five kinds' labels, for anywhere the panel names a kind outside the create dialog.
 * `t` is passed in rather than closed over: this file's components each receive their own
 * translator, and a module-level one would be undefined outside a render.
 */
const KIND_LABEL_KEYS = {
  character: 'mosaic.newKindRole',
  place: 'mosaic.newKindPlace',
  faction: 'mosaic.newKindFaction',
  item: 'mosaic.newKindItem',
  event: 'mosaic.newKindEvent',
}

export function kindLabel(kind, t) {
  const key = KIND_LABEL_KEYS[kind]
  return key === undefined ? String(kind ?? '') : t(key)
}


/**
 * The field names a card shows, one label per schema field.
 *
 * The list itself is NOT copied here: KIND_FIELDS in domain/schema.js is the one place that says
 * which fields a kind carries. This table only translates the names, so adding a field to the
 * schema cannot leave a detail page rendering a raw identifier.
 */
const FIELD_LABEL_KEYS = {
  role: 'mosaic.field.role',
  gender: 'mosaic.field.gender',
  age: 'mosaic.field.age',
  nationality: 'mosaic.field.nationality',
  appearance: 'mosaic.field.appearance',
  personality: 'mosaic.field.personality',
  motivation: 'mosaic.field.motivation',
  arc: 'mosaic.field.arc',
  location: 'mosaic.field.location',
  atmosphere: 'mosaic.field.atmosphere',
  controlledBy: 'mosaic.field.controlledBy',
  purpose: 'mosaic.field.purpose',
  base: 'mosaic.field.base',
  leader: 'mosaic.field.leader',
  members: 'mosaic.field.members',
  origin: 'mosaic.field.origin',
  holder: 'mosaic.field.holder',
  significance: 'mosaic.field.significance',
  when: 'mosaic.field.when',
  where: 'mosaic.field.where',
  participants: 'mosaic.field.participants',
  consequence: 'mosaic.field.consequence',
}

/** The schema fields for one kind, in schema order. */
export function kindFields(kind) {
  return KIND_FIELDS[kind] ?? []
}

export function isReferenceField(field) {
  return REFERENCE_FIELDS.includes(field) || REFERENCE_LIST_FIELDS.includes(field)
}

export function fieldLabel(field, t) {
  const key = FIELD_LABEL_KEYS[field]
  return key === undefined ? String(field ?? '') : t(key)
}

/**
 * A field's display text. Reference fields store ids and reference lists store id arrays; both
 * are resolved to the names the writer reads. An empty value stays an empty string — the page
 * renders the row anyway, so a blank field is a visible invitation to fill it in rather than a
 * row that quietly disappears.
 */
export function fieldValue(entity, field, nameOf) {
  const resolve = (id) => (typeof nameOf === 'function' ? nameOf(id) : String(id ?? ''))
  if (REFERENCE_FIELDS.includes(field)) {
    const id = String(entity?.[field] ?? '').trim()
    return id === '' ? '' : resolve(id)
  }
  if (REFERENCE_LIST_FIELDS.includes(field)) {
    const ids = Array.isArray(entity?.[field]) ? entity[field] : []
    return ids.map((id) => resolve(id)).filter((name) => name !== '').join('、')
  }
  return String(entity?.[field] ?? '')
}

/**
 * One line of a stored change, in the words the writer uses.
 *
 * The stored shapes come from three different prompts (`entity.upsert`, `edge.upsert`,
 * `status.add`, and the chat proposal's own), so this is a translation table rather than a
 * template: each op says what it will do to the board, and an unknown op shows its own name
 * instead of disappearing.
 */
export function describeChange(change, nameOf) {
  const op = String(change?.op ?? '')
  // Changes carry ids; the writer reads names. The caller supplies the board's id→name map.
  const resolve = (id) => (typeof nameOf === 'function' ? nameOf(id) : String(id ?? ''))
  const name = change?.name ?? resolve(change?.from ?? change?.entityId ?? '')
  // What the card will BE, in the writer's own words: the role for a person, the one-line
  // summary for anything else. Reading `category` here outlived the field itself, so a place
  // proposal rendered as an op name and an arrow to nothing.
  if (op === 'entity.upsert') {
    const what = change?.kind === 'character' ? (change?.role ?? '') : (change?.summary ?? '')
    return `${name} → ${what}`
  }
  if (op === 'edge.upsert') return `${resolve(change?.from) || '?'} —${change?.kind ?? change?.truth?.kind ?? ''}→ ${resolve(change?.to) || '?'}`
  if (op === 'edge.retire') return `${name} 退役`
  if (op === 'status.add') return `${name} +${change?.label ?? ''}`
  if (op === 'status.remove') return `${name} -${change?.label ?? ''}`
  if (op === 'belief.add') return `${resolve(change?.holderId)} 认为 ${change?.kind ?? ''}`
  return op === '' ? '？' : op
}

/**
 * The merged manuscript, drawn as a document rather than as raw Markdown in a `<pre>`.
 *
 * A writer reads this to check the book, so it has to look like the book: headings at the
 * right level, paragraphs with spacing between them, and the typography the writer chose.
 */
export function renderManuscript(markdown, t) {
  const blocks = renderMarkdownBlocks(markdown)
  if (blocks.length === 0) return [h('div', { className: 'st-muted' }, t('label.emptyManuscript'))]
  return blocks.map((block, index) => {
    if (block.type === 'hr') return h('hr', { key: index, className: 'st-md-rule' })
    const spans = block.spans.map((span, i) => (span.style === 'bold'
      ? h('strong', { key: i }, span.text)
      : span.style === 'italic' ? h('em', { key: i }, span.text) : span.text))
    if (block.type === 'h') {
      // The generator stops at six hashes; the panel only has room for three sizes, so the
      // level is clamped and the depth carries the hierarchy.
      const level = Math.min(6, Math.max(1, block.level))
      // Two classes, because the stylesheet splits them: `.st-md-h` carries what every
      // heading shares (margin, weight, colour) and `.st-md-hN` the size for this level. The
      // level class was missing here, so every heading fell back to the browser's own h1-h6
      // sizes — 30px for a volume title where the sheet asks for 20.
      return h(`h${level}`, { key: index, className: `st-md-h st-md-h${level}` }, ...spans)
    }
    return h('p', { key: index, className: 'st-md-p' }, ...spans)
  })
}
