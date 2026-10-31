/**
 * The panel's own settings: which model each role runs on, which model draws portraits, and where
 * the books live.
 *
 * These are the only routes that reach into `ctx` for host services -- the model catalogue, the
 * reasoning levels a model advertises, the session's current selection. Every other group takes
 * its dependencies as arguments, which is why `ctx` is passed here explicitly rather than being
 * assumed.
 */
import { isAbsolute } from 'node:path'
import { pathExists } from '../io.js'
import {
  MODEL_ROLES, settingsPath, displayPath, libraryFrom, modelOverride,
  mergeImageSettings, maskImageSettings, normalizeProviders, maskProviders, readSettings, writeSettings, selectionOf,
} from '../settings.js'
import { json, fail } from './kernel.js'
import { fetchProviderModels } from '../custom-provider.js'
import { AGNES_IMAGE_MODELS } from '../agnes.js'

/**
 * @param {object} deps  `route`, `payload`, `bookPayload`, `rolesOf`, `ctx`, `config`
 */
export function registerConfigRoutes({ route, payload, bookPayload, rolesOf, ctx, config }) {
  /**
   * The reasoning levels one model offers.
   *
   * Asked per model and cached: it is the only place that knows whether "high" means anything for
   * this route, and resolving every model up front would mean a lookup per catalogue entry for a
   * value most rows never show. A model without reasoning metadata answers an empty list, which
   * is the normal case rather than an error.
   */
  const effortCache = new Map()

  route('/api/story.meta', async () => json({ ok: true, roles: await rolesOf() }))

  /**
   * The model each role will use, and the value of "follow the default".
   *
   * The page needs both halves to say anything useful: the effective model of every role, and what
   * the session's own selection is, so a role that is not overridden can show WHICH model it is
   * following rather than the word "default".
   */
  route('/api/story.models', async (request) => {
    await payload(request)
    const file = settingsPath(config)
    // The first visit creates the file. A config the writer cannot find is not one they own: the
    // page names this path, and it should be a file that is already there when they look.
    if (!await pathExists(file)) await writeSettings(file, {})
    const read = await readSettings(file)
    const stored = read.roles
    const inherited = ctx.get('agentDefaultModel')?.currentSelection?.()
    const roles = await rolesOf()
    return json({
      ok: true, roles, overrides: stored, inherited: selectionOf(inherited),
      // The portrait settings travel with the roles because the page edits both and reads both:
      // leaving `image` out of this response meant every visit showed the defaults, so a chosen
      // style looked as though it had not saved.
      image: maskImageSettings(read.image),
      // The library travels with the models for the same reason: the panel needs both to draw its
      // pages, and a second route to ask where the books are would be a second source of truth.
      // A settings file without one answers with the default, so a fresh install is usable.
      library: libraryFrom(read, config),
      file: displayPath(file),
    })
  })

  /**
   * Every model the host can route to, grouped by provider.
   *
   * The panel asks the HOST for this rather than the browser: the host already owns the
   * adapters, so the list cannot drift from what a call would actually accept, and it needs no
   * model-picker service in the client to exist. Providers whose adapter advertises nothing
   * still appear through their current model below, so a writer can always keep what they have.
   */
  route('/api/story.catalog', async (request) => {
    await payload(request)
    const groups = []
    const byProvider = new Map()
    const ensure = (id) => {
      if (!byProvider.has(id)) {
        const group = { id, name: id, models: [] }
        byProvider.set(id, group)
        groups.push(group)
      }
      return byProvider.get(id)
    }
    const providers = typeof ctx.llm?.listProviders === 'function' ? await ctx.llm.listProviders() : []
    for (const provider of providers) {
      const group = ensure(provider.id)
      group.name = provider.name ?? provider.id
      let models
      try { models = await ctx.llm.listModels(provider.id) } catch { models = [] }
      for (const model of models ?? []) group.models.push({ model: model.id, name: model.name ?? model.id })
    }
    // The models that are in use are always offered, even when an adapter advertises no
    // catalogue: a picker that cannot show the current model cannot keep it either.
    const inUse = [ctx.get('agentDefaultModel')?.currentSelection?.(), ...Object.values((await readSettings(settingsPath(config))).roles)]
    for (const selection of inUse) {
      if (selection === null || selection === undefined) continue
      if (typeof selection.provider !== 'string' || typeof selection.model !== 'string') continue
      const group = ensure(selection.provider)
      if (!group.models.some((row) => row.model === selection.model)) {
        group.models.push({ model: selection.model, name: selection.model })
      }
    }
    return json({ ok: true, groups: groups.filter((group) => group.models.length > 0) })
  })

  route('/api/story.efforts', async (request) => {
    const { provider, model } = await bookPayload(request)
    if (typeof provider !== 'string' || typeof model !== 'string' || provider === '' || model === '') {
      return fail('efforts need a provider and a model')
    }
    const key = `${provider}/${model}`
    if (!effortCache.has(key)) {
      let value = { efforts: [], defaultEffort: null }
      try {
        // `resolveModelInfo` is the service-level lookup (the `resolveModel` on the adapter is a
        // different, lower-level entry point). Asking for the wrong one threw for every model,
        // which is why no route ever showed a level.
        const info = typeof ctx.llm.resolveModelInfo === 'function'
          ? await ctx.llm.resolveModelInfo(provider, model)
          : await ctx.llm.resolveModel(provider, model)
        const efforts = Array.isArray(info?.reasoning?.efforts) ? info.reasoning.efforts : []
        value = {
          efforts: efforts.map((effort) => ({ id: effort.id, name: effort.name ?? effort.id })),
          defaultEffort: info?.reasoning?.defaultEffort ?? null,
        }
      } catch { /* no reasoning support, or the model is not in the catalogue */ }
      effortCache.set(key, value)
    }
    return json({ ok: true, ...effortCache.get(key) })
  })

  /**
   * Store one role's model, or clear it so the role follows the session again.
   *
   * Written to the panel's own file rather than to the profile patch: the patch is a composition
   * document owned by the host's settings UI, and rewriting it from a plugin panel would fight the
   * plugin manager over the same file. A role of null means "inherit".
   */
  route('/api/story.setModel', async (request) => {
    const { role, selection } = await bookPayload(request)
    if (!MODEL_ROLES.includes(role)) return fail('unknown model role')
    const file = settingsPath(config)
    const stored = await readSettings(file)
    const current = stored.roles
    const next = { ...current }
    if (selection === null || selection === undefined) {
      delete next[role]
    } else {
      const value = modelOverride({ roles: { [role]: selection } }, role)
      if (value === undefined) return fail('a model selection needs a provider and a model')
      next[role] = value
    }
    // The portrait settings are carried through: this route changes a ROLE, and dropping the
    // image block here would reset the writer's portrait model and style every time they pinned a
    // chat model. Caught by the round-trip check, not by a test — which is why it is now stated.
    await writeSettings(file, next, stored.image)
    return json({ ok: true, roles: await rolesOf(), overrides: next, image: maskImageSettings(stored.image), file: displayPath(file) })
  })

  /**
   * Store the image settings: which model draws the portraits, and in what style.
   *
   * A route of its own rather than a fifth model role, because the value is not a chat-model
   * selection: there is no provider to pick from the host's catalogue and no reasoning effort. It
   * is a model name on the image endpoint plus one of four styles.
   */
  route('/api/story.setImage', async (request) => {
    const { image } = await bookPayload(request)
    const file = settingsPath(config)
    const current = await readSettings(file)
    const next = mergeImageSettings(current.image, image)
    await writeSettings(file, current.roles, next)
    return json({ ok: true, image: maskImageSettings(next), file: displayPath(file) })
  })

  /**
   * A custom image endpoint and the models it advertises.
   *
   * Image models are a separate list from the chat catalogue even when the provider is the same
   * OpenAI-compatible host: Agnes serves both, but an image name in a role picker would be a
   * model that cannot answer a sentence. The page asks this route instead of parsing /models.
   */
  route('/api/story.imageModels', async (request) => {
    const body = await payload(request)
    const current = (await readSettings(settingsPath(config))).image
    const providerId = typeof body?.provider === 'string' && body.provider !== '' ? body.provider : current.provider
    if (providerId === 'agnes') return json({ ok: true, models: AGNES_IMAGE_MODELS })
    const stored = await readSettings(settingsPath(config))
    const provider = stored.providers.find((row) => row.id === providerId && row.kind === 'image')
    if (provider === undefined) return fail('生图模型没有配置')
    return json({ ok: true, models: provider.models })
  })

  /**
   * Test one chat provider without saving it. The key is resolved from the stored row when the
   * form leaves it blank, so editing a provider does not require re-entering the secret.
   */
  route('/api/story.provider.test', async (request) => {
    const body = await payload(request)
    const current = await readSettings(settingsPath(config))
    const existing = current.providers.find((row) => row.id === body?.id)
    const apiKey = String(body?.apiKey ?? '') !== '' ? body.apiKey : (existing?.apiKey ?? '')
    const startedAt = Date.now()
    const models = await fetchProviderModels({ baseURL: body?.baseURL, apiKey })
    return json({ ok: true, count: models.length, ms: Date.now() - startedAt })
  })


  /**
   * The writer's own OpenAI-compatible providers. Keys never leave the server: the read side
   * answers `hasKey`, and a blank key on save means "keep the one already stored".
   */
  route('/api/story.providers', async () => {
    const current = await readSettings(settingsPath(config))
    return json({ ok: true, providers: maskProviders(current.providers) })
  })

  route('/api/story.provider.models', async (request) => {
    const body = await payload(request)
    const current = await readSettings(settingsPath(config))
    const existing = current.providers.find((row) => row.id === body?.id)
    const apiKey = typeof body?.apiKey === 'string' && body.apiKey.trim() !== ''
      ? body.apiKey.trim()
      : (existing?.apiKey ?? '')
    const models = await fetchProviderModels({ baseURL: body?.baseURL, apiKey })
    return json({ ok: true, models })
  })

  route('/api/story.provider.save', async (request) => {
    const body = await payload(request)
    const provider = body?.provider && typeof body.provider === 'object' ? body.provider : {}
    const file = settingsPath(config)
    const current = await readSettings(file)
    const id = typeof provider.id === 'string' ? provider.id.trim() : ''
    const existing = current.providers.find((row) => row.id === id)
    const apiKey = typeof provider.apiKey === 'string' && provider.apiKey.trim() !== ''
      ? provider.apiKey.trim()
      : (existing?.apiKey ?? '')
    const name = String(provider.name ?? '').trim()
    const baseURL = String(provider.baseURL ?? '').trim()
    const models = Array.isArray(provider.models) ? provider.models : []
    if (name === '' || baseURL === '' || models.length === 0) {
      return fail('自定义模型需要名称、接口地址和至少一个模型 ID')
    }
    const saved = normalizeProviders([{ ...provider, id: id === '' ? undefined : id, apiKey }])[0]
    if (saved === undefined) return fail('自定义模型配置不完整')
    const next = [...current.providers.filter((row) => row.id !== saved.id), saved]
    await writeSettings(file, current.roles, undefined, undefined, next)
    return json({ ok: true, providers: maskProviders(next), saved: maskProviders([saved])[0] })
  })

  route('/api/story.provider.delete', async (request) => {
    const { id } = await payload(request)
    const file = settingsPath(config)
    const current = await readSettings(file)
    const next = current.providers.filter((row) => row.id !== id)
    await writeSettings(file, current.roles, undefined, undefined, next)
    return json({ ok: true, providers: maskProviders(next) })
  })

  /**
   * Point the library somewhere else.
   *
   * The one setting that decides where every book lives. Changing it does NOT move anything: the
   * shelf simply starts looking in the new directory. Moving files is the writer's business, and a
   * route that silently relocated a library would be the most destructive thing in this plugin.
   */
  route('/api/story.setLibrary', async (request) => {
    const { path } = await payload(request)
    const file = settingsPath(config)
    const trimmed = typeof path === 'string' ? path.trim() : ''
    if (trimmed !== '' && !isAbsolute(trimmed)) return fail('书库目录要写绝对路径。')
    const current = await readSettings(file)
    await writeSettings(file, current.roles, undefined, trimmed)
    // Answer with the library that is now in force: an empty string means "back to the default",
    // and the panel shows the resolved path rather than the empty field it typed.
    const resolved = libraryFrom({ library: trimmed }, config)
    return json({ ok: true, library: resolved, isDefault: trimmed === '', file: displayPath(file) })
  })
}
