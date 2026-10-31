/**
 * The manuscript itself: reading it, writing it, and the shelf it lives on.
 *
 * These are the routes that touch book.json. Everything they need to find a book comes from
 * `bookPayload`, which resolves the library from settings -- the client names a book and never
 * a path, so none of these handlers has to know where books live.
 */
import { randomUUID } from 'node:crypto'
import { basename, dirname, isAbsolute, join } from 'node:path'
import {
  ANSWER_LIMIT, createBook, deleteAnswer, deleteBook, listAllBooks, listAnswers, readBook,
  readSnapshot, renameBook, renderMarkdown, trimAnswers, writeAnswer, writeBook, writeSnapshot,
} from '../store.js'
import { listDir, pathExists } from '../io.js'
import { settingsPath, writeSettings } from '../settings.js'
import { createEmptyBook } from '../model.js'
import { normalizeBook } from '../model.js'
import { json, fail } from './kernel.js'

/**
 * @param {object} deps  the kernel: `route` and `bookPayload`
 */
export function registerBookRoutes({ route, bookPayload, record, config }) {
  // Every book operation that changes anything on disk is an event: the log is how "did my save
  // land" stops being a question the status bar answers alone. `record` comes from the event log
  // and never throws (see lib/events.js), so a logging failure cannot fail a save.
  route('/api/story.manuscript', async (request) => {
    const { library, bookFolder } = await bookPayload(request)
    const startedAt = Date.now()
    // Rendered on demand from book.json rather than read back from the .md mirror, so the
    // preview is always exactly what the current data says.
    const { book } = await readBook(library, bookFolder)
    const markdown = renderMarkdown(book)
    // Reading the merged manuscript is a real action the writer took; it belongs in the log next
    // to saves and model calls, even though it makes no model request.
    await record({ type: 'manuscript', folder: bookFolder, ok: true, ms: Date.now() - startedAt })
    return json({ ok: true, markdown })
  })

  // The shelf is the library directory. It used to be "every book reachable from any registered
  // workspace", which is why the listing took a list of roots — there is one shelf now.
  route('/api/story.books', async (request) => {
    const { library } = await bookPayload(request)
    return json({ ok: true, books: await listAllBooks(library), library })
  })

  /**
   * Open one directory the writer chose.
   *
   * A book directory is opened as that book; a directory of books becomes the shelf; an empty
   * directory becomes a new book whose title is its folder name. The selected location also
   * becomes the default library, so the shelf and the sidebar agree after the choice.
   */
  route('/api/story.openDirectory', async (request) => {
    const { path, settings } = await bookPayload(request)
    const target = String(path ?? '').trim()
    if (target === '' || !isAbsolute(target)) return fail('目录要写绝对路径。')
    if (!await pathExists(target)) return fail('目录不存在。')
    const file = settingsPath(config)
    const commit = async (library) => {
      await writeSettings(file, settings.roles, settings.image, library, settings.providers)
      return listAllBooks(library)
    }
    if (await pathExists(join(target, 'book.json'))) {
      const library = dirname(target)
      const folder = basename(target)
      const opened = await readBook(library, folder)
      return json({
        ok: true, kind: 'book', library, bookFolder: folder,
        book: opened.book, token: opened.token, savedAt: opened.savedAt,
        books: await commit(library),
      })
    }
    const existing = await listAllBooks(target)
    if (existing.length > 0) {
      return json({ ok: true, kind: 'library', library: target, books: await commit(target) })
    }
    const entries = await listDir(target) ?? []
    if (entries.length > 0) return fail('这个目录不是书库，也不是空目录。')
    const title = basename(target)
    if (title === '' || title === '/') return fail('不能把根目录当作一本书。')
    const book = createEmptyBook(title)
    await writeBook(dirname(target), book, undefined, title)
    const library = dirname(target)
    return json({
      ok: true, kind: 'book', library, bookFolder: title,
      book, token: undefined, books: await commit(library),
    })
  })

  route('/api/story.createBook', async (request) => {
    const { library, title } = await bookPayload(request)
    const created = await createBook(library, title)
    await record({ type: 'book.create', folder: created.folder, title: created.title })
    return json({ ok: true, ...created, books: await listAllBooks(library), library })
  })

  route('/api/story.deleteBook', async (request) => {
    const { library, bookFolder, removeFiles } = await bookPayload(request)
    await deleteBook(library, bookFolder, { removeFiles: removeFiles !== false })
    await record({ type: 'book.delete', folder: bookFolder })
    return json({ ok: true, books: await listAllBooks(library), library })
  })

  route('/api/story.renameBook', async (request) => {
    const { library, bookFolder, title } = await bookPayload(request)
    const renamed = await renameBook(library, bookFolder, title)
    await record({ type: 'book.rename', folder: renamed.folder, title })
    return json({ ok: true, ...renamed, books: await listAllBooks(library), library })
  })

  route('/api/story.load', async (request) => {
    const { library, bookFolder } = await bookPayload(request)
    const r = await readBook(library, bookFolder)
    return json({ ok: true, book: r.book, existed: r.existed, recovered: r.recovered, token: r.token, savedAt: r.savedAt })
  })

  route('/api/story.save', async (request) => {
    const { library, book, token, bookFolder } = await bookPayload(request)
    // A missing or non-object book would normalize to an empty draft and overwrite the
    // manuscript. Refuse it rather than silently destroying the user's work.
    // Refuse anything that would normalize to an empty draft: a book must carry its tree
    // (or the legacy flat chapters array) before it may replace what is on disk.
    if (book === null || typeof book !== 'object' || Array.isArray(book)
      || (!Array.isArray(book.nodes) && !Array.isArray(book.chapters))) {
      return fail('save requires a book object with a nodes array')
    }
    // token is the one the client read with; a mismatched file is refused rather than
    // overwriting an edit made by another panel or workspace.
    const startedAt = Date.now()
    const written = await writeBook(library, normalizeBook(book), token, bookFolder)
    await record({ type: 'save', folder: bookFolder, title: book.title, ok: true, ms: Date.now() - startedAt })
    return json({ ok: true, ...written })
  })

  route('/api/story.snapshot', async (request) => {
    const { library, bookFolder, label } = await bookPayload(request)
    const { book } = await readBook(library, bookFolder)
    const snapshot = await writeSnapshot(library, book, label, bookFolder)
    await record({ type: 'snapshot', folder: bookFolder, id: snapshot.id })
    return json({ ok: true, ...snapshot })
  })

  route('/api/story.restore', async (request) => {
    const { library, bookFolder, id } = await bookPayload(request)
    const snapshot = await readSnapshot(library, id, bookFolder)
    if (snapshot === null) return fail('snapshot not found')
    const { book } = await readBook(library, bookFolder)
    // Snapshot the current state first, so a rollback is itself undoable.
    await writeSnapshot(library, book, '回滚前自动备份', bookFolder)
    // Prefer the stored tree; fall back to wrapping the leaves for older snapshots.
    const next = normalizeBook({ ...book, nodes: snapshot.nodes, chapters: snapshot.chapters })
    const written = await writeBook(library, next, undefined, bookFolder)
    return json({ ok: true, book: written.book, token: written.token, savedAt: written.savedAt })
  })

  /**
   * The answers this book has, newest first.
   *
   * They live in their own folder beside the manuscript (see store.js), not in book.json: a save
   * rewrites that file whole, and carrying every reply through it would make each keystroke-sized
   * save move a growing amount of text the writer is not editing.
   */
  route('/api/story.answers', async (request) => {
    const { library, bookFolder, limit } = await bookPayload(request)
    return json({ ok: true, answers: await listAnswers(library, bookFolder, limit) })
  })

  /**
   * Keep one answer.
   *
   * The id is assigned here rather than by the client: it names a file, and two panels open on the
   * same book must not be able to pick the same name. An answer that the client does supply an id
   * for is still validated by `answerPath`, which refuses anything that could leave the folder.
   */
  route('/api/story.answer.save', async (request) => {
    const { library, bookFolder, answer } = await bookPayload(request)
    if (answer === null || typeof answer !== 'object') return fail('answer.save needs an answer')
    const saved = await writeAnswer(library, bookFolder, {
      ...answer,
      id: typeof answer.id === 'string' && answer.id !== '' ? answer.id : randomUUID(),
    })
    // Trimmed after the write, not before: the newest answer must survive even when the folder
    // is already at the limit, which pruning beforehand would have discarded.
    await trimAnswers(library, bookFolder, ANSWER_LIMIT)
    return json({ ok: true, answer: saved })
  })

  route('/api/story.answer.delete', async (request) => {
    const { library, bookFolder, id } = await bookPayload(request)
    if (typeof id !== 'string' || id === '') return fail('answer.delete needs an id')
    const removed = await deleteAnswer(library, bookFolder, id)
    return json({ ok: true, removed })
  })
}
