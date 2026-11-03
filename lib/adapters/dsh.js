/**
 * The DSH adapter: the thin layer that turns the shared service into a Cordis plugin.
 *
 * Everything about books, routes, prompts and tools lives in lib/service.js. This file only
 * knows how DSH supplies a model runtime, registers fetch routes, registers agent tools and
 * contributes a system-prompt section. An Electron adapter can do the same three things without
 * importing this file.
 */
import { basename, dirname, join } from 'node:path'
import { listDirSync, modifiedTimeSync, readTextFileSync } from '../io.js'
import { normalizeBook } from '../model.js'
import { buildContext } from '../context.js'
import { settingsPath, libraryFrom } from '../settings.js'
import { createStoryService } from '../service.js'

export const name = 'storywriting'
export const inject = ['connection', 'llm']

/** Register the tool definitions the service built. DSH owns only the registration. */
function registerStoryTools(ctx, tools) {
  ctx.inject(['tools', 'workingDirectory'], (toolCtx) => {
    for (const definition of tools) {
      toolCtx.effect(() => toolCtx.tools.register(definition), `storywriting: tool ${definition.name}`)
    }
  })
}

/**
 * Make the conversation aware of the story without the user pasting anything: a dynamic context
 * contribution whose text function reads THIS agent's story directory on every assembly.
 *
 * Two details are load-bearing:
 * - `text` is a function, not a `{{variable}}` reference. An unset variable throws during
 *   interpolation and would break every turn of a session that has no story yet.
 * - It contributes an EMPTY string when there is no story, and renderContextSections drops
 *   empty contributions, so a session that never writes contributes nothing.
 *
 * The contribution stays a summary: full text would spend the model's context on the novel and
 * starve the actual request, and the model can call `story_read` when it needs detail.
 */
/**
 * The book.json nearest a session's working directory.
 *
 * The directory DSH commits for a book session is the book's own folder, so `book.json` is right
 * there; walking up a few levels also covers a session that changed into a subfolder of the book.
 * No book anywhere above it means this session is not about a book, which is a truthful '' rather
 * than a guess.
 */
function bookFileNear(directory) {
  if (typeof directory !== 'string' || directory === '') return undefined
  let current = directory
  for (let depth = 0; depth < 8; depth += 1) {
    const candidate = join(current, 'book.json')
    if (modifiedTimeSync(candidate) !== undefined) return candidate
    const parent = dirname(current)
    if (parent === current) break
    current = parent
  }
  return undefined
}

/** The directory the host has committed for this agent's session, when it can answer. */
function agentDirectory(ctx, agent) {
  if (agent === undefined || agent === null) return undefined
  const service = typeof ctx.get === 'function' ? ctx.get('workingDirectory') : undefined
  if (service === undefined || service === null || typeof service.get !== 'function') return undefined
  const directory = service.get(agent.session)
  return typeof directory === 'string' && directory !== '' ? directory : undefined
}

/**
 * The session's book, as `{ library, folder }`, for the story tools.
 *
 * A session with no book answers `undefined`; the tool layer then refuses rather than reading the
 * last book edited by someone else.
 */
function sessionBook(ctx, exec) {
  const agent = exec?.agent
  if (agent === undefined) return undefined
  const file = bookFileNear(agentDirectory(ctx, agent))
  if (file === undefined) return undefined
  try {
    const raw = JSON.parse(readTextFileSync(file))
    if (typeof raw?.id !== 'string' || raw.id === '') return undefined
    const folderDir = dirname(file)
    return { library: dirname(folderDir), folder: basename(folderDir) }
  } catch { return undefined }
}

function registerStoryContext(ctx, config) {
  ctx.inject(['systemPrompt'], (promptCtx) => {
    // Register per agent, not globally: the story belongs to the agent's own session, and the
    // global registry has no agent to ask. A global registration also cannot see `assembly.agent`
    // on this Harness version, which is why the previous attempt contributed empty text.
    promptCtx.effect(() => promptCtx.on('agent/created', ({ agent }) => {
      const disposer = agent.ctx.effect(() => agent.ctx.systemPrompt.context({
        name: 'storywriting:story',
        // Above the harness source block (200) and below the session facts (100-125):
        // the story is task material, not deployment identity.
        order: 150,
        text: (context) => {
          try {
            // A session that belongs to a book reads THAT book, named by the id on its own
            // directory. It never falls back to "the most recently edited book" — that fallback
            // is how a conversation about one novel silently read another.
            const file = context?.agent === undefined
              ? currentBookPath(settingsPath(config), config)
              : bookFileNear(agentDirectory(ctx, context.agent))
            if (file === undefined) return ''
            const raw = readBookSync(file)
            // The id is the book's identity; a file without one cannot be matched to a session.
            if (typeof raw?.id !== 'string' || raw.id === '') return ''
            return describeStoryBlock(raw)
          } catch {
            // No story yet, or an unreadable one: contribute nothing.
            return ''
          }
        },
      }), 'storywriting: story context')
      // Keep our own reference too: unloading the plugin must not leave the agent-scoped entry behind.
      return disposer
    }), 'storywriting: per-agent story context')
  })
}

/**
 * The prose handed to the model, or '' when there is no story worth mentioning.
 *
 * Assembled by the context layer's `harness` recipe: one place decides what the conversation
 * opens with, and the format options on the recipe keep the old prompt's shape. A partially
 * written book still digests — normalizeBook repairs what it can.
 */
function describeStoryBlock(raw) {
  const book = normalizeBook(raw)
  if (book.title === '' && book.chapters.length === 0
    && (book.mosaic?.entities ?? []).length === 0) return ''
  const assembled = buildContext('harness', book, { overrides: book.contextOverrides })
  if (assembled.text === '') return ''
  return [
    'This session is writing a novel. Current story state:',
    assembled.text,
    '',
  ].filter((line) => line !== '').join('\n') + '\n'
}

/**
 * The most recently edited book in the library, resolved synchronously: the prompt provider runs
 * inside assembly and cannot await. Returns undefined when the library has no book yet.
 *
 * The library comes from the settings file, read here with `readFileSync` for the same reason —
 * `readSettings` is async and this callback cannot await it.
 */
function currentBookPath(settingsFile, config) {
  let library
  try {
    const raw = JSON.parse(readTextFileSync(settingsFile))
    library = libraryFrom(raw, config)
  } catch {
    // No settings file yet, or an unreadable one: the default library still applies.
    library = libraryFrom(undefined, config)
  }
  const root = library
  const entries = listDirSync(root) ?? []
  let best
  let bestTime = -1
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const candidate = join(root, entry.name, 'book.json')
    const modified = modifiedTimeSync(candidate)
    if (modified !== undefined && modified > bestTime) { bestTime = modified; best = candidate }
  }
  return best
}

/**
 * The book at `path`, with its board folded in, read synchronously.
 *
 * The system-prompt contribution is a synchronous callback, so `readBook` is not available here.
 * The board lives in a sibling file now, and reading only book.json — as this did — silently
 * dropped every card from the digest the conversation sees.
 */
function readBookSync(bookFile) {
  const raw = JSON.parse(readTextFileSync(bookFile))
  const dir = dirname(bookFile)
  let book = raw
  if (raw.mosaic === undefined) {
    try {
      const held = JSON.parse(readTextFileSync(join(dir, 'mosaic.json')))
      book = { ...raw, mosaic: held.mosaic }
    } catch { /* no board beside the manuscript */ }
  }
  try {
    book = { ...book, contextOverrides: JSON.parse(readTextFileSync(join(dir, 'context.json'))).overrides ?? {} }
  } catch { /* no context copies yet */ }
  return book
}


/**
 * The DSH composition root. Routes and tools come from one service instance, so a change to a
 * route handler or a tool definition reaches DSH without this file knowing the details.
 */
export function apply(ctx, config) {
  const service = createStoryService({
    config,
    host: {
      llm: ctx.llm,
      get: (name) => (typeof ctx.get === 'function' ? ctx.get(name) : undefined),
      // Tools read the book the CALLING session belongs to, not whatever was edited last.
      sessionBook: (exec) => sessionBook(ctx, exec),
    },
  })

  for (const { path, handler } of service.routes) {
    ctx.effect(
      () => ctx.connection.fetch.register({
        path, methods: ['POST'], requestBody: 'buffered', fetch: handler,
      }),
      `storywriting: ${path}`,
    )
  }

  registerStoryTools(ctx, service.tools)
  registerStoryContext(ctx, config)
}
