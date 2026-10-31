import test from 'node:test'
import assert from 'node:assert/strict'
import { cleanContinuation, continueSystem } from '../lib/index.js'

test('plain continuation is returned as-is', () => {
  assert.equal(cleanContinuation('雨声更密了。', '门外的雨'), '雨声更密了。')
})

test('fences, labels and wrapping quotes are stripped', () => {
  assert.equal(cleanContinuation('```\n他推开门。\n```', '他'), '他推开门。')
  assert.equal(cleanContinuation('续写：他推开门。', '他'), '他推开门。')
  assert.equal(cleanContinuation('“他推开门。”', '他'), '他推开门。')
})

test('an echo of the text already on screen is dropped', () => {
  // A pure echo carries nothing new: the answer starts where the page already ends.
  assert.equal(cleanContinuation('门外的雨', '门外的雨'), '')
})

test('a continuation that repeats the page before continuing keeps the new part', () => {
  // The model often restates the tail it was given and then writes on. Dropping the whole answer
  // in that case is what made the panel say "nothing to continue from here" over and over: the
  // words AFTER the repeated run-up are exactly what was asked for. The echo is trimmed, the
  // continuation survives.
  // A realistic run-up, not a four-character stub: this is what the route sends as `lead`, and
  // what a model restates before writing on.
  const runUp = '他一直站在门外的雨里，看着巷子尽头的灯一盏一盏熄灭。'
  assert.equal(
    cleanContinuation(`${runUp}然后他转身回去了。`, runUp),
    '然后他转身回去了。',
    'the repeated run-up is cut, the continuation survives')
  // A short tail is not a restatement of anything: it is the last word, and prose is expected to
  // open on it.
  assert.equal(cleanContinuation('他推开门。', '他'), '他推开门。')
})

test('an empty answer stays empty', () => {
  assert.equal(cleanContinuation('', '他'), '')
  assert.equal(cleanContinuation('   ', '他'), '')
})

test('a caret in the middle of a chapter is described as a join, not an ending', () => {
  // The prompt used to assume the caret was at the end: it was handed the tail of the chapter and
  // told to "continue from where it stops". With a caret in the middle the model wrote as if the
  // rest of the paragraph did not exist.
  const middle = continueSystem('雨下了一整夜，她坐在', '桌前，稿纸摊开。')
  assert.ok(middle.includes('JOINS the two'), 'it is told to bridge both sides')
  assert.ok(middle.includes('Text continues after the insertion point'), 'and that something follows')

  // At the true end of the chapter there is nothing to bridge, and saying so would push the model
  // into writing a transition to nothing.
  const end = continueSystem('雨下了一整夜，她坐在')
  assert.ok(!end.includes('JOINS the two'), 'no bridging rule when nothing follows')
})

test('the language rule is derived from both sides of the caret', () => {
  // The left side is empty of letters but the right side is English: sampling only `before` would
  // have chosen Chinese and the model would answer in the wrong language.
  const prompt = continueSystem('中文', 'the rain kept falling all night')
  assert.ok(prompt.includes('Write in English'), 'both halves are sampled for the language')
})

test('a caret after a full stop is told the sentence is DONE, not unfinished', () => {
  // "Continue the unfinished sentence if there is one" is right mid-sentence and useless after a
  // full stop — which is where a writer most often asks, at the end of a paragraph. The prompt
  // said nothing about that case, so the model was free to re-open a finished sentence.
  const done = continueSystem('雨下了一整夜。', '')
  assert.ok(done.includes('complete sentence'), 'it is told the sentence is complete')
  assert.ok(done.includes('NEXT sentence'), 'and that a new one is wanted')
  assert.ok(!done.includes('unfinished sentence'), 'the mid-sentence instruction is gone')

  const halfway = continueSystem('雨下了一整夜，她', '')
  assert.ok(halfway.includes('unfinished'), 'mid-sentence still asks for the rest of it')
  assert.ok(!halfway.includes('NEXT sentence'), 'and does NOT ask for a new sentence')

  // Every way a Chinese sentence can end counts as complete, not just the full stop.
  for (const ending of ['。', '！', '？', '…', '；', '”', '』', '"', '\n']) {
    const prompt = continueSystem(`雨下了${ending}`, '')
    assert.ok(prompt.includes('complete sentence'), `a sentence ending in ${JSON.stringify(ending)} is complete`)
  }
})

test('an empty after is fine: the continuation is the next sentence', async () => {
  // The question this answers: at the very end of the text `after` is empty. That is a valid
  // request, not a broken one — it means "keep going" rather than "fill a gap".
  const done = continueSystem('她推开门。', '')
  assert.ok(!done.includes('JOINS the two'), 'nothing to join, so no bridging rule')
  assert.ok(done.includes('complete sentence'))
})

test('text after the caret turns the answer into a bridge', () => {
  const bridge = continueSystem('她推开门，', '雨正落下来。')
  assert.ok(bridge.includes('JOINS the two'), 'it has to lead into what follows')
  assert.ok(!bridge.includes('NEXT sentence'), 'not a fresh sentence, a join')
})

// ---- how much a continuation is allowed to read ----

import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { apply, writeSettings } from '../lib/index.js'
import { createEmptyBook } from '../lib/model.js'
import { writeBook } from '../lib/store.js'

/** A context that records every model call, so the prompt can be inspected. */
function recordingContext(prompts, settingsPath) {
  const routes = new Map()
  return {
    routes,
    ctx: {
      effect(fn) { fn(); return () => {} },
      inject() {},
      connection: { fetch: { register(r) { routes.set(r.path, r); return () => {} } } },
      llm: {
        async *stream(request) {
          prompts.push(request)
          yield { type: 'text-delta', index: 0, text: '下一句。' }
          yield { type: 'finish', reason: { kind: 'stop' } }
        },
      },
      get(n) { return n === 'agentDefaultModel' ? { currentSelection: () => ({ provider: 'p', model: 'm' }) } : undefined },
    },
    settingsPath,
  }
}

/** Write one chapter, then ask for a continuation at `at`, recording what was sent. */
async function askContinue({ config, text, at }) {
  const prompts = []
  const ws = await mkdtemp(join(tmpdir(), 'cont-'))
  // The library is a setting: point it at this temp directory, or the route would look in the
  // real dsh home and find nothing.
  const settingsPath = join(ws, 'settings.json')
  await writeSettings(settingsPath, {}, undefined, ws)
  const { ctx, routes } = recordingContext(prompts, settingsPath)
  apply(ctx, { ...config, settingsPath })
  const folder = 'book'
  const book = createEmptyBook('T')
  book.nodes = [{ id: 'v1', title: 'V', level: 'volume', status: 'writing', text: '', children: [
    { id: 'c1', title: 'C', level: 'chapter', status: 'writing', children: [], text }] }]
  await writeBook(ws, book, undefined, folder)
  try {
    const route = routes.get('/api/story.continue')
    const request = new Request('http://x/api/story.continue', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ workspacePath: ws, bookFolder: folder, chapterId: 'c1', text, before: text.slice(0, at), after: text.slice(at) }),
    })
    const data = await (await route.fetch(request)).json()
    return { data, prompt: prompts[0]?.messages?.[0]?.content?.[0]?.text ?? '' }
  } finally {
    await rm(ws, { recursive: true, force: true })
  }
}

test('the run-up sent to the model is a window, not the whole chapter', async () => {
  // A continuation runs on a keystroke. The next sentence has to match the paragraph in front of
  // the writer, not the chapter behind them, and the whole chapter cost tokens on every Tab.
  // "终" sits immediately BEFORE the caret, so a correct window ends with it.
  const text = '起'.repeat(3000) + '终' + '后续文字。'
  const { prompt } = await askContinue({ config: { continueLeadChars: 120, continueTrailChars: 0, continueContextChars: 0 }, text, at: 3001 })
  const lead = /【光标之前】\n([\s\S]*?)$/.exec(prompt)?.[1] ?? ''
  assert.equal(lead.length, 120, `the run-up is exactly the configured window, saw ${lead.length}`)
  assert.ok(lead.endsWith('终'), 'and it is the text immediately before the caret, not the start of the chapter')
})

test('a longer window is honoured when the config asks for one', async () => {
  const text = '起'.repeat(1000) + '终'
  const short = await askContinue({ config: { continueLeadChars: 50, continueTrailChars: 0, continueContextChars: 0 }, text, at: 1001 })
  const long = await askContinue({ config: { continueLeadChars: 300, continueTrailChars: 0, continueContextChars: 0 }, text, at: 1001 })
  const length = (prompt) => (/【光标之前】\n([\s\S]*?)$/.exec(prompt)?.[1] ?? '').length
  assert.equal(length(short.prompt), 50)
  assert.equal(length(long.prompt), 300)
})

test('zero switches a window off entirely', async () => {
  const text = '前文。' + '后文。'
  const { prompt } = await askContinue({ config: { continueLeadChars: 2, continueTrailChars: 0, continueContextChars: 0 }, text, at: 3 })
  assert.ok(!prompt.includes('【光标之后】'), 'no trailing window when it is switched off')
  assert.ok(!prompt.includes('【上下文】'), 'and no overview either')
})

test('a chapter that ends before the window does not pad itself', async () => {
  // "起" * 5 with a 400-character window must send five characters, not five plus filler.
  const text = '雨下了。'
  const { prompt } = await askContinue({ config: { continueLeadChars: 400, continueTrailChars: 200, continueContextChars: 0 }, text, at: text.length })
  const lead = /【光标之前】\n([\s\S]*?)$/.exec(prompt)?.[1] ?? ''
  assert.equal(lead, text, 'the short run-up is passed through unchanged')
})

// ---- the side chat knows where the caret is ----


test('the chat is told where the writer is standing', async () => {
  // A request like "接着这里写" has no "here" without the caret. The chat used to receive the whole
  // book's digest and nothing else, so it could only answer in the abstract.
  const prompts = []
  const ws = await mkdtemp(join(tmpdir(), 'chat-'))
  // The library is a setting now: point it at this temp directory so a test never writes books
  // (or settings) into the real dsh home.
  const settingsPath = join(ws, 'settings.json')
  await writeSettings(settingsPath, {}, undefined, ws)
  const { ctx, routes } = recordingContext(prompts, settingsPath)
  apply(ctx, { settingsPath })
  const folder = 'book'
  const book = createEmptyBook('T')
  const text = '雨下了一整夜，她坐在桌前，等下一句话自己走过来。'
  book.nodes = [{ id: 'v1', title: 'V', level: 'volume', status: 'writing', text: '', children: [
    { id: 'c1', title: '第一章', level: 'chapter', status: 'writing', children: [], text }] }]
  await writeBook(ws, book, undefined, folder)
  try {
    const route = routes.get('/api/story.chat')
    const at = 7
    const request = new Request('http://x/api/story.chat', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        workspacePath: ws, bookFolder: folder, history: [], message: '接着这里写',
        chapterId: 'c1', before: text.slice(0, at), after: text.slice(at), selection: '',
      }),
    })
    await route.fetch(request)
    const system = prompts[0]?.system ?? ''
    assert.ok(system.includes('【光标之前】'), 'the prose before the caret is supplied')
    assert.ok(system.includes(text.slice(0, at)), 'and it is the actual text')
    assert.ok(system.includes('【光标之后】'), 'as is the prose after it')
    assert.ok(system.includes('第一章'), 'with the chapter named')
  } finally {
    await rm(ws, { recursive: true, force: true })
  }
})

test('a caret at the very start or end is described, not left blank', async () => {
  // Both are ordinary positions, and silence would read as "no information" rather than "nothing
  // before this".
  const prompts = []
  const ws = await mkdtemp(join(tmpdir(), 'chat2-'))
  const settingsPath = join(ws, 'settings.json')
  await writeSettings(settingsPath, {}, undefined, ws)
  const { ctx, routes } = recordingContext(prompts, settingsPath)
  apply(ctx, { settingsPath })
  const folder = 'book'
  const book = createEmptyBook('T')
  const text = '雨下了一整夜。'
  book.nodes = [{ id: 'v1', title: 'V', level: 'volume', status: 'writing', text: '', children: [
    { id: 'c1', title: 'C', level: 'chapter', status: 'writing', children: [], text }] }]
  await writeBook(ws, book, undefined, folder)
  try {
    const route = routes.get('/api/story.chat')
    for (const at of [0, text.length]) {
      prompts.length = 0
      const request = new Request('http://x/api/story.chat', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          workspacePath: ws, bookFolder: folder, history: [], message: '接着写',
          chapterId: 'c1', before: text.slice(0, at), after: text.slice(at), selection: '',
        }),
      })
      await route.fetch(request)
      const system = prompts[0]?.system ?? ''
      assert.ok(/光标在本文(开头|末尾)/.test(system), `a position at ${at} is described, saw: ${system.slice(-200)}`)
    }
  } finally {
    await rm(ws, { recursive: true, force: true })
  }
})

test('the chat reads the board as well as the book', async () => {
  // Two answers about the same story was the bug: the Harness session already carried the mosaic
  // (describeStoryBlock), while the panel's chat saw only the chapters, cast list and setting
  // titles — so "张三和李四现在是什么关系" could not be answered from the panel at all. The board
  // travels with the book now, entities and edges with their ids, the same shape the mosaic
  // routes use.
  const prompts = []
  const ws = await mkdtemp(join(tmpdir(), 'chat-board-'))
  const settingsPath = join(ws, 'settings.json')
  await writeSettings(settingsPath, {}, undefined, ws)
  const { ctx, routes } = recordingContext(prompts, settingsPath)
  apply(ctx, { settingsPath })
  const folder = 'book'
  const book = createEmptyBook('T')
  const text = '雨下了一整夜。'
  book.nodes = [{ id: 'v1', title: 'V', level: 'volume', status: 'writing', text: '', children: [
    { id: 'c1', title: '第一章', level: 'chapter', status: 'writing', children: [], text }] }]
  book.mosaic = {
    schemaVersion: 1,
    entities: [
      { id: 'e-a', kind: 'character', name: '张三', role: '主角', summary: '', statuses: [], tags: [], layout: null },
      { id: 'e-b', kind: 'character', name: '李四', role: '', summary: '', statuses: [], tags: [], layout: null },
      { id: 'e-c', kind: 'place', name: '码头仓库', summary: '堆货的地方', tags: [], layout: null },
    ],
    edges: [
      { id: 'r1', from: 'e-a', to: 'e-b', truth: { kind: '挚友', note: '' }, beliefs: [], retired: false, log: [] },
    ],
  }
  await writeBook(ws, book, undefined, folder)
  try {
    const route = routes.get('/api/story.chat')
    const request = new Request('http://x/api/story.chat', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        workspacePath: ws, bookFolder: folder, history: [], message: '张三和李四现在是什么关系？',
        chapterId: 'c1', before: text, after: '', selection: '',
      }),
    })
    await route.fetch(request)
    const system = prompts[0]?.system ?? ''
    assert.ok(system.includes('【调查板】'), 'the board is labelled in the context')
    assert.ok(system.includes('张三') && system.includes('李四'), 'the characters are named')
    assert.ok(system.includes('挚友'), 'the live relation is named')
    assert.ok(system.includes('码头仓库'), 'so is the place card')
    assert.ok(system.includes('e-a') && system.includes('r1'),
      'and they carry their ids, so a follow-up can name a row that exists')
    // The book still travels with it: the board is an addition, not a replacement.
    assert.ok(system.includes('第一章'), 'the chapter list is still supplied')
  } finally {
    await rm(ws, { recursive: true, force: true })
  }
})
