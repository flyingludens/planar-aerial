/**
 * The cast graph: cards placed on a canvas, with the author's truth drawn as wires.
 *
 * This is the board's formal view — who relates to whom, in which direction, and what each of
 * them believes. It reads the board's `edges`, lays the cards out, and opens a popover for a
 * picked card or a picked wire.
 */
import { React, h } from '../shared/react.js'
import { rowId } from '../shared/logic.js'
import { kindLabel, kindFields, fieldLabel, fieldValue } from './labels.js'
import { CARD_W, CARD_H, PIN_Y, mosaicFreeSpot } from './geometry.js'
import { patchEntityOnBoard } from './write.js'
import { Chevron, useDismiss } from 'fang-style'

/** The generate-portrait glyph: a four-point sparkle, the shape every image tool uses. Drawn
    rather than typed so it inherits the button's ink; the spin while the model works is applied
    by the stylesheet off the button's data-busy attribute. */
export function GenerateIcon() {
  return h('svg', {
    className: 'st-icon-md', viewBox: '0 0 16 16', 'aria-hidden': true,
    fill: 'currentColor',
  },
    h('path', { d: 'M8 1.4 9.3 5.6 13.5 6.9 9.3 8.2 8 12.4 6.7 8.2 2.5 6.9 6.7 5.6Z' }),
    h('path', { d: 'M12.6 10.4 13.2 12 14.8 12.6 13.2 13.2 12.6 14.8 12 13.2 10.4 12.6 12 12Z' }))
}

/**
 * The picture a detail view shows, and the button that makes one.
 *
 * The canvas popover and the detail page drew the same frame and the same corner button twice;
 * one component is why they cannot drift. `editable` is the caller's choice: the popover offers
 * the button whenever a portrait can be made, the page only in edit mode — generating is a
 * change to the card, and read mode has nothing to change.
 */
export function DetailPortrait({ t, entity, picture, busy, onPortrait, editable }) {
  const hasPicture = picture !== null && picture !== undefined
  const label = hasPicture ? t('mosaic.regeneratePortrait') : t('mosaic.generatePortrait')
  return h('div', { className: 'st-mosaic-detail-portrait' },
    h('div', { className: 'st-mosaic-detail-frame' },
      hasPicture
        ? h('img', { src: picture, alt: entity.name, draggable: false })
        : h('span', { className: 'st-mosaic-detail-initial' }, String(entity.name ?? '').trim().slice(0, 1))),
    editable ? h('button', {
      type: 'button', className: 'st-mosaic-detail-generate',
      'data-testid': 'mosaic-generate-portrait', 'data-busy': busy ? 'true' : 'false',
      disabled: busy || typeof onPortrait !== 'function',
      title: label, 'aria-label': label,
      onClick: () => { if (typeof onPortrait === 'function') onPortrait(entity) },
    }, h(GenerateIcon)) : null)
}

/**
 * One labelled picker on the board's foot row: a framed field, a button showing the current
 * choice, and a list anchored to that field.
 *
 * Not a native select on purpose: the OS decides where a native popup opens, and at the foot of
 * a scrolling sheet it opens upward over the control. Here the field is the positioning context
 * and the list opens away from it. Closes on a pick, on Escape, and on a press outside — the
 * shared menu dismissal.
 */
function MosaicPick({ label, testId, value, options, onPick }) {
  const [open, setOpen] = React.useState(false)
  const rootRef = React.useRef(null)
  useDismiss(rootRef, open, () => setOpen(false))
  const current = options.find((option) => option.value === value) ?? options[0]
  const pick = (next) => { setOpen(false); onPick(next) }
  return h('div', { className: 'st-mosaic-pick', ref: rootRef },
    h('span', { className: 'st-mosaic-focus-label' }, label),
    h('button', {
      type: 'button', className: 'st-mosaic-pick-button', 'data-testid': testId,
      'aria-haspopup': 'listbox', 'aria-expanded': open ? 'true' : 'false',
      'aria-label': label,
      onClick: () => setOpen((was) => !was),
      onKeyDown: (event) => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
        event.preventDefault()
        // Arrow keys step the value without opening: the common case is one step away.
        const at = options.findIndex((option) => option.value === value)
        const step = event.key === 'ArrowDown' ? 1 : -1
        const next = options[Math.min(options.length - 1, Math.max(0, (at < 0 ? 0 : at) + step))]
        if (next !== undefined) pick(next.value)
      },
    },
      h('span', { className: 'st-mosaic-pick-value' }, current === undefined ? '' : current.label),
      h(Chevron, { open })),
    open ? h('div', { className: 'st-mosaic-pick-list', role: 'listbox', 'aria-label': label },
      options.map((option) => h('button', {
        key: option.value === '' ? '__none' : option.value,
        type: 'button', className: 'st-mosaic-pick-option', role: 'option',
        'aria-selected': option.value === value ? 'true' : 'false',
        'aria-checked': option.value === value ? 'true' : 'false',
        onClick: () => pick(option.value),
      }, option.label))) : null)
}

/**
 * The edge half of the detail popover: the AUTHOR's truth first, then each holder's belief, then
 * the change log. Read-only, so it owns no hooks at all.
 */
function MosaicEdgeDetail({ t, picked, byId, onClose }) {
  const edge = picked.edge
  const from = byId.get(edge.from)
  const to = byId.get(edge.to)
  const holderName = (id) => byId.get(id)?.name ?? t('mosaic.untitled')
  return h('div', { className: 'st-mosaic-detail' },
    h('div', { className: 'st-mosaic-detail-head' },
      h('span', { className: 'st-mosaic-detail-title' }, edge.truth.kind || t('mosaic.untitled')),
      edge.retired === true ? h('span', { className: 'st-mosaic-badge' }, t('mosaic.retired')) : null,
      h('button', { type: 'button', className: 'fang-btn fang-btn-ghost st-mosaic-detail-close', title: t('action.close'), onClick: onClose }, '✕')),
    h('div', { className: 'st-mosaic-detail-section st-mosaic-detail-direction-section' },
      h('div', { className: 'st-mosaic-detail-label' }, t('mosaic.direction')),
      h('div', { className: 'st-mosaic-detail-direction' },
        h('span', { className: 'st-mosaic-detail-party' },
          h('span', { className: 'st-mosaic-detail-party-label' }, t('mosaic.subject')),
          h('span', { className: 'st-mosaic-detail-holder' }, from?.name ?? t('mosaic.untitled'))),
        h('span', { className: 'st-mosaic-detail-direction-arrow', 'aria-hidden': true }, '→'),
        h('span', { className: 'st-mosaic-detail-party' },
          h('span', { className: 'st-mosaic-detail-party-label' }, t('mosaic.object')),
          h('span', { className: 'st-mosaic-detail-holder' }, to?.name ?? t('mosaic.untitled'))))),
    edge.truth.note !== '' ? h('p', { className: 'st-mosaic-detail-note' }, edge.truth.note) : null,
    edge.beliefs.length > 0
      ? h('div', { className: 'st-mosaic-detail-section' },
          h('div', { className: 'st-mosaic-detail-label' }, t('mosaic.beliefs')),
          edge.beliefs.map((b, i) => h('div', { key: b.holderId ?? i, className: 'st-mosaic-detail-row' },
            h('span', { className: 'st-mosaic-detail-holder' }, holderName(b.holderId)),
            h('span', { className: 'st-mosaic-detail-kind' }, b.kind),
            b.note !== '' ? h('span', { className: 'st-mosaic-detail-note' }, b.note) : null)))
      : null,
    edge.log.length > 0
      ? h('div', { className: 'st-mosaic-detail-section' },
          h('div', { className: 'st-mosaic-detail-label' }, t('mosaic.log')),
          edge.log.map((l, i) => h('div', { key: i, className: 'st-mosaic-detail-row' },
            h('span', { className: 'st-mosaic-detail-holder' }, l.what),
            h('span', { className: 'st-mosaic-detail-note' }, String(l.at)))))
      : null)
}

/**
 * The entity half of the detail popover: portrait, identity, prose, statuses and tags — all of
 * it editable. Writes go through the shared board patch, so an edit lands through `updateBook`
 * exactly like a layout drag.
 */
function MosaicEntityDetail({ t, picked, byId, onPatchEntity, onClose, onPortrait, portraitOf, portraitBusy, portraitError }) {
  // Resolve the entity through the board, not the picked snapshot: an edit must read back what
  // the last edit wrote, or a second patch resurrects the first one's change from stale state.
  const entity = byId.get(picked.entity.id) ?? picked.entity
  const isCharacter = entity.kind === 'character'
  const [statusDraft, setStatusDraft] = React.useState('')
  const [tagDraft, setTagDraft] = React.useState('')
  // The call site keys this component by entity id, which remounts it; the effect says the same
  // thing for a host that keeps the instance while the pick moves.
  React.useEffect(() => { setStatusDraft(''); setTagDraft('') }, [entity.id])

  const patch = (fields) => onPatchEntity(entity.id, fields)
  const removeStatus = (label) => {
    patch({ statuses: (entity.statuses ?? []).filter((s) => s.label !== label) })
  }
  const addStatus = () => {
    const label = statusDraft.trim()
    if (label === '') return
    setStatusDraft('')
    if ((entity.statuses ?? []).some((s) => s.label === label)) return
    patch({ statuses: [...(entity.statuses ?? []), { id: rowId('s'), label }] })
  }
  const removeTag = (tag) => patch({ tags: (entity.tags ?? []).filter((each) => each !== tag) })
  const addTag = () => {
    const tag = tagDraft.trim()
    if (tag === '') return
    setTagDraft('')
    if ((entity.tags ?? []).includes(tag)) return
    patch({ tags: [...(entity.tags ?? []), tag] })
  }

  // The board stores only the portrait's PATH — a data URI in book.json would turn a readable
  // manuscript file into a blob — and portraitOf resolves it into bytes the page can draw.
  const picture = typeof portraitOf === 'function' ? portraitOf(entity) : null
  const busy = portraitBusy === true

  return h('div', { className: 'st-mosaic-detail' },
    h('div', { className: 'st-mosaic-detail-head' },
      h(DetailPortrait, { t, entity, picture, busy, onPortrait, editable: true }),
      h('div', { className: 'st-mosaic-detail-identity' },
        h('input', {
          type: 'text', className: 'st-mosaic-field st-mosaic-field-title',
          'data-testid': 'mosaic-name-edit', value: entity.name ?? '',
          'aria-label': t('mosaic.name'),
          onChange: (e) => patch({ name: e.target.value }),
        }),
        h('input', {
          type: 'text', className: 'st-mosaic-field',
          'data-testid': isCharacter ? 'mosaic-role-edit' : 'mosaic-summary-edit',
          value: (isCharacter ? entity.role : entity.summary) ?? '',
          placeholder: isCharacter ? t('mosaic.rolePlaceholder') : undefined,
          'aria-label': isCharacter ? t('mosaic.role') : t('mosaic.newSummary'),
          onChange: (e) => patch(isCharacter ? { role: e.target.value } : { summary: e.target.value }),
        })),
      h('button', {
        type: 'button', className: 'fang-btn fang-btn-ghost st-mosaic-detail-close',
        title: t('action.close'), 'aria-label': t('action.close'), onClick: onClose,
      }, '✕')),
    // The rest of the kind's schema fields. They are always listed, blank or not: hiding an empty
    // field is how a character's age and gender disappeared from this view entirely.
    h('div', { className: 'st-mosaic-detail-section' },
      kindFields(entity.kind).filter((field) => !(isCharacter && field === 'role')).map((field) => h('div', {
        key: field, className: 'st-mosaic-detail-row',
      },
        h('span', { className: 'st-mosaic-detail-field-label' }, fieldLabel(field, t)),
        h('span', { className: 'st-mosaic-detail-field-value' },
          fieldValue(entity, field, (id) => byId.get(id)?.name ?? t('mosaic.untitled')))))),
    // A failed generation says why, where the button was pressed. Silence after a click reads
    // as a broken button.
    portraitError !== null && portraitError !== undefined && portraitError !== ''
      ? h('p', { className: 'st-mosaic-detail-error', role: 'alert' }, String(portraitError))
      : null,
    // A person's one-liner is the text this page is FOR; for every other kind the long
    // description is, and the one-liner already sits in the identity row above.
    h('div', { className: 'st-mosaic-detail-section' },
      h('div', { className: 'st-mosaic-detail-label' },
        isCharacter ? t('mosaic.newSummary') : t('mosaic.newDescription')),
      h('textarea', {
        className: 'st-mosaic-field st-mosaic-field-area',
        'data-testid': isCharacter ? 'mosaic-summary-edit' : 'mosaic-description-edit',
        value: (isCharacter ? entity.summary : entity.description) ?? '',
        rows: 4,
        onChange: (e) => patch(isCharacter ? { summary: e.target.value } : { description: e.target.value }),
      })),
    // Statuses belong to every kind, not only to people; the row stays even when it is empty.
    h('div', { className: 'st-mosaic-detail-section' },
      h('div', { className: 'st-mosaic-detail-label' }, t('mosaic.statuses')),
      h('div', { className: 'st-mosaic-chip-row' },
        (entity.statuses ?? []).map((s) => h('span', {
          key: s.id, className: 'st-mosaic-chip st-mosaic-chip-toggle',
          'data-testid': 'mosaic-status-chip', title: t('mosaic.removeHint'),
          onClick: () => removeStatus(s.label),
        }, s.label)),
        h('input', {
          type: 'text', className: 'st-mosaic-status-add', 'data-testid': 'mosaic-status-add',
          value: statusDraft, placeholder: t('mosaic.statusAddPlaceholder'),
          onChange: (e) => setStatusDraft(e.target.value),
          onKeyDown: (e) => { if (e.key === 'Enter') { e.preventDefault(); addStatus() } },
        }))),
    h('div', { className: 'st-mosaic-detail-section' },
      h('div', { className: 'st-mosaic-detail-label' }, t('mosaic.tags')),
      h('div', { className: 'st-mosaic-chip-row' },
        (entity.tags ?? []).map((tag) => h('span', {
          key: tag, className: 'st-mosaic-chip st-mosaic-chip-toggle',
          'data-testid': 'mosaic-tag-chip', title: t('mosaic.removeHint'),
          onClick: () => removeTag(tag),
        }, tag)),
        h('input', {
          type: 'text', className: 'st-mosaic-status-add', 'data-testid': 'mosaic-tag-add',
          value: tagDraft, placeholder: t('mosaic.tagAddPlaceholder'),
          onChange: (e) => setTagDraft(e.target.value),
          onKeyDown: (e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } },
        }))),
    // The escape-hatch rows, read-only here; the page is where one is added or removed.
    h('div', { className: 'st-mosaic-detail-section' },
      h('div', { className: 'st-mosaic-detail-label' }, t('mosaic.custom')),
      h('div', { className: 'st-mosaic-chip-row' },
        (entity.custom ?? []).map((row) => h('span', { key: row.id, className: 'st-mosaic-chip' },
          `${row.label}：${row.value}`)))))
}

/** One line of prose for one relation: the words the writer reads on hover, spelled with the
    arrow the edge itself carries, and a named count when somebody believes something else. */
const edgeTitle = (edge, from, to, t) => {
  const kind = edge.truth.kind || t('mosaic.untitled')
  const note = edge.truth.note === '' ? '' : `（${edge.truth.note}）`
  const line = `${from.name} —${kind}${note}→ ${to.name}`
  const beliefs = (edge.beliefs ?? []).length
  return beliefs === 0 ? line : `${line}\n${t('mosaic.beliefCount', { n: beliefs })}`
}

/** One sentence a card shows about its subject: the writer's paragraph when there is one, a
    person's one-liner as the fallback, and never a repeat of the line printed above it. */
const cardIntro = (entity) => {
  const description = typeof entity.description === 'string' ? entity.description.trim() : ''
  if (description !== '') return description
  return entity.kind === 'character' && typeof entity.summary === 'string' ? entity.summary.trim() : ''
}

/**
 * The relations canvas: one absolutely-positioned card per entity, SVG wires between the
 * endpoints of every LIVE edge, and a detail popover for the card or edge picked last.
 *
 * Dragging is purely presentational — it moves the card and nothing else. The offset lives in
 * local state while the pointer is down and is committed ONCE on pointerup, through the panel's
 * `updateBook`, so the layout rides the ordinary save queue.
 */
export function MosaicRelations({ t, mosaic, book, updateBook, picked, onPick, onPortrait, portraitOf, portraitBusyId, portraitError }) {
  // The graph is a CAST graph: characters and the relations between them. Items and places made
  // the page unreadable, and they have their own pages; `allEntities` keeps the full set for the
  // detail popover and the centre picker, which resolve names for either kind.
  const allEntities = Array.isArray(mosaic.entities) ? mosaic.entities : []
  const entities = allEntities.filter((e) => e.kind === 'character')
  // Two ways to narrow the board: a CENTRE (this entity and everything one hop from it — one
  // hop, because a transitive closure drags in most of the cast) and a KIND. They compose. The
  // view opens on 角色: this page is a cast graph, and the other kinds are one pick away.
  const [focusId, setFocusId] = React.useState(null)
  const [viewKind, setViewKind] = React.useState('character')
  const neighbourhood = (() => {
    if (focusId === null) return null
    const ids = new Set([focusId])
    for (const edge of Array.isArray(mosaic.edges) ? mosaic.edges : []) {
      if (edge.retired === true) continue
      if (edge.from === focusId) ids.add(edge.to)
      if (edge.to === focusId) ids.add(edge.from)
    }
    return ids
  })()
  const byId = new Map(allEntities.map((e) => [e.id, e]))
  const canvasRef = React.useRef(null)
  // A card's box: its stored layout, or — for the one frame before the placement effect has
  // written one — the same free spot that effect is about to choose. The fallback has to agree
  // with the effect, or the first paint draws the wire to the wrong place.
  const pendingSpots = (() => {
    const taken = entities
      .filter((entity) => entity.layout !== null && entity.layout !== undefined)
      .map((entity) => ({ x: entity.layout.x, y: entity.layout.y, w: CARD_W, h: CARD_H }))
    const map = new Map()
    for (const entity of entities) {
      if (entity.layout !== null && entity.layout !== undefined) continue
      const spot = mosaicFreeSpot(taken)
      taken.push({ x: spot.x, y: spot.y, w: CARD_W, h: CARD_H })
      map.set(entity.id, spot)
    }
    return map
  })()
  // ALWAYS a full { x, y }: a partial one renders as `top: null` and the card lands in the
  // wrong place, so each branch is checked for the property it needs.
  const pos = (entity) => {
    const layout = entity.layout
    if (layout !== null && layout !== undefined
      && Number.isFinite(layout.x) && Number.isFinite(layout.y)) {
      return { x: layout.x, y: layout.y }
    }
    const spot = pendingSpots.get(entity.id)
    if (spot !== null && spot !== undefined && Number.isFinite(spot.x) && Number.isFinite(spot.y)) {
      return { x: spot.x, y: spot.y }
    }
    // Unreachable in practice; the origin keeps a card visible if both ever miss.
    return { x: 24, y: 24 }
  }
  // The card being dragged and where the pointer has taken it. Offsets stay local until the
  // drop, so a gesture cancelled by leaving the canvas saves nothing.
  const [drag, setDrag] = React.useState(null)

  // Every card gets a position, once, and it is written down: a card's place cannot be derived
  // from its index — that reshuffled the wall whenever a filter hid a neighbour. `placed` guards
  // against the effect's own write, which re-runs it; without the flag it would save in a loop.
  const placedRef = React.useRef(false)
  React.useEffect(() => {
    if (placedRef.current) return
    const missing = entities.filter((entity) => entity.layout === null || entity.layout === undefined)
    if (missing.length === 0) { placedRef.current = true; return }
    placedRef.current = true
    const taken = entities
      .filter((entity) => entity.layout !== null && entity.layout !== undefined)
      .map((entity) => ({ x: entity.layout.x, y: entity.layout.y, w: CARD_W, h: CARD_H }))
    const assigned = new Map()
    for (const entity of missing) {
      const spot = mosaicFreeSpot(taken)
      taken.push({ x: spot.x, y: spot.y, w: CARD_W, h: CARD_H })
      assigned.set(entity.id, spot)
    }
    const current = book.mosaic
    if (current === undefined || current === null) return
    updateBook({
      ...book,
      mosaic: {
        ...current,
        entities: current.entities.map((e) => (
          assigned.has(e.id) ? { ...e, layout: assigned.get(e.id) } : e
        )),
      },
    })
  }, [book, entities, updateBook])

  // Where a card is RIGHT NOW: its slot plus the live drag offset. The wires go through this
  // one function too, so a line re-anchors on every pointer move instead of staying pinned to
  // the slot — the picture during the gesture is the picture after the drop.
  const livePos = (entity) => {
    const base = pos(entity)
    if (drag === null || drag.id !== entity.id) return base
    return { x: Math.max(0, base.x + drag.dx), y: Math.max(0, base.y + drag.dy) }
  }
  // The point a thread is tied to: the card's top-centre pin.
  const pinPos = (entity) => {
    const p = livePos(entity)
    return { x: p.x + CARD_W / 2, y: p.y + PIN_Y }
  }
  // What the board DRAWS: characters narrowed by the centre and the view. The centre may be an
  // item — its neighbours are characters, and "what is around this thing" is a real question.
  const drawn = entities.filter((entity) => {
    if (neighbourhood !== null && !neighbourhood.has(entity.id)) return false
    if (viewKind === 'character' && entity.kind !== 'character') return false
    // 'card' is the view's own name for "everything that is not a person", not a stored kind.
    if (viewKind === 'card' && entity.kind === 'character') return false
    return true
  })
  // A wire needs both ends on screen; an edge to a filtered-out entity is a line to nowhere.
  const drawnIds = new Set(drawn.map((e) => e.id))
  const live = (Array.isArray(mosaic.edges) ? mosaic.edges : [])
    .filter((e) => e.retired !== true && drawnIds.has(e.from) && drawnIds.has(e.to))

  const onMove = (entityId, layout) => {
    onPick(null)
    patchEntityOnBoard(book, updateBook, entityId, { layout })
  }

  // Cards draw from the filtered set but take their POSITION from the full list, so hiding one
  // never shifts the rest. The React key is the entity's own id — a key that changed with a
  // filter would remount every card and drop the one being edited.
  const cards = drawn.map((entity) => {
    const base = livePos(entity)
    // A small stable tilt is what makes a wall of photographs look pinned rather than laid out
    // by a grid. It is derived from the id, so a rerender does not make the cards twitch.
    const tilt = ((String(entity.id).charCodeAt(0) % 5) - 2) * 0.7
    return {
      entity,
      picture: typeof portraitOf === 'function' ? portraitOf(entity) : null,
      // Numbers, always: undefined renders as `top: null`, which React drops, leaving the card
      // at the canvas origin.
      style: {
        left: Number.isFinite(base.x) ? base.x : 24,
        top: Number.isFinite(base.y) ? base.y : 24,
        '--st-card-tilt': `${tilt}deg`,
      },
    }
  })

  return h('div', { className: 'st-mosaic-board' },
    h('div', {
      className: 'st-mosaic-canvas',
      ref: canvasRef,
      // The one definition of the card's size, handed to the stylesheet: the wires end at a
      // card's centre and CSS draws the box, so both must read the same number.
      style: { '--st-card-w': `${CARD_W}px`, '--st-card-h': `${CARD_H}px`, '--st-card-pin-y': `${PIN_Y}px` },
      onClick: (e) => {
        // A click on the empty canvas — not a card or an edge — dismisses the popover, like
        // every other scrim in the panel.
        if (e.target === e.currentTarget) onPick(null)
      },
    },
    // The wire layer must be a NAMESPACED <svg>, not `h('svg')`: React only creates SVG-
    // namespace children when the parent itself is one. As an HTML element, the lines inside
    // rendered as unknown HTML children — which draw nothing — and no test noticed, because a
    // tree walk cannot tell a painted line from an unpainted one.
    h('svg', {
      className: 'st-mosaic-wires',
      // Explicit, so a stylesheet that fails to load still gives the layer a box to draw in.
      xmlns: 'http://www.w3.org/2000/svg',
    },
      live.map((edge) => {
        const from = byId.get(edge.from)
        const to = byId.get(edge.to)
        // normalizeMosaic already drops edges whose endpoints are gone; the guard keeps a
        // hand-edited book from crashing the page instead.
        if (from === undefined || to === undefined) return null
        const a = pinPos(from)
        const b = pinPos(to)
        // The thread runs from pin to pin. The cards paint over it, so the pin remains the visible
        // anchor even when a card is dragged around another.
        const start = a
        const end = b
        const pickedEdge = picked?.kind === 'edge' && picked.edge.id === edge.id
        const label = edge.truth.kind || t('mosaic.untitled')
        const dx = end.x - start.x
        const dy = end.y - start.y
        const length = Math.hypot(dx, dy)
        const normal = length === 0 ? { x: 0, y: -1 } : { x: -dy / length, y: dx / length }
        const labelX = (start.x + end.x) / 2 + normal.x * 12
        const labelY = (start.y + end.y) / 2 + normal.y * 12
        // A small arrowhead at the middle makes the source and target readable even before the
        // label is read. It is a separate polygon, not marker-end: the cards paint over the
        // SVG layer, and an endpoint arrow would sit under the target card.
        const arrowAt = 0.56
        const arrowX = start.x + dx * arrowAt
        const arrowY = start.y + dy * arrowAt
        const unit = length === 0 ? { x: 1, y: 0 } : { x: dx / length, y: dy / length }
        const side = { x: -unit.y, y: unit.x }
        const arrowPoints = length === 0 ? '' : [
          `${arrowX + unit.x * 8},${arrowY + unit.y * 8}`,
          `${arrowX - unit.x * 3 + side.x * 4},${arrowY - unit.y * 3 + side.y * 4}`,
          `${arrowX - unit.x * 3 - side.x * 4},${arrowY - unit.y * 3 - side.y * 4}`,
        ].join(' ')
        // Two lines per edge, SIBLINGS never parent and child: a wide invisible one that takes
        // the pointer, and the hairline that is seen. A <line> takes no children — the visible
        // line was once nested inside the hit line and simply never rendered.
        return h('g', { key: edge.id },
          h('title', null, edgeTitle(edge, from, to, t)),
          h('line', {
            className: 'st-mosaic-edge-hit', 'data-entity': `${edge.id}-hit`,
            x1: start.x, y1: start.y, x2: end.x, y2: end.y,
            // The transparent hit stroke is the element the pointer actually lands on. The
            // visible line keeps its handler too, for a browser that hit-tests the painted line.
            onClick: (e) => { e.stopPropagation?.(); onPick({ kind: 'edge', edge }) },
          }),
          h('line', {
            className: 'st-mosaic-edge' + (pickedEdge ? ' st-mosaic-edge-picked' : ''),
            x1: start.x, y1: start.y, x2: end.x, y2: end.y,
            // The visible line carries the click too: it is the element a reader means when
            // they point at a wire.
            onClick: (e) => { e.stopPropagation?.(); onPick({ kind: 'edge', edge }) },
          }),
          h('polygon', {
            className: 'st-mosaic-edge-arrow' + (pickedEdge ? ' st-mosaic-edge-arrow-picked' : ''),
            points: arrowPoints, 'aria-hidden': true,
          }),
          h('text', {
            className: 'st-mosaic-edge-label', x: labelX, y: labelY,
            textAnchor: 'middle', dominantBaseline: 'middle', 'aria-hidden': true,
          }, label))
      })),
    cards.map(({ entity, style, picture }) => h('div', {
      key: entity.id,
      // `st-mosaic-card-plain`: no portrait yet. The caption's seam and the monogram read
      // differently on a card with no photograph, and the stylesheet needs to know which card
      // it is dressing.
      className: 'st-mosaic-card st-mosaic-card-pinned' + (picture === null || picture === undefined ? ' st-mosaic-card-plain' : ''),
      'data-entity': entity.id,
      style,
      onPointerDown: (e) => {
        e.stopPropagation?.()
        // Hold the pointer: a fast drag that outruns a re-render can leave the element it
        // started on, and without capture the pointerup never reaches this card.
        e.currentTarget?.setPointerCapture?.(e.pointerId)
        setDrag({ id: entity.id, startX: e.clientX, startY: e.clientY, dx: 0, dy: 0, moved: false })
      },
      onPointerMove: (e) => {
        setDrag((prev) => {
          if (prev === null || prev.id !== entity.id) return prev
          return { ...prev, dx: e.clientX - prev.startX, dy: e.clientY - prev.startY, moved: true }
        })
      },
      onPointerUp: (e) => {
        e.stopPropagation?.()
        if (drag === null || drag.id !== entity.id) return
        setDrag(null)
        // A click (no movement) picks the card; a drag (movement) moves it. The layout write
        // happens exactly here, once per gesture, landing where the card is DRAWN.
        if (drag.moved !== true) { onPick({ kind: 'entity', entity }); return }
        const base = pos(entity)
        onMove(entity.id, { x: Math.max(0, base.x + drag.dx), y: Math.max(0, base.y + drag.dy) })
      },
      // A cancelled gesture delivers no pointerup, so it unwinds itself — display-only reset.
      onPointerCancel: () => {
        setDrag(null)
      },
    },
      h('span', { className: 'st-mosaic-card-pin', 'aria-hidden': true }),
      h('div', { className: 'st-mosaic-card-photo' },
        picture !== null && picture !== undefined
          ? h('img', { src: picture, alt: entity.name, draggable: false })
          : h('span', { className: 'st-mosaic-card-initial' },
              String(entity.name ?? '').trim().slice(0, 1))),
      h('div', { className: 'st-mosaic-card-caption' },
        h('span', { className: 'st-mosaic-card-name' }, entity.name),
        entity.kind === 'character'
          ? h('span', { className: 'st-mosaic-card-sub' }, entity.role || t('mosaic.untitled'))
          : h('span', { className: 'st-mosaic-card-sub' }, entity.summary || kindLabel(entity.kind, t)),
        cardIntro(entity) === '' ? null : h('span', { className: 'st-mosaic-card-intro' }, cardIntro(entity))))),
    // Two components, chosen by kind, so the popover's hook count is fixed per instance: one
    // component that early-returned around its useState would change hook count as the pick
    // moved from an edge to a card. Keying the entity variant by id also drops a half-typed
    // draft when the writer moves to another card.
    picked?.kind === 'edge' ? h(MosaicEdgeDetail, { t, picked, byId, onClose: () => onPick(null) })
      : picked ? h(MosaicEntityDetail, {
          t, picked, byId, key: picked.entity.id,
          onPatchEntity: (entityId, fields) => patchEntityOnBoard(book, updateBook, entityId, fields),
          onClose: () => onPick(null),
          // The portrait trio rides down rather than living here: the picture is written onto
          // the card through the ordinary patch — one write path for the whole board.
          onPortrait: typeof onPortrait === 'function' ? onPortrait : undefined,
          portraitOf,
          portraitBusy: portraitBusyId !== null && portraitBusyId !== undefined
            && picked.entity !== undefined && portraitBusyId === picked.entity.id,
          portraitError,
        }) : null),
    // The two selectors sit UNDER the board in reading order; the view opens on 角色, so the
    // common case needs no pick. Every entry can be the centre — an item included, since its
    // neighbours are characters.
    h('div', { className: 'st-mosaic-focus' },
      h(MosaicPick, {
        label: t('mosaic.focusOn'), testId: 'mosaic-focus-pick',
        value: focusId ?? '',
        options: [{ value: '', label: t('mosaic.focusNone') }].concat(
          allEntities.map((e) => ({
            value: e.id,
            // The kind is what tells two same-named entries apart in this list.
            label: `${e.name}${e.kind === 'character' ? '' : ` · ${kindLabel(e.kind, t)}`}`,
          })),
        ),
        onPick: (value) => setFocusId(value === '' ? null : value),
      }),
      h(MosaicPick, {
        label: t('mosaic.view'), testId: 'mosaic-view-pick',
        value: viewKind,
        options: [
          { value: 'all', label: t('mosaic.viewAll') },
          { value: 'character', label: t('mosaic.viewCharacter') },
          { value: 'card', label: t('mosaic.viewCard') },
        ],
        onPick: setViewKind,
      }),
      focusId === null ? null : h('button', {
        type: 'button', className: 'fang-btn fang-btn-ghost', 'data-testid': 'mosaic-focus-clear',
        onClick: () => setFocusId(null),
      }, t('mosaic.focusClear'))),
    )
}
