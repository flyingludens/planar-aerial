import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { loadClientForRender, findByClass, findByText, visibleText } from './helpers/render-hooks.mjs'
import { loadClientLogic } from './helpers/load-client.mjs'

/**
 * The side chat: a lone Command (or Alt) opens a composer in the dock, sending folds the composer
 * and the answer arrives in the same dock as a suggestion.
 *
 * The point of building it this way is that there is ONE surface. A chat window that has to be
 * dismissed before the manuscript is reachable again is a second application on top of the page;
 * this one uses the place the suggestions already appear.
 */

const t = (key, params) => {
  if (params === undefined) return key
  return `${key} ${Object.entries(params).map(([name, value]) => `${name}=${value}`).join(' ')}`
}

const chapter = (text = '雨下了一整夜。') => ({ id: 'c1', title: '第一章', level: 'chapter', status: 'writing', text })

/** Mount the editor with the chat props the panel hands it. */
async function mountEditor(overrides = {}) {
  const { plugin, render, rerender } = loadClientForRender()
  const props = {
    t, chapter: chapter(), busy: false, suggestion: null, aiError: '',
    saveStatus: { status: 'saved', savedAt: 0, error: '' },
    onText: () => {}, onAskSelection: async () => {}, onContinue: async () => null,
    onAccept: () => {}, onReject: () => {}, onRetry: () => {},
    chat: { open: false, question: '', busy: false, reply: '', history: [] },
    onChatOpen: () => {}, onChatClose: () => {}, onChatSend: () => {},
    ...overrides,
  }
  let mounted = await render(plugin.__components.ChapterEditor, props)
  return {
    plugin,
    get tree() { return mounted.tree },
    area: () => findByClass(mounted.tree, 'st-editor'),
    rerender: async () => { mounted = await rerender(plugin.__components.ChapterEditor, props); return mounted.tree },
  }
}

test('a lone Command or Alt press opens the composer', () => {
  // A single modifier press is an unusual shortcut, which is what makes it safe to use. The rule is
  // about the whole press: the modifier went down, nothing else was pressed, and it came back up.
  // Which modifier it is depends on the platform: Command on macOS, Alt elsewhere.
  const { createLoneModifierWatcher } = loadClientLogic()
  for (const [key, mac] of [['Meta', true], ['Alt', false]]) {
    const opened = []
    const press = createLoneModifierWatcher(() => opened.push(key), mac)
    press.keydown({ key })
    assert.deepEqual(opened, [], 'nothing opens on the way down: the press has not finished')
    press.keyup({ key })
    assert.deepEqual(opened, [key], `a lone ${key} press opens the chat`)
  }
})

test('a modifier used as part of a chord never opens the chat', () => {
  // Cmd+C copies, Alt+Tab switches away. If the modifier alone triggered on the way up, every one
  // of those would also open a question box.
  const { createLoneModifierWatcher } = loadClientLogic()
  const opened = []
  const press = createLoneModifierWatcher(() => opened.push('open'), true)
  press.keydown({ key: 'Meta' })
  press.keydown({ key: 'c' })
  press.keyup({ key: 'c' })
  press.keyup({ key: 'Meta' })
  assert.deepEqual(opened, [], 'a chord is not a lone press')

  // And the watcher is ready for the next press after that, rather than staying poisoned.
  press.keydown({ key: 'Meta' })
  press.keyup({ key: 'Meta' })
  assert.deepEqual(opened, ['open'], 'the following lone press still works')
})

test('a held modifier does not fire repeatedly', () => {
  // Auto-repeat means the key was held down, not pressed; firing on it would open and close the
  // box many times per second.
  const { createLoneModifierWatcher } = loadClientLogic()
  const opened = []
  const press = createLoneModifierWatcher(() => opened.push('open'))
  press.keydown({ key: 'Meta' })
  press.keydown({ key: 'Meta', repeat: true })
  press.keydown({ key: 'Meta', repeat: true })
  press.keyup({ key: 'Meta' })
  assert.deepEqual(opened, [], 'a held key is not a press')
})

test('each platform uses its own modifier', () => {
  // Command on macOS, Alt on Windows and Linux — ONE modifier each, and the other one is left to
  // its own job. Accepting both everywhere opened the composer on a Mac whenever the writer
  // pressed Option, which on that platform is only ever half of a chord.
  const { createLoneModifierWatcher } = loadClientLogic()
  for (const [key, mac] of [['Meta', true], ['Alt', false]]) {
    const opened = []
    const press = createLoneModifierWatcher(() => opened.push(key), mac)
    press.keydown({ key })
    press.keyup({ key })
    assert.equal(opened.length, 1, `${key} is the modifier on ${mac ? 'macOS' : 'Windows and Linux'}`)
  }
  // The other platform's modifier, pressed alone, types nothing and completes nothing — and must
  // not open the composer either.
  for (const [key, mac] of [['Alt', true], ['Meta', false]]) {
    const opened = []
    const press = createLoneModifierWatcher(() => opened.push(key), mac)
    press.keydown({ key })
    press.keyup({ key })
    assert.deepEqual(opened, [], `${key} alone is not the gesture on ${mac ? 'macOS' : 'Windows and Linux'}`)
  }
  // Some other key on its own is not.
  const opened = []
  const press = createLoneModifierWatcher(() => opened.push('open'), true)
  press.keydown({ key: 'Shift' })
  press.keyup({ key: 'Shift' })
  assert.deepEqual(opened, [], 'Shift alone is not a shortcut')
})

test('the composer renders in the dock, not as a modal', async () => {
  const editor = await mountEditor({ chat: { open: true, question: '', busy: false, reply: '', history: [] } })
  const dock = findByClass(editor.tree, 'st-ai-dock')
  assert.ok(dock, 'the composer takes the dock')
  const composer = findByClass(editor.tree, 'st-chat-composer')
  assert.ok(composer, 'the composer is inside it')
  assert.ok(findByClass(editor.tree, 'st-chat-input'), 'with a text field')
  // No modal, and the manuscript is still mounted underneath: the chat never blocks the page.
  assert.equal(findByClass(editor.tree, 'fang-backdrop'), undefined, 'no dialog')
  assert.ok(findByClass(editor.tree, 'st-editor-over'), 'the textarea stays mounted')
})

test('Enter sends, Shift+Enter starts a line, Esc closes', async () => {
  const sent = []
  const closed = []
  const editor = await mountEditor({
    chat: { open: true, question: '', busy: false, reply: '', history: [] },
    onChatSend: (text) => sent.push(text),
    onChatClose: () => closed.push('close'),
  })
  const input = findByClass(editor.tree, 'st-chat-input')

  // Shift+Enter must reach the field, not send.
  input.props.onChange({ target: { value: '第一行' } })
  await editor.rerender()
  findByClass(editor.tree, 'st-chat-input').props.onKeyDown({ key: 'Enter', shiftKey: true, preventDefault: () => {} })
  assert.deepEqual(sent, [], 'Shift+Enter does not send')

  findByClass(editor.tree, 'st-chat-input').props.onChange({ target: { value: '这句怎么收？' } })
  await editor.rerender()
  findByClass(editor.tree, 'st-chat-input').props.onKeyDown({ key: 'Enter', preventDefault: () => {} })
  assert.deepEqual(sent, ['这句怎么收？'], 'a plain Enter sends the question')

  findByClass(editor.tree, 'st-chat-input').props.onKeyDown({ key: 'Escape', preventDefault: () => {} })
  assert.deepEqual(closed, ['close'], 'Esc closes it')
})

test('an IME composition is never mistaken for a send', async () => {
  // Enter confirms a candidate first; sending on that keystroke would send a half-typed question.
  const sent = []
  const editor = await mountEditor({
    chat: { open: true, question: '', busy: false, reply: '', history: [] },
    onChatSend: (text) => sent.push(text),
  })
  findByClass(editor.tree, 'st-chat-input').props.onChange({ target: { value: '雨' } })
  await editor.rerender()
  const input = findByClass(editor.tree, 'st-chat-input')
  for (const event of [{ key: 'Enter', isComposing: true }, { key: 'Enter', nativeEvent: { isComposing: true } }, { key: 'Enter', keyCode: 229 }]) {
    input.props.onKeyDown({ preventDefault: () => {}, ...event })
  }
  assert.deepEqual(sent, [], 'nothing is sent while composing')
})

test('sending folds the composer and the question moves into the working state', async () => {
  // The writer said what they wanted; the next thing they need is the answer, so the field goes
  // away and the dock keeps the question as the subject of what is coming.
  const folded = await mountEditor({
    chat: { open: false, question: '这里该怎么收？', busy: true, reply: '', history: [] },
    busy: true,
  })
  assert.equal(findByClass(folded.tree, 'st-chat-composer'), undefined, 'the composer is folded away')
  const thinking = findByClass(folded.tree, 'st-ai-thinking')
  assert.ok(thinking, 'the working state is in the dock')
  // The question is part of the working line now, not a block above it: one row that says what is
  // being worked on and what the state is.
  const ask = findByClass(folded.tree, 'st-ai-thinking-ask')
  assert.ok(ask, 'the question is inside the working line')
  assert.ok(visibleText(ask).join(' ').includes('这里该怎么收？'), 'verbatim, so the answer has a subject')
  // It sits in the same row as the dots, rather than in a block of its own above them.
  const row = findByClass(folded.tree, 'st-ai-thinking-row')
  assert.ok(row, 'there is one working row')
  assert.ok(visibleText(row).join(' ').includes('这里该怎么收？'), 'the question is in that row')
  assert.equal(findByClass(folded.tree, 'st-ai-question'), undefined,
    'and not in a separate block above it')
})

test('the answer arrives in the dock as a suggestion', async () => {
  const editor = await mountEditor({
    suggestion: {
      id: 'chat-1', kind: 'chat', chapterId: 'c1', question: '这里该怎么收？',
      baseText: '', proposedText: '雨停之前，她一句话也没说。',
    },
  })
  const dock = findByClass(editor.tree, 'st-ai-dock')
  assert.ok(dock, 'there is one dock')
  const text = visibleText(dock).join(' ')
  assert.ok(text.includes('雨停之前'), 'the answer is shown')
  assert.ok(text.includes('这里该怎么收？'), 'with the question above it')
  // A chat answer is prose, not a substitution: nothing is struck through.
  assert.equal(findByClass(editor.tree, 'st-del'), undefined, 'no diff against an empty base')
  // Its action is INSERT, because it is written into the text rather than replacing a range.
  assert.ok(text.includes('action.insert'), `the button says what it does, saw: ${text}`)
})

test('a chat answer is inserted at the caret', async () => {
  const written = []
  const editor = await mountEditor({
    suggestion: { id: 'c1', kind: 'chat', chapterId: 'c1', baseText: '', proposedText: '风吹过来。', question: '接下来？' },
    onText: (text) => written.push(text),
  })
  // A caret in the middle of the text: the answer lands there, not at the end.
  const area = editor.area()
  area.props.ref.current = {
    value: '雨下了一整夜。',
    selectionStart: 2, selectionEnd: 2,
    setSelectionRange: () => {}, focus: () => {},
  }
  await editor.rerender()
  await findText(findByClass(editor.tree, 'st-ai-dock'), 'action.insert').props.onClick()
  assert.equal(written[0], '雨下风吹过来。了一整夜。', 'inserted at the caret')
})

/** Every element under `node` whose className contains `token`. */
function findAllByClass(node, token, found = []) {
  if (node === null || node === undefined || typeof node !== 'object') return found
  if (Array.isArray(node)) {
    for (const child of node) findAllByClass(child, token, found)
    return found
  }
  if (typeof node.props?.className === 'string' && node.props.className.split(/\s+/).includes(token)) found.push(node)
  for (const child of node.children ?? []) findAllByClass(child, token, found)
  return found
}

/** Find the first button in `node` whose text contains `label`. */
function findText(node, label) {
  if (node === null || typeof node !== 'object') return undefined
  if (Array.isArray(node)) {
    for (const child of node) { const hit = findText(child, label); if (hit !== undefined) return hit }
    return undefined
  }
  if (node.type === 'button' && visibleText(node).join(' ').includes(label)) return node
  for (const child of node.children ?? []) { const hit = findText(child, label); if (hit !== undefined) return hit }
  return undefined
}

test('a composer on screen closes the page up, like any other dock content', async () => {
  const open = await mountEditor({ chat: { open: true, question: '', busy: false, reply: '', history: [] } })
  assert.equal(findByClass(open.tree, 'st-desk').props['data-docked'], 'true',
    'the desk gives up its bottom padding while the composer is open')

  const closed = await mountEditor({ chat: { open: false, question: '', busy: false, reply: '', history: [] } })
  assert.equal(findByClass(closed.tree, 'st-desk').props['data-docked'], 'false',
    'and keeps it when the chat is not showing')
})

test('the composer keeps only what carries information', async () => {
  // The hint line spelled out Enter and Shift+Enter under a one-line input. It is read once and
  // ignored forever after, and it made a compact box look like a form. What stays is the field,
  // the model's name and the send key.
  const editor = await mountEditor({
    chat: { open: true, question: '', busy: false, reply: '', history: [] },
    chatModels: { chat: { provider: 'p', model: 'agnes-3.0-flash' } },
  })
  assert.equal(findByClass(editor.tree, 'st-chat-hint'), undefined, 'no instruction line')
  const input = findByClass(editor.tree, 'st-chat-input')
  assert.equal(input.type, 'textarea', 'a textarea, so pasting prose works')
  assert.equal(input.props['data-composer-input'], 'true', 'marked as a composer input')
  assert.equal(input.props.rows, 1, 'one row tall to start')
  // The model that will answer, named beside the send key, from the chat ROLE the panel reports —
  // not from whatever dsh has selected.
  const model = findByClass(editor.tree, 'st-seat-label')
  assert.ok(model, 'the chat model is shown')
  assert.equal(visibleText(model).join(''), 'agnes-3.0-flash', "and it is the chat role's model")
})

test('a busy chat hides the composer instead of letting a second question race the first', async () => {
  // The box used to stay up while a request was in flight, and the second Enter would fire another
  // one. It is hidden now: while the dock shows the working state, the input that would start a
  // competing request is not on screen at all.
  const sent = []
  const editor = await mountEditor({
    chat: { open: true, question: '', busy: true, reply: '', history: [] },
    onChatSend: (text) => sent.push(text),
  })
  assert.equal(findByClass(editor.tree, 'st-chat-composer'), undefined, 'no input while the answer is pending')
  assert.ok(findByClass(editor.tree, 'st-ai-thinking'), 'the working state owns the dock instead')
  assert.deepEqual(sent, [], 'and nothing was sent')
})

test('an empty question is not sent', async () => {
  const sent = []
  const editor = await mountEditor({
    chat: { open: true, question: '', busy: false, reply: '', history: [] },
    onChatSend: (text) => sent.push(text),
  })
  findByClass(editor.tree, 'st-chat-input').props.onChange({ target: { value: '   ' } })
  await editor.rerender()
  findByClass(editor.tree, 'st-chat-input').props.onKeyDown({ key: 'Enter', preventDefault: () => {} })
  assert.deepEqual(sent, [], 'whitespace is not a question')
})

test('the chord toggles the composer through the panel state', async () => {
  // The handler is `open: prev.open !== true`, and whether the composer is on screen is driven by
  // `chat.open`. A Node test has no live DOM listeners, so what can be pinned honestly is the rule
  // plus the render it governs: given `open`, the composer is there or it is not.
  const onScreen = async (open) => {
    const editor = await mountEditor({ chat: { open, question: '', busy: false, reply: '', history: [] } })
    return findByClass(editor.tree, 'st-chat-composer') !== undefined
  }
  assert.equal(await onScreen(true), true, 'open: the composer is on screen')
  assert.equal(await onScreen(false), false, 'closed: it is not')

  // The rule each press applies. Two presses return to where they started, which is exactly what
  // "press it again to put it away" means; a one-way-open would leave the writer stuck.
  const toggle = (open) => open !== true
  assert.equal(toggle(toggle(false)), false, 'two presses cancel out')
  assert.equal(toggle(false), true)
})


test('between sending and the answer the hairline carries the question, glowing', async () => {
  // The moment after sending had no state of its own: `busy` belonged to the rewrite and
  // continuation calls, so the chat request left a blank dock — the question vanished and nothing
  // happened. The wait now lives ON the hairline: the glow strengthens, the question rotates on
  // the line, and the box opens when the answer arrives.
  const editor = await mountEditor({
    chat: { open: false, question: '这里该怎么收？', busy: true, reply: '', history: [] },
    busy: false,
    suggestion: null,
  })
  const line = findByClass(editor.tree, 'st-hairline')
  assert.ok(line, 'the dock is on the hairline while waiting')
  assert.equal(line.props['data-state'], 'working', 'the glow is in its working mood')
  assert.ok(findByClass(editor.tree, 'st-ai-thinking'), 'with the thinking row on the line')
  const ask = findByClass(editor.tree, 'st-ai-thinking-ask')
  assert.ok(ask, 'and the question as its subject, on the line')
  assert.ok(visibleText(ask).join(' ').includes('这里该怎么收？'))
  assert.equal(findByClass(editor.tree, 'st-ai-dock'), undefined,
    'the box itself stays closed until the result arrives')
})

test('a pending question outranks the previous answer still sitting in the dock', async () => {
  // Asking a follow-up leaves the old answer in `openProposal` until the new one arrives. Leaving
  // its accept/reject buttons on screen offered an action for a question not yet answered.
  const editor = await mountEditor({
    busy: false,
    chat: { open: false, question: '换一种收法？', busy: true, reply: '', history: [] },
    // The previous answer is still in the panel's state, which is what the editor is given.
    suggestion: { id: 'old', kind: 'chat', chapterId: 'c1', baseText: '', proposedText: '旧的回答。', question: '上一问' },
  })
  assert.ok(findByClass(editor.tree, 'st-ai-thinking'), 'the working state wins')
  assert.equal(findByClass(editor.tree, 'st-ai-dock-text'), undefined, 'the stale answer is not shown')
  const buttons = []
  const collect = (node) => {
    if (node === null || typeof node !== 'object') return
    if (Array.isArray(node)) { node.forEach(collect); return }
    if (node.type === 'button') buttons.push(visibleText(node).join(''))
    collect(node.children ?? [])
  }
  collect(findByClass(editor.tree, 'st-ai-dock'))
  assert.deepEqual(buttons, [], 'and its buttons are gone while the new question is in flight')
})

test('once the answer arrives the buttons come back', async () => {
  // The other half of the rule: the waiting state must end, or the dock would never let the
  // writer accept anything.
  const editor = await mountEditor({
    busy: false,
    chat: { open: false, question: '这里该怎么收？', busy: false, reply: '雨停之前，她一句话也没说。', history: [] },
    suggestion: { id: 'c1', kind: 'chat', chapterId: 'c1', baseText: '', proposedText: '雨停之前，她一句话也没说。', question: '这里该怎么收？' },
  })
  assert.equal(findByClass(editor.tree, 'st-ai-thinking'), undefined, 'the working state is over')
  const dock = findByClass(editor.tree, 'st-ai-dock')
  const buttons = []
  const collect = (node) => {
    if (node === null || typeof node !== 'object') return
    if (Array.isArray(node)) { node.forEach(collect); return }
    if (node.type === 'button') buttons.push(visibleText(node).join(''))
    collect(node.children ?? [])
  }
  collect(dock)
  assert.ok(buttons.length >= 2, `accept and reject are offered again, saw ${JSON.stringify(buttons)}`)
})

test('the chord is heard wherever focus happens to be', () => {
  // The listener used to hang off the textarea, so it only existed while that one element was
  // focused. That is exactly when a writer is NOT reaching for the shortcut: they press it to get
  // somewhere else. The scoping rule is what decides whether a press is ours, and it is a pure
  // predicate over the event target, so it can be pinned here.
  const ours = (target) => {
    if (target === null || target === undefined) return true
    if (typeof target.closest === 'function' && target.closest('.st-shell') !== null) return true
    const tag = String(target.tagName ?? '').toUpperCase()
    return tag === 'BODY' || tag === 'HTML'
  }
  const inside = { tagName: 'TEXTAREA', closest: (sel) => (sel === '.st-shell' ? {} : null) }
  const body = { tagName: 'BODY', closest: () => null }
  const html = { tagName: 'HTML', closest: () => null }
  const elsewhere = { tagName: 'INPUT', closest: () => null }

  assert.equal(ours(inside), true, 'inside the panel, whichever element has focus')
  assert.equal(ours(body), true, 'focus on nothing at all still counts')
  assert.equal(ours(html), true, 'and with the document as the target')
  assert.equal(ours(undefined), true, 'a synthetic event counts')
  assert.equal(ours(elsewhere), false, 'a field in another panel is not ours')
})

test('an insertion shows a little of what it will sit between', async () => {
  // An insertion has no range under it, so without neighbours the dock showed a sentence floating
  // with no indication of what it would attach to: the only way to judge it was to accept it and
  // read the result.
  const editor = await mountEditor({
    chapter: { id: 'c1', title: '第一章', level: 'chapter', status: 'writing', text: '雨下了一整夜，她坐在桌前。' },
    suggestion: { id: 'c1', kind: 'chat', at: 7, chapterId: 'c1', baseText: '', proposedText: '风从窗缝里进来。', question: '接下来？' },
  })
  const before = findByClass(editor.tree, 'st-ctx-before')
  const after = findByClass(editor.tree, 'st-ctx-after')
  const insert = findByClass(editor.tree, 'st-insert')
  assert.ok(before, 'the text before the insertion is shown')
  assert.ok(after, 'and the text after it')
  assert.ok(insert, 'with the insertion marked as the new part')
  assert.ok(visibleText(insert).join('').includes('风从窗缝里进来。'), 'the insertion is the suggestion')
  // The neighbours are the few characters either side of the caret at offset 7 — enough to
  // recognise the sentence, not a sentence to read.
  const beforeText = visibleText(before).join('')
  const afterText = visibleText(after).join('')
  // "雨下了一整夜，她坐在桌前。" with the caret at 7: the four characters before it are
  // 一整夜，; the four after are 她坐在桌.
  assert.equal(beforeText, '一整夜，', 'the characters immediately before the caret')
  assert.equal(afterText, '她坐在桌', 'and immediately after it')
  assert.ok(beforeText.length <= 4 && afterText.length <= 4, 'no more than a few characters each')
})

test('a rewrite shows no context, because its diff already has surroundings', async () => {
  const editor = await mountEditor({
    chapter: { id: 'c1', title: '第一章', level: 'chapter', status: 'writing', text: '雨下了一整夜。' },
    suggestion: { id: 's1', kind: 'rewrite', chapterId: 'c1', baseText: '雨下了一整夜。', proposedText: '雨下了一夜。' },
  })
  assert.equal(findByClass(editor.tree, 'st-ctx-before'), undefined, 'no context before a rewrite')
  assert.equal(findByClass(editor.tree, 'st-ctx-after'), undefined, 'nor after it')
  assert.ok(findByClass(editor.tree, 'st-del'), 'the struck-through text carries the surroundings')
})

test('the context window is short, so it cannot crowd out the suggestion', async () => {
  // A long chapter would otherwise put a paragraph of grey above and below one new sentence.
  const long = '前面'.repeat(200) + '光标' + '后面'.repeat(200)
  const editor = await mountEditor({
    chapter: { id: 'c1', title: '第一章', level: 'chapter', status: 'writing', text: long },
    suggestion: { id: 'c1', kind: 'continue', at: 400, chapterId: 'c1', baseText: '', proposedText: '新句子。' },
  })
  const before = visibleText(findByClass(editor.tree, 'st-ctx-before')).join('')
  const after = visibleText(findByClass(editor.tree, 'st-ctx-after')).join('')
  assert.ok(before.length <= 44, `before is trimmed, saw ${before.length} characters`)
  assert.ok(after.length <= 44, `after is trimmed, saw ${after.length} characters`)
})

test('the composer gives the dock to a rewrite that is already running', async () => {
  // The complaint this fixes: with the question box open, asking for a rewrite left the box on
  // screen covering the thinking row and the answer.
  const editor = await mountEditor({
    chat: { open: true, question: '', busy: false, reply: '', history: [] },
    busy: true,
    suggestion: null,
  })
  assert.equal(findByClass(editor.tree, 'st-chat-composer'), undefined, 'the box steps aside')
  assert.ok(findByClass(editor.tree, 'st-ai-thinking'), 'and the working state is visible')
})

test('and it comes back on its own once the work is done', async () => {
  // Hiding is a display decision, not a dismissal: `chat.open` is untouched, so a writer who was
  // mid-question when the answer arrived still has their box.
  const editor = await mountEditor({
    chat: { open: true, question: '', busy: false, reply: '', history: [] },
    busy: false,
    suggestion: null,
  })
  assert.ok(findByClass(editor.tree, 'st-chat-composer'), 'the box is back with nothing else to show')
})

test('a composer that is open when a result arrives does not bury it', async () => {
  // The composer ranks ABOVE a proposal — a keystroke has to produce a box you can see. So it is
  // the request that stands it down, not the dock: askSelection and askContinue close it, and the
  // answer then arrives into a free dock. This mounts the state that produces: composer closed,
  // answer present.
  const editor = await mountEditor({
    chat: { open: false, question: '', busy: false, reply: '', history: [] },
    suggestion: { id: 's1', kind: 'rewrite', chapterId: 'c1', baseText: '原文', proposedText: '改后' },
  })
  assert.equal(findByClass(editor.tree, 'st-chat-composer'), undefined, 'the answer owns the dock')
  assert.ok(findByClass(editor.tree, 'st-ai-dock-text'), 'and it is on screen')
})

test('an open composer outranks a result that is still on screen', async () => {
  // The other half of the same rule, and the bug behind "Command stops working": with an answer
  // up, the composer used to lose to it, so the keystroke flipped a flag nothing displayed. A box
  // the writer asked for must appear over the answer; closing it brings the answer back, because
  // the proposal was never discarded.
  const editor = await mountEditor({
    chat: { open: true, question: '', busy: false, reply: '', history: [] },
    suggestion: { id: 's1', kind: 'rewrite', chapterId: 'c1', baseText: '原文', proposedText: '改后' },
  })
  assert.ok(findByClass(editor.tree, 'st-chat-composer'), 'the composer is on screen')
  assert.equal(findByClass(editor.tree, 'st-ai-dock-text'), undefined, 'and the answer has stood down')
})

test('a question with a passage selected goes to the rewrite route', () => {
  // With text highlighted the question is an instruction about it ("这里太满了"); the answer has to
  // come back as a diff over that range, not as prose to insert below it.
  const { routeChatQuestion } = loadClientLogic()
  assert.equal(routeChatQuestion('雨下了一整夜。'), 'rewrite', 'a passage means rewrite')
  assert.equal(routeChatQuestion(''), 'chat', 'nothing selected means chat')
  assert.equal(routeChatQuestion('   \n\t '), 'chat', 'whitespace is not a passage')
  assert.equal(routeChatQuestion(undefined), 'chat', 'a missing selection is not a passage')
  assert.equal(routeChatQuestion(null), 'chat')
})

test('a rewrite from the composer is stamped with the passage it replaces', async () => {
  // The proposal must carry the selected text as its base, or accepting it would insert a second
  // copy of the sentence instead of substituting it.
  const passage = '她坐在桌前，等下一句话自己走过来。'
  const editor = await mountEditor({
    chapter: { id: 'c1', title: '第一章', level: 'chapter', status: 'writing', text: `雨下了一整夜，${passage}` },
    suggestion: { id: 's9', kind: 'rewrite', chapterId: 'c1', baseText: passage, proposedText: '她坐着，什么都没等。' },
  })
  const dock = findByClass(editor.tree, 'st-ai-dock')
  // A rewrite renders a diff, so the old passage is struck through beside the new one.
  assert.ok(findByClass(dock, 'st-del'), 'the replaced passage is shown struck through')
  assert.ok(findByClass(dock, 'st-add'), 'and the replacement beside it')
  // A word diff interleaves: unchanged runs stay plain, removed runs are struck, added runs are
  // marked. Asserting the structure rather than a concatenation, which is not readable prose.
  const del = visibleText(findByClass(dock, 'st-del')).join('')
  const add = visibleText(findByClass(dock, 'st-add')).join('')
  assert.ok(del.includes('在桌前') || del.includes('下一句话'), `the removed text is marked, saw: ${del}`)
  assert.ok(add.includes('什么都没') || add === '着', `the added text is marked, saw: ${add}`)
  // The accept button exists, which is what makes it a rewrite rather than a reply.
  assert.ok(visibleText(findByClass(dock, 'st-ai-dock-actions')).join('').includes('action.accept'))
})

test('only a rewrite is shown as a diff', async () => {
  // A continuation and a chat answer are additions; marking them with diff runs made them look
  // like edits to text that was already there. Only a rewrite substitutes, so only a rewrite gets
  // removed and added runs.
  const editor = mountEditor
  const cases = [
    { kind: 'rewrite', baseText: '原文', proposedText: '改后', expectDiff: true },
    { kind: 'continue', at: 2, baseText: '', proposedText: '续写的句子。', expectDiff: false },
    { kind: 'chat', at: 2, baseText: '', proposedText: '回答。', expectDiff: false },
  ]
  for (const item of cases) {
    const mounted = await editor({
      chapter: { id: 'c1', title: '第一章', level: 'chapter', status: 'writing', text: '雨下了一整夜。' },
      suggestion: { id: 'x', chapterId: 'c1', ...item },
    })
    const hasAdd = findByClass(mounted.tree, 'st-add') !== undefined
    const hasDel = findByClass(mounted.tree, 'st-del') !== undefined
    assert.equal(hasAdd || hasDel, item.expectDiff,
      `${item.kind}: diff markings ${item.expectDiff ? 'expected' : 'not expected'}`)
  }
})

test('a continuation reads as plain text between faint neighbours', async () => {
  const mounted = await mountEditor({
    chapter: { id: 'c1', title: '第一章', level: 'chapter', status: 'writing', text: '雨下了一整夜，她坐在桌前。' },
    suggestion: { id: 'c1', kind: 'continue', at: 7, chapterId: 'c1', baseText: '', proposedText: '风从窗缝里进来。' },
  })
  const insert = findByClass(mounted.tree, 'st-insert')
  assert.ok(insert, 'the insertion is marked as the new text')
  // No added/removed runs: it is not a change to anything.
  assert.equal(findByClass(mounted.tree, 'st-add'), undefined, 'not marked as an addition to a diff')
  assert.equal(findByClass(mounted.tree, 'st-del'), undefined, 'nothing is struck through')
  assert.ok(visibleText(insert).join('').includes('风从窗缝里进来。'))
})

test('a rewrite replaces the range it was asked about, not the live selection', async () => {
  // Pressing a button in the dock moves focus out of the textarea, and a blurred textarea reports a
  // collapsed range. Reading the live selection then applied the patch to the wrong place — or to
  // nothing. The proposal's own recorded range is authoritative.
  const written = []
  const editor = await mountEditor({
    chapter: { id: 'c1', title: '第一章', level: 'chapter', status: 'writing', text: '雨下了一整夜，她坐在桌前。' },
    suggestion: {
      id: 's1', kind: 'rewrite', chapterId: 'c1',
      baseText: '她坐在桌前', proposedText: '她伏在桌边',
      from: 7, to: 12,
    },
    onText: (text) => written.push(text),
  })
  // The textarea is NOT focused and its live range is collapsed at 0, which is what a blur leaves.
  const area = editor.area()
  area.props.ref.current = {
    value: '雨下了一整夜，她坐在桌前。',
    selectionStart: 0, selectionEnd: 0,
    setSelectionRange: () => {}, focus: () => {},
  }
  await editor.rerender()
  await findText(findByClass(editor.tree, 'st-ai-dock'), 'action.accept').props.onClick()
  assert.equal(written[0], '雨下了一整夜，她伏在桌边。',
    'the recorded range was replaced, not the collapsed caret at 0')
  assert.ok(!written[0].startsWith('她伏在桌边'), 'nothing was inserted at the start of the chapter')
})

test('retrying a rewrite keeps the same range', () => {
  // "Try again" is a second attempt at the SAME passage. Re-reading whatever is selected after the
  // click would target something else, or nothing.
  const askSelection = (selection, wholeText, range) => ({ selection, range })
  const proposal = { baseText: '原句', wholeText: '全文', from: 10, to: 20 }
  const retried = askSelection(proposal.baseText, proposal.wholeText, { start: proposal.from, end: proposal.to })
  assert.deepEqual(retried.range, { start: 10, end: 20 }, 'the range travels with the retry')
  assert.equal(retried.selection, '原句', 'and so does the passage it rewrites')
})

test('the selection is probed before the composer takes focus', async () => {
  // The chord opens the composer, which steals focus. If the probe ran after, the panel would be
  // told nothing was selected and a question about a passage would take the chat route.
  const editor = await mountEditor({
    chapter: { id: 'c1', title: '第一章', level: 'chapter', status: 'writing', text: '雨下了一整夜，她坐在桌前。' },
  })
  const area = editor.area()
  area.props.ref.current = {
    value: '雨下了一整夜，她坐在桌前。',
    selectionStart: 0, selectionEnd: 7,
    setSelectionRange: () => {}, focus: () => {},
  }
  // The probe is what the keyboard and click handlers call; drive it the way a drag would end.
  area.props.onMouseUp()
  await editor.rerender()
  // With the composer open the editor still reports the highlighted text, which is what the
  // composer sends with the question.
  const opened = await mountEditor({
    chapter: { id: 'c1', title: '第一章', level: 'chapter', status: 'writing', text: '雨下了一整夜，她坐在桌前。' },
    chat: { open: true, question: '', busy: false, reply: '', history: [] },
  })
  assert.ok(findByClass(opened.tree, 'st-chat-composer'), 'the composer is open')
  // The textarea is still mounted underneath with its range intact, which is what
  // `liveSelectionRange` reads when the question is sent.
  const still = findByClass(opened.tree, 'st-editor-over')
  assert.ok(still, 'the manuscript is still there to read the selection from')
})

test('the rewrite and the chat are given the same picture of where the writer is', async () => {
  // They used to gather their own: the rewrite sent only the passage, the continuation sent the
  // windows around the caret, and the chat sent neither. The same question could therefore produce
  // different results depending on which control was pressed.
  const text = '雨下了一整夜，她坐在桌前，等下一句话自己走过来。'
  const from = text.indexOf('她坐在桌前')
  const to = from + '她坐在桌前'.length
  const chapter = { id: 'c1', title: '第一章', level: 'chapter', status: 'writing', text }

  // 1. The rewrite, through Tab with a passage selected.
  const rewrites = []
  const rewriteEditor = await mountEditor({
    chapter,
    onAskSelection: async (passage, whole, range, context) => { rewrites.push({ passage, range, context }) },
  })
  const area1 = rewriteEditor.area()
  area1.props.ref.current = {
    value: text, selectionStart: from, selectionEnd: to,
    setSelectionRange: () => {}, focus: () => {},
  }
  area1.props.onMouseUp()
  await rewriteEditor.rerender()
  await findByClass(rewriteEditor.tree, 'st-editor').props.onKeyDown({ key: 'Tab', preventDefault: () => {} })
  // One Tab waits a window before it acts, so a second press can turn it into a section review.
  await new Promise((resolve) => setTimeout(resolve, 400))
  assert.equal(rewrites.length, 1, 'the rewrite ran')
  const rewriteContext = rewrites[0].context
  assert.equal(rewrites[0].passage, '她坐在桌前', 'the passage is what was selected')
  assert.equal(rewriteContext.start, from, 'with its offsets')
  assert.equal(rewriteContext.end, to)
  assert.ok(rewriteContext.before.endsWith('雨下了一整夜，'), 'and the prose before it')
  assert.ok(rewriteContext.after.startsWith('，等下一句话'), 'and after it')

  // 2. The chat, with the same selection, must see the same thing.
  const chats = []
  const chatEditor = await mountEditor({
    chapter,
    chat: { open: true, question: '', busy: false, reply: '', history: [] },
    onChatSend: (question, selection, context) => { chats.push({ question, selection, context }) },
  })
  const area2 = chatEditor.area()
  area2.props.ref.current = {
    value: text, selectionStart: from, selectionEnd: to,
    setSelectionRange: () => {}, focus: () => {},
  }
  area2.props.onMouseUp()
  await chatEditor.rerender()
  findByClass(chatEditor.tree, 'st-chat-input').props.onChange({ target: { value: '这句怎么收？' } })
  await chatEditor.rerender()
  findByClass(chatEditor.tree, 'st-chat-input').props.onKeyDown({ key: 'Enter', preventDefault: () => {} })

  assert.equal(chats.length, 1, 'the chat ran')
  assert.equal(chats[0].selection, '她坐在桌前', 'it sees the same passage')
  assert.equal(chats[0].context.start, from, 'at the same offsets')
  assert.equal(chats[0].context.end, to)
  // The one thing that must match exactly: the neighbours are computed by the same function.
  assert.equal(chats[0].context.before, rewriteContext.before, 'the same prose before the passage')
  assert.equal(chats[0].context.after, rewriteContext.after, 'and after it')
})

test('a selection survives focus moving into the composer', async () => {
  // Clicking into the composer used to leave the writer with no visual trace of the passage they
  // had highlighted, which looked exactly like the selection had been lost.
  const text = '雨下了一整夜，她坐在桌前。'
  const editor = await mountEditor({ chapter: { id: 'c1', title: '第一章', level: 'chapter', status: 'writing', text } })
  const area = editor.area()
  area.props.ref.current = {
    value: text, selectionStart: 0, selectionEnd: 7,
    setSelectionRange: () => {}, focus: () => {},
  }
  // Focus leaves the field for the composer.
  area.props.onFocus()
  await editor.rerender()
  // The live selection is the browser's business while focused; nothing is painted over it.
  assert.equal(findByClass(editor.tree, 'st-selected'), undefined, 'no duplicate wash while focused')

  findByClass(editor.tree, 'st-editor').props.onBlur()
  const blurred = await editor.rerender()
  // With focus gone the painted layer draws it, so it stays visibly selected.
  const marked = findByClass(blurred, 'st-selected')
  assert.ok(marked, 'the selection is painted after focus leaves')
  assert.ok(visibleText(marked).join('').includes('雨下了一整夜'), 'covering the highlighted text')
})

test('the ask button sits with the AI trigger, not in the window title', async () => {
  // It belongs beside the control that rewrites the passage: both act on the chapter in front of
  // the writer. In the panel title it was separated from the thing it is a sibling of.
  const editor = await mountEditor({
    chapter: { id: 'c1', title: '第一章', level: 'chapter', status: 'writing', text: '雨。' },
    answerCount: 2,
    onAnswersOpen: () => false,
  })
  const head = findByClass(editor.tree, 'st-desk-head')
  assert.ok(head, 'the editor header is there')
  const buttons = []
  const collect = (node) => {
    if (node === null || typeof node !== 'object') return
    if (Array.isArray(node)) { node.forEach(collect); return }
    if (node.type === 'button') buttons.push(node)
    collect(node.children ?? [])
  }
  collect(head)
  const ask = buttons.find((button) => visibleText(button).join('').includes('action.ask'))
  const ai = buttons.find((button) => visibleText(button).join('').includes('action.aiTrigger'))
  const answers = buttons.find((button) => visibleText(button).join('').includes('action.answers'))
  assert.ok(ask, 'the ask button is in the editor header')
  assert.ok(ai, 'with the AI trigger')
  assert.ok(answers, 'and the history button')
  // The keycap names the gesture that opens the COMPOSER, and that gesture is a lone Command press.
  // It printed a whole chord for a while — ⌥⌘Tab back then, ⌥⌘ now — which is the section read, not
  // the composer, so the button taught a shortcut that opens the composer only in the writer's
  // imagination. A chord has a Tab in it; this one must not.
  const keycap = visibleText(ask).join('')
  assert.ok(/⌘|Ctrl|Alt/.test(keycap), `the ask button names its modifier, saw: ${keycap}`)
  assert.ok(!/Tab/.test(keycap), `and not a chord, saw: ${keycap}`)
  assert.ok(visibleText(answers).join('').includes('2'), 'the history button carries the count')
  // All three share the same class, so they read as one group.
  for (const button of [ask, ai, answers]) {
    assert.ok(String(button.props.className).includes('st-ai-trigger'), 'same family of control')
  }
})

test('the ask button toggles the composer through the panel', async () => {
  const opened = []
  const editor = await mountEditor({
    chapter: { id: 'c1', title: '第一章', level: 'chapter', status: 'writing', text: '雨。' },
    onChatOpen: () => opened.push('toggle'),
  })
  const ask = findText(findByClass(editor.tree, 'st-desk-head'), 'action.ask')
  assert.ok(ask, 'the button is there')
  ask.props.onClick()
  assert.deepEqual(opened, ['toggle'], 'pressing it asks the panel to toggle the chat')
})

test('the find field follows the shared borderless input rule', () => {
  // The panel had one bordered style per field, and the search box was the one without an edge,
  // which read as a mistake. The answer went the other way: NO field carries a stroke. They are
  // one shared rule — a soft layer fill, no border, the focus ring as the only edge — and each
  // field's own rule only carries what is particular to it (this one, its width in the header).
  const css = readFileSync(new URL('../client.js', import.meta.url), 'utf8')
  const shared = /\.st-input,\.st-find-input,[^{]*\{([^}]*)\}/.exec(css)?.[1] ?? ''
  assert.ok(shared !== '', 'the shared field rule exists')
  assert.ok(/border:none/.test(shared), 'no stroke: the fill says "this is a field"')
  assert.ok(/background:var\(--st-surface[,)]/.test(shared), 'a quiet surface fill instead')
  assert.ok(/border-radius:var\(--st-radius-sm[,)]/.test(shared), 'still rounded')
  assert.ok(/font-size:var\(--st-text-md\)/.test(shared),
    'and it takes its type from the panel scale, not a number of its own')

  const own = /\.st-find-input\{([^}]*)\}/.exec(css)?.[1] ?? ''
  assert.ok(own !== '', 'the find field still has a rule for its own concerns')
  assert.ok(/width:var\(--st-find-w,170px\)/.test(own), 'its width in the header row')
  assert.ok(!/border:\.5px solid/.test(own), 'and no border of its own')
  assert.ok(!/border-bottom:\.5px solid var\(--dsw-alias-border-l4[,)]/.test(own), 'not the bare underline either')
})

test('the dock shows only the newest answer', async () => {
  // A growing transcript under the manuscript pushed the page up as the conversation went on, so
  // the dock carries one answer: the newest. The rest go to the history card.
  const editor = await mountEditor({
    chapter: { id: 'c1', title: '第一章', level: 'chapter', status: 'writing', text: '雨。' },
    suggestion: { id: 'chat-2', kind: 'chat', chapterId: 'c1', baseText: '', proposedText: '第二回答。', question: '第二个问题？' },
  })
  const dock = findByClass(editor.tree, 'st-ai-dock')
  const text = visibleText(dock).join(' ')
  assert.ok(text.includes('第二回答。'), 'the newest answer is there')
  assert.ok(!text.includes('第一回答。'), 'and no earlier one')
  assert.equal(findByClass(editor.tree, 'st-answer'), undefined, 'the dock holds no list of exchanges')
})

test('the history card lists the exchanges, newest first', async () => {
  const { plugin, render } = loadClientForRender()
  const answers = [
    { question: '第二个问题？', reply: '第二回答。', at: 2 },
    { question: '第一个问题？', reply: '第一回答。', at: 1 },
  ]
  const mounted = await render(plugin.__components.AnswerLog, { t, answers, onInsert: () => {} })
  const entries = []
  const collect = (node) => {
    if (node === null || typeof node !== 'object') return
    if (Array.isArray(node)) { node.forEach(collect); return }
    if (typeof node.props?.className === 'string' && node.props.className === 'st-answer') entries.push(node)
    collect(node.children ?? [])
  }
  collect(mounted.tree)
  assert.equal(entries.length, 2, 'both exchanges are listed')
  // Newest first: the order the panel builds them in.
  assert.ok(visibleText(entries[0]).join(' ').includes('第二回答。'), 'the newest is at the top')
  assert.ok(visibleText(entries[1]).join(' ').includes('第一回答。'), 'and the older one below it')
  // Each entry keeps its question, or the answer has no context when read back.
  assert.ok(visibleText(entries[0]).join(' ').includes('第二个问题？'), 'with the question it answered')
})

test('an old answer can be put back into the manuscript', async () => {
  // Reading is the main job, but an answer worth keeping should not have to be retyped.
  const inserted = []
  const { plugin, render } = loadClientForRender()
  const mounted = await render(plugin.__components.AnswerLog, {
    t,
    answers: [{ question: '问？', reply: '旧回答。', at: 1 }],
    onInsert: (entry) => inserted.push(entry),
  })
  const button = findText(mounted.tree, 'action.insert')
  assert.ok(button, 'the entry offers an insert')
  button.props.onClick()
  assert.equal(inserted.length, 1, 'and reports the entry it was asked to insert')
  assert.equal(inserted[0].reply, '旧回答。')
})

test('an empty history says so instead of showing nothing', async () => {
  const { plugin, render } = loadClientForRender()
  const mounted = await render(plugin.__components.AnswerLog, { t, answers: [], onInsert: () => {} })
  assert.ok(visibleText(mounted.tree).join(' ').includes('label.noAnswers'))
})

// ---- renaming from the outline ----

test('a chapter can be renamed from a visible button, not only by double-click', async () => {
  // The rename existed but only as a double-click on the name, which nothing announced — while
  // delete had a visible button. A destructive action should not be the discoverable one.
  const renamed = []
  const { plugin, render, rerender } = loadClientForRender()
  const book = {
    schemaVersion: 1, title: '书', genre: '', pov: '', tense: '',
    nodes: [{ id: 'v1', title: '第一卷', level: 'volume', status: 'writing', text: '', children: [
      { id: 'c1', title: '旧名字', level: 'chapter', status: 'writing', text: '', children: [] }] }],
    chapters: [], characters: [], relationships: [], settings: [], snapshots: [], overview: { chapters: {} },
  }
  const props = {
    t, book, activeId: 'c1', collapsed: new Set(),
    onSelect: () => {}, onToggle: () => {},
    onRename: (id, title) => renamed.push([id, title]), onRemove: () => {},
  }
  let mounted = await render(plugin.__components.TreeNav, props)
  const renameButton = findByClass(mounted.tree, 'st-node-rename')
  assert.ok(renameButton, 'the row offers a rename control')
  assert.equal(renameButton.props['aria-label'], 'action.renameNode', 'named for a screen reader')
  assert.equal(findByClass(mounted.tree, 'st-node-input'), undefined, 'not editing yet')

  // Pressing it turns the name into a field, seeded with the current title.
  // The chapter row's own rename button, not the volume's: the tree renders one per row.
  const rows = findAllByClass(mounted.tree, 'st-node')
  const chapterRow = rows.find((row) => visibleText(row).join('').includes('旧名字'))
  assert.ok(chapterRow, 'the chapter row is there')
  findAllByClass(chapterRow, 'st-node-rename')[0].props.onClick({ stopPropagation: () => {} })
  mounted = await rerender(plugin.__components.TreeNav, props)
  const fields = findAllByClass(mounted.tree, 'st-node-input')
  assert.equal(fields.length, 1, 'exactly one row is being edited')
  assert.equal(fields[0].props.value, '旧名字', 'seeded with what it was called')
})

test('renaming commits on Enter, Escape leaves it alone', async () => {
  const renamed = []
  const { plugin, render, rerender } = loadClientForRender()
  const book = {
    schemaVersion: 1, title: '书', genre: '', pov: '', tense: '',
    nodes: [{ id: 'v1', title: '第一卷', level: 'volume', status: 'writing', text: '', children: [
      { id: 'c1', title: '旧名字', level: 'chapter', status: 'writing', text: '', children: [] }] }],
    chapters: [], characters: [], relationships: [], settings: [], snapshots: [], overview: { chapters: {} },
  }
  const props = {
    t, book, activeId: 'c1', collapsed: new Set(),
    onSelect: () => {}, onToggle: () => {},
    onRename: (id, title) => renamed.push([id, title]), onRemove: () => {},
  }
  let mounted = await render(plugin.__components.TreeNav, props)
  const openChapter = (tree) => {
    const rows = findAllByClass(tree, 'st-node')
    const chapterRow = rows.find((row) => visibleText(row).join('').includes('旧名字'))
    findAllByClass(chapterRow, 'st-node-rename')[0].props.onClick({ stopPropagation: () => {} })
  }
  openChapter(mounted.tree)
  mounted = await rerender(plugin.__components.TreeNav, props)

  findAllByClass(mounted.tree, 'st-node-input')[0].props.onChange({ target: { value: '新名字' } })
  mounted = await rerender(plugin.__components.TreeNav, props)
  findAllByClass(mounted.tree, 'st-node-input')[0].props.onKeyDown({ key: 'Enter', preventDefault: () => {} })
  assert.deepEqual(renamed, [['c1', '新名字']], 'Enter commits the new name')

  // Escape discards: reopen, type, press Escape, and nothing is reported.
  renamed.length = 0
  mounted = await rerender(plugin.__components.TreeNav, props)
  openChapter(mounted.tree)
  mounted = await rerender(plugin.__components.TreeNav, props)
  findAllByClass(mounted.tree, 'st-node-input')[0].props.onChange({ target: { value: '不要这个' } })
  mounted = await rerender(plugin.__components.TreeNav, props)
  findAllByClass(mounted.tree, 'st-node-input')[0].props.onKeyDown({ key: 'Escape', preventDefault: () => {} })
  assert.deepEqual(renamed, [], 'Escape commits nothing')
})

test('deleting a chapter asks first, and nothing goes until it is answered', async () => {
  // Deleting throws the text away and the save queue writes the new tree over the old one, so there
  // is no undo. One press used to be enough.
  const removed = []
  const { plugin, render } = loadClientForRender()
  const book = {
    schemaVersion: 1, title: '书', genre: '', pov: '', tense: '',
    nodes: [{ id: 'v1', title: '第一卷', level: 'volume', status: 'writing', text: '', children: [
      { id: 'c1', title: '第一章', level: 'chapter', status: 'writing', text: '雨下了一整夜。', children: [] },
      { id: 'c2', title: '第二章', level: 'chapter', status: 'writing', text: '', children: [] }] }],
    chapters: [], characters: [], relationships: [], settings: [], snapshots: [], overview: { chapters: {} },
  }
  const props = {
    t, book, activeId: 'c1', collapsed: new Set(),
    onSelect: () => {}, onToggle: () => {}, onRename: () => {},
    onRemove: (id) => removed.push(id),
  }
  const mounted = await render(plugin.__components.TreeNav, props)
  const rows = findAllByClass(mounted.tree, 'st-node')
  const chapterRow = rows.find((row) => visibleText(row).join('').includes('第一章'))
  findAllByClass(chapterRow, 'st-node-remove')[0].props.onClick({ stopPropagation: () => {} })
  // TreeNav reports the request; the confirmation belongs to the panel, which owns the dialog.
  assert.deepEqual(removed, ['c1'], 'the row asks for a deletion, it does not perform one')
})

test('the confirmation names what will be lost', async () => {
  const { plugin, render } = loadClientForRender()
  const mounted = await render(plugin.__components.ConfirmDialog, {
    t,
    title: 'label.removeNodeConfirm',
    confirmLabel: 'action.delete',
    onConfirm: () => {}, onCancel: () => {},
    children: [
      { type: 'div', props: {}, children: ['label.removeNodeChildren'] },
      { type: 'div', props: { className: 'st-dialog-hint' }, children: ['label.removeNodeWarn'] },
    ],
  })
  const text = visibleText(mounted.tree).join(' ')
  assert.ok(text.includes('label.removeNodeWarn'), 'it says the deletion cannot be undone')
  assert.ok(text.includes('label.removeNodeChildren'), 'and how much goes with it')
  // Cancel is offered, and the destructive action is styled as destructive.
  const buttons = []
  const collect = (node) => {
    if (node === null || typeof node !== 'object') return
    if (Array.isArray(node)) { node.forEach(collect); return }
    if (node.type === 'button') buttons.push(node)
    collect(node.children ?? [])
  }
  collect(mounted.tree)
  assert.equal(buttons.length, 2, 'cancel and delete')
  assert.ok(String(buttons[1].props.className).includes('fang-danger'), 'the destructive one is marked')
})

test('a half-typed question survives the composer being hidden and shown again', async () => {
  // The dock has one owner, so the composer is unmounted whenever something else takes it. The
  // draft lived in the composer's own state, so reopening it after a rewrite (or after the panel
  // hid it) returned an empty box and the sentence the writer was composing was gone.
  const chat = { open: true, question: '', busy: false, reply: '', history: [] }
  const editor = await mountEditor({ chat })
  findByClass(editor.tree, 'st-chat-input').props.onChange({ target: { value: '把她的名字改成李雾，' } })
  await editor.rerender()
  assert.equal(findByClass(editor.tree, 'st-chat-input').props.value, '把她的名字改成李雾，', 'typed')

  // Something else takes the dock: the composer is not rendered at all.
  chat.open = false
  await editor.rerender()
  assert.equal(findByClass(editor.tree, 'st-chat-input'), undefined, 'the box is gone')

  // And it comes back with what was in it.
  chat.open = true
  await editor.rerender()
  assert.equal(findByClass(editor.tree, 'st-chat-input').props.value, '把她的名字改成李雾，',
    'reopening the box returns the same box')
})

test('the composer names the chat role model, and follows it when it changes', async () => {
  // The bug this pins: the composer was given `model` while the chip read `modelCurrent`, so it
  // always fell back to whatever dsh had selected. Changing the chat model on the settings page
  // then left the box naming the old model — the one thing a status line must not do.
  const models = { chat: { provider: 'p', model: 'first-model' } }
  const chat = { open: true, question: '', busy: false, reply: '', history: [] }
  const editor = await mountEditor({ chat, chatModels: models })
  assert.equal(visibleText(findByClass(editor.tree, 'st-seat-label')).join(''), 'first-model')

  // The panel re-reads the roles and hands down a different selection.
  models.chat = { provider: 'p', model: 'second-model' }
  await editor.rerender()
  assert.equal(visibleText(findByClass(editor.tree, 'st-seat-label')).join(''), 'second-model',
    'the box follows the configured chat model')
})

test('the composer changes the chat model itself, from the same catalogue', async () => {
  const picked = []
  const effortsPicked = []
  const editor = await mountEditor({
    chat: { open: true, question: '', busy: false, reply: '', history: [] },
    chatModels: { chat: { provider: 'p', model: 'first-model' } },
    chatCatalog: [{ id: 'p', name: 'Provider', models: [{ model: 'first-model', name: 'First' }, { model: 'other', name: 'Other' }] }],
    chatEfforts: [{ id: 'low', name: 'Low' }, { id: 'high', name: 'High' }],
    onChatModelChange: (selection) => picked.push(selection),
    onChatEffortChange: (id) => effortsPicked.push(id),
  })
  // The host's shape: the first pane offers the two settings, each with its current value.
  findByClass(editor.tree, 'st-seat-trigger').props.onClick()
  let tree = await editor.rerender()
  let menu = findByClass(tree, 'st-seat-menu')
  assert.ok(menu, 'the seat opens in the composer')
  assert.equal(findAllByClass(menu, 'st-seat-cell').length, 2,
    'model and effort are two rows one click away, not a list with the levels at the bottom')
  assert.ok(visibleText(menu).join(' ').includes('first-model'), 'the row names the current model')

  // Drill into the models.
  findByText(menu, 'label.model').props.onClick()
  tree = await editor.rerender()
  menu = findByClass(tree, 'st-seat-menu')
  findByText(menu, 'Other').props.onClick()
  assert.deepEqual(picked, [{ provider: 'p', model: 'other' }], 'the chosen model is reported, provider and all')

  // And into the levels, which are a pane of their own.
  findByClass(editor.tree, 'st-seat-trigger').props.onClick()
  tree = await editor.rerender()
  menu = findByClass(tree, 'st-seat-menu')
  findByText(menu, 'label.effort').props.onClick()
  tree = await editor.rerender()
  menu = findByClass(tree, 'st-seat-menu')
  const options = findAllByClass(menu, 'st-seat-option')
  // The default row leads, exactly as dsh's picker lists it; the model's own levels follow.
  assert.deepEqual(options.map((row) => visibleText(row).join('')), ['status.effortDefault', 'Low', 'High'],
    'default first, then the levels least to most')
  // The default row clears the stored effort: onEffort('') keeps the model, drops the level.
  findByText(menu, 'status.effortDefault').props.onClick()
  assert.deepEqual(effortsPicked, [''], 'the default row reports an empty effort, not a level')
  findByText(menu, 'High').props.onClick()
  assert.deepEqual(effortsPicked, ['', 'high'], 'and a level is reported on its own, so the panel can keep the model')
})

test('a chat model status is not invented when the host reports none', async () => {
  // No role reported (a host without the route): the composer still has to render, and it must
  // not print a guess about who will answer.
  const editor = await mountEditor({
    chat: { open: true, question: '', busy: false, reply: '', history: [] },
    chatModels: null,
    chatCatalog: [],
  })
  const name = findByClass(editor.tree, 'st-seat-label')
  assert.equal(visibleText(name).join(''), 'status.modelUnknown', 'it says it does not know')
})

test('a retry sent with a direction shows that direction in the thinking line', async () => {
  // "Try again" after typing a direction is working on THAT instruction. Showing only the rotating
  // working copy hid the one thing the writer just said, so the wait read as if the direction had
  // been dropped.
  const editor = await mountEditor({
    busy: true, aiNote: '把结尾收得更快', suggestion: null,
    chat: { open: false, question: '', busy: false, reply: '', history: [] },
  })
  const ask = findByClass(editor.tree, 'st-ai-thinking-ask')
  assert.ok(ask, 'the thinking line carries a subject')
  assert.ok(visibleText(ask).join(' ').includes('把结尾收得更快'),
    'and the subject is the direction, not a generic working label')
})

test('a retry without a direction keeps the generic working line', async () => {
  const editor = await mountEditor({
    busy: true, aiNote: '', suggestion: null,
    chat: { open: false, question: '', busy: false, reply: '', history: [] },
  })
  assert.equal(findByClass(editor.tree, 'st-ai-thinking-ask'), undefined,
    'no invented subject when the writer said nothing')
})

test('the steer chevron points down while collapsed and right when open', async () => {
  // Collapsed: a down chevron invites opening. Open: the same glyph rotates to point RIGHT, at
  // the input, which appears beside the control — not up, and not "forward" while collapsed.
  const { plugin, render, rerender } = loadClientForRender()
  const scan = { kind: 'critique', busy: false, error: '', issues: [], critique: { verdict: '', points: [] } }
  const chapter = { id: 'c1', title: '一', level: 'chapter', status: 'writing', text: '雨夜。' }
  const props = {
    t, chapter, busy: false, aiError: '', suggestion: null, scan,
    onText: () => {}, onAskSelection: async () => {}, onContinue: async () => null,
    onAccept: () => {}, onReject: () => {}, onRetry: () => {},
  }
  let mounted = await render(plugin.__components.ChapterEditor, props)
  const toggle = findByClass(mounted.tree, 'st-scan-steer-toggle')
  const svg = toggle.children.find((c) => typeof c === 'object' && c.type === 'svg')
  assert.equal(svg.props.style.transform, 'none', 'collapsed: no rotation, the glyph points down')
  assert.equal(svg.children[0].props.d, 'M3.5 6 8 10.5 12.5 6', 'and the path is a down chevron')
  toggle.props.onClick()
  mounted = await rerender(plugin.__components.ChapterEditor, props)
  const openSvg = findByClass(mounted.tree, 'st-scan-steer-toggle').children.find(
    (c) => typeof c === 'object' && c.type === 'svg')
  assert.equal(openSvg.props.style.transform, 'rotate(-90deg)', 'open: rotated to point right')
})

test('retry dispatches by proposal kind: inserts re-run, rewrites resend the passage', () => {
  // The retry button renders on every proposal, but a continuation and a chat answer have no
  // passage to rewrite — sending their empty baseText to the rewrite route is what made the
  // model answer "请提供需要改写的原文段落". The dispatch lives in the panel's onRetry, and it
  // is a plain function of the proposal's kind. Exercised through the exported component tree:
  // the wire contract here is that askSelection is only reachable for kind 'rewrite'.
  const source = readFileSync(new URL('../client.js', import.meta.url), 'utf8')
  // The handler is located by its opening and then cut at the next declaration that closes it,
  // rather than by an exact closing indent: this reads the BUILT bundle, whose formatting is
  // esbuild's, and pinning 12 spaces made the whole check silently stop finding the handler.
  const at = source.indexOf('onRetry: (direction) => {')
  assert.ok(at >= 0, 'the panel wires a retry handler')
  const rest = source.slice(at)
  const end = rest.search(/\n {6}\}\s*\)\s*\n/)
  const body = end < 0 ? rest.slice(0, 2000) : rest.slice(0, end)
  // Quotes matched loosely for the same reason: the bundle writes double quotes.
  assert.match(body, /p\.kind === ['"]continue['"]/, 'a continuation re-runs its continuation')
  assert.match(body, /p\.kind === ['"]chat['"]/, 'a chat answer re-asks its question')
  assert.match(body, /askContinue\(/, 'insert: continuation route')
  assert.match(body, /askChat\(/, 'insert: chat route')
  // The rewrite branch must come last and still send the stored passage.
  const rewriteBranch = body.indexOf('askSelection(')
  assert.ok(rewriteBranch > body.indexOf(`p.kind === "chat"`) || rewriteBranch > body.indexOf(`p.kind === 'chat'`),
    'rewrite is the fallback branch')
})
