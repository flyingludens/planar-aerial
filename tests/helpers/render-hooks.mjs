/**
 * A tiny React substitute strict enough to catch a crash hiding inside a render branch.
 *
 * The earlier smoke test called `StoryPanel` once with `useState` returning `undefined`, so the
 * body always took its `if (!workspacePath) return ...` early exit and never reached the lines
 * that build the real screen. A `ReferenceError` on one of those lines was invisible while the
 * browser showed a blank panel, because the host's slot error boundary swallows the throw and
 * renders an empty placeholder div.
 *
 * This harness follows the real hook protocol: hook slots persist per component instance across
 * renders, setters request another render, effects run after a render commits, and child
 * components are actually expanded. Rendering repeats until the state stops changing — what a
 * mounted component does. Any throw reaches the caller.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))

/** Let promise callbacks queued by an effect run, so data arrives as it would in a browser. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 0))

/**
 * A minimal document for the effects that reach for one: the stylesheet injection, the Esc
 * listener, and the lone-modifier watcher.
 *
 * Listeners are KEPT and can be dispatched by a test. They used to be dropped, which meant the
 * single gesture that opens the composer could not be driven at all — and a wiring mistake inside
 * that effect (a helper called from the wrong component) stayed invisible while every test passed.
 */
function stubDocument() {
  const listeners = new Map()
  return {
    head: { appendChild: () => {}, removeChild: () => {} },
    createElement: () => ({ textContent: '', remove: () => {} }),
    querySelector: () => null,
    addEventListener(type, listener) {
      if (!listeners.has(type)) listeners.set(type, [])
      listeners.get(type).push(listener)
    },
    removeEventListener(type, listener) {
      const list = listeners.get(type)
      if (list === undefined) return
      const at = list.indexOf(listener)
      if (at >= 0) list.splice(at, 1)
    },
    /** Fire one event type, through every listener registered for it. */
    dispatch(type, event) {
      for (const listener of [...(listeners.get(type) ?? [])]) listener(event)
    },
  }
}

/**
 * Load the bundle against a hook-aware React face.
 *
 * @returns `{ plugin, render }`; `render(Component, props)` drives a whole mount and resolves to
 *          `{ tree, renders, stable }` where `tree` is the final screen.
 */
export function loadClientForRender() {
  // One hook table per component instance, addressed by the instance's position in the tree, so
  // a child re-render keeps its own state while the parent re-renders.
  let tables = new Map()
  let current = undefined
  let dirty = false

  const react = {
    createElement: (type, config, ...children) => ({
      type,
      props: config ?? {},
      children: children.flat(Infinity).filter((child) => child !== null && child !== undefined && child !== false),
    }),
    Fragment: 'Fragment',
    // A class component the harness never instantiates: the panel's error boundary is defined with
    // it, and this stub only has to let the definition exist. The boundary is driven directly by
    // its own test, because a React class cannot run under this function-only renderer.
    Component: class {
      constructor(props) { this.props = props; this.state = {} }
    },
    useState: (initial) => {
      const table = current
      const index = table.cursor++
      if (index >= table.hooks.length) table.hooks[index] = typeof initial === 'function' ? initial() : initial
      const set = (next) => {
        const value = typeof next === 'function' ? next(table.hooks[index]) : next
        if (Object.is(value, table.hooks[index])) return
        table.hooks[index] = value
        dirty = true
      }
      return [table.hooks[index], set]
    },
    useRef: (initial) => {
      const table = current
      const index = table.cursor++
      if (index >= table.hooks.length) table.hooks[index] = { current: initial }
      return table.hooks[index]
    },
    useMemo: (factory, deps) => {
      // A memo with no dependency list recomputes every render; with one, the value is kept while
      // the list matches. Returning a fresh array each pass would make every effect that depends
      // on it look changed forever, which is a loop rather than the memo React would give.
      const table = current
      const index = table.cursor++
      const previous = table.hooks[index]
      const same = previous !== undefined && deps !== undefined && previous.deps !== undefined
        && deps.length === previous.deps.length
        && deps.every((value, position) => Object.is(value, previous.deps[position]))
      if (same) return previous.value
      const value = factory()
      table.hooks[index] = { deps, value }
      return value
    },
    useCallback: (fn, deps) => {
      const table = current
      const index = table.cursor++
      const previous = table.hooks[index]
      const same = previous !== undefined && deps !== undefined && previous.deps !== undefined
        && deps.length === previous.deps.length
        && deps.every((value, position) => Object.is(value, previous.deps[position]))
      if (same) return previous.value
      table.hooks[index] = { deps, value: fn }
      return fn
    },
    useEffect: (effect, deps) => {
      // React only re-runs an effect whose dependency list changed. Without this the harness
      // re-ran every effect on every pass, and an effect that sets fresh state objects looked
      // like an infinite update loop rather than the one-shot mount it is.
      const table = current
      const index = table.cursor++
      const previous = table.hooks[index]
      const changed = previous === undefined
        || deps === undefined
        || previous.deps === undefined
        || deps.length !== previous.deps.length
        || deps.some((value, position) => !Object.is(value, previous.deps[position]))
      table.hooks[index] = { deps }
      if (changed) table.effects.push(effect)
    },
    // Same scheduling as useEffect. React differs only in WHEN it runs (before paint, so a
    // measured layout can be corrected without the wrong frame showing); this harness never
    // paints, so one queue serves both.
    useLayoutEffect: (effect, deps) => {
      const table = current
      const index = table.cursor++
      const previous = table.hooks[index]
      const changed = previous === undefined
        || deps === undefined
        || previous.deps === undefined
        || deps.length !== previous.deps.length
        || deps.some((value, position) => !Object.is(value, previous.deps[position]))
      table.hooks[index] = { deps }
      if (changed) table.effects.push(effect)
    },
  }

  const captured = []
  const hadWindow = Object.prototype.hasOwnProperty.call(globalThis, 'window')
  const previousWindow = globalThis.window
  globalThis.window = { __ModuleLoader__: { load: (entry) => captured.push(entry) } }
  try {
    ;(0, eval)(readFileSync(join(here, '..', '..', 'client.js'), 'utf8'))
  } finally {
    if (hadWindow) globalThis.window = previousWindow
    else delete globalThis.window
  }
  const entry = captured[0]
  if (!entry) throw new Error('client.js did not call window.__ModuleLoader__.load')
  const plugin = entry.factory((name) => {
    if (name === 'react') return react
    throw new Error(`unexpected require(${JSON.stringify(name)})`)
  })

  /**
   * Expand one node: call function components, keep host elements and text as they are.
   * `path` identifies the component instance so its hooks survive between passes.
   */
  // Paths expanded in the current pass. A component that was not expanded this pass is gone, and
  // React would have thrown its state away with it — the table has to go too, or a component that
  // unmounts and remounts at the same place appears to keep its state, which is the opposite of
  // what a browser does and turns "the draft survives" tests into tautologies.
  let visited = new Set()

  function expand(node, path) {
    if (node === null || node === undefined || node === false) return null
    if (typeof node === 'string' || typeof node === 'number') return node
    if (Array.isArray(node)) return node.map((child, index) => expand(child, `${path}.${index}`))
    if (typeof node.type !== 'function') {
      return { type: node.type, props: node.props, children: node.children.map((child, index) => expand(child, `${path}.${index}`)) }
    }
    // A component instance is identified by POSITION AND TYPE, the way React unmounts when the
    // element type changes at the same place. Position alone reused the previous page's hook
    // table when two different pages occupied the same slot, so the next page's hooks landed on
    // the previous page's slots (a useEffect reading a useState value).
    const hookPath = `${path}:${node.type.name || 'anonymous'}`
    visited.add(hookPath)
    let table = tables.get(hookPath)
    if (table === undefined) {
      table = { hooks: [], cursor: 0, effects: [] }
      tables.set(hookPath, table)
    }
    table.cursor = 0
    table.effects = []
    const previous = current
    current = table
    let output
    try {
      // React hands a component its children in `props.children`; this renderer keeps them on the
      // element instead, so a component that reads `props.children` saw nothing and rendered an
      // empty box. Passing them through the way React does is what makes the two agree — without
      // it, a shared component that works in the panel renders blank under test.
      const props = node.children.length === 0 ? node.props : { ...node.props, children: node.children }
      output = node.type(props)
    } finally {
      current = previous
    }
    return expand(output, hookPath)
  }

  /**
   * Mount one component against a fresh hook table.
   *
   * @param Component - a component function from `plugin.__components`.
   * @param props - the props the host would hand it.
   * @param options.maxPasses - safety bound on the render loop.
   */
  async function render(Component, props, options = {}) {
    tables = new Map()
    return drive(Component, props, options)
  }

  /**
   * Render again on the SAME hook tables, which is what an event handler's `setState` does.
   * Keeping the tables is what lets a test click a card and then see the next screen.
   */
  async function rerender(Component, props, options = {}) {
    return drive(Component, props, options)
  }

  /** Run the render/effect loop until the state stops changing. */
  async function drive(Component, props, options = {}) {
    const maxPasses = options.maxPasses ?? 16
    const renders = []
    const previousDocument = globalThis.document
    // Handed back to the caller so a test can dispatch the document-level events the panel
    // listens for. Re-renders create a fresh stub and do not re-run effects with empty deps, so
    // the listeners stay here, on the document that was current when the component mounted.
    const doc = stubDocument()
    globalThis.document = doc
    try {
      for (let pass = 0; pass < maxPasses; pass += 1) {
        dirty = false
        visited = new Set()
        const tree = expand({ type: Component, props, children: [] }, 'root')
        for (const key of [...tables.keys()]) if (!visited.has(key)) tables.delete(key)
        renders.push(tree)
        // Effects run after the tree commits, in registration order, as React would.
        const effects = []
        for (const table of tables.values()) effects.push(...table.effects)
        for (const effect of effects) effect()
        if (!dirty) return { renders, tree, stable: true, document: doc }
        // Effects start promises; let them settle before deciding another pass is needed.
        await settle()
      }
      return { renders, tree: renders[renders.length - 1], stable: false, document: doc }
    } finally {
      globalThis.document = previousDocument
    }
  }

  return { plugin, render, rerender }
}

/**
 * Collect the text a reader would see, so a test can assert the screen is not blank.
 * Only strings and numbers count: a shell of empty divs is a blank panel in practice.
 */
export function visibleText(node, found = []) {
  if (node === null || node === undefined || node === false) return found
  if (typeof node === 'string' || typeof node === 'number') { found.push(String(node)); return found }
  if (Array.isArray(node)) { for (const child of node) visibleText(child, found); return found }
  for (const child of node.children ?? []) visibleText(child, found)
  return found
}

/** Find the first element whose `className` contains the given token. */
export function findByClass(node, token) {
  if (node === null || node === undefined || typeof node !== 'object') return undefined
  if (Array.isArray(node)) {
    for (const child of node) {
      const hit = findByClass(child, token)
      if (hit !== undefined) return hit
    }
    return undefined
  }
  if (typeof node.props?.className === 'string' && node.props.className.split(/\s+/).includes(token)) return node
  for (const child of node.children ?? []) {
    const hit = findByClass(child, token)
    if (hit !== undefined) return hit
  }
  return undefined
}

/** Find the first element whose rendered text contains the given string. */
export function findByText(node, text) {
  if (node === null || node === undefined || typeof node !== 'object') return undefined
  if (Array.isArray(node)) {
    for (const child of node) {
      const hit = findByText(child, text)
      if (hit !== undefined) return hit
    }
    return undefined
  }
  if (visibleText(node).join(' ').includes(text)) {
    // Descend first: the innermost element carrying the text is the control the user clicks.
    for (const child of node.children ?? []) {
      const hit = findByText(child, text)
      if (hit !== undefined) return hit
    }
    return node.props?.onClick === undefined ? undefined : node
  }
  return undefined
}
