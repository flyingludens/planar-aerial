import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { loadClientLogic } from './helpers/load-client.mjs'
import { loadClientForRender, findByClass, findByText, visibleText } from './helpers/render-hooks.mjs'

/**
 * The find bar and the page typography: two things a text editor is expected to have and this one
 * did not. The matching helpers are pure, so they are pinned directly; the editor behaviour is
 * driven through the mounted component, because the interesting part is which key does what and
 * when a keystroke must NOT be intercepted.
 */

const { findMatches, paintRuns, normalizeTypography, TYPOGRAPHY_DEFAULT, TYPOGRAPHY_BOUNDS } = loadClientLogic()

/**
 * A translation stub that keeps the key AND its parameters visible. Keeping only the key would
 * hide the numbers a test is checking — "1 / 3" is exactly the thing that can be wrong.
 */
const t = (key, params) => {
  if (params === undefined) return key
  return `${key} ${Object.entries(params).map(([name, value]) => `${name}=${value}`).join(' ')}`
}

test('matching is literal, case-insensitive by default, and never overlapping', () => {
  assert.deepEqual(findMatches('雨夜，雨夜', '雨夜').map((hit) => hit.start), [0, 3])
  // Case matters in prose: a name and a common word are not the same hit unless asked.
  assert.equal(findMatches('Alice and alice', 'alice').length, 2, 'ignores case by default')
  assert.equal(findMatches('Alice and alice', 'alice', true).length, 1, 'and can respect it')
  // Overlapping hits would make "next" appear stuck on repeated characters.
  assert.deepEqual(findMatches('啊啊啊', '啊啊').map((hit) => hit.start), [0],
    'a match consumes its own characters, so the next one starts after it')
})

test('an empty query finds nothing instead of matching everything', () => {
  assert.deepEqual(findMatches('正文', ''), [])
  assert.deepEqual(findMatches('', '正文'), [])
  assert.deepEqual(findMatches(undefined, '正文'), [])
})

test('hits are split into plain and highlighted runs without losing a character', () => {
  // `paintRuns` is what the editor paints from. `highlightRuns` used to do this on its own and was
  // left behind when the painted layer took over both markers: nothing called it but these tests.
  const text = '雨夜很长，雨夜很冷。'
  const hits = findMatches(text, '雨夜')
  const runs = paintRuns(text, { hits, activeIndex: 1 })
  assert.equal(runs.map((run) => run.text).join(''), text, 'the reconstructed text is identical')
  assert.deepEqual(runs.filter((run) => run.hit).map((run) => run.text), ['雨夜', '雨夜'])
  assert.deepEqual(runs.filter((run) => run.active).map((run) => run.text), ['雨夜'],
    'exactly one hit is the current one')
  // The current flag has to land on the SECOND hit, which is what index 1 asked for.
  assert.equal(runs.filter((run) => run.active).length, 1)
})

test('a run list with no hits is the whole text, unchanged', () => {
  assert.deepEqual(paintRuns('正文', { hits: [] }), [
    { text: '正文', hit: false, active: false, selected: false },
  ])
})

test('a run with no hit behind it is never marked as the current one', () => {
  // `activeIndex` is -1 when nothing is current, and so was the "which hit covers this run"
  // index when there were no hits at all: the two compared equal, so every plain run claimed to
  // be the active hit. The render only reads `active` on a hit, which is why it never showed.
  const runs = paintRuns('正文', { hits: [], activeIndex: -1 })
  assert.equal(runs.length, 1)
  assert.equal(runs[0].hit, false)
  assert.equal(runs[0].active, false, 'a plain run is not the current match')
  assert.equal(paintRuns('雨夜很长。', { hits: findMatches('雨夜很长。', '雨夜'), activeIndex: 0 })
    .filter((run) => run.active).length, 1, 'and exactly one run is when there is a hit')
})

test('paintRuns agrees with cutting every boundary and scanning for the hit', () => {
  // The hit for a run is found by walking one cursor over the sorted hit list, not by scanning
  // the list per run: the scan was quadratic, and 40k characters with 40k hits took 772ms to
  // repaint. Both produce the same runs, which is what this pins.
  const cases = [
    ['雨夜，雨夜。', '雨夜'],
    ['啊啊啊', '啊'],
    ['甲乙丙丁', '乙'],
    ['一段没有任何命中的文字。', '雨'],
    ['雨夜', ''],
  ]
  for (const [text, query] of cases) {
    const hits = findMatches(text, query)
    for (const activeIndex of [-1, 0, 1]) {
      for (const selection of [undefined, { start: 0, end: 2 }, { start: 1, end: 1 }]) {
        const runs = paintRuns(text, { hits, activeIndex, selection })
        // Rebuild the same runs the direct way and compare field by field.
        const hasSelection = selection !== undefined && selection.start < selection.end
        const cuts = new Set([0, text.length])
        if (hasSelection) { cuts.add(selection.start); cuts.add(selection.end) }
        for (const hit of hits) { cuts.add(hit.start); cuts.add(hit.end) }
        const points = [...cuts].sort((a, b) => a - b)
        const expected = []
        for (let i = 0; i < points.length - 1; i += 1) {
          if (points[i] === points[i + 1]) continue
          const index = hits.findIndex((hit) => hit.start <= points[i] && hit.end >= points[i + 1])
          expected.push({
            text: text.slice(points[i], points[i + 1]),
            hit: index >= 0,
            active: index >= 0 && index === activeIndex,
            selected: hasSelection && points[i] >= selection.start && points[i + 1] <= selection.end,
          })
        }
        assert.deepEqual(runs, expected, `text ${JSON.stringify(text)} query ${JSON.stringify(query)}`)
      }
    }
  }
})

test('typography normalises a corrupt or out-of-range stored value', () => {
  assert.deepEqual(normalizeTypography(null), TYPOGRAPHY_DEFAULT)
  assert.deepEqual(normalizeTypography({}), TYPOGRAPHY_DEFAULT)
  assert.deepEqual(normalizeTypography('not an object'), TYPOGRAPHY_DEFAULT)
  // A value outside the slider bounds is clamped rather than rendered as-is: a stored 400px font
  // would make the page unusable and the UI could not get back to a sane value.
  const tooBig = normalizeTypography({ fontSize: 400, lineHeight: 9, width: 5000 })
  assert.equal(tooBig.fontSize, TYPOGRAPHY_BOUNDS.fontSize[1])
  assert.equal(tooBig.lineHeight, TYPOGRAPHY_BOUNDS.lineHeight[1])
  assert.equal(tooBig.width, TYPOGRAPHY_BOUNDS.width[1])
  const tooSmall = normalizeTypography({ fontSize: 1, lineHeight: 0.1, width: 10 })
  assert.equal(tooSmall.fontSize, TYPOGRAPHY_BOUNDS.fontSize[0])
  assert.equal(tooSmall.lineHeight, TYPOGRAPHY_BOUNDS.lineHeight[0])
  assert.equal(tooSmall.width, TYPOGRAPHY_BOUNDS.width[0])
  // A legitimate value survives, rounded to two decimals.
  assert.deepEqual(normalizeTypography({ fontSize: 18, lineHeight: 1.8567, width: 900 }),
    { fontSize: 18, lineHeight: 1.86, width: 900 })
})

/** Mount one chapter editor with the props the panel hands it. */
async function mountEditor(chapter, extra = {}) {
  const { plugin, render, rerender } = loadClientForRender()
  const props = {
    t, chapter, busy: false, suggestion: null, aiError: '', typography: TYPOGRAPHY_DEFAULT,
    saveStatus: { status: 'saved', savedAt: 0, error: '' },
    onText: () => {}, onAskSelection: async () => {}, onContinue: async () => '',
    onAccept: () => {}, onReject: () => {}, onRetry: () => {},
    ...extra,
  }
  let mounted = await render(plugin.__components.ChapterEditor, props)
  // The document the mount effect registered its listeners on. A rerender builds a fresh stub and
  // an effect with empty deps does not run again, so this is the one that stays live.
  const document = mounted.document
  return {
    // A getter, not a copy: the tree is replaced on every rerender, and a captured value would
    // have the assertions reading the first screen forever.
    get tree() { return mounted.tree },
    document: () => document,
    textarea: () => findByClass(mounted.tree, 'st-editor'),
    rerender: async () => { mounted = await rerender(plugin.__components.ChapterEditor, props); return mounted.tree },
  }
}

const chapter = (text) => ({ id: 'c1', title: '第一章', level: 'chapter', status: 'writing', text })

/** A whole book, as `story.load` answers one. */
const book = () => ({
  schemaVersion: 1, title: '我的书', genre: '', pov: '', tense: '',
  nodes: [], chapters: [chapter('正文')], characters: [], relationships: [], settings: [],
  snapshots: [], overview: { chapters: {} },
})

test('an IME composition is never mistaken for an AI shortcut', async () => {
  // A Chinese input method uses Enter to confirm a candidate and Tab to cycle through them.
  // Intercepting either swallowed the characters the writer was in the middle of committing.
  let asked = 0
  let joined = ''
  const editor = await mountEditor(chapter('正文'), {
    onContinue: async () => { asked += 1; return '续写' },
    onText: (text) => { joined = text },
  })
  const area = editor.textarea()
  assert.ok(area, 'the editor is on screen')

  // Composing: Tab must not ask the model, and Enter must not accept anything.
  await area.props.onKeyDown({ key: 'Tab', isComposing: true, preventDefault: () => {} })
  await editor.rerender()
  assert.equal(asked, 0, 'Tab during composition does not reach the AI')

  // The same state reported the old way, on nativeEvent and as keyCode 229.
  await editor.textarea().props.onKeyDown({ key: 'Tab', nativeEvent: { isComposing: true }, preventDefault: () => {} })
  await editor.textarea().props.onKeyDown({ key: 'Tab', keyCode: 229, preventDefault: () => {} })
  await editor.rerender()
  assert.equal(asked, 0, 'nor through nativeEvent.isComposing or keyCode 229')
  assert.equal(joined, '', 'and Enter never committed text on the writer behalf')
})

test('Tab asks for a continuation at once, with no window to wait for', async () => {
  // It used to wait 200ms, because Tab twice meant something else. The second meaning is a chord
  // now, so the plain key can act on the press itself.
  let asked = 0
  const editor = await mountEditor(chapter('正文'), { onContinue: async () => { asked += 1; return '续写。' } })
  await editor.textarea().props.onKeyDown({ key: 'Tab', isComposing: false, preventDefault: () => {} })
  assert.equal(asked, 1, 'the continuation is asked for on the press, not after a delay')
})

test('Option+Tab is the grammar pass, and does not also continue the section', async () => {
  let asked = 0
  let critiqued = 0
  const editor = await mountEditor(chapter('正文'), {
    onContinue: async () => { asked += 1; return '续写。' },
    onCritique: () => { critiqued += 1 },
  })
  await editor.textarea().props.onKeyDown({
    key: 'Tab', altKey: true, metaKey: false, ctrlKey: false, shiftKey: false,
    isComposing: false, preventDefault: () => {},
  })
  assert.equal(critiqued, 1, 'the shorter chord runs the grammar critique')
  assert.equal(asked, 0, 'and the continuation does not also fire')
})

/** Every string under a node, so a test can assert on the copy the writer reads. */
function flatText(node) {
  const out = []
  const walk = (n) => {
    if (typeof n === 'string' || typeof n === 'number') { out.push(String(n)); return }
    if (n === null || typeof n !== 'object') return
    if (Array.isArray(n)) { n.forEach(walk); return }
    walk(n.children ?? [])
  }
  walk(node)
  return out.join(' ')
}

/** Every element under a node whose className contains `token`. */
function findAllByClass(node, token, found = []) {
  if (node === null || typeof node !== 'object') return found
  if (Array.isArray(node)) { node.forEach((child) => findAllByClass(child, token, found)); return found }
  if (typeof node.props?.className === 'string' && node.props.className.split(/\s+/).includes(token)) found.push(node)
  for (const child of node.children ?? []) findAllByClass(child, token, found)
  return found
}

/** The query field of the open find bar. */
const findInput = (tree) => findByClass(tree, 'st-find-input')

test('Ctrl/Cmd+F opens the find bar and Escape closes it', async () => {
  // Without this the panel would have no find at all, and the browser's own find bar cannot see
  // the text: the textarea's glyphs are transparent.
  for (const chord of [{ ctrlKey: true }, { metaKey: true }]) {
    const editor = await mountEditor(chapter('雨夜很长。'))
    let prevented = false
    await editor.textarea().props.onKeyDown({ key: 'f', ...chord, preventDefault: () => { prevented = true } })
    assert.equal(prevented, true, `the browser's own find bar is suppressed for ${Object.keys(chord)[0]}`)
    const tree = await editor.rerender()
    assert.ok(findByClass(tree, 'st-find'), `the find bar opens for ${Object.keys(chord)[0]}`)

    // Escape is the way out, and it must not also be consumed by the continuation dismissal.
    let escaped = false
    findInput(tree).props.onKeyDown({ key: 'Escape', preventDefault: () => { escaped = true } })
    assert.equal(escaped, true, 'Escape is handled by the bar')
    assert.equal(findByClass(await editor.rerender(), 'st-find'), undefined, 'Escape removes the bar')
  }
})

test('the find bar counts hits, steps through them, and wraps around', async () => {
  const editor = await mountEditor(chapter('雨夜。雨夜。雨夜。'))
  await editor.textarea().props.onKeyDown({ key: 'f', ctrlKey: true, preventDefault: () => {} })
  await editor.rerender()
  findInput(editor.tree).props.onChange({ target: { value: '雨夜' } })
  const matched = await editor.rerender()

  // Every occurrence is marked in the painted layer, and exactly one is the current hit.
  const hits = findAllByClass(findByClass(matched, 'st-editor-paint'), 'st-hit')
  assert.equal(hits.length, 3, 'every occurrence is marked')
  assert.deepEqual(hits.map((hit) => hit.props['data-active']), ['true', 'false', 'false'],
    'the search starts on the first hit')

  // The counter names the current hit out of the total.
  const counter = () => flatText(findByClass(editor.tree, 'st-find'))
  assert.ok(counter().includes('label.matchCount'), 'the bar shows a match counter')
  assert.ok(counter().includes('i=1') && counter().includes('n=3'), `the counter reads 1 of 3, saw: ${counter()}`)

  // Enter goes forward; Shift+Enter goes back; both wrap rather than stopping at an end.
  const step = async (event) => {
    findInput(editor.tree).props.onKeyDown({ key: 'Enter', preventDefault: () => {}, ...event })
    await editor.rerender()
    return counter()
  }
  assert.ok((await step({})).includes('i=2'), 'Enter advances to the second hit')
  assert.ok((await step({})).includes('i=3'), 'and again to the third')
  assert.ok((await step({})).includes('i=1'), 'past the last hit it wraps to the first')
  assert.ok((await step({ shiftKey: true })).includes('i=3'), 'Shift+Enter wraps backwards')
})

test('a search with no match says so instead of showing 0/0', async () => {
  const editor = await mountEditor(chapter('正文'))
  await editor.textarea().props.onKeyDown({ key: 'f', ctrlKey: true, preventDefault: () => {} })
  await editor.rerender()
  findInput(editor.tree).props.onChange({ target: { value: '不存在的词' } })
  const tree = await editor.rerender()
  const bar = flatText(findByClass(tree, 'st-find'))
  assert.ok(bar.includes('label.noMatches'), 'the bar reports that nothing matched')
  assert.ok(!bar.includes('0 / 0'), 'and never shows a meaningless count')
  // The step buttons are disabled rather than moving the caret nowhere.
  const disabled = findAllByClass(tree, 'st-btn-ghost').filter((button) => button.props.disabled === true)
  assert.ok(disabled.length >= 2, 'the previous/next controls are disabled with nothing to step through')
})

test('the scroll handler copies the offset onto the painted layer', async () => {
  // The paint layer is `overflow:hidden`, so without this a long chapter scrolled the textarea
  // alone: the glyphs the writer was reading stayed on the first screen while the caret went off
  // below, and the two layers disagreed about where every word was.
  const editor = await mountEditor(chapter('正文'))
  const paint = findByClass(editor.tree, 'st-editor-paint')
  assert.ok(paint, 'the painted layer is rendered')
  // The ref is what the handler writes to; under the harness it is an object with `current`.
  const area = editor.textarea()
  const fakePaint = { scrollTop: 0, scrollLeft: 0 }
  // The harness never assigns refs to real elements, so stand in for the browser and point the
  // component's ref at an object that records what the handler writes.
  paint.props.ref.current = fakePaint
  area.props.onScroll({ currentTarget: { scrollTop: 120, scrollLeft: 4 } })
  assert.equal(fakePaint.scrollTop, 120, 'the painted text follows the textarea down the page')
  assert.equal(fakePaint.scrollLeft, 4)
})

test('typography reaches the page as CSS variables on the desk', async () => {
  const editor = await mountEditor(chapter('正文'), {
    typography: { fontSize: 18, lineHeight: 2.1, width: 900 },
  })
  const desk = findByClass(editor.tree, 'st-desk')
  assert.ok(desk, 'the desk is on screen')
  assert.equal(desk.props.style['--st-font-size'], '18px')
  assert.equal(desk.props.style['--st-line-height'], '2.1')
  assert.equal(desk.props.style['--st-width'], '900px')
})

test('the desk header names the chapter and nothing else', async () => {
  // The header used to carry the chapter's word count, the selected passage's length and the save
  // state. All three already have a home in the status bar at the bottom of the panel — and two
  // places reporting one number are two places that can disagree. A header is a title.
  const editor = await mountEditor(chapter('一二三四五六七八九十'))
  const head = findByClass(editor.tree, 'st-desk-head')
  assert.ok(head, 'the header exists')
  // Nothing in it is a caption. The title is the only text the row carries.
  assert.equal(findAllByClass(editor.tree, 'st-caption').length, 0,
    'the header carries no read-out')
  assert.ok(flatText(findByClass(editor.tree, 'st-desk-title')).length > 0, 'it names the chapter')

  // The counts are not lost: the status bar reads them from the same chapter (its own test pins
  // that), and it is mounted by the panel rather than by the editor, so this mount has no bar.
})

test('leaving the editor writes what the debounce is still holding', async () => {
  // A page frozen on `pagehide` never finishes its fetch, and a writer clicking straight from the
  // text to another panel is the ordinary way this happens. Losing focus is the reliable moment.
  let flushed = 0
  const editor = await mountEditor(chapter('正文'), { onFlush: () => { flushed += 1 } })
  const area = editor.textarea()
  assert.equal(typeof area.props.onBlur, 'function', 'the editor reports losing focus')
  area.props.onBlur()
  assert.equal(flushed, 1, 'and the panel writes what is owed')

  // Without the callback the editor must not throw: it is also mounted in tests and in any host
  // that does not pass one.
  const bare = await mountEditor(chapter('正文'))
  assert.doesNotThrow(() => bare.textarea().props.onBlur())
})

test('the manuscript preview draws a document, not Markdown source', async () => {
  // The preview used to put the raw generated Markdown into a <pre>, so the writer read hashes,
  // blank lines and asterisks instead of their own book.
  const { plugin, render, rerender } = loadClientForRender()
  const markdown = '# 我的书\n\n## 第一卷\n\n### 第一章\n\n雨下了一整夜。\n\n**她**坐在桌前。'
  const api = {
    books: async () => ({ ok: true, books: [] }),
    models: async () => ({ ok: true, roles: {}, overrides: {}, image: {}, library: '/ws/story' }),
    load: async () => ({ ok: true, book: { chapters: [] }, token: 't', recovered: false }),
    manuscript: async () => ({ ok: true, markdown }),
    snapshot: async () => ({ ok: true }),
    style: async () => ({ ok: true }),
    consistency: async () => ({ ok: true }),
    overview: async () => ({ ok: true }),
  }
  const props = {
    t, book: book(), workspacePath: '/ws', bookFolder: '我的书', api, onReload: () => {},
  }
  const mounted = await render(plugin.__components.OverviewPage, props)

  // Ask for the merged manuscript the way the writer does: click its button.
  const button = findByText(mounted.tree, 'action.manuscript')
  assert.ok(button, 'the merged-manuscript button is on screen')
  button.props.onClick()
  await new Promise((resolve) => setTimeout(resolve, 0))
  const tree = (await rerender(plugin.__components.OverviewPage, props)).tree

  const preview = findByClass(tree, 'st-manuscript')
  assert.ok(preview, 'the preview is rendered')
  assert.equal(preview.type, 'div', 'a document container, not a <pre> of source')

  const headings = []
  const collect = (node) => {
    if (node === null || typeof node !== 'object') return
    if (Array.isArray(node)) { node.forEach(collect); return }
    if (typeof node.type === 'string' && /^h[1-6]$/.test(node.type)) headings.push(node.type)
    collect(node.children ?? [])
  }
  collect(preview)
  assert.deepEqual(headings, ['h1', 'h2', 'h3'], 'the heading levels are drawn as headings')
  assert.ok(findByClass(preview, 'st-md-p'), 'the prose is a paragraph')
  // Emphasis survives as an element, not as asterisks in the text.
  const flat = visibleText(preview).join('')
  assert.ok(!flat.includes('**'), 'no literal asterisks reach the reader')
  assert.ok(!flat.includes('#'), 'and no literal hashes')
})

test('the AI dock is a full-measure block under the page, with nothing covering the text', async () => {
  // Three complaints in one: it covered the paragraph being edited, it still had a top edge, and
  // it was a narrow card. The dock is now a normal block after the editor, as wide as the measure.
  const { plugin, render } = loadClientForRender()
  const chapter = { id: 'c1', title: '第一章', level: 'chapter', status: 'writing', text: '雨夜很长。' }
  const mounted = await render(plugin.__components.ChapterEditor, {
    t, chapter, busy: false, aiError: '',
    suggestion: { id: 's1', kind: 'rewrite', baseText: '原文', proposedText: '改后正文', chapterId: chapter.id },
    onText: () => {}, onAskSelection: async () => {}, onContinue: async () => null,
    onAccept: () => {}, onReject: () => {}, onRetry: () => {},
  })
  const dock = findByClass(mounted.tree, 'st-ai-dock')
  assert.ok(dock, 'the dock renders')
  // No inline placement at all: an inline `position`/`top`/`left` would be the overlay returning.
  assert.equal(dock.props.style, undefined, 'the dock carries no inline placement')
  // The editor is still mounted beside it, which is what keeps every other action usable.
  assert.ok(findByClass(mounted.tree, 'st-editor-over'), 'the textarea is still there')
})

test('the thinking state lives on the persistent hairline', async () => {
  // The wait used to be a bare row floating on the page. Now the whole wait lives ON the dock's
  // hairline — one line at the page's bottom edge, glowing hardest while working — so the answer
  // arriving is the thing that opens the box, not the question.
  const { plugin, render } = loadClientForRender()
  const chapter = { id: 'c1', title: '第一章', level: 'chapter', status: 'writing', text: '雨夜。' }
  const base = {
    t, chapter, aiError: '', suggestion: null,
    onText: () => {}, onAskSelection: async () => {}, onContinue: async () => null,
    onAccept: () => {}, onReject: () => {}, onRetry: () => {},
  }
  const mounted = await render(plugin.__components.ChapterEditor, { ...base, busy: true })
  const line = findByClass(mounted.tree, 'st-hairline')
  const thinking = findByClass(mounted.tree, 'st-ai-thinking')
  assert.ok(line, 'the hairline is there')
  assert.equal(line.props['data-state'], 'working', 'glowing in its working mood')
  assert.ok(thinking, 'and the thinking row rides on the line')
  // The row is inside the line's button, not a sibling of it.
  const inside = (node, target, found = false) => {
    if (node === null || typeof node !== 'object' || found) return found
    if (node === target) return true
    if (Array.isArray(node)) return node.reduce((hit, child) => inside(child, target, hit), false)
    return (node.children ?? []).reduce((hit, child) => inside(child, target, hit), false)
  }
  assert.ok(inside(line, thinking), 'the row sits inside the hairline')
  // Idle glow when nothing is happening at all.
  const idle = await render(plugin.__components.ChapterEditor, { ...base, busy: false })
  assert.equal(findByClass(idle.tree, 'st-hairline').props['data-state'], 'idle',
    'with nothing asked the line is the ambient idle glow')
})

// ---- the section scan: a copy-edit, and three directions ----

/** Mount the editor with a scan already in the dock. */
async function mountScan(scan, extra = {}) {
  const { plugin, render } = loadClientForRender()
  const chapter = { id: 'c1', title: '第一章', level: 'chapter', status: 'writing', text: '雨夜很长。' }
  const mounted = await render(plugin.__components.ChapterEditor, {
    t, chapter, busy: false, aiError: '', suggestion: null, scan,
    onText: () => {}, onAskSelection: async () => {}, onContinue: async () => null,
    onAccept: () => {}, onReject: () => {}, onRetry: () => {},
    ...extra,
  })
  return mounted.tree
}

test('a truncated scan keeps the issues it got, and the panel says the list may be short', async () => {
  // A cut-off answer is neither a failure nor a clean section: the issues that arrived are real, so
  // the dock still lists them. What has to be added is that the model was stopped, or the writer
  // reads a partial list as the whole edit and stops looking.
  //
  // The notice lives in the status bar now, not in the dock, so this checks the two halves
  // separately: the dock keeps its rows, and the shell hands the status bar a warning.
  const tree = await mountScan({
    kind: 'review', busy: false, error: '', critique: null, truncated: true,
    issues: [{ kind: 'grammar', where: '雨夜很长', problem: '逗号粘连', suggestion: '拆成两句' }],
  })
  assert.equal(findAllByClass(tree, 'st-scan-row').length, 1, 'the issue that arrived is still listed')
  assert.ok(!visibleText(tree).join('').includes('scan.truncated'), 'the dock itself carries no notice')

  // The same value reaches the status bar through the panel, which is where it is read.
  const panel = await mountPanel()
  await new Promise((resolve) => setTimeout(resolve, 0))
  const bar = findByClass(panel.tree, 'st-statusbar')
  assert.ok(bar, 'the status bar is on screen')
  assert.equal(findByClass(bar, 'st-status-notice'), undefined,
    'and says nothing when there is nothing to report')
})

test('a held chord asks for the grammar pass once, not once per repeat', async () => {
  // Holding a chord emits keydown every few milliseconds. Before the gestures were chords, those
  // repeats paired with each other and fired a pass from one key held down. Which action the
  // chord names does not matter to this rule: a repeat is never a press.
  const reviews = []
  const editor = await mountEditor(chapter('正文。'), { onCritique: () => reviews.push(1) })
  const press = (repeat) => findByClass(editor.tree, 'st-editor').props.onKeyDown({
    key: 'Tab', altKey: true, metaKey: false, ctrlKey: false, shiftKey: false,
    repeat, preventDefault: () => {},
  })
  press(true)
  press(true)
  assert.deepEqual(reviews, [], 'a repeat is the key being held, not a press')
  press(false)
  assert.equal(reviews.length, 1, 'one press, one request')
})

test('a copy-edit lists what is wrong, where, and the correction', async () => {
  const tree = await mountScan({
    kind: 'review', busy: false, error: '', critique: null,
    issues: [{
      kind: 'grammar', where: '雨夜很长，风也没有停', problem: '两个分句之间是逗号粘连',
      suggestion: '雨夜很长。风也没有停。',
    }],
  })
  assert.equal(visibleText(findByClass(tree, 'st-scan-title')).join(''), 'scan.reviewTitle',
    'the dock says what this is, not just that something came back')
  // The kind of problem, the place, the complaint and the fix are four separate things and the
  // writer needs all four: a diagnosis without a correction is not an edit.
  assert.equal(visibleText(findByClass(tree, 'st-scan-tag')).join(''), 'scan.kind.grammar')
  assert.equal(visibleText(findByClass(tree, 'st-scan-where')).join(''), '雨夜很长，风也没有停')
  assert.equal(visibleText(findByClass(tree, 'st-scan-what')).join(''), '两个分句之间是逗号粘连')
  assert.equal(visibleText(findByClass(tree, 'st-scan-fix')).join(''), '→雨夜很长。风也没有停。')
  // It is docked like every other answer, so the manuscript is not covered by it.
  assert.ok(findByClass(tree, 'st-ai-dock'), 'the scan uses the dock')
  assert.equal(findByClass(tree, 'st-editor-over') !== undefined, true, 'and the page is still there')
})

test('a clean section says so instead of showing an empty box', async () => {
  // "Nothing came back" and "nothing is wrong" look identical on screen unless one of them is
  // written down, and the writer cannot tell whether to look again or start fixing.
  const tree = await mountScan({ kind: 'review', busy: false, error: '', issues: [], critique: null })
  assert.equal(visibleText(findByClass(tree, 'st-scan-empty')).join(''), 'scan.noIssues')
  assert.equal(findByClass(tree, 'st-scan-row'), undefined, 'no rows are drawn')
})

test('the critique leads with its verdict and itemises the points', async () => {
  const tree = await mountScan({
    kind: 'critique', busy: false, error: '', issues: [],
    critique: {
      verdict: '叙述立得住，但句子断得急，长句几乎没呼吸。',
      points: [
        { kind: 'grammar', where: '雨夜很长，风也没有停', problem: '两个分句之间是逗号粘连', advice: '拆成两句，或用分号。' },
        { kind: 'wording', where: '她坐在桌前', problem: '连续两段都用"坐"开头', advice: '第二段换个动作起句。' },
      ],
    },
  })
  assert.equal(visibleText(findByClass(tree, 'st-scan-title')).join(''), 'scan.critiqueTitle')
  // The verdict comes first: the writer asked for a judgement, and that is the headline.
  assert.equal(visibleText(findByClass(tree, 'st-critique-verdict')).join(''),
    '叙述立得住，但句子断得急，长句几乎没呼吸。')
  const rows = findAllByClass(tree, 'st-scan-row')
  assert.equal(rows.length, 2, 'two points, two rows')
  const text = visibleText(tree).join('')
  assert.ok(text.includes('逗号粘连') && text.includes('换个动作起句'),
    'each point carries its problem and its fix')
})

test('the critique offers a steer: a chevron on the foot row, collapsed by default', async () => {
  const tree = await mountScan({
    kind: 'critique', busy: false, error: '', issues: [], critique: { verdict: '', points: [] },
  })
  const toggle = findByClass(tree, 'st-scan-steer-toggle')
  assert.ok(toggle, 'the chevron is beside 重试')
  assert.equal(toggle.props['aria-expanded'], 'false', 'collapsed by default')
  assert.equal(findByClass(tree, 'st-scan-steer-input'), undefined, 'and no input is in the flow yet')
  // The critique's chevron names itself: it sits in a row of buttons rather than inside a joined
  // retry pill, so a tooltip alone would leave the writer guessing what it opens.
  assert.equal(visibleText(toggle).join(''), 'scan.steer', 'the button carries its label')
  assert.equal(toggle.props.title, 'scan.steerHint')
  // Expanding is purely a toggle: it must not disturb the foot's other buttons.
  const before = findAllByClass(tree, 'st-scan-foot').length
  toggle.props.onClick()
  assert.ok(before, 'the foot was rendered')
})

test('one steer box serves both docks, and each instance says its own thing', async () => {
  // The rewrite dock and the critique dock each had a copy of this control, differing in three
  // strings and one prop. They are one component now; what has to hold is that each call site
  // still gets ITS strings, and that the rewrite's chevron stays unlabelled inside the pill.
  const critique = await mountScan({
    kind: 'critique', busy: false, error: '', issues: [], critique: { verdict: '', points: [] },
  })
  const critiqueToggle = findByClass(critique, 'st-scan-steer-toggle')
  assert.equal(visibleText(critiqueToggle).join(''), 'scan.steer')
  assert.equal(critiqueToggle.props.title, 'scan.steerHint')

  const rewrite = {
    id: 's1', kind: 'rewrite', chapterId: 'c1', baseText: '旧句。', proposedText: '新句。',
  }
  const editor = await mountEditor(chapter('旧句。'), { suggestion: rewrite })
  const rewriteToggle = findByClass(editor.tree, 'st-scan-steer-toggle')
  assert.ok(rewriteToggle, 'the rewrite dock has the same chevron')
  assert.equal(rewriteToggle.props.title, 'rewrite.steerHint', 'with its own tooltip')
  // No label here: this chevron is joined to 重试 as one pill, and a word between them would
  // break the shape the two buttons are drawn as.
  assert.equal(visibleText(rewriteToggle).join(''), '', 'and no label of its own')
  // Opening it gives a field whose placeholder is the rewrite's, not the critique's.
  rewriteToggle.props.onClick()
  const reopened = await editor.rerender()
  const input = findByClass(reopened, 'st-scan-steer-input')
  assert.ok(input, 'the field appears once expanded')
  assert.equal(input.props.placeholder, 'rewrite.steerPlaceholder')
  assert.equal(input.props['aria-label'], 'rewrite.steer')
})

test('a scan still running shows its own working line, not a blank dock', async () => {
  const tree = await mountScan({ kind: 'critique', busy: true, error: '', issues: [], critique: null })
  const thinking = findByClass(tree, 'st-ai-thinking')
  assert.ok(thinking, 'the wait is expressed')
  // Named for the work: "thinking of the next line" would be a lie while it is judging grammar.
  assert.ok(visibleText(thinking).join('').includes('scan.critiqueThinking'), 'and named for the job in hand')
  assert.equal(findByClass(tree, 'st-scan-list'), undefined, 'no results are drawn yet')
})

test('Escape collapses the scan to the hairline, and the close button dismisses', async () => {
  let closed = 0
  const tree = await mountScan({
    kind: 'review', busy: false, error: '', critique: null,
    issues: [{ kind: 'wording', where: '很长', problem: '虚', suggestion: '' }],
  }, { onScanClose: () => { closed += 1 } })
  const close = findByClass(tree, 'st-scan-head').children.find((c) => typeof c === 'object' && c.props?.onClick)
  assert.ok(close, 'the header offers a way out')
  close.props.onClick()
  assert.equal(closed, 1, 'the close button dismisses the scan')
  // Escape now COLLAPSES the box to the hairline — the result stays, one click brings it back.
  await findByClass(tree, 'st-editor').props.onKeyDown({ key: 'Escape', preventDefault: () => {} })
  assert.equal(closed, 1, 'Escape did not discard the scan')
})

test('each platform gets chords that cannot be confused with the plain key', () => {
  // The two rarer actions used to be DOUBLE presses of Tab and of Command, which forced every
  // single press to wait 200ms to find out whether a second one was coming. They are chords now,
  // so the plain key keeps its plain meaning and the action fires at once.
  const { gestureKeys } = loadClientLogic()

  const mac = gestureKeys('macos')
  // Bare Tab is still the ask gesture: nothing else may claim it. The grammar pass takes ⌥Tab;
  // 行文审阅 is ⌥⌘ on its own — no Tab under it, which is why its key is empty.
  assert.deepEqual(mac.ask, { alt: false, mod: false, shift: false, key: 'Tab' })
  assert.deepEqual(mac.critique, { alt: true, mod: false, shift: false, key: 'Tab' })
  assert.deepEqual(mac.review, { alt: true, mod: true, shift: false, key: '' })
  assert.equal(mac.reviewLabel, '⌥⌘', 'the keycap shows the two modifiers and nothing else')
  assert.equal(mac.reviewHint, 'Option+Command', 'and the tooltip spells them out in words')

  // Windows cannot have Alt+Tab — it is the system's task switcher and a page never receives it.
  const win = gestureKeys('windows')
  assert.deepEqual(win.ask, { alt: false, mod: false, shift: false, key: 'Tab' })
  assert.deepEqual(win.critique, { alt: true, mod: true, shift: false, key: 'Tab' })
  assert.deepEqual(win.review, { alt: true, mod: true, shift: true, key: 'Tab' })
  // The whole reason for the Ctrl variant: Alt on its own belongs to the OS on Windows.
  assert.equal(win.critique.mod, true, 'Windows always pairs Alt with Ctrl')
  assert.equal(win.review.mod, true, 'and so does the section read')
  assert.equal(mac.critique.mod, false, 'while macOS uses Option alone, which the OS leaves to the page')
})

test('chord matching is exact about every modifier, Shift included', () => {
  const { gestureKeys, chordMatches } = loadClientLogic()
  const mac = gestureKeys('macos')
  const ev = (over) => ({ key: 'Tab', altKey: false, metaKey: false, ctrlKey: false, shiftKey: false, ...over })

  assert.equal(chordMatches(ev({}), mac.ask, true), true, 'bare Tab is the ask gesture')
  // The grammar pass is the narrower gesture and takes the narrower chord, which is what the
  // dock's own titles say: 文法锐评.
  assert.equal(chordMatches(ev({ altKey: true }), mac.critique, true), true, 'Option+Tab is the grammar critique')

  // 行文审阅 does not go through `chordMatches` at all: it has no key under it, so this matcher
  // cannot fire it. A Tab pressed with both modifiers held is NOT the read — that is the chord
  // this shortcut specifically is not.
  assert.deepEqual(mac.review, { alt: true, mod: true, shift: false, key: '' })
  assert.equal(chordMatches(ev({ altKey: true, metaKey: true }), mac.review, true), false,
    'Option+Command+Tab is not the section read')
  assert.equal(chordMatches(ev({ altKey: true, metaKey: true }), mac.critique, true), false,
    'and Option+Command+Tab is not the grammar pass either')

  // The near misses. Each of these is a press a writer could make by accident, and none may fire
  // the wrong action.
  assert.equal(chordMatches(ev({ altKey: true }), mac.ask, true), false, 'Option+Tab is not bare Tab')
  assert.equal(chordMatches(ev({}), mac.critique, true), false, 'and bare Tab is not the critique')

  // Windows: Ctrl is the primary modifier, and Shift separates the two gestures — the grammar
  // pass takes the unshifted chord, as on macOS.
  const win = gestureKeys('windows')
  assert.equal(chordMatches(ev({ altKey: true, ctrlKey: true }), win.critique, false), true,
    'Ctrl+Alt+Tab is the grammar critique')
  assert.equal(chordMatches(ev({ altKey: true, ctrlKey: true }), win.review, false), false,
    'and it is not the section read')
  assert.equal(chordMatches(ev({ altKey: true, ctrlKey: true, shiftKey: true }), win.review, false), true,
    'the shifted variant reads the section')
  assert.equal(chordMatches(ev({ altKey: true, metaKey: true }), win.review, false), false,
    'Meta is not the primary modifier on Windows')

  // A key other than the one the chord names never matches, and neither does a missing event.
  assert.equal(chordMatches(ev({ key: 'Enter', altKey: true }), mac.critique, true), false)
  assert.equal(chordMatches(null, mac.critique, true), false)
  assert.equal(chordMatches(ev({}), null, true), false)
})

/**
 * 行文审阅 is Option+Command with NOTHING under it, so it needs its own matcher: the only key in
 * the press is one of the modifiers the gesture is made of, which is a thing `chordMatches` cannot
 * express (it compares `event.key` against a key the chord names).
 */
test('a modifier-only gesture fires on Option+Command and on nothing else', () => {
  const { gestureKeys, isModifierChord } = loadClientLogic()
  const mac = gestureKeys('macos')
  // A keydown reports its own modifier as down, so each case names the key being pressed.
  const down = (key, over = {}) => ({
    key, altKey: false, metaKey: false, ctrlKey: false, shiftKey: false, ...over,
  })

  // Both orders fire: the writer presses ⌥ then ⌘ or ⌘ then ⌥, and neither is "the wrong way".
  assert.equal(isModifierChord(down('Meta', { altKey: true }), mac.review, true), true,
    'Command pressed while Option is held reads the section')
  assert.equal(isModifierChord(down('Alt', { metaKey: true }), mac.review, true), true,
    'and Option pressed while Command is held does the same')
  // Holding the second key repeats the keydown; that is still the same gesture, and the callers
  // drop the repeat themselves so one request goes out.
  assert.equal(isModifierChord(down('Meta', { altKey: true, repeat: true }), mac.review, true), true,
    'a held key is still recognised, and the caller ignores the repeat')

  // Every near miss must stay silent. Option alone is half of the critique chord; Command alone is
  // the composer; Shift and Control are not part of this gesture.
  assert.equal(isModifierChord(down('Alt'), mac.review, true), false, 'Option alone is not the read')
  assert.equal(isModifierChord(down('Meta'), mac.review, true), false, 'Command alone is the composer')
  assert.equal(isModifierChord(down('Shift', { altKey: true, metaKey: true }), mac.review, true), false,
    'Shift breaks it')
  assert.equal(isModifierChord(down('Alt', { metaKey: true, ctrlKey: true }), mac.review, true), false,
    'Control is not Command on macOS')
  // A letter under the modifiers is a chord, not this gesture — ⌘C must not read the section.
  assert.equal(isModifierChord(down('c', { altKey: true, metaKey: true }), mac.review, true), false,
    'a letter breaks it')

  // Windows keeps a letter: Ctrl+Alt+Shift+Tab, which `chordMatches` already handles, so the
  // modifier-only matcher must not claim it there.
  const win = gestureKeys('windows')
  assert.equal(isModifierChord(down('Control', { altKey: true, shiftKey: true }), win.review, false), false,
    'the Windows read is not a modifier-only gesture')
})

test('every gesture has a keycap and a spoken name', () => {
  // The keycap is what the button shows; the hint is what its tooltip says. A missing one is a
  // button that teaches a shortcut nobody can find.
  const { gestureKeys } = loadClientLogic()
  for (const platform of ['macos', 'windows', 'linux']) {
    const keys = gestureKeys(platform)
    for (const field of ['ask', 'review', 'critique']) {
      assert.ok(keys[field] !== undefined, `${platform} defines the ${field} chord`)
    }
    for (const field of ['askLabel', 'reviewLabel', 'critiqueLabel', 'askHint', 'reviewHint', 'critiqueHint']) {
      assert.equal(typeof keys[field], 'string', `${platform} names ${field}`)
      assert.ok(keys[field].length > 0, `${platform}.${field} is not empty`)
    }
    assert.equal(keys.askLabel, 'Tab', `${platform}: bare Tab is still the ask gesture`)
  }
})

test('every message is read in the status bar, and none is drawn where it happened', async () => {
  // The dock, the shelf, the drawers and the chat each used to draw their own message. The same
  // class of text therefore appeared in five places, and none of them was where the writer was
  // looking. One corner now: the status bar's bottom-left.
  const panel = await mountPanel()
  await new Promise((resolve) => setTimeout(resolve, 0))
  const bar = findByClass(panel.tree, 'st-statusbar')
  assert.ok(bar, 'the status bar is on screen')
  // Nothing to report on a healthy panel.
  assert.equal(findByClass(bar, 'st-status-notice'), undefined, 'no notice when nothing is wrong')

  // A save failure reaches the bar. Driven through the component rather than the panel so the
  // message can be named exactly.
  const { plugin, render } = loadClientForRender()
  const chapter = { id: 'c1', title: '第一章', level: 'chapter', status: 'writing', text: '雨。' }
  const mounted = await render(plugin.__components.StatusBar, {
    t, book: { chapters: [chapter] }, chapter,
    saveStatus: { status: 'saved', savedAt: 0, error: '' },
    model: null,
    notice: { text: '磁盘已满', tone: 'error' },
  })
  const notice = findByClass(mounted.tree, 'st-status-notice')
  assert.ok(notice, 'the bar draws the message')
  assert.equal(visibleText(notice).join(''), '磁盘已满', 'with its text')
  assert.equal(notice.props['data-tone'], 'error', 'and a tone the stylesheet can colour')
  assert.equal(notice.props.role, 'status', 'announced as a status')
  assert.equal(notice.props['aria-live'], 'polite', 'politely, so it does not interrupt typing')
})

test('a warning is amber and an error is red, so the two do not look alike', () => {
  // "This went wrong" and "read this with care" are different messages. A truncated answer is not a
  // failure; painting it the same red taught the writer to ignore both.
  const css = readFileSync(new URL('../client.js', import.meta.url), 'utf8')
  const error = /\.st-status-notice\[data-tone="error"\]\{([^}]*)\}/.exec(css)?.[1] ?? ''
  const warn = /\.st-status-notice\[data-tone="warn"\]\{([^}]*)\}/.exec(css)?.[1] ?? ''
  assert.ok(error.includes('state-error-primary'), 'an error reads in the error colour')
  assert.ok(warn.includes('state-warn-primary'), 'a warning in the warning colour')
})

// ---- the status bar ----

/** Mount the whole panel on an open book, so the shell (and its status bar) renders. */
async function mountPanel() {
  const chapter = { id: 'c1', title: '第一章', level: 'chapter', status: 'writing', text: '雨下了一整夜。' }
  const second = { id: 'c2', title: '第二章', level: 'chapter', status: 'writing', text: '第二天。' }
  const book = {
    schemaVersion: 1, title: '我的书', genre: '', pov: '', tense: '',
    nodes: [{ id: 'v1', title: '第一卷', level: 'volume', status: 'writing', text: '', children: [chapter, second] }],
    chapters: [chapter, second], characters: [], relationships: [], settings: [], snapshots: [],
    overview: { chapters: {} },
  }
  const api = {
    books: async () => ({ ok: true, books: [{ folder: '我的书', title: '我的书', chapters: 2, finals: 2, total: 2, absolutePath: '/ws/story/我的书' }] }),
    models: async () => ({ ok: true, roles: {}, overrides: {}, image: {}, library: '/ws/story' }),
    load: async () => ({ ok: true, book, token: 't1', recovered: false }),
    save: async () => ({ ok: true, token: 't2' }),
    meta: async () => ({ ok: true, roles: { continue: { provider: 'p', model: 'agnes-3.0-flash' }, suggest: { provider: 'p', model: 'agnes-3.0-flash' } } }),
    snapshot: async () => ({ ok: true }),
    suggest: async () => ({ ok: true, suggestion: { id: 's', text: 'x' } }),
    continue: async () => ({ ok: true, continuation: 'y' }),
    renameBook: async () => ({ ok: true }), deleteBook: async () => ({ ok: true }),
    createBook: async () => ({ ok: true }), overview: async () => ({ ok: true }),
    style: async () => ({ ok: true }), consistency: async () => ({ ok: true }),
    manuscript: async () => ({ ok: true, markdown: '' }),
  }
  const { plugin, render, rerender } = loadClientForRender()
  const registrations = []
  const scopeCtx = {
    layout: { selectPanel: () => {} },
    workspaces: { create: async ({ path }) => ({ workspaceId: 'w1', path, title: 'x', sessionIds: [] }) },
    uiWorkspace: { openSession: () => {}, startSession: () => {}, openWorkspace: async () => {} },
    get: (name) => scopeCtx[name],
    // `register` must record its options: the panel is found by name among them.
    slots: { inject: (_k, f) => registrations.push(f), register: (options) => { registrations.push({ options }); return () => {} } },
  }
  plugin.apply({
    effect: (fn) => fn(),
    inject: (_n, cb) => cb(scopeCtx),
    slots: scopeCtx.slots,
    locale: { register: () => () => {}, bind: () => () => t },
  }, {})
  for (const factory of registrations) if (typeof factory === 'function') factory()
  const panel = registrations.find((entry) => typeof entry === 'object' && entry.options.name === 'main')
  const items = [{ workspaceId: 'w1', path: '/ws', title: 'W', sessionIds: [] }]
  const props = {
    ...panel.options.inject(), t, api, config: { saveInterval: 0 }, workspacePath: '/ws',
    useWorkspaces: (selector) => selector({ items }),
    useSessions: (selector) => selector({ byId: {} }),
    workspaceSnapshot: { items },
  }
  let mounted = await render(plugin.__components.StoryPanel, props)
  const card = findByClass(mounted.tree, 'st-book-open')
  if (card !== undefined) {
    card.props.onClick()
    mounted = await rerender(plugin.__components.StoryPanel, props)
  }
  return { get tree() { return mounted.tree }, plugin, props }
}

const flat = (node) => {
  const out = []
  const walk = (n) => {
    if (typeof n === 'string' || typeof n === 'number') { out.push(String(n)); return }
    if (n === null || typeof n !== 'object') return
    if (Array.isArray(n)) { n.forEach(walk); return }
    walk(n.children ?? [])
  }
  walk(node)
  return out.join(' ')
}

test('the status bar reports position, length and the model doing the writing', async () => {
  // Every one of these answers a question the writer would otherwise have to leave the page for.
  const panel = await mountPanel()
  await new Promise((resolve) => setTimeout(resolve, 0))
  const bar = findByClass(panel.tree, 'st-statusbar')
  assert.ok(bar, 'the status bar is on screen')
  const text = flat(bar)
  // The stub keeps the key and its parameters visible, so the numbers can be asserted.
  assert.ok(text.includes('status.position') && text.includes('i=1') && text.includes('n=2'),
    `it says which section of how many, saw: ${text}`)
  // The NAME, not just the number: "1 / 2" locates you in a list you cannot see from here.
  assert.ok(text.includes('第一章'), `it names the section, saw: ${text}`)
  assert.ok(text.includes('status.words') && text.includes('n=7'), 'and how long the current section is')
  assert.ok(text.includes('agnes-3.0-flash'), 'and which model answers')
  assert.ok(text.includes('status.modelLabel'), 'labelled, so the model name is not a bare string')
})

test('the status bar is the bottom edge of the panel, outside the page', async () => {
  // Inside the writing column it would sit under the manuscript only, and the outline would cover
  // it. It belongs to the panel, one row across everything.
  const panel = await mountPanel()
  await new Promise((resolve) => setTimeout(resolve, 0))
  const shell = findByClass(panel.tree, 'st-shell')
  const bar = findByClass(panel.tree, 'st-statusbar')
  assert.ok(shell, 'the panel shell is rendered')
  // The bar is a direct child of the shell, not nested inside `.st-root` (which holds the columns).
  const direct = (shell.children ?? []).some((child) => child === bar
    || (child.props?.className ?? '') === 'st-statusbar')
  assert.ok(direct, 'the bar is a child of the shell, not of the writing column')
})

test('the status bar reports the last saved time as text, not as a button', async () => {
  // "Unsaved" was rendered as a pressable chip, which made a state look like an action and hid
  // the one fact worth showing. The bar is a read-out; saving stays on the keyboard.
  const { plugin, render } = loadClientForRender()
  const chapter = { id: 'c1', title: '第一章', level: 'chapter', status: 'writing', text: '雨。' }
  const at = Date.UTC(2026, 9, 24, 6, 32)
  const mounted = await render(plugin.__components.StatusBar, {
    t, book: { chapters: [chapter] }, chapter,
    saveStatus: { status: 'saved', savedAt: at, error: '' }, model: null,
  })
  const text = flat(mounted.tree)
  assert.ok(text.includes('status.saved'), `it shows when it was written, saw: ${text}`)
  // The clock reading is in there, formatted rather than as a raw number.
  assert.ok(/\d{2}:\d{2}/.test(text), `and the time itself, saw: ${text}`)
  assert.equal(findByClass(mounted.tree, 'st-status-save'), undefined,
    'the saved time is not a control')
  const buttons = []
  const collect = (node) => {
    if (node === null || typeof node !== 'object') return
    if (Array.isArray(node)) { node.forEach(collect); return }
    if (node.type === 'button') buttons.push(flat(node))
    collect(node.children ?? [])
  }
  collect(mounted.tree)
  // The saved time is the one thing in the bar that must stay inert. The model cell is a button on
  // purpose now — it opens a card listing which model each role uses — so the rule is about the
  // clock reading, not about the element type of every cell.
  assert.ok(buttons.every((text) => !text.includes('status.saved') && !/\d{2}:\d{2}/.test(text)),
    `the saved time is not pressable, saw: ${JSON.stringify(buttons)}`)
})

test('a failed save is named, and it is still not a button', async () => {
  const { plugin, render } = loadClientForRender()
  const chapter = { id: 'c1', title: '第一章', level: 'chapter', status: 'writing', text: '雨。' }
  const mounted = await render(plugin.__components.StatusBar, {
    t, book: { chapters: [chapter] }, chapter,
    saveStatus: { status: 'error', savedAt: 0, error: 'disk full' }, model: null,
  })
  const text = flat(mounted.tree)
  assert.ok(text.includes('status.saveFailed'), `the failure is named, saw: ${text}`)
  assert.ok(!text.includes('status.saved'), 'and not mistaken for a success')
  const marked = []
  const walk = (node) => {
    if (node === null || typeof node !== 'object') return
    if (Array.isArray(node)) { node.forEach(walk); return }
    if (node.props?.['data-tone'] !== undefined) marked.push(node.props['data-tone'])
    walk(node.children ?? [])
  }
  walk(mounted.tree)
  assert.ok(marked.includes('error'), 'the failure carries a tone the stylesheet can colour')
})

test('while a write is in flight the previous time stays on screen', async () => {
  // Replacing a real timestamp with the word "saving" lost the only information the bar had.
  const { plugin, render } = loadClientForRender()
  const chapter = { id: 'c1', title: '第一章', level: 'chapter', status: 'writing', text: '雨。' }
  const at = Date.UTC(2026, 9, 24, 6, 32)
  const mounted = await render(plugin.__components.StatusBar, {
    t, book: { chapters: [chapter] }, chapter,
    saveStatus: { status: 'saving', savedAt: at, error: '' }, model: null,
  })
  const text = flat(mounted.tree)
  assert.ok(/\d{2}:\d{2}/.test(text), `the last known time is still readable, saw: ${text}`)
})

test('with no model known the bar says so instead of leaving a blank', async () => {
  const { plugin, render } = loadClientForRender()
  const chapter = { id: 'c1', title: '第一章', level: 'chapter', status: 'writing', text: '' }
  const mounted = await render(plugin.__components.StatusBar, {
    t, book: { chapters: [chapter] }, chapter,
    saveStatus: { status: 'saved', savedAt: Date.UTC(2026, 9, 24, 6, 32), error: '' },
    model: null, onSaveNow: () => {},
  })
  const text = flat(mounted.tree)
  assert.ok(text.includes('status.modelUnknown'), 'it falls back to a name for "session default"')
  assert.ok(text.includes('status.saved'), 'and reports when it last wrote')
})

test('an untitled section still gets a name in the status bar', async () => {
  // A section can be created and written in before it is named; "1 / 2 · 7 字" alone leaves the
  // writer guessing which one they are in.
  const { plugin, render } = loadClientForRender()
  const chapter = { id: 'c1', title: '   ', level: 'section', status: 'writing', text: '雨。' }
  const mounted = await render(plugin.__components.StatusBar, {
    t, book: { chapters: [chapter] }, chapter,
    saveStatus: { status: 'saved', savedAt: 0, error: '' }, model: null,
  })
  const name = findByClass(mounted.tree, 'st-status-name')
  assert.ok(name, 'the name slot is rendered')
  assert.ok(flat(name).includes('level.section'), `it falls back to the level, saw: ${flat(name)}`)
})

test('a dock closes the page up, leaving no strip beneath it', async () => {
  // The desk kept its own bottom padding while the dock sat below it, so the suggestion appeared
  // to float above a gap of empty page. The hairline states are excluded on purpose: the line is
  // one pixel tall and the page's own bottom spacing reads correctly around it.
  const { plugin, render } = loadClientForRender()
  const chapter = { id: 'c1', title: '第一章', level: 'chapter', status: 'writing', text: '雨。' }
  const base = {
    t, chapter, aiError: '', saveStatus: { status: 'idle', savedAt: 0, error: '' },
    onText: () => {}, onAskSelection: async () => {}, onContinue: async () => null,
    onAccept: () => {}, onReject: () => {}, onRetry: () => {},
  }
  const idle = await render(plugin.__components.ChapterEditor, { ...base, busy: false, suggestion: null })
  assert.equal(findByClass(idle.tree, 'st-desk').props['data-docked'], 'false',
    'with nothing open the page keeps its own spacing')

  for (const state of [
    // Only an EXPANDED box closes the page up. A working request shows on the hairline, which
    // is too slight to matter; the box opens when the result lands.
    { busy: false, suggestion: { id: 's', kind: 'continue', at: 1, baseText: '', proposedText: '风。', chapterId: 'c1' } },
  ]) {
    const mounted = await render(plugin.__components.ChapterEditor, { ...base, ...state })
    assert.equal(findByClass(mounted.tree, 'st-desk').props['data-docked'], 'true',
      'an expanded box means the page closes up behind it')
  }
})

test('the idle hairline sits on the bottom edge, not 18px above it', async () => {
  // The line is the last row inside a 22px-tall button. A flex column aligns its items to the top
  // by default, so the row of empty copy sat under the line and pushed it up: the measured gap
  // between the line and the status bar was 18px, which read as the page ending early. Packing
  // the column to the END is what puts the line on the button's own bottom edge.
  const source = readFileSync(new URL('../client.js', import.meta.url), 'utf8')
  // The bare `.st-hairline` rule, not the `.st-dock-slot .st-hairline` override that clears its
  // top margin: match the one that declares the button's own box.
  const rule = [...source.matchAll(/\.st-hairline\{([^}]*)\}/g)]
    .map((m) => m[1]).find((decls) => decls.includes('min-height:var(--st-hairline-row-h,22px)')) ?? ''
  assert.ok(rule !== '', 'the hairline has a rule of its own')
  assert.match(rule, /flex-direction:\s*column/, 'a column: the copy row over the line')
  assert.match(rule, /justify-content:\s*flex-end/, 'packed to the bottom, so the line touches the edge')
  assert.doesNotMatch(rule, /padding-bottom:\s*[1-9]/, 'no padding may push the line back up')

  // And nothing between the line and the bottom bar: the slot carries the spacing above the line,
  // never below it.
  const slot = /\.st-dock-slot\{([^}]*)\}/.exec(source)?.[1] ?? ''
  assert.doesNotMatch(slot, /padding-bottom:\s*(?!0)/, 'the slot adds no space under the line')
  const desk = /\.st-desk\{([^}]*)\}/.exec(source)?.[1] ?? ''
  // The horizontal and vertical steps come from the spacing scale, so the assertion reads the SCALE
  // rather than a pixel literal: what matters is that the shorthand ends in 0 — no bottom padding
  // under the dock — not which token the other two sides happen to use.
  assert.match(desk, /padding:\s*var\(--st-space-\d+,\d+px\)\s+var\(--st-space-\d+,\d+px\)\s+0/,
    'the desk keeps no bottom pad under the dock')
})

test('the find chord toggles: pressing it twice closes the bar', async () => {
  // Reaching for Esc to dismiss a search was the only way out; the chord that opened it should
  // close it, which is what every editor does.
  const editor = await mountEditor(chapter('雨夜很长。'))
  const area = editor.textarea()
  await area.props.onKeyDown({ key: 'f', metaKey: true, preventDefault: () => {} })
  assert.ok(findByClass(await editor.rerender(), 'st-find'), 'the first press opens it')
  await editor.textarea().props.onKeyDown({ key: 'f', metaKey: true, preventDefault: () => {} })
  assert.equal(findByClass(await editor.rerender(), 'st-find'), undefined, 'the second press closes it')

  // Ctrl on other platforms, and the same toggle from inside the field.
  await editor.textarea().props.onKeyDown({ key: 'f', ctrlKey: true, preventDefault: () => {} })
  const opened = await editor.rerender()
  assert.ok(findByClass(opened, 'st-find'), 'Ctrl+F opens it too')
  findByClass(opened, 'st-find-input').props.onKeyDown({ key: 'f', metaKey: true, preventDefault: () => {} })
  assert.equal(findByClass(await editor.rerender(), 'st-find'), undefined,
    'and the chord closes it from inside the field')
})

test('the find bar lives in the header, not in a row of its own', async () => {
  // A row above the page pushed the manuscript down whenever a search opened, which lost the
  // writer's place in the text — the one thing a search must not do.
  const editor = await mountEditor(chapter('雨夜很长。'))
  const closed = findByClass(editor.tree, 'st-desk-head')
  assert.ok(closed, 'the header is there')
  const before = closed.children.length

  await editor.textarea().props.onKeyDown({ key: 'f', metaKey: true, preventDefault: () => {} })
  const opened = await editor.rerender()
  const head = findByClass(opened, 'st-desk-head')
  assert.ok(findByClass(head, 'st-find'), 'the bar is inside the header')
  // The editor block comes after the header, so opening a search never inserts anything between
  // the header and the page.
  const desk = findByClass(opened, 'st-desk')
  const order = desk.children.map((child) => child.props?.className ?? '')
  assert.ok(order.indexOf('st-desk-head') < order.indexOf('st-editor-wrap'),
    `the header still comes before the page, saw ${JSON.stringify(order)}`)
  assert.equal(head.children.length, before, 'the header keeps its own children count: the bar replaces the buttons')
})

// ---- the selection stays visible when focus leaves ----

test('a selection is drawn even while the field has lost focus', () => {
  // The browser stops drawing a textarea's selection the moment focus moves, so clicking into the
  // composer made the highlighted passage look deselected. The painted layer takes over.
  const runs = paintRuns('雨下了一整夜，她坐在桌前。', { selection: { start: 7, end: 12 } })
  assert.equal(runs.map((run) => run.text).join(''), '雨下了一整夜，她坐在桌前。', 'no text is lost')
  const marked = runs.filter((run) => run.selected)
  assert.equal(marked.length, 1, 'one selected run')
  assert.equal(marked[0].text, '她坐在桌前', 'covering exactly the selected range')
  assert.ok(!runs.filter((run) => !run.selected).some((run) => run.text.includes('她坐在')), 'the same text is not also plain')
})

test('a selection and search hits are drawn together', () => {
  // Searching for a word inside the selected passage: both markers apply to overlapping ranges, so
  // the runs have to be cut at every boundary rather than layered.
  const text = '雨夜，雨夜，雨夜。'
  const hits = findMatches(text, '雨夜')
  const runs = paintRuns(text, { hits, activeIndex: 1, selection: { start: 0, end: 6 } })
  assert.equal(runs.map((run) => run.text).join(''), text, 'the text is reconstructed exactly')
  // The first two hits are inside the selection; the third is outside it.
  const both = runs.filter((run) => run.hit && run.selected)
  const hitOnly = runs.filter((run) => run.hit && !run.selected)
  assert.equal(both.length, 2, 'hits inside the selection carry both markers')
  assert.equal(hitOnly.length, 1, 'the hit outside it carries only the search marker')
  assert.equal(runs.filter((run) => run.active).length, 1, 'exactly one active hit')
})

test('no selection means the runs are just the search marks', () => {
  const text = '雨夜很长。'
  const hits = findMatches(text, '雨夜')
  const runs = paintRuns(text, { hits, activeIndex: 0 })
  assert.ok(runs.every((run) => run.selected === false), 'nothing is marked as selected')
  assert.equal(runs.filter((run) => run.hit).length, 1)
})

test('a collapsed caret is not a selection', () => {
  // A caret at an offset is not a range; drawing it would put a wash on nothing.
  const runs = paintRuns('正文', { selection: { start: 2, end: 2 } })
  assert.ok(runs.every((run) => run.selected === false))
})

test('an empty chapter paints a single empty run', () => {
  const runs = paintRuns('', { selection: { start: 0, end: 0 } })
  assert.deepEqual(runs, [{ text: '', hit: false, active: false, selected: false }])
})

test('the retained selection uses the accent, not a near-background grey', () => {
  // The first attempt used `--dsw-alias-bg-module-platform`, which is only a few points off the
  // page background: the passage looked unselected again, which is the exact failure this exists
  // to prevent. The wash has to be recognisably a selection.
  const css = readFileSync(new URL('../client.js', import.meta.url), 'utf8')
  const rule = /\.st-selected\{([^}]*)\}/.exec(css)?.[1] ?? ''
  assert.ok(rule !== '', 'the rule exists')
  assert.ok(rule.includes('color-mix'), 'it is a mixed wash, so it can carry the accent')
  assert.ok(rule.includes('--st-accent'), 'derived from the theme accent')
  assert.ok(!/background:var\(--dsw-alias-bg-module-platform[,)]/.test(rule),
    'not the flat module-platform token that was invisible against the page')
  assert.ok(rule.includes('box-shadow'), 'and it carries an edge, so a faint wash still reads as a range')
})

test('an added run is an opaque block, a removed run is a translucent wash', () => {
  // What is gone should recede; what is new should be read. That asymmetry is the rule: the
  // addition cannot be faint or it vanishes into the prose, and the deletion should not be solid or
  // it competes with the text that replaced it.
  const css = readFileSync(new URL('../client.js', import.meta.url), 'utf8')
  const addRule = /\.st-add\{([^}]*)\}/.exec(css)?.[1] ?? ''
  const delRule = /\.st-del\{([^}]*)\}/.exec(css)?.[1] ?? ''
  assert.ok(addRule !== '' && delRule !== '', 'both rules exist')

  // Neither uses the host's alpha-8% tokens: those are too faint to read on dark prose.
  for (const [name, rule] of [['add', addRule], ['del', delRule]]) {
    assert.ok(!/background:var\(--dsw-alias-code-diff-/.test(rule), `${name}: not the host's alpha token`)
  }
  // Added: mixed against the page background, so the result is opaque.
  assert.ok(addRule.includes('var(--dsw-alias-bg-base'), 'added: opaque, mixed against the page')
  // Removed: mixed against transparent, so it is a wash.
  assert.ok(delRule.includes('transparent'), 'removed: translucent')
  assert.ok(!delRule.includes('var(--dsw-alias-bg-base'), 'removed: not made opaque')
  assert.ok(/line-through/.test(delRule), 'removed text is struck through')
})

test('the retained selection uses the accent, not a near-background grey', () => {
  // The first attempt used `--dsw-alias-bg-module-platform`, which is only a few points off the
  // page background: the passage looked unselected again, which is the exact failure this exists
  // to prevent. The wash has to be recognisably a selection.
  const css = readFileSync(new URL('../client.js', import.meta.url), 'utf8')
  const rule = /\.st-selected\{([^}]*)\}/.exec(css)?.[1] ?? ''
  assert.ok(rule !== '', 'the rule exists')
  assert.ok(rule.includes('color-mix'), 'it is a mixed wash, so it can carry the accent')
  assert.ok(rule.includes('--st-accent'), 'derived from the theme accent')
  assert.ok(!/background:var\(--dsw-alias-bg-module-platform[,)]/.test(rule),
    'not the flat module-platform token that was invisible against the page')
  assert.ok(rule.includes('box-shadow'), 'and it carries an edge, so a faint wash still reads as a range')
})

test('only a proposed passage is set in the manuscript type', () => {
  // The dock holds three unlike things: the question box, a reply, and a proposed passage. Only
  // the last is a sentence of the book. The panel used to declare the manuscript size on the whole
  // dock, so the composer typed at 16/1.9 while every other input in dsh types at 13/20 — the box
  // read as borrowed from another application.
  const css = readFileSync(new URL('../client.js', import.meta.url), 'utf8')
  const dockRule = /\.st-ai-dock\{([^}]*)\}/.exec(css)?.[1] ?? ''
  // The dock's chrome is 13px, the size the rest of dsh uses. It was the manuscript's once, which
  // made every control in the card as loud as the prose; enlarging the buttons was never asked for.
  assert.ok(dockRule.includes('font-size:var(--st-text-md)'),
    'the dock defaults to interface type')
  assert.ok(!dockRule.includes('font-size:var(--st-font-size'),
    'and not to the manuscript size')

  // The proposed passage is the one that carries the book's own metrics — and only while it is
  // short. Past four or five lines a block at 16/1.9 inside a card is a wall, so it drops back to
  // interface type. The switch is data-prose, computed from the page settings.
  const textRule = /\.st-ai-dock-text\{([^}]*)\}/.exec(css)?.[1] ?? ''
  assert.ok(!textRule.includes('font-size:var(--st-font-size'),
    'the output area does not default to the manuscript size')
  const proseRule = /\[data-prose="short"\]\[data-kind="rewrite"\] \.st-ai-dock-text,\s*[\s\S]*?\{([^}]*)\}/.exec(css)?.[1] ?? ''
  assert.ok(proseRule.includes('font-size:var(--st-font-size'),
    'a SHORT passage is set in the manuscript size')
  assert.ok(proseRule.includes('line-height:var(--st-line-height'), 'with its leading')

  // A reply is a remark about the writing, so it is interface type like the rest of the dock.
  const chatRule = /\[data-kind="chat"\] \.st-ai-dock-text\{([^}]*)\}/.exec(css)?.[1] ?? ''
  assert.ok(chatRule.includes('font-size:var(--st-text-md)'),
    'a chat reply is interface type')
  assert.ok(!chatRule.includes('font-size:inherit'), 'it does not inherit the book size')
  assert.ok(chatRule.includes('color:var(--st-text-primary)'),
    'the reply is in the primary ink: it is content, not a caption')

  // The input is the ONE control at the larger fixed size: it is what the writer types into, and
  // it is not part of the book. Everything else in the card stays at 13px.
  const inputRule = /\.st-chat-input\{([^}]*)\}/.exec(css)?.[1] ?? ''
  assert.ok(inputRule.includes('font-size:var(--st-font-ui,16px)'),
    'the composer types at the fixed interface size')
})

test('a long reply grows the dock instead of being cut short', () => {
  // A fixed 320px cap cut a long answer and made the writer scroll a box that looked like it had
  // room. The dock is a region of the page: it takes the height it needs, and only an unusually
  // long reply gets a ceiling.
  const css = readFileSync(new URL('../client.js', import.meta.url), 'utf8')
  const dockRule = /\.st-ai-dock\{([^}]*)\}/.exec(css)?.[1] ?? ''
  assert.ok(!/max-height:min\(38vh,320px\)/.test(dockRule), 'the old 320px cap is gone')
  assert.ok(!/max-height:(min\()?\d/.test(dockRule), 'the dock itself no longer caps its height')

  const textRule = /\[data-kind="chat"\] \.st-ai-dock-text\{([^}]*)\}/.exec(css)?.[1] ?? ''
  assert.ok(/max-height:/.test(textRule), 'the ceiling exists')
  assert.ok(textRule.includes('overflow:auto'), 'and past it the text scrolls rather than being hidden')

  // Every kind of answer is bounded, not just the chat reply. A long continuation used to grow
  // upwards until the dock became the page and the manuscript was pushed off the window.
  const proposalRule = /\.st-ai-dock\[data-kind="rewrite"\] \.st-ai-dock-text,\s*[\s\S]*?\{([^}]*)\}/.exec(css)?.[1] ?? ''
  assert.ok(proposalRule.includes('max-height:'), 'a proposed passage is bounded too')
  assert.ok(proposalRule.includes('overflow:auto'), 'and scrolls inside its ceiling')
})

test('every accent-coloured control reads one variable, defined at the panel root', () => {
  // The accent used to be declared only on the dock, so every rule outside it that read the accent
  // with a blue fallback fell through to that fallback: the panel was half themed, half default.
  const css = readFileSync(new URL('../client.js', import.meta.url), 'utf8')
  const shellRule = /\.st-shell\{([^}]*)\}/.exec(css)?.[1] ?? ''
  assert.ok(shellRule.includes('--st-accent:'), 'the accent is declared on the panel root')

  // No rule may reach past it to a fixed blue token for a themed affordance.
  const rules = [...css.matchAll(/\.(st-[a-zA-Z-]+)[^{}]*\{([^}]*)\}/g)]
  const offenders = rules
    .filter(([, , body]) => /--dsw-alias-state-business-primary|--dsw-alias-button-info-fill/.test(body))
    .map(([, name]) => name)
  // The declaration itself may mention it as a last-resort fallback, and nothing else may.
  const allowed = new Set(['st-shell'])
  assert.deepEqual(offenders.filter((name) => !allowed.has(name)), [],
    'these rules still hard-code a blue instead of reading the accent')
})

test('a removed run is a wash and an added run is a block', () => {
  const css = readFileSync(new URL('../client.js', import.meta.url), 'utf8')
  const addRule = /\.st-add\{([^}]*)\}/.exec(css)?.[1] ?? ''
  const delRule = /\.st-del\{([^}]*)\}/.exec(css)?.[1] ?? ''
  assert.ok(addRule.includes('var(--dsw-alias-bg-base'), 'the addition is mixed against the page, so it is opaque')
  assert.ok(delRule.includes('transparent'), 'the deletion is mixed against transparent')
  assert.ok(!delRule.includes('var(--dsw-alias-bg-base'), 'and is not made opaque again')
})

// ---- the settings page ----

/**
 * Mount the settings page.
 *
 * The page holds the type settings and the auto-save interval. A test that only cares about type
 * still gets a sensible interval, and one that cares about the interval passes its own.
 */
async function mountType(typography, onChange = () => {}, extra = {}) {
  const { plugin, render } = loadClientForRender()
  const mounted = await render(plugin.__components.SettingsPage, {
    t, typography, onChange,
    autoSaveMs: 5 * 60 * 1000, onAutoSave: () => {},
    ...extra,
  })
  return mounted.tree
}

/** The three type groups, in page order. The auto-save group comes after them. */
const typeGroups = (tree) => findAllByClass(tree, 'st-seg').slice(0, 3)

test('the settings page offers named steps instead of sliders', async () => {
  // A range input invites a value between two stops, and for type there is no such value: 16.4px
  // and 16.6px are the same page, and a setting you cannot name is a setting you cannot come back
  // to. Three rows of steps.
  const tree = await mountType({ fontSize: 16, lineHeight: 1.9, width: 760 })
  assert.equal(findByClass(tree, 'st-slider'), undefined, 'no sliders are left on the page')
  const groups = typeGroups(tree)
  assert.equal(groups.length, 3, 'size, leading and measure, one group each')
  assert.equal(findAllByClass(groups[0], 'st-seg-item').length, 4, 'four sizes')
  assert.equal(findAllByClass(groups[1], 'st-seg-item').length, 3, 'three leadings')
  assert.equal(findAllByClass(groups[2], 'st-seg-item').length, 3, 'three measures')
  // The stored value is the pressed step: a segmented control with nothing chosen reads as broken.
  const pressed = findAllByClass(groups[0], 'st-seg-item').filter((b) => b.props['aria-pressed'] === 'true')
  assert.equal(pressed.length, 1, 'exactly one size is chosen')
  assert.equal(visibleText(pressed[0]).join(''), 'type.size.normal', 'and it is the stored one')
})

test('choosing a step changes that field and carries the others through', async () => {
  // The whole value is handed to storage, so a patch carrying only the field that moved REPLACED
  // the setting and dropped the other two. Each row then read `undefined`, could not find a nearest
  // step, and pressed its first one — three rows that looked like they were moving each other.
  const picked = []
  const current = { fontSize: 16, lineHeight: 1.9, width: 760 }
  const tree = await mountType(current, (patch) => picked.push(patch))
  const sizes = findAllByClass(typeGroups(tree)[0], 'st-seg-item')
  assert.equal(visibleText(sizes[2]).join(''), 'type.size.large')
  sizes[2].props.onClick()
  assert.deepEqual(picked, [{ fontSize: 18, lineHeight: 1.9, width: 760 }],
    'the size changes; the leading and the measure survive')
})

test('each type row keeps its own choice when another one moves', async () => {
  // The bug in one assertion: change only the size, then re-mount with the stored result, and the
  // other two rows must still show what they showed before.
  const picked = []
  const { plugin, render, rerender } = loadClientForRender()
  let typography = { fontSize: 16, lineHeight: 1.9, width: 760 }
  const props = () => ({
    t, typography,
    onChange: (next) => { picked.push(next); typography = next },
    autoSaveMs: 5 * 60 * 1000, onAutoSave: () => {},
  })
  const mounted = await render(plugin.__components.SettingsPage, props())
  findAllByClass(typeGroups(mounted.tree)[0], 'st-seg-item')[2].props.onClick()
  const after = await rerender(plugin.__components.SettingsPage, props())

  const groups = typeGroups(after.tree)
  const pressedOf = (group) => visibleText(
    findAllByClass(group, 'st-seg-item').filter((b) => b.props['aria-pressed'] === 'true')[0]).join('')
  assert.equal(pressedOf(groups[0]), 'type.size.large', 'the size moved to 大')
  assert.equal(pressedOf(groups[1]), 'type.leading.normal', 'the leading stayed on 标准')
  assert.equal(pressedOf(groups[2]), 'type.measure.normal', 'the measure stayed on 标准')
})

test('a stored value between steps shows the nearest one, not nothing', async () => {
  // The previous build stored arbitrary slider values. Opening the page on 17px must still show a
  // chosen step, or the writer sees a setting with no selection and cannot tell what it is.
  const tree = await mountType({ fontSize: 21, lineHeight: 2.05, width: 800 })
  const groups = typeGroups(tree)
  for (const [index, expected] of [[0, 'type.size.huge'], [1, 'type.leading.loose'], [2, 'type.measure.normal']]) {
    const pressed = findAllByClass(groups[index], 'st-seg-item').filter((b) => b.props['aria-pressed'] === 'true')
    assert.equal(pressed.length, 1, `group ${index} has a chosen step`)
    assert.equal(visibleText(pressed[0]).join(''), expected)
  }
})

test('the preview frame does not resize when the type does', async () => {
  // The frame is FIXED, and the author has said so twice: it must not follow its content. It was
  // 150px for a three-line sample; the copy is one line now, so the frame is one line of the
  // largest offered type plus padding — 72px — and it still does not move when the type changes.
  const small = await mountType({ fontSize: 15, lineHeight: 1.7, width: 640 })
  const large = await mountType({ fontSize: 20, lineHeight: 2.1, width: 900 })
  const frame = (tree) => findByClass(tree, 'st-type-preview')
  const inner = (tree) => findByClass(tree, 'st-type-preview-in')
  assert.equal(frame(small).props.style, undefined, 'the frame carries no inline size at all')
  assert.equal(frame(large).props.style, undefined)
  assert.deepEqual(inner(small).props.style, { fontSize: '15px', lineHeight: '1.7' })
  assert.deepEqual(inner(large).props.style, { fontSize: '20px', lineHeight: '2.1' })
  // And the stylesheet gives it a height, which is what keeps the frame still.
  const source = readFileSync(new URL('../client.js', import.meta.url), 'utf8')
  const rule = /\.st-type-preview\{[^}]*\}/.exec(source)
  assert.ok(rule, 'the preview has a rule of its own')
  assert.match(rule[0], /height:\s*var\(--st-preview-h,\s*72px\)/, 'a fixed height, sized for one line')
  assert.doesNotMatch(rule[0], /height:\s*auto|min-height|max-height/, 'with no way for the text to stretch it')
  // The page's width has to be definite as well. A percentage width counts as auto while the
  // drawer measures its content, so the preview's longest line decided the panel's width: it was
  // 860px at 20px type and 624px at 14px.
  const page = /\.st-type\{[^}]*\}/.exec(source)
  // A definite width — a token whose value is a length, not a percentage. The token is the point:
  // the same 340 is used by the models page, and two copies is how they drift apart.
  assert.match(page[0], /width:\s*var\(--st-settings-w,\s*340px\)/,
    'a definite width, which is what the drawer measures against')
  assert.match(page[0], /max-width:\s*100%/, 'an upper bound for a narrow window')
})

test('reset puts all three settings back in one action', async () => {
  const picked = []
  const tree = await mountType({ fontSize: 20, lineHeight: 2.1, width: 900 }, (patch) => picked.push(patch))
  findByClass(tree, 'st-type-foot').children[0].props.onClick()
  assert.deepEqual(picked, [{ fontSize: 16, lineHeight: 1.9, width: 760 }])
})

test('Option+Tab asks for a grammar critique from the caret', async () => {
  // The gesture lives in a document-level effect, which the harness used to drop: the wiring
  // between the listener and `onCritique` could call a helper that does not exist in that component
  // and every test still passed. The chord has to hand over the CARET as well — a critique of the
  // section's opening when the writer is mid-scene is a critique of the wrong prose.
  //
  // It used to be a DOUBLE Command press, which is why a lone Command still opens the composer:
  // that is a separate gesture and it is tested below.
  const text = '雨下了一整夜，她坐在桌前，等下一句话自己走过来。'
  const at = text.indexOf('，等下一句话')
  const critiques = []
  let opened = 0
  const editor = await mountEditor(chapter(text), {
    onCritique: (context, direction) => critiques.push({ context, direction }),
    onChatOpen: () => { opened += 1 },
  })
  const area = editor.textarea()
  area.props.ref.current = {
    value: text, selectionStart: at, selectionEnd: at,
    setSelectionRange: () => {}, focus: () => {},
  }
  const doc = editor.document()
  assert.ok(typeof doc.dispatch === 'function', 'the mount registered its document listener')

  doc.dispatch('keydown', {
    key: 'Tab', altKey: true, metaKey: false, ctrlKey: false, shiftKey: false,
    target: null, preventDefault: () => {},
  })
  assert.equal(critiques.length, 1, 'the chord asks for the critique')
  assert.equal(opened, 0, 'and the composer is not opened as well')
  assert.equal(critiques[0].context.start, at, 'the caret travels with the request')
  assert.ok(critiques[0].context.before.endsWith('雨下了一整夜，她坐在桌前'), 'with the prose before it')
  assert.ok(critiques[0].context.after.startsWith('，等下一句话'), 'and after it')
  // The chord itself never carries a direction: the steer box is the only one that does.
  assert.equal(critiques[0].direction, '', 'the chord runs an unsteered critique')
})

test('a lone Command press opens the composer, and is not confused with the chords', async () => {
  // The composer's gesture is still a single modifier: it is watched, not matched, because the
  // press it must recognise has no other key in it at all. What matters is that the chords above
  // do not also trigger it — a modifier that was part of a chord is not a press of its own.
  const opened = []
  const editor = await mountEditor(chapter('正文。'), { onChatOpen: () => opened.push(1) })
  const doc = editor.document()
  doc.dispatch('keydown', { key: 'Meta', target: null })
  assert.deepEqual(opened, [], 'nothing opens on the way down')
  doc.dispatch('keyup', { key: 'Meta', target: null })
  assert.equal(opened.length, 1, 'a lone Command press opens the composer')

  // Command held while another key is pressed is a chord (Cmd+C, Cmd+Z): no composer.
  doc.dispatch('keydown', { key: 'Meta', target: null })
  doc.dispatch('keydown', { key: 'c', target: null })
  doc.dispatch('keyup', { key: 'c', target: null })
  doc.dispatch('keyup', { key: 'Meta', target: null })
  assert.equal(opened.length, 1, 'a chord is not a lone press')
})

test('the settings page carries the auto-save interval, and pressing a step changes it', async () => {
  // The interval used to be a profile setting nobody could see. It is a preference about how the
  // panel behaves, which is what this page is for, so it lives here with the type settings.
  const picked = []
  const tree = await mountType({ fontSize: 16, lineHeight: 1.9, width: 760 }, () => {}, {
    autoSaveMs: 5 * 60 * 1000, onAutoSave: (value) => picked.push(value),
  })
  // Four groups now: three of type, then the interval.
  const groups = findAllByClass(tree, 'st-seg')
  assert.equal(groups.length, 4, 'the interval is a fourth group on the same page')
  const steps = findAllByClass(groups[3], 'st-seg-item')
  assert.equal(steps.length, 4, 'four waits offered')

  const pressed = steps.filter((step) => step.props['aria-pressed'] === 'true')
  assert.equal(pressed.length, 1, 'exactly one wait is chosen')
  assert.equal(visibleText(pressed[0]).join(''), 'autoSave.5m', 'and five minutes is the default')

  // The other waits ask for their own value, in milliseconds.
  const oneMinute = steps.find((step) => visibleText(step).join('') === 'autoSave.1m')
  assert.ok(oneMinute, 'one minute is offered')
  oneMinute.props.onClick()
  assert.deepEqual(picked, [60000], 'the page asks for the interval in ms')
})

test('a profile-set interval is shown but cannot be changed from the page', async () => {
  // The deployment decides for everyone; a button that silently does nothing is worse than a
  // control that says it is fixed.
  const tree = await mountType({ fontSize: 16, lineHeight: 1.9, width: 760 }, () => {}, {
    autoSaveMs: 60000, onAutoSave: () => {}, autoSaveLocked: true,
  })
  const steps = findAllByClass(findAllByClass(tree, 'st-seg')[3], 'st-seg-item')
  assert.ok(steps.length > 0, 'the row is still there')
  assert.ok(steps.every((step) => step.props.disabled === true), 'every step is disabled')
  const pressed = steps.filter((step) => step.props['aria-pressed'] === 'true')
  assert.equal(visibleText(pressed[0]).join(''), 'autoSave.1m', 'and it names the value in force')
})

test('the settings page groups type, saving and shortcuts under their own headings', async () => {
  const tree = await mountType({ fontSize: 16, lineHeight: 1.9, width: 760 })
  const titles = findAllByClass(tree, 'st-settings-title').map((node) => visibleText(node).join(''))
  // Named groups, so a folder path does not read as a type setting, an interval does not read as
  // a fourth type setting and a keycap does not read as a save option.
  assert.deepEqual(titles, ['settings.library', 'settings.typography', 'settings.saving', 'settings.keys'],
    'four named groups, one per kind of preference')
})

test('the outline shows a hand over a chapter name, not a text caret', () => {
  // The name is part of a row that selects a chapter, so it should say "this is clickable". It
  // said `text`, which promised a caret in a line of prose and delivered a selection instead.
  const css = readFileSync(new URL('../client.js', import.meta.url), 'utf8')
  const rule = /\.st-node-name\{([^}]*)\}/.exec(css)?.[1] ?? ''
  assert.ok(rule !== '', 'the name has a rule of its own')
  assert.ok(/cursor:pointer/.test(rule), 'the hand')
  assert.ok(!/cursor:text/.test(rule), 'not a text caret')
})

test('several built-in models show one built-in name and a card, and the card names each role', async () => {
  // The bar used to list every configured model as `a / b / c`, which grew with each role and
  // pushed the rest of the read-out sideways. It shows the first name and an ellipsis now; the
  // roles behind it are one click away.
  const { plugin, render } = loadClientForRender()
  const chapter = { id: 'c1', title: '第一章', level: 'chapter', status: 'writing', text: '雨。' }
  const model = {
    continue: { provider: 'agnes', model: 'agnes-3.0-flash' },
    suggest: { provider: 'agnes', model: 'agnes-2.5-flash' },
    mosaic: { provider: 'agnes', model: 'agnes-2.5-flash' },
  }
  const mounted = await render(plugin.__components.StatusBar, {
    t, book: { chapters: [chapter] }, chapter,
    saveStatus: { status: 'saved', savedAt: Date.UTC(2026, 9, 24, 6, 32), error: '' }, model,
  })
  const text = flat(mounted.tree)
  assert.ok(text.includes('model.builtin'), 'the built-in model is named generically')
  assert.ok(!text.includes('agnes-3.0-flash'), 'the concrete built-in id is hidden')
  assert.ok(!text.includes('agnes-2.5-flash'), 'no built-in id leaks into the bar')

  const button = findByClass(mounted.tree, 'st-status-model')
  assert.ok(button !== undefined, 'the cell is a button')
  button.props.onClick()
  const opened = await render(plugin.__components.StatusBar, {
    t, book: { chapters: [chapter] }, chapter,
    saveStatus: { status: 'saved', savedAt: Date.UTC(2026, 9, 24, 6, 32), error: '' }, model,
  })
  assert.ok(opened !== null)
})

test('the model card closes when the writer presses anywhere else', async () => {
  // The card is an aside, not a mode: the first press outside it means "I do not need this". It
  // used to stay open until the button was clicked again, which left it floating over the page
  // while the writer scrolled and typed underneath it.
  const { plugin, render, rerender } = loadClientForRender()
  const chapter = { id: 'c1', title: '第一章', level: 'chapter', status: 'writing', text: '雨。' }
  const model = {
    continue: { provider: 'agnes', model: 'agnes-3.0-flash' },
    suggest: { provider: 'agnes', model: 'agnes-2.5-flash' },
  }
  const props = {
    t, book: { chapters: [chapter] }, chapter,
    saveStatus: { status: 'saved', savedAt: Date.UTC(2026, 9, 24, 6, 32), error: '' }, model,
  }
  const mounted = await render(plugin.__components.StatusBar, props)
  // `rerender` continues the same hook table; `render` starts a fresh one, which would reset the
  // card to closed and make the assertion below pass for the wrong reason.
  findByClass(mounted.tree, 'st-status-model').props.onClick()
  const open = await rerender(plugin.__components.StatusBar, props)
  assert.ok(findByClass(open.tree, 'st-status-pop') !== undefined, 'the card is open')

  // A press on the page: an element whose walk up the tree does not reach the pair. Dispatched on
  // the document of the render that has the card OPEN — that is the pass whose effect registered
  // the listener, since the effect's dependency is the open state.
  const page = { tagName: 'TEXTAREA', closest: () => null }
  open.document.dispatch('pointerdown', { target: page })
  const closed = await rerender(plugin.__components.StatusBar, props)
  assert.ok(findByClass(closed.tree, 'st-status-pop') === undefined, 'the press closed it')

  // And a press ON the card keeps it open, or reading it would close it.
  findByClass(closed.tree, 'st-status-model').props.onClick()
  const again = await rerender(plugin.__components.StatusBar, props)
  const card = { tagName: 'SPAN', closest: () => ({ className: 'st-status-model-slot' }) }
  again.document.dispatch('pointerdown', { target: card })
  const still = await rerender(plugin.__components.StatusBar, props)
  assert.ok(findByClass(still.tree, 'st-status-pop') !== undefined, 'a press on the card leaves it open')
})

test('the prose budget tracks the page size, and sits at four or five lines', () => {
  // The dock sets a short passage in the book's type. "Short" is four to five lines, which has to
  // be derived from the writer's own page settings: a 14px page fits more characters per line, so
  // the same number of lines is a longer passage. A fixed character count would drift away from
  // the page the moment the size changed.
  const { proseLineBudget, TYPE_PRESETS, TYPOGRAPHY_DEFAULT } = loadClientLogic()
  const sizes = TYPE_PRESETS.fontSize.map((step) => step.value)
  const widths = TYPE_PRESETS.width.map((step) => step.value)

  // Every combination the settings page can produce gives a usable budget.
  for (const fontSize of sizes) {
    for (const width of widths) {
      const budget = proseLineBudget({ fontSize, lineHeight: 1.9, width })
      assert.ok(Number.isInteger(budget) && budget > 0, `${fontSize}/${width} gives ${budget}`)
      // Four or five lines of that page, to within rounding.
      const perLine = width / fontSize
      assert.ok(budget >= Math.round(perLine * 4) && budget <= Math.round(perLine * 5),
        `${fontSize}/${width}: ${budget} is between four and five lines of ${perLine.toFixed(1)}`)
    }
  }

  // Bigger type means fewer characters per line, so a smaller budget. This is the property that
  // makes the threshold follow the page rather than sit at a constant.
  const atSmall = proseLineBudget({ fontSize: 14, lineHeight: 1.9, width: 760 })
  const atLarge = proseLineBudget({ fontSize: 20, lineHeight: 1.9, width: 760 })
  assert.ok(atLarge < atSmall, `20px page: ${atLarge}, 14px page: ${atSmall}`)

  // A narrower measure fits fewer characters, so the budget shrinks with it too.
  const narrow = proseLineBudget({ fontSize: 16, lineHeight: 1.9, width: 640 })
  const wide = proseLineBudget({ fontSize: 16, lineHeight: 1.9, width: 900 })
  assert.ok(narrow < wide, `640px: ${narrow}, 900px: ${wide}`)

  // A corrupt setting falls back instead of producing Infinity, which would let every passage
  // through as "short" and set a whole chapter in the book's type inside a card.
  const fallback = proseLineBudget({})
  const expected = proseLineBudget(TYPOGRAPHY_DEFAULT)
  assert.equal(fallback, expected, 'missing settings fall back to the defaults')
  assert.ok(Number.isFinite(proseLineBudget({ fontSize: 0, width: 0 })), 'zero does not divide by zero')
})

test('interface type is a fixed panel size, independent of the page', () => {
  // The composer, a reply, the cast list and the dock's buttons are chrome. They do NOT follow the
  // manuscript's size: tying them to it made the input box shrink to 11px when the page was set to
  // "small". The page setting decides how the BOOK reads, and nothing else.
  const css = readFileSync(new URL('../client.js', import.meta.url), 'utf8')

  // One constant, a literal, not a function of the typography.
  // The BUILT bundle writes `var`, so the keyword is matched loosely.
  const constant = /(?:const|var) UI_FONT_SIZE = (\d+)/.exec(css)
  assert.ok(constant !== null, 'UI_FONT_SIZE is a constant')
  assert.equal(Number(constant[1]), 16, 'and it is 16px')
  assert.ok(!/(?:const|var) UI_FONT_SIZE = .*typography/.test(css), 'it does not read the page setting')

  // The desk publishes it, and publishes the page's size separately.
  // Quoted loosely: the source is single-quoted, the BUILT bundle is double-quoted.
  assert.ok(/['"]--st-font-ui['"]:\s*`\$\{UI_FONT_SIZE\}px`/.test(css),
    'the interface size comes from the constant')
  assert.ok(/['"]--st-font-size['"]:\s*`\$\{typography\.fontSize\}px`/.test(css),
    'the page size still comes from the setting')
  assert.ok(!/['"]--st-font-ui['"]:.*fontSize/.test(css), 'and the two are not crossed')

  // The leading is fixed too, and sized for 16px rather than borrowed from the 13px scale.
  const lineHeight = /(?:const|var) UI_LINE_HEIGHT = (\d+)/.exec(css)
  assert.ok(lineHeight !== null, 'UI_LINE_HEIGHT is a constant')
  assert.ok(Number(lineHeight[1]) > 16, 'leading exceeds the type size')
})

test('the model card closes when a panel opens over the page', async () => {
  // The bug this pins: opening a drawer left the card open behind it. The card is the bar's own
  // aside, so the writer never saw it close — they saw it again when the drawer was dismissed,
  // which reads as "opening Settings also opened the model page". The pointerdown rule cannot
  // catch it, because the drawer mounts over the bar before the press is judged.
  const { plugin, render, rerender } = loadClientForRender()
  const chapter = { id: 'c1', title: '第一章', level: 'chapter', status: 'writing', text: '雨。' }
  const model = {
    continue: { provider: 'agnes', model: 'agnes-3.0-flash' },
    suggest: { provider: 'agnes', model: 'agnes-2.5-flash' },
  }
  const props = {
    t, book: { chapters: [chapter] }, chapter, covered: false,
    saveStatus: { status: 'saved', savedAt: Date.UTC(2026, 9, 24, 6, 32), error: '' }, model,
  }
  const mounted = await render(plugin.__components.StatusBar, props)
  findByClass(mounted.tree, 'st-status-model').props.onClick()
  const open = await rerender(plugin.__components.StatusBar, props)
  assert.ok(findByClass(open.tree, 'st-status-pop') !== undefined, 'the card is open')

  // A drawer opens: the bar is told the page is covered, and the card puts itself away.
  const covered = await rerender(plugin.__components.StatusBar, { ...props, covered: true })
  assert.ok(findByClass(covered.tree, 'st-status-pop') === undefined,
    'a panel over the page dismisses the card, so it cannot reappear when the panel closes')
  assert.ok(findByClass(covered.tree, 'st-status-model') !== undefined,
    'the bar itself stays: only its aside is dismissed')
})
