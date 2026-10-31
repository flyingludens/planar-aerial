import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createModelRuntime } from '../lib/model-runtime.js'
import { writeSettings } from '../lib/settings.js'

const temp = async (providers) => {
  const dir = await mkdtemp(join(tmpdir(), 'story-model-'))
  const file = join(dir, 'settings.json')
  await writeSettings(file, {}, undefined, undefined, providers)
  return { dir, file }
}

test('a custom provider is listed before the host and serves its own models', async () => {
  const { dir, file } = await temp([{
    id: 'work', name: 'Work', baseURL: 'https://example.test/v1', apiKey: 'k',
    models: [{ id: 'm1', name: 'M1' }],
  }])
  try {
    const runtime = createModelRuntime({
      settingsFile: file,
      host: {
        listProviders: () => [{ id: 'host', name: 'Host' }],
        listModels: async () => [{ id: 'h1', name: 'H1' }],
      },
    })
    assert.deepEqual(await runtime.listProviders(), [
      { id: 'agnes', name: 'Agnes' },
      { id: 'custom:work', name: 'Work' },
      { id: 'host', name: 'Host' },
    ])
    assert.deepEqual(await runtime.listModels('custom:work'), [{ id: 'm1', name: 'M1' }])
    assert.deepEqual(await runtime.listModels('host'), [{ id: 'h1', name: 'H1' }])
  } finally { await rm(dir, { recursive: true, force: true }) }
})

test('a custom provider streams OpenAI-compatible SSE, and a host provider falls through', async () => {
  const { dir, file } = await temp([{
    id: 'work', name: 'Work', baseURL: 'https://example.test/v1', apiKey: 'k',
    models: [{ id: 'm1', name: 'M1' }],
  }])
  try {
    const calls = []
    const runtime = createModelRuntime({
      settingsFile: file,
      fetchImpl: async (url, init) => {
        calls.push({ url, init })
        return new Response([
          'data: {"choices":[{"delta":{"content":"he"}}]}\n',
          'data: {"choices":[{"delta":{"content":"llo"},"finish_reason":"stop"}]}\n',
          'data: [DONE]\n',
        ].join('\n'), { status: 200 })
      },
      host: {
        async *stream() { yield { type: 'text-delta', text: 'host' }; yield { type: 'finish', reason: { kind: 'stop' } } },
      },
    })
    const chunks = []
    for await (const chunk of runtime.stream({ provider: 'custom:work', model: 'm1', messages: [{ role: 'user', content: [{ type: 'text', text: 'hi' }] }] })) chunks.push(chunk)
    assert.equal(calls[0].url, 'https://example.test/v1/chat/completions')
    assert.deepEqual(chunks, [
      { type: 'text-delta', text: 'he' },
      { type: 'text-delta', text: 'llo' },
      { type: 'finish', reason: { kind: 'stop' } },
    ])
    const hostChunks = []
    for await (const chunk of runtime.stream({ provider: 'host', model: 'x', messages: [] })) hostChunks.push(chunk)
    assert.equal(hostChunks[0].text, 'host')
    await assert.rejects(async () => {
      for await (const _ of runtime.stream({ provider: 'custom:missing', model: 'x', messages: [] })) { /* noop */ }
    }, /not configured/)
  } finally { await rm(dir, { recursive: true, force: true }) }
})

test('the provider catalogue reader accepts both common /models envelopes', async () => {
  const { fetchProviderModels } = await import('../lib/custom-provider.js')
  const calls = []
  const read = (body) => async (url, init) => {
    calls.push({ url, init })
    return new Response(JSON.stringify(body), { status: 200 })
  }
  assert.deepEqual(
    await fetchProviderModels({ baseURL: 'https://x.test/v1/', apiKey: 'k', fetchImpl: read({ data: [{ id: 'a', name: 'Model A' }, { id: 'b' }] }) }),
    [{ id: 'a', name: 'Model A' }, { id: 'b', name: 'b' }],
  )
  assert.equal(calls[0].url, 'https://x.test/v1/models')
  assert.equal(calls[0].init.headers.authorization, 'Bearer k')
  assert.deepEqual(
    await fetchProviderModels({ baseURL: 'https://x.test/v1', apiKey: '', fetchImpl: read({ models: ['m'] }) }),
    [{ id: 'm', name: 'm' }],
  )
  await assert.rejects(
    fetchProviderModels({ baseURL: 'ftp://x', apiKey: '', fetchImpl: read({}) }),
    /http/,
  )
})

test('built-in Agnes is the only Agnes group, even when the host advertises one', async () => {
  const { dir, file } = await temp([])
  try {
    const runtime = createModelRuntime({
      settingsFile: file,
      host: {
        listProviders: () => [{ id: 'agnes', name: 'Host Agnes' }],
        listModels: () => [{ id: 'host-model', name: 'Host model' }],
      },
    })
    assert.deepEqual(await runtime.listProviders(), [{ id: 'agnes', name: 'Agnes' }])
    assert.ok((await runtime.listModels('agnes')).some((model) => model.id === 'agnes-3.0-flash'),
      'the built-in catalogue is used, not the host row')
  } finally { await rm(dir, { recursive: true, force: true }) }
})
