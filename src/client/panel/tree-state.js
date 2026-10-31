/**
 * The manuscript's tree: every edit that changes its shape.
 *
 * Adding a node, renaming one, writing a leaf's summary, deleting a container. They are one
 * subject because they all go through `commitNodes`, which is the only place that keeps `nodes`
 * and the DERIVED `chapters` array in step — write only `nodes` and the editor stays bound to
 * the previous value, so a keystroke is replaced by the old text.
 *
 * The delete flow keeps its own state here (`doomed`): asking and confirming are two steps of
 * one gesture, and no other part of the panel cares which node is waiting.
 *
 * @param t          - the panel's translator; new nodes are named from the dictionary.
 * @param book       - the open book; its `nodes` are what every edit reads and rewrites.
 * @param updateBook - the panel's one write path; it owns the queue and the version guard.
 * @param chapter    - the chapter the editor has open, used to clear the selection after a delete.
 * @param selected    - the outline's selected node id, which decides where a new node lands.
 * @param setSelected - cleared when a delete removes the node it pointed at.
 */
import { React } from '../shared/react.js'
import { flattenLeaves, findNode, mapNode, pathToNode, removeNode } from '../../../domain/tree.js'
import { newId } from '../../../domain/ids.js'

export function useTreeEdits({ t, book, updateBook, chapter, selected, setSelected, chapterId, setChapterId }) {
  const commitNodes = (nodes, immediate) => {
    const next = { ...book, nodes, chapters: flattenLeaves(nodes) }
    updateBook(next, { immediate: immediate === true })
  }

  /**
   * Apply one edit to the active chapter and keep the DERIVED `chapters` array in step.
   *
   * `chapters` is not stored: it is flattened from `nodes` on every normalize. The editor
   * reads it, so writing only `nodes` left the textarea bound to the previous value and each
   * keystroke was replaced by the old text — the "second letter eats the first" bug.
   */
  const patchChapter = (mutate) => {
    if (!chapter) return undefined
    commitNodes(mapNode(book.nodes, chapter.id, mutate))
  }

  /**
   * Write one leaf's synopsis from the mosaic board, wherever in the tree it sits.
   *
   * The board lists EVERY leaf, not only the chapter the editor has open, so this targets the
   * row's own id rather than going through `patchChapter` — but the write path is the same
   * `commitNodes`, so `nodes` and the derived `chapters` move together and the save rides the
   * panel's ordinary queue. v1 stores the summary as a plain string on the node; the AI
   * generator that will fill it arrives with Task 10's `overview` route.
   */
  const onSummary = (chapterId, summary) => {
    commitNodes(mapNode(book.nodes ?? [], chapterId, (node) => ({ ...node, summary })))
  }

  /**
   * Add a node at one level, as a SIBLING under the right parent.
   *
   * The parent is decided by what is selected, not by "the last leaf in the tree". Attaching
   * to the last leaf made a second section land inside the first one, and once a leaf became
   * a container the next add fell through to the volume, so a chapter could never hold two
   * sections. Rules, per level:
   *
   *   volume  — root, after the last volume
   *   chapter — inside the selected volume, or the volume of the selected chapter/section
   *   section — inside the selected chapter, or the chapter of the selected section
   *
   * With nothing selected, a new chapter goes in the last volume and a new section in the
   * last chapter, which is what "continue writing where I was" means.
   */
  const addNode = (level) => {
    const nodes = book.nodes ?? []
    const id = newId(level[0])

    if (level === 'volume') {
      commitNodes([...nodes, { id, title: t('label.untitledVolume'), level, status: 'writing', text: '', children: [] }], true)
      // Selecting what was just made is what makes the next press build INSIDE it: the outline
      // has one button, and the selection is how the writer says where the next thing goes.
      setSelected(id)
      return
    }

    // Walk up from the selected node until a node of the wanted PARENT level is met.
    const ancestry = selected === '' ? [] : (pathToNode(nodes, selected) ?? [])
    const parentLevel = level === 'chapter' ? 'volume' : 'chapter'
    let parent = [...ancestry].reverse().find((node) => node.level === parentLevel)

    if (parent === undefined) {
      // Nothing suitable is selected: continue at the end of the last branch of that level.
      if (parentLevel === 'volume') {
        parent = nodes[nodes.length - 1]
      } else {
        const volumes = nodes.filter((node) => node.level === 'volume')
        const lastVolume = volumes[volumes.length - 1]
        const chapters = (lastVolume?.children ?? []).filter((node) => node.level === 'chapter')
        parent = chapters[chapters.length - 1]
      }
    }

    if (parent === undefined) {
      // A chapter needs a volume to live in, so creating the first one is part of the action.
      if (level === 'chapter') {
        const volume = { id: newId('v'), title: t('label.untitledVolume'), level: 'volume', status: 'writing', text: '', children: [] }
        const child = { id, title: t('chapter.defaultTitle', { n: 1 }), level, status: 'writing', text: '', children: [] }
        commitNodes([...nodes, { ...volume, children: [child] }], true)
        setChapterId(id)
        setSelected(id)
      }
      return
    }

    const title = level === 'chapter'
      ? t('chapter.defaultTitle', { n: (book.chapters?.length ?? 0) + 1 })
      : t('label.untitledSection')
    const node = { id, title, level, status: 'writing', text: '', children: [] }
    // Append: a new sibling goes after the ones already there, never before.
    commitNodes(mapNode(nodes, parent.id, (n) => ({ ...n, children: [...n.children, node] })), true)
    setChapterId(id)
    setSelected(id)
  }

  /** Rename any node; the stored title is what the tree, the export and the tools read. */
  const renameNode = (nodeId, title) => commitNodes(mapNode(book.nodes, nodeId, (n) => ({ ...n, title })), true)

  /** Remove a container with everything under it; a leaf's own text goes with it. */
  /**
   * A node waiting to be deleted, or null.
   *
   * Deleting a chapter throws away its text, and deleting a volume throws away every chapter
   * under it. There is no undo for that — the save queue writes the new tree over the old one —
   * so the press that does it asks first.
   */
  const [doomed, setDoomed] = React.useState(null)
  /** What will actually go, in words the writer can count: sections, chapters, characters. */
  const countUnder = (node) => {
    let leaves = 0
    let containers = 0
    const walk = (n) => {
      if (n.children.length === 0) { leaves += 1; return }
      containers += 1
      for (const child of n.children) walk(child)
    }
    walk(node)
    return { leaves, containers, chars: (node.text ?? '').length }
  }
  const confirmRemove = () => {
    const node = doomed
    setDoomed(null)
    if (node === null) return
    const emptied = node.children.length === 0 && node.id === chapterId
    commitNodes(removeNode(book.nodes, node.id), true)
    if (emptied) setChapterId('')
  }
  /** The delete control asks; nothing is removed until the dialog is answered. */
  const removeTreeNode = (nodeId) => {
    const node = findNode(book.nodes, nodeId)
    if (node === undefined) return
    setDoomed(node)
  }

  /** Answer the delete dialog with "no". The node stays where it was. */
  const cancelRemove = () => setDoomed(null)

  return {
    commitNodes, patchChapter, onSummary, addNode, renameNode,
    doomed, countUnder, confirmRemove, cancelRemove, removeTreeNode,
  }
}
