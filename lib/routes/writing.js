/**
 * The routes that write prose: a rewrite, a copy-edit, a critique, a continuation, and the chat
 * that asks about any of it.
 *
 * They share `selectionFor`, because which model runs a pass is one decision made in one place,
 * and they share `overviewBudget`, because how much of the book a prompt may carry is likewise
 * one answer. Everything else they need -- what the board says, what the caret surrounds -- is
 * assembled per route in the file that uses it.
 */
import { buildSuggestPrompt, parseSuggestion } from '../llm.js'
import { assembleContext } from '../overview.js'
import { chapterFinalText } from '../text.js'
import { buildContext } from '../context.js'
import { readBook } from '../store.js'
import { promptFor } from '../prompts.js'
import { json, fail } from './kernel.js'
import {
  callModel, callModelFull, callChat, modelMaxTokens, outputBudget,
  continueSystem, extractProposal, stripProposal, cleanContinuation,
  parseReviewBlock, parseCritiqueBlock,
} from '../ai.js'

/**
 * @param {object} deps  `route`, `bookPayload`, `selectionFor`, `overviewBudget`, `ctx`, `config`
 */
export function registerWritingRoutes({ route, bookPayload, selectionFor, overviewBudget, ctx, config, logModel }) {
  // The event log's outcome comes from the transport; the ACTION's name is known only here, at
  // the call site, so it is attached here.
  const logged = (action) => (event) => logModel?.({ ...event, action })

  /**
   * Copy-edit one section. The unit is the chapter the writer is in, not the book: this is the
   * "read what I just wrote" pass, and it has to answer about THAT text.
   */

  route('/api/story.review', async (request) => {
    const { library, bookFolder, chapterId, text } = await bookPayload(request)
    const { book } = await readBook(library, bookFolder)
    const chapter = chapterId === undefined ? undefined : book.chapters.find((row) => row.id === chapterId)
    const body = typeof text === 'string' && text.trim() !== '' ? text : (chapter === undefined ? '' : chapterFinalText(chapter))
    if (body.trim() === '') return fail('这一节还没有内容可以审阅。')
    // The whole section, not a window: a copy-edit has to see every sentence it is judging. The
    // cap is a guard against a chapter long enough to blow the context, not a working limit.
    const section = body.slice(0, 20000)
    const selection = await selectionFor('suggest')
    const { text: raw, truncated } = await callModelFull(ctx, {
      log: logged('review'),
      selection,
      system: await promptFor('review', config),
      input: `【本节】${chapter?.title ?? ''}\n\n${section}`,
      maxTokens: await modelMaxTokens(ctx, selection, outputBudget(section.length, 0.25, [900, 8000])),
      signal: request.signal,
    })
    // The issues that did arrive are real, so they are returned even when the block was cut off;
    // `truncated` is what tells the panel to say the list may be incomplete rather than to present
    // it as the whole edit.
    return json({ ok: true, issues: parseReviewBlock(raw), truncated })
  })

  /**
   * A blunt grammar-and-phrasing critique of the section, from the caret's neighbourhood.
   *
   * The caret windows travel with it, like the ideas route they replaced: the critique has to be
   * about the prose the writer just wrote, not about the section's opening.
   */

  route('/api/story.critique', async (request) => {
    // `text` is accepted but not read: the critique judges the caret's neighbourhood, and falls
    // back to the chapter on disk when there is none. The client sends it (the wire-contract test
    // requires both sides to agree on every field), so it is destructured to keep that agreement
    // visible rather than silently ignored.
    const { library, bookFolder, chapterId, before, after, text: chapterText, direction } = await bookPayload(request)
    void chapterText
    const { book } = await readBook(library, bookFolder)
    const chapter = chapterId === undefined ? undefined : book.chapters.find((row) => row.id === chapterId)
    if (chapter === undefined) return fail('先打开一章，再要文法锐评。')
    // The neighbourhood around the caret, with sensible fallbacks to the section's own text.
    const lead = typeof before === 'string' && before !== '' ? before.slice(-1200) : chapterFinalText(chapter).slice(-1200)
    const trail = typeof after === 'string' ? after.slice(0, 400) : ''
    if (lead.trim() === '') return fail('先写一点内容，锐评才有落点。')
    // An optional steer from the writer: "把对话写得更口语" narrows what the critique is for.
    const steer = typeof direction === 'string' && direction.trim() !== ''
      ? `\n\n【这次重点】\n${direction.trim()}`
      : ''
    const selection = await selectionFor('suggest')
    const { text: raw, truncated } = await callModelFull(ctx, {
      log: logged('critique'),
      selection,
      system: await promptFor('critique', config),
      input: `【本节】${chapter?.title ?? ''}\n\n${lead}${trail.trim() === '' ? '' : `\n\n【其后】\n${trail}`}${steer}`,
      maxTokens: await modelMaxTokens(ctx, selection, outputBudget(lead.length + trail.length, 0.25, [900, 6000])),
      signal: request.signal,
    })
    return json({ ok: true, critique: parseCritiqueBlock(raw), truncated })
  })

  route('/api/story.suggest', async (request) => {
    const { library, bookFolder, chapterId, text, instruction, role, before, after } = await bookPayload(request)
    const { book } = await readBook(library, bookFolder)
    const { text: context } = assembleContext(book, chapterId, overviewBudget)
    // The prose around the selection, sent by the client: the passage alone reads as a
    // freestanding fragment, and rewrites that ignore how the sentence joins the paragraph
    // read as lost context even when the route ran. Optional, so an older client still works.
    const windows = [
      typeof before === 'string' && before !== '' ? `【选段之前】\n${before}` : '',
      typeof after === 'string' && after !== '' ? `【选段之后】\n${after}` : '',
    ].filter(Boolean)
    // An edit that came in through the composer runs on the CHAT model: the writer picked that
    // one for the conversation, and a stronger model does not stop being stronger because the
    // thing it was asked for turned out to be a rewrite.
    const raw = await callModel(ctx, { log: logged('rewrite'), selection: await selectionFor(role === 'chat' ? 'chat' : 'suggest'), ...buildSuggestPrompt({ text, instruction, context, windows, system: await promptFor('suggest', config) }), signal: request.signal })
    return json({ ok: true, suggestion: parseSuggestion(raw, text), overviewChars: context.length })
  })

  route('/api/story.continue', async (request) => {
    const { library, bookFolder, chapterId, text, before, after, role } = await bookPayload(request)
    // `before` is the text up to the caret and `after` the text following it; `text` is the
    // chapter. A caller that sends only `text` (an older client) keeps the old behaviour of
    // continuing from the end, rather than being refused.
    const head = typeof before === 'string' ? before : text
    const tailAfter = typeof after === 'string' ? after : ''
    if (typeof head !== 'string' || head.trim() === '') return json({ ok: true, continuation: '' })
    const { book } = await readBook(library, bookFolder)
    /**
     * How much text a continuation is allowed to see, configurable in the plugin config.
     *
     * `lead` is the prose before the caret and is the only thing the next sentence has to
     * follow; `trail` only has to be bridged, so a much shorter window is enough. Both used to
     * be fixed at 400 and 200 characters.
     *
     * `contextChars` is the chapter overview the neighbouring chapters contribute. It is capped
     * small here on purpose: this runs on a keystroke, and sending the whole preceding chapter
     * as context cost tokens without helping — the sentence has to match the paragraph in front
     * of the writer, not the story so far. Set it to 0 to send no overview at all.
     */
    const leadChars = Math.max(0, Number.isFinite(config?.continueLeadChars) ? config.continueLeadChars : 400)
    const trailChars = Math.max(0, Number.isFinite(config?.continueTrailChars) ? config.continueTrailChars : 200)
    const contextChars = Math.max(0, Number.isFinite(config?.continueContextChars) ? config.continueContextChars : 200)
    const lead = leadChars === 0 ? '' : head.slice(-leadChars)
    const trail = trailChars === 0 ? '' : tailAfter.slice(0, trailChars)
    // The overview is assembled from the book, which already contains the text before the caret.
    // Sending it alongside `lead` repeated the same words twice; with the window small, the
    // repeated block was often the LARGER half of the request.
    const { text: context } = contextChars === 0
      ? { text: '' }
      : assembleContext(book, chapterId, Math.min(overviewBudget, contextChars))
    const raw = await callModel(ctx, {
      log: logged('continue'),
      // Same rule as the rewrite: a continuation asked for from the chat box runs on the model
      // the writer chose for the chat.
      selection: await selectionFor(role === 'chat' ? 'chat' : 'continue'),
      system: continueSystem(lead || head.slice(-400), trail),
      input: [
        // The overview and the run-up are two different things: the overview is what the rest of
        // the book says, the run-up is the paragraph the writer is in. They overlap only in the
        // last few sentences, which is harmless; what was not harmless was the overview being
        // four hundred characters of the same chapter the run-up already carried.
        context ? `【上下文】\n${context}` : '',
        lead === '' ? '' : `【光标之前】\n${lead}`,
        trail.trim() === '' ? '' : `【光标之后】\n${trail}`,
      ].filter(Boolean).join('\n\n'),
      maxTokens: 120,
      signal: request.signal,
    })
    return json({ ok: true, continuation: cleanContinuation(raw, lead) })
  })

  route('/api/story.chat', async (request) => {
    const { library, bookFolder, history, message, chapterId, before, after, selection } = await bookPayload(request)
    if (typeof message !== 'string' || message.trim() === '') return fail('chat requires a message')
    const { book } = await readBook(library, bookFolder)
    /**
     * The chat reads the BOOK and the BOARD, assembled by the context layer's `chat` recipe:
     * book meta, chapter list, cast, setting cards, the id-keyed board digest (a follow-up like
     * "make 张三 know about it" has to name a row that exists) and the suspect-fact marks, so a
     * question about a relation gets the same staleness answer the prose routes give.
     *
     * The caret windows are the recipe's own section, but the route still places the board under
     * its own label and keeps the chapter's position line: those are prompt-slot decisions, not
     * section content, and they stay beside the prompt that consumes them.
     */
    const assembled = buildContext('chat', book, { chapterId, before, after, selection, overrides: book.contextOverrides,
      config: { chatLeadChars: config?.chatLeadChars, chatTrailChars: config?.chatTrailChars } })
    const board = assembled.parts.boardDigest ?? ''
    const digest = [
      [assembled.parts.bookMeta, assembled.parts.chapterList, assembled.parts.chapterCast, assembled.parts.settingCards]
        .filter((part) => part !== undefined && part !== '').join('\n'),
      board === '' ? '' : `【调查板】\n${board}`,
      assembled.parts.suspectFacts ?? '',
    ].filter((part) => part !== '').join('\n\n')
    // The chapter's own position, so a question about continuity can be answered without reading
    // the whole digest. A caret at the very start has no lead, and one at the end has no trail;
    // both are ordinary — that describing lives inside the caretWindows section.
    const chapter = chapterId === undefined ? undefined : book.chapters.find((row) => row.id === chapterId)
    const where = chapter === undefined
      ? ''
      : `【本章】${chapter.title || '未命名'}（共 ${(chapter.text ?? '').length} 字）`
    const context = [where, assembled.parts.caretWindows ?? ''].filter((part) => part !== '').join('\n\n')
    const raw = await callChat(ctx, {
      log: logged('chat'),
      selection: await selectionFor('chat'),
      digest,
      history,
      input: message,
      context,
      allowSearch: config?.webSearch !== false,
      chatSystem: await promptFor('chat', config),
      signal: request.signal,
    })
    // The model may end with a JSON block describing characters/settings it suggests; the
    // panel offers that as one-click data, and the prose stays readable without it.
    return json({ ok: true, reply: stripProposal(raw), proposal: extractProposal(raw) })
  })
}
