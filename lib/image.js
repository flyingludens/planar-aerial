/**
 * Character portraits: asking an image model for one, and keeping it beside the book.
 *
 * The panel is a writing tool, so a portrait is not decoration — it is the writer's answer to "who
 * is this person", and it belongs to the manuscript the way a name and a summary do. That decides
 * where it lives: inside the book's own directory, next to book.json, so moving or copying the book
 * carries the pictures with it. A copy in browser storage would vanish with a cache clear, and a
 * base64 string inside book.json would turn a readable manuscript file into a blob.
 *
 * The provider is Agnes, reached over plain HTTP rather than through `ctx.llm`: the host's model
 * service speaks the chat-completions shape only, and an image call is a different endpoint with a
 * different response. The credential is not a second key to configure — it is the SAME key the
 * writer already gave dsh for the text models, read from the environment variable the host's own
 * provider entry declares, so there is one place to set it and no place to leak it.
 */
import { join } from 'node:path'
import { ensureDir, listDir, readBytesFile, removePath, writeFileAtomic } from './io.js'
import { AGNES_IMAGE_MODEL, AGNES_PROVIDER, resolveAgnesKey } from './agnes.js'

/** The built-in image endpoint; kept as exports because callers and tests named them here. */
export const IMAGE_PROVIDER = AGNES_PROVIDER
export const resolveImageKey = resolveAgnesKey

/**
 * The image model. One name here, used by the route and shown in the failure message: when a
 * generation fails because the account has no access, the writer needs to know WHICH model was
 * asked for, or the error reads as "the feature is broken".
 */
export const IMAGE_MODEL = AGNES_IMAGE_MODEL

/**
 * A portrait is square, and 1K is the smallest output the model offers.
 *
 * Ratio 1:1 and size 1K are the model's own vocabulary (see the API reference: size takes 1K/2K/
 * 3K/4K and ratio takes 1:1, 3:4, …). A portrait card is square on the board, so anything other
 * than 1:1 would be cropped by the frame it is drawn in.
 */
export const IMAGE_REQUEST_SHAPE = { size: '1K', ratio: '1:1' }

/** Where portraits live inside a book directory. */
const PORTRAIT_DIR = 'portraits'

/**
 * The prompt for one card.
 *
 * The writer's own words come first — name, role, summary, status chips — because a portrait that
 * ignores the summary is a picture of a different character. The rest is craft the writer should
 * not have to type every time: it asks for a character portrait rather than a scene, and it keeps
 * the style neutral enough to sit beside the others on the board.
 *
 * The language is passed in: a Chinese book's names and summaries are in Chinese, and a prompt
 * half in each produces a mismatched picture.
 */
/**
 * What each style asks the model for.
 *
 * One clause per style rather than a word, because "anime" alone produces several different
 * pictures: the aim here is four looks a writer can tell apart and keep consistent across a cast.
 * Both languages are written out — a Chinese prompt with an English style clause reads as two
 * instructions and the model obeys the one it likes.
 */
const STYLE_CLAUSES = {
  realistic: {
    zh: '写实油画质感，克制的色彩，柔和自然光',
    en: 'painterly realism, restrained palette, soft natural light',
  },
  anime: {
    zh: '日式动画风格，干净线条，明快配色，赛璐璐上色',
    en: 'japanese animation style, clean linework, bright palette, cel shading',
  },
  pixel: {
    zh: '像素画风格，有限色板，清晰像素边缘，复古电子游戏美术',
    en: 'pixel art, limited palette, crisp pixel edges, retro game art',
  },
  sketch: {
    zh: '铅笔素描风格，单色，交叉排线，纸张质感',
    en: 'pencil sketch, monochrome, cross hatching, paper texture',
  },
}

/**
 * What kind of picture each kind of card wants.
 *
 * A card is a character, an item or a place, and the three are photographed differently: a person
 * is a portrait with a face in frame, an object is a still life with the object filling the frame,
 * a place is a scene with no subject in front of it. One shared "character portrait of …" opening
 * meant an item called 停摆的怀表 came back as a picture of a person holding a watch, which is a
 * picture of nobody the writer knows.
 *
 * `framing` and `subject` are both per kind: the constraint that keeps a head in frame is wrong for
 * a watch, and "centred, facing the viewer" is meaningless for a warehouse.
 */
const KIND_CLAUSES = {
  character: {
    subject: { zh: '人物', en: 'character' },
    framing: {
      zh: '整个头部完整入画，头顶留出空隙，头肩居中，面向观者，眼睛看向镜头',
      en: 'Full head visible in frame with space above the hair, head and shoulders centred, facing the viewer, looking at the camera',
    },
    rules: {
      zh: '简洁背景，画面中不要出现文字或水印，不要裁掉脸部',
      en: 'Plain background, no text, no watermark, no cropped face',
    },
  },
  item: {
    subject: { zh: '物品', en: 'object' },
    framing: {
      zh: '物品完整入画并占据画面主体，静物特写，交代材质与磨损，不需要人物',
      en: 'The object fills and dominates the frame, still-life close-up, showing material and wear, no people',
    },
    rules: {
      zh: '简洁背景，画面中不要出现文字或水印，不要出现人物',
      en: 'Plain background, no text, no watermark, no people',
    },
  },
  place: {
    subject: { zh: '场景', en: 'place' },
    framing: {
      zh: '场景全景，交代空间结构与光线，作为背景环境呈现，画面中没有需要辨认的人物',
      en: 'A wide view of the place showing its structure and light, presented as an environment, with no one in the foreground to identify',
    },
    rules: {
      zh: '画面中不要出现文字或水印，不要出现正脸人物',
      en: 'No text, no watermark, no identifiable faces',
    },
  },
}

/**
 * Which of the three pictures a card asks for: a portrait, a still life, or a scene.
 *
 * The card's own kind decides now that there are five of them. A person gets a portrait; an object
 * gets a still life; a place, an organisation and an event all get a scene — an organisation has no
 * single face, and its emblem or its room is a truer picture than an invented member. An unknown
 * kind is treated as a scene: a room with nobody in it is a harmless picture, whereas a portrait of
 * an unknown thing is a picture of a made-up stranger.
 */
export function pictureKindOf({ kind }) {
  if (kind === 'character') return 'character'
  if (kind === 'item') return 'item'
  return 'place'
}

export function buildPortraitPrompt({ name, role, summary, statuses, category, language, style, kind }) {
  const parts = []
  const who = String(name ?? '').trim()
  if (who !== '') parts.push(who)
  const roleText = String(role ?? '').trim()
  if (roleText !== '') parts.push(roleText)
  const summaryText = String(summary ?? '').trim()
  if (summaryText !== '') parts.push(summaryText)
  const chips = (Array.isArray(statuses) ? statuses : [])
    .map((status) => String(status?.label ?? '').trim())
    .filter((label) => label !== '')
  if (chips.length > 0) parts.push(chips.join('、'))
  const categoryText = String(category ?? '').trim()
  if (categoryText !== '') parts.push(categoryText)
  const subject = parts.join('，')
  // An unknown style falls back to the default rather than producing a prompt with no style clause
  // at all, which the model would fill in with whatever it likes most.
  const look = STYLE_CLAUSES[style] ?? STYLE_CLAUSES.realistic
  const shape = KIND_CLAUSES[pictureKindOf({ kind, category })] ?? KIND_CLAUSES.place
  const en = language === 'en'
  // The opening names the KIND first, then the card's own words: the model weights the opening
  // most heavily, and getting "this is an object" wrong at that point cannot be undone later in
  // the sentence.
  const head = en
    ? `${shape.subject.en} picture: ${subject || 'a subject from a novel'}`
    : `${shape.subject.zh}配图：${subject || '一部小说中的一个对象'}`
  // The STYLE clause comes before the kind's framing clause. The framing lines for objects and
  // places are strong photographic directives ("still-life close-up", "a wide view"), and when
  // they led, the style clause behind them lost: the writer saw a style change land on
  // characters (whose framing is about head placement and competes with nothing) and nowhere
  // else. Style first — it is the look of the whole picture, and the framing refines within it.
  return `${head}。${en ? look.en : look.zh}。${en ? shape.framing.en : shape.framing.zh}。${en ? shape.rules.en : shape.rules.zh}。`
}

/**
 * Ask the model for one image, and return its bytes.
 *
 * The response carries either a URL or a base64 payload depending on the account, so both are
 * handled: a URL is downloaded here (the panel never talks to the storage host), base64 is decoded.
 * Returning BYTES rather than a URL is what lets the caller decide where they are kept.
 */
export async function requestPortrait({ prompt, model, apiKey, baseURL = IMAGE_PROVIDER.baseURL, fetchImpl = fetch, signal }) {
  if (typeof apiKey !== 'string' || apiKey === '') {
    throw new Error(`no image credential: set ${IMAGE_PROVIDER.apiKeyEnv}, the same key the agnes provider already uses`)
  }
  let response
  try {
    response = await fetchImpl(`${baseURL}/images/generations`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: model ?? IMAGE_MODEL,
        prompt,
        size: IMAGE_REQUEST_SHAPE.size,
        ratio: IMAGE_REQUEST_SHAPE.ratio,
      }),
      signal,
    })
  } catch (error) {
    throw new Error(`图像接口连接失败：${error?.message ?? error}`, { cause: error })
  }
  if (!response.ok) {
    // The body carries the provider's own reason (quota, unknown model, moderation). It is more
    // useful than the status code, so it is read and passed on rather than swallowed.
    const detail = await response.text().catch(() => '')
    throw new Error(`image request failed: HTTP ${response.status}${detail === '' ? '' : ` ${detail.slice(0, 400)}`}`)
  }
  const data = await response.json()
  const first = Array.isArray(data?.data) ? data.data[0] : undefined
  if (first === undefined || first === null) throw new Error('image request returned no image')
  if (typeof first.b64_json === 'string' && first.b64_json !== '') {
    return Buffer.from(first.b64_json, 'base64')
  }
  if (typeof first.url === 'string' && first.url !== '') {
    const download = await fetchImpl(first.url, { signal })
    if (!download.ok) throw new Error(`image download failed: HTTP ${download.status}`)
    return Buffer.from(await download.arrayBuffer())
  }
  throw new Error('image request returned no image data')
}

/** The file name a portrait is stored under: one per entity, so asking again replaces it. */
export function portraitFileName(entityId) {
  const safe = String(entityId ?? '').replace(/[^a-zA-Z0-9_-]/g, '')
  if (safe === '') throw new Error('invalid entity id for a portrait')
  return `${safe}.png`
}

/**
 * The type of an image from its first bytes.
 *
 * The model returns PNG in practice, but the account may be served WebP or JPEG, and a file saved
 * with the wrong extension is a file the browser will not display. So the extension follows the
 * bytes rather than being assumed.
 */
export function imageExtension(bytes) {
  const buffer = Buffer.from(bytes)
  if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50) return 'png'
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8) return 'jpg'
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'webp'
  // An unknown container is still worth keeping: the panel shows it if the browser can, and the
  // bytes are the model's answer either way.
  return 'png'
}

/** Save one portrait inside the book, replacing any earlier one for the same entity. */
export async function savePortrait(bookDirPath, entityId, bytes) {
  const dir = join(bookDirPath, PORTRAIT_DIR)
  await ensureDir(dir)
  const base = portraitFileName(entityId).replace(/\.png$/, '')
  const extension = imageExtension(bytes)
  const name = `${base}.${extension}`
  // Write the new picture FIRST, under a temporary name, and only then remove the old one.
  //
  // The order used to be reversed, and that was a way to lose a portrait outright: the old files
  // were deleted before the new bytes were written, so an error in between — a full disk, a
  // killed process — left the card with no picture at all and nothing to recover from. The
  // atomic write makes the new image appear in one step, so at every moment the card has either
  // the picture it had or the picture that was just made.
  const target = join(dir, name)
  await writeFileAtomic(target, Buffer.from(bytes))
  // The previous file may have a different extension (png today, webp yesterday), and leaving it
  // behind would give the reader two portraits for one card. Done after the new file is in place,
  // and told which name to keep so it cannot delete what was just written.
  await removePortraits(bookDirPath, entityId, name)
  return `${PORTRAIT_DIR}/${name}`
}

/**
 * Every file that is a portrait of this entity, whatever extension it was saved under.
 *
 * `keep` is the name that was just written. It is excluded because the same entity id produces
 * the same base name for every extension: without this, saving a new picture deleted it a moment
 * after it landed, which looked exactly like "the portrait never saved".
 */
async function removePortraits(bookDirPath, entityId, keep) {
  const dir = join(bookDirPath, PORTRAIT_DIR)
  const base = portraitFileName(entityId).replace(/\.png$/, '')
  // Nothing saved yet is the normal first case, not a failure: a missing directory reads as none.
  const entries = await listDir(dir) ?? []
  for (const entry of entries) {
    const name = entry.name
    if (name === keep) continue
    if (name === base || name.startsWith(`${base}.`)) {
      await removePath(join(dir, name)).catch(() => {})
    }
  }
}

/**
 * Read a stored portrait back as a data URI.
 *
 * The panel cannot fetch the file directly: the host's route surface is POST-only, so there is no
 * static path to point an img at. Handing the bytes back inline keeps the picture and the book in
 * one place while still letting the page draw it.
 */
export async function readPortrait(bookDirPath, relativePath) {
  if (typeof relativePath !== 'string' || relativePath === '') return null
  // Only the portraits directory may be read: the relative path travels from the client, and a
  // path that could name book.json or anything above it must not be followed.
  if (!relativePath.startsWith(`${PORTRAIT_DIR}/`) || relativePath.includes('..')) return null
  const file = join(bookDirPath, relativePath)
  // A portrait that was never generated (or is already gone) reads as no bytes, and no bytes is
  // `null` — a miss, not an error.
  const bytes = await readBytesFile(file)
  if (bytes === undefined) return null
  const extension = relativePath.slice(relativePath.lastIndexOf('.') + 1)
  const type = extension === 'jpg' ? 'image/jpeg' : extension === 'webp' ? 'image/webp' : 'image/png'
  return `data:${type};base64,${bytes.toString('base64')}`
}
