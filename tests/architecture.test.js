import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'

/**
 * The dependency rules this codebase is built on, as a test rather than as a sentence in a
 * document.
 *
 * A layering rule that only lives in a paragraph erodes the first time someone is in a hurry:
 * the import is one line, the reviewer is looking at behaviour, and nothing goes red. These are
 * the four directions that cost the most if they break — each one is a way the two halves or the
 * shared kernel would stop being replaceable.
 */

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

function filesUnder(dir) {
  const out = []
  const walk = (at) => {
    for (const entry of readdirSync(at, { withFileTypes: true })) {
      const full = join(at, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name.endsWith('.js')) out.push(full)
    }
  }
  walk(join(root, dir))
  return out
}

/** Import specifiers only. Comments are prose and may name anything they like. */
function importsOf(path) {
  const source = readFileSync(path, 'utf8')
  return [...source.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((match) => match[1])
}

const label = (path) => relative(root, path)

test('the browser half never imports the host half', () => {
  for (const path of filesUnder('src/client')) {
    for (const specifier of importsOf(path)) {
      assert.ok(!/(^|\/)lib\//.test(specifier), `${label(path)} imports the host: ${specifier}`)
    }
  }
})

test('the host half never imports the browser half', () => {
  for (const path of filesUnder('lib')) {
    for (const specifier of importsOf(path)) {
      assert.ok(!/src\/client/.test(specifier), `${label(path)} imports the browser: ${specifier}`)
    }
  }
})

test('shared/ knows nothing about the book, the board or transport', () => {
  for (const path of filesUnder('src/client/shared')) {
    for (const specifier of importsOf(path)) {
      assert.ok(!/api\.js$/.test(specifier), `${label(path)} imports transport: ${specifier}`)
      assert.ok(!/(^|\/)panel\//.test(specifier), `${label(path)} imports panel: ${specifier}`)
      assert.ok(!/(^|\/)mosaic\//.test(specifier), `${label(path)} imports mosaic: ${specifier}`)
    }
  }
})

test('panel/ reaches into mosaic/ only at the two composition points', () => {
  // The shelf reuses the board's card presentation, and the panel mounts the board. Both are
  // deliberate; every other import would make the two features share a private detail.
  const allowed = new Set([join(root, 'src/client/panel/library.js'), join(root, 'src/client/panel/overlays.js')])
  for (const path of filesUnder('src/client/panel')) {
    if (allowed.has(path)) continue
    for (const specifier of importsOf(path)) {
      assert.ok(!/(^|\/)mosaic\//.test(specifier), `${label(path)} imports mosaic: ${specifier}`)
    }
  }
})

test('the board keeps its writes in the actions hook', () => {
  // `board-state.js` receives the route table as an argument; a page that imports it directly
  // would be holding a second transport, which is how the apply sequence got duplicated.
  for (const path of filesUnder('src/client/mosaic')) {
    for (const specifier of importsOf(path)) {
      assert.ok(!/(^|\/)api\.js$/.test(specifier), `${label(path)} imports transport: ${specifier}`)
    }
  }
})

test('panel pages receive their transport instead of importing the singleton', () => {
  // The `api` exported by api.js is bound to browser fetch, which only works when the panel is
  // served over HTTP (DSH). A page that imports it directly holds the wrong transport inside the
  // Electron renderer, where the page is file:// and fetch('/api/...') throws "Failed to fetch" —
  // exactly the failure the system event log reported. Pages take `api` as a prop; only the
  // composition entries (src/client/index.js and hosts/electron.js) choose which transport.
  for (const path of filesUnder('src/client/panel')) {
    for (const specifier of importsOf(path)) {
      assert.ok(!/(^|\/)api\.js$/.test(specifier), `${label(path)} imports transport: ${specifier}`)
    }
  }
})

test('the domain kernel depends on neither runtime and no built-in', () => {
  for (const path of filesUnder('domain')) {
    for (const specifier of importsOf(path)) {
      assert.ok(!specifier.startsWith('node:'), `${label(path)} imports a built-in: ${specifier}`)
      assert.ok(!specifier.startsWith('..'), `${label(path)} imports outside domain/: ${specifier}`)
      assert.ok(!/^react(-dom)?(\/|$)/.test(specifier), `${label(path)} imports React: ${specifier}`)
    }
  }
})
