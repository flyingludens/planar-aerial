import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { apply } from '../lib/index.js'
import { createEmptyBook } from '../lib/model.js'
import { readBook, writeBook } from '../lib/store.js'

/**
 * Fake context that actually runs the `ctx.inject(['tools','workingDirectory'], cb)` block, so
 * the story tools register and their execute functions can be called directly.
 */
function toolContext(workspacePath) {
  const tools = new Map()
  const ctx = {
    effect(fn) { return fn() },
    inject(names, callback) {
      if (!names.includes('tools') || !names.includes('workingDirectory')) return
      callback({
        effect(fn) { return fn() },
        tools: { register(definition) { tools.set(definition.name, definition); return () => tools.delete(definition.name) } },
      })
    },
    connection: { fetch: { register: () => () => {} } },
    get(name) {
      if (name === 'workingDirectory') return { get: () => join(workspacePath, 'library', '测试书') }
      if (name === 'agentDefaultModel') return { currentSelection: () => ({ provider: 'p', model: 'm' }) }
      return undefined
    },
    llm: { async *stream() {} },
  }
  return { ctx, tools }
}

const exec = { agent: { session: { id: 's1' } } }

async function withTools(fn) {
  const root = await mkdtemp(join(tmpdir(), 'story-tools-'))
  // The library is a setting now, not the session's working directory: tools read it from the
  // settings file, so a test that wants its books found must point the settings at them.
  const ws = join(root, 'library')
  const settingsPath = join(root, 'settings.json')
  try {
    const { ctx, tools } = toolContext(root)
    apply(ctx, { settingsPath })
    const { writeSettings } = await import('../lib/index.js')
    await writeSettings(settingsPath, {}, undefined, ws)
    return await fn({ tools, ws, settingsPath, ctx })
  } finally {
    await rm(root, { recursive: true, force: true })
  }
}

test('registers the four story tools', async () => {
  await withTools(({ tools }) => {
    assert.deepEqual([...tools.keys()].sort(), ['story_mosaic_query', 'story_read', 'story_write_cast', 'story_write_settings'])
  })
})

test('story_read returns the book', async () => {
  await withTools(async ({ tools, ws }) => {
    const book = createEmptyBook('雨夜')
    book.chapters.push({ id: 'c1', title: '第一章', status: 'writing', text: '' })
    await writeBook(ws, book, undefined, '测试书')
    const out = await tools.get('story_read').execute({}, exec)
    assert.equal(out.book.title, '雨夜')
    assert.equal(out.book.chapters[0].title, '第一章')
  })
})

test('story_write_cast adds new characters and links relationships', async () => {
  await withTools(async ({ tools, ws }) => {
    await writeBook(ws, createEmptyBook('T'), undefined, '测试书')
    const out = await tools.get('story_write_cast').execute({
      characters: [
        { name: '林', role: '摄影师', goal: '找到哥哥', traits: ['固执'] },
        { name: '周', role: '医生' },
      ],
      relationships: [{ from: '林', to: '周', kind: '旧友' }],
    }, exec)
    assert.deepEqual(out.added.sort(), ['周', '林'])
    assert.deepEqual(out.updated, [])

    const { book } = await readBook(ws, '测试书')
    // Schema 3: the cast is the board. The two characters are entities, the relation is an edge.
    const characters = book.mosaic.entities.filter((e) => e.kind === 'character')
    assert.equal(characters.length, 2)
    const lin = characters.find((c) => c.name === '林')
    assert.match(lin.summary, /找到哥哥/, 'a goal has no field on a card, so it lands in the summary')
    assert.match(lin.summary, /固执/, 'and so do the traits')
    const rel = book.mosaic.edges[0]
    const nameById = new Map(book.mosaic.entities.map((e) => [e.id, e.name]))
    assert.equal(nameById.get(rel.from), '林')
    assert.equal(nameById.get(rel.to), '周')
    assert.equal(rel.truth.kind, '旧友')
  })
})

test('story_write_cast updates an existing character by name and keeps unsupplied fields', async () => {
  await withTools(async ({ tools, ws }) => {
    const book = createEmptyBook('T')
    book.mosaic.entities.push({
      id: 'r1', kind: 'character', name: '林', role: '摄影师', tags: [], layout: null, portrait: '',
      summary: '别名：小林。目标：找到哥哥。性格：固执。保留我', statuses: [],
    })
    await writeBook(ws, book, undefined, '测试书')

    const out = await tools.get('story_write_cast').execute({ characters: [{ name: '林', role: '记者' }] }, exec)
    assert.deepEqual(out.updated, ['林'])
    const after = (await readBook(ws, '测试书')).book.mosaic.entities[0]
    assert.equal(after.role, '记者')
    assert.match(after.summary, /找到哥哥/, 'an omitted field must not be blanked')
    assert.match(after.summary, /保留我/)
  })
})

test('story_write_cast skips relationships whose endpoints are unknown', async () => {
  await withTools(async ({ tools, ws }) => {
    await writeBook(ws, createEmptyBook('T'), undefined, '测试书')
    await tools.get('story_write_cast').execute({ characters: [{ name: '林' }], relationships: [{ from: '林', to: '不存在', kind: '亲戚' }] }, exec)
    assert.equal((await readBook(ws, '测试书')).book.mosaic.edges.length, 0)
  })
})

test('story_write_settings adds and updates by title', async () => {
  await withTools(async ({ tools, ws }) => {
    const book = createEmptyBook('T')
    book.mosaic.entities.push({ id: 's1', kind: 'place', name: '时代', summary: '', description: '民国', tags: [], layout: null, portrait: '' })
    await writeBook(ws, book, undefined, '测试书')

    const out = await tools.get('story_write_settings').execute({
      entries: [{ title: '时代', body: '民国二十六年' }, { title: '地点', body: '上海' }],
    }, exec)
    assert.deepEqual(out.updated, ['时代'])
    assert.deepEqual(out.added, ['地点'])

    // A worldbuilding entry's text lives in `description`, the long form: `summary` is the one-line
    // field the digest reads, and a paragraph there is what made digests unreadable.
    const after = (await readBook(ws, '测试书')).book.mosaic.entities.filter((e) => e.kind !== 'character')
    assert.equal(after.find((s) => s.name === '时代').description, '民国二十六年')
    assert.equal(after.find((s) => s.name === '地点').description, '上海')
  })
})

test('story_mosaic_query finds an entity by name and its edges', async () => {
  await withTools(async ({ tools, ws }) => {
    const book = createEmptyBook('T')
    book.mosaic = {
      schemaVersion: 1,
      entities: [
        { id: 'a', kind: 'character', name: '张三', role: '', summary: '', statuses: [], tags: [] },
        { id: 'b', kind: 'character', name: '李四', role: '', summary: '', statuses: [], tags: [] },
        { id: 'c', kind: 'item', name: '短刀', summary: '', description: '', tags: [] },
      ],
      edges: [
        { id: 'r1', from: 'a', to: 'b', truth: { kind: '挚友', note: '' }, beliefs: [], retired: false, log: [] },
        { id: 'r2', from: 'c', to: 'a', truth: { kind: '持有', note: '' }, beliefs: [], retired: false, log: [] },
      ],
    }
    await writeBook(ws, book, undefined, '测试书')

    const result = await tools.get('story_mosaic_query').execute({ entity: '短刀' }, exec)
    assert.equal(result.entities.length, 1)
    assert.equal(result.entities[0].name, '短刀')
    assert.equal(result.edges.length, 1)
    assert.equal(result.edges[0].truth.kind, '持有')
  })
})

test('story_mosaic_query searches card bodies by keyword and matches nothing cleanly', async () => {
  await withTools(async ({ tools, ws }) => {
    await writeBook(ws, createEmptyBook('T'), undefined, '测试书')

    const book = (await readBook(ws, '测试书')).book
    book.mosaic = { schemaVersion: 1, entities: [
      { id: 's', kind: 'place', name: '仓库', description: '堆满旧木箱的仓库', tags: [] },
    ], edges: [] }
    await writeBook(ws, book, undefined, '测试书')

    const result = await tools.get('story_mosaic_query').execute({ keyword: '木箱' }, exec)
    assert.ok(Array.isArray(result.entities))
    assert.equal(result.entities[0].name, '仓库')

    const none = await tools.get('story_mosaic_query').execute({}, exec)
    assert.deepEqual(none, { entities: [], edges: [] })
  })
})

test('tools work without an owning session, because the library is a setting', async () => {
  // The tools used to derive the book's location from the calling session's working directory, so
  // a call with no session had nowhere to look and had to refuse. The library is a setting: a tool
  // call from anywhere reads the same shelf, and the `exec` argument is no longer consulted.
  await withTools(async ({ tools, ws }) => {
    const book = createEmptyBook('无会话也能读')
    await writeBook(ws, book, undefined, '测试书')
    const out = await tools.get('story_read').execute({}, {})
    assert.equal(out.book.title, '无会话也能读')
  })
})

/**
 * Fake context that captures the `agent/created` listener, then builds a fake agent whose
 * `ctx.systemPrompt.context(...)` records the contribution. This mirrors how the plugin actually
 * registers the story context: per agent, inside that agent's own context.
 */
function promptContext(settingsPath, directory = '/nowhere') {
  const listeners = []
  const registered = []
  const ctx = {
    effect(fn) { return fn() },
    on(event, listener) { if (event === 'agent/created') listeners.push(listener); return () => {} },
    inject(names, callback) {
      if (!names.includes('systemPrompt')) return
      callback({
        effect(fn) { return fn() },
        on(event, listener) { if (event === 'agent/created') listeners.push(listener); return () => {} },
        get: ctx.get,
        workingDirectory: { get: () => directory },
      })
    },
    connection: { fetch: { register: () => () => {} } },
    get(name) {
      if (name === 'workingDirectory') return { get: () => directory }
      if (name === 'agentDefaultModel') return { currentSelection: () => ({ provider: 'p', model: 'm' }) }
      return undefined
    },
    llm: { async *stream() {} },
  }
  apply(ctx, { settingsPath })
  // Fire agent/created once for a fake agent whose scoped systemPrompt records the contribution.
  const agent = {
    session: { id: 's1' },
    ctx: {
      effect(fn) { return fn() },
      systemPrompt: { context(entry) { registered.push(entry); return () => {} } },
    },
  }
  for (const listener of listeners) listener({ agent })
  return registered
}

const textOf = (entries) => (entries.length === 0 ? '' : entries[0].text({}))

test('story context contributes an empty string when the workspace has no story', async () => {
  const ws = await mkdtemp(join(tmpdir(), 'story-ctx-'))
  try {
    const entries = promptContext(ws)
    assert.equal(entries.length, 1, 'the per-agent story context must register')
    assert.equal(textOf(entries), '', 'an empty contribution keeps a storyless session working')
  } finally {
    await rm(ws, { recursive: true, force: true })
  }
})

test('story context digests the book that is on disk', async () => {
  const ws = await mkdtemp(join(tmpdir(), 'story-ctx-'))
  try {
    const book = createEmptyBook('雨夜')
    book.genre = '悬疑'
    // `chapters` is DERIVED from `nodes`: pushing to it alone is dropped on the next normalize,
    // so the tree is what a real save writes.
    book.nodes = [{ id: 'v1', title: '第一卷', level: 'volume', status: 'writing', text: '', children: [
      { id: 'c1', title: '第一章', level: 'chapter', status: 'writing', text: '定稿。', children: [] },
    ] }]
    book.mosaic.entities.push({ id: 'r1', kind: 'character', name: '林', role: '摄影师', summary: '', statuses: [], tags: [], layout: null, portrait: '' })
    book.mosaic.entities.push({ id: 's1', kind: 'place', name: '时代', summary: '', description: '民国', tags: [], layout: null, portrait: '' })
    await writeBook(ws, book, undefined, '测试书')
    // The library IS `ws` here: the book was written straight into it.
    const settingsPath = join(ws, 'settings.json')
    const { writeSettings } = await import('../lib/index.js')
    await writeSettings(settingsPath, {}, undefined, ws)

    const text = textOf(promptContext(settingsPath))
    for (const expected of ['雨夜', '悬疑', '第一章', '林', '时代', 'story_read']) {
      assert.ok(text.includes(expected), `digest should mention ${expected}`)
    }
  } finally {
    await rm(ws, { recursive: true, force: true })
  }
})

test('story context carries per-chapter summaries and bounds them', async () => {
  const ws = await mkdtemp(join(tmpdir(), 'story-ctx-'))
  try {
    const book = createEmptyBook('雨夜')
    book.nodes = [{ id: 'v1', title: '第一卷', level: 'volume', status: 'writing', text: '', children:
      Array.from({ length: 41 }, (_, k) => {
        const i = k + 1
        return {
          id: `c${i}`, title: `第${i}章`, level: 'chapter', status: 'writing', text: '',
          // Only some chapters have a summary: blanks must contribute nothing.
          summary: i === 2 ? '' : `本章梗概${i}。`.repeat(i > 39 ? 30 : 1),
          children: [],
        }
      }),
    }]
    await writeBook(ws, book, undefined, '测试书')
    // The library IS `ws` here: the book was written straight into it.
    const settingsPath = join(ws, 'settings.json')
    const { writeSettings } = await import('../lib/index.js')
    await writeSettings(settingsPath, {}, undefined, ws)

    const text = textOf(promptContext(settingsPath))
    // The 梗概 block is the part under test; the 章节 digest line names every title regardless.
    const block = (text.match(/梗概：\n[\s\S]*?(?=\n需要全文时调用 story_read)/) ?? [''])[0]
    assert.ok(block !== '', 'the context carries a summary block')
    assert.ok(block.includes('第1章 第1章：本章梗概1。'), 'a chapter with a summary is listed')
    assert.ok(!block.includes('第2章 第2章：'), 'an empty summary contributes no row')
    assert.ok(block.includes('第40章 第40章：本章梗概40。'), 'the first 40 chapters are included')
    assert.ok(!block.includes('第41章'), 'chapter 41 is past the bound')
    // 80 characters per summary: the repeated long one is cut mid-way, not dumped whole.
    const longLine = text.split('第40章 第40章：')[1]?.split('\n')[0] ?? ''
    assert.equal(longLine.length, 80, `a long summary is truncated to 80 characters, saw ${longLine.length}`)
  } finally {
    await rm(ws, { recursive: true, force: true })
  }
})

test('story context stays silent on a malformed book instead of throwing', async () => {
  const ws = await mkdtemp(join(tmpdir(), 'story-ctx-'))
  try {
    const { mkdir, writeFile } = await import('node:fs/promises')
    await mkdir(join(ws, 'story'), { recursive: true })
    await writeFile(join(ws, 'book.json'), '{ not json')
    assert.equal(textOf(promptContext(ws)), '')
  } finally {
    await rm(ws, { recursive: true, force: true })
  }
})

test('story context follows the session directory, not the latest book in the library', async () => {
  const root = await mkdtemp(join(tmpdir(), 'story-ctx-'))
  try {
    const mine = createEmptyBook('我的书')
    await writeBook(root, mine, undefined, 'A书')
    const other = createEmptyBook('别人的书')
    await writeBook(root, other, undefined, 'B书')
    const entries = promptContext(join(root, 'settings.json'), join(root, 'A书'))
    const text = entries[0].text({ agent: { session: { id: 's1' } } })
    assert.match(text, /我的书/, 'the session reads its own book')
    assert.doesNotMatch(text, /别人的书/, 'another book in the same library must not leak in')
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('a session outside any book contributes nothing, even when the library has books', async () => {
  const root = await mkdtemp(join(tmpdir(), 'story-ctx-'))
  try {
    await writeBook(root, createEmptyBook('别人的书'), undefined, 'B书')
    const entries = promptContext(join(root, 'settings.json'), root)
    assert.equal(entries[0].text({ agent: { session: { id: 's1' } } }), '')
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

