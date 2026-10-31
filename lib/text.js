/**
 * Reading a chapter's prose.
 *
 * A chapter is one continuous body now: there is no "final" subset to pick, and no paragraph
 * array to join. These two helpers are all the prompt builders need, and they live apart from
 * `overview.js` so the context assembly can read prose without importing the module that
 * imports the context assembly back.
 */

export function chapterFinalText(chapter) {
  return typeof chapter?.text === 'string' ? chapter.text : ''
}

export function wholeFinalText(book) {
  return (book?.chapters ?? []).map(chapterFinalText).filter(Boolean).join('\n\n')
}
