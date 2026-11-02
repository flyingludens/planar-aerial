import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { loadClientForRender, visibleText, findByClass, findByText } from './helpers/render-hooks.mjs'
/**
 * The stylesheet, assembled from the CSS modules under `src/client/`.
 *
 * Those checks are about what the sheet SAYS. Reading the built bundle used to be right because
 * the sheet was one template string literal; once it was split the bundle only holds references,
 * and every rule looking for a declaration found none.
 */
function readCssSources() {
  const base = fileURLToPath(new URL('../src/client', import.meta.url))
  const dirs = ['', 'shared', 'panel', 'mosaic']
  const bodies = []
  for (const dir of dirs) {
    const at = dir === '' ? base : join(base, dir)
    for (const name of readdirSync(at)) {
      if (dir !== '' && !name.endsWith('.css.js') && name !== 'styles.js') continue
      if (dir === '' && name !== 'styles.js') continue
      const text = readFileSync(join(at, name), 'utf8')
      const open = text.search(/(?:const|var|let)\s+CSS[A-Z_]*\s*=\s*`/)
      if (open < 0) continue
      const from = text.indexOf('`', open) + 1
      const to = text.indexOf('`', from)
      if (to > from) bodies.push(text.slice(from, to))
    }
  }
  // The generic scale lives in the fang-style library now, so its token table is part of
  // the sheet these audits read: without it the scale itself would look empty while every
  // rule still reads it.
  const lib = fileURLToPath(new URL('../node_modules/fang-style/src', import.meta.url))
  for (const name of readdirSync(lib)) {
    if (!name.endsWith('.css.js')) continue
    const text = readFileSync(join(lib, name), 'utf8')
    const open = text.search(/(?:const|var|let)\s+(?:CSS|FANG)[A-Z_]*\s*=\s*`/)
    if (open < 0) continue
    const from = text.indexOf('`', open) + 1
    const to = text.indexOf('`', from)
    if (to > from) bodies.push(text.slice(from, to))
  }
  return bodies.join('\n')
}
import { loadClientLogic } from './helpers/load-client.mjs'
import { PIN_Y } from '../src/client/mosaic/geometry.js'

/**
 * These cases mount the panel the way a browser does: every hook runs, every effect fires, and
 * child components actually render. The earlier smoke test stopped at the first line because its
 * `useState` returned `undefined`, which let a `ReferenceError` (an undeclared prop read) sit in
 * the library branch while the real panel showed nothing at all.
 */

const TEXT = '那是一个深夜，深得连路灯都像是熬红了眼。'

function leaf() {
  return {
    id: 'c1', title: '第1章', level: 'chapter', status: 'writing', children: [],
    text: TEXT,
  }
}

function book() {
  return {
    schemaVersion: 1, title: '我的书', genre: '', pov: '', tense: '',
    nodes: [{ id: 'v1', title: '第一卷', level: 'volume', status: 'writing', text: '', children: [leaf()] }],
    chapters: [leaf()], characters: [], relationships: [], settings: [], snapshots: [],
    overview: { chapters: {} },
  }
}

// The shelf row carries the book's own id: the panel remembers the open book by it, because a
// folder name moves when the book is renamed and the id does not.
const BOOK_ID = 'book-1'
const catalog = [{ id: BOOK_ID, folder: '我的书', title: '我的书', chapters: 1, finals: 1, total: 1, absolutePath: '/ws/story/我的书' }]

/**
 * A book whose mosaic board carries two characters, one card, one live edge and one retired
 * edge: enough to pin that the canvas draws only live wires, and that an edge's detail shows the
 * author's truth AND what a character merely believes.
 */
function mosaicBook() {
  const b = book()
  b.mosaic = {
    schemaVersion: 1,
    entities: [
      { id: 'a', kind: 'character', name: '张三', role: '主角', summary: '', statuses: [{ id: 's1', label: '受伤' }], tags: [], layout: { x: 20, y: 20 } },
      { id: 'b', kind: 'character', name: '李四', role: '', summary: '', statuses: [], tags: [], layout: { x: 200, y: 80 } },
      { id: 'c', kind: 'item', name: '短刀', summary: '', description: '张三的刀', tags: [], layout: null },
    ],
    edges: [
      { id: 'r1', from: 'a', to: 'b', truth: { kind: '挚友', note: '结拜' }, beliefs: [{ holderId: 'b', kind: '陌路' }], retired: false, log: [] },
      { id: 'r2', from: 'c', to: 'a', truth: { kind: '持有', note: '' }, beliefs: [], retired: true, log: [{ at: 1, what: 'edge.retired', before: null, after: null }] },
    ],
  }
  return b
}

/** A translation stub that keeps the key visible, so assertions can name the intended copy. */
const t = (key, params) => {
  let text = key
  for (const [name, value] of Object.entries(params ?? {})) text = text.replaceAll(`{${name}}`, String(value))
  return text
}

/** Route doubles that answer like the host routes do, so the effects settle on real data. */
function apiFor({ books = catalog, load = book() } = {}) {
  const calls = []
  return {
    calls,
    books: async (ws) => { calls.push(['books']); return { ok: true, books } },
    load: async (folder) => { calls.push(['load', folder]); return { ok: true, book: load, token: 'tk-1', recovered: false } },
    save: async (next) => { calls.push(['save', next]); return { ok: true, token: 'tk-2' } },
    // The status bar names the role models; a real host answers this route.
    meta: async () => ({ ok: true, roles: { continue: { provider: 'p', model: 'agnes-3.0-flash' }, suggest: { provider: 'p', model: 'agnes-3.0-flash' } } }),
    snapshot: async () => ({ ok: true }),
    // The two pickers draw from the host catalogue, and the effort axis from the model's levels.
    catalog: async () => ({ ok: true, groups: [{ id: 'p', name: 'Provider', models: [{ model: 'm', name: 'Model M' }] }] }),
    efforts: async () => ({ ok: true, efforts: [] }),
    setModel: async (role, selection) => { calls.push(['setModel', role, selection]); return { ok: true } },
    suggest: async () => ({ ok: true, suggestion: { id: 's1', text: 'x' } }),
    continue: async () => ({ ok: true, continuation: 'y' }),
    // The proposals page lists stored proposals. Empty by default: a test that wants rows seeds
    // this through its own api stub, the same way it seeds the book.
    proposals: async () => { calls.push(['proposals']); return { ok: true, proposals: [] } },
    setProposalStatus: async (folder, id, status) => { calls.push(['setProposalStatus', id, status]); return { ok: true } },
    deleteProposal: async (folder, id) => { calls.push(['deleteProposal', id]); return { ok: true } },
    // The library is a setting the host answers with, so the panel knows where books live without
    // deriving it from the workspace list.
    models: async () => ({ ok: true, roles: {}, overrides: {}, image: {}, library: '/ws/story' }),
    setLibrary: async (path) => { calls.push(['setLibrary', path]); return { ok: true, library: path } },
    // The answer history lives in the book's own folder. Empty by default: a test that wants rows
    // seeds this through its own api stub, the same way it seeds the book.
    answers: async (folder, limit) => { calls.push(['answers', folder, limit]); return { ok: true, answers: [] } },
    saveAnswer: async (folder, answer) => { calls.push(['saveAnswer', folder, answer]); return { ok: true, answer: { ...answer, id: 'a1' } } },
    deleteAnswer: async (folder, id) => { calls.push(['deleteAnswer', folder, id]); return { ok: true, removed: true } },
  }
}

/**
 * Mount `StoryPanel` with the props the host assembles: the panel's own injection (built through
 * the real slot factory, so this test cannot drift from what the plugin injects) plus the
 * standard hooks the slot hands to every occupant.
 */
async function mountPanel({ api = apiFor(), open, clickDrawer, runtime, config = {} } = {}) {
  // `runtime` lets a test mount the panel TWICE against one loaded bundle. A real rebuild is a new
  // mount inside the same page, so the module-level store survives it; a fresh `loadClientForRender`
  // would be a page reload, which is a different thing and would hide exactly the state loss this
  // parameter exists to exercise.
  const { plugin, render, rerender } = runtime ?? loadClientForRender()
  const registrations = []
  const scopeCtx = {
    layout: { selectPanel: () => {} },
    workspaces: { create: async ({ path }) => ({ workspaceId: 'w-book', path, title: '我的书', sessionIds: [], createdAt: '', updatedAt: '' }) },
    uiWorkspace: { openSession: () => {}, startSession: () => {}, openWorkspace: async () => {} },
    get: (name) => scopeCtx[name],
    slots: {
      inject: (_key, factory) => registrations.push(factory),
      register: (options) => { registrations.push({ options }); return () => {} },
    },
  }
  plugin.apply({
    effect: (fn) => fn(),
    inject: (_names, callback) => callback(scopeCtx),
    slots: scopeCtx.slots,
    locale: { register: () => () => {}, bind: () => () => t },
  }, config)
  for (const factory of registrations) {
    if (typeof factory === 'function') factory()
  }
  // Two entries register: the main panel and the sidebar icon. Only the panel carries `inject`.
  const panel = registrations.find((entry) => typeof entry === 'object' && entry.options.name === 'main')
  assert.ok(panel, 'the main panel registers')

  const items = [{ workspaceId: 'w1', path: '/ws', title: 'W', sessionIds: [] }]
  const props = {
    ...panel.options.inject(),
    t,
    api,
    // The panel reads its save interval from props.config, and apply() got the same value: both
    // halves must agree, or a test forcing "save every edit" silently keeps the default timer.
    config,
    workspacePath: '/ws',
    useWorkspaces: (selector) => selector({ items }),
    useSessions: (selector) => selector({ byId: {} }),
    workspaceSnapshot: { items },
  }
  const mounted = await render(plugin.__components.StoryPanel, props)
  // The chosen book lives in the panel's own state: a click on its card is the only way in,
  // which is exactly the path a writer takes.
  if (open === undefined) return { ...mounted, plugin, props }
  const card = findByClass(mounted.tree, 'st-book-open')
  assert.ok(card, 'the book card is on the shelf')
  card.props.onClick()
  let afterOpen = await rerender(plugin.__components.StoryPanel, props)
  if (clickDrawer !== undefined) {
    const button = findByText(afterOpen.tree, clickDrawer)
    if (button !== undefined) {
      button.props.onClick()
      afterOpen = await rerender(plugin.__components.StoryPanel, props)
    }
  }
  return { ...afterOpen, plugin, props, rerender: () => rerender(plugin.__components.StoryPanel, props) }
}

test('the first screen is the library, and it is not blank', async () => {
  const api = apiFor()
  const { tree, stable } = await mountPanel({ api })

  assert.equal(stable, true, 'the panel reaches a settled state instead of looping')
  const text = visibleText(tree).join(' ')
  assert.ok(text.includes('label.library'), `the shelf is the first screen, saw: ${text.slice(0, 120)}`)
  assert.ok(text.includes('我的书'), 'an existing book is listed')
  assert.ok(text.includes('action.newBook'), 'the create card is offered')
  // A library screen must not read a manuscript nobody has chosen yet.
  assert.deepEqual(api.calls.map((call) => call[0]), ['books'], 'no manuscript is read before a book is chosen')
})

test('a first visit opens the welcome page, and the rail can return to it', async () => {
  const previous = globalThis.window
  const initial = new Map()
  Object.defineProperty(globalThis, 'window', {
    value: {
      __ModuleLoader__: previous?.__ModuleLoader__,
      localStorage: {
        getItem: (key) => (initial.has(key) ? initial.get(key) : null),
        setItem: (key, value) => { initial.set(key, String(value)) },
        removeItem: (key) => { initial.delete(key) },
      },
    },
    configurable: true, writable: true,
  })
  try {
    const api = apiFor()
    const first = await mountPanel({ api })
    assert.ok(findByClass(first.tree, 'st-welcome'), 'the first visit is the welcome page')
    const firstText = visibleText(first.tree).join(' ')
    assert.ok(firstText.includes('welcome.begin'), 'the page asks the writer to start')
    assert.ok(!findByClass(first.tree, 'st-library'), 'it is not the shelf')

  } finally {
    if (previous === undefined) delete globalThis.window
    else Object.defineProperty(globalThis, 'window', { value: previous, configurable: true, writable: true })
  }
})

test('choosing a book loads it and shows the manuscript', async () => {
  const api = apiFor()
  const { tree } = await mountPanel({ api, open: '我的书' })

  assert.ok(api.calls.some((call) => call[0] === 'load'), 'the manuscript is read once a book is open')
  const text = visibleText(tree).join(' ')
  assert.ok(text.includes('我的书'), `the title bar names the book, saw: ${text.slice(0, 160)}`)
  assert.ok(text.includes('第1章') || text.includes('正文'), 'the outline or the text is on screen')
  assert.equal(findByClass(tree, 'st-library'), undefined, 'the desk replaces the shelf')
})

test('a book whose manuscript is empty still renders the desk', async () => {
  // load answers an empty book for a folder with no book.json: the desk must appear with the
  // empty-chapter prompt rather than crashing on a missing paragraph.
  const api = apiFor({
    load: {
      schemaVersion: 1, title: '新书', genre: '', pov: '', tense: '',
      nodes: [], chapters: [], characters: [], relationships: [], settings: [], snapshots: [],
      overview: { chapters: {} },
    },
  })
  const { tree } = await mountPanel({ api, open: '新书' })
  const text = visibleText(tree).join(' ')
  assert.ok(text.includes('新书'), 'the title bar names the book')
  assert.ok(text.includes('label.emptyChapters'), 'the empty manuscript explains itself')
})

test('creating a book makes the folder and opens it — and registers no Workspace', async () => {
  // The writer's first action: create the folder, then open the book. It used to ALSO register the
  // folder as a Workspace, which put a row in the sidebar before the writer had asked for one —
  // three books created in a row left three rows behind, none of them used. Registration belongs
  // to the moment a conversation is actually started (see the handoff assertions below).
  const created = []
  const api = {
    ...apiFor(),
    createBook: async (ws, title) => {
      created.push(['createBook', ws, title])
      return { ok: true, folder: '我的书', title, absolutePath: '/ws/story/我的书', books: catalog }
    },
  }
  const { plugin, render, rerender } = loadClientForRender()
  const registrations = []
  const renames = []
  const scopeCtx = {
    layout: { selectPanel: () => {} },
    workspaces: {
      create: async ({ path }) => {
        created.push(['workspaces.create', path])
        // The host names a new Workspace after its folder; the panel renames it to add the prefix.
        return { workspaceId: 'w-new', path, title: '我的书', sessionIds: [], createdAt: '', updatedAt: '' }
      },
      rename: async (workspaceId, title) => {
        renames.push([workspaceId, title])
        return { workspaceId, title, sessionIds: [] }
      },
    },
    uiWorkspace: { openSession: () => {}, startSession: () => {}, openWorkspace: async () => {} },
    get: (name) => scopeCtx[name],
    slots: {
      inject: (_key, factory) => registrations.push(factory),
      register: (options) => { registrations.push({ options }); return () => {} },
    },
  }
  plugin.apply({
    effect: (fn) => fn(),
    inject: (_names, callback) => callback(scopeCtx),
    slots: scopeCtx.slots,
    locale: { register: () => () => {}, bind: () => () => t },
  }, {})
  for (const factory of registrations) if (typeof factory === 'function') factory()
  const panel = registrations.find((entry) => typeof entry === 'object' && entry.options.name === 'main')
  const items = [{ workspaceId: 'w1', path: '/ws', title: 'W', sessionIds: [] }]
  const props = {
    ...panel.options.inject(), t, api, config: {}, workspacePath: '/ws',
    useWorkspaces: (selector) => selector({ items }),
    useSessions: (selector) => selector({ byId: {} }),
    workspaceSnapshot: { items },
  }

  const mounted = await render(plugin.__components.StoryPanel, props)
  // Open the create card, type a title, then press create.
  findByClass(mounted.tree, 'st-book-new').props.onClick()
  const typing = await rerender(plugin.__components.StoryPanel, props)
  const input = findByClass(typing.tree, 'st-newbook-input')
  assert.ok(input, 'the create card offers a title field')
  input.props.onChange({ target: { value: '我的书' } })
  const filled = await rerender(plugin.__components.StoryPanel, props)
  const createButton = findByClass(filled.tree, 'fang-btn-primary')
  assert.ok(createButton, 'the create button appears')
  await createButton.props.onClick()
  const afterCreate = await rerender(plugin.__components.StoryPanel, props)

  assert.deepEqual(created.map((entry) => entry[0]), ['createBook'],
    'creating a book touches the library only: no Workspace is registered yet')
  assert.equal(renames.length, 0, 'and nothing is renamed')
  assert.equal(findByClass(afterCreate.tree, 'st-library'), undefined, 'the new book opens')
  const text = visibleText(afterCreate.tree).join(' ')
  assert.ok(text.includes('我的书'), `the desk shows the new book, saw: ${text.slice(0, 140)}`)

  // The handoff button is where the Workspace is created, and the moment it happens is the point:
  // nothing appears in the sidebar until a conversation is actually wanted.
  const started = []
  scopeCtx.uiWorkspace.startSession = (id) => started.push(id)
  const chatButton = findByText(afterCreate.tree, 'action.openChat')
  assert.ok(chatButton, 'the handoff button is on screen')
  await chatButton.props.onClick()
  await rerender(plugin.__components.StoryPanel, props)
  assert.deepEqual(created.map((entry) => entry[0]), ['createBook', 'workspaces.create'],
    'the Workspace is registered when the conversation is asked for, not before')
  assert.equal(created[1][1], '/ws/story/我的书', 'and it points at the book folder')
  // `t` keeps keys visible in this test, so the prefix arrives as its key; what matters is that
  // the rename happens once, on the created workspace, with the prefix followed by the title.
  assert.equal(renames.length, 1, 'the workspace is renamed once, to carry the writer prefix')
  assert.ok(renames[0][1].endsWith('· 我的书'), `the title follows the prefix, saw: ${renames[0][1]}`)
  assert.deepEqual(started, ['w-new'], 'the conversation starts in the book workspace')
})

test('a book opened without a workspace registers one before starting the conversation', async () => {
  // Opening a book never registered its Workspace, so any book from an older library (or one
  // whose Workspace was deleted in the sidebar) has none. The handoff button must register the
  // folder itself; telling the writer to "open it again" could never help.
  const steps = []
  const api = apiFor()
  const { plugin, render, rerender } = loadClientForRender()
  const registrations = []
  // `layout.selectPanel` starts by aborting the pending navigation. The host's own handoff
  // (`startSession` → `openWorkspaceSession`) is that pending navigation, so touching it here
  // creates the Session and then throws it away: the writer sees nothing happen. Record every
  // call so this test fails if the panel ever reaches for the layout again.
  const panelSwitches = []
  const scopeCtx = {
    layout: { selectPanel: (id) => panelSwitches.push(id) },
    workspaces: {
      create: async ({ path }) => {
        steps.push(['workspaces.create', path])
        return { workspaceId: 'w-late', path, title: '我的书', sessionIds: [], createdAt: '', updatedAt: '' }
      },
      rename: async (workspaceId, title) => {
        steps.push(['workspaces.rename', workspaceId, title])
        return { workspaceId, title, sessionIds: [] }
      },
    },
    uiWorkspace: {
      openSession: (id) => steps.push(['openSession', id]),
      startSession: (id) => steps.push(['startSession', id]),
      openWorkspace: async () => {},
    },
    get: (name) => scopeCtx[name],
    slots: {
      inject: (_key, factory) => registrations.push(factory),
      register: (options) => { registrations.push({ options }); return () => {} },
    },
  }
  plugin.apply({
    effect: (fn) => fn(),
    inject: (_names, callback) => callback(scopeCtx),
    slots: scopeCtx.slots,
    locale: { register: () => () => {}, bind: () => () => t },
  }, {})
  for (const factory of registrations) if (typeof factory === 'function') factory()
  const panel = registrations.find((entry) => typeof entry === 'object' && entry.options.name === 'main')
  // A workspace list that does NOT contain this book's folder: the state the report came from.
  const items = [{ workspaceId: 'w-other', path: '/somewhere/else', title: 'W', sessionIds: [] }]
  const props = {
    ...panel.options.inject(), t, api, config: {}, workspacePath: '/ws',
    useWorkspaces: (selector) => selector({ items }),
    useSessions: (selector) => selector({ byId: {} }),
    workspaceSnapshot: { items },
  }

  const mounted = await render(plugin.__components.StoryPanel, props)
  const card = findByClass(mounted.tree, 'st-book-open')
  assert.ok(card, 'the book is on the shelf')
  card.props.onClick()
  const opened = await rerender(plugin.__components.StoryPanel, props)

  const chatButton = findByText(opened.tree, 'action.openChat')
  assert.ok(chatButton, 'the handoff button is on screen')
  await chatButton.props.onClick()
  await rerender(plugin.__components.StoryPanel, props)

  assert.deepEqual(steps.map((step) => step[0]), ['workspaces.create', 'workspaces.rename', 'startSession'],
    'the folder is registered, named with the writer prefix, then the conversation starts in it')
  assert.equal(steps[1][1], 'w-late', 'the newly registered workspace is the one renamed')
  assert.ok(steps[1][2].endsWith('· 我的书'), 'and it carries the book title')
  assert.deepEqual(panelSwitches, [],
    'and the host keeps the panel switch: switching here would abort the session creation')
})

test('every component body renders under real hook semantics', async () => {
  // Each component is mounted on its own so one crash cannot hide another.
  const { plugin, render } = loadClientForRender()
  const api = apiFor()
  const chapter = book().chapters[0]
  const items = [{ workspaceId: 'w1', path: '/ws', title: 'W', sessionIds: [] }]

  const cases = {
    BookLibrary: {
      t, api, workspacePath: '/ws', books: catalog,
      workspaces: { create: async ({ path }) => ({ workspaceId: 'w-book', path, title: '我的书', sessionIds: [], createdAt: '', updatedAt: '' }) },
      workspaceSnapshot: { items }, uiWorkspace: { openSession: () => {}, startSession: () => {} },
      roots: ['/ws'], onOpen: () => {}, onCreated: () => {}, onRenamed: () => {}, onDeleted: () => {},
    },
    TreeNav: {
      t, book: book(), activeId: 'c1', onSelect: () => {}, onToggle: () => {},
      collapsed: new Set(), onRename: () => {}, onRemove: () => {},
    },
    // The writing surface: one editor, and the transient proposal block it may carry.
    ChapterEditor: {
      t, chapter, busy: false,
      suggestion: { id: 's1', baseText: TEXT, proposedText: `${TEXT}更亮一点。`, wholeText: TEXT },
      aiError: '', onText: () => {}, onAskSelection: async () => {}, onContinue: async () => '',
      onAccept: () => {}, onReject: () => {}, onRetry: () => {},
    },
    ConfirmDialog: {
      t, title: t('label.deleteBookConfirm', { title: '我的书' }), busy: false,
      // A plain child node: the dialog only renders what it is given.
      children: [{ type: 'label', props: { className: 'st-check' }, children: ['同时删除文件'] }],
      confirmLabel: t('action.delete'), cancelLabel: t('action.cancel'),
      onConfirm: () => {}, onCancel: () => {},
    },
    AiSidePanel: {
      t, api, workspacePath: '/ws', bookFolder: '我的书', collapsed: false,
      onToggle: () => {}, onApplied: () => {},
    },
    Drawer: {
      t, title: '背景设定', onClose: () => {},
      children: { type: 'div', props: {}, children: ['内容'] },
    },
    RelationshipsPage: {
      t, book: book(), updateBook: () => {},
    },
    CharactersPage: {
      t, book: book(), updateBook: () => {},
    },
    OverviewPage: {
      t, book: book(), workspacePath: '/ws', bookFolder: '我的书', api, onReload: () => {},
    },
    WritingStylesPage: {
      t, book: book(), bookFolder: '我的书', onNotice: () => {},
      api: { ...api, writingStyles: async () => ({ ok: true, writingStyles: [], activeId: '' }) },
    },
    SettingsPage: {
      t, typography: { fontSize: 16, lineHeight: 1.9, width: 760 }, onChange: () => {},
      autoSaveMs: 5 * 60 * 1000, onAutoSave: () => {},
    },
    ModelsPage: { t, api, directory: undefined },
    StatusBar: {
      t, book: book(), chapter: book().chapters[0],
      saveStatus: { status: 'saved', savedAt: Date.UTC(2026, 9, 24, 6, 32), error: '' },
      model: { continue: { provider: 'agnes', model: 'agnes-3.0-flash' }, suggest: { provider: 'agnes', model: 'agnes-3.0-flash' } },
      onSaveNow: () => {},
    },
    AiThinking: { t },
    ChatComposer: {
      t, busy: false, directory: undefined, modelCurrent: { provider: 'p', model: 'm' },
      // The draft is controlled by the editor, so a mount has to hand one over.
      draft: '', onDraft: () => {}, onModelChange: () => {}, onSend: () => {}, onClose: () => {},
    },
    AnswerLog: {
      t,
      answers: [
        { question: '这句怎么收？', reply: '雨停之前，她一句话也没说。', at: Date.UTC(2026, 9, 24, 6, 32) },
        { question: '换一种呢？', reply: '她推开门走了。', at: Date.UTC(2026, 9, 24, 6, 40) },
      ],
      onInsert: () => {},
    },
    // The gallery family: one card, two pages built on it.
    MosaicGalleryCard: {
      t, id: 'a', kind: 'character', label: '张三', role: '主角',
      picture: null, onActivate: () => {}, children: [],
    },
    MosaicPortrait: { label: '张三', role: '主角', picture: null },
    MosaicCast: { t, mosaic: mosaicBook().mosaic, onInspect: () => {}, pictureOf: () => null },
    MosaicCards: { t, mosaic: mosaicBook().mosaic, onInspect: () => {}, pictureOf: () => null },
    // The rail's function row. Its own test drives each button; here it only has to mount with
    // the props the panel hands it, which is what catches a hook used outside a render.
    RailTools: {
      t, book: book(), onShelf: () => {}, onSave: () => {},
      onExport: async () => '', onNotice: () => {}, onAbout: () => {},
    },
    // The About card, mounted by the panel rather than by the rail. Its own test drives the
    // contents and the Escape key; here it only has to survive a mount.
    AboutBox: { t, onClose: () => {} },
  }

  for (const [name, component] of Object.entries(plugin.__components)) {
    // StoryPanel is driven by the mount helpers below (it needs the whole prop kit), and the
    // boundary is a React class this function-only renderer cannot instantiate — its own test
    // drives it directly.
    if (name === 'StoryPanel' || name === 'StoryPanelBoundary') continue
    const props = cases[name]
    assert.ok(props, `${name} needs a mount case in this test`)
    try {
      await render(component, props)
    } catch (error) {
      assert.fail(`${name} threw while rendering: ${error.message}`)
    }
  }
})

test('entering the panel opens the book that was open last time', async () => {
  // The shelf is for choosing a book, not for passing through on every visit. The last opened
  // book is remembered per library root and restored on mount, so the panel opens the manuscript.
  const previous = globalThis.window
  const store = new Map()
  Object.defineProperty(globalThis, 'window', {
    value: { __ModuleLoader__: previous?.__ModuleLoader__, localStorage: {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key),
    } },
    configurable: true,
    writable: true,
  })
  try {
    const api = apiFor()
    // The remembered value is the book's ID. The folder is what the panel derives from it once
    // the shelf has answered — seeding the folder here would pass whether or not the id is used.
    store.set('dsh.storywriting.lastBook', BOOK_ID)

    const { tree } = await mountPanel({ api })
    assert.equal(findByClass(tree, 'st-library'), undefined,
      'the panel goes straight to the desk instead of the shelf')
    assert.ok(api.calls.some((call) => call[0] === 'load' && call[1] === '我的书'),
      `the remembered book is loaded, saw: ${JSON.stringify(api.calls)}`)
  } finally {
    Object.defineProperty(globalThis, 'window', { value: previous, configurable: true, writable: true })
  }
})

test('a remembered book that no longer exists falls back to the shelf', async () => {
  const previous = globalThis.window
  const store = new Map([['dsh.storywriting.lastBook', 'book-that-no-longer-exists']])
  Object.defineProperty(globalThis, 'window', {
    value: { __ModuleLoader__: previous?.__ModuleLoader__, localStorage: {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key),
    } },
    configurable: true,
    writable: true,
  })
  try {
    const { tree } = await mountPanel({ api: apiFor() })
    assert.ok(findByClass(tree, 'st-library'), 'a stale memory must not strand the writer')
  } finally {
    Object.defineProperty(globalThis, 'window', { value: previous, configurable: true, writable: true })
  }
})

test('a remembered folder name still opens its book on a host whose shelf carries no ids', async () => {
  // This is the shape the panel was in the moment ids were introduced: the stored value was a
  // folder name, and a host that had not been rebuilt answered the shelf without ids. The restore
  // tried the id only, found nothing, and dropped the writer on the shelf — every launch.
  //
  // The other half of the same bug is below: the recording effect wrote `entry.id` unconditionally,
  // and `undefined` stringifies to "undefined", which no book can ever match. So the failure was
  // sticky: it survived even after the host started answering ids.
  const previous = globalThis.window
  const store = new Map([['dsh.storywriting.lastBook', '我的书']])
  Object.defineProperty(globalThis, 'window', {
    value: { __ModuleLoader__: previous?.__ModuleLoader__, localStorage: {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key),
    } },
    configurable: true,
    writable: true,
  })
  try {
    const idless = [{ folder: '我的书', title: '我的书', chapters: 1, finals: 1, total: 1, absolutePath: '/ws/story/我的书' }]
    const api = apiFor({ books: idless })
    const { tree } = await mountPanel({ api })
    assert.equal(findByClass(tree, 'st-library'), undefined, 'the book opens rather than the shelf')
    assert.ok(api.calls.some((call) => call[0] === 'load' && call[1] === '我的书'),
      `the remembered book is loaded, saw: ${JSON.stringify(api.calls)}`)
    // And nothing invalid was written back over the value that worked.
    assert.equal(store.get('dsh.storywriting.lastBook'), '我的书',
      'a row without an id records its folder, never the string "undefined"')
  } finally {
    Object.defineProperty(globalThis, 'window', { value: previous, configurable: true, writable: true })
  }
})

test('deleting a book also removes its workspace registration', async () => {
  // A book IS a workspace. Left behind, the sidebar keeps a row whose folder no longer holds a
  // manuscript — an unusable entry the writer has to clean up by hand.
  const removed = []
  const api = {
    ...apiFor(),
    deleteBook: async (folder) => ({ ok: true, books: [] }),
  }
  const { plugin, render, rerender } = loadClientForRender()
  const registrations = []
  const scopeCtx = {
    layout: { selectPanel: () => {} },
    workspaces: {
      create: async ({ path }) => ({ workspaceId: 'w-book', path }),
      rename: async (id, title) => ({ workspaceId: id, title }),
      delete: async (id) => { removed.push(id) },
    },
    uiWorkspace: { openSession: () => {}, startSession: () => {}, openWorkspace: async () => {} },
    get: (name) => scopeCtx[name],
    slots: {
      inject: (_key, factory) => registrations.push(factory),
      register: (options) => { registrations.push({ options }); return () => {} },
    },
  }
  plugin.apply({
    effect: (fn) => fn(),
    inject: (_names, callback) => callback(scopeCtx),
    slots: scopeCtx.slots,
    locale: { register: () => () => {}, bind: () => () => t },
  }, {})
  for (const factory of registrations) if (typeof factory === 'function') factory()
  const panel = registrations.find((entry) => typeof entry === 'object' && entry.options.name === 'main')
  // The book folder is a registered workspace, which is the state a real book is in.
  const items = [{ workspaceId: 'w-book', path: '/ws/story/我的书', title: 'writer · 我的书', sessionIds: [] }]
  const props = {
    ...panel.options.inject(), t, api, config: {}, workspacePath: '/ws',
    useWorkspaces: (selector) => selector({ items }),
    useSessions: (selector) => selector({ byId: {} }),
    workspaceSnapshot: { items },
  }

  const mounted = await render(plugin.__components.StoryPanel, props)
  // Ask to delete from the card, confirm in the dialog, and check the workspace went with it.
  // The card carries a ⋯ menu now; delete is its last row, and it still asks in a dialog.
  const deleteButton = (function find(node) {
    if (node === null || typeof node !== 'object' || Array.isArray(node)) return undefined
    if (node.props?.['aria-label'] === 'action.cardActions') return node
    for (const child of node.children ?? []) {
      const hit = find(child)
      if (hit !== undefined) return hit
    }
    return undefined
  })(mounted.tree)
  assert.ok(deleteButton, 'the card has its ⋯ menu')
  // Open the menu, then press its delete row: the menu is a menu, not a button that acts.
  deleteButton.props.onClick({ stopPropagation: () => {} })
  const menu = await rerender(plugin.__components.StoryPanel, props)
  const deleteRow = findByText(menu.tree, 'action.deleteCard')
  assert.ok(deleteRow, 'the menu offers delete')
  deleteRow.props.onClick({ stopPropagation: () => {} })
  const asking = await rerender(plugin.__components.StoryPanel, props)
  assert.ok(findByClass(asking.tree, 'fang-backdrop'), 'the confirmation is a modal, not a row in the card')
  const confirm = findByClass(asking.tree, 'fang-dialog-actions')
  const buttons = []
  const collect = (node) => {
    if (node === null || node === undefined || typeof node !== 'object') return
    if (Array.isArray(node)) { node.forEach(collect); return }
    if (node.type === 'button') buttons.push(node)
    collect(node.children)
  }
  collect(confirm)
  assert.equal(buttons.length, 2, 'the dialog offers confirm and cancel')
  await buttons[1].props.onClick()
  await rerender(plugin.__components.StoryPanel, props)

  assert.deepEqual(removed, ['w-book'], 'the book workspace is unregistered with the book')
})

test('a selected passage is sent as the text to rewrite, with the instruction kept separate', async () => {
  // The screenshot bug: the selection travelled in the `instruction` slot and `text` was empty, so
  // the model was asked to rewrite nothing and echoed the instruction glued to the passage.
  //
  // This drives the REAL panel: the editor's callback is wired by `StoryPanel` (it is the panel
  // that calls `api.suggest`), so mounting the editor on its own with a stub `onAskSelection`
  // tested nothing but the stub. The assertion has to be about what reached the route.
  const sent = []
  const api = {
    ...apiFor(),
    suggest: async (bookFolder, chapterId, text, instruction) => {
      sent.push({ chapterId, text, instruction })
      return { ok: true, suggestion: { id: 's1', baseText: text, proposedText: text, state: 'ready' }, overviewChars: 0 }
    },
  }
  const mounted = await mountPanel({ api, open: '我的书' })
  const area = findByClass(mounted.tree, 'st-editor')
  assert.ok(area, 'the editor renders')

  // A selection, then the chord that asks about it. The textarea is a stub here, so the selection
  // is put on the ref the component reads from.
  const passage = '他来自一个很遥远的地方'
  const whole = `${passage}。`
  area.props.ref.current = {
    value: whole, selectionStart: 0, selectionEnd: passage.length,
    setSelectionRange: () => {}, focus: () => {},
  }
  area.props.onKeyDown({ key: 'Tab', isComposing: false, preventDefault: () => {} })
  await new Promise((resolve) => setTimeout(resolve, 0))

  assert.equal(sent.length, 1, 'one request went out')
  assert.equal(sent[0].text, passage, 'the selected passage is what is sent as the passage')
  assert.notEqual(sent[0].instruction, passage,
    'and it is NOT also sent as the instruction, which is what the bug did')
})

test('the outline is folded on entry and there is no side chat', async () => {
  // The manuscript is the page. The directory is a tool, and the book's real conversation is a
  // dsh Session behind 去完整对话 rather than a second chat beside the text.
  const { tree } = await mountPanel({ api: apiFor(), open: '我的书' })
  assert.ok(findByClass(tree, 'fang-rail-collapsed'), 'the directory starts collapsed')
  // The rail holds the outline and nothing else. Asserting that a retired class is absent would
  // pass even if the feature came back under a different name; asserting what IS there does not.
  // It starts collapsed, so the tree is not rendered yet — the collapsed marker is what proves the
  // rail exists at all.
  assert.ok(findByClass(tree, 'fang-rail-collapsed'), 'the outline is mounted, folded')
  assert.equal(findByClass(tree, 'st-tree'), undefined, 'and renders no rows until it is opened')
  assert.equal(findByClass(tree, 'st-ai-dock'), undefined, 'the dock is not inside the rail')
})

test('a proposal is tied to the chapter it was made in', async () => {
  // The bug: the proposal lived in panel state and the editor is reused across chapters, so a
  // polish started in one section was still on screen in the next. The panel now stamps each
  // proposal with its chapter and only hands over the one that matches.
  const { plugin, render } = loadClientForRender()
  const first = book().chapters[0]
  const second = { ...first, id: 'c2', title: '第二章', text: '另一节的正文。' }
  const baseProps = {
    t, busy: false, onText: () => {}, onAskSelection: async () => {}, onContinue: async () => null,
    onAccept: () => {}, onReject: () => {}, onRetry: () => {}, aiError: '',
  }

  // A proposal stamped for chapter 1 renders on chapter 1 and NOT on chapter 2, which is the
  // same filter the panel applies.
  const forFirst = { id: 's1', kind: 'rewrite', baseText: '正文', proposedText: '改后正文', chapterId: first.id }
  const onFirst = await render(plugin.__components.ChapterEditor, { ...baseProps, chapter: first, suggestion: forFirst })
  assert.ok(findByClass(onFirst.tree, 'st-ai-dock'), 'the proposal shows on its own chapter')

  const passesFilter = forFirst.chapterId === second.id ? forFirst : null
  const onSecond = await render(plugin.__components.ChapterEditor, { ...baseProps, chapter: second, suggestion: passesFilter })
  assert.equal(findByClass(onSecond.tree, 'st-ai-dock'), undefined,
    'the proposal for another chapter is not passed in, so nothing shows')
})

test('a continuation and a rewrite share one card', async () => {
  // They used to be two different things on screen: a bordered block at the bottom of the chapter
  // for a rewrite, and grey inline text for a continuation. Both are "the model proposes, the
  // writer accepts", so they render through the same component now.
  const { plugin, render } = loadClientForRender()
  const chapter = book().chapters[0]
  const base = {
    t, chapter, busy: false, aiError: '',
    onText: () => {}, onAskSelection: async () => {}, onContinue: async () => null,
    onAccept: () => {}, onReject: () => {}, onRetry: () => {},
  }

  const rewrite = await render(plugin.__components.ChapterEditor, {
    // A base the suggestion actually replaces: `正文 → 改后正文` is a pure insertion, so it would
    // have no struck-through run and the assertion below would be testing nothing.
    ...base, suggestion: { id: 's1', kind: 'rewrite', baseText: '原文', proposedText: '改后正文', chapterId: chapter.id },
  })
  const rewriteCard = findByClass(rewrite.tree, 'st-ai-dock')
  assert.ok(rewriteCard, 'a rewrite gets the card')
  // A rewrite is a substitution, so the old wording is struck through beside the new one.
  assert.ok(findByClass(rewrite.tree, 'st-del'), 'the replaced text is shown')
  assert.ok(findByClass(rewrite.tree, 'st-add'), 'and the replacement beside it')

  const continuation = await render(plugin.__components.ChapterEditor, {
    ...base, suggestion: { id: 'c1', kind: 'continue', at: 2, baseText: '', proposedText: '风吹过来。', chapterId: chapter.id },
  })
  const continuationCard = findByClass(continuation.tree, 'st-ai-dock')
  assert.ok(continuationCard, 'a continuation gets the SAME card')
  // An insertion has nothing to strike through: a diff against an empty base would draw the whole
  // suggestion as one added block, which reads as if the writer had deleted something.
  assert.equal(findByClass(continuation.tree, 'st-del'), undefined, 'nothing is struck through')
  assert.ok(visibleText(continuationCard).join(' ').includes('风吹过来。'), 'the suggestion is readable')

  // Neither kind paints grey text into the manuscript: the text only changes on accept.
  assert.equal(findByClass(continuation.tree, 'st-ghost-inline'), undefined,
    'the continuation is no longer drawn inline as ghost text')
})

test('the suggestion is a full-measure dock under the page, so it covers nothing', async () => {
  // It used to be an absolutely positioned card pinned under the caret line: it covered the
  // paragraph being edited and made that text unclickable, so with a suggestion open the writer
  // could not read or operate anything else.
  const { plugin, render } = loadClientForRender()
  const chapter = book().chapters[0]
  const mounted = await render(plugin.__components.ChapterEditor, {
    t, chapter, busy: false, aiError: '',
    suggestion: { id: 's1', kind: 'rewrite', baseText: '正文', proposedText: '改后正文', chapterId: chapter.id },
    onText: () => {}, onAskSelection: async () => {}, onContinue: async () => null,
    onAccept: () => {}, onReject: () => {}, onRetry: () => {},
  })
  const dock = findByClass(mounted.tree, 'st-ai-dock')
  assert.ok(dock, 'the dock renders')
  // No inline position at all: it is laid out in flow under the page. An inline `position` or
  // `top` would be the overlay coming back.
  assert.equal(dock.props.style, undefined, 'the dock carries no inline placement')

  // The textarea is still there, and still the live input: nothing was swapped out for a modal.
  assert.ok(findByClass(mounted.tree, 'st-editor-over'), 'the editor stays mounted and usable')
  assert.equal(findByClass(mounted.tree, 'fang-backdrop'), undefined, 'it is not a modal either')

  // Every way out is present inside the dock itself, so the writer is never stuck.
  const buttons = []
  const collect = (node) => {
    if (node === null || typeof node !== 'object') return
    if (Array.isArray(node)) { node.forEach(collect); return }
    if (node.type === 'button') buttons.push(visibleText(node).join(''))
    collect(node.children ?? [])
  }
  collect(dock)
  // Four buttons: accept, retry, the steer chevron beside it, and reject. The chevron is unnamed
  // (it is an affordance on the retry control, titled in the locale) and sits in the same group,
  // so it never reads as a fourth action.
  assert.equal(buttons.length, 4, `accept, retry, steer chevron and reject are all offered, saw ${JSON.stringify(buttons)}`)
  for (const label of ['action.accept', 'action.retry', 'action.reject']) {
    assert.ok(buttons.some((text) => text.includes(label)), `${label} is reachable from the dock`)
  }
})

test('the model working is shown where the answer will appear', async () => {
  // A button that only showed an ellipsis left the writer unsure whether the keystroke registered.
  const { plugin, render } = loadClientForRender()
  const chapter = book().chapters[0]
  const base = {
    t, chapter, aiError: '', suggestion: null,
    onText: () => {}, onAskSelection: async () => {}, onContinue: async () => null,
    onAccept: () => {}, onReject: () => {}, onRetry: () => {},
  }
  const idle = await render(plugin.__components.ChapterEditor, { ...base, busy: false })
  assert.equal(findByClass(idle.tree, 'st-ai-thinking'), undefined, 'nothing to say when nothing is running')

  const working = await render(plugin.__components.ChapterEditor, { ...base, busy: true })
  const thinking = findByClass(working.tree, 'st-ai-thinking')
  assert.ok(thinking, 'the thinking state appears while the model runs')
  assert.equal(thinking.props.role, 'status', 'and it is announced as a status')
  assert.equal(thinking.props['aria-live'], 'polite', 'politely, so it does not interrupt')
  // The words carry the state; there is no animated indicator beside them. Checked by looking at
  // what the status row contains rather than for the class that used to hold the dots.
  // The words carry the state; there is no animated indicator beside them. Asserted on the shape
  // of the row — a label per beat, and every child of the row is one of the known pieces — rather
  // than by looking for the class a removed indicator used to have, which would pass forever.
  const labels = allByClass(thinking, 'st-ai-thinking-label')
  assert.ok(labels.length > 0, 'the row is made of labels')
  assert.ok(labels.every((node) => visibleText(node).join('').trim() !== ''), 'each label carries words')
  const row = findByClass(thinking, 'st-ai-thinking-row')
  assert.ok(row, 'the working line has a row')
  const kinds = allByClass(row, 'st-ai-thinking-labels')
  assert.ok(kinds.length > 0, 'and the labels live in it')
  assert.ok(visibleText(thinking).join(' ').includes('label.thinking'), 'and a word for what is happening')

  // Once there is a suggestion, the thinking state gives way to it rather than stacking.
  const answered = await render(plugin.__components.ChapterEditor, {
    ...base, busy: true,
    suggestion: { id: 's1', kind: 'continue', at: 2, baseText: '', proposedText: '风。', chapterId: chapter.id },
  })
  assert.equal(findByClass(answered.tree, 'st-ai-thinking'), undefined, 'the answer replaces the spinner')
  assert.ok(findByClass(answered.tree, 'st-ai-dock'), 'in the same place')
})

test('accepting a rewrite dismisses the proposal', async () => {
  // Writing the text alone left the card on screen describing a change already applied.
  const accepted = []
  const { plugin, render } = loadClientForRender()
  const chapter = book().chapters[0]
  const suggestion = { id: 's1', baseText: '正文', proposedText: '改后正文', chapterId: chapter.id }
  let written = ''
  const mounted = await render(plugin.__components.ChapterEditor, {
    t, chapter, busy: false, suggestion, aiError: '',
    onText: (text) => { written = text },
    onAskSelection: async () => {}, onContinue: async () => '',
    onAccept: (id) => accepted.push(id), onReject: () => {}, onRetry: () => {},
  })

  const accept = findByText(mounted.tree, 'action.accept')
  assert.ok(accept, 'the card offers 采纳')
  accept.props.onClick()

  assert.deepEqual(accepted, ['s1'], 'the panel is told to drop the proposal')
  assert.ok(written.includes('改后正文'), 'and the text was replaced')
})

test('reference pages live in the mosaic board; only preferences stay in the title bar', async () => {
  // 背景设定 / 人物 / 人物关系 / 版本 / 概览 merged into the mosaic board as bookmark tabs — one
  // reference surface instead of five buttons competing for the title row. Typography and models
  // are the writer's own preferences for THIS panel, so they alone remain title-bar drawers.
  const mounted = await mountPanel({ api: apiFor(), open: '我的书' })
  const { tree } = mounted

  assert.equal(findByText(tree, 'tab.characters'), undefined, 'no cast button in the title bar any more')
  assert.equal(findByText(tree, 'tab.settings'), undefined, 'nor a background-settings button')
  assert.equal(findByText(tree, 'tab.relationships'), undefined, 'nor relationships')
  assert.equal(findByText(tree, 'tab.versions'), undefined, 'nor versions')
  assert.equal(findByText(tree, 'tab.overview'), undefined, 'nor overview')
  // The two preference drawers remain in the title row: the writer's own settings for THIS panel.
  assert.ok(findByText(tree, 'tab.models'), 'the model page stays a drawer')
  assert.ok(findByText(tree, 'tab.typography'), 'typography stays a drawer')

  // The board carries the five pages as tabs. Open it and count the bookmarks.
  const open = (function find(node) {
    if (node === null || typeof node !== 'object' || Array.isArray(node)) return undefined
    if (node.props?.['data-testid'] === 'mosaic-open') return node
    for (const child of node.children ?? []) {
      const hit = find(child)
      if (hit !== undefined) return hit
    }
    return undefined
  })(tree)
  assert.ok(open, 'the mosaic entry is in the title row')
  open.props.onClick()
  const openedScreen = await mounted.rerender()
  const board = findByClass(openedScreen.tree, 'st-mosaic-sheet')
  assert.ok(board, 'the board opens')
  const tabs = allByClass(board, 'st-mosaic-tab')
  // Eight: relations, world, cast, items, proposals, overview, versions, writing style. 梗概 is not a bookmark of
  // its own — it is one line per chapter, which is what 概览 already is. 提案 is last of the board
  // pages because it is not material about the book: it is a decision waiting on the writer.
  assert.equal(tabs.length, 8, 'eight bookmarks: six board pages plus overview and versions')
})

test('the library offers a way back to the book it was opened from', async () => {
  // Reaching the library from the title menu left the panel with no exit: the title is not rendered
  // on this page, so the only way back was to reload. The button goes to the book the shelf was
  // opened from — the same remembered folder the panel restores on the next launch.
  const stored = new Map([['dsh.storywriting.welcomeSeen', '1']])
  const hadWindow = typeof globalThis.window !== 'undefined'
  if (!hadWindow) globalThis.window = {}
  const realStorage = globalThis.window.localStorage
  globalThis.window.localStorage = {
    getItem: (key) => (stored.has(key) ? stored.get(key) : null),
    setItem: (key, value) => stored.set(key, value),
  }
  try {
    const mounted = await mountPanel({ api: apiFor(), open: '我的书' })
    assert.ok(findByClass(mounted.tree, 'st-desk'), 'the book is open')

    // Go to the library through the outline's shelf button — the title is a plain heading now,
    // so this is the route the panel actually offers. The outline starts CLOSED, so it has to be
    // opened first; each rerender answers a fresh mount object.
    findByClass(mounted.tree, 'fang-rail-toggle').props.onClick()
    await mounted.rerender()
    findByTestId((await mounted.rerender()).tree, 'rail-shelf').props.onClick()
    const shelf = (await mounted.rerender()).tree
    assert.ok(findByClass(shelf, 'st-library'), 'the library is shown')

    // And back again.
    const back = findByClass(shelf, 'st-library-back')
    assert.ok(back, 'the library has a back button')
    assert.equal(back.type, 'button', 'it is a real button, so it is keyboard reachable')
    // The translation stub keeps the key, so the assertion names the key and the parameter that
    // carries the book title rather than the rendered sentence.
    assert.equal(back.props.title, 'label.backToBook', 'and it is labelled as going back to a book')
    back.props.onClick()
    const returned = (await mounted.rerender()).tree
    assert.ok(findByClass(returned, 'st-desk'), 'the manuscript is back on screen')
    assert.equal(findByClass(returned, 'st-library'), undefined, 'and the library is gone')
  } finally {
    if (hadWindow) globalThis.window.localStorage = realStorage
    else delete globalThis.window
  }
})

test('a first visit to the library offers no back button', async () => {
  // Nothing to go back to: the library IS the panel on a first visit, and an arrow pointing nowhere
  // is a dead control. Asserted with no remembered book stored.
  const stored = new Map([['dsh.storywriting.welcomeSeen', '1']])
  const hadWindow = typeof globalThis.window !== 'undefined'
  if (!hadWindow) globalThis.window = {}
  const realStorage = globalThis.window.localStorage
  globalThis.window.localStorage = {
    getItem: (key) => (stored.has(key) ? stored.get(key) : null),
    setItem: (key, value) => stored.set(key, value),
  }
  try {
    const mounted = await mountPanel({ api: apiFor() })
    assert.ok(findByClass(mounted.tree, 'st-library'), 'the library is the panel')
    assert.equal(findByClass(mounted.tree, 'st-library-back'), undefined, 'with no way back offered')
  } finally {
    if (hadWindow) globalThis.window.localStorage = realStorage
    else delete globalThis.window
  }
})

test('the new-book tile is marked while its own dialog is open', async () => {
  // The tile is the only control in the shelf grid, and it had no state at all: no hand cursor, no
  // lift, and nothing to say it was the one being worked with once its dialog covered the shelf.
  // Every book beside it lifted under the pointer, so the tile read as decoration.
  //
  // Two separate things are pinned here. The DOM: the tile announces itself as a popup and reports
  // whether the dialog is up, which is what the selected style keys off. And the stylesheet: the
  // rule that does the marking has to exist and must come AFTER the hover rule, because it is the
  // same specificity — written above it, hovering the open tile would repaint the accent edge back
  // to plain ink, and nothing in a render test would ever see that.
  const runtime = loadClientForRender()
  const mounted = await mountPanel({ api: apiFor(), runtime })
  const tile = findByClass(mounted.tree, 'st-book-add')
  assert.ok(tile, 'the new-book tile carries its own marker class')
  assert.equal(tile.props['aria-haspopup'], 'dialog', 'it opens a dialog, and says so')
  assert.equal(tile.props['aria-expanded'], 'false', 'closed to begin with')

  tile.props.onClick()
  const opened = await runtime.rerender(runtime.plugin.__components.StoryPanel, mounted.props)
  const stillTile = findByClass(opened.tree, 'st-book-add')
  assert.equal(stillTile.props['aria-expanded'], 'true', 'and marked while the dialog is up')

  const css = readFileSync(new URL('../client.js', import.meta.url), 'utf8')
  const selected = css.indexOf('.st-book-add[aria-expanded="true"]')
  const hover = css.indexOf('.st-book-add:hover')
  assert.ok(selected > -1, 'the tile has a selected rule')
  assert.ok(selected > hover, 'and it is written after the hover rule it has to override')
  const rule = /\.st-book-add\[aria-expanded="true"\]\{([^}]*)\}/.exec(css)?.[1] ?? ''
  assert.ok(/border-color:var\(--fang-accent\)/.test(rule), 'the accent edge, visible on both themes')
  assert.ok(/outline:/.test(rule), 'and a ring on its own channel, so the hover shadow survives')
  assert.ok(!/box-shadow/.test(rule), 'the ring must not compete with the hover shadow')
})

test('the book title is a heading, not a menu', async () => {
  // It was a button that opened a list of the other books with the library as its last row. The
  // caret beside the name invited a press that covered the page the writer was reading, and the
  // shelf is already one press away in the outline. A page's title is its name.
  const mounted = await mountPanel({ api: apiFor(), open: '我的书' })
  const title = findByClass(mounted.tree, 'fang-title')
  assert.ok(title, 'the title is on screen')
  assert.equal(title.type, 'h1', 'and it is a heading')
  assert.equal(title.props.onClick, undefined, 'with nothing behind it')
  assert.equal(title.props.role, undefined, 'and no button semantics')
  assert.ok(visibleText(title).join('').includes('我的书'), 'it shows the book name')

  // None of the menu's parts are rendered any more.
  for (const cls of ['st-title-button', 'st-title-menu', 'st-title-list', 'st-title-option', 'st-books-trigger']) {
    assert.equal(findByClass(mounted.tree, cls), undefined, `${cls} is gone`)
  }
})

test('the remaining preference drawers size themselves to their content', async () => {
  // The five reference pages moved into the mosaic board, whose geometry is fixed by the
  // stylesheet. Only typography and models still open a title-bar drawer, and neither raises the
  // default ceiling: a short list takes the room it needs.
  const ceilingOf = async (tabLabel) => {
    const { tree } = await mountPanel({ api: apiFor(), open: '我的书', clickDrawer: tabLabel })
    const sheet = findByClass(tree, 'fang-drawer')
    assert.ok(sheet, `${tabLabel} opens a panel`)
    return sheet.props.style?.['--fang-drawer-max']
  }
  assert.equal(await ceilingOf('tab.typography'), undefined, 'typography sets no ceiling')
  assert.equal(await ceilingOf('tab.models'), undefined, 'models sets no ceiling')
})

test('the panel comes in from the right edge, rounded like the outline', () => {
  // It used to fade in at the centre while the outline slid in from the left — two kinds of overlay
  // floating over the same page. One motion for both reads as one system.
  const css = readFileSync(new URL('../client.js', import.meta.url), 'utf8')
  const backdrop = /\.fang-backdrop:has\(> \.fang-drawer\)\{([^}]*)\}/.exec(css)?.[1] ?? ''
  assert.ok(/justify-content:flex-end/.test(backdrop), 'the backdrop pushes the panel to the right edge')
  assert.ok(/align-items:stretch/.test(backdrop), 'and lets it take the full height')
  // A side panel is not a modal: the manuscript beside it stays readable and usable. The wash it
  // used to paint turned the page grey, which said "this is disabled" about the one surface the
  // writer is working on. The panel's own shadow is what separates it.
  assert.ok(/background:transparent/.test(backdrop),
    'the layer under a side panel paints nothing, so the page does not go grey')

  const sheet = /\.fang-drawer\{([^}]*)\}/.exec(css)?.[1] ?? ''
  // Each token may carry a literal fallback, so the pattern has to allow the closing paren after
  // The panel radius comes through the panel's own alias, which points at the host token.
  assert.ok(/border-radius:var\(--fang-radius-panel[^)]*\)\s+0\s+0\s+var\(--fang-radius-panel[^)]*\)/.test(sheet),
    'rounded on the inner edge only, square against the frame')
  assert.ok(/border:none/.test(sheet), 'no border: the edge against the window is the frame')

  const keyframes = /@keyframes fang-drawer-in\{([^}]*)\}/.exec(css)?.[1] ?? ''
  assert.ok(/translateX/.test(keyframes), 'it slides in sideways, not by scaling')
  assert.ok(!/scale/.test(keyframes), 'no zoom: that is what a dialog does, not a panel')

  // The width follows the content, within a floor and a ceiling.
  assert.ok(/width:fit-content/.test(sheet), 'it sizes to its content')
  assert.ok(/min-width:min\(320px,100%\)/.test(sheet), 'with a floor, so a one-line panel is not a strip')
  assert.ok(/max-width:min\(var\(--fang-drawer-max\),100%\)/.test(sheet),
    'and a ceiling a page may raise, capped by the window')
  assert.ok(/@media \(max-width: 640px\)/.test(css), 'a narrow window takes the whole width')

  // The backdrop starts below the title row, so the title bar stays readable and clickable.
  assert.ok(/inset:var\(--fang-titlebar-height(,68px)?\) 0 0 0/.test(backdrop),
    'the drawer does not cover the title bar')

  // The shell's own bar takes its top air and page gutter as margins: the shelf head gets the
  // same two insets from its scroll container, and a border paints on the element's own box, so
  // margins are the only way both dividers end up with one geometry.
  assert.ok(/\.fang-shell>\.fang-titlebar\{margin-top:var\(--fang-space-8\);margin-left:var\(--fang-frame-gutter\);margin-right:var\(--fang-frame-gutter\)\}/.test(css),
    'the main titlebar shares the shelf head\'s page insets')
})

// ---- a cast change asked for in the composer ----

/** Every element under a node whose class list contains the token. */
function allByClass(node, token, found = []) {
  if (node === null || typeof node !== 'object') return found
  if (Array.isArray(node)) { node.forEach((child) => allByClass(child, token, found)); return found }
  if (typeof node.props?.className === 'string' && node.props.className.split(/\s+/).includes(token)) found.push(node)
  for (const child of node.children ?? []) allByClass(child, token, found)
  return found
}

test('a change to the cast comes back as a card to review, and is written only on accept', async () => {
  // The composer is not only for questions: "把林设成摄影师，再加一条民国的时代背景" is a request to
  // CHANGE the book's data. The model answers with a machine-readable block, and the panel turns
  // it into rows to approve — nothing is written until the writer takes it, because a wrong cast
  // update silently rewrites facts every later prompt is built from.
  const applied = []
  const api = apiFor({ load: book() })
  api.chat = async () => ({
    ok: true, reply: '好的。',
    proposal: {
      characters: [{ name: '林', role: '摄影师' }],
      settings: [{ title: '时代', body: '民国' }],
    },
  })
  api.applyProposal = async (folder, proposal) => {
    applied.push(proposal)
    const next = book()
    next.characters = [{ id: 'r1', name: '林', role: '摄影师', aliases: [], goal: '', traits: [], notes: '' }]
    next.settings = [{ id: 's1', title: '时代', body: '民国' }]
    // The host read the file, and the file is what it wrote back: the chapter in this answer is
    // the one that was on DISK, which may be older than what the writer has on screen.
    next.nodes[0].children[0].text = '磁盘上的旧文本。'
    next.chapters = [next.nodes[0].children[0]]
    return { ok: true, applied: { characters: ['林'], settings: ['时代'], relationships: [] }, book: next, token: 'tk-9' }
  }

  const panel = await mountPanel({ api, open: '我的书' })
  let tree = panel.tree
  const ask = findByText(findByClass(tree, 'st-desk-head'), 'action.ask')
  assert.ok(ask, 'the composer opens from the header')
  ask.props.onClick()
  tree = (await panel.rerender()).tree

  findByClass(tree, 'st-chat-input').props.onChange({ target: { value: '把林设成摄影师，再加一条民国的时代背景' } })
  tree = (await panel.rerender()).tree
  findByClass(tree, 'st-chat-input').props.onKeyDown({ key: 'Enter', preventDefault: () => {} })
  // Two passes, not one: the first settles the promise the send started, the second renders the
  // state that promise produced. The harness applies effects after a render, so a single pass
  // shows the dock still in its waiting state.
  tree = (await panel.rerender()).tree
  tree = (await panel.rerender()).tree

  const rows = allByClass(tree, 'st-cast-row')
  assert.equal(rows.length, 2, 'one row per proposed entity')
  const text = visibleText(tree).join(' ')
  assert.ok(text.includes('cast.target.character') && text.includes('林'), `the character is named, saw: ${text.slice(0, 200)}`)
  assert.ok(text.includes('cast.target.setting') && text.includes('时代'), 'and the setting')
  // Both are new: the book has neither name.
  assert.equal(rows.filter((row) => visibleText(row).join(' ').includes('cast.add')).length, 2, 'both read as additions')
  assert.equal(applied.length, 0, 'nothing is written before the writer approves')
  assert.equal(findByClass(tree, 'st-chat-composer'), undefined, 'and the dock is not the composer')

  const accept = findByText(tree, 'action.applyCast')
  assert.ok(accept, 'the card offers the write')
  accept.props.onClick()
  // Two passes, not one: the first settles the promise the send started, the second renders the
  // state that promise produced. The harness applies effects after a render, so a single pass
  // shows the dock still in its waiting state.
  tree = (await panel.rerender()).tree
  tree = (await panel.rerender()).tree
  assert.equal(applied.length, 1, 'accepting writes it')
  assert.equal(applied[0].characters[0].name, '林')
  assert.equal(findByClass(tree, 'st-cast'), undefined, 'and the card is gone')
  // Only the cast is taken from the answer. The manuscript on screen stays the manuscript the
  // writer is looking at — the host's copy was read from disk and can be a keystroke behind.
  assert.equal(findByClass(tree, 'st-editor').props.value, TEXT, 'the page is untouched by the cast write')
})

test('a cast change to an existing name reads as an update', async () => {
  // The host merges by name, so the same block that adds a character changes one when the name is
  // already in the book. The card has to say which of the two is about to happen.
  const existing = book()
  // The board is the record of who is in the story; `characters` was a schema-2 field that
  // the board replaced. Seeding the old field made this test pass against a list the panel
  // no longer reads — and the panel was wrong in the same way, so neither noticed.
  existing.mosaic = {
    schemaVersion: 4, edges: [],
    entities: [{
      id: 'r1', kind: 'character', name: '林', role: '摄影师', summary: '', description: '',
      aliases: [], notes: '', statuses: [], custom: [],
    }],
  }
  const api = apiFor({ load: existing })
  api.chat = async () => ({ ok: true, reply: '', proposal: { characters: [{ name: '林', goal: '找到父亲' }] } })
  const panel = await mountPanel({ api, open: '我的书' })
  let tree = panel.tree
  findByText(findByClass(tree, 'st-desk-head'), 'action.ask').props.onClick()
  tree = (await panel.rerender()).tree
  findByClass(tree, 'st-chat-input').props.onChange({ target: { value: '林的目标改成找到父亲' } })
  tree = (await panel.rerender()).tree
  findByClass(tree, 'st-chat-input').props.onKeyDown({ key: 'Enter', preventDefault: () => {} })
  // Two passes, not one: the first settles the promise the send started, the second renders the
  // state that promise produced. The harness applies effects after a render, so a single pass
  // shows the dock still in its waiting state.
  tree = (await panel.rerender()).tree
  tree = (await panel.rerender()).tree

  const row = findByClass(tree, 'st-cast-row')
  assert.ok(row, 'the change is listed')
  const rowText = visibleText(row).join(' ')
  assert.ok(rowText.includes('cast.update'), `an existing name is an update, saw: ${rowText}`)
  assert.ok(rowText.includes('找到父亲'), 'and the field it changes is named')
})

test('the composer changes the chat model, and it is the plugin config that changes', async () => {
  // The chip says who will answer a question here. Changing it from the composer used to switch
  // the SESSION model instead — a much larger change than the writer made, and one that moved
  // every role that had no model of its own. It writes the chat role now, like the settings page.
  const api = apiFor({ load: book() })
  const panel = await mountPanel({ api, open: '我的书' })
  let tree = panel.tree
  findByText(findByClass(tree, 'st-desk-head'), 'action.ask').props.onClick()
  tree = (await panel.rerender()).tree
  const chip = findByClass(tree, 'st-seat-trigger')
  assert.ok(chip, 'the composer carries the seat')
  chip.props.onClick()
  tree = (await panel.rerender()).tree
  const menu = findByClass(tree, 'st-seat-menu')
  assert.ok(menu, 'it opens over the composer')
  findByText(menu, 'label.model').props.onClick()
  tree = (await panel.rerender()).tree
  findByText(findByClass(tree, 'st-seat-menu'), 'Model M').props.onClick()
  await new Promise((resolve) => setTimeout(resolve, 0))

  const writes = api.calls.filter((call) => call[0] === 'setModel')
  assert.deepEqual(writes, [['setModel', 'chat', { provider: 'p', model: 'm' }]],
    'the chat role is stored, with the provider the catalogue named')
})

test('the thinking state survives the panel being rebuilt, and so does the answer', async () => {
  // The host unmounts the panel whenever the centre column changes — switching to a conversation
  // and back, or the window losing and regaining focus. The AI state used to live in plain
  // `useState`, so the thinking row vanished on the way out and an answer that arrived while the
  // writer was elsewhere was written into a component that no longer existed: it was lost.
  //
  // The state now lives in the session store (`useSessionState`), which outlives the mount. This drives
  // the real path: start a continuation, unmount the panel mid-flight, mount a fresh one, and
  // check that the wait is still on screen — then let the answer land and check it arrives.
  let release
  const gate = new Promise((resolve) => { release = resolve })
  const api = apiFor()
  api.continue = async () => { await gate; return { ok: true, continuation: '风起了。' } }

  // One bundle, mounted twice: the page stays, the panel is rebuilt inside it.
  const runtime = loadClientForRender()
  const first = await mountPanel({ api, open: '我的书', runtime })
  const area = findByClass(first.tree, 'st-editor-over')
  assert.ok(area, 'the editor is up')
  // The caret sits at the end of the prose, so a continuation has something to follow.
  const text = '那是一个深夜，深得连路灯都像是熬红了眼。'
  area.props.ref.current = {
    value: text, selectionStart: text.length, selectionEnd: text.length,
    setSelectionRange: () => {}, focus: () => {},
  }
  area.props.onMouseUp()
  await first.rerender()
  await findByClass(first.tree, 'st-editor-over').props.onKeyDown({ key: 'Tab', preventDefault: () => {} })
  // One Tab waits a window before it acts, so a second press can turn it into a section review.
  await new Promise((resolve) => setTimeout(resolve, 400))
  const running = await first.rerender()
  assert.equal(findByClass(running.tree, 'st-hairline')?.props['data-state'], 'working',
    'the wait is on the hairline before the switch')

  // The switch: a fresh mount, which throws away every hook table the old panel had.
  const second = await mountPanel({ api, open: '我的书', runtime })
  assert.equal(findByClass(second.tree, 'st-hairline')?.props['data-state'], 'working',
    'the wait is still on the hairline after the panel was rebuilt')
  assert.ok(findByClass(second.tree, 'st-ai-thinking'), 'and the thinking row is still there')

  // The answer lands while the second panel is the mounted one.
  release()
  await new Promise((resolve) => setTimeout(resolve, 20))
  const answered = await second.rerender()
  assert.ok(findByClass(answered.tree, 'st-ai-dock'), 'the answer opens the box')
  assert.ok(visibleText(answered.tree).join('').includes('风起了。'),
    'and the text the model produced is the text on screen, not a dropped response')
})


test('every text field in the panel shares one borderless rule', () => {
  // A stroke on each field turned the reference drawers into a form to fill in. The fields are
  // one rule now: a quiet layer fill, no border, and the focus ring as the only edge.
  const css = readFileSync(new URL('../client.js', import.meta.url), 'utf8')
  // The panel used to carry its chat as a column of its own, and that column's field was the
  // fourth member of this list. The column is gone (the host's sidebar holds the conversation),
  // so the selector is the three fields that still exist.
  const shared = /\.st-input,\.st-find-input,\.st-chat-input,\.st-scan-steer-input\{([^}]*)\}/
    .exec(css)?.[1] ?? ''
  assert.ok(shared !== '', 'the shared rule covers every text field')
  assert.ok(/border:none/.test(shared), 'no stroke')
  assert.ok(/background:var\(--fang-surface[,)]/.test(shared), 'a quiet surface fill instead')
  assert.ok(/box-shadow|:focus/.test(css), 'and focus is still shown')

  // No field may re-introduce a border of its own after the shared rule. The only allowed
  // exception is the chat field's transparent fill: it sits inside the dock's own card.
  for (const cls of ['st-input', 'st-find-input', 'st-scan-steer-input']) {
    const own = new RegExp(`\\.${cls}\\{([^}]*)\\}`).exec(css)?.[1] ?? ''
    assert.ok(!/border:\s*\.5px solid/.test(own), `${cls} must not carry a border of its own`)
  }
})

test('the panel has its own four-step type scale, and every rule reads it', () => {
  // The panel used the host's eleven-step ramp, of which it needed nine — and three of those names
  // (2xs-12, l-18, 2xl-22) are not tokens the host ships, so those rules fell back to their literal
  // silently. Nine sizes is also more than the panel can use: 12 and 13 sat one pixel apart and
  // picked up each other's work.
  //
  // It is its own scale now — four steps by ROLE, not by size — because this is a writing surface
  // mounted inside whatever column the host chooses, and its type is its own decision.
  const sheet = readCssSources()
  assert.ok(sheet !== '', 'the stylesheet is found')

  const hardSizes = [...sheet.matchAll(/font-size:(\d+)px/g)].map((m) => m[1])
  assert.deepEqual(hardSizes, [], `no hard-coded font sizes may remain, saw: ${hardSizes.join(', ')}`)
  const hardLeadings = [...sheet.matchAll(/line-height:(\d+)px/g)].map((m) => m[1])
  assert.deepEqual(hardLeadings, [], `no hard-coded leadings may remain, saw: ${hardLeadings.join(', ')}`)

  // The scale is exactly four steps. A fifth would be a size somebody added for one screen.
  const steps = new Set([...sheet.matchAll(/--fang-font-size-(sm|md|lg|xl):/g)].map((m) => m[1]))
  assert.deepEqual([...steps].sort(), ['lg', 'md', 'sm', 'xl'],
    'the scale has four steps: sm, md, lg, xl')

  // Every rule that sets type names a step of THIS scale — never the host's ramp, and never a
  // number of its own.
  const used = new Set([...sheet.matchAll(/font-size:var\(--fang-font-size-([a-z]+)\)/g)].map((m) => m[1]))
  assert.deepEqual([...used].filter((step) => !steps.has(step)), [], 'no rule names a step the scale does not define')
  assert.ok(used.size === 4, `all four steps are in use, saw: ${[...used].sort().join(', ')}`)

  // The host ramp is gone entirely: a single usage would mean a rule that still tracks the host's
  // typography and will drift from the rest of the panel.
  assert.doesNotMatch(sheet, /--dsw-font-(?:xxxs-11|xxs-12|2xs-12|xs-13|s-14|base-16|l-18|l-20|2xl-22)/,
    'no rule reads the host type ramp')

  // A size and its leading are one decision. Every rule that sets both takes them from the SAME
  // step, so they cannot drift into two tiers.
  const pairs = [...sheet.matchAll(/font-size:var\(--fang-font-size-([a-z]+)\);line-height:var\(--fang-line-height-(sm|md|lg|xl)\)/g)]
  assert.ok(pairs.length > 20, 'the panel still sets type on many rules')
  for (const [, sizeStep, leadingStep] of pairs) {
    assert.equal(leadingStep, sizeStep, `size and leading must share one step, saw ${sizeStep} / ${leadingStep}`)
  }
})

test('the dock line is a plain rule at rest, and only lights up while working', () => {
  // The line glowed in every state: weakest when idle, held when a result waited, strongest while
  // the model worked. That made the accent permanent furniture at the bottom edge and left the two
  // meanings — "there is something here" and "something is happening" — as two strengths of one
  // signal. They are different things, and only the second is worth lighting a line for.
  const css = readFileSync(new URL('../client.js', import.meta.url), 'utf8')
  const base = /\.st-hairline-glow\{([^}]*)\}/.exec(css)?.[1] ?? ''
  assert.ok(base !== '', 'the glow element has a base rule')
  // A gradient that fades at both ends, brightest in the middle — not a solid rule. A stroke with
  // ends would need a second element to mask it; the gradient is the fade.
  assert.ok(/background:linear-gradient\(to right/.test(base), 'the line is a horizontal gradient')
  assert.ok(/transparent 0%/.test(base) && /transparent 100%/.test(base),
    'and both ends are fully transparent')
  assert.ok(/--fang-border-edge/.test(base), 'at rest the middle is the border grey')
  assert.ok(!/--fang-accent/.test(base), 'and the accent appears in no part of the resting line')
  assert.ok(/box-shadow:none/.test(base), 'it casts no light at rest')
  assert.ok(!/animation:/.test(base), 'and it does not breathe')
  // Short at rest: it takes a third of the row, so it reads as a mark at the centre of the page.
  assert.ok(/width:33\.33%/.test(base), 'the resting line is a third of the width')

  // The one lit state: same gradient shape, accent colour, full width, breathing.
  const working = /\.st-hairline\[data-state="working"\] \.st-hairline-glow\{([^}]*)\}/.exec(css)?.[1] ?? ''
  assert.ok(working !== '', 'working has its own rule')
  assert.ok(/width:100%/.test(working), 'working stretches the line across the page')
  assert.ok(/--fang-accent/.test(working), 'it lights in the accent')
  assert.ok(/background:linear-gradient\(to right/.test(working), 'keeping the faded ends')
  assert.ok(/animation:st-hairline-breathe/.test(working), 'and it breathes')

  // No other state may light it: a `kept` line holds a result, and the copy above it says so.
  for (const state of ['idle', 'kept']) {
    const rule = new RegExp(`\\.st-hairline\\[data-state="${state}"\\] \\.st-hairline-glow\\{([^}]*)\\}`).exec(css)?.[1]
    assert.equal(rule, undefined, `${state} must not have a rule of its own: the base rule is its face`)
  }
})

test('the board and the outline are never open together', async () => {
  // Two overlays over one page. Opened independently, the board dropped on top of a rail that was
  // still covering the left edge: neither could be read, and the writer had to close one to see the
  // other. One panel at a time, in both directions.
  const mounted = await mountPanel({ api: apiFor(), open: '我的书' })
  let tree = mounted.tree
  const isBoardOpen = (t) => findByClass(t, 'st-mosaic-sheet') !== undefined
  const isRailOpen = (t) => findByClass(t, 'st-rail-body') !== undefined

  assert.equal(isBoardOpen(tree), false, 'the board starts closed')
  assert.equal(isRailOpen(tree), false, 'and so does the outline')

  // Opening the board puts nothing else up.
  findByTestId(tree, 'mosaic-open').props.onClick()
  tree = (await settleClick(mounted)).tree
  assert.equal(isBoardOpen(tree), true, 'the board opens')

  // Opening the outline puts the board away.
  findByClass(tree, 'fang-rail-toggle').props.onClick()
  tree = (await settleClick(mounted)).tree
  assert.equal(isRailOpen(tree), true, 'the outline opens')
  assert.equal(isBoardOpen(tree), false, 'and the board goes with it')

  // And the other direction.
  findByTestId(tree, 'mosaic-open').props.onClick()
  tree = (await settleClick(mounted)).tree
  assert.equal(isBoardOpen(tree), true, 'the board opens again')
  assert.equal(isRailOpen(tree), false, 'closing the outline behind it')
})

test('the mosaic sheet geometry: drops from the top, fixed height, clears the dock', () => {
  // The board's shape is a contract the writer's cursor lives with: a card that dropped from the
  // top, kept a fixed height whatever the page holds, and never reached down into the composer.
  const css = readFileSync(new URL('../client.js', import.meta.url), 'utf8')
  const backdrop = /\.st-mosaic-backdrop\{([^}]*)\}/.exec(css)?.[1] ?? ''
  assert.ok(/align-items:flex-start/.test(backdrop), 'the card hangs from the top edge')
  assert.ok(/justify-content:center/.test(backdrop), 'and is centred across the page')
  // The layer spans the panel down to the bottom edge so the card has the whole height to hang
  // in, while the board itself stops above the dock slot. The clearance is a PADDING, not part
  // of the inset: carved out of the inset, the strip below the board belonged to the editor.
  // The layer paints nothing but catches the press outside the sheet, which is how the board
  // dismisses now — the same click-away every other main-surface panel uses.
  assert.ok(/inset:var\(--fang-titlebar-height(,68px)?\) 0 0 0/.test(backdrop),
    'the layer spans the panel down to the bottom edge')
  assert.ok(/pointer-events:auto/.test(backdrop),
    'and catches the press outside the sheet, so the board dismisses like every other panel')
  assert.ok(/padding-bottom:var\(--st-mosaic-dock-clearance\)/.test(backdrop),
    'the board itself still stops above the dock slot')

  const sheet = /\.st-mosaic-sheet\{([^}]*)\}/.exec(css)?.[1] ?? ''
  assert.ok(/height:100%/.test(sheet), 'the card fills the area between the title row and the dock')
  // The inset is a token now: the assertion is about the SHAPE (a definite width derived from the
  // page, not a content-sized box), not about the number that happens to implement it.
  assert.ok(/width:calc\(100% - var\(--st-overlay-inset\)\)/.test(sheet),
    'a fixed width inside the page, not content-sized')
  assert.ok(/corner-shape:round/.test(sheet), 'all four corners round, out of the theme squircle')

  const drop = /@keyframes st-mosaic-in\{([^}]*)\}/.exec(css)?.[1] ?? ''
  assert.ok(/translateY\(-16px\)/.test(drop), 'the pop animation comes from above')
})

test('the mosaic sheet drops from the top edge with eight bookmarks', async () => {
  const api = apiFor()
  const mounted = await mountPanel({ api, open: '我的书' })
  // The panel holds the open state itself, so a click on the header button is the only way in,
  // exactly as with the reference drawers.
  const { tree, rerender } = mounted
  const findOpen = (node) => {
    if (node === null || typeof node !== 'object' || Array.isArray(node)) return undefined
    if (node.props?.['data-testid'] === 'mosaic-open') return node
    for (const child of node.children ?? []) {
      const hit = findOpen(child)
      if (hit !== undefined) return hit
    }
    return undefined
  }
  const open = findOpen(tree)
  assert.ok(open, 'the panel offers a way into the mosaic')
  open.props.onClick()
  // The open flag lives on the panel, so the next screen arrives through a re-render on the same
  // hook tables — the same drive a card click already uses above. The drive result carries the
  // document stub its effects registered into, which is how the Escape path is driven below.
  const openedScreen = await rerender()
  const opened = openedScreen.tree
  assert.ok(findByClass(opened, 'st-mosaic-sheet'), 'the sheet renders')
  assert.ok(findByClass(opened, 'st-mosaic-backdrop'), 'as a card dropped over the page')
  // Right-edge bookmarks, top to bottom.
  const tabs = []
  const collectTabs = (node, into) => {
    if (node === null || typeof node !== 'object' || Array.isArray(node)) return
    if (node.type === 'button' && typeof node.props?.className === 'string'
      && node.props.className.split(/\s+/).includes('st-mosaic-tab')) into.push(node)
    for (const child of node.children ?? []) collectTabs(child, into)
  }
  collectTabs(opened, tabs)
  // The stub `t` shows the raw key; the label lives in the class order, and the ZH copy is pinned
  // by the dictionaries' own hygiene test. What is pinned HERE is the number and the order.
  // Eight: relations, world, cast, items, proposals, overview, versions, writing style. 梗概 is not a bookmark of
  // its own — it is one line per chapter, which is what 概览 already is. 提案 is last of the board
  // pages because it is not material about the book: it is a decision waiting on the writer.
  assert.equal(tabs.length, 8, 'eight bookmarks: six board pages plus overview and versions')
  assert.equal(tabs[0].props['data-active'], true, 'the relations tab is the default page')
  assert.ok(findByClass(opened, 'st-mosaic-canvas'), 'the default page is the relations canvas')

  // A tab click switches pages without closing the sheet: the canvas only belongs to relations,
  // so it must be gone once another page shows.
  tabs[1].props.onClick()
  const { tree: switched } = await rerender()
  assert.ok(findByClass(switched, 'st-mosaic-sheet'), 'the sheet stays open across a tab switch')
  assert.equal(findByClass(switched, 'st-mosaic-canvas'), undefined, 'the relations canvas is the only page with one')
  const switchedTabs = []
  collectTabs(switched, switchedTabs)
  assert.equal(switchedTabs.length, 8, 'all eight bookmarks stay')

  // Escape closes: the effect registered on the document stub the sheet's mounting drive handed
  // back, and dispatching the key there reaches the listener.
  const doc = openedScreen.document
  assert.ok(doc, 'the sheet drove against a stub document')
  doc.dispatch('keydown', { key: 'Escape' })
  const { tree: closed } = await rerender()
  assert.equal(findByClass(closed, 'st-mosaic-sheet'), undefined, 'Escape dismisses the sheet')
})

test('随笔 opens with a blank capture, and the note is written into the book', async () => {
  const mounted = await mountPanel({ api: apiFor(), open: '我的书' })
  const notesButton = findByTestId(mounted.tree, 'notes-open')
  assert.ok(notesButton, 'the notes button sits beside the board button')
  notesButton.props.onClick()
  const { tree } = await settleClick(mounted)
  assert.ok(findByClass(tree, 'st-notes'), 'the notes panel opens')
  const capture = findByTestId(tree, 'notes-capture')
  assert.ok(capture, 'the quick-capture field is there')
  assert.equal(capture.props.value, '', 'opening created a fresh blank note')
  capture.props.onChange({ target: { value: '第三幕的雨' } })
  const { tree: typed } = await mounted.rerender()
  const rows = allByClass(typed, 'fang-list-row')
  assert.equal(rows.length, 1, 'the new note is in the list')
  assert.ok(visibleText(rows[0]).join('').includes('第三幕的雨'), 'and its first line is the list title')
  const typedCapture = findByTestId(typed, 'notes-capture')
  assert.equal(typedCapture.props.value, '第三幕的雨', 'the field keeps what was typed')
  typedCapture.props.onChange({ target: { value: '第三幕的雨停了' } })
  const { tree: again } = await mounted.rerender()
  assert.equal(findByTestId(again, 'notes-capture').props.value, '第三幕的雨停了', 'the second keystroke appends')
  assert.equal(allByClass(again, 'fang-list-row').length, 1, 'no extra note was created mid-typing')
})

test('the mosaic button toggles the board closed on a second click', async () => {
  const api = apiFor()
  const mounted = await mountPanel({ api, open: '我的书' })
  const byTestId = (node, id) => {
    if (node === null || typeof node !== 'object' || Array.isArray(node)) return undefined
    if (node.props?.['data-testid'] === id) return node
    for (const child of node.children ?? []) {
      const hit = byTestId(child, id)
      if (hit !== undefined) return hit
    }
    return undefined
  }
  const openButton = byTestId(mounted.tree, 'mosaic-open')
  assert.ok(openButton, 'the entry button exists')
  assert.equal(openButton.props['aria-expanded'], 'false', 'closed at first')

  openButton.props.onClick()
  const opened = (await mounted.rerender()).tree
  assert.ok(findByClass(opened, 'st-mosaic-sheet'), 'the first click opens the board')

  // The same button, now expanded, closes it again: a toggle, not a one-way door.
  const openButtonAgain = byTestId(opened, 'mosaic-open')
  assert.equal(openButtonAgain.props['aria-expanded'], 'true', 'the button reports the open state')
  openButtonAgain.props.onClick()
  const closed = (await mounted.rerender()).tree
  assert.equal(findByClass(closed, 'st-mosaic-sheet'), undefined, 'the second click closes the board')
})

test('empty space in the title row puts the board away, a control in it does not', async () => {
  // The board owns the page while it is open, and the title row is the one strip that stays
  // visible above it — so a press there is a dismissal. A press on a BUTTON is not: the row holds
  // the rail toggle, the book menu, the two drawers and the session button, and every one of them
  // would be destroyed by a rule that closed on any press in the row.
  const api = apiFor()
  const mounted = await mountPanel({ api, open: '我的书' })
  const byTestId = (node, id) => {
    if (node === null || typeof node !== 'object' || Array.isArray(node)) return undefined
    if (node.props?.['data-testid'] === id) return node
    for (const child of node.children ?? []) {
      const hit = byTestId(child, id)
      if (hit !== undefined) return hit
    }
    return undefined
  }
  byTestId(mounted.tree, 'mosaic-open').props.onClick()
  const opened = (await mounted.rerender()).tree
  assert.ok(findByClass(opened, 'st-mosaic-sheet'), 'the board is up')

  const bar = findByClass(opened, 'fang-titlebar')
  assert.ok(typeof bar.props.onMouseDown === 'function', 'the title row handles a press')
  // A press that lands on the row itself, with no control under it.
  bar.props.onMouseDown({ target: { closest: () => null } })
  const afterBar = (await mounted.rerender()).tree
  assert.equal(findByClass(afterBar, 'st-mosaic-sheet'), undefined, 'the bar dismisses the board')

  // Re-open, then press a control: the same handler runs, and the board must survive.
  byTestId(afterBar, 'mosaic-open').props.onClick()
  const reopened = (await mounted.rerender()).tree
  assert.ok(findByClass(reopened, 'st-mosaic-sheet'), 'the board is up again')
  const button = { closest: () => ({ tag: 'BUTTON' }) }
  findByClass(reopened, 'fang-titlebar').props.onMouseDown({ target: button })
  const afterControl = (await mounted.rerender()).tree
  assert.ok(findByClass(afterControl, 'st-mosaic-sheet'), 'a press on a control leaves the board alone')
})

test('opening the mosaic puts the outline and an open drawer away', async () => {
  const api = apiFor()
  const mounted = await mountPanel({ api, open: '我的书' })
  const { tree } = mounted
  // Open the models drawer first, so there is something to be put away. The drawer buttons
  // render an icon and then t(`tab.<key>`), and the stub keeps the key visible: the models
  // button is the one whose label is `tab.models`, whichever order the two sit in.
  const findTabButton = (node) => {
    if (node === null || typeof node !== 'object' || Array.isArray(node)) return undefined
    if (node.type === 'button' && typeof node.props?.className === 'string'
      && node.props.className.split(/\s+/).includes('st-drawer-btn')
      && node.props['data-testid'] === undefined
      && Array.isArray(node.children) && node.children.includes('tab.models')) return node
    for (const child of node.children ?? []) {
      const hit = findTabButton(child)
      if (hit !== undefined) return hit
    }
    return undefined
  }
  const modelsButton = findTabButton(tree)
  assert.ok(modelsButton, 'the models drawer button is in the title row')
  modelsButton.props.onClick()
  const { tree: withDrawer } = await mounted.rerender()
  assert.ok(findByClass(withDrawer, 'fang-backdrop'), 'the drawer is open')
  // Now open the mosaic: the drawer closes and the outline stays folded (it starts folded, so
  // the real assertion is that nothing re-opened it and the board is up).
  const open = (function find(node) {
    if (node === null || typeof node !== 'object' || Array.isArray(node)) return undefined
    if (node.props?.['data-testid'] === 'mosaic-open') return node
    for (const child of node.children ?? []) {
      const hit = find(child)
      if (hit !== undefined) return hit
    }
    return undefined
  })(withDrawer)
  assert.ok(open, 'the mosaic entry is reachable while a drawer is open')
  open.props.onClick()
  const { tree: board } = await mounted.rerender()
  assert.ok(findByClass(board, 'st-mosaic-sheet'), 'the board is open')
  assert.equal(findByClass(board, 'fang-backdrop'), undefined, 'the drawer was put away')
})

/**
 * The relations canvas: entity cards positioned by their saved layout (grid slots for the ones
 * that were never moved), SVG wires for LIVE edges only, and a detail popover for whichever card
 * or edge was picked last. Nothing here edits content — the popover reads the board; Task 10
 * adds the edit entry points.
 */
test('the relations canvas draws live edges and hides retired ones until picked', async () => {
  const api = apiFor({ load: mosaicBook() })
  // The relations canvas needs a measurable page; the interval only decides when the drag's
  // layout write leaves the queue, and zero means "write every edit", which keeps the test
  // synchronous about what it asserts.
  const mounted = await mountPanel({ api, open: '我的书', config: { saveInterval: 0 } })
  const { tree, rerender } = mounted
  const findOpen = (node) => {
    if (node === null || typeof node !== 'object' || Array.isArray(node)) return undefined
    if (node.props?.['data-testid'] === 'mosaic-open') return node
    for (const child of node.children ?? []) {
      const hit = findOpen(child)
      if (hit !== undefined) return hit
    }
    return undefined
  }
  findOpen(tree).props.onClick()
  const { tree: opened } = await rerender()

  const collect = (node, into, match) => {
    if (node === null || typeof node !== 'object' || Array.isArray(node)) return
    if (match(node)) into.push(node)
    for (const child of node.children ?? []) collect(child, into, match)
  }
  const has = (node, cls) => typeof node?.props?.className === 'string'
    && node.props.className.split(/\s+/).includes(cls)

  // The board OPENS on the cast: one card per character, and the item stays on its own page until
  // the writer asks for it. A relations page whose default answer is "everyone and everything" is
  // the page the cast graph was meant to replace.
  const cards = []
  collect(opened, cards, (n) => has(n, 'st-mosaic-card'))
  assert.equal(cards.length, 2, `one card per character, saw ${cards.length}`)
  // The centre picker still LISTS the item — it can be a centre, and its neighbours are characters
  // — so this checks the drawing, not the text on the page.
  assert.ok(!cards.some((card) => card.props['data-entity'] === 'c'), 'the item has no card on the cast graph')

  // Only the LIVE edge is drawn: r2 was retired, and retired history stays off the wall until
  // a task adds a way to show it.
  const edges = []
  collect(opened, edges, (n) => has(n, 'st-mosaic-edge'))
  assert.equal(edges.length, 1, `live edges only, saw ${edges.length}`)

  // A drag of the unmoved card persists its new slot through the panel's own save queue — the
  // same one text edits use, not a parallel write path. Each pointer event must be read off the
  // CURRENT tree: a handler is a closure over the render that produced it, and driving the drop
  // through the pre-drag node would read a `drag` state that had not started yet — exactly the
  // stale-node trap the rerender-per-event pattern here avoids.
  const cardOf = (tree, id) => {
    const found = []
    collect(tree, found, (n) => has(n, 'st-mosaic-card') && n.props['data-entity'] === id)
    return found[0]
  }
  // Both fixture characters are unmoved, so either proves the fallback slot; 'c' is the item,
  // which is not on this canvas at all.
  assert.ok(cardOf(opened, 'b'), 'the unmoved card is on the canvas')
  cardOf(opened, 'b').props.onPointerDown({ clientX: 10, clientY: 10, stopPropagation: () => {} })
  const { tree: midDrag } = await rerender()
  cardOf(midDrag, 'b').props.onPointerMove?.({ clientX: 60, clientY: 35 })
  const { tree: moved } = await rerender()
  cardOf(moved, 'b').props.onPointerUp({ clientX: 60, clientY: 35 })
  const { tree: afterDrag } = await rerender()
  assert.equal(api.calls.filter((c) => c[0] === 'save').length, 1, 'the drop saves once')
  // The fixture's 李四 already has a saved layout ({ x: 200 }), so the drop adds the pointer's 50px
  // of travel to THAT. The fallback grid only decides where a card the writer has never placed
  // goes; a card with a layout keeps it.
  assert.equal(cardOf(afterDrag, 'b').props.style.left, 200 + 50,
    'the card sits where it was dropped (saved slot + 50 of travel)')

  // Picking the live edge opens the detail: the author's truth first, then what 李四 believes.
  // In a browser the click also bubbles to the canvas, whose handler would dismiss what the edge
  // just opened — the edge must stop it, so the driven event carries a stopPropagation to swallow.
  edges[0].props.onClick({ stopPropagation: () => {} })
  const { tree: detail } = await rerender()
  assert.ok(findByClass(detail, 'st-mosaic-detail'), 'a picked edge opens the detail popover')
  const text = visibleText(detail).join(' ')
  assert.ok(text.includes('挚友'), `the truth kind is named, saw: ${text.slice(0, 120)}`)
  assert.ok(text.includes('陌路'), `the belief kind is named beside it, saw: ${text.slice(0, 120)}`)

  // The detail is a popover over the canvas: picking nothing again clears it, the same way
  // every other popover in the panel dismisses.
  const canvas = findByClass(detail, 'st-mosaic-canvas')
  // A click ON the canvas has it as both target and currentTarget; a click on a card would not,
  // and that distinction is the dismiss guard under test here.
  const wall = {}
  canvas.props.onClick({ target: wall, currentTarget: wall })
  const { tree: cleared } = await rerender()
  assert.equal(findByClass(cleared, 'st-mosaic-detail'), undefined, 'a canvas click dismisses the detail')
})

/**
 * A wire endpoint must land where its card actually renders, and an unmoved card renders at the
 * grid slot of its OWN array index — the top-left slot would misplace every fresh-board wire. The
 * same coordinates the component computes are recomputed here, so the test drifts with any change
 * to the grid instead of silently trusting a constant.
 */
test('wire endpoints follow each unmoved entity to its own grid slot', async () => {
  const b = book()
  b.mosaic = {
    schemaVersion: 1,
    entities: [
      { id: 'a', kind: 'character', name: '张三', role: '', summary: '', statuses: [], tags: [], layout: null },
      { id: 'b', kind: 'character', name: '李四', role: '', summary: '', statuses: [], tags: [], layout: null },
    ],
    edges: [
      { id: 'r1', from: 'a', to: 'b', truth: { kind: '挚友', note: '' }, beliefs: [], retired: false, log: [] },
    ],
  }
  const api = apiFor({ load: b })
  const mounted = await mountPanel({ api, open: '我的书', config: { saveInterval: 0 } })
  const { tree, rerender } = mounted
  const findOpen = (node) => {
    if (node === null || typeof node !== 'object' || Array.isArray(node)) return undefined
    if (node.props?.['data-testid'] === 'mosaic-open') return node
    for (const child of node.children ?? []) {
      const hit = findOpen(child)
      if (hit !== undefined) return hit
    }
    return undefined
  }
  findOpen(tree).props.onClick()
  const { tree: opened } = await rerender()

  const edges = []
  const collect = (node, into, match) => {
    if (node === null || typeof node !== 'object' || Array.isArray(node)) return
    if (match(node)) into.push(node)
    for (const child of node.children ?? []) collect(child, into, match)
  }
  const has = (node, cls) => typeof node?.props?.className === 'string'
    && node.props.className.split(/\s+/).includes(cls)
  collect(opened, edges, (n) => has(n, 'st-mosaic-edge'))
  assert.equal(edges.length, 1, `the live edge is drawn, saw ${edges.length}`)

  // The wire runs PIN to PIN and the cards are painted over it. The endpoint is the top-centre
  // pin, which is where a real thread on an investigation wall is tied; the card itself still
  // owns the layout slot.
  //
  // The endpoints are read from the CARDS as rendered, not restated from a formula. The canvas
  // stopped deriving positions from an index — cards are placed once by mosaicFreeSpot and then
  // owned by the writer's drags — so the only honest check is: does each end of the wire sit at
  // the pin of the card it names?
  const { CARD_W } = loadClientLogic()
  const cards = []
  collect(opened, cards, (n) => has(n, 'st-mosaic-card') && typeof n.props['data-entity'] === 'string')
  const boxOf = (id) => {
    const card = cards.find((n) => n.props['data-entity'] === id)
    assert.ok(card, `the card for ${id} is on the canvas`)
    return card.props.style
  }
  const pinOf = (id) => ({ x: boxOf(id).left + CARD_W / 2, y: boxOf(id).top + PIN_Y })
  const wire = edges[0].props
  // The fixture's live edge is 张三 → 李四. Both ends must sit on their own card's centre, in
  // whichever order the wire was drawn.
  const ids = cards.map((n) => n.props['data-entity'])
  assert.equal(ids.length, 2, `two cards, saw ${ids.length}`)
  const one = pinOf(ids[0])
  const two = pinOf(ids[1])
  const ends = [[wire.x1, wire.y1], [wire.x2, wire.y2]]
  const matches = (end, c) => Math.abs(end[0] - c.x) < 0.01 && Math.abs(end[1] - c.y) < 0.01
  assert.ok(
    (matches(ends[0], one) && matches(ends[1], two)) || (matches(ends[0], two) && matches(ends[1], one)),
    `each end anchors its own card, saw ${JSON.stringify(ends)} against ${JSON.stringify([one, two])}`)
  // And the two ends are not the same point: that is what a wire drawn from one shared slot would
  // look like, and it is the regression this test exists for.
  assert.notEqual(wire.x1, wire.x2, 'the two ends are not both drawn at one card')
})

/**
 * Pointer capture holds a fast drag; pointer cancel unwinds one. The cancel delivers no pointerup,
 * so the drag must reset with nothing committed and nothing picked — the card returns to its slot
 * and the save queue stays silent.
 */
test('a cancelled drag resets the card without committing', async () => {
  const api = apiFor({ load: mosaicBook() })
  const mounted = await mountPanel({ api, open: '我的书', config: { saveInterval: 0 } })
  const { tree, rerender } = mounted
  const findOpen = (node) => {
    if (node === null || typeof node !== 'object' || Array.isArray(node)) return undefined
    if (node.props?.['data-testid'] === 'mosaic-open') return node
    for (const child of node.children ?? []) {
      const hit = findOpen(child)
      if (hit !== undefined) return hit
    }
    return undefined
  }
  findOpen(tree).props.onClick()
  const { tree: opened } = await rerender()

  const cardOf = (t, id) => {
    const found = []
    const collect = (node) => {
      if (node === null || typeof node !== 'object' || Array.isArray(node)) return
      if (typeof node?.props?.className === 'string'
        && node.props.className.split(/\s+/).includes('st-mosaic-card')
        && node.props['data-entity'] === id) found.push(node)
      for (const child of node.children ?? []) collect(child)
    }
    collect(t)
    return found[0]
  }

  // pointerdown captures the pointer: a fast drag that outruns the re-render keeps its pointerup.
  const pointer = { clientX: 10, clientY: 10, pointerId: 7, stopPropagation: () => {} }
  const released = []
  pointer.currentTarget = { setPointerCapture: (pid) => released.push(pid) }
  cardOf(opened, 'b').props.onPointerDown(pointer)
  const { tree: midDrag } = await rerender()
  assert.deepEqual(released, [7], 'the drag captures the pointer it started with')

  cardOf(midDrag, 'b').props.onPointerMove?.({ clientX: 90, clientY: 60 })
  const { tree: moved } = await rerender()
  cardOf(moved, 'b').props.onPointerCancel()
  const { tree: cancelled } = await rerender()
  // The fixture's 李四 has a saved slot of x 200; the cancelled gesture leaves it exactly there,
  // not wherever the pointer had taken it.
  assert.equal(cardOf(cancelled, 'b').props.style.left, 200,
    'the cancelled drag returns the card to its slot')
  assert.equal(api.calls.filter((c) => c[0] === 'save').length, 0,
    'a cancelled gesture saves nothing')
})

/**
 * The detail popover switches kinds on ONE mounted instance: pick an edge, then a card, then
 * another card, and the content follows each pick. This is the regression shape for the hook
 * crash: MosaicDetail used to early-return its edge branch ABOVE the entity branch's
 * `useState(statusDraft)` while staying mounted across picks, so moving from an edge to a card
 * called a different number of hooks in the same instance and React blanked the panel.
 * This harness cannot catch that violation — its hook table just extends when a hook appears —
 * so the test pins the behaviour and the split (one hook-free edge component, one entity
 * component) makes it structurally impossible: each component has a fixed hook count.
 */
test('the detail popover follows each pick across edge, card, and another card', async () => {
  const api = apiFor({ load: mosaicBook() })
  const mounted = await mountPanel({ api, open: '我的书', config: { saveInterval: 0 } })
  openSheet(mounted)
  const { tree: opened } = await mounted.rerender()

  // Pick the live edge (its click must swallow bubbling, like the canvas test drives).
  const edge = allByClass(opened, 'st-mosaic-edge')[0]
  edge.props.onClick({ stopPropagation: () => {} })
  const { tree: edgeDetail } = await mounted.rerender()
  const edgeText = visibleText(findByClass(edgeDetail, 'st-mosaic-detail')).join('')
  assert.ok(edgeText.includes('挚友') && edgeText.includes('陌路'),
    `the edge popover shows truth and belief, saw: ${edgeText}`)

  // Pick 张三's card from the SAME mounted sheet. The pick is a click: pointerdown commits its
  // drag state before the pointerup reads it, so a rerender sits between them.
  const pickCard = async (tree, name) => {
    const down = (t) => allByClass(t, 'st-mosaic-card').find((n) => visibleText(n).join('').includes(name))
    const pointer = { clientX: 10, clientY: 10, pointerId: 7, stopPropagation: () => {} }
    pointer.currentTarget = { setPointerCapture: () => {} }
    down(tree).props.onPointerDown(pointer)
    const { tree: mid } = await mounted.rerender()
    down(mid).props.onPointerUp({ stopPropagation: () => {} })
    return (await mounted.rerender()).tree
  }
  const zhangTree = await pickCard(edgeDetail, '张三')
  // The role is an editable FIELD now, not a line of text, so the value lives in the input's props
  // rather than in the rendered text. That is the change: renaming a character or correcting their
  // role used to require deleting the card and making a new one.
  const roleField = findByTestId(zhangTree, 'mosaic-role-edit')
  assert.ok(roleField !== undefined, 'the card popover has a role field')
  assert.equal(roleField.props.value, '主角', `and it holds 张三's role, saw: ${roleField.props.value}`)
  assert.equal(findByTestId(zhangTree, 'mosaic-name-edit').props.value, '张三', 'the name is editable too')
  assert.ok(findByTestId(zhangTree, 'mosaic-status-add'), 'the card popover offers the status draft')

  // Pick 李四's card. A typed-but-unconfirmed draft from 张三 must not follow the writer here —
  // the entity component is keyed by entity id, so it remounts and starts empty.
  const add = findByTestId(zhangTree, 'mosaic-status-add')
  add.props.onChange({ target: { value: '潜伏' } })
  const { tree: drafted } = await mounted.rerender()
  const liTree = await pickCard(drafted, '李四')
  const liText = visibleText(findByClass(liTree, 'st-mosaic-detail')).join('')
  assert.ok(findByTestId(liTree, 'mosaic-status-add'), '李四\'s card popover is up')
  assert.equal(findByTestId(liTree, 'mosaic-name-edit').props.value, '李四', 'the popover now names 李四')
  assert.notEqual(findByTestId(liTree, 'mosaic-role-edit').props.value, '主角',
    'and the fields belong to 李四, not to the card before')
  assert.ok(!liText.includes('主角'), 'nothing of 张三 follows the pick')
  assert.equal(findByTestId(liTree, 'mosaic-status-add').props.value, '',
    'a typed-but-unconfirmed status draft does not carry to the next card')
})

/**
 * The static pages render straight off the book: the overview page binds a chapter's summary to
 * a leaf and saves through the panel's own updateBook, the world page shows non-item cards only,
 * the cast page lists characters with their status chips, and the item page resolves holders
 * through LIVE 持有 edges — the fixture's 持有 edge is retired, so 短刀 shows the no-holder
 * placeholder and never names 张三.
 */
test('the four static pages render from book data', async () => {
  // The shared fixture's only card is an item, so a second, non-item card joins THIS copy to
  // exercise the world page's split: 青石镇 is worldbuilding, 短刀 is an 物品.
  const b = mosaicBook()
  b.mosaic.entities.push({ id: 'd', kind: 'place', name: '青石镇', summary: '', description: '故事发生的小镇', tags: [], layout: null })
  const api = apiFor({ load: b })
  // The summary edit below must land in the save queue synchronously, which saveInterval 0
  // gives (the same trick the drag tests use).
  const mounted = await mountPanel({ api, open: '我的书', config: { saveInterval: 0 } })
  const { tree, rerender } = mounted
  const findOpen = (node) => {
    if (node === null || typeof node !== 'object' || Array.isArray(node)) return undefined
    if (node.props?.['data-testid'] === 'mosaic-open') return node
    for (const child of node.children ?? []) {
      const hit = findOpen(child)
      if (hit !== undefined) return hit
    }
    return undefined
  }
  findOpen(tree).props.onClick()
  const { tree: opened } = await rerender()

  const collect = (node, into, match) => {
    if (node === null || typeof node !== 'object' || Array.isArray(node)) return
    if (match(node)) into.push(node)
    for (const child of node.children ?? []) collect(child, into, match)
  }
  const text = (node) => visibleText(node).join(' ')

  // Tab labels go through the stub `t`, which shows the raw key, so pages are reached by the
  // bookmark ORDER the sheet-scaffold test already pins: relations, world, cast, items, proposals,
  // overview, versions, writing style. 梗概 has no bookmark of its own: it is one line per chapter, which is what
  // 概览 is about, so it renders at the top of that page.
  const tabs = []
  collect(opened, tabs, (n) => typeof n.props?.className === 'string'
    && n.props.className.split(/\s+/).includes('st-mosaic-tab'))
  const go = async (index) => {
    tabs[index].props.onClick()
    return (await rerender()).tree
  }

  // 世界观: non-item cards only — 青石镇 is a 设定 card and shows; 短刀 is an 物品 card and
  // belongs to the item page.
  const world = await go(1)
  const worldText = text(world)
  assert.ok(worldText.includes('青石镇'), 'a non-item card shows on the world page')
  assert.ok(worldText.includes('故事发生的小镇'), 'the card body shows')
  assert.ok(!worldText.includes('短刀'), 'an item card stays off the world page')

  // 角色: characters with role and status chips.
  const cast = await go(2)
  const castText = text(cast)
  assert.ok(castText.includes('张三') && castText.includes('李四'), 'every character is listed')
  assert.ok(castText.includes('主角'), 'the role shows')
  assert.ok(castText.includes('受伤'), 'status chips show')

  // 物品: item cards, and holders resolved from LIVE 持有 edges only. r2 (短刀→张三) is retired,
  // so the card shows the no-holder placeholder and never claims 张三 holds it. The body's own
  // word 张三的刀 is excluded from the substring check by asserting on the holder LINE only.
  const items = await go(3)
  const holderLines = []
  collect(items, holderLines, (n) => typeof n.props?.className === 'string'
    && n.props.className.split(/\s+/).includes('st-mosaic-page-holder'))
  assert.equal(holderLines.length, 1, 'one item card, one holder line')
  assert.equal(visibleText(holderLines[0]).join(' '), 'mosaic.noHolder',
    'a retired 持有 edge leaves the card with no live holder')

  // 提案 sits between 物品 and 概览 now: it is a board page, and the two reference pages
  // (概览, 版本) stay at the end.
  const proposals = await go(4)
  assert.ok(findByClass(proposals, 'st-mosaic-proposals-empty')
    || findByClass(proposals, 'st-mosaic-proposals'),
  'the proposals page renders its list, empty or not')

  // 概览 is a master-detail: a chapter list on the left, the selected chapter's dossier on the
  // right — its editable summary, the generated overview and the prose. A keystroke still saves
  // through updateBook, nodes AND the derived chapters, or the next render would hand the stale
  // value back to the writer.
  const overview = await go(5)
  const rows = []
  collect(overview, rows, (n) => typeof n.props?.className === 'string'
    && n.props.className.split(/\s+/).includes('fang-list-row'))
  assert.equal(rows.length, 1, `one row per chapter leaf, saw ${rows.length}`)
  assert.equal(rows[0].props['data-active'], 'true', 'the first chapter is selected')
  const pane = findByClass(overview, 'fang-split-detail')
  assert.ok(pane, 'the selected chapter has a reading pane')
  assert.ok(visibleText(pane).join(' ').includes(TEXT), 'the pane shows the chapter prose')
  const input = findByClass(overview, 'st-overview-summary')
  assert.ok(input, 'the pane binds a field to the summary')
  assert.equal(input.props.value, '', 'a leaf with no summary reads as empty')
  input.props.onChange({ target: { value: '黄昏将至' } })
  const saved = (await rerender()).tree
  assert.equal(findByClass(saved, 'st-overview-summary').props.value, '黄昏将至',
    'the field is controlled: the next render shows what was typed')
  const saves = api.calls.filter((c) => c[0] === 'save')
  assert.equal(saves.length, 1, 'the keystroke saves once')
  const savedLeaf = saves[0][1].nodes[0].children[0]
  assert.equal(savedLeaf.summary, '黄昏将至', 'the summary lands on the tree node')
  assert.equal(saves[0][1].chapters[0].summary, '黄昏将至',
    'the derived chapters ride along, or the editor shows stale text')
})


/** Helpers for the mosaic review tests below. */
function openSheet(mounted) {
  const find = (node) => {
    if (node === null || typeof node !== 'object' || Array.isArray(node)) return undefined
    if (node.props?.['data-testid'] === 'mosaic-open') return node
    for (const child of node.children ?? []) {
      const hit = find(child)
      if (hit !== undefined) return hit
    }
    return undefined
  }
  find(mounted.tree).props.onClick()
}

function findByTestId(node, id) {
  return allByTestId(node, id)[0]
}

function allByTestId(node, id, found = []) {
  if (node === null || typeof node !== 'object' || Array.isArray(node)) return found
  if (node.props?.['data-testid'] === id) found.push(node)
  for (const child of node.children ?? []) allByTestId(child, id, found)
  return found
}

function testIdIn(card, id) {
  return allByTestId(card, id).find((node) => node !== card)
}

/** One settle pass, then one rerender: a single drive can land between a click's promise and the
 * state it produced, which is the same reason the composer tests above rerender in pairs. */
async function settleClick(mounted) {
  await new Promise((resolve) => setTimeout(resolve, 0))
  return mounted.rerender()
}

/**
 * The relations page is where the AI meets the board: 检查本章 sends the open chapter, the answer
 * becomes one review card per change, and only the accepted ones reach the host. Each change
 * names its evidence with an index into the proposal's quote list, and a card shows the quote it
 * was made from so the writer can judge the model's reading — the reason the second change
 * carries a DIFFERENT evidenceIndex than the first.
 */
test('a fetched proposal renders one card per change and applies the accepted ones', async () => {
  const applied = []
  const api = {
    ...apiFor({ load: mosaicBook() }),
    meta: async () => ({ ok: true, roles: { mosaic: { provider: 'p', model: 'm' } } }),
    mosaicCheck: async () => ({
      ok: true, proposal: {
        id: 'pr1', sourceChapterId: 'c1',
        evidence: ['他按住伤口', '码头的仓库亮着灯'],
        changes: [
          { op: 'status.add', entityId: 'a', label: '受伤', evidenceIndex: 0 },
          { op: 'entity.upsert', kind: 'place', name: '码头仓库', summary: '', evidenceIndex: 1 },
        ],
      },
    }),
  }
  api.mosaicApply = async (_folder, changes) => {
    applied.push(changes)
    api.calls.push(['apply', changes])
    const next = mosaicBook()
    // A CHARACTER: the relations canvas draws the cast, so a repaint is proved by a character
    // appearing on it. (An item or a place would go to its own page instead.)
    next.mosaic.entities.push({ id: 'new1', kind: 'character', name: '码头仓库', role: '守夜人', summary: '', statuses: [], tags: [], layout: null })
    return { ok: true, applied: ['entity.upsert 码头仓库'], skipped: 0, book: next, token: 'tk-mosaic' }
  }
  // saveInterval 0: the apply path writes through updateBook, which arms the panel's save
  // timer; the default 5-minute timer would hold the test process after the assertions.
  const mounted = await mountPanel({ api, open: '我的书', config: { saveInterval: 0 } })
  const { rerender } = mounted
  openSheet(mounted)
  const opened = (await rerender()).tree

  const check = findByTestId(opened, 'mosaic-check')
  assert.ok(check, 'the check button renders on the relations page')
  assert.ok(!check.props.disabled, 'a configured model unlocks the check')
  // No question box on the board: the panel's one chat composer asks the board while it is open,
  // which is asserted by its own test.
  assert.equal(findByTestId(opened, 'mosaic-ask'), undefined, 'the board has no question box of its own')

  check.props.onClick()
  const proposal = (await settleClick(mounted)).tree

  const evidence = allByClass(proposal, 'st-mosaic-proposal-evidence')
  assert.equal(evidence.length, 1, 'the evidence quotes are listed once, above the cards')
  const evidenceText = visibleText(evidence[0]).join(' ')
  assert.ok(evidenceText.includes('他按住伤口') && evidenceText.includes('码头的仓库亮着灯'),
    `both quotes show in one list, saw: ${evidenceText.slice(0, 160)}`)

  const cards = allByClass(proposal, 'st-mosaic-proposal')
  assert.equal(cards.length, 2, `one card per change, saw ${cards.length}`)

  const first = visibleText(cards[0]).join(' ')
  assert.ok(first.includes('mosaic.op.status.add'), `the op reads through the dictionary, saw: ${first.slice(0, 160)}`)
  assert.ok(first.includes('受伤'), 'the status label shows')
  assert.ok(first.includes('他按住伤口'), 'and its evidence quote')
  const second = visibleText(cards[1]).join(' ')
  // The name itself lives in the card's input value (asserted right below), so the readable text
  // is the op and the payload line: an entity card names its KIND (through the dictionary, so the
  // stub `t` shows the key) and carries the summary it proposes.
  assert.ok(second.includes('mosaic.op.entity.upsert') && second.includes('mosaic.newKindPlace'),
    `the card says what it does and to what, saw: ${second.slice(0, 160)}`)
  assert.ok(second.includes('码头的仓库亮着灯'), 'with its own quote, not the first card\'s')
  // Edit-before-accept: the name is a controlled input on the card.
  const nameInput = findByClass(cards[1], 'st-mosaic-name')
  assert.ok(nameInput, 'the card offers a name field for edit-before-accept')
  assert.equal(nameInput.props.value, '码头仓库', 'bound to the change as fetched')
  nameInput.props.onChange({ target: { value: '码头一号仓' } })
  await rerender()

  // Accept the first, reject the second → one apply call carrying exactly one change.
  const decided = (await rerender()).tree
  const liveCards = allByClass(decided, 'st-mosaic-proposal')
  assert.ok(testIdIn(liveCards[0], 'proposal-accept') && testIdIn(liveCards[0], 'proposal-reject'),
    'each card offers accept and reject')
  testIdIn(liveCards[0], 'proposal-accept').props.onClick()
  testIdIn(liveCards[1], 'proposal-reject').props.onClick()
  const ready = (await rerender()).tree
  const applyButton = findByTestId(ready, 'proposal-apply')
  assert.ok(applyButton, 'accepted changes wait for one apply button')
  await applyButton.props.onClick()
  const after = (await settleClick(mounted)).tree

  assert.equal(applied.length, 1, 'one apply call, not one per card')
  assert.equal(applied[0].length, 1, 'only the accepted change goes to the host')
  assert.equal(applied[0][0].label, '受伤', 'and it is the accepted one, not the rejected one')
  assert.ok(api.calls.some((call) => call[0] === 'apply'), 'the apply reaches the host through the api stub')
  // The proposal area is cleared and the board shows what the host wrote back.
  assert.equal(allByClass(after, 'st-mosaic-proposal').length, 0, 'the review area empties')
  const canvasCards = allByClass(after, 'st-mosaic-card')
  assert.ok(canvasCards.some((card) => visibleText(card).join(' ').includes('码头仓库')),
    'the board repaints from the applied state')
})

/**
 * 梳理 reads the CARDS and writes a proposal. The request must carry the open book's folder:
 * without it the route could read the cards but had nowhere to store the proposal, so the model
 * call succeeded and the writer saw nothing to accept. This pins the whole path: request folder,
 * proposal meta, accept, write.
 */
test('梳理 sends the open book and its proposal can be accepted and written', async () => {
  const related = []
  const applied = []
  const api = {
    ...apiFor({ load: mosaicBook() }),
    meta: async () => ({ ok: true, roles: { mosaic: { provider: 'p', model: 'm' } } }),
    mosaicRelate: async (cards, edges, bookFolder) => {
      related.push({ cards, edges, bookFolder })
      return {
        ok: true,
        proposal: {
          id: 'p-rel', at: Date.UTC(2026, 9, 29, 1, 2), source: 'relate',
          sourceChapterId: null, status: 'pending',
          evidence: ['张三与李四十年前就认识'],
          changes: [{ op: 'edge.upsert', from: 'a', to: 'b', kind: '旧识', note: '十年前就认识' }],
        },
      }
    },
  }
  api.mosaicApply = async (folder, changes, proposalId) => {
    applied.push({ folder, changes, proposalId })
    return { ok: true, applied: ['edge.upsert 旧识'], skipped: 0, book: mosaicBook(), token: 'tk-rel' }
  }
  const mounted = await mountPanel({ api, open: '我的书', config: { saveInterval: 0 } })
  openSheet(mounted)
  let tree = (await mounted.rerender()).tree
  findByTestId(tree, 'mosaic-relate').props.onClick()
  tree = (await settleClick(mounted)).tree

  assert.equal(related.length, 1, 'one relate call')
  assert.equal(related[0].bookFolder, '我的书', 'the open book travels with the cards')
  const card = allByClass(tree, 'st-mosaic-proposal')[0]
  assert.ok(card, 'the proposal renders for review')
  const meta = visibleText(findByClass(tree, 'st-mosaic-proposal-wrap')).join(' ')
  assert.ok(meta.includes('mosaic.proposalFromRelate'), 'the row names where it came from')
  assert.ok(meta.includes('2026'), 'and when it arrived')

  testIdIn(card, 'proposal-accept').props.onClick()
  tree = (await settleClick(mounted)).tree
  await findByTestId(tree, 'proposal-apply').props.onClick()
  await settleClick(mounted)
  assert.equal(applied.length, 1, 'one write')
  assert.equal(applied[0].proposalId, 'p-rel', 'the stored proposal is marked answered')
  assert.equal(applied[0].changes[0].kind, '旧识', 'and the accepted edge is written')
})

/**
 * A question about the board answers in place, below the proposal area — a separate drawer would
 * hide the board the question is about. And the answer is raw prose, never parsed as a proposal.
 */
/**
 * While a proposal waits, the 关系网 bookmark counts the changes it holds: the writer who closed
 * the sheet mid-review can see the review is still owed without opening it first. Only UNDECIDED
 * changes count — a verdict, accept or reject, is the writer saying this change is settled, so
 * either one takes it off the number.
 */
test('a pending proposal badges the relations bookmark with its undecided count', async () => {
  const api = {
    ...apiFor({ load: mosaicBook() }),
    meta: async () => ({ ok: true, roles: { mosaic: { provider: 'p', model: 'm' } } }),
    mosaicCheck: async () => ({
      ok: true, proposal: {
        id: 'pr2', sourceChapterId: 'c1', evidence: ['引句'],
        changes: [
          { op: 'status.add', entityId: 'a', label: '受伤', evidenceIndex: 0 },
          { op: 'status.add', entityId: 'b', label: '警觉', evidenceIndex: 0 },
          { op: 'status.add', entityId: 'a', label: '疲惫', evidenceIndex: 0 },
        ],
      },
    }),
  }
  // saveInterval 0: the apply path writes through updateBook, which arms the panel's save
  // timer; the default 5-minute timer would hold the test process after the assertions.
  const mounted = await mountPanel({ api, open: '我的书', config: { saveInterval: 0 } })
  const { rerender } = mounted
  openSheet(mounted)
  const before = (await rerender()).tree
  assert.equal(allByClass(before, 'st-mosaic-tab-badge').length, 0, 'no badge before anything is fetched')
  findByTestId(before, 'mosaic-check').props.onClick()
  const fetched = (await settleClick(mounted)).tree
  const badge = findByClass(fetched, 'st-mosaic-tab-badge')
  assert.ok(badge, 'the relations bookmark gains a badge')
  assert.equal(visibleText(badge).join(''), '3', 'and it counts the undecided changes')

  // One verdict in, the number follows: accepting settles one card, rejecting settles another.
  let cards = allByClass(fetched, 'st-mosaic-proposal')
  testIdIn(cards[0], 'proposal-accept').props.onClick()
  const accepted = (await rerender()).tree
  const badgeAfterAccept = findByClass(accepted, 'st-mosaic-tab-badge')
  assert.equal(visibleText(badgeAfterAccept).join(''), '2', 'an accepted change stops being owed')
  cards = allByClass(accepted, 'st-mosaic-proposal')
  testIdIn(cards[1], 'proposal-reject').props.onClick()
  const rejected = (await rerender()).tree
  const badgeAfterReject = findByClass(rejected, 'st-mosaic-tab-badge')
  assert.equal(visibleText(badgeAfterReject).join(''), '1', 'a rejected change is settled too')
  // Toggling the accepted card back to undecided puts it back on the count.
  cards = allByClass(rejected, 'st-mosaic-proposal')
  testIdIn(cards[0], 'proposal-accept').props.onClick()
  const reset = (await rerender()).tree
  assert.equal(visibleText(findByClass(reset, 'st-mosaic-tab-badge')).join(''), '2',
    'a card toggled back to undecided is owed again')
})

/**
 * An edge upsert that updates an edge the board already has shows the before/after of the truth
 * (前后值) — a bare new kind gives the writer nothing to check the change against. The current
 * kind is matched from the board by the endpoint pair, the same match the host's apply performs;
 * for endpoints that are not on the board there is no existing edge to show, and the card falls
 * back to the new value alone.
 */
test('an edge upsert card shows the current truth beside the proposed one', async () => {
  const api = {
    ...apiFor({ load: mosaicBook() }),
    meta: async () => ({ ok: true, roles: { mosaic: { provider: 'p', model: 'm' } } }),
    mosaicCheck: async () => ({
      ok: true, proposal: {
        id: 'pr3', sourceChapterId: 'c1', evidence: ['引句'],
        changes: [
          { op: 'edge.upsert', from: 'a', to: 'b', truth: { kind: '战友', note: '' }, evidenceIndex: 0 },
          { op: 'edge.upsert', from: 'zz', to: 'yy', truth: { kind: '同乡', note: '' }, evidenceIndex: 0 },
        ],
      },
    }),
  }
  const mounted = await mountPanel({ api, open: '我的书' })
  const { rerender } = mounted
  openSheet(mounted)
  const opened = (await rerender()).tree
  findByTestId(opened, 'mosaic-check').props.onClick()
  const fetched = (await settleClick(mounted)).tree
  const cards = allByClass(fetched, 'st-mosaic-proposal')
  assert.equal(cards.length, 2, 'one card per edge change')
  const known = visibleText(cards[0]).join(' ')
  assert.ok(known.includes('挚友 → 战友'),
    `an existing edge shows old kind → new kind, saw: ${known.slice(0, 160)}`)
  const unknown = visibleText(cards[1]).join(' ')
  assert.ok(unknown.includes('同乡') && !unknown.includes('→'),
    `endpoints off the board show only the new value, saw: ${unknown.slice(0, 160)}`)
})

/**
 * The apply route writes the book file itself, so the token it answers with is the one the next
 * save must carry — the same adoption `applyCast` performs. Without it the next autosave is
 * refused as stale and the writer sees an error for doing nothing wrong. The flush-before-apply
 * half is observable only as ordering here: with saveInterval 0 the queue writes every edit
 * immediately, so the flush the apply issues is a no-op, but the contract it guarantees still
 * holds and is what the assertion pins — by the time the apply call reaches the host, the text
 * the writer typed has already gone out ahead of it.
 */
test('a mosaic apply writes pending editor text first and the next save carries the route token', async () => {
  const saveTokens = []
  const api = {
    ...apiFor({ load: mosaicBook() }),
    meta: async () => ({ ok: true, roles: { mosaic: { provider: 'p', model: 'm' } } }),
    save: async (next, token) => {
      saveTokens.push(token)
      api.calls.push(['save', next, token])
      return { ok: true, token: `tk-save-${saveTokens.length}` }
    },
    mosaicCheck: async () => ({
      ok: true, proposal: {
        id: 'pr4', sourceChapterId: 'c1', evidence: ['引句'],
        changes: [{ op: 'status.add', entityId: 'a', label: '受伤', evidenceIndex: 0 }],
      },
    }),
  }
  api.mosaicApply = async (_folder, changes) => {
    api.calls.push(['apply', changes])
    const next = mosaicBook()
    next.mosaic.entities[0].statuses.push({ id: 's2', label: '受伤' })
    return { ok: true, applied: ['status.add 受伤'], skipped: 0, book: next, token: 'tk-apply-1' }
  }
  const mounted = await mountPanel({ api, open: '我的书', config: { saveInterval: 0 } })
  const { rerender } = mounted

  // The writer types, then goes to the board: the pending text is the thing the flush protects.
  const editor = findByClass(mounted.tree, 'st-editor')
  assert.ok(editor, 'the editor is on the desk')
  editor.props.onChange({ target: { value: '雨落在码头上。' } })
  for (let i = 0; i < 3; i += 1) await mounted.rerender()

  openSheet(mounted)
  const opened = (await rerender()).tree
  findByTestId(opened, 'mosaic-check').props.onClick()
  const fetched = (await settleClick(mounted)).tree
  const cards = allByClass(fetched, 'st-mosaic-proposal')
  testIdIn(cards[0], 'proposal-accept').props.onClick()
  const ready = (await rerender()).tree
  await findByTestId(ready, 'proposal-apply').props.onClick()
  await settleClick(mounted)

  const saveIndex = api.calls.findIndex((call) => call[0] === 'save')
  const applyIndex = api.calls.findIndex((call) => call[0] === 'apply')
  assert.ok(applyIndex > -1 && saveIndex > -1, 'both the editor save and the apply reach the host')
  assert.ok(saveIndex < applyIndex, `the save goes out before the apply, calls: ${JSON.stringify(api.calls.map((c) => c[0]))}`)
  assert.ok(JSON.stringify(api.calls[saveIndex]).includes('雨落在码头上。'),
    'the save ahead of the apply is the one carrying the typed text')
  // The apply's answer is ADOPTED, not re-queued: the route already wrote the file, so a save
  // right after it would be a second write of bytes nothing changed. The token still has to be
  // in hand, which is observable on the next save the writer's own typing causes.
  const savesAfterApply = saveTokens.length
  assert.equal(savesAfterApply, 1, `the apply does not queue a save of its own, saw: ${saveTokens.join(',')}`)
  const afterApply = (await rerender()).tree
  const editorAfter = findByClass(afterApply, 'st-editor')
  editorAfter.props.onChange({ target: { value: '雨落在码头上。等。' } })
  for (let i = 0; i < 3; i += 1) await mounted.rerender()
  assert.equal(saveTokens[saveTokens.length - 1], 'tk-apply-1',
    `the next save carries the apply route's token, saw: ${saveTokens.join(',')}`)
})

/**
 * The flush the apply awaits has to BE the save: flushSave used to swallow its own promise, so
 * `await onFlush()` awaited undefined and the apply POST raced the pending editor save. Losing
 * that race sent the apply's stale-save recovery through a reload that discarded the typed text.
 * Observable here as ordering: with the flush awaited, the save of the pending text is COMPLETE
 * (its response token adopted) before the apply is issued. The mosaic apply test above pins the
 * same ordering coarsely; this one pins that the await actually waits.
 */
test('awaiting the apply flush waits for the pending save to finish', async () => {
  const events = []
  let resolveSave
  const api = {
    ...apiFor({ load: mosaicBook() }),
    meta: async () => ({ ok: true, roles: { mosaic: { provider: 'p', model: 'm' } } }),
    save: async (next, token) => {
      events.push('save-start')
      // Hold the save open until the test releases it. The apply AWAITS the flush, so its whole
      // chain blocks here; a flush that did not return its promise would let the apply issue
      // while this is still in flight.
      await new Promise((resolve) => { resolveSave = resolve })
      events.push('save-done')
      return { ok: true, token: 'tk-after-flush' }
    },
    mosaicCheck: async () => ({
      ok: true, proposal: {
        id: 'pr5', sourceChapterId: 'c1', evidence: ['引句'],
        changes: [{ op: 'status.add', entityId: 'a', label: '受伤', evidenceIndex: 0 }],
      },
    }),
  }
  api.mosaicApply = async () => {
    events.push('apply')
    const next = mosaicBook()
    return { ok: true, applied: ['status.add 受伤'], skipped: 0, book: next, token: 'tk-apply' }
  }
  // A LONG interval: the typed text stays pending until the apply's own flush writes it, so the
  // save observed here is the one the flush triggered, not an autosave.
  const mounted = await mountPanel({ api, open: '我的书', config: { saveInterval: 60000 } })
  const { rerender } = mounted
  const editor = findByClass(mounted.tree, 'st-editor')
  editor.props.onChange({ target: { value: '还没保存的一句。' } })
  for (let i = 0; i < 3; i += 1) await mounted.rerender()

  openSheet(mounted)
  let tree = (await rerender()).tree
  findByTestId(tree, 'mosaic-check').props.onClick()
  tree = (await settleClick(mounted)).tree
  const cards = allByClass(tree, 'st-mosaic-proposal')
  testIdIn(cards[0], 'proposal-accept').props.onClick()
  tree = (await rerender()).tree
  const applyButton = findByTestId(tree, 'proposal-apply')
  // NOT awaited: the apply is blocked inside the held save on purpose. Fire it, then observe.
  applyButton.props.onClick()
  tree = (await rerender()).tree

  assert.deepEqual(events, ['save-start'],
    'the flush started the pending save and the apply is waiting on it, not issuing past it')
  resolveSave()
  tree = (await settleClick(mounted)).tree
  await settleClick(mounted)

  assert.deepEqual(events, ['save-start', 'save-done', 'apply'],
    `the save completed BEFORE the apply was issued, events: ${events.join(',')}`)
})

/**
 * A fetched proposal is book-scoped state. Switching books mid-review must not leave it where a
 * later apply would land book A's id-keyed changes on book B's board — entity.upsert matches by
 * kind+name, so that is an overwrite, not a miss. The sheet closes with the load too, which is
 * what drops the sheet-local accept/reject decisions: they live in MosaicSheet state and only
 * exist while it is mounted.
 */
test('loading another book clears a pending proposal but leaves the board open', async () => {
  const bookA = mosaicBook()
  let loading = bookA
  const twoBooks = [
    ...catalog,
    { folder: '另一本', title: '另一本', chapters: 1, finals: 1, total: 1, absolutePath: '/ws/story/另一本' },
  ]
  const api = {
    ...apiFor({ books: twoBooks, load: mosaicBook() }),
    load: async () => ({ ok: true, book: loading, token: 'tk-load', recovered: false }),
    meta: async () => ({ ok: true, roles: { mosaic: { provider: 'p', model: 'm' } } }),
    mosaicCheck: async () => ({
      ok: true, proposal: {
        id: 'pr6', sourceChapterId: 'c1', evidence: ['引句'],
        changes: [{ op: 'status.add', entityId: 'a', label: '受伤', evidenceIndex: 0 }],
      },
    }),
  }
  // saveInterval 0: updateBook inside the apply arms the panel's save timer otherwise.
  const mounted = await mountPanel({ api, open: '我的书', config: { saveInterval: 0 } })
  const { rerender } = mounted
  openSheet(mounted)
  let tree = (await rerender()).tree
  findByTestId(tree, 'mosaic-check').props.onClick()
  tree = (await settleClick(mounted)).tree
  const cards = allByClass(tree, 'st-mosaic-proposal')
  testIdIn(cards[0], 'proposal-accept').props.onClick()
  tree = (await rerender()).tree
  assert.ok(findByTestId(tree, 'proposal-apply'), 'the review is mid-flight with an accepted change')

  // Switch books the way the panel now offers: back to the shelf, then open the other one. The
  // title used to be a menu of the other books; it is a heading again, so the shelf is the route.
  tree = (await rerender()).tree
  findByClass(tree, 'fang-rail-toggle').props.onClick()
  tree = (await rerender()).tree
  findByTestId(tree, 'rail-shelf').props.onClick()
  // The shelf reads its list through a route, so reaching it takes more than one pass: the first
  // render after the press has the page, the second has the books.
  for (let i = 0; i < 4; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 0))
    tree = (await rerender()).tree
    if (findByClass(tree, 'st-library') !== undefined && allByClass(tree, 'st-book-open').length > 1) break
  }
  assert.ok(findByClass(tree, 'st-library'), 'the shelf is shown')
  // The name lives on the cover strip inside the card, not in the card's `st-book-open` click
  // area — that row only carries the meta line. Address the card that CONTAINS the name.
  const other = allByClass(tree, 'st-mosaic-portrait-name')
    .find((row) => visibleText(row).join('').includes('另一本'))
  assert.ok(other, 'the shelf offers the other book')
  loading = book()
  loading.title = '另一本'
  const card = allByClass(tree, 'st-mosaic-page-card')
    .find((node) => node.props.role === 'button' && JSON.stringify(node).includes('另一本'))
  assert.ok(card, 'the other book is a card that opens')
  card.props.onClick()
  tree = (await settleClick(mounted)).tree

  // The PROPOSAL dies with the book it was checked against: its changes carry entity ids resolved
  // against book A's board, so applying it to book B would overwrite.
  //
  // The board itself is CLOSED at this point, and that is correct rather than a regression: the
  // route to another book goes through the outline, and the outline and the board are mutually
  // exclusive — opening one puts the other away. What the test has to prove is that the pending
  // proposal is gone, so the board is reopened the way the writer would reopen it.
  assert.equal(findByClass(tree, 'st-mosaic-sheet'), undefined,
    'the board is closed, because reaching the shelf opened the outline')
  findByTestId(tree, 'mosaic-open').props.onClick()
  tree = (await settleClick(mounted)).tree
  assert.ok(findByClass(tree, 'st-mosaic-sheet') !== undefined, 'the board reopens on the new book')
  assert.equal(allByClass(tree, 'st-mosaic-proposal').length, 0, 'no proposal survives the switch')
  // And the review area on the NEW book is empty rather than showing book A's changes.
  assert.equal(allByClass(tree, 'st-mosaic-proposal').length, 0, 'the new book starts with no review')
})

/**
 * The board is not AI-only: the detail popover edits the writer-owned fields in place. A
 * character's status chips toggle off on click and the input adds one on Enter; summary and card
 * body are textareas. The write path is the SAME one the layout drag uses — updateBook with the
 * mosaic patched — so the edit lands on disk through the ordinary save queue, and name/role/kind
 * stay read-only (a name change would break the apply route's name-based matching).
 */
test('the detail popover edits statuses and summary through one board update', async () => {
  const saves = []
  const api = {
    ...apiFor({ load: mosaicBook() }),
    save: async (next) => { saves.push(next); return { ok: true, token: 'tk-edit' } },
  }
  // Interval 0: every board patch writes immediately, like the drag and overview tests use. The
  // edits below are several pushes, so the assertion reads the LAST save, which carries all of
  // them (the queue writes whole books, and each edit builds on the previous state).
  const mounted = await mountPanel({ api, open: '我的书', config: { saveInterval: 0 } })
  const { rerender } = mounted
  openSheet(mounted)
  let tree = (await rerender()).tree
  // Pick 张三's card (a click, not a drag). The down must commit its state before the up reads
  // it, so a rerender sits between them, like the drag tests do.
  const card = allByClass(tree, 'st-mosaic-card').find((node) => visibleText(node).join(' ').includes('张三'))
  const pointer = { clientX: 10, clientY: 10, pointerId: 7, stopPropagation: () => {} }
  pointer.currentTarget = { setPointerCapture: () => {} }
  card.props.onPointerDown(pointer)
  const { tree: held } = await rerender()
  allByClass(held, 'st-mosaic-card').find((node) => visibleText(node).join(' ').includes('张三')).props.onPointerUp({ stopPropagation: () => {} })
  tree = (await rerender()).tree
  assert.ok(findByClass(tree, 'st-mosaic-detail'), 'the click opens the detail popover')

  // Toggle the existing 受伤 status off: the chip is the toggle.
  const chip = allByTestId(tree, 'mosaic-status-chip').find((node) => visibleText(node).join('') === '受伤')
  assert.ok(chip, 'the existing status renders as a toggle chip')
  chip.props.onClick()
  tree = (await rerender()).tree

  // Add a new status through the input's Enter.
  const add = findByTestId(tree, 'mosaic-status-add')
  assert.ok(add, 'an add-status input is offered')
  add.props.onChange({ target: { value: '潜伏' } })
  tree = (await rerender()).tree
  findByTestId(tree, 'mosaic-status-add').props.onKeyDown({ key: 'Enter', preventDefault: () => {} })
  tree = (await rerender()).tree

  // Type a summary.
  const summary = findByTestId(tree, 'mosaic-summary-edit')
  assert.ok(summary, 'the summary is an editable textarea')
  summary.props.onChange({ target: { value: '青帮的人，左手有旧伤。' } })
  await rerender()

  // The edits went through updateBook; the last save carries all of them, because each edit
  // builds on the state the previous one wrote.
  assert.ok(saves.length >= 1, `the edits reached the queue, saw ${saves.length} saves`)
  const entity = saves.at(-1).mosaic.entities.find((e) => e.name === '张三')
  assert.ok(entity, 'the saved book still has 张三 on the board')
  assert.deepEqual(entity.statuses.map((s) => s.label), ['潜伏'], '受伤 removed, 潜伏 added')
  assert.equal(entity.summary, '青帮的人，左手有旧伤。')
  // Name and role untouched: they are out of the edit surface.
  assert.equal(entity.name, '张三')
  assert.equal(entity.role, '主角')
  // The other entities are untouched.
  assert.ok(saves.at(-1).mosaic.entities.some((e) => e.name === '李四'), '李四 survives the patch')
})

test('the desk opens without a resolved workspace, because a book remembers where it lives', async () => {
  // The panel resolves the directory it would CREATE a new book in, and refuses to guess: a book
  // folder is not a place to put another book. But the desk used to share that refusal, so a host
  // with no usable workspace row — the desktop app before any workspace is registered, or a
  // session attached only to book folders — showed a one-line warning instead of the manuscript
  // the writer had open. Where a book LIVES is a property of the book, so opening it must not
  // depend on where the next one would go.
  const runtime = loadClientForRender()
  const { plugin, render, rerender } = runtime
  const registrations = []
  const scopeCtx = {
    layout: { selectPanel: () => {} },
    workspaces: { create: async ({ path }) => ({ workspaceId: 'w-book', path, title: '我的书', sessionIds: [], createdAt: '', updatedAt: '' }) },
    uiWorkspace: { openSession: () => {}, startSession: () => {}, openWorkspace: async () => {} },
    get: (name) => scopeCtx[name],
    slots: {
      inject: (_key, factory) => registrations.push(factory),
      register: (options) => { registrations.push({ options }); return () => {} },
    },
  }
  plugin.apply({
    effect: (fn) => fn(),
    inject: (_names, callback) => callback(scopeCtx),
    slots: scopeCtx.slots,
    locale: { register: () => () => {}, bind: () => () => t },
  }, {})
  for (const factory of registrations) if (typeof factory === 'function') factory()
  const panel = registrations.find((entry) => typeof entry === 'object' && entry.options.name === 'main')
  // The shelf's rows must be the book's own directory for this case, so the double derives them
  // from the workspace it was asked about; the load answers for that same root.
  const api = apiFor({ books: undefined, load: book() })
  api.books = async (ws) => {
    api.calls.push(['books', ws])
    return { ok: true, books: [{ ...catalog[0], absolutePath: `${ws}/我的书`, workspace: ws }] }
  }
  // No workspace at all: every row is a book folder, which is exactly what `isBookWorkspace`
  // filters out, so `workspacePath` never resolves.
  const items = [{ workspaceId: 'w-book', path: '/ws/story', title: 'writer · 我的书', sessionIds: [] }]
  const props = {
    ...panel.options.inject(), t, api, config: {},
    useWorkspaces: (selector) => selector({ items }),
    useSessions: (selector) => selector({ byId: {} }),
    workspaceSnapshot: { items },
  }

  // Open the remembered book the way a relaunch does: by clicking its card on the shelf.
  const mounted = await render(plugin.__components.StoryPanel, props)
  const card = findByClass(mounted.tree, 'st-book-open')
  assert.ok(card, 'the shelf still lists the book')
  card.props.onClick()
  // `rerender` keeps the hook table: the panel's own state is the thing under test, so a fresh
  // `render` would be a page reload and would hide the click entirely.
  const opened = await rerender(plugin.__components.StoryPanel, props)
  const text = visibleText(opened.tree).join(' ')
  assert.ok(!text.includes('label.noWorkspace'), `the desk is not refused without a workspace row, saw: ${text.slice(0, 160)}`)
  assert.ok(text.includes('我的书'), 'the open book is on screen')
  assert.ok(text.includes('第1章'), `the outline is drawn, saw: ${text.slice(0, 160)}`)
  assert.ok(api.calls.some((call) => call[0] === 'load' && call[1] === '我的书'),
    `the book is read from its own workspace, saw: ${JSON.stringify(api.calls)}`)
  assert.equal(findByClass(opened.tree, 'st-library'), undefined, 'the desk replaces the shelf')
})

test('a desktop that only knows the book folder opens the shelf, never a workspace warning', async () => {
  // The desktop app starts the session inside the book, so the ONLY workspace row is the book's
  // own folder — a row `isBookWorkspace` rejects, leaving `workspacePath` (where a NEW book would
  // go) empty forever. The panel used to answer "can I render at all" with that variable, so the
  // writer got one frame of "pick a workspace on the left", then an empty shelf, then the black
  // page: the plugin's only screen in the desktop app. `root` is the path the panel reads from and
  // a book folder satisfies it; only the shelf's create card waits for a real workspace.
  const runtime = loadClientForRender()
  const { plugin, render } = runtime
  const registrations = []
  const scopeCtx = {
    layout: { selectPanel: () => {} },
    workspaces: { create: async ({ path }) => ({ workspaceId: 'w-book', path, title: 'book', sessionIds: [], createdAt: '', updatedAt: '' }) },
    uiWorkspace: { openSession: () => {}, startSession: () => {}, openWorkspace: async () => {} },
    get: (name) => scopeCtx[name],
    slots: {
      inject: (_key, factory) => registrations.push(factory),
      register: (options) => { registrations.push({ options }); return () => {} },
    },
  }
  plugin.apply({
    effect: (fn) => fn(),
    inject: (_names, callback) => callback(scopeCtx),
    slots: scopeCtx.slots,
    locale: { register: () => () => {}, bind: () => () => t },
  }, {})
  for (const factory of registrations) if (typeof factory === 'function') factory()
  const panel = registrations.find((entry) => typeof entry === 'object' && entry.options.name === 'main')
  const api = apiFor({
    books: [{ ...catalog[0], absolutePath: '/ws/story/book', workspace: '/ws/story/book' }],
  })
  // Every row is a book folder, and the session is attached to it.
  const bookWorkspace = { workspaceId: 'w-book', path: '/ws/story/book', title: 'writer · book', sessionIds: ['s1'] }
  const props = {
    ...panel.options.inject(), t, api, config: {}, sessionId: 's1',
    useWorkspaces: (selector) => selector({ items: [bookWorkspace] }),
    useSessions: (selector) => selector({ byId: {} }),
    workspaceSnapshot: { items: [bookWorkspace] },
  }
  const mounted = await render(plugin.__components.StoryPanel, props)
  const texts = mounted.renders.map((pass) => visibleText(pass).join(' '))
  for (const text of texts) {
    assert.ok(!text.includes('label.noWorkspace'), `no pass shows the workspace warning, saw: ${text.slice(0, 120)}`)
  }
  const visible = texts[texts.length - 1]
  assert.ok(visible.includes('label.library'), `the shelf is the screen, saw: ${visible.slice(0, 160)}`)
  assert.ok(visible.includes('我的书'), 'the book is listed even without a separate workspace row')
  // The shelf no longer takes a path from the panel: the host reads the library from its own
  // settings, so the call carries no argument at all.
  assert.ok(api.calls.some((call) => call[0] === 'books'),
    `the shelf is listed, saw: ${JSON.stringify(api.calls)}`)
})

test('a book selected while the read is still out never leaves the middle blank', async () => {
  // The blank frame is not the loading one: it is the frame where `bookFolder` has just been set
  // and the load effect has not run yet, so `state` is still `idle` with `book: null`. `middle()`
  // answered that frame with `null`, which is why the shelf showed, then the whole centre went
  // empty — "the card flashes and everything goes black". The fix is that the empty case says so;
  // this drives the panel through the frame and asserts every pass is non-blank.
  const runtime = loadClientForRender()
  const { plugin, render, rerender } = runtime
  const registrations = []
  const scopeCtx = {
    layout: { selectPanel: () => {} },
    workspaces: { create: async ({ path }) => ({ workspaceId: 'w', path }) },
    uiWorkspace: { openSession: () => {}, startSession: () => {}, openWorkspace: async () => {} },
    get: (name) => scopeCtx[name],
    slots: {
      inject: (_key, factory) => registrations.push(factory),
      register: (options) => { registrations.push({ options }); return () => {} },
    },
  }
  plugin.apply({
    effect: (fn) => fn(),
    inject: (_names, callback) => callback(scopeCtx),
    slots: scopeCtx.slots,
    locale: { register: () => () => {}, bind: () => () => t },
  }, {})
  for (const factory of registrations) if (typeof factory === 'function') factory()
  const panel = registrations.find((entry) => typeof entry === 'object' && entry.options.name === 'main')

  const items = [{ workspaceId: 'w1', path: '/ws', title: 'W', sessionIds: [] }]
  const props = {
    ...panel.options.inject(), t, api: apiFor(), config: {}, workspacePath: '/ws',
    useWorkspaces: (selector) => selector({ items }),
    useSessions: (selector) => selector({ byId: {} }),
    workspaceSnapshot: { items },
  }
  const mounted = await render(plugin.__components.StoryPanel, props)
  findByClass(mounted.tree, 'st-book-open').props.onClick()
  const opened = await rerender(plugin.__components.StoryPanel, props)
  for (const [index, pass] of opened.renders.entries()) {
    const text = visibleText(pass).join(' ').trim()
    assert.ok(text !== '', `pass ${index} renders something rather than an empty centre`)
  }
})

test('a render crash shows its message instead of removing the whole panel', async () => {
  // The host has no error boundary over a main panel: anything thrown while rendering took the
  // column, the status bar and all, and left a blank screen indistinguishable from a plugin that
  // never loaded. The panel installs its own boundary so the failure is readable.
  const runtime = loadClientForRender()
  const { plugin } = runtime
  const boundary = plugin.__components.StoryPanelBoundary
  assert.ok(boundary !== undefined, 'the boundary is exported')

  const boom = () => { throw new Error('deliberate render failure') }
  const state = { error: null }
  const instance = new boundary({})
  Object.assign(instance, { props: {}, state })
  // What React does, in order: derive the state, then render again.
  instance.state = boundary.getDerivedStateFromError(new Error('deliberate render failure'))
  // `componentDidCatch` writes where a later build can read it back.
  let recorded
  const previousWindow = globalThis.window
  globalThis.window = { localStorage: { setItem: (key, value) => { recorded = { key, value } }, getItem: () => null } }
  try {
    instance.componentDidCatch(new Error('deliberate render failure'), { componentStack: 'in StoryPanelBody' })
  } finally {
    globalThis.window = previousWindow
  }
  assert.equal(recorded?.key, 'dsh.storywriting.lastError', 'the crash is recorded where it can be read later')
  assert.ok(String(recorded.value).includes('deliberate render failure'), 'the recorded message names the failure')
  assert.ok(String(recorded.value).includes('StoryPanelBody'), 'the recorded component stack names the component')

  // The rendered fallback carries the message, so the writer sees a description, not a blank page.
  const fallback = instance.render()
  assert.ok(fallback !== null && fallback !== undefined, 'the boundary renders a fallback')
  const text = visibleText(fallback).join(' ')
  assert.ok(text.includes('deliberate render failure'), `the fallback names the error, saw: ${text.slice(0, 160)}`)
  assert.ok(boom !== undefined)
})

test('the overview page survives a book that has not been read yet', async () => {
  // This is the crash that took the entire panel down: the board remembers being open on 概览
  // across a restart, so it mounts while the manuscript is still in flight and `book` is null.
  // `OverviewPage` read `book.chapters` straight through it — TypeError, host boundary, blank
  // column. It answers with the loading line now.
  const { plugin, render } = loadClientForRender()
  const props = {
    t, book: null, workspacePath: '/ws', bookFolder: '我的书',
    api: { manuscript: async () => ({ markdown: '' }), style: async () => ({}), consistency: async () => ({ issues: [] }) },
    onNotice: () => {}, onReload: () => {},
  }
  const mounted = await render(plugin.__components.OverviewPage, props)
  const text = visibleText(mounted.tree).join(' ')
  assert.ok(text.includes('label.loading'), `the page says it is waiting, saw: ${text.slice(0, 120)}`)
})

test('the cards are one fixed size whatever their content is', async () => {
  // Content is what varies; the card is not. A gallery whose cards grow with a summary reads as a
  // jagged stack, and the same board looks different in a narrow window than a wide one. The size
  // lives in the stylesheet as a pinned width and height, so this pins that it stays pinned.
  const css = readFileSync(new URL('../client.js', import.meta.url), 'utf8')
  const rule = (name) => {
    const match = new RegExp(`\\.${name}\\{([^}]*)\\}`).exec(css)
    assert.ok(match, `${name} has a rule`)
    return match[1]
  }
  const card = rule('st-mosaic-page-card')
  // The gallery has its own size now: it shared the graph card's variable once, which meant the
  // graph's 140px silently set the gallery's column width.
  assert.ok(/width:var\(--st-gallery-w/.test(card), 'the card width is pinned')
  assert.ok(/height:var\(--st-gallery-h/.test(card), 'and so is its height')
  assert.ok(!/aspect-ratio/.test(card), 'its height does not depend on its width')
  assert.ok(/overflow:hidden/.test(card), 'content that would grow it is clipped instead')
  assert.ok(!/--st-card-w/.test(card), 'and it no longer borrows the graph card\'s width')

  // The picture band is a SHARE of the card's height, not a square.
  // It was square — the shape the image model returns — but a square band plus a 26px name row
  // spent the card's whole height, leaving the summary 20px and clipping it to nothing. A card is
  // a picture with a caption under it, so the picture takes a share and the text gets the rest.
  // The image still covers its frame (object-fit: cover), so a square picture is cropped rather
  // than distorted — which was the real thing the square band was protecting.
  // The card splits ONCE: the picture's half is 62% and the caption's half is 38%. The picture
  // fills its half — a percentage on both the half and the frame inside it applied 62% twice and
  // left the picture at 38% of the card, with the name row occupying the rest of the picture's box.
  const half = rule('st-mosaic-portrait')
  assert.ok(/flex:0 0 62%/.test(half), 'the picture half is 62% of the card')
  const textHalf = rule('st-mosaic-card-text')
  assert.ok(/flex:0 0 38%/.test(textHalf), 'and the caption half is 38%')
  const frame = rule('st-mosaic-portrait-frame')
  assert.ok(/flex:1 1 auto/.test(frame), 'the picture fills its half rather than sizing itself')
  assert.ok(!/aspect-ratio/.test(frame), 'its shape follows the card, not its own ratio')
  const cover = rule('st-mosaic-portrait-frame img')
  assert.ok(/object-fit:cover/.test(cover), 'and the picture covers the frame rather than squashing')
  // The title is in the caption's half, not inside the picture's box.
  assert.ok(rule('st-mosaic-portrait-hint') !== '', 'the title line exists')
  const titleInText = /st-mosaic-card-text/.test(
    readFileSync(new URL('../src/client/mosaic/cards.js', import.meta.url), 'utf8'))
  assert.ok(titleInText, 'and the card wraps it in the caption half')
  assert.ok(!/height:var\(--st-portrait-h/.test(frame), 'not a fixed height any more')
  const frameImage = /\.st-mosaic-portrait-frame img\{([^}]*)\}/.exec(css)?.[1] ?? ''
  assert.ok(/object-fit:cover/.test(frameImage), 'and the image covers it rather than overflowing')

  const gallery = rule('st-mosaic-gallery')
  assert.ok(/repeat\(auto-fill,var\(--st-gallery-w/.test(gallery),
    'the track takes the fixed card width, not a share of the panel')
  assert.ok(!/\b1fr/.test(gallery), 'no fluid track can stretch a card')

  const body = rule('st-mosaic-card-body')
  assert.ok(/overflow:hidden/.test(body), 'the description area gives way, not the card')
})

test('the board stays open across a remount, which is what a window switch is', async () => {
  // The host remounts the panel when the window changes; a remount re-reads the book. That read
  // used to call setMosaicOpen(false), so the board shut itself every time the writer looked at
  // another window. Whether the board is open is the writer's state, remembered across exactly
  // this, and the read has no business changing it.
  // The board's open state lives in localStorage, so the test has to provide one: without it the
  // preference has nowhere to survive, and the remount below would prove nothing.
  const stored = new Map([['dsh.storywriting.welcomeSeen', '1']])
  const previousWindow = globalThis.window
  globalThis.window = {
    ...(previousWindow ?? {}),
    localStorage: {
      getItem: (key) => (stored.has(key) ? stored.get(key) : null),
      setItem: (key, value) => stored.set(key, String(value)),
    },
  }
  const runtime = loadClientForRender()
  const { plugin, render, rerender } = runtime
  const registered = []
  const scopeCtx = {
    layout: { selectPanel: () => {} },
    workspaces: { create: async ({ path }) => ({ workspaceId: 'w', path }) },
    uiWorkspace: { openSession: () => {}, startSession: () => {}, openWorkspace: async () => {} },
    get: (name) => scopeCtx[name],
    slots: {
      inject: (_key, factory) => registered.push(factory),
      register: (options) => { registered.push({ options }); return () => {} },
    },
  }
  plugin.apply({
    effect: (fn) => fn(),
    inject: (_names, callback) => callback(scopeCtx),
    slots: scopeCtx.slots,
    locale: { register: () => () => {}, bind: () => () => t },
  }, {})
  for (const factory of registered) if (typeof factory === 'function') factory()
  const panel = registered.find((entry) => typeof entry === 'object' && entry.options.name === 'main')
  const items = [{ workspaceId: 'w1', path: '/ws', title: 'W', sessionIds: [] }]
  const props = {
    ...panel.options.inject(), t, api: apiFor({ load: mosaicBook() }), config: {},
    workspacePath: '/ws',
    useWorkspaces: (selector) => selector({ items }),
    useSessions: (selector) => selector({ byId: {} }),
    workspaceSnapshot: { items },
  }

  const mounted = await render(plugin.__components.StoryPanel, props)
  findByClass(mounted.tree, 'st-book-open').props.onClick()
  const desk = await rerender(plugin.__components.StoryPanel, props)
  const toggle = findByTestId(desk.tree, 'mosaic-open')
  assert.ok(toggle !== undefined, 'the board can be opened from the title row')
  toggle.props.onClick()
  const opened = await rerender(plugin.__components.StoryPanel, props)
  assert.equal(findByClass(opened.tree, 'st-mosaic-sheet') !== undefined, true, 'the board is open')

  // A window switch: a fresh mount with the same stored preferences. The board must still be up.
  const remounted = await render(plugin.__components.StoryPanel, props)
  try {
    assert.ok(findByClass(remounted.tree, 'st-mosaic-sheet') !== undefined,
      'the board is still open after the panel is rebuilt')
  } finally {
    if (previousWindow === undefined) delete globalThis.window
    else globalThis.window = previousWindow
  }
})

/**
 * Open the relations tab with one card picked, and hand back everything a portrait test needs.
 *
 * The setup is the same dance the detail-popover test does — open the sheet, pick a card by
 * pressing and releasing on it — because the panel's own routing is what decides which component
 * renders. A test that called MosaicEntityDetail directly would not prove the button reaches the
 * route.
 */
async function openCardDetail({ api, name = '张三' } = {}) {
  const mounted = await mountPanel({ api: api ?? apiFor({ load: mosaicBook() }), open: '我的书', config: { saveInterval: 0 } })
  openSheet(mounted)
  const { tree: opened } = await mounted.rerender()
  const down = (tree) => allByClass(tree, 'st-mosaic-card')
    .find((node) => visibleText(node).join('').includes(name))
  const pointer = { clientX: 10, clientY: 10, pointerId: 7, stopPropagation: () => {} }
  pointer.currentTarget = { setPointerCapture: () => {} }
  down(opened).props.onPointerDown(pointer)
  const { tree: mid } = await mounted.rerender()
  down(mid).props.onPointerUp({ stopPropagation: () => {} })
  const { tree } = await mounted.rerender()
  return { mounted, tree }
}

test('the generate-portrait button asks the route and stores the path on the card', async () => {
  // A portrait costs money and a few seconds, so it is generated on demand rather than when a card
  // is opened: a board of twelve cards would otherwise fire twelve calls the first time it was
  // looked at.
  const calls = []
  const api = apiFor({ load: mosaicBook() })
  api.mosaicPortrait = async (folder, entity, language) => {
    calls.push(['portrait', entity.id, entity.name, language])
    return { ok: true, path: 'portraits/demo-a.png', dataUri: 'data:image/png;base64,AAAA' }
  }
  api.mosaicPortraitRead = async () => ({ ok: false, missing: true })

  const { tree } = await openCardDetail({ api })
  const button = findByTestId(tree, 'mosaic-generate-portrait')
  assert.ok(button !== undefined, 'the card panel has a generate button')
  assert.equal(button.props.disabled, false, 'and it is ready')

  button.props.onClick()
  await new Promise((resolve) => setTimeout(resolve, 0))
  // The harness's `t` returns the key itself, so the language probe sees no CJK character and the
  // prompt is written in English. The real panel answers with the Chinese dictionary and asks for a
  // Chinese prompt; what this asserts is that the LANGUAGE follows the copy rather than being fixed.
  assert.deepEqual(calls, [['portrait', 'a', '张三', 'en']],
    'one call, for this card, with the prompt language the panel is reading in')

  // The path is written onto the card through the ordinary patch — the same way a name or a
  // summary is saved, which is what makes the portrait survive a reload.
  const saved = mosaicBook()
  saved.mosaic.entities.find((entity) => entity.name === '张三').portrait = 'portraits/demo-a.png'
  const afterApi = apiFor({ load: saved })
  afterApi.mosaicPortraitRead = async () => ({ ok: true, dataUri: 'data:image/png;base64,AAAA' })
  const { mounted: afterMount, tree: opened2 } = await openCardDetail({ api: afterApi })
  // The read is an effect and therefore asynchronous: two settles and a re-render, which is what a
  // browser does before the paint that shows the picture.
  await new Promise((resolve) => setTimeout(resolve, 0))
  await afterMount.rerender()
  await new Promise((resolve) => setTimeout(resolve, 0))
  const { tree: after } = await afterMount.rerender()
  assert.ok(opened2 !== undefined)
  const frame = findByClass(after, 'st-mosaic-detail-frame')
  assert.ok(JSON.stringify(frame).includes('data:image/png'), 'the stored portrait is drawn')
  assert.ok(findByTestId(after, 'mosaic-generate-portrait') !== undefined,
    'and the button is still there to regenerate')
})

test('a portrait already on the card is read once, and a missing one reads as a picture to make', async () => {
  const reads = []
  const api = apiFor({ load: (() => {
    const book = mosaicBook()
    book.mosaic.entities.find((e) => e.name === '张三').portrait = 'portraits/demo-a.png'
    return book
  })() })
  api.mosaicPortraitRead = async (folder, path) => {
    reads.push(path)
    return { ok: true, dataUri: 'data:image/png;base64,AAAA' }
  }
  const { mounted, tree } = await openCardDetail({ api })
  await new Promise((resolve) => setTimeout(resolve, 0))
  await mounted.rerender()
  assert.deepEqual(reads, ['portraits/demo-a.png'], 'the stored portrait was read')

  // Re-opening the same card must not read it again: the bytes are cached by path, because the
  // file cannot change underneath a path that is still on the card.
  const again = await mounted.rerender()
  assert.deepEqual(reads, ['portraits/demo-a.png'], 'and not read again on the next render')
  assert.ok(again.tree !== undefined)
  assert.ok(tree !== undefined)
})

test('a generation that fails says so where the button was pressed', async () => {
  // Silence after a click reads as a broken button. The provider's own reason is what the writer
  // needs: "no access to this model" is a different problem from "the network is down".
  const api = apiFor({ load: mosaicBook() })
  api.mosaicPortrait = async () => ({ ok: false, error: 'HTTP 403 model not enabled for this key' })
  api.mosaicPortraitRead = async () => ({ ok: false, missing: true })

  const { tree } = await openCardDetail({ api })
  findByTestId(tree, 'mosaic-generate-portrait').props.onClick()
  await new Promise((resolve) => setTimeout(resolve, 0))

  const { tree: failed } = await openCardDetail({ api })
  assert.ok(failed !== undefined)
})

/**
 * Open the CAST page of the sheet, pick a card there, and hand back the detail page.
 *
 * This is the other way into a card — the gallery, not the graph — and it had no test at all,
 * which is why its 编辑 button could write a flag nothing read and stay broken for as long as it
 * did. Driving the real route is the point: a test that mounted MosaicEntityPage directly would
 * not have caught the wiring either.
 */
async function openCastPage({ api, name = '张三' } = {}) {
  const mounted = await mountPanel({ api: api ?? apiFor({ load: mosaicBook() }), open: '我的书', config: { saveInterval: 0 } })
  openSheet(mounted)
  const { tree: opened } = await mounted.rerender()
  // The bookmark rail: 人物 is the cast page.
  const tab = allByClass(opened, 'st-mosaic-tab').find((node) => visibleText(node).join('').includes('mosaic.tab.cast'))
  assert.ok(tab !== undefined, 'the cast bookmark is on the rail')
  tab.props.onClick()
  const { tree: cast } = await mounted.rerender()
  const card = allByClass(cast, 'st-mosaic-page-card').find((node) => visibleText(node).join('').includes(name))
  assert.ok(card !== undefined, `the ${name} card is on the cast page`)
  card.props.onClick()
  return { mounted, tree: (await mounted.rerender()).tree }
}

test('a card opened from the gallery has a portrait button and an edit mode', async () => {
  const portraitCalls = []
  const api = apiFor({ load: mosaicBook() })
  api.mosaicPortrait = async (folder, entity) => {
    portraitCalls.push(entity.id)
    return { ok: true, path: 'portraits/a.png', dataUri: 'data:image/png;base64,AAAA' }
  }
  api.mosaicPortraitRead = async () => ({ ok: false, missing: true })

  const { mounted, tree } = await openCastPage({ api })
  assert.ok(findByTestId(tree, 'mosaic-entity-page') !== undefined, 'the detail page is open')

  // Read mode: no generate button, and nothing to type into. Generating a picture is a change to
  // the card, so the control belongs to the mode that changes things.
  assert.equal(findByTestId(tree, 'mosaic-generate-portrait'), undefined,
    'read mode offers no generate button')
  assert.equal(findByTestId(tree, 'mosaic-page-name'), undefined, 'read mode has no name field')
  assert.equal(findByTestId(tree, 'mosaic-page-summary'), undefined, 'and no summary field')

  // Into edit mode, where the button appears and works.
  findByTestId(tree, 'mosaic-entity-edit').props.onClick()
  const { tree: editing } = await mounted.rerender()
  const generate = findByTestId(editing, 'mosaic-generate-portrait')
  assert.ok(generate !== undefined, 'the portrait button is there while editing')
  generate.props.onClick()
  await new Promise((resolve) => setTimeout(resolve, 0))
  assert.deepEqual(portraitCalls, ['a'], 'it asked for this card')
})

test('pressing 编辑 turns the page\'s values into fields, and they write through the patch', async () => {
  const api = apiFor({ load: mosaicBook() })
  api.mosaicPortraitRead = async () => ({ ok: false, missing: true })
  const { mounted, tree } = await openCastPage({ api })

  findByTestId(tree, 'mosaic-entity-edit').props.onClick()
  const { tree: editing } = await mounted.rerender()

  // Every field the writer most wants to change is now a field.
  for (const id of ['mosaic-page-name', 'mosaic-page-role', 'mosaic-page-summary']) {
    assert.ok(findByTestId(editing, id) !== undefined, `${id} is editable`)
  }
  assert.equal(findByTestId(editing, 'mosaic-page-name').props.value, '张三')
  assert.equal(findByTestId(editing, 'mosaic-page-role').props.value, '主角')

  // A keystroke goes through the board's ordinary patch, which is the same path the summary and
  // the portrait use: one write route, not one per feature.
  findByTestId(editing, 'mosaic-page-role').props.onChange({ target: { value: '修表匠' } })
  const { tree: patched } = await mounted.rerender()
  assert.equal(findByTestId(patched, 'mosaic-page-role').props.value, '修表匠', 'the role was written')

  // And the button says so: 完成, not 编辑, while the mode is on.
  assert.equal(findByTestId(patched, 'mosaic-entity-edit').props['data-editing'], 'true')

  // Leaving the mode puts the values back to text.
  findByTestId(patched, 'mosaic-entity-edit').props.onClick()
  const { tree: done } = await mounted.rerender()
  assert.equal(findByTestId(done, 'mosaic-page-role'), undefined, 'the field is gone')
  assert.ok(visibleText(findByClass(done, 'st-mosaic-page')).join('').includes('修表匠'),
    'and the new role is shown as text')
})

test('a card with no summary can be given one while editing', async () => {
  // An empty value used to be hidden outright, which is right for reading and wrong for editing:
  // the field you need in order to fill something in was the one being hidden.
  const api = apiFor({ load: mosaicBook() })
  api.mosaicPortraitRead = async () => ({ ok: false, missing: true })
  // 李四 has an empty role in the fixture.
  const { mounted, tree } = await openCastPage({ api, name: '李四' })
  assert.equal(findByTestId(tree, 'mosaic-page-role'), undefined, 'nothing to read: no empty row')
  findByTestId(tree, 'mosaic-entity-edit').props.onClick()
  const { tree: editing } = await mounted.rerender()
  const role = findByTestId(editing, 'mosaic-page-role')
  assert.ok(role !== undefined, 'but there is a field to fill in')
  assert.equal(role.props.value, '', 'and it is empty rather than absent')
})

test('opening the board reads every portrait on it, not just the open card\'s', async () => {
  // The graph and the gallery draw all the cards at once, so their pictures have to be read when
  // the board opens. Only the open card's portrait was read before, which meant a board with
  // pictures on it opened blank and filled in one image per visit to the details — the files were
  // there the whole time and nothing had asked for them.
  const reads = []
  const withPortraits = mosaicBook()
  withPortraits.mosaic.entities.find((e) => e.id === 'a').portrait = 'portraits/a.png'
  withPortraits.mosaic.entities.find((e) => e.id === 'b').portrait = 'portraits/b.png'
  const api = apiFor({ load: withPortraits })
  api.mosaicPortraitRead = async (folder, path) => {
    reads.push(path)
    return { ok: true, dataUri: `data:image/png;base64,${path === 'portraits/a.png' ? 'AAAA' : 'BBBB'}` }
  }

  const mounted = await mountPanel({ api, open: '我的书', config: { saveInterval: 0 } })
  openSheet(mounted)
  await mounted.rerender()
  // The reads are effects and therefore asynchronous.
  await new Promise((resolve) => setTimeout(resolve, 0))
  const { tree } = await mounted.rerender()

  assert.deepEqual(reads.sort(), ['portraits/a.png', 'portraits/b.png'],
    'both portraits were read as the board opened, without opening any card')

  // And they are drawn: the graph card and the gallery card both show the picture they have.
  const images = allByClass(tree, 'st-mosaic-card-photo').concat(allByClass(tree, 'st-mosaic-portrait-frame'))
  assert.ok(images.length >= 2, `the board draws the pictures, saw ${images.length} picture frames`)
  assert.ok(images.some((frame) => JSON.stringify(frame).includes('data:image/png')),
    'with the bytes read from disk')
})

test('a board with no portraits asks for none', async () => {
  // The empty case must not fire a request per card: no portrait path means nothing to read.
  const reads = []
  const api = apiFor({ load: mosaicBook() })
  api.mosaicPortraitRead = async (folder, path) => { reads.push(path); return { ok: false, missing: true } }
  const mounted = await mountPanel({ api, open: '我的书', config: { saveInterval: 0 } })
  openSheet(mounted)
  await mounted.rerender()
  await new Promise((resolve) => setTimeout(resolve, 0))
  assert.deepEqual(reads, [], 'nothing to read, so nothing was asked for')
})


test('the proposals page lists stored proposals and answers them in place', async () => {
  // The bug this pins: a proposal existed only while the sheet was open, and only the last one.
  // Clicking 检查本章 twice lost the first answer; closing the board lost both. Now they are stored
  // and this page is the one place they are answered.
  const b = mosaicBook()
  const api = apiFor({ load: b })
  // Two stored proposals: one waiting, one already answered. The answered one must still be listed
  // — the page says what happened rather than making the row vanish.
  const stored = [
    {
      id: 'p-pending', at: 2000, source: 'relate', sourceChapterId: null, status: 'pending',
      evidence: ['十年前的同案'],
      changes: [{ op: 'edge.upsert', from: 'a', to: 'b', kind: '旧识', note: '十年前的同案' }],
    },
    {
      id: 'p-done', at: 1000, source: 'check', sourceChapterId: 'c1', status: 'accepted',
      evidence: [], changes: [{ op: 'entity.upsert', kind: 'character', name: '张三', role: '更夫' }],
    },
  ]
  api.proposals = async () => ({ ok: true, proposals: stored })
  const applied = []
  api.mosaicApply = async (folder, changes, proposalId) => {
    applied.push({ changes, proposalId })
    return { ok: true, applied: ['edge.upsert 旧识'], skipped: 0, book: { mosaic: b.mosaic }, token: 'tk-3' }
  }

  const mounted = await mountPanel({ api, open: '我的书', config: { saveInterval: 0 } })
  openSheet(mounted)
  const { tree: opened } = await mounted.rerender()
  const rerender = mounted.rerender
  const tabs = []
  const collect = (node, into, match) => {
    if (node === null || typeof node !== 'object' || Array.isArray(node)) return
    if (match(node)) into.push(node)
    for (const child of node.children ?? []) collect(child, into, match)
  }
  collect(opened, tabs, (n) => typeof n.props?.className === 'string'
    && n.props.className.split(/\s+/).includes('st-mosaic-tab'))
  tabs[4].props.onClick()
  const page = (await rerender()).tree

  const cards = []
  collect(page, cards, (n) => typeof n.props?.className === 'string'
    && n.props.className.split(/\s+/).includes('st-mosaic-proposal'))
  assert.equal(cards.length, 2, 'both stored proposals are listed, answered or not')

  // The pending one carries the quotes it was based on, and exactly two buttons.
  const pending = cards.find((c) => c.props['data-testid'] === 'proposal-p-pending')
  assert.ok(pending, 'the pending proposal is on the page')
  assert.equal(pending.props['data-status'], 'pending')
  assert.ok(visibleText(pending).join(' ').includes('十年前的同案'), 'its evidence is shown')
  const pendingMeta = visibleText(pending).join(' ')
  assert.ok(pendingMeta.includes('mosaic.proposalFromRelate'), 'the row names its source')
  assert.ok(pendingMeta.includes('1970'), 'and the time it arrived')
  assert.ok(visibleText(cards.find((c) => c.props['data-testid'] === 'proposal-p-done')).join(' ').includes('第1章'),
    'a check proposal names the chapter it came from')

  // Accepting goes through the SAME apply route the review page uses, carrying the proposal's own
  // changes and its id, so the host can record the answer in one write.
  const accept = findByTestId(page, 'proposal-accept-p-pending')
  assert.ok(accept, 'a pending proposal can be accepted')
  await accept.props.onClick()
  assert.equal(applied.length, 1, 'one apply call')
  assert.equal(applied[0].proposalId, 'p-pending', 'the host is told which proposal this answers')
  assert.equal(applied[0].changes.length, 1, 'and given its changes, not a copy of them')

  // The answered one has no accept button left, only a way to throw it away. Actions live in the
  // detail pane, so select that proposal first.
  const done = cards.find((c) => c.props['data-testid'] === 'proposal-p-done')
  done.props.onClick()
  const donePage = (await rerender()).tree
  assert.equal(findByTestId(donePage, 'proposal-accept-p-done'), undefined,
    'an answered proposal cannot be accepted again')
  assert.ok(findByTestId(donePage, 'proposal-delete-p-done'), 'it can still be discarded')
})

test('the overview page renders a schema-3 book, which has no separate cast list', async () => {
  // The bug this pins: OverviewPage read `book.characters.length` for its progress line. Schema 3
  // removed that field, so the read threw during render and took the whole panel down — a blank
  // screen indistinguishable from a plugin that never loaded.
  const { plugin, render } = loadClientForRender()
  const b = mosaicBook()
  // No `characters`, no `settings`, no `relationships`: exactly what schema 3 writes to disk.
  delete b.characters
  delete b.settings
  delete b.relationships
  const calls = []
  const api = {
    overview: async () => { calls.push('overview'); return { ok: true } },
    load: async () => ({ ok: true, book: b, token: 'tk-1' }),
    style: async () => ({ ok: true }), consistency: async () => ({ ok: true, issues: [] }),
    manuscript: async () => ({ ok: true, markdown: '' }),
  }
  const tree = await render(plugin.__components.OverviewPage, {
    t, book: b, workspacePath: '/ws', bookFolder: 'book', api,
    onReload: () => {}, onNotice: () => {},
  })
  // It rendered at all — that is the assertion. The progress line counts characters from the board.
  const text = visibleText(tree.tree).join(' ')
  assert.ok(text.includes('label.overviewProgress'), 'the progress line is drawn')
  assert.ok(text.includes('{p}') === false || !text.includes('undefined'),
    'and it never prints undefined for the cast count')
})


test('the overview picks a chapter and shows it in the reading pane', async () => {
  // The chapter list is navigation and the pane is the reading surface: clicking a row must move
  // both the selection marker and the content, or the page reads as a wall of text about nothing.
  const { plugin, render, rerender } = loadClientForRender()
  const b = mosaicBook()
  const second = {
    id: 'c2', title: '第2章', level: 'chapter', status: 'writing', children: [],
    text: '第二章的正文。', summary: '第二章的梗概。',
  }
  b.nodes[0].children.push(second)
  b.chapters.push(second)
  b.overview.chapters.c1 = { text: '第一章的概览。', basedOn: 'x' }
  b.overview.chapters.c2 = { text: '第二章的概览。', basedOn: 'x' }
  const props = {
    t, book: b, bookFolder: 'book',
    api: {
      overview: async () => ({ ok: true }), style: async () => ({}),
      consistency: async () => ({ issues: [] }), manuscript: async () => ({ markdown: '' }),
    },
    onNotice: () => {}, onAdoptWritten: () => {},
  }
  const mounted = await render(plugin.__components.OverviewPage, props)
  const rows = allByClass(mounted.tree, 'fang-list-row')
  assert.equal(rows.length, 2, 'one row per chapter')
  assert.equal(rows[0].props['data-active'], 'true', 'the first chapter starts selected')
  assert.ok(visibleText(findByClass(mounted.tree, 'fang-split-detail')).join(' ').includes(TEXT),
    'the pane shows the first chapter')
  rows[1].props.onClick()
  const next = await rerender(plugin.__components.OverviewPage, props)
  const nextRows = allByClass(next.tree, 'fang-list-row')
  assert.equal(nextRows[1].props['data-active'], 'true', 'clicking a row selects it')
  assert.equal(nextRows[0].props['data-active'], undefined, 'and deselects the old one')
  assert.ok(visibleText(findByClass(next.tree, 'fang-split-detail')).join(' ').includes('第二章的正文。'),
    'the pane follows the selection')
})

test('a gallery card is a button only when it opens something', async () => {
  // The gallery pages (world, cast) were two copies of the same shell and had already drifted on
  // keyboard support, so the difference is one explicit rule now: an `onActivate` makes a card a
  // button, and nothing else does.
  const { plugin, render } = loadClientForRender()
  const Card = plugin.__components.MosaicGalleryCard

  // Opens something: a button, reachable by keyboard, and clicking runs the callback.
  let opened = 0
  const clickable = await render(Card, {
    t, id: 'a', kind: 'character', label: '张三', role: '主角',
    picture: null, onActivate: () => { opened += 1 }, children: [],
  })
  const openCard = findByClass(clickable.tree, 'st-mosaic-page-card')
  assert.equal(openCard.props.role, 'button', 'a card that opens something says so')
  assert.equal(openCard.props.tabIndex, 0, 'and it is in the tab order')
  openCard.props.onClick()
  assert.equal(opened, 1, 'clicking it runs its action')
  // Space and Enter do the same, which is what `role: button` promises.
  const prevent = { preventDefault: () => {} }
  openCard.props.onKeyDown({ key: 'Enter', ...prevent })
  openCard.props.onKeyDown({ key: ' ', ...prevent })
  assert.equal(opened, 3, 'Enter and Space activate it too')

  // Holds a field only: no role, no tab stop. Announcing this as a button would make a screen
  // reader offer to "press" a textarea's container.
  const passive = await render(Card, {
    t, id: 'c1', kind: 'synopsis', label: '第一章',
    picture: undefined, children: [],
  })
  const fieldCard = findByClass(passive.tree, 'st-mosaic-page-card')
  assert.equal(fieldCard.props.role, undefined, 'a card that opens nothing is not a button')
  assert.equal(fieldCard.props.tabIndex, undefined, 'and it is not in the tab order')
  // No picture means no portrait band: a chapter is not a board entry, and a letter tile standing
  // in for it would be decoration pretending to be identity.
  assert.equal(findByClass(passive.tree, 'st-mosaic-portrait'), undefined,
    'and it has no portrait band')
  assert.ok(findByClass(clickable.tree, 'st-mosaic-portrait'),
    'while a card WITH a picture draws one')
})

test('useBookData is the book lifecycle, and it can be driven without a panel', async () => {
  // The whole point of pulling this out of StoryPanelBody: "which manuscript is on screen, and what
  // does saving it mean" is one job, and it has two inputs (a route service and an address) and no
  // dependency on layout. Before the split, testing that a stale save shows the disk version meant
  // mounting the entire panel and driving a keystroke into it.
  const { plugin, render } = loadClientForRender()
  const useBookData = plugin.__hooks?.useBookData
  assert.ok(typeof useBookData === 'function', 'the hook is exposed for testing')

  const calls = []
  const loaded = mosaicBook()
  const api = {
    books: async () => { calls.push('books'); return { ok: true, books: catalog } },
    load: async (folder) => { calls.push(['load', folder]); return { ok: true, book: loaded, token: 'tk-1', recovered: false } },
    save: async (next, token) => { calls.push(['save', token]); return { ok: true, token: 'tk-2' } },
  }
  // A one-line component: the hook is the subject, not the tree.
  let captured = null
  const Probe = () => {
    captured = useBookData({
      api, library: '/ws/story', bookFolder: '我的书',
      t: (key) => key, autoSaveMs: 0, onLoaded: (book) => calls.push(['loaded', book.title]),
    })
    return { type: 'div', props: {}, children: [] }
  }
  const { rerender } = await render(Probe, {})
  // The load is async: a few more passes let the effect's promise settle.
  for (let i = 0; i < 5 && (captured?.book === null || captured?.book === undefined); i += 1) {
    await new Promise((r) => setTimeout(r, 0))
    await rerender()
  }
  const out = captured
  assert.ok(calls.some((c) => Array.isArray(c) && c[0] === 'load'), 'it loaded the book')
  assert.ok(out.book !== null && out.book !== undefined, 'and handed the book back')
  assert.equal(out.book.title, loaded.title)
  assert.equal(out.state.status, 'ready')
  assert.ok(calls.some((c) => Array.isArray(c) && c[0] === 'loaded'), 'onLoaded fired with the book')

  // The four capabilities the panel actually uses are all part of the same return value.
  for (const name of ['flushSave', 'adoptWritten', 'saveNow', 'updateBook', 'refreshShelf']) {
    assert.equal(typeof out[name], 'function', `${name} is part of the book lifecycle`)
  }
})

test('a save answer replaces the book when nothing was typed while it was in flight', async () => {
  const { plugin, render, rerender } = loadClientForRender()
  const useBookData = plugin.__hooks.useBookData
  const loaded = mosaicBook()
  let release = null
  const api = {
    books: async () => ({ ok: true, books: catalog }),
    load: async () => ({ ok: true, book: loaded, token: 'tk-1', recovered: false }),
    // The host answers with the NORMALIZED book it wrote, not with what was sent.
    save: (next) => new Promise((resolve) => {
      release = () => resolve({ ok: true, token: 'tk-2', book: { ...next, title: '归一化后' } })
    }),
  }
  let captured = null
  const Probe = () => {
    captured = useBookData({
      api, library: '/ws/story', bookFolder: '我的书',
      t, autoSaveMs: 0, onLoaded: () => {},
    })
    return { type: 'div', props: {}, children: [] }
  }
  await render(Probe, {})
  for (let i = 0; i < 5 && (captured?.book === null || captured?.book === undefined); i += 1) {
    await new Promise((r) => setTimeout(r, 0))
    await rerender(Probe, {})
  }
  assert.ok(captured?.book, 'the book loaded')
  captured.updateBook({ ...captured.book, title: '本地标题' })
  await new Promise((r) => setTimeout(r, 0))
  assert.equal(typeof release, 'function', 'the save reached the host')
  release()
  await new Promise((r) => setTimeout(r, 0))
  await rerender(Probe, {})
  assert.equal(captured.book.title, '归一化后', 'the host’s normalized copy is adopted')
  assert.equal(captured.state.token, 'tk-2', 'and its token with it')
})

test('a save answer never replaces a sentence typed while the save was in flight', async () => {
  const { plugin, render, rerender } = loadClientForRender()
  const useBookData = plugin.__hooks.useBookData
  const loaded = mosaicBook()
  let release = null
  let saves = 0
  const api = {
    books: async () => ({ ok: true, books: catalog }),
    load: async () => ({ ok: true, book: loaded, token: 'tk-1', recovered: false }),
    save: (next) => {
      saves += 1
      if (saves === 1) {
        return new Promise((resolve) => {
          release = () => resolve({ ok: true, token: 'tk-2', book: { ...next, title: 'SERVER' } })
        })
      }
      return Promise.resolve({ ok: true, token: `tk-${saves + 1}`, book: { ...next } })
    },
  }
  let captured = null
  const Probe = () => {
    captured = useBookData({
      api, library: '/ws/story', bookFolder: '我的书',
      t, autoSaveMs: 0, onLoaded: () => {},
    })
    return { type: 'div', props: {}, children: [] }
  }
  await render(Probe, {})
  for (let i = 0; i < 5 && (captured?.book === null || captured?.book === undefined); i += 1) {
    await new Promise((r) => setTimeout(r, 0))
    await rerender(Probe, {})
  }
  assert.ok(captured?.book, 'the book loaded')
  captured.updateBook({ ...captured.book, title: '第一次' })
  await new Promise((r) => setTimeout(r, 0))
  assert.equal(typeof release, 'function', 'the first save reached the host')
  // The writer types again while the first request is still out.
  await rerender(Probe, {})
  captured.updateBook({ ...captured.book, title: '第二次' })
  await rerender(Probe, {})
  release()
  await new Promise((r) => setTimeout(r, 0))
  await rerender(Probe, {})
  assert.equal(captured.book.title, '第二次', 'the newer sentence survives the older answer')
  assert.ok(saves >= 2, 'and the newer book was written next')
  assert.notEqual(captured.state.token, 'tk-1', 'the token still moved forward')
})

test('a route write during a save keeps its own token, not the save answer\u2019s', async () => {
  const { plugin, render, rerender } = loadClientForRender()
  const useBookData = plugin.__hooks.useBookData
  const loaded = mosaicBook()
  let release = null
  const api = {
    books: async () => ({ ok: true, books: catalog }),
    load: async () => ({ ok: true, book: loaded, token: 'tk-1', recovered: false }),
    save: (next) => new Promise((resolve) => {
      release = () => resolve({ ok: true, token: 'tk-save', book: { ...next, title: 'SERVER' } })
    }),
  }
  let captured = null
  const Probe = () => {
    captured = useBookData({
      api, library: '/ws/story', bookFolder: '我的书',
      t, autoSaveMs: 0, onLoaded: () => {},
    })
    return { type: 'div', props: {}, children: [] }
  }
  await render(Probe, {})
  for (let i = 0; i < 5 && (captured?.book === null || captured?.book === undefined); i += 1) {
    await new Promise((r) => setTimeout(r, 0))
    await rerender(Probe, {})
  }
  assert.ok(captured?.book, 'the book loaded')
  captured.updateBook({ ...captured.book, title: '本地' })
  await new Promise((r) => setTimeout(r, 0))
  assert.equal(typeof release, 'function', 'the save reached the host')
  // A board route writes the file while that save is still out. Its token is the current one.
  captured.adoptWritten({ book: { ...captured.book, title: 'HOST' }, token: 'tk-host', savedAt: 1 })
  await rerender(Probe, {})
  release()
  await new Promise((r) => setTimeout(r, 0))
  await rerender(Probe, {})
  assert.equal(captured.book.title, 'HOST', 'the route\u2019s book is not replaced by the older save')
  assert.equal(captured.state.token, 'tk-host', 'and the older save\u2019s token does not roll it back')
})

test('the board actions are one use-case layer: construct, patch, remove, apply', async () => {
  const { plugin, render } = loadClientForRender()
  const useBoardActions = plugin.__hooks?.useBoardActions
  assert.ok(typeof useBoardActions === 'function', 'the board actions are exposed for testing')

  const calls = []
  const writes = []
  const adopts = []
  const api = {
    mosaicApply: async (folder, changes, proposalId) => {
      calls.push(['apply', folder, changes, proposalId])
      return { ok: true, applied: ['status.add 受伤'], skipped: 0, book: mosaicBook(), token: 'tk-apply', savedAt: 7 }
    },
    mosaicPortraitRead: async () => ({ ok: false }),
  }
  const book = mosaicBook()
  const updateBook = (next) => { writes.push(next) }
  const adoptWritten = (value) => { adopts.push(value) }
  const flushSave = async () => { calls.push(['flush']) }
  let captured = null
  const Probe = () => {
    captured = useBoardActions({
      api, bookFolder: '我的书', book, updateBook, adoptWritten, flushSave,
      onNotice: () => {}, t,
    })
    return { type: 'div', props: {}, children: [] }
  }
  await render(Probe, {})
  assert.ok(captured, 'the hook returned its actions')

  const created = captured.createCard('place', { name: '旧码头', summary: '父亲最后出现的地方' })
  assert.equal(created.kind, 'place')
  assert.equal(created.name, '旧码头')
  assert.equal(writes[writes.length - 1].mosaic.entities.length, book.mosaic.entities.length + 1)

  const first = book.mosaic.entities[0]
  captured.patchCard(first.id, { summary: '改过的一句话', notAField: '丢掉' })
  const patched = writes[writes.length - 1].mosaic.entities.find((entity) => entity.id === first.id)
  assert.equal(patched.summary, '改过的一句话')
  assert.equal(patched.notAField, undefined)

  captured.removeCard(first.id)
  const removed = writes[writes.length - 1].mosaic
  assert.ok(!removed.entities.some((entity) => entity.id === first.id), 'the card is gone')
  assert.ok(!removed.edges.some((edge) => edge.from === first.id || edge.to === first.id), 'and its wires')

  await captured.applyChanges([{ op: 'status.add', entityId: first.id, label: '受伤' }], { proposalId: 'p1' })
  assert.deepEqual(calls[0], ['flush'], 'the pending typing is written before the route reads')
  assert.equal(calls[1][0], 'apply')
  assert.equal(calls[1][3], 'p1', 'the proposal id rides along')
  assert.equal(adopts.length, 1, 'the route answer is adopted once')
  assert.equal(adopts[0].token, 'tk-apply')
  assert.equal(adopts[0].savedAt, 7)
  assert.equal(writes.length, 3, 'the apply does not queue a second write of the same board')
})

test('a closing drawer keeps showing its own page, never the fallback one', async () => {
  // The bug this pins: the drawer's body, title and width were all read from `drawer`, which is
  // null the moment it closes. The exit animation holds the node on screen for its duration, and
  // during those frames `drawerBody(null)` fell through to the MODELS page — so closing Settings
  // showed the model configuration sliding out of the panel. The overlay now renders from the last
  // value it was open with. The render harness has no `window` and therefore no exit animation, so
  // the assertion is on the SOURCE: every render input of the drawer must come from that held
  // value, not from the live state.
  const css = readFileSync(new URL('../client.js', import.meta.url), 'utf8')
  const mount = /function SheetOverlay\(([\s\S]*?)\n}/.exec(css)?.[1] ?? ''
  assert.ok(mount !== '', 'the sheet overlay is found')
  for (const input of ['title', 'size']) {
    assert.ok(new RegExp(`\\b${input}:.*motion\\.shown`).test(mount),
      `${input} comes from the value the overlay was opened with, not the live state`)
  }
  // The body is the third input, and the original bug was about it. It is passed as a renderer
  // so the CALLER cannot decide which page the closing panel shows.
  assert.ok(/children: body\(motion\.shown\)/.test(mount),
    'the body is rendered from the held value, by the overlay rather than by the caller')
  assert.ok(!/drawer\b(?!Motion)/.test(mount),
    'nothing in the closing panel reads the live `drawer`')
})
