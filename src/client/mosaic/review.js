/**
 * What the model proposes, and how the writer decides on it.
 *
 * A proposal is a list of changes to the board; the writer accepts or rejects them one by one.
 * The page holds the state (busy, notice) because its body is called as a plain function,
 * not rendered as a component — a hook inside it would land on the page's hook table.
 */
import { React, h } from '../shared/react.js'
import { Dropdown, useSessionState } from 'fang-style'
import { kindLabel } from './labels.js'
import { MosaicRelations } from './relations.js'
import { useNotice } from '../shared/hooks.js'
import { ENTITY_KINDS } from '../../../domain/schema.js'

/**
 * The hash of one chapter's text, for the provenance stamp.
 *
 * The server computes it with sha256 over the chapter text (lib/overview.js hashText); the
 * browser has crypto.subtle, and the two must agree byte for byte or every fact would read as
 * suspect on its first check.
 */
const chapterTextHash = async (chapter) => {
  const text = typeof chapter?.text === 'string' ? chapter.text : ''
  const bytes = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function MosaicNewCard({ t, onCreate, onCreated, defaultKind }) {
  const [open, setOpen] = React.useState(false)
  const [kind, setKind] = React.useState(defaultKind ?? 'character')
  const [name, setName] = React.useState('')
  const [role, setRole] = React.useState('')
  const [summary, setSummary] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [error, setError] = React.useState('')

  const reset = () => {
    setName(''); setRole(''); setSummary(''); setDescription(''); setError('')
  }
  const close = () => { setOpen(false); reset() }
  const submit = () => {
    const trimmed = name.trim()
    if (trimmed === '') { setError(t('mosaic.newNeedName')); return }
    // The construction and the write are the board's use case: this form only decides which
    // fields the writer filled in.
    const entity = onCreate(kind, {
      name: trimmed,
      role: kind === 'character' ? role.trim() : '',
      summary: summary.trim(),
      description: description.trim(),
    })
    close()
    if (typeof onCreated === 'function') onCreated(entity)
  }

  const field = (label, placeholder, value, onChange, multiline) => h('label', { className: 'st-dialog-field' },
    h('span', { className: 'st-dialog-label' }, label),
    multiline
      ? h('textarea', {
        className: 'st-input st-dialog-textarea', placeholder, value,
        onChange: (e) => onChange(e.target.value),
      })
      : h('input', {
        className: 'st-input', placeholder, value,
        onChange: (e) => onChange(e.target.value),
      }))

  return h(React.Fragment, null,
    h('button', {
      type: 'button', className: 'fang-btn fang-btn-primary', 'data-testid': 'mosaic-new',
      onClick: () => { reset(); setOpen(true) },
    }, t('mosaic.new')),
    open ? h('div', {
      className: 'fang-backdrop', role: 'presentation',
      onMouseDown: (e) => { if (e.target === e.currentTarget) close() },
    },
      h('div', { className: 'fang-dialog', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('mosaic.newTitle') },
        h('div', { className: 'fang-dialog-title' }, t('mosaic.newTitle')),
        h('div', { className: 'fang-dialog-body' },
          h('label', { className: 'st-dialog-field' },
            h('span', { className: 'st-dialog-label' }, t('mosaic.newKind')),
            h(Dropdown, {
              className: 'st-new-kind', testId: 'mosaic-new-kind',
              label: t('mosaic.newKind'), value: kind, onChange: setKind,
              options: ENTITY_KINDS.map((value) => ({ value, label: kindLabel(value, t) })),
            })),
          field(t('mosaic.newName'), undefined, name, setName),
          // A character is asked for its role; the other four have no extra field at birth, so
          // the form stays two boxes instead of becoming a questionnaire.
          kind === 'character'
            ? field(t('mosaic.newRole'), t('mosaic.newRolePlaceholder'), role, setRole)
            : null,
          // The one-line summary and the long description are two boxes: the first is what
          // every digest and the card front read, the second is the设定资料.
          field(t('mosaic.newSummary'), undefined, summary, setSummary),
          field(t('mosaic.newDescription'), undefined, description, setDescription, true),
          error === '' ? null : h('p', { className: 'st-dialog-hint st-dialog-error' }, error)),
        h('div', { className: 'fang-dialog-actions' },
          h('button', { type: 'button', className: 'fang-btn', onClick: close }, t('action.cancel')),
          h('button', {
            type: 'button', className: 'fang-btn fang-btn-primary', 'data-testid': 'mosaic-new-submit',
            onClick: submit,
          }, t('mosaic.newSubmit'))))) : null)
}

/**
 * The relations page's header: the two AI entries, the fetched proposal, and the verdicts.
 *
 * The header owns NO state — busy, proposal and decisions live on the component that is actually
 * mounted (see MosaicReviewPage), and the verdicts come from the sheet, because the bookmark
 * badge counts what still owes one. It is called as a plain function and returns
 * {actions, content}: the buttons go in the action row, the proposal is CONTENT — it can be any
 * height — so it renders under the row.
 */
function MosaicCheckHeader({ t, api, bookFolder, book, chapter, mosaicProposal, onProposal, decisions, onDecide, onApplyChanges, busy, setBusy, setNotice, setNote, notice }) {
  // No gate on the model: an unpinned mosaic role falls back to the session model, like chat
  // and continue. No question box of its own: the panel has ONE composer, and a question typed
  // while the board is open is about the board.
  const proposal = mosaicProposal
  // Changes arrive carrying entity ids — the digest and the check prompt are id-keyed — and
  // the writer reads names. An id the board does not have shows as itself, never vanishes.
  const nameOf = (id) => {
    const entity = (book.mosaic?.entities ?? []).find((e) => e.id === id)
    return entity === undefined ? String(id ?? '') : entity.name
  }
  const editChange = (index, patch) => {
    onProposal({
      ...proposal,
      changes: proposal.changes.map((change, i) => (i === index ? { ...change, ...patch } : change)),
    })
  }

  const check = async () => {
    if (busy || !chapter) return
    setBusy(true)
    setNotice('')
    if (typeof setNote === 'function') setNote(t('mosaic.thinking.check'))
    onDecide('reset')
    try {
      const data = await api.mosaicCheck(bookFolder, chapter.id, chapter.text ?? '')
      if (data?.proposal) {
        onProposal(data.proposal)
        onDecide('reset')
        if ((data.proposal.changes ?? []).length === 0) setNotice(t('mosaic.checkEmpty'))
      } else if (data?.message) setNotice(data.message)
    } catch (error) { setNotice(error.message) } finally {
      if (typeof setNote === 'function') setNote('')
      setBusy(false)
    }
  }

  /**
   * Read the relations out of the CARDS, the other direction from `check`: the writer
   * described who knows whom in the card summaries and never drew the lines. The cards on
   * screen ARE the input — reading them from the file answered about a different board
   * whenever a save had not landed yet.
   */
  const relate = async () => {
    if (busy) return
    setBusy(true)
    setNotice('')
    if (typeof setNote === 'function') setNote(t('mosaic.thinking.relate'))
    onDecide('reset')
    try {
      const data = await api.mosaicRelate(book.mosaic?.entities ?? [], book.mosaic?.edges ?? [], bookFolder)
      if (data?.proposal) {
        onProposal(data.proposal)
        onDecide('reset')
        const found = (data.proposal.changes ?? []).length
        if (found > 0) setNotice(t('mosaic.relateFound', { n: found }))
      }
      // Nothing found is an ANSWER, not a failure: the writer needs to know the model looked.
      if (!data?.proposal) setNotice(data?.message ?? t('mosaic.relateEmpty'))
    } catch (error) { setNotice(error.message) } finally {
      if (typeof setNote === 'function') setNote('')
      setBusy(false)
    }
  }

  /** One apply call with exactly the given changes, then the board repaints from the host. */
  const runApply = async (changes, after, provenance, proposalId) => {
    if (changes.length === 0 || busy) return
    setBusy(true)
    setNotice('')
    if (typeof setNote === 'function') setNote(t('mosaic.thinking.apply'))
    try {
      // The provenance stamp travels with the chapter id and the hash of the chapter text, so
      // the facts written here can be re-checked against the prose later (lib/facts.js). The
      // hash is computed here; the hook that applies the changes flushes the save first. No
      // chapter, no stamp: the changes land as the author's own word.
      let stamp
      if (provenance !== undefined && provenance !== null
        && typeof provenance.chapterId === 'string' && provenance.chapterId !== ''
        && provenance.chapter !== null && provenance.chapter !== undefined) {
        stamp = { chapterId: provenance.chapterId, hash: await chapterTextHash(provenance.chapter) }
      }
      await onApplyChanges(changes, {
        proposalId,
        provenance: stamp,
        after: () => {
          onProposal(null)
          onDecide('reset')
          if (typeof after === 'function') after()
        },
      })
    } catch (error) { setNotice(error.message) } finally {
      if (typeof setNote === 'function') setNote('')
      setBusy(false)
    }
  }

  const apply = async () => {
    const changes = (proposal?.changes ?? []).filter((_, i) => decisions[i] === 'accepted')
    // The proposal's own id rides along so the route marks the stored copy accepted — the
    // proposals page lists what is still waiting, and an applied review must not keep waiting.
    const chapterId = typeof proposal?.sourceChapterId === 'string' ? proposal.sourceChapterId : ''
    await runApply(changes, undefined, chapterId === '' ? undefined : { chapterId, chapter }, proposal?.id)
  }

  const opName = (op) => t(`mosaic.op.${op}`)
  /** A convenience for a proposal with many changes: accept every row, then write once. */
  const acceptAll = () => {
    for (let i = 0; i < (proposal?.changes ?? []).length; i += 1) onDecide(i, 'accepted')
  }
  const sourceLabel = proposal === null || proposal === undefined ? ''
    : (t(`mosaic.proposalFrom${proposal.source === 'relate' ? 'Relate' : proposal.source === 'chat' ? 'Chat' : 'Check'}`))
  const proposalChapter = proposal === null || proposal === undefined || proposal.sourceChapterId === null || proposal.sourceChapterId === undefined
    ? ''
    : (book.chapters ?? []).find((chapter) => chapter.id === proposal.sourceChapterId)?.title ?? ''
  const proposalTime = proposal !== null && proposal !== undefined && Number.isFinite(proposal.at)
    ? new Date(proposal.at).toLocaleString() : ''
  const proposalMeta = [sourceLabel, proposalChapter, proposalTime].filter((part) => part !== '').join(' · ')
  const hasChangeLeft = (proposal?.changes ?? []).some((_, i) => decisions[i] !== 'accepted')
  /** The payload a writer can judge, in the change's own fields. An edge upsert that updates
      an EXISTING edge also shows what the edge says now — a bare new kind gives the writer
      nothing to check the change against. */
  const detailOf = (change) => {
    switch (change.op) {
      // The kind's own label first — that is what the writer is deciding ("is this a place?").
      case 'entity.upsert': return [kindLabel(change.kind, t), change.summary, change.description]
        .filter((part) => typeof part === 'string' && part !== '').join('：')
      case 'edge.upsert': {
        const newKind = change.truth?.kind ?? ''
        const edge = (book.mosaic?.edges ?? []).find((e) => e.from === change.from && e.to === change.to)
          ?? (change.edgeId !== undefined && change.edgeId !== null
            ? (book.mosaic?.edges ?? []).find((e) => e.id === change.edgeId)
            : undefined)
        return edge === undefined
          ? `${nameOf(change.from)} — ${nameOf(change.to)}：${newKind}`
          : `${nameOf(change.from)} — ${nameOf(change.to)}：${edge.truth?.kind ?? ''} → ${newKind}`
      }
      case 'belief.add': return `${nameOf(change.holderId)}：${change.kind}${change.note ? `（${change.note}）` : ''}`
      case 'status.add':
      case 'status.remove': return `${nameOf(change.entityId)}：${change.label}`
      case 'edge.retire': return change.reason ?? ''
      default: return JSON.stringify(change)
    }
  }

  return {
    actions: h('div', { className: 'st-mosaic-head' },
      // ONE row of controls, and nothing else in the operation band: the buttons belong to the
      // page, so they share the band with every other page's buttons.
      h('div', { className: 'st-mosaic-check-row' },
        h('button', {
          type: 'button', className: 'fang-btn fang-btn-ghost', 'data-testid': 'mosaic-check',
          disabled: busy,
          onClick: check,
        }, t('mosaic.check')),
        h('button', {
          type: 'button', className: 'fang-btn fang-btn-ghost', 'data-testid': 'mosaic-relate',
          disabled: busy,
          onClick: relate,
        }, t('mosaic.relate')))),
    content: h('div', { className: 'st-mosaic-body-block' },
      notice === '' || notice === undefined ? null : h('div', { className: 'st-mosaic-notice', role: 'status' }, notice),
      proposal !== null && proposal !== undefined
        ? h('div', { className: 'st-mosaic-proposal-wrap' },
            h('p', { className: 'st-mosaic-proposal-title' }, t('mosaic.proposalTitle')),
            proposalMeta === '' ? null : h('div', { className: 'st-mosaic-proposal-meta' }, proposalMeta),
            (Array.isArray(proposal.evidence) ? proposal.evidence : []).length > 0
              ? h('blockquote', { className: 'st-mosaic-proposal-evidence' },
                  (Array.isArray(proposal.evidence) ? proposal.evidence : []).map((quote, i) => h('div', { key: i }, quote)))
              : null,
            (proposal.changes ?? []).map((change, i) => {
              const verdict = decisions[i] ?? 'undecided'
              const quote = (Array.isArray(proposal.evidence) ? proposal.evidence : [])[change.evidenceIndex]
              // Only the entity upsert has a name worth correcting in place; the other ops
              // carry ids and labels the board resolves.
              const editableName = change.op === 'entity.upsert'
              return h('article', { key: i, className: 'st-mosaic-proposal', 'data-testid': 'mosaic-proposal-card',
                'data-accepted': verdict === 'accepted' ? 'true' : undefined,
                'data-rejected': verdict === 'rejected' ? 'true' : undefined },
                h('div', { className: 'st-mosaic-proposal-op' }, opName(change.op)),
                h('div', { className: 'st-mosaic-proposal-detail' }, detailOf(change)),
                editableName ? h('div', { className: 'st-mosaic-fields' },
                  h('input', {
                    type: 'text', className: 'st-mosaic-name', value: change.name ?? '',
                    onChange: (e) => editChange(i, { name: e.target.value }),
                  })) : null,
                typeof quote === 'string' && quote !== '' ? h('p', { className: 'st-mosaic-quote' }, quote) : null,
                h('div', { className: 'st-mosaic-proposal-actions' },
                  h('button', {
                    type: 'button', className: 'fang-btn fang-btn-ghost', 'data-testid': 'proposal-accept',
                    disabled: busy, onClick: () => onDecide(i, verdict === 'accepted' ? 'undecided' : 'accepted'),
                  }, t('mosaic.accept')),
                  h('button', {
                    type: 'button', className: 'fang-btn fang-btn-ghost', 'data-testid': 'proposal-reject',
                    disabled: busy, onClick: () => onDecide(i, verdict === 'rejected' ? 'undecided' : 'rejected'),
                  }, t('mosaic.reject'))))
            }),
            hasChangeLeft || (proposal.changes ?? []).some((_, i) => decisions[i] === 'accepted')
              ? h('div', { className: 'st-mosaic-apply-row' },
                  hasChangeLeft ? h('button', {
                    type: 'button', className: 'fang-btn fang-btn-ghost', 'data-testid': 'proposal-accept-all',
                    disabled: busy, onClick: acceptAll,
                  }, t('mosaic.acceptAll')) : null,
                  (proposal.changes ?? []).some((_, i) => decisions[i] === 'accepted')
                    ? h('button', {
                      type: 'button', className: 'fang-btn fang-btn-primary', 'data-testid': 'proposal-apply',
                      disabled: busy, onClick: apply,
                    }, t('mosaic.apply')) : null)
              : null)
        : null,
      // The message is NOT drawn here: every failure is reported in the one status bar.
      null),
  }
}

/**
 * The relations page, in one piece.
 *
 * The header is called once, as a plain function, and its {actions, content} answer is laid
 * into the two bands. Calling it twice would fetch twice; letting it render as a component
 * inside the band would put its hooks on the wrong component's table, which is what produced
 * the crash this structure replaces.
 */
export function MosaicReviewPage({ t, mosaic, book, updateBook, picked, onPick, api, bookFolder, chapter, mosaicProposal, onProposal, decisions, onDecide, onApplyChanges, onCreate, onInspect, onPortrait, portraitOf, portraitBusyId, portraitError, onNotice }) {
  const boardScope = `story:${book?.id ?? bookFolder ?? ''}`
  // Busy lives in the dock store so a window switch cannot drop the fact that a request is
  // still running; the main thinking row reads the same keys.
  const [busy, setBusy] = useSessionState(boardScope, 'mosaicBusy', false)
  const [, setNote] = useSessionState(boardScope, 'mosaicNote', '')
  const [notice, setNotice] = React.useState('')
  // This page's messages go to the status bar like every other one. The hook lives HERE
  // because the header is called as a plain function — a hook in it would land on this
  // component's hook table.
  useNotice(onNotice, notice)
  const parts = MosaicCheckHeader({
    t, api, bookFolder, book, chapter, mosaicProposal, onProposal,
    decisions, onDecide, onApplyChanges,
    busy, setBusy, setNotice, setNote, notice,
  })
  // The AI entries sit in the TITLE row at its trailing edge — they act on the whole board.
  // The foot row keeps only the two pickers, which answer "what am I looking at".
  return h('div', { className: 'st-mosaic-band' },
    h('div', { className: 'st-mosaic-band-head' },
      h('h2', { className: 'st-mosaic-band-heading' }, t('mosaic.tab.relations')),
      h('div', { className: 'st-mosaic-band-tools' },
        parts.actions,
        h(MosaicNewCard, { t, onCreate, onCreated: onInspect, defaultKind: 'character' }))),
    h('div', { className: 'st-mosaic-band-content' },
      parts.content,
      h(MosaicRelations, {
        t, mosaic, book, updateBook, picked, onPick,
        onPortrait, portraitOf, portraitBusyId, portraitError,
      })))
}
