/**
 * Whether a fact the board records is still supported by the prose.
 *
 * A fact written from a chapter carries the chapter and the hash of its text at the moment it
 * was accepted. Three rules, from the provenance spec
 * (docs/superpowers/specs/2026-10-26-mosaic-fact-provenance.md):
 *
 *   1. the note is still in the chapter's text, VERBATIM → valid
 *   2. it is not, but the chapter hash is UNCHANGED since the fact was accepted → valid. The prose
 *      has not moved, so the judgment made at acceptance still stands; a miss here means the model
 *      paraphrased instead of quoting (the prompt asks for verbatim, but cannot be trusted to), not
 *      that the text changed.
 *   3. the note is gone and the chapter hash HAS changed → suspect: worth a look, not an error —
 *      it keeps flowing into context with a marker until the next 检查本章 clears it. A chapter that
 *      no longer exists → orphaned.
 *
 * There is deliberately NO punctuation-insensitive matching. It was tried and removed: a
 * punctuation-only edit inside the fact's own sentence is a RARE event, and the strip list itself
 * was the bigger risk — every symbol class it covered was a chance to miss (full/half width, a
 * mark it should not forgive, one nobody thought of). A rare false suspect costs one click on a
 * review the writer was going to run anyway; a silent mis-valid from a leaky filter costs an
 * expired fact fed to the model as truth. Uniformity over cleverness.
 *
 * Hand-made facts ('board') never reach this function: they are the author's intent, and the prose
 * owing nothing to them is not a conflict. `note` is what the fact claims was in the prose — the
 * edge's truth.note, or an entity's first evidence line.
 */
import { hashText } from './hash.js'
import { EMPTY_MOSAIC } from '../domain/schema.js'

const str = (v) => (typeof v === 'string' ? v : '')
const arr = (v) => (Array.isArray(v) ? v : [])

export function factStatus(fact, book) {
  if (fact?.source !== 'chapter') return 'valid'
  const basedOn = fact.basedOn
  if (basedOn === undefined || basedOn === null || str(basedOn.chapter) === '') return 'valid'
  const chapter = (book?.chapters ?? []).find((c) => c.id === basedOn.chapter)
  if (chapter === undefined) return 'orphaned'
  const text = typeof chapter.text === 'string' ? chapter.text : ''
  const note = str(fact.note)
  if (note !== '' && text.includes(note)) return 'valid'
  return str(basedOn.hash) === hashText(text) ? 'valid' : 'suspect'
}

/**
 * Every provenance-tracked fact on the board with its status, so the context assembly can mark the
 * stale ones and the review page can list them. Entities and edges are flattened to one shape: what
 * the writer sees is "a fact", not a row type.
 */
export function factStatuses(mosaic, book) {
  const m = mosaic ?? EMPTY_MOSAIC
  const rows = []
  for (const entity of m.entities) {
    if (entity.source !== 'chapter') continue
    rows.push({
      id: entity.id, kind: 'entity', name: entity.name,
      note: (arr(entity.evidence)[0]) ?? '',
      basedOn: entity.basedOn,
      status: factStatus({ source: 'chapter', note: arr(entity.evidence)[0] ?? '', basedOn: entity.basedOn }, book),
    })
  }
  for (const edge of m.edges) {
    if (edge.source !== 'chapter') continue
    rows.push({
      id: edge.id, kind: 'edge',
      name: `${m.entities.find((e) => e.id === edge.from)?.name ?? '?'} —${edge.truth.kind}→ ${m.entities.find((e) => e.id === edge.to)?.name ?? '?'}`,
      note: edge.truth.note,
      basedOn: edge.basedOn,
      status: factStatus({ source: 'chapter', note: edge.truth.note, basedOn: edge.basedOn }, book),
    })
  }
  return rows
}
