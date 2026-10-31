import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(join(here, '..', 'client.js'), 'utf8')

/**
 * Evaluate the client bundle in the host realm with a stub loader and a stub react, then return
 * its plugin object. The registration test below needs the real apply(), not a reimplementation.
 */
function loadPlugin() {
  const captured = []
  const stubReact = {
    createElement: () => null,
    useState: (v) => [v, () => () => 'unused'],
    useEffect: () => {},
    useMemo: (fn) => fn(),
    useRef: (v) => ({ current: v }),
    Fragment: 'Fragment',
    Component: class { constructor(props) { this.props = props } },
  }
  const previous = globalThis.window
  globalThis.window = { __ModuleLoader__: { load: (entry) => captured.push(entry) } }
  try {
    ;(0, eval)(source)
  } finally {
    if (previous === undefined) delete globalThis.window
    else globalThis.window = previous
  }
  const entry = captured[0]
  assert.ok(entry, 'client.js must register a module')
  return entry.factory((name) => {
    if (name === 'react') return stubReact
    throw new Error(`unexpected require(${JSON.stringify(name)})`)
  })
}

/**
 * A Cordis-shaped fake that records slot registrations and can inject the named services.
 * `inject` invokes the callback with a child scope exposing exactly the injected services,
 * which is the behaviour the real plugin depends on.
 */
function fakeCtx(services) {
  const registered = []
  const registrations = []
  // A Cordis child context exposes injected services as properties as well as through get(),
  // and the plugin reads `scope.layout` directly, so the fake must do both.
  const makeScope = (available) => ({
    ...available,
    get: (name) => available[name],
    effect: (fn) => fn(),
    on: () => () => {},
    inject: (names, callback) => {
      const child = {}
      let missing = false
      for (const name of names) {
        if (available[name] === undefined) { missing = true; break }
        child[name] = available[name]
      }
      if (missing) return () => {}
      const scope = makeScope({ ...available, ...child })
      if (callback !== undefined) callback(scope)
    },
    slots: {
      inject: (_key, factory) => registrations.push(factory),
      register: (options) => { registered.push(options); return () => {} },
    },
    locale: {
      register: () => () => {},
      bind: () => (key) => key,
    },
  })
  return { ctx: makeScope(services), registered, registrations }
}

test('the panel registers only when the layout service is available', () => {
  const plugin = loadPlugin()
  const withoutLayout = fakeCtx({ slots: {}, locale: {} })
  plugin.apply(withoutLayout.ctx, {})
  // The sidebar entry still registers; the main panel must not.
  for (const factory of withoutLayout.registrations) factory()
  const names = withoutLayout.registered.map((options) => options.name)
  assert.deepEqual(names, ['sidebar.panellist'], 'only the sidebar entry, never the main panel')
})

test('with layout available the main panel registers and receives the service', () => {
  const plugin = loadPlugin()
  const layout = { selectPanel: () => {} }
  const withLayout = fakeCtx({
    slots: {}, locale: {}, layout,
    workspaces: { create: async () => ({ ok: true, value: { workspace: { id: 'w-book' } } }) },
    uiWorkspace: { openSession: () => {}, startSession: () => {}, openWorkspace: async () => {} },
  })
  plugin.apply(withLayout.ctx, {})
  // Both the main panel and the sidebar entry inject; run them all and pick out the panel.
  for (const factory of withLayout.registrations) factory()
  const main = withLayout.registered.find((options) => options.name === 'main')
  assert.ok(main, 'the main panel is registered')
  assert.equal(main.key, 'story')
  const injected = main.inject()
  assert.equal(injected.layout, layout, 'the panel receives the live layout service')
  assert.equal(typeof injected.workspaces.create, 'function', 'the panel can create book workspaces')
  assert.equal(typeof injected.uiWorkspace.openWorkspace, 'function', 'the panel can open a book workspace')
})

test('the sidebar entry registers regardless of layout', () => {
  const plugin = loadPlugin()
  const fake = fakeCtx({ slots: {}, locale: {} })
  plugin.apply(fake.ctx, {})
  // The sidebar entry is a separate registration that must not depend on layout.
  const source = readFileSync(join(here, '..', 'client.js'), 'utf8')
  // Quote matched loosely: the BUILT bundle writes double quotes.
  assert.ok(/ctx\.slots\.inject\(['"]sidebar\.panellist['"]/.test(source), 'sidebar entry stays outside the layout guard')
})

test('the injected scope hands down only the services the panel actually reads', async () => {
  // The panel is mounted by the host, so a service read out of `props` that the injection never
  // provided is `undefined` at the exact moment the branch needs it — and a real container stops
  // rendering the whole panel there. This pins the list the injection promises.
  const plugin = loadPlugin()
  const registrations = []
  let injected = null
  const scopeCtx = {
    layout: { selectPanel() {} },
    workspaces: { create: async () => ({}) },
    uiWorkspace: { openSession() {}, startSession() {}, openWorkspace: async () => {} },
    get: () => undefined,
    slots: {
      inject: (_key, factory) => registrations.push(factory),
      register: (options) => { registrations.push({ options }); return () => {} },
    },
  }
  plugin.apply({
    effect: (fn) => fn(),
    inject: (_names, callback) => { injected = _names; callback(scopeCtx) },
    slots: scopeCtx.slots,
    locale: { register: () => () => {}, bind: () => () => (key) => key },
  }, {})
  for (const factory of registrations) if (typeof factory === 'function') factory()
  const panel = registrations.find((entry) => typeof entry === 'object' && entry.options.name === 'main')
  assert.deepEqual(injected, ['layout', 'workspaces', 'uiWorkspace'],
    'the panel waits for exactly the three services it cannot work without')
  const props = panel.options.inject()
  for (const name of ['t', 'api', 'config', 'layout', 'workspaces', 'uiWorkspace']) {
    assert.ok(props[name] !== undefined, `the injection provides ${name}`)
  }
})
