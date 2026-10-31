/**
 * The panel's pure logic: no React, no DOM, no module state.
 *
 * What is left here is the panel's own view logic — the row edits, the word diff, the
 * find-and-highlight, the editor's undo history, the markdown renderer, and the typography maths
 * that decides how wide a line is. The manuscript tree itself moved to `domain/tree.js`, shared
 * with the host, so there is one answer to what a leaf is and where an id sits.
 *
 * Two groups that used to live here have moved to their own files, because they were topics
 * rather than helpers: the keyboard gestures (gestures.js) and the save interval with the queue
 * that rides it (save-queue.js).
 *
 * Nothing in this file may reach for `React`, `h`, `document`, `window` or `fetch`. The moment one
 * of them appears, it is no longer logic and belongs with the component that needs it.
 */

/**
 * Word/character diff of two versions of a passage, for the rewrite card.
 *
 * The table is one flat `Uint32Array` rather than a row per index: `n + 1` separate arrays
 * meant 3,001 allocations for a 3,000-character selection, and the allocation was most of
 * the cost of opening the dock. Indexing is `row * width + column` instead of `table[row][col]`.
 *
 * The shared prefix is skipped before the table is built. Two versions of a sentence usually
 * agree for a while before the first change, and those characters can never be part of one —
 * cutting them off shrinks the table quadratically. The suffix is NOT cut: the tie-break below
 * prefers a deletion, and trimming the tail changes which of two equally long alignments wins.
 *
 * This is still O(n·m) in the length of the two versions. A whole chapter rewritten end to end
 * is a one-off render of ~50ms at 3,000 characters; making that faster needs a different
 * algorithm (Myers), which is not worth the risk to a diff that already reads correctly.
 */
export function diffWords(before, after) {
  const a = Array.from(before ?? '')
  const b = Array.from(after ?? '')
  if (a.length === 0) return b.length === 0 ? [] : [{ type: 'add', text: b.join('') }]
  if (b.length === 0) return [{ type: 'del', text: a.join('') }]
  let prefix = 0
  while (prefix < a.length && prefix < b.length && a[prefix] === b[prefix]) prefix += 1
  const left = a.slice(prefix)
  const right = b.slice(prefix)
  const n = left.length, m = right.length
  const out = []
  if (prefix > 0) out.push({ type: 'same', text: a.slice(0, prefix).join('') })
  // Both sides can end up empty here: identical text is all prefix. That is one run, not two.
  if (n === 0 && m === 0) return out
  if (n === 0) out.push({ type: 'add', text: right.join('') })
  else if (m === 0) out.push({ type: 'del', text: left.join('') })
  else {
    const width = m + 1
    const lcs = new Uint32Array((n + 1) * width)
    for (let i = n - 1; i >= 0; i -= 1) {
      const row = i * width
      const below = row + width
      for (let j = m - 1; j >= 0; j -= 1) {
        lcs[row + j] = left[i] === right[j]
        ? lcs[below + j + 1] + 1
        : Math.max(lcs[below + j], lcs[row + j + 1])
      }
    }
    const raw = []
    let i = 0, j = 0
    while (i < n && j < m) {
      if (left[i] === right[j]) { raw.push({ type: 'same', text: left[i] }); i += 1; j += 1 }
      else if (lcs[(i + 1) * width + j] >= lcs[i * width + j + 1]) { raw.push({ type: 'del', text: left[i] }); i += 1 }
      else { raw.push({ type: 'add', text: right[j] }); j += 1 }
    }
    for (; i < n; i += 1) raw.push({ type: 'del', text: left[i] })
    for (; j < m; j += 1) raw.push({ type: 'add', text: right[j] })
    for (const seg of raw) {
      const last = out[out.length - 1]
      if (last && last.type === seg.type) last.text += seg.text
      else out.push({ ...seg })
    }
  }
  return out
}
/**
 * The three small operations the reference drawers all perform on one list of records.
 *
 * The cast, the world-building entries and the relationships are different shapes, but editing
 * them is the same three moves: change one field of one row, append a row, drop a row. Each page
 * had written those out itself, so the same `map`/`filter` appeared six times and the id scheme
 * drifted (one page used a bare timestamp, another a prefix, a third a timestamp plus a random
 * suffix — which means two rows made in the same millisecond could collide).
 *
 * These are pure and take the list rather than the book: a page decides which field of the book
 * it is replacing, so nothing here has to know what a book looks like.
 */

/** One row with one field changed, or the list unchanged when the id is not in it. */
export function patchRow(list, id, key, value) {
  return (list ?? []).map((row) => (row.id === id ? { ...row, [key]: value } : row))
}

/** The list with `row` appended. */
export function appendRow(list, row) {
  return [...(list ?? []), row]
}

/** The list without the row carrying this id. */
export function removeRow(list, id) {
  return (list ?? []).filter((row) => row.id !== id)
}

/**
 * An id for a new record: the prefix, the clock, and a random tail.
 *
 * The clock alone is not enough. Two rows added in the same millisecond — a paste, a script, a
 * writer who is quick — would share an id, and `patchRow` would then edit both at once.
 */
export function rowId(prefix) {
  // Eight base-36 characters, not four. The timestamp alone is not enough — a paste or a fast
  // double-click makes several rows inside one millisecond — and four characters gave only 1.7M
  // possibilities, so a few hundred rows in the same millisecond collided about 7% of the time.
  // Two rows sharing an id means `patchRow` edits both at once.
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10).padEnd(8, '0')}`
}

/**
 * A timestamp as the panel shows it: hour and minute in the writer's own locale.
 *
 * `toLocaleTimeString([], { hour, minute })` was written out at three call sites, which is three
 * chances for one of them to drift to a different format.
 */
export function clockTime(at) {
  const value = Number(at)
  if (!Number.isFinite(value) || value <= 0) return ''
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/** Whether two shelf listings describe the same books, so a re-read can be a no-op. */

/**
 * Every occurrence of `query` in `text`, as offsets, for the find bar.
 *
 * Matching is literal and case-insensitive by default: a writer searching for a character's name
 * wants every spelling of it, and a regular expression is a different feature with its own UI.
 */
export function findMatches(text, query, caseSensitive = false) {
  if (typeof text !== 'string' || typeof query !== 'string' || query === '') return []
  const haystack = caseSensitive ? text : text.toLowerCase()
  const needle = caseSensitive ? query : query.toLowerCase()
  const hits = []
  let from = 0
  for (;;) {
    const at = haystack.indexOf(needle, from)
    if (at === -1) break
    hits.push({ start: at, end: at + needle.length })
    // Overlapping hits would make "next" stand still on repeated characters ("啊啊啊").
    from = at + needle.length
    if (hits.length > 2000) break
  }
  return hits
}

/**
 * Split the text into runs for the painted layer, honouring a selection AND the search hits.
 *
 * The textarea's own selection stops being drawn the moment focus moves elsewhere — opening the
 * composer does exactly that — so a passage the writer had highlighted appeared to be deselected
 * the instant they started typing a question about it. The painted layer keeps drawing it, in the
 * quieter "inactive" wash a background window uses, so the selection is visibly still there.
 *
 * Both markers can overlap: searching for a word inside the selected passage, for instance. The
 * runs are therefore cut at every boundary rather than layered, which is the only way to draw the
 * intersection once and correctly.
 */
export function paintRuns(text, options = {}) {
  const source = text ?? ''
  if (source === '') return [{ text: '', hit: false, active: false, selected: false }]
  const selection = options.selection
  const selFrom = selection !== undefined && selection !== null && Number.isInteger(selection.start) ? selection.start : -1
  const selTo = selection !== undefined && selection !== null && Number.isInteger(selection.end) ? selection.end : -1
  const hasSelection = selFrom >= 0 && selTo > selFrom
  const hits = Array.isArray(options.hits) ? options.hits : []
  const activeIndex = Number.isInteger(options.activeIndex) ? options.activeIndex : -1

  // Every offset where the styling can change.
  const cuts = new Set([0, source.length])
  if (hasSelection) { cuts.add(Math.max(0, Math.min(source.length, selFrom))); cuts.add(Math.max(0, Math.min(source.length, selTo))) }
  // Only the hits that can actually be drawn take part: an out-of-range or empty one would add
  // cut points with no run between them. Filtering once here also means the walk below never has
  // to skip a hit it cannot use.
  const marks = hits.filter((hit) => hit.start >= 0 && hit.end <= source.length && hit.start < hit.end)
  for (const hit of marks) { cuts.add(hit.start); cuts.add(hit.end) }
  const points = [...cuts].sort((a, b) => a - b)
  const runs = []
  /**
   * Which hit covers the run being built, found by advancing one cursor instead of scanning the
   * hit list per run.
   *
   * The old `hits.findIndex(...)` inside the loop made this quadratic: 40,000 characters with a
   * common character highlighted (the find bar open on "的") is 40,000 hits and 40,000 runs, and
   * one keystroke took 772ms to repaint. Both lists are in ascending order, so a run can only be
   * covered by a hit at or after the previous run's — the cursor never goes back.
   *
   * `active` also had to be guarded: `hitIndex === activeIndex` was true for EVERY run when
   * there were no hits, because both were -1. The render only reads `active` on a hit, so it
   * never showed, but the run list said something false.
   */
  let cursor = 0
  for (let i = 0; i < points.length - 1; i += 1) {
    const from = points[i]
    const to = points[i + 1]
    if (from === to) continue
    while (cursor < marks.length && marks[cursor].end <= from) cursor += 1
    const on = cursor < marks.length && marks[cursor].start <= from && marks[cursor].end >= to
    runs.push({
      text: source.slice(from, to),
      hit: on,
      active: on && cursor === activeIndex,
      selected: hasSelection && from >= selFrom && to <= selTo,
    })
  }
  return runs.length === 0 ? [{ text: source, hit: false, active: false, selected: false }] : runs
}

/**
 * A small undo history for one text field.
 *
 * The browser's own undo stack is not usable here: the textarea is a CONTROLLED input, so every
 * keystroke round-trips through React state and the native stack is reset. That also meant an AI
 * rewrite — which replaces a range wholesale — could not be undone at all.
 *
 * Entries are whole snapshots of the text with the caret that produced them. A chapter is a few
 * thousand characters, so the memory cost is trivial and the correctness is not: a diff-based
 * history has to get every edge case right to avoid corrupting the manuscript.
 *
 * Coalescing: consecutive typing merges into one entry while the gap stays short, so undo steps
 * by phrase rather than by character. A replacement (the AI) and a pause both start a new entry.
 */
export function createHistory(initial = '', options = {}) {
  const limit = options.limit ?? 200
  const mergeWindow = options.mergeWindow ?? 700
  const now = options.now ?? (() => Date.now())
  const entries = [{ text: initial, start: 0, end: 0, at: now() }]
  let cursor = 0
  /** The last edit was ordinary typing, which is what may be merged with the next one. */
  let typing = false

  const current = () => entries[cursor]

  return {
    /** The text to show. */
    text() { return current().text },
    /** The caret that belonged to that text. */
    caret() { return { start: current().start, end: current().end } },
    /**
     * Record an edit.
     *
     * @param next - the text after the edit
     * @param caret - `{ start, end }` of the caret after the edit
     * @param kind - `'type'` merges with the previous typing entry inside the merge window;
     *               `'replace'` (an AI rewrite, a paste over a selection) always starts a new one
     * @returns false when the text did not actually change
     */
    record(next, caret, kind = 'type') {
      const top = current()
      if (next === top.text) return false
      const at = { start: caret?.start ?? next.length, end: caret?.end ?? caret?.start ?? next.length }
      const mergeable = kind === 'type' && typing && cursor === entries.length - 1
      && now() - top.at <= mergeWindow
      if (mergeable) {
        // Keep the ORIGINAL caret of the merged run: undoing a burst of typing should put the
        // caret back where the writer started, not where they were one character ago.
        entries[cursor] = { text: next, start: at.start, end: at.end, at: now() }
      } else {
        // A new edit discards the redo branch, which is what every editor does.
        entries.splice(cursor + 1)
        entries.push({ text: next, start: at.start, end: at.end, at: now() })
        if (entries.length > limit) entries.shift()
        cursor = entries.length - 1
      }
      typing = kind === 'type'
      return true
    },
    /** Step back. Answers the state to restore, or undefined when already at the oldest entry. */
    undo() {
      if (cursor === 0) return undefined
      cursor -= 1
      typing = false
      return current()
    },
    /** Step forward. Answers the state to restore, or undefined when at the newest entry. */
    redo() {
      if (cursor >= entries.length - 1) return undefined
      cursor += 1
      typing = false
      return current()
    },
    /** Drop everything and start again from `text`, e.g. when another chapter is opened. */
    reset(text = '') {
      entries.length = 0
      entries.push({ text, start: 0, end: 0, at: now() })
      cursor = 0
      typing = false
    },
    canUndo() { return cursor > 0 },
    canRedo() { return cursor < entries.length - 1 },
    size() { return entries.length },
  }
}

/**
 * Render the manuscript's Markdown into blocks the panel can draw as elements.
 *
 * The merged manuscript is generated by the host with a fixed, tiny subset — `#` headings for
 * volume/chapter/section, blank-line-separated prose, and nothing else. So this parses exactly
 * that and does NOT pretend to be a Markdown engine: no inline HTML, no links, no images, and
 * every string ends up as a text node rather than markup. Anything richer would need a real
 * parser and a sanitiser, and the writer's own prose is the only input.
 *
 * `**bold**` and `*italic*` are recognised because a writer does type them, and they are applied
 * as element types, never as injected HTML.
 */
export function renderMarkdownBlocks(markdown) {
  const lines = String(markdown ?? '').split('\n')
  const blocks = []
  let paragraph = []

  const flush = () => {
    if (paragraph.length === 0) return
    blocks.push({ type: 'p', spans: inlineSpans(paragraph.join(' ')) })
    paragraph = []
  }

  for (const line of lines) {
    const heading = /^(#{1,6})\s+(.*)$/.exec(line)
    if (heading !== null) {
      flush()
      blocks.push({ type: 'h', level: heading[1].length, spans: inlineSpans(heading[2]) })
      continue
    }
    if (line.trim() === '') { flush(); continue }
    // A horizontal rule is the only other block the generator emits.
    if (/^\s*([-*_])\s*\1\s*\1[\s\-*_]*$/.test(line)) { flush(); blocks.push({ type: 'hr' }); continue }
    paragraph.push(line.trim())
  }
  flush()
  return blocks
}

/**
 * Split one line into plain, bold and italic runs.
 *
 * Deliberately shallow: one level of nesting, no escaping, and an unmatched marker stays literal
 * text. The point is that the writer's asterisks do not appear on screen, not that Markdown is
 * implemented.
 */
function inlineSpans(text) {
  const chars = String(text ?? '')
  const spans = []
  let at = 0
  // Bold first: `**` has to be tried before `*`, or every bold run becomes two italics.
  const pattern = /\*\*([^*]+)\*\*|\*([^*]+)\*/g
  let match
  while ((match = pattern.exec(chars)) !== null) {
    if (match.index > at) spans.push({ text: chars.slice(at, match.index), style: '' })
    if (match[1] !== undefined) spans.push({ text: match[1], style: 'bold' })
    else spans.push({ text: match[2], style: 'italic' })
    at = match.index + match[0].length
  }
  if (at < chars.length) spans.push({ text: chars.slice(at), style: '' })
  return spans.length === 0 ? [{ text: '', style: '' }] : spans
}

/**
 * The panel's keyboard gestures, per platform.
 *
 * Three actions share one key: Tab asks for the next sentence, and the panel also offers a
 * copy-edit of the whole section and a grammar critique. The two rarer ones used to be DOUBLE
 * presses — Tab twice, Command twice — which forced every single press to wait 200ms to find out
 * whether a second one was coming. That wait was paid on the gesture a writer uses constantly, to
 * support the two they use occasionally.
 *
 * They are chords now, and a chord cannot be confused with the key it is built on: the action
 * fires immediately, and the plain key keeps its plain meaning.
 *
 *   Tab              ask for the next sentence (unchanged)
 *   ⌥Tab             grammar critique of the section   (was: Tab twice)
 *   ⌥⌘               read the section: its problems    (was: Command twice)
 *
 * The read is Option+Command and NOTHING ELSE: no Tab under it. That is what the writer asked for,
 * and it is why that one gesture has its own matcher (`isModifierChord`) instead of going through
 * `chordMatches` — the only key in the press is one of the modifiers the gesture is made of.
 *
 * The two were the other way round for a while, which contradicted the dock's own titles:
 * 文法锐评 is the narrow grammar pass and takes the shorter chord; 这一节的问题 is the broad read
 * of the section.
 *
 * Windows cannot have ⌥Tab: Alt+Tab is the system's task switcher and a page never receives it. So
 * Windows uses Ctrl+Alt+Tab for the grammar pass and Ctrl+Alt+Shift+Tab for the read — the same
 * chord with Shift, which is how a second variant of one shortcut is normally spelled. The read
 * keeps a letter there: Ctrl+Alt with nothing under it is not a press Windows reports usefully.
 * Bare Tab still continues.
 *
 * `mod` is the platform's primary modifier: Command on macOS, Control elsewhere.
 */
/**
 * The chords the writer may rebind, in the order the settings page lists them.
 *
 * Only the three Tab-family gestures are here. The composer's gesture is a LONE modifier press —
 * a thing with no key in it — and a key recorder cannot express it, so it stays fixed and is
 * documented rather than edited.
 */

/**
 * Which route a question from the composer takes.
 *
 * With a passage selected the question is an INSTRUCTION ABOUT THAT PASSAGE ("这里太满了"), and it
 * belongs to the rewrite route: the answer comes back as a diff over exactly that range, which is
 * accepted and undone like any other rewrite.
 *
 * With nothing selected it is a question about the work, and the chat route answers it.
 *
 * Kept as a function because getting it wrong is silent: the wrong route still produces text, it
 * just produces the wrong kind of text in the wrong place.
 */
export function routeChatQuestion(selection) {
  const passage = typeof selection === 'string' ? selection : ''
  return passage.trim() === '' ? 'chat' : 'rewrite'
}

/** The typography defaults, and the bounds a stored value is clamped into. */
export const TYPOGRAPHY_DEFAULT = { fontSize: 16, lineHeight: 1.9, width: 760 }
export const TYPOGRAPHY_BOUNDS = { fontSize: [12, 22], lineHeight: [1.5, 2.2], width: [600, 1100] }


/**
 * The sizes the panel offers, in steps rather than on a slider.
 *
 * A range input implies the value between two stops is meaningful, and for typography it is not:
 * 16.4px and 16.6px are the same page, and dragging a slider to find the one you liked last week
 * is impossible. Four sizes, three leadings, three measures — every setting is a place you can
 * name and come back to.
 *
 * All of them sit inside TYPOGRAPHY_BOUNDS, which still guards a value stored by another build.
 */
export const TYPE_PRESETS = {
  // Evenly spaced, so an integer stored by an older build is never exactly between two steps.
  fontSize: [
    { value: 14, key: 'type.size.small' },
    { value: 16, key: 'type.size.normal' },
    { value: 18, key: 'type.size.large' },
    { value: 20, key: 'type.size.huge' },
  ],
  lineHeight: [
    { value: 1.7, key: 'type.leading.tight' },
    { value: 1.9, key: 'type.leading.normal' },
    { value: 2.1, key: 'type.leading.loose' },
  ],
  width: [
    { value: 640, key: 'type.measure.narrow' },
    { value: 760, key: 'type.measure.normal' },
    { value: 900, key: 'type.measure.wide' },
  ],
}

/** Clamp a stored typography value into range; a corrupt or missing entry falls back. */
export function normalizeTypography(raw) {
  const read = (key) => {
    const value = Number(raw?.[key])
    const [min, max] = TYPOGRAPHY_BOUNDS[key]
    if (!Number.isFinite(value)) return TYPOGRAPHY_DEFAULT[key]
    // Two decimals is enough for a line-height and keeps the style string small.
    return Math.round(Math.min(max, Math.max(min, value)) * 100) / 100
  }
  return { fontSize: read('fontSize'), lineHeight: read('lineHeight'), width: read('width') }
}

/**
 * The interface type size.
 *
 * A PANEL setting, not a page setting: the composer, a reply, a cast list and the dock's buttons are
 * chrome, so they do not follow the manuscript's size. Tying them to it made the box shrink to 11px
 * when the page was set to "small" and swell to 16px when it was set to "huge" — the writer changed
 * how the BOOK reads and the input box changed with it, which is not a relationship anyone asked
 * for. The manuscript's size stays on the manuscript.
 *
 * 16px, the same number as the page's own standard step, but arrived at independently: this is the
 * one size the dock uses, whatever the page is set to.
 */
export const UI_FONT_SIZE = 16
/**
 * Its leading, on the same footing: fixed, and sized for the text rather than borrowed from the
 * 13px scale. 20px of leading under 16px type is a setting a browser would not pick, and it made
 * the composer's first line sit tight inside the card.
 */
export const UI_LINE_HEIGHT = 24
/**
 * How many characters fit in four or five lines of the manuscript, for a given page setting.
 *
 * The dock decides whether a proposed passage is short enough to show IN THE BOOK'S TYPE, which is
 * what makes a small edit feel like part of the page rather than a panel reading it back. Past
 * roughly five lines that stops working: a long block set at 16/1.9 inside a card is a wall, and
 * the writer is reading a page inside a page.
 *
 * The number comes from the page itself, not from a constant:
 *   - a Chinese character is about one em wide, so the characters per line is width / fontSize;
 *   - four to five lines is 4.5 of them, which is the middle of the range the writer asked for.
 * Both inputs are the writer's own typography settings, so changing the page size moves the
 * threshold with it — a 14px page fits more characters per line, and a proportionally longer
 * passage is still "about five lines".
 *
 * This is why the result is computed from settings rather than measured: it is only used to pick a
 * font size, an estimate is enough, and an estimate can be computed from a pure function of the
 * settings instead of from the DOM.
 */
export function proseLineBudget(typography) {
  const size = Number(typography?.fontSize)
  const width = Number(typography?.width)
  // A corrupt setting falls back rather than producing Infinity and letting every passage through.
  const fontSize = Number.isFinite(size) && size > 0 ? size : TYPOGRAPHY_DEFAULT.fontSize
  const measure = Number.isFinite(width) && width > 0 ? width : TYPOGRAPHY_DEFAULT.width
  const perLine = measure / fontSize
  // Trailing whitespace and newlines do not take a line of their own in the rendered block, so the
  // budget is of visible characters and the comparison below counts them the same way.
  return Math.round(perLine * 4.5)
}

/**
 * The three "nothing is showing yet" shapes.
 *
 * Frozen values rather than factories, and that matters: the dock compares `scan.kind` and
 * `chat.open` on every render, so handing it a fresh object each time made a rebuilt panel look
 * like a scan had just started. `emptyBookState` IS a factory — the opposite reason. `setState`
 * bails out when the next value is identical to the current one, so a shared object handed to two
 * resets in a row would be a no-op and the screen would keep the old book.
 */
export const SCAN_EMPTY = { kind: null, busy: false, error: '', issues: [], critique: null, truncated: false }
export const CHAT_EMPTY = { open: false, question: '', busy: false, reply: '', history: [] }
export const emptyBookState = () => ({ status: 'idle', book: null, token: '', error: '', saveError: '', recovered: false })
