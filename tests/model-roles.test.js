import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveModelSelection } from '../lib/index.js'

const session = { provider: 'workbuddy', model: 'deepseek-v4.1-flash' }

test('an unset role falls back to the session model', () => {
  assert.deepEqual(resolveModelSelection(session, undefined, 'continue'), session)
  assert.deepEqual(resolveModelSelection(session, {}, 'chat'), session)
})

test('a configured role overrides only that role', () => {
  const config = { continue: { provider: 'agnes', model: 'small-fast' } }
  assert.deepEqual(resolveModelSelection(session, config, 'continue'), { provider: 'agnes', model: 'small-fast' })
  assert.deepEqual(resolveModelSelection(session, config, 'suggest'), session)
  assert.deepEqual(resolveModelSelection(session, config, 'chat'), session)
})

test('an incomplete slot is ignored rather than half-applied', () => {
  assert.deepEqual(resolveModelSelection(session, { continue: { provider: 'agnes' } }, 'continue'), session)
  assert.deepEqual(resolveModelSelection(session, { continue: { model: 'x' } }, 'continue'), session)
  assert.deepEqual(resolveModelSelection(session, { continue: null }, 'continue'), session)
})

test('a role may pin a reasoning effort', () => {
  const out = resolveModelSelection(session, { chat: { provider: 'p', model: 'm', reasoningEffort: 'high' } }, 'chat')
  assert.equal(out.reasoningEffort, 'high')
})

test('mosaic is a first-class role with its own override slot', () => {
  const config = { mosaic: { provider: 'agnes', model: 'm-9' } }
  assert.deepEqual(resolveModelSelection(session, config, 'mosaic'), { provider: 'agnes', model: 'm-9' })
  assert.deepEqual(resolveModelSelection(session, {}, 'mosaic'), session) // unset falls back
})
