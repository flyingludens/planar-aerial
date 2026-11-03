import { chapterFinalText, wholeFinalText } from './text.js'
import { hashText } from './hash.js'
import { factStatuses } from './facts.js'
import { mosaicDigest } from './mosaic.js'

/**
 * 统一的上下文组装层：section 构建函数 + 每个消费场景的配方（RECIPES）+ buildContext 入口。
 *
 * 判断「我改的是配置还是逻辑」的标尺（改配方表不该需要写新测试）：
 * - 配方级调整（加/删/拆/排序 section、改预算）只动 RECIPES，锁 section 文本格式的测试应原样通过。
 * - 新增 section 或修改裁剪规则，才需要动 builder 或写新测试。
 *
 * 三条命名规则：
 * 1. 前缀表归属——`chapter*` 按当前章过滤；`global`/`other` 是全书视角；`board*` 是板面原样；
 *    无前缀的 book 级 section（bookMeta/chapterList/previousChapterText…）不过滤。
 * 2. section 构建函数与键同名——`sectionBookMeta` 对应配方里的 `'bookMeta'`，
 *    每个 builder 吃 (book, options) 吐文本，空字符串 = 该 section 自动缺席。
 * 3. 请求携带的 section 不碰 book——caretWindows/chapterText 的数据来自 options，
 *    与 book 派生的 section 的边界一眼可辨。
 *
 * 扩展方式：
 * - 新增 section：写 sectionXxx + 在需要的配方数组里加一个词。空返回自动缺席，无需特判。
 * - 拆分 section：与新增等价（两个新函数，替换配方里那一个词）。
 * - 调优先级：改数组顺序即改优先级——裁剪从尾部丢，排前面的先保住。
 * - 同一 section 在不同场景要不同参数时，才把数组元素升级为 { section, ...参数 } 对象；
 *    目前没有 section 需要它，等第一个真实需求出现再加。
 */

/** 每个消费场景的上下文配方。sections 按优先级排列，超预算时从尾部丢（pinned 的除外）。 */
const RECIPES = {
  // 逐键续写：预算刻意压小（默认 200 字），这句话要跟的是光标前的段落，不是全书。
  continue: {
    sections: ['previousChapterText', 'nextChapterText', 'bookMeta', 'writingStyle', 'chapterSummary',
      'chapterCast', 'chapterRelations', 'globalSummary', 'otherSummaries', 'suspectFacts'],
    budget: (config) => Math.max(0, Number.isFinite(config?.continueContextChars) ? config.continueContextChars : 200),
  },
  // 选段改写：用满 overviewBudget——改写必须知道这句在整章里的位置。
  suggest: {
    sections: ['previousChapterText', 'nextChapterText', 'bookMeta', 'writingStyle', 'chapterSummary',
      'chapterCast', 'chapterRelations', 'globalSummary', 'otherSummaries', 'settingCards', 'suspectFacts'],
    budget: (config) => Math.max(0, Number.isFinite(config?.overviewBudget) ? config.overviewBudget : 2000),
  },
  // 侧栏聊天：不设预算。boardDigest 带 id，追问才能指向具体一条边。
  chat: {
    sections: ['bookMeta', 'writingStyle', 'chapterList', 'chapterCast', 'settingCards', 'boardDigest',
      'suspectFacts', 'caretWindows'],
    budget: () => Infinity,
  },
  // 板面问答：问题关于板面，但「这条关系还成立吗」需要章的内容才能回答。
  // globalSummary 沿用旧 describeStory 的行为：梗概存在就随故事一起给。
  mosaicAsk: {
    sections: ['bookMeta', 'writingStyle', 'chapterList', 'chapterCast', 'settingCards', 'globalSummary', 'boardDigest'],
    budget: () => Infinity,
  },
  // 检查本章：唯一从正文里「读出」提案的场景，所以正文给得足。
  mosaicCheck: {
    sections: ['boardDigest', 'chapterText'],
    budget: () => 20000,
  },
  // Harness 会话开场（同步路径，readBookSync 喂同一入口）：静态的 L1 层，细节留给 story_read。
  // 两个 style 选项沿用旧提示词的格式（单行章节清单、带占位的元信息行），迁移不改样式。
  harness: {
    sections: ['bookMeta', 'chapterList', 'chapterCast', 'settingCards', 'boardDigest',
      'globalSummary', 'chapterSummaryLines', 'toolHints'],
    budget: () => Infinity,
    options: { chapterListStyle: 'inline', bookMetaStyle: 'harness', castStyle: 'harness' },
  },
}

/** 裁剪时永不丢弃的 section：前后章原文是续写的连续性锚点。 */
const PINNED = new Set(['previousChapterText', 'nextChapterText'])

// ---------------------------------------------------------------------------
// Section 构建函数。每个吃 (book, options)，吐文本；空字符串 = 自动缺席。
// ---------------------------------------------------------------------------

/**
 * 书的元信息一行。options.bookMetaStyle === 'harness' 沿用旧提示词的格式
 * （《书名》 · 体裁，视角/时态缺位用 — 占位）；默认是 prose 路由的紧凑版，
 * 全空的字段直接省略、整行为空时缺席。
 */
function sectionBookMeta(book, options = {}) {
  if (options.bookMetaStyle === 'harness') {
    const lines = [`《${book.title || '未命名'}》${book.genre ? ` · ${book.genre}` : ''}`]
    if (book.pov || book.tense) lines.push(`视角：${book.pov || '—'}；时态：${book.tense || '—'}`)
    return lines.join('\n')
  }
  const parts = [book.title ? `《${book.title}》` : '', book.genre ? `体裁：${book.genre}` : '',
    book.pov ? `视角：${book.pov}` : '', book.tense ? `时态：${book.tense}` : ''].filter(Boolean)
  return parts.join(' ')
}

/**
 * 章节标题+字数的清单。默认多行编号列表；options.chapterListStyle === 'inline' 时
 * 单行顿号连接（story_read 渲染与旧 harness 提示词的既有格式，迁移不改样式）。
 */
function sectionChapterList(book, options = {}) {
  if (options.chapterListStyle === 'inline') {
    const rows = book.chapters
      .map((c) => `${c.title}（${chapterFinalText(c) === '' ? '空' : `${chapterFinalText(c).length} 字`}）`)
      .join('、')
    return `章节：${rows || '暂无'}`
  }
  const rows = book.chapters
    .map((c, i) => `${i + 1}. ${c.title || '未命名'}（${chapterFinalText(c) === '' ? '空' : `${chapterFinalText(c).length} 字`}）`)
  return rows.length === 0 ? '' : `章节：\n${rows.join('\n')}`
}

/** 本章梗概；basedOn 与当前正文不符时标注「可能滞后」。 */
function sectionChapterSummary(book, options) {
  const chapter = chapterOf(book, options.chapterId)
  const cached = chapter === undefined ? undefined : book.overview.chapters[chapter.id]
  if (cached?.text === undefined) return ''
  const stale = cached.basedOn !== hashText(chapterFinalText(chapter))
  return `本章梗概：${cached.text}${stale ? '（摘要可能滞后）' : ''}`
}

/** 全书梗概；同上的滞后标记。 */
function sectionGlobalSummary(book) {
  const cached = book.overview.global
  if (!cached?.text) return ''
  const stale = cached.basedOn !== hashText(wholeFinalText(book))
  return `全书梗概：${cached.text}${stale ? '（可能滞后）' : ''}`
}

/**
 * The writer's chosen 流派: a saved prompt that all generation should follow.
 *
 * It is a section rather than a route option because it is part of the story's voice, not of one
 * action: rewrite, continuation and chat must all sound like the same book.
 */
function sectionWritingStyle(book) {
  const writingStyle = book.activeWritingStyle
  if (writingStyle === null || writingStyle === undefined || typeof writingStyle.prompt !== 'string' || writingStyle.prompt.trim() === '') return ''
  const name = typeof writingStyle.name === 'string' ? writingStyle.name.trim() : ''
  return `文风流派${name === '' ? '' : `「${name}」`}：${writingStyle.prompt.trim()}`
}

/** 其他章的梗概（当前章除外）。 */
function sectionOtherSummaries(book, options) {
  const others = book.chapters.filter((c) => c.id !== options.chapterId && book.overview.chapters[c.id]?.text)
  return others.length === 0 ? '' : `其他章：${others.map((c) => `${c.title}——${book.overview.chapters[c.id].text}`).join('；')}`
}

/**
 * 每章一行的梗概，harness 开场用；读的是树节点的 summary 字段（概览页写进 node 的），
 * 不是 overview 缓存。上限防止长书把开场块撑爆——章数按位置走，空梗概不占行。
 */
function sectionChapterSummaryLines(book) {
  const lines = []
  for (let i = 0; i < book.chapters.length && i < 40; i += 1) {
    const c = book.chapters[i]
    const summary = (c.summary ?? '').trim()
    if (summary === '') continue
    lines.push(`第${i + 1}章 ${(c.title || '未命名').trim()}：${summary.slice(0, 80)}`)
  }
  return lines.length === 0 ? '' : `梗概：\n${lines.join('\n')}`
}

/**
 * 板面人物名单。点名规则跟着语境走：配方带着 chapterId 时只列正文出现过名字的
 * （标签「本章人物」），没有章（harness 开场、无章聊天）就是全名单（标签「人物」）。
 * options.castStyle === 'harness' 沿用旧提示词的全角括号（角色名（摄影师））。
 */
function sectionChapterCast(book, options = {}) {
  const chapter = chapterOf(book, options.chapterId)
  const scope = chapter === undefined ? '' : chapterFinalText(chapter)
  const all = (book.mosaic?.entities ?? []).filter((e) => e.kind === 'character')
  const matched = all.filter((c) => c.name && scope.includes(c.name))
  const cast = scope === '' ? all : matched
  const label = options.chapterId === undefined ? '人物' : '本章人物'
  const render = options.castStyle === 'harness'
    ? (c) => `${c.name}${c.role ? `（${c.role}）` : ''}`
    : (c) => `${c.name}(${c.role || '角色'})`
  return cast.length === 0 ? '' : `${label}：${cast.map(render).join('、')}`
}

/** 双端都出现在本章的关系。 */
function sectionChapterRelations(book, options) {
  const chapter = chapterOf(book, options.chapterId)
  const scope = chapter === undefined ? '' : chapterFinalText(chapter)
  const byName = new Map((book.mosaic?.entities ?? []).filter((e) => e.kind === 'character').map((c) => [c.id, c.name]))
  const ids = new Set((book.mosaic?.entities ?? []).filter((e) => e.kind === 'character' && e.name && scope.includes(e.name)).map((e) => e.id))
  const edges = (book.mosaic?.edges ?? []).filter((e) => e.retired !== true && ids.has(e.from) && ids.has(e.to))
  return edges.length === 0 ? '' : `关系：${edges.map((r) => `${byName.get(r.from) ?? '?'}→${byName.get(r.to) ?? '?'}(${r.truth?.kind ?? ''})`).join('、')}`
}

/** 设定卡名单。 */
function sectionSettingCards(book) {
  // Every kind that is not a person: a place, an organisation, an object and an event are all
  // "设定" from the writer's point of view, and splitting them into four prompt lines would spend
  // the budget on the taxonomy instead of the story.
  const cards = (book.mosaic?.entities ?? []).filter((e) => e.kind !== 'character')
  return cards.length === 0 ? '' : `设定：${cards.map((s) => s.name).join('、')}`
}

/** 板面的 id 化清单：每张卡一行、每条边一行。数据层实现在 lib/mosaic.js。 */
function sectionBoardDigest(book) {
  return mosaicDigest(book.mosaic)
}

/**
 * 板面事实核查的非 valid 项（suspect/orphaned）。valid 不列：安静的板面是常态，
 * 逐条列出通过的检查会淹没信号。
 */
function sectionSuspectFacts(book) {
  const checked = factStatuses(book.mosaic, book).filter((row) => row.status !== 'valid')
  if (checked.length === 0) return ''
  const lines = checked.map((row) => {
    const at = row.basedOn?.chapter === undefined ? '' : '（可能滞后）'
    return row.status === 'orphaned' ? `${row.name}（原章节已删除）` : `${row.name}${at}`
  })
  return `以下板面事实可能已滞后于正文，谨慎引用：\n${lines.join('\n')}`
}

/** 上一章的正文原文（连续性锚点）。前缀是既有的 prompt 格式，迁移不改。 */
function sectionPreviousChapterText(book, options) {
  const index = chapterIndex(book, options.chapterId)
  const before = index > 0 ? book.chapters[index - 1] : undefined
  const text = chapterFinalText(before ?? {})
  return text === '' ? '' : `上一章：${text}`
}

/** 下一章的正文原文（连续性锚点）。 */
function sectionNextChapterText(book, options) {
  const index = chapterIndex(book, options.chapterId)
  const after = index >= 0 && index + 1 < book.chapters.length ? book.chapters[index + 1] : undefined
  const text = chapterFinalText(after ?? {})
  return text === '' ? '' : `下一章：${text}`
}

/** 光标前/后窗口与选中段落——请求携带，不碰 book。 */
function sectionCaretWindows(_book, options) {
  const { before = '', after = '', selection = '', leadChars = 600, trailChars = 300 } = options
  const lead = typeof before === 'string' && leadChars > 0 ? before.slice(-leadChars) : ''
  const trail = typeof after === 'string' && trailChars > 0 ? after.slice(0, trailChars) : ''
  const passage = typeof selection === 'string' ? selection : ''
  const position = lead.trim() === '' && trail.trim() === ''
    ? ''
    : `${lead.trim() === '' ? '（光标在本文开头）' : `【光标之前】\n${lead}`}\n\n${trail.trim() === '' ? '（光标在本文末尾，后面没有内容）' : `【光标之后】\n${trail}`}`
  return [passage.trim() === '' ? '' : `【已选中的段落】\n${passage}`, position].filter((part) => part !== '').join('\n\n')
}

/** 本章全文——请求优先，回退盘上正文。 */
function sectionChapterText(book, options) {
  const chapter = chapterOf(book, options.chapterId)
  return typeof options.text === 'string' && options.text.trim() !== '' ? options.text : (chapter === undefined ? '' : chapterFinalText(chapter))
}

/** harness 开场的工具指引：细节留给按需调用。 */
function sectionToolHints() {
  return [
    '需要全文时调用 story_read；需要调查板的实体、关系、信念或设定卡时调用 story_mosaic_query。',
    '用户要新增人物、关系或世界观时，走调查板自己的审核流程提出，',
    '这段对话不能直接改板面。',
  ].join('\n')
}

const BUILDERS = {
  bookMeta: sectionBookMeta,
  chapterList: sectionChapterList,
  chapterSummary: sectionChapterSummary,
  writingStyle: sectionWritingStyle,
  globalSummary: sectionGlobalSummary,
  otherSummaries: sectionOtherSummaries,
  chapterSummaryLines: sectionChapterSummaryLines,
  chapterCast: sectionChapterCast,
  chapterRelations: sectionChapterRelations,
  settingCards: sectionSettingCards,
  boardDigest: sectionBoardDigest,
  suspectFacts: sectionSuspectFacts,
  previousChapterText: sectionPreviousChapterText,
  nextChapterText: sectionNextChapterText,
  caretWindows: sectionCaretWindows,
  chapterText: sectionChapterText,
  toolHints: sectionToolHints,
}

/**
 * Where each section belongs when the writer inspects the context rather than sending it.
 *
 * `editable` is the one place the writer owns outright (the active 流派); the other three are
 * system-maintained, split by how far the text reaches: the whole book, the current chapter, or
 * only this request (caret windows, the chapter body handed to check). The split is what tells a
 * reader "this line changes when you move the caret" apart from "this line is your style".
 */
export const INSPECT_GROUPS = [
  { id: 'editable', parts: ['writingStyle'] },
  { id: 'book', parts: ['bookMeta', 'chapterList', 'globalSummary', 'settingCards', 'boardDigest', 'suspectFacts'] },
  { id: 'chapter', parts: ['chapterCast', 'chapterRelations', 'chapterSummary', 'otherSummaries',
    'previousChapterText', 'nextChapterText'] },
  { id: 'request', parts: ['caretWindows', 'chapterText', 'toolHints'] },
]

/**
 * The current context, section by section, for the management page.
 *
 * Same builders as a real send, so the page cannot show a prettier or older version than the
 * model would get. Empty text stays in the list: a section that is empty right now (no summary
 * written, no previous chapter) is a fact the writer should see, not a row to hide.
 */
export function inspectContext(book, options = {}) {
  const { chapterId } = options
  return {
    groups: INSPECT_GROUPS.map(({ id, parts }) => ({
      id,
      parts: parts.map((key) => ({
        key,
        // Only the chapter group reads the current chapter; the book group is chapter-independent
        // and the request group is supplied by the caller.
        text: BUILDERS[key](book, id === 'chapter' ? { chapterId } : {}),
      })),
    })),
  }
}

// ---------------------------------------------------------------------------
// 入口与裁剪
// ---------------------------------------------------------------------------

function chapterOf(book, chapterId) {
  return chapterId === undefined ? undefined : book.chapters.find((c) => c.id === chapterId)
}

function chapterIndex(book, chapterId) {
  return chapterId === undefined ? -1 : book.chapters.findIndex((c) => c.id === chapterId)
}

/**
 * 按配方组装上下文。章节裁剪沿用 assembleContext 的规则：从尾部丢非 pinned 的 section，
 * 但第一个 section 永远保留——一个略超预算的概览好过什么都没有。
 */
export function buildContext(recipeName, book, options = {}) {
  const recipe = RECIPES[recipeName]
  if (recipe === undefined) throw new Error(`unknown context recipe: ${recipeName}`)
  // Recipe-level options come first, the caller's options win: a recipe may fix a format
  // (chapterListStyle) while the caller supplies the data (chapterId, caret windows).
  const opts = { ...recipe.options, ...options }
  if (opts.chapterId !== undefined && !book.chapters.some((c) => c.id === opts.chapterId)) {
    throw new Error('unknown chapter')
  }
  const budget = recipe.budget(opts.config)
  const sections = []
  for (const name of recipe.sections) {
    const build = BUILDERS[name]
    if (build === undefined) throw new Error(`unknown context section: ${name}`)
    // The writer's copy for THIS scene wins over the builder. Only book-scope sections reach
    // this path (the route refuses the rest), so a copy cannot carry one chapter's cast into
    // another.
    const copy = opts.overrides?.[name]
    const text = typeof copy === 'string' && copy !== '' ? copy : build(book, opts)
    if (text !== '') sections.push({ key: name, text })
  }
  const pinned = new Set(sections.filter((s) => PINNED.has(s.key)).map((s) => s.key))
  if (sections.length > 0) pinned.add(sections[0].key)
  const size = () => sections.reduce((n, s) => n + s.text.length, 0)
  while (size() > budget) {
    let dropAt = -1
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      if (!pinned.has(sections[i].key)) { dropAt = i; break }
    }
    if (dropAt < 0) break
    sections.splice(dropAt, 1)
  }
  return { text: sections.map((s) => s.text).join('\n'), sections: sections.map((s) => s.key), budget,
    // `parts` lets a route place one section in a specific prompt slot (e.g. the board under its
    // own 【调查板】 heading) without re-deriving it.
    parts: Object.fromEntries(sections.map((s) => [s.key, s.text])) }
}

/** 头注释里承诺的：配方名与 section 名的可查清单。 */
export function contextCatalog() {
  return {
    recipes: Object.fromEntries(Object.entries(RECIPES).map(([name, r]) => [name, [...r.sections]])),
    sections: Object.keys(BUILDERS),
  }
}
