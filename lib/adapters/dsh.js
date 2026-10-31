/**
 * The DSH adapter: the thin layer that turns the shared service into a Cordis plugin.
 *
 * Everything about books, routes, prompts and tools lives in lib/service.js. This file only
 * knows how DSH supplies a model runtime, registers fetch routes, registers agent tools and
 * contributes a system-prompt section. An Electron adapter can do the same three things without
 * importing this file.
 */
import { dirname, join } from 'node:path'
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
        text: () => {
          try {
            // The library is a setting, so this no longer asks the session where it is standing —
            // a conversation started outside the books directory still sees the writer's books.
            const path = currentBookPath(settingsPath(config), config)
            if (path === undefined) return ''
            return describeStoryBlock(readBookSync(path))
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
  const assembled = buildContext('harness', book)
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
  if (raw.mosaic !== undefined) return raw
  try {
    const held = JSON.parse(readTextFileSync(join(dirname(bookFile), 'mosaic.json')))
    return { ...raw, mosaic: held.mosaic }
  } catch { return raw }
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
