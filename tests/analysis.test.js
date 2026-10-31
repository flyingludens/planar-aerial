import test from 'node:test'
import assert from 'node:assert/strict'
import { parseIssueBlock, parseStyleBlock, stripJsonBlock } from '../lib/index.js'

test('a style block parses into named fields', () => {
  const raw = '```json\n{"voice":"冷峻的第三人称","pov":"第三人称","tense":"过去时","sentences":"短句为主","diction":"少用形容词","devices":["雨"],"avoid":["感叹号"]}\n```'
  const style = parseStyleBlock(raw)
  assert.equal(style.voice, '冷峻的第三人称')
  assert.deepEqual(style.devices, ['雨'])
  assert.deepEqual(style.avoid, ['感叹号'])
})

test('a style answer without a block yields undefined instead of throwing', () => {
  assert.equal(parseStyleBlock('这个风格很克制。'), undefined)
  assert.equal(parseStyleBlock('```json\nnot json\n```'), undefined)
})

test('issue blocks are parsed and empty problems dropped', () => {
  const raw = '```json\n{"issues":[{"kind":"name","where":"第一章","problem":"姓名前后不一致","evidence":"林/琳"},{"kind":"fact","where":"第二章","problem":""}]}\n```'
  const issues = parseIssueBlock(raw)
  assert.equal(issues.length, 1)
  assert.equal(issues[0].kind, 'name')
  assert.equal(issues[0].evidence, '林/琳')
})

test('a clean report yields no issues', () => {
  assert.deepEqual(parseIssueBlock('没有发现矛盾。'), [])
  assert.deepEqual(parseIssueBlock('```json\n{"issues":[]}\n```'), [])
})

test('the json block is stripped from prose', () => {
  assert.equal(stripJsonBlock('先看这里。\n```json\n{"a":1}\n```'), '先看这里。')
})
