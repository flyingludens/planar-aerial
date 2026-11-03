import { randomUUID } from 'node:crypto'
import { KIND_LABELS } from './mosaic.js'

export const SUGGEST_SYSTEM = ['你是小说编辑。用户给你一段正文，请给出改写建议。',
  '要求：保持原意与叙事视角，只改进字句、节奏与画面感。',
  '只输出改写后的正文本身，不要解释、不要列表、不要引号、不要 Markdown 代码块。', '长度与原文接近。'].join('\n')
export const OVERVIEW_CHAPTER_SYSTEM = ['你在为一部长篇小说维护摘要。',
  '根据给出的章节正文，用 2 到 3 句中文写清这一章发生了什么、人物处境有何变化。', '只输出摘要本身，不要标题、不要解释。'].join('\n')
export const OVERVIEW_GLOBAL_SYSTEM = ['你在为一部长篇小说维护摘要。',
  '根据给出的全书正文，用一句话中文概括整本书的核心处境与走向。', '只输出这一句话，不要解释。'].join('\n')

export function buildSuggestPrompt({ text, instruction, context, windows, system }) {
  const parts = []
  if (context) parts.push(`【上下文】\n${context}`)
  for (const window of windows ?? []) parts.push(window)
  parts.push(`【原文】\n${text}`)
  if (instruction) parts.push(`【本次要求】\n${instruction}`)
  return { system: system ?? SUGGEST_SYSTEM, input: parts.join('\n\n') }
}
export function buildOverviewPrompt({ kind, title, text, system }) {
  return {
    system: system ?? (kind === 'global' ? OVERVIEW_GLOBAL_SYSTEM : OVERVIEW_CHAPTER_SYSTEM),
    input: `【${kind === 'global' ? '书名' : '章节'}】${title}\n\n【正文】\n${text}`,
  }
}
export function cleanModelText(raw) {
  let text = String(raw ?? '').trim()
  const fenced = /^```[a-zA-Z]*\n([\s\S]*?)\n```$/.exec(text)
  if (fenced) text = fenced[1].trim()
  text = text.replace(/^(改写|修改后|建议)[：:]\s*/, '')
  return text.replace(/^["“]([\s\S]*)["”]$/, '$1').trim()
}
/**
 * Strip fenced code blocks from a model answer. The consistency route and the mosaic parsers
 * below share this one source, so the two never drift; `lib/index.js` re-exports it.
 */
export function stripJsonBlock(text) {
  return String(text ?? '').replace(/```(?:json)?\s*[\s\S]*?```/g, '').trim()
}

export function parseSuggestion(raw, baseText) {
  return { id: randomUUID(), baseText, proposedText: cleanModelText(raw), note: '', createdAt: Date.now(), state: 'ready' }
}

export const MOSAIC_CHECK_SYSTEM = [
  '你在维护一部小说的调查板：一张记录角色、设定与人物关系的图。',
  '对照给出的章节正文与当前调查板摘要，产出需要新增或修改的内容提案。',
  '只输出 JSON：{"evidence":["正文原句", ...],"changes":[...]}，每条 change 带 evidenceIndex 指向引句。',
  '调查板摘要的每行末尾方括号里是该实体的 id，change 中的引用必须原样使用这些 id。',
  'change 的 op 只能是：entity.upsert（新角色/新设定卡，字段 kind/name/category/body/role/summary）、'
    + 'edge.upsert（关系，字段 from/to 为调查板摘要中的实体 id）、'
    + 'belief.add（某角色对某关系的认知，字段 edgeId 为该关系行的 [id]、holderId 为角色 id、kind/note）、'
    + 'status.add 与 status.remove（角色状态标记，字段 entityId 为角色 id/label）、'
    + 'edge.retire（关系作废，字段 edgeId 为该关系行的 [id]/reason）。',
  'kind 用中文自由词（如 挚友/监视/持有），不要发明枚举。没有值得记录的变化就返回空 changes。',
].join('\n')

export const MOSAIC_ASK_SYSTEM = [
  '你是小说调查板的问答助手，依据给出的【当前故事】和【当前调查板】回答。',
  '调查板是问题的主体：涉及实体、关系、信念时以调查板为准；故事正文用来解释背景和指出冲突，但它不是调查板。',
  '回答用中文，引用涉及的实体或关系时给出它们的名称；调查板没有、故事里也没有的信息要明说，不要编造。',
].join('\n')

/**
 * Read the RELATIONS out of the cards' own descriptions.
 *
 * The check prompt works from the manuscript: it looks at a chapter and proposes what the board
 * should record about it. This one works from the other direction — the writer has filled in
 * several cards' summaries by hand, described who knows whom in prose, and expects the board to
 * draw the lines. Nothing in a summary is structured, so the model is the only thing that can turn
 * "十年前跟白鹭一起办过一桩案子" into an edge.
 *
 * It is given the cards WITH their prose and told to return only edges: the entities and the words
 * already exist, and letting it invent new ones would mean reviewing a board the writer did not
 * write.
 */
export function buildMosaicRelatePrompt({ cards, edges, system }) {
  const cardLines = cards.map((card) => {
    const label = KIND_LABELS[card.kind] ?? '设定'
    const traits = card.kind === 'character' && card.role ? `（${card.role}）` : ''
    const head = `${label} ${card.name} [${card.id}]${traits}`
    // The long description is what the relation is usually stated in ("他把刀留在了码头"), so the
    // reader gets it when there is one; the one-line summary is the fallback.
    const prose = String(card.description || card.summary || '').trim()
    return prose === '' ? head : `${head}\n  简介：${prose}`
  }).join('\n')
  const edgeLines = edges.length === 0
    ? '（还没有任何关系）'
    : edges.map((edge) => `${edge.fromName} [${edge.from}] —${edge.kind}→ ${edge.toName} [${edge.to}]`).join('\n')
  return {
    system: system ?? MOSAIC_RELATE_SYSTEM,
    input: `【卡片】\n${cardLines || '（空）'}\n\n【已有关系】\n${edgeLines}`,
  }
}

export const MOSAIC_RELATE_SYSTEM = [
  '你在读一部小说的调查板卡片，任务是把【卡片】里所有已经写明的关系一次性全部找出来。',
  '',
  '做法：按【卡片】给出的顺序，一张一张地看。每读完一张卡的简介，就问自己"这段简介提到了哪些别的卡"，',
  '把提到的那几条都记下来，然后看下一张。全部卡片都过完，才算结束。',
  // Without a procedure the model answers about whatever catches its eye: the first few cards, or
  // the ones with vivid prose. Walking the list in order is what makes "all of them" mean all.
  '不要只看新增的卡，也不要因为某张卡已经有一条线就跳过它和其它卡的关系。',
  '',
  '什么算关系：简介里明确写到两张卡之间的称呼、亲属、师徒、雇佣、往来、所属、持有、开启、使用。',
  '关系的方向由简介的句子决定：写"沈砚的师父是程四娘"，就是 程四娘→沈砚（师徒）；',
  '写"老周替屠九看着仓库"，就是 屠九→老周（雇用/看管）：from 是动作的主动方，to 是动作的接受方。',
  'kind 必须用主动语态描述 from 对 to 做了什么，不要写"被调查""受雇""受雇于"这种客体角度；',
  '如果原句是被动句，交换 from/to 后改用主动词。',
  '同一对卡片可以有多条不同性质的关系（既是亲属又雇佣），分别列出。',
  '不要推测简介没有说的东西，也不要因为两张卡出现在同一章就认为它们有关系。',
  '',
  '输出格式：只输出 JSON，不要解释，不要输出读卡记录：',
  '{"edges":[{"from":"卡片 id","to":"卡片 id","kind":"关系词","note":"简介里支撑这条关系的原句"}]}',
  '即使没有新关系，也返回 {"edges":[]}；不要复述或总结简介。',
  'from/to 只写方括号里的 id 本身，不要带名字。例如写 "demo-b"，不要写 "白鹭 [demo-b]"。',
  'kind 用简短的中文词（如 旧识/追讨/持有/雇用/亲属/师徒/开启），不要发明枚举。',
  'note 必须是从该卡简介里逐字抄下来的原话，不要改写、不要总结；抄不出原话就不要提出这条关系。',
].join('\n')

export function buildMosaicCheckPrompt({ digest, chapterTitle, text, system }) {
  return {
    system: system ?? MOSAIC_CHECK_SYSTEM,
    input: `【当前调查板】\n${digest || '（空）'}\n\n【章节】${chapterTitle}\n\n【正文】\n${text}`,
  }
}

/**
 * "问这块板", answered from the WHOLE story rather than from the board alone.
 *
 * The question used to reach the model with nothing but the board's own lines: a writer asking
 * "这条关系现在成立吗" could not be answered against the chapter it happens in, and the same
 * question typed into the chat took a different path with a different context. One story, one
 * answer: the board is the subject, but the book travels with it.
 *
 * `story` is the chapters/cast/settings digest the chat route already builds; `digest` is the
 * board. Empty `story` keeps this working for a book with nothing written yet.
 */
export function buildMosaicAskPrompt({ digest, question, story = '', system }) {
  return {
    system: system ?? MOSAIC_ASK_SYSTEM,
    input: [
      story === '' ? '' : `【当前故事】\n${story}`,
      `【当前调查板】\n${digest || '（空）'}`,
      `【问题】\n${question}`,
    ].filter((part) => part !== '').join('\n\n'),
  }
}

/**
 * The JSON payload of a model answer: the fenced block when there is one, the text itself
 * otherwise. `stripJsonBlock` is the opposite operation — it removes the fences — which is what
 * the prose routes want; the mosaic parsers read the JSON, so they extract rather than strip.
 */
function jsonBodyOf(text) {
  const match = /```(?:json)?\s*([\s\S]*?)```/.exec(String(text ?? ''))
  return (match === null ? String(text ?? '') : match[1]).trim()
}

/** A proposal is all-or-nothing: an unparsable answer voids the whole batch. */
export function parseMosaicProposal(raw, sourceChapterId) {
  const body = jsonBodyOf(raw)
  if (body === null) return null
  try {
    const data = JSON.parse(body)
    if (!Array.isArray(data?.changes)) return null
    return {
      id: randomUUID(),
      sourceChapterId,
      evidence: Array.isArray(data.evidence) ? data.evidence.map((e) => String(e ?? '')) : [],
      changes: data.changes.filter((c) => c && typeof c === 'object'),
    }
  } catch { return null }
}

/**
 * The proposed edges, as changes the ordinary apply route can consume.
 *
 * Kept in the same `changes` shape the check proposals use: the writer reviews one kind of
 * proposal, and `applyMosaicProposal` is the one thing that writes a board. A second shape would
 * mean a second applier and a second set of rules about what is allowed.
 *
 * `valid` lets the route drop an edge naming an id it never offered without treating the whole
 * answer as broken — a model that misnumbers one row should not lose the five it got right.
 */
/**
 * The id inside whatever the model wrote.
 *
 * Told to "use the id in the brackets", a model reliably answers `白鹭 [demo-b]` — the name for its
 * own benefit and the bracket for ours — or sometimes just `demo-b`. Both mean the same card, so
 * the bracket is what is read rather than the whole string compared: matching the string exactly
 * made the parser reject every edge of a perfectly correct answer, which is how this was found.
 */
function idFromCell(cell, valid) {
  const text = String(cell ?? '').trim()
  if (text === '') return ''
  const bracketed = /\[([^\]]+)\]/.exec(text)
  if (bracketed !== null && valid.has(bracketed[1].trim())) return bracketed[1].trim()
  if (valid.has(text)) return text
  // A bare name with no bracket: accept it only when exactly one card has that name, because two
  // cards called 老周 would otherwise resolve to whichever came first.
  return ''
}

export function parseMosaicRelate(raw, valid) {
  const body = jsonBodyOf(raw)
  if (body === null) return []
  let data
  try { data = JSON.parse(body) } catch { return [] }
  if (!Array.isArray(data?.edges)) return []
  const seen = new Set()
  const out = []
  for (const item of data.edges) {
    if (item === null || typeof item !== 'object') continue
    const from = idFromCell(item.from, valid)
    const to = idFromCell(item.to, valid)
    const kind = String(item.kind ?? '').trim()
    if (from === '' || to === '' || kind === '' || from === to) continue
    if (!valid.has(from) || !valid.has(to)) continue
    // One edge per UNORDERED pair and word.
    //
    // The model reliably lists both directions of a symmetric relation — "阿蘅是白鹭的女儿" and
    // "白鹭的女儿是阿蘅" — and two wires between the same two cards, one each way, is one relation
    // drawn twice. Some relations really are directional (A 追讨 B is not B 追讨 A), so the
    // direction of the FIRST one seen is kept and the mirror is dropped.
    const key = [from, to].sort().join('|') + '|' + kind
    if (seen.has(key)) continue
    seen.add(key)
    // The apply route reads `truth.kind` and `truth.note`; an edge carrying a bare `kind` would be
    // dropped there, because its word would arrive as an empty string.
    out.push({
      op: 'edge.upsert',
      from, to,
      kind,
      note: String(item.note ?? '').trim(),
      truth: { kind, note: String(item.note ?? '').trim() },
    })
  }
  return out
}
