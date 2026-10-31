// tests/mosaic.test.js
import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeMosaic, EMPTY_MOSAIC, applyMosaicProposal, mosaicDigest, factStatus, factStatuses } from '../lib/mosaic.js'
import { assembleContext, hashText } from '../lib/overview.js'

const CHAR = (id, name) => ({ id, kind: 'character', name })

test('an absent or malformed mosaic normalizes to empty', () => {
  assert.deepEqual(normalizeMosaic(undefined), EMPTY_MOSAIC)
  assert.deepEqual(normalizeMosaic(null), EMPTY_MOSAIC)
  assert.deepEqual(normalizeMosaic('x'), EMPTY_MOSAIC)
  assert.deepEqual(normalizeMosaic({ entities: 'no', edges: 7 }), EMPTY_MOSAIC)
})

test('the five kinds survive; anything else (including the retired card) is dropped', () => {
  const m = normalizeMosaic({ entities: [
    { id: 'e1', kind: 'character', name: '张三' },
    { id: 'e2', kind: 'place', name: '老宅', location: '城南' },
    { id: 'e3', kind: 'faction', name: '青帮' },
    { id: 'e4', kind: 'item', name: '短刀' },
    { id: 'e5', kind: 'event', name: '雨夜' },
    { id: 'e6', kind: 'card', name: '旧卡' },
    { id: 'e7', kind: 'dragon', name: '??' },
    { name: 'no-id' },
  ] })
  assert.deepEqual(m.entities.map((e) => e.kind), ['character', 'place', 'faction', 'item', 'event'])
  assert.equal(m.entities[1].location, '城南')
})

test('missing or duplicate ids get fresh uuids', () => {
  const m = normalizeMosaic({ entities: [
    { id: 'e1', kind: 'character', name: '张三' },
    { id: 'e1', kind: 'character', name: '李四' },
    { kind: 'character', name: '王五' },
  ] })
  const ids = m.entities.map((e) => e.id)
  assert.equal(new Set(ids).size, 3)
  for (const id of ids) assert.notEqual(id, '')
})

test('edges with unknown endpoints are dropped; duplicate pairs keep the first', () => {
  const m = normalizeMosaic({
    entities: [{ id: 'a', kind: 'character', name: '张三' }, { id: 'b', kind: 'character', name: '李四' }],
    edges: [
      { id: 'r1', from: 'a', to: 'b', truth: { kind: '挚友' } },
      { id: 'r2', from: 'a', to: 'b', truth: { kind: '仇人' } },
      { id: 'r3', from: 'a', to: 'ghost', truth: { kind: '陌路' } },
    ],
  })
  assert.equal(m.edges.length, 1)
  assert.equal(m.edges[0].truth.kind, '挚友')
})

test('beliefs whose holder is not an entity are dropped; fields are stringified', () => {
  const m = normalizeMosaic({
    entities: [{ id: 'a', kind: 'character', name: '张三' }, { id: 'b', kind: 'character', name: '李四' }],
    edges: [{ id: 'r1', from: 'a', to: 'b', truth: { kind: '挚友' },
      beliefs: [{ holderId: 'b', kind: '仇人', note: 'n' }, { holderId: 'zz', kind: 'x', note: '' }] }],
  })
  assert.equal(m.edges[0].beliefs.length, 1)
  assert.equal(m.edges[0].beliefs[0].holderId, 'b')
})

test('statuses survive on every kind, not just characters', () => {
  // "锈了" is an item's state and "已被查封" a place's: the character-only rule was an accident of
  // the first schema, not a fact about stories.
  const m = normalizeMosaic({ entities: [
    { id: 'a', kind: 'character', name: '张三', statuses: [{ id: 's1', label: '受伤' }] },
    { id: 'b', kind: 'item', name: '刀', statuses: [{ id: 's2', label: '锈' }] },
  ] })
  assert.equal(m.entities[0].statuses.length, 1)
  assert.equal(m.entities[1].statuses.length, 1)
  assert.equal(m.entities[1].statuses[0].label, '锈')
})

test('retired edges survive normalization with their log', () => {
  const m = normalizeMosaic({
    entities: [{ id: 'a', kind: 'character', name: '张三' }, { id: 'b', kind: 'character', name: '李四' }],
    edges: [{ id: 'r1', from: 'a', to: 'b', truth: { kind: '挚友' }, retired: true,
      log: [{ at: 5, what: 'edge.retired', before: null, after: null }] }],
  })
  assert.equal(m.edges[0].retired, true)
  assert.equal(m.edges[0].log.length, 1)
})

test('entity.upsert matches by kind+name and updates, otherwise creates', () => {
  const base = normalizeMosaic({ entities: [CHAR('a', '张三')] })
  const { mosaic: m1, applied } = applyMosaicProposal(base, { changes: [
    { op: 'entity.upsert', kind: 'character', name: '张三', role: '主角' },
    { op: 'entity.upsert', kind: 'place', name: '码头', summary: '仓库', atmosphere: '潮湿' },
  ] })
  assert.deepEqual(applied, ['entity.upsert 张三', 'entity.upsert 码头'])
  assert.equal(m1.entities.length, 2)
  assert.equal(m1.entities.find((e) => e.id === 'a').role, '主角')
  const place = m1.entities.find((e) => e.name === '码头')
  assert.equal(place.kind, 'place')
  assert.equal(place.atmosphere, '潮湿')
})

test('edge.upsert matches by endpoint pair, writes truth, and logs the change', () => {
  const base = normalizeMosaic({ entities: [CHAR('a', '张三'), CHAR('b', '李四')], edges: [
    { id: 'r1', from: 'a', to: 'b', truth: { kind: '陌生', note: '' } },
  ] })
  const { mosaic } = applyMosaicProposal(base, { changes: [
    { op: 'edge.upsert', from: 'a', to: 'b', truth: { kind: '挚友', note: '结拜' } },
    // unknown endpoints are skipped, not fatal
    { op: 'edge.upsert', from: 'a', to: 'zz', truth: { kind: '仇人' } },
  ] })
  const edge = mosaic.edges.find((e) => e.id === 'r1')
  assert.equal(edge.truth.kind, '挚友')
  assert.equal(edge.log.length, 1)
  assert.equal(edge.log[0].what, 'truth.updated')
  assert.equal(edge.log[0].before.kind, '陌生')
  assert.equal(edge.log[0].after.kind, '挚友')
  assert.equal(mosaic.edges.length, 1) // the unknown-endpoint op was dropped
})

test('edge.upsert creates a new edge when the pair does not exist', () => {
  const base = normalizeMosaic({ entities: [CHAR('a', '张三'), CHAR('b', '李四')] })
  const { mosaic } = applyMosaicProposal(base, { changes: [
    { op: 'edge.upsert', from: 'b', to: 'a', truth: { kind: '徒弟' } },
  ] })
  assert.equal(mosaic.edges.length, 1)
  assert.equal(mosaic.edges[0].from, 'b')
})

test('belief.add replaces the holder entry on one edge, one level only', () => {
  const base = normalizeMosaic({ entities: [CHAR('a', '张三'), CHAR('b', '李四')], edges: [
    { id: 'r1', from: 'a', to: 'b', truth: { kind: '挚友' }, beliefs: [{ holderId: 'b', kind: '陌路' }] },
  ] })
  const { mosaic } = applyMosaicProposal(base, { changes: [
    { op: 'belief.add', edgeId: 'r1', holderId: 'b', kind: '仇人', note: '不知情' },
  ] })
  assert.deepEqual(mosaic.edges[0].beliefs, [{ holderId: 'b', kind: '仇人', note: '不知情' }])
})

test('status.add and status.remove edit character statuses with dedupe', () => {
  const base = normalizeMosaic({ entities: [CHAR('a', '张三')] })
  const { mosaic: m1 } = applyMosaicProposal(base, { changes: [
    { op: 'status.add', entityId: 'a', label: '受伤' },
    { op: 'status.add', entityId: 'a', label: '受伤' }, // dedupe
  ] })
  assert.deepEqual(m1.entities[0].statuses.map((s) => s.label), ['受伤'])
  const { mosaic: m2 } = applyMosaicProposal(m1, { changes: [
    { op: 'status.remove', entityId: 'a', label: '受伤' },
  ] })
  assert.deepEqual(m2.entities[0].statuses, [])
})

test('edge.retire keeps the edge, marks it, and logs the reason', () => {
  const base = normalizeMosaic({ entities: [CHAR('a', '张三'), CHAR('b', '李四')], edges: [
    { id: 'r1', from: 'a', to: 'b', truth: { kind: '挚友' } },
  ] })
  const { mosaic } = applyMosaicProposal(base, { changes: [
    { op: 'edge.retire', edgeId: 'r1', reason: '第4章决裂' },
  ] })
  assert.equal(mosaic.edges.length, 1)
  assert.equal(mosaic.edges[0].retired, true)
  assert.equal(mosaic.edges[0].log.at(-1).what, 'edge.retired')
})

test('an unknown op or empty name is skipped and counted', () => {
  const base = normalizeMosaic({ entities: [CHAR('a', '张三')] })
  const { mosaic, applied, skipped } = applyMosaicProposal(base, { changes: [
    { op: 'explode' },
    { op: 'entity.upsert', kind: 'character', name: '' },
  ] })
  assert.deepEqual(applied, [])
  assert.equal(skipped, 2)
  assert.equal(mosaic.entities.length, 1)
})

test('digest lists entities and live edges one line each, with the ids the ops resolve by', () => {
  const m = normalizeMosaic({
    entities: [CHAR('a', '张三'), CHAR('b', '李四'), { id: 'c', kind: 'item', name: '短刀', summary: '张三的刀' }],
    edges: [
      { id: 'r1', from: 'a', to: 'b', truth: { kind: '挚友' } },
      { id: 'r2', from: 'c', to: 'a', truth: { kind: '持有' }, retired: true },
    ],
  })
  const text = mosaicDigest(m)
  assert.match(text, /角色 张三 \[a\]/)
  assert.match(text, /物品 短刀 \[c\]/)
  assert.match(text, /张三 \[a\] —挚友 \[r1\]→ 李四 \[b\]/)
  assert.doesNotMatch(text, /持有/) // retired edges stay out of the summary
})

test('a portrait path survives normalization, so a generated picture outlives a reload', () => {
  // The bug this pins: portrait was missing from the entity whitelist. The picture was written to
  // <book>/portraits/<id>.png and patched onto the card, then silently dropped on the next save —
  // the file stayed on disk with nothing pointing at it, so a restart looked like "the image is
  // gone" when it was actually "the record of it is gone".
  const m = normalizeMosaic({ entities: [
    { id: 'e1', kind: 'character', name: '沈砚', portrait: 'portraits/e1.png' },
    { id: 'e2', kind: 'character', name: '白鹭' },
    { id: 'e3', kind: 'item', name: '怀表', portrait: 'portraits/e3.png' },
  ] })
  assert.equal(m.entities[0].portrait, 'portraits/e1.png')
  assert.equal(m.entities[1].portrait, '', 'a card with no picture says so, rather than carrying undefined')
  assert.equal(m.entities[2].portrait, 'portraits/e3.png', 'setting cards keep theirs too')

  // A round trip is what a save actually does: normalize, serialize, parse, normalize again.
  const again = normalizeMosaic(JSON.parse(JSON.stringify(m)))
  assert.equal(again.entities[0].portrait, 'portraits/e1.png', 'the path survives the round trip')

  // A non-string portrait is not a path; it becomes empty rather than a broken img src.
  const bad = normalizeMosaic({ entities: [{ id: 'e4', kind: 'character', name: 'x', portrait: 42 }] })
  assert.equal(bad.entities[0].portrait, '')
})

test('provenance: a fact the prose stated is checkable, a hand-made fact is not', async () => {
  // The provenance spec (docs/superpowers/specs/2026-10-26-mosaic-fact-provenance.md): the board
  // and the prose are both sources, so a fact's ORIGIN decides whether it can go stale. A fact the
  // writer typed is intent — the prose owing nothing to it is not a conflict. A fact extracted from
  // chapter text claims the prose states it, and that claim is checkable.
  const chapter = { id: 'c1', title: '第一章', text: '雨夜里张三把短刀递给了李四。', children: [] }
  const book = { chapters: [chapter] }
  const note = '张三把短刀递给了李四'
  const basedOn = { chapter: 'c1', hash: hashText(chapter.text) }

  // Rule 1: the verbatim note is still in the prose.
  assert.equal(factStatus({ source: 'chapter', note, basedOn }, book), 'valid')
  // Rule 2: the note is gone but the chapter hash is UNCHANGED — the disappearance is an editing
  // artifact, not the prose moving on. Deleting a comma must not flag a fact.
  assert.equal(factStatus({ source: 'chapter', note, basedOn: { chapter: 'c1', hash: hashText('雨夜里张三把短刀递给了李四。') } },
    { chapters: [{ ...chapter, text: '雨夜，张三把短刀递给了李四。' }] }), 'valid',
    'a punctuation edit that broke the match does NOT flag the fact, because the chapter itself is the same')
  // Rule 3: the note is gone AND the hash changed → suspect, not an error.
  assert.equal(factStatus({ source: 'chapter', note, basedOn }, book), 'valid')
  assert.equal(factStatus({ source: 'chapter', note, basedOn }, { chapters: [{ ...chapter, text: '完全重写的正文。' }] }), 'suspect')
  // Rule 4: the chapter is gone.
  assert.equal(factStatus({ source: 'chapter', note, basedOn }, { chapters: [] }), 'orphaned')
  // Hand-made: never checked, whatever the prose says.
  assert.equal(factStatus({ source: 'board', note: '正文里根本没有这句', basedOn }, book), 'valid')
  assert.equal(factStatus({ source: 'board' }, book), 'valid')
})

test('applying a check proposal stamps its facts with the chapter they came from', async () => {
  // The stamp is the whole point of provenance: without it, nothing on the board is checkable
  // against the prose. It is written at APPLY time, from the chapter the check read.
  const mosaic = { schemaVersion: 1, entities: [
    { id: 'e-a', kind: 'character', name: '张三', role: '' },
    { id: 'e-b', kind: 'character', name: '李四', role: '' },
  ], edges: [] }
  const proposal = { changes: [
    { op: 'edge.upsert', from: 'e-a', to: 'e-b', truth: { kind: '托付', note: '张三把短刀递给了李四' } },
    { op: 'entity.upsert', kind: 'character', name: '王五', summary: '收刀的人' },
  ] }
  const provenance = { chapterId: 'c1', hash: 'abc123' }
  const { mosaic: next } = applyMosaicProposal(mosaic, proposal, provenance)

  const edge = next.edges[0]
  assert.equal(edge.source, 'chapter', 'an edge from a chapter check is stamped')
  assert.deepEqual(edge.evidence, ['张三把短刀递给了李四'], 'with the verbatim line it came from')
  assert.deepEqual(edge.basedOn, { chapter: 'c1', hash: 'abc123' }, 'and the chapter text it was read against')

  // 王五 is the entity this proposal CREATED (张三/李四 predate it and keep their own provenance).
  const entity = next.entities.find((e) => e.name === '王五')
  assert.equal(entity.source, 'chapter')
  assert.deepEqual(entity.basedOn, { chapter: 'c1', hash: 'abc123' })

  // The same apply WITHOUT provenance is a hand-made fact — the merge flow and the manual new-card
  // dialog both land here, and neither claims the prose said anything.
  const handmade = applyMosaicProposal(mosaic, proposal)
  assert.equal(handmade.mosaic.edges[0].source, 'board')
  assert.equal(handmade.mosaic.edges[0].basedOn, undefined, 'no chapter to check against')
  // And an edge whose endpoints are unknown is still skipped, exactly as before provenance.
  const skipped = applyMosaicProposal(mosaic, { changes: [
    { op: 'edge.upsert', from: 'ghost', to: 'e-a', truth: { kind: 'x', note: 'y' } },
  ] }, provenance)
  assert.equal(skipped.skipped, 1, 'provenance does not rescue an unreadable edge')
})

test('hand-made and extracted facts coexist, and only extracted ones are checked', () => {
  // A book where the writer typed 白鹭 themselves and accepted 屠九's relation from a check. The
  // statuses flatten both — but only the chapter-sourced one can ever read as suspect.
  const chapterText = '屠九堵在码头，讨要十年前的旧账。'
  const book = {
    chapters: [{ id: 'c1', title: '一', text: chapterText, children: [] }],
    mosaic: normalizeMosaic({ entities: [
      { id: 'e1', kind: 'character', name: '白鹭', role: '' },
      { id: 'e2', kind: 'character', name: '屠九', role: '' },
      { id: 'e3', kind: 'character', name: '沈砚', role: '' },
    ], edges: [
      { id: 'r1', from: 'e2', to: 'e3', truth: { kind: '追讨', note: '屠九堵在码头，讨要十年前的旧账' },
        source: 'chapter', basedOn: { chapter: 'c1', hash: hashText(chapterText) } },
      { id: 'r2', from: 'e1', to: 'e3', truth: { kind: '旧识', note: '正文还没写到这句' },
        source: 'board' },
    ] }),
  }
  const rows = factStatuses(book.mosaic, book)
  assert.equal(rows.length, 1, 'only chapter-sourced facts are listed at all')
  assert.equal(rows[0].status, 'valid', 'and it is valid while the prose still carries the line')

  // The prose is rewritten: the extracted fact goes suspect, the hand-made one does not even get
  // checked — the writer's word outranks the prose by definition.
  const rewritten = { chapters: [{ ...book.chapters[0], text: '完全另起炉灶的开头。' }] }
  const after = factStatuses(book.mosaic, rewritten)
  assert.equal(after[0].status, 'suspect')
})

test('assembleContext marks suspect facts and stays quiet about valid ones', () => {
  // The model must KNOW a fact may lag — its next sentence could lean on a relation the writer has
  // since rewritten. But a quiet board is the normal case: listing every check that passed would
  // bury the signal under boilerplate.
  const chapterText = '屠九堵在码头，讨要十年前的旧账。'
  const base = {
    chapters: [{ id: 'c1', title: '一', text: chapterText, children: [] }],
    overview: { chapters: {}, global: undefined },
    mosaic: normalizeMosaic({ entities: [
      { id: 'e1', kind: 'character', name: '白鹭', role: '' },
      { id: 'e2', kind: 'character', name: '屠九', role: '' },
      { id: 'e3', kind: 'character', name: '沈砚', role: '' },
    ], edges: [
      { id: 'r1', from: 'e2', to: 'e3', truth: { kind: '追讨', note: '屠九堵在码头，讨要十年前的旧账' },
        source: 'chapter', basedOn: { chapter: 'c1', hash: hashText(chapterText) } },
    ] }),
  }
  const quiet = assembleContext(base, 'c1', 20000)
  assert.equal(quiet.text.includes('可能已滞后'), false, 'nothing suspect, nothing said')

  const suspect = assembleContext(
    { ...base, chapters: [{ ...base.chapters[0], text: '彻底重写。' }] }, 'c1', 20000)
  assert.ok(suspect.text.includes('可能已滞后'), 'a rewritten chapter flags its facts')
  assert.ok(suspect.text.includes('追讨'), 'naming the relation, so the model can judge it')
})



test('a punctuation edit inside the fact own sentence DOES flag it — no special casing', () => {
  // The punctuation filter was tried and removed, by decision: a punctuation-only edit is rare,
  // and the strip list was itself the bigger risk (a symbol class missed is a silent mis-valid).
  // Uniformity over cleverness — the writer clears one suspect with the review they were going to
  // run anyway.
  const original = '雨夜里，张三把短刀递给了李四，然后转身离开。'
  const chapter = { id: 'c1', title: '一', text: original, children: [] }
  const note = '张三把短刀递给了李四，然后转身离开'
  const fact = { source: 'chapter', note, basedOn: { chapter: 'c1', hash: hashText(original) } }

  const withoutComma = '雨夜里，张三把短刀递给了李四然后转身离开。'
  assert.equal(withoutComma.includes(note), false, 'the verbatim match really fails here')
  assert.equal(factStatus(fact, { chapters: [{ ...chapter, text: withoutComma }] }), 'suspect',
    'a comma deleted inside the fact own sentence is reported, not forgiven')
})

// ---- entity model v4: five kinds, shared skeleton, references, custom rows ----

test('every kind carries the shared skeleton, and only its own fields', () => {
  const m = normalizeMosaic({ entities: [
    { id: 'c', kind: 'character', name: '沈砚', role: '修表匠', gender: '男', age: '三十四',
      nationality: '民国', appearance: '左手有旧伤', personality: '寡言', motivation: '找父亲',
      arc: '从回避到面对', summary: '一句话', description: '长描述', notes: '私注' },
    { id: 'p', kind: 'place', name: '码头', location: '城南', atmosphere: '潮湿', summary: '仓库区' },
  ] })
  const character = m.entities[0]
  for (const field of ['summary', 'description', 'notes']) {
    assert.equal(typeof character[field], 'string', `${field} is on every card`)
  }
  assert.deepEqual(character.aliases, [])
  assert.deepEqual(character.custom, [])
  assert.equal(character.gender, '男')
  assert.equal(character.nationality, '民国')
  assert.equal(character.arc, '从回避到面对')
  // A place does not carry a character's fields: the shape follows the kind.
  const place = m.entities[1]
  assert.equal(place.location, '城南')
  assert.equal(place.atmosphere, '潮湿')
  assert.equal(place.arc, undefined)
  assert.equal(place.gender, undefined)
})

test('summary and description stay separate, so a long description never reaches a digest', () => {
  const long = '这是一段很长的设定资料。'.repeat(40)
  const m = normalizeMosaic({ entities: [
    { id: 'p', kind: 'place', name: '码头', summary: '仓库区', description: long },
  ] })
  assert.equal(m.entities[0].description, long, 'the long form is kept whole')
  const digest = mosaicDigest(m)
  assert.ok(digest.includes('仓库区'), 'the one-liner is what the digest reads')
  assert.ok(!digest.includes('这是一段很长的设定资料'), 'and the long form stays out of it')
})

test('a reference field pointing at a card that exists survives; a dangling one is cleared', () => {
  const m = normalizeMosaic({ entities: [
    { id: 'a', kind: 'character', name: '沈砚' },
    { id: 'f', kind: 'faction', name: '青帮', leader: 'a', members: ['a', 'ghost'] },
    { id: 'i', kind: 'item', name: '怀表', holder: 'ghost' },
    { id: 'p', kind: 'place', name: '码头', controlledBy: 'f' },
  ] })
  const faction = m.entities.find((e) => e.id === 'f')
  assert.equal(faction.leader, 'a', 'a real target is kept')
  assert.deepEqual(faction.members, ['a'], 'a dangling member id is dropped')
  assert.equal(m.entities.find((e) => e.id === 'i').holder, '', 'a dangling holder is cleared')
  assert.equal(m.entities.find((e) => e.id === 'p').controlledBy, 'f', 'references may point forward')
})

test('a reference to a card later in the array is not cleared', () => {
  // Ids are collected before any card is normalized: a faction's leader can be the last entity in
  // the file, and resolving against a half-built set would silently unlink it.
  const m = normalizeMosaic({ entities: [
    { id: 'f', kind: 'faction', name: '青帮', leader: 'a' },
    { id: 'a', kind: 'character', name: '沈砚' },
  ] })
  assert.equal(m.entities[0].leader, 'a')
})

test('custom rows are label+value pairs, matched by label on upsert', () => {
  const m = normalizeMosaic({ entities: [
    { id: 'c', kind: 'character', name: '沈砚', custom: [{ label: '血型', value: 'O' }, { label: '  ', value: 'x' }] },
  ] })
  assert.equal(m.entities[0].custom.length, 1, 'a blank label is not a field')
  assert.equal(m.entities[0].custom[0].label, '血型')

  const { mosaic } = applyMosaicProposal(m, { changes: [
    { op: 'entity.upsert', kind: 'character', name: '沈砚', custom: [{ label: '血型', value: 'A' }, { label: '惯用手', value: '左手' }] },
  ] })
  const custom = mosaic.entities[0].custom
  assert.equal(custom.length, 2, 'an existing label updates instead of stacking a duplicate')
  assert.equal(custom.find((row) => row.label === '血型').value, 'A')
  assert.equal(custom.find((row) => row.label === '惯用手').value, '左手')
})

test('statuses apply to every kind, and a proposal can add one to a place', () => {
  const m = normalizeMosaic({ entities: [{ id: 'p', kind: 'place', name: '码头' }] })
  const { mosaic } = applyMosaicProposal(m, { changes: [
    { op: 'status.add', entityId: 'p', label: '已被查封' },
  ] })
  assert.deepEqual(mosaic.entities[0].statuses.map((s) => s.label), ['已被查封'])
})

test('an entity proposal writes the kind it names and keeps unsupplied fields', () => {
  const m = normalizeMosaic({ entities: [
    { id: 'a', kind: 'character', name: '沈砚', summary: '修表匠', notes: '私注' },
  ] })
  const { mosaic } = applyMosaicProposal(m, { changes: [
    { op: 'entity.upsert', kind: 'character', name: '沈砚', gender: '男' },
  ] })
  const entity = mosaic.entities[0]
  assert.equal(entity.gender, '男', 'the supplied field lands')
  assert.equal(entity.summary, '修表匠', 'an unsupplied summary survives')
  assert.equal(entity.notes, '私注', 'and so does a private note')
})
