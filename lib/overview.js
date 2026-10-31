import { buildContext } from './context.js'
import { hashText } from './hash.js'
import { chapterFinalText, wholeFinalText } from './text.js'

// Kept on this module's surface: the summary code is where callers expect them, and moving the
// definitions must not move every import.
export { hashText } from './hash.js'
export { chapterFinalText, wholeFinalText } from './text.js'

export function buildFacts(book, chapterId) {
  const chapter = book.chapters.find((c) => c.id === chapterId)
  // Continuity anchors are the previous and next LEAF, because a leaf is the whole chapter now.
  const index = chapter === undefined ? -1 : book.chapters.findIndex((c) => c.id === chapter.id)
  const before = index > 0 ? book.chapters[index - 1] : undefined
  const after = index >= 0 && index + 1 < book.chapters.length ? book.chapters[index + 1] : undefined
  const finalsCount = book.chapters.filter((c) => chapterFinalText(c) !== '').length
  const total = book.chapters.length
  // The cast comes from the BOARD: schema 3 has no separate character list. A board card is a
  // character when its kind says so; setting cards (places, objects) are the other half of the
  // same graph and travel in `settings`, mapped to their category as the label.
  const entities = book.mosaic?.entities ?? []
  const boardCharacters = entities.filter((e) => e.kind === 'character').map((c) => ({ id: c.id, name: c.name, role: c.role }))
  // Only characters that appear in this chapter; a full cast dilutes the prompt. The only
  // fallback is an EMPTY chapter (nothing written yet), where the full roster is better than none.
  const scope = chapter ? chapterFinalText(chapter) : ''
  const matched = boardCharacters.filter((c) => c.name && scope.includes(c.name))
  const characters = scope === '' ? boardCharacters : matched
  const ids = new Set(characters.map((c) => c.id))
  const edges = (book.mosaic?.edges ?? []).filter((e) => e.retired !== true)
  return {
    title: book.title, genre: book.genre, pov: book.pov, tense: book.tense,
    progress: { chapters: book.chapters.length, finals: finalsCount, total },
    characters,
    // An edge whose TRUE endpoints are both in scope: a relation to a character this chapter never
    // mentions is not context for this chapter.
    relationships: edges
      .filter((e) => ids.has(e.from) && ids.has(e.to))
      .map((e) => ({ id: e.id, fromId: e.from, toId: e.to, kind: e.truth?.kind ?? '', note: e.truth?.note ?? '' })),
    // Everything that is not a person, under one key: the prose routes only ever needed "what
    // else exists in this book", and the five-kind split is a board concern, not a prose one.
    settings: entities.filter((e) => e.kind !== 'character').map((e) => ({ id: e.id, title: e.name, kind: e.kind })),
    neighbors: { before: chapterFinalText(before ?? {}), after: chapterFinalText(after ?? {}) },
  }
}

export function staleEntries(book) {
  const stale = []
  const globalText = wholeFinalText(book)
  const globalHash = hashText(globalText)
  if (globalText !== '' && (!book.overview.global || book.overview.global.basedOn !== globalHash)) stale.push('global')
  for (const chapter of book.chapters) {
    const text = chapterFinalText(chapter)
    if (text === '') continue
    const cached = book.overview.chapters[chapter.id]
    if (!cached || cached.basedOn !== hashText(text)) stale.push(chapter.id)
  }
  return stale
}

/**
 * Thin wrapper over buildContext, kept for the existing callers/tests until every route has
 * migrated to a recipe. `budget` caps the assembled text; the recipe decides everything else.
 */
export function assembleContext(book, chapterId, budget = 2000) {
  const recipeName = budget <= 200 ? 'continue' : 'suggest'
  const out = buildContext(recipeName, book, { chapterId, config: { continueContextChars: budget, overviewBudget: budget } })
  return { ...out, injectedChars: out.text.length }
}
