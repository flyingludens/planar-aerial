import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createStoryService, createStoryHttpHandler, createStoryMcpTools } from '../lib/index.js'

const withService = async (run) => {
  const dir = await mkdtemp(join(tmpdir(), 'story-service-'))
  try {
    await run(createStoryService({
      config: { settingsPath: join(dir, 'settings.json') },
      host: { get: () => undefined },
    }))
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

test('the shared service exposes the same routes and tools to every adapter', async () => {
  await withService(async (service) => {
    const paths = service.routes.map((row) => row.path)
    assert.ok(paths.includes('/api/story.load'), 'the book routes are in the shared service')
    assert.ok(paths.includes('/api/story.mosaic.apply'), 'and the board routes')
    assert.deepEqual(service.tools.map((tool) => tool.name), [
      'story_read', 'story_write_cast', 'story_write_settings', 'story_mosaic_query',
    ])
    assert.equal(typeof service.resolveLibrary, 'function')
  })
})

test('the HTTP adapter rejects unknown paths instead of inventing a route', async () => {
  await withService(async (service) => {
    const handler = createStoryHttpHandler(service)
    const response = await handler(new Request('http://story.local/api/story.nope', { method: 'POST' }))
    assert.equal(response.status, 404)
    assert.equal((await response.json()).ok, false)
  })
})

test('the MCP adapter keeps tool names and schemas, and renders text content', async () => {
  await withService(async (service) => {
    const tools = createStoryMcpTools(service)
    assert.equal(tools.length, service.tools.length)
    const read = tools.find((tool) => tool.name === 'story_read')
    assert.ok(read.inputSchema, 'inputSchema is present')
    assert.equal(typeof read.handler, 'function')
  })
})
