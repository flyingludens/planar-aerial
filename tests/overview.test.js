import test from 'node:test'
import assert from 'node:assert/strict'
import { createEmptyBook } from '../lib/model.js'
import { assembleContext, buildFacts, chapterFinalText, hashText, staleEntries, wholeFinalText } from '../lib/overview.js'

function sampleBook() {
  const b = createEmptyBook('雨夜')
  b.chapters.push({ id: 'c1', title: '第一章', status: 'writing', text: '前一段。\n\n当前段。\n\n后一段。' })
  b.chapters.push({ id: 'c2', title: '第二章', status: 'todo', text: '' })
  // The cast lives on the board now: a character entity plus an edge. The edge is self-referential
  // for the same reason the old fixture was: this book has ONE character, and the sections under
  // test need a relationship that survives the chapter-scope filter.
  b.mosaic.entities.push({ id: 'r1', kind: 'character', name: '林', role: '摄影师', summary: '', statuses: [], tags: [], layout: null, portrait: '' })
  b.mosaic.edges.push({ id: 'rel1', from: 'r1', to: 'r1', truth: { kind: '自省', note: '' }, beliefs: [], retired: false, log: [] })
  b.mosaic.entities.push({ id: 's1', kind: 'card', name: '时代', category: '背景', body: '民国', tags: [], layout: null, portrait: '' })
  return b
}

test('hashText stable, differs', () => {
  assert.equal(hashText('abc'), hashText('abc')); assert.notEqual(hashText('abc'), hashText('abd'))
})
test('chapterFinalText is the chapter body', () => {
  assert.equal(chapterFinalText(sampleBook().chapters[0]), '前一段。\n\n当前段。\n\n后一段。')
})
test('wholeFinalText joins chapters and skips empty ones', () => {
  assert.equal(wholeFinalText(sampleBook()), '前一段。\n\n当前段。\n\n后一段。')
})
test('buildFacts neighbors are the previous and next chapter', () => {
  // With no paragraph unit, the continuity anchors are the neighbouring leaves.
  const book = sampleBook()
  book.chapters[1].text = '第二章正文。'
  const f = buildFacts(book, 'c1')
  assert.equal(f.neighbors.before, '')
  assert.equal(f.neighbors.after, '第二章正文。')
})
test('buildFacts keeps a character named in the chapter and drops one that is absent', () => {
  const book = createEmptyBook('T')
  book.chapters.push({ id: 'c1', title: '甲', status: 'writing', text: '林推开门，雨很大。' })
  book.mosaic.entities.push({ id: 'r1', kind: 'character', name: '林', role: '摄影师', summary: '', statuses: [], tags: [], layout: null, portrait: '' })
  book.mosaic.entities.push({ id: 'r2', kind: 'character', name: '周', role: '医生', summary: '', statuses: [], tags: [], layout: null, portrait: '' })
  const f = buildFacts(book, 'c1')
  assert.deepEqual(f.characters.map((c) => c.name), ['林'])
})
test('staleEntries flags missing and changed, skips empty chapters', () => {
  const book = sampleBook()
  const stale = staleEntries(book)
  assert.ok(stale.includes('global')); assert.ok(stale.includes('c1')); assert.ok(!stale.includes('c2'))
})
test('fresh entries are not stale', () => {
  const book = sampleBook()
  const h = hashText('前一段。\n\n当前段。\n\n后一段。')
  book.overview.global = { text: 'g', basedOn: h }; book.overview.chapters.c1 = { text: 'c', basedOn: h }
  assert.ok(!staleEntries(book).includes('c1'))
})
test('assembleContext keeps the neighbouring chapters under a tight budget', () => {
  const book = sampleBook()
  book.chapters[1].text = '后一段。'
  book.overview.global = { text: '全书'.repeat(300), basedOn: hashText('前一段。') }
  const out = assembleContext(book, 'c1', 200)
  assert.ok(out.text.includes('后一段。'), 'the next chapter survives as a continuity anchor')
  assert.ok(Array.isArray(out.sections))
})

test('assembleContext keeps ONLY neighbors when budget is tight, never a lower-priority section', () => {
  // One neighbour (the next chapter): the pinned set is {after}.
  const one = createEmptyBook('T')
  one.chapters.push({ id: 'c1', title: '甲', status: 'writing', text: '正在写。' })
  one.chapters.push({ id: 'c2', title: '乙', status: 'writing', text: '下一章。' })
  one.overview.chapters.c1 = { text: '很长的本章摘要'.repeat(200), basedOn: 'x' }
  const out1 = assembleContext(one, 'c1', 10)
  // Key names follow the context-layer rename (neighbors → previous/nextChapterText, …).
  assert.deepEqual(out1.sections, ['nextChapterText'], 'only the neighbour may remain under a tight budget')

  // No neighbours, empty title (so no meta section): the first section is pinned and must
  // survive — an over-budget summary beats no summary at all.
  const zero = createEmptyBook('')
  zero.chapters.push({ id: 'c1', title: '甲', status: 'writing', text: '第一句草稿。' })
  zero.overview.chapters.c1 = { text: '很长的本章摘要'.repeat(200), basedOn: 'x' }
  assert.deepEqual(assembleContext(zero, 'c1', 10).sections, ['chapterSummary'],
    'with no neighbours, keep the top-priority section rather than nothing')

  // With a title the meta line is first and therefore pinned; every other section yields.
  const titled = createEmptyBook('雨夜')
  titled.chapters.push({ id: 'c1', title: '甲', status: 'writing', text: '第一句草稿。' })
  titled.overview.chapters.c1 = { text: '很长的本章摘要'.repeat(200), basedOn: 'x' }
  assert.deepEqual(assembleContext(titled, 'c1', 10).sections, ['bookMeta'])
})


test('assembleContext throws on an unknown chapterId', () => {
  assert.throws(() => assembleContext(sampleBook(), 'nope', 2000), /unknown chapter/)
})

test('a stale chapter summary is included but marked as possibly outdated', () => {
  const book = sampleBook()
  book.overview.chapters.c1 = { text: '旧的本章摘要。', basedOn: 'not-the-current-hash' }
  const out = assembleContext(book, 'c1', 2000)
  assert.ok(out.text.includes('旧的本章摘要。'))
  assert.ok(out.text.includes('（摘要可能滞后）'))
})

test('a fresh chapter summary carries no staleness marker', () => {
  const book = sampleBook()
  book.overview.chapters.c1 = { text: '新的本章摘要。', basedOn: hashText(sampleBook().chapters[0].text) }
  const out = assembleContext(book, 'c1', 2000)
  assert.ok(out.text.includes('新的本章摘要。'))
  assert.ok(!out.text.includes('（摘要可能滞后）'))
})

test('a stale global summary is marked', () => {
  const book = sampleBook()
  book.overview.global = { text: '旧全书梗概。', basedOn: 'stale' }
  const out = assembleContext(book, 'c1', 2000)
  assert.ok(out.text.includes('旧全书梗概。（可能滞后）'))
})

test('section order is neighbours, meta, summary, cast, relations, global, others, cards', () => {
  const book = sampleBook()
  book.genre = '悬疑'; book.pov = '第一人称'; book.tense = '过去时'
  // Both neighbours must be present: set the previous and next chapter bodies.
  book.chapters[0].text = '林推开门。'
  book.chapters[1].text = '后一段。'
  const h = hashText('林推开门。')
  book.overview.chapters.c1 = { text: '本章。', basedOn: h }
  book.overview.chapters.c2 = { text: '另一章。', basedOn: 'x' }
  book.overview.global = { text: '全书。', basedOn: h }
  const out = assembleContext(book, 'c1', 20000)
  assert.deepEqual(out.sections, ['nextChapterText', 'bookMeta', 'chapterSummary', 'chapterCast', 'chapterRelations', 'globalSummary', 'otherSummaries', 'settingCards'])
})

test('characters are injected before the global synopsis', () => {
  const book = sampleBook()
  book.overview.global = { text: '全书梗概。', basedOn: 'x' }
  const out = assembleContext(book, 'c1', 20000)
  const text = out.text
  assert.ok(text.indexOf('本章人物') < text.indexOf('全书梗概'), 'characters must precede the global summary')
  assert.ok(text.indexOf('关系：') < text.indexOf('全书梗概'))
})

test('meta section carries title/genre/pov/tense and is omitted when all are empty', () => {
  const book = sampleBook()
  book.genre = '悬疑'; book.pov = '第一人称'; book.tense = '过去时'
  const out = assembleContext(book, 'c1', 20000)
  const meta = out.text.split('\n')[out.sections.indexOf('bookMeta')]
  assert.equal(meta, '《雨夜》 体裁：悬疑 视角：第一人称 时态：过去时')

  const bare = createEmptyBook()
  bare.chapters.push({ id: 'c1', title: '甲', status: 'writing', text: '' })
  assert.ok(!assembleContext(bare, 'c1', 2000).sections.includes('bookMeta'))
})
