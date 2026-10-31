import test from 'node:test'
import assert from 'node:assert/strict'
import { loadClientLogic } from './helpers/load-client.mjs'

/**
 * The save queue is what stands between a writer's keystrokes and a corrupt manuscript.
 *
 * Before it existed the editor called `api.save` on every `onChange` with the token it had
 * rendered with. Two writes in flight therefore carried the same token, the second came back
 * `stale`, and the recovery branch replaced the in-memory book with what was on disk — the writer
 * watched their last letters disappear. These cases pin the two properties that fixed it: writes
 * are coalesced, and only one is ever in flight.
 */

/** A controllable clock and a `send` that records what it was asked to write. */
function harness({ interval = 3000, fails = () => false } = {}) {
  const { createSaveQueue } = loadClientLogic()
  const calls = []
  const timers = []
  let token = 't0'
  let savedAtSeq = 1000
  const queue = createSaveQueue(
    async (book, sentToken) => {
      calls.push({ book, token: sentToken })
      // Every write answers a new token, exactly as `writeBook` does.
      if (fails(calls.length)) throw new Error('stale book: the file changed since it was read')
      token = `t${calls.length}`
      return { token, savedAt: (savedAtSeq += 10) }
    },
    () => token,
    {
      interval,
      // A manual clock: the test decides when idle time has passed, so nothing depends on
      // real timers and the assertion cannot race the machine's scheduler.
      setTimer: (fn, ms) => { const entry = { fn, ms, cancelled: false }; timers.push(entry); return entry },
      clearTimer: (entry) => { if (entry) entry.cancelled = true },
    },
  )
  /** Pretend the interval elapsed for every timer still armed. */
  const elapse = async () => {
    const armed = timers.filter((entry) => !entry.cancelled)
    for (const entry of armed) { entry.cancelled = true; entry.fn() }
    // Let the async write chain settle.
    for (let i = 0; i < 8; i += 1) await Promise.resolve()
  }
  return { queue, calls, elapse, timers, currentToken: () => token }
}

const book = (mark) => ({ title: '书', nodes: [], mark })

test('a burst of keystrokes becomes one write per interval', async () => {
  const h = harness()
  h.queue.push(book(1))
  h.queue.push(book(2))
  h.queue.push(book(3))
  assert.equal(h.calls.length, 0, 'nothing is written before the interval elapses')

  await h.elapse()
  assert.equal(h.calls.length, 1, 'one write covers the whole burst, not one per keystroke')
  assert.equal(h.calls[0].book.mark, 3, 'and it writes the NEWEST text, not the first of the burst')
})

test('continuous typing still writes on the interval', async () => {
  // A debounce restarts its clock on every keystroke, so a writer who never pauses would never
  // reach a save at all. The interval is absolute: it is armed once and fires regardless.
  const h = harness()
  h.queue.push(book(1))
  const armed = h.timers.length
  h.queue.push(book(2))
  h.queue.push(book(3))
  assert.equal(h.timers.length, armed, 'later edits do not arm another timer')

  await h.elapse()
  assert.equal(h.calls.length, 1, 'the interval fires even though the writer never stopped')
  assert.equal(h.calls[0].book.mark, 3)
})

test('the write carries the token that is current when it is sent', async () => {
  // The bug was capturing the token at render time: by the time the debounced write went out, the
  // token could already belong to a previous save.
  const h = harness()
  h.queue.push(book(1))
  h.currentToken() // t0 at push time
  await h.elapse()
  assert.equal(h.calls[0].token, 't0')

  h.queue.push(book(2))
  await h.elapse()
  assert.equal(h.calls[1].token, 't1', 'the second write uses the token the first one returned')
})

test('edits arriving mid-write collapse into a single follow-up write', async () => {
  const h = harness()
  h.queue.push(book(1))
  await h.elapse()
  // A write is running now (its promise is unresolved until the microtask queue drains), so
  // three more edits must merge instead of each starting a request.
  h.queue.push(book(2))
  h.queue.push(book(3))
  h.queue.push(book(4))
  await h.elapse()
  assert.deepEqual(h.calls.map((call) => call.book.mark), [1, 4],
    'two writes for four edits, and the second carries the last one')
})

test('a failure is reported once and leaves nothing pending to retry forever', async () => {
  const h = harness({ fails: () => true })
  const seen = []
  h.queue.subscribe((state) => seen.push(state.status))
  h.queue.push(book(1))
  await h.elapse()
  assert.equal(h.calls.length, 1, 'the failed write is not retried on its own')
  assert.equal(h.queue.getState().status, 'error')
  assert.ok(seen.includes('saving'), 'the panel saw it start, so it can say "saving" then "failed"')

  // Nothing is retried on its own: a second elapse with no new edit writes nothing.
  await h.elapse()
  assert.equal(h.calls.length, 1, 'a failed write is not retried behind the writer’s back')

  // The next edit is a fresh attempt rather than a stuck queue.
  h.queue.push(book(2))
  await h.elapse()
  assert.equal(h.calls.length, 2, 'and the next edit tries again')
})

test('flush writes immediately, for the moment the editor goes away', async () => {
  const h = harness()
  h.queue.push(book(1))
  assert.equal(h.calls.length, 0)
  await h.queue.flush()
  assert.equal(h.calls.length, 1, 'flush does not wait out the debounce')
  assert.equal(h.timers[0].cancelled, true, 'and the armed timer is cancelled, so it cannot write twice')
})

test('pushNow awaits the write it asked for', async () => {
  // Creating or deleting a node is a discrete action; the caller has to know it landed before
  // building the next state on top of it.
  const h = harness()
  await h.queue.pushNow(book(7))
  assert.equal(h.calls.length, 1)
  assert.equal(h.calls[0].book.mark, 7)
  assert.equal(h.queue.getState().status, 'saved')
})

test('pushNow during a write still covers its own book', async () => {
  const h = harness()
  // Start a write without waiting for it, then hand over a second book while it is in flight.
  const first = h.queue.pushNow(book(1))
  const second = h.queue.pushNow(book(2))
  await Promise.all([first, second])
  assert.deepEqual(h.calls.map((call) => call.book.mark), [1, 2],
    'the awaited promise covers both books, not only the one already in flight')
})

test('a zero interval writes every edit, which is what a test asks for', async () => {
  const h = harness({ interval: 0 })
  h.queue.push(book(1))
  await h.elapse()
  assert.equal(h.calls.length, 1)
  assert.equal(h.timers.length, 0, 'no timer is armed at all')
})

test('a disposed queue accepts nothing more', async () => {
  const h = harness()
  h.queue.dispose()
  h.queue.push(book(1))
  await h.elapse()
  assert.equal(h.calls.length, 0, 'an unmounted panel cannot write over a newer one')
})

test('status changes are published, and an unchanged status does not churn', async () => {
  const h = harness()
  const seen = []
  h.queue.subscribe((state) => seen.push(state.status))
  h.queue.push(book(1))
  h.queue.push(book(2))
  h.queue.push(book(3))
  // Three pushes, but the status only moved idle → pending once: publishing per keystroke would
  // hand the panel a fresh object per character and re-render the desk for nothing.
  assert.equal(seen.filter((status) => status === 'pending').length, 1)
})

test('saveNow writes on command even when nothing is pending', async () => {
  // Cmd+S produced no visible change because the queue was idle and `flush` is silent when it has
  // nothing to do. A shortcut with no visible result is indistinguishable from a broken shortcut.
  const h = harness()
  assert.equal(h.calls.length, 0, 'nothing written yet')
  await h.queue.saveNow(book(9))
  assert.equal(h.calls.length, 1, 'the command produced a write')
  assert.equal(h.calls[0].book.mark, 9, 'of the book it was given')
  assert.equal(h.queue.getState().status, 'saved')
  assert.ok(h.queue.getState().savedAt > 0, 'with a timestamp the status bar can print')
})

test('saveNow after a change writes the newest text, not the older copy', async () => {
  // A keystroke's book may already be queued; the command must not send the stale one it was
  // handed as an argument.
  const h = harness({ interval: 60000 })
  h.queue.push(book(1))
  await h.queue.saveNow(book(0))
  assert.equal(h.calls.length, 1)
  assert.equal(h.calls[0].book.mark, 1, 'the queued (newer) edit wins over the argument')
})

test('the default wait is five minutes, not three seconds', async () => {
  // Three seconds wrote the whole book on almost every pause, which on a long manuscript is a lot
  // of disk churn for a writer who is reading rather than editing. Nothing is at risk from the
  // longer wait: Cmd+S and every structural action write at once.
  const { createSaveQueue, AUTO_SAVE_DEFAULT } = loadClientLogic()
  assert.equal(AUTO_SAVE_DEFAULT, 5 * 60 * 1000, 'five minutes')

  const timers = []
  const queue = createSaveQueue(async () => ({ savedAt: 1 }), () => 't0', {
    // No interval passed: the queue's own default has to be the one the settings page shows.
    setTimer: (fn, ms) => { const entry = { fn, ms }; timers.push(entry); return entry },
    clearTimer: () => {},
  })
  queue.push(book(1))
  assert.equal(timers.length, 1, 'a write is armed')
  assert.equal(timers[0].ms, AUTO_SAVE_DEFAULT, 'and it waits the default')
})

test('changing the interval re-arms a write that is already waiting', async () => {
  // The timer was armed for the OLD interval. Leaving it alone meant the new setting only took
  // effect after one more write: the writer changes the number, watches nothing happen, and
  // concludes it did not work.
  const h = harness()
  h.queue.push(book(1))
  assert.equal(h.timers[0].ms, 3000, 'armed at the old interval')

  h.queue.setIntervalMs(60000)
  assert.equal(h.timers[0].cancelled, true, 'the old timer is cancelled')
  const live = h.timers.filter((entry) => !entry.cancelled)
  assert.equal(live.length, 1, 'exactly one timer is waiting')
  assert.equal(live[0].ms, 60000, 'and it waits the new value')

  await h.elapse()
  assert.equal(h.calls.length, 1, 'the write still happens, on the new schedule')
})

test('an interval change with nothing pending arms nothing', async () => {
  const h = harness()
  h.queue.setIntervalMs(60000)
  assert.equal(h.timers.length, 0, 'no timer is created for a write that is not owed')
  assert.equal(h.queue.getIntervalMs(), 60000, 'but the new value is in force')

  h.queue.push(book(1))
  assert.equal(h.timers.length, 1)
  assert.equal(h.timers[0].ms, 60000, 'the next edit uses the new interval')
})

test('a bad interval falls back to the default instead of disarming the queue', async () => {
  const h = harness()
  h.queue.setIntervalMs(Number.NaN)
  assert.equal(h.queue.getIntervalMs(), 5 * 60 * 1000, 'NaN is not a schedule')
  h.queue.setIntervalMs(-1)
  assert.equal(h.queue.getIntervalMs(), 5 * 60 * 1000, 'and neither is a negative wait')
})

test('an absent stored interval is five minutes, not "write every keystroke"', () => {
  // The settings page shows five minutes as the chosen value on a browser that has never stored
  // one. `localStorage.getItem` answers `null` there, and `Number(null)` is 0 — so the absence
  // used to normalise to a zero interval, which means "write on every edit". The panel was doing
  // the opposite of what its own settings page said.
  const { normalizeAutoSave, AUTO_SAVE_DEFAULT } = loadClientLogic()
  assert.equal(AUTO_SAVE_DEFAULT, 5 * 60 * 1000)
  assert.equal(normalizeAutoSave(null), AUTO_SAVE_DEFAULT, 'nothing stored means the default')
  assert.equal(normalizeAutoSave(undefined), AUTO_SAVE_DEFAULT)
  assert.equal(normalizeAutoSave(''), AUTO_SAVE_DEFAULT, 'an empty string is absence too')
  // Zero is still a real setting, because the harness uses it and a writer could ask for it.
  assert.equal(normalizeAutoSave(0), 0, 'a stored zero is kept: write every edit')
  assert.equal(normalizeAutoSave('0'), 0)
  // Anything unreadable falls back rather than breaking the schedule.
  assert.equal(normalizeAutoSave('soon'), AUTO_SAVE_DEFAULT)
  assert.equal(normalizeAutoSave(Number.NaN), AUTO_SAVE_DEFAULT)
  assert.equal(normalizeAutoSave(-5), 0, 'a negative wait clamps to zero, not to a negative timer')
  assert.equal(normalizeAutoSave('60000'), 60000, 'a stored number comes back as a number')
})
