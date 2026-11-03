/**
 * Talking to the model, and reading what it says back.
 *
 * Two jobs that belong together because every route that asks for prose does both: build the
 * request (a system prompt and the assembled input), then turn the reply into structured data.
 * Keeping them in one file means a prompt and the parser for its answer cannot drift apart
 * without being edited side by side.
 *
 * Nothing here reads settings or knows about a route. `ctx` arrives as an argument, used for two
 * things only: `ctx.llm` to stream, and `ctx.get('web')` for the chat's single search round.
 */

/**
 * An output budget sized to the work, in tokens.
 *
 * A fixed budget is wrong in both directions, which is what produced the `max-tokens` failures.
 * The copy-edit of a long chapter has to report one JSON issue per problem, and a chapter with
 * thirty of them needs far more than the 900 tokens it was given: the answer was cut off mid-block,
 * the JSON never closed, and the parser found nothing — so a chapter that had plenty to say came
 * back empty. Meanwhile a continuation of one sentence was given 120 tokens, which is enough, and
 * a whole-book style profile 600, which is not.
 *
 * So the budget follows the input: more text to read means more findings to report. The floor is
 * what a short answer needs, the ceiling is what the largest model output can hold, and the
 * multiplication is deliberately loose — an unused token costs nothing, a missing one costs the
 * whole answer.
 *
 * @param chars - how much prose the model is being asked to read.
 * @param perChar - tokens of output to allow per character of input.
 * @param bounds - `[floor, ceiling]`, both in tokens.
 */
export function outputBudget(chars, perChar, bounds) {
  const [floor, ceiling] = bounds
  const length = Number.isFinite(chars) ? Math.max(0, chars) : 0
  const wanted = Math.ceil(length * perChar)
  return Math.min(ceiling, Math.max(floor, wanted))
}

/**
 * What a finished stream yielded: its text, and whether the model was cut off.
 *
 * `truncated` is the one fact the caller cannot recover afterwards — the text looks exactly like a
 * complete answer, only shorter — so it travels with the text rather than being logged and lost.
 */

/**
 * The output budget the MODEL itself advertises, not a number chosen here.
 *
 * `maxTokens` is the host's per-request cap, and `ModelInfo.max_tokens` is the largest value
 * that model accepts. A route that invents a smaller cap (4096, 8000, 12000) makes a capability
 * problem out of a product decision: a reasoning model spends the budget thinking, then the
 * JSON is cut mid-answer and the route reports "found nothing". Ask the host what the model can
 * do and use that ceiling; `fallback` is only for a host that does not disclose one.
 */
const modelLimitCache = new Map()
export async function modelMaxTokens(ctx, selection, fallback) {
  if (selection === undefined || selection === null) return fallback
  const key = `${selection.provider}/${selection.model}`
  if (modelLimitCache.has(key)) return modelLimitCache.get(key)
  try {
    const info = await ctx.llm?.resolveModelInfo?.(selection.provider, selection.model)
    const advertised = Number(info?.max_tokens)
    if (Number.isFinite(advertised) && advertised > 0) {
      modelLimitCache.set(key, advertised)
      return advertised
    }
  } catch { /* an undisclosed limit is not an error; use the fallback */ }
  return fallback
}

export async function streamText(ctx, { selection, messages, system, maxTokens, signal, log }) {
  const startedAt = Date.now()
  // Every call that carries a `log` reports its outcome — ok or thrown — with the provider, the
  // model and the duration. This is the ONE door every model call passes through, so the event
  // log cannot miss a path. The UNKNOWN codes the host reports are otherwise undiagnosable: the
  // log is what turns "it failed again" into "it fails on X, after N ms, with code C".
  try {
    const result = await streamModel(ctx, { selection, messages, system, maxTokens, signal })
    await log?.({ ok: true, provider: selection?.provider, model: selection?.model,
      truncated: result.truncated, ms: Date.now() - startedAt })
    return result
  } catch (error) {
    const message = String(error?.message ?? error)
    const fallback = selection?.fallback
    // A role may be pinned to a provider this host no longer ships (the settings file is a
    // persisted choice; the adapters are a property of the running app). NO_ADAPTER is that
    // mismatch. Retry once on the session default rather than making every AI action fail with
    // a model the writer cannot see or fix from here.
    if (/NO_ADAPTER/.test(message) && fallback !== undefined && fallback !== null
      && (fallback.provider !== selection.provider || fallback.model !== selection.model)) {
      await log?.({ ok: false, provider: selection?.provider, model: selection?.model,
        error: `${message} · falling back to ${fallback.provider}/${fallback.model}`,
        ms: Date.now() - startedAt })
      const retryAt = Date.now()
      try {
        const result = await streamModel(ctx, { selection: fallback, messages, system, maxTokens, signal })
        await log?.({ ok: true, provider: fallback.provider, model: fallback.model,
          truncated: result.truncated, ms: Date.now() - retryAt })
        return result
      } catch (second) {
        await log?.({ ok: false, provider: fallback.provider, model: fallback.model,
          error: String(second?.message ?? second), ms: Date.now() - retryAt })
        throw second
      }
    }
    await log?.({ ok: false, provider: selection?.provider, model: selection?.model,
      error: message, ms: Date.now() - startedAt })
    throw error
  }
}

async function streamModel(ctx, { selection, messages, system, maxTokens, signal }) {
  if (!selection) throw new Error('no model selection is available')
  let text = ''
  let finish
  for await (const chunk of ctx.llm.stream({
    provider: selection.provider,
    model: selection.model,
    ...(selection.reasoningEffort === undefined ? {} : { reasoningEffort: selection.reasoningEffort }),
    maxTokens, system, messages,
    ...(signal === undefined ? {} : { signal }),
  })) {
    if (chunk.type === 'text-delta') text += chunk.text
    else if (chunk.type === 'finish') finish = chunk.reason
  }
  // A stream that ends without a finish chunk is treated as 'stop' (BlockAssembler's convention).
  // `max-tokens` is NOT a failure: the model produced text and the budget ran out, which is a
  // property of the request, not an error in it. Throwing it away used to lose the whole answer —
  // a copy-edit of a long chapter came back as "model call failed: max-tokens" with nothing in it,
  // even though the model had been writing the right thing the whole time. Everything else
  // (tool-calls, error, aborted) really does mean no usable text.
  if (finish && finish.kind !== 'stop' && finish.kind !== 'max-tokens') {
    throw new Error(`model call failed: ${finish.failure?.code ?? finish.kind}`)
  }
  return { text, truncated: finish?.kind === 'max-tokens' }
}

/**
 * One plain model call returning its text.
 *
 * Answers the text, and throws only when there is no usable text at all. A truncated answer comes
 * back as text: see `streamText` for why that is not an error.
 */
export async function callModel(ctx, options) {
  const { text } = await streamText(ctx, {
    ...options,
    messages: [{ role: 'user', content: [{ type: 'text', text: options.input }] }],
  })
  return text
}

/**
 * One plain model call that also reports whether the answer was cut off.
 *
 * The structured routes need this: a copy-edit whose JSON block was truncated parses to an empty
 * issue list, which is indistinguishable from "the section is clean". The writer has to be told
 * which of the two happened, or a half-read section looks like a finished one.
 */
export async function callModelFull(ctx, options) {
  return streamText(ctx, {
    ...options,
    messages: [{ role: 'user', content: [{ type: 'text', text: options.input }] }],
  })
}

/**
 * One answer for the side chat: multi-turn history plus the story digest as system context.
 * The chat deliberately keeps no durable conversation of its own — the panel sends the recent
 * turns each time, so the transcript survives a reload without its own storage format.
 */
const CHAT_SEARCH_LINE = '如果某个事实细节需要核实（真实城市、年代、习俗、人名），并且可以使用联网搜索，就只输出一个 fenced 搜索块：{"search":"<查询>"}，不要输出别的。'

const CHAT_SYSTEM = [
  '你是坐在手稿旁边的小说写作助手。',
  '你处理局部工作：一段话、一个场景、一个名字、一个事实。整本书的规划（结构、多章安排、大规模世界观）',
  '由作者去完整对话面板完成，所以在这里回答要短、要具体，不要试图重做这本书。',
  '用作者使用的语言简短作答。每个回答都要落在给出的故事状态上。',
  '当作者要你写（从光标处续写、补全一段、插入内容、改写选中的段落）时，直接返回正文本身：',
  '属于那个位置的句子，用手稿的语气和语言。不要描述你打算怎么写，不要把周围的文字抄回来，',
  '也不要在正文前后加评论。',
  '光标位置会给出：【光标之前】是光标前的内容，【光标之后】是光标后的内容。',
  '续写要从【光标之前】往后接；插入还要自然过渡到【光标之后】。',
  '当作者要你创造人物、关系或世界观时，描述出来，并在最后给出一个 fenced json 块：',
  '{"characters":[{"name","role","goal","traits"}],"settings":[{"title","body"}],"relationships":[{"from","to","kind"}]}',
  '这样作者可以一键加入。',
  '同一个 json 块也是修改用的：面板按完全相同的名字或标题合并，所以改名会被当成新增一个。',
  '当作者要你修改故事状态里已有的内容（人物的角色、目标、性格或备注，设定的正文，一条关系）时，',
  '用同一个 json 块，并沿用故事状态里 EXACT 的那个名字或标题。只给你要改的字段：',
  '面板按字段合并，你没给的字段保持原值。不要用散文描述改动，简短的确认放在块外面。',
  CHAT_SEARCH_LINE,
].join('\n')

/** The search query a model asked for, if its answer is exactly that request. */
export function extractSearchIntent(text) {
  const match = /```(?:json)?\s*\{\s*"search"\s*:\s*"([^"]{1,200})"\s*\}\s*```/.exec(text ?? '')
  return match === null ? undefined : match[1].trim()
}

export async function callChat(ctx, { selection, digest, history, input, context, allowSearch = false, maxTokens = 1200, signal, log, chatSystem }) {
  if (!selection) throw new Error('no model selection is available')
  const messages = [
    ...(history ?? [])
      .filter((m) => m && typeof m.text === 'string' && m.text !== '')
      .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: [{ type: 'text', text: m.text }] })),
    { role: 'user', content: [{ type: 'text', text: input }] },
  ]
  const official = chatSystem ?? CHAT_SYSTEM
  const base = [
    official,
    // Where the writer is: the passage they selected, the prose either side of the caret. Without
    // it a request like "接着这里写" has no "here".
    context === undefined || context === '' ? '' : `Where the writer is working:\n${context}`,
    digest ? `Current story state:\n${digest}` : '',
  ].filter((part) => part !== '').join('\n\n')
  const withoutSearch = official.endsWith(`\n${CHAT_SEARCH_LINE}`)
    ? official.slice(0, official.length - CHAT_SEARCH_LINE.length - 1)
    : official
  const system = allowSearch || chatSystem !== undefined ? base : withoutSearch
  const first = await streamChat(ctx, { selection, messages, system, maxTokens, signal, log })
  if (!allowSearch) return first
  const query = extractSearchIntent(first)
  if (query === undefined) return first

  // One search round. A tool loop would multiply cost and latency for a side chat.
  const results = await searchOnce(ctx, query, signal)
  const messages2 = [
    ...messages,
    { role: 'assistant', content: [{ type: 'text', text: first }] },
    { role: 'user', content: [{ type: 'text', text: `Search results for "${query}":\n${results}` }] },
  ]
  return streamChat(ctx, { selection, messages: messages2, system, maxTokens, signal, log })
}

/** One plain model call returning its text. */
/** One chat turn returning its text. Shares the finish-reason handling with `callModel`. */
export async function streamChat(ctx, { selection, messages, system, maxTokens, signal, log }) {
  const { text } = await streamText(ctx, { selection, messages, system, maxTokens, signal, log })
  return text
}

/**
 * Run one web search and flatten it to text. A missing web service, no configured provider, or
 * a provider failure all degrade to a note the model can work around — never to a failed answer.
 */
export async function searchOnce(ctx, query, signal) {
  const web = ctx.get('web')
  if (web === undefined) return '(web search is unavailable in this profile)'
  try {
    const result = await web.search({ query, maxResults: 5 }, signal)
    const sources = result?.sources ?? []
    if (sources.length === 0) return '(no results)'
    return sources
      .map((entry, index) => `${index + 1}. ${entry.title ?? ''}\n${entry.url ?? ''}\n${(entry.snippet ?? entry.text ?? '').slice(0, 400)}`)
      .join('\n\n')
  } catch (error) {
    return `(search failed: ${error?.message ?? 'unknown error'})`
  }
}

/**
 * Pull a fenced JSON block the model was asked to end its answer with, if any. Returns
 * undefined rather than throwing: a plain prose answer is the normal case.
 */
export function extractProposal(text) {
  const match = /```json\s*([\s\S]*?)```/.exec(text ?? '')
  if (match === null) return undefined
  try {
    const value = JSON.parse(match[1])
    if (value === null || typeof value !== 'object') return undefined
    const characters = Array.isArray(value.characters) ? value.characters : []
    const settings = Array.isArray(value.settings) ? value.settings : []
    const relationships = Array.isArray(value.relationships) ? value.relationships : []
    if (characters.length === 0 && settings.length === 0 && relationships.length === 0) return undefined
    return { characters, settings, relationships }
  } catch {
    return undefined
  }
}

/** The answer without the machine-readable block, so the sidebar shows readable prose. */
export function stripProposal(text) {
  return String(text ?? '').replace(/```json\s*[\s\S]*?```/g, '').trim()
}

/**
 * Continuation prompt. Language is stated as a rule derived from the manuscript instead of left
 * implicit: an English instruction with no language rule made the model drift into English even
 * when the prose was Chinese.
 *
 * `after` is what precedes the insertion point. It used to be the whole tail of the chapter
 * because the caret was assumed to be at the end; continuing from a caret in the middle needs
 * the text BEFORE the caret and the text AFTER it to be described separately, or the model
 * writes as if the chapter simply stops there.
 */
export function continueSystem(before, after = '') {
  const lead = String(before ?? '')
  const trail = String(after ?? '')
  const sample = `${lead}${trail}`
  const cjk = (sample.match(/[\u3400-\u9fff]/g) ?? []).length
  const letters = (sample.match(/[A-Za-z]/g) ?? []).length
  const language = cjk > letters
    ? 'Write in Chinese, the language of the manuscript. Never answer in English.'
    : 'Write in English, the language of the manuscript.'
  const lines = [
    'Continue the manuscript from the point marked by the writer.',
    language,
    'Return ONLY the continuation text: no quotes, no explanation, no markdown, no preamble.',
    'Keep the same voice, tense and point of view. At most two sentences.',
  ]
  // Two opposite situations need opposite instructions. The old prompt assumed the first one only:
  // "continue the unfinished sentence if there is one" is right mid-sentence and useless after a
  // full stop, which is exactly where a writer most often asks — at the end of a paragraph.
  const endsMidSentence = !/[。！？!?…；;：:"”』」\n]\s*$/.test(lead)
  if (trail.trim() === '') {
    if (endsMidSentence) {
      lines.push('The last sentence is unfinished. Complete it, then stop.')
    } else {
      lines.push(
        'The text ends on a complete sentence. Write the NEXT sentence: it has to follow from'
        + ' what is already there. Do not restate or finish the previous one.',
      )
    }
  } else {
    // Something follows, so the answer is a bridge rather than an ending.
    lines.push(
      'Text continues after the insertion point. Write the passage that JOINS the two: it has to'
      + ' follow what precedes it and lead into what follows, without repeating or summarising it.',
    )
    if (!endsMidSentence) lines.push('The sentence before the insertion point is already complete.')
  }
  return lines.join('\n')
}

/**
 * Two whole-book analyses that a writer needs and chat alone handles badly, because both want
 * the full text and a structured answer:
 * - `style`: extract a reusable voice profile from the finished chapters.
 * - `consistency`: find contradictions across chapters (names, details, timeline).
 * Both read the whole manuscript, so they are explicit actions rather than something that runs
 * while typing.
 */
const STYLE_SYSTEM = [
  '读这篇小说样本，描述它的文风，让另一个写作者能照此续写。',
  '用正文的语言作答；正文是中文就用中文，不要夹杂英文。',
  '只输出一个 fenced json 块：',
  '{"voice":"一句话概括叙述声音","pov":"","tense":"",',
  ' "sentences":"句子节奏，例如 短句为主、逗号少","diction":"用词习惯",',
  ' "devices":["反复使用的手法"],"avoid":["这种文风不会做的事"]}',
].join('\n')

/**
 * Generate one 流派's prompt from a sample of prose.
 *
 * Not the old style-profile JSON: a writing style is a single paragraph that will be pasted into a
 * generation prompt, so the answer is prose rather than six fields a UI has to reassemble.
 */
const WRITING_STYLE_SYSTEM = [
  '你是一位小说写作教练。根据作者给出的文本样本，写一段可以直接用于生成提示词的“文风描述”。',
  '写清楚：叙述声音、视角、时态、句子节奏、用词偏好、常用手法，以及这种写法应当避免什么。',
  '用正文的语言写；样本是中文就用中文。只输出这段描述本身，不要标题、不要解释、不要 JSON。',
].join('\n')

/**
 * A copy-edit of ONE section: punctuation, grammar, wording that does not work, inconsistencies
 * inside the passage. Not the continuity check — that one compares chapters and looks for facts
 * that contradict each other. This one stays inside the text in front of the writer.
 */
const REVIEW_SYSTEM = [
  '你是一位文字编辑，正在审读一部长篇小说中的一节。',
  '用正文的语言作答；正文是中文就用中文，不要夹杂英文。',
  '只看这一段。按轻重顺序报告：标点与空格错误、语法、断裂的句子、句内重复的词、',
  '  语域滑出叙述声音，以及段落内部自相矛盾之处。',
  '不要评论故事：不谈情节、不谈人物、不与其他章节对照。不要整段重写。引用你指着的文字。',
  '如果这段文字没有问题，就返回空列表。',
  '只返回一个 json 代码块：',
  '{"issues":[{"kind":"punctuation|grammar|wording|repeat|consistency","where":"定位问题的句子或几个字","problem":"错在哪里","suggestion":"改正后的写法，或仅是评语时留空"}]}',
].join('\n')

/**
 * A grammar critique of ONE section, asked for by pressing Command twice.
 *
 * Deliberately sharper in voice than the copy-edit: the writer who pressed this wants to be told
 * what is wrong with the prose, plainly, plus how to fix it. Grammar and mechanics lead; phrasing
 * that is stiff or repetitive follows. It stays inside the passage, like the copy-edit does.
 */
const CRITIQUE_SYSTEM = [
  '你是一位直言但有建设性的文字编辑，正在审读一部长篇小说中的一节。',
  '用正文的语言作答；正文是中文就用中文，不要夹杂英文。',
  '先从语法与文字规范上评判本节：病句、逗号粘连、主谓搭配、时态游移、标点、空格。',
  '再指出生硬、含糊或重复的措辞。',
  '直接、具体；不铺垫、不奉承。每一条都必须引用它所指的文字。',
  '每一条的建议是改法，不是诊断：说出该怎么改写。',
  '开头用一小段诚实的话总评这段文字——哪里立得住，哪里不行。',
  '不要评论故事本身：不谈情节走向、不谈人物设定。不要整段重写。',
  '只返回一个 json 代码块：',
  '{"verdict":"两三句对整段文字的总评","points":[{"kind":"punctuation|grammar|wording|repeat|consistency","where":"定位问题的几个字","problem":"错在哪里或弱在哪里","advice":"具体的改法"}]}',
].join('\n')

const CONSISTENCY_SYSTEM = [
  '你是一位连续性编辑。对照各章，找出具体的矛盾：',
  '人名或写法前后不一致、身体细节冲突、时间线不可能、某章确立而另一章否认的事实。',
  '只报告能在正文里指出来的真实冲突；没有就直说。',
  '用正文的语言作答；正文是中文就用中文，不要夹杂英文。',
  '只输出一个 fenced json 块：',
  '{"issues":[{"kind":"name|detail|timeline|fact","where":"章节标题","problem":"冲突是什么","evidence":"短引用"}]}',
].join('\n')

/**
 * Trim a continuation to something insertable: strip labels/quotes, and drop an answer that
 * merely repeats the text already on screen (a common failure at short lengths).
 */
export function cleanContinuation(raw, tail) {
  let text = String(raw ?? '').trim()
  text = text.replace(/```[a-zA-Z]*\n?([\s\S]*?)```/g, '$1').trim()
  text = text.replace(/^(续写|继续|接着写)[：:]\s*/, '')
  text = text.replace(/^["“]([\s\S]*)["”]$/, '$1').trim()
  if (text === '') return ''
  const trimmedTail = String(tail ?? '').trimEnd()
  if (trimmedTail === '') return text
  /**
   * Two different answers, two different rules.
   *
   *  - A PURE echo adds nothing: the answer says exactly what the page already says. Drop it.
   *  - An echo followed by new prose is the common case — "他一直站在门外的雨" comes back as
   *    "他一直站在门外的雨里". The words after the repeated run-up are exactly what was asked for,
   *    and discarding the whole answer is what made the panel report "nothing to continue from
   *    here" over and over. Trim the repeat, keep the rest.
   *
   * The cut is only made when the answer STARTS with the run-up and has something left after it,
   * so ordinary prose that merely shares a last word is untouched.
   */
  if (text === trimmedTail || trimmedTail.endsWith(text)) return ''
  if (!text.startsWith(trimmedTail)) return text
  const rest = text.slice(trimmedTail.length).replace(/^\s+/, '')
  /**
   * A repeat is only an echo when it is long enough to BE a repeat.
   *
   * "他" is the last word of the paragraph, not a restatement of it: a continuation is expected to
   * open on it, and cutting that one character off would eat the first character of ordinary prose
   * ("他推开门。" would come back as "推开门。"). An echo worth trimming is a real run of text —
   * eight characters, which is longer than any single word this panel deals in.
   */
  const ECHO_FLOOR = 8
  if (rest !== '' && trimmedTail.length < ECHO_FLOOR) return text
  return rest
}

/** The machine-readable JSON block in a model answer, if there is one. */
export function jsonBlockOf(text) {
  const match = /```(?:json)?\s*([\s\S]*?)```/.exec(String(text ?? ''))
  if (match === null) return undefined
  try {
    const value = JSON.parse(match[1])
    return value !== null && typeof value === 'object' ? value : undefined
  } catch { return undefined }
}

export function parseStyleBlock(text) {
  const value = jsonBlockOf(text)
  if (value === undefined) return undefined
  const str = (v) => (typeof v === 'string' ? v : '')
  const list = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [])
  return {
    voice: str(value.voice), pov: str(value.pov), tense: str(value.tense),
    sentences: str(value.sentences), diction: str(value.diction),
    devices: list(value.devices), avoid: list(value.avoid),
  }
}

export function parseIssueBlock(text) {
  const value = jsonBlockOf(text)
  if (value === undefined || !Array.isArray(value.issues)) return []
  return value.issues
    .filter((issue) => issue !== null && typeof issue === 'object')
    .map((issue) => ({
      kind: typeof issue.kind === 'string' ? issue.kind : 'fact',
      where: typeof issue.where === 'string' ? issue.where : '',
      problem: typeof issue.problem === 'string' ? issue.problem : '',
      evidence: typeof issue.evidence === 'string' ? issue.evidence : '',
    }))
    .filter((issue) => issue.problem !== '')
}

/**
 * The issues of a copy-edit. Same shape as the continuity parser, plus the suggested correction —
 * which for this pass is the useful part: "comma splice" is a diagnosis, "拆成两句" is an edit.
 */
export function parseReviewBlock(text) {
  const value = jsonBlockOf(text)
  if (value === undefined || !Array.isArray(value.issues)) return []
  return value.issues
    .filter((issue) => issue !== null && typeof issue === 'object')
    .map((issue) => ({
      kind: typeof issue.kind === 'string' ? issue.kind : 'wording',
      where: typeof issue.where === 'string' ? issue.where : '',
      problem: typeof issue.problem === 'string' ? issue.problem : '',
      suggestion: typeof issue.suggestion === 'string' ? issue.suggestion : '',
    }))
    .filter((issue) => issue.problem !== '')
}

/** A critique: one verdict plus the points that back it. */
export function parseCritiqueBlock(text) {
  const value = jsonBlockOf(text)
  const points = value !== undefined && Array.isArray(value.points)
    ? value.points
      .filter((point) => point !== null && typeof point === 'object')
      .map((point) => ({
        kind: typeof point.kind === 'string' ? point.kind : 'wording',
        where: typeof point.where === 'string' ? point.where : '',
        problem: typeof point.problem === 'string' ? point.problem : '',
        advice: typeof point.advice === 'string' ? point.advice : '',
      }))
      .filter((point) => point.problem !== '')
    : []
  return {
    verdict: value !== undefined && typeof value.verdict === 'string' ? value.verdict : '',
    points,
  }
}

export {
  CHAT_SYSTEM, STYLE_SYSTEM, WRITING_STYLE_SYSTEM, REVIEW_SYSTEM, CRITIQUE_SYSTEM, CONSISTENCY_SYSTEM,
}
