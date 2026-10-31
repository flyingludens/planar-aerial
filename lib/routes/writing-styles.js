/**
 * 流派: named style prompts the writer can apply to generated prose.
 *
 * They live in `<library>/writing-styles.json`, shared by every book, and are attached to the
 * book by `readBook`, so the context builder and every generation route can read the active one
 * without knowing about this HTTP layer. The name is "writing style", not "style": style already means
 * the stylesheet in this codebase.
 */
import { randomUUID } from 'node:crypto'
import { json, fail } from './kernel.js'
import { readWritingStyles, writeWritingStyles } from '../store.js'
import { WRITING_STYLE_SYSTEM, callModel, modelMaxTokens } from '../ai.js'

const str = (v) => (typeof v === 'string' ? v : '')

/**
 * @param {object} deps  `route`, `bookPayload`, `selectionFor`, `ctx`, `logModel`
 */
export function registerWritingStyleRoutes({ route, bookPayload, selectionFor, ctx, logModel }) {
  const logged = (action) => (event) => logModel?.({ ...event, action })

  route('/api/story.writingStyles', async (request) => {
    const { library, bookFolder } = await bookPayload(request)
    return json({ ok: true, ...await readWritingStyles(library, bookFolder) })
  })

  route('/api/story.writingStyle.save', async (request) => {
    const { library, bookFolder, id, name, prompt, source } = await bookPayload(request)
    const cleanName = str(name).trim()
    const cleanPrompt = str(prompt).trim()
    if (cleanName === '') return fail('流派需要一个名称。')
    if (cleanPrompt === '') return fail('流派需要一段风格描述。')
    const current = await readWritingStyles(library, bookFolder)
    const at = Date.now()
    const existing = typeof id === 'string' && id !== ''
      ? current.writingStyles.find((row) => row.id === id) : undefined
    const writingStyle = existing === undefined
      ? { id: randomUUID(), name: cleanName, prompt: cleanPrompt, source: str(source), at }
      : { ...existing, name: cleanName, prompt: cleanPrompt, source: str(source), at }
    const writingStyles = existing === undefined
      ? [...current.writingStyles, writingStyle]
      : current.writingStyles.map((row) => (row.id === writingStyle.id ? writingStyle : row))
    // The first writing style becomes the active one: a writer who just made one expects it to be used.
    const activeId = current.activeId === '' ? writingStyle.id : current.activeId
    const written = await writeWritingStyles(library, bookFolder, { ...current, activeId, writingStyles })
    return json({ ok: true, ...written, saved: writingStyle })
  })

  route('/api/story.writingStyle.setActive', async (request) => {
    const { library, bookFolder, id } = await bookPayload(request)
    const current = await readWritingStyles(library, bookFolder)
    const activeId = str(id)
    if (activeId !== '' && !current.writingStyles.some((row) => row.id === activeId)) return fail('流派不存在。')
    const written = await writeWritingStyles(library, bookFolder, { ...current, activeId })
    return json({ ok: true, ...written })
  })

  route('/api/story.writingStyle.delete', async (request) => {
    const { library, bookFolder, id } = await bookPayload(request)
    const current = await readWritingStyles(library, bookFolder)
    const writingStyles = current.writingStyles.filter((row) => row.id !== id)
    const activeId = current.activeId === id ? '' : current.activeId
    const written = await writeWritingStyles(library, bookFolder, { ...current, writingStyles, activeId })
    return json({ ok: true, ...written })
  })

  /**
   * Generate one writing style's prompt from a pasted sample. The sample is the input; the answer is
   * one paragraph the writer can edit before saving, not a stored writing style yet.
   */
  route('/api/story.writingStyle.generate', async (request) => {
    const { source } = await bookPayload(request)
    const sample = str(source).trim()
    if (sample === '') return fail('先给一段用来提取风格的文本。')
    const selection = await selectionFor('suggest')
    const text = await callModel(ctx, {
      log: logged('writingStyle.generate'),
      selection,
      system: WRITING_STYLE_SYSTEM,
      input: sample.slice(0, 12000),
      maxTokens: await modelMaxTokens(ctx, selection, 900),
      signal: request.signal,
    })
    return json({ ok: true, prompt: text.trim() })
  })
}
