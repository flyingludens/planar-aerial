/**
 * Everything that lives in the dock under the page.
 *
 * The composer asks a question; the dock shows what came back, or what the model is still
 * thinking, or a scan's findings. They are one file because they share the slot: only one of
 * them is on screen at a time, and which one is decided in one place.
 */
import { React, h } from '../shared/react.js'
import { clockTime, diffWords } from '../shared/logic.js'
import { Chevron } from 'fang-style'
import { ModelIcon } from '../shared/icons.js'

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
function ComposerModelSeat({ t, groups, value, efforts, onChange, onEffort }) {
  const [open, setOpen] = React.useState(false)
  const [pane, setPane] = React.useState('root')
  // Starts pointing the way an unopened menu points. Leaving it at 'right' meant the root list's
  // trailing chevrons read "go back" — the direction the arrow only means once a pane is drilled
  // into, where it really is the way out.
  const [openToward, setOpenToward] = React.useState('down')
  const rootRef = React.useRef(null)
  React.useEffect(() => {
    if (!open) { setPane('root'); return undefined }
    if (typeof document === 'undefined' || typeof document.addEventListener !== 'function') return undefined
    const onDown = (event) => {
      const root = rootRef.current
      if (root !== null && root !== undefined && typeof root.contains === 'function' && root.contains(event.target)) return
      setOpen(false)
    }
    // Escape leaves a drilled pane first, then closes: the host's own menu behaves this way,
    // and closing the whole menu from two levels down loses the writer's place.
    const onKey = (event) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      setPane((current) => {
        if (current !== 'root') return 'root'
        setOpen(false)
        return 'root'
      })
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])
  const levels = Array.isArray(efforts) ? efforts : []
  const modelName = value === null || value === undefined || typeof value.model !== 'string'
    ? t('status.modelUnknown')
    : value.model
  const effortId = value?.reasoningEffort ?? ''
  const effortName = effortId === ''
    ? ''
    : (levels.find((level) => level.id === effortId)?.name ?? effortId)
  const close = () => { setOpen(false); setPane('root') }
  const pickLevel = (id) => { close(); if (typeof onEffort === 'function') onEffort(id) }
  const pickModel = (provider, model) => { close(); if (typeof onChange === 'function') onChange({ provider, model }) }

  const modelRows = []
  for (const group of groups ?? []) {
    modelRows.push(h('div', { key: `g:${group.id}`, className: 'st-seat-group' }, group.name ?? group.id))
    for (const model of group.models ?? []) {
      const current = value !== null && value !== undefined
        && value.provider === group.id && value.model === model.model
      modelRows.push(h('button', {
        key: `${group.id}:${model.model}`, type: 'button', className: 'st-seat-option',
        role: 'menuitemradio', 'aria-checked': current ? 'true' : 'false',
        onClick: () => pickModel(group.id, model.model),
      },
        h('span', { className: 'st-seat-option-name' }, model.name ?? model.model),
        current ? h('span', { className: 'st-seat-check' }, h('svg', {
          className: 'st-icon-sm', viewBox: '0 0 16 16', 'aria-hidden': true, fill: 'none',
          stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
        }, h('path', { d: 'M3 8.5 6.2 11.6 13 4.6' }))) : null))
    }
  }
  if (modelRows.length === 0) modelRows.push(h('div', { key: 'none', className: 'st-seat-empty' }, t('label.noModels')))

  const rootRows = [
    h('button', {
      key: 'model', type: 'button', className: 'st-seat-cell', role: 'menuitem',
      onClick: () => setPane('models'),
    },
      h('span', { className: 'st-seat-cell-label' }, t('label.model')),
      h('span', { className: 'st-seat-cell-value' }, modelName),
      h(Chevron, { direction: openToward })),
    // The effort row only exists when the model has levels, for the reason the axis does: a
    // level is a property of the route, not a vocabulary the panel invents.
    levels.length === 0 ? null : h('button', {
      key: 'effort', type: 'button', className: 'st-seat-cell', role: 'menuitem',
      onClick: () => setPane('efforts'),
    },
      h('span', { className: 'st-seat-cell-label' }, t('label.effort')),
      h('span', { className: 'st-seat-cell-value' }, effortName === '' ? t('status.effortDefault') : effortName),
      h(Chevron, { direction: openToward })),
  ].filter(Boolean)

  // The default row comes first, as dsh's own picker lists it: picking it clears the stored
  // level (onEffort('')), and it is checked exactly when no level is stored — that IS the
  // model's default state.
  const effortRows = [{ id: '', name: t('status.effortDefault') }, ...levels].map((level) => h('button', {
    key: level.id || 'default', type: 'button', className: 'st-seat-option',
    role: 'menuitemradio', 'aria-checked': level.id === effortId ? 'true' : 'false',
    onClick: () => pickLevel(level.id),
  },
    h('span', { className: 'st-seat-option-name' }, level.name ?? level.id),
    level.id === effortId ? h('span', { className: 'st-seat-check' }, h('svg', {
      className: 'st-icon-sm', viewBox: '0 0 16 16', 'aria-hidden': true, fill: 'none',
      stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
    }, h('path', { d: 'M3 8.5 6.2 11.6 13 4.6' }))) : null))

  // Going back has to be possible with the mouse as well: the panel's menu is opened by a
  // click, and only the host's keyboard-first composer can rely on Escape alone.
  const back = h('button', {
    key: 'back', type: 'button', className: 'st-seat-back', role: 'menuitem',
    onClick: () => setPane('root'),
  }, h(Chevron, { direction: 'right' }), t('label.back'))

  return h('div', { className: 'st-seat', ref: rootRef },
    h('button', {
      type: 'button', className: 'st-seat-trigger',
      'aria-haspopup': 'menu', 'aria-expanded': open ? 'true' : 'false',
      onClick: (event) => {
        const next = !open
        // A menu that can only open one way is a menu that clips. This chip sits at the bottom of
        // the window inside the composer, so it normally opens upward; the settings drawer puts it
        // near the top of a page that scrolls, and there it has to open down. Decided from the
        // room the control actually has, measured at the click — the same rule the host's own
        // picker uses, and the same one .st-mselect-menu documents for the other picker.
        if (next) {
          const rect = event?.currentTarget?.getBoundingClientRect?.()
          const room = typeof window !== 'undefined' && typeof window.innerHeight === 'number' ? window.innerHeight : 0
          setOpenToward(rect !== undefined && rect !== null && room > 0 && rect.top > room - rect.bottom ? 'up' : 'down')
        }
        setOpen((open_) => !open_)
      },
    },
      h(ModelIcon),
      h('span', { className: 'st-seat-label' }, modelName),
      effortName === '' ? null : h('span', { className: 'st-seat-effort' }, effortName),
      // Closed: down, which is what "there is a menu here" looks like. Open: the way the card
      // actually went — not a flip, which would point up over a card that opened downward.
      h(Chevron, { direction: openToward === 'up' && open ? undefined : openToward === 'up' ? 'up' : open ? 'down' : undefined })),
    open ? h('div', { className: 'st-seat-menu', 'data-side': openToward, role: 'menu' },
      pane === 'root' ? rootRows
        : h(React.Fragment, null, back,
          h('div', { className: 'st-seat-groups' },
            pane === 'models' ? modelRows : effortRows))) : null)
}

/**
 * The question box in the dock.
 *
 * `draft` is owned by the EDITOR, not by this component. The box is unmounted whenever
 * something else takes the dock — a rewrite, a section scan, a sent question — and with the
 * draft in its own state that unmount threw away whatever the writer had typed but not sent.
 * Hiding a box and bringing it back has to return the same box.
 */

/**
 * The question box in the dock.
 *
 * `draft` is owned by the EDITOR, not by this component. The box is unmounted whenever
 * something else takes the dock — a rewrite, a section scan, a sent question — and with the
 * draft in its own state that unmount threw away whatever the writer had typed but not sent.
 * Hiding a box and bringing it back has to return the same box.
 */
export function ChatComposer({ t, busy, catalog, modelCurrent, efforts, onModelChange, onEffortChange, draft, onDraft, onSend, onClose }) {
  const inputRef = React.useRef(null)
  // Focus on open: the chord was pressed to type, not to look at an empty box.
  React.useEffect(() => {
    const node = inputRef.current
    if (node !== null && node !== undefined && typeof node.focus === 'function') node.focus()
  }, [])
  const send = () => {
    const text = String(draft ?? '').trim()
    if (text === '' || busy === true) return
    onDraft('')
    onSend(text)
  }
  // The model that will answer. The chat runs on the panel's `chat` role, and the writer paid
  // for it: naming it beside the send button is what the host's own composer does, and it is
  // the one piece of the host's input bar that carries real information rather than decoration.
  return h('div', { className: 'st-chat-composer', 'data-composer-card': 'true' },
    h('textarea', {
      ref: inputRef, className: 'st-chat-input', value: draft, rows: 1,
      // No placeholder: an empty field with a caret in it already means "type", and a sample
      // question under a one-line input was the loudest thing in the quietest control.
      'aria-label': t('label.chatTitle'),
      'data-composer-input': 'true',
      onChange: (e) => onDraft(e.target.value),
      onKeyDown: (e) => {
        // An IME is composing: Enter is confirming a candidate, not sending.
        if (e.isComposing === true || e.nativeEvent?.isComposing === true || e.keyCode === 229) return
        if (e.key === 'Enter' && e.shiftKey !== true) { e.preventDefault(); send(); return }
        if (e.key === 'Escape') { e.preventDefault(); onClose() }
      },
    }),
    // The control row under the input, the shape the host's composer uses: hint on the left,
    // the model chip and the send button on the right.
    h('div', { className: 'st-chat-row' },
      h('span', { className: 'fang-spacer' }),
      h('div', { className: 'st-chat-trailing' },
        // The model chip opens the host's directory: the same catalogue its own composer uses,
        // with effort levels when the model offers them.
        // The host's own shape: model and effort as two rows that drill into their lists.
        h(ComposerModelSeat, {
          t, groups: catalog ?? [], value: modelCurrent,
          efforts: efforts ?? [], onEffort: onEffortChange, onChange: onModelChange,
        }),
        // The send control is the round icon button the host uses: a pill labelled "发送" is a
        // form button, and this is a composer.
        h('button', {
          type: 'button', className: 'st-chat-send',
          'aria-label': t('action.send'), title: t('action.send'),
          disabled: busy === true || draft.trim() === '',
          onClick: send,
        }, h('svg', {
          className: 'st-icon-md', viewBox: '0 0 16 16', 'aria-hidden': true,
          fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
        }, h('path', { d: 'M8 13V3.5M8 3.5 4 7.5M8 3.5l4 4' }))))))
}

/**
 * The AI dock: the thinking state and the suggestion, one container for both AI actions.
 *
 * It is the width of the measure and sits under the page in normal flow. The earlier version
 * was an absolutely positioned card under the caret line, which covered the paragraph being
 * edited and made it unclickable — the writer could neither read the text nor press anything
 * else while a suggestion was open. A textarea cannot hold a block between its lines, so the
 * dock belongs below the page: the full measure, nothing covered, everything still reachable.
 */
/**
 * A dock section boundary: the text around an insertion, shown faintly so the writer can see
 * what the new sentence will sit between. Not part of the suggestion, so it is dimmed and not
 * selectable as if it were the text being added.
 */

/**
 * The AI dock: the thinking state and the suggestion, one container for both AI actions.
 *
 * It is the width of the measure and sits under the page in normal flow. The earlier version
 * was an absolutely positioned card under the caret line, which covered the paragraph being
 * edited and made it unclickable — the writer could neither read the text nor press anything
 * else while a suggestion was open. A textarea cannot hold a block between its lines, so the
 * dock belongs below the page: the full measure, nothing covered, everything still reachable.
 */
/**
 * A dock section boundary: the text around an insertion, shown faintly so the writer can see
 * what the new sentence will sit between. Not part of the suggestion, so it is dimmed and not
 * selectable as if it were the text being added.
 */
function ContextEdge({ text, side }) {
  if (typeof text !== 'string' || text === '') return null
  return h('span', { className: `st-ctx st-ctx-${side}`, 'aria-hidden': true }, text)
}

/**
 * The steer box both docks use: a chevron beside 重试 that opens a one-line input.
 *
 * The writer says what the NEXT attempt should do differently — "把结尾收得更快" for a rewrite,
 * "把对话写得更口语" for a critique. Collapsed by default: most retries want the same passage
 * tried again, not a conversation. Enter sends, Escape collapses.
 *
 * One component rather than two, because the rewrite dock and the critique dock had a
 * copy each that differed in three strings and one prop. A second copy is how the two drifted
 * apart the first time (one labelled its chevron, the other did not).
 *
 * @param copy  - the three strings this instance says: `placeholder`, `label`, `hint`
 * @param showLabel - whether the button carries its own label beside the chevron
 * @param autoFocus - whether the input takes focus when it opens
 */

/**
 * The steer box both docks use: a chevron beside 重试 that opens a one-line input.
 *
 * The writer says what the NEXT attempt should do differently — "把结尾收得更快" for a rewrite,
 * "把对话写得更口语" for a critique. Collapsed by default: most retries want the same passage
 * tried again, not a conversation. Enter sends, Escape collapses.
 *
 * One component rather than two, because the rewrite dock and the critique dock had a
 * copy each that differed in three strings and one prop. A second copy is how the two drifted
 * apart the first time (one labelled its chevron, the other did not).
 *
 * @param copy  - the three strings this instance says: `placeholder`, `label`, `hint`
 * @param showLabel - whether the button carries its own label beside the chevron
 * @param autoFocus - whether the input takes focus when it opens
 */
export function SteerBox({ t, copy, showLabel, autoFocus, onRun }) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState('')
  const input = h('input', {
    className: 'st-scan-steer-input', value,
    placeholder: t(copy.placeholder),
    'aria-label': t(copy.label),
    autoFocus: autoFocus === true,
    onChange: (e) => setValue(e.target.value),
    onKeyDown: (e) => {
      if (e.key === 'Enter') { e.preventDefault(); onRun(value.trim()) }
      if (e.key === 'Escape') { e.preventDefault(); setOpen(false) }
    },
  })
  // The field is returned BESIDE the button, not inside it: as a flex sibling in the action row
  // it takes the leftover width itself, where as a child of the 20px chevron wrapper it had
  // nowhere to go but on top of the next control.
  return h(React.Fragment, null,
    h('div', { className: 'st-scan-steer' },
    h('button', {
      type: 'button', className: 'st-scan-steer-toggle',
      'aria-expanded': open ? 'true' : 'false',
      title: t(copy.hint),
      onClick: () => setOpen((current) => !current),
    },
      h('svg', {
        className: 'st-icon-xs', viewBox: '0 0 16 16', 'aria-hidden': true,
        fill: 'none', stroke: 'currentColor', strokeWidth: 1.6,
        strokeLinecap: 'round', strokeLinejoin: 'round',
        // Down when collapsed (the expand convention), rotated to point RIGHT when open — at
        // the input, which appears beside the control.
        style: { transform: open ? 'rotate(-90deg)' : 'none', transition: 'transform .12s' },
      }, h('path', { d: 'M3.5 6 8 10.5 12.5 6' })),
      showLabel === true ? t(copy.label) : null)),
    open ? input : null)
}

export function AiDock({ t, proposal, before, after, onAccept, onReject, onRetry }) {
  /**
   * A change to the cast or the settings, not to the sentence in front of the writer.
   *
   * It is the same dock and the same accept/reject, because it is the same kind of thing: a
   * proposal the writer approves before it becomes the book. What differs is the unit — rows
   * naming what would be added or updated instead of a diff of prose.
   */
  if (proposal.kind === 'cast') {
    return h(React.Fragment, null,
      h('div', { className: 'st-ai-question' }, proposal.question),
      proposal.reply === '' ? null : h('div', { className: 'st-ai-dock-text' }, proposal.reply),
      h('div', { className: 'st-cast' },
        (proposal.marks ?? []).map((mark, index) => h('div', { key: index, className: 'st-cast-row' },
          // "add" and "update" are the two things the writer needs to tell apart before
          // pressing: one extends the book, the other rewrites something already in it.
          h('span', { className: 'st-cast-tag', 'data-verb': mark.verb },
            t(mark.verb === 'update' ? 'cast.update' : 'cast.add')),
          h('span', { className: 'st-cast-target' }, t(`cast.target.${mark.target}`)),
          h('span', { className: 'st-cast-name' }, mark.label),
          mark.detail === '' ? null : h('span', { className: 'st-cast-detail' }, mark.detail)))),
      h('div', { className: 'st-ai-dock-actions' },
        h('button', { type: 'button', className: 'st-dock-act st-dock-act-primary', onClick: onAccept },
          t('action.applyCast'), h('span', { className: 'st-kbd' }, '⌘⏎')),
        h('button', { type: 'button', className: 'st-dock-act st-dock-act-quiet', onClick: onReject }, t('action.reject'))))
  }
  const isContinuation = proposal.kind === 'continue'
  // A chat answer is a reply, not an edit: there is no range under it and no diff to show, and
  // its accept means "put this in the manuscript" rather than "replace this passage".
  const isChat = proposal.kind === 'chat'
  const isInsert = isContinuation || isChat
  return h(React.Fragment, null,
    isChat ? h('div', { className: 'st-ai-question' }, proposal.question) : null,
    h('div', { className: 'st-ai-dock-text' },
      // An insertion is shown IN CONTEXT: a little of what precedes and follows it, faintly,
      // so the writer can see where the sentence lands and whether it joins up. Without them
      // the dock showed a detached sentence and the only way to judge it was to accept it and
      // read the result.
      isInsert ? h(ContextEdge, { text: before, side: 'before' }) : null,
      isInsert
        ? h('span', { className: 'st-insert' }, proposal.proposedText)
        : diffWords(proposal.baseText, proposal.proposedText).map((seg, i) =>
          h('span', { key: i, className: seg.type === 'add' ? 'st-add' : seg.type === 'del' ? 'st-del' : undefined }, seg.text)),
      isInsert ? h(ContextEdge, { text: after, side: 'after' }) : null),
    h('div', { className: 'st-ai-dock-actions' },
      h('button', { type: 'button', className: 'st-dock-act st-dock-act-primary', onClick: onAccept },
        isChat ? t('action.insert') : t('action.accept'),
        h('span', { className: 'st-kbd' }, isContinuation ? 'Enter' : '⌘⏎')),
      // Retry, plus the chevron that gives the retry a direction: the pair reads as one
      // control, and only the chevron opens the input.
      h('div', { className: 'st-retry-group' },
        h('button', { type: 'button', className: 'st-dock-act', onClick: () => onRetry('') }, t('action.retry')),
        h(SteerBox, {
          t,
          copy: { placeholder: 'rewrite.steerPlaceholder', label: 'rewrite.steer', hint: 'rewrite.steerHint' },
          // The rewrite's chevron is part of a joined retry pill, so it carries no label of
          // its own; the critique's sits in a row of buttons and needs one.
          showLabel: false,
          autoFocus: true,
          onRun: (direction) => onRetry(direction),
        })),
      // The retry/accept pair is the whole interaction, so reject sits at the far end to keep
      // it away from the one the writer presses by reflex.
      h('button', { type: 'button', className: 'st-dock-act st-dock-act-quiet', onClick: onReject }, t('action.reject'))))
}

/**
 * The result of a whole-section action: a copy-edit, or three ways the scene could go.
 *
 * These are the only two things the panel says that are not a piece of manuscript and cannot
 * be accepted — they are notes to read and act on by hand. So they share the dock's surface but
 * not its accept/reject footer, and they are listed rather than set as prose: a list of
 * findings is scanned, a paragraph about them is not.
 *
 * Both are the same component because the two are the same shape: a heading naming what this
 * is, a count, and a stack of small records. Splitting it would duplicate the header, the
 * empty state, the failure state and the dismissal.
 */
/**
 * The dock's resting face: one glowing hairline at the page's bottom edge.
 *
 * Three states, one line. `idle` — nothing has been asked; a faint breathing glow, purely
 * ambient, not clickable. `working` — a request is running; the glow strengthens and the
 * working copy rotates on the line. `kept` — a result is in the dock but the box is closed;
 * the glow holds steady, a label names what is kept, and clicking re-expands it.
 *
 * The line is the dock's PERSISTENT presence: dismissing a result collapses it to here, so
 * nothing the model returned is ever more than one click away.
 */

/**
 * The result of a whole-section action: a copy-edit, or three ways the scene could go.
 *
 * These are the only two things the panel says that are not a piece of manuscript and cannot
 * be accepted — they are notes to read and act on by hand. So they share the dock's surface but
 * not its accept/reject footer, and they are listed rather than set as prose: a list of
 * findings is scanned, a paragraph about them is not.
 *
 * Both are the same component because the two are the same shape: a heading naming what this
 * is, a count, and a stack of small records. Splitting it would duplicate the header, the
 * empty state, the failure state and the dismissal.
 */
/**
 * The dock's resting face: one glowing hairline at the page's bottom edge.
 *
 * Three states, one line. `idle` — nothing has been asked; a faint breathing glow, purely
 * ambient, not clickable. `working` — a request is running; the glow strengthens and the
 * working copy rotates on the line. `kept` — a result is in the dock but the box is closed;
 * the glow holds steady, a label names what is kept, and clicking re-expands it.
 *
 * The line is the dock's PERSISTENT presence: dismissing a result collapses it to here, so
 * nothing the model returned is ever more than one click away.
 */
export function DockHairline({ t, state, onClick, question }) {
  const clickable = typeof onClick === 'function'
  const working = state === 'working'
  // Working carries the rotating copy on the line, single-row; a kept line shows the glow
  // alone — no text on a folded dock, the glow itself says something is there.
  return h('button', {
    type: 'button',
    className: 'st-hairline',
    'data-state': state,
    // Only a line that opens something is a button in fact; the idle glow is decoration.
    disabled: !clickable,
    'aria-label': working ? t('label.thinking') : clickable ? t('label.dockExpand') : undefined,
    title: working ? undefined : clickable ? t('label.dockExpand') : undefined,
    onClick: clickable ? onClick : undefined,
  },
    // The copy row comes FIRST in the DOM: the hint text sits ABOVE the line, the line is
    // the bottom row. The copy span always exists so the layout does not shift when the
    // beats appear; it is simply empty outside the working state.
    h('span', { className: 'st-hairline-copy' },
      working
        ? h(AiThinking, { t, question, beats: [t('label.thinking'), t('label.thinking.1'), t('label.thinking.2'), t('label.thinking.3')] })
        : null),
    h('span', { className: 'st-hairline-glow', 'aria-hidden': true }))
}

/**
 * The model is working.
 *
 * One fixed label for a wait that can run to several seconds reads like a frozen screen, so
 * the copy walks a short sequence: where it is looking, what it is deciding, then "almost
 * there". Stated in the model's own voice rather than as system text, so it reads as someone
 * writing next to you.
 *
 * The rotation is CSS, not a timer: all four labels are in the DOM and one is visible at a
 * time. A JS interval would re-render the dock every couple of seconds for a purely visual
 * change, and it also kept a handle alive that a test harness has no way to release.
 */
export function AiThinking({ t, question, beats: given }) {
  // The wait is described in the caller's words when it has them: reading a section for
  // mistakes and thinking of the next line are different waits, and naming the right one is
  // the difference between an explained pause and a button that looks broken.
  const beats = Array.isArray(given) && given.length > 0
    ? given
    : [t('label.thinking'), t('label.thinking.1'), t('label.thinking.2'), t('label.thinking.3')]
  /**
   * The question is PART of the working line, not a heading above it.
   *
   * It used to be its own block with a rule under it, which made the dock open with what read
   * like a quoted message and only then say "working". The writer asked; the dock answers by
   * saying what it is working ON. One line: the question, then the state.
   */
  const asked = question === undefined || question === '' ? null : question
  // The rotating status copy. Built once and placed in either layout.
  const labels = h('span', { className: 'st-ai-thinking-labels' },
    beats.map((label, i) => h('span', {
      key: i, className: 'st-ai-thinking-label',
      // Staggered phase: each label takes its turn in a single looping animation.
      style: beats.length > 1 ? { animationDelay: `${(i * 7.2) / beats.length}s` } : undefined,
    }, label)))
  // One spinner at the line's head, left-aligned with the text after it: the working state
  // has to say "something is moving" even when the copy line is too short to animate, and
  // the marker anchors the row's left edge so the copy never reads as centered.
  return h('div', { className: 'st-ai-thinking', role: 'status', 'aria-live': 'polite' },
    h('div', { className: 'st-ai-thinking-row' },
      h('span', { className: 'st-ai-thinking-mark', 'aria-hidden': true }),
      // With a question, the row reads "这里该怎么收？ · 在想下一句" instead of stacking two lines
      // that both describe the same moment. The question is static: it is the subject, not the
      // state, so it does not fade or rotate with the copy beside it.
      asked === null
        ? labels
        : h(React.Fragment, null,
          h('span', { className: 'st-ai-thinking-ask', title: asked }, asked),
          h('span', { className: 'st-ai-thinking-sep', 'aria-hidden': true }, '·'),
          labels)))
}

/**
 * The status bar along the bottom: where the writer is, how much there is, and what is doing
 * the writing.
 *
 * Every item here answers a question the writer otherwise has to leave the page to find. The
 * word count and the position were already in the title row, but the title row also holds the
 * reference buttons and scrolls with nothing — a quiet line at the bottom is the place a
 * document puts its stats, and it does not compete with the title for attention.
 */

/**
 * The answers this session, newest first.
 *
 * The dock shows one answer at a time — the newest — because it sits under the manuscript and
 * a growing transcript would push the page up as the conversation went on. Everything older
 * lives here instead: a list to read back through, with the question it answered.
 *
 * Each entry can be put into the manuscript or copied out. Reading is the main job, but an
 * answer worth keeping should not have to be retyped.
 */
export function AnswerLog({ t, answers, onInsert }) {
  if (answers.length === 0) return h('div', { className: 'fang-muted' }, t('label.noAnswers'))
  return h('div', { className: 'st-answers' },
    answers.map((entry, index) => h('div', { key: `${entry.at}-${index}`, className: 'st-answer' },
      h('div', { className: 'st-answer-head' },
        h('span', { className: 'st-answer-question' }, entry.question),
        h('span', { className: 'fang-spacer' }),
        h('span', { className: 'st-caption' },
          clockTime(entry.at)),
        typeof onInsert === 'function' ? h('button', {
          type: 'button', className: 'st-dock-act st-dock-act-primary',
          // Inserted at the caret, exactly as accepting the dock's own suggestion would.
          onClick: () => onInsert(entry),
        }, t('action.insert')) : null,
        h('button', {
          type: 'button', className: 'st-dock-act',
          onClick: () => {
            // The clipboard is the only way out of here on a host without the insert callback.
            // It is best-effort: a denied permission must not throw into the render.
            try { navigator.clipboard?.writeText(entry.reply) } catch { /* denied */ }
          },
        }, t('action.copy'))),
      h('div', { className: 'st-answer-body' }, entry.reply))))
}

/**
 * Characters and how they relate to each other. Relationships are edited as pairs of existing
 * characters, so a relationship can never point at someone who does not exist.
 */
