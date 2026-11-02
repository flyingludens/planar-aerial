/**
 * The shelf: every book the writer has, and the one they are in.
 *
 * The library is what the panel shows when no book is open, and the title menu is how a writer
 * moves between books without going back to the shelf. Both read the same listing, so they live
 * together.
 */
import { React, h } from '../shared/react.js'
import { useNotice } from '../shared/hooks.js'
import { BackIcon } from '../shared/icons.js'
import { ConfirmDialog } from 'fang-style'
import { NewBookDialog } from './new-book-dialog.js'
import { MosaicGallery, MosaicGalleryCard, MosaicCardMenu } from '../mosaic/cards.js'

export function BookLibrary({ t, api, books, workspaces, workspaceSnapshot, onOpen, onCreated, onRenamed, onDeleted, onBack, backTitle, onNotice, onOpenDirectory }) {
  const [creating, setCreating] = React.useState(false)
  // The card being renamed or deleted, and the confirmation the delete asks for. A destructive
  // action on a book is not undoable, so it takes a second, explicit answer.
  const [renaming, setRenaming] = React.useState(null)
  const [draftTitle, setDraftTitle] = React.useState('')
  const [confirming, setConfirming] = React.useState(null)
  const [removeFiles, setRemoveFiles] = React.useState(false)
  const [draft, setDraft] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')
  useNotice(onNotice, error)

  const beginRename = (entry) => { setRenaming(entry); setDraftTitle(entry.title); setError('') }
  const commitRename = async () => {
    const entry = renaming
    const title = draftTitle.trim()
    if (entry === null || title === '' || title === entry.title) { setRenaming(null); return }
    setBusy(true)
    try {
      const data = await api.renameBook(entry.folder, title)
      setRenaming(null)
      // The folder may have moved with the title; keep the book openable from the shelf under
      // whatever name it now has.
      onRenamed(entry, data)
    } catch (failure) {
      setError(failure.message)
    } finally {
      setBusy(false)
    }
  }

  const beginDelete = (entry) => { setConfirming(entry); setRemoveFiles(false); setError('') }
  const commitDelete = async () => {
    const entry = confirming
    if (entry === null) return
    setBusy(true)
    try {
      await api.deleteBook(entry.folder, removeFiles)
      // A book IS a Workspace, so deleting the book must delete its registration too. Left
      // behind, the sidebar keeps an entry whose folder no longer holds a manuscript — an
      // unusable row the writer has to clean up by hand.
      const owned = (workspaceSnapshot?.items ?? []).find((row) => row.path === entry.absolutePath)
      if (owned !== undefined && workspaces?.delete !== undefined) {
        try { await workspaces.delete(owned.workspaceId) } catch (failure) { setError(failure.message) }
      } else if (owned !== undefined) {
        setError(t('label.workspaceLeftBehind'))
      }
      setConfirming(null)
      onDeleted()
    } catch (failure) {
      setError(failure.message)
    } finally {
      setBusy(false)
    }
  }

  /**
   * Creating a book makes the manuscript folder. That is ALL it does.
   *
   * It used to register the folder as a Workspace as well — named `writer · <title>`, with a
   * rename pass because the host may ignore the title. That put a row in the sidebar before the
   * writer had asked for one: a book nobody has opened a conversation in still appeared under
   * the projects, and creating three books littered the list with three. The registration
   * belongs to the moment a conversation is actually started, which is where it now lives
   * (`ensureBookWorkspace`, called by `openConversation`).
   */
  const create = async () => {
    const title = draft.trim()
    if (title === '' || busy) return
    setBusy(true)
    setError('')
    try {
      const data = await api.createBook(title)
      setDraft('')
      setCreating(false)
      onCreated(data.folder, data.books ?? [], data.absolutePath)
    } catch (failure) {
      setError(failure.message)
    } finally {
      setBusy(false)
    }
  }

  return h('div', {
    className: 'st-library st-canvas',
    // The bright dot layer is masked to a position carried in CSS variables. Writing them
    // straight onto the element (never through state) keeps the follow at pointer-move speed
    // with no re-render per move. Y adds scrollTop because the layer scrolls with the content
    // while the pointer coordinates do not.
    onPointerMove: (e) => {
      const el = e.currentTarget
      const rect = el.getBoundingClientRect()
      el.style.setProperty('--st-pointer-x', `${Math.round(e.clientX - rect.left)}px`)
      el.style.setProperty('--st-pointer-y', `${Math.round(e.clientY - rect.top + el.scrollTop)}px`)
    },
    onPointerLeave: (e) => { e.currentTarget.style.setProperty('--st-pointer-x', '-999px') },
  },
    // The head row IS the titlebar (same class): one recipe for the divider, the padding and
    // the leading clearance, so the shelf title sits on the same line the book title occupies.
    h('div', { className: 'fang-titlebar st-library-head' },
      // Back to the book that was open. Only offered when there is one: on a first visit the
      // library IS the panel, and a back arrow pointing nowhere would be a dead control.
      typeof onBack === 'function' && backTitle
        ? h('button', {
          type: 'button', className: 'fang-btn fang-btn-ghost fang-btn-icon st-library-back',
          title: t('label.backToBook', { title: backTitle }),
          'aria-label': t('label.backToBook', { title: backTitle }),
          onClick: onBack,
        }, h(BackIcon))
        : null,
      h('h2', { className: 'st-library-title' }, t('label.library')),
      h('span', { className: 'fang-spacer' }),
      h('span', { className: 'st-caption' }, t('label.bookCount', { n: books.length }))),
    // The shelf is the SAME card as the board's gallery — one component, one size, one set of
    // shadows. It used to be a private 220px text box with its own border, which read as a row
    // of list items rather than as the covers of books.
    h(MosaicGallery, { t, rows: books },
      books.map((entry) => h(MosaicGalleryCard, {
        key: `${entry.workspace}/${entry.folder}`,
        id: entry.folder,
        kind: 'book',
        // The identity line under the cover: the title, and only the title.
        label: entry.title,
        // No role line. `role` renders beside the title on the cover strip, and for a book it was
        // the FOLDER NAME — which is the title again, because the folder is derived from it. The
        // card read "漫长的旅行 · 漫长的旅行". A character's role says something the name does not;
        // a book has no such second line, so it gets none.
        // `null`, not `undefined`: a book has no portrait, but it does have a FACE — the same
        // square cover area every board card has, with the title's first character standing in.
        // `undefined` would drop the whole band and leave a flat text box, which is what the
        // shelf used to be and what the writer asked to stop being.
        picture: null,
        onActivate: () => onOpen(entry.folder, entry.absolutePath),
      },
        // `st-book-open` stays as the card's own click target: it is what the tests drive and
        // what a keyboard reaches. Its handler stops the event so the card's own activate does
        // not fire a second time in the browser.
        h('div', {
          className: 'st-book-open', 'data-testid': 'book-open',
          onClick: (e) => { if (e !== undefined && e !== null) e.stopPropagation?.(); onOpen(entry.folder, entry.absolutePath) },
        },
          h('div', { className: 'st-book-meta' }, t('label.bookMeta', { c: entry.chapters, f: entry.finals }))),
        // The card's ⋯ menu, the same control every other card carries. It replaces the two
        // buttons that used to sit under the cover: they did not fit the card's width, so the
        // delete label was clipped, and a shelf of cards each wearing two buttons read as a
        // toolbar rather than as a shelf.
        h(MosaicCardMenu, {
          t,
          onEdit: () => beginRename(entry),
          onDelete: () => beginDelete(entry),
        }))),
      // The tile is a CARD, sized like the ones beside it, and it OPENS A DIALOG: creating a
      // book asks for a title in the same modal the delete confirmation uses, rather than
      // turning a grid cell into a form. A cell-sized input squeezed the field into 184px and
      // made the shelf jump as the row re-flowed around it.
      h('button', {
        // `st-book-add` marks the one tile in the grid that is a BUTTON. It is what carries the
            // hover and press state: the shared `.st-book-new` class is also on the rename form,
        // hover and press state: the shared `.st-book-new` class is also on the rename form,
        // and a form that lifts under the pointer is a form you fight with while clicking.
        type: 'button', className: 'st-book-card st-book-new st-book-add',
        // The tile is what opened the dialog, so it stays marked while the dialog is up: an
        // accent ring and the lifted position, the same two cues a card uses for "this one".
        // Announced as a popup rather than a pressed toggle — it opens a question, it does not
        // switch something on.
        'aria-haspopup': 'dialog', 'aria-expanded': creating ? 'true' : 'false',
        onClick: () => { setDraft(''); setError(''); setCreating(true) },
      },
        h('span', { className: 'st-book-plus' }, '+'),
        h('span', null, t('action.newBook'))),
      // One inline editor at a time: a rename in place reads better than a modal over a shelf.
      renaming === null ? null : h('div', { className: 'st-book-card st-book-new st-book-form' },
        h('div', { className: 'fang-muted fang-gap-under-hint' }, t('label.renameBookHint')),
        h('input', {
          className: 'st-input', autoFocus: true, value: draftTitle,
          onChange: (e) => setDraftTitle(e.target.value),
          onKeyDown: (e) => {
            if (e.key === 'Enter') { e.preventDefault(); commitRename() }
            if (e.key === 'Escape') { setRenaming(null) }
          },
        }),
        h('div', { className: 'fang-row fang-gap-over-row' },
          h('button', { type: 'button', className: 'fang-btn fang-btn-primary', disabled: busy || draftTitle.trim() === '', onClick: commitRename }, t('action.rename')),
          h('button', { type: 'button', className: 'fang-btn', onClick: () => setRenaming(null) }, t('action.cancel'))))),
    // Creating a book asks in a modal too. The shelf is a grid of cards; a card that turns into
    // a form re-flows the row and gives the title field 184px, which is narrower than a title.
    creating ? h(NewBookDialog, {
      t, draft, busy, error,
      onDraft: setDraft,
      onCancel: () => { setCreating(false); setDraft('') },
      onCreate: create,
      onOpen: typeof onOpenDirectory === 'function'
        ? () => { setCreating(false); setDraft(''); onOpenDirectory() }
        : undefined,
    }) : null,
    // Rename is inline because it is reversible and quick. DELETING is not: it asks in a
    // modal, over the shelf, with the destructive choice spelled out and the reversible one
    // preselected. A second question buried in the card was too easy to hit by accident.
    // It sits OUTSIDE the gallery: a dialog is not a card and must not be laid out as one.
    confirming === null ? null : h(ConfirmDialog, {
      busy,
      title: t('label.deleteBookConfirm', { title: confirming.title }),
      children: [
        h('label', { key: 'check', className: 'st-check' },
          h('input', { type: 'checkbox', checked: removeFiles, onChange: (e) => setRemoveFiles(e.target.checked) }),
          h('span', null, t('label.deleteFilesToo'))),
        h('div', { key: 'hint', className: 'st-dialog-hint' }, removeFiles ? t('label.deleteFilesWarn') : t('label.deleteManifestOnly')),
      ],
      confirmLabel: t('action.delete'),
      cancelLabel: t('action.cancel'),
      onConfirm: commitDelete,
      onCancel: () => setConfirming(null),
    }))
}


/**
 * The outline: volumes, chapters and sections as a folded tree. Only leaves carry text, and
 * only a leaf can be selected — clicking a container just folds it, which keeps the tree
 * honest about what is editable.
 */
