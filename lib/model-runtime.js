/**
 * The model runtime the shared service talks to.
 *
 * Two sources, one interface: providers the writer configured in the plugin's settings file and
 * the host's own `ctx.llm`. A role that names a `custom:` provider is served over plain
 * OpenAI-compatible HTTP; every other role is handed to the host unchanged. This is the whole
 * "independent in DSH, host by default" rule — no mode switch, just which provider the selection
 * names.
 */
import { readSettings } from './settings.js'
import { AGNES_PROVIDER, AGNES_TEXT_MODELS, resolveAgnesKey } from './agnes.js'

const textOf = (content) => (Array.isArray(content)
  ? content.map((part) => (part?.type === 'text' ? String(part.text ?? '') : '')).join('')
  : String(content ?? ''))

async function* streamOpenAI(provider, { model, messages, system, maxTokens, signal, fetchImpl }) {
  if (provider.apiKey === '') throw new Error(`provider ${provider.name} has no API key`)
  const body = {
    model,
    stream: true,
    ...(maxTokens === undefined ? {} : { max_tokens: maxTokens }),
    messages: [
      ...(system ? [{ role: 'system', content: system }] : []),
      ...(messages ?? []).map((message) => ({ role: message.role, content: textOf(message.content) })),
    ],
  }
  let response
  try {
    response = await fetchImpl(`${provider.baseURL}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${provider.apiKey}` },
      body: JSON.stringify(body),
      signal,
    })
  } catch (error) {
    throw new Error(`${provider.name} 连接失败：${error?.message ?? error}`, { cause: error })
  }
  if (!response.ok || response.body === null) {
    throw new Error(`${provider.name} answered HTTP ${response.status}`)
  }
  const reader = response.body.getReader()
  const decoder = new globalThis.TextDecoder()
  let buffer = ''
  let finishSent = false
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    let at = buffer.indexOf('\n\n')
    while (at >= 0) {
      const frame = buffer.slice(0, at)
      buffer = buffer.slice(at + 2)
      for (const line of frame.split('\n')) {
        if (!line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (payload === '[DONE]') continue
        let event
        try { event = JSON.parse(payload) } catch { continue }
        const text = event?.choices?.[0]?.delta?.content
        if (typeof text === 'string' && text !== '') yield { type: 'text-delta', text }
        const reason = event?.choices?.[0]?.finish_reason
        if (reason === 'stop' || reason === 'length') {
          finishSent = true
          yield { type: 'finish', reason: reason === 'length' ? { kind: 'max-tokens' } : { kind: 'stop' } }
        }
      }
      at = buffer.indexOf('\n\n')
    }
  }
  if (!finishSent) yield { type: 'finish', reason: { kind: 'stop' } }
}

export function createModelRuntime({ host, settingsFile, fetchImpl = fetch }) {
  const hostRuntime = host ?? {}
  const customProviders = async () => (await readSettings(settingsFile)).providers ?? []
  const findProvider = async (id) => (await customProviders()).find((provider) => provider.id === id && provider.kind !== 'image')
  const hostProviders = async () => {
    const list = typeof hostRuntime.listProviders === 'function' ? await hostRuntime.listProviders() : []
    return Array.isArray(list) ? list : []
  }
  return {
    async listProviders() {
      const custom = (await customProviders())
        .filter((provider) => provider.kind !== 'image')
        .map((provider) => ({ id: provider.id, name: provider.name }))
      const base = await hostProviders()
      // Agnes is always the built-in entry. A host row with the same id is dropped: two Agnes
      // groups would let the writer pick a provider the host may not actually have an adapter
      // for, which is exactly the NO_ADAPTER failure this replaces.
      return [
        { id: AGNES_PROVIDER.id, name: AGNES_PROVIDER.name },
        ...custom,
        ...base.filter((provider) => provider?.id !== AGNES_PROVIDER.id),
      ]
    },
    async listModels(providerId) {
      if (providerId === AGNES_PROVIDER.id) return AGNES_TEXT_MODELS
      const custom = await findProvider(providerId)
      if (custom !== undefined) return custom.models
      if (typeof hostRuntime.listModels === 'function') return hostRuntime.listModels(providerId)
      return []
    },
    async resolveModelInfo(providerId, model) {
      if (providerId === AGNES_PROVIDER.id) return {}
      const custom = await findProvider(providerId)
      if (custom !== undefined) return {}
      if (typeof hostRuntime.resolveModelInfo === 'function') return hostRuntime.resolveModelInfo(providerId, model)
      if (typeof hostRuntime.resolveModel === 'function') return hostRuntime.resolveModel(providerId, model)
      return {}
    },
    async *stream(options) {
      if (options.provider === AGNES_PROVIDER.id) {
        const apiKey = await resolveAgnesKey()
        if (apiKey !== undefined) {
          yield* streamOpenAI({ ...AGNES_PROVIDER, apiKey }, { ...options, fetchImpl })
          return
        }
        // A host that already routes Agnes can still answer when this process has no key of its
        // own (tests and a profile-managed key both look like this). With no host adapter, the
        // missing key is the real error.
        if (typeof hostRuntime.stream !== 'function') throw new Error(`${AGNES_PROVIDER.apiKeyEnv} is not set`)
      }
      const custom = await findProvider(options.provider)
      if (custom !== undefined) {
        yield* streamOpenAI(custom, { ...options, fetchImpl })
        return
      }
      if (String(options.provider).startsWith('custom:')) {
        throw new Error(`custom provider ${options.provider} is not configured`)
      }
      if (typeof hostRuntime.stream !== 'function') throw new Error('no model runtime is available')
      yield* hostRuntime.stream(options)
    },
  }
}
