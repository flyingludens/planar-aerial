/**
 * The plugin's own settings file, and how a model gets chosen for a role.
 *
 * One file holds everything the writer configures: which model runs each role, which model draws
 * portraits, and where the books live. That grouping is deliberate -- it is one read and one write,
 * so a route that changes a model cannot accidentally erase the library.
 *
 * Nothing here knows about HTTP. The routes import these; this file imports only node built-ins.
 */
import { homedir } from 'node:os'
import { dirname, isAbsolute, join } from 'node:path'
import { readTextFile, writeFileAtomic } from './io.js'
import { AGNES_PROVIDER } from './agnes.js'

/**
 * Resolve the model for one role. Four roles exist because they want different trade-offs:
 * `continue` runs while typing (cheap and fast), `suggest` rewrites a selection (balanced),
 * `chat` holds a conversation (needs context and reasoning), and `mosaic` serves the mosaic
 * wall's checks, questions and relation reading. Each may name its own provider/model in the plugin
 * config; an unset role falls back to the session's default model, so the plugin works with
 * no configuration at all.
 */
export const MODEL_ROLES = ['continue', 'suggest', 'chat', 'mosaic']

/** The plugin's home under the dsh home, where its own settings live. */
export function pluginHome(config) {
  if (typeof config?.settingsPath === 'string' && config.settingsPath !== '') return dirname(config.settingsPath)
  const home = typeof process.env.DSH_HOME === 'string' && process.env.DSH_HOME !== ''
    ? process.env.DSH_HOME
    : join(homedir(), '.dsh')
  return join(home, 'storywriting')
}

/**
 * The panel's own settings: model choices, image block, and where the library is.
 *
 * One file, one read, one write. It used to be called models.json and hold only model choices; it
 * now also names the book library, so the name follows what it holds.
 *
 * `config.settingsPath` overrides the file so a test can point at a temporary directory; without it
 * the location follows DSH_HOME, which is how the rest of the harness locates user data.
 */
export function settingsPath(config) {
  if (typeof config?.settingsPath === 'string' && config.settingsPath !== '') return config.settingsPath
  return join(pluginHome(config), 'settings.json')
}

/**
 * Where books live, from the settings, or the default when none is chosen.
 *
 * A library is not a property of a workspace: it is one directory the writer names once. That is
 * what removes the old three-layer guesswork over the host's workspace list.
 */
export function libraryFrom(settings, config) {
  const chosen = settings?.library
  if (typeof chosen === 'string' && chosen !== '' && isAbsolute(chosen)) return chosen
  return join(pluginHome(config), 'library')
}

/**
 * A path as a person reads it.
 *
 * Only the default location collapses to `~/.dsh`: a custom DSH_HOME is shown in full, because a
 * tilde there would point at the wrong directory.
 */
export function displayPath(file) {
  const home = join(homedir(), '.dsh')
  return file.startsWith(`${home}/`) ? `~/.dsh/${file.slice(home.length + 1)}` : file
}

/** One role's stored choice, or undefined when it follows the default. */
export function modelOverride(raw, role) {
  const slot = raw?.roles?.[role]
  if (slot === null || typeof slot !== 'object') return undefined
  if (typeof slot.provider !== 'string' || slot.provider === '') return undefined
  if (typeof slot.model !== 'string' || slot.model === '') return undefined
  return {
    provider: slot.provider,
    model: slot.model,
    ...(typeof slot.reasoningEffort === 'string' && slot.reasoningEffort !== ''
      ? { reasoningEffort: slot.reasoningEffort }
      : {}),
  }
}

/**
 * The image settings: which model draws the portraits, and in what style.
 *
 * Its own block, not another entry in `roles`. A role names a chat model that answers through dsh's
 * model service; an image model is called over a different endpoint with a different request shape,
 * so putting it in the same list would make every reader of `roles` handle a case it cannot use.
 *
 * The style is a fixed set of four. A free-text style field invites "a bit more like the last one",
 * which is not a thing the model can do — the four that are offered are the four that read clearly
 * at portrait size.
 */
export const IMAGE_STYLES = ['realistic', 'anime', 'pixel', 'sketch']
export const IMAGE_DEFAULT = {
  provider: AGNES_PROVIDER.id,
  model: 'agnes-image-2.1-flash', style: 'realistic',
}


/**
 * Providers the writer configured themselves.
 *
 * A custom provider is one OpenAI-compatible endpoint: a name, a base URL, a key and the model
 * ids it serves. The ids are prefixed so a custom `openai` can never shadow the host's own
 * `openai`; roles store the prefixed id, which is what makes "fall back to the host" a matter of
 * a role that names no custom provider rather than a mode switch.
 */
export function normalizeProviders(raw) {
  const seen = new Set()
  const rows = []
  for (const item of Array.isArray(raw) ? raw : []) {
    if (item === null || typeof item !== 'object') continue
    let id = typeof item.id === 'string' ? item.id.trim() : ''
    if (id === '') id = `custom:${Date.now().toString(36)}`
    if (!id.startsWith('custom:')) id = `custom:${id}`
    if (seen.has(id)) continue
    const baseURL = typeof item.baseURL === 'string' ? item.baseURL.trim().replace(/\/+$/, '') : ''
    const name = typeof item.name === 'string' && item.name.trim() !== '' ? item.name.trim() : id
    if (baseURL === '') continue
    const models = []
    for (const model of Array.isArray(item.models) ? item.models : []) {
      const value = typeof model === 'string' ? model.trim() : String(model?.id ?? '').trim()
      if (value === '') continue
      const label = typeof model === 'object' && typeof model?.name === 'string' && model.name.trim() !== ''
        ? model.name.trim() : value
      if (!models.some((row) => row.id === value)) models.push({ id: value, name: label })
    }
    if (models.length === 0) continue
    seen.add(id)
    rows.push({
      id, name, baseURL, models,
      apiKey: typeof item.apiKey === 'string' ? item.apiKey : '',
      kind: item.kind === 'image' ? 'image' : 'chat',
    })
  }
  return rows
}

/** The provider rows as the page may see them: never the key itself, only whether one is stored. */
export function maskProviders(providers) {
  return (providers ?? []).map((provider) => ({
    id: provider.id, name: provider.name, baseURL: provider.baseURL,
    models: provider.models.map((model) => ({ id: model.id, name: model.name })),
    hasKey: provider.apiKey !== '',
    kind: provider.kind === 'image' ? 'image' : 'chat',
  }))
}

/** Clamp a stored image setting; a missing or unreadable one falls back rather than throwing. */
export function normalizeImageSettings(raw) {
  const provider = typeof raw?.provider === 'string' && raw.provider.trim() !== ''
    ? raw.provider.trim() : IMAGE_DEFAULT.provider
  return {
    provider: provider === 'agnes' || provider.startsWith('custom:') ? provider : IMAGE_DEFAULT.provider,
    model: typeof raw?.model === 'string' && raw.model.trim() !== ''
      ? raw.model.trim() : IMAGE_DEFAULT.model,
    style: IMAGE_STYLES.includes(raw?.style) ? raw.style : IMAGE_DEFAULT.style,
  }
}

/** Merge one edit into the image block; there is no key here, it lives on the provider. */
export function mergeImageSettings(current, patch) {
  return normalizeImageSettings({ ...(current ?? IMAGE_DEFAULT), ...(patch ?? {}) })
}

/** Kept for callers that used the old masked shape; the image block no longer holds a key. */
export function maskImageSettings(image) {
  return normalizeImageSettings(image)
}

/** Read the stored settings. A missing or corrupt file is "nothing is overridden". */
export async function readSettings(file) {
  try {
    const raw = JSON.parse(await readTextFile(file))
    const roles = {}
    for (const role of MODEL_ROLES) {
      const value = modelOverride(raw, role)
      if (value !== undefined) roles[role] = value
    }
    // The image block and the library travel with the roles because all three live in the same
    // file: one read, one write, and no second config for the writer to find.
    return {
      roles,
      image: normalizeImageSettings(raw?.image),
      // Kept verbatim (or absent): `libraryFrom` decides what an absent one means, so a route that
      // only wanted the roles cannot accidentally invent a library path.
      library: typeof raw?.library === 'string' && raw.library !== '' ? raw.library : undefined,
      providers: normalizeProviders(raw?.providers),
    }
  } catch {
    return { roles: {}, image: { ...IMAGE_DEFAULT }, library: undefined, providers: [] }
  }
}

/** Persist the stored choices atomically: a reader sees the old file or the new one. */
export async function writeSettings(file, roles, image, library, providers) {
  /**
   * `image` is PRESERVED when not given, not dropped.
   *
   * It used to be written only when passed, so a caller that changed one role rewrote the file
   * without the image block — and the next read fell back to the defaults. The portrait model and
   * style silently reset every time the writer pinned a chat model. Reading the old block here
   * means every caller is correct by default rather than by remembering, which is the only version
   * of this that stays true as routes are added.
   */
  const before = await readSettings(file)
  const existing = image === undefined ? before.image : normalizeImageSettings(image)
  // Same rule for the library: a caller that only changed a model must not erase where the books
  // live. `undefined` means "leave it alone"; an empty string means "unset it".
  const shelf = library === undefined ? before.library : (typeof library === 'string' && library !== '' ? library : undefined)
  const customProviders = providers === undefined ? before.providers : normalizeProviders(providers)
  const body = {
    schemaVersion: 1, roles, image: existing,
    ...(shelf === undefined ? {} : { library: shelf }),
    ...(customProviders.length === 0 ? {} : { providers: customProviders }),
  }
  await writeFileAtomic(file, `${JSON.stringify(body, null, 2)}\n`)
}

/** A selection as the panel reads it: provider, model, and the effort when one is set. */
export function selectionOf(selection) {
  if (selection === undefined || selection === null) return null
  return {
    provider: selection.provider,
    model: selection.model,
    ...(typeof selection.reasoningEffort === 'string' && selection.reasoningEffort !== ''
      ? { reasoningEffort: selection.reasoningEffort }
      : {}),
  }
}

export function resolveModelSelection(defaults, config, role) {
  const slot = config?.[role]
  if (slot !== null && typeof slot === 'object' && typeof slot.provider === 'string' && typeof slot.model === 'string') {
    return {
      provider: slot.provider,
      model: slot.model,
      ...(typeof slot.reasoningEffort === 'string' ? { reasoningEffort: slot.reasoningEffort } : {}),
    }
  }
  return defaults
}
