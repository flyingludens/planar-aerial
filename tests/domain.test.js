import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  ENTITY_KINDS, BOARD_SCHEMA_VERSION, NODE_STATUSES, emptyBoard,
} from '../domain/schema.js'
import { newId } from '../domain/ids.js'
import { flattenLeaves, findNode, mapNode } from '../domain/tree.js'
import {
  createEntity, normalizeEntity, normalizeMosaic, patchEntity, removeEntity,
} from '../domain/board.js'
import { createEmptyBook, normalizeBook, statusAfterText } from '../domain/book.js'

const here = dirname(fileURLToPath(import.meta.url))

test('a new card has every field its kind owns, and no field it does not', () => {
  for (const kind of ENTITY_KINDS) {
    const entity = createEntity(kind, '名字')
    assert.equal(entity.kind, kind)
    assert.equal(entity.name, '名字')
    assert.ok(entity.id !== '')
    // The normalized form is the contract both halves and the disk agree on. If the factory
    // produces a field the normalizer drops, the card would look different after a reload.
    const normalized = normalizeEntity(entity, new Set([entity.id]))
    assert.deepEqual(normalized, { ...entity, source: 'board' })
  }
})

test('a card made on either side starts from the same shape', () => {
  // The browser's create form, the agent tool and the proposal applier all call this, so a field
  // that exists on one path and not another is exactly the drift the kernel removes.
  const character = createEntity('character', '沈砚', { role: '修表匠', summary: '主角' })
  assert.equal(character.role, '修表匠')
  assert.equal(character.summary, '主角')
  assert.deepEqual(character.aliases, [])
  assert.deepEqual(character.statuses, [])
  assert.equal(character.layout, null)
  // A field the kind does not carry is ignored rather than stored and later dropped.
  const place = createEntity('place', '旧码头', { role: '不该在这里' })
  assert.equal(place.role, undefined)
})

test('an unknown card kind is a programming error, not a silent empty card', () => {
  assert.throws(() => createEntity('location', '旧码头'), /unknown entity kind/)
})

test('patching a card goes through the same whitelist as a save', () => {
  const board = { ...emptyBoard(), entities: [createEntity('character', '阿九')] }
  const id = board.entities[0].id
  const next = patchEntity(board, id, { summary: '码头上的孩子', notAField: '丢了' })
  assert.equal(next.entities[0].summary, '码头上的孩子')
  assert.equal(next.entities[0].notAField, undefined)
  assert.notEqual(next, board, 'a patch is a new board')
})

test('removing a card removes the wires that pointed at it', () => {
  const a = createEntity('character', '甲')
  const b = createEntity('character', '乙')
  const board = {
    ...emptyBoard(),
    entities: [a, b],
    edges: [{ id: 'e1', from: a.id, to: b.id, truth: { kind: '旧识', note: '' }, beliefs: [], retired: false, log: [] }],
  }
  const next = removeEntity(board, a.id)
  assert.deepEqual(next.entities.map((e) => e.name), ['乙'])
  assert.equal(next.edges.length, 0, 'an edge with one endpoint gone is not a relation')
})

test('the board normalizer keeps the first of two cards with the same id', () => {
  const board = normalizeMosaic({
    entities: [
      { id: 'same', kind: 'character', name: '甲' },
      { id: 'same', kind: 'character', name: '乙' },
    ],
  })
  assert.equal(board.schemaVersion, BOARD_SCHEMA_VERSION)
  assert.equal(board.entities.length, 2)
  assert.notEqual(board.entities[0].id, board.entities[1].id)
})

test('a chapter with text leaves todo behind; an empty one returns to it', () => {
  assert.equal(statusAfterText('', 'writing'), 'todo')
  assert.equal(statusAfterText('一句话。', 'todo'), 'writing')
  assert.equal(statusAfterText('一句话。', 'done'), 'done')
  assert.equal(statusAfterText('一句话。', 'not-a-status'), 'writing')
  assert.deepEqual(NODE_STATUSES, ['todo', 'writing', 'done'])
})

test('ids are unique and carry their prefix only for reading', () => {
  const ids = new Set(Array.from({ length: 200 }, () => newId()))
  assert.equal(ids.size, 200)
  assert.ok(newId('e').startsWith('e-'))
  assert.ok(newId('').length > 0)
})

test('the tree operations are the shared ones, not a client copy', () => {
  const tree = [{
    id: 'v1', children: [
      { id: 'c1', children: [] },
      { id: 'c2', children: [{ id: 's1', children: [] }] },
    ],
  }]
  assert.deepEqual(flattenLeaves(tree).map((n) => n.id), ['c1', 's1'])
  assert.equal(findNode(tree, 's1').id, 's1')
  assert.equal(mapNode(tree, 'c1', (n) => ({ ...n, title: '改过' }))[0].children[0].title, '改过')
})

test('an empty book carries the current schema and an empty board', () => {
  const book = createEmptyBook('测试')
  assert.equal(book.schemaVersion, 3)
  assert.deepEqual(book.mosaic, { schemaVersion: BOARD_SCHEMA_VERSION, entities: [], edges: [] })
  assert.deepEqual(normalizeBook(book).chapters, [])
})

test('the domain layer imports neither half, nor a runtime global', () => {
  // This is the whole point of the kernel: both halves may import it, so it may import neither.
  // Only import specifiers are checked; comments are allowed to name the runtimes they avoid.
  const files = readdirSync(join(here, '..', 'domain')).filter((name) => name.endsWith('.js'))
  assert.ok(files.length > 0, 'the domain directory is found')
  for (const name of files) {
    const source = readFileSync(join(here, '..', 'domain', name), 'utf8')
    const specifiers = [...source.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((match) => match[1])
    for (const specifier of specifiers) {
      assert.ok(!specifier.startsWith('node:'), `${name} must not import ${specifier}`)
      assert.ok(!specifier.startsWith('..'), `${name} must not import outside domain/: ${specifier}`)
      assert.ok(!/^react|^react-dom/.test(specifier), `${name} must not import ${specifier}`)
    }
  }
})
