/**
 * The keyboard gestures: the chord table, the matcher, and the lone-modifier watcher.
 *
 * One topic, and it was the largest self-contained group left inside logic.js. Every name here
 * is about the same question — "was this key press the gesture?" — and the answer differs per
 * platform, which is why it is a table plus matchers rather than a switch in the handler.
 *
 * `REBINDABLE_GESTURES` is the list the settings page offers; the matchers below it are not
 * interchangeable: `chordMatches` compares `event.key` against a named key, `isModifierChord`
 * handles a press whose only key IS a modifier, and `createLoneModifierWatcher` fires on ONE
 * modifier coming back up after nothing else was typed. That last kind is the composer's default,
 * and `loneModifierKey` says which modifier a chord of that kind means — so rebinding the composer
 * key to a chord moves it onto `chordMatches` instead, without a second code path in the editor.
 */

/**
 * The gestures the settings page offers, in the order its rows are drawn.
 *
 * `chat` is the odd one out and is listed last on purpose: its DEFAULT is a lone modifier press
 * (see createLoneModifierWatcher), not a chord with a letter under it. It is rebindable all the
 * same — the writer asked for it — because "the composer key is not the one I want" is a real
 * complaint and the answer cannot be "that one is not configurable".
 */
export const REBINDABLE_GESTURES = ['ask', 'critique', 'review', 'chat']

/** Whether a chord is a whole press of its own: modifiers only, no letter under them. */
export function isModifierOnly(chord) {
  return chord === null || chord === undefined || typeof chord !== 'object'
    ? false
    : chord.key === ''
}

/** The parts of a chord a writer can set: the key and the three modifiers. */
export function normalizeChord(raw) {
  const source = raw !== null && typeof raw === 'object' ? raw : {}
  const key = typeof source.key === 'string' && source.key !== '' ? source.key : 'Tab'
  return {
    key: key.length === 1 ? key.toUpperCase() : key,
    alt: source.alt === true,
    mod: source.mod === true,
    shift: source.shift === true,
  }
}

/**
 * Read the writer's overrides and fold them into the platform defaults.
 *
 * Stored shape is `{ ask: { key, alt, mod, shift }, ... }` in localStorage. A missing or malformed
 * entry keeps the default: an unreadable setting must never leave a gesture with no key at all,
 * because a shortcut that silently stopped working is worse than one the writer cannot change.
 */
function applyChordOverrides(base, overrides) {
  const source = overrides !== null && typeof overrides === 'object' ? overrides : {}
  const next = { ...base }
  for (const gesture of REBINDABLE_GESTURES) {
    const stored = source[gesture]
    if (stored === undefined || stored === null || typeof stored !== 'object') continue
    next[gesture] = normalizeChord(stored)
  }
  return next
}

/** A chord written the way a keycap says it, per platform. */
export function chordLabel(chord, mac) {
  const parts = []
  // The order follows the platform's own convention, not this file's: macOS reads ⌥⌘⇧ (Option,
  // Command, Shift) because that is how its menus print a chord, and Windows reads Ctrl+Alt+Shift
  // because that is how its. A keycap in the wrong order teaches the wrong hand position — the
  // writer's complaint was exactly that the Mac one read backwards.
  if (mac) {
    if (chord.alt === true) parts.push('⌥')
    if (chord.mod === true) parts.push('⌘')
    if (chord.shift === true) parts.push('⇧')
  } else {
    if (chord.mod === true) parts.push('Ctrl+')
    if (chord.alt === true) parts.push('Alt+')
    if (chord.shift === true) parts.push('Shift+')
  }
  // An empty key is a modifier-only gesture: there is no second key to name, so the label is the
  // modifiers alone — `⌥⌘`, not `⌥⌘undefined`.
  if (typeof chord.key === 'string' && chord.key !== '') parts.push(chord.key === 'Tab' ? 'Tab' : chord.key)
  return parts.join('')
}

export function gestureKeys(platform) {
  const mac = String(platform ?? '') === 'macos'
  if (mac) {
    return {
      ask: { alt: false, mod: false, shift: false, key: 'Tab' },
      // ⌥Tab asks for a GRAMMAR critique; ⌥⌘ asks for a full read of the section. The two used to
      // be the other way round, which is not what the writer asked for and not what the dock's own
      // titles say: 文法锐评 is the narrow pass, 这一节的问题 is the broad one, and the narrower one
      // gets the shorter chord.
      //
      // The read is ⌥⌘ with NO letter under it. A modifier-only gesture is what the writer asked
      // for, and it has its own matcher (`isModifierChord`): the chord table cannot express a press
      // whose "key" is one of the modifiers that is also part of it.
      critique: { alt: true, mod: false, shift: false, key: 'Tab' },
      review: { alt: true, mod: true, shift: false, key: '' },
      // The composer's default, as a chord: nothing but Command held down.
      chat: { alt: false, mod: true, shift: false, key: '' },
      // What a keycap says. `⌥` is the symbol printed on an Apple keyboard for Option.
      askLabel: 'Tab',
      // A lone Command press: there is no second key, so the keycap is the modifier alone.
      chatLabel: '⌘',
      critiqueLabel: '⌥Tab',
      reviewLabel: '⌥⌘',
      askHint: 'Tab',
      critiqueHint: 'Option+Tab',
      reviewHint: 'Option+Command',
    }
  }
  return {
    ask: { alt: false, mod: false, shift: false, key: 'Tab' },
    // Same order as macOS: the grammar pass takes the shorter chord. Windows has no ⌥Tab to lose —
    // Alt+Tab is the system's task switcher and a page never receives it — so the base chord is
    // Ctrl+Alt+Tab and the broader read adds Shift.
    critique: { alt: true, mod: true, shift: false, key: 'Tab' },
    // Not a modifier-only gesture here: Ctrl+Alt with no key is not a press Windows reports
    // usefully, so the read keeps a letter under it.
    review: { alt: true, mod: true, shift: true, key: 'Tab' },
    // Alt on Windows: the platform's own gesture for the composer. Not Ctrl — a lone Ctrl press
    // is not an event Windows sends usefully either, and Alt alone is, because only Alt+TAB is
    // taken by the shell. Not Win either: the Win key is the system's and never reaches a page.
    chat: { alt: true, mod: false, shift: false, key: '' },
    askLabel: 'Tab',
    chatLabel: 'Alt',
    critiqueLabel: 'Ctrl+Alt+Tab',
    reviewLabel: 'Ctrl+Alt+Shift+Tab',
    askHint: 'Tab',
    critiqueHint: 'Ctrl+Alt+Tab',
    reviewHint: 'Ctrl+Alt+Shift+Tab',
  }
}

/** One gesture's platform default, so the settings page can offer a reset per row. */
export function defaultChord(platform, gesture) {
  return gestureKeys(platform)[gesture]
}

/**
 * The gestures with the writer's own chords folded in, and the labels that go with them.
 *
 * The label tables above are DEFAULTS: once a gesture can be rebound they are wrong the moment the
 * writer changes one, so every label is recomputed from the chord that actually fires. A rebindable
 * shortcut with a stale keycap is worse than no keycap — it teaches the wrong key with confidence.
 */
export function resolveGestures(platform, overrides) {
  const mac = String(platform ?? '') === 'macos'
  const base = gestureKeys(platform)
  const gestures = applyChordOverrides(base, overrides)
  const next = { ...gestures }
  for (const gesture of REBINDABLE_GESTURES) {
    next[`${gesture}Label`] = chordLabel(gestures[gesture], mac)
    // Read out as words, because a hint is a sentence: "Option+Command", not "⌥⌘". Modifiers only,
    // when the gesture has no letter under it.
    const words = [
    gestures[gesture].alt === true ? 'Option' : '',
    gestures[gesture].mod === true ? 'Command' : '',
    gestures[gesture].shift === true ? 'Shift' : '',
    ].filter((part) => part !== '')
    const key = typeof gestures[gesture].key === 'string' && gestures[gesture].key !== ''
    ? `+${gestures[gesture].key}` : ''
    next[`${gesture}Hint`] = mac ? `${words.join('+')}${key}` : next[`${gesture}Label`]
  }
  // The composer's keycap comes from the chord that actually fires, like every other one: when it
  // is still the lone modifier press, that IS the modifier's symbol; once the writer rebinds it, it
  // has to read as the chord they chose instead of claiming ⌘ still opens the box.
  next.chatLabel = chordLabel(gestures.chat, mac)
  return next
}

/** Which platform the panel is running on, from the only source a browser has. */
export function currentPlatform() {
  if (typeof navigator === 'undefined') return 'unknown'
  const platform = String(navigator.platform ?? '')
  const agent = String(navigator.userAgent ?? '')
  if (/mac/i.test(platform) || /Mac OS X/i.test(agent)) return 'macos'
  if (/win/i.test(platform) || /Windows/i.test(agent)) return 'windows'
  return 'linux'
}

/**
 * Match one keyboard event against a chord.
 *
 * Shift is compared in BOTH directions: a chord that does not name Shift must not fire while
 * Shift is held, or `Ctrl+Alt+Shift+Tab` would also satisfy `Ctrl+Alt+Tab`. The three modifiers are
 * matched exactly for the same reason — only the ones the chord sets are not enough.
 *
 * `event.key` is compared case-insensitively: a chord with a letter reports `C` while Shift is
 * down, and matching the raw value made the same gesture work only half the time.
 *
 * @param mac - whether Command is the primary modifier. Passed in rather than read here so the
 *              decision can be tested without a browser.
 */
export function chordMatches(event, chord, mac) {
  if (event === null || event === undefined || chord === null || chord === undefined) return false
  if (typeof event.key !== 'string') return false
  if (event.key.toLowerCase() !== String(chord.key).toLowerCase()) return false
  const wants = (flag) => flag === true
  if (event.altKey === true !== wants(chord.alt)) return false
  if (event.shiftKey === true !== wants(chord.shift)) return false
  // The primary modifier is Command on macOS and Control everywhere else. Both are checked, so a
  // macOS writer pressing Ctrl+Alt+Tab gets nothing rather than a surprise.
  if (event.metaKey === true !== wants(chord.mod && mac === true)) return false
  if (event.ctrlKey === true !== wants(chord.mod && mac !== true)) return false
  return true
}

/**
 * Match a MODIFIER-ONLY gesture: a chord whose `key` is empty, fired while exactly the named
 * modifiers are down and nothing else has been typed since.
 *
 * 行文审阅 is ⌥⌘ — Option+Command and no letter under them. `chordMatches` cannot express that:
 * it matches `event.key` against a key the chord names, and the only key pressed here IS one of the
 * modifiers. So a keydown ON a modifier is what fires it, in any order (⌥ then ⌘, or ⌘ then ⌥),
 * and only when the set of held modifiers is exactly the one the chord names.
 *
 * `typedSince` is the caller's record of whether anything else was pressed since the first of
 * these modifiers went down. ⌘C starts with ⌘ and must not trigger the read on its way past, the
 * same rule the lone-modifier composer gesture uses.
 */
export function isModifierChord(event, chord, mac) {
  if (event === null || event === undefined || chord === null || chord === undefined) return false
  if (typeof event.key !== 'string' || event.key === '') return false
  if (chord.key !== '' && chord.key !== undefined) return false
  const modifierKeys = mac === true ? ['Meta', 'Alt', 'Shift', 'Control'] : ['Control', 'Alt', 'Shift', 'Meta']
  if (!modifierKeys.includes(event.key)) return false
  const wants = (flag) => flag === true
  // The key being pressed counts as down even though the browser sets its flag on keydown — a
  // macOS Option keydown already reports altKey, but Ctrl on Windows does not always, and a
  // gesture that fires only on some systems is worse than one that does not exist.
  const down = (name) => {
    if (event.key === name) return true
    if (name === 'Meta') return event.metaKey === true
    if (name === 'Alt') return event.altKey === true
    if (name === 'Shift') return event.shiftKey === true
    return event.ctrlKey === true
  }
  if (down('Alt') !== wants(chord.alt)) return false
  if (down('Shift') !== wants(chord.shift)) return false
  if (down('Meta') !== wants(chord.mod && mac === true)) return false
  if (down('Control') !== wants(chord.mod && mac !== true)) return false
  return true
}

/**
 * Recognize a LONE press of whatever modifier opens the composer, when the composer key is still
 * that kind of gesture.
 *
 * The key itself is not fixed any more: the writer can rebind it, so which modifier to watch comes
 * from the chord that is in force. A chord with a letter under it is NOT a lone press — that one
 * is matched by chordMatches, on keydown, where it belongs.
 *
 * `trigger` is the KeyboardEvent.key of the modifier to watch ('Meta', 'Control', 'Alt', 'Shift').
 * Only a modifier-only chord gets a watcher at all; the caller checks that first.
 */
export function loneModifierKey(chord, mac) {
  if (chord !== null && typeof chord === 'object' && chord.key !== '') return ''
  const source = chord !== null && typeof chord === 'object' ? chord : {}
  if (source.mod === true) return mac === true ? 'Meta' : 'Control'
  if (source.alt === true) return 'Alt'
  if (source.shift === true) return 'Shift'
  return mac === true ? 'Meta' : 'Alt'
}

/**
 * Recognise a LONE press of Command (or Alt on Windows/Linux), which opens the composer.
 *
 * A single modifier press is an odd shortcut, which is what makes it safe: no other binding wants
 * it. But the same physical press is also part of every chord, so `Cmd+C` must not open the
 * composer on the way past, and neither must `⌥⌘`, which reads the section. The rule is therefore
 * about the whole press, not the key: the modifier went down, nothing else was pressed in between,
 * and it came back up.
 *
 * Returned as two handlers rather than a closure over `document` so it can be tested without a DOM.
 */
export function createLoneModifierWatcher(onOpen, mac, trigger = '') {
  let chordUsed = false
  let down = false
  // ONE modifier opens the composer, and which one it is comes from the chord in force: Command on
  // macOS, Alt on Windows by default, and whatever the writer rebound it to. Accepting both
  // everywhere meant Alt opened the composer on a Mac, where Alt is only ever part of a chord
  // (⌥Tab, ⌥⌘) — so pressing Option on its own popped a box the writer never asked for.
  const triggerKey = trigger !== '' ? trigger : (mac === true ? 'Meta' : 'Alt')
  const isModifier = (event) => event !== null && event !== undefined && event.key === triggerKey
  const withState = {
    // The read gesture needs to know whether this press is still "just modifiers so far": a bare
    // modifier keydown that comes AFTER something else was typed is half of a chord such as ⌘C,
    // and must not read the section on its way up.
    typedSince: () => chordUsed,
    // The read gesture fired on this press, so the modifier coming back up is not also the
    // composer's lone-press gesture.
    markUsed: () => { chordUsed = true },
    keydown(event) {
      if (!isModifier(event)) {
        // Something else was pressed while the modifier was held: this press is a chord.
        if (down) chordUsed = true
        return
      }
      down = true
      // A held modifier auto-repeats; that is not a press the writer made on purpose, and it also
      // means the key is not being used as a chord.
      chordUsed = event.repeat === true ? true : chordUsed
    },
    keyup(event) {
      if (!isModifier(event)) return
      const trigger = down && !chordUsed
      down = false
      chordUsed = false
      // A modifier press that typed nothing and completed nothing is the gesture.
      if (trigger) onOpen()
    },
  }
  return withState
}
