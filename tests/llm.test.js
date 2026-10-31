import test from 'node:test'
import assert from 'node:assert/strict'
import { buildOverviewPrompt, buildSuggestPrompt, cleanModelText, parseSuggestion } from '../lib/llm.js'

test('suggest prompt carries text, instruction, context', () => {
  const p = buildSuggestPrompt({ text: '雨下得很大。', instruction: '更紧凑', context: '前一段：他站着。' })
  assert.ok(p.system.length > 0)
  assert.ok(p.input.includes('雨下得很大。')); assert.ok(p.input.includes('更紧凑')); assert.ok(p.input.includes('前一段'))
})
test('overview prompt differs by kind', () => {
  assert.ok(buildOverviewPrompt({ kind: 'chapter', title: '一', text: 'x' }).system.includes('章'))
  assert.ok(buildOverviewPrompt({ kind: 'global', title: '书', text: 'y' }).system.includes('整本'))
})
test('cleanModelText strips fences and labels', () => {
  assert.equal(cleanModelText('```\n句子\n```'), '句子')
  assert.equal(cleanModelText('改写：新的句子。'), '新的句子。')
})
test('parseSuggestion keeps baseText and ready state', () => {
  const s = parseSuggestion('改写后的句子', '原句')
  assert.equal(s.baseText, '原句'); assert.equal(s.proposedText, '改写后的句子'); assert.equal(s.state, 'ready'); assert.ok(s.id.length > 0)
})
