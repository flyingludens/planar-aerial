/* global fetch */
import test from 'node:test'
import assert from 'node:assert/strict'
import { startMcpServer } from '../electron/mcp.js'

const tool = {
  name: 'story_echo',
  description: 'echo one value',
  parameters: { type: 'object', properties: { value: { type: 'string' } }, required: ['value'] },
  output: { render: (args) => [{ type: 'text', text: `echo:${args.value}` }] },
  execute: async (args) => ({ value: args.value }),
}

test('the MCP endpoint speaks initialize, tools/list and tools/call', async () => {
  const server = await startMcpServer({ tools: [tool], version: '0.1.0-beta.1' })
  try {
    const post = (body, token = server.token) => fetch(server.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    })
    const init = await post({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05' } })
    assert.equal(init.status, 200)
    const initialized = await init.json()
    assert.equal(initialized.result.serverInfo.name, 'planar-aerial')
    assert.equal(initialized.result.serverInfo.version, '0.1.0-beta.1')

    const listed = await (await post({ jsonrpc: '2.0', id: 2, method: 'tools/list' })).json()
    assert.deepEqual(listed.result.tools.map((entry) => entry.name), ['story_echo'])

    const called = await (await post({
      jsonrpc: '2.0', id: 3, method: 'tools/call',
      params: { name: 'story_echo', arguments: { value: '雨' } },
    })).json()
    assert.equal(called.result.isError, false)
    assert.equal(called.result.content[0].text, 'echo:雨')

    const denied = await post({ jsonrpc: '2.0', id: 4, method: 'tools/list' }, 'wrong')
    assert.equal(denied.status, 401)
  } finally {
    await server.close()
  }
})
