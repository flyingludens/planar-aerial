import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
  buildPortraitPrompt, imageExtension, portraitFileName, readPortrait,
  requestPortrait, savePortrait,
} from '../lib/image.js'

/**
 * The portrait feature: what gets asked for, what gets stored, and what may be read back.
 *
 * No network here — `requestPortrait` takes a fetch implementation, which is the whole reason it
 * is a parameter. A test that called the real endpoint would be a test that costs money and fails
 * when the account runs out, which is not what this file is checking.
 */

/** A tiny but real PNG header, enough for the extension sniffer and for a round trip. */
const PNG_BYTES = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
])

const tempBook = async () => {
  const dir = await mkdtemp(join(tmpdir(), 'story-portrait-'))
  return { dir, done: () => rm(dir, { recursive: true, force: true }) }
}

test('the prompt is built from the card, in the book\'s own language', () => {
  // A picture that ignores the summary is a picture of a different thing, so every field the
  // writer filled in travels into the prompt.
  const zh = buildPortraitPrompt({
    kind: 'character',
    name: '沈砚', role: '主角 · 修表匠', summary: '沉默，手上有旧伤',
    statuses: [{ label: '警觉' }], language: 'zh',
  })
  assert.ok(zh.includes('沈砚'), 'the name')
  assert.ok(zh.includes('修表匠'), 'the role')
  assert.ok(zh.includes('手上有旧伤'), 'the summary')
  assert.ok(zh.includes('警觉'), 'the status chips')
  assert.ok(zh.includes('人物配图'), 'and it says what kind of picture this is')
  assert.ok(zh.includes('整个头部完整入画'), 'with the framing that keeps a face in frame')
  assert.ok(!zh.includes('Character portrait'), 'Chinese book, Chinese prompt')

  const en = buildPortraitPrompt({ kind: 'character', name: 'Shen Yan', role: 'watchmaker', language: 'en' })
  assert.ok(en.includes('Shen Yan'))
  assert.ok(en.includes('character picture'), 'and the other way round')

  // An empty card still produces a usable prompt rather than "undefined" in the instruction.
  const bare = buildPortraitPrompt({ kind: 'character' })
  assert.ok(!bare.includes('undefined'))
  assert.ok(bare.includes('人物配图'))
})

test('the picture follows the KIND of card: a watch is not a person', () => {
  // One shared "character portrait of …" opening turned an item card into a picture of a person
  // holding the item — a picture of nobody the writer knows. The three kinds are photographed
  // differently and the opening says which one this is, because that is the part the model
  // weights most.
  const item = buildPortraitPrompt({
    kind: 'item', name: '停摆的怀表',
    summary: '黄铜壳，表盖有一道裂纹', language: 'zh', style: 'realistic',
  })
  assert.ok(item.startsWith('物品配图'), `an item is an object, saw: ${item.slice(0, 20)}`)
  assert.ok(item.includes('静物特写'), 'framed as a still life')
  assert.ok(item.includes('不需要人物') && item.includes('不要出现人物'), 'and explicitly without people')
  assert.ok(!item.includes('头部'), 'no head-framing clause on a watch')

  const place = buildPortraitPrompt({ kind: 'card', category: '地点', name: '码头仓库', language: 'zh' })
  assert.ok(place.startsWith('场景配图'), 'a place is a scene')
  assert.ok(place.includes('全景'), 'a wide view, not a close-up')
  assert.ok(!place.includes('头部'), 'and no head-framing either')

  const person = buildPortraitPrompt({ kind: 'character', name: '沈砚', language: 'zh' })
  assert.ok(person.startsWith('人物配图'), 'a character is still a portrait')
  assert.ok(person.includes('整个头部完整入画'))

  // The framing differs between the three, which is the whole point of splitting them.
  assert.notEqual(item, place)
  assert.notEqual(place, person)
})

test('an unknown category is a scene, because a made-up stranger is the worse mistake', () => {
  // Only 物品 is an item; the rest of the categories in use are places and background. An
  // unrecognised one gets the scene framing: a picture with nobody in front of it is a harmless
  // illustration of an unknown card, whereas a portrait of an unknown thing invents a person.
  const unknown = buildPortraitPrompt({ kind: 'card', category: '设定', name: '青石镇', language: 'zh' })
  assert.ok(unknown.startsWith('场景配图'))
  // And the default (no kind at all) is the same.
  assert.ok(buildPortraitPrompt({ name: 'x' }).startsWith('场景配图'))
})

test('portrait files are named from the entity id, and refused when there is no usable id', () => {
  assert.equal(portraitFileName('demo-a'), 'demo-a.png')
  // The id reaches the file system, so anything that could escape the directory is stripped.
  assert.equal(portraitFileName('a/../../etc'), 'aetc.png')
  assert.throws(() => portraitFileName(''), /invalid entity id/)
  assert.throws(() => portraitFileName('///'), /invalid entity id/)
})

test('the stored extension follows the bytes, not an assumption', () => {
  // The account may be served WebP or JPEG; a PNG extension on JPEG bytes is a file the browser
  // will not draw.
  assert.equal(imageExtension(PNG_BYTES), 'png')
  assert.equal(imageExtension(Buffer.from([0xff, 0xd8, 0xff, 0xe0])), 'jpg')
  assert.equal(imageExtension(Buffer.from('RIFF0000WEBPVP8 ', 'ascii')), 'webp')
  // Unknown is still worth keeping, and png is the format the model documents.
  assert.equal(imageExtension(Buffer.from([1, 2, 3])), 'png')
})

test('a portrait is saved inside the book and read back as a data URI', async () => {
  const book = await tempBook()
  try {
    const relative = await savePortrait(book.dir, 'demo-a', PNG_BYTES)
    assert.equal(relative, 'portraits/demo-a.png')

    const onDisk = await readFile(join(book.dir, relative))
    assert.deepEqual(onDisk, PNG_BYTES, 'the bytes are kept exactly')

    const uri = await readPortrait(book.dir, relative)
    assert.ok(uri.startsWith('data:image/png;base64,'), `a data URI, saw ${uri?.slice(0, 40)}`)
    const decoded = Buffer.from(uri.split(',')[1], 'base64')
    assert.deepEqual(decoded, PNG_BYTES, 'and it round-trips')
  } finally { await book.done() }
})

test('asking again replaces the old portrait instead of leaving two', async () => {
  // The extension can differ between runs (png today, webp yesterday), so replacing by name alone
  // would leave the earlier file behind and give one card two portraits.
  const book = await tempBook()
  try {
    await savePortrait(book.dir, 'demo-a', PNG_BYTES)
    await savePortrait(book.dir, 'demo-a', Buffer.from([0xff, 0xd8, 0xff, 0xe0]))
    const names = await readdir(join(book.dir, 'portraits'))
    assert.deepEqual(names, ['demo-a.jpg'], 'one file for one card')

    // And a second card does not disturb the first.
    await savePortrait(book.dir, 'demo-b', PNG_BYTES)
    const after = await readdir(join(book.dir, 'portraits'))
    assert.deepEqual(after.sort(), ['demo-a.jpg', 'demo-b.png'])
  } finally { await book.done() }
})

test('only the portraits directory may be read, whatever path the client sends', async () => {
  const book = await tempBook()
  try {
    await writeFile(join(book.dir, 'book.json'), '{"secret":true}')
    await savePortrait(book.dir, 'demo-a', PNG_BYTES)

    // The relative path comes from the browser, so it must not be able to name anything else.
    assert.equal(await readPortrait(book.dir, 'book.json'), null, 'not the manuscript')
    assert.equal(await readPortrait(book.dir, 'portraits/../book.json'), null, 'not by walking up')
    assert.equal(await readPortrait(book.dir, '/etc/passwd'), null, 'not an absolute path')
    assert.equal(await readPortrait(book.dir, ''), null)
    assert.equal(await readPortrait(book.dir, undefined), null)
    // A portrait that was never generated is a miss, not an error.
    assert.equal(await readPortrait(book.dir, 'portraits/demo-z.png'), null)
    // The one that exists is still readable.
    assert.ok((await readPortrait(book.dir, 'portraits/demo-a.png'))?.startsWith('data:image/png'))
  } finally { await book.done() }
})

test('a missing credential is reported as such, not as a network failure', async () => {
  // The key is the agnes provider's, set once in the environment. When it is absent the writer must
  // be told which variable to set rather than shown an HTTP error.
  await assert.rejects(
    () => requestPortrait({ prompt: 'x', apiKey: undefined }),
    /no image credential: set AGNES_API_KEY/,
  )
  await assert.rejects(() => requestPortrait({ prompt: 'x', apiKey: '' }), /AGNES_API_KEY/)
})

test('the request carries the documented shape, and both response forms are accepted', async () => {
  const calls = []
  // A fetch stub: the function under test takes it as a parameter precisely so this is possible.
  const stub = (payload) => async (url, options) => {
    calls.push({ url, options })
    return {
      ok: true,
      json: async () => payload,
      text: async () => '',
      arrayBuffer: async () => PNG_BYTES,
    }
  }

  const viaBase64 = await requestPortrait({
    prompt: '一个修表匠的肖像', apiKey: 'k',
    fetchImpl: stub({ data: [{ b64_json: PNG_BYTES.toString('base64'), url: null }] }),
  })
  assert.deepEqual(viaBase64, PNG_BYTES, 'base64 is decoded to bytes')

  const [call] = calls
  assert.ok(call.url.endsWith('/images/generations'), `endpoint, saw ${call.url}`)
  assert.equal(call.options.method, 'POST')
  assert.equal(call.options.headers.authorization, 'Bearer k')
  const body = JSON.parse(call.options.body)
  assert.equal(body.model, 'agnes-image-2.1-flash', 'the image model, not a text one')
  assert.equal(body.size, '1K')
  assert.equal(body.ratio, '1:1', 'square, because the card frame is square')
  assert.equal(body.prompt, '一个修表匠的肖像')

  // The other documented form: a URL to download. The panel never talks to the storage host, so
  // the route fetches it here.
  const viaUrl = await requestPortrait({
    prompt: 'x', apiKey: 'k',
    fetchImpl: async (url, options) => {
      calls.push({ url, options })
      if (String(url).includes('/images/generations')) {
        return { ok: true, json: async () => ({ data: [{ url: 'https://storage.example/x.png' }] }), text: async () => '' }
      }
      return { ok: true, arrayBuffer: async () => PNG_BYTES, json: async () => ({}), text: async () => '' }
    },
  })
  assert.deepEqual(viaUrl, PNG_BYTES, 'and a URL is downloaded to bytes')
  assert.ok(calls.some((call) => call.url === 'https://storage.example/x.png'))
})

test('a provider error keeps the provider\'s own reason', async () => {
  // "The feature is broken" is the wrong message for "this account has no access to this model";
  // the body carries the real cause and is worth passing through.
  const failing = async () => ({
    ok: false, status: 403,
    text: async () => JSON.stringify({ error: { message: 'model not enabled for this key' } }),
    json: async () => ({}),
  })
  await assert.rejects(
    () => requestPortrait({ prompt: 'x', apiKey: 'k', fetchImpl: failing }),
    /HTTP 403.*model not enabled/,
  )

  // A successful response with no image in it is a failure too, not an empty picture.
  const empty = async () => ({ ok: true, json: async () => ({ data: [] }), text: async () => '' })
  await assert.rejects(() => requestPortrait({ prompt: 'x', apiKey: 'k', fetchImpl: empty }), /no image/)
})

test('the credential comes from the environment first, then from the file dsh keeps it in', async () => {
  // `process.env` is checked first because it is the documented place. But dsh stores provider keys
  // in a dotenv file rather than exporting them, and a plugin in the same process does not
  // necessarily see those values — so the file is read as a fallback. Without it the feature would
  // work on the machine it was written on and silently find no key anywhere else.
  const { resolveImageKey } = await import('../lib/image.js')

  assert.equal(await resolveImageKey({ env: { AGNES_API_KEY: 'from-env' }, readText: () => { throw new Error('should not read') } }),
    'from-env', 'the environment wins')

  const file = (content) => async () => content
  assert.equal(await resolveImageKey({ env: {}, readText: file('AGNES_API_KEY=from-file\n') }), 'from-file')
  assert.equal(await resolveImageKey({ env: {}, readText: file('OTHER=1\nAGNES_API_KEY="quoted"\n') }), 'quoted',
    'quotes are part of the syntax, not the value')
  assert.equal(await resolveImageKey({ env: {}, readText: file("# comment\n\nAGNES_API_KEY=after-blank\n") }), 'after-blank')
  // A file without the key, an unreadable file, and an empty value are all "no key" rather than an
  // empty string that would be sent as a bearer token.
  assert.equal(await resolveImageKey({ env: {}, readText: file('OTHER=1\n') }), undefined)
  assert.equal(await resolveImageKey({ env: {}, readText: async () => { throw new Error('ENOENT') } }), undefined)
  assert.equal(await resolveImageKey({ env: {}, readText: file('AGNES_API_KEY=\n') }), undefined)
  assert.equal(await resolveImageKey({ env: { AGNES_API_KEY: '   ' }, readText: file('AGNES_API_KEY=x\n') }), 'x',
    'whitespace in the environment is not a key')
})

test('the portrait settings live beside the role models, and survive a role write', async () => {
  // They share one file because they are one set of choices. The danger of sharing is that a write
  // to one half loses the other: pinning a chat model used to reset the portrait model and style to
  // their defaults, which the writer would only notice on their next picture.
  const { readSettings, writeSettings, normalizeImageSettings, IMAGE_STYLES } = await import('../lib/index.js')
  const book = await tempBook()
  const file = join(book.dir, 'settings.json')
  try {
    // Nothing stored yet: the defaults are what a fresh install shows.
    const empty = await readSettings(file)
    assert.equal(empty.image.provider, 'agnes', 'the built-in provider needs no setup')
    assert.equal(empty.image.model, 'agnes-image-2.1-flash')
    assert.equal(empty.image.style, 'realistic')

    await writeSettings(file, { continue: { provider: 'p', model: 'm' } }, { model: 'x-image', style: 'pixel' })
    const withImage = await readSettings(file)
    assert.equal(withImage.image.model, 'x-image')
    assert.equal(withImage.image.style, 'pixel')
    assert.equal(withImage.roles.continue.model, 'm', 'and the role is still there')

    // The one that was broken: a role-only write keeps the portrait settings.
    await writeSettings(file, { chat: { provider: 'p', model: 'm2' } })
    const after = await readSettings(file)
    assert.equal(after.image.model, 'x-image', 'the portrait model survived a role write')
    assert.equal(after.image.style, 'pixel', 'and so did the style')
    assert.equal(after.roles.chat.model, 'm2', 'while the role was written')

    // A style outside the four falls back rather than being stored and sent to the model.
    assert.deepEqual(IMAGE_STYLES, ['realistic', 'anime', 'pixel', 'sketch'])
    assert.equal(normalizeImageSettings({ style: 'watercolour' }).style, 'realistic')
    assert.equal(normalizeImageSettings({ provider: 'custom:studio' }).provider, 'custom:studio', 'a custom image provider is kept')
    assert.equal(normalizeImageSettings({ model: '  ' }).model, 'agnes-image-2.1-flash', 'blank is not a model')
  } finally { await book.done() }
})

test('the style changes the prompt, and the model travels with the request', async () => {
  const { buildPortraitPrompt } = await import('../lib/image.js')
  // Four looks a writer can tell apart. "Anime" alone produces several different pictures; the
  // clause is what makes one cast look like one book.
  const realistic = buildPortraitPrompt({ name: 'x', style: 'realistic' })
  const anime = buildPortraitPrompt({ name: 'x', style: 'anime' })
  const pixel = buildPortraitPrompt({ name: 'x', style: 'pixel' })
  const sketch = buildPortraitPrompt({ name: 'x', style: 'sketch' })
  assert.ok(realistic.includes('写实'))
  assert.ok(anime.includes('动画'))
  assert.ok(pixel.includes('像素'))
  assert.ok(sketch.includes('素描'))
  assert.notEqual(realistic, anime, 'the styles produce different prompts')

  // English books get English style clauses: a prompt half in each is two instructions.
  assert.ok(buildPortraitPrompt({ name: 'x', style: 'pixel', language: 'en' }).includes('pixel art'))

  // An unknown style is the default, not a prompt with no style in it at all.
  assert.equal(buildPortraitPrompt({ name: 'x', style: 'nope' }), realistic)

  // The model name reaches the request body: it is a setting, not a constant in the route.
  let body
  await requestPortrait({
    prompt: 'x', model: 'some-other-image-model', apiKey: 'k',
    fetchImpl: async (url, options) => {
      body = JSON.parse(options.body)
      return { ok: true, json: async () => ({ data: [{ b64_json: PNG_BYTES.toString('base64') }] }), text: async () => '' }
    },
  })
  assert.equal(body.model, 'some-other-image-model')
})
