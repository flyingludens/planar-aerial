import { isAbsolute, join, resolve, sep } from 'node:path'
import { randomUUID } from 'node:crypto'
import { ensureDir, listDir, modifiedTime, pathExists, readTextFile, removePath, renamePath, writeTextFile, writeFileAtomic } from './io.js'
import { createEmptyBook, normalizeBook } from './model.js'
import { hashText } from './hash.js'

const str = (v) => (typeof v === 'string' ? v : '')
const arr = (v) => (Array.isArray(v) ? v : [])

/**
 * Where books live.
 *
 * One directory, named in the plugin's own settings. It used to be `<workspace>/story`, derived
 * from the host's workspace list — which meant the panel had to guess which row was a real project
 * and which was a book folder, and that guess changed between renders. The library is one setting
 * now: the shelf is a directory listing of `library`, and a book is one folder inside it.
 *
 *   <library>/writing-styles.json          (shared by every book)
 *   <library>/<book-folder>/book.json
 *   <library>/<book-folder>/mosaic.json
 *   <library>/<book-folder>/notes.json
 *   <library>/<book-folder>/chapters/*.md
 *   <library>/<book-folder>/manuscript.md
 *   <library>/<book-folder>/snapshots/*.json
 *   <library>/<book-folder>/proposals/*.json
 *
 * The folder name is derived from the title so the writer can find a book in Finder without
 * opening the app; the id inside book.json is what the plugin addresses, so renaming the
 * folder by hand cannot corrupt the library (it simply becomes an unreadable entry).
 */
export function assertLibrary(library) {
  if (typeof library !== 'string' || library === '' || !isAbsolute(library)) {
    throw new Error('the book library must be an absolute path')
  }
}

/** The library directory itself. Aliased so the many call sites read as what they mean. */
export function libraryDir(library) {
  assertLibrary(library)
  return library
}

/** Folder names are filesystem-safe: CJK is kept, separators and reserved characters are not. */
export function bookFolderOf(title) {
  const base = String(title ?? '')
    .trim()
    // Strip anything a path cannot carry on macOS/Windows, plus control characters — the
    // \u0000-\u001f range is the point of the rule, not an accident of it.
    // eslint-disable-next-line no-control-regex
    .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/^\.+/, '')
    .slice(0, 60)
    .trim()
  return base === '' ? `book-${Date.now().toString(36)}` : base
}

export function bookDir(library, folder) {
  const root = libraryDir(library)
  if (typeof folder !== 'string' || folder === '' || folder.includes('/') || folder.includes('\\') || folder === '.' || folder === '..') {
    throw new Error('invalid book folder')
  }
  const dir = join(root, folder)
  assertInside(root, dir)
  return dir
}

const bookPath = (ws, folder) => join(bookDir(ws, folder), 'book.json')

/** Any derived path must stay inside the story directory. */
function assertInside(dir, target) {
  if (!resolve(target).startsWith(resolve(dir) + sep)) throw new Error('path escapes the story directory')
}

/**
 * The on-disk shape of a book.
 *
 * `chapters` is DERIVED from `nodes` (see flattenLeaves) and is deliberately not written: a
 * derived field stored beside its source is two copies that must be kept in step by hand, and
 * when they drift the editor renders one while the file holds the other — which is exactly how
 * keystrokes were being lost. Readers that need the flat list compute it.
 */
export function serializeBook(book) {
  // Accept either an already-normalized book or a raw one; normalizing twice is wasted work and
  // would quietly re-run id de-duplication.
  const normalized = Array.isArray(book.chapters) && Array.isArray(book.nodes) ? book : normalizeBook(book)
  // `chapters` is derived; `mosaic` and `notes` have their own files. All three are excluded
  // here so this file is only ever the manuscript — one fact, one place.
  const { chapters, mosaic, notes, ...rest } = normalized
  void chapters
  void mosaic
  void notes
  return JSON.stringify(rest, null, 2)
}

// Token for a manuscript that does not exist yet. A save carrying it is only accepted
// while the file is still absent, so a first save cannot clobber a book written elsewhere.
export const NO_BOOK_TOKEN = 'none'

/** Token of the bytes currently on disk, or NO_BOOK_TOKEN when there is no book yet. */
async function currentToken(library, folder) {
  const dir = bookDir(library, folder)
  const file = bookPath(library, folder)
  assertInside(dir, file)
  const text = await readTextFile(file)
  return text === undefined ? NO_BOOK_TOKEN : hashText(text)
}

/**
 * The board file, beside the manuscript.
 *
 * The board used to live inside book.json, which meant dragging one card rewrote the manuscript
 * file and every derived markdown file with it. They change for different reasons and at very
 * different rates — prose on keystrokes, the board when a card moves — so they are two files.
 * Readers still see ONE book object: assembling it is this module's job, not every caller's.
 */
const mosaicPath = (ws, folder) => join(bookDir(ws, folder), 'mosaic.json')

/**
 * Whole-book jottings, in their own file beside the manuscript.
 *
 * They used to live in book.json, which made every jotting part of the manuscript bytes: a save
 * token covered them, a snapshot carried them, and a prose rewrite touched them. They change on
 * their own clock, so they are their own file now. `book.json` stays the story; this is the margin.
 */
const notesPath = (ws, folder) => join(bookDir(ws, folder), 'notes.json')

/**
 * The writer's scene-by-scene context copies, beside the manuscript.
 *
 * Keyed twice — scene, then the part of that scene's composition — because the same section can
 * be replaced in one scene and left official in another. Only sections whose official text does
 * not depend on the current chapter or the request are acceptable here (the route decides), so a
 * copy can never pin chapter 1's cast onto chapter 5.
 */
const contextPath = (ws, folder) => join(bookDir(ws, folder), 'context.json')

function parseContextFile(text) {
  if (text === undefined) return { overrides: {}, versions: {} }
  try {
    const raw = JSON.parse(text)
    return { overrides: normalizeContextOverrides(raw?.overrides), versions: normalizeContextVersions(raw?.versions) }
  } catch { return { overrides: {}, versions: {} } }
}

function normalizeContextOverrides(raw) {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const out = {}
  for (const [scene, parts] of Object.entries(raw)) {
    if (parts === null || typeof parts !== 'object' || Array.isArray(parts)) continue
    const kept = {}
    for (const [part, value] of Object.entries(parts)) {
      if (typeof value === 'string' && value.trim() !== '') kept[part] = value
    }
    if (Object.keys(kept).length > 0) out[scene] = kept
  }
  return out
}

/**
 * The saved-version history, keyed like the overrides — scene, then part, oldest first. Each
 * entry is { id, text, at }: `id` is the stable handle the delete route takes, `at` the save
 * time. A v1 file has no versions field; an empty history is the normal state of a part that
 * has only ever been saved once through an older build.
 */
function normalizeContextVersions(raw) {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const out = {}
  for (const [scene, parts] of Object.entries(raw)) {
    if (parts === null || typeof parts !== 'object' || Array.isArray(parts)) continue
    const kept = {}
    for (const [part, list] of Object.entries(parts)) {
      if (!Array.isArray(list)) continue
      const rows = list
        .filter((row) => row !== null && typeof row === 'object'
          && typeof row.id === 'string' && row.id !== ''
          && typeof row.text === 'string' && Number.isFinite(row.at))
        .map((row) => ({ id: row.id, text: row.text, at: row.at }))
      if (rows.length > 0) kept[part] = rows
    }
    if (Object.keys(kept).length > 0) out[scene] = kept
  }
  return out
}

function parseNotes(text) {
  if (text === undefined) return undefined
  try {
    const raw = JSON.parse(text)
    const rows = Array.isArray(raw) ? raw : raw?.notes
    return normalizeBook({ notes: Array.isArray(rows) ? rows : [] }).notes
  } catch { return [] }
}

/**
 * The saved 流派 (style writing styles), shared by every book in the library.
 *
 * A writing style is a named prompt the writer can apply to generated prose. It is reference
 * material, not story data, so it sits at the library root instead of inside one book: a style
 * learned from one manuscript is useful in the next. Books written before this move still have
 * their own `writing-styles.json`; it is read as a fallback and moved on the next style save.
 */
const writingStylesPath = (ws) => join(ws, 'writing-styles.json')
const legacyWritingStylesPath = (ws, folder) => join(bookDir(ws, folder), 'writing-styles.json')

function parseWritingStyles(text) {
  const empty = { schemaVersion: 1, activeId: '', writingStyles: [] }
  if (text === undefined) return empty
  try {
    const raw = JSON.parse(text)
    if (raw === null || typeof raw !== 'object') return empty
    const str = (v) => (typeof v === 'string' ? v : '')
    const writingStyles = (Array.isArray(raw.writingStyles) ? raw.writingStyles : [])
      .filter((row) => row && typeof row === 'object' && str(row.id) !== '' && str(row.name).trim() !== '')
      .map((row) => ({
        id: str(row.id), name: str(row.name).trim(), prompt: str(row.prompt),
        source: str(row.source), at: Number.isFinite(row.at) ? row.at : 0,
      }))
    const activeId = writingStyles.some((row) => row.id === raw.activeId) ? str(raw.activeId) : ''
    return { schemaVersion: 1, activeId, writingStyles }
  } catch { return empty }
}

export async function readWritingStyles(library, folder) {
  const shared = await readTextFile(writingStylesPath(library))
  if (shared !== undefined) return parseWritingStyles(shared)
  // A book written before styles were shared still has its own copy. Read it, then move it to the
  // shared file so the next book sees the same library.
  const legacy = await readTextFile(legacyWritingStylesPath(library, folder))
  if (legacy === undefined) return parseWritingStyles(undefined)
  const parsed = parseWritingStyles(legacy)
  try { await writeFileAtomic(writingStylesPath(library), JSON.stringify(parsed, null, 2)) } catch { /* read-only library: keep using the legacy file */ }
  return parsed
}

export async function writeWritingStyles(library, folder, value) {
  await ensureDir(library)
  const normalized = parseWritingStyles(JSON.stringify(value))
  await writeFileAtomic(writingStylesPath(library), JSON.stringify(normalized, null, 2))
  return normalized
}

export async function readBook(library, folder) {
  const dir = bookDir(library, folder)
  const file = bookPath(library, folder)
  const mosaicFile = mosaicPath(library, folder)
  const notesFile = notesPath(library, folder)
  const contextFile = contextPath(library, folder)
  const legacyWritingStylesFile = legacyWritingStylesPath(library, folder)
  assertInside(dir, file)
  assertInside(dir, mosaicFile)
  assertInside(dir, notesFile)
  assertInside(dir, legacyWritingStylesFile)
  const text = await readTextFile(file)
  const boardText = await readTextFile(mosaicFile)
  const notesText = await readTextFile(notesFile)
  const contextText = await readTextFile(contextFile)
  const sharedStylesText = await readTextFile(writingStylesPath(library))
  const legacyStylesText = sharedStylesText === undefined
    ? await readTextFile(legacyWritingStylesFile) : undefined
  if (sharedStylesText === undefined && legacyStylesText !== undefined) {
    // Move a pre-shared style library to the library root on first read. The old per-book file is
    // left in place; it is no longer read once the shared file exists. A read-only library keeps
    // using the legacy file rather than failing to open.
    try { await writeFileAtomic(writingStylesPath(library), JSON.stringify(parseWritingStyles(legacyStylesText), null, 2)) } catch { /* keep legacy */ }
  }
  const withExtras = (book) => {
    const context = parseContextFile(contextText)
    book.contextOverrides = context.overrides
    book.contextVersions = context.versions
    const notes = parseNotes(notesText)
    if (notes !== undefined) book.notes = notes
    const saved = parseWritingStyles(sharedStylesText ?? legacyStylesText)
    book.writingStyles = saved.writingStyles
    book.activeWritingStyleId = saved.activeId
    book.activeWritingStyle = saved.writingStyles.find((row) => row.id === saved.activeId) ?? null
    return book
  }
  // A book written before notes were split still carries them in book.json. Move them out on
  // the first read so the file the writer opens matches the current layout.
  const migrateNotes = async (book) => {
    if (notesText !== undefined || book.notes.length === 0) return false
    try {
      await writeFileAtomic(notesFile, JSON.stringify({ schemaVersion: 1, notes: book.notes }, null, 2))
      return true
    } catch { return false }
  }
  // When the file was last written: the client's status bar adopts it on load, so a freshly
  // remounted panel shows 已保存 for a saved book instead of guessing.
  const savedAt = await modifiedTime(file)
  if (text === undefined) {
    // No manuscript yet. The BOARD may still exist (a book created from cards before any prose),
    // so it is read too rather than answered as empty.
    const book = createEmptyBook()
    if (boardText !== undefined) {
      try { book.mosaic = JSON.parse(boardText).mosaic ?? book.mosaic } catch { /* a broken board is empty, not fatal */ }
    }
    return { book: withExtras(book), existed: false, recovered: false, token: NO_BOOK_TOKEN }
  }
  // The token commits to the manuscript bytes only: the board has its own, and folding both into
  // one token would make a card drag look like a stale save to the prose path.
  const merge = (raw) => {
    const book = normalizeBook({ ...raw, mosaic: undefined })
    if (boardText !== undefined) {
      try { book.mosaic = normalizeBook({ mosaic: JSON.parse(boardText).mosaic }).mosaic } catch { /* keep empty */ }
    } else if (raw.mosaic !== undefined) {
      // A book written before the split still carries its board inline. Read it from there so an
      // existing file keeps working until its next save writes mosaic.json.
      book.mosaic = normalizeBook({ mosaic: raw.mosaic }).mosaic
    }
    return book
  }
  let parsed
  try { parsed = JSON.parse(text) }
  catch {
    await ensureDir(dir)
    await writeTextFile(join(dir, 'book.json.bak'), text)
    const empty = createEmptyBook()
    const repaired = JSON.stringify(empty, null, 2)
    await writeFileAtomic(file, repaired)
    return { book: withExtras(empty), existed: true, recovered: true, token: hashText(repaired), savedAt: await modifiedTime(file) }
  }
  const book = merge(parsed)
  if (typeof parsed.id === 'string' && parsed.id !== '') {
    let token = hashText(text)
    let writtenAt = savedAt ?? await modifiedTime(file)
    if (await migrateNotes(book)) {
      const rewritten = serializeBook(book)
      await writeFileAtomic(file, rewritten)
      token = hashText(rewritten)
      writtenAt = Date.now()
    }
    return { book: withExtras(book), existed: true, recovered: false, token, savedAt: writtenAt }
  }
  // A book written before ids existed gets one written down HERE, on the first read.
  //
  // Minting it per read would be worse than no id at all: the panel remembers a book by it, so a
  // fresh value on every load would never match twice and the feature would silently do nothing.
  // The write is the migration, and it happens once — the next read finds the id already there.
  // The returned token describes the bytes this call actually produced, so the caller's next save
  // is compared against the file it is really on.
  //
  // A failure to write is not a failure to READ: a library on a read-only volume still opens, it
  // just keeps minting an id per load, which is exactly what it did before this existed.
  await migrateNotes(book)
  const stamped = serializeBook(book)
  try {
    await writeFileAtomic(file, stamped)
    return { book: withExtras(book), existed: true, recovered: false, token: hashText(stamped), savedAt: await modifiedTime(file) }
  } catch {
    return { book: withExtras(book), existed: true, recovered: false, token: hashText(text), savedAt: savedAt ?? await modifiedTime(file) }
  }
}

/**
 * The merged manuscript: book title as `#`, then one heading per node, sized by depth so volume
 * -> chapter -> section reads as a real outline. Every leaf's text appears; the mirror is
 * derived output, never parsed back.
 */
export function renderMarkdown(book) {
  const lines = []
  if (book.title) lines.push(`# ${book.title}`, '')
  const walk = (nodes, depth) => {
    for (const node of nodes ?? []) {
      // Depth 0 is the volume; cap the heading level so a deep tree never outruns `######`.
      const hashes = '#'.repeat(Math.min(2 + depth, 6))
      const title = node.title || (node.children.length > 0 ? '未命名' : '未命名章节')
      lines.push(`${hashes} ${title}`, '')
      if (node.text) lines.push(node.text, '')
      if (node.children.length > 0) walk(node.children, depth + 1)
    }
  }
  // Accept a raw book too: callers sometimes pass one straight from createEmptyBook before it
  // has been normalized, and normalizing here costs nothing while avoiding a silent empty export.
  walk(normalizeBook(book).nodes, 0)
  return lines.join('\n')
}

const mdName = (chapter, index) => {
  const safe = (chapter.title || 'chapter').replace(/[\\/:*?"<>|\s]+/g, '-').slice(0, 40)
  return `${String(index + 1).padStart(3, '0')}-${safe || 'chapter'}.md`
}

/**
 * Write the board on its own.
 *
 * A card drag, a new card, an accepted relation — none of these change a word of prose, and going
 * through `writeBook` for them rewrote book.json plus one markdown file per chapter plus the merged
 * manuscript. This writes one small file.
 */
export async function writeMosaic(library, mosaic, folder) {
  const dir = bookDir(library, folder)
  await ensureDir(dir)
  const target = mosaicPath(library, folder)
  assertInside(dir, target)
  const text = JSON.stringify({ schemaVersion: 4, mosaic: normalizeBook({ mosaic }).mosaic }, null, 2)
  await writeFileAtomic(target, text)
  return { token: hashText(text), path: target }
}

/** Write the context copies and their saved-version history. One small file, changed only when a
 * copy is saved, reverted or a history entry is dropped. Both halves are always written together:
 * they are one file, and a versions write that lost the overrides would silently empty the copy
 * the model actually sends. */
export async function writeContextOverrides(library, overrides, folder, versions = {}) {
  const dir = bookDir(library, folder)
  await ensureDir(dir)
  const target = contextPath(library, folder)
  assertInside(dir, target)
  const clean = parseContextFile(JSON.stringify({ overrides, versions }))
  await writeFileAtomic(target, JSON.stringify({ schemaVersion: 2, overrides: clean.overrides, versions: clean.versions }, null, 2))
  return clean
}

/** Whether two boards say the same thing, so a save can skip writing one that did not change. */
function sameMosaic(a, b) {
  return JSON.stringify(normalizeBook({ mosaic: a }).mosaic) === JSON.stringify(normalizeBook({ mosaic: b }).mosaic)
}

/**
 * Save a whole book. expectedToken is the token readBook returned with the state the caller
 * edited; when given, a changed file refuses the write instead of overwriting another
 * workspace's or another panel's work. Omitted by internal callers that just re-read the file.
 *
 * The prose and the board are written SEPARATELY, and each only when it actually changed. That is
 * the whole point of splitting them: dragging a card on a nine-chapter book used to rewrite eleven
 * files, and every one of those writes is a chance for a half-finished state on disk.
 */
export async function writeBook(library, book, expectedToken, folder) {
  const dir = bookDir(library, folder)
  const chapterDir = join(dir, 'chapters')
  await ensureDir(chapterDir)
  const normalized = normalizeBook(book)
  const file = bookPath(library, folder)
  assertInside(dir, file)
  if (expectedToken !== undefined && expectedToken !== null && expectedToken !== await currentToken(library, folder)) {
    throw new Error('stale book: the file changed since it was read')
  }
  // What is on disk now, to decide whether the prose half needs writing at all. A missing file
  // answers null, which never equals a serialized book, so a first save still writes.
  const existingRaw = await readTextFile(file)
  const existing = existingRaw === null ? null : (() => {
    try { return JSON.parse(existingRaw) } catch { return null }
  })()
  const text = serializeBook(normalized)
  const proseChanged = existing === null
    || JSON.stringify({ ...existing, mosaic: undefined }) !== JSON.stringify({ ...JSON.parse(text), mosaic: undefined })
  const boardChanged = !(existing !== null && existing.mosaic !== undefined && sameMosaic(existing.mosaic, normalized.mosaic))
  const notesFile = notesPath(library, folder)
  assertInside(dir, notesFile)
  const existingNotesText = await readTextFile(notesFile)
  const existingNotes = parseNotes(existingNotesText)
    ?? normalizeBook({ notes: Array.isArray(existing?.notes) ? existing.notes : [] }).notes
  if (!Array.isArray(book.notes)) normalized.notes = existingNotes
  const notesChanged = JSON.stringify(normalized.notes) !== JSON.stringify(existingNotes)
  // A legacy book carried its notes inside book.json. The first save after this split writes them
  // to notes.json even when the text itself did not change.
  const writeNotesFile = notesChanged
    || (existingNotesText === undefined && (normalized.notes.length > 0 || existingNotes.length > 0))
  // The first chapter's mirror path, which is what callers show as "the file this saved to".
  // An empty book has no first chapter, so this stays empty rather than naming a file that is
  // not there.
  let first = ''
  if (proseChanged) {
    await writeFileAtomic(file, text)
    // The Markdown mirror is derived output only; never parsed back.
    //
    // Written concurrently rather than one after another: every chapter is its own file, each goes
    // through `writeAtomic` (a distinct temp file, then a rename), and nothing reads another
    // chapter's output. Serialising them cost one round trip per chapter on every save — 80
    // chapters took 23ms instead of 10ms, and every autosave pays that. The prune below still has
    // to wait for all of them, or it would delete a file that is about to be written.
    const written = new Set()
    const pages = normalized.chapters.map((chapter, index) => {
      const name = mdName(chapter, index)
      const target = join(chapterDir, name)
      assertInside(dir, target)
      written.add(name)
      if (index === 0) first = target
      const body = [`## ${chapter.title || '未命名章节'}`, '', chapter.text ?? '', ''].join('\n')
      return writeFileAtomic(target, body)
    })
    await Promise.all(pages)
    // Prune markdown left behind by deleted or renamed chapters. Only regular
    // *.md entries directly under chapters/ are considered; writeFileAtomic never
    // creates non-.md files there, so anything else is not ours to remove.
    for (const entry of await listDir(chapterDir) ?? []) {
      if (!entry.isFile() || !entry.name.endsWith('.md') || written.has(entry.name)) continue
      const target = join(chapterDir, entry.name)
      assertInside(dir, target)
      await removePath(target)
    }
    // The merged manuscript: one file holding the whole book in reading order.
    const manuscriptPath = join(dir, 'manuscript.md')
    assertInside(dir, manuscriptPath)
    await writeFileAtomic(manuscriptPath, renderMarkdown(normalized))
  }
  // A book written before the split carries the board inline; moving it out is part of this save
  // rather than a separate migration step.
  if (boardChanged || (existing !== null && existing.mosaic !== undefined)) {
    await writeMosaic(library, normalized.mosaic, folder)
  }
  if (writeNotesFile) {
    await writeFileAtomic(notesFile, JSON.stringify({ schemaVersion: 1, notes: normalized.notes }, null, 2))
  }
  // Return the token of what was just written so the caller can keep saving without
  // re-reading; without this every save after the first looks stale to the next one.
  return {
    savedAt: Date.now(),
    mdPath: first,
    manuscriptPath: join(dir, 'manuscript.md'),
    // The token commits to the manuscript bytes, which is what a later prose save must match.
    token: proseChanged ? hashText(text) : hashText(existingRaw ?? text),
    // The normalized book that was written. Callers hand it back with the token so the panel
    // can adopt what is actually on disk: fields the normalizer repaired, dropped, or filled
    // in are otherwise invisible until the next read.
    book: normalized,
  }
}

export async function writeSnapshot(library, book, label, folder) {
  const dir = bookDir(library, folder)
  const snapDir = join(dir, 'snapshots')
  await ensureDir(snapDir)
  const at = Date.now()
  const id = new Date(at).toISOString().replace(/[:.]/g, '-')
  const target = join(snapDir, `${id}.json`)
  assertInside(dir, target)
  const normalized = normalizeBook(book)
  // Snapshot the whole tree, not just the leaves: a rollback must restore volume structure too.
  // A snapshot stores the tree only, for the same reason the book does.
  await writeFileAtomic(target, JSON.stringify({ id, at, label: label || '快照', nodes: normalized.nodes }, null, 2))
  return { id, path: target }
}

export async function readSnapshot(library, id, folder) {
  const dir = bookDir(library, folder)
  if (typeof id !== 'string' || !/^[0-9A-Za-z-]+$/.test(id)) throw new Error('invalid snapshot id')
  const target = join(dir, 'snapshots', `${id}.json`)
  assertInside(dir, target)
  try { return JSON.parse(await readTextFile(target)) }
  catch (error) { if (error?.code === 'ENOENT') return null; throw error }
}

/**
 * Every book folder under `<ws>/story`, newest first. A folder counts as a book only when it
 * holds a readable book.json; anything else (a stray directory, a half-written save) is skipped
 * rather than failing the whole listing.
 */
export async function listBooks(library) {
  const root = libraryDir(library)
  // No story directory yet: an empty library, not an error.
  const entries = await listDir(root) ?? []

  const books = []
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    // readBook answers an empty book for a missing file, so presence is checked here:
    // a directory without book.json is not a book, it is someone else's folder.
    const manifest = join(root, entry.name, 'book.json')
    if (!await pathExists(manifest)) continue
    try {
      const { book } = await readBook(library, entry.name)
      // "Written" now means the leaf has text: there are no per-paragraph statuses to count.
      const finals = book.chapters.filter((c) => (c.text ?? '') !== '').length
      const total = book.chapters.length
      let updatedAt = 0
      updatedAt = await modifiedTime(join(root, entry.name, 'book.json')) ?? 0
      books.push({
        // The book's own id, so a caller can remember it across a rename. `folder` stays because
        // every route addresses a book by the folder it sits in; the two answer different
        // questions and neither replaces the other.
        id: book.id,
        folder: entry.name,
        title: book.title || entry.name,
        absolutePath: join(root, entry.name),
        chapters: book.chapters.length,
        finals,
        total,
        updatedAt,
      })
    } catch {
      // Not a book folder. Leave it alone; the writer may have other things in story/.
    }
  }
  books.sort((a, b) => b.updatedAt - a.updatedAt)
  return books
}

/**
 * Every book in the library, newest first.
 *
 * This used to merge several workspaces' shelves, because a book's location was derived from the
 * host's workspace list and a writer's books could live under any of them. The library is one
 * directory named in the settings now, so there is one shelf — the plural name is kept because
 * every caller and test already says `listAllBooks`, and renaming it buys nothing.
 */
export async function listAllBooks(library) {
  const found = await listBooks(library)
  return [...found].sort((a, b) => b.updatedAt - a.updatedAt || a.absolutePath.localeCompare(b.absolutePath))
}

export async function createBook(library, title) {
  const root = libraryDir(library)
  const clean = String(title ?? '').trim()
  if (clean === '') throw new Error('a book needs a title')
  if (clean.length > 120) throw new Error('a book title may be at most 120 characters')
  await ensureDir(root)

  const base = bookFolderOf(clean)
  let folder = base
  for (let n = 2; n < 1000; n += 1) {
    // The name is taken when the folder exists; a free name breaks the search.
    if (!await pathExists(join(root, folder))) break
    folder = `${base} (${n})`
  }

  const book = createEmptyBook(clean)
  await writeBook(library, book, undefined, folder)
  // The absolute folder is what the caller turns into a dsh workspace, so sessions for this
  // book attach to the directory their tools will read.
  return { folder, title: clean, absolutePath: join(root, folder) }
}

/**
 * Delete one book.
 *
 * `removeFiles: false` deletes only the manuscript manifest, leaving the directory and everything
 * else in it (notes, exports, a stray draft) on disk — which is what "remove it from the shelf"
 * should mean when the writer did not ask to lose files.
 */
export async function deleteBook(library, folder, options = {}) {
  const removeFiles = options.removeFiles !== false
  const dir = bookDir(library, folder)
  if (removeFiles) { await removePath(dir, { recursive: true }); return }
  // "Remove the entry, keep my words": the manuscript and the board go, because with no book.json
  // the folder is no longer a book and the shelf would not list it either way. Proposals go with
  // them — a suggestion about a book that is no longer in the library is a row nobody can act on.
  await removePath(join(dir, 'book.json'))
  await removePath(join(dir, 'mosaic.json'))
  await removeProposalDir(library, folder)
  // The answer history goes with them: a reply about a book that is no longer in the library is
  // the same kind of orphan as a proposal nobody can act on.
  await removeAnswerDir(library, folder)
}

/**
 * Rename one book: the title inside book.json, and the folder to match.
 *
 * The folder is renamed too because the folder IS the book's address on disk and its Workspace
 * path; leaving it named after the old title makes the shelf and the sidebar disagree. A rename
 * that would collide with an existing folder keeps the new title and the old folder instead of
 * failing — a writer renaming a book should not have to resolve a filesystem conflict.
 */
export async function renameBook(library, folder, title) {
  const clean = String(title ?? '').trim()
  if (clean === '') throw new Error('a book needs a title')
  if (clean.length > 120) throw new Error('a book title may be at most 120 characters')
  const root = libraryDir(library)
  const dir = bookDir(library, folder)
  const { book, token } = await readBook(library, folder)
  const next = { ...book, title: clean }
  const wanted = bookFolderOf(clean)
  let target = wanted
  if (target !== folder) {
    // The target name is only used when it is free; taken, the book keeps its old folder.
    if (await pathExists(join(root, target))) target = folder
  }
  if (target !== folder) {
    const destination = join(root, target)
    assertInside(root, destination)
    try { await renamePath(dir, destination) } catch { target = folder }
  }
  await writeBook(library, next, token, target)
  return { folder: target, title: clean, absolutePath: join(root, target), renamedFolder: target !== folder }
}

/**
 * Proposals: the changes a model suggests, kept until the writer answers them.
 *
 * They used to exist only in the panel's memory, which meant closing the sheet, switching books or
 * restarting DSH threw away work the model had already done and the writer had possibly started
 * reading. Each proposal is one file under the book, so it survives all three, and a proposals page
 * can list what is waiting instead of showing only whatever arrived last.
 *
 * Status is a fact about the writer's answer, not about the proposal: `pending` is what the page
 * offers, and accepted/rejected are kept so the list can say what happened rather than silently
 * losing the row.
 */
const PROPOSAL_DIR = 'proposals'

/** Filesystem-safe id: the route generates uuids, but a hand-edited file must not escape the dir. */
function proposalPath(library, folder, id) {
  const dir = join(bookDir(library, folder), PROPOSAL_DIR)
  if (typeof id !== 'string' || !/^[0-9A-Za-z._-]+$/.test(id) || id === '.' || id === '..') {
    throw new Error('invalid proposal id')
  }
  const target = join(dir, `${id}.json`)
  assertInside(dir, target)
  return { dir, target }
}

export async function writeProposal(library, folder, proposal) {
  if (proposal === null || typeof proposal !== 'object' || typeof proposal.id !== 'string') {
    throw new Error('a proposal needs an id')
  }
  const { dir, target } = proposalPath(library, folder, proposal.id)
  await ensureDir(dir)
  const record = {
    id: proposal.id,
    // When it was proposed, so the list can order by arrival rather than by filename.
    at: Number.isFinite(proposal.at) ? proposal.at : Date.now(),
    // Which page asked for it: 'check' read a chapter, 'relate' read the cards, 'chat' came out of
    // a conversation. The page shows this because the three deserve different scrutiny.
    source: str(proposal.source) || 'check',
    sourceChapterId: proposal.sourceChapterId ?? null,
    status: ['pending', 'accepted', 'rejected'].includes(proposal.status) ? proposal.status : 'pending',
    evidence: arr(proposal.evidence).map(str).filter((s) => s !== ''),
    changes: arr(proposal.changes),
  }
  await writeFileAtomic(target, JSON.stringify(record, null, 2))
  return record
}

export async function readProposal(library, folder, id) {
  let file
  try { ({ target: file } = proposalPath(library, folder, id)) } catch { return null }
  try { return JSON.parse(await readTextFile(file)) }
  catch (error) { if (error?.code === 'ENOENT') return null; return null }
}

/** Every stored proposal, newest first. A malformed file is skipped, not fatal. */
export async function listProposals(library, folder) {
  const dir = join(bookDir(library, folder), PROPOSAL_DIR)
  const entries = await listDir(dir) ?? []
  const rows = []
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue
    try {
      const record = JSON.parse(await readTextFile(join(dir, entry.name)))
      if (record && typeof record.id === 'string') rows.push(record)
    } catch { /* a half-written or hand-broken file is not a proposal */ }
  }
  rows.sort((a, b) => (Number(b.at) || 0) - (Number(a.at) || 0))
  return rows
}

/** Mark one proposal answered. Returns the stored record, or null when it is not there. */
export async function setProposalStatus(library, folder, id, status) {
  const record = await readProposal(library, folder, id)
  if (record === null) return null
  return writeProposal(library, folder, { ...record, status })
}

export async function deleteProposal(library, folder, id) {
  let file
  try { ({ target: file } = proposalPath(library, folder, id)) } catch { return false }
  try { await removePath(file); return true } catch { return false }
}

/** Remove a proposal's whole folder, so deleting a book takes its proposals with it. */
export async function removeProposalDir(library, folder) {
  const dir = join(bookDir(library, folder), PROPOSAL_DIR)
  try { await removePath(dir, { recursive: true }) } catch { /* already gone */ }
}

/**
 * Answers the model gave, kept beside the book rather than in it.
 *
 * The panel used to hold these in memory only, so a reload dropped every one of them. They are
 * not manuscript — a reply is a remark about the text, and a writer keeps maybe one in ten — so
 * they do not belong in book.json, which is rewritten in full on every save. One file per answer
 * keeps a save cheap and a delete exact.
 *
 *   <library>/<book-folder>/answers/<id>.json
 *
 * The same one-file-per-record shape as proposals, deliberately: both are things the writer
 * accumulates and dismisses, and neither is part of the manuscript.
 */
const ANSWER_DIR = 'answers'

/** How many answers one book keeps. The oldest fall off, as the in-memory list did. */
export const ANSWER_LIMIT = 200

/** Filesystem-safe id: the route generates one, but a hand-edited file must not escape the dir. */
function answerPath(library, folder, id) {
  const dir = join(bookDir(library, folder), ANSWER_DIR)
  // The id becomes a filename, so the pattern is an allow-list and the two directory names are
  // refused by name. A leading dot is refused too: `.tmp-<uuid>` is what writeFileAtomic writes
  // beside its target, and an id that looked like one could be read as a leftover half-write.
  if (typeof id !== 'string' || !/^[0-9A-Za-z][0-9A-Za-z._-]*$/.test(id) || id === '.' || id === '..') {
    throw new Error('invalid answer id')
  }
  const target = join(dir, `${id}.json`)
  assertInside(dir, target)
  return { dir, target }
}

/** One answer, normalised to the shape the log renders. */
function answerRecord(entry) {
  // An id names the file, so it is generated here when the caller has none. Every writer of an
  // answer gets a stable, collision-free name without having to know how one is built; a caller
  // that supplies its own (a re-save of the same record) keeps it.
  const id = str(entry?.id) || randomUUID()
  return {
    id,
    at: Number.isFinite(entry.at) ? entry.at : Date.now(),
    // What the writer asked. Kept verbatim: it is the only thing that says what the reply is
    // about once the chapter has moved on.
    question: str(entry.question),
    reply: str(entry.reply),
    // Which chapter it was asked in, so an answer about a scene can be found from that scene.
    // null rather than '' — "no chapter" and "an empty chapter id" are different facts.
    chapterId: typeof entry.chapterId === 'string' && entry.chapterId !== '' ? entry.chapterId : null,
  }
}

/**
 * Store one answer. Returns the record as written.
 *
 * Nothing is pruned here: the caller decides when to trim, because a route that saves one answer
 * should not also have to know the limit.
 */
export async function writeAnswer(library, folder, entry) {
  const record = answerRecord(entry)
  const { dir, target } = answerPath(library, folder, record.id)
  await ensureDir(dir)
  await writeFileAtomic(target, JSON.stringify(record, null, 2))
  return record
}

/**
 * Every answer the book has, newest first.
 *
 * `limit` is applied after sorting, so the caller gets the newest N rather than the first N files
 * the directory happened to yield.
 */
export async function listAnswers(library, folder, limit) {
  const dir = join(bookDir(library, folder), ANSWER_DIR)
  const entries = await listDir(dir) ?? []
  const rows = []
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue
    try {
      const record = JSON.parse(await readTextFile(join(dir, entry.name)))
      // A half-written or hand-broken file is not an answer; it is skipped rather than thrown,
      // so one bad file cannot make the whole history unreadable.
      if (record && typeof record.id === 'string' && typeof record.reply === 'string') rows.push(record)
    } catch { /* unreadable entry */ }
  }
  rows.sort((a, b) => (Number(b.at) || 0) - (Number(a.at) || 0))
  return Number.isInteger(limit) && limit > 0 ? rows.slice(0, limit) : rows
}

/** Drop one answer. Returns whether a file was removed. */
export async function deleteAnswer(library, folder, id) {
  let file
  try { ({ target: file } = answerPath(library, folder, id)) } catch { return false }
  try { await removePath(file); return true } catch { return false }
}

/**
 * Keep only the newest `limit` answers.
 *
 * A writer who never opens the log would otherwise accumulate one file per question forever.
 * Returns how many were removed.
 */
export async function trimAnswers(library, folder, limit = ANSWER_LIMIT) {
  const rows = await listAnswers(library, folder)
  const doomed = rows.slice(Math.max(0, limit))
  let removed = 0
  for (const row of doomed) {
    if (await deleteAnswer(library, folder, row.id)) removed += 1
  }
  return removed
}

/** Remove a book's whole answer folder, so deleting a book takes its history with it. */
export async function removeAnswerDir(library, folder) {
  const dir = join(bookDir(library, folder), ANSWER_DIR)
  try { await removePath(dir, { recursive: true }) } catch { /* already gone */ }
}
