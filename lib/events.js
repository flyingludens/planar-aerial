/**
 * The panel's own event log: one JSON Lines file in the plugin's home directory.
 *
 * The writer's only window into a model failure used to be the error line in the composer, which
 * vanished with the next attempt — an UNKNOWN code with nothing around it cannot be diagnosed.
 * Every model call and every picture request appends one line here: what ran, on which provider,
 * how long it took, and how it ended. The log answers "does this happen on one action or on all
 * of them, on one model or on every model" — the two questions a bare UNKNOWN code cannot.
 *
 * The file is appended to and compacted on write, so it cannot grow without bound; compaction
 * rewrites through the atomic write, so a reader never sees a half-trimmed file. Appends are
 * atomic at the line level, so concurrent calls cannot lose each other's line.
 */
import { appendLine, readTextFile, writeFileAtomic } from './io.js'

/** How many lines the log keeps. A line is ~150 bytes, so the ceiling is ~60 KB. */
const KEEP = 400
/** Compact once this many bytes have been appended since the last compaction. */
const COMPACT_AT = 256 * 1024

export function createEventLog(file) {
  let appended = 0
  const compact = async () => {
    const text = await readTextFile(file)
    if (text === undefined) return
    const lines = text.split('\n').filter((line) => line.trim() !== '')
    if (lines.length > KEEP) await writeFileAtomic(file, lines.slice(-KEEP).join('\n') + '\n')
  }
  return {
    /** Append one event. A logging failure is swallowed: the log must never break the call it logs. */
    async record(event) {
      try {
        appended += await appendLine(file, JSON.stringify({ time: Date.now(), ...event }) + '\n')
      } catch { return }
      if (appended >= COMPACT_AT) {
        appended = 0
        try { await compact() } catch { /* the log must never break the call it logs */ }
      }
    },
    /** The most recent `limit` events, oldest first. A torn line is skipped, not fatal. */
    async read(limit = 200) {
      const text = await readTextFile(file)
      if (text === undefined) return []
      const lines = text.split('\n').filter((line) => line.trim() !== '')
      const out = []
      for (const line of lines.slice(-limit)) {
        try { out.push(JSON.parse(line)) } catch { /* skip */ }
      }
      return out
    },
  }
}
