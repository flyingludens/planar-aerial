/**
 * The gallery cards: a page of objects read side by side.
 *
 * One card shell serves the cast and the world pages — they differ in what goes INSIDE the card,
 * not in how a card looks. The shell is where the clickable and non-clickable cases are kept
 * apart: a card that opens something is a button, a card that only holds a field is not.
 */
import { React, h } from '../shared/react.js'
import { useDismiss } from '../shared/hooks.js'

/**
 * The picture area of a gallery card: the generated portrait when there is one, the first
 * character of the name when there is not.
 */
export function MosaicPortrait({ label, picture }) {
  const initial = String(label ?? '').trim().slice(0, 1)
  // The picture, and ONLY the picture: the card is a picture over a caption, and a name inside
  // the picture's half was a third zone nobody had drawn. The caption belongs to the card.
  return h('div', { className: 'st-mosaic-portrait', 'data-testid': 'mosaic-portrait' },
    h('div', { className: 'st-mosaic-portrait-frame' },
      picture !== null && picture !== undefined
        ? h('img', { src: picture, alt: label ?? '', draggable: false })
        : initial === '' ? null : h('span', { className: 'st-mosaic-portrait-initial' }, initial)))
}

/**
 * The card's title line: the name, then the role beside it. One line, in the caption's half.
 * The name is not repeated in the summary under it — it was once, and the card read "沈砚"
 * twice with the role wedged between the two.
 */
export function MosaicCardTitle({ label, role }) {
  return h('div', { className: 'st-mosaic-portrait-hint' },
    h('span', { className: 'st-mosaic-portrait-name' }, label),
    role !== '' && role !== undefined && role !== null ? h('span', { className: 'st-mosaic-portrait-role' }, role) : null)
}

/**
 * One card in a gallery: the picture, the caption under it, and the body.
 *
 * The world and cast pages were two copies of this shell, and the copies had drifted — one was
 * keyboard-operable, one was not. Making the difference an explicit argument stops the drifting:
 * a card either has an `onActivate` or it does not, and the answer is visible at every call site.
 */
export function MosaicGalleryCard({ id, kind, label, role, picture, onActivate, children }) {
  // The test harness calls components as `type(props)`, so children arrive in props rather
  // than as trailing arguments; both shapes are accepted.
  const body = Array.isArray(children) ? children : children === undefined ? [] : [children]
  // A card that opens something is a button; announcing a textarea's container as one would
  // make a screen reader offer to "press" it.
  const interactive = typeof onActivate === 'function'
  return h('article', {
    key: id,
    className: 'st-mosaic-page-card',
    'data-kind': kind,
    ...(interactive ? {
      role: 'button',
      tabIndex: 0,
      onClick: () => onActivate(),
      onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onActivate() } },
    } : { 'data-testid': 'mosaic-gallery-card' }),
  },
    // No picture means no portrait band: a card without a picture is a text-only entry.
    picture === undefined ? null : h(MosaicPortrait, { label, picture }),
    h('div', { className: 'st-mosaic-card-text' },
      picture === undefined ? null : h(MosaicCardTitle, { label, role }),
      h('div', { className: 'st-mosaic-card-body' }, ...body)))
}

/**
 * The ⋯ menu on a card: the two things you can do to the thing it shows.
 *
 * It exists because a card has TWO jobs competing for the same click — pressing the card opens
 * it, so editing and deleting had nowhere to live. A menu in the corner is one control instead
 * of two, the same control on every surface, and it leaves the card's own click alone.
 */
export function MosaicCardMenu({ t, onEdit, onDelete }) {
  const [open, setOpen] = React.useState(false)
  const rootRef = React.useRef(null)
  useDismiss(rootRef, open, () => setOpen(false))
  // A card with neither action has no menu to offer.
  if (typeof onEdit !== 'function' && typeof onDelete !== 'function') return null
  return h('div', { className: 'st-card-menu', ref: rootRef },
    h('button', {
      type: 'button', className: 'st-card-menu-trigger',
      'aria-label': t('action.cardActions'), 'aria-haspopup': 'menu',
      'aria-expanded': open ? 'true' : 'false',
      // The card underneath opens on click; a control inside it must not also do that.
      onClick: (e) => { e.stopPropagation?.(); setOpen((was) => !was) },
    // Three dots STACKED, drawn rather than typed: a glyph's dots sit on the text baseline and
    // space themselves by the font. Three spans are the same size everywhere.
    }, h('span', { className: 'st-card-menu-dots', 'aria-hidden': true },
      h('i', null), h('i', null), h('i', null))),
    open ? h('div', { className: 'st-card-menu-list', role: 'menu' },
      typeof onEdit === 'function' ? h('button', {
        type: 'button', className: 'st-card-menu-item', role: 'menuitem',
        onClick: (e) => { e.stopPropagation?.(); setOpen(false); onEdit() },
      }, t('action.editCard')) : null,
      typeof onDelete === 'function' ? h('button', {
        type: 'button', className: 'st-card-menu-item st-danger', role: 'menuitem',
        onClick: (e) => { e.stopPropagation?.(); setOpen(false); onDelete() },
      }, t('action.deleteCard')) : null) : null)
}

/**
 * The gallery itself: the grid, and the empty state that goes in it. Separate from the card
 * because the "nothing here yet" line is the page's, not the card's.
 */
export function MosaicGallery({ t, rows, children }) {
  // `children` rather than a render callback: a callback returning components is opaque to the
  // test harness (it expands elements, not closures). Elements passed in are expanded.
  const cards = Array.isArray(children) ? children : children === undefined ? [] : [children]
  if (rows !== undefined && rows.length === 0) return h('p', { className: 'st-mosaic-empty' }, t('mosaic.empty'))
  return h('div', { className: 'st-mosaic-gallery' }, ...cards)
}

/**
 * The world page and the item page share one list, split by kind: without `itemsOnly` the
 * non-item cards show, with it only the items. An item additionally resolves its holders
 * through LIVE 持有 edges — a retired edge is history, not present state, so it names nobody.
 */
export function MosaicCards({ t, mosaic, itemsOnly = false, onInspect, onEdit, onDelete, pictureOf }) {
  const entities = Array.isArray(mosaic.entities) ? mosaic.entities : []
  // The split is by KIND, not by a category string: matching on the word 物品 meant a card
  // called "物品清单" landed on the wrong page.
  const cards = entities.filter((e) => (itemsOnly ? e.kind === 'item' : e.kind !== 'character' && e.kind !== 'item'))
  const holdersOf = (cardId) => (Array.isArray(mosaic.edges) ? mosaic.edges : [])
    .filter((edge) => edge.retired !== true && edge.from === cardId && edge.truth?.kind === '持有')
    .map((edge) => entities.find((e) => e.id === edge.to)?.name)
    .filter((name) => name !== undefined)
  return h(MosaicGallery, { t, rows: cards },
    cards.map((card) => h(MosaicGalleryCard, {
      key: card.id,
      id: card.id, kind: card.kind, label: card.name, role: card.summary,
      picture: pictureOf(card),
      // The whole card is the hit target: a card that only opened from its title would make
      // the writer aim at text they cannot see the edges of.
      onActivate: () => onInspect(card),
    },
      // The holder line belongs to items: who owns it is the fact checked most often, and it
      // sits above the prose so a long body does not bury it.
      itemsOnly
        ? h('p', { className: 'st-mosaic-page-holder' },
            holdersOf(card.id).join('、') || t('mosaic.noHolder'))
        : null,
      card.description !== '' ? h('p', { className: 'st-mosaic-card-summary' }, card.description) : null,
      h(MosaicCardMenu, {
        t,
        onEdit: typeof onEdit === 'function' ? () => onEdit(card) : undefined,
        onDelete: typeof onDelete === 'function' ? () => onDelete(card) : undefined,
      }))))
}

/**
 * The cast page: every character on the board with role, summary and status chips. The board
 * is the author's working view, so the writer sees all of it here; the canvas already names
 * only the role as the card's sub-line.
 */
export function MosaicCast({ t, mosaic, onInspect, onEdit, onDelete, pictureOf }) {
  const cast = (Array.isArray(mosaic.entities) ? mosaic.entities : []).filter((e) => e.kind === 'character')
  return h(MosaicGallery, { t, rows: cast },
    cast.map((c) => h(MosaicGalleryCard, {
      key: c.id,
      id: c.id, kind: 'character', label: c.name, role: c.role,
      picture: pictureOf(c),
      onActivate: () => onInspect(c),
    },
      // No heading here: the caption already names the character next to their role, and a
      // second copy of the name would be the card's most prominent text twice over.
      c.summary !== '' ? h('p', { className: 'st-mosaic-card-summary' }, c.summary) : null,
      (c.statuses ?? []).length > 0
        ? h('div', { className: 'st-mosaic-chips' },
            c.statuses.map((s) => h('span', { key: s.id, className: 'st-mosaic-chip' }, s.label)))
        : null,
      h(MosaicCardMenu, {
        t,
        onEdit: typeof onEdit === 'function' ? () => onEdit(c) : undefined,
        onDelete: typeof onDelete === 'function' ? () => onDelete(c) : undefined,
      }))))
}
