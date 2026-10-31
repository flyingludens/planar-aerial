// tests/helpers/load-client.mjs
// The client bundle is a classic script for the browser loader. Install a stub
// window.__ModuleLoader__ on the host global, evaluate the bundle, and return the
// plugin object's __logic. The bundle runs in the host realm instead of a vm
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
    useRef: (v) => ({ current: v }),
    useEffect: () => {},
    useMemo: (fn) => fn(),
    Fragment: 'Fragment',
    // The panel wraps itself in an error boundary, which is a class: the logic tests never render
    // it, they only need the class to exist when the bundle is evaluated.
    Component: class { constructor(props) { this.props = props } },
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
