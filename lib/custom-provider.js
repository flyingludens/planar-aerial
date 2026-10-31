/**
 * Reading the model catalogue of a writer-supplied OpenAI-compatible endpoint.
 *
 * The page should not ask the writer to type model ids by hand: the endpoint already publishes
 * them at /models. This module is the one place that knows the request shape, the two common
 * response envelopes, and the timeout; routes and tests call it with an injected fetch.
 */
export async function fetchProviderModels({ baseURL, apiKey, fetchImpl = fetch, timeoutMs = 15000 }) {
  const base = String(baseURL ?? '').trim().replace(/\/+$/, '')
  if (!/^https?:\/\//i.test(base)) throw new Error('接口地址必须以 http:// 或 https:// 开头')
  const controller = new globalThis.AbortController()
  const timer = globalThis.setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetchImpl(`${base}/models`, {
      headers: {
        ...(apiKey === '' ? {} : { authorization: `Bearer ${apiKey}` }),
        accept: 'application/json',
      },
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`模型接口返回 HTTP ${response.status}`)
    const body = await response.json()
    const rows = Array.isArray(body) ? body
      : Array.isArray(body?.data) ? body.data
        : Array.isArray(body?.models) ? body.models : []
    const models = []
    for (const row of rows) {
      const id = typeof row === 'string' ? row : String(row?.id ?? row?.model ?? '')
      if (id === '') continue
      const name = typeof row === 'string' ? row : String(row?.name ?? row?.id ?? id)
      if (!models.some((model) => model.id === id)) models.push({ id, name })
    }
    if (models.length === 0) throw new Error('接口没有返回任何模型')
    return models
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('读取模型列表超时', { cause: error })
    throw new Error(`无法读取模型列表：${error?.message ?? error}`, { cause: error })
  } finally {
    globalThis.clearTimeout(timer)
  }
}
