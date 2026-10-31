import test from 'node:test'
import assert from 'node:assert/strict'
import { buildMosaicCheckPrompt, parseMosaicProposal, buildMosaicAskPrompt } from '../lib/llm.js'

test('check prompt carries digest, chapter text and the op vocabulary', () => {
  const p = buildMosaicCheckPrompt({ digest: '角色 张三', chapterTitle: '第1章', text: '雨下了一整夜。' })
  assert.match(p.system, /提案/)
  assert.match(p.input, /角色 张三/)
  assert.match(p.input, /雨下了一整夜/)
  for (const op of ['entity.upsert', 'edge.upsert', 'belief.add', 'status.add', 'status.remove', 'edge.retire']) {
    assert.ok(p.system.includes(op), `system names ${op}`)
  }
})

test('a fenced JSON proposal parses; garbage voids the whole proposal', () => {
  const good = parseMosaicProposal('```json\n{"evidence":["雨下了"],"changes":[{"op":"status.add","entityId":"a","label":"受伤","evidenceIndex":0}]}\n```', 'c1')
  assert.equal(good.sourceChapterId, 'c1')
  assert.equal(good.changes.length, 1)
  assert.equal(typeof good.id, 'string')
  assert.equal(parseMosaicProposal('这不是JSON', 'c1'), null)
})

test('ask prompt embeds the board state and demands id citations', () => {
  const p = buildMosaicAskPrompt({ digest: '角色 张三', question: '李四知道什么' })
  assert.match(p.system, /story_mosaic_query|调查板/)
  assert.match(p.input, /李四知道什么/)
})

// ---- reading relations out of the cards' own prose ----

test('the relate prompt shows each card with its description, and the edges already drawn', async () => {
  // The check prompt reads a CHAPTER. This one reads the BOARD: the writer described who knows whom
  // in the cards themselves, and expects the lines to appear. The summaries are the whole input, so
  // a prompt that left them out could only guess from names.
  const { buildMosaicRelatePrompt } = await import('../lib/llm.js')
  const prompt = buildMosaicRelatePrompt({
    cards: [
      { id: 'a', kind: 'character', name: '沈砚', role: '修表匠', summary: '十年前跟白鹭一起办过一桩案子，此后不再来往。' },
      { id: 'b', kind: 'character', name: '白鹭', summary: '' },
      { id: 'd', kind: 'item', name: '停摆的怀表', description: '沈砚父亲的遗物。' },
    ],
    edges: [{ from: 'b', to: 'a', kind: '旧识', fromName: '白鹭', toName: '沈砚' }],
  })
  assert.ok(prompt.input.includes('[a]'), 'each card carries its id')
  assert.ok(prompt.input.includes('十年前跟白鹭一起办过一桩案子'), 'and its description')
  assert.ok(prompt.input.includes('沈砚父亲的遗物'), 'including the items\' notes')
  assert.ok(prompt.input.includes('[b]'), 'a card with no description is still listed')
  assert.ok(prompt.input.includes('白鹭 [b] —旧识→ 沈砚 [a]'), 'the edges already drawn are named')
  assert.ok(prompt.input.includes('还没有任何关系') === false, 'and this board has some')

  const empty = buildMosaicRelatePrompt({ cards: [{ id: 'a', name: 'x' }], edges: [] })
  assert.ok(empty.input.includes('还没有任何关系'), 'a board with no edges says so')

  // The system prompt is where the rules live: only what the descriptions state, ids as given, and
  // a quote as the support for each edge.
  assert.ok(prompt.system.includes('只看'), 'it may only use what the cards say')
  assert.ok(prompt.system.includes('不要推测'), 'and may not invent a relation')
  assert.ok(prompt.system.includes('edge') || prompt.system.includes('edges'), 'it answers with edges')
})

test('the parser keeps usable edges and drops everything else', async () => {
  const { parseMosaicRelate } = await import('../lib/llm.js')
  const valid = new Set(['a', 'b', 'c'])
  const raw = JSON.stringify({
    edges: [
      { from: 'a', to: 'b', kind: '旧识', note: '十年前一起办过案子' },
      // The same relation twice: two identical wires on the canvas are one wire drawn twice.
      { from: 'a', to: 'b', kind: '旧识', note: '换了个说法的同一句' },
      // Ids the route never offered.
      { from: 'a', to: 'zzz', kind: '旧识', note: 'x' },
      { from: 'qqq', to: 'b', kind: '旧识', note: 'x' },
      // A card related to itself.
      { from: 'a', to: 'a', kind: '自己', note: 'x' },
      // No word for the relation.
      { from: 'a', to: 'c', kind: '', note: 'x' },
      // A second, different relation between the same pair is a different edge.
      { from: 'b', to: 'c', kind: '雇佣', note: '白鹭替屠九记账' },
    ],
  })
  const out = parseMosaicRelate(raw, valid)
  assert.deepEqual(out.map((change) => `${change.from}->${change.to}:${change.kind}`),
    ['a->b:旧识', 'b->c:雇佣'], 'one per pair and word, ids checked, no self-loops')

  // The shape is the one the ordinary apply route consumes: one applier, one set of rules.
  for (const change of out) {
    assert.equal(change.op, 'edge.upsert')
    assert.equal(typeof change.note, 'string')
  }

  // Anything that is not a JSON block with edges is "no proposal", not a crash.
  assert.deepEqual(parseMosaicRelate('not json', valid), [])
  assert.deepEqual(parseMosaicRelate('{"edges": "nope"}', valid), [])
  assert.deepEqual(parseMosaicRelate('', valid), [])
})

test('a model that writes "白鹭 [demo-b]" is understood, not thrown away', async () => {
  // Told to "use the id in the brackets", a model reliably answers with the name AND the bracket.
  // Matching the string exactly rejected every edge of a completely correct answer — the first
  // real run against the live model parsed six good relations into zero.
  const { parseMosaicRelate } = await import('../lib/llm.js')
  const valid = new Set(['demo-a', 'demo-b', 't1'])
  const raw = JSON.stringify({
    edges: [
      { from: '白鹭 [demo-b]', to: '阿蘅 [t1]', kind: '亲属', note: '白鹭的亲生女儿' },
      { from: 'demo-a', to: 'demo-b', kind: '旧识', note: 'bare ids still work' },
      // A name with no id at all cannot be resolved to a card, and must not be guessed.
      { from: '程四娘', to: 'demo-a', kind: '师徒', note: 'no id anywhere' },
    ],
  })
  const out = parseMosaicRelate(raw, valid)
  assert.deepEqual(out.map((c) => `${c.from}->${c.to}`), ['demo-b->t1', 'demo-a->demo-b'],
    'the bracketed id is read out of the name, and a bare id still works')
  assert.equal(out[0].truth.kind, '亲属', 'and the word travels in the shape the applier reads')
  assert.equal(out[0].truth.note, '白鹭的亲生女儿')
})
