import test from 'node:test'
import assert from 'node:assert/strict'
import { createEmptyBook, findNode, flattenLeaves, mapNode, normalizeBook, pathToNode, removeNode } from '../lib/model.js'

// A leaf carries one body of text; `text` is passed as the fourth argument for readability.
const node = (id, level, children = [], text = '') => ({ id, title: id, level, status: 'writing', text, children })

function tree() {
  const b = createEmptyBook('三体')
  b.nodes = [
    node('v1', 'volume', [
      node('c1', 'chapter', [node('s1', 'section', [], '第一节正文。')]),
      node('c2', 'chapter', [], '第二章正文。'),
    ]),
    node('v2', 'volume', [node('c3', 'chapter', [], '第三卷正文。')]),
  ]
  return normalizeBook(b)
}

test('leaves are flattened in reading order across volumes', () => {
  const b = tree()
  assert.deepEqual(flattenLeaves(b.nodes).map((n) => n.id), ['s1', 'c2', 'c3'])
  assert.deepEqual(b.chapters.map((c) => c.id), ['s1', 'c2', 'c3'])
})

test('a volume with children is not itself a leaf', () => {
  const b = tree()
  const ids = flattenLeaves(b.nodes).map((n) => n.id)
  assert.ok(!ids.includes('v1'))
  assert.ok(!ids.includes('c1'), 'a chapter that owns sections is a container')
})

test('a chapter without sections is a leaf and keeps its text', () => {
  const b = tree()
  const c2 = findNode(b.nodes, 'c2')
  assert.equal(c2.text, '第二章正文。')
})

test('findNode and pathToNode walk arbitrary depth', () => {
  const b = tree()
  assert.equal(findNode(b.nodes, 'p1'), undefined, 'text is not a node')
  assert.equal(findNode(b.nodes, 's1').level, 'section')
  assert.deepEqual(pathToNode(b.nodes, 's1').map((n) => n.id), ['v1', 'c1'])
  assert.deepEqual(pathToNode(b.nodes, 'v1').map((n) => n.id), [])
})

test('mapNode replaces one node without touching its siblings', () => {
  const b = tree()
  const next = mapNode(b.nodes, 'c2', (n) => ({ ...n, title: '改过的第二章' }))
  assert.equal(findNode(next, 'c2').title, '改过的第二章')
  assert.equal(findNode(next, 'c3').title, 'c3')
})

test('removeNode removes a leaf and its siblings survive', () => {
  const b = tree()
  const next = removeNode(b.nodes, 's1')
  assert.equal(findNode(next, 's1'), undefined)
  assert.ok(findNode(next, 'c2'))
})

test('a legacy flat book becomes one volume of chapters', () => {
  const b = normalizeBook({ chapters: [
    { id: 'c1', title: '第一章', status: 'writing', text: '文字。' },
    { id: 'c2', title: '第二章', status: 'writing', text: '' }] })
  assert.equal(b.nodes.length, 1)
  assert.equal(b.nodes[0].level, 'volume')
  assert.deepEqual(b.nodes[0].children.map((c) => c.id), ['c1', 'c2'])
  assert.equal(b.chapters.length, 2)
})

test('an empty book has no nodes and no chapters', () => {
  const b = normalizeBook({})
  assert.deepEqual(b.nodes, [])
  assert.deepEqual(b.chapters, [])
})

test('a stored tree wins over a stale flat chapters array', () => {
  const b = normalizeBook({
    nodes: [node('v1', 'volume', [node('c1', 'chapter', [], '树的正文。')])],
    chapters: [{ id: 'stale', title: '旧', status: 'writing', text: '' }],
  })
  assert.deepEqual(b.chapters.map((c) => c.id), ['c1'])
})
