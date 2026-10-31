# Mosaic 调查板 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在写作面板中增加 Mosaic 调查板：属性图存储角色/设定/关系，AI 提案-审核更新，独立 `mosaic` 模型角色，GM 屏式 bottom sheet UI，chat 获得两层背景上下文。

**Architecture:** 纯函数图操作放 `lib/mosaic.js`（归一化、提案应用、摘要）；`lib/model.js` 的 book 增加平级 `mosaic` 字段随现有 save/load 通道落盘；host 新增三个 LLM 路由与一个只读故事工具；client 新增调查板 sheet 组件与提案审核流。

**Tech Stack:** 现有技术栈不变——Node `node:test`、React（`createElement` 内联于 client.js）、无新增依赖。

**Spec:** `docs/superpowers/specs/2026-10-25-mosaic-wall-design.md`

## Global Constraints

- 无新增 npm 依赖
- 所有中文 UI 文案进 `client.js` 的 `ZH`/`EN` 字典（现有模式），键名前缀 `mosaic.`
- 关系 `kind`、卡片 `category` 一律自由文本，不建枚举
- 认知 `beliefs` 只允许一层（holderId + kind + note），不嵌套
- AI 永不直接写库：所有变更走提案，采纳才落盘；`story_mosaic_query` 只读
- 无效边（端点实体不存在）在归一化时丢弃；空/重复 id 重写为 uuid（对齐 `lib/model.js` 的 `uniqueIds` 思路）
- `edge.retire` 保留边，`retired: true` + 日志，不物理删除
- 每个任务完成即 commit；提交信息小写祈使句，说明 why（跟随现有提交风格）
- 测试命令 `npm test`，lint `npm run lint`

---

### Task 1: `lib/mosaic.js` — 图的归一化

**Files:**
- Create: `lib/mosaic.js`
- Test: `tests/mosaic.test.js`

**Interfaces:**
- Produces: `normalizeMosaic(raw) -> { schemaVersion: 1, entities: [...], edges: [...] }`，以及常量 `EMPTY_MOSAIC`

- [ ] **Step 1: Write the failing test**

```js
// tests/mosaic.test.js
import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeMosaic, EMPTY_MOSAIC } from '../lib/mosaic.js'

test('an absent or malformed mosaic normalizes to empty', () => {
  assert.deepEqual(normalizeMosaic(undefined), EMPTY_MOSAIC)
  assert.deepEqual(normalizeMosaic(null), EMPTY_MOSAIC)
  assert.deepEqual(normalizeMosaic('x'), EMPTY_MOSAIC)
  assert.deepEqual(normalizeMosaic({ entities: 'no', edges: 7 }), EMPTY_MOSAIC)
})

test('entities keep kind character or card; others are dropped', () => {
  const m = normalizeMosaic({ entities: [
    { id: 'e1', kind: 'character', name: '张三' },
    { id: 'e2', kind: 'card', category: '地点', name: '老宅' },
    { id: 'e3', kind: 'dragon', name: '??' },
    { name: 'no-id' },
  ] })
  assert.equal(m.entities.length, 2)
  assert.equal(m.entities[0].kind, 'character')
  assert.equal(m.entities[1].category, '地点')
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

test('statuses only survive on character entities', () => {
  const m = normalizeMosaic({ entities: [
    { id: 'a', kind: 'character', name: '张三', statuses: [{ id: 's1', label: '受伤' }] },
    { id: 'b', kind: 'card', category: '物品', name: '刀', statuses: [{ id: 's2', label: '锈' }] },
  ] })
  assert.equal(m.entities[0].statuses.length, 1)
  assert.equal(m.entities[1].statuses, undefined)
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/mosaic.test.js`
Expected: FAIL（`Cannot find module '../lib/mosaic.js'`）

- [ ] **Step 3: Write the implementation**

```js
// lib/mosaic.js
import { randomUUID } from 'node:crypto'

/**
 * The Mosaic board: one property graph per book.
 *
 * Entities are characters and setting cards; edges are formal relations between them. An edge
 * carries the AUTHOR'S truth plus one level of per-character beliefs — never nested — and a
 * change log appended by the proposal flow. Retiring an edge keeps it: the wall hides it, the
 * log explains it, and the writer can still find it again.
 */
export const EMPTY_MOSAIC = { schemaVersion: 1, entities: [], edges: [] }

const str = (v) => (typeof v === 'string' ? v : '')
const arr = (v) => (Array.isArray(v) ? v : [])

/** Normalize one entity. Unknown kinds, empty names, and card statuses are dropped. */
function normalizeEntity(raw) {
  if (!raw || typeof raw !== 'object') return null
  const kind = raw.kind === 'card' ? 'card' : raw.kind === 'character' ? 'character' : null
  if (kind === null) return null
  const name = str(raw.name).trim()
  if (name === '') return null
  const entity = {
    id: str(raw.id),
    kind,
    name,
    tags: arr(raw.tags).map(str).filter((s) => s !== ''),
    layout: raw.layout && Number.isFinite(raw.layout.x) && Number.isFinite(raw.layout.y)
      ? { x: raw.layout.x, y: raw.layout.y } : null,
  }
  if (kind === 'character') {
    entity.role = str(raw.role)
    entity.summary = str(raw.summary)
    entity.statuses = arr(raw.statuses)
      .filter((s) => s && typeof s === 'object' && str(s.label).trim() !== '')
      .map((s) => ({ id: str(s.id), label: str(s.label).trim() }))
  } else {
    entity.category = str(raw.category).trim()
    entity.body = str(raw.body)
  }
  return entity
}

/** Normalize one edge's truth and one level of beliefs. */
function normalizeEdge(raw, idSet) {
  if (!raw || typeof raw !== 'object') return null
  const from = str(raw.from)
  const to = str(raw.to)
  // An edge whose endpoints do not exist is unreadable: drop it rather than draw a dangling line.
  if (!idSet.has(from) || !idSet.has(to)) return null
  const truth = raw.truth && typeof raw.truth === 'object'
    ? { kind: str(raw.truth.kind).trim(), note: str(raw.truth.note) } : { kind: '', note: '' }
  const beliefs = arr(raw.beliefs)
    .filter((b) => b && typeof b === 'object' && idSet.has(str(b.holderId)))
    .map((b) => ({ holderId: str(b.holderId), kind: str(b.kind).trim(), note: str(b.note) }))
  return {
    id: str(raw.id), from, to, truth, beliefs,
    retired: raw.retired === true,
    log: arr(raw.log).filter((l) => l && typeof l === 'object' && typeof l.at === 'number')
      .map((l) => ({ at: l.at, what: str(l.what), before: l.before ?? null, after: l.after ?? null })),
  }
}

/**
 * Read any mosaic-shaped value into the canonical form. Empty and duplicate ids are what make an
 * edit land on the wrong entity; only offenders get a fresh uuid, matching model.js.
 */
export function normalizeMosaic(raw) {
  const source = raw && typeof raw === 'object' ? raw : {}
  const entities = []
  for (const rawEntity of arr(source.entities)) {
    const entity = normalizeEntity(rawEntity)
    if (entity === null) continue
    if (entity.id === '' || entities.some((e) => e.id === entity.id)) entity.id = randomUUID()
    entities.push(entity)
  }
  const idSet = new Set(entities.map((e) => e.id))
  const edges = []
  for (const rawEdge of arr(source.edges)) {
    const edge = normalizeEdge(rawEdge, idSet)
    if (edge === null) continue
    if (edge.id === '' || edges.some((e) => e.id === edge.id)) edge.id = randomUUID()
    edges.push(edge)
  }
  return { schemaVersion: 1, entities, edges }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/mosaic.test.js`
Expected: PASS（7 tests）

- [ ] **Step 5: Commit**

```bash
git add lib/mosaic.js tests/mosaic.test.js
git commit -m "mosaic graph normalization: kinds, unique ids, endpoint-checked edges"
```

---

### Task 2: `lib/mosaic.js` — 提案应用

**Files:**
- Modify: `lib/mosaic.js`
- Test: `tests/mosaic.test.js`（追加）

**Interfaces:**
- Consumes: `normalizeMosaic`
- Produces: `applyMosaicProposal(mosaic, proposal) -> { mosaic, applied: string[] }`——**纯函数**，返回新 mosaic 与已采纳 op 的描述列表；非法 op 跳过并计入 `skipped`。op 词表：`entity.upsert` / `edge.upsert` / `belief.add` / `status.add` / `status.remove` / `edge.retire`

- [ ] **Step 1: Write the failing tests**（追加到 `tests/mosaic.test.js`）

```js
import { applyMosaicProposal } from '../lib/mosaic.js'

const CHAR = (id, name) => ({ id, kind: 'character', name })

test('entity.upsert matches by kind+name and updates, otherwise creates', () => {
  const base = normalizeMosaic({ entities: [CHAR('a', '张三')] })
  const { mosaic: m1, applied } = applyMosaicProposal(base, { changes: [
    { op: 'entity.upsert', kind: 'character', name: '张三', role: '主角' },
    { op: 'entity.upsert', kind: 'card', category: '地点', name: '码头', body: '仓库' },
  ] })
  assert.deepEqual(applied, ['entity.upsert 张三', 'entity.upsert 码头'])
  assert.equal(m1.entities.length, 2)
  assert.equal(m1.entities.find((e) => e.id === 'a').role, '主角')
  const card = m1.entities.find((e) => e.name === '码头')
  assert.equal(card.kind, 'card')
  assert.equal(card.category, '地点')
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/mosaic.test.js`
Expected: FAIL（`applyMosaicProposal` 未定义）

- [ ] **Step 3: Write the implementation**（追加到 `lib/mosaic.js`）

```js
/**
 * Apply one proposal's changes to a mosaic, purely: callers own persistence. Each op resolves
 * against entities the writer can see — characters by kind+name, edges by endpoint pair — so a
 * repeated suggestion updates instead of duplicating, the same contract the agent tools use.
 * Unknown ops and empty names are counted as skipped, never fatal: one bad line must not void
 * the proposals the writer already accepted.
 */
export function applyMosaicProposal(mosaic, proposal) {
  const next = {
    schemaVersion: 1,
    entities: (mosaic?.entities ?? []).map((e) => structuredClone(e)),
    edges: (mosaic?.edges ?? []).map((e) => structuredClone(e)),
  }
  const applied = []
  let skipped = 0
  const log = (edge, what, before, after) => {
    edge.log.push({ at: Date.now(), what, before, after })
  }
  for (const raw of Array.isArray(proposal?.changes) ? proposal.changes : []) {
    const op = typeof raw?.op === 'string' ? raw.op : ''
    if (op === 'entity.upsert') {
      const kind = raw.kind === 'card' ? 'card' : raw.kind === 'character' ? 'character' : null
      const name = str(raw?.name).trim()
      if (kind === null || name === '') { skipped += 1; continue }
      let entity = next.entities.find((e) => e.kind === kind && e.name === name)
      if (entity === undefined) {
        entity = kind === 'character'
          ? { id: randomUUID(), kind, name, tags: [], role: '', summary: '', statuses: [], layout: null }
          : { id: randomUUID(), kind, name, category: '', body: '', tags: [], layout: null }
        next.entities.push(entity)
      }
      if (kind === 'character') {
        if (typeof raw.role === 'string') entity.role = raw.role
        if (typeof raw.summary === 'string') entity.summary = raw.summary
      } else {
        if (typeof raw.category === 'string') entity.category = raw.category
        if (typeof raw.body === 'string') entity.body = raw.body
      }
      applied.push(`entity.upsert ${name}`)
      continue
    }
    if (op === 'edge.upsert') {
      const from = str(raw?.from)
      const to = str(raw?.to)
      if (!next.entities.some((e) => e.id === from) || !next.entities.some((e) => e.id === to)) { skipped += 1; continue }
      const truth = {
        kind: str(raw?.truth?.kind).trim(),
        note: str(raw?.truth?.note),
      }
      let edge = next.edges.find((e) => e.from === from && e.to === to)
      if (edge === undefined) {
        edge = { id: randomUUID(), from, to, truth, beliefs: [], retired: false, log: [] }
        next.edges.push(edge)
        applied.push(`edge.upsert ${truth.kind}`)
        continue
      }
      if (edge.truth.kind !== truth.kind) log(edge, 'truth.updated', { kind: edge.truth.kind }, { kind: truth.kind })
      edge.truth = truth
      edge.retired = false
      applied.push(`edge.upsert ${truth.kind}`)
      continue
    }
    if (op === 'belief.add') {
      const edge = next.edges.find((e) => e.id === raw?.edgeId)
      const holderId = str(raw?.holderId)
      const kind = str(raw?.kind).trim()
      if (edge === undefined || !next.entities.some((e) => e.id === holderId) || kind === '') { skipped += 1; continue }
      const belief = { holderId, kind, note: str(raw?.note) }
      const existing = edge.beliefs.findIndex((b) => b.holderId === holderId)
      if (existing >= 0) edge.beliefs[existing] = belief
      else edge.beliefs.push(belief)
      applied.push(`belief.add ${kind}`)
      continue
    }
    if (op === 'status.add' || op === 'status.remove') {
      const entity = next.entities.find((e) => e.id === raw?.entityId)
      const label = str(raw?.label).trim()
      if (entity === undefined || entity.kind !== 'character' || label === '') { skipped += 1; continue }
      entity.statuses = entity.statuses ?? []
      if (op === 'status.add') {
        if (!entity.statuses.some((s) => s.label === label)) entity.statuses.push({ id: `s-${randomUUID()}`, label })
      } else {
        entity.statuses = entity.statuses.filter((s) => s.label !== label)
      }
      applied.push(`${op} ${label}`)
      continue
    }
    if (op === 'edge.retire') {
      const edge = next.edges.find((e) => e.id === raw?.edgeId)
      if (edge === undefined) { skipped += 1; continue }
      if (!edge.retired) log(edge, 'edge.retired', null, { reason: str(raw?.reason) })
      edge.retired = true
      applied.push('edge.retire')
      continue
    }
    skipped += 1
  }
  return { mosaic: next, applied, skipped }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/mosaic.test.js`
Expected: PASS（14 tests）

- [ ] **Step 5: Commit**

```bash
git add lib/mosaic.js tests/mosaic.test.js
git commit -m "proposal application: match by pair and name, skip instead of void"
```

---

### Task 3: book 装配 `mosaic` 字段与摘要

**Files:**
- Modify: `lib/model.js`（`createEmptyBook`、`normalizeBook`）
- Modify: `lib/mosaic.js`（追加 `mosaicDigest`）
- Test: `tests/mosaic.test.js`（追加）、`tests/model.test.js`（追加一条）

**Interfaces:**
- Consumes: Task 1 的 `normalizeMosaic`
- Produces: `book.mosaic`（normalize 后一定存在）；`mosaicDigest(mosaic, chapters) -> string`（紧凑摘要：实体一行 + 每条非 retired 边一行，供 LLM 与 chat 上下文用）

- [ ] **Step 1: Write the failing tests**

```js
// tests/model.test.js 追加
import { normalizeBook, createEmptyBook } from '../lib/model.js'

test('a book always carries a mosaic, even from a raw file without one', () => {
  const book = normalizeBook({ title: '书' })
  assert.deepEqual(book.mosaic, { schemaVersion: 1, entities: [], edges: [] })
  assert.equal(createEmptyBook().mosaic.entities.length, 0)
})

test('a stored mosaic normalizes through the book', () => {
  const book = normalizeBook({ mosaic: { entities: [{ id: 'a', kind: 'character', name: '张三' }],
    edges: [{ id: 'r1', from: 'a', to: 'ghost', truth: { kind: 'x' } }] } })
  assert.equal(book.mosaic.entities.length, 1)
  assert.equal(book.mosaic.edges.length, 0) // dangling edge dropped
})
```

```js
// tests/mosaic.test.js 追加
import { mosaicDigest } from '../lib/mosaic.js'

test('digest lists entities and live edges in one line each', () => {
  const m = normalizeMosaic({
    entities: [CHAR('a', '张三'), CHAR('b', '李四'), { id: 'c', kind: 'card', category: '物品', name: '短刀', body: '张三的刀' }],
    edges: [
      { id: 'r1', from: 'a', to: 'b', truth: { kind: '挚友' } },
      { id: 'r2', from: 'c', to: 'a', truth: { kind: '持有' }, retired: true },
    ],
  })
  const text = mosaicDigest(m)
  assert.match(text, /张三/)
  assert.match(text, /短刀/)
  assert.match(text, /张三 —挚友— 李四/)
  assert.doesNotMatch(text, /持有/) // retired edges stay out of the summary
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/model.test.js tests/mosaic.test.js`
Expected: FAIL（`book.mosaic` undefined；`mosaicDigest` 未定义）

- [ ] **Step 3: Implement**

`lib/model.js` — `createEmptyBook` 返回值加一行（`settings: [],` 之后）：

```js
    mosaic: { schemaVersion: 1, entities: [], edges: [] },
```

`normalizeBook` 返回对象加一行（`settings: ...,` 之后）：

```js
    mosaic: normalizeMosaic(raw.mosaic),
```

文件顶部 import 区加：

```js
import { normalizeMosaic } from './mosaic.js'
```

`lib/mosaic.js` 追加：

```js
/**
 * The compact board summary that rides with every mosaic request and every chat turn: one line
 * per entity, one per live relation. Retired edges stay out — they are history, not present
 * state — and the full board is a tool call away (story_mosaic_query).
 */
export function mosaicDigest(mosaic) {
  const m = mosaic ?? EMPTY_MOSAIC
  const lines = []
  for (const e of m.entities) {
    lines.push(e.kind === 'character'
      ? `角色 ${e.name}${e.role ? `（${e.role}）` : ''}`
      : `${e.category || '设定'} ${e.name}`)
  }
  for (const edge of m.edges) {
    if (edge.retired) continue
    const from = m.entities.find((e) => e.id === edge.from)
    const to = m.entities.find((e) => e.id === edge.to)
    if (from === undefined || to === undefined) continue
    lines.push(`${from.name} —${edge.truth.kind}— ${to.name}`)
  }
  return lines.join('\n')
}
```

- [ ] **Step 4: Run the full suite**

Run: `npm test`
Expected: 全部 PASS（无回归；`serializeBook` 原样写回 `mosaic` 字段）

- [ ] **Step 5: Commit**

```bash
git add lib/model.js lib/mosaic.js tests/model.test.js tests/mosaic.test.js
git commit -m "the book carries a mosaic; a one-line-per-entity digest feeds requests"
```

---

### Task 4: `mosaic` 模型角色

**Files:**
- Modify: `lib/index.js:25`（`MODEL_ROLES`）
- Test: `tests/model-roles.test.js`（追加）

**Interfaces:**
- Produces: `/api/story.meta` 的 `roles` 含 `mosaic`；`selectionFor('mosaic')` 可用——后续任务的路由都用它取模型

- [ ] **Step 1: Write the failing test**（追加到 `tests/model-roles.test.js`）

```js
test('mosaic is a first-class role with its own override slot', () => {
  const config = { mosaic: { provider: 'agnes', model: 'm-9' } }
  assert.deepEqual(resolveModelSelection(session, config, 'mosaic'), { provider: 'agnes', model: 'm-9' })
  assert.deepEqual(resolveModelSelection(session, {}, 'mosaic'), session) // unset falls back
})
```

（该文件用 `resolveModelSelection` + `session` fixture 纯函数断言，无文件 IO——照抄即可。）

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/model-roles.test.js`
Expected: FAIL

- [ ] **Step 3: Implement**

`lib/index.js` 第 25 行：

```js
const MODEL_ROLES = ['continue', 'suggest', 'chat', 'mosaic']
```

并把上方注释里「Three roles exist」一段改为四角色说明（continue/suggest/chat/mosaic，mosaic 服务调查板的检查、问答与归并）。

- [ ] **Step 4: Run tests**

Run: `node --test tests/model-roles.test.js && npm test`
Expected: PASS。注意 `tests/client-render.test.js` 的 `apiFor().meta` stub 需要同步加 `mosaic` 角色（若该测试断言 roles 的键集合）。

- [ ] **Step 5: Commit**

```bash
git add lib/index.js tests/model-roles.test.js tests/client-render.test.js
git commit -m "mosaic joins continue, suggest and chat as a configurable role"
```

---

### Task 5: host 三个 LLM 路由（check / ask / merge）

**Files:**
- Modify: `lib/llm.js`（提示词构造与提案解析）
- Modify: `lib/index.js`（三个 route）
- Test: `tests/mosaic-llm.test.js`（新建）

**Interfaces:**
- Consumes: `selectionFor('mosaic')`、`callModelFull`、`mosaicDigest`、`normalizeMosaic`
- Produces: 路由 `POST /api/story.mosaic.check` `{ workspacePath, bookFolder, chapterId, text } -> { ok, proposal }`；`/api/story.mosaic.ask` `{ workspacePath, bookFolder, question } -> { ok, answer }`；`/api/story.mosaic.merge` `{ workspacePath, bookFolder } -> { ok, suggestions }`。`proposal = { id, sourceChapterId, evidence: [...], changes: [...] }`（evidence 为引句数组，每条 change 附 `evidenceIndex`）

- [ ] **Step 1: Write the failing tests**

```js
// tests/mosaic-llm.test.js
import test from 'node:test'
import assert from 'node:assert/strict'
import { buildMosaicCheckPrompt, parseMosaicProposal, buildMosaicAskPrompt, buildMosaicMergePrompt, parseMosaicMerge } from '../lib/llm.js'

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

test('merge suggestions parse into kind groups', () => {
  const raw = '```json\n{"suggestions":[{"into":"亲密度","from":["挚友","密友"]}]}\n```'
  assert.deepEqual(parseMosaicMerge(raw), [{ into: '亲密度', from: ['挚友', '密友'] }])
  assert.deepEqual(parseMosaicMerge('nope'), [])
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/mosaic-llm.test.js`
Expected: FAIL（函数未导出）

- [ ] **Step 3: Implement `lib/llm.js` 追加**

```js
const MOSAIC_CHECK_SYSTEM = ['你在维护一部小说的调查板：一张记录角色、设定与人物关系的图。',
  '对照给出的章节正文与当前调查板摘要，产出需要新增或修改的内容提案。',
  '只输出 JSON：{"evidence":["正文原句", ...],"changes":[...]}，每条 change 带 evidenceIndex 指向引句。',
  'change 的 op 只能是：entity.upsert（新角色/新设定卡，字段 kind/name/category/body/role/summary）、'
  + 'edge.upsert（关系，字段 from/to 为实体 id 或 {"newName":"…","kind":"character"} 引用新实体）、'
  + 'belief.add（某角色对某关系的认知，字段 edgeId/holderId/kind/note）、'
  + 'status.add 与 status.remove（角色状态标记，字段 entityId/label）、'
  + 'edge.retire（关系作废，字段 edgeId/reason）。',
  'kind 用中文自由词（如 挚友/监视/持有），不要发明枚举。没有值得记录的变化就返回空 changes。'].join('\n')

const MOSAIC_ASK_SYSTEM = ['你是小说调查板的问答助手，只依据给出的调查板当前状态回答。',
  '回答用中文，引用涉及的实体或关系时给出它们的名称；与调查板矛盾或调查板没有的信息要明说，不要编造。'].join('\n')

const MOSAIC_MERGE_SYSTEM = ['你在帮作者整理调查板里的关系词表。',
  '下面是全部关系 kind 的出现次数。把语义重复的词归并成组，只输出 JSON：'
  + '{"suggestions":[{"into":"合并后的词","from":["被合并的词", ...]}]}。没有可归并的就返回空数组。'].join('\n')

export function buildMosaicCheckPrompt({ digest, chapterTitle, text }) {
  return {
    system: MOSAIC_CHECK_SYSTEM,
    input: `【当前调查板】\n${digest || '（空）'}\n\n【章节】${chapterTitle}\n\n【正文】\n${text}`,
  }
}

export function buildMosaicAskPrompt({ digest, question }) {
  return { system: MOSAIC_ASK_SYSTEM, input: `【当前调查板】\n${digest || '（空）'}\n\n【问题】\n${question}` }
}

export function buildMosaicMergePrompt({ kinds }) {
  const table = Object.entries(kinds).map(([kind, count]) => `${kind} ×${count}`).join('\n')
  return { system: MOSAIC_MERGE_SYSTEM, input: table || '（空）' }
}

/** A proposal is all-or-nothing: an unparsable answer voids the whole batch. */
export function parseMosaicProposal(raw, sourceChapterId) {
  const body = stripJsonBlock(raw)
  if (body === null) return null
  try {
    const data = JSON.parse(body)
    if (!Array.isArray(data?.changes)) return null
    return {
      id: randomUUID(),
      sourceChapterId,
      evidence: Array.isArray(data.evidence) ? data.evidence.map((e) => String(e ?? '')) : [],
      changes: data.changes.filter((c) => c && typeof c === 'object'),
    }
  } catch { return null }
}

export function parseMosaicMerge(raw) {
  const body = stripJsonBlock(raw)
  if (body === null) return []
  try {
    const data = JSON.parse(body)
    return Array.isArray(data?.suggestions)
      ? data.suggestions.filter((s) => s && typeof s.into === 'string' && Array.isArray(s.from)) : []
  } catch { return [] }
}
```

（`stripJsonBlock` 定义在 `lib/index.js:798`，是导出函数；在 `llm.js` 中无法反向 import `index.js`（会循环依赖），所以把 `stripJsonBlock` 移入 `llm.js` 并从 `index.js` re-export：`lib/index.js` 里 `export { stripJsonBlock } from './llm.js'`，`parseStyleBlock` 等现有调用点不变。保持单一来源。）

- [ ] **Step 4: Implement host routes**（`lib/index.js`，放在 `/api/story.critique` 路由之后。三个路由共用一个读取 helper；`callModelFull`、`outputBudget`、`fail`、`json` 均为本文件已有名）

```js
  /** The board a mosaic route works on, read fresh so two calls never share stale state. */
  const mosaicOf = async (workspacePath, bookFolder) => {
    const { book } = await readBook(workspacePath, bookFolder)
    return { book, digest: mosaicDigest(book.mosaic) }
  }

  route('/api/story.mosaic.check', async (request) => {
    const { workspacePath, bookFolder, chapterId, text } = await payload(request)
    const { book, digest } = await mosaicOf(workspacePath, bookFolder)
    const chapter = book.chapters.find((row) => row.id === chapterId)
    const body = typeof text === 'string' && text.trim() !== '' ? text : (chapter === undefined ? '' : chapterFinalText(chapter))
    if (body.trim() === '') return fail('这一章还没有内容可以检查。')
    const prompt = buildMosaicCheckPrompt({ digest, chapterTitle: chapter?.title ?? '', text: body.slice(0, 20000) })
    const { text: raw, truncated } = await callModelFull(ctx, {
      selection: await selectionFor('mosaic'),
      system: prompt.system,
      input: prompt.input,
      maxTokens: outputBudget(body.length, 0.3, [900, 8000]),
      signal: request.signal,
    })
    const proposal = parseMosaicProposal(raw, chapterId)
    if (proposal === null) return fail(truncated ? '模型输出被截断，请重试。' : '模型没有返回可解析的提案，请重试。')
    return json({ ok: true, proposal, truncated })
  })

  route('/api/story.mosaic.ask', async (request) => {
    const { workspacePath, bookFolder, question } = await payload(request)
    const q = typeof question === 'string' ? question.trim() : ''
    if (q === '') return fail('先写下问题。')
    const { digest } = await mosaicOf(workspacePath, bookFolder)
    const prompt = buildMosaicAskPrompt({ digest, question: q })
    const { text: raw } = await callModelFull(ctx, {
      selection: await selectionFor('mosaic'),
      system: prompt.system,
      input: prompt.input,
      maxTokens: 1800,
      signal: request.signal,
    })
    return json({ ok: true, answer: raw.trim() })
  })

  route('/api/story.mosaic.merge', async (request) => {
    const { workspacePath, bookFolder } = await payload(request)
    const { book } = await readBook(workspacePath, bookFolder)
    const kinds = {}
    for (const edge of book.mosaic.edges) {
      if (edge.retired || edge.truth.kind === '') continue
      kinds[edge.truth.kind] = (kinds[edge.truth.kind] ?? 0) + 1
    }
    if (Object.keys(kinds).length < 2) return fail('关系词还太少，暂不需要归并。')
    const prompt = buildMosaicMergePrompt({ kinds })
    const { text: raw } = await callModelFull(ctx, {
      selection: await selectionFor('mosaic'),
      system: prompt.system,
      input: prompt.input,
      maxTokens: 1200,
      signal: request.signal,
    })
    return json({ ok: true, suggestions: parseMosaicMerge(raw) })
  })
```

import 行追加 `buildMosaicCheckPrompt, buildMosaicAskPrompt, buildMosaicMergePrompt, parseMosaicProposal, parseMosaicMerge`（自 `./llm.js`）与 `mosaicDigest`（自 `./mosaic.js`）。

- [ ] **Step 5: Run tests**

Run: `node --test tests/mosaic-llm.test.js && npm test`
Expected: PASS。wire-contract 的 ROUTES 若枚举路由需补 `mosaic.check` 等（点号路由键与现有测试的 `story.${route}` 拼接方式对齐，键写 `mosaic.check` 形式即可匹配）。

- [ ] **Step 6: Commit**

```bash
git add lib/llm.js lib/index.js tests/mosaic-llm.test.js tests/wire-contract.test.js
git commit -m "three mosaic routes: chapter check, board Q&A, kind merge"
```

---

### Task 6: 只读故事工具 `story_mosaic_query` 与 chat 背景上下文

**Files:**
- Modify: `lib/index.js`（`registerStoryTools` 内注册新工具；`describeStoryBlock` 注入 mosaic 摘要）
- Test: `tests/story-tools.test.js`（追加）

**Interfaces:**
- Consumes: `readBook`、`normalizeMosaic`、`mosaicDigest`
- Produces: 工具 `story_mosaic_query({ entity?, keyword? }) -> { entities: [...], edges: [...] }`（只读）；chat 系统上下文新增调查板摘要段

- [ ] **Step 1: Write the failing tests**（追加到 `tests/story-tools.test.js`，fixture 照抄同文件现有 story_read 用例的注册/执行方式）

```js
test('story_mosaic_query finds an entity by name and its edges', async () => {
  // 用现有 helper 写入一本带 mosaic 的书：张三—挚友—李四 + 一张「短刀」物品卡（持有边）。
  await writeBook(workspace, folder, {
    ...minimalBook,
    mosaic: { schemaVersion: 1,
      entities: [
        { id: 'a', kind: 'character', name: '张三', role: '', summary: '', statuses: [], tags: [] },
        { id: 'b', kind: 'character', name: '李四', role: '', summary: '', statuses: [], tags: [] },
        { id: 'c', kind: 'card', category: '物品', name: '短刀', body: '', tags: [] },
      ],
      edges: [
        { id: 'r1', from: 'a', to: 'b', truth: { kind: '挚友', note: '' }, beliefs: [], retired: false, log: [] },
        { id: 'r2', from: 'c', to: 'a', truth: { kind: '持有', note: '' }, beliefs: [], retired: false, log: [] },
      ] },
  })
  const result = await execTool('story_mosaic_query', { entity: '短刀' })
  assert.equal(result.entities.length, 1)
  assert.equal(result.entities[0].name, '短刀')
  assert.equal(result.edges.length, 1)
  assert.equal(result.edges[0].truth.kind, '持有')
})

test('story_mosaic_query searches card bodies by keyword and matches nothing cleanly', async () => {
  const result = await execTool('story_mosaic_query', { keyword: '仓库' })
  assert.ok(Array.isArray(result.entities))
  const none = await execTool('story_mosaic_query', {})
  assert.deepEqual(none, { entities: [], edges: [] })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/story-tools.test.js`
Expected: FAIL（工具未注册）

- [ ] **Step 3: Implement 工具注册**（`registerStoryTools` 内，`story_write_settings` 注册之后）

```js
    register({
      name: 'story_mosaic_query',
      description: 'Read-only query on the story board (Mosaic): relations between characters with the author-verified truth and what each character believes, plus setting cards. Pass entity (a name) to fetch one entity and every edge touching it, or keyword to search card bodies and names. The board is never modified through this tool.',
      parameters: {
        type: 'object',
        properties: {
          entity: { type: 'string' },
          keyword: { type: 'string' },
        },
        additionalProperties: false,
      },
      output: {
        schema: { type: 'object', properties: { entities: { type: 'array' }, edges: { type: 'array' } }, required: ['entities', 'edges'], additionalProperties: false },
        render: (_args, value) => textResult(`Mosaic query: ${value.entities.length} entities, ${value.edges.length} edges.`),
      },
      async execute(args, exec) {
        const { workspacePath, folder } = await resolveBookFolder(ctx, exec, args.book)
        const { book } = await readBook(workspacePath, folder)
        const mosaic = book.mosaic
        const wanted = mosaic.entities.filter((e) => {
          if (typeof args.entity === 'string' && args.entity !== '') return e.name === args.entity.trim()
          if (typeof args.keyword === 'string' && args.keyword !== '') {
            const k = args.keyword.trim()
            return e.name.includes(k) || (e.summary ?? '').includes(k) || (e.body ?? '').includes(k)
          }
          return false
        })
        if (wanted.length === 0) return { entities: [], edges: [] }
        const ids = new Set(wanted.map((e) => e.id))
        const edges = mosaic.edges.filter((e) => ids.has(e.from) || ids.has(e.to) || e.beliefs.some((b) => ids.has(b.holderId)))
        return { entities: wanted, edges }
      },
    })
```

- [ ] **Step 4: Implement chat 背景上下文**（`describeStoryBlock` 修改）

```js
function describeStoryBlock(raw) {
  const digest = describeStory(raw)
  if (digest === '') return ''
  const mosaic = mosaicDigest(normalizeBook(raw).mosaic)
  return [
    'This session is writing a novel. Current story state:',
    digest,
    '',
    mosaic === '' ? '' : ['Story board (Mosaic), one line per entity and live relation:', mosaic, ''].join('\n'),
    'Call story_read for the full manuscript. Call story_mosaic_query for board detail',
    '(a character\u2019s relations and beliefs, setting cards). When the user asks for characters,',
    'relationships or worldbuilding, propose changes through the board\u2019s own review flow;',
    'this conversation cannot modify the board directly.',
  ].filter((line) => line !== '').join('\n')
}
```

import 加 `normalizeBook`（已有）与 `mosaicDigest`（自 `./mosaic.js`）。

- [ ] **Step 5: Run tests**

Run: `node --test tests/story-tools.test.js && npm test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add lib/index.js tests/story-tools.test.js
git commit -m "story_mosaic_query: read-only board lookup; chat sees the board summary"
```

---

### Task 7: client 调查板 sheet 骨架（bottom sheet + 书签五页）

**Files:**
- Modify: `client.js`（样式、`ZH`/`EN` 字典、`MosaicSheet` 组件、`StoryPanel` 挂载点与 api）
- Test: `tests/client-render.test.js`（追加）、`tests/hygiene.test.js` 自动覆盖新类与键

**Interfaces:**
- Consumes: `api.meta()` 的 `roles.mosaic`（Task 4）
- Produces: 组件 `MosaicSheet({ book, api, workspacePath, bookFolder, roleModels, onClose, refreshBook })`；api 新增 `mosaicCheck/mosaicAsk/mosaicMerge`；面板某处按钮（`data-testid="mosaic-open"`）打开 sheet

- [ ] **Step 1: Write the failing render test**（追加到 `tests/client-render.test.js`，fixture 风格照抄现有用例）

```js
test('the mosaic sheet opens as a bottom sheet with five bookmarks', async () => {
  const view = await loadClientForRender({ api: apiFor(), book: book() })
  // 打开按钮：面板头部新增
  const open = view.container.querySelector('[data-testid="mosaic-open"]')
  assert.ok(open, 'the panel offers a way into the mosaic')
  open.click()
  await tick(view)
  assert.ok(findByClass(view, 'st-mosaic-sheet'), 'the sheet renders')
  // 右缘书签：关系网 / 梗概 / 世界观 / 角色 / 物品
  const tabs = [...view.container.querySelectorAll('.st-mosaic-tab')].map((n) => n.textContent)
  assert.deepEqual(tabs, ['关系网', '梗概', '世界观', '角色', '物品'])
  // 默认页是关系网
  assert.ok(findByClass(view, 'st-mosaic-canvas'))
})
```

（`tick` 用该文件现有的 effect 冲刷方式；若没有 helper，用 `await React.act(async () => {})` 的既有写法，照抄相邻用例。）

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/client-render.test.js`
Expected: FAIL（`mosaic-open` 不存在）

- [ ] **Step 3: Implement**

`client.js` 分四处落码（都跟随现有文件内的写法）：

1. **api 对象**（`critique` 条目之后）：

```js
      mosaicCheck: (workspacePath, bookFolder, chapterId, text) => post('/api/story.mosaic.check', { workspacePath, bookFolder, chapterId, text }),
      mosaicAsk: (workspacePath, bookFolder, question) => post('/api/story.mosaic.ask', { workspacePath, bookFolder, question }),
      mosaicMerge: (workspacePath, bookFolder) => post('/api/story.mosaic.merge', { workspacePath, bookFolder }),
```

2. **字典**（`ZH` 与 `EN` 各加，键一致）：

```js
  'mosaic.title': '调查板',
  'mosaic.open': '调查板',
  'mosaic.tab.relations': '关系网',
  'mosaic.tab.synopsis': '梗概',
  'mosaic.tab.world': '世界观',
  'mosaic.tab.cast': '角色',
  'mosaic.tab.items': '物品',
  'mosaic.close': '收起调查板',
```

（EN 侧给英文文案；`label.*` 命名惯例不适用时照现有键风格。）

3. **CSS**（`const CSS = \`` 模板内追加；全圆角类带 `corner-shape:round`，这是 hygiene 测试的现行规则）：

```css
      .st-mosaic-backdrop{position:absolute;inset:0;background:var(--dsw-alias-scrim,#00000066);display:flex;align-items:flex-end;z-index:40}
      .st-mosaic-sheet{flex:1;max-height:88%;background:var(--dsw-alias-bg-l1,#fff);border-radius:16px 16px 0 0;display:flex;overflow:hidden;position:relative}
      .st-mosaic-tabs{display:flex;flex-direction:column;gap:6px;padding:10px 6px;border-left:1px solid var(--dsw-alias-border-l2,#00000014)}
      .st-mosaic-tab{border:none;background:transparent;padding:8px 6px;border-radius:8px 0 0 8px;cursor:pointer;font-size:12px;writing-mode:vertical-rl;letter-spacing:2px;color:var(--dsw-alias-fg-l2,#666)}
      .st-mosaic-tab[data-active="true"]{background:var(--dsw-alias-bg-l3,#f5f5f5);color:var(--dsw-alias-fg-l1,#111);font-weight:600}
      .st-mosaic-body{flex:1;overflow:auto;padding:16px}
```

4. **组件与挂载**（`StoryPanel` 内新增状态，`return` 的根节点里挂 backdrop）：

```js
      const [mosaicOpen, setMosaicOpen] = React.useState(false)
```

面板头部放打开按钮（跟随现有头部按钮的写法）：

```js
        React.createElement('button', {
          'data-testid': 'mosaic-open', className: 'st-icon-btn',
          title: t('mosaic.open'), onClick: () => setMosaicOpen(true),
        }, '▦'),
```

组件本体（放在 `StoryPanel` 之前；v1 五页中梗概/世界观/角色/物品四页先渲染空容器，Task 9 填实）：

```js
    const MOSAIC_TABS = [
      ['relations', 'mosaic.tab.relations'],
      ['synopsis', 'mosaic.tab.synopsis'],
      ['world', 'mosaic.tab.world'],
      ['cast', 'mosaic.tab.cast'],
      ['items', 'mosaic.tab.items'],
    ]

    function MosaicSheet({ book, t, onClose }) {
      const [tab, setTab] = React.useState('relations')
      React.useEffect(() => {
        const onKey = (event) => { if (event.key === 'Escape') onClose() }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
      }, [onClose])
      return React.createElement('div', { className: 'st-mosaic-backdrop', onClick: onClose },
        React.createElement('section', { className: 'st-mosaic-sheet', onClick: (e) => e.stopPropagation() },
          React.createElement('div', { className: 'st-mosaic-body' },
            tab === 'relations' ? React.createElement('div', { className: 'st-mosaic-canvas' }) : null,
            tab === 'synopsis' ? null : null,
            tab === 'world' ? null : null,
            tab === 'cast' ? null : null,
            tab === 'items' ? null : null),
          React.createElement('nav', { className: 'st-mosaic-tabs' },
            MOSAIC_TABS.map(([key, label]) => React.createElement('button', {
              key, className: 'st-mosaic-tab', 'data-active': tab === key,
              onClick: () => setTab(key),
            }, t(label))))))
    }
```

挂载（`StoryPanel` return 的最外层容器内、与抽屉同级）：

```js
        mosaicOpen ? React.createElement(MosaicSheet, { book, t, onClose: () => setMosaicOpen(false) }) : null,
```

- [ ] **Step 4: Run tests**

Run: `node --test tests/client-render.test.js tests/hygiene.test.js && npm run lint`
Expected: PASS（hygiene 会抓漏掉 `corner-shape` 的全圆角规则与未翻译键，按其报错补齐）

- [ ] **Step 5: Commit**

```bash
git add client.js tests/client-render.test.js
git commit -m "mosaic bottom sheet with right-edge bookmarks; five pages scaffolded"
```

---

### Task 8: 关系网画布与实体/边详情

**Files:**
- Modify: `client.js`（画布渲染、布局拖拽、详情弹层；保存 layout 走 `api.save`）
- Test: `tests/client-render.test.js`（追加）

**Interfaces:**
- Consumes: `book.mosaic`（Task 3）、`api.save`
- Produces: 画布卡片（角色/卡片两种外观）、连线（SVG，active 边高亮）、点边/点卡弹详情（真相、beliefs、log；卡片正文）

- [ ] **Step 1: Write the failing render test**

```js
const mosaicBook = () => {
  const b = book()
  b.mosaic = {
    schemaVersion: 1,
    entities: [
      { id: 'a', kind: 'character', name: '张三', role: '主角', summary: '', statuses: [{ id: 's1', label: '受伤' }], tags: [], layout: { x: 20, y: 20 } },
      { id: 'b', kind: 'character', name: '李四', role: '', summary: '', statuses: [], tags: [], layout: { x: 200, y: 80 } },
      { id: 'c', kind: 'card', category: '物品', name: '短刀', body: '张三的刀', tags: [], layout: null },
    ],
    edges: [
      { id: 'r1', from: 'a', to: 'b', truth: { kind: '挚友', note: '结拜' }, beliefs: [{ holderId: 'b', kind: '陌路' }], retired: false, log: [] },
      { id: 'r2', from: 'c', to: 'a', truth: { kind: '持有', note: '' }, beliefs: [], retired: true, log: [{ at: 1, what: 'edge.retired', before: null, after: null }] },
    ],
  }
  return b
}

test('the relations canvas draws live edges and hides retired ones until shown', async () => {
  const view = await loadClientForRender({ api: apiFor({ load: mosaicBook() }), book: mosaicBook() })
  view.container.querySelector('[data-testid="mosaic-open"]').click()
  await tick(view)
  const cards = [...view.container.querySelectorAll('.st-mosaic-card')]
  assert.equal(cards.length, 3)
  assert.equal(view.container.querySelectorAll('.st-mosaic-edge').length, 1) // r2 retired → hidden
  // 点开一条边：真相与认知可见
  view.container.querySelector('.st-mosaic-edge').dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
  await tick(view)
  assert.ok(findByText(view, '挚友'))
  assert.ok(findByText(view, '陌路')) // belief
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/client-render.test.js`
Expected: FAIL

- [ ] **Step 3: Implement**（`MosaicSheet` 内展开 relations 页；布局为纯展示性拖拽——v1 不做拖拽编辑内容，只挪卡片位置并随书保存，与 spec 的非目标条款一致）

```js
    /** Default grid position for a card the writer has never moved. */
    const mosaicSlot = (index) => ({ x: 24 + (index % 4) * 190, y: 24 + Math.floor(index / 4) * 110 })

    function MosaicRelations({ mosaic, t, onMove, onPick }) {
      const live = mosaic.edges.filter((e) => !e.retired)
      const byId = new Map(mosaic.entities.map((e) => [e.id, e]))
      const pos = (entity, index) => entity.layout ?? mosaicSlot(index)
      return React.createElement('div', { className: 'st-mosaic-canvas' },
        React.createElement('svg', { className: 'st-mosaic-wires' },
          live.map((edge) => {
            const from = byId.get(edge.from)
            const to = byId.get(edge.to)
            if (from === undefined || to === undefined) return null
            return React.createElement('line', {
              key: edge.id, className: 'st-mosaic-edge', 'data-edge': edge.id,
              x1: pos(from, 0).x + 70, y1: pos(from, 0).y + 30,
              x2: pos(to, 0).x + 70, y2: pos(to, 0).y + 30,
              onClick: () => onPick({ kind: 'edge', edge }),
            })
          })),
        mosaic.entities.map((entity, index) => React.createElement('div', {
          key: entity.id,
          className: 'st-mosaic-card' + (entity.kind === 'character' ? ' st-mosaic-card-character' : ''),
          'data-testid': 'mosaic-card',
          style: { left: pos(entity, index).x, top: pos(entity, index).y },
          onClick: () => onPick({ kind: 'entity', entity }),
        },
          React.createElement('span', { className: 'st-mosaic-card-name' }, entity.name),
          entity.kind === 'character'
            ? React.createElement('span', { className: 'st-mosaic-card-sub' }, entity.role || t('mosaic.untitled'))
            : React.createElement('span', { className: 'st-mosaic-card-sub' }, entity.category))))
    }
```

布局拖拽（`MosaicSheet` 内，pointer 事件三分支 down/move/up，move 时写本地 offset，up 时 `onMove(entityId, {x, y})` 由面板层并入 book 后走现有保存队列）：

```js
      const dragRef = React.useRef(null)
      const onCardDown = (entity, event) => {
        dragRef.current = { id: entity.id, startX: event.clientX, startY: event.clientY, base: entity.layout ?? { x: 0, y: 0 } }
      }
      const onCanvasMove = (event) => {
        const drag = dragRef.current
        if (drag === null) return
        drag.dx = event.clientX - drag.startX
        drag.dy = event.clientY - drag.startY
        // 跟手渲染走 state；落盘只在 up 时发生一次。
      }
      const onCanvasUp = () => {
        const drag = dragRef.current
        dragRef.current = null
        if (drag === undefined || drag.dx === undefined) return
        onMove(drag.id, { x: Math.max(0, drag.base.x + drag.dx), y: Math.max(0, drag.base.y + drag.dy) })
      }
```

详情弹层（`st-mosaic-detail`）：实体显示 role/summary/statuses/tags（card 显示 category/body/tags）；边显示 truth.kind+note、每条 belief（holder 名 + kind）、log 列表、retired 徽标。数据纯展示，编辑入口在 Task 10。

CSS 追加：

```css
      .st-mosaic-canvas{position:relative;min-height:420px}
      .st-mosaic-wires{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
      .st-mosaic-edge{stroke:var(--dsw-alias-border-l4,#00000059);stroke-width:1.5;pointer-events:auto;cursor:pointer}
      .st-mosaic-card{position:absolute;width:140px;min-height:56px;padding:8px;border:1px solid var(--dsw-alias-border-l2,#00000014);border-radius:10px;background:var(--dsw-alias-bg-l2,#fafafa);cursor:grab;user-select:none}
      .st-mosaic-card-character{border-color:var(--dsw-alias-accent,#c8442a)}
      .st-mosaic-card-name{display:block;font-weight:600;font-size:13px}
      .st-mosaic-card-sub{display:block;font-size:11px;color:var(--dsw-alias-fg-l3,#999)}
      .st-mosaic-detail{position:absolute;right:16px;top:16px;width:280px;max-height:80%;overflow:auto;border:1px solid var(--dsw-alias-border-l2,#00000014);border-radius:12px;background:var(--dsw-alias-bg-l1,#fff);padding:12px}
```

- [ ] **Step 4: Run tests**

Run: `node --test tests/client-render.test.js && npm run lint`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add client.js tests/client-render.test.js
git commit -m "relations canvas: cards, live-edge wires, edge and entity detail"
```

---

### Task 9: 梗概 / 世界观 / 角色 / 物品四页

**Files:**
- Modify: `client.js`
- Test: `tests/client-render.test.js`（追加）

**Interfaces:**
- Consumes: 手稿树节点（梗概读 `node.summary`，v1 展示 + 手改，走现有保存队列；AI 生成接 Task 10 的 `overview` 既有路由，不新建）、`book.mosaic`

- [ ] **Step 1: Write the failing render test**

```js
test('the four static pages render from book data', async () => {
  const view = await loadClientForRender({ api: apiFor({ load: mosaicBook() }), book: mosaicBook() })
  view.container.querySelector('[data-testid="mosaic-open"]').click()
  await tick(view)
  const go = async (label) => {
    const tab = [...view.container.querySelectorAll('.st-mosaic-tab')].find((n) => n.textContent === label)
    tab.click()
    await tick(view)
  }
  await go('世界观')
  assert.ok(findByText(view, '短刀') === null) // 物品页才显示物品；世界观页显示非物品卡
  await go('角色')
  assert.ok(findByText(view, '张三'))
  assert.ok(findByText(view, '受伤')) // status chip
  await go('物品')
  assert.ok(findByText(view, '短刀'))
  assert.ok(findByText(view, '张三')) // 持有者来自 retired 的持有边也显示并标注已不持有? — retired 边不计入持有者
})
```

> 修正最后一行断言：retired 边不计入持有者，`findByText(view, '张三')` 在物品页的断言删除（物品卡无在世持有边时显示「无人持有」）。测试按此写。

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/client-render.test.js`
Expected: FAIL

- [ ] **Step 3: Implement**（四页都从 `book` 派生，无新路由；持有者计算：物品卡为 `from`、kind 为 `持有`、未 retired 的边指到的角色）

```js
    function MosaicSynopsis({ book, t, onSummary }) {
      const leaves = book.chapters ?? []
      return React.createElement('div', null,
        leaves.map((chapter) => React.createElement('div', { key: chapter.id, className: 'st-mosaic-row' },
          React.createElement('span', { className: 'st-mosaic-row-title' }, chapter.title),
          React.createElement('input', {
            className: 'st-mosaic-summary', value: chapter.summary ?? '',
            placeholder: t('mosaic.summaryPlaceholder'),
            onChange: (e) => onSummary(chapter.id, e.target.value),
          }))))
    }

    /** Card pages share one list; items additionally resolve holders through 持有 edges. */
    function MosaicCards({ mosaic, category, t }) {
      const cards = mosaic.entities.filter((e) => e.kind === 'card'
        && (category === undefined ? e.category !== '物品' : e.category === '物品'))
      const holdersOf = (cardId) => mosaic.edges
        .filter((edge) => !edge.retired && edge.from === cardId && edge.truth.kind === '持有')
        .map((edge) => mosaic.entities.find((e) => e.id === edge.to)?.name)
        .filter((name) => name !== undefined)
      return React.createElement('div', null,
        cards.length === 0 ? React.createElement('p', { className: 'st-mosaic-empty' }, t('mosaic.empty')) : null,
        cards.map((card) => React.createElement('article', { key: card.id, className: 'st-mosaic-page-card' },
          React.createElement('h4', null, card.name),
          category === '物品'
            ? React.createElement('p', null, holdersOf(card.id).join('、') || t('mosaic.noHolder'))
            : null,
          React.createElement('p', null, card.body))))
    }

    function MosaicCast({ mosaic }) {
      const cast = mosaic.entities.filter((e) => e.kind === 'character')
      return React.createElement('div', null,
        cast.map((c) => React.createElement('article', { key: c.id, className: 'st-mosaic-page-card' },
          React.createElement('h4', null, c.name),
          React.createElement('p', null, c.role),
          React.createElement('p', null, c.summary),
          React.createElement('div', { className: 'st-mosaic-chips' },
            (c.statuses ?? []).map((s) => React.createElement('span', { key: s.id, className: 'st-badge' }, s.label))))))
    }
```

`MosaicSheet` 的 body 分支接入四个组件；`onSummary` 由面板层传（`mapNode` 改 `summary` 后进现有保存队列，模式照抄现有 `onText`）。字典补 `mosaic.summaryPlaceholder`、`mosaic.empty`、`mosaic.noHolder`、`mosaic.untitled`。CSS 补 `st-mosaic-row`、`st-mosaic-page-card`、`st-mosaic-chips`、`st-mosaic-summary`。

- [ ] **Step 4: Run tests**

Run: `node --test tests/client-render.test.js && npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add client.js tests/client-render.test.js
git commit -m "synopsis, world, cast and item pages read straight off the book"
```

---

### Task 10: 提案审核 UI 与 AI 入口

**Files:**
- Modify: `client.js`（「检查本章」按钮、提案卡队列、逐条采纳/驳回/编辑采纳；问答入口；未配置模型置灰）
- Modify: `lib/index.js`（新增 `/api/story.mosaic.apply` 落盘采纳的 changes——复用 Task 2 纯函数）
- Test: `tests/client-render.test.js`（追加）、`tests/wire-contract.test.js`（ROUTES 补 `mosaic.apply`）

**Interfaces:**
- Consumes: Task 5 三路由、Task 2 `applyMosaicProposal`（host 侧经 `lib/index.js` import）
- Produces: `POST /api/story.mosaic.apply { workspacePath, bookFolder, changes } -> { ok, applied, skipped }`（服务端以当前书执行并写盘）；面板状态 `mosaicProposal`（内存，不落盘）

- [ ] **Step 1: Write the failing tests**

```js
// tests/client-render.test.js 追加
test('a fetched proposal renders one card per change and applies accepted ones', async () => {
  const api = apiFor({ load: mosaicBook() })
  api.mosaicCheck = async () => ({ ok: true, proposal: {
    id: 'pr1', sourceChapterId: 'c1', evidence: ['他按住伤口'],
    changes: [
      { op: 'status.add', entityId: 'a', label: '受伤', evidenceIndex: 0 },
      { op: 'entity.upsert', kind: 'card', category: '地点', name: '码头仓库', body: '', evidenceIndex: 0 },
    ] } })
  api.mosaicApply = async (_ws, _f, payload) => { calls.push(['apply', payload]); return { ok: true, applied: 1, skipped: 0 } }
  const view = await loadClientForRender({ api, book: mosaicBook() })
  view.container.querySelector('[data-testid="mosaic-open"]').click()
  await tick(view)
  const check = view.container.querySelector('[data-testid="mosaic-check"]')
  check.click()
  await tick(view)
  const cards = [...view.container.querySelectorAll('.st-mosaic-proposal')]
  assert.equal(cards.length, 2)
  // 采纳第一条、驳回第二条 → apply 只带一条
  cards[0].querySelector('[data-testid="proposal-accept"]').click()
  cards[1].querySelector('[data-testid="proposal-reject"]').click()
  await tick(view)
  const applyCall = api.calls.find(([name]) => name === 'apply')
  assert.ok(applyCall, 'accepted changes reach the host')
})
```

```js
// tests/mosaic.test.js 不动；host 侧 apply 由 wire-contract 与 store 回归覆盖
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/client-render.test.js`
Expected: FAIL

- [ ] **Step 3: Implement host route**（`/api/story.mosaic.merge` 之后）

```js
  route('/api/story.mosaic.apply', async (request) => {
    const { workspacePath, bookFolder, changes } = await payload(request)
    if (!Array.isArray(changes) || changes.length === 0) return fail('没有要应用的变更。')
    const { book, token } = await readBook(workspacePath, bookFolder)
    const { mosaic, applied, skipped } = applyMosaicProposal(book.mosaic, { changes })
    book.mosaic = mosaic
    await writeBook(workspacePath, book, token, bookFolder)
    return json({ ok: true, applied, skipped })
  })
```

import 加 `applyMosaicProposal`。`writeBook` 的真实签名为 `(workspacePath, book, expectedToken, folder)`（见 `lib/store.js:153`），如上调用。

- [ ] **Step 4: Implement client**（`MosaicSheet` relations 页头部：检查按钮 + 问答入口；`mosaicProposal` 状态存内存；逐条卡片三按钮）

关键行为：

- `roles.mosaic` 为空 → 检查/问答按钮 `disabled`，`title` 提示先去模型页配置（字典 `mosaic.modelMissing`）
- 检查：`api.mosaicCheck(ws, folder, currentChapterId, currentText)` → 存 `mosaicProposal`；提案区显示 evidence 引句与每条 change（op 中文名 + 前后值）；「编辑后采纳」= 卡片内 kind/name 的受控输入改值后 accept
- accept 收集为 `changes` 数组，一次 `api.mosaicApply`；随后 `refreshBook()` 重读、清空提案区
- 问答：输入框 + 发送 → `api.mosaicAsk` → 结果渲染在提案区下方（纯文本）
- 徽标：`mosaicProposal !== null` 时关系网书签加 `.st-mosaic-tab-badge` 显示 `changes.length`

字典补：`mosaic.check`（检查本章）、`mosaic.ask`（问这块板）、`mosaic.accept/reject/edit/apply/retry`、`mosaic.proposalTitle`、`mosaic.modelMissing`、`mosaic.applied`（`已应用 {applied} 条，跳过 {skipped} 条`）、各 op 中文名 `mosaic.op.entity.upsert` 等。

CSS 补 `.st-mosaic-proposal`、`.st-mosaic-proposal-evidence`、`.st-mosaic-tab-badge`。

- [ ] **Step 5: Run the full suite**

Run: `npm test && npm run lint`
Expected: 全 PASS；wire-contract 新路由两侧字段一致

- [ ] **Step 6: Commit**

```bash
git add client.js lib/index.js tests/client-render.test.js tests/wire-contract.test.js
git commit -m "proposal review flow: per-change cards, apply once, board repaints"
```

---

### Task 11: 收尾验证

**Files:**
- 无新改动（验证 + 可能的小修）

- [ ] **Step 1: 全量测试与 lint**

Run: `npm test && npm run lint`
Expected: 全 PASS，0 error

- [ ] **Step 2: 用真实书做一次手工冒烟**（有 DSH 环境时）

启动带本插件的 harness，打开现有书：调查板能开、五页可切、给 `mosaic` 配模型后「检查本章」出提案、采纳后 `book.json` 里 `mosaic.edges` 出现新边且 `log` 有记录、chat 问「李四知道什么」能看到 `story_mosaic_query` 调用。

- [ ] **Step 3: 对照 spec 逐条勾验**

`docs/superpowers/specs/2026-10-25-mosaic-wall-design.md` 的目标清单四条（角色/形式化关系、设定管理、提案更新、独立模型）逐条确认有实现与测试；非目标清单逐条确认未越界。

- [ ] **Step 4: Commit（若有小修）**

```bash
git add -A
git commit -m "mosaic board smoke fixes from the first live pass"
```
