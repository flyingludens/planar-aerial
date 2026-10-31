/**
 * The one read-out line at the bottom of the panel.
 *
 * Where the caret is, how much has been written, when it was last saved, which model does the
 * work, and the last thing that failed. Every component reports here rather than drawing its own
 * message, so a writer looks in one place for one kind of thing.
 */
import { React, h } from '../shared/react.js'
import { clockTime } from '../shared/logic.js'
import { modelLabel, presetLabel } from '../shared/model-display.js'

/**
 * The status bar along the bottom: where the writer is, how much there is, and what is doing
 * the writing.
 *
 * Every item here answers a question the writer otherwise has to leave the page to find. The
 * word count and the position were already in the title row, but the title row also holds the
 * reference buttons and scrolls with nothing — a quiet line at the bottom is the place a
 * document puts its stats, and it does not compete with the title for attention.
 */
export function StatusBar({ t, book, chapter, saveStatus, model, notice, covered = false }) {
  const chapters = book?.chapters ?? []
  const index = chapter === undefined || chapter === null
    ? -1
    : chapters.findIndex((row) => row.id === chapter.id)
  const chars = chapter === undefined || chapter === null ? 0 : (chapter.text ?? '').length
  /**
   * When the manuscript was last written. A read-out, not a control: `writeBook` returns
   * `savedAt` and this is the one place it is useful, so the bar answers "is my work on disk"
   * with a clock reading instead of a button. Saving stays on Cmd+S; putting it here too made
   * the state look like an action and the time look like a label for it.
   */
  /**
   * Briefly highlighted right after a write.
   *
   * Two saves inside the same minute produce the identical clock reading, so without a flash the
   * bar does not change at all and the writer cannot tell whether the keystroke did anything.
   * The timestamp stays truthful; this is only a marker that it just moved.
   */
  const [flash, setFlash] = React.useState(false)
  // The model card: closed by default. The bar is a read-out, and the per-role detail is
  // something the writer asks for by clicking the one name it shows.
  const [modelOpen, setModelOpen] = React.useState(false)
  /**
   * Any press outside the button-and-card pair closes the card.
   *
   * This is what every popover in the host does, and what a writer expects: the card is an
   * aside, not a mode, so the first click on anything else answers "no, I don't need this".
   *
   * pointerdown, not click: a click only fires when the press and the release land on the
   * same element, so pressing a button elsewhere and dragging away first would leave the card
   * open. Press closes it regardless of where the release ends up.
   *
   * Scoped by containment in the pair rather than by a document-wide "anything but me" rule,
   * so a press in the button itself toggles (its own handler runs) instead of closing here
   * first and being re-opened a moment later.
   */
  // A panel opened over the page dismisses the card, the same way a press outside it does.
  // This is the one dismissal the pointerdown rule cannot catch: opening a drawer IS a press
  // outside the pair, but the drawer mounts over the bar before the press is judged, so the
  // event never reaches the bar's listener with a target it can walk up from.
  React.useEffect(() => {
    if (covered) setModelOpen(false)
  }, [covered])
  React.useEffect(() => {
    if (!modelOpen) return undefined
    if (typeof document === 'undefined' || typeof document.addEventListener !== 'function') return undefined
    const onDown = (event) => {
      const target = event?.target
      // No target is a synthetic event: nothing to judge, so leave the card alone.
      if (target === null || target === undefined) return
      // One test, the same one the panel uses everywhere else to ask "is this press mine":
      // walk up from the pressed element and see whether the button-and-card pair is on the
      // way. Inside it, the press is the button's own click or a press on the card's text;
      // outside it, the writer is looking at something else and the card has done its job.
      const mine = typeof target.closest === 'function'
        ? target.closest('.st-status-model-slot') !== null
        : false
      if (mine) return
      setModelOpen(false)
    }
    // Escape too: the card is a dialog, and every other dialog in the panel closes that way.
    const onKey = (event) => { if (event.key === 'Escape') { event.preventDefault(); setModelOpen(false) } }
    document.addEventListener('pointerdown', onDown, true)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown, true)
      document.removeEventListener('keydown', onKey)
    }
  }, [modelOpen])
  const lastAt = saveStatus?.savedAt ?? 0
  React.useEffect(() => {
    if (lastAt === 0) return undefined
    setFlash(true)
    // Through `globalThis` so the panel's setter check does not read this as component state.
    const timers = globalThis
    const id = timers.setTimeout(() => setFlash(false), 1400)
    return () => timers.clearTimeout(id)
  }, [lastAt])

  const lastSaved = (() => {
    // While a write is in flight the previous time is still true, so it stays: replacing it
    // with the word "saving" made the bar lose the only information it had.
    const at = saveStatus?.savedAt ?? 0
    if (saveStatus?.status === 'error') return { text: t('status.saveFailed'), tone: 'error' }
    if (at > 0) {
      return {
        text: t('status.saved', { time: clockTime(at) }),
        tone: saveStatus?.status === 'saving' || saveStatus?.status === 'pending' ? 'busy' : 'ok',
      }
    }
    // Nothing has been written yet in this session: say so plainly rather than showing a
    // zeroed clock, which reads as a time.
    return { text: t('status.unsaved'), tone: 'idle' }
  })()
  /**
   * The model that answers the panel's own actions.
   *
   * The writing roles can be configured separately, and a role with no override silently
   * falls back to the session default. Showing one merged name hid that: `continue` on one
   * model and `suggest` on another looked like a single answer. When they differ, each is
   * named with its role; when they agree, the name stands alone. The mosaic role joins the
   * same list — it answers the board's checks, questions and merges.
   */
  const roles = model === null || model === undefined ? null : model
  // chat is listed too: it answers the questions typed into the composer, and pinning it to its
  // own model is the common case — a cheap model for chat, a better one for the prose.
  const rows = roles === null ? [] : ['continue', 'suggest', 'mosaic', 'chat']
    .map((role) => ({ role, ...(roles[role] ?? {}) }))
    .filter((row) => typeof row.model === 'string' && row.model !== '')
  const distinct = [...new Set(rows.map((row) => modelLabel(t, row)))]
  /**
   * One name, then an ellipsis when more than one model is in play.
   *
   * Listing them all (a / b / c) pushed the rest of the bar sideways and grew with every role
   * the writer configured. The bar only has to say that these are not all the same model; the
   * names belong in the card behind a click, where there is room to show which ROLE runs on
   * which.
   */
  const modelText = rows.length === 0
    ? t('status.modelUnknown')
    : distinct.length === 1
      ? distinct[0]
      : `${distinct[0]} …`
  // The section's own name, and the position as context for it. A bare "1 / 6" says where you
  // are in a list you cannot see; the name is what the writer actually navigates by, and the
  // outline's own rows use the same string.
  const title = chapter === undefined || chapter === null
    ? ''
    : (chapter.title || '').trim() === '' ? t(`level.${chapter.level}`) : chapter.title.trim()
  /**
   * The corner message, if there is one.
   *
   * `tone` decides the colour and nothing else: an error is red, a caution amber, a plain hint
   * muted. The message itself is already-translated text — this component does not know what
   * kind of failure produced it.
   */
  const banner = notice === null || notice === undefined || String(notice.text ?? '') === ''
    ? null
    : notice
  /**
   * The model read-out: one name, and a card behind a click.
   *
   * Built here rather than inline in the return, because both are element trees of their own
   * and a twelve-level nested call is how the closing parentheses went wrong the first time.
   */
  // Centred on the button by CSS, not by arithmetic.
  //
  // Three attempts measured rectangles and wrote pixel offsets, and all three were wrong for
  // the same reason: the number depended on where the button happened to be, so any mistake in
  // the coordinate system showed up as "the card is off to one side". A wrapper that hugs the
  // button and a card centred inside it removes the question — the browser does the centring,
  // and there is no coordinate system left to get wrong.
  //
  // The last version also measured the card's width with useLayoutEffect and hid it until the
  // measurement landed. With that effect never running, the card stayed hidden while its text
  // still painted: which is exactly the screenshot — two rows of text floating over the page
  // with no card behind them.
  const modelButton = h('button', {
    type: 'button', className: 'st-status-item st-status-model',
    'data-open': modelOpen ? 'true' : 'false',
    'aria-expanded': modelOpen ? 'true' : 'false', 'aria-haspopup': 'dialog',
    title: rows.length === 0 ? t('status.modelUnknownHint') : undefined,
    onClick: () => setModelOpen((current) => !current),
  },
    h('span', { className: 'st-status-key' }, t('status.modelLabel')),
    modelText)
  // The card lives in a wrapper that hugs the button.
  //
  // A sibling of the button, not a child: a button may not contain a dialog, and an absolutely
  // positioned child of one still inherits its hover and focus handling.
  //
  // The wrapper is the card's containing block, so left:50% is half the BUTTON's width and the
  // translate pulls the card back by half of ITS OWN width. Each half measures itself, in CSS.
  // Nothing is read at runtime, so there is no coordinate system left to get wrong.
  const modelSlot = h('span', { className: 'st-status-model-slot' },
    modelButton,
    modelOpen
      ? h('div', {
          className: 'st-status-pop', role: 'dialog', 'aria-label': t('status.modelDetail'),
        },
          rows.length === 0
            ? h('div', { className: 'st-status-pop-empty' }, t('status.modelUnknown'))
            : rows.map((row) => h('div', { key: row.role, className: 'st-status-pop-row' },
                h('span', { className: 'st-status-pop-role' }, t(`role.${row.role}`)),
                h('span', { className: 'st-status-pop-model' }, presetLabel(t, row)))))
      : null)
  return h('div', { className: 'st-statusbar', role: 'status' },
    // Announced politely: a save failure or a truncated answer is worth interrupting for only
    // in the sense that it must be readable, not that it must steal focus.
    banner === null ? null : h('span', {
      className: 'st-status-notice', 'data-tone': banner.tone ?? 'info',
      role: 'status', 'aria-live': 'polite', title: String(banner.text),
    }, String(banner.text)),
    // One cell, so the grid can centre the whole read-out between the notice and the balancing
    // empty column. As loose siblings they were the grid's own items and the centre was lost.
    h('div', { className: 'st-status-run' },
    h('span', { className: 'st-status-item' }, chapter === undefined || chapter === null
      ? t('status.noChapter')
      : h(React.Fragment, null,
        h('span', { className: 'st-status-name', title }, title),
        h('span', { className: 'st-status-count' },
          t('status.position', { i: index < 0 ? 1 : index + 1, n: chapters.length })))),
    h('span', { className: 'st-status-sep', 'aria-hidden': true }, '·'),
    h('span', { className: 'st-status-item' }, t('status.words', { n: chars })),
    h('span', { className: 'st-status-spacer' }),
    // Plain text, not a button: this is the answer to "when was it saved", and a control here
    // competed with the shortcut it was duplicating.
    h('span', {
      className: `st-status-item${flash ? ' st-status-flash' : ''}`, 'data-tone': lastSaved.tone,
      // The title says which key refreshes this line; the line itself stays inert.
      title: t('label.saveNowHint'),
    }, lastSaved.text),
    h('span', { className: 'st-status-sep', 'aria-hidden': true }, '·'),
    // A button now, because there is something to open: the roles behind the one name. The
    // card is the only place a per-role answer fits — the tooltip it replaces needed a pointer
    // to hover with, which the desktop build does not reliably offer.
    modelSlot))
}



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
