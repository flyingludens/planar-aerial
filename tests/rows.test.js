import test from 'node:test'
import assert from 'node:assert/strict'
import { loadClientLogic } from './helpers/load-client.mjs'

/**
 * The small pure functions the reference drawers share.
 *
 * The cast, the world-building entries and the relationships are edited the same three ways, and
 * each page had written those out for itself — six copies of the same `map`/`filter`, and three
 * different id schemes. These cases pin the behaviour the pages now inherit, including the one
 * property that made the shared version worth having: a new row cannot collide with another made
 * in the same millisecond.
 */

const { patchRow, appendRow, removeRow, rowId, clockTime } = loadClientLogic()

const rows = () => [
  { id: 'a', name: '张三', role: '' },
  { id: 'b', name: '李四', role: '' },
]

test('patchRow changes one field of one row and leaves the rest alone', () => {
  const next = patchRow(rows(), 'b', 'role', '主角')
  assert.equal(next[1].role, '主角')
  assert.equal(next[0].role, '', 'the other row is untouched')
  assert.equal(next[0].name, '张三', 'and its other fields are untouched')
  // A new array and a new row: React compares identity, and an in-place edit would not re-render.
  assert.notEqual(next, rows(), 'a new array comes back')
  assert.notEqual(next[1], rows()[1], 'and a new object for the row that changed')
})

test('patchRow with an unknown id returns the list unchanged', () => {
  const before = rows()
  const next = patchRow(before, 'nobody', 'role', 'x')
  assert.deepEqual(next, before, 'nothing matches, nothing changes')
  assert.notEqual(next, before, 'but it is still a fresh array, so a caller can always setState it')
})

test('patchRow tolerates a missing list', () => {
  // A hand-edited book.json can omit the array entirely; the pages must not throw on it.
  assert.deepEqual(patchRow(undefined, 'a', 'role', 'x'), [])
  assert.deepEqual(patchRow(null, 'a', 'role', 'x'), [])
})

test('appendRow adds to the end and does not mutate the original', () => {
  const before = rows()
  const next = appendRow(before, { id: 'c', name: '王五' })
  assert.equal(next.length, 3)
  assert.equal(next[2].name, '王五', 'the new row is last')
  assert.equal(before.length, 2, 'the original list is untouched')
  assert.deepEqual(appendRow(undefined, { id: 'x' }), [{ id: 'x' }], 'a missing list is an empty one')
})

test('removeRow drops exactly one row', () => {
  const next = removeRow(rows(), 'a')
  assert.deepEqual(next.map((row) => row.id), ['b'])
  assert.deepEqual(removeRow(rows(), 'nobody').map((row) => row.id), ['a', 'b'], 'an unknown id removes nothing')
  assert.deepEqual(removeRow(undefined, 'a'), [])
})

test('rowId gives two rows made in the same millisecond different ids', () => {
  // The clock alone is not enough: a paste or a quick double-click lands inside one millisecond,
  // and two rows sharing an id means `patchRow` edits both of them at once.
  const ids = new Set()
  for (let i = 0; i < 500; i += 1) ids.add(rowId('r'))
  assert.equal(ids.size, 500, 'no collisions in 500 ids')
  for (const id of ids) {
    assert.match(id, /^r-\d+-[a-z0-9]+$/, `id keeps its prefix and a random tail: ${id}`)
  }
  assert.notEqual(rowId('s').split('-')[0], 'r', 'the prefix is the caller\'s')
})

test('clockTime formats a timestamp the way the panel shows it', () => {
  const at = new Date(2026, 9, 24, 6, 32).getTime()
  const shown = clockTime(at)
  // The exact separators are the browser's; what matters is that both numbers are there.
  assert.match(shown, /06/, 'the hour')
  assert.match(shown, /32/, 'and the minute')
  // Absence has to read as absence, not as 1970 or as an empty-looking "Invalid Date".
  assert.equal(clockTime(0), '')
  assert.equal(clockTime(undefined), '')
  assert.equal(clockTime(null), '')
  assert.equal(clockTime('later'), '')
})
