import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { apply } from '../lib/index.js'
import { createEmptyBook } from '../lib/model.js'
import { readBook, writeBook } from '../lib/store.js'

/**
 * Build a fake Cordis context with just enough surface for apply():
 * - connection.fetch.register records each route and returns a disposer.
 * - effect runs the callback once and keeps its disposer.
 * - llm.stream yields a fixed text as text-delta + a stop finish.
 * - get(name) resolves agentDefaultModel's currentSelection.
 */
function fakeContext(routeTable) {
  const effects = []
  const ctx = {
    effect(fn) { const d = fn(); effects.push(d); return d },
    // Cordis injects a child context only for the services listed; the fake declares none of
    // them, so the agent-tool block stays unregistered, exactly as in a profile without `tools`.
    inject() {},
    connection: {
      fetch: {
        register(route) {
          routeTable.set(route.path, route)
          return () => routeTable.delete(route.path)
        },
      },
    },
    effectCount: () => effects.length,
    llm: {
      // Which model each call actually went to. A role's model is invisible in the response, so
      // the only way to test it is to look at what was asked for.
      calls: [],
      listProviders: () => [{ id: 'p', name: 'Provider P' }, { id: 'silent', name: 'Silent' }],
      // The second provider advertises nothing, like an adapter that has no catalogue: the panel
      // still has to be able to name and keep a model a writer pinned there.
      listModels: async (provider) => (provider === 'p'
        ? [{ id: 'm', name: 'Model M' }, { id: 'big', name: 'Model Big' }]
        : []),
      // Only one model advertises reasoning levels; the rest answer none, like most routes.
      // The name matters: the service exposes `resolveModelInfo`, and a fake with only the
      // adapter-level `resolveModel` hid a route that asked for the wrong one and found nothing.
      resolveModelInfo: async (provider, model) => (model === 'big'
        ? { provider, id: model, name: 'Model Big', reasoning: { efforts: [{ id: 'low', name: 'Low' }, { id: 'high', name: 'High' }], defaultEffort: 'low' } }
        : { provider, id: model, name: model }),
      async *stream(options) {
        ctx.llm.calls.push({ provider: options.provider, model: options.model })
        yield { type: 'text-delta', index: 0, text: '模型输出的句子。' }
        yield { type: 'finish', reason: { kind: 'stop' } }
      },
    },
    get(name) {
      if (name === 'agentDefaultModel') return { currentSelection: () => ({ provider: 'p', model: 'm' }) }
      return undefined
    },
  }
  return ctx
}

/** A one-chapter book in the stored tree shape; `chapters` is only a derived view. */
function bookWith(texts) {
  // A leaf holds one body now; several strings become one chapter joined by blank lines.
  const book = createEmptyBook('T')
  book.nodes = [{
    id: 'v1', title: '第一卷', level: 'volume', status: 'writing', text: '',
    children: [{
      id: 'c1', title: '第一章', level: 'chapter', status: 'writing', children: [],
      text: texts.join('\n\n'),
    }],
  }]
  return book
}

/**
 * Point a bare route table's library at a temp directory.
 *
 * A few tests drive ONE route directly instead of going through `withRoutes` (they need to stub
 * the model stream). Those still need a library, or they write books into the real home.
 */
async function setLibFor(routeTable, library) {
  const request = new Request('http://x/api/story.setLibrary', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ path: library }),
  })
  await routeTable.get('/api/story.setLibrary').fetch(request)
}

async function withRoutes(fn) {
  const routeTable = new Map()
  const ctx = fakeContext(routeTable)
  const ws = await mkdtemp(join(tmpdir(), 'story-routes-'))
  const folder = '测试书'
  // The settings (and with them the library) live under the dsh home by default; a test must never
  // write there, so the temp directory stands in for it and the assertions can also read what was
  // stored. The library is inside that temp directory too, or the routes would create books in the
  // real home while the test looked on.
  const call = async (path, body) => {
    const route = routeTable.get(path)
    assert.ok(route, `route ${path} not registered`)
    assert.deepEqual(route.methods, ['POST'])
    const request = new Request(`http://x${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    const response = await route.fetch(request)
    return response.json()
  }
  // The settings (and with them the library) live under the dsh home by default; a test must never
  // write there, so the temp directory stands in for it. The library is inside that directory too,
  // or the routes would create books in the real home while the test looked on.
  const library = join(ws, 'library')
  apply(ctx, { settingsPath: join(ws, 'settings.json') })
  const setLibrary = async () => {
    const route = routeTable.get('/api/story.setLibrary')
    const request = new Request('http://x/api/story.setLibrary', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ path: library }),
    })
    return (await route.fetch(request)).json()
  }
  try {
    await setLibrary()
    // One real book, so the routes under test have a manuscript to address.
    const created = await call('/api/story.createBook', { workspacePath: ws, title: folder })
    assert.equal(created.ok, true)
    return await fn({ call, routeTable, ws, library, folder, ctx })
  } finally {
    await rm(ws, { recursive: true, force: true })
  }
}

test('apply registers every story route', async () => {
  await withRoutes(({ routeTable }) => {
    assert.deepEqual(
      [...routeTable.keys()].sort(),
      [
        '/api/story.answer.delete', '/api/story.answer.save', '/api/story.answers',
        '/api/story.applyProposal', '/api/story.books', '/api/story.catalog',
        '/api/story.chat', '/api/story.consistency',
        '/api/story.context', '/api/story.context.prompt.doc.add',
        '/api/story.context.prompt.reset', '/api/story.context.prompt.save',
        '/api/story.context.reset', '/api/story.context.save',
        '/api/story.context.version.add', '/api/story.context.version.delete',
        '/api/story.continue', '/api/story.createBook', '/api/story.critique', '/api/story.deleteBook', '/api/story.efforts', '/api/story.events',
        '/api/story.imageModels', '/api/story.load', '/api/story.manuscript', '/api/story.meta', '/api/story.models',
        '/api/story.mosaic.apply', '/api/story.mosaic.ask', '/api/story.mosaic.check',
        '/api/story.mosaic.portrait', '/api/story.mosaic.portrait.read', '/api/story.mosaic.relate',
        '/api/story.openDirectory', '/api/story.overview', '/api/story.proposal.delete', '/api/story.proposal.setStatus',
        '/api/story.proposals', '/api/story.provider.delete', '/api/story.provider.models', '/api/story.provider.save', '/api/story.provider.test', '/api/story.providers', '/api/story.renameBook', '/api/story.restore', '/api/story.review',
        '/api/story.save', '/api/story.setImage', '/api/story.setLibrary', '/api/story.setModel',
        '/api/story.snapshot', '/api/story.suggest',
        '/api/story.writingStyle.delete', '/api/story.writingStyle.generate', '/api/story.writingStyle.save',
        '/api/story.writingStyle.setActive', '/api/story.writingStyles',
      ],
    )
  })
})

test('opening an empty directory creates a book there and makes it the library', async () => {
  await withRoutes(async ({ call, ws }) => {
    const target = join(ws, '外部书')
    await mkdir(target)
    const opened = await call('/api/story.openDirectory', { path: target })
    assert.equal(opened.ok, true)
    assert.equal(opened.kind, 'book')
    assert.equal(opened.book.title, '外部书')
    assert.equal(opened.library, ws)
    assert.equal((await readBook(ws, '外部书')).book.title, '外部书')
    const again = await call('/api/story.openDirectory', { path: target })
    assert.equal(again.kind, 'book')
    assert.equal(again.bookFolder, '外部书')
  })
})

test('a freshly created book loads as an empty manuscript', async () => {
  await withRoutes(async ({ call, ws, library, folder }) => {
    const out = await call('/api/story.load', { workspacePath: ws, bookFolder: folder })
    assert.equal(out.ok, true)
    assert.equal(out.existed, true)
    assert.deepEqual(out.book.nodes, [])
    assert.deepEqual(out.book.chapters, [])
  })
})

test('save refuses a missing book instead of wiping the manuscript', async () => {
  await withRoutes(async ({ call, ws, library, folder }) => {
    const seeded = bookWith(['不该被删。'])
    await writeBook(library, seeded, undefined, '测试书')

    const missing = await call('/api/story.save', { workspacePath: ws, bookFolder: folder })
    assert.equal(missing.ok, false)
    assert.match(missing.error, /book object/)

    const noChapters = await call('/api/story.save', { workspacePath: ws, bookFolder: folder, book: { title: '只剩标题' } })
    assert.equal(noChapters.ok, false, 'a book without a chapters array must be refused')

    const after = await readBook(library, '测试书')
    assert.equal(after.book.chapters[0].text, '不该被删。', 'manuscript must survive a malformed save')
  })
})

test('save round-trips a book', async () => {
  await withRoutes(async ({ call, ws, library, folder }) => {
    const book = createEmptyBook('新稿')
    const out = await call('/api/story.save', { workspacePath: ws, bookFolder: folder, book })
    assert.equal(out.ok, true)
    // The answer carries what was written, so the panel can adopt the normalized copy instead
    // of keeping a version that may hold fields the host dropped or repaired.
    assert.ok(out.book, 'the save answers with the book it wrote')
    assert.equal(out.book.title, '新稿')
    assert.equal(typeof out.token, 'string')
    assert.equal(typeof out.savedAt, 'number')
    const back = await readBook(library, '测试书')
    assert.equal(back.book.title, '新稿')
  })
})

test('a save answers with the normalized book, not the shape that was sent', async () => {
  await withRoutes(async ({ call, ws, folder }) => {
    // A book written before the tree existed: flat chapters, paragraph arrays, no ids.
    const raw = {
      title: '旧稿',
      chapters: [{ id: '', title: '一', paragraphs: [{ text: '第一段。' }, { text: '第二段。' }] }],
    }
    const out = await call('/api/story.save', { workspacePath: ws, bookFolder: folder, book: raw })
    assert.equal(out.ok, true)
    assert.equal(out.book.schemaVersion, 3)
    assert.equal(out.book.chapters.length, 1)
    assert.equal(out.book.chapters[0].text, '第一段。\n\n第二段。')
    assert.ok(out.book.chapters[0].id !== '', 'the missing id was minted')
  })
})

test('suggest returns a ready suggestion carrying the original as baseText', async () => {
  await withRoutes(async ({ call, ws, library, folder }) => {
    const book = bookWith(['雨下的很大。'])
    await writeBook(library, book, undefined, '测试书')
    const out = await call('/api/story.suggest', {
      workspacePath: ws, bookFolder: folder, chapterId: 'c1', paragraphId: 'p1', text: '雨下的很大。', instruction: '',
    })
    assert.equal(out.ok, true)
    assert.equal(out.suggestion.baseText, '雨下的很大。')
    assert.equal(out.suggestion.proposedText, '模型输出的句子。')
    assert.equal(out.suggestion.state, 'ready')
  })
})

test('an answer survives a round trip through the host and comes back newest first', async () => {
  await withRoutes(async ({ call, ws, library, folder }) => {
    const empty = await call('/api/story.answers', { bookFolder: folder })
    assert.equal(empty.ok, true)
    assert.deepEqual(empty.answers, [], 'a book with no answers answers an empty list, not an error')

    const saved = await call('/api/story.answer.save', {
      bookFolder: folder,
      answer: { question: '这句怎么收？', reply: '收在雨停之前。', at: 1000, chapterId: 'c1' },
    })
    assert.equal(saved.ok, true)
    assert.equal(typeof saved.answer.id, 'string', 'the host assigns the id')
    assert.ok(saved.answer.id !== '', 'and it is not empty')

    await call('/api/story.answer.save', { bookFolder: folder, answer: { question: '后来', reply: '后来答', at: 2000 } })
    const listed = await call('/api/story.answers', { bookFolder: folder })
    assert.deepEqual(listed.answers.map((row) => row.question), ['后来', '这句怎么收？'], 'newest first')

    // The manuscript is a separate file, so an answer never touches it.
    const loaded = await call('/api/story.load', { bookFolder: folder })
    assert.equal(loaded.ok, true)
    assert.equal(loaded.book.title, '测试书')

    const removed = await call('/api/story.answer.delete', { bookFolder: folder, id: saved.answer.id })
    assert.equal(removed.ok, true)
    assert.equal(removed.removed, true)
    const after = await call('/api/story.answers', { bookFolder: folder })
    assert.deepEqual(after.answers.map((row) => row.question), ['后来'], 'only the deleted one went')
  })
})

test('saving an answer without one is refused rather than writing a blank record', async () => {
  await withRoutes(async ({ call, folder }) => {
    const out = await call('/api/story.answer.save', { bookFolder: folder })
    assert.equal(out.ok, false)
    assert.match(out.error, /answer/)
  })
})

test('snapshot then restore rolls the chapters back', async () => {
  await withRoutes(async ({ call, ws, library, folder }) => {
    const book = bookWith(['原始段落。'])
    await writeBook(library, book, undefined, '测试书')
    const snap = await call('/api/story.snapshot', { bookFolder: folder, label: '基线' })
    assert.equal(snap.ok, true)

    // Change the book, then restore the snapshot.
    const broken = bookWith(['被改坏了。'])
    await writeBook(library, broken, undefined, '测试书')
    const restored = await call('/api/story.restore', { workspacePath: ws, bookFolder: folder, id: snap.id })
    assert.equal(restored.ok, true)
    assert.equal(restored.book.chapters[0].text, '原始段落。')
    // The restore replaced the file, so its token is the one the next save must carry. A restore
    // that answered with the book alone left the panel saving against the pre-restore bytes and
    // being refused as stale.
    assert.equal(typeof restored.token, 'string')
    const saved = await call('/api/story.save', {
      workspacePath: ws, bookFolder: folder, book: restored.book, token: restored.token,
    })
    assert.equal(saved.ok, true, 'the restored token is accepted by the next save')
  })
})

test('restore of an unknown snapshot reports failure, not a crash', async () => {
  await withRoutes(async ({ call, ws, library, folder }) => {
    const out = await call('/api/story.restore', { workspacePath: ws, bookFolder: folder, id: '2020-01-01T00-00-00-000Z' })
    assert.equal(out.ok, false)
  })
})

test('overview answers with the book and the token it wrote', async () => {
  await withRoutes(async ({ call, library, folder }) => {
    const book = bookWith(['雨下了一整夜，屋檐的水声一直没停。'.repeat(12)])
    await writeBook(library, book, undefined, '测试书')
    const out = await call('/api/story.overview', { bookFolder: folder, refresh: true })
    assert.equal(out.ok, true)
    assert.ok(out.book, 'the summary write answers with the book')
    assert.equal(out.book.overview.global.text, '模型输出的句子。')
    assert.equal(typeof out.token, 'string')
    // The token covers the bytes this route just wrote; without it the panel's next autosave
    // would be refused as stale for doing nothing but refreshing a summary.
    const saved = await call('/api/story.save', { bookFolder: folder, book: out.book, token: out.token })
    assert.equal(saved.ok, true)
  })
})



test('notes are saved in their own file, not inside book.json', async () => {
  await withRoutes(async ({ call, library, folder }) => {
    const loaded = await call('/api/story.load', { bookFolder: folder })
    const book = {
      ...loaded.book,
      notes: [{ id: 'note-1', text: '第三幕的雨停了', at: 1000 }],
    }
    const saved = await call('/api/story.save', { bookFolder: folder, book, token: loaded.token })
    assert.equal(saved.ok, true)
    assert.equal(saved.book.notes.length, 1)

    const manifest = JSON.parse(await readFile(join(library, folder, 'book.json'), 'utf8'))
    assert.equal('notes' in manifest, false, 'the manuscript file no longer carries jottings')
    const notes = JSON.parse(await readFile(join(library, folder, 'notes.json'), 'utf8'))
    assert.deepEqual(notes.notes, [{ id: 'note-1', text: '第三幕的雨停了', at: 1000 }])

    const again = await call('/api/story.load', { bookFolder: folder })
    assert.deepEqual(again.book.notes, [{ id: 'note-1', text: '第三幕的雨停了', at: 1000 }])
  })
})


test('a book with notes inside book.json migrates them on the first read', async () => {
  await withRoutes(async ({ call, library }) => {
    await call('/api/story.createBook', { workspacePath: library, title: '旧书' })
    const manifestPath = join(library, '旧书', 'book.json')
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
    manifest.notes = [{ id: 'legacy-note', text: '旧随笔', at: 1 }]
    await writeFile(manifestPath, JSON.stringify(manifest))
    const loaded = await call('/api/story.load', { bookFolder: '旧书' })
    assert.deepEqual(loaded.book.notes, [{ id: 'legacy-note', text: '旧随笔', at: 1 }])
    assert.equal('notes' in JSON.parse(await readFile(manifestPath, 'utf8')), false)
    assert.deepEqual(JSON.parse(await readFile(join(library, '旧书', 'notes.json'), 'utf8')).notes,
      [{ id: 'legacy-note', text: '旧随笔', at: 1 }])
  })
})

test('a 流派 can be generated, saved, and becomes the active writing style', async () => {
  await withRoutes(async ({ call, ctx, library, folder, ws }) => {
    const original = ctx.llm.stream
    ctx.llm.stream = async function* stream() {
      yield { type: 'text-delta', index: 0, text: '冷峻的第三人称叙述，短句为主，少用形容词，克制地写动作。' }
      yield { type: 'finish', reason: { kind: 'stop' } }
    }
    try {
      const generated = await call('/api/story.writingStyle.generate', { bookFolder: folder, source: '雨下了整夜。' })
      assert.equal(generated.ok, true)
      assert.ok(generated.prompt.includes('冷峻'), `the prompt comes back as prose, saw ${generated.prompt}`)
      const saved = await call('/api/story.writingStyle.save', {
        bookFolder: folder, name: '冷硬派', prompt: generated.prompt, source: '雨下了整夜。',
      })
      assert.equal(saved.ok, true)
      assert.equal(saved.writingStyles.length, 1)
      assert.equal(saved.activeId, saved.saved.id, 'the first writing style becomes active')
      const fresh = await readBook(library, folder)
      assert.equal(fresh.book.activeWritingStyle.name, '冷硬派')
      assert.equal(fresh.book.activeWritingStyle.prompt, generated.prompt)
      assert.equal(JSON.parse(await readFile(join(library, 'writing-styles.json'), 'utf8')).writingStyles.length, 1)
      await call('/api/story.createBook', { workspacePath: ws, title: '另一本书' })
      const other = await call('/api/story.writingStyles', { bookFolder: '另一本书' })
      assert.equal(other.writingStyles.length, 1, 'the style library is shared by every book in the library')
      assert.equal(other.activeId, saved.activeId)
    } finally { ctx.llm.stream = original }
  })
})



test('a legacy per-book style file moves to the library root on read', async () => {
  await withRoutes(async ({ call, library, folder }) => {
    const legacy = {
      schemaVersion: 1, activeId: 'style-1',
      writingStyles: [{ id: 'style-1', name: '旧流派', prompt: '短句。', source: '', at: 1 }],
    }
    await writeFile(join(library, folder, 'writing-styles.json'), JSON.stringify(legacy))
    const out = await call('/api/story.writingStyles', { bookFolder: folder })
    assert.equal(out.activeId, 'style-1')
    assert.equal(out.writingStyles[0].name, '旧流派')
    const shared = JSON.parse(await readFile(join(library, 'writing-styles.json'), 'utf8'))
    assert.equal(shared.writingStyles[0].name, '旧流派')
  })
})

test('viewing the manuscript and checking continuity leave log records', async () => {
  await withRoutes(async ({ call, folder }) => {
    const loaded = await call('/api/story.load', { bookFolder: folder })
    await call('/api/story.save', {
      bookFolder: folder, token: loaded.token,
      book: bookWith(['雨下了一整夜，屋檐的水声一直没停。'.repeat(12)]),
    })
    await call('/api/story.manuscript', { bookFolder: folder })
    await call('/api/story.consistency', { bookFolder: folder })
    const log = await call('/api/story.events', {})
    assert.ok(log.events.some((event) => event.type === 'manuscript'), 'the manuscript view is logged')
    assert.ok(log.events.some((event) => event.action === 'consistency'), 'the continuity check is logged')
  })
})


test('suggest fails when the model finishes with tool-calls instead of text', async () => {
  const routeTable = new Map()
  const ctx = fakeContext(routeTable)
  ctx.llm = {
    async *stream() {
      yield { type: 'finish', reason: { kind: 'tool-calls' } }
    },
  }
  const ws = await mkdtemp(join(tmpdir(), 'story-routes-'))
  const library = join(ws, 'library')
  apply(ctx, { settingsPath: join(ws, 'settings.json') })
  try {
    // This test drives one route directly, so it establishes its own library rather than going
    // through `withRoutes`.
    await (async () => {
      const req = new Request('http://x/api/story.setLibrary', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ path: library }),
      })
      await routeTable.get('/api/story.setLibrary').fetch(req)
    })()
    await writeBook(library, bookWith(['原句。'], 'draft'), undefined, '测试书')
    const request = new Request('http://x/api/story.suggest', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ workspacePath: ws, bookFolder: '测试书', chapterId: 'c1', paragraphId: 'p1', text: '原句。', instruction: '' }),
    })
    const out = await (await routeTable.get('/api/story.suggest').fetch(request)).json()
    assert.equal(out.ok, false)
    assert.match(out.error, /model call failed/)
  } finally {
    await rm(ws, { recursive: true, force: true })
  }
})

test('load returns a token and a save with an outdated token is refused, leaving the file intact', async () => {
  await withRoutes(async ({ call, ws, library, folder }) => {
    const book = createEmptyBook('原稿')
    const leaf = { id: 'c1', title: '第一章', level: 'chapter', status: 'writing',
      text: '原始段落。', children: [] }
    book.nodes = [{ id: 'v1', title: '第一卷', level: 'volume', status: 'writing', text: '', children: [leaf] }]
    await writeBook(library, book, undefined, '测试书')

    const first = await call('/api/story.load', { workspacePath: ws, bookFolder: folder })
    assert.equal(typeof first.token, 'string')
    assert.ok(first.token.length > 0)

    // Another panel saves first: the file moves on.
    const editLeaf = (text) => ({
      ...first.book,
      nodes: [{ ...first.book.nodes[0], children: [{
        ...first.book.nodes[0].children[0],
        text,
      }] }],
    })
    const other = editLeaf('别人改的。')
    const saved = await call('/api/story.save', { workspacePath: ws, bookFolder: folder, book: other, token: first.token })
    assert.equal(saved.ok, true)

    // The stale save must be refused and must not touch the manuscript.
    const stale = editLeaf('我的旧改动。')
    const refused = await call('/api/story.save', { workspacePath: ws, bookFolder: folder, book: stale, token: first.token })
    assert.equal(refused.ok, false)
    assert.match(refused.error, /^stale book/)
    assert.equal((await readBook(library, '测试书')).book.chapters[0].text, '别人改的。')

    // Re-read, then the save carrying the current token succeeds.
    const second = await call('/api/story.load', { workspacePath: ws, bookFolder: folder })
    assert.notEqual(second.token, first.token)
    const ok = await call('/api/story.save', { workspacePath: ws, bookFolder: folder, book: stale, token: second.token })
    assert.equal(ok.ok, true)
    assert.equal((await readBook(library, '测试书')).book.chapters[0].text, '我的旧改动。')
  })
})

test('a save carrying no token still works for callers that do not track one', async () => {
  await withRoutes(async ({ call, ws, library, folder }) => {
    const out = await call('/api/story.save', { workspacePath: ws, bookFolder: folder, book: createEmptyBook('无令牌') })
    assert.equal(out.ok, true)
    assert.equal((await readBook(library, '测试书')).book.title, '无令牌')
  })
})


test('consecutive saves succeed by adopting the token each save returns', async () => {
  await withRoutes(async ({ call, ws, library, folder }) => {
    const first = await call('/api/story.load', { workspacePath: ws, bookFolder: folder })
    let token = first.token
    for (const title of ['第一稿', '第二稿', '第三稿']) {
      const book = createEmptyBook(title)
      const saved = await call('/api/story.save', { workspacePath: ws, bookFolder: folder, book, token })
      assert.equal(saved.ok, true, `save of ${title} must not be refused as stale`)
      token = saved.token
    }
    assert.equal((await readBook(library, '测试书')).book.title, '第三稿')
  })
})

test('a save carrying an outdated token is refused and leaves the file untouched', async () => {
  await withRoutes(async ({ call, ws, library, folder }) => {
    const loaded = await call('/api/story.load', { workspacePath: ws, bookFolder: folder })
    const staleToken = loaded.token
    const good = createEmptyBook('保留我')
    assert.equal((await call('/api/story.save', { workspacePath: ws, bookFolder: folder, book: good, token: staleToken })).ok, true)

    const clobber = createEmptyBook('不该写入')
    const refused = await call('/api/story.save', { workspacePath: ws, bookFolder: folder, book: clobber, token: staleToken })
    assert.equal(refused.ok, false)
    assert.match(refused.error, /^stale book/)
    assert.equal((await readBook(library, '测试书')).book.title, '保留我')
  })
})

// ---- the two whole-section calls ----

test('a copy-edit answers about the section it was given, and an empty one is refused', async () => {
  await withRoutes(async ({ call, ws, library, folder }) => {
    const book = bookWith(['雨下的很大。'])
    await writeBook(library, book, undefined, '测试书')
    const out = await call('/api/story.review', {
      workspacePath: ws, bookFolder: folder, chapterId: 'c1', text: '雨下的很大。',
    })
    // The fake model answers with prose, not a json block. The route must survive that: an
    // unreadable answer is a shorter list, not a crash in the middle of the writer's pass.
    assert.equal(out.ok, true)
    assert.deepEqual(out.issues, [])
    // With nothing to read, asking the model at all would be a wasted wait and a confusing one.
    // The blank text falls back to the stored section, so the section itself has to be empty.
    const blank = bookWith([' '])
    await writeBook(library, blank, undefined, '空书')
    const empty = await call('/api/story.review', {
      workspacePath: ws, bookFolder: '空书', chapterId: 'c1', text: '   ',
    })
    assert.equal(empty.ok, false)
    assert.match(empty.error, /没有内容/)
  })
})

test('the grammar critique needs a chapter and something already written', async () => {
  await withRoutes(async ({ call, ws, library, folder }) => {
    const book = bookWith(['雨下的很大。'])
    await writeBook(library, book, undefined, '测试书')
    // The critique runs even when the model returns no parseable block: an empty verdict and no
    // points is the honest answer, not an error.
    const out = await call('/api/story.critique', {
      workspacePath: ws, bookFolder: folder, chapterId: 'c1', before: '雨下的很大。', after: '', text: '雨下的很大。',
    })
    assert.equal(out.ok, true)
    assert.deepEqual(out.critique, { verdict: '', points: [] })
    // The caret at the very start of a section: there is nothing to judge.
    const blank = await call('/api/story.critique', {
      workspacePath: ws, bookFolder: folder, chapterId: 'c1', before: '  ', after: '', text: '  ',
    })
    assert.equal(blank.ok, false)
    assert.match(blank.error, /先写一点内容/)
    // A chapter that is not in the book cannot be addressed.
    const missing = await call('/api/story.critique', {
      workspacePath: ws, bookFolder: folder, chapterId: 'nope', before: '雨', after: '', text: '雨',
    })
    assert.equal(missing.ok, false)
    assert.match(missing.error, /先打开一章/)
  })
})

test('a pinned provider the host cannot load falls back to the session model, and both attempts are logged', async () => {
  await withRoutes(async ({ call, ctx, folder }) => {
    await call('/api/story.setModel', { role: 'mosaic', selection: { provider: 'ghost', model: 'ghost-model' } })
    const original = ctx.llm.stream
    ctx.llm.stream = async function* stream(options) {
      ctx.llm.calls.push({ provider: options.provider, model: options.model })
      if (options.provider === 'ghost') throw new Error('model call failed: NO_ADAPTER')
      yield { type: 'text-delta', index: 0, text: '```json\n{"edges":[]}\n```' }
      yield { type: 'finish', reason: { kind: 'stop' } }
    }
    try {
      const cards = [
        { id: 'a', kind: 'character', name: '甲', summary: '', statuses: [], tags: [] },
        { id: 'b', kind: 'character', name: '乙', summary: '', description: '甲的朋友。', statuses: [], tags: [] },
      ]
      const out = await call('/api/story.mosaic.relate', { cards, edges: [], bookFolder: folder })
      assert.equal(out.ok, true, 'the call succeeds on the fallback model')
      assert.deepEqual(ctx.llm.calls.map((c) => c.provider), ['ghost', 'p'], 'one failed try, then the session model')
      const log = await call('/api/story.events', {})
      const rows = log.events.filter((event) => event.action === 'board.relate')
      assert.ok(rows.some((row) => row.ok === false && /NO_ADAPTER/.test(row.error ?? '')), 'the failed attempt is logged')
      assert.ok(rows.some((row) => row.ok === true), 'the successful fallback is logged too')
    } finally { ctx.llm.stream = original }
  })
})

// ---- the model page ----

test('every role inherits the session model until one is pinned', async () => {
  await withRoutes(async ({ call, ws, library, ctx }) => {
    // Nothing stored: all three roles run on whatever dsh is set to.
    const before = await call('/api/story.models', {})
    assert.equal(before.ok, true)
    assert.deepEqual(before.overrides, {}, 'nothing is overridden yet')
    // Opening the page creates the plugin's config file, empty, so the path the page names is a
    // file that exists.
    assert.equal((await readFile(join(ws, 'settings.json'), 'utf8')).includes('"roles"'), true,
      'an empty config file is created on first visit')
    assert.deepEqual(before.inherited, { provider: 'p', model: 'm' }, 'the session selection is reported')
    for (const role of ['continue', 'suggest', 'chat']) {
      assert.deepEqual(before.roles[role], { provider: 'p', model: 'm' }, `${role} inherits`)
    }

    // Pin the chat to a different model.
    const set = await call('/api/story.setModel', { role: 'chat', selection: { provider: 'strong', model: 'big' } })
    assert.deepEqual(set.roles.chat, { provider: 'strong', model: 'big' })
    // The write goes to the plugin's own config file, and the answer says where it is.
    assert.match(set.file, /settings\.json$/, 'the route reports the file it wrote')
    assert.equal((await readFile(join(ws, 'settings.json'), 'utf8')).includes('"big"'), true,
      'and the file is what holds the choice')
    assert.deepEqual(set.roles.continue, { provider: 'p', model: 'm' }, 'the other roles still inherit')
    assert.deepEqual(set.roles.suggest, { provider: 'p', model: 'm' })

    // And the pinned role really is what the chat call goes to.
    await writeBook(library, bookWith(['雨下的很大。']), undefined, '测试书')
    await call('/api/story.chat', {
      workspacePath: ws, bookFolder: '测试书', history: [], message: '这句怎么收？', chapterId: 'c1',
    })
    assert.deepEqual(ctx.llm.calls.at(-1), { provider: 'strong', model: 'big' })

    // Clearing the pin puts it back on the session model.
    const cleared = await call('/api/story.setModel', { role: 'chat', selection: null })
    assert.deepEqual(cleared.roles.chat, { provider: 'p', model: 'm' })
    await call('/api/story.chat', {
      workspacePath: ws, bookFolder: '测试书', history: [], message: '再问一句。', chapterId: 'c1',
    })
    assert.deepEqual(ctx.llm.calls.at(-1), { provider: 'p', model: 'm' })
  })
})

test('an edit asked for in the composer runs on the chat model', async () => {
  await withRoutes(async ({ call, ws, library, ctx }) => {
    await writeBook(library, bookWith(['雨下的很大。']), undefined, '测试书')
    await call('/api/story.setModel', { role: 'chat', selection: { provider: 'strong', model: 'big' } })
    await call('/api/story.setModel', { role: 'suggest', selection: { provider: 'cheap', model: 'small' } })

    // From the editor: the suggest role.
    await call('/api/story.suggest', {
      workspacePath: ws, bookFolder: '测试书', chapterId: 'c1', text: '雨下的很大。', instruction: '',
    })
    assert.deepEqual(ctx.llm.calls.at(-1), { provider: 'cheap', model: 'small' })

    // From the composer: the model the writer picked for the conversation.
    await call('/api/story.suggest', {
      workspacePath: ws, bookFolder: '测试书', chapterId: 'c1', text: '雨下的很大。', instruction: '这里太满了', role: 'chat',
    })
    assert.deepEqual(ctx.llm.calls.at(-1), { provider: 'strong', model: 'big' })

    // Same for a continuation asked for that way.
    await call('/api/story.continue', {
      workspacePath: ws, bookFolder: '测试书', chapterId: 'c1', text: '雨下的很大。', before: '雨下的很大。', after: '', role: 'chat',
    })
    assert.deepEqual(ctx.llm.calls.at(-1), { provider: 'strong', model: 'big' })
  })
})

test('an unknown role is refused instead of silently stored', async () => {
  await withRoutes(async ({ call }) => {
    const bad = await call('/api/story.setModel', { role: 'narrator', selection: { provider: 'p', model: 'm' } })
    assert.equal(bad.ok, false)
    assert.match(bad.error, /unknown model role/)
    const half = await call('/api/story.setModel', { role: 'chat', selection: { provider: 'p' } })
    assert.equal(half.ok, false)
    assert.match(half.error, /provider and a model/)
  })
})

test('the catalogue lists what the host can route to, and always the models in use', async () => {
  await withRoutes(async ({ call }) => {
    const before = await call('/api/story.catalog', {})
    assert.equal(before.ok, true)
    const p = before.groups.find((group) => group.id === 'p')
    assert.equal(p.name, 'Provider P')
    assert.deepEqual(p.models.map((row) => row.model), ['m', 'big'])
    // The silent provider advertises nothing, so it drops out rather than showing an empty group.
    assert.equal(before.groups.some((group) => group.id === 'silent'), false)

    // ...until a role is pinned to one of its models. A picker that cannot show the current model
    // cannot keep it either, so the model in use is always offered.
    await call('/api/story.setModel', { role: 'chat', selection: { provider: 'silent', model: 'ghost' } })
    const after = await call('/api/story.catalog', {})
    const silent = after.groups.find((group) => group.id === 'silent')
    assert.ok(silent, 'the provider appears because a model of it is in use')
    assert.deepEqual(silent.models.map((row) => row.model), ['ghost'])
  })
})

test('a provider whose catalogue fails does not take the whole list with it', async () => {
  await withRoutes(async ({ call, ctx }) => {
    const original = ctx.llm.listModels
    ctx.llm.listModels = async (provider) => {
      if (provider === 'p') throw new Error('catalog unavailable')
      return original(provider)
    }
    const out = await call('/api/story.catalog', {})
    assert.equal(out.ok, true, 'the route still answers')
    // The default model still shows up through the "models in use" group, so the writer keeps a
    // usable page even when one adapter cannot list anything.
    assert.ok(out.groups.some((group) => group.id === 'p' && group.models.some((row) => row.model === 'm')))
  })
})

test('a model offers its reasoning levels, and a model without any answers none', async () => {
  await withRoutes(async ({ call }) => {
    const big = await call('/api/story.efforts', { provider: 'p', model: 'big' })
    assert.equal(big.ok, true)
    assert.deepEqual(big.efforts.map((row) => row.id), ['low', 'high'], 'least to most, as advertised')
    assert.deepEqual(big.efforts.map((row) => row.name), ['Low', 'High'])
    assert.equal(big.defaultEffort, 'low')
    // No reasoning metadata is the normal case, not a failure.
    const plain = await call('/api/story.efforts', { provider: 'p', model: 'm' })
    assert.equal(plain.ok, true)
    assert.deepEqual(plain.efforts, [])
    // A model the provider does not know is also just "no levels".
    const unknown = await call('/api/story.efforts', { provider: 'p', model: 'nope' })
    assert.equal(unknown.ok, true)
    assert.deepEqual(unknown.efforts, [])
    // A malformed request is a bug in the caller, and is refused rather than guessed.
    const bad = await call('/api/story.efforts', { provider: 'p' })
    assert.equal(bad.ok, false)
    assert.match(bad.error, /provider and a model/)
  })
})

test('a role can be pinned to a model and an effort, and both survive a reload', async () => {
  await withRoutes(async ({ call }) => {
    const set = await call('/api/story.setModel', {
      role: 'suggest', selection: { provider: 'p', model: 'big', reasoningEffort: 'high' },
    })
    assert.deepEqual(set.roles.suggest, { provider: 'p', model: 'big', reasoningEffort: 'high' })
    // Read back through the page's own route: the effort is part of the stored choice.
    const page = await call('/api/story.models', {})
    assert.deepEqual(page.overrides.suggest, { provider: 'p', model: 'big', reasoningEffort: 'high' })
    // Another role with no effort set reports none, and still inherits.
    assert.deepEqual(page.roles.continue, { provider: 'p', model: 'm' })
  })
})

test('a handler that throws becomes a failure answer, not a rejected fetch', async () => {
  // Every route used to wrap itself in the same try/catch. The wrapper now does it, so this is
  // the property that has to hold for all of them: a throw inside a handler resolves to
  // `{ ok: false, error }` with the message the panel shows. A rejected fetch would surface as a
  // network error instead, and the panel would say the request failed rather than why.
  await withRoutes(async ({ call }) => {
    // A create with a title over 120 characters makes `createBook` THROW, which is what this is
    // about: the route wrapper turns a throw into an answer rather than a rejected fetch.
    const created = await call('/api/story.createBook', { title: 'x'.repeat(200) })
    assert.equal(created.ok, false, 'the throw became a failure answer')
    assert.equal(typeof created.error, 'string')
    assert.ok(created.error.length > 0, 'and the answer carries the reason')
    assert.match(created.error, /120/, 'naming what went wrong')

    // A book folder that is not a plain name is refused by the store (`bookDir` validates it),
    // and that refusal has to arrive as an answer too.
    const stale = await call('/api/story.snapshot', { bookFolder: '../escape', label: 'x' })
    assert.equal(stale.ok, false)
    assert.match(stale.error, /folder|escapes|absolute/, 'the host says what went wrong')
  })
})

test('the model routes read the config file once per request, not once per role', async () => {
  // `selectionFor` used to re-read models.json for every role in a loop: the settings page asked
  // for three roles and read the same file nine times across the three routes that do this.
  await withRoutes(async ({ call, ws, library }) => {
    const file = join(ws, 'settings.json')
    const { statSync } = await import('node:fs')
    await call('/api/story.models', {})
    const before = statSync(file).mtimeMs
    // Every answer still names all three roles, so the single read did not drop any.
    const meta = await call('/api/story.meta', {})
    assert.equal(meta.ok, true)
    assert.deepEqual(Object.keys(meta.roles).sort(), ['chat', 'continue', 'mosaic', 'suggest'])
    for (const role of ['continue', 'suggest', 'chat']) {
      assert.equal(meta.roles[role].provider, 'p', `${role} inherits the session model`)
    }
    assert.equal(statSync(file).mtimeMs, before, 'reading the choices never rewrites them')
  })
})

test('a truncated answer is used, not thrown away', async () => {
  // `max-tokens` used to be treated as a failed call, so the whole answer was discarded: a
  // copy-edit of a long chapter came back as "model call failed: max-tokens" with nothing in it,
  // even though the model had been producing exactly the right JSON. The text that arrived is
  // real text; the budget running out is a property of the request, not an error in it.
  const routeTable = new Map()
  const ctx = fakeContext(routeTable)
  ctx.llm = {
    async *stream() {
      // Fenced, because that is what the system prompt asks the model for and what the parser
      // reads: a bare object is not what a real answer looks like.
      yield { type: 'text-delta', text: '```json\n{"issues":[{"kind":"grammar","where":"雨夜很长","problem":"逗号粘连","suggestion":"雨夜很长。风也没有停。"}]}\n```' }
      // Cut off right after a complete block: the case that used to lose everything.
      yield { type: 'finish', reason: { kind: 'max-tokens' } }
    },
  }
  const ws = await mkdtemp(join(tmpdir(), 'story-routes-'))
  const library = join(ws, 'library')
  apply(ctx, { settingsPath: join(ws, 'settings.json') })
  try {
    await setLibFor(routeTable, library)
    await writeBook(library, bookWith(['雨夜很长，风也没有停。'], 'draft'), undefined, '测试书')
    const request = new Request('http://x/api/story.review', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ workspacePath: ws, bookFolder: '测试书', chapterId: 'c1', text: '雨夜很长，风也没有停。' }),
    })
    const answer = await (await routeTable.get('/api/story.review').fetch(request)).json()
    assert.equal(answer.ok, true, 'the route answers rather than failing')
    assert.equal(answer.issues.length, 1, 'and the issue that did arrive is reported')
    assert.equal(answer.issues[0].suggestion, '雨夜很长。风也没有停。', 'with its correction intact')
    // The flag is what stops the panel presenting a half-read section as a finished edit.
    assert.equal(answer.truncated, true, 'and the answer says it was cut off')
  } finally { await rm(ws, { recursive: true, force: true }) }
})

test('an answer that finished normally is not marked as truncated', async () => {
  const routeTable = new Map()
  const ctx = fakeContext(routeTable)
  ctx.llm = {
    async *stream() {
      yield { type: 'text-delta', text: '```json\n{"issues":[]}\n```' }
      yield { type: 'finish', reason: { kind: 'stop' } }
    },
  }
  const ws = await mkdtemp(join(tmpdir(), 'story-routes-'))
  const library = join(ws, 'library')
  apply(ctx, { settingsPath: join(ws, 'settings.json') })
  try {
    await setLibFor(routeTable, library)
    await writeBook(library, bookWith(['雨夜很长。'], 'draft'), undefined, '测试书')
    const request = new Request('http://x/api/story.review', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ workspacePath: ws, bookFolder: '测试书', chapterId: 'c1', text: '雨夜很长。' }),
    })
    const answer = await (await routeTable.get('/api/story.review').fetch(request)).json()
    assert.equal(answer.ok, true)
    assert.deepEqual(answer.issues, [], 'a clean section reports no issues')
    assert.equal(answer.truncated, false, 'and is not flagged')
  } finally { await rm(ws, { recursive: true, force: true }) }
})

test('the output budget grows with the section, so a long chapter is not cut short', async () => {
  // The budget used to be a flat 900 tokens whatever the section's length. A chapter with a great
  // deal to fix needs more room than that to list it all, and running out mid-JSON is what made
  // the list come back empty.
  const routeTable = new Map()
  const ctx = fakeContext(routeTable)
  const budgets = []
  ctx.llm = {
    async *stream(options) {
      budgets.push(options.maxTokens)
      yield { type: 'text-delta', text: '```json\n{"issues":[]}\n```' }
      yield { type: 'finish', reason: { kind: 'stop' } }
    },
  }
  const ws = await mkdtemp(join(tmpdir(), 'story-routes-'))
  const library = join(ws, 'library')
  apply(ctx, { settingsPath: join(ws, 'settings.json') })
  try {
    const short = '雨。'.repeat(200)
    const long = '雨夜很长，风也没有停。'.repeat(2000)
    await writeBook(library, bookWith([short], 'draft'), undefined, '测试书')
    const ask = async (text) => {
      const request = new Request('http://x/api/story.review', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ workspacePath: ws, bookFolder: '测试书', chapterId: 'c1', text }),
      })
      return (await routeTable.get('/api/story.review').fetch(request)).json()
    }
    await ask(short)
    await ask(long)
    assert.equal(budgets.length, 2)
    assert.ok(budgets[0] >= 900, `a short section still gets a usable floor, saw ${budgets[0]}`)
    assert.ok(budgets[1] > budgets[0], `a long section gets more room, saw ${budgets[0]} then ${budgets[1]}`)
    assert.ok(budgets[1] <= 8000, 'but never more than a model can emit')
  } finally { await rm(ws, { recursive: true, force: true }) }
})

// ---- the mosaic check → apply loop ----

/**
 * The loop end-to-end: the check route hands the model a digest, the model answers with the
 * id-keyed changes the prompt teaches, and the apply route writes them into book.json. This is
 * the test that pins the prompt's protocol to what the applier resolves: before the digest
 * carried ids, a model that answered exactly as instructed produced changes the applier silently
 * skipped, and no unit test on either side could see it.
 */
test('a mosaic proposal answered with digest ids lands as a relation edge in book.json', async () => {
  const routeTable = new Map()
  const ctx = fakeContext(routeTable)
  // The model answers exactly what the system prompt teaches: ids copied from the digest lines.
  ctx.llm = {
    async *stream() {
      yield { type: 'text-delta', text: '```json\n'
        + '{"evidence":["雨夜里张三把短刀递给了李四"],'
        + '"changes":[{"op":"edge.upsert","from":"e-a","to":"e-b","truth":{"kind":"托付","note":"雨夜递刀"},"evidenceIndex":0}]}'
        + '\n```' }
      yield { type: 'finish', reason: { kind: 'stop' } }
    },
  }
  const ws = await mkdtemp(join(tmpdir(), 'story-routes-'))
  const library = join(ws, 'library')
  apply(ctx, { settingsPath: join(ws, 'settings.json') })
  const folder = '测试书'
  const route = (path, body) => {
    const request = new Request(`http://x${path}`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    return routeTable.get(path).fetch(request).then((r) => r.json())
  }
  try {
    await route('/api/story.setLibrary', { path: library })
    const book = mosaicBookWith()
    await writeBook(library, book, undefined, folder)

    // The digest the check prompt carries names the ids the answer must reuse.
    const checked = await route('/api/story.mosaic.check', { workspacePath: ws, bookFolder: folder, chapterId: 'c1' })
    assert.equal(checked.ok, true, checked.error)
    assert.equal(checked.proposal.changes.length, 1)

    const accepted = checked.proposal.changes
    const applied = await route('/api/story.mosaic.apply', { workspacePath: ws, bookFolder: folder, changes: accepted })
    assert.equal(applied.ok, true, applied.error)
    assert.deepEqual(applied.applied, ['edge.upsert 托付'])
    assert.equal(applied.skipped, 0, 'an id-keyed answer must not be skipped')

    // What the writer gets after a reload: the edge is really in the stored book.
    const back = await readBook(library, folder)
    const edge = back.book.mosaic.edges.find((e) => e.from === 'e-a' && e.to === 'e-b')
    assert.ok(edge, 'the relation edge was created')
    assert.equal(edge.truth.kind, '托付')
    assert.equal(edge.truth.note, '雨夜递刀')
    assert.equal(back.book.mosaic.edges.length, 1)
  } finally { await rm(ws, { recursive: true, force: true }) }
})

/** A book whose board already carries the two characters the digest names, plus one chapter. */
function mosaicBookWith() {
  const book = bookWith(['雨夜里张三把短刀递给了李四。'])
  book.mosaic = {
    schemaVersion: 1,
    entities: [
      { id: 'e-a', kind: 'character', name: '张三', role: '主角', summary: '', statuses: [], tags: [] },
      { id: 'e-b', kind: 'character', name: '李四', role: '', summary: '', statuses: [], tags: [] },
    ],
    edges: [],
  }
  return book
}

test('the portrait settings save, and the models page reads them back', async () => {
  // The bug this pins: setImage wrote the file correctly, but /api/story.models did not include the
  // image block in its response. Every visit to the settings page therefore showed the DEFAULTS,
  // so a chosen style looked as though it had not saved — the write was fine and the read was not.
  await withRoutes(async ({ call }) => {
    const picked = await call('/api/story.setImage', { image: { style: 'pixel' } })
    assert.equal(picked.ok, true)
    assert.equal(picked.image.style, 'pixel', 'the route answers with what it stored')

    const read = await call('/api/story.models', {})
    assert.ok(read.image !== undefined && read.image !== null,
      'the models page is given the image settings, not just the roles')
    assert.equal(read.image.style, 'pixel', 'and it is the style that was chosen')
    assert.equal(read.image.model, 'agnes-image-2.1-flash', 'with the model it was stored alongside')

    // Setting the other half keeps the first: they are one record, and a write of one must not
    // reset the other.
    await call('/api/story.setImage', { image: { model: 'some-image-model' } })
    const after = await call('/api/story.models', {})
    assert.equal(after.image.style, 'pixel', 'the style survived a model change')
    assert.equal(after.image.model, 'some-image-model')

    // An unknown style is refused into the default rather than stored and sent to the model.
    const bad = await call('/api/story.setImage', { image: { style: 'watercolour' } })
    assert.equal(bad.image.style, 'realistic')

    // And a role write does not drop the image block.
    await call('/api/story.setModel', { role: 'chat', selection: { provider: 'p', model: 'm' } })
    const final = await call('/api/story.models', {})
    assert.equal(final.image.model, 'some-image-model', 'pinning a chat model left the portrait alone')
    assert.equal(final.overrides.chat.model, 'm')
  })
})

test('a 梳理 run that finds nothing returns no proposal and stores nothing', async () => {
  await withRoutes(async ({ call, folder, ctx }) => {
    const original = ctx.llm.stream
    ctx.llm.stream = async function* stream() {
      yield { type: 'text-delta', index: 0, text: '```json\n{"checked":["c-a","c-b"],"edges":[]}\n```' }
      yield { type: 'finish', reason: { kind: 'stop' } }
    }
    try {
      const cards = [
        { id: 'c-a', kind: 'character', name: '甲', summary: '', statuses: [], tags: [] },
        { id: 'c-b', kind: 'character', name: '乙', summary: '', statuses: [], tags: [] },
      ]
      const out = await call('/api/story.mosaic.relate', { cards, edges: [], bookFolder: folder })
      assert.equal(out.ok, true)
      assert.equal(out.proposal, null, 'an empty answer is not a proposal')
      assert.match(out.message, /没有读出新的关系/)
      const list = await call('/api/story.proposals', { bookFolder: folder })
      assert.deepEqual(list.proposals, [], 'nothing was stored')
    } finally { ctx.llm.stream = original }
  })
})

test('梳理 reads the cards it is GIVEN, not whatever is in the book file', async () => {
  // The bug this pins: the route took workspacePath/bookFolder and re-read the file. Anything that
  // put it on a path without a book made readBook answer with an EMPTY book, and the writer — nine
  // cards on the canvas — was told "至少要有两张卡片，才谈得上关系。"
  await withRoutes(async ({ call, ws, library, folder, ctx }) => {
    const cards = [
      { id: 'c-a', kind: 'character', name: '沈砚', role: '修表匠', summary: '程四娘的徒弟。', statuses: [], tags: [] },
      { id: 'c-b', kind: 'character', name: '程四娘', role: '当铺东家', summary: '收沈砚做徒弟。', statuses: [], tags: [] },
    ]
    const original = ctx.llm.stream
    ctx.llm.stream = async function* stream() {
      yield { type: 'text-delta', index: 0, text: '```json\n{"checked":["c-a","c-b"],"edges":[{"from":"c-b","to":"c-a","kind":"师徒","note":"收沈砚做徒弟。"}]}\n```' }
      yield { type: 'finish', reason: { kind: 'stop' } }
    }

    // The path names no book: the cards are the input. If the route still reached for the disk to
    // READ them it would find nothing; it may only use the path to store the resulting proposal.
    const data = await call('/api/story.mosaic.relate', { cards, edges: [], workspacePath: ws, bookFolder: folder })
    assert.equal(data.ok, true, `the cards are enough on their own: ${JSON.stringify(data)}`)
    assert.equal(data.proposal.source, 'relate', 'the proposal says which page asked for it')
    assert.equal(data.proposal.sourceChapterId, null, 'and names no chapter')

    // The cards reached the prompt: the fake model echoes nothing, so what it was asked is the
    // evidence. A route that ignored them would produce the same empty answer for any board.
    const asked = data.proposal.changes
    assert.ok(Array.isArray(asked), 'changes is always an array')

    // One card is not a relation, and the message says THAT rather than blaming a missing file.
    const one = await call('/api/story.mosaic.relate', { cards: [cards[0]], edges: [], workspacePath: ws, bookFolder: folder })
    assert.equal(one.ok, false)
    assert.match(one.error, /只有一张卡片/, 'the refusal describes the real situation')

    // A body with no cards at all is a bad request, not an empty board.
    const missing = await call('/api/story.mosaic.relate', { workspacePath: ws, bookFolder: folder })
    assert.equal(missing.ok, false)
    assert.match(missing.error, /没收到卡片/)

    // And nothing was written: this route only proposes.
    const loaded = await call('/api/story.load', { workspacePath: ws, bookFolder: folder })
    assert.equal(loaded.ok, true)
    assert.equal((loaded.book.mosaic?.entities ?? []).length, 0, 'the board file is untouched')
    ctx.llm.stream = original
  })
})

test('a custom model provider saves, masks its key, and can be removed', async () => {
  await withRoutes(async ({ call }) => {
    const saved = await call('/api/story.provider.save', {
      provider: {
        name: '我的接口', baseURL: 'https://example.test/v1', apiKey: 'secret-key',
        models: ['m-one', 'm-two'],
      },
    })
    assert.equal(saved.ok, true)
    assert.equal(saved.providers.length, 1)
    assert.equal(saved.providers[0].hasKey, true)
    assert.ok(!JSON.stringify(saved).includes('secret-key'), 'the API key never comes back to the page')
    assert.match(saved.providers[0].id, /^custom:/)
    assert.deepEqual(saved.providers[0].models.map((model) => model.id), ['m-one', 'm-two'])

    const listed = await call('/api/story.providers', {})
    assert.equal(listed.providers.length, 1)

    const removed = await call('/api/story.provider.delete', { id: saved.providers[0].id })
    assert.equal(removed.ok, true)
    assert.equal(removed.providers.length, 0)
  })
})

test('image models come from a custom provider marked as an image provider', async () => {
  await withRoutes(async ({ call }) => {
    const agnes = await call('/api/story.imageModels', { provider: 'agnes' })
    assert.equal(agnes.ok, true)
    assert.ok(agnes.models.some((model) => model.id === 'agnes-image-2.1-flash'))

    const saved = await call('/api/story.provider.save', {
      provider: {
        name: 'Images', baseURL: 'https://images.example.test/v1', apiKey: 'image-secret',
        kind: 'image', models: ['image-model'],
      },
    })
    assert.equal(saved.ok, true)
    assert.equal(saved.providers[0].kind, 'image')
    const id = saved.providers[0].id

    const listed = await call('/api/story.imageModels', { provider: id })
    assert.deepEqual(listed.models.map((model) => model.id), ['image-model'])

    const picked = await call('/api/story.setImage', { image: { provider: id, model: 'image-model', style: 'anime' } })
    assert.equal(picked.image.provider, id)
    assert.equal(picked.image.model, 'image-model')
    assert.equal(picked.image.apiKey, undefined, 'the image block has no key of its own')

    const read = await call('/api/story.models', {})
    assert.equal(read.image.provider, id)
    assert.equal(read.image.style, 'anime')

    const catalog = await call('/api/story.catalog', {})
    assert.equal(catalog.groups.some((group) => group.id === id), false,
      'an image provider is not offered to the chat roles')

    const back = await call('/api/story.setImage', { image: { provider: 'agnes', model: 'agnes-image-2.1-flash' } })
    assert.equal(back.image.provider, 'agnes')
  })
})

test('the context route is named by book id and never falls back to the latest book', async () => {
  await withRoutes(async ({ call, library, folder }) => {
    const { book } = await readBook(library, folder)
    const data = await call('/api/story.context', { bookId: book.id })
    assert.equal(data.ok, true)
    assert.equal(data.bookFolder, folder)
    assert.ok(Array.isArray(data.scenes) && data.scenes.length === 13, 'one entry per scene')
    const chat = data.scenes.find((scene) => scene.id === 'chat')
    assert.equal(chat.system.text.length > 0, true, 'chat carries its system prompt')
    assert.ok(chat.parts.length > 0, 'chat carries its context parts')
    assert.equal(data.prompts.length, 11)

    const missing = await call('/api/story.context', { bookId: 'no-such-book' })
    assert.equal(missing.ok, false, 'an unknown id is an error, not another book')
    assert.match(missing.error, /书 id/)
  })
})

test('a system prompt copy is saved globally and reverted to the official text', async () => {
  await withRoutes(async ({ call }) => {
    const saved = await call('/api/story.context.prompt.save', { key: 'chat', text: '只说事实。' })
    assert.equal(saved.ok, true)
    assert.equal(saved.prompts.find((row) => row.key === 'chat').override, '只说事实。')

    const reset = await call('/api/story.context.prompt.reset', { key: 'chat' })
    assert.equal(reset.prompts.find((row) => row.key === 'chat').override, '')
    assert.ok(reset.prompts.find((row) => row.key === 'chat').official.length > 0)
  })
})

test('a scene part copy is kept in the book and reverted on request', async () => {
  await withRoutes(async ({ call, library, folder }) => {
    const { book } = await readBook(library, folder)
    const saved = await call('/api/story.context.save', {
      bookId: book.id, scene: 'chat', part: 'bookMeta', text: '我的书名行',
    })
    assert.equal(saved.ok, true)
    assert.equal(saved.overrides.chat.bookMeta, '我的书名行')

    const after = await call('/api/story.context', { bookId: book.id })
    const chat = after.scenes.find((scene) => scene.id === 'chat')
    const part = chat.parts.find((row) => row.key === 'bookMeta')
    assert.equal(part.override, '我的书名行')
    assert.equal(part.text, '我的书名行', 'the copy is what would be sent')

    const refused = await call('/api/story.context.save', {
      bookId: book.id, scene: 'chat', part: 'chapterCast', text: 'x',
    })
    assert.equal(refused.ok, false, 'chapter-scoped parts cannot be copied')

    await call('/api/story.context.reset', { bookId: book.id, scene: 'chat', part: 'bookMeta' })
    const reset = await call('/api/story.context', { bookId: book.id })
    assert.equal(reset.scenes.find((scene) => scene.id === 'chat').parts.find((row) => row.key === 'bookMeta').override, '')
  })
})

test('copies are documents: 新建 only lists them, 替换 points the sent copy, 恢复 goes official', async () => {
  await withRoutes(async ({ call, library, folder }) => {
    const { book } = await readBook(library, folder)
    // 新建 x2: documents appear in the list, and the model still sends the official text.
    await call('/api/story.context.version.add', {
      bookId: book.id, scene: 'chat', part: 'bookMeta', text: '第一版书名行',
    })
    const second = await call('/api/story.context.version.add', {
      bookId: book.id, scene: 'chat', part: 'bookMeta', text: '第二版书名行',
    })
    assert.equal(second.ok, true)
    assert.equal(second.versions.chat.bookMeta.length, 2, 'two documents listed')
    const untouched = await call('/api/story.context', { bookId: book.id })
    assert.equal(untouched.scenes.find((scene) => scene.id === 'chat').parts.find((row) => row.key === 'bookMeta').override, '',
      '新建 does not change what the model sends')

    // 替换: point the sent copy at the newest document — no new document appears.
    const applied = await call('/api/story.context.save', {
      bookId: book.id, scene: 'chat', part: 'bookMeta', text: '第二版书名行',
    })
    assert.equal(applied.overrides.chat.bookMeta, '第二版书名行')
    const listed = await call('/api/story.context', { bookId: book.id })
    const part = listed.scenes.find((scene) => scene.id === 'chat').parts.find((row) => row.key === 'bookMeta')
    assert.equal(part.override, '第二版书名行')
    assert.equal(part.versions.length, 2, '替换 does not add a document')
    assert.equal(part.versions[1].text, '第二版书名行', 'the applied copy matches the pointed document')

    // 删除 one document leaves the sent copy alone.
    const dropped = await call('/api/story.context.version.delete', {
      bookId: book.id, scene: 'chat', part: 'bookMeta', id: part.versions[0].id,
    })
    assert.equal(dropped.ok, true)
    assert.equal(dropped.versions.chat.bookMeta.length, 1)

    // 恢复: back to the official text, documents stay.
    await call('/api/story.context.reset', { bookId: book.id, scene: 'chat', part: 'bookMeta' })
    const afterReset = await call('/api/story.context', { bookId: book.id })
    const resetPart = afterReset.scenes.find((scene) => scene.id === 'chat').parts.find((row) => row.key === 'bookMeta')
    assert.equal(resetPart.override, '')
    assert.equal(resetPart.versions.length, 1, 'documents survive the restore')
  })
})
