/**
 * The front door: a first-run page, and a place to return to from the rail.
 *
 * It is deliberately not another shelf. The shelf answers "which book", this page answers "start
 * one" — so it carries the product name at display size, one sentence about what the panel is,
 * and one action. A writer with books can still go to the shelf, but the page does not begin by
 * asking them to choose from a grid.
 */
import { React, h } from '../shared/react.js'
import { BackIcon } from '../shared/ui.js'
import { NewBookDialog } from './new-book-dialog.js'
import { GlyphField } from './glyph-field.js'

/**
 * The new-book card.
 *
 * It deliberately does not use the generic confirm dialog: creating the first book is the page's
 * main act, and it should feel like an opening page rather than a form validation. The title gets
 * the serif display face and an underline field; the actions stay on the standard button system.
 */
export function WelcomePage({ t, api, books, hasBook, onCreated, onLibrary, onBack, onSeen, onBegin, primary, onOpenDirectory }) {
  const [creating, setCreating] = React.useState(false)
  const [draft, setDraft] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')

  const begin = () => {
    if (typeof onBegin === 'function') { onBegin(); return }
    setDraft(''); setError(''); setCreating(true)
  }
  const create = async () => {
    const title = draft.trim()
    if (title === '' || busy) return
    setBusy(true)
    setError('')
    try {
      const data = await api.createBook(title)
      setBusy(false)
      setCreating(false)
      if (typeof onSeen === 'function') onSeen()
      if (typeof onCreated === 'function') onCreated(data.folder, data.books ?? [], data.absolutePath)
    } catch (failure) {
      setBusy(false)
      setError(String(failure?.message ?? failure))
    }
  }
  const enterShelf = () => {
    if (typeof onSeen === 'function') onSeen()
    if (typeof onLibrary === 'function') onLibrary()
  }

  return h('div', {
    className: 'st-welcome st-canvas',
    onPointerMove: (e) => {
      const el = e.currentTarget
      const rect = el.getBoundingClientRect()
      el.style.setProperty('--st-pointer-x', `${Math.round(e.clientX - rect.left)}px`)
      el.style.setProperty('--st-pointer-y', `${Math.round(e.clientY - rect.top + el.scrollTop)}px`)
    },
    onPointerLeave: (e) => { e.currentTarget.style.setProperty('--st-pointer-x', '-999px') },
  },
    h(GlyphField),
    hasBook && typeof onBack === 'function'
      ? h('button', {
        type: 'button', className: 'st-btn st-btn-ghost st-btn-icon st-welcome-back',
        title: t('welcome.back'), 'aria-label': t('welcome.back'), onClick: onBack,
      }, h(BackIcon))
      : null,
    h('div', { className: 'st-welcome-main' },
      h('div', { className: 'st-welcome-copy' },
        h('h1', { className: 'st-welcome-title' },
          h('span', null, t('brand.lead')),
          h('span', { className: 'st-welcome-accent' }, t('brand.accent'))),
        h('p', { className: 'st-welcome-latin' }, t('brand.latin')),
        h('p', { className: 'st-welcome-lede' }, t('welcome.lede')),
        h('div', { className: 'st-welcome-cta' },
          h('div', { className: 'st-welcome-actions' },
            primary !== undefined && primary !== null
            ? primary
            : h('button', { type: 'button', className: 'st-btn st-btn-primary st-btn-xl', onClick: begin },
                t('welcome.begin')),
            books.length > 0 && typeof onLibrary === 'function'
              ? h('button', { type: 'button', className: 'st-btn st-btn-ghost st-btn-flow', onClick: enterShelf },
                  h('span', { className: 'st-btn-flow-label' }, t('welcome.library')))
              : null),
          error === '' ? null : h('p', { className: 'st-welcome-error' }, error)))),
    creating ? h(NewBookDialog, {
      t, draft, busy, error,
      onDraft: setDraft,
      onCancel: () => { setCreating(false); setDraft('') },
      onCreate: create,
      onOpen: onOpenDirectory,
    }) : null,
  )
}
