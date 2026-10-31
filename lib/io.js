/**
 * The one module that touches the filesystem.
 *
 * Every other module in `lib/` names FILES and their MEANING (which file, what a corrupt file
 * means); this module owns the FILESYSTEM MECHANICS and their invariants, so each invariant is
 * stated once:
 *
 *  - `writeFileAtomic` — a reader sees the old bytes or the new bytes, never a partial write.
 *    The temp file lives in the target's own directory (same volume, so the rename cannot
 *    degrade into a copy) and is removed if anything fails.
 *  - `readTextFile` / `readBytesFile` / `statMtimeMs` / `listDirEntries` / `listFiles` — a
 *    MISSING thing is `undefined`, not an exception: "the file is not there" is a normal state
 *    every caller handles, while every other error is real and propagates.
 *  - `appendLine` — creates the parent directory, because a first append to a fresh home is the
 *    normal case, not a failure to recover from.
 *
 * The sync variants exist for exactly one caller: the prompt provider, whose callback cannot
 * await. Nothing else should use them.
 *
 * A hygiene test pins the boundary: no file outside this one may import `node:fs`.
 */
import { appendFile, mkdir, readFile, readdir, rename, stat, writeFile, rm } from 'node:fs/promises'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'

/** Create the directory (and its parents). Re-running on an existing one does nothing. */
export async function ensureDir(path) {
  await mkdir(path, { recursive: true })
}

/** The file's text, or `undefined` when it does not exist. Other errors propagate. */
export async function readTextFile(path) {
  try { return await readFile(path, 'utf8') } catch (error) {
    if (error?.code === 'ENOENT') return undefined
    throw error
  }
}

/** The file's bytes, or `undefined` when it does not exist. Other errors propagate. */
export async function readBytesFile(path) {
  try { return await readFile(path) } catch (error) {
    if (error?.code === 'ENOENT') return undefined
    throw error
  }
}

/** A plain write. The caller has ensured the directory; this does not. */
export async function writeTextFile(path, text) {
  await writeFile(path, text, 'utf8')
}

/**
 * Write through a temp file in the target's own directory, then rename: readers see old or new,
 * never partial. The temp file is removed if anything fails. `data` is text or bytes.
 */
export async function writeFileAtomic(target, data) {
  await ensureDir(resolve(target, '..'))
  const tmp = join(resolve(target, '..'), `.tmp-${randomUUID()}`)
  try {
    await writeFile(tmp, data)
    await rename(tmp, target)
  } catch (error) {
    await rm(tmp, { force: true })
    throw error
  }
}

/**
 * Append one line to a JSON Lines file, creating the parent directory first. Returns the
 * appended length in characters, so a caller can decide when its file has grown too big.
 */
export async function appendLine(file, line) {
  await ensureDir(dirname(file))
  await appendFile(file, line, 'utf8')
  return line.length
}

/**
 * The directory's entries, or `undefined` when the directory does not exist. An entry carries its
 * own name and type, so a caller that wants names reads `.name`, and a caller pruning a mixed
 * directory does not need a second stat.
 */
export async function listDir(path) {
  try { return await readdir(path, { withFileTypes: true }) } catch (error) {
    if (error?.code === 'ENOENT') return undefined
    throw error
  }
}

/** Rename — a move within a volume, which is also how an atomic write lands. */
export async function renamePath(from, to) {
  await rename(from, to)
}

/**
 * Remove a file or tree. `force` tolerates a missing target by default, because "already gone"
 * is the outcome removal wanted; `recursive` is opt-in, because deleting a tree by accident is
 * not recoverable and deserves to be written out at the call site.
 */
export async function removePath(path, { recursive = false, force = true } = {}) {
  await rm(path, { recursive, force })
}

/** Whether anything — file or directory — exists at the path. */
export async function pathExists(path) {
  try { await stat(path); return true } catch { return false }
}

/** When the file was last modified, as ms since the epoch, or `undefined` when it does not exist. */
export async function modifiedTime(path) {
  try { return (await stat(path)).mtimeMs } catch (error) {
    if (error?.code === 'ENOENT') return undefined
    throw error
  }
}

/* ---- the sync variants: for the prompt provider's callback, which cannot await ---- */

/** Sync `readTextFile`. */
export function readTextFileSync(path) {
  try { return readFileSync(path, 'utf8') } catch (error) {
    if (error?.code === 'ENOENT') return undefined
    throw error
  }
}

/** Sync `listDir`. */
export function listDirSync(path) {
  try { return readdirSync(path, { withFileTypes: true }) } catch (error) {
    if (error?.code === 'ENOENT') return undefined
    throw error
  }
}

/** Sync `modifiedTime`. */
export function modifiedTimeSync(path) {
  try { return statSync(path).mtimeMs } catch (error) {
    if (error?.code === 'ENOENT') return undefined
    throw error
  }
}
