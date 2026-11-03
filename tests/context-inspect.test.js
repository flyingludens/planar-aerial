import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { inspectContext } from '../lib/context.js'
import { normalizeBook } from '../lib/model.js'
import { listPrompts, promptFor, resetPromptOverride, savePromptOverride } from '../lib/prompts.js'

function sampleBook() {
  const book = normalizeBook({
    title: '雨夜',
    genre: '悬疑',
    nodes: [{
      id: 'v1', title: '卷', level: 'volume', children: [
        { id: 'c1', title: '第一章', level: 'chapter', text: '林走进雨里。' },
      ],
    }],
  })
  book.activeWritingStyle = { id: 's1', name: '冷硬派', prompt: '短句。' }
  book.mosaic.entities.push({
    id: 'e1', kind: 'character', name: '林', role: '记者', summary: '',
    aliases: [], tags: [], layout: null, portrait: '', statuses: [], custom: [],
  })
  return book
}

test('inspection groups every part by how far it reaches', () => {
  const out = inspectContext(sampleBook(), { chapterId: 'c1' })
  assert.deepEqual(out.groups.map((group) => group.id), ['editable', 'book', 'chapter', 'request'])
  const part = (key) => {
    for (const group of out.groups) {
      const found = group.parts.find((row) => row.key === key)
      if (found !== undefined) return found
    }
    return undefined
  }
  assert.match(part('writingStyle').text, /短句/, 'the active style is the editable part')
  assert.match(part('bookMeta').text, /雨夜/)
  assert.match(part('chapterCast').text, /林/, 'the chapter group reads the current chapter')
  assert.match(part('toolHints').text, /story_read/)
  assert.ok(part('chapterSummary') !== undefined, 'an empty section stays listed')
  assert.equal(part('chapterSummary').text, '')
})

test('a prompt copy overrides the official text until it is reset', async () => {
  const root = await mkdtemp(join(tmpdir(), 'prompts-'))
  const config = { settingsPath: join(root, 'settings.json') }
  try {
    const official = await promptFor('chat', config)
    assert.ok(official.length > 0)
    assert.equal((await listPrompts(config)).find((row) => row.key === 'chat').override, '')

    await savePromptOverride('chat', '我的聊天规则。', config)
    assert.equal(await promptFor('chat', config), '我的聊天规则。')

    await savePromptOverride('chat', '   ', config)
    assert.equal(await promptFor('chat', config), official, 'an empty copy restores the official text')

    await savePromptOverride('chat', '再来一份。', config)
    await resetPromptOverride('chat', config)
    assert.equal(await promptFor('chat', config), official)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('an unknown prompt key is refused rather than invented', async () => {
  const root = await mkdtemp(join(tmpdir(), 'prompts-'))
  try {
    await assert.rejects(() => promptFor('nope', { settingsPath: join(root, 'settings.json') }), /unknown prompt/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
