/**
 * Walking the manuscript tree.
 *
 * A node is either a container (it owns `children`) or a leaf (it owns `text`). These are the
 * operations both halves need, and they were written twice because the browser bundle cannot
 * reach into `lib/` at runtime. They live here now so there is one answer to "what is a leaf"
 * and "where does this id sit".
 *
 * Nothing in this file reads the clock, mints an id or touches an external surface: the
 * operations are pure and return new arrays.
 */

/** Every leaf node in reading order. Leaves are what carry text and what the writer edits. */
export function flattenLeaves(nodes) {
  const out = []
  const walk = (list) => {
    for (const node of list ?? []) {
      if (node.children.length > 0) walk(node.children)
      else out.push(node)
    }
  }
  walk(nodes)
  return out
}

/** Depth-first search for one node in the tree. */
export function findNode(nodes, id) {
  for (const node of nodes ?? []) {
    if (node.id === id) return node
    const hit = findNode(node.children, id)
    if (hit !== undefined) return hit
  }
  return undefined
}

/** The chain of ancestors leading to a node, outermost first (excludes the node itself). */
export function pathToNode(nodes, id) {
  const walk = (list, trail) => {
    for (const node of list ?? []) {
      if (node.id === id) return trail
      const hit = walk(node.children, [...trail, node])
      if (hit !== undefined) return hit
    }
    return undefined
  }
  return walk(nodes, []) ?? []
}

/** Replace one node in place, returning a new tree. Unknown ids return the tree unchanged. */
export function mapNode(nodes, id, mutate) {
  return (nodes ?? []).map((node) => {
    if (node.id === id) return mutate(node)
    return node.children.length === 0 ? node : { ...node, children: mapNode(node.children, id, mutate) }
  })
}

/** Remove one node, returning a new tree without it. */
export function removeNode(nodes, id) {
  return (nodes ?? [])
    .filter((node) => node.id !== id)
    .map((node) => (node.children.length === 0 ? node : { ...node, children: removeNode(node.children, id) }))
}
