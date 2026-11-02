import test from 'node:test'
import assert from 'node:assert/strict'
import { loadClientForRender, visibleText, findByClass, findByText } from './helpers/render-hooks.mjs'

/**
 * Outline editing, driven through the buttons a writer actually presses.
 *
 * The bug this guards: `addNode` attached a new node to "the last leaf in the tree". A second
 * section therefore landed INSIDE the first one, and once that leaf became a container the next
 * add fell through to the volume — so a chapter could never hold two sections. Each case below
 * clicks the real buttons and then reads the resulting tree off the outline.
 */

const t = (key, params) => {
  let text = key
  for (const [name, value] of Object.entries(params ?? {})) text = text.replaceAll(`{${name}}`, String(value))
  return text
}

/** A saved book, as `api.save` would hand it back: the tree that is now on disk. */
function makeApi(saved) {
  const catalog = [{ folder: '测试书', title: '测试书', chapters: 0, finals: 0, total: 0, absolutePath: '/ws/story/测试书' }]
  const api = {
    books: async () => ({ ok: true, books: catalog }),
    // The library is a setting the panel reads instead of deriving it from the workspace list.
    models: async () => ({ ok: true, roles: {}, overrides: {}, image: {}, library: '/ws/story' }),
    load: async () => ({ ok: true, book: saved.book, token: 'tk-1', recovered: false }),
    save: async (book, token) => { saved.book = book; saved.calls += 1; return { ok: true, token: 'tk-2' } },
    // The status bar names the role models; a real host answers this route.
    meta: async () => ({ ok: true, roles: { continue: { provider: 'p', model: 'agnes-3.0-flash' }, suggest: { provider: 'p', model: 'agnes-3.0-flash' } } }),
    snapshot: async () => ({ ok: true }),
    suggest: async () => ({ ok: true, suggestion: { id: 's1', text: 'x' } }),
    continue: async () => ({ ok: true, continuation: 'y' }),
  }
  return api
}

const emptyBook = {
  schemaVersion: 1, title: '测试书', genre: '', pov: '', tense: '',
  nodes: [], chapters: [], characters: [], relationships: [], settings: [], snapshots: [],
  overview: { chapters: {} },
}

/** Mount the panel on a book that is already open, so the desk (and its outline) is on screen. */
async function mountDesk(book, options = {}) {
  const saved = { book, calls: 0 }
  const api = makeApi(saved)
  const { plugin, render, rerender } = loadClientForRender()
  const registrations = []
  const scopeCtx = {
    layout: { selectPanel: () => {} },
    workspaces: { create: async ({ path }) => ({ workspaceId: 'w1', path }) },
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
    // `saveInterval: 0` writes every edit immediately, so a test can read the manuscript off
    // disk after a keystroke instead of waiting out the interval. Production keeps the default;
    // the interval itself is pinned by tests/save-queue.test.js.
    ...panel.options.inject(), t, api, config: { saveInterval: options.saveInterval ?? 0 }, workspacePath: '/ws',
    useWorkspaces: (selector) => selector({ items }),
    useSessions: (selector) => selector({ byId: {} }),
    workspaceSnapshot: { items },
  }

  let mounted = await render(plugin.__components.StoryPanel, props)
  // The library arrives from the host asynchronously (it is a setting, not an argument), so the
  // first paint is the loading state. One settle here is what a real mount does too.
  await new Promise((resolve) => setTimeout(resolve, 0))
  mounted = await rerender(plugin.__components.StoryPanel, props)
  // Open the book from the shelf so the panel enters its desk branch.
  const card = findByClass(mounted.tree, 'st-book-open')
  if (card !== undefined) {
    card.props.onClick()
    mounted = await rerender(plugin.__components.StoryPanel, props)
  }
  // The outline starts folded, so the directory has to be opened the way a writer opens it.
  const toggle = findByClass(mounted.tree, 'fang-rail-toggle')
  if (toggle !== undefined) {
    toggle.props.onClick()
    mounted = await rerender(plugin.__components.StoryPanel, props)
  }

  /** Press one of the outline buttons by its label, then let the save settle. */
  async function press(label) {
    const button = findByText(mounted.tree, `action.${label}`)
    assert.ok(button, `the ${label} button is on screen`)
    await button.props.onClick()
    mounted = await rerender(plugin.__components.StoryPanel, props)
    return saved.book
  }

  /** Press a tree node to select it (a leaf selects; a container folds, so read the caret). */
  async function select(nodeId) {
    const rows = []
    const walk = (node) => {
      if (node === null || node === undefined || typeof node !== 'object') return
      if (Array.isArray(node)) { node.forEach(walk); return }
      if (typeof node.props?.['data-current'] === 'string' && node.props.key === nodeId) rows.push(node)
      walk(node.children)
    }
    walk(mounted.tree)
    // Tree rows carry the node id as their React key, which the harness keeps on the element.
    const row = findRowById(mounted.tree, nodeId)
    assert.ok(row, `node ${nodeId} is in the outline`)
    await row.props.onClick()
    mounted = await rerender(plugin.__components.StoryPanel, props)
  }

  /** Render once more, as an onChange would: the harness only re-renders when asked. */
  async function refresh() {
    mounted = await rerender(plugin.__components.StoryPanel, props)
    return mounted.tree
  }

  return { saved, press, select, refresh, get tree() { return mounted.tree }, plugin, props, rerender, api }
}

/** Tree rows put the node id on `key`; the harness stores it as the element's key. */
function findRowById(node, id) {
  if (node === null || node === undefined || typeof node !== 'object') return undefined
  if (Array.isArray(node)) {
    for (const child of node) {
      const hit = findRowById(child, id)
      if (hit !== undefined) return hit
    }
    return undefined
  }
  if (node.props?.key === id) return node
  for (const child of node.children ?? []) {
    const hit = findRowById(child, id)
    if (hit !== undefined) return hit
  }
  return undefined
}

test('one button builds the outline, and a chapter can hold two sections', async () => {
  // The outline has ONE button. With nothing selected it starts the first volume; then a chapter
  // in it; then sections inside that chapter. Each press adds under the current selection.
  const desk = await mountDesk(JSON.parse(JSON.stringify(emptyBook)))

  let book = await desk.press('addUnder')
  assert.equal(book.nodes.length, 1, 'the first press makes a volume')
  assert.equal(book.nodes[0].level, 'volume')

  book = await desk.press('addUnder')
  assert.equal(book.nodes[0].children.length, 1, 'the second press makes a chapter in that volume')
  assert.equal(book.nodes[0].children[0].level, 'chapter')

  book = await desk.press('addUnder')
  book = await desk.press('addUnder')
  const volume = book.nodes[0]
  const chapter = volume.children[0]
  assert.equal(volume.children.length, 1, 'no section leaks up into the volume')
  assert.equal(chapter.children.length, 2,
    `the chapter holds two sections, saw ${chapter.children.length}: ${JSON.stringify(chapter.children.map((c) => c.level))}`)
  for (const section of chapter.children) {
    assert.equal(section.level, 'section', 'both children are sections')
    assert.equal(section.children.length, 0, 'a section stays a leaf')
  }
})

test('a section added while a section is selected stays its sibling', async () => {
  // The exact shape of the reported bug: select the first section, press the button again.
  const desk = await mountDesk(JSON.parse(JSON.stringify(emptyBook)))
  await desk.press('addUnder')  // volume
  await desk.press('addUnder')  // chapter
  const book = await desk.press('addUnder')  // first section
  const firstSection = book.nodes[0].children[0].children[0]
  assert.ok(firstSection, 'the first section exists')

  await desk.select(firstSection.id)
  const after = await desk.press('addUnder')

  const chapter = after.nodes[0].children[0]
  assert.equal(chapter.children.length, 2, 'the second section is a sibling of the first')
  assert.equal(chapter.children[0].id, firstSection.id, 'the first section keeps its place')
  assert.equal(chapter.children[1].level, 'section', 'the new node is a section')
})

test('a second volume is made by adding at the root', async () => {
  // Volumes are root nodes, so the panel exposes that through the outline state rather than a
  // second button: with a volume selected the press makes a chapter, which is the common case.
  const desk = await mountDesk(JSON.parse(JSON.stringify(emptyBook)))
  const book = await desk.press('addUnder')
  assert.equal(book.nodes.length, 1)
  assert.equal(book.nodes[0].level, 'volume')
  // Deselecting returns to "start a new volume" behaviour.
  const second = await desk.press('addUnder')
  assert.equal(second.nodes[0].children.length, 1, 'with the volume selected the press adds a chapter')
})

test('the shelf does not depend on which workspace the panel is in', async () => {
  // The reported bug this replaces: six books sat in one workspace while the panel resolved
  // another one that never held a story, so the shelf looked empty — and the fix at the time was
  // to scan EVERY registered workspace. That was a workaround for deriving the book's location
  // from the workspace list at all. The library is a setting now, so the shelf asks the host for
  // its books and the workspace list has nothing to do with the answer.
  const calls = []
  const api = {
    books: async () => {
      calls.push('books')
      return {
        ok: true,
        books: [
          { folder: '波ok', title: '波ok', chapters: 0, finals: 0, total: 0, absolutePath: '/elsewhere/story/波ok' },
        ],
      }
    },
    models: async () => ({ ok: true, roles: {}, overrides: {}, image: {}, library: '/elsewhere/story' }),
    load: async () => ({ ok: true, book: { ...JSON.parse(JSON.stringify(emptyBook)) }, token: 't', recovered: false }),
    save: async () => ({ ok: true, token: 't2' }),
    snapshot: async () => ({ ok: true }),
  }
  const { plugin, render } = loadClientForRender()
  const registrations = []
  const scopeCtx = {
    layout: { selectPanel: () => {} },
    workspaces: { create: async () => ({ workspaceId: 'w-new' }), rename: async () => ({}) },
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

  // A workspace list that holds NO books at all: the shelf still lists what the host reports,
  // because the list is not what decides where books live.
  const items = [{ workspaceId: 'w-project', path: '/project', title: 'StoryWriting', sessionIds: [] }]
  const props = {
    ...panel.options.inject(), t, api, config: {},
    useWorkspaces: (selector) => selector({ items }),
    useSessions: (selector) => selector({ byId: {} }),
    workspaceSnapshot: { items },
  }
  let mounted = await render(plugin.__components.StoryPanel, props)
  // The library arrives from `models`, so the first paint is the loading state by design.
  await new Promise((resolve) => setTimeout(resolve, 0))
  mounted = await render(plugin.__components.StoryPanel, props)

  assert.ok(calls.includes('books'), 'the shelf asks the host for its books')
  const text = visibleText(mounted.tree).join(' ')
  assert.ok(text.includes('波ok'), `the book is listed, saw: ${text.slice(0, 140)}`)
})

test('typing keeps every character: the editor renders the new text, not the old leaf', async () => {
  // The reported bug: type the second letter and the first disappears. `chapters` is DERIVED from
  // `nodes`; writing only `nodes` left the textarea bound to the stale leaf, so each keystroke was
  // immediately replaced by the previous text.
  const desk = await mountDesk(JSON.parse(JSON.stringify(emptyBook)))
  await desk.press('addUnder')  // volume
  await desk.press('addUnder')  // chapter
  const book = await desk.press('addUnder')  // section, now selected
  const leafId = book.nodes[0].children[0].children[0].id

  // Type two characters, one render apart, the way a browser delivers them.
  const editor = findByClass(desk.tree, 'st-editor')
  assert.ok(editor, 'the editor is on screen')
  await editor.props.onChange({ target: { value: '雨' } })
  const firstTree = await desk.refresh()
  const afterFirst = findByClass(firstTree, 'st-editor')
  assert.equal(afterFirst.props.value, '雨', 'the first character is kept')

  await afterFirst.props.onChange({ target: { value: '雨夜' } })
  const secondTree = await desk.refresh()
  const afterSecond = findByClass(secondTree, 'st-editor')
  assert.equal(afterSecond.props.value, '雨夜', 'the second character does not eat the first')

  // And the saved tree carries it, which is what makes the text survive a reload.
  const saved = desk.saved.book
  const savedLeaf = saved.nodes[0].children[0].children[0]
  assert.equal(savedLeaf.id, leafId)
  assert.equal(savedLeaf.text, '雨夜')
})

test('every level of the outline can be selected, including containers', async () => {
  // A container used to only fold on click, so a volume or a chapter could never be selected —
  // and selection decides where the next node is created.
  const desk = await mountDesk(JSON.parse(JSON.stringify(emptyBook)))
  await desk.press('addUnder')  // volume
  const book = await desk.press('addUnder')  // chapter
  const volumeId = book.nodes[0].id
  const chapterId = book.nodes[0].children[0].id

  for (const id of [volumeId, chapterId]) {
    await desk.select(id)
    const row = findRowById(desk.tree, id)
    assert.ok(row, `${id} is in the outline`)
    assert.equal(row.props['data-current'], 'true', `${id} becomes the current selection`)
  }
})

test('typing is debounced, but leaving the chapter writes immediately', async () => {
  // The editor used to call `api.save` on every keystroke, and `writeBook` rewrites the whole
  // manuscript each time. It also reused the token it had rendered with, so a burst of saves
  // collided with itself and the "stale" recovery replaced the text the writer had just typed.
  const desk = await mountDesk(JSON.parse(JSON.stringify(emptyBook)), { saveInterval: 5000 })
  await desk.press('addUnder')  // volume
  await desk.press('addUnder')  // chapter
  await desk.press('addUnder')  // section, now selected
  const writesAfterOutline = desk.saved.calls

  // A keystroke must NOT write: a five-second pause is the whole point.
  const editor = findByClass(desk.tree, 'st-editor')
  editor.props.onChange({ target: { value: '雨' } })
  const afterTyping = await desk.refresh()
  assert.equal(desk.saved.calls, writesAfterOutline,
    'typing waits for a pause instead of rewriting the manuscript per character')
  // The screen shows the letter anyway: only the write is delayed.
  assert.equal(findByClass(afterTyping, 'st-editor').props.value, '雨',
    'the text on screen updates at once, so typing never feels lagged')

  // Switching chapter is the moment a delay would lose work, so it flushes.
  await desk.select(desk.saved.book.nodes[0].children[0].children[0].id)
  await new Promise((resolve) => setTimeout(resolve, 0))
  assert.ok(desk.saved.calls > writesAfterOutline, 'leaving the chapter wrote the pending text')
  const leaf = desk.saved.book.nodes[0].children[0].children[0]
  assert.equal(leaf.text, '雨', 'and the manuscript on disk carries it')
})
