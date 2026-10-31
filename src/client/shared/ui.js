/**
 * The components that are not about the manuscript.
 *
 * A chevron, a drawer, a confirmation, and the two icons that are the panel's entry points. Each
 * one is used from several pages and none of them knows what a book is, which is why they can be
 * shared without dragging any domain knowledge along.
 *
 * `ConfirmDialog` defaults `danger` to true: every caller but one is confirming a deletion, and
 * the one that is not (creating a book) opts out explicitly. A default the other way would mean
 * four call sites remembering to paint their button red.
 */
import { React, h } from './react.js'
import { useDismiss } from './hooks.js'


/**
 * The question box for the side chat.
 *
 * It is set to match the host's own composer: same surfaces, same radius, same type scale, and
 * it reads the host's composer variables (`--dsh-composer-stack-gap`, `--dsh-composer-text-max-
 * height`) where they exist. Not the same component — it is a plain textarea, not a lexical
 * editor — but visually it should not feel like a second, foreign input appeared on the page.
 *
 * Enter sends, Shift+Enter starts a line: the convention every chat box uses, and the one the
 * host's own composer follows.
 */
/** A 12px chevron, drawn rather than typed: the host's own picker uses an icon, and a text
 *  glyph sits on a different baseline from it. */
export function Chevron({ open, direction }) {
  const down = direction !== 'right'
  return h('svg', {
    className: down ? 'st-seat-chevron' : 'st-seat-cell-chevron',
    viewBox: '0 0 16 16', width: 12, height: 12, 'aria-hidden': true,
    ...(down ? { 'data-open': open === true ? 'true' : 'false' } : {}),
    fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round',
  }, h('path', { d: down ? 'M4 6.5 8 10.5 12 6.5' : 'M6.5 4 10.5 8 6.5 12' }))
}


/**
 * The panel's own dropdown. A native select paints its option list in an OS popup that ignores
 * the panel's stacking order and gets clipped by the drawer it opens inside — the runtime log's
 * filter did exactly that. This opens a list INSIDE the panel, above every other layer, and it
 * dismisses on an outside press like every other popup here.
 */
export function Dropdown({ label, value, options, onChange, testId, className }) {
  const [open, setOpen] = React.useState(false)
  const rootRef = React.useRef(null)
  useDismiss(rootRef, open, () => setOpen(false))
  const rows = Array.isArray(options) ? options : []
  const current = rows.find((option) => option.value === value) ?? rows[0]
  const pick = (next) => { setOpen(false); onChange(next) }
  return h('div', {
    className: `st-dropdown${className === undefined ? '' : ` ${className}`}`,
    ref: rootRef, 'data-testid': testId,
  },
    h('button', {
      type: 'button', className: 'st-dropdown-button',
      'aria-haspopup': 'listbox', 'aria-expanded': open ? 'true' : 'false', 'aria-label': label,
      onClick: () => setOpen((was) => !was),
      onKeyDown: (event) => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
        event.preventDefault()
        const at = rows.findIndex((option) => option.value === value)
        const step = event.key === 'ArrowDown' ? 1 : -1
        const next = rows[Math.min(rows.length - 1, Math.max(0, (at < 0 ? 0 : at) + step))]
        if (next !== undefined) pick(next.value)
      },
    },
      h('span', { className: 'st-dropdown-value' }, current === undefined ? '' : current.label),
      h(Chevron, { open })),
    open ? h('div', { className: 'st-dropdown-list', role: 'listbox', 'aria-label': label },
      rows.map((option) => h('button', {
        key: option.value, type: 'button', className: 'st-dropdown-option', role: 'option',
        'aria-selected': option.value === value ? 'true' : 'false',
        onClick: () => pick(option.value),
      }, option.label))) : null)
}

/**
 * A file choice whose visible control is the panel's own button. The browser still has to show
 * its OS file sheet to read bytes — no page can avoid that — but the trigger, its label and its
 * focus state are ours, not an <input type=file> the browser paints.
 */
export function FileButton({ label, accept, onFile, className, testId }) {
  const inputRef = React.useRef(null)
  return h('span', { className: `st-file-button${className === undefined ? '' : ` ${className}`}` },
    h('button', {
      type: 'button', className: 'st-btn',
      onClick: () => { if (inputRef.current !== null && typeof inputRef.current.click === 'function') inputRef.current.click() },
    }, label),
    h('input', {
      ref: inputRef, type: 'file', className: 'st-file-input', accept,
      tabIndex: -1, 'aria-hidden': 'true', 'data-testid': testId,
      onChange: (event) => {
        const file = event?.target?.files?.[0]
        if (file !== undefined && typeof onFile === 'function') onFile(file)
        if (event?.target !== undefined) event.target.value = ''
      },
    }))
}

/**
 * The bottom sheet. Reference panels (background, cast, relationships, versions, overview)
 * open here, over the manuscript, because they are consulted while writing rather than being
 * a place to work. One sheet at a time, dismissed by Escape, the backdrop, or the close button.
 */
export function Drawer({ t, title, children, onClose, size, bodyClassName, closing = false }) {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { e.preventDefault(); onClose() } }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
  /**
   * The panel slides in from the right edge, the way the outline slides in from the left.
   *
   * It used to fade in at the centre, which made two kinds of overlay float over the same page:
   * a panel from the left and a dialog in the middle. One motion for both — in from the edge,
   * flush against it, rounded on the inner side only — reads as one system.
   *
   * `size` picks the width. A cast list and a relationship graph do not want the same panel: the
   * content decides, and the drawer grows with it instead of squeezing everything into one
   * width.
   */
  return h('div', {
    className: `st-sheet-backdrop${closing ? ' st-closing' : ''}`, role: 'presentation',
    onMouseDown: (e) => { if (e.target === e.currentTarget) onClose() },
  },
    h('div', {
      className: 'st-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': title,
      // A named tier, not a pixel count: a page that needs room for a diagram asks for a rung on
      // the width ladder, and the stylesheet turns that rung into a fixed width. Without one the
      // panel sizes to its content, which is right for a two-item list.
      'data-size': size,
      style: size === undefined ? undefined : { '--st-sheet-max': `var(--st-w-${size})` },
    },
      h('div', { className: 'st-sheet-head' },
        h('h2', { className: 'st-sheet-title' }, title),
        h('span', { className: 'st-spacer' }),
        h('button', {
          type: 'button', className: 'st-btn st-btn-ghost', title: t('action.close'),
          onClick: onClose,
        }, '✕')),
      h('div', { className: `st-sheet-body${bodyClassName === undefined ? '' : ` ${bodyClassName}`}` }, children)))
}

/**
 * A modal confirmation. Destructive actions are asked for over the whole panel, not inside the
 * row they act on: a card-sized prompt is easy to miss, and a delete is not undoable.
 *
 * Escape and a click on the backdrop both cancel, which is what every host dialog does.
 */
/**
 * A modal question with a primary action.
 *
 * `danger` is what makes the confirm button red, and it defaults to TRUE because every caller
 * but one is confirming a deletion. Creating a book goes through the same dialog — one modal,
 * one set of paddings, one Escape handler — but its button must not be painted as destructive.
 */
export function ConfirmDialog({ t, title, children, confirmLabel, cancelLabel, onConfirm, onCancel, busy, danger = true }) {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { e.preventDefault(); onCancel() } }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])
  return h('div', {
    className: 'st-backdrop', role: 'presentation',
    onMouseDown: (e) => { if (e.target === e.currentTarget) onCancel() },
  },
    h('div', {
      className: 'st-dialog', role: 'dialog', 'aria-modal': 'true', 'aria-label': title,
    },
      h('div', { className: 'st-dialog-title' }, title),
      h('div', { className: 'st-dialog-body' }, ...(children ?? [])),
      h('div', { className: 'st-dialog-actions' },
        h('button', { type: 'button', className: 'st-btn', onClick: onCancel }, cancelLabel ?? t('action.cancel')),
        h('button', {
          type: 'button', className: `st-btn st-btn-primary${danger ? ' st-danger' : ''}`, disabled: busy === true,
          onClick: onConfirm,
        }, confirmLabel ?? t('action.ok')))))
}

/** Sidebar entry icon: the panel's only entry point, so it must exist. */
export function PanelIcon(props) {  const size = props?.size ?? 16
  return h('svg', {
    viewBox: '0 0 64 64', width: size, height: size, 'aria-hidden': true,
    fill: 'none', stroke: 'currentColor', strokeWidth: 5,
  },
    h('rect', { x: 8, y: 10, width: 48, height: 44, rx: 6 }),
    h('path', { d: 'M20 24h24M20 34h24M20 44h14', strokeLinecap: 'round' }))
}

/**
 * Rail toggle icon: a panel outline with its divider, the shape every editor uses for a
 * sidebar toggle. Drawn as SVG so it inherits the theme colour and stays crisp.
 */
/**
 * Directory icon: three ruled lines, the shape every editor uses for "contents".
 *
 * The old glyph was a panel outline with a chevron, which said "sidebar" — this opens the
 * outline now, so the icon names the thing it opens.
 */
export function RailIcon() {
  return h('svg', {
    className: 'st-icon-lg', viewBox: '0 0 16 16', 'aria-hidden': true,
    fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round',
    // Same weight in both states. The dimming was how the host marks an inactive toggle, but here
    // the toggle is the way IN to the contents — dimming it made the one control a writer needs
    // first look like the least available thing in the row.
    opacity: 1,
  },
    h('path', { d: 'M2.5 4h11' }),
    h('path', { d: 'M2.5 8h8' }),
    h('path', { d: 'M2.5 12h9' }))
}

/**
 * The title row's three icons, and the two on the two menus.
 *
 * Drawn on a 16px grid at 1.6 and inheriting currentColor, the same as the rail toggle above,
 * so every icon in the row weighs the same and follows the theme. Each one names what its
 * control does: a board for the mosaic, a stack of layers for the model picker (the host's own
 * picker uses a comparable glyph), sliders for settings, a book for the book menu.
 */
/**
 * A puzzle piece: the board is where the parts of the book are fitted together.
 *
 * It replaced a window-pane glyph — a rounded square divided into four — which said "grid" and
 * nothing else; the same shape is what a table or a layout control would use.
 */
export function BoardIcon() {
  return h('svg', {
    className: 'st-bar-icon', viewBox: '0 0 16 16', width: 18, height: 18, 'aria-hidden': true,
    fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round',
  },
    // A square puzzle piece: a full-height body, a tab on the top edge and a notch on the right.
    // The old piece was wide and shallow, so at the same 18px box it looked a size smaller than
    // the page and layer glyphs. This one is drawn on the full 16-unit grid with no transform.
    h('path', { d: 'M3 13V4h2.4a1.6 1.6 0 1 1 3.2 0H13v2.4a1.6 1.6 0 1 0 0 3.2V13z' }))
}

/** A page with a pencil: 随笔, the half-formed thought kept beside the manuscript. */
export function NotebookIcon() {
  return h('svg', {
    className: 'st-bar-icon', viewBox: '0 0 16 16', width: 18, height: 18, 'aria-hidden': true,
    fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round',
  },
    h('path', { d: 'M3.2 2.8h6.2l3.4 3.4v7H3.2z' }),
    h('path', { d: 'M9.4 2.8v3.4h3.4' }),
    h('path', { d: 'm5.2 10.8 3.9-3.9 1.4 1.4-3.9 3.9-1.8.4z' }))
}

export function ModelIcon() {
  return h('svg', {
    className: 'st-bar-icon', viewBox: '0 0 16 16', width: 18, height: 18, 'aria-hidden': true,
    fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round',
  },
    h('path', { d: 'M2.5 5.5 8 2.5l5.5 3-5.5 3z' }),
    h('path', { d: 'M2.5 10.5 8 13.5l5.5-3' }))
}

export function SlidersIcon() {
  return h('svg', {
    className: 'st-bar-icon', viewBox: '0 0 16 16', width: 18, height: 18, 'aria-hidden': true,
    fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round',
  },
    h('path', { d: 'M2.5 5h11M2.5 11h11' }),
    h('circle', { cx: 5.5, cy: 5, r: 1.6 }),
    h('circle', { cx: 10.5, cy: 11, r: 1.6 }))
}

export function BackIcon() {
  return h('svg', {
    className: 'st-icon-md', viewBox: '0 0 16 16', 'aria-hidden': true,
    fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
  }, h('path', { d: 'M9.5 4 5.5 8 9.5 12' }))
}

export function BookIcon() {
  return h('svg', {
    className: 'st-bar-icon', viewBox: '0 0 16 16', width: 18, height: 18, 'aria-hidden': true,
    fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round',
  },
    h('path', { d: 'M2.5 3.5h3.75A1.75 1.75 0 0 1 8 5.25v8.25a1.75 1.75 0 0 0-1.75-1.75H2.5z' }),
    h('path', { d: 'M13.5 3.5H9.75A1.75 1.75 0 0 0 8 5.25v8.25a1.75 1.75 0 0 1 1.75-1.75h3.75z' }))
}

/**
 * The rail's function row icons: shelf, save, export, info.
 *
 * Same grid and stroke as the title row's icons above, because the two rows are the same kind of
 * control in two places — a 14px glyph at 1.6 on a 16px box, inheriting currentColor.
 */
export function ShelfIcon() {
  return h('svg', {
    className: 'st-bar-icon', viewBox: '0 0 16 16', width: 18, height: 18, 'aria-hidden': true,
    fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round',
  },
    h('path', { d: 'M2.5 3.5h4v9h-4zM9 3.5h4.5v9H9z' }),
    h('path', { d: 'M2.5 12.5h11' }))
}

export function McpIcon() {
  return h('svg', { viewBox: '0 0 16 16', width: 16, height: 16, 'aria-hidden': true, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.3 },
    h('circle', { cx: 3.2, cy: 8, r: 1.6 }), h('circle', { cx: 12.8, cy: 3.6, r: 1.6 }),
    h('circle', { cx: 12.8, cy: 12.4, r: 1.6 }),
    h('path', { d: 'M4.7 7.2l6.5-2.8M4.7 8.8l6.5 2.8' }))
}

export function FolderIcon() {
  return h('svg', { viewBox: '0 0 16 16', width: 16, height: 16, 'aria-hidden': true, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.4 },
    h('path', { d: 'M2.5 4.5h4l1.2 1.5h5.8v6.5h-11z', 'stroke-linejoin': 'round' }))
}

export function StartIcon() {
  return h('svg', {
    className: 'st-bar-icon', viewBox: '0 0 16 16', width: 18, height: 18, 'aria-hidden': true,
    fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round',
  },
    h('path', { d: 'M8 2.5v3.2M8 10.3v3.2M2.5 8h3.2M10.3 8h3.2' }),
    h('path', { d: 'm4.1 4.1 2.2 2.2M9.7 9.7l2.2 2.2M11.9 4.1 9.7 6.3M6.3 9.7l-2.2 2.2' }))
}

export function SaveIcon() {
  return h('svg', {
    className: 'st-bar-icon', viewBox: '0 0 16 16', width: 18, height: 18, 'aria-hidden': true,
    fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round',
  },
    h('path', { d: 'M3 3.5h7.5L13 6v6.5H3z' }),
    h('path', { d: 'M5.5 3.5v3h4v-3M5.5 9.5h5v3h-5z' }))
}

export function ExportIcon() {
  return h('svg', {
    className: 'st-bar-icon', viewBox: '0 0 16 16', width: 18, height: 18, 'aria-hidden': true,
    fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round',
  },
    h('path', { d: 'M8 2.5v7.5M8 10 5 7M8 10l3-3' }),
    h('path', { d: 'M2.5 11v2.5h11V11' }))
}

export function InfoIcon() {
  return h('svg', {
    className: 'st-bar-icon', viewBox: '0 0 16 16', width: 18, height: 18, 'aria-hidden': true,
    fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round',
  },
    h('circle', { cx: 8, cy: 8, r: 5.5 }),
    h('path', { d: 'M8 7.2v3.6' }),
    h('path', { d: 'M8 5.1h.01' }))
}

/**
 * The two actions on a book card: rename and delete.
 *
 * Icons rather than labels. The shelf card is 184px wide and its inner row is 152 of that — two
 * Chinese labels ("重命名", "删除这部作品") needed more than it has, so the second one was clipped by
 * the card's own edge. A glyph fits, and the card is a grid where every child is the same size: a
 * control that only appears on hover cannot afford to change the row's height either.
 *
 * They keep a `title` because a glyph alone is a guess; the title is the one place the word can
 * live without occupying width.
 */
export function RenameIcon() {
  return h('svg', {
    className: 'st-card-action-icon', viewBox: '0 0 16 16', width: 14, height: 14, 'aria-hidden': true,
    fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round',
  },
    h('path', { d: 'M10.5 2.5 13.5 5.5 6 13H3v-3z' }),
    h('path', { d: 'M9 4 12 7' }))
}

export function TrashIcon() {
  return h('svg', {
    className: 'st-card-action-icon', viewBox: '0 0 16 16', width: 14, height: 14, 'aria-hidden': true,
    fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round',
  },
    h('path', { d: 'M2.5 4.5h11' }),
    h('path', { d: 'M6 4.5V3h4v1.5' }),
    h('path', { d: 'M4 4.5 4.7 13h6.6l.7-8.5' }),
    h('path', { d: 'M6.5 7v3.5M9.5 7v3.5' }))
}

/**
 * The panel's own tooltip, drawn instead of the browser's `title` bubble.
 *
 * Call sites keep writing plain `title` attributes — the layer listens on the shell for a
 * pointer entering something that carries one, PARKS the attribute (so the OS bubble never
 * appears), and draws a panel-styled bubble below the control: the one direction the chrome
 * above a control rarely leaves free, the space under it usually is. Leaving the control
 * restores the attribute and puts the bubble away; a short delay keeps it from flickering
 * across a row of buttons.
 */
export function TooltipLayer({ rootRef }) {
  const [tip, setTip] = React.useState(null)
  const held = React.useRef(null)
  React.useEffect(() => {
    const root = rootRef?.current
    if (root === null || root === undefined) return undefined
    let timer = null
    const hide = () => {
      if (timer !== null) { globalThis.clearTimeout(timer); timer = null }
      const heldTip = held.current
      if (heldTip !== null) {
        heldTip.el.setAttribute('title', heldTip.title)
        held.current = null
      }
      setTip(null)
    }
    const show = (el) => {
      const text = el.getAttribute('title')
      if (text === null || text === '') return
      held.current = { el, title: text }
      el.removeAttribute('title')
      timer = globalThis.setTimeout(() => {
        const rect = el.getBoundingClientRect()
        const shellRect = root.getBoundingClientRect()
        setTip({
          text,
          left: Math.max(8, Math.min(rect.left + rect.width / 2 - shellRect.left, shellRect.width - 8)),
          top: rect.bottom - shellRect.top + 6,
        })
      }, 400)
    }
    const onOver = (e) => {
      const el = e.target?.closest?.('[title]')
      if (el === null || el === undefined || el === held.current?.el) return
      hide()
      show(el)
    }
    const onOut = (e) => {
      const heldTip = held.current
      if (heldTip === null) return
      const to = e.relatedTarget
      if (to !== null && to !== undefined && heldTip.el.contains(to)) return
      hide()
    }
    root.addEventListener('pointerover', onOver, true)
    root.addEventListener('pointerout', onOut, true)
    root.addEventListener('pointerdown', hide, true)
    return () => {
      root.removeEventListener('pointerover', onOver, true)
      root.removeEventListener('pointerout', onOut, true)
      root.removeEventListener('pointerdown', hide, true)
      hide()
    }
  }, [rootRef])
  if (tip === null) return null
  return h('div', { className: 'st-tip', role: 'tooltip', style: { left: tip.left, top: tip.top } }, tip.text)
}

/**
 * The segmented choice: one track, every option visible, exactly one selected.
 *
 * The panel had four hand-built copies of this skeleton (typography, auto-save, image style, the
 * history drawer's pages), which is four places for the group semantics — role, aria-label, one
 * pressed item — to drift. One component takes the options and the choice; the caller keeps the
 * decision about what the options ARE.
 *
 * `options` is `{ value, label }` pairs, `label` already localized. `testId`, when given, is
 * prefixed onto every option's `data-testid`, for tests that press one stop by name.
 */
export function SegGroup({ label, options, value, onChange, testId, disabled = false }) {
  return h('div', { className: 'st-seg', role: 'group', 'aria-label': label },
    options.map((option) => h('button', {
      key: option.value, type: 'button', className: 'st-seg-item',
      'data-testid': testId === undefined ? undefined : `${testId}-${option.value}`,
      'aria-pressed': option.value === value ? 'true' : 'false',
      disabled: disabled === true,
      onClick: () => onChange(option.value),
    }, option.label)))
}

/**
 * A column of comparable rows. The chapter list, the proposal list and the snapshot list are
 * the same object at different contents: no gaps, a hairline between rows, and the row under
 * the pointer lifts. One component keeps the three from drifting into three looks.
 *
 * `List` is the column; `ListRow` is one row. A row that navigates passes `onActivate` and is a
 * button; a row that only holds content stays a div, because a button wrapping other buttons is
 * invalid and swallows clicks on them.
 */

/**
 * The master-detail layout shared by 概览, 提案 and 流派: a navigation column on the left and a
 * reading pane on the right. The pages build the rows and the detail body; this decides only
 * the relationship between them, so the three pages cannot drift into three different splits.
 */
export function SplitPane({ list, detail, listProps, detailProps }) {
  const rows = Array.isArray(list) ? list : list === undefined ? [] : [list]
  const body = Array.isArray(detail) ? detail : detail === undefined ? [] : [detail]
  return h('div', { className: 'st-split' },
    h('div', { className: 'st-split-list', ...(listProps ?? {}) }, ...rows),
    h('section', { className: 'st-split-detail', ...(detailProps ?? {}) }, ...body))
}

export function List({ className, children, ...rest }) {
  const rows = Array.isArray(children) ? children : children === undefined ? [] : [children]
  return h('div', {
    className: `st-list${className === undefined ? '' : ` ${className}`}`,
    ...rest,
  }, ...rows)
}

export function ListRow({ className, active, onActivate, children, ...rest }) {
  const rows = Array.isArray(children) ? children : children === undefined ? [] : [children]
  const interactive = typeof onActivate === 'function'
  return h(interactive ? 'button' : 'div', {
    ...(interactive ? { type: 'button', onClick: onActivate } : {}),
    ...rest,
    className: `st-list-row${className === undefined ? '' : ` ${className}`}`,
    'data-active': active === true ? 'true' : undefined,
  }, ...rows)
}

/**
 * A dialog with one body and a close button: reading surfaces (the merged manuscript, the style
 * profile, the continuity report) open here instead of stacking up the page they were launched
 * from. Escape, the backdrop and the ✕ all close it, the same three ways every dialog closes.
 */
export function Dialog({ t, title, children, onClose, size, bodyClassName, panelClassName, backdropClassName }) {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { e.preventDefault(); onClose() } }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
  const body = Array.isArray(children) ? children : children === undefined ? [] : [children]
  return h('div', {
    className: `st-backdrop${backdropClassName === undefined ? '' : ` ${backdropClassName}`}`, role: 'presentation',
    onMouseDown: (e) => { if (e.target === e.currentTarget) onClose() },
  },
    h('div', {
      className: `st-dialog st-dialog-panel${panelClassName === undefined ? '' : ` ${panelClassName}`}`, role: 'dialog', 'aria-modal': 'true', 'aria-label': title,
      style: size === undefined ? undefined : { '--st-dialog-w': `var(--st-w-${size})` },
    },
      h('div', { className: 'st-dialog-head' },
        h('h2', { className: 'st-dialog-title' }, title),
        h('span', { className: 'st-spacer' }),
        h('button', { type: 'button', className: 'st-btn st-btn-ghost', title: t('action.close'), onClick: onClose }, '✕')),
      h('div', { className: `st-dialog-body st-dialog-scroll${bodyClassName === undefined ? '' : ` ${bodyClassName}`}` }, ...body)))
}
