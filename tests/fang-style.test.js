import { test } from 'node:test'
import assert from 'node:assert/strict'

test('fang-style 可以被解析并导入', async () => {
  const fang = await import('fang-style')
  assert.equal(typeof fang, 'object')
})
