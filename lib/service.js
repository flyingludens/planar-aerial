/**
 * The storywriting service: everything the two hosts share.
 *
 * This module knows about books, routes, model calls and events, but nothing about DSH or
 * Electron. The host adapter supplies the two services routes need: a model runtime and a getter
 * for the host's optional capabilities. Routes and agent tools are returned as plain values so a
 * DSH plugin, an HTTP server or an MCP bridge can all register the same work.
 */
import { dirname, join } from 'node:path'
import { normalizeBook } from './model.js'
import { chapterFinalText } from './text.js'
import { normalizeMosaic } from './mosaic.js'
import { createBook, listBooks, readBook, writeBook } from './store.js'
import { fail, json } from './routes/kernel.js'
import { registerBookRoutes } from './routes/books.js'
import { registerWritingRoutes } from './routes/writing.js'
import { registerMosaicRoutes } from './routes/mosaic.js'
import { registerWritingStyleRoutes } from './routes/writing-styles.js'
import { registerConfigRoutes } from './routes/config.js'
import { registerContextRoutes } from './routes/context.js'
import {
  MODEL_ROLES, settingsPath, libraryFrom, readSettings, selectionOf, resolveModelSelection,
} from './settings.js'
import { createEventLog } from './events.js'
import { createModelRuntime } from './model-runtime.js'
import { agnesDefaultModel } from './agnes.js'
import { createEntity } from '../domain/board.js'
import { newId } from '../domain/ids.js'
import { ENTITY_KINDS } from '../domain/schema.js'

/**
 * Resolve which book a tool or chat call is about.
 *
 * The library is a setting, not a property of the calling session's working directory. It used to
 * be derived from that directory — which meant a conversation started anywhere else could not see
 * the writer's books, and this function had to take an `exec` it no longer needs.
 *
 * An explicit folder wins; otherwise the most recently edited book is used, which is what a writer
 * means by "the book". With no books at all, creating one keeps the first call useful instead of
 * failing.
 */
/**
 * Which book a tool call is about.
 *
 * An explicit `book` argument wins (the MCP bridge and older clients name one). Otherwise the
 * host answers from the CALLING SESSION's own directory: a book session reads its book, and a
 * session outside any book is refused rather than quietly answered from the last book edited —
 * that fallback is how a conversation about one novel once read another.
 *
 * A host that cannot answer per session (a bridge with no session) keeps the library default.
 */
async function resolveTarget(config, requested, exec, host) {
  if (typeof requested === 'string' && requested !== '') return resolveLibrary(config, requested)
  if (typeof host?.sessionBook === 'function') {
    const found = await host.sessionBook(exec)
    if (found !== undefined) return found
    if (exec?.agent !== undefined) {
      throw new Error('当前会话不在任何一本书的目录里，无法确定要读哪本书。')
    }
    return resolveLibrary(config, undefined)
  }
  return resolveLibrary(config, undefined)
}

async function resolveLibrary(config, requested) {
  const library = libraryFrom(await readSettings(settingsPath(config)), config)
  // A named book that does not exist yet is created, so a tool call naming a book works the first
  // time instead of failing on a typo-free but absent folder.
  if (typeof requested === 'string' && requested !== '') {
    const known = await listBooks(library)
    if (!known.some((row) => row.folder === requested)) {
      const created = await createBook(library, requested)
      return { library, folder: created.folder }
    }
    return { library, folder: requested }
  }
  const books = await listBooks(library)
  if (books.length > 0) return { library, folder: books[0].folder }
  const created = await createBook(library, '未命名')
  return { library, folder: created.folder }
}

/** Render helper shared by the story tools: one plain-text line for the transcript card. */
const textResult = (text) => [{ type: 'text', text }]

/**
 * Register the agent-facing story tools. They are the bridge that lets the conversation in the
 * right sidebar build worldbuilding: the model reads the book, then writes characters and
 * settings back into book.json, and the panel repaints from the file it re-reads.
 *
 * The tool definitions are plain objects (no schemastery dependency): `ctx.tools.register` only
 * requires `output.schema` and `output.render`.
 */
export function createStoryTools(config, host = {}) {
  const tools = []
  const register = (definition) => tools.push(definition)

    register({
      name: 'story_read',
      description: 'Read the current story: title, chapters with their final text, characters, relationships and settings. Use it before writing anything into the story, and when the user asks what the story currently contains.',
      parameters: { type: 'object', properties: {}, additionalProperties: false },
      output: {
        schema: { type: 'object', properties: { book: { type: 'object' } }, required: ['book'], additionalProperties: true },
        render: (_args, value) => textResult(describeStory(value.book)),
      },
      async execute(args, exec) {
        const { library, folder } = await resolveTarget(config, args.book, exec, host)
        const { book } = await readBook(library, folder)
        return { book }
      },
    })

    register({
      name: 'story_write_cast',
      description: 'Create or update story characters and the relationships between them. Each character is matched by name: an existing one is updated with the supplied fields, a new name is added. Relationship kinds must be active from the source to the target (for example 雇用, 调查), never passive/object-angle forms such as 受雇于 or 被调查; swap the endpoints instead. This never touches the manuscript text.',
      parameters: {
        type: 'object',
        properties: {
          characters: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                aliases: { type: 'array', items: { type: 'string' } },
                role: { type: 'string' },
                goal: { type: 'string' },
                traits: { type: 'array', items: { type: 'string' } },
                notes: { type: 'string' },
              },
              required: ['name'],
              additionalProperties: false,
            },
          },
          relationships: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                from: { type: 'string' },
                to: { type: 'string' },
                kind: { type: 'string' },
                note: { type: 'string' },
              },
              required: ['from', 'to', 'kind'],
              additionalProperties: false,
            },
          },
        },
        additionalProperties: false,
      },
      output: {
        schema: { type: 'object', properties: { added: { type: 'array', items: { type: 'string' } }, updated: { type: 'array', items: { type: 'string' } } }, required: ['added', 'updated'], additionalProperties: false },
        render: (_args, value) => textResult(`Cast updated: ${value.added.length} added, ${value.updated.length} updated.`),
      },
      async execute(args, exec) {
        const { library, folder } = await resolveTarget(config, args.book, exec, host)
        const { book, token } = await readBook(library, folder)
        // The cast IS the board: schema 3 has one place for who is in this story. A tool call and a
        // hand-edit on the board page write the same records, so neither can drift from the other.
        const mosaic = normalizeMosaic(book.mosaic)
        const byName = new Map(mosaic.entities.filter((e) => e.kind === 'character').map((c) => [c.name, c]))
        const idByName = new Map(mosaic.entities.filter((e) => e.kind === 'character').map((c) => [c.name, c.id]))
        const added = []
        const updated = []
        for (const raw of args.characters ?? []) {
          const name = String(raw.name ?? '').trim()
          if (name === '') continue
          const existing = byName.get(name)
          // Fields a board entity has no home for are folded into its summary, in the order the
          // writer would say them, rather than dropped — a character's goal is story material.
          const extras = [
            Array.isArray(raw.aliases) && raw.aliases.length > 0 ? `别名：${raw.aliases.join('、')}` : '',
            raw.goal ? `目标：${raw.goal}` : '',
            Array.isArray(raw.traits) && raw.traits.length > 0 ? `性格：${raw.traits.join('、')}` : '',
            raw.notes ?? '',
          ].filter(Boolean)
          if (existing === undefined) {
            // One constructor with every field the kind owns, the same one the browser's create
            // form uses. A hand-built object here meant the two paths could disagree about which
            // fields a character starts with.
            const entity = createEntity('character', name, {
              role: raw.role ?? '',
              summary: extras.join('。'),
            })
            mosaic.entities.push(entity)
            byName.set(name, entity)
            idByName.set(name, entity.id)
            added.push(name)
            continue
          }
          // Only overwrite the fields the model actually supplied, so a partial update cannot blank a card.
          if (raw.role !== undefined) existing.role = raw.role
          if (extras.length > 0) existing.summary = [existing.summary, ...extras].filter(Boolean).join('。')
          updated.push(name)
        }
        for (const rel of args.relationships ?? []) {
          const fromId = idByName.get(String(rel.from).trim())
          const toId = idByName.get(String(rel.to).trim())
          if (fromId === undefined || toId === undefined) continue
          const kind = String(rel.kind)
          const existing = mosaic.edges.find((e) => e.from === fromId && e.to === toId)
          if (existing === undefined) {
            mosaic.edges.push({ id: newId(), from: fromId, to: toId, truth: { kind, note: rel.note ?? '' }, beliefs: [], retired: false, log: [] })
            continue
          }
          if (existing.truth.kind === kind) continue
          existing.truth = { kind, note: rel.note === undefined ? existing.truth.note : rel.note }
          existing.retired = false
        }
        book.mosaic = mosaic
        await writeBook(library, book, token, folder)
        return { added, updated }
      },
    })

    register({
      name: 'story_write_settings',
      description: 'Create or update worldbuilding entries (setting, era, place, rules). Each entry is matched by title: an existing one is updated, a new title is added. Use it to generate background the user asked for. This never touches the manuscript text.',
      parameters: {
        type: 'object',
        properties: {
          entries: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                // Which kind of setting this is. The five kinds are the board's own vocabulary;
                // 'place' is the default because most worldbuilding is a place or an era.
                kind: { type: 'string', enum: ['place', 'faction', 'item', 'event'] },
                body: { type: 'string' },
              },
              required: ['title'],
              additionalProperties: false,
            },
          },
        },
        required: ['entries'],
        additionalProperties: false,
      },
      output: {
        schema: { type: 'object', properties: { added: { type: 'array', items: { type: 'string' } }, updated: { type: 'array', items: { type: 'string' } } }, required: ['added', 'updated'], additionalProperties: false },
        render: (_args, value) => textResult(`Settings updated: ${value.added.length} added, ${value.updated.length} updated.`),
      },
      async execute(args, exec) {
        const { library, folder } = await resolveTarget(config, args.book, exec, host)
        const { book, token } = await readBook(library, folder)
        // A worldbuilding entry is a board card like any other, filed under one of the four
        // non-character kinds. Its text goes into `description` (the long form), never `summary`:
        // a paragraph in the one-line field is what made digests unreadable.
        const mosaic = normalizeMosaic(book.mosaic)
        const byTitle = new Map(mosaic.entities.map((e) => [e.name, e]))
        const added = []
        const updated = []
        for (const raw of args.entries ?? []) {
          const title = String(raw.title ?? '').trim()
          if (title === '') continue
          const existing = byTitle.get(title)
          if (existing === undefined) {
            const kind = ENTITY_KINDS.includes(raw.kind) ? raw.kind : 'place'
            const card = createEntity(kind, title, { description: raw.body ?? '' })
            mosaic.entities.push(card)
            byTitle.set(title, card)
            added.push(title)
            continue
          }
          if (raw.body !== undefined) existing.description = raw.body
          updated.push(title)
        }
        book.mosaic = mosaic
        await writeBook(library, book, token, folder)
        return { added, updated }
      },
    })

    register({
      name: 'story_mosaic_query',
      description: 'Read-only query on the story board (Mosaic): relations between characters with the author-verified truth and what each character believes, plus setting cards. Pass entity (a name) to fetch one entity and every edge touching it, or keyword to search card bodies and names. The board is never modified through this tool.',
      parameters: {
        type: 'object',
        properties: {
          entity: { type: 'string' },
          keyword: { type: 'string' },
        },
        additionalProperties: false,
      },
      output: {
        schema: { type: 'object', properties: { entities: { type: 'array' }, edges: { type: 'array' } }, required: ['entities', 'edges'], additionalProperties: false },
        render: (_args, value) => textResult(`Mosaic query: ${value.entities.length} entities, ${value.edges.length} edges.`),
      },
      async execute(args, exec) {
        const { library, folder } = await resolveTarget(config, args.book, exec, host)
        const { book } = await readBook(library, folder)
        const mosaic = book.mosaic
        const wanted = mosaic.entities.filter((e) => {
          if (typeof args.entity === 'string' && args.entity !== '') return e.name === args.entity.trim()
          if (typeof args.keyword === 'string' && args.keyword !== '') {
            const k = args.keyword.trim()
            // Every text field a card can hold, so a search finds the line wherever the writer put
            // it: the one-line summary, the long description, the private notes, an alias.
            return e.name.includes(k) || (e.summary ?? '').includes(k) || (e.description ?? '').includes(k)
              || (e.notes ?? '').includes(k) || (e.aliases ?? []).some((alias) => alias.includes(k))
              || (e.custom ?? []).some((row) => row.label.includes(k) || row.value.includes(k))
          }
          return false
        })
        if (wanted.length === 0) return { entities: [], edges: [] }
        const ids = new Set(wanted.map((e) => e.id))
        const edges = mosaic.edges.filter((e) => ids.has(e.from) || ids.has(e.to) || e.beliefs.some((b) => ids.has(b.holderId)))
        return { entities: wanted, edges }
      },
    })
  return tools
}/** A token-bounded digest of the story, safe on a partially written book. */
function describeStory(raw) {
  const book = normalizeBook(raw)
  const chapters = book.chapters
    .map((c) => `${c.title}（${chapterFinalText(c) === '' ? '空' : `${chapterFinalText(c).length} 字`}）`)
    .join('、')
  // The cast and the world come from the board: schema 3 has no separate lists, and schema 4 has
  // five kinds. The cast keeps its own line because a writer reads names there; the other four are
  // grouped under one 设定 line, since what matters is that the card exists, not which drawer it
  // lives in.
  const entities = book.mosaic?.entities ?? []
  const cast = entities.filter((e) => e.kind === 'character').map((c) => `${c.name}${c.role ? `（${c.role}）` : ''}`).join('、')
  const settings = entities.filter((e) => e.kind !== 'character').map((s) => s.name).join('、')
  const lines = [`《${book.title || '未命名'}》${book.genre ? ` · ${book.genre}` : ''}`]
  if (book.pov || book.tense) lines.push(`视角：${book.pov || '—'}；时态：${book.tense || '—'}`)
  lines.push(`章节：${chapters || '暂无'}`)
  if (cast) lines.push(`人物：${cast}`)
  if (settings) lines.push(`设定：${settings}`)
  const synopsis = book.overview?.global?.text
  if (synopsis) lines.push(`梗概：${synopsis}`)
  return lines.join('\n')
}






/**
 * Build the shared service.
 *
 * `host` provides exactly what the route modules and ai.js ask of the host today:
 *   host.llm            — stream / resolveModelInfo / listProviders / listModels
 *   host.get(name)      — `agentDefaultModel` and `web`, or undefined
 *
 * `config` is the same plain object the DSH patch carries; a standalone host can build it from
 * its own settings file. Paths still come from settingsPath(config), so a test or an Electron
 * app can point at its own directory without touching the default.
 */
export function createStoryService({ config = {}, host = {} } = {}) {
  const overviewBudget = Number.isFinite(config?.overviewBudget) ? config.overviewBudget : 2000
  const settingsFile = settingsPath(config)
  const events = createEventLog(join(dirname(settingsFile), 'events.jsonl'))
  // Custom providers are read from the same settings file on every call; everything else goes to
  // the host runtime unchanged. A role with no `custom:` provider therefore still behaves exactly
  // as it did before this existed.
  const modelHost = { ...host, llm: createModelRuntime({ host: host.llm, settingsFile }) }

  const storedRoles = async () => (await readSettings(settingsFile)).roles

  const selectionFor = async (role, stored) => {
    const hostDefault = host?.get?.('agentDefaultModel')?.currentSelection?.()
    const defaults = hostDefault ?? { provider: 'agnes', model: agnesDefaultModel(role) }
    const roles = stored ?? await storedRoles()
    const chosen = resolveModelSelection(defaults, roles, role)
    if (chosen === undefined || chosen === null || hostDefault === undefined || hostDefault === null) return chosen
    if (chosen.provider === defaults.provider && chosen.model === defaults.model) return chosen
    return {
      ...chosen,
      fallback: {
        provider: hostDefault.provider,
        model: hostDefault.model,
        ...(typeof hostDefault.reasoningEffort === 'string' ? { reasoningEffort: hostDefault.reasoningEffort } : {}),
      },
    }
  }

  const rolesOf = async () => {
    const stored = await storedRoles()
    const roles = {}
    for (const role of MODEL_ROLES) roles[role] = selectionOf(await selectionFor(role, stored))
    return roles
  }

  const routes = []
  const route = (path, handler) => routes.push({
    path,
    handler: async (request) => {
      try {
        return await handler(request)
      } catch (error) {
        await events.record({ type: 'route.error', path, ok: false, error: String(error?.message ?? error) })
        return fail(error?.message ?? String(error))
      }
    },
  })
  const payload = async (request) => {
    try { return await request.json() } catch { throw new Error('body is not JSON') }
  }
  const bookPayload = async (request) => {
    const body = await payload(request)
    const settings = await readSettings(settingsFile)
    return { ...body, library: libraryFrom(settings, config), settings }
  }

  registerBookRoutes({ route, bookPayload, record: events.record, config })
  registerWritingRoutes({ route, bookPayload, selectionFor, overviewBudget, ctx: modelHost, config, logModel: events.record })
  registerMosaicRoutes({ route, bookPayload, selectionFor, ctx: modelHost, config, logModel: events.record })
  registerWritingStyleRoutes({ route, bookPayload, selectionFor, ctx: host, config, logModel: events.record })
  registerConfigRoutes({ route, payload, bookPayload, rolesOf, ctx: modelHost, config, settingsFile })
  registerContextRoutes({ route, payload, bookPayload, config })
  route('/api/story.events', async () => json({ ok: true, events: await events.read(200) }))

  return {
    routes,
    tools: createStoryTools(config, host),
    settingsFile,
    events,
    modelRuntime: modelHost.llm,
    selectionFor,
    rolesOf,
    resolveLibrary: (requested) => resolveLibrary(config, requested),
  }
}
