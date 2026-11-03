/**
 * The context window: scenes on the left, the selected scene on the right.
 *
 * The layout is the panel's own: a Dialog holding the shared SplitPane, the scene column on the
 * left, and the detail pane on the right. Inside the detail: the composition bar, the official
 * text, and the writer's versioned copies — each part keeps a saved-version history, shown as a
 * list beside the selected entry's text. Creating and editing a copy happens in its own Dialog;
 * the reading pane never hosts a floating editor.
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

export function ContextPage({ t, api, bookFolder, bookId, chapterId, onClose }) {
  const [data, setData] = React.useState(null)
  const [error, setError] = React.useState('')
  const [sceneId, setSceneId] = React.useState('chat')
  const [partKey, setPartKey] = React.useState(SYSTEM)
  const [versionId, setVersionId] = React.useState(null)
  // The copy editor lives in its own Dialog. `null` is closed; a string is the draft it holds.
  const [dialogText, setDialogText] = React.useState(null)
  // 副本相关操作的失败原因显示在弹窗与版本区内部——状态栏在弹窗背板之下，写在那里等于没写。
  const [copyError, setCopyError] = React.useState('')
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

  const pick = (key) => { setPartKey(key); setVersionId(null) }

  /** Write one text as the part's sent copy — through save (book parts) or the prompt override. */
  const applyText = async (text) => {
    if (busy || scene === undefined) return
    setBusy(true); setCopyError('')
    try {
      let res
      if (partKey === SYSTEM) res = await api.savePrompt(scene.promptKey, text)
      else res = await api.saveContext(bookId, scene.id, partKey, text)
      if (res.ok === false) { setCopyError(res.error ?? '替换失败'); return }
      setData(await api.context(bookFolder, bookId, chapterId))
    } catch (failure) {
      setCopyError(String(failure?.message ?? failure))
    } finally { setBusy(false) }
  }

  const revert = async () => {
    if (busy || scene === undefined) return
    setBusy(true); setCopyError('')
    try {
      let res
      if (partKey === SYSTEM) res = await api.resetPrompt(scene.promptKey)
      else res = await api.resetContext(bookId, scene.id, partKey)
      if (res.ok === false) { setCopyError(res.error ?? '恢复失败'); return }
      setData(await api.context(bookFolder, bookId, chapterId))
    } catch (failure) {
      setCopyError(String(failure?.message ?? failure))
    } finally { setBusy(false) }
  }

  const deleteEntry = async (id) => {
    if (busy || scene === undefined || partKey === SYSTEM) return
    setBusy(true); setCopyError('')
    try {
      const res = await api.deleteContextVersion(bookId, scene.id, partKey, id)
      if (res.ok === false) { setCopyError(res.error ?? '删除失败'); return }
      setData(await api.context(bookFolder, bookId, chapterId))
    } catch (failure) {
      setCopyError(String(failure?.message ?? failure))
    } finally { setBusy(false) }
  }

  /** The dialog's save: 新建一份副本文档——只入列表，不改变发送内容。 */
  const addCopy = async () => {
    if (busy || scene === undefined || dialogText === null || dialogText.trim() === '') return
    setBusy(true); setCopyError('')
    try {
      let res, rows
      if (partKey === SYSTEM) {
        res = await api.addPromptDoc(scene.promptKey, dialogText)
        rows = res.ok === false ? [] : (res.prompts.find((row) => row.key === scene.promptKey)?.docs ?? [])
      } else {
        res = await api.addContextVersion(bookId, scene.id, partKey, dialogText)
        rows = res.ok === false ? [] : (res.versions[scene.id]?.[partKey] ?? [])
      }
      if (res.ok === false) { setCopyError(res.error ?? '保存失败'); return }
      setDialogText(null)
      setData(await api.context(bookFolder, bookId, chapterId))
      const newest = rows[rows.length - 1]
      if (newest !== undefined) setVersionId(newest.id)
    } catch (failure) {
      setCopyError(String(failure?.message ?? failure))
    } finally { setBusy(false) }
  }

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

    const segments = []
    if (scene.system !== null) segments.push({ key: SYSTEM, label: t('context.systemPrompt') })
    for (const row of scene.parts) segments.push({ key: row.key, label: t(`context.part.${row.key}`) })

    const bar = h('div', { key: 'bar', className: 'st-ctx-bar' }, ...segments.map((seg) => h(Segment, {
      key: seg.key, label: seg.label, tone: seg.key === SYSTEM ? 0 : toneOf(seg.key),
      active: seg.key === partKey, onPick: () => pick(seg.key),
    })))

    // The pane is TWO fixed zones: the official text above, the writer's versions below. They
    // never share a scroll region — the boundary between them is the pane's one constant line.
    const officialZone = h('div', { key: 'official', className: 'st-ctx-official' },
      h('div', { className: 'st-dialog-label' }, t('context.officialVersion')),
      official === ''
        ? h('p', { className: 'fang-muted' }, t('context.empty'))
        : h('p', { className: 'st-overview-text' }, official))

    // The writer's versions of THIS part, newest first. The system prompt keeps a single copy —
    // it is model behaviour, not one book's material, so it has a history of at most one entry.
    const entries = partKey === SYSTEM
      ? (override !== '' ? [{ id: 'override', text: override, at: null }] : [])
      : [...(part?.versions ?? [])].reverse()
    const selected = entries.find((row) => row.id === versionId) ?? entries[0] ?? null

    const mineHead = h('div', { key: 'mine-head', className: 'st-ctx-mine-head' },
      h('span', { className: 'st-dialog-label' }, t('context.myVersion')),
      h('span', { className: 'fang-spacer' }),
      replaceable ? h('button', {
        type: 'button', className: 'fang-btn', disabled: busy,
        onClick: () => { setCopyError(''); setDialogText('') },
      }, t('context.newCopy')) : null,
      override !== '' ? h('button', {
        type: 'button', className: 'fang-btn', disabled: busy,
        onClick: revert,
      }, t('context.revert')) : null)

    const mineRows = entries.map((row) => h(ListRow, {
      key: row.id,
      active: selected !== null && row.id === selected.id,
      onActivate: () => setVersionId(row.id),
    },
      // 条目的第一要素是副本内容本身：首行预览。时间与「当前发送」只是附属信息。
      h('span', { className: 'st-list-row-title' },
        row.text === '' ? t('context.empty') : row.text.split('\n')[0]),
      h('span', { className: 'fang-list-row-meta' },
        row.at === null ? t('context.myVersion') : new Date(row.at).toLocaleString()),
      row.text === override ? h('span', { className: 'fang-list-row-meta' }, t('context.active')) : null))

    // The selected entry's actions: 替换 points the sent copy at this document (hidden when it
    // already is), 删除 drops the document (book parts only — the system prompt's copies are
    // kept or reverted, not deleted). Entry text is not edited in place: 新建 another one.
    const mineActions = selected === null ? [] : [
      selected.text !== override ? h('button', { key: 'active', type: 'button', className: 'fang-btn',
        disabled: busy, onClick: () => applyText(selected.text) }, t('context.setActive')) : null,
      partKey !== SYSTEM ? h('button', { key: 'delete', type: 'button', className: 'fang-btn', disabled: busy,
        onClick: () => deleteEntry(selected.id) }, t('context.deleteEntry')) : null,
    ]

    const mineZone = h('div', { key: 'mine', className: 'st-ctx-mine' },
      mineHead,
      copyError !== '' ? h('p', { key: 'mine-error', className: 'st-dialog-error' }, copyError) : null,
      h('div', { key: 'mine-split', className: 'st-ctx-mine-split' },
        h('div', { className: 'st-ctx-mine-list' },
          entries.length === 0
            ? h('p', { className: 'fang-muted' }, t('context.empty'))
            : h(List, null, ...mineRows)),
        h('div', { className: 'st-ctx-mine-detail' },
          selected === null
            ? h('p', { className: 'fang-muted' }, t('context.empty'))
            : [
              h('p', { key: 'text', className: 'st-overview-text' }, selected.text),
              h('div', { key: 'actions', className: 'st-dialog-actions' }, ...mineActions),
            ])))

    // The pane's geometry never depends on the text: head, bar and both zone boundaries are
    // fixed; each zone scrolls inside itself.
    return [
      h('div', { key: 'head', className: 'fang-split-detail-head' },
        h('h3', { className: 'fang-split-detail-title' }, partLabel(partKey)),
        h('span', { className: 'fang-split-detail-meta' },
          override !== ''
            ? t('context.replaced')
            : (replaceable ? t('context.official') : t('context.readonly')))),
      bar,
      officialZone,
      mineZone,
      dialogText === null ? null : h(Dialog, {
        key: 'copy-dialog', title: t('context.newCopy'), size: 'medium',
        closeLabel: t('action.close'), onClose: () => setDialogText(null),
      },
        h('textarea', { key: 'draft', className: 'st-input st-dialog-textarea', spellCheck: false,
          value: dialogText, onChange: (event) => setDialogText(event.target.value) }),
        copyError !== '' ? h('p', { key: 'copy-error', className: 'st-dialog-error' }, copyError) : null,
        h('div', { key: 'actions', className: 'st-dialog-actions' },
          h('button', { type: 'button', className: 'fang-btn', disabled: busy,
            onClick: () => setDialogText(null) }, t('action.cancel')),
          h('button', { type: 'button', className: 'fang-btn fang-btn-primary', disabled: busy || dialogText.trim() === '',
            onClick: addCopy }, t('context.newCopy')))),
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
