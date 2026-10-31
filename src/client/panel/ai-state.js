/**
 * What the panel asks the model to do, and what happens to the answer.
 *
 * Nine actions, one subject: each sends text to a route, and each result lands in the same place
 * — the dock. They share the dock's state rather than receiving it, which is what keeps the
 * parameter list to the facts this hook genuinely cannot know.
 *
 * The dock has ONE slot, so every action clears the scan before it starts. A continuation asked
 * for while a copy-edit was showing would otherwise be created and then hidden behind the older
 * result: the writer presses a button and nothing visibly happens.
 *
 * @param api        - the route table.
 * @param bookFolder - the open book.
 * @param chapter    - the chapter being read; undefined on the shelf, and every action no-ops.
 * @param book       - the open book object, read for the cast list a proposal is matched against.
 * @param adoptWritten - adopts the book and token a route wrote, without re-queueing a save.
 * @param flushSave  - flushes pending typing before the host reads the file.
 * @param dockScope  - the per-book key the dock store is bucketed by.
 * @param t          - the translator, for status text.
 */
import { React } from '../shared/react.js'
import { useDockState } from '../shared/hooks.js'
import { routeChatQuestion, SCAN_EMPTY, CHAT_EMPTY } from '../shared/logic.js'

export function useAiActions({ api, bookFolder, chapter, book, adoptWritten, flushSave, dockScope, t }) {
  const [proposal, setProposal] = useDockState(dockScope, 'proposal', null)
  const [aiError, setAiError] = useDockState(dockScope, 'aiError', '')
  const [aiBusy, setAiBusy] = useDockState(dockScope, 'aiBusy', false)
  const [aiNote, setAiNote] = useDockState(dockScope, 'aiNote', '')
  const [scan, setScan] = useDockState(dockScope, 'scan', SCAN_EMPTY)
  const [chat, setChat] = useDockState(dockScope, 'chat', CHAT_EMPTY)
  const [answers, setAnswers] = useDockState(dockScope, 'answers', [])
  // A failed read must NOT look like "no answers": an empty list and a failed read are different
  // facts, and swallowing the error here is how a load problem once became undiagnosable.
  const [answersError, setAnswersError] = useDockState(dockScope, 'answersError', '')
  /**
   * Load the book's stored answers when it opens.
   *
   * Keyed on the folder, so switching books swaps the history instead of appending to it. The
   * store keeps them across a panel rebuild; this is what makes them survive a reload, which is
   * the case that used to lose everything — the list lived only in memory.
   *
   * A failed read leaves the in-memory list alone rather than emptying it: the panel may still
   * be showing answers from this session, and clearing them because a directory did not exist
   * yet would be the wrong answer to "the file is not there".
   */
  React.useEffect(() => {
    if (bookFolder === undefined) return undefined
    // A host without this route is an ordinary case (an older build, a partial roll-out) and must
    // not take the panel down with it: the history simply stays in memory, as it did before.
    if (typeof api.answers !== 'function') return undefined
    let live = true
    api.answers(bookFolder)
      .then((data) => {
        if (!live) return
        const rows = Array.isArray(data?.answers) ? data.answers : []
        setAnswers(rows)
        setAnswersError('')
      })
      .catch((failure) => {
        if (!live) return
        // Keep whatever is already in the dock store, but SAY the read failed.
        setAnswersError(String(failure?.message ?? failure))
      })
    // A read that lands after the writer switched books must not overwrite the new book's list.
    return () => { live = false }
  }, [bookFolder])

  /**
   * Drop the section scan.
   *
   * Every other AI action calls this when it starts. The dock has one slot and a scan outranks
   * a proposal in it, so a continuation asked for while a copy-edit was showing would be
   * created and then hidden behind the older result — the writer presses a button and nothing
   * visibly happens. Whatever was asked for last is what the writer is waiting for.
   */
  const clearScan = () => setScan(SCAN_EMPTY)

  /**
   * Copy-edit the section the writer is in.
   *
   * The whole section, not the selection: this is the "read what I just wrote" pass, and it is
   * asked for by pressing Tab twice, which means the writer wants the text judged rather than
   * continued.
   */
  const runReview = async (text) => {
    if (!chapter) return
    setScan({ kind: 'review', busy: true, error: '', issues: [], ideas: [], truncated: false })
    setAiError('')
    try {
      const data = await api.review(bookFolder, chapter.id, text)
      setScan({ kind: 'review', busy: false, error: '', issues: data.issues ?? [], ideas: [], truncated: data.truncated === true })
    } catch (error) {
      setScan({ kind: 'review', busy: false, error: error.message, issues: [], ideas: [], truncated: false })
    }
  }

  /**
   * A blunt grammar critique of the section, from the caret's neighbourhood.
   *
   * Pressing Command twice is a different question from pressing it once — "tell me what is
   * wrong with this prose" rather than "answer me something" — so the same gesture does not
   * open the composer. An optional direction, typed in the dock before or after, narrows the
   * pass ("把对话写得更口语"); a critique without one judges the prose as it stands.
   */
  const runCritique = async (caret, direction) => {
    if (!chapter) return
    setScan({ kind: 'critique', busy: true, error: '', issues: [], critique: null, truncated: false })
    setAiError('')
    // The steer, in the scan's own thinking line: it names what this pass is judging for.
    setAiNote(typeof direction === 'string' ? direction.trim() : '')
    try {
      const data = await api.critique(
        bookFolder, chapter.id, caret?.before ?? '', caret?.after ?? '', chapter.text ?? '',
        typeof direction === 'string' ? direction : '',
      )
      setScan({ kind: 'critique', busy: false, error: '', issues: [], critique: data.critique ?? null, truncated: data.truncated === true })
    } catch (error) {
      setScan({ kind: 'critique', busy: false, error: error.message, issues: [], critique: null, truncated: false })
    } finally {
      setAiNote('')
    }
  }

  /**
   * What a proposed cast/setting change would do, in the terms the writer thinks in.
   *
   * The host merges by name (and by title for a setting), so the question "is this new?" has
   * one answer: whether the book already has that name. That is computed here, where the book
   * is, rather than guessed in the dock.
   */
  const castMarks = (cast) => {
    const rows = []
    /**
     * The board is the only record of who is in the story.
     *
     * This used to read `book.characters` and `book.settings` — the schema-2 fields that the
     * board replaced. They were dropped, so every comparison against them was false and every
     * proposal read as `add`: a rewrite of an existing character showed up as a new one, which
     * is exactly the confusion that made the writer distrust the card. Same shape, read from
     * the board.
     */
    const entities = Array.isArray(book?.mosaic?.entities) ? book.mosaic.entities : []
    const known = (kind, field, value) => entities.some(
      (entity) => entity.kind === kind && String(entity[field] ?? '').trim() === value)
    for (const raw of cast?.characters ?? []) {
      const name = String(raw?.name ?? '').trim()
      if (name === '') continue
      rows.push({
        target: 'character', label: name,
        verb: known('character', 'name', name) ? 'update' : 'add',
        detail: [raw?.role, raw?.goal].filter((part) => typeof part === 'string' && part !== '').join(' · '),
      })
    }
    for (const raw of cast?.settings ?? []) {
      const title = String(raw?.title ?? '').trim()
      if (title === '') continue
      rows.push({
        target: 'setting', label: title,
        // A place, a faction, an item or an event: the board keeps them all as entities, and
        // the one the proposal means is matched by its title.
        verb: entities.some((entity) => String(entity.name ?? '').trim() === title) ? 'update' : 'add',
        // A setting proposal's text is the long description now; `body` is gone.
        detail: String(raw?.description ?? '').slice(0, 60),
      })
    }
    for (const raw of cast?.relationships ?? []) {
      const from = String(raw?.from ?? '').trim()
      const to = String(raw?.to ?? '').trim()
      if (from === '' || to === '') continue
      rows.push({ target: 'relationship', label: `${from} — ${to}`, verb: 'add', detail: String(raw?.kind ?? '') })
    }
    return rows
  }

  /**
   * Write a reviewed cast/setting change into the book.
   *
   * The merge lives on the host: matched by name so a repeated suggestion updates instead of
   * duplicating, and fields the model did not mention survive. The route writes the file, so
   * the token it returns replaces the one the save queue holds — without that the next autosave
   * would be refused as stale and the writer would see an error for doing nothing wrong.
   */
  const applyCast = async (p) => {
    try {
      // Whatever the debounce is still holding belongs in the file before the route reads it:
      // the merge happens on the host, against what is on disk.
      await flushSave()
      const data = await api.applyProposal(bookFolder, p.cast)
      // Only the cast is taken from the answer. The chapters stay as they are HERE, because
      // the writer may have typed since the write the route read — replacing the whole book
      // with the host's copy would undo the last few sentences on screen. The route wrote the
      // file, so its token is the one the next save must carry, and the two move together.
      adoptWritten({
        merge: (prevBook) => (prevBook === null || prevBook === undefined ? prevBook : {
          ...prevBook,
          mosaic: data.book?.mosaic ?? prevBook.mosaic,
        }),
        token: data.token,
        savedAt: data.savedAt,
      })
    } catch (error) { setAiError(error.message) }
  }

  /**
   * Put an earlier answer into the manuscript.
   *
   * It travels as a proposal, which is the mechanism the editor already has: the dock shows it,
   * the editor inserts at the caret and records one undo step. A separate path would have to
   * duplicate that range handling and undo bookkeeping, and would drift from it.
   */
  const insertFromLog = (entry) => {
    if (!chapter) return
    setProposal({
      id: `log-${entry.at}`, kind: 'chat', chapterId: chapter.id,
      baseText: '', proposedText: entry.reply, question: entry.question,
    })
  }

  /** Ask the model to rewrite exactly the selected passage. */
  const askSelection = async (selection, wholeText, range, context, instruction) => {
    if (!chapter) return
    clearScan()
    // The box has had its say. The composer now ranks above a proposal, so leaving it open
    // would bury the answer the moment it arrives — the same reason sending a chat message
    // closes it. Its draft text is untouched: the panel owns `chat.draft` separately.
    setChat((prev) => ({ ...prev, open: false }))
    setAiError('')
    setAiBusy(true)
    // The direction, in the thinking line: it is what this pass is FOR.
    setAiNote(typeof instruction === 'string' ? instruction.trim() : '')
    setProposal(null)
    try {
      // An empty instruction falls back to the standing one; a typed direction replaces it, so
      // "retry with 把结尾收得更快" is a different request, not the same one said louder.
      const ask = typeof instruction === 'string' && instruction.trim() !== ''
        ? instruction.trim() : '只改选中的这段（保持长度相近）'
      // The prose AROUND the selection travels with it: without it the model rewrites the
      // passage as a freestanding fragment — the very context loss a retry used to hit,
      // because these windows were computed and then never sent.
      const before = typeof context?.before === 'string' ? context.before.slice(-400) : ''
      const after = typeof context?.after === 'string' ? context.after.slice(0, 200) : ''
      const data = await api.suggest(bookFolder, chapter.id, selection, ask, undefined, before, after)
      // Stamped with the chapter it was asked about: the editor is reused across chapters,
      // so a proposal that is not tied to one follows the writer into the next section.
      // `kind` is what lets one card serve both AI actions.
      // The Range is recorded with the proposal: a button press blurs the textarea, and a
      // blurred one reports a collapsed selection, so reading it later applies the patch in
      // the wrong place. What the writer had selected when they asked is what gets replaced.
      setProposal({
        ...data.suggestion, kind: 'rewrite', wholeText, chapterId: chapter.id,
        from: range?.start ?? context?.start,
        to: range?.end ?? context?.end,
        // Kept with the proposal so "retry" resends the same picture of where the writer was,
        // not one rebuilt after the passage had already changed.
        context,
      })
    } catch (error) {
      setAiError(error.message)
    } finally {
      setAiBusy(false)
      setAiNote('')
    }
  }

  /**
   * Ask for the next sentence.
   *
   * A failure is REPORTED, not swallowed: silently returning '' made a broken continuation
   * look like the model had nothing to say, which is indistinguishable from a dead button.
   */
  const askContinue = async (text, caret) => {
    if (!chapter) return null
    const at = Number.isInteger(caret) ? caret : text.length
    // The caret splits the chapter, and both halves matter: the model continues the left one
    // and has to lead into the right one. When the caret is at the very end the right half is
    // empty and the prompt says so.
    const before = text.slice(0, at)
    const after = text.slice(at)
    if (before.trim() === '') { setAiError(t('label.writeBeforeContinue')); return null }
    clearScan()
    // Same as askSelection: the composer stands down so the continuation is not buried under it.
    setChat((prev) => ({ ...prev, open: false }))
    setAiError('')
    setAiBusy(true)
    setProposal(null)
    try {
      const data = await api.continue(bookFolder, chapter.id, text, before, after)
      const next = data.continuation ?? ''
      if (next === '') { setAiError(t('label.nothingToSuggest')); return null }
      // The same shape as a rewrite, so one card renders both: a continuation has no range to
      // replace, it is inserted at the caret it was asked about. The caret and the text as it
      // stood travel with the proposal so "retry" re-continues from the same spot instead of
      // treating the insert as a rewrite of an empty passage.
      setProposal({
        id: `cont-${Date.now()}`, kind: 'continue', at,
        baseText: '', proposedText: next, chapterId: chapter.id,
        caret: at, chapterTextAtAsk: text,
      })
      return next
    } catch (error) {
      setAiError(error.message)
      return null
    } finally {
      setAiBusy(false)
    }
  }

  /**
   * Ask the side chat a question about the passage, and let the answer become a suggestion.
   *
   * The flow the writer sees: press the chord, the composer opens in the dock, type, send. The
   * composer folds away and the dock takes over — first with the question and a working state,
   * then with the answer. That is one surface from start to finish instead of a chat window
   * that has to be dismissed before the manuscript is reachable again.
   */
  const askChat = async (question, selection, caret) => {
    const text = String(question ?? '').trim()
    if (text === '') return
    if (!chapter) return
    // `caret.range` carries start/end; the before/after windows travel alongside it.
    const range = caret !== null && caret !== undefined && Number.isInteger(caret.start)
      ? { start: caret.start, end: caret.end }
      : undefined
    clearScan()
    setAiError('')
    /**
     * A question asked WITH a passage selected is a rewrite instruction, not a chat message.
     *
     * The writer highlighted a sentence, pressed the chord and said "这里太满了" — routing that
     * to the chat would answer with prose about the sentence and then offer to insert the
     * answer below it, which is not what anyone meant. It goes to the rewrite route instead,
     * so the result is a diff over exactly that range, accepted and undone the same way as any
     * other rewrite.
     */
    const passage = typeof selection === 'string' ? selection : ''
    if (routeChatQuestion(passage) === 'rewrite') {
      setChat((prev) => ({ ...prev, open: false, question: text, busy: true, reply: '' }))
      setProposal(null)
      try {
        // Role 'chat': the composer is the way in, so the composer's model writes the change.
        const data = await api.suggest(bookFolder, chapter.id, passage, text, 'chat')
        const proposed = String(data?.suggestion?.proposedText ?? '').trim()
        setChat((prev) => ({ ...prev, busy: false, reply: '' }))
        if (proposed === '') { setAiError(t('label.nothingToSuggest')); return }
        // Stamped with the range it replaces, so accepting substitutes it rather than inserting
        // a second copy of the same sentence.
        setProposal({
          id: data.suggestion.id ?? `chat-rewrite-${Date.now()}`,
          kind: 'rewrite', chapterId: chapter.id,
          baseText: passage, proposedText: proposed, question: text,
          from: range?.start, to: range?.end,
        })
      } catch (error) {
        setChat((prev) => ({ ...prev, busy: false }))
        setAiError(error.message)
      }
      return
    }
    // Fold immediately: the writer has said what they wanted to say, and the answer is what
    // they are waiting for. The question stays visible in the dock so the answer has a subject.
    setChat((prev) => ({ ...prev, open: false, question: text, busy: true, reply: '' }))
    setProposal(null)
    try {
      // The selection is empty on this path by definition — a question with a passage selected
      // goes to the rewrite route above — so it is passed as '' rather than fished out again.
      const data = await api.chat(bookFolder, chat.history, text, chapter?.id, caret?.before, caret?.after, '')
      const reply = String(data.reply ?? '').trim()
      // The model may answer a "change the cast" request with a machine-readable block. That is
      // not an answer to read, it is a change to approve: it becomes a card listing what would
      // be added or updated, and nothing is written until the writer takes it.
      const marks = castMarks(data.proposal)
      setChat((prev) => ({
        ...prev,
        busy: false,
        reply,
        // The transcript keeps running so a follow-up can refer to what was already said. It
        // is capped: a side chat is about the sentence in front of the writer, not a book-long
        // conversation, and an unbounded transcript would keep re-sending the whole exchange.
        history: [...prev.history, { role: 'user', text }, { role: 'assistant', text: reply }].slice(-8),
      }))
      // The dock shows the newest answer only; everything else goes to the history card.
      //
      // Written to the book's own `answers/` folder, not only to the store: the store lives as
      // long as the page, and a reply that vanishes on reload was the one thing the writer could
      // not get back. The write is fired without awaiting, because the answer is already on
      // screen — a failed save must not turn a good answer into an error message, and the next
      // open of the panel re-reads whatever did land.
      if (reply !== '') {
        const entry = { question: text, reply, at: Date.now(), chapterId: chapter?.id }
        setAnswers((prev) => [entry, ...prev].slice(0, 50))
        if (typeof api.saveAnswer !== 'function') return
        api.saveAnswer(bookFolder, entry)
          .then((saved) => {
            // The host assigns the id and is the one that can be trusted about it; adopting it
            // means a later delete addresses the file that exists.
            const id = saved?.answer?.id
            if (typeof id !== 'string' || id === '') return
            setAnswers((prev) => prev.map((row) => (row === entry ? { ...row, id } : row)))
          })
          .catch(() => { /* the answer is on screen; the history card keeps it for this session */ })
      }
      if (marks.length > 0) {
        setProposal({
          id: `cast-${Date.now()}`, kind: 'cast', chapterId: chapter.id,
          question: text, reply, cast: data.proposal, marks,
        })
        return
      }
      // The answer arrives as a suggestion in the dock, tagged with where it applies. A chat
      // answer about a passage is offered the same way as a rewrite, so accepting it is the
      // same gesture and it is undoable through the same history. The question and the caret
      // windows travel with it so "retry" re-asks the same question, not a rewrite of nothing.
      if (reply !== '') {
        setProposal({
          id: `chat-${Date.now()}`, kind: 'chat', chapterId: chapter.id,
          baseText: '', proposedText: reply, question: text,
          chatQuestion: text, caret: range,
        })
      }
    } catch (error) {
      setChat((prev) => ({ ...prev, busy: false }))
      setAiError(error.message)
    }
  }

  /**
   * Drop the showing proposal and its error.
   *
   * Accepting and rejecting both do this, and so does the retry: the card goes away before the
   * next request starts, so a stale one cannot be read as the answer to the new question.
   */
  const dismissProposal = () => { setProposal(null); setAiError('') }

  /**
   * Clear a working flag that outlived its request.
   *
   * The busy flags live in the store that survives a re-mount, so a request whose `finally` never
   * ran — a render crash mid-flight, a panel rebuilt under a pending await — leaves the button a
   * stuck ellipsis. The panel's watchman calls this after two minutes.
   */
  const clearStuck = () => { setAiBusy(false); setChat((prev) => (prev !== null && prev !== undefined && prev.busy === true ? { ...prev, busy: false } : prev)) }

  return {
    // The dock's state, so the panel can render what is showing without reading the store twice.
    proposal, setProposal, aiError, aiBusy, aiNote, scan, setScan, chat, setChat, answers, answersError,
    // Discarding and housekeeping, rather than raw setters: the intent is what the panel has.
    dismissProposal, clearStuck,
    // The actions.
    clearScan, runReview, runCritique, applyCast, insertFromLog,
    askSelection, askContinue, askChat,
  }
}
