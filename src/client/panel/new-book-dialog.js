/**
 * The new-book card, shared by the start page and the shelf.
 *
 * The page and the shelf used to ask for a title in two different components; this is the one
 * dialog both open, so the title field and the open/create actions cannot drift apart.
 */
import { React, h } from '../shared/react.js'

export function NewBookDialog({ t, draft, busy, error, onDraft, onCancel, onCreate, onOpen }) {
  React.useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); onCancel() }
    }
    if (typeof document === 'undefined' || typeof document.addEventListener !== 'function') return undefined
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])
  return h('div', {
    className: 'st-newbook-backdrop', role: 'presentation',
    onMouseDown: (event) => { if (event.target === event.currentTarget) onCancel() },
  },
    h('div', {
      className: 'st-newbook', role: 'dialog', 'aria-modal': 'true',
      'aria-labelledby': 'st-newbook-title',
    },
      h('h2', { className: 'st-newbook-title', id: 'st-newbook-title' }, t('welcome.newBook')),
      h('input', {
        className: 'st-newbook-input', autoFocus: true, value: draft,
        placeholder: t('label.newBookTitle'), 'aria-label': t('label.newBookTitle'),
        onChange: (e) => onDraft(e.target.value),
        onKeyDown: (e) => { if (e.key === 'Enter') { e.preventDefault(); onCreate() } },
      }),
      error === '' ? null : h('p', { className: 'st-newbook-error' }, error),
      h('div', { className: 'st-newbook-actions' },
        typeof onOpen === 'function'
          ? h('button', { type: 'button', className: 'st-btn st-btn-ghost st-newbook-open', onClick: onOpen }, t('action.open'))
          : null,
        h('button', { type: 'button', className: 'st-btn st-btn-ghost', onClick: onCancel }, t('action.cancel')),
        h('button', {
          type: 'button', className: 'st-btn st-btn-primary', disabled: busy || draft.trim() === '',
          onClick: onCreate,
        }, busy ? '…' : t('action.create'))),
    ),
  )
}
