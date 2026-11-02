/**
 * The context window: scenes on the left, the selected scene on the right.
 *
 * The layout is the panel's own: a Dialog holding the shared SplitPane, the scene column on the
 * left, and the detail pane on the right. Inside the detail: the composition bar, the official
 * text, the writer's copy and its controls. The writer's copies for this scene follow as small
 * cards in the same reading column — no separate area, no extra container.
 */
import { React, h } from '../shared/react.js'
import { Dialog, List, ListRow, SplitPane } from 'fang-style'

const SYSTEM = '@system'

/** One stable colour per part name, so a part keeps its colour when another scene is opened. */
function toneOf(key) {
  let sum = 0
  for (const ch of key) sum = (sum + ch.charCodeAt(0)) % 7
  return sum + 1
}

function Segment({ label, tone, active, onPick }) {
  return h('button', {
    type: 'button',
    className: 'st-ctx-seg',
    'data-tone': tone,
    'data-active': active === true ? 'true' : undefined,
    title: label,
    onClick: onPick,
  }, h('span', { className: 'st-ctx-seg-label' }, label))
}

export function ContextPage({ t, api, bookFolder, bookId, chapterId, onClose, onNotice }) {
  const [data, setData] = React.useState(null)
  const [error, setError] = React.useState('')
  const [sceneId, setSceneId] = React.useState('chat')
  const [partKey, setPartKey] = React.useState(SYSTEM)
  const [draft, setDraft] = React.useState(null)
  const [busy, setBusy] = React.useState(false)

  const load = React.useCallback(() => {
    let live = true
    setError('')
    api.context(bookFolder, bookId, chapterId).then(
      (value) => { if (live) setData(value) },
      (failure) => { if (live) setError(String(failure?.message ?? failure)) })
    return () => { live = false }
  }, [api, bookFolder, bookId, chapterId])

  React.useEffect(() => load(), [load])

  const scenes = data?.scenes ?? []
  const scene = scenes.find((row) => row.id === sceneId) ?? scenes[0]
  const partOf = () => (partKey === SYSTEM ? null : scene?.parts.find((row) => row.key === partKey))
  const partLabel = (key) => (key === SYSTEM ? t('context.systemPrompt') : t(`context.part.${key}`))

  const save = async () => {
    if (busy || scene === undefined) return
    setBusy(true)
    try {
      if (partKey === SYSTEM) await api.savePrompt(scene.promptKey, draft ?? '')
      else await api.saveContext(bookId, scene.id, partKey, draft ?? '')
      setDraft(null)
      setData(await api.context(bookFolder, bookId, chapterId))
    } catch (failure) {
      if (typeof onNotice === 'function') onNotice(String(failure?.message ?? failure), 'error')
    } finally { setBusy(false) }
  }

  const revert = async () => {
    if (busy || scene === undefined) return
    setBusy(true)
    try {
      if (partKey === SYSTEM) await api.resetPrompt(scene.promptKey)
      else await api.resetContext(bookId, scene.id, partKey)
      setDraft(null)
      setData(await api.context(bookFolder, bookId, chapterId))
    } catch (failure) {
      if (typeof onNotice === 'function') onNotice(String(failure?.message ?? failure), 'error')
    } finally { setBusy(false) }
  }

  const pick = (key) => { setPartKey(key); setDraft(null) }

  const sceneRows = []
  for (const row of scenes) {
    const replaced = (row.system !== null && row.system.override !== '' ? 1 : 0)
      + row.parts.filter((part) => part.override !== '').length
    sceneRows.push(h(ListRow, {
      key: row.id,
      active: row.id === scene?.id,
      onActivate: () => {
        setSceneId(row.id)
        pick(row.system === null ? (row.parts[0]?.key ?? '') : SYSTEM)
      },
    },
      h('span', { className: 'st-list-row-title' }, t(`context.scene.${row.id}`)),
      replaced === 0 ? null : h('span', { className: 'fang-list-row-meta' }, t('context.replaced'))))
  }

  const detail = () => {
    if (error !== '') return [h('div', { key: 'error', className: 'fang-split-detail-body' }, h('p', { className: 'fang-muted' }, error))]
    if (data === null) return [h('div', { key: 'loading', className: 'fang-split-detail-body' }, h('p', { className: 'fang-muted' }, t('label.loading')))]
    if (scene === undefined) return [h('div', { key: 'empty', className: 'fang-split-detail-body' }, h('p', { className: 'fang-muted' }, t('context.empty')))]

    const part = partOf()
    const official = partKey === SYSTEM ? (scene.system?.text ?? '') : (part?.official ?? '')
    const override = partKey === SYSTEM ? (scene.system?.override ?? '') : (part?.override ?? '')
    const replaceable = partKey === SYSTEM ? scene.promptKey !== '' : part?.replaceable === true
    const editing = draft !== null

    const segments = []
    if (scene.system !== null) segments.push({ key: SYSTEM, label: t('context.systemPrompt') })
    for (const row of scene.parts) segments.push({ key: row.key, label: t(`context.part.${row.key}`) })

    const bar = h('div', { key: 'bar', className: 'st-ctx-bar' }, ...segments.map((seg) => h(Segment, {
      key: seg.key, label: seg.label, tone: seg.key === SYSTEM ? 0 : toneOf(seg.key),
      active: seg.key === partKey, onPick: () => pick(seg.key),
    })))

    // The pane is TWO fixed zones: the official text above, the writer's own below. They never
    // share a scroll region — the boundary between them is the pane's one constant line.
    const officialZone = h('div', { key: 'official', className: 'st-ctx-official' },
      h('div', { className: 'st-dialog-label' }, t('context.officialVersion')),
      official === ''
        ? h('p', { className: 'fang-muted' }, t('context.empty'))
        : h('p', { className: 'st-overview-text' }, official))
    // The part's actions ride on the detail HEAD's trailing edge — the app's own "name on the
    // left, tools on the right" title-row pattern (st-mosaic-band-head). Buttons never float in
    // the reading column and never get a zone of their own.
    const headActions = []
    if (replaceable) {
      if (editing) {
        headActions.push(h('button', { key: 'save', type: 'button', className: 'fang-btn fang-btn-primary', disabled: busy, onClick: save }, t('action.save')))
        headActions.push(h('button', { key: 'cancel', type: 'button', className: 'fang-btn', disabled: busy, onClick: () => setDraft(null) }, t('action.cancel')))
      } else if (override !== '') {
        headActions.push(h('button', { key: 'edit', type: 'button', className: 'fang-btn', disabled: busy, onClick: () => setDraft(override) }, t('action.edit')))
        headActions.push(h('button', { key: 'revert', type: 'button', className: 'fang-btn', disabled: busy, onClick: revert }, t('context.revert')))
      } else {
        headActions.push(h('button', { key: 'replace', type: 'button', className: 'fang-btn', disabled: busy, onClick: () => setDraft(official) }, t('context.replace')))
      }
    }

    // The writer's copies for THIS scene, in their own zone: each card carries its text, the way
    // the conversation page shows an answer — head names the part, body is the copy itself.
    const copies = []
    if (scene.system !== null && scene.system.override !== '') {
      copies.push({ key: SYSTEM, label: t('context.systemPrompt'), text: scene.system.override })
    }
    for (const row of scene.parts) {
      if (row.override !== '') copies.push({ key: row.key, label: t(`context.part.${row.key}`), text: row.override })
    }
    // 我的版本 zone: a FIXED share of the pane, always present. While editing it is the editor;
    // otherwise it holds the copies list — the writer's own material, never the official text.
    const mineZone = h('div', { key: 'mine', className: 'st-ctx-mine' },
      h('div', { className: 'st-dialog-label' }, t('context.myVersion')),
      editing
        ? h('textarea', {
          className: 'st-overview-summary', spellCheck: false,
          value: draft, onChange: (event) => setDraft(event.target.value),
        })
        : copies.length === 0
          ? null
          : h(List, null, ...copies.map((row) => h(ListRow, {
            key: `copy-${row.key}`,
            active: partKey === row.key,
            onActivate: () => pick(row.key),
          },
            h('span', { className: 'st-list-row-title' }, row.label),
            h('span', { className: 'fang-list-row-meta' }, t('context.replaced')),
            h('span', { className: 'fang-list-row-meta' }, row.text)))))
    // The pane's geometry never depends on the text: head, bar and both zone boundaries are
    // fixed; each zone scrolls inside itself.
    return [
      h('div', { key: 'head', className: 'fang-split-detail-head' },
        h('h3', { className: 'fang-split-detail-title' }, partLabel(partKey)),
        h('span', { className: 'fang-split-detail-meta' },
          override !== ''
            ? t('context.replaced')
            : (replaceable ? t('context.official') : t('context.readonly'))),
        ...headActions),
      bar,
      officialZone,
      mineZone,
    ]
  }

  return h(Dialog, { title: t('tab.context'), closeLabel: t('action.close'), onClose, size: 'max', bodyClassName: 'st-ctx-dialog-body' },
    h(SplitPane, {
      listProps: { role: 'tablist', 'aria-label': t('context.scenes') },
      list: h(List, null, ...sceneRows),
      detailProps: { role: 'tabpanel' },
      detail: detail(),
    }))
}
