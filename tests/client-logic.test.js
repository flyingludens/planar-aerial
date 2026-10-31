// tests/client-logic.test.js
import test from 'node:test'
import assert from 'node:assert/strict'
import { loadClientLogic } from './helpers/load-client.mjs'

const logic = loadClientLogic()

test('diff reproduces both sides', () => {
  const d = logic.diffWords('夜很深', '夜很静')
  assert.equal(d.filter((s) => s.type !== 'add').map((s) => s.text).join(''), '夜很深')
  assert.equal(d.filter((s) => s.type !== 'del').map((s) => s.text).join(''), '夜很静')
})
test('diff identical text is one same segment', () => {
  assert.deepEqual(logic.diffWords('a b', 'a b'), [{ type: 'same', text: 'a b' }])
})
/**
 * The paragraph suggestion state machine (canAccept/acceptSuggestion/rejectSuggestion/markStale)
 * is gone with the paragraph model: an AI edit is now applied to the SELECTED RANGE of the
 * chapter text, and accepting it is a string splice the editor performs. There is no stored
 * suggestion state left to test, and keeping those cases would test code that no longer exists.
 */

