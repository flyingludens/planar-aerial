/**
 * The book's shape, as the server half names it.
 *
 * The definitions moved to `domain/book.js` so the browser bundle and the host use one copy. This
 * module stays the server's entry point: `lib/store.js`, `lib/index.js` and the tests import the
 * book schema from here, and moving those imports would be churn with no behaviour behind it.
 *
 * The tree operations are re-exported from `domain/tree.js` for the same reason: `flattenLeaves`
 * and `mapNode` are part of the book's public surface, not a separate topic for its callers.
 */
export {
  createEmptyBook, normalizeBook, statusAfterText,
} from '../domain/book.js'
export { NODE_LEVELS, NODE_STATUSES } from '../domain/schema.js'
export {
  flattenLeaves, findNode, pathToNode, mapNode, removeNode,
} from '../domain/tree.js'
