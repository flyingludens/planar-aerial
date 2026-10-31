import test from 'node:test'
import assert from 'node:assert/strict'
import { loadClientLogic } from './helpers/load-client.mjs'
import { loadClientForRender, findByClass, visibleText } from './helpers/render-hooks.mjs'

/**
 * The editing layer proper: undo history, the Markdown preview, and which key does what.
 *
 * The controlled textarea resets the browser's native undo stack on every keystroke, so before
 * this the panel had no undo at all — and an AI rewrite, which replaces a range wholesale, could
 * not be taken back. The history here is what makes Cmd+Z mean something.
 */

const { createHistory, renderMarkdownBlocks, diffWords } = loadClientLogic()

const t = (key, params) => {
  if (params === undefined) return key
  return `${key} ${Object.entries(params).map(([name, value]) => `${name}=${value}`).join(' ')}`
}

test('undo steps back through edits and redo steps forward again', () => {
  // `replace` rather than `type`, so each edit is its own step: consecutive typing merges by
  // design, which the next case covers.
  const history = createHistory('一')
  history.record('一二', { start: 2, end: 2 }, 'replace')
  history.record('一二三', { start: 3, end: 3 }, 'replace')
  assert.equal(history.text(), '一二三')
  assert.equal(history.undo().text, '一二')
  assert.equal(history.undo().text, '一')
  assert.equal(history.undo(), undefined, 'there is nothing older than the initial text')
  // After stepping past the oldest entry the cursor stays there, so redo walks back up.
  assert.equal(history.redo().text, '一二', 'redo walks back up')
  assert.equal(history.redo().text, '一二三')
  assert.equal(history.redo(), undefined, 'and stops at the newest edit')
})

test('a burst of typing is one undo step, not one per character', () => {
  // Undoing a sentence character by character is not undo, it is retyping backwards.
  let clock = 0
  const history = createHistory('', { now: () => clock })
  for (const text of ['雨', '雨夜', '雨夜很', '雨夜很长']) {
    clock += 100
    history.record(text, { start: text.length, end: text.length })
  }
  assert.equal(history.text(), '雨夜很长')
  assert.equal(history.undo().text, '', 'one undo removes the whole burst')
  assert.equal(history.size(), 2, 'the initial text plus the merged run')
})

test('a pause splits the run, so undo steps by phrase', () => {
  let clock = 0
  const history = createHistory('', { now: () => clock, mergeWindow: 700 })
  clock += 100
  history.record('雨夜', { start: 2, end: 2 })
  // Longer than the merge window: the writer thought about it, which is a natural boundary.
  clock += 5000
  history.record('雨夜很长', { start: 4, end: 4 })
  assert.equal(history.undo().text, '雨夜', 'undo removes only the second phrase')
  assert.equal(history.undo().text, '', 'and a second undo removes the first')
})

test('a replacement is never merged into the typing before it', () => {
  // An AI rewrite or a paste over a selection must be its own step: merging it would make one
  // Cmd+Z throw away the rewrite AND the sentence the writer had just typed.
  let clock = 0
  const history = createHistory('', { now: () => clock })
  clock += 100
  history.record('原句', { start: 2, end: 2 })
  clock += 100
  history.record('新句', { start: 2, end: 2 }, 'replace')
  assert.equal(history.undo().text, '原句', 'the rewrite is undone on its own')
  assert.equal(history.undo().text, '', 'and the typing before it is still there to undo')
})

test('a new edit after undo discards the redo branch', () => {
  const history = createHistory('a')
  history.record('ab', { start: 2, end: 2 })
  history.record('abc', { start: 3, end: 3 })
  history.undo()
  assert.equal(history.canRedo(), true)
  history.record('abx', { start: 3, end: 3 }, 'replace')
  assert.equal(history.canRedo(), false, 'writing after an undo drops what was ahead')
  assert.equal(history.text(), 'abx')
})

test('recording the same text twice is not an edit', () => {
  // The textarea fires onChange for things like a selection change in some engines; a duplicate
  // entry would make undo look broken by appearing to do nothing.
  const history = createHistory('正文')
  assert.equal(history.record('正文', { start: 2, end: 2 }), false)
  assert.equal(history.size(), 1)
})

test('reset starts a clean history, which is what a chapter switch needs', () => {
  // An entry holding the previous chapter would paste one chapter into another on Cmd+Z.
  const history = createHistory('第一章的正文')
  history.record('第一章的正文，改过。', { start: 10, end: 10 })
  history.reset('第二章的正文')
  assert.equal(history.text(), '第二章的正文')
  assert.equal(history.undo(), undefined, 'nothing from the old chapter is reachable')
  assert.equal(history.canUndo(), false)
})

test('the history is bounded, so a long session cannot grow forever', () => {
  const history = createHistory('', { limit: 5 })
  for (let i = 1; i <= 20; i += 1) history.record('字'.repeat(i), { start: i, end: i }, 'replace')
  assert.ok(history.size() <= 5, `history stayed bounded, saw ${history.size()} entries`)
  // The newest entry always survives, which is what makes the bounded history usable.
  assert.equal(history.text(), '字'.repeat(20))
})

// ---- the manuscript preview ----

test('the merged manuscript becomes headings and paragraphs', () => {
  // The host generates a fixed subset: `#` headings and blank-line-separated prose. The preview
  // used to show that source in a <pre>, so the writer read hashes and line breaks.
  const markdown = [
    '# 我的书', '',
    '## 第一卷', '',
    '### 第一章', '',
    '雨下了一整夜。', '巷子对面的灯糊成一片。', '',
    '她坐在桌前。', '',
    '#### 第一节', '',
    '最后一句。',
  ].join('\n')
  const blocks = renderMarkdownBlocks(markdown)
  assert.deepEqual(blocks.map((block) => block.type === 'h' ? `h${block.level}` : block.type),
    ['h1', 'h2', 'h3', 'p', 'p', 'h4', 'p'])
  // Consecutive prose lines are one paragraph, not one paragraph per line.
  assert.equal(blocks[3].spans.map((span) => span.text).join(''), '雨下了一整夜。 巷子对面的灯糊成一片。')
})

test('asterisks become emphasis instead of literal characters', () => {
  const blocks = renderMarkdownBlocks('他说**不要**回头，然后*笑了*。')
  const spans = blocks[0].spans
  assert.deepEqual(spans.map((span) => [span.text, span.style]),
    [['他说', ''], ['不要', 'bold'], ['回头，然后', ''], ['笑了', 'italic'], ['。', '']])
})

test('bold is recognised before italic, so ** is never two italics', () => {
  const spans = renderMarkdownBlocks('**重点**')[0].spans
  assert.deepEqual(spans, [{ text: '重点', style: 'bold' }])
})

test('an unmatched asterisk stays literal text', () => {
  // A writer's stray asterisk is their own character; swallowing it would silently alter prose.
  const spans = renderMarkdownBlocks('五乘五等于 5*5')[0].spans
  assert.equal(spans.map((span) => span.text).join(''), '五乘五等于 5*5')
})

test('the preview never emits raw markup', () => {
  // The only input is the writer's own prose, but the preview must still not build elements from
  // it: texts are strings in the block list, never HTML.
  const blocks = renderMarkdownBlocks('<img src=x onerror=alert(1)>\n\n<script>bad()</script>')
  const texts = blocks.map((block) => block.spans.map((span) => span.text).join(''))
  assert.ok(texts.join('').includes('<img'), 'the markup is kept as TEXT')
  assert.ok(texts.join('').includes('<script>'), 'including the tag')
  // Every value is a plain string; nothing was parsed into a node type.
  assert.ok(blocks.every((block) => block.type === 'p' || block.type === 'h' || block.type === 'hr'))
})

test('an empty manuscript renders nothing rather than an empty heading', () => {
  assert.deepEqual(renderMarkdownBlocks(''), [])
  assert.deepEqual(renderMarkdownBlocks('\n\n\n'), [])
})

test('a horizontal rule is its own block', () => {
  const blocks = renderMarkdownBlocks('上文。\n\n---\n\n下文。')
  assert.deepEqual(blocks.map((block) => block.type), ['p', 'hr', 'p'])
})

// ---- the keyboard ----

/** Mount the editor with the callbacks a keystroke can reach, and a live caret. */
async function mountEditor(overrides = {}) {
  const { plugin, render, rerender } = loadClientForRender()
  const chapter = { id: 'c1', title: '第一章', level: 'chapter', status: 'writing', text: '雨夜很长。' }
  const props = {
    t, chapter, busy: false, suggestion: null, aiError: '',
    saveStatus: { status: 'saved', savedAt: 0, error: '' },
    onText: () => {}, onAskSelection: async () => {}, onContinue: async () => null,
    onAccept: () => {}, onReject: () => {}, onRetry: () => {}, onSaveNow: () => {},
    ...overrides,
  }
  let mounted = await render(plugin.__components.ChapterEditor, props)
  const helpers = {
    get tree() { return mounted.tree },
    area: () => findByClass(mounted.tree, 'st-editor'),
    /** A live textarea stand-in: the component reads selectionStart/End off the ref. */
    withCaret(node, value, start, end = start) {
      node.props.ref.current = {
        value, selectionStart: start, selectionEnd: end,
        setSelectionRange: (a, b) => { node.props.ref.current.selectionStart = a; node.props.ref.current.selectionEnd = b },
        focus: () => {},
      }
      return node
    },
    rerender: async () => { mounted = await rerender(plugin.__components.ChapterEditor, props); return mounted.tree },
  }
  return helpers
}

const key = (name, extra = {}) => ({ key: name, preventDefault: () => {}, ...extra })

test('Cmd+S saves immediately instead of waiting for the interval', async () => {
  let saved = 0
  const editor = await mountEditor({ onSaveNow: () => { saved += 1 } })
  await editor.area().props.onKeyDown(key('s', { metaKey: true }))
  assert.equal(saved, 1, 'Cmd+S writes now')
  await editor.area().props.onKeyDown(key('s', { ctrlKey: true }))
  assert.equal(saved, 2, 'and Ctrl+S does the same on Windows and Linux')
})

test('Cmd+Z undoes and Shift+Cmd+Z redoes, through the editor own history', async () => {
  const written = []
  const editor = await mountEditor({ onText: (text) => written.push(text) })
  // Type, the way the browser delivers a keystroke: onChange, then a re-render.
  const area = editor.withCaret(editor.area(), '雨夜很长。', 5)
  area.props.onChange({ target: { value: '雨夜很长，风也大。', selectionStart: 8 } })
  await editor.rerender()

  await editor.area().props.onKeyDown(key('z', { metaKey: true }))
  assert.equal(written[written.length - 1], '雨夜很长。', 'undo restores the text before the edit')
  await editor.area().props.onKeyDown(key('z', { metaKey: true, shiftKey: true }))
  assert.equal(written[written.length - 1], '雨夜很长，风也大。', 'redo puts it back')
})

test('Cmd+Y also redoes, the other convention', async () => {
  const written = []
  const editor = await mountEditor({ onText: (text) => written.push(text) })
  const area = editor.withCaret(editor.area(), '雨夜很长。', 5)
  area.props.onChange({ target: { value: '雨夜很长。', selectionStart: 5 } })
  // A no-op edit records nothing, so make a real one.
  area.props.onChange({ target: { value: '雨夜很长，风也大。', selectionStart: 8 } })
  await editor.rerender()
  await editor.area().props.onKeyDown(key('z', { ctrlKey: true }))
  await editor.area().props.onKeyDown(key('y', { ctrlKey: true }))
  assert.equal(written[written.length - 1], '雨夜很长，风也大。')
})

test('Cmd+Enter accepts the open proposal, of either kind', async () => {
  const accepted = []
  for (const suggestion of [
    { id: 's1', kind: 'rewrite', baseText: '正文', proposedText: '改后正文', chapterId: 'c1' },
    { id: 'c1', kind: 'continue', at: 2, baseText: '', proposedText: '风吹过来。', chapterId: 'c1' },
  ]) {
    accepted.length = 0
    const written = []
    const editor = await mountEditor({
      suggestion, onText: (text) => written.push(text), onAccept: (id) => accepted.push(id),
    })
    await editor.area().props.onKeyDown(key('Enter', { metaKey: true }))
    assert.equal(accepted.length, 1, `${suggestion.kind}: Cmd+Enter accepts it`)
    assert.equal(accepted[0], suggestion.id)
    assert.equal(written.length, 1, `${suggestion.kind}: and the text is written once`)
  }
})

test('a continuation is inserted at the caret, not at the end of the chapter', async () => {
  // The bug this fixes: asking to continue from the middle of a paragraph appended the new
  // sentence to the end of the chapter instead.
  const written = []
  const editor = await mountEditor({
    suggestion: { id: 'c1', kind: 'continue', at: 2, baseText: '', proposedText: '风很大。', chapterId: 'c1' },
    onText: (text) => written.push(text),
  })
  await editor.area().props.onKeyDown(key('Enter', { metaKey: true }))
  assert.equal(written[0], '雨夜风很大。很长。', 'inserted at the caret, splitting the sentence')
})

test('a rewrite still replaces its range', async () => {
  const written = []
  const editor = await mountEditor({
    suggestion: { id: 's1', kind: 'rewrite', baseText: '很长', proposedText: '很短', chapterId: 'c1' },
    onText: (text) => written.push(text),
  })
  const area = editor.withCaret(editor.area(), '雨夜很长。', 2, 4)
  area.props.onMouseUp()
  await editor.rerender()
  await editor.area().props.onKeyDown(key('Enter', { metaKey: true }))
  assert.equal(written[0], '雨夜很短。', 'the selected range is substituted')
})

test('a bare Enter takes a continuation but must not take a rewrite', async () => {
  // Enter is how the writer starts a new paragraph. It only means "accept" while a continuation
  // is open, and a rewrite needs the explicit chord because Enter is not its natural gesture.
  const accepted = []
  const continuation = await mountEditor({
    suggestion: { id: 'c1', kind: 'continue', at: 5, baseText: '', proposedText: '风。', chapterId: 'c1' },
    onAccept: (id) => accepted.push(id),
  })
  await continuation.area().props.onKeyDown(key('Enter'))
  assert.deepEqual(accepted, ['c1'], 'a bare Enter accepts a continuation')

  accepted.length = 0
  const rewrite = await mountEditor({
    suggestion: { id: 's1', kind: 'rewrite', baseText: '正文', proposedText: '改后', chapterId: 'c1' },
    onAccept: (id) => accepted.push(id),
  })
  await rewrite.area().props.onKeyDown(key('Enter'))
  assert.deepEqual(accepted, [], 'a bare Enter does not accept a rewrite')
})

test('an IME composition still swallows none of these chords', async () => {
  // The guard has to cover the new shortcuts too, or Enter to confirm a candidate accepts a
  // suggestion and Cmd+Z would undo mid-composition.
  let saved = 0
  const accepted = []
  const editor = await mountEditor({
    onSaveNow: () => { saved += 1 },
    suggestion: { id: 'c1', kind: 'continue', at: 5, baseText: '', proposedText: '风。', chapterId: 'c1' },
    onAccept: (id) => accepted.push(id),
  })
  for (const event of [
    { key: 's', metaKey: true, isComposing: true },
    { key: 'Enter', metaKey: true, nativeEvent: { isComposing: true } },
    { key: 'Enter', keyCode: 229 },
  ]) {
    await editor.area().props.onKeyDown(key(event.key, event))
  }
  assert.equal(saved, 0, 'Cmd+S during composition does not save')
  assert.deepEqual(accepted, [], 'nor does anything accept the open suggestion')
})

test('Escape collapses the dock and the hairline brings the result back', async () => {
  // Escape used to DESTROY the proposal; now it only closes the box. The result stays behind the
  // hairline, and clicking the line re-expands the SAME answer — dismissing must not discard.
  const rejected = []
  const editor = await mountEditor({
    suggestion: { id: 's1', kind: 'rewrite', baseText: '正文', proposedText: '改后', chapterId: 'c1' },
    onReject: (id) => rejected.push(id),
  })
  await editor.area().props.onKeyDown(key('Escape'))
  const collapsed = await editor.rerender()
  assert.deepEqual(rejected, [], 'the proposal survives the Escape')
  // Collapsed to the hairline, which names what is kept.
  const line = findByClass(collapsed, 'st-hairline')
  assert.ok(line, 'the dock is the hairline now')
  assert.equal(line.props['data-state'], 'kept', 'and it holds a kept result')
  // Clicking re-expands: the same dock, the same text.
  line.props.onClick()
  const reopened = await editor.rerender()
  assert.ok(findByClass(reopened, 'st-ai-dock'), 'the box is back')
  assert.ok(visibleText(findByClass(reopened, 'st-ai-dock')).join(' ').includes('改后'), 'with the same result')
})

test('the suggestion sits under the page in flow, not over the text', async () => {
  // An absolutely positioned card covered the paragraph being edited. The dock is a normal block
  // after the editor, so the manuscript is never obscured and never pushed out of reach.
  const editor = await mountEditor({
    suggestion: { id: 'c1', kind: 'continue', at: 5, baseText: '', proposedText: '风。', chapterId: 'c1' },
  })
  const dock = findByClass(editor.tree, 'st-ai-dock')
  assert.ok(dock, 'the dock renders')
  assert.equal(dock.props.style, undefined, 'no inline position: it is laid out in flow')
  assert.ok(visibleText(dock).join(' ').includes('风。'), 'and the suggestion is in it')
  // The editor itself is still mounted underneath, which is what makes every other action usable.
  assert.ok(findByClass(editor.tree, 'st-editor-over'), 'the textarea is still there')
})

test('the diff helper still separates added and removed runs', () => {
  // Guarded here because the card depends on it and this file is where the card is exercised.
  const segments = diffWords('原文', '改后正文')
  assert.ok(segments.some((segment) => segment.type === 'del'))
  assert.ok(segments.some((segment) => segment.type === 'add'))
})
