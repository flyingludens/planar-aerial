/**
 * The built-in Agnes provider.
 *
 * Agnes is the default: its chat and image endpoints are OpenAI-compatible at the same base URL,
 * and the key is the one the writer already keeps in the environment or in `~/.dsh/.env`. There is
 * no custom-provider row to create and no second credential to enter. A different provider is
 * still possible through the model page; this module only supplies the default.
 */
import { homedir } from 'node:os'
import { join } from 'node:path'
import { readTextFile } from './io.js'

export const AGNES_PROVIDER = { id: 'agnes', name: 'Agnes', apiKeyEnv: 'AGNES_API_KEY', baseURL: 'https://apihub.agnes-ai.com/v1' }

/**
 * The public names of built-in models.
 *
 * The provider id and model id are internal routing facts; the catalogue shows a preset name
 * built from the version suffix instead. The id still travels in the selection, so the runtime
 * is unaffected.
 */
export function presetModelName(id) {
  return `preset-${String(id).replace(/^agnes-/, '')}`
}

export const AGNES_TEXT_MODELS = [
  'agnes-3.0-flash', 'agnes-2.5-flash', 'agnes-2.5-pro-alpha', 'agnes-2.5-pro-beta',
].map((id) => ({ id, name: presetModelName(id) }))

export const AGNES_IMAGE_MODELS = [
  'agnes-image-2.1-flash', 'agnes-image-2.0-flash', 'agnes-image-2.5-flash',
].map((id) => ({ id, name: presetModelName(id) }))

export const AGNES_IMAGE_MODEL = 'agnes-image-2.1-flash'

/** The per-role default when neither the writer nor the host names a model. */
export function agnesDefaultModel(role) {
  return role === 'chat' ? 'agnes-3.0-flash' : 'agnes-2.5-flash'
}

/**
 * The image credential, from the environment or the dotenv file DSH already uses.
 *
 * `process.env` wins. The file is read only when the variable is absent, because DSH loads provider
 * keys from `~/.dsh/.env` rather than exporting them into its own process.
 */
export async function resolveAgnesKey({ env = process.env, readText = readTextFile } = {}) {
  const fromEnv = env?.[AGNES_PROVIDER.apiKeyEnv]
  if (typeof fromEnv === 'string' && fromEnv.trim() !== '') return fromEnv.trim()
  const file = join(homedir(), '.dsh', '.env')
  let text
  try { text = await readText(file, 'utf8') } catch { return undefined }
  for (const line of String(text).split('\n')) {
    const trimmed = line.trim()
    if (trimmed === '' || trimmed.startsWith('#')) continue
    const at = trimmed.indexOf('=')
    if (at <= 0) continue
    if (trimmed.slice(0, at).trim() !== AGNES_PROVIDER.apiKeyEnv) continue
    const raw = trimmed.slice(at + 1).trim()
    const unquoted = /^(['"]).*\1$/.test(raw) ? raw.slice(1, -1) : raw
    return unquoted === '' ? undefined : unquoted
  }
  return undefined
}
