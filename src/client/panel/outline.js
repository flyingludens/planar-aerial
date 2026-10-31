/**
 * The outline and the editor.
 *
 * The outline is the chapter tree; the editor is the page the selected leaf is written on. They
 * are one file because a keystroke in the editor changes what the outline shows, and the two
 * share the find bar, the undo history and the typography budget.
 */
import { React, h } from '../shared/react.js'
import {
  findMatches, paintRuns, createHistory, proseLineBudget, UI_FONT_SIZE, UI_LINE_HEIGHT,
} from '../shared/logic.js'
import {
  resolveGestures, currentPlatform, chordMatches, isModifierChord,
  createLoneModifierWatcher, isModifierOnly, loneModifierKey,
} from '../shared/gestures.js'
import { ChatComposer, AiDock, DockHairline, AiThinking } from './composer.js'
import { ScanDock } from './scan.js'

/**
 * The outline: volumes, chapters and sections as a folded tree. Only leaves carry text, and
 * only a leaf can be selected — clicking a container just folds it, which keeps the tree
 * honest about what is editable.
 */
export function TreeNav({ t, book, activeId, onSelect, onToggle, collapsed, onRename, onRemove }) {
  const [editingId, setEditingId] = React.useState(null)
  const [draft, setDraft] = React.useState('')
  const rows = []
  const walk = (nodes, depth) => {
    for (const node of nodes ?? []) {
      const isContainer = node.children.length > 0
      const folded = collapsed.has(node.id)
      const chars = (node.text ?? '').length
      rows.push(h('div', {
        key: node.id,
        className: 'st-node',
        'data-depth': depth,
        'data-current': node.id === activeId ? 'true' : 'false',
        'data-level': node.level,
        role: 'button',
        tabIndex: 0,
        // A click SELECTS at every level. Folding is the caret's own control, because a
        // container that could only be folded could never be selected — and selection is what
        // decides where the next chapter or section is created.
        onClick: () => onSelect(node.id),
        onKeyDown: (e) => {
          if (e.key !== 'Enter' && e.key !== ' ') return
          e.preventDefault()
          onSelect(node.id)
        },
      },
        // Indentation encodes depth; a container also shows a fold caret.
        h('span', { style: { width: depth * 12 } }),
        isContainer
          ? h('span', {
              className: 'st-node-caret', role: 'button', tabIndex: 0,
              title: folded ? t('action.expand') : t('action.collapse'),
              'aria-expanded': folded ? 'false' : 'true',
              onClick: (e) => { e.stopPropagation(); onToggle(node.id) },
              onKeyDown: (e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return
                e.preventDefault()
                e.stopPropagation()
                onToggle(node.id)
              },
            }, folded ? '▸' : '▾')
          : h('span', { className: 'st-node-dot' }),
        editingId === node.id
          ? h('input', {
              className: 'st-input st-node-input', autoFocus: true, value: draft,
              onChange: (e) => setDraft(e.target.value),
              onClick: (e) => e.stopPropagation(),
              onBlur: () => { onRename(node.id, draft.trim()); setEditingId(null) },
              onKeyDown: (e) => {
                if (e.key === 'Enter') { e.preventDefault(); onRename(node.id, draft.trim()); setEditingId(null) }
                if (e.key === 'Escape') { e.preventDefault(); setEditingId(null) }
              },
            })
          : h('span', {
              className: 'st-node-name', title: node.title,
              onDoubleClick: (e) => { e.stopPropagation(); setDraft(node.title || ''); setEditingId(node.id) },
            }, node.title || t(`level.${node.level}`)),
        // Rename and delete sit together and appear on the same hover. The rename was only
        // reachable by double-clicking the name, which nothing announced — while delete had a
        // visible button. A destructive action should not be the discoverable one.
        h('button', {
          type: 'button', className: 'st-btn st-btn-ghost st-node-rename',
          title: t('action.renameNode'), 'aria-label': t('action.renameNode'),
          onClick: (e) => { e.stopPropagation(); setDraft(node.title || ''); setEditingId(node.id) },
        }, '✎'),
        h('button', {
          type: 'button', className: 'st-btn st-btn-ghost st-node-remove', title: t('action.removeNode'),
          onClick: (e) => { e.stopPropagation(); onRemove(node.id) },
        }, '×'),
        isContainer
          ? h('span', { className: 'st-muted', style: { flex: 'none' } }, String(node.children.length))
          : h('span', { className: 'st-muted', style: { flex: 'none' } }, chars === 0 ? t('label.emptyNode') : t('label.charCount', { n: chars }))))
      if (isContainer && !folded) walk(node.children, depth + 1)
    }
  }
  walk(book?.nodes ?? [], 0)
  if (rows.length === 0) return h('div', { className: 'st-muted' }, t('label.emptyChapters'))
  return h('div', { className: 'st-tree' }, rows)
}

/**
 * The writing surface: ONE editor for the selected chapter's whole body.
 *
 * There are no paragraph cards any more. The writer types into one continuous editor, and
 * every AI action takes the text they have selected — that is the only unit the model is
 * asked about, so there is nothing to attach a suggestion to except the selection itself.
 *
 * Two things are therefore rendered as temporary blocks rather than stored document state:
 *   - the ghost continuation, shown under the caret and inserted only on Enter;
 *   - the rewrite proposal, shown as a card over the selection with accept/reject.
 * Neither survives a reload, because neither is part of the manuscript until accepted.
 */

/**
 * The writing surface: ONE editor for the selected chapter's whole body.
 *
 * There are no paragraph cards any more. The writer types into one continuous editor, and
 * every AI action takes the text they have selected — that is the only unit the model is
 * asked about, so there is nothing to attach a suggestion to except the selection itself.
 *
 * Two things are therefore rendered as temporary blocks rather than stored document state:
 *   - the ghost continuation, shown under the caret and inserted only on Enter;
 *   - the rewrite proposal, shown as a card over the selection with accept/reject.
 * Neither survives a reload, because neither is part of the manuscript until accepted.
 */
export function ChapterEditor(props) {
  const { t, chapter, onText, onAskSelection, onContinue, suggestion, onAccept, onReject, onRetry, busy, aiNote,
    typography, onFlush, onSaveNow, chat, chatModels, chatCatalog, chatEfforts, onChatOpen, onChatClose,
    onChatSend, onChatModelChange, onChatEffortChange, answerCount, onAnswersToggle, onAnswersOpen, scan, onReview,
    onCritique, onScanClose } = props
  const textareaRef = React.useRef(null)
  const paintRef = React.useRef(null)
  /**
   * What the writer has typed into the question box but not sent.
   *
   * It lives with the editor rather than with the box: the box is unmounted whenever anything
   * else owns the dock (a rewrite, a scan, a sent question), and its own state died with it —
   * reopen the composer and the half-typed question was gone.
   */
  const [chatDraft, setChatDraft] = React.useState('')
  const [selection, setSelection] = React.useState({ start: 0, end: 0, text: '' })
  // Whole-text undo history. The controlled textarea's native stack is reset by React on every
  // keystroke, so undo has to be ours or there is none.
  const historyRef = React.useRef(null)
  if (historyRef.current === null) historyRef.current = createHistory(chapter.text ?? '')
  // The find bar: closed until asked for, and matching as the query is typed.
  const [finding, setFinding] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [hitIndex, setHitIndex] = React.useState(0)
  /**
   * The width the textarea's scrollbar takes, measured rather than assumed: a textarea with a
   * scrollbar has a narrower content box than the paint layer behind it, so the two wrap at
   * different points and every line below the first is misaligned — before anyone scrolls.
   */
  const [scrollbarWidth, setScrollbarWidth] = React.useState(0)
  /**
   * Whether the manuscript has focus.
   *
   * The browser stops drawing a textarea's selection the moment focus leaves it, so the writer
   * loses the visual trace of the passage they highlighted just by clicking into the composer.
   * Knowing the focus state lets the painted layer take over, in a muted wash.
   */
  const [focused, setFocused] = React.useState(false)

  /**
   * A continuation and a rewrite belong to the text they were asked about, so switching
   * chapters must not carry them over: they used to live only in this component's state, and
   * the component is reused when the chapter changes. Clearing on a chapter change is what
   * keeps a polish made in one section out of the next.
   */
  React.useEffect(() => {
    setSelection({ start: 0, end: 0, text: '' })
    // A search belongs to the text it was run against; a new chapter starts clean.
    setFinding(false)
    setQuery('')
    setHitIndex(0)
    // Undo is per chapter: an entry holding the previous chapter's prose would paste one
    // chapter into another on Cmd+Z.
    historyRef.current.reset(chapter.text ?? '')
  }, [chapter.id])

  // Measure the scrollbar whenever the text can reflow or the editor can appear/disappear.
  React.useEffect(() => {
    const node = textareaRef.current
    if (node === null || node === undefined) return
    const measure = () => setScrollbarWidth(Math.max(0, node.offsetWidth - node.clientWidth))
    measure()
  }, [chapter.id, typography?.fontSize, typography?.lineHeight, typography?.width, finding])

  // The probe of what is selected has to run after the browser applied the selection, so it
  // is read from the live element rather than tracked key by key.
  const readSelection = () => {
    const node = textareaRef.current
    if (node === null) return { start: 0, end: 0, text: '' }
    const start = node.selectionStart ?? 0
    const end = node.selectionEnd ?? 0
    return { start, end, text: node.value.slice(start, end) }
  }

  /**
   * Keep the painted layer under the same scroll offset as the textarea.
   *
   * The paint layer is `overflow: hidden`, so a chapter longer than the editor scrolled the
   * textarea alone: the glyphs the writer was reading stayed pinned to the first screen while
   * the caret went off below. Copying the offset is what keeps the two in one place.
   */
  const syncScroll = (event) => {
    const node = event?.currentTarget ?? textareaRef.current
    const paint = paintRef.current
    if (node === null || paint === null || paint === undefined) return
    paint.scrollTop = node.scrollTop
    paint.scrollLeft = node.scrollLeft
  }

  /** Move the caret to a hit; the browser scrolls it into view and `onScroll` follows. */
  const focusHit = (hit) => {
    const node = textareaRef.current
    if (node === null || hit === undefined) return
    node.focus()
    node.setSelectionRange(hit.start, hit.end)
    setSelection({ start: hit.start, end: hit.end, text: node.value.slice(hit.start, hit.end) })
  }

  /**
   * Put `replacement` over a range and record it as one undoable step.
   *
   * Every write to the manuscript inside the editor goes through here, so the history cannot
   * be bypassed by one call site and leave an un-undoable change behind.
   */
  const splice = (start, end, replacement, kind = 'replace') => {
    const current = chapter.text ?? ''
    const next = current.slice(0, start) + replacement + current.slice(end)
    historyRef.current.record(next, { start: start + replacement.length, end: start + replacement.length }, kind)
    onText(next)
    return next
  }

  /**
   * Everything the three AI actions need to know about where the writer is standing.
   *
   * One function, used by the rewrite, the continuation and the chat alike. They used to
   * gather their own: the rewrite sent only the passage, the continuation sent windows around
   * the caret, and the chat sent neither. Three answers to the same question, so the same
   * question could produce three different results depending on which control was pressed.
   *
   * The windows are capped here rather than at the call sites: a chapter can be ten thousand
   * characters and none of these actions needs more than the paragraph in front of the writer.
   */
  const editorContext = (windows = {}) => {
    const live = liveSelectionRange()
    const source = chapter.text ?? ''
    const start = Number.isInteger(live.start) ? Math.max(0, Math.min(source.length, live.start)) : source.length
    const end = Number.isInteger(live.end) ? Math.max(start, Math.min(source.length, live.end)) : start
    const leadChars = Number.isFinite(windows.lead) ? windows.lead : 600
    const trailChars = Number.isFinite(windows.trail) ? windows.trail : 300
    return {
      // The selection, both as offsets and as text: the rewrite replaces by range, the chat
      // describes it, and the continuation ignores it.
      start,
      end,
      selection: source.slice(start, end),
      // Around the caret, for anything that has to read on from here.
      before: leadChars <= 0 ? '' : source.slice(Math.max(0, start - leadChars), start),
      after: trailChars <= 0 ? '' : source.slice(end, end + trailChars),
      // The whole chapter, for callers that need to search or split it.
      text: source,
    }
  }

  /**
   * What is selected right now, as text.
   *
   * The textarea's own range when it is live, otherwise the last thing the component probed —
   * the composer has focus by the time a question is sent, so the textarea's own selection is
   * still set even though the field is not focused.
   */
  const liveSelectionRange = () => {
    const node = textareaRef.current
    if (node !== null && node !== undefined && Number.isInteger(node.selectionStart) && Number.isInteger(node.selectionEnd)) {
      const start = node.selectionStart
      const end = node.selectionEnd
      return { start, end, text: node.value.slice(start, end) }
    }
    // The composer has focus by the time a question is sent, so the textarea's live range may be
    // stale. The last probed selection is the better answer then.
    return { start: selection.start, end: selection.end, text: selection.text ?? '' }
  }

  /** The caret to insert at when a proposal carries no position: the live one, else the end. */
  const caretForInsert = () => {
    const node = textareaRef.current
    if (node !== null && node !== undefined && Number.isInteger(node.selectionStart)) return node.selectionStart
    return (chapter.text ?? '').length
  }

  /**
   * The range a rewrite applies to.
   *
   * The proposal's own recorded range comes FIRST. Reading the live textarea was wrong for two
   * reasons that both bit: pressing a button in the dock moves focus out of the textarea, and a
   * blurred textarea can report a collapsed selection — so "retry" and "accept" would apply a
   * patch to the wrong place, or to nothing. The live selection is only a fallback for a
   * proposal that carries no range at all.
   */
  const proposalRange = () => {
    const own = openProposal !== null && openProposal !== undefined
    if (own && Number.isInteger(openProposal.from) && Number.isInteger(openProposal.to)) {
      return { start: openProposal.from, end: openProposal.to }
    }
    const node = textareaRef.current
    if (node !== null && node !== undefined && Number.isInteger(node.selectionStart)
      && Number.isInteger(node.selectionEnd) && node.selectionEnd !== node.selectionStart) {
      return { start: node.selectionStart, end: node.selectionEnd }
    }
    return { start: selection.start, end: selection.end }
  }

  /**
   * Accept the open proposal: a rewrite replaces its range, a continuation is inserted at the
   * caret it was asked about. Both are the same card and the same action.
   */
  const acceptProposal = (proposal) => {
    if (proposal === null || proposal === undefined) return
    // A cast change is not text: it edits the book's cast and settings, which the panel owns.
    // Accepting it here only has to hand it over — splicing it into the manuscript would paste
    // a character sheet into the middle of the novel.
    if (proposal.kind === 'cast') { onAccept(proposal.id); return }
    const current = chapter.text ?? ''
    if (proposal.kind === 'continue' || proposal.kind === 'chat') {
      // Both are insertions: a continuation continues the sentence, a chat answer is text the
      // writer asked for. Neither has a range of its own, so they land at the caret.
      const at = Number.isInteger(proposal.at) ? proposal.at : caretForInsert()
      splice(at, at, proposal.proposedText)
    } else {
      const range = proposalRange()
      splice(range.start, range.end, proposal.proposedText)
    }
    onAccept(proposal.id)
    // The caret goes after what was just written, which is where the next sentence starts.
    const node = textareaRef.current
    if (node !== null && node !== undefined) {
      const at = proposal.kind === 'continue' || proposal.kind === 'chat'
        ? (Number.isInteger(proposal.at) ? proposal.at : current.length) + proposal.proposedText.length
        : undefined
      if (at !== undefined) {
        node.focus()
        node.setSelectionRange(at, at)
      }
    }
  }

  /** Step the history and write the result back, caret included. */
  const applyHistory = (entry) => {
    if (entry === undefined) return false
    onText(entry.text)
    const node = textareaRef.current
    if (node !== null && node !== undefined) {
      node.value = entry.text
      node.setSelectionRange(entry.start, entry.end)
    }
    setSelection({ start: entry.start, end: entry.end, text: entry.text.slice(entry.start, entry.end) })
    return true
  }

  const undo = () => applyHistory(historyRef.current.undo())
  const redo = () => applyHistory(historyRef.current.redo())

  /**
   * The gestures, resolved once per mount.
   *
   * Tab asks for the next sentence; ⌥Tab copy-edits the section; ⌥⌘ critiques it. None of
   * them waits for a second press, so none delays the action the writer asked for — see
   * `gestureKeys` for why the double-press versions had to go, and what Windows uses instead
   * of Alt+Tab. `platform` is a prop so a test can pin the platform instead of inheriting
   * whatever the machine running it happens to be.
   */
  const platform = props.platform ?? currentPlatform()
  // The resolved gestures come from the PANEL, which owns the stored overrides. This component
  // used to resolve them itself from a name it could not see (a sibling's state), which threw
  // the moment anything mounted the editor on its own. A prop keeps one owner and one answer.
  const keys = props.keys ?? resolveGestures(platform, props.chordOverrides)
  const mac = platform === 'macos'
  // The caret windows the critique gesture ran with. The dock's steer box re-runs the pass on
  // the same prose — a direction about a passage the writer has since scrolled away from would
  // be a critique of nothing — so the windows outlive the chord that captured them.
  const critiqueCaret = React.useRef(null)

  /**
   * Two gestures heard wherever the writer's hands are: the critique chord, and a lone modifier
   * that opens the composer.
   *
   * On `document`, not on the textarea: the gesture has to work in the manuscript, in the
   * question box the chord itself opened, or with focus on nothing at all (after a click on the
   * page background the textarea is not focused, and a listener attached to it hears nothing).
   *
   * Scoped by the target instead: only presses inside this panel's own subtree count, so a
   * writer with another panel focused does not start a critique here.
   *
   * The ask chord is NOT handled here. It is a keydown on the textarea: an answer is a
   * continuation at the caret, and that only exists while the editor has focus. 行文审阅 is
   * here, because Option+Command is a modifier-only gesture with no caret to anchor it.
   */
  React.useEffect(() => {
    if (typeof document === 'undefined' || typeof document.addEventListener !== 'function') return undefined
    /**
     * Is this press meant for the panel?
     *
     * Three cases, all of them the writer working here: the target is inside this panel's own
     * subtree; the target is the document body because nothing has focus (the common case
     * after clicking the page background); or the event carries no target at all (synthetic).
     * Anything else — a field in another panel, a dialog elsewhere in the host — is left alone,
     * so the shortcut does not reach across the application.
     */
    const ours = (event) => {
      const target = event?.target
      if (target === null || target === undefined) return true
      if (typeof target.closest === 'function' && target.closest('.st-shell') !== null) return true
      // `body`/`html` means "no element has focus", not "some other panel has it". A real focus
      // elsewhere always has a target that is an element in that other panel.
      const tag = String(target.tagName ?? '').toUpperCase()
      return tag === 'BODY' || tag === 'HTML'
    }
    // A lone modifier opens the composer. It is watched rather than matched because the press
    // it must recognise has no other key in it at all.
    const openChat = () => {
      if (typeof onChatOpen !== 'function') return
      // Probe FIRST: opening the composer moves focus out of the textarea, and the panel needs
      // to know what was highlighted before that happened, or a question about a passage
      // arrives with nothing selected and takes the chat route instead of the rewrite route.
      setSelection(readSelection())
      onChatOpen()
    }
    // The composer key is a lone modifier press only while it is STILL that kind of gesture. The
    // writer can rebind it to a chord, and then there is no lone press left to watch: the chord is
    // matched on keydown below, like the other two. An empty trigger means "watch nothing".
    const chatTrigger = loneModifierKey(keys.chat, mac)
    const press = createLoneModifierWatcher(openChat, mac, chatTrigger === '' ? '·' : chatTrigger)
    const onKeyDown = (event) => {
      if (!ours(event)) return
      // The composer's chord, when that is what it has been rebound to. Ordinary modifiers stay a
      // press of their own (watched above), so this only runs for a chord with a letter under it.
      if (isModifierOnly(keys.chat) !== true && chordMatches(event, keys.chat, mac)) {
        event.preventDefault()
        openChat()
        return
      }
      // 行文审阅: a press whose whole content is Option+Command. Checked before the critique
      // chord, and before the lone-modifier watcher, because both start with the same
      // modifiers. `typedSince()` is false only while nothing but modifiers has been pressed,
      // so ⌘C does not read the section on its way past.
      if (isModifierChord(event, keys.review, mac) && press.typedSince() !== true) {
        event.preventDefault()
        press.markUsed()
        if (typeof onReview === 'function') onReview()
        return
      }
      if (chordMatches(event, keys.critique, mac)) {
        // Claim it: the host page might bind the same chord, and the gesture should not also
        // do something underneath the panel.
        event.preventDefault()
        if (typeof onCritique !== 'function') return
        // The caret goes with the request: a critique has to be about the prose the writer is
        // sitting in, not about the section's opening. Wider windows than a continuation's,
        // because judging a sentence needs the paragraph it lives in. Kept so the dock's
        // steer box can re-run the pass on the same prose.
        const caret = editorContext({ lead: 1200, trail: 400 })
        critiqueCaret.current = caret
        onCritique(caret, '')
        return
      }
      press.keydown(event)
    }
    const onKeyUp = (event) => { if (ours(event)) press.keyup(event) }
    document.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('keyup', onKeyUp, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.removeEventListener('keyup', onKeyUp, true)
    }
  }, [])

  /**
   * One key, two behaviours, chosen by the selection:
   *   selected text  → a REWRITE of exactly that passage, offered as a proposal;
   *   nothing selected → a CONTINUATION, inserted at the CARET as a proposal.
   *
   * The caret, not the end of the chapter: continuing from the end while the writer works in
   * the middle of a paragraph put the new sentence in the wrong place entirely.
   */
  const trigger = async () => {
    const current = readSelection()
    setSelection(current)
    if (current.text.trim() !== '') {
      // The same context object the chat gets. The rewrite only needs `selection` and the
      // surrounding prose, but passing the whole thing keeps the three actions from drifting.
      const context = editorContext({ lead: 400, trail: 200 })
      await onAskSelection(current.text, chapter.text ?? '', { start: context.start, end: context.end }, context)
      return
    }
    // The panel turns the answer into a proposal; the editor only supplies the caret, which
    // the proposal carries as `at` so accepting inserts at the spot it was asked about.
    const at = current.start
    await onContinue(chapter.text ?? '', at, editorContext({ lead: 400, trail: 200 }))
  }

  const text = chapter.text ?? ''
  /**
   * The one open proposal, of either kind. A continuation is also a proposal but has no diff
   * to show: it is inserted, not substituted.
   */
  const openProposal = suggestion ?? null
  const hits = finding ? findMatches(text, query) : []
  // A shrinking match list must not keep pointing past its end.
  const activeHit = hits.length === 0 ? -1 : Math.min(hitIndex, hits.length - 1)
  /**
   * The painted runs, with the selection drawn even when the textarea is not focused.
   *
   * A selection that stops being drawn the moment the writer clicks into the composer looks
   * like it was lost — which is exactly what it looked like before. The wash is the muted one
   * a background window uses, so it does not compete with the live selection when the editor
   * does have focus.
   */
  const runs = paintRuns(text, {
    hits,
    activeIndex: activeHit,
    // Only while the editor is NOT focused: when it is, the browser draws the real selection
    // on top and two washes would stack into a muddy block.
    selection: focused ? undefined : { start: selection.start, end: selection.end },
  })
  const step = (delta) => {
    if (hits.length === 0) return
    const next = (activeHit + delta + hits.length) % hits.length
    setHitIndex(next)
    focusHit(hits[next])
  }
  const closeFind = () => {
    setFinding(false)
    setQuery('')
    setHitIndex(0)
    const node = textareaRef.current
    if (node !== null && node !== undefined) node.focus()
  }

  /**
   * Typography is applied as three variables on the desk rather than to one layer: both the
   * textarea and the paint layer read them, so a change cannot make them wrap differently.
   */
  const style = typography === null || typography === undefined ? undefined : {
    '--st-font-size': `${typography.fontSize}px`,
    '--st-line-height': String(typography.lineHeight),
    '--st-width': `${typography.width}px`,
    // Fixed, deliberately: the dock's chrome is not part of the manuscript, so a change to how
    // the BOOK reads must not resize the input box.
    '--st-font-ui': `${UI_FONT_SIZE}px`,
    '--st-leading-ui': `${UI_LINE_HEIGHT}px`,
  }
  /**
   * The text either side of where an insertion will land, trimmed to a readable window.
   *
   * A rewrite has a range under it, so the diff already shows its surroundings. An insertion
   * has none: without a few words on each side, the dock showed a sentence floating with no
   * indication of what it would attach to.
   */
  const insertionContext = (() => {
    if (openProposal === null) return { before: '', after: '' }
    const isInsert = openProposal.kind === 'continue' || openProposal.kind === 'chat'
    if (!isInsert) return { before: '', after: '' }
    const at = Number.isInteger(openProposal.at) ? openProposal.at : caretForInsert()
    const source = chapter.text ?? ''
    const clamp = Math.max(0, Math.min(source.length, at))
    /**
     * Three or four characters, and no more.
     *
     * The job of these neighbours is orientation, not reading: enough to recognise which
     * sentence the insertion lands in. A sentence of context turned the dock into a page of
     * prose with a suggestion buried in it, and for Chinese the old word-boundary trimming did
     * nothing at all (there are no spaces to cut on), so the window was an arbitrary forty
     * characters anyway.
     */
    const limit = 4
    const trim = (raw, keepTail) => (raw.length <= limit
      ? raw
      // A dangling space or newline at the cut reads as a missing word; drop it.
      : (keepTail ? raw.slice(-limit) : raw.slice(0, limit)).replace(/^\s+|\s+$/g, ''))
    return {
      before: trim(source.slice(0, clamp), true),
      after: trim(source.slice(clamp), false),
    }
  })()
  /**
   * Which model answers the side chat.
   *
   * The `chat` role, not the writing roles: the composer's chip names who will reply, and
   * `continue`/`suggest` are different (and usually cheaper) routes. Undefined when the host
   * did not report one, and the chip is omitted rather than showing a guess.
   */
  const chatCurrent = (() => {
    const role = chatModels === null || chatModels === undefined ? undefined : chatModels.chat
    // The whole selection, not just the model id: the picker marks the current row and names
    // the effort by provider too, and a bare string made it fall back to the session's model.
    return role !== null && typeof role === 'object' && typeof role.model === 'string' && role.model !== ''
      ? role
      : undefined
  })()

  // `data-docked` lets the stylesheet close the page up to the dock: the desk's own bottom
  // padding would otherwise leave a strip of empty page between the suggestion and the edge.
  // The composer is part of the dock: while it is open the page gives up its bottom padding,
  // exactly as it does for a suggestion.
  const composerOpen = chat !== undefined && chat !== null && chat.open === true
  /**
   * Whether the output box is expanded.
   *
   * The dock is PERSISTENT: with a result in it and the box collapsed, the dock lives on as a
   * thin glowing hairline at the page's bottom edge, and clicking the hairline expands the box
   * again with the SAME result — nothing is discarded by dismissing it. A new result arriving
   * re-expands on its own; the writer only ever collapses deliberately.
   *
   * Collapsed by default: with nothing to show the dock is the hairline alone, and clicking
   * it opens the EMPTY shell. The box must not sit open over the manuscript before anything
   * has been asked.
   */
  const [dockOpen, setDockOpen] = React.useState(false)
  /**
   * A question has been asked and the answer is not in yet.
   *
   * This is its own state, not `busy`: `busy` belongs to the rewrite and continuation calls,
   * and the chat runs on its own. Without it the moment between sending and the answer was a
   * blank dock — the writer saw their question disappear and nothing at all happen.
   */
  const chatWaiting = chat !== undefined && chat !== null && chat.busy === true
  const working = busy === true || chatWaiting
  /**
   * Which of the three things owns the dock, or none.
   *
   * One slot, one owner, in priority order: work in progress, then an answer waiting, then the
   * question box. The composer is LAST on purpose — it is the writer's own input, and leaving
   * it up while a rewrite is running covered the thinking row and the answer, so the writer
   * could not see what they had just asked for. Hiding it is a display decision: `chat.open`
   * is untouched, so the box comes back by itself when the dock is free again.
   */
  // A section scan outranks an old proposal: the writer just asked about the whole section, so
  // the answer to that is what they are waiting for. It sits below "working", so a request in
  // flight is never hidden behind a stale result.
  /**
   * Is the passage on screen short enough to be set in the book's own type?
   *
   * Recomputed only when the page settings change, which is the only thing the budget depends
   * on. Counting the passage's characters is cheap but happens on every render of a component
   * that re-renders on every keystroke, so the BUDGET is memoised and only the comparison runs
   * each pass. A pure function of the settings, so it is also testable without a browser.
   */
  const proseBudget = React.useMemo(
    () => proseLineBudget(typography),
    [typography?.fontSize, typography?.width])
  // Only a proposed passage qualifies. A chat reply is a remark, a cast list is a form, and the
  // composer is the writer's own typing: all of them stay in interface type.
  const dockProse = (() => {
    if (openProposal === null || openProposal === undefined) return 'short'
    const kind = openProposal.kind
    if (kind !== 'rewrite' && kind !== 'continue') return 'short'
    const text = typeof openProposal.proposedText === 'string' ? openProposal.proposedText : ''
    // Whitespace does not take a line of its own in the rendered block, so it is not counted.
    const visible = text.replace(/\s/g, '').length
    return visible <= proseBudget ? 'short' : 'long'
  })()
  const scanOpen = scan !== undefined && scan !== null && scan.kind !== null
  // The composer is a REQUEST, not a result, so it outranks things that are only being read.
  //
  // It used to sit last, below a proposal: with an answer on screen, pressing Command flipped
  // `chat.open` to true and the dock still showed the proposal, so the key looked dead. The box
  // you asked for has to appear; the answer it covers is not lost — it is still `openProposal`,
  // still behind the hairline, and comes back the moment the composer is closed.
  //
  // Only work in flight stays above it: a request that is already running owns the dock, and
  // the composer is hidden for the duration (its own state is kept, so it returns by itself).
  const dockMode = working && (openProposal === null || chatWaiting)
    ? 'working'
    : scanOpen ? 'scan'
      : composerOpen ? 'composer'
        : openProposal !== null ? 'proposal' : null
  // A NEW result re-expands the box: the writer collapsed an older one, asked for something
  // else, and the answer to the new ask must not land hidden behind the hairline. Only the
  // arrival modes — a finished scan, a proposal, a composer — count; "working" must not flip
  // the box open again while the writer is reading something above it.
  React.useEffect(() => {
    if (dockMode === 'scan' || dockMode === 'proposal' || dockMode === 'composer') setDockOpen(true)
  }, [dockMode, scan?.kind, openProposal?.id])
  // The hairline is the dock at rest: a result kept but collapsed, or nothing to show.
  // Working shows ON the hairline (the strongest glow, the rotating copy), and the box opens
  // only when the result arrives.
  const hasContent = dockMode !== null
  // The box opens ONLY for content. There is no empty shell: with nothing to show the
  // dock is the hairline alone, and an empty frame popping open tells the writer nothing.
  const expanded = dockMode !== 'working' && hasContent && dockOpen
  // The composer is a working surface, not a result: it keeps its own visibility rule and
  // must not be hidden behind the hairline by a collapse meant for a result.
  const showBox = expanded || dockMode === 'composer'
  return h('div', { className: 'st-desk', style, 'data-docked': showBox ? 'true' : 'false' },
    h('div', { className: 'st-desk-head' },
      h('h2', { className: 'st-desk-title' }, chapter.title || t(`level.${chapter.level}`)),
      // Nothing else on this line. The chapter's word count and the save state both already have
      // a home in the status bar, and repeating them under the title made the header a read-out —
      // two places reporting the same number, which is two places that can disagree.
      h('span', { className: 'st-spacer' }),
    // The find bar is IN the header, not above the page: a row of its own pushed the manuscript
    // down every time it opened, and the writer lost their place in the text for a search.
    finding ? h('div', { className: 'st-find' },
      h('input', {
        className: 'st-find-input', value: query, autoFocus: true,
        placeholder: t('label.findPlaceholder'),
        // The bar owns Enter/Escape while it is open, so a query never reaches the editor's
        // AI shortcuts.
        onChange: (e) => { setQuery(e.target.value); setHitIndex(0) },
        onKeyDown: (e) => {
          if (e.key === 'Enter') { e.preventDefault(); step(e.shiftKey ? -1 : 1); return }
          if (e.key === 'Escape') { e.preventDefault(); closeFind() }
          // The chord that opened it closes it, from inside the field as well.
          if ((e.metaKey === true || e.ctrlKey === true) && (e.key === 'f' || e.key === 'F')) {
            e.preventDefault(); closeFind()
          }
        },
      }),
      h('span', { className: 'st-find-count' }, query === ''
        ? ''
        : hits.length === 0
          ? t('label.noMatches')
          : t('label.matchCount', { i: activeHit + 1, n: hits.length })),
      h('button', {
        type: 'button', className: 'st-btn st-btn-ghost', disabled: hits.length === 0,
        title: t('label.findPrev'), 'aria-label': t('label.findPrev'),
        onClick: () => step(-1),
      }, '↑'),
      h('button', {
        type: 'button', className: 'st-btn st-btn-ghost', disabled: hits.length === 0,
        title: t('label.findNext'), 'aria-label': t('label.findNext'),
        onClick: () => step(1),
      }, '↓'),
      h('button', { type: 'button', className: 'st-btn st-btn-ghost', title: t('action.close'), onClick: closeFind }, '✕'))
      // While the bar is open its own controls replace the two buttons: showing both put two
      // ways to close the same thing side by side and made the row wider than the page.
      : h(React.Fragment, null,
        // The find entry is an icon, not a word: the row it sits in is a row of controls, and the
        // magnifier reads at the same size the keycaps beside it do. Its title carries the one
        // thing the glyph cannot show — the chord.
        h('button', {
          type: 'button', className: 'st-btn st-btn-ghost', title: t('label.findHint'),
          'aria-label': t('action.find'), 'aria-pressed': 'false',
          onClick: () => { setFinding(true); setHitIndex(0) },
        }, h('svg', {
          className: 'st-icon-xs', viewBox: '0 0 16 16', 'aria-hidden': true,
          fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
        }, h('circle', { cx: '7', cy: '7', r: '4.5' }), h('path', { d: 'M10.5 10.5 14 14' }))),
        // The three AI controls together, because they are the same kind of thing: what the
        // panel can do to this chapter. Putting the question box in the window title instead
        // separated it from the button it belongs beside.
        h('button', {
          type: 'button', className: 'st-btn st-btn-ghost st-ai-trigger', disabled: busy === true,
          title: t('label.aiTriggerHint', { keys: keys.askHint }), onClick: trigger,
        }, busy === true ? '…' : t('action.aiTrigger'), h('span', { className: 'st-kbd' }, keys.askLabel)),
        h('button', {
          type: 'button', className: 'st-btn st-btn-ghost st-ai-trigger',
          'aria-pressed': chat !== undefined && chat !== null && chat.open === true ? 'true' : 'false',
          title: t('label.chatButtonHint', { critique: keys.critiqueHint, review: keys.reviewHint }),
          onClick: () => { if (typeof onChatOpen === 'function') onChatOpen() },
        // The composer's own gesture, not a chord: it opens on a LONE modifier press, so the
        // keycap shows that modifier and nothing else. It used to show the review chord, which
        // was left over from when the two were the same key.
        }, t('action.ask'), h('span', { className: 'st-kbd' }, keys.chatLabel)),
        h('button', {
          type: 'button', className: 'st-btn st-btn-ghost st-ai-trigger',
          'aria-pressed': typeof onAnswersOpen === 'function' && onAnswersOpen() === true ? 'true' : 'false',
          onClick: () => { if (typeof onAnswersToggle === 'function') onAnswersToggle() },
        }, t('action.answers'), typeof answerCount === 'number' && answerCount > 0
          ? h('span', { className: 'st-count' }, String(answerCount)) : null))),
    h('div', { className: 'st-editor-wrap' },
      h('div', { className: 'st-editor-stack' },
        // The painted layer. `aria-hidden` keeps screen readers on the real textarea, and
        // whitespace is preserved so the continuation lands right after the last character.
        // The right padding is the scrollbar the textarea reserves, so both wrap identically.
        h('div', {
          className: 'st-editor-paint', 'aria-hidden': true, ref: paintRef,
          style: scrollbarWidth === 0 ? undefined : { paddingRight: `${scrollbarWidth}px` },
        },
          ...runs.map((run, i) => {
            if (!run.hit && !run.selected) return run.text
            const className = [run.hit ? 'st-hit' : '', run.selected ? 'st-selected' : ''].filter(Boolean).join(' ')
            return h('span', {
              key: i, className,
              ...(run.hit ? { 'data-active': run.active ? 'true' : 'false' } : {}),
            }, run.text)
          })),
        h('textarea', {
          className: 'st-editor st-editor-full st-editor-over', ref: textareaRef, value: text,
          onChange: (e) => {
            // Record BEFORE handing the text up: the snapshot is what undo restores, and an
            // AI rewrite reads it as the pre-edit state.
            const caret = e.target.selectionStart ?? e.target.value.length
            historyRef.current.record(e.target.value, { start: caret, end: caret })
            onText(e.target.value)
                  },
          onFocus: () => setFocused(true),
          onBlur: () => {
            setFocused(false)
            // The last probe before the field loses focus: the selection is still readable
            // here, and it is what the painted layer will keep drawing.
            setSelection(readSelection())
            if (typeof onFlush === 'function') onFlush()
          },
          onScroll: syncScroll,
          onSelect: () => setSelection(readSelection()),
          onMouseUp: () => setSelection(readSelection()),
          onKeyUp: (e) => {
            // Shift+arrows move the selection without a mouse; keep the probe current.
            if (e.shiftKey) setSelection(readSelection())
          },
          onKeyDown: (e) => {
            // An IME is composing: Enter is confirming a candidate and Tab may be cycling
            // through them. Intercepting either here swallowed the characters a Chinese
            // input method was in the middle of committing. keyCode 229 is what older
            // engines report for the same state.
            if (e.isComposing === true || e.nativeEvent?.isComposing === true || e.keyCode === 229) return
            const mod = e.metaKey === true || e.ctrlKey === true
            // The chords a text editor is expected to answer, in one place: Cmd/Ctrl+S saves
            // now, F finds, Z and Shift+Z undo and redo. Ctrl is accepted as well as Cmd so
            // the panel behaves the same on Windows and Linux.
            if (mod && (e.key === 's' || e.key === 'S')) {
              e.preventDefault()
              if (typeof onSaveNow === 'function') onSaveNow()
              return
            }
            // The chord toggles. Pressing it twice is the fastest way out for anyone used to
            // an editor, and it costs nothing: the alternative was having to reach for Esc.
            if (mod && (e.key === 'f' || e.key === 'F')) {
              e.preventDefault()
              if (finding) closeFind()
              else { setFinding(true); setHitIndex(0) }
              return
            }
            if (mod && (e.key === 'z' || e.key === 'Z')) {
              e.preventDefault()
              if (e.shiftKey === true) redo(); else undo()
              return
            }
            if (mod && (e.key === 'y' || e.key === 'Y')) { e.preventDefault(); redo(); return }
            // Cmd+Enter takes the open proposal, whichever kind it is.
            if (mod && e.key === 'Enter' && openProposal !== null) {
              e.preventDefault()
              acceptProposal(openProposal)
              return
            }
            // A bare Enter takes a continuation, which is the shortcut the hint row teaches.
            if (e.key === 'Enter' && openProposal !== null && openProposal.kind === 'continue' && !e.shiftKey) {
              e.preventDefault()
              acceptProposal(openProposal)
              return
            }
            // One gesture is a plain chord on Tab and one is not: ⌥Tab copy-edits the section,
            // while 行文审阅 is ⌥⌘ with nothing under it. Both are checked BEFORE the plain Tab
            // below, or the plain one would swallow them. A held chord auto-repeats, and one
            // request per emitted character is not what a writer holding a key asked for.
            if (chordMatches(e, keys.critique, mac)) {
              e.preventDefault()
              if (e.repeat === true) return
              if (typeof onCritique === 'function') {
                const caret = editorContext({ lead: 1200, trail: 400 })
                critiqueCaret.current = caret
                onCritique(caret, '')
              }
              return
            }
            if (isModifierChord(e, keys.review, mac)) {
              e.preventDefault()
              if (e.repeat === true) return
              if (typeof onReview === 'function') onReview()
              return
            }
            // Tab alone asks for the next sentence, exactly as before.
            if (chordMatches(e, keys.ask, mac)) {
              if (e.repeat === true) { e.preventDefault(); return }
              e.preventDefault()
              trigger()
              return
            }
            // Escape puts away whatever owns the dock, and it takes the visible one first: a
            // scan outranks a proposal there, so dismissing the proposal that is not on screen
            // would look like the key did nothing. One key, one dismissal.
            // Escape collapses the dock, it does not discard: the result stays behind the
            // hairline and one click brings it back. Clearing the state would throw away an
            // answer the writer only wanted out of the way.
            if (e.key === 'Escape' && scanOpen) { e.preventDefault(); setDockOpen(false); return }
            if (e.key === 'Escape' && openProposal !== null) { e.preventDefault(); setDockOpen(false) }
          },
        }))),
    // The dock under the page: the working state, the suggestion, or the question box.
    //
    // The composer yields to the other two. Opening it and then asking for a rewrite or a
    // continuation used to leave the box on screen where it covered the thinking row and the
    // answer — the writer could not see what they had just asked for. It is hidden while
    // something else owns the dock, and comes back on its own once that is done, because
    // `chat.open` is kept: the hide is a display decision, not a dismissal.
    //
    // The dock is persistent, and ONE container holds both faces: the box when it is open,
    // the hairline pressed against the box's bottom edge when it is not. The line never
    // floats away from where the box would pop out of — it IS the box's closed edge. The
    // idle line (nothing kept) and the kept line look the same and both open the shell.
    h('div', { className: 'st-dock-slot' },
      showBox ? h('div', {
        className: `st-ai-dock${dockMode === 'working' ? ' st-ai-dock-busy' : ''}`,
        // What kind of thing is in here. A rewrite or a continuation is a piece of the
        // manuscript and is set in the manuscript's own type; a chat reply is a remark about
        // the writing and is set compactly, like conversation.
        'data-kind': dockMode === 'proposal' && openProposal !== null ? openProposal.kind : dockMode,
        // Whether the passage is short enough to be set in the book's type. Four or five lines
        // read as part of the page; a longer one turned into a wall inside a card, so it drops
        // to interface type. The suffix is the SHELL's size, which makes it the natural key
        // for the stylesheet below; the budget itself is recomputed only when the page
        // settings change, and derived from them rather than from a literal.
        'data-prose': dockProse,
      },
      // The writer's own words travel with the wait: a composer question, or the direction a
      // retry or steered critique was given. Both read as the SUBJECT of the working line.
      dockMode === 'working'
        ? h(AiThinking, { t, question: chatWaiting ? chat.question : aiNote })
        : null,
      dockMode === 'scan' ? h(ScanDock, {
        t, scan,
        onClose: () => { if (typeof onScanClose === 'function') onScanClose() },
        // The same two entry points the chords use, so "again" cannot drift from what the
        // gesture does. The critique's steer box runs its own pass with a direction.
        onAgain: () => {
          if (scan.kind === 'critique') { if (typeof onCritique === 'function') onCritique('') }
          else if (typeof onReview === 'function') onReview()
        },
        onCritique: (direction) => {
          if (typeof onCritique === 'function') onCritique(critiqueCaret.current, direction)
        },
      }) : null,
      dockMode === 'proposal' ? h(AiDock, {
        t,
        proposal: openProposal,
        before: insertionContext.before,
        after: insertionContext.after,
        onAccept: () => acceptProposal(openProposal),
        onReject: () => { onReject(openProposal.id) },
        onRetry,
      }) : null,
      dockMode === 'composer' ? h(ChatComposer, {
        t, busy: chat.busy === true,
        // Owned here so the box can lose the dock and come back with what was typed in it.
        draft: chatDraft, onDraft: setChatDraft,
        catalog: chatCatalog, modelCurrent: chatCurrent,
        efforts: chatEfforts,
        onModelChange: (selection) => { if (typeof onChatModelChange === 'function') onChatModelChange(selection) },
        onEffortChange: (id) => { if (typeof onChatEffortChange === 'function') onChatEffortChange(id) },
        // The live selection travels with the question: with a passage highlighted the
        // question is an instruction about it, without one it is a question about the work.
        onSend: (text) => {
          if (typeof onChatSend !== 'function') return
          // The same function the rewrite and the continuation use: one answer to "where is the
          // writer", so all three actions see the same passage and the same neighbours.
          const context = editorContext()
          onChatSend(text, context.selection, context)
        },
        onClose: () => { if (typeof onChatClose === 'function') onChatClose() },
      }) : null,
      ) : null,
      // The line: pressed against the box's bottom edge when the box is closed, always
      // clickable. Working state carries the rotating copy ON A ROW ABOVE the line — the
      // hint text sits over the line, never beside it. When the box IS open the line hides:
      // the box's own bottom edge takes over, and a glowing line under an open result read
      // as a second, conflicting affordance.
      showBox ? null : h(DockHairline, {
        t,
        state: dockMode === 'working' ? 'working' : (hasContent ? 'kept' : 'idle'),
        question: dockMode === 'working' ? (chatWaiting ? chat.question : aiNote) : '',
        // Only a KEPT line opens something — the stored result. Idle has nothing to open
        // (the box must not pop empty), so it is not clickable.
        onClick: hasContent ? () => setDockOpen(true) : null,
      })))
}

/**
 * The composer's model seat, built to match the host's own.
 *
 * dsh's composer opens a two-level menu: the first pane offers 模型 and 推理档位 as rows with
 * their current values, and each drills into its own list. That shape is worth copying exactly,
 * because the alternative — one long pane with the effort axis at the bottom — hid the levels
 * behind a scroll in a menu that is only open for a moment.
 *
 * The panel cannot import the host's component (its bundle carries its own primitives), so the
 * numbers here are the host's: a 28px transparent chip at 13/20, the effort in caption tone, a
 * 4px-padded card with the prominent elevation, and 34px rows with a trailing check.
 */
