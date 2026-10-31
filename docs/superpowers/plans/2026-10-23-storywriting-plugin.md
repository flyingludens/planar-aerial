# dsh 写故事插件 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 dsh Web GUI 里提供一个「写作」面板：段落级创作流水线（写 → AI 建议 → 采纳 → 并稿），附设定、人物关系、多版本快照与实时故事概览。

**Architecture:** 一个本地 bundle。Host 半（`lib/index.js` 等 Node ESM）读写工作区 `story/`、调用 `ctx.llm.stream` 生成建议与摘要，通过 `ctx.connection.fetch.register` 暴露 `/api/story.*` 精确路由。Client 半（单个 `client.js`，浏览器纯 JS + `React.createElement`）在 `main` 面板 key `story` 画三栏 UI，在 `sidebar.panellist` 注册同名 id 入口，用 `fetch` 调路由。

**Tech Stack:** Node ESM、Cordis plugin、React 18（`require('react')`）、`node:test`、零第三方依赖。

## Global Constraints

- 包名 `@local/dsh-plugin-storywriting`，`type: "module"`，`private: true`。
- Client 只允许 `require('react')`，不得 require 任何 Harness Client 包；不得使用 JSX/TS。
- **Client 是单文件**：模块加载器的同步 `require` 无法加载同包相对文件，`require.async` 是异步且要求 `client.*.js` 命名；因此纯逻辑内联在 `client.js`，并挂到插件对象 `__logic` 上供 Node 测试用 vm shim 取用。
- Host 纯逻辑按 ESM 模块拆分，用 `node --test` 直接测。
- 颜色只用 `--dsw-alias-*` 令牌；可见文案走 `ctx.locale.register`。
- 文件读写只允许落在 `<workspacePath>/story/` 内，路径必须绝对且做包含校验。
- `book.json` 是唯一权威；`chapters/*.md` 单向生成。

---

### Task 1: 包骨架与仓库

**Files:**
- Create: `.gitignore`、`package.json`、`cordis.patch.yml`

**Interfaces:**
- Consumes: 无
- Produces: 可安装的包结构

- [ ] **Step 1: 初始化 git 与目录**

```bash
git init && git config user.email >/dev/null 2>&1 || true
mkdir -p lib tests locale
```

- [ ] **Step 2: `.gitignore`**

```gitignore
node_modules/
story/
*.log
.DS_Store
```

- [ ] **Step 3: `package.json`**

```json
{
  "name": "@local/dsh-plugin-storywriting",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "Paragraph-level story writing panel for DeepSeek Harness",
  "exports": {
    ".": "./lib/index.js",
    "./client": "./client.js",
    "./locale/*.json": "./locale/*.json",
    "./icon": "./icon.svg",
    "./package.json": "./package.json"
  },
  "files": ["lib/**/*.js", "client.js", "cordis.patch.yml", "locale/*.json", "icon.svg"],
  "dsh": {
    "bundle": { "patch": "./cordis.patch.yml" },
    "client": { "platform": "web", "immediately": true, "inject": ["@deepseek-ai/dsh-client-ui-conversation"] }
  },
  "scripts": { "test": "node --test" }
}
```

- [ ] **Step 4: `cordis.patch.yml`**

```yaml
- insert:
    - id: storywriting
      name: '@local/dsh-plugin-storywriting'
```

- [ ] **Step 5: 提交**

```bash
git add -A && git commit -m "chore: scaffold storywriting bundle"
```

---

### Task 2: 书稿数据模型（Host ESM）

**Files:**
- Create: `lib/model.js`
- Test: `tests/model.test.js`

**Interfaces:**
- Consumes: 无
- Produces: `PARAGRAPH_STATUSES`、`createEmptyBook(title?)`、`normalizeBook(raw)`

- [ ] **Step 1: 写失败测试**

```js
// tests/model.test.js
import test from 'node:test'
import assert from 'node:assert/strict'
import { createEmptyBook, normalizeBook, PARAGRAPH_STATUSES } from '../lib/model.js'

test('empty book has required fields', () => {
  const b = createEmptyBook('雨夜')
  assert.equal(b.schemaVersion, 1)
  assert.equal(b.title, '雨夜')
  assert.deepEqual(b.chapters, [])
  assert.deepEqual(b.overview, { chapters: {} })
})

test('normalizeBook fills string defaults', () => {
  const b = normalizeBook({ title: 'T' })
  assert.equal(b.genre, ''); assert.equal(b.pov, ''); assert.equal(b.tense, '')
})

test('unknown paragraph status falls back to draft', () => {
  const b = normalizeBook({ chapters: [{ id: 'c1', title: 'A', status: 'writing', paragraphs: [{ id: 'p', text: 'x', status: 'weird' }] }] })
  assert.equal(b.chapters[0].paragraphs[0].status, 'draft')
})

test('statuses list is exact', () => {
  assert.deepEqual(PARAGRAPH_STATUSES, ['draft', 'pending', 'final'])
})
```

- [ ] **Step 2: 运行确认失败**

Run: `node --test tests/model.test.js` → FAIL module not found

- [ ] **Step 3: 实现 `lib/model.js`**

```js
export const PARAGRAPH_STATUSES = ['draft', 'pending', 'final']
export const CHAPTER_STATUSES = ['todo', 'writing', 'done']

const str = (v) => (typeof v === 'string' ? v : '')
const arr = (v) => (Array.isArray(v) ? v : [])
const pick = (v, allowed, fallback) => (allowed.includes(v) ? v : fallback)

function normalizeSuggestion(raw) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id: str(raw.id), baseText: str(raw.baseText), proposedText: str(raw.proposedText),
    note: str(raw.note), createdAt: Number.isFinite(raw.createdAt) ? raw.createdAt : 0,
    state: pick(raw.state, ['ready', 'accepted', 'rejected', 'stale'], 'ready'),
  }
}
function normalizeParagraph(raw) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id: str(raw.id), text: str(raw.text),
    status: pick(raw.status, PARAGRAPH_STATUSES, 'draft'),
    suggestions: arr(raw.suggestions).map(normalizeSuggestion).filter(Boolean),
    history: arr(raw.history).filter((h) => h && typeof h === 'object')
      .map((h) => ({ text: str(h.text), at: Number.isFinite(h.at) ? h.at : 0 })),
  }
}
function normalizeChapter(raw) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id: str(raw.id), title: str(raw.title),
    status: pick(raw.status, CHAPTER_STATUSES, 'todo'),
    paragraphs: arr(raw.paragraphs).map(normalizeParagraph).filter(Boolean),
  }
}

export function createEmptyBook(title = '') {
  return { schemaVersion: 1, title, genre: '', pov: '', tense: '',
    chapters: [], characters: [], relationships: [], settings: [], snapshots: [], overview: { chapters: {} } }
}

export function normalizeBook(raw) {
  const base = createEmptyBook()
  if (!raw || typeof raw !== 'object') return base
  return {
    schemaVersion: 1,
    title: str(raw.title), genre: str(raw.genre), pov: str(raw.pov), tense: str(raw.tense),
    chapters: arr(raw.chapters).map(normalizeChapter).filter(Boolean),
    characters: arr(raw.characters).filter((c) => c && typeof c === 'object').map((c) => ({
      id: str(c.id), name: str(c.name), aliases: arr(c.aliases).map(str),
      role: str(c.role), goal: str(c.goal), traits: arr(c.traits).map(str), notes: str(c.notes),
    })),
    relationships: arr(raw.relationships).filter((r) => r && typeof r === 'object')
      .map((r) => ({ id: str(r.id), fromId: str(r.fromId), toId: str(r.toId), kind: str(r.kind), note: str(r.note) })),
    settings: arr(raw.settings).filter((s) => s && typeof s === 'object')
      .map((s) => ({ id: str(s.id), title: str(s.title), body: str(s.body) })),
    snapshots: arr(raw.snapshots).filter((s) => s && typeof s === 'object')
      .map((s) => ({ id: str(s.id), at: Number.isFinite(s.at) ? s.at : 0, label: str(s.label),
        chapters: arr(s.chapters).map(normalizeChapter).filter(Boolean) })),
    overview: {
      ...(raw.overview && typeof raw.overview === 'object' && raw.overview.global
        ? { global: { text: str(raw.overview.global.text), basedOn: str(raw.overview.global.basedOn) } } : {}),
      chapters: Object.fromEntries(
        Object.entries(raw.overview && typeof raw.overview === 'object' ? raw.overview.chapters ?? {} : {})
          .filter(([, v]) => v && typeof v === 'object')
          .map(([k, v]) => [k, { text: str(v.text), basedOn: str(v.basedOn) }]),
      ),
    },
  }
}
```

- [ ] **Step 4: 运行确认通过** → `node --test tests/model.test.js` PASS 4

- [ ] **Step 5: 提交**

```bash
git add lib/model.js tests/model.test.js && git commit -m "feat: book data model"
```

---

### Task 3: 存储层（原子写 + 路径约束 + Markdown 镜像 + 快照）

**Files:**
- Create: `lib/store.js`
- Test: `tests/store.test.js`

**Interfaces:**
- Consumes: `./model.js`
- Produces: `assertSafeWorkspace`、`storyDir`、`readBook`、`writeBook`、`renderMarkdown`、`writeSnapshot`、`readSnapshot`

- [ ] **Step 1: 写失败测试**

```js
// tests/store.test.js
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createEmptyBook } from '../lib/model.js'
import { assertSafeWorkspace, renderMarkdown, readBook, writeBook, storyDir, writeSnapshot, readSnapshot } from '../lib/store.js'

const tempWorkspace = () => mkdtemp(join(tmpdir(), 'story-ws-'))

test('rejects relative workspace', () => {
  assert.throws(() => assertSafeWorkspace('rel/dir'), /absolute/)
  assert.throws(() => assertSafeWorkspace(''), /absolute/)
})

test('missing book returns empty with existed=false', async () => {
  const ws = await tempWorkspace()
  try { const out = await readBook(ws); assert.equal(out.existed, false); assert.equal(out.book.chapters.length, 0) }
  finally { await rm(ws, { recursive: true, force: true }) }
})

test('write then read round-trips', async () => {
  const ws = await tempWorkspace()
  try {
    const book = createEmptyBook('测试')
    book.chapters.push({ id: 'c1', title: '第一章', status: 'writing',
      paragraphs: [{ id: 'p1', text: '他推开门。', status: 'final', suggestions: [], history: [] }] })
    await writeBook(ws, book)
    const out = await readBook(ws)
    assert.equal(out.book.chapters[0].paragraphs[0].text, '他推开门。')
  } finally { await rm(ws, { recursive: true, force: true }) }
})

test('corrupt json is backed up then replaced', async () => {
  const ws = await tempWorkspace()
  try {
    await mkdir(storyDir(ws), { recursive: true })
    await writeFile(join(storyDir(ws), 'book.json'), '{ bad')
    const out = await readBook(ws)
    assert.equal(out.recovered, true)
    assert.equal(await readFile(join(storyDir(ws), 'book.json.bak'), 'utf8'), '{ bad')
  } finally { await rm(ws, { recursive: true, force: true }) }
})

test('markdown mirror has final paragraphs only', () => {
  const book = createEmptyBook()
  book.chapters.push({ id: 'c1', title: '雨夜', status: 'writing', paragraphs: [
    { id: 'p1', text: '已定稿一。', status: 'final', suggestions: [], history: [] },
    { id: 'p2', text: '草稿不出现。', status: 'draft', suggestions: [], history: [] }] })
  const md = renderMarkdown(book)
  assert.ok(md.includes('# 雨夜')); assert.ok(md.includes('已定稿一。')); assert.ok(!md.includes('草稿不出现'))
})

test('snapshot round-trips', async () => {
  const ws = await tempWorkspace()
  try {
    const snap = await writeSnapshot(ws, createEmptyBook('S'), '初稿')
    assert.equal((await readSnapshot(ws, snap.id)).label, '初稿')
  } finally { await rm(ws, { recursive: true, force: true }) }
})

test('snapshot id traversal is rejected', async () => {
  const ws = await tempWorkspace()
  try { await assert.rejects(() => readSnapshot(ws, '../../etc/passwd'), /invalid snapshot id/) }
  finally { await rm(ws, { recursive: true, force: true }) }
})
```

- [ ] **Step 2: 运行确认失败** → FAIL

- [ ] **Step 3: 实现 `lib/store.js`**

```js
import { mkdir, readFile, rename, writeFile, rm } from 'node:fs/promises'
import { isAbsolute, join, resolve, sep } from 'node:path'
import { randomUUID } from 'node:crypto'
import { createEmptyBook, normalizeBook } from './model.js'

export function assertSafeWorkspace(workspacePath) {
  if (typeof workspacePath !== 'string' || !isAbsolute(workspacePath)) throw new Error('workspacePath must be an absolute path')
}
export function storyDir(workspacePath) {
  assertSafeWorkspace(workspacePath)
  return join(workspacePath, 'story')
}
const bookPath = (ws) => join(storyDir(ws), 'book.json')

/** Any derived path must stay inside the story directory. */
function assertInside(dir, target) {
  if (!resolve(target).startsWith(resolve(dir) + sep)) throw new Error('path escapes the story directory')
}

/** Temp file in the same directory, then rename: readers see old or new, never partial. */
async function writeAtomic(target, text) {
  const tmp = join(resolve(target, '..'), `.tmp-${randomUUID()}`)
  await writeFile(tmp, text, 'utf8')
  try { await rename(tmp, target) } catch (error) { await rm(tmp, { force: true }); throw error }
}

export async function readBook(workspacePath) {
  const dir = storyDir(workspacePath)
  const file = bookPath(workspacePath)
  assertInside(dir, file)
  let text
  try { text = await readFile(file, 'utf8') }
  catch (error) { if (error?.code === 'ENOENT') return { book: createEmptyBook(), existed: false, recovered: false }; throw error }
  try { return { book: normalizeBook(JSON.parse(text)), existed: true, recovered: false } }
  catch {
    await mkdir(dir, { recursive: true })
    await writeFile(join(dir, 'book.json.bak'), text, 'utf8')
    const empty = createEmptyBook()
    await writeAtomic(file, JSON.stringify(empty, null, 2))
    return { book: empty, existed: true, recovered: true }
  }
}

export function renderMarkdown(book) {
  const lines = []
  if (book.title) lines.push(`# ${book.title}`, '')
  for (const chapter of book.chapters) {
    lines.push(`## ${chapter.title || '未命名章节'}`, '')
    for (const p of chapter.paragraphs) if (p.status === 'final') lines.push(p.text, '')
  }
  return lines.join('\n')
}

const mdName = (chapter, index) => {
  const safe = (chapter.title || 'chapter').replace(/[\\/:*?"<>|\s]+/g, '-').slice(0, 40)
  return `${String(index + 1).padStart(3, '0')}-${safe || 'chapter'}.md`
}

export async function writeBook(workspacePath, book) {
  const dir = storyDir(workspacePath)
  const chapterDir = join(dir, 'chapters')
  await mkdir(chapterDir, { recursive: true })
  const normalized = normalizeBook(book)
  const file = bookPath(workspacePath)
  assertInside(dir, file)
  await writeAtomic(file, JSON.stringify(normalized, null, 2))
  // The Markdown mirror is derived output only; never parsed back.
  let first = ''
  for (const [index, chapter] of normalized.chapters.entries()) {
    const name = mdName(chapter, index)
    const target = join(chapterDir, name)
    assertInside(dir, target)
    const body = [`## ${chapter.title || '未命名章节'}`, '', ...chapter.paragraphs.filter((p) => p.status === 'final').flatMap((p) => [p.text, '']), ''].join('\n')
    await writeAtomic(target, body)
    if (index === 0) first = target
  }
  return { savedAt: Date.now(), mdPath: first }
}

export async function writeSnapshot(workspacePath, book, label) {
  const dir = storyDir(workspacePath)
  const snapDir = join(dir, 'snapshots')
  await mkdir(snapDir, { recursive: true })
  const at = Date.now()
  const id = new Date(at).toISOString().replace(/[:.]/g, '-')
  const target = join(snapDir, `${id}.json`)
  assertInside(dir, target)
  await writeAtomic(target, JSON.stringify({ id, at, label: label || '快照', chapters: normalizeBook(book).chapters }, null, 2))
  return { id, path: target }
}

export async function readSnapshot(workspacePath, id) {
  const dir = storyDir(workspacePath)
  if (typeof id !== 'string' || !/^[0-9A-Za-z-]+$/.test(id)) throw new Error('invalid snapshot id')
  const target = join(dir, 'snapshots', `${id}.json`)
  assertInside(dir, target)
  try { return JSON.parse(await readFile(target, 'utf8')) }
  catch (error) { if (error?.code === 'ENOENT') return null; throw error }
}
```

- [ ] **Step 4: 运行确认通过** → `node --test tests/store.test.js` PASS 7

- [ ] **Step 5: 提交**

```bash
git add lib/store.js tests/store.test.js && git commit -m "feat: atomic storage with markdown mirror and snapshots"
```

---

### Task 4: 概览装配（事实层 + 哈希失效 + 预算）

**Files:**
- Create: `lib/overview.js`
- Test: `tests/overview.test.js`

**Interfaces:**
- Consumes: `Book` 形状
- Produces: `hashText`、`chapterFinalText`、`wholeFinalText`、`buildFacts(book, chapterId, paragraphId?)`、`staleEntries(book)`、`assembleContext(book, chapterId, budget, paragraphId?)`

- [ ] **Step 1: 写失败测试**

```js
// tests/overview.test.js
import test from 'node:test'
import assert from 'node:assert/strict'
import { createEmptyBook } from '../lib/model.js'
import { assembleContext, buildFacts, chapterFinalText, hashText, staleEntries, wholeFinalText } from '../lib/overview.js'

function sampleBook() {
  const b = createEmptyBook('雨夜')
  b.chapters.push({ id: 'c1', title: '第一章', status: 'writing', paragraphs: [
    { id: 'p1', text: '前一段。', status: 'final', suggestions: [], history: [] },
    { id: 'p2', text: '当前段。', status: 'draft', suggestions: [], history: [] },
    { id: 'p3', text: '后一段。', status: 'final', suggestions: [], history: [] }] })
  b.chapters.push({ id: 'c2', title: '第二章', status: 'todo', paragraphs: [] })
  b.characters.push({ id: 'r1', name: '林', aliases: ['小林'], role: '摄影师', goal: '', traits: [], notes: '' })
  b.relationships.push({ id: 'rel1', fromId: 'r1', toId: 'r1', kind: '自省', note: '' })
  b.settings.push({ id: 's1', title: '时代', body: '民国' })
  return b
}

test('hashText stable, differs', () => {
  assert.equal(hashText('abc'), hashText('abc')); assert.notEqual(hashText('abc'), hashText('abd'))
})
test('chapterFinalText joins finals only', () => {
  assert.equal(chapterFinalText(sampleBook().chapters[0]), '前一段。\n\n后一段。')
})
test('wholeFinalText joins chapters', () => {
  assert.equal(wholeFinalText(sampleBook()), '前一段。\n\n后一段。')
})
test('buildFacts neighbors around the current paragraph', () => {
  const f = buildFacts(sampleBook(), 'c1', 'p2')
  assert.equal(f.neighbors.before, '前一段。'); assert.equal(f.neighbors.after, '后一段。')
})
test('buildFacts keeps a character named in the chapter and drops one that is absent', () => {
  const book = createEmptyBook('T')
  book.chapters.push({ id: 'c1', title: '甲', status: 'writing', paragraphs: [
    { id: 'p1', text: '林推开门，雨很大。', status: 'final', suggestions: [], history: [] }] })
  book.characters.push({ id: 'r1', name: '林', aliases: ['小林'], role: '摄影师', goal: '', traits: [], notes: '' })
  book.characters.push({ id: 'r2', name: '周', aliases: [], role: '医生', goal: '', traits: [], notes: '' })
  const f = buildFacts(book, 'c1', 'p1')
  assert.deepEqual(f.characters.map((c) => c.name), ['林'])
})
test('staleEntries flags missing and changed, skips empty chapters', () => {
  const book = sampleBook()
  const stale = staleEntries(book)
  assert.ok(stale.includes('global')); assert.ok(stale.includes('c1')); assert.ok(!stale.includes('c2'))
})
test('fresh entries are not stale', () => {
  const book = sampleBook()
  const h = hashText('前一段。\n\n后一段。')
  book.overview.global = { text: 'g', basedOn: h }; book.overview.chapters.c1 = { text: 'c', basedOn: h }
  assert.ok(!staleEntries(book).includes('c1'))
})
test('assembleContext keeps neighbors under tight budget', () => {
  const book = sampleBook()
  book.overview.global = { text: '全书'.repeat(300), basedOn: hashText('前一段。\n\n后一段。') }
  const out = assembleContext(book, 'c1', 200)
  assert.ok(out.text.includes('前一段。')); assert.ok(out.text.includes('后一段。'))
  assert.ok(Array.isArray(out.sections))
})

test('assembleContext with paragraphId uses adjacent paragraphs, not chapter ends', () => {
  const book = createEmptyBook('T')
  book.chapters.push({ id: 'c1', title: '甲', status: 'writing', paragraphs: [
    { id: 'a', text: '第一段定稿。', status: 'final', suggestions: [], history: [] },
    { id: 'b', text: '第二段定稿。', status: 'final', suggestions: [], history: [] },
    { id: 'cur', text: '正在改的这段。', status: 'draft', suggestions: [], history: [] }] })
  const out = assembleContext(book, 'c1', 2000, 'cur')
  assert.ok(out.text.includes('第二段定稿。'))
  assert.ok(!out.text.includes('第一段定稿。'))
})

test('assembleContext keeps ONLY neighbors when budget is tight, never a lower-priority section', () => {
  const one = createEmptyBook('T')
  one.chapters.push({ id: 'c1', title: '甲', status: 'writing', paragraphs: [
    { id: 'b', text: '上一段。', status: 'final', suggestions: [], history: [] },
    { id: 'cur', text: '正在写。', status: 'draft', suggestions: [], history: [] }] })
  one.overview.chapters.c1 = { text: '很长的本章摘要'.repeat(200), basedOn: 'x' }
  const out1 = assembleContext(one, 'c1', 10, 'cur')
  assert.deepEqual(out1.sections, ['before'])

  const zero = createEmptyBook('T')
  zero.chapters.push({ id: 'c1', title: '甲', status: 'writing', paragraphs: [
    { id: 'cur', text: '第一句草稿。', status: 'draft', suggestions: [], history: [] }] })
  zero.overview.chapters.c1 = { text: '很长的本章摘要'.repeat(200), basedOn: 'x' }
  const out0 = assembleContext(zero, 'c1', 10, 'cur')
  assert.deepEqual(out0.sections, ['chapter'])
})
```

- [ ] **Step 2: 运行确认失败** → FAIL

- [ ] **Step 3: 实现 `lib/overview.js`**

```js
import { createHash } from 'node:crypto'

export function hashText(text) {
  return createHash('sha256').update(text ?? '', 'utf8').digest('hex')
}
export function chapterFinalText(chapter) {
  return chapter.paragraphs.filter((p) => p.status === 'final').map((p) => p.text).join('\n\n')
}
export function wholeFinalText(book) {
  return book.chapters.map(chapterFinalText).filter(Boolean).join('\n\n')
}

export function buildFacts(book, chapterId, paragraphId) {
  const chapter = book.chapters.find((c) => c.id === chapterId)
  const finals = chapter ? chapter.paragraphs.filter((p) => p.status === 'final') : []
  const index = chapter && paragraphId !== undefined ? chapter.paragraphs.findIndex((p) => p.id === paragraphId) : -1
  let before
  let after
  if (index >= 0) {
    before = [...chapter.paragraphs.slice(0, index)].reverse().find((p) => p.status === 'final')
    after = chapter.paragraphs.slice(index + 1).find((p) => p.status === 'final')
  } else {
    // No current paragraph (e.g. a chapter-level summary): anchor to the chapter's first and last final paragraphs.
    before = finals[0]
    after = finals.length > 1 ? finals[finals.length - 1] : undefined
  }
  const finalsCount = book.chapters.reduce((n, c) => n + c.paragraphs.filter((p) => p.status === 'final').length, 0)
  const total = book.chapters.reduce((n, c) => n + c.paragraphs.length, 0)
  // Only characters that appear in this chapter; a full cast dilutes the prompt. The only
  // fallback is an EMPTY chapter (nothing written yet), where the full roster is better than none.
  const scope = chapter ? chapter.paragraphs.map((p) => p.text).join('') : ''
  const matched = book.characters.filter((c) => [c.name, ...c.aliases].some((n) => n && scope.includes(n)))
  const characters = scope === '' ? book.characters : matched
  const ids = new Set(characters.map((c) => c.id))
  return {
    title: book.title, genre: book.genre, pov: book.pov, tense: book.tense,
    progress: { chapters: book.chapters.length, finals: finalsCount, total },
    characters: characters.map((c) => ({ id: c.id, name: c.name, role: c.role })),
    relationships: book.relationships.filter((r) => ids.has(r.fromId) && ids.has(r.toId)),
    settings: book.settings.map((s) => ({ id: s.id, title: s.title })),
    neighbors: { before: before?.text ?? '', after: after?.text ?? '' },
  }
}

export function staleEntries(book) {
  const stale = []
  const globalText = wholeFinalText(book)
  const globalHash = hashText(globalText)
  if (globalText !== '' && (!book.overview.global || book.overview.global.basedOn !== globalHash)) stale.push('global')
  for (const chapter of book.chapters) {
    const text = chapterFinalText(chapter)
    if (text === '') continue
    const cached = book.overview.chapters[chapter.id]
    if (!cached || cached.basedOn !== hashText(text)) stale.push(chapter.id)
  }
  return stale
}

export function assembleContext(book, chapterId, budget = 2000, paragraphId) {
  // paragraphId picks the paragraphs adjacent to the one being edited; without it
  // (e.g. a chapter-level summary) buildFacts falls back to the chapter ends.
  const facts = buildFacts(book, chapterId, paragraphId)
  const chapter = book.chapters.find((c) => c.id === chapterId)
  const sections = []
  if (facts.neighbors.before) sections.push({ key: 'before', text: `前一段：${facts.neighbors.before}` })
  if (facts.neighbors.after) sections.push({ key: 'after', text: `后一段：${facts.neighbors.after}` })
  const cs = chapter ? book.overview.chapters[chapter.id] : undefined
  if (cs?.text) sections.push({ key: 'chapter', text: `本章梗概：${cs.text}` })
  if (book.overview.global?.text) sections.push({ key: 'global', text: `全书梗概：${book.overview.global.text}` })
  if (facts.characters.length) sections.push({ key: 'characters', text: `本章人物：${facts.characters.map((c) => `${c.name}(${c.role || '角色'})`).join('、')}` })
  if (facts.relationships.length) {
    const byId = new Map(book.characters.map((c) => [c.id, c.name]))
    sections.push({ key: 'relationships', text: `关系：${facts.relationships.map((r) => `${byId.get(r.fromId) ?? '?'}→${byId.get(r.toId) ?? '?'}(${r.kind})`).join('、')}` })
  }
  const others = book.chapters.filter((c) => c.id !== chapterId && book.overview.chapters[c.id]?.text)
  if (others.length) sections.push({ key: 'others', text: `其他章：${others.map((c) => `${c.title}——${book.overview.chapters[c.id].text}`).join('；')}` })
  if (facts.settings.length) sections.push({ key: 'settings', text: `设定：${facts.settings.map((s) => s.title).join('、')}` })
  // Array order is priority order. Never drop the continuity anchors (before/after neighbors),
  // and never drop the single highest-priority section: leaving the model with no overview at all
  // is worse than a slightly over-budget summary. Everything else yields, lowest priority first.
  const kept = [...sections]
  const size = () => kept.reduce((n, s) => n + s.text.length, 0)
  const pinned = new Set(kept.filter((s) => s.key === 'before' || s.key === 'after'))
  if (kept.length > 0) pinned.add(kept[0])
  while (size() > budget) {
    let dropAt = -1
    for (let i = kept.length - 1; i >= 0; i -= 1) {
      if (!pinned.has(kept[i])) { dropAt = i; break }
    }
    if (dropAt < 0) break
    kept.splice(dropAt, 1)
  }
  return { text: kept.map((s) => s.text).join('\n'), injectedChars: size(), sections: kept.map((s) => s.key), facts }
}
```

- [ ] **Step 4: 运行确认通过** → PASS 7

- [ ] **Step 5: 提交**

```bash
git add lib/overview.js tests/overview.test.js && git commit -m "feat: overview assembly with hash invalidation and budget"
```

---

### Task 5: Host 半：LLM 文本处理（纯函数）

**Files:**
- Create: `lib/llm.js`
- Test: `tests/llm.test.js`

**Interfaces:**
- Consumes: 无
- Produces: `buildSuggestPrompt`、`buildOverviewPrompt`、`extractText`、`cleanModelText`、`parseSuggestion`

- [ ] **Step 1: 写失败测试**

```js
// tests/llm.test.js
import test from 'node:test'
import assert from 'node:assert/strict'
import { buildOverviewPrompt, buildSuggestPrompt, cleanModelText, extractText, parseSuggestion } from '../lib/llm.js'

test('suggest prompt carries text, instruction, context', () => {
  const p = buildSuggestPrompt({ text: '雨下得很大。', instruction: '更紧凑', context: '前一段：他站着。' })
  assert.ok(p.system.length > 0)
  assert.ok(p.input.includes('雨下得很大。')); assert.ok(p.input.includes('更紧凑')); assert.ok(p.input.includes('前一段'))
})
test('overview prompt differs by kind', () => {
  assert.ok(buildOverviewPrompt({ kind: 'chapter', title: '一', text: 'x' }).system.includes('章'))
  assert.ok(buildOverviewPrompt({ kind: 'global', title: '书', text: 'y' }).system.includes('整本'))
})
test('extractText joins text blocks', () => {
  assert.equal(extractText([{ type: 'text', text: 'a' }, { type: 'text', text: 'b' }]), 'ab')
})
test('cleanModelText strips fences and labels', () => {
  assert.equal(cleanModelText('```\n句子\n```'), '句子')
  assert.equal(cleanModelText('改写：新的句子。'), '新的句子。')
})
test('parseSuggestion keeps baseText and ready state', () => {
  const s = parseSuggestion('改写后的句子', '原句')
  assert.equal(s.baseText, '原句'); assert.equal(s.proposedText, '改写后的句子'); assert.equal(s.state, 'ready'); assert.ok(s.id.length > 0)
})
```

- [ ] **Step 2: 运行确认失败** → FAIL

- [ ] **Step 3: 实现 `lib/llm.js`**

```js
import { randomUUID } from 'node:crypto'

const SUGGEST_SYSTEM = ['你是小说编辑。用户给你一段正文，请给出改写建议。',
  '要求：保持原意与叙事视角，只改进字句、节奏与画面感。',
  '只输出改写后的正文本身，不要解释、不要列表、不要引号、不要 Markdown 代码块。', '长度与原文接近。'].join('\n')
const OVERVIEW_CHAPTER_SYSTEM = ['你在为一部长篇小说维护摘要。',
  '根据给出的章节正文，用 2 到 3 句中文写清这一章发生了什么、人物处境有何变化。', '只输出摘要本身，不要标题、不要解释。'].join('\n')
const OVERVIEW_GLOBAL_SYSTEM = ['你在为一部长篇小说维护摘要。',
  '根据给出的全书正文，用一句话中文概括整本书的核心处境与走向。', '只输出这一句话，不要解释。'].join('\n')

export function buildSuggestPrompt({ text, instruction, context }) {
  const parts = []
  if (context) parts.push(`【上下文】\n${context}`)
  parts.push(`【原文】\n${text}`)
  if (instruction) parts.push(`【本次要求】\n${instruction}`)
  return { system: SUGGEST_SYSTEM, input: parts.join('\n\n') }
}
export function buildOverviewPrompt({ kind, title, text }) {
  return {
    system: kind === 'global' ? OVERVIEW_GLOBAL_SYSTEM : OVERVIEW_CHAPTER_SYSTEM,
    input: `【${kind === 'global' ? '书名' : '章节'}】${title}\n\n【正文】\n${text}`,
  }
}
export function extractText(blocks) {
  return blocks.filter((b) => b.type === 'text').map((b) => b.text).join('')
}
export function cleanModelText(raw) {
  let text = String(raw ?? '').trim()
  const fenced = /^```[a-zA-Z]*\n([\s\S]*?)\n```$/.exec(text)
  if (fenced) text = fenced[1].trim()
  text = text.replace(/^(改写|修改后|建议)[：:]\s*/, '')
  return text.replace(/^["“]([\s\S]*)["”]$/, '$1').trim()
}
export function parseSuggestion(raw, baseText) {
  return { id: randomUUID(), baseText, proposedText: cleanModelText(raw), note: '', createdAt: Date.now(), state: 'ready' }
}
```

- [ ] **Step 4: 运行确认通过** → PASS 5

- [ ] **Step 5: 提交**

```bash
git add lib/llm.js tests/llm.test.js && git commit -m "feat: prompt builders and model-output cleaning"
```

---

### Task 6: Host 路由（load/save/suggest/overview/snapshot/restore）

**Files:**
- Create: `lib/index.js`

**Interfaces:**
- Consumes: `./llm.js`、`./model.js`、`./overview.js`、`./store.js`
- Produces: `apply`、`inject = ['connection','llm']`

- [ ] **Step 1: 实现 `lib/index.js`**

```js
import { buildOverviewPrompt, buildSuggestPrompt, parseSuggestion } from './llm.js'
import { normalizeBook } from './model.js'
import { assembleContext, chapterFinalText, hashText, staleEntries, wholeFinalText } from './overview.js'
import { readBook, readSnapshot, writeBook, writeSnapshot } from './store.js'

export const name = 'storywriting'
export const inject = ['connection', 'llm']

const json = (value, status = 200) => Promise.resolve(Response.json(value, { status, headers: { 'cache-control': 'no-store' } }))
const fail = (message, status = 200) => json({ ok: false, error: String(message) }, status)

/** One streamed model call assembled into plain text; a non-stop finish rejects. */
async function callModel(ctx, { system, input, maxTokens = 2048, signal }) {
  const selection = ctx.get('agentDefaultModel')?.currentSelection?.()
  if (!selection) throw new Error('no default model selection is available')
  const messages = [{ role: 'user', content: [{ type: 'text', text: input }] }]
  let text = ''
  let finish
  for await (const chunk of ctx.llm.stream({
    provider: selection.provider,
    model: selection.model,
    ...(selection.reasoningEffort === undefined ? {} : { reasoningEffort: selection.reasoningEffort }),
    maxTokens, system, messages,
    ...(signal === undefined ? {} : { signal }),
  })) {
    if (chunk.type === 'text-delta') text += chunk.text
    else if (chunk.type === 'finish') finish = chunk.reason
  }
  if (finish && finish.kind !== 'stop' && finish.kind !== 'tool-calls') throw new Error(`model call failed: ${finish.failure?.code ?? finish.kind}`)
  return text
}

export function apply(ctx) {
  const route = (path, methods, handler) => ctx.effect(
    () => ctx.connection.fetch.register({ path, methods, requestBody: 'buffered', fetch: (request) => handler(request) }),
    `storywriting: ${path}`,
  )
  const payload = async (request) => { try { return await request.json() } catch { throw new Error('body is not JSON') } }

  route('/api/story.load', ['POST'], async (request) => {
    try { const { workspacePath } = await payload(request); const r = await readBook(workspacePath)
      return json({ ok: true, book: r.book, existed: r.existed, recovered: r.recovered }) }
    catch (error) { return fail(error.message) }
  })

  route('/api/story.save', ['POST'], async (request) => {
    try { const { workspacePath, book } = await payload(request); return json({ ok: true, ...(await writeBook(workspacePath, normalizeBook(book))) }) }
    catch (error) { return fail(error.message) }
  })

  route('/api/story.suggest', ['POST'], async (request) => {
    try {
      const { workspacePath, chapterId, paragraphId, text, instruction } = await payload(request)
      const { book } = await readBook(workspacePath)
      const { text: context } = assembleContext(book, chapterId, 2000, paragraphId)
      const raw = await callModel(ctx, { ...buildSuggestPrompt({ text, instruction, context }), signal: request.signal })
      return json({ ok: true, suggestion: parseSuggestion(raw, text), overviewChars: context.length })
    } catch (error) { return fail(error.message) }
  })

  route('/api/story.overview', ['POST'], async (request) => {
    try {
      const { workspacePath, refresh } = await payload(request)
      const { book } = await readBook(workspacePath)
      const stale = refresh === true ? ['global', ...book.chapters.map((c) => c.id)] : staleEntries(book)
      let changed = false
      if (stale.includes('global')) {
        const text = wholeFinalText(book)
        if (text !== '') { book.overview.global = { text: (await callModel(ctx, { ...buildOverviewPrompt({ kind: 'global', title: book.title, text }), maxTokens: 256, signal: request.signal })).trim(), basedOn: hashText(text) }; changed = true }
      }
      for (const chapter of book.chapters) {
        if (!stale.includes(chapter.id)) continue
        const text = chapterFinalText(chapter)
        if (text === '') continue
        book.overview.chapters[chapter.id] = { text: (await callModel(ctx, { ...buildOverviewPrompt({ kind: 'chapter', title: chapter.title, text }), maxTokens: 400, signal: request.signal })).trim(), basedOn: hashText(text) }
        changed = true
      }
      if (changed) await writeBook(workspacePath, book)
      return json({ ok: true, overview: book.overview, refreshed: changed ? stale : [] })
    } catch (error) { return fail(error.message) }
  })

  route('/api/story.snapshot', ['POST'], async (request) => {
    try { const { workspacePath, label } = await payload(request); const { book } = await readBook(workspacePath)
      return json({ ok: true, ...(await writeSnapshot(workspacePath, book, label)) }) }
    catch (error) { return fail(error.message) }
  })

  route('/api/story.restore', ['POST'], async (request) => {
    try {
      const { workspacePath, id } = await payload(request)
      const snapshot = await readSnapshot(workspacePath, id)
      if (snapshot === null) return fail('snapshot not found')
      const { book } = await readBook(workspacePath)
      // Snapshot the current state first, so a rollback is itself undoable.
      await writeSnapshot(workspacePath, book, '回滚前自动备份')
      const next = normalizeBook({ ...book, chapters: snapshot.chapters })
      await writeBook(workspacePath, next)
      return json({ ok: true, book: next })
    } catch (error) { return fail(error.message) }
  })
}
```

- [ ] **Step 2: 语法与全量测试**

Run: `node --check lib/index.js && node --test`
Expected: 无语法错误，Task 2–5 全部 PASS

- [ ] **Step 3: 提交**

```bash
git add lib/index.js && git commit -m "feat: host routes for story operations"
```

---

### Task 7: Client 纯逻辑（内联，供 vm shim 测试）

**Files:**
- Create: `tests/helpers/load-client.mjs`
- Test: `tests/client-logic.test.js`
- Create: `client.js`（本任务先只放逻辑与空壳 apply）

**Interfaces:**
- Consumes: 无
- Produces: `client.js` 的插件对象带 `__logic = { diffWords, newParagraph, canAccept, acceptSuggestion, rejectSuggestion, markStale }`

- [ ] **Step 1: 写 vm shim 助手**

```js
// tests/helpers/load-client.mjs
// The client bundle is a classic script for the browser loader. Install a stub
// window.__ModuleLoader__ on the host global, evaluate the bundle, and return the
// plugin object's __logic. The bundle runs in the HOST realm instead of a vm
// context: a vm context gives its object literals the context's own prototypes,
// so assert.deepEqual rejects values that look identical but differ only by realm.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const globalObject = globalThis

export function loadClientLogic() {
  const captured = []
  const stubReact = {
    createElement: () => null,
    useState: (v) => [v, () => {}],
    useEffect: () => {},
    useMemo: (fn) => fn(),
    Fragment: 'Fragment',
  }
  const hadWindow = Object.prototype.hasOwnProperty.call(globalObject, 'window')
  const previousWindow = globalObject.window
  globalObject.window = { __ModuleLoader__: { load: (entry) => captured.push(entry) } }
  try {
    // Indirect eval keeps the code in the host realm; the bundle ignores its
    // return value and only touches window.__ModuleLoader__.load.
    ;(0, eval)(readFileSync(join(here, '..', '..', 'client.js'), 'utf8'))
  } finally {
    if (hadWindow) globalObject.window = previousWindow
    else delete globalObject.window
  }
  const entry = captured[0]
  if (!entry) throw new Error('client.js did not call window.__ModuleLoader__.load')
  const plugin = entry.factory((name) => {
    if (name === 'react') return stubReact
    throw new Error(`unexpected require(${JSON.stringify(name)})`)
  })
  if (!plugin.__logic) throw new Error('plugin object is missing __logic')
  return plugin.__logic
}
```

- [ ] **Step 2: 写失败测试**

```js
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
test('canAccept requires ready state and matching base', () => {
  assert.equal(logic.canAccept({ state: 'ready', baseText: 'x' }, 'x'), true)
  assert.equal(logic.canAccept({ state: 'ready', baseText: 'x' }, 'y'), false)
  assert.equal(logic.canAccept({ state: 'stale', baseText: 'x' }, 'x'), false)
})
test('acceptSuggestion copies text, pushes history, marks final', () => {
  const p = { id: 'p', text: '原文。', status: 'pending', history: [], suggestions: [{ id: 's', baseText: '原文。', proposedText: '新文。', state: 'ready', note: '', createdAt: 1 }] }
  const next = logic.acceptSuggestion(p, 's')
  assert.equal(next.text, '新文。'); assert.equal(next.status, 'final'); assert.equal(next.history[0].text, '原文。'); assert.equal(next.suggestions[0].state, 'accepted')
})
test('acceptSuggestion refuses stale base', () => {
  const p = { id: 'p', text: '改过了。', status: 'pending', history: [], suggestions: [{ id: 's', baseText: '原文。', proposedText: '新文。', state: 'ready', note: '', createdAt: 1 }] }
  assert.equal(logic.acceptSuggestion(p, 's').text, '改过了。')
})
test('rejectSuggestion keeps text and marks rejected', () => {
  const p = { id: 'p', text: '原文。', status: 'pending', history: [], suggestions: [{ id: 's', baseText: '原文。', proposedText: '新文。', state: 'ready', note: '', createdAt: 1 }] }
  const next = logic.rejectSuggestion(p, 's')
  assert.equal(next.text, '原文。'); assert.equal(next.suggestions[0].state, 'rejected')
})
test('markStale flags drifted ready suggestions', () => {
  const p = { id: 'p', text: '改过了。', status: 'pending', history: [], suggestions: [{ id: 's', baseText: '原文。', proposedText: '新文。', state: 'ready', note: '', createdAt: 1 }] }
  assert.equal(logic.markStale(p).suggestions[0].state, 'stale')
})
test('markStale returns same object when nothing drifted', () => {
  const p = { id: 'p', text: '原文。', status: 'pending', history: [], suggestions: [{ id: 's', baseText: '原文。', proposedText: '新文。', state: 'ready', note: '', createdAt: 1 }] }
  assert.equal(logic.markStale(p), p)
})
```

- [ ] **Step 3: 运行确认失败**

Run: `node --test tests/client-logic.test.js` → FAIL（文件或 `__logic` 不存在）

- [ ] **Step 4: 实现 `client.js` 的逻辑层与空壳**

```js
window.__ModuleLoader__.load({
  id: '@local/dsh-plugin-storywriting',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    // ---- pure logic (also exposed as __logic for Node tests) ----
    function diffWords(before, after) {
      const a = Array.from(before ?? '')
      const b = Array.from(after ?? '')
      const n = a.length, m = b.length
      if (n === 0) return m === 0 ? [] : [{ type: 'add', text: b.join('') }]
      if (m === 0) return [{ type: 'del', text: a.join('') }]
      const lcs = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1))
      for (let i = n - 1; i >= 0; i -= 1)
        for (let j = m - 1; j >= 0; j -= 1)
          lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1])
      const raw = []
      let i = 0, j = 0
      while (i < n && j < m) {
        if (a[i] === b[j]) { raw.push({ type: 'same', text: a[i] }); i += 1; j += 1 }
        else if (lcs[i + 1][j] >= lcs[i][j + 1]) { raw.push({ type: 'del', text: a[i] }); i += 1 }
        else { raw.push({ type: 'add', text: b[j] }); j += 1 }
      }
      for (; i < n; i += 1) raw.push({ type: 'del', text: a[i] })
      for (; j < m; j += 1) raw.push({ type: 'add', text: b[j] })
      const merged = []
      for (const seg of raw) {
        const last = merged[merged.length - 1]
        if (last && last.type === seg.type) last.text += seg.text
        else merged.push({ ...seg })
      }
      return merged
    }
    const newParagraph = () => ({ id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, text: '', status: 'draft', suggestions: [], history: [] })
    const canAccept = (s, currentText) => Boolean(s) && s.state === 'ready' && s.baseText === currentText
    function acceptSuggestion(paragraph, suggestionId) {
      const s = paragraph.suggestions.find((x) => x.id === suggestionId)
      if (!canAccept(s, paragraph.text)) return paragraph
      return { ...paragraph, text: s.proposedText, status: 'final',
        history: [...paragraph.history, { text: paragraph.text, at: Date.now() }],
        suggestions: paragraph.suggestions.map((x) => (x.id === suggestionId ? { ...x, state: 'accepted' } : x)) }
    }
    function rejectSuggestion(paragraph, suggestionId) {
      return { ...paragraph, suggestions: paragraph.suggestions.map((x) => (x.id === suggestionId ? { ...x, state: 'rejected' } : x)) }
    }
    function markStale(paragraph) {
      const suggestions = paragraph.suggestions.map((s) => (s.state === 'ready' && s.baseText !== paragraph.text ? { ...s, state: 'stale' } : s))
      return suggestions.some((s, i) => s !== paragraph.suggestions[i]) ? { ...paragraph, suggestions } : paragraph
    }

    // ---- api calls ----
    async function post(path, body) {
      const response = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      if (!response.ok) throw new Error(`${path} failed: HTTP ${response.status}`)
      const data = await response.json()
      if (data.ok !== true) throw new Error(data.error || `${path} failed`)
      return data
    }
    const api = {
      load: (workspacePath) => post('/api/story.load', { workspacePath }),
      save: (workspacePath, book) => post('/api/story.save', { workspacePath, book }),
      suggest: (workspacePath, chapterId, paragraphId, text, instruction) => post('/api/story.suggest', { workspacePath, chapterId, paragraphId, text, instruction }),
      overview: (workspacePath, refresh) => post('/api/story.overview', { workspacePath, refresh }),
      snapshot: (workspacePath, label) => post('/api/story.snapshot', { workspacePath, label }),
      restore: (workspacePath, id) => post('/api/story.restore', { workspacePath, id }),
    }

    const NS = 'storywriting'
    // Runtime dictionaries live inline: the loader does not deliver /locale/*.json
    // to the browser bundle (those files only feed Plugin Manager meta), and the
    // synchronous require cannot read a sibling file. Task 8 adds the same strings
    // to locale/*.json for the panel's title/description.
    const ZH = {
      panel: '写故事',
      'tab.chapters': '目录', 'tab.settings': '设定', 'tab.characters': '人物', 'tab.versions': '版本', 'tab.overview': '概览',
      'status.draft': '写作中', 'status.pending': '待定', 'status.final': '已定稿',
      'action.askAi': '请 AI 改', 'action.accept': '采纳', 'action.retry': '再改', 'action.reject': '放弃',
      'action.write': '写下一段', 'action.finalize': '定稿', 'action.revert': '退回待定',
      'action.snapshot': '存快照', 'action.restore': '回滚', 'action.refresh': '刷新',
      'label.newChapter': '新建章节', 'label.newCharacter': '新建人物', 'label.newSetting': '新建设定',
      'label.instruction': '这次想怎么改（可留空）', 'label.stale': '原文已变，需重新生成',
      'label.noWorkspace': '请先在左侧选择一个工作区，故事会保存在该工作区的 story 目录。',
      'label.emptyChapters': '还没有章节，先新建一章。',
      'label.loading': '正在读取…',
      'label.recovered': 'book.json 损坏，已备份为 book.json.bak 并重建空稿。',
      'label.overviewGlobal': '全书', 'label.overviewProgress': '章节 {c} · 定稿段 {f}/{t} · 人物 {p}',
    }
    const EN = {
      panel: 'Story',
      'tab.chapters': 'Chapters', 'tab.settings': 'Settings', 'tab.characters': 'Characters', 'tab.versions': 'Versions', 'tab.overview': 'Overview',
      'status.draft': 'Draft', 'status.pending': 'Pending', 'status.final': 'Final',
      'action.askAi': 'Ask AI', 'action.accept': 'Accept', 'action.retry': 'Retry', 'action.reject': 'Discard',
      'action.write': 'Write next paragraph', 'action.finalize': 'Finalize', 'action.revert': 'Back to pending',
      'action.snapshot': 'Snapshot', 'action.restore': 'Restore', 'action.refresh': 'Refresh',
      'label.newChapter': 'New chapter', 'label.newCharacter': 'New character', 'label.newSetting': 'New setting',
      'label.instruction': 'How should it change? (optional)', 'label.stale': 'Text changed; regenerate this suggestion',
      'label.noWorkspace': 'Select a workspace on the left first; stories are saved under its story directory.',
      'label.emptyChapters': 'No chapters yet. Create one to start.',
      'label.loading': 'Loading…',
      'label.recovered': 'book.json was damaged; it was backed up as book.json.bak and replaced with an empty draft.',
      'label.overviewGlobal': 'Whole book', 'label.overviewProgress': 'Chapters {c} · Final paragraphs {f}/{t} · Characters {p}',
    }
    function PanelIcon(props) {
      const size = props?.size ?? 16
      return h('svg', { viewBox: '0 0 64 64', width: size, height: size, 'aria-hidden': true, fill: 'none', stroke: 'currentColor', strokeWidth: 5 },
        h('rect', { x: 8, y: 10, width: 48, height: 44, rx: 6 }),
        h('path', { d: 'M20 24h24M20 34h24M20 44h14', strokeLinecap: 'round' }))
    }

    return {
      inject: ['slots', 'locale', 'connection', 'workspaces'],
      __logic: { diffWords, newParagraph, canAccept, acceptSuggestion, rejectSuggestion, markStale },
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { zh: ZH, en: EN }), 'storywriting: dictionaries')
        const t = ctx.locale.bind(NS)
        ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: 'story', locale: NS, inject: () => ({ t, api }) }, StoryPanel))
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: 'story', order: 20, locale: NS, label: () => t('panel') }, PanelIcon))
      },
    }

    function StoryPanel() { return h('div', null, 'story') }
  },
})
```

- [ ] **Step 5: 运行确认通过** → `node --test tests/client-logic.test.js` PASS 8

- [ ] **Step 6: 提交**

```bash
git add client.js tests/helpers/load-client.mjs tests/client-logic.test.js && git commit -m "feat: client pure logic with vm-shim tests"
```

---

### Task 8: Client 三栏 UI 与段落流

**Files:**
- Modify: `client.js`（替换 `StoryPanel` 空壳，加组件与样式）
- Create: `locale/zh.json`、`locale/en.json`、`icon.svg`

**Interfaces:**
- Consumes: `__logic` 的函数、`api`
- Produces: 可编辑三栏界面

- [ ] **Step 1: `locale/zh.json` 与 `locale/en.json`**

`locale/zh.json`：

```json
{
  "meta": { "title": "写故事", "description": "段落式写作台：边写边让 AI 提建议，附带设定、人物关系、多版本与全书概览。" },
  "panel": "写故事",
  "tab.chapters": "目录", "tab.settings": "设定", "tab.characters": "人物", "tab.versions": "版本", "tab.overview": "概览",
  "status.draft": "写作中", "status.pending": "待定", "status.final": "已定稿",
  "action.askAi": "请 AI 改", "action.accept": "采纳", "action.retry": "再改", "action.reject": "放弃",
  "action.write": "写下一段", "action.finalize": "定稿", "action.revert": "退回待定",
  "action.snapshot": "存快照", "action.restore": "回滚", "action.refresh": "刷新",
  "label.newChapter": "新建章节", "label.newCharacter": "新建人物", "label.newSetting": "新建设定",
  "label.instruction": "这次想怎么改（可留空）",
  "label.stale": "原文已变，需重新生成",
  "label.noWorkspace": "请先在左侧选择一个工作区，故事会保存在该工作区的 story 目录。",
  "label.emptyChapters": "还没有章节，先新建一章。",
  "label.loading": "正在读取…",
  "label.recovered": "book.json 损坏，已备份为 book.json.bak 并重建空稿。",
  "label.overviewGlobal": "全书", "label.overviewProgress": "章节 {c} · 定稿段 {f}/{t} · 人物 {p}"
}
```

`locale/en.json`：

```json
{
  "meta": { "title": "Story Writing", "description": "A paragraph-level writing desk: draft, get AI rewrites, accept them, with settings, characters, versions and a live overview." },
  "panel": "Story",
  "tab.chapters": "Chapters", "tab.settings": "Settings", "tab.characters": "Characters", "tab.versions": "Versions", "tab.overview": "Overview",
  "status.draft": "Draft", "status.pending": "Pending", "status.final": "Final",
  "action.askAi": "Ask AI", "action.accept": "Accept", "action.retry": "Retry", "action.reject": "Discard",
  "action.write": "Write next paragraph", "action.finalize": "Finalize", "action.revert": "Back to pending",
  "action.snapshot": "Snapshot", "action.restore": "Restore", "action.refresh": "Refresh",
  "label.newChapter": "New chapter", "label.newCharacter": "New character", "label.newSetting": "New setting",
  "label.instruction": "How should it change? (optional)",
  "label.stale": "Text changed; regenerate this suggestion",
  "label.noWorkspace": "Select a workspace on the left first; stories are saved under its story directory.",
  "label.emptyChapters": "No chapters yet. Create one to start.",
  "label.loading": "Loading…",
  "label.recovered": "book.json was damaged; it was backed up as book.json.bak and replaced with an empty draft.",
  "label.overviewGlobal": "Whole book", "label.overviewProgress": "Chapters {c} · Final paragraphs {f}/{t} · Characters {p}"
}
```

- [ ] **Step 2: `icon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="8" y="10" width="48" height="44" rx="6" fill="none" stroke="currentColor" stroke-width="4"/>
  <path d="M20 24h24M20 34h24M20 44h14" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 3: 替换 `StoryPanel` 空壳为完整界面**

把 Task 7 末尾的 `function StoryPanel() { return h('div', null, 'story') }` 换成下列内容（组件函数在同一次 `factory` 调用内、`return { ... }` 之前定义即可，JS 函数声明会提升）：

```js
    const CSS = `
      .st-root{display:flex;height:100%;min-height:0;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary)}
      .st-col{display:flex;flex-direction:column;min-height:0}
      .st-left{width:240px;flex:none;border-right:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1)}
      .st-mid{flex:1;min-width:0}
      .st-right{width:360px;flex:none;border-left:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1)}
      .st-tabs{display:flex;gap:4px;padding:8px;border-bottom:1px solid var(--dsw-alias-border-l1);flex-wrap:wrap}
      .st-tab{padding:4px 10px;font-size:12px;border-radius:6px;border:1px solid transparent;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}
      .st-tab[aria-selected="true"]{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l1)}
      .st-scroll{overflow:auto;padding:12px;min-height:0}
      .st-chapter{padding:8px;border-radius:6px;cursor:pointer;display:flex;justify-content:space-between;gap:8px;font-size:13px}
      .st-chapter:hover,.st-chapter[aria-current="true"]{background:var(--dsw-alias-bg-layer-2)}
      .st-card{border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:10px;margin-bottom:10px;background:var(--dsw-alias-bg-layer-1)}
      .st-card[data-status="pending"]{border-color:var(--dsw-alias-state-warn-primary)}
      .st-card[data-status="final"]{border-color:var(--dsw-alias-state-success-primary)}
      .st-badge{font-size:11px;padding:1px 6px;border-radius:999px;border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary)}
      .st-badge[data-status="pending"]{color:var(--dsw-alias-state-warn-primary);border-color:var(--dsw-alias-state-warn-primary)}
      .st-badge[data-status="final"]{color:var(--dsw-alias-state-success-primary);border-color:var(--dsw-alias-state-success-primary)}
      .st-editor{width:100%;min-height:88px;resize:vertical;background:transparent;color:inherit;border:none;outline:none;font:inherit;line-height:1.7}
      .st-input{width:100%;box-sizing:border-box;background:transparent;color:inherit;border:1px solid var(--dsw-alias-border-l1);border-radius:6px;padding:4px 6px;font:inherit;outline:none}
      .st-btn{font-size:12px;padding:4px 10px;border-radius:6px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);cursor:pointer}
      .st-btn:disabled{opacity:.45;cursor:not-allowed}
      .st-btn-primary{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}
      .st-row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
      .st-muted{color:var(--dsw-alias-label-secondary);font-size:12px}
      .st-diff{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;line-height:1.7;white-space:pre-wrap;word-break:break-word}
      .st-add{background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 20%,transparent)}
      .st-del{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 20%,transparent);text-decoration:line-through}
      .st-warn{padding:8px 12px;font-size:12px;color:var(--dsw-alias-state-warn-primary);border-bottom:1px solid var(--dsw-alias-border-l1)}
    `

    function StoryPanel(props) {
      const { t, api, useWorkspaces } = props
      React.useEffect(() => {
        // One style element per mount; unmount removes it via the effect cleanup.
        const style = document.createElement('style')
        style.textContent = CSS
        document.head.appendChild(style)
        return () => style.remove()
      }, [])
      const workspaces = useWorkspaces((snapshot) => snapshot)
      const items = workspaces?.items ?? []
      const [workspacePath, setWorkspacePath] = React.useState('')
      React.useEffect(() => { if (!workspacePath && items.length > 0) setWorkspacePath(items[0].path) }, [items, workspacePath])
      const [state, setState] = React.useState({ status: 'idle', book: null, error: '', recovered: false })
      const [tab, setTab] = React.useState('chapters')
      const [chapterId, setChapterId] = React.useState('')
      const [selected, setSelected] = React.useState('')

      React.useEffect(() => {
        if (!workspacePath) { setState({ status: 'idle', book: null, error: '', recovered: false }); return undefined }
        let cancelled = false
        setState({ status: 'loading', book: null, error: '', recovered: false })
        api.load(workspacePath)
          .then((data) => { if (!cancelled) { setState({ status: 'ready', book: data.book, error: '', recovered: data.recovered }); setChapterId(data.book.chapters[0]?.id ?? '') } })
          .catch((error) => { if (!cancelled) setState({ status: 'error', book: null, error: error.message, recovered: false }) })
        return () => { cancelled = true }
      }, [workspacePath])

      const book = state.book
      const updateBook = (next) => {
        setState((prev) => ({ ...prev, book: next }))
        api.save(workspacePath, next).catch((error) => console.error('[storywriting]', error.message))
      }
      const chapter = book?.chapters.find((c) => c.id === chapterId) ?? book?.chapters[0]
      const patchChapter = (mutate) => updateBook({ ...book, chapters: book.chapters.map((c) => (c.id === chapter.id ? mutate(c) : c)) })
      const patchParagraph = (id, mutate) => patchChapter((c) => ({ ...c, paragraphs: c.paragraphs.map((p) => (p.id === id ? mutate(p) : p)) }))

      const addChapter = () => {
        const next = { id: `c-${Date.now()}`, title: `第${book.chapters.length + 1}章`, status: 'writing', paragraphs: [] }
        updateBook({ ...book, chapters: [...book.chapters, next] })
        setChapterId(next.id)
      }
      const addParagraph = () => {
        const p = newParagraph()
        patchChapter((c) => ({ ...c, paragraphs: [...c.paragraphs, p] }))
        setSelected(p.id)
      }
      const askAi = async (paragraph, instruction) => {
        try {
          const data = await api.suggest(workspacePath, chapter.id, paragraph.id, paragraph.text, instruction ?? '')
          patchParagraph(paragraph.id, (p) => ({ ...p, status: 'pending', suggestions: [...p.suggestions, data.suggestion] }))
          setSelected(paragraph.id)
        } catch (error) { console.error('[storywriting]', error.message) }
      }

      const tabs = h('div', { className: 'st-tabs' },
        ['chapters', 'settings', 'characters', 'versions', 'overview'].map((key) =>
          h('button', { key, type: 'button', className: 'st-tab', role: 'tab', 'aria-selected': tab === key ? 'true' : 'false', onClick: () => setTab(key) }, t(`tab.${key}`))))

      const leftPane = () => {
        if (tab === 'chapters') {
          return h('div', null,
            h('button', { type: 'button', className: 'st-btn', style: { marginBottom: 10 }, onClick: addChapter }, t('label.newChapter')),
            (book?.chapters ?? []).map((c) => h('div', { key: c.id, className: 'st-chapter', role: 'button', 'aria-current': c.id === chapter?.id ? 'true' : 'false', onClick: () => setChapterId(c.id) },
              h('span', null, c.title),
              h('span', { className: 'st-muted' }, `${c.paragraphs.filter((p) => p.status === 'final').length}/${c.paragraphs.length}`))))
        }
        if (tab === 'settings') return h(SettingsPage, { t, book, updateBook })
        if (tab === 'characters') return h(CharactersPage, { t, book, updateBook })
        if (tab === 'versions') return h(VersionsPage, { t, book, workspacePath, api, onReload: (b) => { setState((p) => ({ ...p, book: b })) } })
        return h(OverviewPage, { t, book, workspacePath, api, onReload: (b) => { setState((p) => ({ ...p, book: b })) } })
      }

      const middle = () => {
        if (!workspacePath) return h('div', { className: 'st-warn' }, t('label.noWorkspace'))
        if (state.status === 'loading') return h('div', { className: 'st-scroll st-muted' }, t('label.loading'))
        if (state.status === 'error') return h('div', { className: 'st-warn' }, state.error)
        if (!book) return null
        const para = chapter?.paragraphs ?? []
        return h('div', { className: 'st-scroll' },
          state.recovered ? h('div', { className: 'st-warn' }, t('label.recovered')) : null,
          chapter ? h(React.Fragment, null,
            h('div', { className: 'st-row', style: { marginBottom: 10 } },
              h('strong', null, chapter.title),
              h('span', { className: 'st-muted' }, `${para.length}`),
              h('span', { style: { flex: 1 } }),
              h('button', { type: 'button', className: 'st-btn', onClick: addParagraph }, t('action.write'))),
            para.length === 0 ? h('div', { className: 'st-muted' }, t('label.emptyChapters')) : null,
            para.map((p) => h(ParagraphCard, {
              key: p.id, t, paragraph: p, active: selected === p.id,
              onSelect: () => setSelected(p.id),
              onChange: (text) => patchParagraph(p.id, (x) => markStale({ ...x, text })),
              onAsk: () => askAi(p), onFinalize: () => patchParagraph(p.id, (x) => ({ ...x, status: 'final' })),
              onRevert: () => patchParagraph(p.id, (x) => ({ ...x, status: 'pending' })),
            })))
            : h('div', { className: 'st-muted' }, t('label.emptyChapters')))
      }

      const right = () => {
        const p = chapter?.paragraphs.find((x) => x.id === selected)
        return h(SuggestionPane, {
          t, paragraph: p,
          onAccept: (sid) => patchParagraph(p.id, (x) => acceptSuggestion(x, sid)),
          onReject: (sid) => patchParagraph(p.id, (x) => rejectSuggestion(x, sid)),
          onRetry: (instruction) => askAi(p, instruction),
        })
      }

      return h('div', { className: 'st-root' },
        h('div', { className: 'st-col st-left' }, tabs, h('div', { className: 'st-scroll' }, leftPane())),
        h('div', { className: 'st-col st-mid' }, middle()),
        h('div', { className: 'st-col st-right' }, right()))
    }

    function ParagraphCard({ t, paragraph, active, onSelect, onChange, onAsk, onFinalize, onRevert }) {
      return h('div', { className: 'st-card', 'data-status': paragraph.status, 'aria-current': active ? 'true' : 'false', onClick: onSelect },
        h('div', { className: 'st-row', style: { marginBottom: 6 } },
          h('span', { className: 'st-badge', 'data-status': paragraph.status }, t(`status.${paragraph.status}`)),
          paragraph.suggestions.some((s) => s.state === 'ready') ? h('span', { className: 'st-muted' }, '●') : null,
          h('span', { style: { flex: 1 } }),
          h('button', { type: 'button', className: 'st-btn', onClick: (e) => { e.stopPropagation(); onAsk() } }, t('action.askAi')),
          paragraph.status === 'final'
            ? h('button', { type: 'button', className: 'st-btn', onClick: (e) => { e.stopPropagation(); onRevert() } }, t('action.revert'))
            : h('button', { type: 'button', className: 'st-btn st-btn-primary', onClick: (e) => { e.stopPropagation(); onFinalize() } }, t('action.finalize'))),
        h('textarea', { className: 'st-editor', value: paragraph.text, onChange: (e) => onChange(e.target.value), onClick: (e) => e.stopPropagation() }))
    }

    function SuggestionPane({ t, paragraph, onAccept, onReject, onRetry }) {
      const [instruction, setInstruction] = React.useState('')
      if (!paragraph) return h('div', { className: 'st-scroll st-muted' }, t('tab.chapters'))
      const ready = [...paragraph.suggestions].reverse().find((s) => s.state === 'ready' || s.state === 'stale')
      return h('div', { className: 'st-scroll' },
        h('div', { className: 'st-muted', style: { marginBottom: 8 } }, paragraph.text.slice(0, 40) || '—'),
        ready ? h(React.Fragment, null,
          h('div', { className: 'st-diff' }, diffWords(ready.baseText, ready.proposedText).map((seg, i) =>
            h('span', { key: i, className: seg.type === 'add' ? 'st-add' : seg.type === 'del' ? 'st-del' : undefined }, seg.text))),
          ready.state === 'stale' ? h('div', { className: 'st-warn' }, t('label.stale')) : null,
          h('div', { className: 'st-row', style: { marginTop: 10 } },
            h('button', { type: 'button', className: 'st-btn st-btn-primary', disabled: !canAccept(ready, paragraph.text), onClick: () => onAccept(ready.id) }, t('action.accept')),
            h('button', { type: 'button', className: 'st-btn', onClick: () => onReject(ready.id) }, t('action.reject'))),
          h('input', { className: 'st-input', style: { marginTop: 10 }, placeholder: t('label.instruction'), value: instruction, onChange: (e) => setInstruction(e.target.value) }),
          h('button', { type: 'button', className: 'st-btn', style: { marginTop: 6 }, onClick: () => { onRetry(instruction); setInstruction('') } }, t('action.retry')))
          : h('div', { className: 'st-muted' }, t('action.askAi')))
    }
```

- [ ] **Step 4: 语法检查 + 回归测试**

Run: `node --check client.js && node --test`
Expected: 无语法错误，全部 PASS（vm shim 仍能取到 `__logic`）

- [ ] **Step 5: 提交**

```bash
git add client.js locale icon.svg && git commit -m "feat: three-column story UI with paragraph flow and diff review"
```

---

### Task 9: 设定 / 人物 / 版本 / 概览页

**Files:**
- Modify: `client.js`（追加四个页面组件）

**Interfaces:**
- Consumes: `book` 的 `settings/characters/relationships/snapshots/overview`、`api`
- Produces: 五个切页都可编辑

- [ ] **Step 1: 在 `StoryPanel` 之后追加四个组件**

```js
    function SettingsPage({ t, book, updateBook }) {
      const [draft, setDraft] = React.useState({ title: '', body: '' })
      const patch = (id, key, value) => updateBook({ ...book, settings: book.settings.map((s) => (s.id === id ? { ...s, [key]: value } : s)) })
      const add = () => {
        if (draft.title.trim() === '') return
        updateBook({ ...book, settings: [...book.settings, { id: `s-${Date.now()}`, title: draft.title, body: draft.body }] })
        setDraft({ title: '', body: '' })
      }
      return h('div', null,
        book.settings.map((s) => h('div', { key: s.id, className: 'st-card' },
          h('input', { className: 'st-input', value: s.title, onChange: (e) => patch(s.id, 'title', e.target.value) }),
          h('textarea', { className: 'st-editor', value: s.body, onChange: (e) => patch(s.id, 'body', e.target.value) }))),
        h('input', { className: 'st-input', style: { marginBottom: 6 }, placeholder: t('label.newSetting'), value: draft.title, onChange: (e) => setDraft({ ...draft, title: e.target.value }) }),
        h('button', { type: 'button', className: 'st-btn', onClick: add }, '+'))
    }

    function CharactersPage({ t, book, updateBook }) {
      const [draft, setDraft] = React.useState('')
      const patch = (id, key, value) => updateBook({ ...book, characters: book.characters.map((c) => (c.id === id ? { ...c, [key]: value } : c)) })
      const add = () => {
        if (draft.trim() === '') return
        updateBook({ ...book, characters: [...book.characters, { id: `r-${Date.now()}`, name: draft, aliases: [], role: '', goal: '', traits: [], notes: '' }] })
        setDraft('')
      }
      return h('div', null,
        book.characters.map((c) => h('div', { key: c.id, className: 'st-card' },
          h('input', { className: 'st-input', value: c.name, onChange: (e) => patch(c.id, 'name', e.target.value) }),
          h('input', { className: 'st-input', style: { marginTop: 4 }, placeholder: '身份', value: c.role, onChange: (e) => patch(c.id, 'role', e.target.value) }),
          h('input', { className: 'st-input', style: { marginTop: 4 }, placeholder: '目标', value: c.goal, onChange: (e) => patch(c.id, 'goal', e.target.value) }),
          h('input', {
            className: 'st-input', style: { marginTop: 4 }, placeholder: '性格（用顿号分隔）',
            value: c.traits.join('、'),
            // traits is an array in the data model; keep the stored shape while editing as text.
            onChange: (e) => patch(c.id, 'traits', e.target.value.split(/[、,，]/).map((v) => v.trim()).filter((v) => v !== '')),
          }),
          h('textarea', { className: 'st-editor', placeholder: '备注', value: c.notes, onChange: (e) => patch(c.id, 'notes', e.target.value) }))),
        h('input', { className: 'st-input', style: { marginBottom: 6 }, placeholder: t('label.newCharacter'), value: draft, onChange: (e) => setDraft(e.target.value) }),
        h('button', { type: 'button', className: 'st-btn', onClick: add }, '+'))
    }

    function VersionsPage({ t, book, workspacePath, api, onReload }) {
      const snap = async () => {
        await api.snapshot(workspacePath, `手动快照 ${new Date().toLocaleString()}`)
        onReload((await api.load(workspacePath)).book)
      }
      const restore = async (id) => { onReload((await api.restore(workspacePath, id)).book) }
      return h('div', null,
        h('button', { type: 'button', className: 'st-btn', style: { marginBottom: 10 }, onClick: snap }, t('action.snapshot')),
        [...book.snapshots].reverse().map((s) => h('div', { key: s.id, className: 'st-card' },
          h('div', { className: 'st-muted' }, `${s.label} · ${new Date(s.at).toLocaleString()}`),
          h('button', { type: 'button', className: 'st-btn', style: { marginTop: 6 }, onClick: () => restore(s.id) }, t('action.restore')))))
    }

    function OverviewPage({ t, book, workspacePath, api, onReload }) {
      const [busy, setBusy] = React.useState(false)
      const refresh = async () => {
        setBusy(true)
        try { await api.overview(workspacePath, true); onReload((await api.load(workspacePath)).book) }
        finally { setBusy(false) }
      }
      const finals = book.chapters.reduce((n, c) => n + c.paragraphs.filter((p) => p.status === 'final').length, 0)
      const total = book.chapters.reduce((n, c) => n + c.paragraphs.length, 0)
      return h('div', null,
        h('div', { className: 'st-muted' }, t('label.overviewProgress', { c: book.chapters.length, f: finals, t: total, p: book.characters.length })),
        h('button', { type: 'button', className: 'st-btn', disabled: busy, style: { margin: '10px 0' }, onClick: refresh }, busy ? '…' : t('action.refresh')),
        book.overview.global ? h('div', { className: 'st-card' }, h('div', { className: 'st-muted' }, t('label.overviewGlobal')), h('div', null, book.overview.global.text)) : null,
        book.chapters.map((c) => book.overview.chapters[c.id]
          ? h('div', { key: c.id, className: 'st-card' }, h('div', { className: 'st-muted' }, c.title), h('div', null, book.overview.chapters[c.id].text)) : null))
      )
    }
```

- [ ] **Step 2: 语法检查与测试**

Run: `node --check client.js && node --test`
Expected: 全部 PASS

- [ ] **Step 3: 提交**

```bash
git add client.js && git commit -m "feat: settings, characters, versions and overview pages"
```

---

### Task 10: 安装与验证

**Files:**
- Modify: `package.json`（若新增模块需同步 `files`；本设计只有 `lib/*.js` 与根 `client.js`，无需改动）

**Interfaces:**
- Consumes: 全部
- Produces: 已安装且能在 GUI 中看到的写作面板

- [ ] **Step 1: 全量自检**

Run: `node --check client.js && for f in lib/*.js; do node --check "$f"; done && node --test`
Expected: 无语法错误，全部测试 PASS

- [ ] **Step 2: 安装 bundle**

用 `plugin_manager`：`action: install_bundle`，`target` 为工作区绝对路径 `/Users/fang/dsh-plugin-storywriting`。

- [ ] **Step 3: 读安装结果**

检查返回的 `application` 与 `warnings`；要求 `application: applied`。若有 `restart-required`，如实向用户报告并说明需重启。

- [ ] **Step 4: 确认 slot 注册**

`cordis_inspect_query`（Client `Slots.listSubTree`，root `main`）确认 occupants 出现 `story`；再查 root `sidebar.panellist` 确认 id `story` 存在。

- [ ] **Step 5: 页面验证**

在 GUI `http://127.0.0.1:56527` 里：点侧栏「写故事」→ 中央三栏；新建章节 → 写一段 → 点「请 AI 改」→ 右栏出现 diff → 采纳 → 段落变「已定稿」，并确认 `<工作区>/story/chapters/*.md` 生成。若无法控制浏览器，只报告 slot 注册与安装状态，并说明视觉验证未完成。

- [ ] **Step 6: 提交**

```bash
git add -A && git commit -m "chore: verified installed storywriting plugin"
```

---

## 自查记录

- 规格 §2 三栏布局 → Task 8
- 规格 §3 数据模型 → Task 2
- 规格 §4 原子写 / md 镜像 / 快照 → Task 3
- 规格 §5 单段状态机（过期保护、再改、定稿、回退） → Task 7、8
- 规格 §6 概览两层 + 哈希失效 + 预算 + 按章匹配人物 → Task 4、6、9
- 规格 §7 Host/Client 分工（fetch 路由，非 host.call） → Task 6、7、8
- 规格 §8 主题令牌与 locale → Task 8
- 规格 §9 错误处理（损坏备份、请求失败、回滚前备份） → Task 3、6、8
- 规格 §10 第一版范围（不做富文本/画布/协作） → 全部

类型一致性：`Suggestion.state` 四值在 model / client-logic / UI 三处一致；`Paragraph.status` 三值一致；`api.*` 六个方法与 Host 六条路由逐一对齐；`__logic` 导出名与测试调用名一致。
