import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(join(here, '..', 'client.js'), 'utf8')

/**
 * A real `setX` from `useState` can slip out of sync with its declaration during a rename,
 * and only a browser render would notice. This checks the source instead: every setter that is
 * *called* must also be *declared* by a useState destructuring.
 *
 * `useDockState` counts as a declaration: it is the wrapper that keeps a value alive across the
 * panel being unmounted, and it returns the same `[value, setter]` pair.
 */
test('every state setter that is called is also declared', () => {
  const declared = new Set()
  // The `React` identifier is NOT stable in the bundle: esbuild renames it to `React2` (and on
  // to `React3`) wherever a module brings its own binding of that name into scope, so a pattern
  // anchored on the literal word made every declaration vanish and the test reported the entire
  // panel as undeclared state. Match the hook CALL instead of the namespace it hangs off.
  const declaration = /const\s*\[[^\]]*?,\s*(set[A-Za-z0-9_$]+)[^\]]*\]\s*=\s*(?:React\d*\.useState|useDockState|usePersisted)/g
  for (const match of source.matchAll(declaration)) {
    declared.add(match[1])
  }
  const called = new Set()
  // Only bare calls count: `localStorage.setItem(...)` is a method on another object, not a
  // state setter, and matching it made this test report a setter that was never declared.
  for (const match of source.matchAll(/(?<![.\w])(set[A-Z][A-Za-z0-9_$]*)\s*\(/g)) {
    called.add(match[1])
  }
  // A method DEFINITION on an object literal (`setIntervalMs(ms) { ... }`) is not a call to a
  // setter, and the queue's own API is full of them. Dropping those is what keeps this check
  // about React state rather than about anything that happens to start with "set".
  for (const match of source.matchAll(/^\s*(set[A-Z][A-Za-z0-9_$]*)\s*\([^)]*\)\s*\{/gm)) {
    called.delete(match[1])
  }
  const missing = [...called].filter((name) => !declared.has(name)).sort()
  assert.deepEqual(missing, [], `state setters called but never declared: ${missing.join(', ')}`)
})

test('the panel addresses the book folder consistently', () => {
  // A rename that touches the value but not the setter is exactly the bug this guards.
  assert.ok(!/setBookId\b/.test(source), 'no stale setBookId may remain')
  if (/\bbookFolder\s*,/.test(source)) {
    assert.ok(/const\s*\[bookFolder,\s*setBookFolder\]/.test(source), 'bookFolder pairs with setBookFolder')
  }
})

/**
 * error #321 and bare ReferenceErrors only appear when a component actually renders. A tiny
 * fake React that runs useState/useEffect/useRef eagerly is enough to execute every hook line
 * and any top-of-body crash, which is where this class of bug lives.
 */
test('every component body renders without throwing under a stub React', () => {
  const captured = []
  const stubReact = {
    createElement: () => null,
    Fragment: 'Fragment',
    useState: (v) => [typeof v === 'function' ? undefined : v, () => {}],
    useEffect: () => {},
    useMemo: (fn) => fn(),
    useCallback: (fn) => fn,
    useRef: (v) => ({ current: v }),
    // The panel's error boundary is a class; this stub never renders it, it only has to let the
    // definition evaluate.
    Component: class { constructor(props) { this.props = props; this.state = {} } },
  }
  const previous = globalThis.window
  globalThis.window = { __ModuleLoader__: { load: (entry) => captured.push(entry) } }
  try { ;(0, eval)(source) } finally {
    if (previous === undefined) delete globalThis.window
    else globalThis.window = previous
  }
  const plugin = captured[0].factory((name) => (name === 'react' ? stubReact : undefined))

  // A minimal book in tree shape, one leaf selected, nothing folded.
  const leaf = (id, text) => ({ id, title: id, level: 'chapter', status: 'writing', children: [], paragraphs: [
    { id: `${id}-p1`, text, status: 'draft', suggestions: [], history: [] }] })
  const book = {
    schemaVersion: 1, title: 'T', genre: '', pov: '', tense: '',
    nodes: [{ id: 'v1', title: 'V', level: 'volume', status: 'writing', text: '', children: [leaf('c1', '正文。')] }],
    chapters: [leaf('c1', '正文。')],
    characters: [], relationships: [], settings: [], snapshots: [], overview: { chapters: {} },
  }
  const paragraph = book.chapters[0].paragraphs[0]
  const base = {
    t: (key) => key, api: new Proxy({}, { get: () => () => Promise.resolve({}) }),
    layout: { selectPanel: () => {} }, uiWorkspace: { openSession: () => {}, startSession: () => {} }, config: {},
    workspaces: { create: async () => ({ ok: true, value: { workspace: { id: 'w-book' } } }) },
    useWorkspaces: () => ({ items: [{ workspaceId: 'w1', path: '/ws', title: 'W', sessionIds: [] }] }),
    workspaceSnapshot: { items: [{ workspaceId: 'w1', path: '/ws', title: 'W', sessionIds: [] }] },
    book, bookFolder: '测试书', workspacePath: '/ws',
    paragraph, onText: () => {}, onAsk: () => {}, onAccept: () => {}, onReject: () => {},
    onFinalize: () => {}, onRevert: () => {}, requestCompletion: () => async () => '',
    activeId: 'c1', onSelect: () => {}, onToggle: () => {}, collapsed: new Set(),
    onRename: () => {}, onRemove: () => {},
    onApplied: () => {},
  }

  // StoryPanel is reachable only through apply, so call it through the slot factory.
  const injected = []
  const registeredOptions = []
  const scopeCtx = {
    layout: base.layout,
    workspaces: base.workspaces,
    uiWorkspace: base.uiWorkspace,
    get: (n) => (n === 'uiWorkspace' ? base.uiWorkspace : n === 'workspaces' ? base.workspaces : undefined),
    slots: {
      inject: (_key, factory) => injected.push(factory),
      register: (options) => { registeredOptions.push(options); return () => {} },
    },
  }
  plugin.apply({
    effect: (fn) => fn(),
    inject: (names, callback) => callback(scopeCtx),
    slots: scopeCtx.slots,
    locale: { register: () => () => {}, bind: () => () => base.t },
  }, {})

  assert.ok(injected.length > 0, 'the panel must inject its slot')
  for (const factory of injected) factory()
  assert.ok(registeredOptions.length > 0, 'the panel registers the main slot')
  // Build the full props the host would pass: injected values plus the standard hooks.
  const props = { ...registeredOptions[0].inject(), ...base }
  // The create-book flow needs the real service (it has .create), not the snapshot (.items).
  assert.equal(typeof props.workspaces.create, 'function', 'service reaches the panel')
  assert.ok(Array.isArray(props.workspaceSnapshot?.items), 'snapshot reaches the panel')
  // Calling the component directly executes its hooks and body under the stub React, which is
  // exactly where a hook-order or dangling-name crash shows up.
  const StoryPanel = plugin.__components.StoryPanel
  StoryPanel(props)
})

/**
 * A hook called inside an event handler is a hook-order violation that only explodes on click
 * (error #321), which no render test reaches. Static check: the hook names may only be CALLED
 * in component bodies, never inside `openConversation`/`const xxx = () =>` handler closures.
 */
test('hooks are never called inside event handlers', () => {
  // Extract each component function body, then flag hook calls nested inside arrow handlers.
  // Only real hooks: React.useXxx calls and the standard slot hooks. setState/setBooks are
  // action functions owned by useState, not hooks, so they are excluded on purpose.
  const hookNames = new Set([...source.matchAll(/React\.(use[A-Z][A-Za-z0-9_$]*)/g)].map((m) => m[1]))
  for (const name of ['useWorkspaces', 'useSessions', 'usePanelInfo', 'useChat', 'useConversation']) {
    hookNames.add(name)
  }
  // Walk the source and mark regions inside arrow-function assignments whose body contains a hook call.
  const componentBodies = [...source.matchAll(/function\s+([A-Za-z0-9_$]+)\s*\([^)]*\)\s*\{/g)].map((m) => ({
    name: m[1],
    start: m.index,
  })).map((entry, index, all) => ({ ...entry, end: index + 1 < all.length ? all[index + 1].start : source.length }))

  for (const body of componentBodies) {
    const text = source.slice(body.start, body.end)
    // Find every `const x = () => {` or `= async () => {` handler and its extent by brace match.
    const handlerPattern = /=\s*(?:async\s*)?\(([^)]*)\)\s*=>\s*\{/g
    while (handlerPattern.exec(text) !== null) {
      let depth = 1
      let cursor = handlerPattern.lastIndex
      while (cursor < text.length && depth > 0) {
        if (text[cursor] === '{') depth += 1
        else if (text[cursor] === '}') depth -= 1
        cursor += 1
      }
      const inner = text.slice(handlerPattern.lastIndex, cursor - 1)
      for (const hook of hookNames) {
        if (new RegExp(`\\b${hook}\\s*\\(`).test(inner)) {
          assert.fail(`${body.name}: hook "${hook}" is called inside an event handler (hook-order violation, error #321)`)
        }
      }
    }
  }
})
