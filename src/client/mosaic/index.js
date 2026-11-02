/**
 * The board: the card that drops over the page, its bookmarks, and the page a card opens.
 *
 * The board is opened from the title row and covers the panel while it is up. This file is the
 * shell and the routing — which bookmark is on screen, and the slide-over that shows one entity
 * in full. The content of each bookmark lives in tabs.js, the graph in relations.js, and the
 * cards in cards.js.
 */
import { React, h } from '../shared/react.js'
import { DetailPortrait } from './relations.js'
import { MosaicCards, MosaicCast } from './cards.js'
import { MosaicNewCard, MosaicReviewPage } from './review.js'
import {
  MOSAIC_TABS, MosaicPage, ProposalsPage, VersionsPage, OverviewPage, WritingStylesPage,
} from './tabs.js'
import { emptyBoard } from '../../../domain/board.js'
import { useBoardActions } from './board-state.js'
import { rowId } from '../shared/logic.js'
import { ConfirmDialog } from 'fang-style'
import { kindLabel, kindFields, fieldLabel, fieldValue, isReferenceField } from './labels.js'

/** How long the detail page's exit animation runs. It must match the duration the stylesheet
    names for [data-closing="true"], and it is shared with the timer that unmounts the page so
    the two cannot disagree. */
const PAGE_EXIT_MS = 160

export function MosaicSheet({ t, book, updateBook, onSummary, onClose, mosaicProposal, onProposal, api, bookFolder, chapter, onFlush, onAdoptWritten,
  // The merged reference pages: same props the drawers passed, so each page keeps its behaviour.
  onNotice, tab: initialTab, onTab, closing: overlayClosing = false }) {
  const [tab, setTab] = React.useState(initialTab ?? 'relations')
  // The writer's place in the board is remembered: switching windows or restarting lands on
  // the page they were reading. Write-through on every change.
  React.useEffect(() => { if (typeof onTab === 'function') onTab(tab) }, [tab])
  const mosaic = book?.mosaic ?? emptyBoard()
  // Every write and the effects that accompany it live in one hook. The pages below draw what
  // it returns; the apply sequence is not written twice any more.
  const actions = useBoardActions({
    api, bookFolder, book, updateBook,
    adoptWritten: onAdoptWritten, flushSave: onFlush, onNotice, t,
  })
  const {
    portraitOf, pictureOf, portraitBusyId, portraitError, generatePortrait,
    patchCard, removeCard, applyChanges, createCard,
  } = actions
  const [picked, setPicked] = React.useState(null)
  // The entry whose detail page is open, by id rather than by value: an edit made from the
  // page must be read back from the board, or the drawer would show the copy it opened with.
  const [inspecting, setInspecting] = React.useState(null)


  // Closing is a state, not an assignment to null: an element removed from the tree has no
  // exit, so `closing` marks the page as on its way out, the animation runs, and a timer
  // unmounts it afterwards — the same timing the stylesheet declares.
  const [pageClosing, setPageClosing] = React.useState(false)
  const closePage = () => {
    if (inspecting === null || pageClosing) return
    setPageClosing(true)
    globalThis.setTimeout(() => { setInspecting(null); setPageClosing(false) }, PAGE_EXIT_MS)
  }
  // Opening another entry while one is closing must not leave the old timer able to unmount
  // the new page.
  const inspect = (entity) => { setPageClosing(false); setInspecting(entity) }

  // Deleting a card from its ⋯ menu. The entity goes, and every edge that pointed at it goes
  // with it — a wire with one endpoint gone is a line to nothing, and normalizeMosaic would
  // drop it on the next read anyway. It asks first: a wrong click on a 2px dot must not be
  // able to take a character with it.
  const [dooming, setDooming] = React.useState(null)
  // The board write is the hook's; what is left here is the page that was describing the card
  // that no longer exists.
  const confirmRemoveCard = (entity) => {
    removeCard(entity.id)
    if (inspecting?.id === entity.id) setInspecting(null)
    if (picked?.kind === 'entity' && picked.entity.id === entity.id) setPicked(null)
    setDooming(null)
  }
  // Per-change review state, keyed by index so a rerender cannot desync a card from its
  // verdict. It lives here rather than in the review header because the bookmark badge counts
  // what still owes a verdict, and the badge renders on the sheet.
  const [decisions, setDecisions] = React.useState({})
  const decide = (indexOrReset, verdict) => {
    if (indexOrReset === 'reset') { setDecisions({}); return }
    setDecisions((prev) => ({ ...prev, [indexOrReset]: verdict }))
  }
  React.useEffect(() => {
    // `document` is absent under the Node render harness, like every other global effect here.
    if (typeof document === 'undefined' || typeof document.addEventListener !== 'function') return undefined
    const onKey = (event) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
  // The badge counts what still owes a verdict: undecided only, so rejecting one shrinks it.
  const pendingCount = mosaicProposal !== null && mosaicProposal !== undefined
    ? (Array.isArray(mosaicProposal.changes)
      ? mosaicProposal.changes.filter((_, i) => decisions[i] === undefined || decisions[i] === 'undecided').length
      : 0)
    : 0
  // The layer is the click-away target: pressing outside the sheet puts the board away, the
  // same gesture every other main-surface panel uses. It is a real layer now, not a pass-through,
  // so a click on the page behind closes the board instead of typing into the manuscript.
  return h('div', {
    className: `st-mosaic-backdrop${overlayClosing ? ' st-closing' : ''}`,
    onMouseDown: (e) => { if (e.target === e.currentTarget) onClose() },
  },
    h('section', { className: 'st-mosaic-sheet', role: 'dialog', 'aria-label': t('mosaic.title') },
      h('div', {
        className: 'st-mosaic-body',
        // A click on EMPTY SPACE puts the detail page away — the same gesture that dismisses
        // the popover on the canvas. A click on a tab, a button or a card stays theirs.
        onClick: (e) => {
          if (inspecting === null) return
          const target = e.target
          if (target !== e.currentTarget && !(typeof target?.classList?.contains === 'function'
            && (target.classList.contains('st-mosaic-canvas') || target.classList.contains('st-mosaic-body')))) return
          closePage()
        },
      },
        tab === 'relations' ? h(MosaicReviewPage, {
          t, api, bookFolder, book, chapter, mosaicProposal, onProposal,
          updateBook, decisions, onDecide: decide, onApplyChanges: applyChanges, onCreate: createCard, onPatchEntity: patchCard,
          picked, onPick: setPicked, onInspect: inspect,
          mosaic,
          // The graph's popover generates portraits from the SAME state as the gallery's page:
          // one generation at a time, one cache of read pictures.
          onPortrait: generatePortrait, portraitOf,
          portraitBusyId, portraitError,
          onNotice,
        }) : null,

        tab === 'world' ? h(MosaicPage, {
          t, title: t('mosaic.tab.world'),
          // 世界观 entries are places, factions and events; 地点 is the kind a writer reaches
          // for first, and the picker lets them choose any of the five before naming it.
          actions: h(MosaicNewCard, { t, onCreate: createCard, onCreated: inspect, defaultKind: 'place' }),
          content: h(MosaicCards, {
            t, mosaic,
            onInspect: inspect, onEdit: inspect, onDelete: setDooming, pictureOf,
          }),
        }) : null,
        tab === 'cast' ? h(MosaicPage, {
          t, title: t('mosaic.tab.cast'),
          actions: h(MosaicNewCard, { t, onCreate: createCard, onCreated: inspect, defaultKind: 'character' }),
          // The gallery is the page: a card opens its own detail page (inspect), which is
          // where a field is edited. An editing form under the gallery showed every character
          // twice over.
          content: h(MosaicCast, {
            t, mosaic,
            onInspect: inspect, onEdit: inspect, onDelete: setDooming, pictureOf,
          }),
        }) : null,
        tab === 'items' ? h(MosaicPage, {
          t, title: t('mosaic.tab.items'),
          actions: h(MosaicNewCard, { t, onCreate: createCard, onCreated: inspect, defaultKind: 'item' }),
          content: h(MosaicCards, {
            t, mosaic, itemsOnly: true,
            onInspect: inspect, onEdit: inspect, onDelete: setDooming, pictureOf,
          }),
        }) : null,
        tab === 'proposals' ? h(MosaicPage, {
          t, title: t('mosaic.tab.proposals'),
          actions: null,
          content: h(ProposalsPage, {
            t, api, book, bookFolder,
            onApply: applyChanges,
            onNotice,
            // No reload: the board already repainted from the apply's own answer.
          }),
        }) : null,
        tab === 'overview' ? h(OverviewPage, {
          t, book, bookFolder, api, onNotice, onAdoptWritten, onSummary,
        }) : null,
        tab === 'writingStyle' ? h(WritingStylesPage, { t, api, bookFolder, book, onNotice }) : null,
        tab === 'versions' ? h(VersionsPage, { t, book, bookFolder, api, onAdoptWritten }) : null),
      // The delete confirmation imports the shared dialog rather than a bespoke one: the shelf
      // asks the same question in the same shape, and one dialog is why the two ask it
      // identically.
      dooming === null ? null : h(ConfirmDialog, {
        title: t('mosaic.deleteCardTitle', { name: dooming.name }),
        confirmLabel: t('action.delete'),
        cancelLabel: t('action.cancel'),
        onConfirm: () => confirmRemoveCard(dooming),
        onCancel: () => setDooming(null),
      }),
      // The detail page slides in from the left INSIDE the sheet: the board stays where the
      // writer left it, and closing this returns to it. It reads the entity from the board by
      // id, so an edit made from here shows up here and on the card underneath.
      inspecting === null ? null : h(MosaicEntityPage, {
        t,
        entity: (mosaic?.entities ?? []).find((e) => e.id === inspecting.id) ?? inspecting,
        mosaic,
        closing: pageClosing,
        onClose: closePage,
        onPatchEntity: patchCard,
        onPortrait: generatePortrait,
        portraitOf,
        portraitBusy: portraitBusyId !== null && portraitBusyId === inspecting?.id,
        portraitError,
      }),
      h('nav', { className: 'st-mosaic-tabs' },
        MOSAIC_TABS.map(([key, label]) => h('button', {
          key, type: 'button', className: 'st-mosaic-tab', 'data-active': tab === key,
          onClick: () => setTab(key),
        }, t(label),
        // The review it owes is counted on the relations bookmark: a writer who closed the
        // sheet mid-review sees the number still outstanding without opening anything.
        key === 'relations' && pendingCount > 0 ? h('span', { className: 'st-mosaic-tab-badge' }, String(pendingCount)) : null)))))
}

/**
 * The detail page for one board entry, as a drawer from the left inside the sheet.
 *
 * The card in the gallery shows a fragment because it has a fixed size; this is where the
 * whole entry is read — every field the board stores, the relations it takes part in, and the
 * one control the card cannot offer, EDIT. It is a drawer rather than a route: closing it
 * returns to the same board at the same scroll.
 */
function MosaicEntityPage({ t, entity, mosaic, onClose, closing, onPatchEntity, onPortrait, portraitOf, portraitBusy }) {
  // Editing is a MODE the page can enter, not a separate screen: the same page turns its
  // values into fields.
  const [editing, setEditing] = React.useState(false)
  const patch = (fields) => { if (typeof onPatchEntity === 'function') onPatchEntity(entity.id, fields) }
  const picture = typeof portraitOf === 'function' ? portraitOf(entity) : null
  const busy = portraitBusy === true
  // The two drafts: one word each, typed and confirmed with Enter. They live HERE rather than
  // in the detail popover — sharing one would carry half-typed text from a card to a page.
  const [statusDraft, setStatusDraft] = React.useState('')
  const [tagDraft, setTagDraft] = React.useState('')
  // A custom row is a label and a value typed on one line: the smallest unit of "something
  // this schema does not know about", without a form around the escape hatch.
  const [customLabel, setCustomLabel] = React.useState('')
  const [customValue, setCustomValue] = React.useState('')
  React.useEffect(() => {
    setStatusDraft(''); setTagDraft(''); setCustomLabel(''); setCustomValue('')
  }, [entity.id])
  const addStatus = () => {
    const label = statusDraft.trim()
    if (label === '') return
    setStatusDraft('')
    if ((entity.statuses ?? []).some((each) => each.label === label)) return
    patch({ statuses: [...(entity.statuses ?? []), { id: rowId('s'), label }] })
  }
  const addTag = () => {
    const tag = tagDraft.trim()
    if (tag === '') return
    setTagDraft('')
    if ((entity.tags ?? []).includes(tag)) return
    patch({ tags: [...(entity.tags ?? []), tag] })
  }
  /** Add a custom row, or overwrite the value of one that already carries the same label. */
  const addCustom = () => {
    const label = customLabel.trim()
    if (label === '') return
    setCustomLabel(''); setCustomValue('')
    const rows = entity.custom ?? []
    const held = rows.find((row) => row.label === label)
    patch({
      custom: held === undefined
        ? [...rows, { id: rowId('c'), label, value: customValue.trim() }]
        : rows.map((row) => (row.label === label ? { ...row, value: customValue.trim() } : row)),
    })
  }
  const removeCustom = (label) => patch({ custom: (entity.custom ?? []).filter((row) => row.label !== label) })
  const entities = Array.isArray(mosaic.entities) ? mosaic.entities : []
  const byId = new Map(entities.map((e) => [e.id, e]))
  // Both directions, because a relation is a fact about the pair and the writer reads it from
  // whichever side they opened. Retired edges are history: listed apart, not mixed in.
  const edges = Array.isArray(mosaic.edges) ? mosaic.edges : []
  const outgoing = edges.filter((e) => e.from === entity.id && e.retired !== true)
  const incoming = edges.filter((e) => e.to === entity.id && e.retired !== true)
  const retired = edges.filter((e) => (e.from === entity.id || e.to === entity.id) && e.retired === true)
  const nameOf = (id) => byId.get(id)?.name ?? t('mosaic.untitled')
  /**
   * One labelled fact. Read mode shows the value; edit mode shows a field. The field is drawn
   * even when it is empty: a blank row is how the writer sees that a fact has not been recorded
   * yet, and it is also where they fill it in. Hiding empty rows made a character's page silently
   * lose gender and age simply because nobody had typed them.
   */
  const row = (label, value, field) => {
    const text = String(value ?? '')
    if (field === undefined) {
      return h('div', { className: 'st-mosaic-page-row' },
        h('span', { className: 'st-mosaic-page-label' }, label),
        h('span', { className: 'st-mosaic-page-value' }, text))
    }
    return h('div', { className: 'st-mosaic-page-row' },
      h('span', { className: 'st-mosaic-page-label' }, label),
      editing
        ? h('textarea', {
            className: 'st-mosaic-field st-mosaic-field-area',
            'data-testid': field.testId, value: text,
            placeholder: label, rows: 3,
            onChange: (e) => patch({ [field.key]: e.target.value }),
          })
        : h('span', { className: 'st-mosaic-page-value' }, text))
  }
  const textRow = (label, value, field) => {
    const text = String(value ?? '')
    return h('div', { className: 'st-mosaic-page-row' },
      h('span', { className: 'st-mosaic-page-label' }, label),
      editing
        ? h('input', {
            type: 'text', className: 'st-mosaic-field',
            'data-testid': field.testId, value: text,
            placeholder: label,
            onChange: (e) => patch({ [field.key]: e.target.value }),
          })
        : h('span', { className: 'st-mosaic-page-value' }, text))
  }
  // Fields that hold a sentence or more get the multiline control; the short facts stay on one
  // line. The set is by field, not by kind, so the same name always opens the same control.
  const LONG_FIELDS = new Set(['appearance', 'personality', 'motivation', 'arc', 'atmosphere', 'purpose', 'significance', 'consequence'])
  const renderField = (field) => {
    const label = fieldLabel(field, t)
    const value = fieldValue(entity, field, nameOf)
    if (isReferenceField(field)) return row(label, value)
    return LONG_FIELDS.has(field)
      ? row(label, value, { key: field, testId: `mosaic-page-${field}` })
      : textRow(label, value, { key: field, testId: `mosaic-page-${field}` })
  }
  const allFields = kindFields(entity.kind)
  // The short facts (gender, age, nationality, a place's location, an item's holder) belong in the
  // identity band beside the portrait: they are one line each, and stacking them down a full-width
  // body left a tall empty column beside the picture. Only prose-length fields go below.
  const briefRows = allFields.filter((field) => !LONG_FIELDS.has(field)).map(renderField)
  const longRows = allFields.filter((field) => LONG_FIELDS.has(field)).map(renderField)
  // One chip band: the same shape for statuses, tags and custom rows — chips that can be taken
  // off by a click while editing, with a field beside them to add one. Read mode shows them
  // inert. Statuses are {id,label} rows, tags plain strings; the caller shapes the chips.
  const chipBand = (labelText, chips, addField) => h('div', { className: 'st-mosaic-page-row' },
    h('span', { className: 'st-mosaic-page-label' }, labelText),
    h('div', { className: 'st-mosaic-chip-row' },
      chips.map((chip) => h('span', {
        key: chip.key,
        className: `st-mosaic-chip${editing ? ' st-mosaic-chip-toggle' : ''}`,
        'data-testid': editing ? addField.chipTestid : undefined,
        title: editing ? addField.removeTitle : undefined,
        onClick: editing ? chip.remove : undefined,
      }, chip.label)),
      editing ? h('input', {
        type: 'text', className: 'st-mosaic-status-add', 'data-testid': addField.addTestid,
        value: addField.draft, placeholder: addField.placeholder,
        onChange: (e) => addField.setDraft(e.target.value),
        onKeyDown: (e) => { if (e.key === 'Enter') { e.preventDefault(); addField.add() } },
      }) : null))
  const edgeRow = (edge, otherId, arrow) => h('div', { key: edge.id, className: 'st-mosaic-page-edge' },
    h('span', { className: 'st-mosaic-page-edge-other' }, nameOf(otherId)),
    h('span', { className: 'st-mosaic-page-edge-kind' }, `${arrow}${edge.truth.kind || t('mosaic.untitled')}`),
    edge.truth.note !== '' ? h('span', { className: 'st-mosaic-page-edge-note' }, edge.truth.note) : null)
  return h('aside', {
    className: 'st-mosaic-page', role: 'dialog', 'aria-label': entity.name,
    'data-testid': 'mosaic-entity-page',
    // The exit animation is chosen by this attribute: one element, two directions.
    'data-closing': closing ? 'true' : 'false',
  },
    h('div', { className: 'st-mosaic-page-head' },
      editing
        ? h('input', {
            type: 'text', className: 'st-mosaic-field st-mosaic-field-title',
            'data-testid': 'mosaic-page-name', value: entity.name ?? '',
            'aria-label': t('mosaic.name'),
            onChange: (e) => patch({ name: e.target.value }),
          })
        : h('h3', { className: 'st-mosaic-page-title' }, entity.name),
      h('span', { className: 'fang-spacer' }),
      h('button', {
        type: 'button', className: 'fang-btn fang-btn-ghost', 'data-testid': 'mosaic-entity-edit',
        'data-editing': editing ? 'true' : 'false',
        title: editing ? t('action.done') : t('mosaic.editEntry'),
        onClick: () => setEditing((was) => !was),
      }, editing ? t('action.done') : t('mosaic.editEntry')),
      h('button', {
        type: 'button', className: 'fang-btn fang-btn-ghost', title: t('action.close'),
        'aria-label': t('action.close'), onClick: onClose,
      }, '✕')),
    h('div', { className: 'st-mosaic-page-scroll' },
      // The summary band: picture on the left, the facts that identify this entry on the right.
      // No name here — the title row already names the entry, and a second copy two lines below
      // was the same words set twice.
      h('div', { className: 'st-mosaic-page-summary' },
        h('div', { className: 'st-mosaic-page-image' },
          h(DetailPortrait, { t, entity, picture, busy, onPortrait, editable: editing })),
        h('div', { className: 'st-mosaic-page-facts' },
          // The category and every short, one-line fact sit beside the picture. They are identity,
          // not prose, and a grid of them is what makes a person's page readable at a glance.
          row(t('mosaic.field.kind'), kindLabel(entity.kind, t)),
          ...briefRows)),
      // The long-form half: every remaining field as its own labelled section, separated by a
      // hairline. Keeping the chips and the prose out of the identity band is what stops the top
      // of the page from turning into a wall of mixed controls.
      h('div', { className: 'st-mosaic-page-body' },
        // The one-line summary leads the page body; it is the sentence the rest of the fields
        // support. It is editable in place, and an empty one leaves a blank row to fill.
        row(t('mosaic.newSummary'), entity.summary, { key: 'summary', testId: 'mosaic-page-summary' }),
        // The prose-length fields run down the page: a character's appearance, personality,
        // motivation and arc; a place's atmosphere; an item's significance, and so on. Each row is
        // present even when its value is blank.
        ...longRows,
        // The long prose is the part you read, not scan.
        row(t('mosaic.newDescription'), entity.description, { key: 'description', testId: 'mosaic-page-description' }),
        // Statuses and tags are standard fields too, so their rows stay put when empty. The add
        // input appears in edit mode; in read mode the blank row says "none recorded yet".
        chipBand(t('mosaic.statuses'),
          (entity.statuses ?? []).map((st) => ({
            key: st.id, label: st.label,
            remove: () => patch({ statuses: (entity.statuses ?? []).filter((each) => each.label !== st.label) }),
          })),
          { chipTestid: 'mosaic-page-status-chip', addTestid: 'mosaic-page-status-add',
            removeTitle: t('mosaic.removeHint'), draft: statusDraft, setDraft: setStatusDraft,
            placeholder: t('mosaic.statusAddPlaceholder'), add: addStatus }),
        chipBand(t('mosaic.field.tags'),
          (entity.tags ?? []).map((tag) => ({
            key: tag, label: tag,
            remove: () => patch({ tags: (entity.tags ?? []).filter((each) => each !== tag) }),
          })),
          { chipTestid: 'mosaic-page-tag-chip', addTestid: 'mosaic-page-tag-add',
            removeTitle: t('mosaic.removeHint'), draft: tagDraft, setDraft: setTagDraft,
            placeholder: t('mosaic.tagAddPlaceholder'), add: addTag }),
        // Custom fields: whatever the five kinds' presets do not cover — "血型: O" without
        // the schema knowing about it. Like the other fields the row is always there; an empty
        // one is where the writer adds the first pair.
        h('div', { className: 'st-mosaic-page-row' },
          h('span', { className: 'st-mosaic-page-label' }, t('mosaic.custom')),
          h('div', { className: 'st-mosaic-chip-row' },
            (entity.custom ?? []).map((customRow) => h('span', {
              key: customRow.id,
              className: `st-mosaic-chip${editing ? ' st-mosaic-chip-toggle' : ''}`,
              'data-testid': editing ? 'mosaic-page-custom-chip' : undefined,
              title: editing ? t('mosaic.removeHint') : undefined,
              onClick: editing ? () => removeCustom(customRow.label) : undefined,
            }, `${customRow.label}：${customRow.value}`)),
            editing ? h(React.Fragment, null,
              h('input', {
                type: 'text', className: 'st-mosaic-status-add', 'data-testid': 'mosaic-page-custom-label',
                value: customLabel, placeholder: t('mosaic.customLabelPlaceholder'),
                onChange: (e) => setCustomLabel(e.target.value),
              }),
              h('input', {
                type: 'text', className: 'st-mosaic-status-add', 'data-testid': 'mosaic-page-custom-value',
                value: customValue, placeholder: t('mosaic.customValuePlaceholder'),
                onChange: (e) => setCustomValue(e.target.value),
                onKeyDown: (e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } },
              })) : null)),
        // Relations come last: they are facts about this entry and the rest of the board, and
        // they belong below the entry's own description.
        outgoing.length === 0 && incoming.length === 0
          ? h('div', { className: 'st-mosaic-page-row' },
              h('span', { className: 'st-mosaic-page-label' }, t('mosaic.field.relations')),
              h('span', { className: 'st-mosaic-page-value' }, t('label.noRelationships')))
          : h('div', { className: 'st-mosaic-page-row' },
              h('span', { className: 'st-mosaic-page-label' }, t('mosaic.field.relations')),
              h('div', { className: 'st-mosaic-page-edges' },
                outgoing.map((edge) => edgeRow(edge, edge.to, '→ ')),
                incoming.map((edge) => edgeRow(edge, edge.from, '← ')))),
        retired.length === 0 ? null : h('div', { className: 'st-mosaic-page-row' },
          h('span', { className: 'st-mosaic-page-label' }, t('mosaic.field.retired')),
          h('div', { className: 'st-mosaic-page-edges' },
            retired.map((edge) => edgeRow(edge, edge.from === entity.id ? edge.to : edge.from, '· ')))))))
}
