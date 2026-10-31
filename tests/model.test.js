// tests/model.test.js
import test from 'node:test'
import assert from 'node:assert/strict'
import { createEmptyBook, normalizeBook, NODE_STATUSES } from '../lib/model.js'

test('empty book has required fields', () => {
  const b = createEmptyBook('雨夜')
  assert.equal(b.schemaVersion, 3)
  assert.equal(b.title, '雨夜')
  assert.deepEqual(b.chapters, [])
  assert.deepEqual(b.overview, { chapters: {} })
})

test('normalizeBook fills string defaults', () => {
  const b = normalizeBook({ title: 'T' })
  assert.equal(b.genre, ''); assert.equal(b.pov, ''); assert.equal(b.tense, '')
})

test('unknown node status falls back to todo', () => {
  const b = normalizeBook({ chapters: [{ id: 'c1', title: 'A', status: 'weird', text: 'x' }] })
  assert.equal(b.chapters[0].status, 'todo')
})

test('the status list is exact', () => {
  assert.deepEqual(NODE_STATUSES, ['todo', 'writing', 'done'])
})

test('a chapter keeps its whole body as one text', () => {
  // The paragraph model is gone: a chapter is one continuous body the writer edits directly.
  const b = normalizeBook({ chapters: [{ id: 'c1', title: 'A', status: 'writing', text: '第一段。\n\n第二段。' }] })
  assert.equal(b.chapters[0].text, '第一段。\n\n第二段。')
  assert.equal(b.chapters[0].paragraphs, undefined, 'no paragraph array survives on a node')
})

test('an old paragraph-based book is read as one body, losing no words', () => {
  // This is the one unrecoverable mistake a schema change could make, so it is pinned.
  const b = normalizeBook({ chapters: [{ id: 'c1', title: 'A', status: 'writing',
    paragraphs: [{ id: 'p1', text: '第一段。', status: 'final' }, { id: 'p2', text: '第二段。', status: 'draft' }] }] })
  assert.equal(b.chapters[0].text, '第一段。\n\n第二段。')
})

test('two chapters with empty ids each get a distinct non-empty id', () => {
  const b = normalizeBook({ chapters: [
    { id: '', title: '一', status: 'writing', text: '' },
    { id: '', title: '二', status: 'writing', text: '' }] })
  const [a, c] = b.chapters
  assert.ok(a.id.length > 0); assert.ok(c.id.length > 0)
  assert.notEqual(a.id, c.id)
})

test('a duplicated chapter id is de-duplicated: first keeps it, second gets a new one', () => {
  const b = normalizeBook({ chapters: [
    { id: 'c1', title: '一', status: 'writing', text: '' },
    { id: 'c1', title: '二', status: 'writing', text: '' }] })
  assert.equal(b.chapters[0].id, 'c1')
  assert.notEqual(b.chapters[1].id, 'c1')
  assert.ok(b.chapters[1].id.length > 0)
})

test('valid unique ids are preserved exactly and in order', () => {
  const b = normalizeBook({
    chapters: [{ id: 'c2', title: '二', status: 'writing', text: 'a' },
    { id: 'c1', title: '一', status: 'writing', text: '' }],
    mosaic: { entities: [{ id: 'r1', kind: 'character', name: '林' }], edges: [] },
  })
  assert.deepEqual(b.chapters.map((c) => c.id), ['c2', 'c1'])
  assert.equal(b.chapters[0].text, 'a')
  assert.equal(b.mosaic.entities[0].id, 'r1', 'board ids are preserved exactly')
})

test('the retired cast fields are gone, not silently kept as a second copy', () => {
  // Schema 2 carried characters/relationships/settings beside the board. Two places to write one
  // character and no rule for which one a page should read is exactly the drift that makes a
  // writer edit a character and see the old name somewhere else. Schema 3 keeps the board only.
  const b = normalizeBook({
    chapters: [{ id: 'c1', title: '一', status: 'writing', text: '' }],
    characters: [{ id: 'old', name: '旧人物' }],
    settings: [{ id: 's', title: '旧设定' }],
    relationships: [{ id: 'rel', fromId: 'a', toId: 'b' }],
  })
  assert.equal(b.characters, undefined, 'a book no longer has a cast list')
  assert.equal(b.settings, undefined)
  assert.equal(b.relationships, undefined)
  assert.deepEqual(b.mosaic.entities, [], 'and the board is where they would live now')
})

test('a book always carries a mosaic, even from a raw file without one', () => {
  const book = normalizeBook({ title: '书' })
  assert.deepEqual(book.mosaic, { schemaVersion: 4, entities: [], edges: [] })
  assert.equal(createEmptyBook().mosaic.entities.length, 0)
})

test('a chapter summary survives normalization, on a leaf and a container', () => {
  // The overview page edits per-chapter `summary`; normalization must keep it or the edit is lost on save/reload.
  const b = normalizeBook({ nodes: [
    { id: 'c1', title: '一', level: 'chapter', summary: '一句话' },
    { id: 'v1', title: '卷一', level: 'volume', summary: '卷摘要', children: [{ id: 'c2', title: '二', level: 'chapter' }] },
  ] })
  assert.equal(b.nodes[0].summary, '一句话')
  assert.equal(b.nodes[1].summary, '卷摘要')
  assert.equal(b.nodes[1].children[0].summary, '', 'summary defaults to an empty string when absent')
})

test('a stored mosaic normalizes through the book', () => {
  const book = normalizeBook({ mosaic: { entities: [{ id: 'a', kind: 'character', name: '张三' }],
    edges: [{ id: 'r1', from: 'a', to: 'ghost', truth: { kind: 'x' } }] } })
  assert.equal(book.mosaic.entities.length, 1)
  assert.equal(book.mosaic.edges.length, 0) // dangling edge dropped
})
