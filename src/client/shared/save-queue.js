/**
 * When typing reaches the disk, and how a burst of keystrokes becomes one write.
 *
 * One topic: the save queue, the interval it rides, and the presets the settings page offers.
 * They belong together because the interval is not a free choice — it is the one number that
 * decides how much work a crash can cost, and the queue is what makes that number safe.
 *
 * `sameBooks` lives here too: the queue compares the book it was handed against the one it last
 * wrote, and that comparison is the only reason a save with no change is skipped.
 */
/**
 * How often a burst of typing reaches the disk, in ms.
 *
 * Five minutes by default. The old three seconds wrote the whole book on almost every pause,
 * which on a long manuscript is a lot of disk churn for a writer who is reading rather than
 * editing. Nothing is at risk from the longer wait: Cmd+S writes at once, and so does anything
 * structural — creating, renaming or deleting a node, switching chapter, opening a drawer,
 * leaving the panel. Only ordinary typing rides the interval.
 */
export const AUTO_SAVE_DEFAULT = 5 * 60 * 1000
/**
 * The waits the settings page offers, in the order they are shown.
 *
 * Steps, not a number field: "how long is five minutes" is not a question a writer should have to
 * answer in milliseconds, and a slider invites values like 3:07. Every option says how much work
 * a crash could cost, which is the only thing the number means.
 */
export const AUTO_SAVE_PRESETS = [
  { value: 30 * 1000, key: 'autoSave.30s' },
  { value: 60 * 1000, key: 'autoSave.1m' },
  { value: 5 * 60 * 1000, key: 'autoSave.5m' },
  { value: 10 * 60 * 1000, key: 'autoSave.10m' },
]

/**
 * Clamp a stored auto-save interval; a corrupt or ABSENT entry falls back to the default.
 *
 * `null` and `''` are absence, not zero. `Number(null)` is 0, so a browser that had never stored
 * anything — the first run, or one whose storage was cleared — used to read the absence as "write
 * on every keystroke", the exact opposite of the five-minute default the settings page shows as
 * chosen. Zero is still meaningful when it is really stored, because the test harness passes it.
 */
export function normalizeAutoSave(raw) {
  if (raw === null || raw === undefined || raw === '') return AUTO_SAVE_DEFAULT
  const value = Number(raw)
  if (!Number.isFinite(value)) return AUTO_SAVE_DEFAULT
  return Math.max(0, Math.round(value))
}

export function sameBooks(left, right) {
  if (left.length !== right.length) return false
  return left.every((book, index) => book.folder === right[index].folder
  && book.workspace === right[index].workspace
  && book.updatedAt === right[index].updatedAt)
}

/**
 * A periodic, serialised write queue for the manuscript.
 *
 * The editor used to call `api.save` on every keystroke, with the token it had *rendered* with.
 * Two saves in flight therefore carried the same token, the second was answered `stale`, and the
 * catch branch replaced the in-memory book with what was on disk — the writer watched their last
 * letters vanish. Saving is also expensive: `writeBook` rewrites book.json, every chapter .md, the
 * merged manuscript and then prunes the chapter directory.
 *
 * So writes happen on an INTERVAL while there is something to write, and serialised (only one
 * request is in flight; edits arriving during it collapse into a single follow-up). The token is
 * read when the request is BUILT, never captured at render time, which is what keeps a burst of
 * saves from colliding with itself.
 *
 * An interval rather than a pause-detector: a writer who never stops typing would otherwise never
 * reach the pause, and a long session would sit entirely in memory. The clock starts at the first
 * unsaved edit and is NOT restarted by later ones, so continuous typing still writes every
 * `interval` ms. `flush` is for the moments the interval would lose work: Cmd+S, leaving the
 * chapter, the editor losing focus.
 *
 * `send` answers `{ token, savedAt }`.
 *
 * @param send  - `(book, token) => Promise<{ token, savedAt }>`
 * @param getToken - reads the current token; a function because it changes after every save
 * @param options.interval - ms between automatic writes while there is something to write
 * @param options.memoryKey - which book's status this queue carries; keyed into a module-level
 *   map so the status survives the queue being torn down with its panel
 */
const stateMemory = new Map()

export function createSaveQueue(send, getToken, options = {}) {
  /**
   * How long the queue waits before writing, in ms.
   *
   * Mutable rather than closed over: the writer can change it from the settings page, and a
   * timer armed under the old value has to be re-armed rather than left to fire on a schedule
   * nobody chose any more. See `setIntervalMs`.
   */
  let interval = options.interval ?? AUTO_SAVE_DEFAULT
  // The last status of THIS book, remembered across panel rebuilds. The queue object is torn
  // down with the panel that created it — and a torn-down queue took its status with it, which
  // is how a remount showed 未保存 for a file that is demonstrably on disk. Restoring from the
  // memory makes the remount honest: the bar shows the last save this session actually made.
  const memoryKey = options.memoryKey
  const state = memoryKey !== undefined && stateMemory.has(memoryKey)
    ? { ...stateMemory.get(memoryKey) }
    : { status: 'idle', savedAt: 0, error: '' }
  const now = options.now ?? (() => Date.now())
  // Named through `globalThis` so this reads as a host timer rather than component state.
  const timers = globalThis
  const schedule = options.setTimer ?? ((fn, ms) => timers.setTimeout(fn, ms))
  const cancel = options.clearTimer ?? ((id) => timers.clearTimeout(id))
  /** The newest book the writer has produced and that is not on disk yet. */
  let pending = null
  let timer = null
  let disposed = false
  const listeners = new Set()

  const publish = () => {
    if (memoryKey !== undefined) stateMemory.set(memoryKey, { ...state })
    for (const listener of listeners) listener({ ...state })
  }
  /**
   * Only announce a real change. `push` runs on every keystroke, so an unconditional publish
   * would hand the panel a fresh object per character and re-render the whole desk for nothing.
   */
  const move = (status, error = '') => {
    if (state.status === status && state.error === error) return
    state.status = status
    state.error = error
    publish()
  }

  /** The in-flight write, so a caller that must know it landed can await the same one. */
  let running = null

  /**
   * Write `pending` now. Every caller shares one promise: a second request would carry the same
   * token as the first and be refused as stale, which is exactly the collision this queue exists
   * to prevent. Whatever arrives while a write is in flight becomes its next iteration, so a
   * burst of edits costs two writes rather than one per keystroke.
   */
  const run = () => {
    if (running !== null || disposed || pending === null) return running
    running = (async () => {
      move('saving')
      try {
        while (pending !== null && !disposed) {
          const book = pending
          pending = null
          try {
            const answer = await send(book, getToken())
            if (disposed) return
            state.savedAt = answer?.savedAt ?? now()
            // Nothing typed during the request: this is the last thing to write.
            if (pending === null) move('saved')
          } catch (error) {
            if (disposed) return
            // Leave nothing pending: the panel reports the failure, and retrying the same stale
            // book in a loop would keep failing. The next edit starts a fresh attempt.
            pending = null
            move('error', error?.message ?? String(error))
          }
        }
      } finally {
        running = null
      }
    })()
    return running
  }

  /**
   * Start the clock for the next automatic write, unless it is already running.
   *
   * Not reset on every edit, which is the whole difference from a debounce: the timer is armed
   * once and re-armed only after it fires and finds more to write.
   */
  const arm = () => {
    if (disposed || timer !== null || pending === null) return
    timer = schedule(() => {
      timer = null
      const done = run()
      // Whether the write succeeded or failed, an edit that arrived while it ran is still owed.
      const again = () => { if (!disposed && pending !== null) arm() }
      if (done === undefined) again()
      else Promise.resolve(done).then(again, again)
    }, interval)
  }

  return {
    /** Queue a book. The interval is absolute: later edits do not push the next write back. */
    push(book) {
      if (disposed) return
      pending = book
      move('pending')
      // A zero interval means "write every edit": there is nothing to wait for.
      if (interval <= 0) { if (timer !== null) cancel(timer); timer = null; run(); return }
      arm()
    },
    /**
     * Queue a book that must reach the disk now.
     *
     * Typing can wait for the interval; creating, renaming or deleting a node cannot. Those are
     * discrete actions the writer expects to have happened, and a delay would also let a
     * subsequent action be built on a tree that is not yet on disk.
     */
    pushNow(book) {
      if (disposed) return Promise.resolve()
      // The join below may return the promise of a write that started before this book existed.
      // Draining in a loop is what makes the returned promise actually cover it.
      pending = book
      if (timer !== null) { cancel(timer); timer = null }
      return (async () => {
        // A `push` may have scheduled an idle write; force it and keep draining until the book
        // handed over here has been through `send`.
        do { await run() } while (!disposed && (running !== null || pending !== null))
      })()
    },
    /** Write whatever is pending right now, e.g. before the editor goes away. */
    async flush() {
      if (timer !== null) { cancel(timer); timer = null }
      await run()
    },
    /**
     * Write on the writer's explicit command.
     *
     * `flush` is silent when nothing is pending, which is correct for a chapter switch but wrong
     * for a keystroke: pressing Cmd+S and seeing nothing at all is indistinguishable from a
     * shortcut that does not work. This always performs a write, so the status bar has something
     * to report — and asks for the last book even when the queue is empty.
     */
    async saveNow(book) {
      if (disposed) return undefined
      if (timer !== null) { cancel(timer); timer = null }
      // Nothing pending means nothing has changed since the last write. Writing the same bytes
      // again would be a no-op on disk but still a real confirmation for the writer, so it is
      // done deliberately rather than skipped.
      if (pending === null && book !== undefined && book !== null) pending = book
      if (pending === null) {
        // Nothing to write and nothing to write it from: report success on the last known state.
        move('saved')
        return state.savedAt
      }
      await run()
      return state.savedAt
    },
    /** Read the last status. */
    getState() { return { ...state } },
    /**
     * Adopt a save that happened outside this queue instance: the file's own modification time,
     * learned when the book is loaded. Only an IDLE queue takes it — a queue that is saving or
     * reporting an error is telling the truth about right now, and disk metadata must not
     * override it.
     */
    markSaved(at) {
      if (disposed || state.status !== 'idle' || !Number.isFinite(at) || at <= 0) return
      state.savedAt = at
      move('saved')
    },
    /** Subscribe to status changes; returns the unsubscribe function. */
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener) },
    /** Stop accepting work. A request already in flight is allowed to finish. */
    dispose() { disposed = true; if (timer !== null) { cancel(timer); timer = null } listeners.clear() },
    /**
     * Change how long the queue waits before writing.
     *
     * A timer already armed was armed for the OLD interval, and leaving it alone would mean the
     * new setting only took effect after one more write — the writer changes the number, watches
     * nothing happen, and concludes it did not work. So a pending write is re-armed under the new
     * value; the clock restarts, which is the honest reading of "from now on, wait this long".
     */
    setIntervalMs(ms) {
      const next = Number(ms)
      const value = Number.isFinite(next) && next >= 0 ? next : AUTO_SAVE_DEFAULT
      if (value === interval) return
      interval = value
      if (disposed) return
      if (timer !== null) { cancel(timer); timer = null }
      // Nothing owed means nothing to re-arm: the new value is used by the next edit.
      if (pending !== null) arm()
    },
    /** The interval in force, for the settings page to show what is actually happening. */
    getIntervalMs() { return interval },
  }
}
