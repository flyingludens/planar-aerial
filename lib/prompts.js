/**
 * The model's standing instructions, and the writer's copies of them.
 *
 * Each generation path has one official system prompt, kept in the module that owns the prompt's
 * shape (`llm.js` for the prose/board prompts, `ai.js` for chat, review and summaries). This file
 * only indexes them, so the context page can list one row per prompt and a route can ask for the
 * text a call should use.
 *
 * An override is the writer's copy of one prompt. It lives in `prompts.json` beside the plugin's
 * settings, not inside a book: a system prompt is how the model behaves, not something one
 * manuscript owns. Removing the copy restores the official text.
 *
 * Copies are versioned as separate documents (v2): the page can keep several named copies of one
 * prompt, and `替换` only points the override at one of them. The documents themselves are
 * immutable — editing means adding a new document. A v1 file (the value was the override text)
 * is read as a single applied copy with no documents.
 */
import { join } from 'node:path'
import { readTextFile, writeFileAtomic } from './io.js'
import { pluginHome } from './settings.js'
import {
  SUGGEST_SYSTEM, OVERVIEW_CHAPTER_SYSTEM, OVERVIEW_GLOBAL_SYSTEM,
  MOSAIC_CHECK_SYSTEM, MOSAIC_ASK_SYSTEM, MOSAIC_RELATE_SYSTEM,
} from './llm.js'
import {
  CHAT_SYSTEM, REVIEW_SYSTEM, CRITIQUE_SYSTEM, CONSISTENCY_SYSTEM, WRITING_STYLE_SYSTEM,
} from './ai.js'

/** One entry per system prompt the model can be given, in the order the page lists them. */
export const PROMPTS = [
  { key: 'suggest', official: SUGGEST_SYSTEM },
  { key: 'chat', official: CHAT_SYSTEM },
  { key: 'review', official: REVIEW_SYSTEM },
  { key: 'critique', official: CRITIQUE_SYSTEM },
  { key: 'consistency', official: CONSISTENCY_SYSTEM },
  { key: 'overview.chapter', official: OVERVIEW_CHAPTER_SYSTEM },
  { key: 'overview.global', official: OVERVIEW_GLOBAL_SYSTEM },
  { key: 'mosaic.check', official: MOSAIC_CHECK_SYSTEM },
  { key: 'mosaic.ask', official: MOSAIC_ASK_SYSTEM },
  { key: 'mosaic.relate', official: MOSAIC_RELATE_SYSTEM },
  { key: 'writingStyle', official: WRITING_STYLE_SYSTEM },
]

const BY_KEY = new Map(PROMPTS.map((entry) => [entry.key, entry]))

export function promptsPath(config) {
  return join(pluginHome(config), 'prompts.json')
}

/** The whole prompts file: per key, the applied override plus the copy documents. */
function parsePromptFile(text) {
  if (text === undefined) return { overrides: {}, docs: {} }
  try {
    const raw = JSON.parse(text)
    const held = raw?.prompts
    if (held === null || typeof held !== 'object' || Array.isArray(held)) return { overrides: {}, docs: {} }
    const overrides = {}
    const docs = {}
    for (const [key, value] of Object.entries(held)) {
      if (!BY_KEY.has(key)) continue
      if (typeof value === 'string') {
        // v1: the value is the applied copy itself.
        if (value.trim() !== '') overrides[key] = value
        continue
      }
      if (value === null || typeof value !== 'object' || Array.isArray(value)) continue
      if (typeof value.override === 'string' && value.override.trim() !== '') overrides[key] = value.override
      const rows = (Array.isArray(value.docs) ? value.docs : [])
        .filter((row) => row !== null && typeof row === 'object'
          && typeof row.id === 'string' && row.id !== ''
          && typeof row.text === 'string' && Number.isFinite(row.at))
        .map((row) => ({ id: row.id, text: row.text, at: row.at }))
      if (rows.length > 0) docs[key] = rows
    }
    return { overrides, docs }
  } catch {
    // A malformed file is an empty set of copies, not a broken generation path: the official
    // prompt is always a usable answer.
    return { overrides: {}, docs: {} }
  }
}

async function readPromptFile(config) {
  const text = await readTextFile(promptsPath(config))
  return parsePromptFile(text)
}

async function writePromptFile(config, { overrides, docs }) {
  const cleanOverrides = {}
  for (const [key, value] of Object.entries(overrides ?? {})) {
    if (!BY_KEY.has(key) || typeof value !== 'string' || value.trim() === '') continue
    cleanOverrides[key] = value
  }
  const cleanDocs = {}
  for (const [key, list] of Object.entries(docs ?? {})) {
    if (!BY_KEY.has(key) || !Array.isArray(list)) continue
    const rows = list
      .filter((row) => row !== null && typeof row === 'object'
        && typeof row.id === 'string' && row.id !== '' && typeof row.text === 'string' && Number.isFinite(row.at))
      .map((row) => ({ id: row.id, text: row.text, at: row.at }))
    if (rows.length > 0) cleanDocs[key] = rows
  }
  const prompts = {}
  for (const key of new Set([...Object.keys(cleanOverrides), ...Object.keys(cleanDocs)])) {
    prompts[key] = { ...(cleanDocs[key] !== undefined ? { docs: cleanDocs[key] } : {}), ...(cleanOverrides[key] !== undefined ? { override: cleanOverrides[key] } : {}) }
  }
  await writeFileAtomic(promptsPath(config), JSON.stringify({ schemaVersion: 2, prompts }, null, 2))
  return { overrides: cleanOverrides, docs: cleanDocs }
}

/** The text a model call should use: the writer's copy when there is one, the official text otherwise. */
export async function promptFor(key, config) {
  const spec = BY_KEY.get(key)
  if (spec === undefined) throw new Error(`unknown prompt: ${String(key)}`)
  const { overrides } = await readPromptFile(config)
  return overrides[key] ?? spec.official
}

/** Every prompt with both halves and its copy documents, for the context page. */
export async function listPrompts(config) {
  const { overrides, docs } = await readPromptFile(config)
  return PROMPTS.map(({ key, official }) => {
    // A legacy override with no document yet still shows as one entry — the applied copy itself.
    const rows = docs[key] ?? (overrides[key] !== undefined ? [{ id: '__applied__', text: overrides[key], at: null }] : [])
    return { key, official, override: overrides[key] ?? '', docs: rows }
  })
}

/** Point the override at one text. Empty means back to the official prompt. */
export async function savePromptOverride(key, text, config) {
  if (!BY_KEY.has(key)) throw new Error(`unknown prompt: ${String(key)}`)
  const { overrides, docs } = await readPromptFile(config)
  const value = String(text ?? '')
  if (value.trim() === '') delete overrides[key]
  else overrides[key] = value
  await writePromptFile(config, { overrides, docs })
  return listPrompts(config)
}

/** Add one copy document without touching the applied override. */
export async function addPromptDoc(key, text, config) {
  if (!BY_KEY.has(key)) throw new Error(`unknown prompt: ${String(key)}`)
  const { overrides, docs } = await readPromptFile(config)
  const value = String(text ?? '')
  if (value.trim() === '') throw new Error('prompt doc needs text')
  const list = [...(docs[key] ?? []), { id: `d${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, text: value, at: Date.now() }]
  docs[key] = list.slice(-50)
  await writePromptFile(config, { overrides, docs })
  return listPrompts(config)
}

/** Drop the writer's copy of one prompt. The official prompt is never rewritten. */
export async function resetPromptOverride(key, config) {
  if (!BY_KEY.has(key)) throw new Error(`unknown prompt: ${String(key)}`)
  const { overrides, docs } = await readPromptFile(config)
  delete overrides[key]
  await writePromptFile(config, { overrides, docs })
  return listPrompts(config)
}
