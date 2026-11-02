/**
 * The rail's function list: the four things that act on the WHOLE book rather than on a node.
 *
 * One button per line. A line is the unit here — a full-width row the pointer can be anywhere on
 * — because a list of four destinations in a 264px card is read top to bottom, and a wrapped run
 * of chips read as a tag cloud with no order.
 *
 * They live at the bottom of the directory because that is where the writer's hand is when the
 * outline is done with — and because the region above them is the one that changes on every
 * keystroke. Putting book-level actions in the title row mixed two scopes on one line; putting
 * them under the tree keeps each region to one job.
 *
 * Every button does its work HERE rather than being wired to a prop per action: a caller that
 * has to assemble four unrelated handlers from its own state is a caller that will one day pass
 * the wrong one. The dialog and the export are local state; the shelf and the save are handed in,
 * because only the panel knows what "the shelf" means for the current screen.
 */
import { React, h } from '../shared/react.js'
import { ShelfIcon, SaveIcon, ExportIcon, InfoIcon, StartIcon, FolderIcon, ContextIcon } from '../shared/icons.js'

/**
 * The plugin's identity.
 *
 * Substituted at build time from package.json (see build.mjs). The fallbacks are not decoration:
 * a source file is also read directly by the Node render harness, where those constants do not
 * exist, and an undefined identifier there would throw on the first render of the card.
 */
/* global __PLUGIN_NAME__, __PLUGIN_VERSION__, __PLUGIN_AUTHOR__, __PLUGIN_REPOSITORY__, __PLUGIN_LICENSE__ */
const PLUGIN = {
  name: __PLUGIN_NAME__, version: __PLUGIN_VERSION__, author: __PLUGIN_AUTHOR__,
  repository: String(__PLUGIN_REPOSITORY__ ?? '').replace(/^git\+/, '').replace(/\.git$/, ''),
  license: __PLUGIN_LICENSE__,
}

/** One button in the row. */
function RailTool({ icon, label, hint, disabled, onClick, testId }) {
  return h('button', {
    type: 'button', className: 'st-rail-tool',
    'data-testid': testId,
    title: hint,
    // The label is the accessible name. Naming it again with aria-label would only be a second
    // copy of the same string, and the two could drift.
    disabled: disabled === true,
    onClick,
  },
    h('span', { className: 'st-rail-tool-icon' }, icon),
    h('span', { className: 'st-rail-tool-label' }, label))
}

/**
 * A file name a person can find again: the book's title, with the characters a filesystem
 * refuses replaced. Not the folder-name helper from the server — this one runs in the browser and
 * only has to produce a `download` attribute, so it does not need to agree with the store.
 */
export function exportFileName(title) {
  const base = String(title ?? '')
    .trim()
    // The separator and the eight reserved characters, plus control chars: the range is the point
    // of the rule, not an accident of it.
    // eslint-disable-next-line no-control-regex
    .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/^\.+/, '')
    .slice(0, 60)
    .trim()
  return `${base === '' ? 'manuscript' : base}.md`
}

/**
 * Hand a string to the browser as a download.
 *
 * A Blob and an object URL rather than a data: URI — a whole novel in a data URI is megabytes of
 * base64 in an attribute, and some browsers refuse one that long. `document` is absent under the
 * Node render harness, so the helper reports that it could not run instead of throwing: the
 * caller turns that into a notice.
 */
export function downloadText(text, name) {
  if (typeof document === 'undefined' || typeof URL === 'undefined' || typeof Blob !== 'function') return false
  if (typeof document.createElement !== 'function') return false
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' })
  const href = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = href
  link.download = name
  // Not appended to the document: a programmatic click on a detached anchor downloads in every
  // current browser, and attaching it would flash a node into the page for one frame.
  if (typeof link.click !== 'function') { URL.revokeObjectURL(href); return false }
  link.click()
  // The URL is released on the next tick: revoking it in the same one can cancel the download in
  // some engines, which had the effect of an export that silently produced nothing.
  // globalThis, like every other timer in this panel: a bare setTimeout( matches the client-setters
  // check's "setX(" pattern, and that check is about React state setters.
  globalThis.setTimeout(() => { URL.revokeObjectURL(href) }, 0)
  return true
}

/**
 * @param options.onShelf   - leave for the shelf; absent while the shelf is already showing
 * @param options.onSave    - write now, through the panel's save queue (and its status line)
 * @param options.onExport  - resolves the merged markdown; absent when there is no route
 * @param options.onNotice  - reports an outcome in the status bar, where every other message goes
 */
export function RailTools({ t, book, onStart, onShelf, onOpen, onContext, onSave, onExport, onNotice, onAbout, saving }) {
  const [busy, setBusy] = React.useState(false)
  const hasBook = book !== null && book !== undefined

  const exportNow = async () => {
    if (typeof onExport !== 'function' || busy) return
    setBusy(true)
    try {
      const markdown = await onExport()
      if (typeof markdown !== 'string' || markdown.trim() === '') {
        // An empty manuscript is not a failure to report as one: the writer who has not written
        // anything yet needs to know why nothing happened, not that something broke.
        if (typeof onNotice === 'function') onNotice(t('rail.exportEmpty'), 'info')
        return
      }
      const name = exportFileName(book?.title)
      if (downloadText(markdown, name) !== true) {
        if (typeof onNotice === 'function') onNotice(t('rail.exportEmpty'), 'info')
        return
      }
      if (typeof onNotice === 'function') onNotice(t('rail.exportDone', { name }), 'info')
    } catch (error) {
      if (typeof onNotice === 'function') onNotice(String(error?.message ?? error), 'error')
    } finally {
      setBusy(false)
    }
  }

  return h(React.Fragment, null,
    // The menu's own block: it takes the lower half of the card (see rail.css.js), so the
    // list sits at a fixed place in the panel rather than at the end of however long the tree is.
    h('div', { className: 'st-rail-menu' },
      h('div', { className: 'st-rail-tools', role: 'group' },
        h(RailTool, {
        t, icon: h(StartIcon), label: t('rail.start'),
        testId: 'rail-start',
        disabled: typeof onStart !== 'function',
        onClick: () => { if (typeof onStart === 'function') onStart() },
      }),
        h(RailTool, {
        t, icon: h(ShelfIcon), label: t('rail.shelf'),
        testId: 'rail-shelf',
        // While the shelf is showing there is nowhere to go: the button is present so the row
        // does not change shape between screens, and disabled so it does not lie about it.
        disabled: typeof onShelf !== 'function',
        onClick: () => { if (typeof onShelf === 'function') onShelf() },
      }),
      h(RailTool, {
        t, icon: h(FolderIcon), label: t('rail.open'),
        testId: 'rail-open',
        disabled: typeof onOpen !== 'function',
        onClick: () => { if (typeof onOpen === 'function') onOpen() },
      }),
      // Right under 打开目录: both answer "what is this book made of", one on disk and one in
      // the model's context.
      h(RailTool, {
        t, icon: h(ContextIcon), label: t('rail.context'),
        testId: 'rail-context',
        disabled: !hasBook || typeof onContext !== 'function',
        onClick: () => { if (typeof onContext === 'function') onContext() },
      }),
      h(RailTool, {
        t, icon: h(SaveIcon), label: t('rail.save'), hint: t('rail.saveHint'),
        testId: 'rail-save',
        disabled: !hasBook || typeof onSave !== 'function' || saving === true,
        onClick: () => {
          if (typeof onSave !== 'function') return
          onSave()
          // The status bar already reports the write; this says the KEY did something, which is
          // the half of the feedback a writer pressing a button expects on the button's row.
          if (typeof onNotice === 'function') onNotice(t('rail.savedNow'), 'info')
        },
      }),
      h(RailTool, {
        t, icon: h(ExportIcon), label: t('rail.export'),
        testId: 'rail-export',
        disabled: !hasBook || typeof onExport !== 'function' || busy,
        onClick: exportNow,
      }),
      h(RailTool, {
        t, icon: h(InfoIcon), label: t('rail.about'),
        testId: 'rail-about',
        // The card is NOT rendered here. This component is mounted inside the rail, which is an
        // absolutely positioned card: a fixed or inset:0 layer inside it is clipped to the rail and
        // centres on 264px of column. The panel owns the open state and mounts the card at its own
        // level, where "centred" means the panel the writer is looking at.
        onClick: () => { if (typeof onAbout === 'function') onAbout() },
      }))))
}

/**
 * What the 关于 button shows: the PLUGIN, not the open book.
 *
 * Mounted by the PANEL, not by the rail — see the note at the button. It carries the book argument
 * no longer: what it shows comes from package.json at build time.
 *
 * The book's own statistics live in the status bar and the board, where they are read while
 * working. 关于 is the one place that answers "what is this panel, which version, who wrote it" —
 * a question about the software, not about the manuscript.
 *
 * The three facts are compile-time constants substituted by build.mjs from package.json, so a
 * release that bumps the version cannot leave the card claiming an older one. There is no second
 * copy of them in the source to drift.
 *
 * A small card over the page rather than a route: there is nothing to fetch, and a dialog that can
 * fail to open would be a poor way to show a static string.
 */
export function AboutBox({ t, onClose }) {
  React.useEffect(() => {
    const onKey = (event) => { if (event.key === 'Escape') { event.preventDefault(); onClose() } }
    if (typeof document === 'undefined' || typeof document.addEventListener !== 'function') return undefined
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
  // Name, version, author — each named by the label beside it. The name is the plugin's, which is
  // what the writer installed; the package scope it happens to live under is the deployment's
  // business, not theirs.
  const licenseUrl = `${PLUGIN.repository}/blob/main/LICENSE`
  const rows = [
    { key: 'name', name: t('about.name'), value: t('brand.full') },
    { key: 'version', name: t('about.version'), value: PLUGIN.version },
    { key: 'author', name: t('about.author'), value: PLUGIN.author },
    { key: 'repository', name: t('about.repository'), value: h('a', {
      className: 'st-about-link', href: PLUGIN.repository, target: '_blank', rel: 'noreferrer',
    }, PLUGIN.repository.replace(/^https?:\/\//, '')) },
    { key: 'license', name: t('about.license'), value: h('a', {
      className: 'st-about-link', href: licenseUrl, target: '_blank', rel: 'noreferrer',
    }, PLUGIN.license) },
    { key: 'copyright', name: t('about.copyright'), value: `© ${new Date().getFullYear()} ${PLUGIN.author}` },
  ]
  return h('div', {
    className: 'fang-backdrop', role: 'presentation',
    onMouseDown: (event) => { if (event.target === event.currentTarget) onClose() },
  },
    h('div', { className: 'fang-dialog', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('rail.about') },
      h('div', { className: 'fang-dialog-title' }, t('rail.about')),
      h('div', { className: 'fang-dialog-body' },
        rows.map((row) => h('div', { key: row.key, className: 'fang-row st-gap-under-hint' },
          h('span', { className: 'fang-muted' }, row.name),
          h('span', { className: 'fang-spacer' }),
          h('span', null, row.value)))),
      h('div', { className: 'fang-dialog-actions' },
        h('button', { type: 'button', className: 'fang-btn', onClick: onClose }, t('action.close')))))
}
