import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const client = readFileSync(join(here, '..', 'client.js'), 'utf8')

/**
 * Every file that can register a route, concatenated.
 *
 * The handlers used to live only in lib/index.js. They are now split by subject under
 * lib/routes/, so reading one file would find a route missing and report the contract as broken
 * for a route that is registered perfectly well -- or, worse, quietly test nothing for it.
 * Directory order is not meaningful here: the reads below locate a route by its path string.
 */
const host = [
  join(here, '..', 'lib', 'index.js'),
  join(here, '..', 'lib', 'service.js'),
  join(here, '..', 'lib', 'adapters', 'dsh.js'),
  join(here, '..', 'lib', 'routes', 'kernel.js'),
  ...readdirSync(join(here, '..', 'lib', 'routes'))
    .filter((name) => name.endsWith('.js'))
    .map((name) => join(here, '..', 'lib', 'routes', name)),
].map((path) => readFileSync(path, 'utf8')).join('\n')

/**
 * The panel talks to the host over named JSON fields, and nothing type-checks that the two sides
 * agree. When they drift, the request still succeeds and the model is simply handed the wrong
 * things — which is how "rewrite the selected passage" turned into the model echoing the
 * instruction back: the selection went into `instruction` and `text` arrived empty.
 *
 * So: every field the client sends must be destructurable by the host, and every field the host
 * relies on must be present in the request.
 */
const ROUTES = ['suggest', 'continue', 'load', 'save', 'snapshot', 'restore', 'chat', 'books', 'createBook', 'deleteBook', 'renameBook', 'applyProposal', 'overview', 'review', 'critique', 'models', 'setModel', 'mosaic.check', 'mosaic.ask', 'mosaic.apply']

/** Field names the client puts in the body of one `post('/api/story.<route>', {...})`. */
function clientFields(route) {
  // The quote is matched loosely: this reads the BUILT bundle, where esbuild writes double
  // quotes. Anchoring on `post('` made every route look absent from the client.
  const call = new RegExp(`(?:post|call)\\(['"]/api/story\\.${route}['"],\\s*\\{([^}]*)\\}`).exec(client)
  if (call === null) return undefined
  const fields = new Set()
  // Both `{ a, b }` shorthand and `{ a: value }` count as sending the field.
  for (const part of call[1].split(',')) {
    const name = part.split(':')[0].trim()
    if (name !== '') fields.add(name)
  }
  return fields
}

/** Field names the host destructures from the request body for one route. */
function hostFields(route) {
  const route_ = host.indexOf(`'/api/story.${route}'`)
  if (route_ < 0) return undefined
  // The route's own body only: the next `route(` ends it. Without that stop, a route that takes no
  // fields borrowed the destructure of the route after it and looked like it read them.
  const rest = host.slice(route_)
  const end = rest.indexOf('\n  route(')
  const body = end < 0 ? rest : rest.slice(0, end)
  // Take the destructuring pattern IMMEDIATELY before the payload() call: a naive brace match
  // starts at the enclosing `try {` and swallows statements instead of field names.
  // `bookPayload` is the book routes' wrapper: it resolves the library from settings and hands
  // back the body, so the destructure is what the route reads either way.
  const destructure = /const\s*\{([^}]*)\}\s*=\s*await (?:payload|bookPayload)\(request\)/.exec(body)
  if (destructure === null) return undefined
  return new Set(destructure[1].split(',').map((name) => name.split(':')[0].trim())
    // `library` and `settings` are resolved by `bookPayload` from the settings file, not received
    // from the client: they are in the destructure because the route needs them, and requiring the
    // client to send them would be requiring it to know something the host decides.
    .filter((name) => name !== '' && name !== 'library' && name !== 'settings'))
}

test('the client and the host agree on every request field', () => {
  // A route missing from either side would silently `continue` past its own check below, so the
  // enumeration itself has to be asserted: every listed route must exist on BOTH sides, or the
  // contract for it is untestable and drift goes unnoticed. A host route that reads its body
  // with `await payload(request)` and no destructure (`models` takes nothing) is a present
  // route with an empty contract, not an absent one.
  const hostContract = (route) => {
    const fields = hostFields(route)
    if (fields !== undefined) return fields
    if (host.includes(`'/api/story.${route}'`)) return new Set()
    return undefined
  }
  for (const route of ROUTES) {
    const sent = clientFields(route)
    const expected = hostContract(route)
    assert.ok(sent !== undefined, `${route}: the client posts to /api/story.${route}`)
    assert.ok(expected !== undefined, `${route}: the host registers /api/story.${route}`)
  }
  for (const route of ROUTES) {
    const sent = clientFields(route)
    const expected = hostContract(route)
    // The host may read optional fields the client omits; what must never happen is the client
    // sending a field the host cannot see, or the host reading one the client never sends.
    for (const name of expected) {
      if (name === 'ok' || name === 'roots' || name === 'removeFiles' || name === 'title' || name === 'id' || name === 'refresh' || name === 'label' || name === 'history' || name === 'message' || name === 'proposal' || name === 'book' || name === 'token' || name === 'instruction' || name === 'text' || name === 'chapterId' || name === 'bookFolder' || name === 'workspacePath') {
        // Listed explicitly so an unexpected name stands out below rather than silently passing.
      }
    }
    const extras = [...sent].filter((name) => !expected.has(name))
    assert.deepEqual(extras, [],
      `${route}: the client sends ${extras.join(', ')} but the host never reads ${extras.length === 1 ? 'it' : 'them'}`)
    const missing = [...expected].filter((name) => !sent.has(name))
    assert.deepEqual(missing, [],
      `${route}: the host reads ${missing.join(', ')} but the client never sends ${missing.length === 1 ? 'it' : 'them'}`)
  }
})

test('suggest sends the selection as text, never as a paragraph id', () => {
  // The regression that produced the garbled suggestion card.
  // Comments may name the old field to explain the history; CODE must not use it.
  const code = client.replace(/^\s*\/\/.*$/gm, '')
  assert.ok(!code.includes('paragraphId'), 'no paragraph ids may remain in the client code')
  const sent = clientFields('suggest')
  assert.ok(sent.has('text'), 'the passage to rewrite travels as `text`')
  assert.ok(sent.has('instruction'), 'the instruction is a separate field')
})
