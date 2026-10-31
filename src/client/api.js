/**
 * The host routes this panel calls, and the one function that calls them.
 *
 * Every route is POST with a JSON body, including the reads: the host's story surface is
 * POST-only, which is why there is no URL to point an `<img>` at and the stored portrait is
 * fetched through a route like everything else.
 *
 * `post` treats a non-`ok` answer as a failure with the host's own message. That is the only
 * error shape the panel ever shows a writer, so it is normalised here rather than at each call.
 */
/**
 * The HTTP transport the DSH panel uses. A standalone renderer replaces this function (not the
 * call table below) with an IPC bridge that has the same shape: (path, body) -> parsed answer.
 */
export async function fetchTransport(path, body) {
  let response
  try {
    response = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  } catch (error) {
    // A browser reports a refused connection as the bare phrase "Failed to fetch". Name what
    // failed and what to check; the raw phrase gives the writer nothing to act on.
    throw new Error(`无法连接故事服务（${path}）：${error?.message ?? '网络错误'}`, { cause: error })
  }
  if (!response.ok) throw new Error(`${path} failed: HTTP ${response.status}`)
  let data
  try { data = await response.json() } catch (error) {
    throw new Error(`${path} 返回了无法解析的响应`, { cause: error })
  }
  if (data.ok !== true) throw new Error(data.error || `${path} failed`)
  return data
}

/** Backwards-compatible name for the DSH transport. */
export const post = fetchTransport

/**
 * The route table, with transport injected.
 *
 * Every route is POST with a JSON body, including the reads. The table itself knows only paths
 * and payloads; DSH passes fetch, Electron can pass preload/IPC. That is what keeps one copy of
 * the API surface for both hosts.
 */
export function createStoryApi(transport) {
  if (typeof transport !== 'function') throw new TypeError('story api needs a transport function')
  const call = (path, body) => transport(path, body)
  return {

    // bookFolder selects which manuscript; undefined means the workspace's original book.
    books: () => call('/api/story.books', {}),
    createBook: (title) => call('/api/story.createBook', { title }),
    openDirectory: (path) => call('/api/story.openDirectory', { path }),
    deleteBook: (folder, removeFiles) => call('/api/story.deleteBook', { bookFolder: folder, removeFiles }),
    renameBook: (folder, title) => call('/api/story.renameBook', { bookFolder: folder, title }),
    load: (bookFolder) => call('/api/story.load', { bookFolder }),
    save: (book, token, bookFolder) => call('/api/story.save', { book, token, bookFolder }),
    // The host takes (chapterId, text, instruction): the unit of an AI edit is the SELECTED
    // TEXT, not a paragraph. Passing the old paragraphId slot left `text` empty and pushed the
    // selection into `instruction`, so the model was asked to rewrite nothing and answered with
    // the instruction glued to the passage.
    // `role` names whose model does the work. It is omitted for the editor's own actions, which use
    // the `suggest` model, and is 'chat' when the question came in through the composer: the
    // writer configured a model for the chat because it is the one that knows the story, and an
    // edit that arrives through that conversation should not be handed to a different model.
    suggest: (bookFolder, chapterId, text, instruction, role, before, after) =>
      call('/api/story.suggest', { bookFolder, chapterId, text, instruction, role, before, after }),
    overview: (bookFolder, refresh) => call('/api/story.overview', { bookFolder, refresh }),
    snapshot: (bookFolder, label) => call('/api/story.snapshot', { bookFolder, label }),
    restore: (bookFolder, id) => call('/api/story.restore', { bookFolder, id }),
    // The caret travels with the question: without it the chat could only answer in the
    // abstract, and a request to "write from here" had no "here".
    chat: (bookFolder, history, message, chapterId, before, after, selection) =>
      call('/api/story.chat', { bookFolder, history, message, chapterId, before, after, selection }),
    applyProposal: (bookFolder, proposal) => call('/api/story.applyProposal', { bookFolder, proposal }),
    // `before` is the text up to the caret and `after` the text following it. Sending the whole
    // chapter as `text` made the model continue from the END even when the writer was working
    // in the middle of a paragraph.
    continue: (bookFolder, chapterId, text, before, after, role) =>
      call('/api/story.continue', { bookFolder, chapterId, text, before, after, role }),
    // 流派: saved style prompts, which one is active, and generating a prompt from a sample.
    writingStyles: (bookFolder) => call('/api/story.writingStyles', { bookFolder }),
    saveWritingStyle: (bookFolder, fields) => call('/api/story.writingStyle.save', { bookFolder, ...fields }),
    setWritingStyleActive: (bookFolder, id) => call('/api/story.writingStyle.setActive', { bookFolder, id }),
    deleteWritingStyle: (bookFolder, id) => call('/api/story.writingStyle.delete', { bookFolder, id }),
    generateWritingStyle: (bookFolder, source) => call('/api/story.writingStyle.generate', { bookFolder, source }),
    consistency: (bookFolder) => call('/api/story.consistency', { bookFolder }),
    manuscript: (bookFolder) => call('/api/story.manuscript', { bookFolder }),
    // Which model the panel's own actions run on, for the status bar.
    meta: () => call('/api/story.meta', {}),
    // Where the books live. One setting decides it; changing it does not move any files.
    setLibrary: (path) => call('/api/story.setLibrary', { path }),
    // The model page: what each role resolves to, and where the writer pinned one.
    models: () => call('/api/story.models', {}),
    // Every model the host can route to. The page's picker is built from this, not from a
    // client service: what the host will accept is what the page offers.
    catalog: () => call('/api/story.catalog', {}),
    // The reasoning levels one model offers, for the axis.
    efforts: (provider, model) => call('/api/story.efforts', { provider, model }),
    setModel: (role, selection) => call('/api/story.setModel', { role, selection }),
    // A copy-edit of one section, and a blunt grammar critique of the prose by the caret.
    review: (bookFolder, chapterId, text) => call('/api/story.review', { bookFolder, chapterId, text }),
    critique: (bookFolder, chapterId, before, after, text, direction) =>
      call('/api/story.critique', { bookFolder, chapterId, before, after, text, direction }),
    // The mosaic board: chapter consistency check, board Q&A, and reading relations out of the
    // cards. The sheet calls these on the relations page.
    mosaicCheck: (bookFolder, chapterId, text) => call('/api/story.mosaic.check', { bookFolder, chapterId, text }),
    mosaicAsk: (bookFolder, question) => call('/api/story.mosaic.ask', { bookFolder, question }),
    // Reads the CARDS, not a chapter: the writer described who knows whom in the summaries and
    // expects the lines to appear. The cards travel with the request because the panel is the
    // one holding the board the writer is looking at; the host re-reading the file would answer
    // about a possibly older (or missing) copy of it.
    mosaicRelate: (cards, edges, bookFolder) => call('/api/story.mosaic.relate', { cards, edges, bookFolder }),
    // Stored proposals: the page that lists what the model suggested and nobody answered yet.
    proposals: (bookFolder) => call('/api/story.proposals', { bookFolder }),
    setProposalStatus: (bookFolder, id, status) => call('/api/story.proposal.setStatus', { bookFolder, id, status }),
    deleteProposal: (bookFolder, id) => call('/api/story.proposal.delete', { bookFolder, id }),
    // The write for the changes the writer accepted, one call for the whole batch. The host
    // answers with the board it actually wrote, so the sheet can repaint from it.
    // proposalId is optional and only there so the host can mark a stored proposal answered in
    // the same write that applied it.
    mosaicApply: (bookFolder, changes, proposalId, provenance) => call('/api/story.mosaic.apply', { bookFolder, changes, proposalId, provenance }),
    // One portrait per card. The entity travels whole because the prompt is built from the fields
    // the writer has just been editing, not from what is on disk.
    mosaicPortrait: (bookFolder, entity, language) => call('/api/story.mosaic.portrait', { bookFolder, entity, language }),
    // The stored picture, read back by the relative path the board recorded. The host's route
    // surface is POST-only, so there is no URL to point an img at.
    mosaicPortraitRead: (bookFolder, path) => call('/api/story.mosaic.portrait.read', { bookFolder, path }),
    // The portrait settings live beside the role models in one file, so they share one write.
    setImage: (image) => call('/api/story.setImage', { image }),
    imageModels: (image) => call('/api/story.imageModels', image ?? {}),
    providerTest: (provider) => call('/api/story.provider.test', provider),
    // The answer history, kept in the book's own `answers/` folder rather than in book.json.
    // `limit` is passed because the panel shows the newest few; the host sorts before slicing.
    answers: (bookFolder, limit) => call('/api/story.answers', { bookFolder, limit }),
    saveAnswer: (bookFolder, answer) => call('/api/story.answer.save', { bookFolder, answer }),
    deleteAnswer: (bookFolder, id) => call('/api/story.answer.delete', { bookFolder, id }),
    // The writer's own OpenAI-compatible providers: interface, key and model ids.
    providers: () => call('/api/story.providers', {}),
    providerModels: ({ id, baseURL, apiKey }) => call('/api/story.provider.models', { id, baseURL, apiKey }),
    saveProvider: (provider) => call('/api/story.provider.save', { provider }),
    deleteProvider: (id) => call('/api/story.provider.delete', { id }),
    // The system event log: every model call's and picture request's outcome, newest last.
    events: () => call('/api/story.events', {}),
  }
}

export const api = createStoryApi(fetchTransport)
