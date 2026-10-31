import test from 'node:test'
import assert from 'node:assert/strict'
import { applyProposalToBook, extractProposal, stripProposal } from '../lib/index.js'
import { createEmptyBook } from '../lib/model.js'

test('a plain prose answer carries no proposal', () => {
  assert.equal(extractProposal('这只是普通的回答。'), undefined)
})

test('a fenced json block becomes a proposal and is stripped from the prose', () => {
  const raw = '好的，我设计了两个人。\n```json\n{"characters":[{"name":"林","role":"摄影师"}],"settings":[{"title":"时代","body":"民国"}]}\n```'
  const proposal = extractProposal(raw)
  assert.equal(proposal.characters.length, 1)
  assert.equal(proposal.settings.length, 1)
  assert.equal(stripProposal(raw), '好的，我设计了两个人。')
})

test('an empty or malformed block is ignored rather than throwing', () => {
  assert.equal(extractProposal('```json\n{"characters":[]}\n```'), undefined)
  assert.equal(extractProposal('```json\n{ not json }\n```'), undefined)
  assert.equal(extractProposal('```json\n"a string"\n```'), undefined)
})

test('applying a proposal adds characters, settings and resolvable relationships', () => {
  const book = createEmptyBook('T')
  const applied = applyProposalToBook(book, {
    characters: [{ name: '林', role: '摄影师', traits: ['固执'] }, { name: '周', role: '医生' }],
    settings: [{ title: '时代', body: '民国' }],
    relationships: [{ from: '林', to: '周', kind: '旧友' }, { from: '林', to: '查无此人', kind: '亲戚' }],
  })
  assert.deepEqual(applied.characters.sort(), ['周', '林'])
  assert.deepEqual(applied.settings, ['时代'])
  // Schema 3: the characters become board entities, the setting card joins them, and the relation
  // becomes an edge. There is no second list beside the board to check any more.
  assert.equal(book.mosaic.entities.length, 3, 'two characters and one setting card')
  assert.equal(book.mosaic.edges.length, 1, 'an unresolvable endpoint is skipped')
  const byId = new Map(book.mosaic.entities.map((e) => [e.id, e.name]))
  assert.equal(byId.get(book.mosaic.edges[0].from), '林')
  assert.equal(book.mosaic.edges[0].truth.kind, '旧友')
  // The traits have no field on a board entity, so they are folded into the summary rather than
  // lost: the writer wrote them, and a silent drop is worse than a slightly lossy place to keep them.
  const lin = book.mosaic.entities.find((e) => e.name === '林')
  assert.match(lin.summary, /固执/, 'traits survive as prose')
})

test('applying twice updates instead of duplicating, and keeps unsupplied fields', () => {
  const book = createEmptyBook('T')
  applyProposalToBook(book, { characters: [{ name: '林', role: '摄影师', goal: '找到哥哥' }] })
  applyProposalToBook(book, { characters: [{ name: '林', role: '记者' }] })
  assert.equal(book.mosaic.entities.length, 1, 'the same name is one card, not two')
  assert.equal(book.mosaic.entities[0].role, '记者')
  assert.match(book.mosaic.entities[0].summary, /找到哥哥/, 'the goal from the first reply survives the second')
})

test('a duplicate relationship is not added twice', () => {
  const book = createEmptyBook('T')
  const proposal = { characters: [{ name: '林' }, { name: '周' }], relationships: [{ from: '林', to: '周', kind: '旧友' }] }
  applyProposalToBook(book, proposal)
  applyProposalToBook(book, proposal)
  assert.equal(book.mosaic.edges.length, 1, 'one pair is one edge, however many times it is suggested')
})
