/**
 * The context page's data: one composition per model-calling scene, plus the writer's copies.
 *
 * The book is named by its ID. A page that quietly showed another book's context would be worse
 * than an error, so a missing ID is a failure.
 */
import { listBooks, readBook, writeContextOverrides } from '../store.js'
import { buildContext } from '../context.js'
import { addPromptDoc, listPrompts, resetPromptOverride, savePromptOverride } from '../prompts.js'
import { REPLACEABLE_SECTIONS, SCENES } from '../scenes.js'
import { json, fail } from './kernel.js'

async function folderOfBook(library, bookId) {
  const row = (await listBooks(library)).find((entry) => entry.id === bookId)
  return row?.folder
}

/** One scene's composition: its system prompt (when it has one) and the context parts it sends. */
function sceneComposition(scene, book, promptRows, chapterId, config) {
  const parts = []
  if (scene.recipe !== undefined) {
    const official = buildContext(scene.recipe, book, { chapterId, config })
    const assembled = buildContext(scene.recipe, book, {
      chapterId,
      config,
      overrides: book.contextOverrides?.[scene.id] ?? {},
    })
    for (const key of assembled.sections) {
      const override = book.contextOverrides?.[scene.id]?.[key] ?? ''
      const versions = (book.contextVersions?.[scene.id]?.[key]) ?? []
      parts.push({
        key,
        // `official` is what the system builds, `text` is what would actually be sent.
        official: official.parts[key] ?? '',
        text: assembled.parts[key] ?? '',
        override,
        replaceable: REPLACEABLE_SECTIONS.has(key),
        // A legacy override saved before versioning surfaces as the one entry, so the list
        // always contains what the model is actually sending.
        versions: override !== '' && versions.length === 0
          ? [{ id: '__applied__', text: override, at: null }]
          : versions,
      })
    }
  }
  const prompt = scene.promptKey === undefined ? undefined : promptRows.find((row) => row.key === scene.promptKey)
  return {
    id: scene.id,
    promptKey: scene.promptKey ?? '',
    system: prompt === undefined ? null : { text: prompt.official, override: prompt.override },
    parts,
  }
}

export function registerContextRoutes({ route, payload, bookPayload, config }) {
  route('/api/story.context', async (request) => {
    const { library, bookId, chapterId } = await bookPayload(request)
    if (typeof bookId !== 'string' || bookId === '') return fail('context needs the book id')
    const folder = await folderOfBook(library, bookId)
    if (folder === undefined) return fail('找不到这本书：书 id 不在当前书库里。')
    const { book } = await readBook(library, folder)
    const promptRows = await listPrompts(config)
    return json({
      ok: true,
      bookId: book.id,
      bookFolder: folder,
      scenes: SCENES.map((scene) => sceneComposition(scene, book, promptRows, chapterId, config)),
      prompts: promptRows,
    })
  })

  /** Keep one scene part's copy. `part` must be a book-scope section the scene actually sends. */
  route('/api/story.context.save', async (request) => {
    const { library, bookId, scene, part, text } = await bookPayload(request)
    if (typeof bookId !== 'string' || bookId === '') return fail('context.save needs the book id')
    if (!SCENES.some((row) => row.id === scene)) return fail('未知的场景。')
    if (!REPLACEABLE_SECTIONS.has(part)) return fail('这一部分不能替换。')
    const folder = await folderOfBook(library, bookId)
    if (folder === undefined) return fail('找不到这本书：书 id 不在当前书库里。')
    const { book } = await readBook(library, folder)
    const all = { ...(book.contextOverrides ?? {}) }
    const forScene = { ...(all[scene] ?? {}) }
    const value = String(text ?? '')
    if (value.trim() === '') delete forScene[part]
    else forScene[part] = value
    if (Object.keys(forScene).length === 0) delete all[scene]
    else all[scene] = forScene
    // Replacing keeps the history untouched: the versions are documents, the override is a
    // pointer at one of them (or nothing = the official text).
    const saved = await writeContextOverrides(library, all, folder, book.contextVersions ?? {})
    return json({ ok: true, overrides: saved.overrides, versions: saved.versions })
  })

  /** Add one copy document without touching what the model sends. */
  route('/api/story.context.version.add', async (request) => {
    const { library, bookId, scene, part, text } = await bookPayload(request)
    if (typeof bookId !== 'string' || bookId === '') return fail('context.version.add needs the book id')
    if (!SCENES.some((row) => row.id === scene)) return fail('未知的场景。')
    if (!REPLACEABLE_SECTIONS.has(part)) return fail('这一部分不能替换。')
    const value = String(text ?? '')
    if (value.trim() === '') return fail('context.version.add needs text')
    const folder = await folderOfBook(library, bookId)
    if (folder === undefined) return fail('找不到这本书：书 id 不在当前书库里。')
    const { book } = await readBook(library, folder)
    const savedVersions = { ...(book.contextVersions ?? {}) }
    const forSceneVersions = { ...(savedVersions[scene] ?? {}) }
    const list = [...(forSceneVersions[part] ?? []), { id: `v${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, text: value, at: Date.now() }]
    forSceneVersions[part] = list.slice(-50)
    savedVersions[scene] = forSceneVersions
    const saved = await writeContextOverrides(library, book.contextOverrides ?? {}, folder, savedVersions)
    return json({ ok: true, versions: saved.versions })
  })

  /** Drop one scene part's copy. */
  route('/api/story.context.reset', async (request) => {
    const { library, bookId, scene, part } = await bookPayload(request)
    if (typeof bookId !== 'string' || bookId === '') return fail('context.reset needs the book id')
    if (!SCENES.some((row) => row.id === scene)) return fail('未知的场景。')
    const folder = await folderOfBook(library, bookId)
    if (folder === undefined) return fail('找不到这本书：书 id 不在当前书库里。')
    const { book } = await readBook(library, folder)
    const all = { ...(book.contextOverrides ?? {}) }
    if (all[scene] !== undefined) {
      const forScene = { ...all[scene] }
      delete forScene[part]
      if (Object.keys(forScene).length === 0) delete all[scene]
      else all[scene] = forScene
    }
    // Reverting keeps the history: the versions are a log, the override is what the model sends.
    const saved = await writeContextOverrides(library, all, folder, book.contextVersions ?? {})
    return json({ ok: true, overrides: saved.overrides, versions: saved.versions })
  })

  /** Drop one history entry. The override the model sends is untouched — the list is a log. */
  route('/api/story.context.version.delete', async (request) => {
    const { library, bookId, scene, part, id } = await bookPayload(request)
    if (typeof bookId !== 'string' || bookId === '') return fail('context.version.delete needs the book id')
    if (!SCENES.some((row) => row.id === scene)) return fail('未知的场景。')
    if (typeof id !== 'string' || id === '') return fail('context.version.delete needs the version id')
    const folder = await folderOfBook(library, bookId)
    if (folder === undefined) return fail('找不到这本书：书 id 不在当前书库里。')
    const { book } = await readBook(library, folder)
    const allVersions = { ...(book.contextVersions ?? {}) }
    const forScene = { ...(allVersions[scene] ?? {}) }
    const kept = (forScene[part] ?? []).filter((row) => row.id !== id)
    if (kept.length === 0) delete forScene[part]
    else forScene[part] = kept
    if (Object.keys(forScene).length === 0) delete allVersions[scene]
    else allVersions[scene] = forScene
    const saved = await writeContextOverrides(library, book.contextOverrides ?? {}, folder, allVersions)
    return json({ ok: true, versions: saved.versions })
  })

  /** The system prompt copies stay global: they are model behaviour, not one book's material. */
  route('/api/story.context.prompt.save', async (request) => {
    const body = await payload(request)
    const key = typeof body.key === 'string' ? body.key : ''
    if (key === '') return fail('prompt.save needs a key')
    try {
      return json({ ok: true, prompts: await savePromptOverride(key, body.text, config) })
    } catch (error) {
      return fail(error?.message ?? error)
    }
  })

  /** Add one copy document without touching the applied override. */
  route('/api/story.context.prompt.doc.add', async (request) => {
    const body = await payload(request)
    const key = typeof body.key === 'string' ? body.key : ''
    if (key === '') return fail('prompt.doc.add needs a key')
    try {
      return json({ ok: true, prompts: await addPromptDoc(key, body.text, config) })
    } catch (error) {
      return fail(error?.message ?? error)
    }
  })

  route('/api/story.context.prompt.reset', async (request) => {
    const body = await payload(request)
    const key = typeof body.key === 'string' ? body.key : ''
    if (key === '') return fail('prompt.reset needs a key')
    try {
      return json({ ok: true, prompts: await resetPromptOverride(key, config) })
    } catch (error) {
      return fail(error?.message ?? error)
    }
  })
}
