import test from 'node:test'
import assert from 'node:assert/strict'
import { buildContext } from '../lib/context.js'
import { normalizeBook } from '../lib/model.js'

/** The active 流派 is a section, not a route option: every generation recipe must carry it. */
test('the active 流派 rides along with every generation context', () => {
  const book = normalizeBook({
    title: 'T',
    nodes: [{
      id: 'v1', title: '卷', level: 'volume',
      children: [{ id: 'c1', title: '第一章', level: 'chapter', text: '雨下了一整夜。' }],
    }],
  })
  book.activeWritingStyle = { id: 's1', name: '冷硬派', prompt: '短句为主，少用形容词，克制地写动作。' }
  for (const recipe of ['suggest', 'continue', 'chat']) {
    const out = buildContext(recipe, book, { chapterId: 'c1', config: {} })
    assert.match(out.text, /文风流派「冷硬派」/, `${recipe} carries the writing style`)
    assert.match(out.text, /短句为主/, `${recipe} carries the prompt`)
  }
})

test('no active 流派 contributes nothing, so a book without one reads as before', () => {
  const book = normalizeBook({
    title: 'T',
    nodes: [{ id: 'v1', title: '卷', level: 'volume', children: [{ id: 'c1', title: '第一章', level: 'chapter', text: '雨。' }] }],
  })
  assert.doesNotMatch(buildContext('suggest', book, { chapterId: 'c1', config: {} }).text, /文风流派/)
})
