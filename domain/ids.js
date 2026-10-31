/**
 * One id maker for both halves.
 *
 * The Node half used `randomUUID` from `node:crypto` and the browser half used a timestamp with a
 * random tail. Both produce the same kind of value — an opaque unique string — but two policies
 * meant a card made on one side and a card made on the other were addressable by different
 * conventions. `globalThis.crypto.randomUUID` exists in Node 19+ and every browser this plugin
 * runs in; the fallback keeps an old runtime working rather than failing to open a book.
 *
 * `prefix` is for readability only: `e-…` for an entity, `v-…` for a volume. Nothing parses it.
 */
export function newId(prefix = '') {
  const crypto = globalThis.crypto
  const uuid = typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : ''
  const body = uuid !== ''
    ? uuid
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10).padEnd(8, '0')}`
  return prefix === '' ? body : `${prefix}-${body}`
}
