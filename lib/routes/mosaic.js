/**
 * The investigation board: checking a chapter against it, asking it a question, reading relations
 * out of the cards, portraits, and the proposals themselves.
 *
 * These are the routes that read and rewrite `book.mosaic`. They are the largest group, which is
 * why they had the most to gain from their own file.
 *
 * `applyProposalToBook` lives in ../mosaic.js rather than here: it is a pure transformation of a
 * book, it is exercised on its own, and it belongs beside the other board operations rather than
 * beside the HTTP routes that call it.
 */
import { randomUUID } from 'node:crypto'
import {
  buildMosaicAskPrompt, buildMosaicCheckPrompt, buildMosaicRelatePrompt,
  buildOverviewPrompt,
  parseMosaicProposal, parseMosaicRelate, stripJsonBlock,
} from '../llm.js'
import { buildPortraitPrompt, readPortrait, requestPortrait, resolveImageKey, savePortrait } from '../image.js'
import { applyMosaicProposal, applyProposalToBook, mosaicDigest } from '../mosaic.js'
import { chapterFinalText, wholeFinalText } from '../text.js'
import { hashText } from '../hash.js'
import { staleEntries } from '../overview.js'
import { buildContext } from '../context.js'
import {
  bookDir, deleteProposal, listProposals, readBook, setProposalStatus, writeBook, writeProposal,
} from '../store.js'
import { readSettings, settingsPath } from '../settings.js'
import { normalizeBook } from '../model.js'
import { CONSISTENCY_SYSTEM, callModel, callModelFull, modelMaxTokens, outputBudget, parseIssueBlock } from '../ai.js'
import { json, fail } from './kernel.js'

/**
 * @param {object} deps  `route`, `bookPayload`, `selectionFor`, `ctx`, `config`
 */
export function registerMosaicRoutes({ route, bookPayload, selectionFor, ctx, config, logModel }) {
  // Same rule as the writing routes: the transport logs the outcome, the call site names the action.
  const logged = (action) => (event) => logModel?.({ ...event, action })
  /** The board a mosaic route works on, read fresh so two calls never share stale state. */
  const mosaicOf = async (library, bookFolder) => {
    const { book } = await readBook(library, bookFolder)
    return { book, digest: mosaicDigest(book.mosaic) }
  }

  route('/api/story.mosaic.check', async (request) => {
    const { library, bookFolder, chapterId, text } = await bookPayload(request)
    const { book, digest } = await mosaicOf(library, bookFolder)
    const chapter = book.chapters.find((row) => row.id === chapterId)
    // The recipe carries the board digest and the chapter text (request first, disk fallback);
    // the prompt labels them, which is a prompt-slot decision, not section content.
    const body = typeof text === 'string' && text.trim() !== '' ? text : (chapter === undefined ? '' : chapterFinalText(chapter))
    if (body.trim() === '') return fail('这一章还没有内容可以检查。')
    const prompt = buildMosaicCheckPrompt({ digest, chapterTitle: chapter?.title ?? '', text: body.slice(0, 20000) })
    const selection = await selectionFor('mosaic')
    const { text: raw, truncated } = await callModelFull(ctx, {
      log: logged('board.check'),
      selection,
      system: prompt.system,
      input: prompt.input,
      maxTokens: await modelMaxTokens(ctx, selection, outputBudget(body.length, 0.3, [900, 8000])),
      signal: request.signal,
    })
    // All-or-nothing: a garbled answer voids the batch rather than applying half of it.
    const proposal = parseMosaicProposal(raw, chapterId)
    if (proposal === null) return fail(truncated ? '模型输出被截断，请重试。' : '模型没有返回可解析的提案，请重试。')
    if ((proposal.changes ?? []).length === 0) {
      return json({ ok: true, proposal: null, truncated,
        message: truncated ? '模型输出被截断，没有读出可用的变化。' : '没有发现需要记录的变化。' })
    }
    // Stored before it is answered: the writer may close the sheet, switch books, or restart, and
    // the model's work should still be waiting on the proposals page when they come back.
    const stored = await writeProposal(library, bookFolder, { ...proposal, source: 'check' })
    return json({ ok: true, proposal: stored, truncated })
  })

  /** Answer a question about the board from the board alone, no model memory involved. */

  route('/api/story.mosaic.ask', async (request) => {
    const { library, bookFolder, question } = await bookPayload(request)
    const q = typeof question === 'string' ? question.trim() : ''
    if (q === '') return fail('先写下问题。')
    const { book, digest } = await mosaicOf(library, bookFolder)
    // The board answers from the story it belongs to, the same context the chat route assembles:
    // the question is about the board, but "does this relation still hold" needs the chapters.
    // The book half comes from the mosaicAsk recipe (meta/chapters/cast/cards/global summary),
    // the board half from the same digest the check route uses.
    const story = buildContext('mosaicAsk', book, { chapterId: undefined, config }).text
    const prompt = buildMosaicAskPrompt({ digest, question: q, story })
    const selection = await selectionFor('mosaic')
    const { text: raw } = await callModelFull(ctx, {
      log: logged('board.ask'),
      selection,
      system: prompt.system,
      input: prompt.input,
      maxTokens: await modelMaxTokens(ctx, selection, 1800),
      signal: request.signal,
    })
    return json({ ok: true, answer: raw.trim() })
  })

  /**
   * Read the relations out of the cards' own descriptions.
   *
   * A different job from `mosaic.check`: that one reads a CHAPTER and proposes what the board
   * should record about it. This one reads the BOARD and finds the lines the writer described in
   * prose but never drew — cards with no edges between them, whose summaries say who knows whom.
   *
   * It never invents entities: the ids it is given are the ids it may answer with, and the parser
   * drops anything else. The result is a proposal like any other, so the writer reviews it and the
   * same apply route writes it.
   *
   * The cards come from the PANEL, not from a fresh read of the book file. The panel is displaying
   * a board; the file is a copy of it that may lag behind the debounced save, and reading it here
   * made the button answer about a different board than the one on screen — including the empty
   * book `readBook` returns for a path it cannot find, which surfaced as "you have fewer than two
   * cards" to a writer looking at nine of them.
   */

  route('/api/story.mosaic.relate', async (request) => {
    // The CARDS come from the panel (see the note above); the path is only where the resulting
    // proposal is stored, so the page can list it after a restart.
    const { library, cards, edges, bookFolder } = await bookPayload(request)
    if (!Array.isArray(cards)) return fail('没收到卡片，无法读关系。')
    if (cards.length < 2) return fail('这张板上只有一张卡片，还不成其为关系。')
    const byId = new Map(cards.map((entity) => [entity.id, entity]))
    const live = (Array.isArray(edges) ? edges : []).filter((edge) => edge.retired !== true)
    const prompt = buildMosaicRelatePrompt({
      cards,
      edges: live.map((edge) => ({
        from: edge.from, to: edge.to, kind: edge.truth.kind,
        fromName: byId.get(edge.from)?.name ?? '?', toName: byId.get(edge.to)?.name ?? '?',
      })),
    })
    /**
     * The budget is for the ANSWER, and this model spends its budget on thinking first.
     *
     * At 1600 tokens the run came back with `finish_reason: length` and `text_tokens: 0`: every
     * token of the allowance went into reasoning and not one into the JSON. Ten cards and a dozen
     * possible edges is a bigger answer than a copy-edit's, so it gets a bigger allowance — and a
     * truncated answer is reported rather than passed off as "found nothing".
     */
    const selection = await selectionFor('mosaic')
    const answer = await callModelFull(ctx, {
      log: logged('board.relate'),
      selection,
      system: prompt.system,
      input: prompt.input,
      maxTokens: await modelMaxTokens(ctx, selection, 12000),
      signal: request.signal,
    })
    const raw = answer.text ?? ''
    if (answer.truncated === true && raw.trim() === '') {
      // Nothing usable came back, and saying so is the only honest answer. The alternative is a
      // silent "no relations found", which reads as a statement about the cards.
      return fail('模型没能给出结果（推理占满了额度）。再点一次，或在设置里换一个模型。')
    }
    const valid = new Set(cards.map((entity) => entity.id))
    // Already-drawn pairs are removed here rather than by the prompt alone: a model that repeats an
    // edge the board already has would put the writer through a review that changes nothing.
    const drawn = new Set(live.map((edge) => `${edge.from}|${edge.to}|${edge.truth.kind}`))
    const changes = parseMosaicRelate(raw, valid)
      .filter((change) => !drawn.has(`${change.from}|${change.to}|${change.kind}`))
    // An empty answer is not a proposal. Storing one made the review page show a row with
    // "0 处改动" that could be accepted but changed nothing — a document pretending to be work.
    if (changes.length === 0) {
      return json({ ok: true, proposal: null, truncated: answer.truncated === true,
        message: answer.truncated === true
          ? '模型输出被截断，没有读出可用的关系。再点一次，或在设置里换一个模型。'
          : '卡片简介里没有读出新的关系。' })
    }
    // Stored like every other proposal. `sourceChapterId` is null because this one was read from
    // the board, not from a chapter.
    const stored = await writeProposal(library, bookFolder, {
      id: randomUUID(),
      source: 'relate',
      sourceChapterId: null,
      evidence: changes.map((change) => change.note).filter((note) => note !== ''),
      changes,
    })
    return json({ ok: true, proposal: stored, truncated: answer.truncated === true })
  })

  /**
   * Generate a portrait for one card, and keep it inside the book.
   *
   * The entity travels in the request because the prompt is built from what the writer has just
   * been editing: sending only an id would make the route re-read a board the client has already
   * modified, and the picture would be of the previous version of the character.
   *
   * The credential is the agnes provider's own key, read from the environment. It is never sent to
   * the client, never logged, and not a second thing for the writer to configure.
   */

  route('/api/story.mosaic.portrait', async (request) => {
    const { library, bookFolder, entity, language } = await bookPayload(request)
    if (entity === null || entity === undefined || typeof entity.id !== 'string') return fail('no card to draw')
    // The provider, model and style come from the panel's own settings, so changing any of them
    // takes effect on the next picture without a restart. A custom provider supplies its own base
    // URL and key; the built-in Agnes provider falls back to the shared AGNES_API_KEY.
    const stored = await readSettings(settingsPath(config))
    const settings = stored.image
    const providerId = settings.provider === 'agnes' ? 'agnes' : settings.provider
    const provider = providerId === 'agnes'
      ? undefined
      : stored.providers.find((row) => row.id === providerId && row.kind === 'image')
    if (providerId !== 'agnes' && provider === undefined) return fail('图像生成使用的生图模型已不存在')
    if (provider !== undefined && provider.apiKey === '') return fail('生图模型还没有 API Key')
    const startedAt = Date.now()
    try {
      const prompt = buildPortraitPrompt({
        // `kind` decides whether this is a portrait, a still life or a scene: without it an item
        // card came back as a picture of a person holding the item.
        kind: entity.kind,
        name: entity.name, role: entity.role, summary: entity.summary,
        statuses: entity.statuses, category: entity.category, language,
        style: settings.style,
      })
      const bytes = await requestPortrait({
        prompt,
        model: settings.model,
        // The key is resolved here, used for one request, and dropped; it never reaches the client.
        apiKey: provider?.apiKey ?? await resolveImageKey(),
        ...(provider === undefined ? {} : { baseURL: provider.baseURL }),
        signal: request.signal,
      })
      const relative = await savePortrait(bookDir(library, bookFolder), entity.id, bytes)
      // The bytes come back with the path: the panel shows the picture it just made without a
      // second round trip, and the path is what the board will store for next time.
      await logModel?.({ ok: true, action: 'portrait', provider: providerId, model: settings.model,
        ms: Date.now() - startedAt })
      return json({ ok: true, path: relative, dataUri: await readPortrait(bookDir(library, bookFolder), relative) })
    } catch (error) {
      await logModel?.({ ok: false, action: 'portrait', provider: providerId, model: settings.model,
        error: String(error?.message ?? error), ms: Date.now() - startedAt })
      throw error
    }
  })

  /**
   * Read a stored portrait back, as a data URI.
   *
   * The host's route surface is POST-only, so there is no static path an img could point at. The
   * client asks for the file by the relative path the board recorded, and gets the bytes inline.
   * Only the portraits directory is served — the relative path travels from the browser.
   */

  route('/api/story.mosaic.portrait.read', async (request) => {
    const { library, bookFolder, path } = await bookPayload(request)
    const dataUri = await readPortrait(bookDir(library, bookFolder), path)
    if (dataUri === null) return json({ ok: false, error: 'no such portrait', missing: true })
    return json({ ok: true, dataUri })
  })

  /**
   * The proposal list, and each proposal's own page.
   *
   * Proposals are stored so they outlive the panel's memory. This route is what the proposals page
   * reads: every stored suggestion, newest first, with its status. `proposal` is passed through
   * verbatim — the page needs the changes, the evidence and the things `nameOf` resolves, and
   * reshaping them here would be a second definition of a proposal's shape.
   */

  route('/api/story.mosaic.apply', async (request) => {
    // `provenance` travels with the changes the writer accepted from a 检查本章 proposal: the
    // chapter the facts were read from and the hash of its text AT CHECK TIME. Stamping at apply
    // time (rather than proposal time) is deliberate — the facts only become board facts the
    // moment the writer accepts them, and the hash recorded is the one the model actually read.
    const { library, bookFolder, changes, proposalId, provenance } = await bookPayload(request)
    if (!Array.isArray(changes) || changes.length === 0) return fail('没有要应用的变更。')
    const { book, token } = await readBook(library, bookFolder)
    const from = provenance && typeof provenance.chapterId === 'string' && provenance.chapterId !== ''
      ? { chapterId: provenance.chapterId, hash: provenance.hash }
      : undefined
    const { mosaic, applied, skipped } = applyMosaicProposal(book.mosaic, { changes }, from)
    book.mosaic = mosaic
    const written = await writeBook(library, book, token, bookFolder)
    // The proposal this came from is answered now. Optional: changes can also arrive without a
    // stored proposal behind them, and a missing id must not fail the write.
    if (typeof proposalId === 'string' && proposalId !== '') {
      await setProposalStatus(library, bookFolder, proposalId, 'accepted')
    }
    return json({ ok: true, applied, skipped, book: written.book, token: written.token, savedAt: written.savedAt })
  })

  route('/api/story.proposals', async (request) => {
    const { library, bookFolder } = await bookPayload(request)
    const rows = await listProposals(library, bookFolder)
    // A proposal with no changes is not a decision the writer can make: it is the residue of a
    // truncated or empty model answer. Keep the file (the log of what happened) but do not put a
    // "0 处改动" row on the page.
    return json({ ok: true, proposals: rows.filter((row) => Array.isArray(row.changes) && row.changes.length > 0) })
  })

  route('/api/story.proposal.setStatus', async (request) => {
    const { library, bookFolder, id, status } = await bookPayload(request)
    if (!['pending', 'accepted', 'rejected'].includes(status)) return fail('未知的提案状态。')
    const record = await setProposalStatus(library, bookFolder, id, status)
    if (record === null) return fail('这份提案已经不在了。')
    return json({ ok: true, proposal: record })
  })

  route('/api/story.proposal.delete', async (request) => {
    const { library, bookFolder, id } = await bookPayload(request)
    const gone = await deleteProposal(library, bookFolder, id)
    if (!gone) return fail('这份提案已经不在了。')
    return json({ ok: true })
  })

  /**
   * Apply the changes the writer reviewed and accepted, against the board as it is on disk, and
   * write the file. Pure-function reuse from Task 2: the route only reads, delegates and writes.
   */

  route('/api/story.consistency', async (request) => {
    const { library, bookFolder } = await bookPayload(request)
    const { book } = await readBook(library, bookFolder)
    const text = wholeFinalText(book)
    if (text.length < 200) return fail('write a few chapters before checking continuity')
    const selection = await selectionFor('chat')
    const raw = await callModel(ctx, {
      log: logged('consistency'),
      selection,
      system: CONSISTENCY_SYSTEM,
      // Chapter titles travel with the text so an issue can be located.
      input: book.chapters
        .filter((c) => chapterFinalText(c) !== '')
        .map((c) => `## ${c.title}\n${chapterFinalText(c)}`)
        .join('\n\n')
        .slice(0, 24000),
      maxTokens: await modelMaxTokens(ctx, selection, 900),
      signal: request.signal,
    })
    return json({ ok: true, issues: parseIssueBlock(raw), text: stripJsonBlock(raw) })
  })

  /**
   * What the panel's own actions will run on, so the status bar can name it.
   *
   * The writer paid for whoever answers, and one of the roles runs on a cheap model while another
   * rewrites prose: "which model is doing this" is not cosmetic, it is the difference between
   * trusting an answer and re-reading it. Resolved per request, because the session model can
   * change while the panel is open.
   */

  route('/api/story.overview', async (request) => {
    const { library, bookFolder, refresh } = await bookPayload(request)
    const { book } = await readBook(library, bookFolder)
    const stale = refresh === true ? ['global', ...book.chapters.map((c) => c.id)] : staleEntries(book)
    let changed = false
    if (stale.includes('global')) {
      const text = wholeFinalText(book)
      if (text !== '') {
        const summary = await callModel(ctx, {
          log: logged('overview'),
          selection: await selectionFor('suggest'),
          ...buildOverviewPrompt({ kind: 'global', title: book.title, text }),
          maxTokens: 256,
          signal: request.signal,
        })
        book.overview.global = { text: summary.trim(), basedOn: hashText(text) }
        changed = true
      }
    }
    for (const chapter of book.chapters) {
      if (!stale.includes(chapter.id)) continue
      const text = chapterFinalText(chapter)
      if (text === '') continue
      const summary = await callModel(ctx, {
        log: logged('overview'),
        selection: await selectionFor('suggest'),
        ...buildOverviewPrompt({ kind: 'chapter', title: chapter.title, text }),
        maxTokens: 400,
        signal: request.signal,
      })
      book.overview.chapters[chapter.id] = { text: summary.trim(), basedOn: hashText(text) }
      changed = true
    }
    const written = changed ? await writeBook(library, book, undefined, bookFolder) : undefined
    return json({
      ok: true, overview: book.overview, refreshed: changed ? stale : [],
      book: normalizeBook(book),
      ...(written === undefined ? {} : { token: written.token, savedAt: written.savedAt }),
    })
  })

  route('/api/story.applyProposal', async (request) => {
    const { library, bookFolder, proposal } = await bookPayload(request)
    if (proposal === null || typeof proposal !== 'object') return fail('applyProposal requires a proposal')
    const { book, token } = await readBook(library, bookFolder)
    const applied = applyProposalToBook(book, proposal)
    // The write returns the token of the bytes it just wrote. The client keeps saving through its
    // own queue, and without this token its next write would be refused as stale — the writer
    // would see a save error for doing nothing but accepting a suggestion.
    const written = await writeBook(library, book, token, bookFolder)
    return json({ ok: true, applied, book: written.book, token: written.token, savedAt: written.savedAt })
  })
}
