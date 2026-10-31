import test from 'node:test'
import assert from 'node:assert/strict'
import { modelMaxTokens } from '../lib/ai.js'

test('the output budget is the model\'s advertised maximum', async () => {
  const ctx = { llm: { resolveModelInfo: async () => ({ max_tokens: 32000 }) } }
  assert.equal(await modelMaxTokens(ctx, { provider: 'p', model: 'm' }, 8000), 32000)
})

test('a host that does not disclose a limit falls back to the route default', async () => {
  const ctx = { llm: { resolveModelInfo: async () => ({ max_tokens: null }) } }
  assert.equal(await modelMaxTokens(ctx, { provider: 'p', model: 'underdisclosed' }, 8000), 8000)
})
