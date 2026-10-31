/**
 * The browser's small, permanent state: the keys, and the one safe way to read or write them.
 *
 * These values belong to the person at this machine, not to a manuscript: how wide the page is,
 * how often typing is written, which chords are bound, which book was open last. They used to be
 * spelled `dsh.storywriting.<name>` at each call site, which meant a rename was a search across
 * four files and a private-mode browser could throw from a helper that forgot its try.
 *
 * `localStorage` is absent under the Node render harness and throws in a private-mode browser.
 * Both are ordinary conditions here, not failures: a missing value is a default, and a failed
 * write leaves the value in memory for this session.
 */
export const STORAGE_KEYS = {
  lastError: 'dsh.storywriting.lastError',
  lastBook: 'dsh.storywriting.lastBook',
  welcomeSeen: 'dsh.storywriting.welcomeSeen',
  mosaicOpen: 'dsh.storywriting.mosaicOpen',
  mosaicTab: 'dsh.storywriting.mosaicTab',
  chords: 'dsh.storywriting.chords',
  typography: 'dsh.storywriting.typography',
  autoSaveMs: 'dsh.storywriting.autoSaveMs',
}

/** Whether this environment has usable browser storage at all, as opposed to a missing value. */
export function storageAvailable() {
  try {
    return typeof window !== 'undefined' && window.localStorage !== undefined && window.localStorage !== null
  } catch { return false }
}

/** The stored string, or null when there is none or storage cannot be reached. */
export function readStored(key) {
  try {
    if (typeof window === 'undefined' || window.localStorage === undefined) return null
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

/** Store a string. A failure is swallowed: private mode must not break the panel. */
export function writeStored(key, value) {
  try {
    if (typeof window === 'undefined' || window.localStorage === undefined) return false
    window.localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}
