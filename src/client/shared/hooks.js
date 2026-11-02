/**
 * The hooks that own a whole job rather than a widget.
 *
 * `useBookData` is the manuscript lifecycle — which book is on screen and what saving it means.
 * `useDockState` is the panel-wide dock store, shared by every window so a rebuild does not lose
 * an open suggestion. `usePersisted` and `useClosingAnimation` are the two behaviours every
 * overlay needs: remembering a preference, and rendering what was open while it slides out.
 *
 * These take `api` as an argument rather than importing it, which is what lets a test drive the
 * save path with a stub route service and no panel.
 */
import { React } from './react.js'
import { emptyBookState } from './logic.js'
import { sameBooks, createSaveQueue } from './save-queue.js'
import { readStored, writeStored } from './storage.js'

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
 * State that has to outlive the component that owns it.
 *
 * The panel is unmounted and rebuilt whenever the host swaps what the centre column shows —
 * switching to a conversation and back, or the window losing and regaining focus. Everything
 * the AI actions keep in `useState` died with it: the thinking row vanished, and an answer
 * that arrived while the writer was elsewhere was written into a component that no longer
 * existed, so it was simply lost.
 *
 * This is a tiny external store, keyed by book. A component seeds its state from it on mount
 * and mirrors every write back into it, so a rebuilt panel finds whatever the previous one
 * had — including a request still in flight. The request itself keeps running: its closure
 * holds the OLD setter, and that setter still writes to this store, which notifies whichever
 * component is mounted now.
 *
 * Deliberately not React state lifted to a parent: there is no parent to lift it to. The host
 * owns the mount, and the panel is a leaf in its tree.
 */
function createStateStore() {
  const values = new Map()
  const listeners = new Map()
  return {
    read(key, initial) { return values.has(key) ? values.get(key) : initial },
    write(key, value) {
      if (Object.is(values.get(key), value)) return
      values.set(key, value)
      for (const listener of [...(listeners.get(key) ?? [])]) listener(value)
    },
    subscribe(key, listener) {
      if (!listeners.has(key)) listeners.set(key, new Set())
      listeners.get(key).add(listener)
      return () => { listeners.get(key)?.delete(listener) }
    },
  }
}
export const DOCK_STORE = createStateStore()

/**
 * `useState` that survives the panel being unmounted, scoped to one book.
 *
 * Two things make this different from plain state, and both are load-bearing:
 *
 *  - The value is read from the store on EVERY render, not just the first. The scope is the
 *    open book's folder, and that is `undefined` until the writer picks a book — so the key
 *    changes once during the panel's life. A `useState` initialiser would have captured the
 *    empty-scope value and never looked again.
 *  - The updater form reads its base from the store. A request that finishes after the panel
 *    was rebuilt calls its old closure's setter, whose local `previous` belongs to a dead
 *    component; the store is the only truth both of them share.
 */
export function useDockState(scope, key, initial) {
  const storeKey = `${scope}::${key}`
  const [, forceRender] = React.useState(0)
  React.useEffect(() => DOCK_STORE.subscribe(storeKey, () => forceRender((n) => n + 1)), [storeKey])
  const value = DOCK_STORE.read(storeKey, initial)
  const set = (next) => {
    const current = DOCK_STORE.read(storeKey, initial)
    const resolved = typeof next === 'function' ? next(current) : next
    // `write` publishes to the subscribers, this component among them, so the re-render is
    // driven by the store and a stale setter still lands in the mounted panel.
    DOCK_STORE.write(storeKey, resolved)
  }
  return [value, set]
}

/**
 * A preference that survives a reload, stored per browser.
 *
 * Both of the panel's own preferences — how the page looks, and how often typing is written
 * to disk — are properties of the person at this machine, not of the manuscript, so they live
 * in localStorage rather than in book.json. Each one had written out the same three steps:
 * read with a try, normalise whatever came back, and write with another try (a private-mode
 * browser throws on both, and that must never break the panel).
 *
 * @param key      - the storage key
 * @param decode   - turns a stored string (or null, meaning nothing stored) into a usable value
 * @param encode   - turns a value into the string to store
 * @param forced   - when defined, this wins over storage and writes are skipped: the profile
 *                   has decided the value and the settings page only reports it
 */
export function usePersisted(key, decode, encode, forced) {
  const locked = forced !== undefined
  const [value, setValue] = React.useState(() => {
    if (locked) return forced
    try { return decode(readStored(key)) } catch { return decode(null) }
  })
  const update = (next) => {
    const resolved = typeof next === 'function' ? next(value) : next
    setValue(resolved)
    if (locked) return
    writeStored(key, encode(resolved))
  }
  return [value, update]
}

/**
 * Keep an overlay mounted long enough for its exit animation to be seen.
 *
 * `open` is what the panel's state says; the returned `mounted` is what the render uses and
 * `closing` is the class to put on the overlay's outermost node. Without this, closing was a
 * one-frame disappearance: the entrance was animated and the exit was not, so every overlay
 * left with a blink while it arrived with a slide.
 *
 * The duration is read from the stylesheet's own token, not repeated here: `--fang-duration-close`
 * is the single place the exit speed is decided, and a timer with its own number would drift
 * from the animation it is timing.
 */
export function useClosingAnimation(value, durationMs = 140) {
  // `value` is the thing being shown — a drawer's key, or null for none. A boolean would tell
  // the overlay that it is open but not what it is open ON, and a closing panel has to keep
  // rendering the page it was showing while the state has already moved on.
  const open = value !== null && value !== undefined && value !== false
  // A renderer with no animations has nothing to wait for. The Node render harness has no
  // `window` at all, and a headless mount that lingered on a timer would make "the drawer is
  // gone" tests depend on wall-clock time. The check is on the environment, not on a flag a
  // caller has to remember to pass.
  const animated = typeof window !== 'undefined'
  const [mounted, setMounted] = React.useState(open === true)
  const [closing, setClosing] = React.useState(false)
  React.useEffect(() => {
    if (open === true) {
      // Re-opening during an exit cancels it: the overlay is back, so it must not be removed
      // by the timer the previous close started.
      setClosing(false)
      setMounted(true)
      return undefined
    }
    if (!mounted) return undefined
    if (!animated) { setMounted(false); return undefined }
    setClosing(true)
    const timer = globalThis.setTimeout(() => { setClosing(false); setMounted(false) }, durationMs)
    return () => clearTimeout(timer)
  }, [open, mounted, durationMs, animated])
  /**
   * What the overlay should RENDER while it is on screen.
   *
   * The caller's `open` is not it: during the exit the state has already changed (the drawer
   * is null, or another drawer's key), and an overlay that renders from the live state shows
   * the NEW content inside the OLD frame — a settings page sliding out of the model panel, or
   * a model page appearing behind a closing settings drawer. So the last value the overlay was
   * actually open with is held here and used until it is unmounted.
   */
  const shown = React.useRef(open ? value : null)
  if (open) shown.current = value
  return { mounted, closing, shown: shown.current }
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

/**
 * Close a floating menu the way every menu in the panel closes: a press outside its box, or
 * Escape. The caller's own pick closes it before this hook is ever involved.
 *
 * The ref is the menu's own box — a press inside it belongs to the menu (it may be a button
 * that toggles it), one outside means "put it away". Escape is kept from reaching the host,
 * whose own shortcuts would otherwise fire behind the closing menu. The composer's model menu
 * deliberately does NOT use this hook: its Escape drills out of a nested pane first, which is
 * a behaviour of its own.
 */
export function useDismiss(rootRef, open, onClose) {
  React.useEffect(() => {
    if (!open) return undefined
    if (typeof document === 'undefined' || typeof document.addEventListener !== 'function') return undefined
    const onDown = (event) => {
      const root = rootRef?.current
      if (root !== null && root !== undefined && typeof root.contains === 'function' && root.contains(event.target)) return
      onClose()
    }
    const onKey = (event) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      onClose()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
    // onClose is deliberately out of the deps: it is a state setter at every call site, and
    // rebinding the listeners on each render would buy nothing.
  }, [rootRef, open])
}
