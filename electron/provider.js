/**
 * The standalone model runtime: one OpenAI-compatible chat-completions endpoint.
 *
 * The DSH plugin borrows the host's model service. Electron has no host, so this module supplies
 * the same small contract the shared service asks for: listProviders, listModels,
 * resolveModelInfo, and stream. Configuration comes from the environment for now; a settings
 * page can write these three values later without changing the service.
 */
export function createStandaloneProvider({ env = process.env, fetchImpl = fetch } = {}) {
  const baseURL = (env.STORYWRITING_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '')
  const apiKey = env.STORYWRITING_API_KEY || ''
  const model = env.STORYWRITING_MODEL || 'gpt-4o-mini'
  const provider = { id: 'standalone', name: 'Standalone' }
  const maxTokens = Number.isFinite(Number(env.STORYWRITING_MAX_TOKENS))
    ? Number(env.STORYWRITING_MAX_TOKENS)
    : 8192

  const textOf = (content) => (Array.isArray(content)
    ? content.map((part) => (part?.type === 'text' ? String(part.text ?? '') : '')).join('')
    : String(content ?? ''))

  return {
    defaultSelection: () => ({ provider: provider.id, model }),
    listProviders: () => [provider],
    async listModels() {
      return [{ id: model, name: model }]
    },
    async resolveModelInfo() {
      return { max_tokens: maxTokens }
    },
    async *stream({ messages, system, maxTokens: budget, signal }) {
      if (apiKey === '') throw new Error('STORYWRITING_API_KEY is not set')
      const body = {
        model,
        stream: true,
        max_tokens: budget ?? maxTokens,
        messages: [
          ...(system ? [{ role: 'system', content: system }] : []),
          ...(messages ?? []).map((message) => ({ role: message.role, content: textOf(message.content) })),
        ],
      }
      const response = await fetchImpl(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(body),
        signal,
      })
      if (!response.ok || response.body === null) {
        throw new Error(`model endpoint answered HTTP ${response.status}`)
      }
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
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
              yield { type: 'finish', reason: reason === 'length'
                ? { kind: 'max-tokens' }
                : { kind: 'stop' } }
            }
          }
          at = buffer.indexOf('\n\n')
        }
      }
      if (!finishSent) yield { type: 'finish', reason: { kind: 'stop' } }
    },
  }
}
