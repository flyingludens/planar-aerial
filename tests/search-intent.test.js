import test from 'node:test'
import assert from 'node:assert/strict'
import { extractSearchIntent } from '../lib/index.js'

test('a plain answer is not a search request', () => {
  assert.equal(extractSearchIntent('这是一段普通回答。'), undefined)
})

test('a search block yields its query', () => {
  assert.equal(extractSearchIntent('```json\n{"search":"民国 上海 电报 资费"}\n```'), '民国 上海 电报 资费')
  assert.equal(extractSearchIntent('```\n{"search":"1920s Shanghai tram fare"}\n```'), '1920s Shanghai tram fare')
})

test('a proposal block is not mistaken for a search request', () => {
  assert.equal(extractSearchIntent('```json\n{"characters":[{"name":"林"}]}\n```'), undefined)
})

test('an over-long query is rejected rather than sent', () => {
  assert.equal(extractSearchIntent(`\`\`\`json\n{"search":"${'x'.repeat(201)}"}\n\`\`\``), undefined)
})
