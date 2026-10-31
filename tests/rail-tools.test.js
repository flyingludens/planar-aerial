import test from 'node:test'
import assert from 'node:assert/strict'
import { loadClientForRender, findByClass, visibleText } from './helpers/render-hooks.mjs'

/**
 * The rail's function row: the start page plus four book-level actions.
 *
 * Each one is driven on its own. A row of buttons is easy to draw and easy to draw WRONG — a
 * label with no handler, a handler wired to the wrong state, a download that builds the file name
 * from the wrong field. None of that shows up in a render test that only checks the labels exist.
 */

const t = (key, params) => {
  let text = key
  for (const [name, value] of Object.entries(params ?? {})) text = text.replaceAll(`{${name}}`, String(value))
  return text
}

const book = () => ({
  id: 'b1', title: '我的书', schemaVersion: 3, genre: '', pov: '', tense: '',
  nodes: [],
  chapters: [
    { id: 'c1', title: '第一章', level: 'chapter', status: 'writing', children: [], text: '一二三' },
    { id: 'c2', title: '第二章', level: 'chapter', status: 'todo', children: [], text: '' },
  ],
  snapshots: [], overview: { chapters: {} },
})

/** The four buttons, by the test id each one carries. */
const byTestId = (node, id) => {
  if (node === null || typeof node !== 'object' || Array.isArray(node)) return undefined
  if (node.props?.['data-testid'] === id) return node
  for (const child of node.children ?? []) {
    const hit = byTestId(child, id)
    if (hit !== undefined) return hit
  }
  return undefined
}

async function mountTools(overrides = {}) {
  const { plugin, render, rerender: drive } = loadClientForRender()
  const RailTools = plugin.__components.RailTools
  assert.ok(RailTools, 'the function row is exposed for a direct mount')
  const calls = []
  const props = {
    t,
    book: book(),
    onStart: () => calls.push(['start']),
    onShelf: () => calls.push(['shelf']),
    onSave: () => calls.push(['save']),
    onExport: async () => '# 我的书\n\n## 第一章\n\n一二三\n',
    onNotice: (text, tone) => calls.push(['notice', text, tone]),
    onAbout: () => calls.push(['about']),
    ...overrides,
  }
  const mounted = await render(RailTools, props)
  // The harness rerender drives the SAME hook tables, which is what a handler's setState does.
  // Calling render() again would mount a second instance with fresh state, and every assertion
  // about "the card is open now" would read the wrong tree.
  return { ...mounted, calls, rerender: () => drive(RailTools, props) }
}

test('the start-page entry leaves the book for the welcome page', async () => {
  const mounted = await mountTools()
  byTestId(mounted.tree, 'rail-start').props.onClick()
  assert.deepEqual(mounted.calls, [['start']], 'the panel is asked for the start page, nothing else')
})

test('the row offers the four functions, each a real button', async () => {
  const { tree } = await mountTools()
  for (const [id, label] of [['rail-shelf', 'rail.shelf'], ['rail-save', 'rail.save'], ['rail-export', 'rail.export'], ['rail-about', 'rail.about']]) {
    const button = byTestId(tree, id)
    assert.ok(button, `${id} is in the row`)
    assert.equal(button.type, 'button', `${id} is a button`)
    assert.ok(visibleText(button).join(' ').includes(label), `${id} carries its label`)
    assert.ok(typeof button.props.onClick === 'function', `${id} has a handler`)
  }
})

test('书架 leaves for the shelf, and is disabled when the shelf is already showing', async () => {
  const { tree, calls } = await mountTools()
  byTestId(tree, 'rail-shelf').props.onClick()
  assert.deepEqual(calls, [['shelf']], 'the press reaches the panel')

  // No `onShelf` is the panel's way of saying "you are already there". The button keeps its place
  // in the row — a row that changes shape between screens is a row you have to re-find — and says
  // it cannot be used.
  const { tree: onShelf } = await mountTools({ onShelf: undefined })
  assert.equal(byTestId(onShelf, 'rail-shelf').props.disabled, true, 'a dead destination is disabled')
})

test('保存 writes now and says so, and is unavailable without a book', async () => {
  const { tree, calls } = await mountTools()
  byTestId(tree, 'rail-save').props.onClick()
  assert.deepEqual(calls, [['save'], ['notice', 'rail.savedNow', 'info']],
    'the write is requested and the row reports that the press did something')

  // A book loaded but mid-write: a second save would be a second request against the same token.
  const { tree: saving } = await mountTools({ saving: true })
  assert.equal(byTestId(saving, 'rail-save').props.disabled, true, 'disabled while a write is in flight')

  // Nothing open: save and export both have nothing to act on.
  const { tree: noBook } = await mountTools({ book: null })
  assert.equal(byTestId(noBook, 'rail-save').props.disabled, true)
  assert.equal(byTestId(noBook, 'rail-export').props.disabled, true)
  // The disabled attribute is `undefined` OR absent depending on how the prop was built; what
  // matters is that it is not the boolean true.
  assert.notEqual(byTestId(noBook, 'rail-about').props.disabled, true,
    '关于 needs no book to be pressable')
})

test('导出 hands the merged markdown to the browser under the book title', async () => {
  // The download itself needs a DOM this harness does not have, so the test drives the two things
  // that can be wrong without one: what is exported, and what it is called. Both are pure.
  const { plugin } = loadClientForRender()
  // Pure helpers, so they live on the __logic surface rather than in __components: that one is
  // walked by a test which mounts every entry, and a bag of functions would fail it.
  const { exportFileName, downloadText } = plugin.__logic

  assert.equal(exportFileName('我的书'), '我的书.md', 'the title becomes the file name')
  assert.equal(exportFileName('a/b:c*d'), 'a-b-c-d.md', 'reserved characters are replaced, not dropped from the path')
  assert.equal(exportFileName('  '), 'manuscript.md', 'an empty title still names a file')
  assert.equal(exportFileName('x'.repeat(200), 'x'.repeat(200)).length, 63, 'and a long one is cut, never runaway')
  // No document under the harness: the helper reports that it could not run rather than throwing,
  // which is what lets the caller show a notice instead of crashing the panel.
  assert.equal(downloadText('# hello', 'a.md'), false, 'no document means no download, reported honestly')
})

test('导出 reports an empty manuscript instead of downloading nothing', async () => {
  const { tree, calls } = await mountTools({ onExport: async () => '   ' })
  await byTestId(tree, 'rail-export').props.onClick()
  assert.deepEqual(calls, [['notice', 'rail.exportEmpty', 'info']],
    'a book with no prose says why nothing happened, and says it neutrally')
})

test('导出 reports a failed read as an error, and re-enables itself', async () => {
  const failure = async () => { throw new Error('route failed') }
  const { tree, calls, rerender } = await mountTools({ onExport: failure })
  await byTestId(tree, 'rail-export').props.onClick()
  assert.deepEqual(calls, [['notice', 'route failed', 'error']], 'the failure reaches the status bar')
  const after = (await rerender()).tree
  assert.notEqual(byTestId(after, 'rail-export').props.disabled, true, 'and the button works again')
})

test('关于 hands the open to the panel instead of drawing the card itself', async () => {
  // The card must NOT be rendered inside the row. The row is mounted inside the rail, which is an
  // absolutely positioned card: a dialog rendered there is clipped to 264px of column and centres
  // on the directory rather than on the panel. This test pins the seam — the row reports, the
  // panel draws — because the bug it prevents is invisible in a unit test of either half.
  const { tree, calls } = await mountTools()
  byTestId(tree, 'rail-about').props.onClick()
  assert.deepEqual(calls, [['about']], 'the press reaches the panel')
  assert.equal(findByClass(tree, 'st-dialog'), undefined,
    'and no dialog is drawn inside the rail')
})

test('关于 names the product and its author, not the open book', async () => {
  // 关于 answers "what is this panel, which version, who wrote it". The book's own statistics are
  // read while working — the status bar and the board — and putting them here would answer a
  // question about the manuscript with a heading about the software.
  const { plugin, render } = loadClientForRender()
  const AboutBox = plugin.__components.AboutBox
  assert.ok(AboutBox, 'the card is exposed for a direct mount')
  const opened = await render(AboutBox, { t, onClose: () => {} })
  const dialog = findByClass(opened.tree, 'st-dialog')
  assert.ok(dialog, 'the card opens')
  const text = visibleText(dialog).join(' ')
  assert.ok(text.includes('brand.full'), 'it names the product')
  assert.ok(text.includes('0.1.0'), 'and its version, from the manifest the build read')
  assert.ok(text.includes('flyingludens'), 'and its author')
  assert.ok(!text.includes('我的书'), 'the open book is not what this card is about')
  // Escape closes it: the listener is on the document this pass mounted against.
  let closed = 0
  const mounted = await render(AboutBox, { t, onClose: () => { closed += 1 } })
  mounted.document.dispatch('keydown', { key: 'Escape', preventDefault: () => {} })
  assert.equal(closed, 1, 'Escape puts it away')
})
