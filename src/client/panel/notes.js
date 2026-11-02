/**
 * 随笔: the whole-book scratchpad.
 *
 * A jotting belongs to the book, not to the chapter where the caret was: the thought that
 * arrives while writing chapter two may be for chapter nine. The panel therefore reads and
 * writes book.notes, which every chapter sees.
 *
 * The top field is a quick capture. Opening the panel starts one blank note immediately, so a
 * writer can type the thought before deciding where it belongs. The list and detail below are
 * the archive; nothing is selected until the writer picks a row.
 */
import { React, h } from '../shared/react.js'
import { Dialog, List, ListRow, SplitPane } from 'fang-style'
import { rowId } from '../shared/logic.js'

const timeOf = (at) => (Number.isFinite(at) ? new Date(at).toLocaleString() : '')
const firstName = (text) => String(text ?? '').split('\n')[0].trim()

export function NotesPanel({ t, book, updateBook, onClose }) {
  const notes = Array.isArray(book?.notes) ? book.notes : []
  const [draftId, setDraftId] = React.useState(null)
  const [selectedId, setSelectedId] = React.useState(null)
  const createdRef = React.useRef(false)

  const write = (nextNotes, immediate = false) => {
    if (typeof updateBook !== 'function') return
    updateBook({ ...book, notes: nextNotes }, immediate ? { immediate: true } : undefined)
  }
  const updateNote = (id, text) => {
    if (id === null || id === undefined) return
    write(notes.map((note) => (note.id === id ? { ...note, text } : note)))
  }
  // One new blank note per opening. The ref guards React's development double-effect; the
  // component is mounted fresh on the next opening, so the guard does not block a new note then.
  React.useEffect(() => {
    if (createdRef.current) return
    createdRef.current = true
    const id = rowId('note')
    write([{ id, text: '', at: Date.now() }, ...notes])
    setDraftId(id)
    setSelectedId(null)
  }, [])

  const draft = notes.find((note) => note.id === draftId)
  const selected = notes.find((note) => note.id === selectedId)
  const ordered = [...notes].sort((a, b) => (Number(b.at) || 0) - (Number(a.at) || 0))
  // Closing with an untouched draft does not leave a blank row behind for the next opening.
  // A note with any text is kept: the thought is the writer's, even if they changed their mind
  // about where it goes.
  const close = () => {
    const current = notes.find((note) => note.id === draftId)
    if (current !== undefined && current.text.trim() === '') {
      write(notes.filter((note) => note.id !== draftId))
    }
    onClose()
  }

  return h(Dialog, {
    title: t('notes.title'), closeLabel: t('action.close'), onClose: close, size: 'medium',
    bodyClassName: 'st-notes-body', panelClassName: 'st-notes-dialog',
    backdropClassName: 'st-notes-backdrop',
  },
    h('div', { className: 'st-notes' },
      // The quick-capture field is first and focused: opening the panel is the whole gesture.
      h('div', { className: 'st-notes-capture' },
        h('textarea', {
          className: 'st-input', autoFocus: true,
          'data-testid': 'notes-capture', value: draft?.text ?? '',
          placeholder: t('notes.placeholder'),
          onChange: (e) => updateNote(draftId, e.target.value),
        })),
      SplitPane({
        listProps: { role: 'tablist', 'aria-label': t('notes.title') },
        list: h(List, null,
          ordered.map((note) => h(ListRow, {
            key: note.id, role: 'tab', active: note.id === selectedId,
            'data-testid': `note-${note.id}`,
            onActivate: () => setSelectedId(selectedId === note.id ? null : note.id),
          },
            h('span', { className: 'st-list-row-title' }, firstName(note.text) || t('notes.untitled')),
            h('span', { className: 'fang-list-row-meta' }, timeOf(note.at))))),
        detailProps: { role: 'tabpanel' },
        detail: selected === undefined
          ? [h('div', { className: 'fang-split-detail-body' }, h('p', { className: 'fang-muted' }, t('notes.pick')))]
          : [
              // The note's text IS the detail. A title row and a timestamp above it only repeated
              // what the list already says and took height from the writing surface.
              h('div', { className: 'fang-split-detail-body' },
                // Reading pane, not a form: the note's text is the whole content. Editing a new
                // thought happens in the capture field above; an archived note is read here.
                h('div', { className: 'st-notes-detail', 'data-testid': 'notes-detail' }, selected.text)),
            ],
      })))
}
