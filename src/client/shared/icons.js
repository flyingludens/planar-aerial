/**
 * The panel's own glyphs: business icons that name things only this panel has.
 *
 * The generic widgets they sit beside moved to the fang-style library, but these SVGs name
 * book-and-board concepts (the shelf, the notebook, the mosaic) that no general library should
 * know about, so they stay here. Same grid across the set — 16 or 18px box, currentColor,
 * comparable stroke — so a row of them weighs evenly.
 */
import { h } from './react.js'

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

/** The context page: a stack of lines, the same weight as the other rail glyphs. */
export function ContextIcon() {
  return h('svg', {
    className: 'st-bar-icon', viewBox: '0 0 16 16', width: 18, height: 18, 'aria-hidden': true,
    fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round',
  },
    h('path', { d: 'M3 4.5h10M3 8h7M3 11.5h10' }))
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
