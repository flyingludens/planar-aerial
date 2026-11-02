/**
 * The content of the board's bookmarks, one entry per tab.
 *
 * Each of these is what a bookmark SHOWS, not the board itself: the sheet decides which one is
 * on screen. They are kept together because they share a shape — a title, a row of controls,
 * and a body — and because none of them depends on another.
 */
import { React, h } from '../shared/react.js'
import { Dialog, FileButton, List, ListRow, SplitPane, useSessionState } from 'fang-style'
import { describeChange, renderManuscript } from './labels.js'
import { useNotice } from '../shared/hooks.js'

export const MOSAIC_TABS = [
  // The keys reuse the drawers' dictionary entries, so both languages are free. 提案 is a
  // decision waiting on the writer; 流派 is a reusable library, so it sits at the end.
  ['relations', 'mosaic.tab.relations'],
  ['world', 'mosaic.tab.world'],
  ['cast', 'mosaic.tab.cast'],
  ['items', 'mosaic.tab.items'],
  ['proposals', 'mosaic.tab.proposals'],
  ['overview', 'tab.overview'],
  ['versions', 'tab.versions'],
  // 流派 last: it is a library of reusable writing styles, not a page about the current book.
  ['writingStyle', 'tab.writingStyles'],
]

/**
 * The shape every page of the board has: a title row, one row of controls, then the content.
 *
 * The three bands are enforced HERE rather than repeated in six components, so the operation
 * area is one row high everywhere and the content starts on the same line on every bookmark.
 * `actions` may be null and is a single row by construction — anything taller belongs in the
 * content band. `content` is an explicit prop rather than children because the render harness
 * calls components as type(props) and never fills props.children.
 */
export function MosaicPage({ title, actions, content }) {
  const body = Array.isArray(content) ? content : [content]
  return h('div', { className: 'st-mosaic-band' },
    h('div', { className: 'st-mosaic-band-head' },
      h('h2', { className: 'st-mosaic-band-heading' }, title),
      h('div', { className: 'st-mosaic-band-tools' }, actions)),
    h('div', { className: 'st-mosaic-band-content' }, ...body.filter((node) => node !== null && node !== undefined)))
}

/**
 * The proposals page: everything the model suggested and nobody has answered. Proposals are
 * stored on disk (one file per proposal under the book), so this page is a LIST rather than a
 * single slot — and it is the only place a proposal is answered. Accepting goes through the
 * same `mosaic.apply` route every other write uses.
 */
export function ProposalsPage({ t, api, book, bookFolder, onApply, onNotice }) {
  const [rows, setRows] = React.useState(null)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')
  useNotice(onNotice, error)
  // The list is loaded once when the page opens and again after every answer — an effect keyed
  // on a counter the answer path bumps, not a fetch inside the render.
  const [epoch, setEpoch] = React.useState(0)
  const [pickedId, setPickedId] = React.useState(null)
  React.useEffect(() => {
    let cancelled = false
    api.proposals(bookFolder).then((data) => {
      if (cancelled) return
      setRows(Array.isArray(data?.proposals) ? data.proposals : [])
    }, (e) => { if (!cancelled) { setRows([]); setError(e?.message ?? String(e)) } })
    return () => { cancelled = true }
  }, [api, bookFolder, epoch])
  const refresh = () => { setEpoch((n) => n + 1) }
  const answer = async (row, status) => {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      // Accepted means APPLIED: the changes go through the same route the review page uses,
      // and the status is written by that route. Rejecting only records the answer.
      if (status === 'accepted') {
        // A proposal with no changes still owes an answer. Sending an empty batch to the apply
        // route would be a no-op, and the row would stay pending forever.
        if ((row.changes ?? []).length === 0) await api.setProposalStatus(bookFolder, row.id, 'accepted')
        else await onApply(row.changes ?? [], { proposalId: row.id })
      } else {
        await api.setProposalStatus(bookFolder, row.id, status)
      }
      refresh()
    } catch (e) { setError(e?.message ?? String(e)) } finally { setBusy(false) }
  }
  const discard = async (row) => {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      await api.deleteProposal(bookFolder, row.id)
      refresh()
    } catch (e) { setError(e?.message ?? String(e)) } finally { setBusy(false) }
  }
  const STATUS_LABEL = {
    pending: t('mosaic.proposalsPending'),
    accepted: t('mosaic.proposalsAccepted'),
    rejected: t('mosaic.proposalsRejected'),
  }
  const SOURCE_LABEL = {
    check: t('mosaic.proposalFromCheck'),
    relate: t('mosaic.proposalFromRelate'),
    chat: t('mosaic.proposalFromChat'),
  }
  const chapterTitleOf = (id) => (book?.chapters ?? []).find((chapter) => chapter.id === id)?.title ?? ''
  const entityNameOf = (id) => (book?.mosaic?.entities ?? []).find((entity) => entity.id === id)?.name ?? String(id ?? '')
  const timeOf = (at) => (Number.isFinite(at) ? new Date(at).toLocaleString() : '')
  if (rows === null) return h('div', { className: 'st-mosaic-proposals-empty' }, t('label.loading'))
  if (rows.length === 0) return h('div', { className: 'st-mosaic-proposals-empty' }, t('mosaic.proposalsEmpty'))
  const picked = rows.find((row) => row.id === pickedId) ?? rows[0]
  return SplitPane({
    listProps: { role: 'tablist', 'aria-label': t('mosaic.tab.proposals') },
    list: h(List, null,
      rows.map((row) => {
        const changes = Array.isArray(row.changes) ? row.changes : []
        return h(ListRow, {
          key: row.id,
          role: 'tab',
          className: 'st-mosaic-proposal',
          active: row.id === picked.id,
          'data-testid': `proposal-${row.id}`,
          'data-status': row.status,
          onActivate: () => setPickedId(pickedId === row.id ? '__closed' : row.id),
        },
          h('div', { className: 'st-mosaic-proposal-head' },
            h('span', { className: 'st-mosaic-proposal-count' }, `${changes.length} ${t('mosaic.proposalChanges')}`),
            h('span', { className: 'st-mosaic-proposal-status', 'data-status': row.status }, STATUS_LABEL[row.status] ?? row.status)),
          h('span', { className: 'fang-list-row-meta' }, [SOURCE_LABEL[row.source] ?? row.source, chapterTitleOf(row.sourceChapterId), timeOf(row.at)].filter((part) => part !== '').join(' · ')),
          (row.evidence ?? []).length === 0 ? null : h('span', { className: 'fang-list-row-meta' }, row.evidence[0]))
      })),
    detailProps: { role: 'tabpanel' },
    detail: picked === undefined ? [h('div', { className: 'fang-split-detail-body' }, h('p', { className: 'fang-muted' }, t('mosaic.proposalsEmpty')))] : [
      h('div', { className: 'fang-split-detail-head' },
        h('h3', { className: 'fang-split-detail-title' }, SOURCE_LABEL[picked.source] ?? picked.source),
        h('span', { className: 'fang-split-detail-meta' }, STATUS_LABEL[picked.status] ?? picked.status)),
      h('div', { className: 'fang-split-detail-body' },
        h('div', { className: 'st-mosaic-proposal-meta' },
          [chapterTitleOf(picked.sourceChapterId), timeOf(picked.at)].filter((part) => part !== '').join(' · ')),
        (picked.evidence ?? []).length === 0 ? null : h('ul', { className: 'st-mosaic-proposal-evidence' },
          (picked.evidence ?? []).map((line, i) => h('li', { key: `ev-${i}` }, line))),
        (picked.changes ?? []).length === 0 ? null : h('ul', { className: 'st-mosaic-proposal-changes' },
          (picked.changes ?? []).map((change, i) => h('li', { key: `c-${i}` }, describeChange(change, entityNameOf)))),
        picked.status === 'pending' ? h('div', { className: 'st-mosaic-proposal-actions' },
          h('button', {
            type: 'button', className: 'fang-btn fang-btn-ghost',
            'data-testid': `proposal-accept-${picked.id}`, disabled: busy,
            onClick: () => answer(picked, 'accepted'),
          }, t('mosaic.proposalAccept')),
          h('button', {
            type: 'button', className: 'fang-btn fang-btn-ghost',
            'data-testid': `proposal-reject-${picked.id}`, disabled: busy,
            onClick: () => answer(picked, 'rejected'),
          }, t('mosaic.proposalReject'))) : h('div', { className: 'st-mosaic-proposal-actions' },
          h('button', {
            type: 'button', className: 'fang-btn fang-btn-ghost',
            'data-testid': `proposal-delete-${picked.id}`, disabled: busy,
            onClick: () => discard(picked),
          }, t('mosaic.proposalDelete')))),
    ],
  })
}

/**
 * Snapshots of the open book: take one, or roll back to one. `bookFolder` is the root the
 * BOOK lives under, not the panel's current workspace — a book can be opened from another
 * workspace's shelf, and every read and write has to address the one it came from.
 */
export function VersionsPage({ t, book, bookFolder, api, onAdoptWritten }) {
  const snap = async () => {
    await api.snapshot(bookFolder, `${t('label.snapshotLabel')} ${new Date().toLocaleString()}`)
    const data = await api.load(bookFolder)
    if (typeof onAdoptWritten === 'function') onAdoptWritten({ book: data.book, token: data.token, savedAt: data.savedAt })
  }
  const restore = async (id) => {
    const data = await api.restore(bookFolder, id)
    // The restore route writes the file and answers with the book and its token. Adopting both
    // in one step is what keeps the next autosave from being refused as stale.
    if (typeof onAdoptWritten === 'function') onAdoptWritten({ book: data.book, token: data.token, savedAt: data.savedAt })
  }
  return h(MosaicPage, {
    title: t('tab.versions'),
    // Snapshot is the page's one action, so it takes the page's one control row like every other
    // board page; it used to sit at the top of the content, which read as a different layout.
    actions: h('button', { type: 'button', className: 'fang-btn', onClick: snap }, t('action.snapshot')),
    content: h(List, { className: 'st-mosaic-versions' },
      [...book.snapshots].reverse().map((s) => h(ListRow, { key: s.id, className: 'st-mosaic-version-row' },
        h('div', { className: 'st-mosaic-version-text' },
          h('div', { className: 'st-list-row-title' }, s.label),
          h('div', { className: 'fang-list-row-meta' }, new Date(s.at).toLocaleString())),
        h('button', { type: 'button', className: 'fang-btn', onClick: () => restore(s.id) }, t('action.restore'))))),
  })
}

/**
 * 流派: saved writing-style prompts. A card is one style; clicking it makes it active, and the
 * chosen prompt travels with every generation request.
 */
export function WritingStylesPage({ t, api, bookFolder, book, onNotice }) {
  const boardScope = `story:${book?.id ?? bookFolder ?? ''}`
  const [, setBoardBusy] = useSessionState(boardScope, 'mosaicBusy', false)
  const [, setNote] = useSessionState(boardScope, 'mosaicNote', '')
  const [state, setState] = React.useState(() => (Array.isArray(book?.writingStyles)
    ? { writingStyles: book.writingStyles, activeId: book.activeWritingStyleId ?? '' }
    : null))
  const [error, setError] = React.useState('')
  const [epoch, setEpoch] = React.useState(0)
  const [pickedId, setPickedId] = React.useState(null)
  useNotice(onNotice, error)
  React.useEffect(() => {
    let cancelled = false
    api.writingStyles(bookFolder).then(
      (data) => { if (!cancelled) setState({ writingStyles: data?.writingStyles ?? [], activeId: data?.activeId ?? '' }) },
      (failure) => { if (!cancelled) { setState({ writingStyles: [], activeId: '' }); setError(failure?.message ?? String(failure)) } },
    )
    return () => { cancelled = true }
  }, [api, bookFolder, epoch])
  const reload = () => setEpoch((n) => n + 1)
  const use = async (id) => {
    setError('')
    try {
      const data = await api.setWritingStyleActive(bookFolder, id)
      setState({ writingStyles: data?.writingStyles ?? [], activeId: data?.activeId ?? '' })
    } catch (failure) { setError(failure?.message ?? String(failure)) }
  }
  return h(MosaicPage, {
    t, title: t('tab.writingStyles'),
    actions: h(WritingStyleNewButton, { t, api, bookFolder, onCreated: reload, setBoardBusy, setNote }),
    content: state === null
      ? h('div', { className: 'fang-muted' }, t('label.loading'))
      : state.writingStyles.length === 0
        ? h('div', { className: 'fang-muted' }, t('mosaic.writingStyle.empty'))
        : (() => {
            const picked = pickedId === '__closed' ? undefined : (state.writingStyles.find((row) => row.id === pickedId) ?? state.writingStyles[0])
            const active = picked === undefined ? false : state.activeId === picked.id
            return SplitPane({
              listProps: { role: 'tablist', 'aria-label': t('tab.writingStyles') },
              list: h(List, null,
                state.writingStyles.map((writingStyle) => h(ListRow, {
                  key: writingStyle.id, role: 'tab', active: writingStyle.id === picked.id,
                  onActivate: () => setPickedId(pickedId === writingStyle.id ? '__closed' : writingStyle.id),
                },
                  h('span', { className: 'st-list-row-title' }, writingStyle.name),
                  h('span', { className: 'fang-list-row-meta' },
                    state.activeId === writingStyle.id ? t('mosaic.writingStyle.active') : t('mosaic.writingStyle.use'))))),
              detailProps: { role: 'tabpanel' },
              detail: picked === undefined ? [h('div', { className: 'fang-split-detail-body' }, h('p', { className: 'fang-muted' }, t('mosaic.writingStyle.empty')))] : [
                h('div', { className: 'fang-split-detail-head' },
                  h('h3', { className: 'fang-split-detail-title' }, picked.name),
                  h('span', { className: 'fang-split-detail-meta' }, active ? t('mosaic.writingStyle.active') : '')),
                h('div', { className: 'fang-split-detail-body' },
                  h('p', { className: 'st-writing-style-prompt' }, picked.prompt),
                  active ? null : h('div', { className: 'st-mosaic-proposal-actions' },
                    h('button', {
                      type: 'button', className: 'fang-btn fang-btn-primary',
                      'data-testid': 'writing-style-use', onClick: () => use(picked.id),
                    }, t('mosaic.writingStyle.use')))),
              ],
            })
          })(),
  })
}

/** The new-writing-style form: name, prompt, and a source sample that can generate the prompt. */
function WritingStyleNewButton({ t, api, bookFolder, onCreated, setBoardBusy, setNote }) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState('')
  const [prompt, setPrompt] = React.useState('')
  const [source, setSource] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')
  const close = () => { setOpen(false); setError('') }
  const generate = async () => {
    if (busy) return
    setError('')
    if (source.trim() === '') { setError(t('mosaic.writingStyle.needSource')); return }
    setBusy(true)
    if (typeof setBoardBusy === 'function') setBoardBusy(true)
    if (typeof setNote === 'function') setNote(t('mosaic.writingStyle.thinking'))
    try { setPrompt((await api.generateWritingStyle(bookFolder, source)).prompt ?? '') }
    catch (failure) { setError(failure?.message ?? String(failure)) } finally {
      if (typeof setNote === 'function') setNote('')
      if (typeof setBoardBusy === 'function') setBoardBusy(false)
      setBusy(false)
    }
  }
  const readFile = async (file) => {
    if (file === null || file === undefined || typeof file.text !== 'function') return
    try { setSource(await file.text()) } catch (failure) { setError(failure?.message ?? String(failure)) }
  }
  const submit = async () => {
    if (busy) return
    setError('')
    if (name.trim() === '') { setError(t('mosaic.writingStyle.needName')); return }
    if (prompt.trim() === '') { setError(t('mosaic.writingStyle.needPrompt')); return }
    setBusy(true)
    try {
      await api.saveWritingStyle(bookFolder, { name, prompt, source })
      close()
      setName(''); setPrompt(''); setSource('')
      if (typeof onCreated === 'function') onCreated()
    } catch (failure) { setError(failure?.message ?? String(failure)) } finally { setBusy(false) }
  }
  return h(React.Fragment, null,
    h('button', {
      type: 'button', className: 'fang-btn fang-btn-primary', 'data-testid': 'writing-style-new',
      onClick: () => { setError(''); setOpen(true) },
    }, t('mosaic.new')),
    open ? h('div', {
      className: 'fang-backdrop', role: 'presentation',
      onMouseDown: (e) => { if (e.target === e.currentTarget) close() },
    },
      h('div', { className: 'fang-dialog', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('mosaic.writingStyle.new') },
        h('div', { className: 'fang-dialog-title' }, t('mosaic.writingStyle.new')),
        h('div', { className: 'fang-dialog-body' },
          h('label', { className: 'st-dialog-field' },
            h('span', { className: 'st-dialog-label' }, t('mosaic.writingStyle.name')),
            h('input', {
              className: 'st-input', 'data-testid': 'writing-style-name',
              value: name, onChange: (e) => setName(e.target.value),
            })),
          h('label', { className: 'st-dialog-field' },
            h('span', { className: 'st-dialog-label' }, t('mosaic.writingStyle.prompt')),
            h('textarea', {
              className: 'st-input st-dialog-textarea', rows: 6, 'data-testid': 'writing-style-prompt',
              value: prompt, onChange: (e) => setPrompt(e.target.value),
            })),
          h('label', { className: 'st-dialog-field' },
            h('span', { className: 'st-dialog-label' }, t('mosaic.writingStyle.source')),
            h('textarea', {
              className: 'st-input st-dialog-textarea', rows: 4, 'data-testid': 'writing-style-source',
              value: source, onChange: (e) => setSource(e.target.value),
            }),
            h('div', { className: 'st-writing-style-actions' },
              h(FileButton, {
                label: t('mosaic.writingStyle.file'), accept: '.txt,.md,text/plain',
                testId: 'writing-style-source-file', onFile: readFile,
              }),
              h('button', {
                type: 'button', className: 'fang-btn st-writing-style-generate', disabled: busy,
                'data-testid': 'writing-style-generate', onClick: generate,
              }, busy ? '…' : t('mosaic.writingStyle.generate')))),
          error === '' ? null : h('p', { className: 'st-dialog-hint st-dialog-error' }, error)),
        h('div', { className: 'fang-dialog-actions' },
          h('button', { type: 'button', className: 'fang-btn', onClick: close }, t('action.cancel')),
          h('button', {
            type: 'button', className: 'fang-btn fang-btn-primary', disabled: busy, 'data-testid': 'writing-style-save',
            onClick: submit,
          }, t('mosaic.writingStyle.save'))))) : null)
}

/**
 * The overview: progress, a chapter list beside the selected chapter, the global summary, and
 * the three audits.
 *
 * The chapters are a LIST, not a wall of cards. The writer picks one on the left and reads its
 * dossier on the right — the editable one-line summary, the generated overview, and the prose.
 * The selected row lifts off the list (a shadow and a small rise) so "which chapter am I
 * reading" is answered by depth rather than by a coloured ring.
 */
export function OverviewPage({ t, book, bookFolder, api, onAdoptWritten, onNotice, onSummary }) {
  const [busy, setBusy] = React.useState(false)
  const [issues, setIssues] = React.useState(null)
  const [auditError, setAuditError] = React.useState('')
  const [pickedId, setPickedId] = React.useState(null)
  // One dialog at a time: manuscript or continuity report. The page keeps its chapter list
  // visible; a reading surface opens over it rather than piling up under it.
  const [dialog, setDialog] = React.useState(null)
  useNotice(onNotice, auditError)
  const refresh = async () => {
    setBusy(true)
    try {
      const data = await api.overview(bookFolder, true)
      // Only the summary is taken from the answer: the prose on screen may be newer than the
      // copy the route read, and replacing the whole book would undo it.
      if (typeof onAdoptWritten === 'function') {
        onAdoptWritten({
          merge: (prevBook) => (prevBook === null || prevBook === undefined ? prevBook : {
            ...prevBook, overview: data.book?.overview ?? data.overview ?? prevBook.overview,
          }),
          token: data.token,
          savedAt: data.savedAt,
        })
      }
    } finally { setBusy(false) }
  }
  const runConsistency = async () => {
    setAuditError('')
    try {
      setIssues((await api.consistency(bookFolder)).issues ?? [])
      setDialog('consistency')
    } catch (failure) { setAuditError(failure.message) }
  }
  const [manuscript, setManuscript] = React.useState(null)
  const runManuscript = async () => {
    setAuditError('')
    try {
      setManuscript((await api.manuscript(bookFolder)).markdown ?? '')
      setDialog('manuscript')
    } catch (failure) { setAuditError(failure.message) }
  }
  // The board can be open while the manuscript is still being read — it remembers being open
  // across a restart, and `book` is null for that whole window. Reading through it took the
  // entire panel down with a TypeError.
  if (book === null || book === undefined) {
    return h('div', { className: 'fang-scroll fang-muted' }, t('label.loading'))
  }
  const chapters = book.chapters ?? []
  const selected = chapters.find((chapter) => chapter.id === pickedId) ?? chapters[0]
  const chapterOverview = selected === undefined ? undefined : book.overview.chapters[selected.id]
  // "Written" is a leaf with text; there are no per-paragraph statuses to tally.
  const finals = chapters.filter((c) => (c.text ?? '') !== '').length
  const total = chapters.length
  const textOf = (chapter) => (typeof chapter?.text === 'string' ? chapter.text : '')
  const summaryOf = (chapter) => (typeof chapter?.summary === 'string' ? chapter.summary : '')
  const issueKind = (kind) => t(`consistency.kind.${kind}`)
  return h(MosaicPage, {
    title: t('tab.overview'),
    // The progress read-out and the refresh control sit in the page's ONE control row, like every
    // other board page's actions. They used to open the content, which made the overview the only
    // page whose toolbar was inside its body.
    actions: h('div', { className: 'st-overview-actions' },
      // The cast count comes from the board: there is no separate character list any more.
      h('span', { className: 'fang-muted' }, t('label.overviewProgress', {
        c: total, f: finals, t: total,
        p: (book.mosaic?.entities ?? []).filter((e) => e.kind === 'character').length,
      })),
      h('button', { type: 'button', className: 'fang-btn', disabled: busy, onClick: refresh },
        busy ? '…' : t('action.refresh'))),
    content: h('div', { className: 'st-overview' },
    SplitPane({
      listProps: { role: 'tablist', 'aria-label': t('tab.overview') },
      list: h(List, null,
        chapters.length === 0
          ? h('p', { className: 'fang-muted' }, t('mosaic.chapterEmpty'))
          : chapters.map((chapter) => h(ListRow, {
            key: chapter.id,
            role: 'tab',
            active: chapter.id === selected?.id,
            'aria-selected': chapter.id === selected?.id ? 'true' : 'false',
            onActivate: () => setPickedId(chapter.id),
          },
            h('span', { className: 'st-list-row-title' }, chapter.title || t('mosaic.untitled')),
            h('span', { className: 'fang-list-row-meta' },
              t('label.charCount', { n: textOf(chapter).length }))))),
      detailProps: { role: 'tabpanel' },
      detail: [
        selected === undefined ? null : h('div', { className: 'fang-split-detail-head' },
          h('h3', { className: 'fang-split-detail-title' }, selected.title || t('mosaic.untitled')),
          h('span', { className: 'fang-split-detail-meta' },
            t('label.charCount', { n: textOf(selected).length }))),
        h('div', { className: 'fang-split-detail-body' },
          selected === undefined
            ? h('p', { className: 'fang-muted' }, t('mosaic.chapterEmpty'))
            : h(React.Fragment, null,
                h('label', { className: 'st-overview-field' },
                  h('span', { className: 'st-overview-label' }, t('mosaic.summaryLabel')),
                  h('textarea', {
                    className: 'st-overview-summary',
                    value: summaryOf(selected),
                    placeholder: t('mosaic.summaryPlaceholder'),
                    onChange: (e) => { if (typeof onSummary === 'function') onSummary(selected.id, e.target.value) },
                  })),
                h('div', { className: 'st-overview-field' },
                  h('span', { className: 'st-overview-label' }, t('mosaic.overviewLabel')),
                  chapterOverview !== undefined
                    ? h('p', { className: 'st-overview-text' }, chapterOverview.text)
                    : h('p', { className: 'st-overview-text fang-muted' }, t('mosaic.overviewEmpty'))),
                h('div', { className: 'st-overview-field' },
                  h('span', { className: 'st-overview-label' }, t('mosaic.bodyLabel')),
                  textOf(selected) === ''
                    ? h('p', { className: 'st-overview-text fang-muted' }, t('mosaic.bodyEmpty'))
                    : h('div', { className: 'st-overview-body' }, textOf(selected))))),
      ],
    }),
    h('div', { className: 'st-overview-global' },
      h('div', { className: 'st-overview-label' }, t('label.overviewGlobal')),
      book.overview.global
        ? h('p', { className: 'st-overview-text' }, book.overview.global.text)
        : h('p', { className: 'st-overview-text fang-muted' }, t('mosaic.overviewEmpty'))),
    h('div', { className: 'fang-row fang-gap-over-section' },
      h('button', { type: 'button', className: 'fang-btn fang-btn-primary', onClick: runManuscript }, t('action.manuscript')),
      h('button', { type: 'button', className: 'fang-btn', onClick: runConsistency }, t('action.consistency'))),
    dialog === 'manuscript' ? h(Dialog, {
      title: t('action.manuscript'), closeLabel: t('action.close'), onClose: () => setDialog(null), size: 'wide',
    },
      manuscript === '' || manuscript === null
        ? h('div', { className: 'fang-muted' }, t('label.emptyManuscript'))
        : h('div', { className: 'st-manuscript' }, ...renderManuscript(manuscript, t))) : null,
    dialog === 'consistency' && issues !== null ? h(Dialog, {
      title: t('label.consistencyReport'), closeLabel: t('action.close'), onClose: () => setDialog(null), size: 'medium',
    },
      issues.length === 0
        ? h('div', null, t('label.noIssues'))
        : h(React.Fragment, null,
            issues.map((issue, index) => h('div', { key: index, className: 'st-issue' },
              h('span', { className: 'st-badge' }, issueKind(issue.kind)),
              h('span', null, `${issue.where ? `${issue.where}：` : ''}${issue.problem}`),
              issue.evidence ? h('div', { className: 'fang-muted' }, issue.evidence) : null)))) : null)
  })
}
