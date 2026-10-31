/**
 * The book's data: the manuscript tree, its stored shape, and the one rule that decides what a
 * chapter's status becomes when the writer types into it.
 *
 * Shared by `lib/` and the browser bundle. It may not import Node built-ins, React, `fetch` or
 * either half of the app; ids come from `ids.js`, the board from `board.js`.
 */
import { newId } from './ids.js'
import { BOOK_SCHEMA_VERSION, NODE_LEVELS, NODE_STATUSES, emptyBoard } from './schema.js'
import { normalizeMosaic } from './board.js'
import { flattenLeaves } from './tree.js'

const str = (v) => (typeof v === 'string' ? v : '')
const arr = (v) => (Array.isArray(v) ? v : [])
const pick = (v, allowed, fallback) => (allowed.includes(v) ? v : fallback)

/**
 * Empty and duplicate ids are what make edits land on the wrong entity: the client picks a
 * chapter by id, so a repeated id silently rewrites the first match. Keep every valid unique id
 * exactly as written; only the offenders get a fresh uuid.
 */
function uniqueIds(items) {
  const seen = new Set()
  for (const item of items) {
    if (item.id === '' || seen.has(item.id)) item.id = newId()
    seen.add(item.id)
  }
  return items
}

/**
 * Text of a node written before the paragraph model was dropped. Reading the old paragraphs as
 * one body is what keeps an existing manuscript openable: the words are the writer's, and losing
 * them to a schema change would be the one unrecoverable mistake this rewrite could make.
 */
function legacyText(raw) {
  if (typeof raw.text === 'string') return raw.text
  if (!Array.isArray(raw.paragraphs)) return ''
  return raw.paragraphs
    .filter((p) => p && typeof p === 'object')
    .map((p) => str(p.text))
    .filter((text) => text !== '')
    .join('\n\n')
}

function normalizeNode(raw, depth = 0) {
  if (!raw || typeof raw !== 'object') return null
  const children = uniqueIds(arr(raw.children).map((child) => normalizeNode(child, depth + 1)).filter(Boolean))
  return {
    id: str(raw.id),
    title: str(raw.title),
    level: pick(raw.level, NODE_LEVELS, depth === 0 ? 'volume' : depth === 1 ? 'chapter' : 'section'),
    status: pick(raw.status, NODE_STATUSES, 'todo'),
    text: legacyText(raw),
    summary: str(raw.summary),
    children,
  }
}

/**
 * Read either shape: the flat `chapters` array written before the tree existed, or the nested
 * `nodes` tree. The flat form becomes one volume of chapters so old files keep opening.
 */
function normalizeTree(raw) {
  if (Array.isArray(raw.nodes) && raw.nodes.length > 0) {
    return uniqueIds(raw.nodes.map((node) => normalizeNode(node, 0)).filter(Boolean))
  }
  const chapters = uniqueIds(arr(raw.chapters).map((chapter) => normalizeNode({ ...chapter, level: 'chapter' }, 1)).filter(Boolean))
  if (chapters.length === 0) return []
  return [{
    id: 'volume-default', title: '', level: 'volume', status: 'writing',
    text: '', children: chapters,
  }]
}

/**
 * The book, schema 3.
 *
 * Two things are GONE from schema 2 and are not migrated: `characters`, `relationships` and
 * `settings` were the first generation of "who is in this story", written before the board existed.
 * The board (mosaic) carries the same facts with more structure — roles, categories, beliefs,
 * retired edges, a change log — and keeping both meant two places to write a character and no
 * answer to which one the page should read. There was no manuscript worth migrating when this
 * changed, so the fields are simply dropped: normalizeBook ignores them, and anything still
 * reading them gets an empty list instead of a silently stale second copy.
 */
export function createEmptyBook(title = '') {
  return {
    // The book's own identity, independent of its folder name.
    //
    // The folder is derived from the title, so renaming a book moves it; anything that has to
    // remember a book across launches or across a rename — the panel's last-open book, a
    // per-book bucket of UI state — has to key on something that survives the move. The id is
    // minted once, at creation, and never rewritten by a rename.
    id: newId(),
    schemaVersion: BOOK_SCHEMA_VERSION, title, genre: '', pov: '', tense: '',
    nodes: [],
    // Present from the start so callers that iterate chapters need no null checks; the writers
    // re-derive it from `nodes` on every normalize.
    chapters: [],
    snapshots: [], overview: { chapters: {} },
    // Loose, whole-book jottings. They belong to the BOOK, not a chapter: an idea for a later
    // scene is not filed under where the caret happened to be when it arrived.
    notes: [],
    mosaic: emptyBoard(),
  }
}

export function normalizeBook(raw) {
  const base = createEmptyBook()
  if (!raw || typeof raw !== 'object') return base
  const nodes = normalizeTree(raw)
  return {
    // A book written before ids existed gets one here, and it is then written back by the next
    // save: without that, every load would mint a different id for the same book and nothing
    // that remembered it would ever match twice.
    id: str(raw.id) || base.id,
    schemaVersion: BOOK_SCHEMA_VERSION,
    title: str(raw.title), genre: str(raw.genre), pov: str(raw.pov), tense: str(raw.tense),
    nodes,
    // Derived, never stored: the flat leaf list existing callers walk.
    chapters: flattenLeaves(nodes),
    snapshots: uniqueIds(arr(raw.snapshots).filter((s) => s && typeof s === 'object')
      .map((s) => ({ id: str(s.id), at: Number.isFinite(s.at) ? s.at : 0, label: str(s.label),
        chapters: arr(s.chapters).map((chapter) => normalizeNode(chapter, 1)).filter(Boolean) }))),
    overview: {
      ...(raw.overview && typeof raw.overview === 'object' && raw.overview.global
        ? { global: { text: str(raw.overview.global.text), basedOn: str(raw.overview.global.basedOn) } } : {}),
      chapters: Object.fromEntries(
        Object.entries(raw.overview && typeof raw.overview === 'object' ? raw.overview.chapters ?? {} : {})
          .filter(([, v]) => v && typeof v === 'object')
          .map(([k, v]) => [k, { text: str(v.text), basedOn: str(v.basedOn) }]),
      ),
    },
    // A jotting is just its text and when it was started; there is no title to keep in sync with
    // the first line, and no chapter id — the same notebook is open in every chapter of the book.
    notes: uniqueIds(arr(raw.notes)
      .filter((note) => note && typeof note === 'object')
      .map((note) => ({
        id: str(note.id),
        text: str(note.text),
        at: Number.isFinite(note.at) ? note.at : 0,
      }))),
    mosaic: normalizeMosaic(raw.mosaic),
  }
}

/**
 * What a chapter's status becomes after its text changed.
 *
 * The editor used to carry this inline, which made "typing turns todo into writing" a fact about
 * one textarea. It is a rule about the manuscript, so it lives beside the manuscript's schema:
 * an empty chapter is todo, a chapter that was todo and now has text is writing, anything else
 * keeps the status the writer chose.
 */
export function statusAfterText(text, status) {
  if (typeof text !== 'string' || text === '') return 'todo'
  const current = NODE_STATUSES.includes(status) ? status : 'todo'
  return current === 'todo' ? 'writing' : current
}
