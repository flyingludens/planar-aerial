/**
 * The hooks that own a whole job rather than a widget — the writing domain's share of them.
 *
 * `useBookData` is the manuscript lifecycle: which book is on screen and what saving it means.
 * `useNotice` is how a page reports its own failure to the panel's status bar. The generic
 * behaviours — the per-book session store, the persisted preferences, the closing animation,
 * the dismiss gesture, and the localStorage helpers — live in fang-style and are imported
 * from there at the call sites.
 *
 * These take `api` as an argument rather than importing it, which is what lets a test drive the
 * save path with a stub route service and no panel.
 */
import { React } from './react.js'
import { emptyBookState } from './logic.js'
import { sameBooks, createSaveQueue } from './save-queue.js'

/**
 * The open book: reading it, holding it, and writing it back.
 *
 * This lived inside `StoryPanelBody` for a long time, mixed in with the layout, the workspace
 * list and the AI actions. It is one job — "which manuscript is on screen, and what does saving
 * it mean" — and it has exactly two inputs (a route service and the book's address) and one
 * output (the book, plus the four ways to change or reload it). Pulling it out is what lets the
 * save path be tested without mounting a panel.
 *
 * `shelfRefresh` is a separate concern the panel drives: the book listing is refreshed after a
 * rename or delete, and that is a fact about the LIBRARY, not about the open manuscript.
 */
export function useBookData({ api, library, bookFolder, t, autoSaveMs, onLoaded }) {
  const [state, setState] = React.useState(emptyBookState())
  /** The library listing. Kept here because the loading effect is the one that fetches it. */
  const [books, setBooks] = React.useState([])
  /**
   * A callback the panel hands down to change what happens after a load.
   *
   * Loading a book VOIDS a fetched proposal (its changes name entity ids from another board),
   * and closing the board is not this hook's business. A function rather than a `setProposal`
   * prop because the panel owns that state and this hook must not care what it is called.
   */
  const afterLoadRef = React.useRef(null)
  afterLoadRef.current = onLoaded ?? null
  /**
   * The save target is read when a request is BUILT, not when the edit happened: a render can
   * be several keystrokes old by the time the write goes out.
   */
  const saveTargetRef = React.useRef({ library: '', folder: undefined })
  saveTargetRef.current = { library, folder: bookFolder }
  const tokenRef = React.useRef('')
  tokenRef.current = state?.token ?? ''

  /**
   * Keep the book's side files when a host answers a save without them.
   *
   * `notes` (随笔) and the 流派 library live at the top level of the book but not inside the
   * manuscript half a save writes. An older host echoes the book it normalized without those
   * fields; adopting that echo verbatim made the scratchpad disappear mid-sentence — the next
   * keystroke landed in what looked like a fresh empty field. Only a field the host actually
   * omitted is carried over; a present empty value is an intentional write.
   */
  const withSideFields = (next, prevBook) => {
    if (next === null || next === undefined) return next
    const sameBook = next.id !== undefined && prevBook?.id !== undefined && next.id === prevBook.id
    if (!sameBook) return next
    const merged = { ...next }
    for (const key of ['writingStyles', 'activeWritingStyleId', 'activeWritingStyle', 'notes']) {
      if (merged[key] === undefined && prevBook[key] !== undefined) merged[key] = prevBook[key]
    }
    return merged
  }
  /**
   * How many times the book has been replaced, from any source: a local edit, a route that
   * wrote the file, or a fresh read.
   *
   * A save request answers with the book it wrote. That answer is only allowed to replace the
   * one on screen when nothing has changed since the request was built — otherwise the writer
   * would watch a sentence they typed during the save disappear. The counter is a ref rather
   * than state because it has to be read at the moment the answer arrives, not at render.
   */
  const bookVersionRef = React.useRef(0)
  /**
   * How many times a route or a read has replaced the file since this hook mounted.
   *
   * A save request answers with the token of the bytes IT wrote. If a route wrote the file in
   * the meantime, that token is already out of date, and adopting it would make the next save
   * look stale. Book replacements are guarded separately (they also include local edits, which
   * do not invalidate the token of a save that already landed).
   */
  const externalWriteRef = React.useRef(0)
  const queueRef = React.useRef(null)
  if (queueRef.current === null) {
    queueRef.current = createSaveQueue(async (next, token) => {
      const { folder } = saveTargetRef.current
      const version = bookVersionRef.current
      const externalWrites = externalWriteRef.current
      try {
        const data = await api.save(next, token, folder)
        // The host answers with the token AND the normalized book it wrote. The token is adopted
        // unless a route has written the file since this request was built; the book only when
        // no edit landed while the request was in flight.
        const externalMoved = externalWriteRef.current !== externalWrites
        const keepToken = externalMoved ? tokenRef.current : (data.token ?? tokenRef.current)
        if (data.book !== undefined && data.book !== null && bookVersionRef.current === version) {
          bookVersionRef.current += 1
          setState((prev) => ({ ...prev, book: withSideFields(data.book, prev.book), token: keepToken, saveError: '' }))
        } else {
          setState((prev) => ({ ...prev, token: keepToken, saveError: '' }))
        }
        return data
      } catch (error) {
        const message = error?.message ?? String(error)
        if (!message.startsWith('stale book')) {
          setState((prev) => ({ ...prev, saveError: message }))
          throw error
        }
        // The file moved on under us. Show what is on disk rather than keeping edits nobody
        // can save; this is now rare, because saves no longer collide with themselves.
        try {
          const data = await api.load(folder)
          bookVersionRef.current += 1
          externalWriteRef.current += 1
          setState((prev) => ({ ...prev, status: 'ready', book: data.book, token: data.token ?? '', saveError: message, recovered: data.recovered }))
        } catch {
          setState((prev) => ({ ...prev, saveError: message }))
        }
        throw error
      }
    }, () => tokenRef.current, { interval: autoSaveMs, memoryKey: bookFolder })
  }
  const queue = queueRef.current
  const [saveStatus, setSaveStatus] = React.useState(() => queue.getState())
  React.useEffect(() => queue.subscribe(setSaveStatus), [])
  /**
   * On unmount, write what is still waiting rather than dropping it.
   *
   * `dispose` cancels the armed timer and makes the queue ignore its pending book, which is right
   * for a queue nobody will read from again — but if the writer typed a sentence and the panel
   * was torn down before the interval fired, that sentence existed only in the queue. Flushing
   * first costs one request and is the difference between "the panel closed" and "my work went".
   *
   * The flush is not awaited: unmount has no way to wait, and blocking it would prevent the
   * request from ever being sent. `flush` starts the write synchronously in the common case
   * (nothing else running), so it leaves before the teardown finishes.
   */
  React.useEffect(() => () => {
    queue.flush().catch(() => {})
    queue.dispose()
  }, [])
  /**
   * Write what is pending when the page goes away.
   *
   * The interval alone is not enough: the default is five minutes, so a writer who types a
   * paragraph and closes the window lost it. Nothing else flushed on the way out — the editor
   * flushes on blur, and closing a window is not always a blur.
   *
   * `visibilitychange` rather than `beforeunload`: a page that is hidden still runs and its
   * request can go out, while `beforeunload` gives no reliable chance to finish an async write
   * (and the browser may show a confirmation dialog, which is a worse thing to put in front of
   * someone closing a tab). `pagehide` covers the back/forward cache case, where the page is
   * frozen rather than unloaded.
   */
  React.useEffect(() => {
    // Both globals are guarded: this hook also runs under the test harness, which provides a
    // document stub for the effects it drives and nothing at all otherwise. A missing listener
    // target is a host without a page, not a reason to fail the panel.
    if (typeof document === 'undefined' || typeof window === 'undefined') return undefined
    if (typeof document.addEventListener !== 'function' || typeof window.addEventListener !== 'function') return undefined
    const flush = () => { queue.flush().catch(() => {}) }
    const onHidden = () => { if (document.visibilityState === 'hidden') flush() }
    document.addEventListener('visibilitychange', onHidden)
    window.addEventListener('pagehide', flush)
    return () => {
      document.removeEventListener('visibilitychange', onHidden)
      window.removeEventListener('pagehide', flush)
    }
  }, [queue])

  const refreshShelf = () => {
    if (!library) return
    api.books().then((data) => {
      const next = data.books ?? []
      // Keep the previous array when nothing changed: the effects that depend on it stay quiet.
      setBooks((prev) => (sameBooks(prev, next) ? prev : next))
    }, () => {})
  }

  React.useEffect(() => {
    // A load replaces the book on screen. Any save still in flight belongs to the previous
    // book and must not write its answer (or its token) over this one.
    bookVersionRef.current += 1
    externalWriteRef.current += 1
    // `root`, not the new-book directory: a book folder is a place a book can be READ from even
    // though it is not a place a new one may be WRITTEN to. Guarding on the new-book directory
    // here skipped the scan entirely, so the shelf stayed empty and the folder it was supposed
    // to come from could never resolve.
    if (!library) { setState(emptyBookState()); return undefined }
    let cancelled = false
    api.books().then((data) => {
      if (cancelled) return
      const next = data.books ?? []
      setBooks((prev) => (sameBooks(prev, next) ? prev : next))
    }, () => {})
    // No book chosen yet means the library is the panel; loading one here would read a file
    // nobody is looking at and, on failure, park an error the shelf never shows.
    if (bookFolder === undefined) {
      setState(emptyBookState())
      return () => { cancelled = true }
    }
    setState((prev) => ({ ...prev, status: 'loading', book: null, token: '', error: '', saveError: '', recovered: false }))
    api.load(bookFolder)
      .then((data) => {
        if (cancelled) return
        // A route answer without a book is a failure, not an empty manuscript: the host always
        // sends one. Rendering `null` for it left the panel blank with nothing to read.
        if (data?.book === undefined || data.book === null) {
          setState({ status: 'error', book: null, token: '', error: t('label.loadFailed'), saveError: '', recovered: false })
          return
        }
        setState({ status: 'ready', book: data.book, token: data.token ?? '', error: '', saveError: '', recovered: data.recovered })
        // The file on disk carries its own last-write time: a freshly remounted panel adopts it
        // (when the queue has nothing newer to say), so the bar shows 已保存 for a saved book.
        queue.markSaved(data.savedAt)
        if (typeof afterLoadRef.current === 'function') afterLoadRef.current(data.book)
      })
      .catch((error) => { if (!cancelled) setState({ status: 'error', book: null, token: '', error: error.message, saveError: '', recovered: false }) })
    return () => { cancelled = true }
  }, [library, bookFolder, api, t])

  /**
   * Write anything owed to disk right now, and let the caller wait for it.
   *
   * The promise has to travel: the board's apply route (and the cast apply) awaits this flush so
   * the route reads what is on disk only after the debounce has landed — a fire-and-forget flush
   * made that await wait on nothing, and the apply raced the pending save.
   */
  const flushSave = () => queue.flush().catch(() => {})

  /**
   * Adopt a book a route wrote, together with the token of the bytes it wrote.
   *
   * Two shapes, because a route does not always own the whole book:
   *  - `book` replaces it (a save's normalized copy, a restored snapshot);
   *  - `merge(prevBook)` replaces only the part the route wrote (the board, the overview),
   *    so prose typed while the request was in flight is not overwritten by the older copy
   *    the route read.
   *
   * The token moves in the same call: a book adopted without its token makes the next save
   * look stale, which is the bug this function exists to remove.
   */
  const adoptWritten = ({ book, merge, token, savedAt } = {}) => {
    bookVersionRef.current += 1
    externalWriteRef.current += 1
    if (typeof token === 'string' && token !== '') tokenRef.current = token
    setState((prev) => {
      const next = typeof merge === 'function' ? merge(prev.book) : (book ?? prev.book)
      if (next === undefined || next === null) return prev
      // A save answers with the book it normalized, which does not include the side files
      // (the 流派 library). Keep those across a save of the SAME book; a different book must
      // not inherit the previous one's writing styles.
      const withExtras = withSideFields(next, prev.book)
      return {
        ...prev,
        book: withExtras,
        token: typeof token === 'string' && token !== '' ? token : prev.token,
        saveError: '',
      }
    })
    // The queue only reports this when it has nothing newer waiting, so a pending edit is not
    // marked saved by a route that wrote an older version of the file.
    queue.markSaved(Number.isFinite(savedAt) ? savedAt : Date.now())
  }

  /** Save on command, with feedback: a shortcut that produces no visible change reads as broken. */
  const saveNow = () => {
    queue.saveNow(state.book).then(() => {}, () => {})
  }

  React.useEffect(() => {
    // A closing window is the one moment the debounce would swallow the last sentence.
    // `window` is absent under the Node render harness, so this degrades to a no-op.
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return undefined
    const onHide = () => { queue.flush().catch(() => {}) }
    window.addEventListener('pagehide', onHide)
    return () => window.removeEventListener('pagehide', onHide)
  }, [queue])

  /**
   * The screen updates immediately; the disk write is debounced and serialised.
   *
   * `immediate` is for structural edits — creating, renaming or deleting a node — which the
   * writer expects to have happened at once. Ordinary typing keeps the interval.
   */
  const updateBook = (next, options = {}) => {
    bookVersionRef.current += 1
    setState((prev) => ({ ...prev, book: next, saveError: '' }))
    if (options.immediate === true) queue.pushNow(next).catch(() => {})
    else queue.push(next)
  }

  return {
    state, book: state.book,
    // `setBooks` is exposed because creating a book hands back a fresh listing: the route that
    // creates it already knows the new shelf, and asking for it again would be a second read of
    // something the caller was just told.
    books, setBooks, refreshShelf,
    queue, saveStatus,
    flushSave, adoptWritten, saveNow, updateBook,
  }
}

/**
 * Report a component's own failure to the panel's status bar.
 *
 * Each of these components keeps the error it produced (a create that failed, an audit that
 * could not run, a model file that would not parse) — the state belongs where the request was
 * made. What it no longer does is draw it: the one place a message is shown is the status bar's
 * bottom-left corner, which is on screen whichever page is open.
 *
 * The cleanup clears the message, so a failure does not outlive the page that produced it. It
 * is safe to run on every render: the setter receives a string and bails out when unchanged.
 */
export function useNotice(onNotice, text) {
  React.useEffect(() => {
    if (typeof onNotice !== 'function') return undefined
    onNotice(typeof text === 'string' ? text : '')
    return () => onNotice('')
  }, [onNotice, text])
}

