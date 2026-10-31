/**
 * The four things that open over the manuscript.
 *
 * Each one is a mount site and nothing more: the panel decides whether it is open, what it is
 * open on, and what happens when the writer acts; these functions only draw it. They live
 * together because they share one property that matters — they are all layered above the page
 * rather than replacing it, so their order in the parent decides what covers what.
 *
 * The reasoning behind each condition stays with the condition. A comment moved away from the
 * branch it explains is how the same bug comes back.
 */
import { React, h } from '../shared/react.js'
import { Drawer, ConfirmDialog, SegGroup, Dropdown } from '../shared/ui.js'
import { AnswerLog } from './composer.js'
import { MosaicSheet } from '../mosaic/index.js'
import { api } from '../api.js'

/**
 * The history drawer's second page: the system event log.
 *
 * Every model call and picture request appends its outcome — provider, model, duration, and the
 * failure code when there was one — to one file the host keeps beside its settings. This page
 * reads it back. It exists because a bare UNKNOWN error with nothing around it cannot be
 * diagnosed; here the writer can see whether a failure follows one action or all of them, one
 * model or every model, and how long the calls that do succeed take.
 */
/**
 * The history drawer's second page: the system event log.
 *
 * Every operation that changes anything — model calls, saves, snapshots, portraits, and every
 * route exception (captured at the one choke point in lib/index.js) — appends an event to one
 * file the host keeps beside its settings. This page reads it back.
 *
 * The display is a table like the browser's own inspector: three columns whose borders drag to
 * resize, because a wide error line and a narrow timestamp want different widths per writer.
 * A type filter shows only the rows of one event kind, chosen from the kinds actually present.
 */
const EVENT_COLUMNS = [
  { key: 'time', label: 'log.time', width: 96 },
  { key: 'name', label: 'log.name', width: 190 },
  { key: 'detail', label: 'log.detail', width: null },
]

/** The type an event is filed under. Model calls carry `action`; book/file events carry `type`. */
function eventType(event) {
  return String(event.action ?? event.type ?? 'model')
}

function eventName(event, t) {
  // The template form is what registers the `log.op.` prefix with the locale tests: every key
  // in this family is asked through it, so a new action's name only needs its dictionary entry.
  const name = t(`log.op.${event.action ?? event.type ?? 'model'}`)
  const what = event.title ?? event.folder ?? event.model ?? event.path ?? ''
  return what === '' ? name : `${name} ${what}`
}

function eventDetail(event) {
  if (event.ok !== true) {
    const code = event.error ?? ''
    return `✗ ${code} · ${event.ms ?? '?'}ms`
  }
  const parts = ['✓']
  if (event.truncated === true) parts.push('⋯')
  parts.push(`${event.ms ?? '?'}ms`)
  return parts.join(' ')
}

function SystemEventLog({ t }) {
  const [events, setEvents] = React.useState(null)
  const [error, setError] = React.useState('')
  const [filter, setFilter] = React.useState('all')
  const [refreshTick, setRefreshTick] = React.useState(0)
  // Column widths, in px. The last column carries `null`: it takes whatever the drawer has left,
  // so widening another column squeezes it exactly the way the inspector's tables behave.
  const [widths, setWidths] = React.useState(EVENT_COLUMNS.map((column) => column.width))
  const dragRef = React.useRef(null)
  React.useEffect(() => {
    let alive = true
    api.events().then(
      (data) => { if (alive) setEvents(Array.isArray(data?.events) ? data.events : []) },
      (failure) => { if (alive) setError(failure?.message ?? String(failure)) })
    return () => { alive = false }
  }, [refreshTick])

  const startDrag = (index) => (downEvent) => {
    downEvent.preventDefault()
    dragRef.current = { index, startX: downEvent.clientX, startWidth: widths[index] }
    const onMove = (moveEvent) => {
      const drag = dragRef.current
      if (drag === null) return
      const next = Math.max(48, drag.startWidth + moveEvent.clientX - drag.startX)
      setWidths((previous) => previous.map((width, i) => (i === drag.index ? next : width)))
    }
    const onUp = () => {
      dragRef.current = null
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  if (error !== '') return h('div', { className: 'st-muted' }, error)
  if (events === null) return h('div', { className: 'st-muted' }, t('label.loading'))

  // The filter is by EVENT TYPE, not by how old a row is. The list of types is built from the
  // events actually present, so the picker never offers a type this log has no row for.
  const types = [...new Set((events ?? []).map(eventType))].sort()
  const rows = (events ?? [])
    .filter((event) => filter === 'all' || eventType(event) === filter)
    .reverse()

  const headCells = EVENT_COLUMNS.map((column, index) => h('div', {
    key: column.key,
    className: 'st-event-th', role: 'columnheader',
    style: widths[index] === null ? {} : { width: `${widths[index]}px`, flex: '0 0 auto' },
  },
    t(column.label),
    widths[index] !== null ? h('span', {
      className: 'st-event-resize', role: 'separator',
      onPointerDown: startDrag(index),
    }) : null))

  const bodyRows = rows.map((event, index) => h('div', {
    key: `${event.time}-${index}`, className: 'st-event-row', role: 'row',
    'data-ok': event.ok === true ? 'true' : 'false',
  },
    h('span', { className: 'st-event-time', role: 'cell' },
      new Date(event.time).toLocaleTimeString([], { hour12: false })),
    h('span', { className: 'st-event-name', role: 'cell' }, eventName(event, t)),
    h('span', { className: 'st-event-text', role: 'cell' }, eventDetail(event))))

  const columnVars = { '--st-event-time-w': `${widths[0]}px`, '--st-event-name-w': `${widths[1]}px` }
  return h('div', { className: 'st-event-log', style: columnVars },
    h('div', { className: 'st-event-toolbar' },
      h(Dropdown, {
        className: 'st-event-filter', testId: 'log-type-filter',
        label: t('log.filter.byType'), value: filter, onChange: setFilter,
        options: [
          { value: 'all', label: t('log.filter.all') },
          ...types.map((type) => ({ value: type, label: t(`log.op.${type}`) })),
        ],
      }),
      h('span', { className: 'st-spacer' }),
      h('button', {
        type: 'button', className: 'st-btn st-btn-ghost', title: t('log.refresh'),
        onClick: () => setRefreshTick((tick) => tick + 1),
      }, '⟳')),
    h('div', { className: 'st-event-table', role: 'table' },
      h('div', { className: 'st-event-head', role: 'row' }, headCells)),
    h('div', { className: 'st-event-body' },
      rows.length === 0 ? h('div', { className: 'st-muted' }, t('log.empty')) : bodyRows))
}

/** An answer-history marker: the real component docstring continues below. */
/**
 * An answer from the history, reopened to be read or inserted.
 *
 * The same sheet as the reference drawers, because it is the same kind of thing — something
 * you open over the manuscript, read, and dismiss. The drawer carries TWO pages: the answers,
 * and the system event log behind them.
 */
export function AnswerLogOverlay({ open, t, answers, loadError, onInsert, onClose }) {
  // Hooks stay above the early return, so opening and closing cannot change this component's
  // hook count.
  const [page, setPage] = React.useState('answers')
  if (!open) return null
  return h(Drawer, {
    t, title: t('action.answers'), onClose,
    // Answers are prose, set at the manuscript's size: narrow would wrap them into a column
    // of fragments.
    size: 'reading',
    children: h('div', { className: 'st-answers-pages' },
      SegGroup({
        label: t('action.answers'),
        options: [
          { value: 'answers', label: t('log.page.answers') },
          { value: 'events', label: t('log.page.events') },
        ],
        value: page, onChange: setPage,
        testId: 'answers-page',
      }),
      page === 'answers'
        ? h('div', { className: 'st-answers-page' },
            loadError !== '' ? h('div', { className: 'st-dialog-hint' }, loadError) : null,
            h(AnswerLog, { t, answers, onInsert }))
        : h(SystemEventLog, { t })),
  })
}

/**
 * The "are you sure" before a tree node goes.
 *
 * It says what will go in countable terms: "第一章" alone does not tell the writer that four
 * sections and two thousand characters are about to disappear.
 */
export function RemoveNodeOverlay({ t, doomed, countUnder, onConfirm, onCancel }) {
  if (doomed === null) return null
  const counts = countUnder(doomed)
  const lines = []
  if (counts.containers > 0) {
    lines.push(h('div', { key: 'kids' }, t('label.removeNodeChildren', {
      n: counts.leaves, c: counts.containers,
    })))
  }
  if (counts.chars > 0) lines.push(h('div', { key: 'chars' }, t('label.removeNodeChars', { n: counts.chars })))
  lines.push(h('div', { key: 'warn', className: 'st-dialog-hint' }, t('label.removeNodeWarn')))
  return h(ConfirmDialog, {
    t,
    title: t('label.removeNodeConfirm', { title: doomed.title || t(`level.${doomed.level}`) }),
    confirmLabel: t('action.delete'),
    onConfirm, onCancel,
    children: lines,
  })
}

/**
 * How wide each sheet opens.
 *
 * A relationship graph is a diagram: squeezed into a narrow column its lines cross the labels.
 * Versions and typography are lists of short rows and want no more room than a phone. The
 * mapping lives here rather than in each page, so a panel's width is decided once.
 *
 * Only pages that need MORE than the default ceiling say so. Everything else is left to size
 * itself, which is the point: a two-item cast list should not open a 560px panel.
 */
const DRAWER_SIZES = {
  relationships: 'max',
  overview: 'wide',
}

/**
 * One of the panel's own preference pages, sliding up from the bottom edge.
 *
 * The sheet closes on Escape or a click on the dimmed area — the dismissal every host panel
 * uses. It reads `motion.shown`, never the live state: during the exit the state is already
 * null, and reading that here would render the body of `null` inside a closing panel. That is
 * exactly how the model page appeared behind the settings page.
 */
export function SheetOverlay({ t, motion, onClose, body }) {
  if (!motion.mounted) return null
  return h(Drawer, {
    t, title: t(`tab.${motion.shown}`), onClose,
    // The width each panel actually needs. A relationship graph and a style profile have
    // nothing in common but their title bar.
    size: DRAWER_SIZES[motion.shown],
    closing: motion.closing,
    // `shown` for all three, so the body follows the title and the width. The caller hands
    // over the renderer, not a rendered node: a node built from the live state would be the
    // wrong page during exactly the frames this hook exists to cover.
    children: body(motion.shown),
  })
}

/**
 * The mosaic board.
 *
 * Gated on the book, not just on the remembered preference: the board reads the book in every
 * page it has, and mounting it over a `null` manuscript is what crashed the panel.
 *
 * `updateBook` is the panel's only write path, so a layout drag saved through it reaches the
 * disk the same way a keystroke does — debounced, serialised, and reported by the same status
 * bar.
 */
export function MosaicOverlay({ mounted, book, ...props }) {
  if (!mounted || book === null) return null
  return h(MosaicSheet, { book, ...props })
}
