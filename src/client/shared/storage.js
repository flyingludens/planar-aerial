/**
 * The browser's small, permanent state: the key names.
 *
 * These values belong to the person at this machine, not to a manuscript: how wide the page is,
 * how often typing is written, which chords are bound, which book was open last. They used to be
 * spelled `dsh.storywriting.<name>` at each call site, which meant a rename was a search across
 * four files.
 *
 * Reading and writing them went through the helpers that used to sit below this table; those
 * moved into fang-style, and the call sites import readStored/writeStored from there. The keys
 * stay here because they are this plugin's own names — fang-style does not know them.
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
