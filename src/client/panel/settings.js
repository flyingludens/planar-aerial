/**
 * The panel's own preferences: how the page looks, how often typing is written, and the keys.
 *
 * These belong to the person at this machine rather than to the manuscript, which is why they
 * are here and not on the board.
 */
import { React, h } from '../shared/react.js'
import { SegGroup } from '../shared/ui.js'
import { TYPE_PRESETS, TYPOGRAPHY_DEFAULT } from '../shared/logic.js'
import { AUTO_SAVE_PRESETS } from '../shared/save-queue.js'
import {
  REBINDABLE_GESTURES, normalizeChord, chordLabel, resolveGestures, currentPlatform, defaultChord,
} from '../shared/gestures.js'

function TypeChoice({ t, label, options, value, onPick }) {
  // Which step is pressed: the nearest one to the stored value.
  //
  // When there is no usable value, the DEFAULT step is pressed rather than the first one. It
  // used to start from `options[0]`, so an unreadable value — `undefined`, left behind by a
  // whole-object write that dropped this key — pressed the first step ("小", "紧"). A silent
  // move to the cheapest setting is the worst possible answer to "what is this set to"; the
  // default is the honest one, and it is what a fresh install shows.
  const axis = options === TYPE_PRESETS.width ? 'width'
    : options === TYPE_PRESETS.lineHeight ? 'lineHeight' : 'fontSize'
  const nearest = (target) => {
    let best = options[0].value
    for (const option of options) {
      if (Math.abs(option.value - target) < Math.abs(best - target)) best = option.value
    }
    return best
  }
  const chosen = nearest(Number.isFinite(Number(value)) ? Number(value) : TYPOGRAPHY_DEFAULT[axis])
  return h('div', { className: 'st-type-row' },
    h('span', { className: 'st-type-label' }, label),
    SegGroup({ label, options: options.map((option) => ({ value: option.value, label: t(option.key) })), value: chosen, onChange: onPick }))
}

/**
 * Reasoning effort as a horizontal axis.
 *
 * A row of stops on one line, least to most: the levels are ordered by the adapter, and the
 * point of showing them as a line rather than a dropdown is that "higher" has a direction.
 * Nothing is invented when the model has no levels — the caller just does not render it.
 */

/**
 * One shortcut, recorded by pressing it.
 *
 * Typing a chord as text would mean inventing a notation and then parsing it; pressing it is
 * the thing the writer already knows how to do, and it cannot be mistyped. The recorder takes
 * the next non-modifier keydown with its modifiers and reports it as a chord.
 *
 * Escape cancels, and so does clicking away: a half-captured shortcut must not silently become
 * the one that fires.
 */
function ChordRecorder({ t, chord, onPick }) {
  const [recording, setRecording] = React.useState(false)
  const buttonRef = React.useRef(null)
  React.useEffect(() => {
    if (!recording) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); setRecording(false); return }
      // A bare modifier is part of the chord being expressed, not the chord itself.
      if (event.key === 'Meta' || event.key === 'Alt' || event.key === 'Shift' || event.key === 'Control') return
      event.preventDefault()
      event.stopPropagation()
      setRecording(false)
      onPick(normalizeChord({
        key: event.key, alt: event.altKey === true, mod: event.metaKey === true || event.ctrlKey === true,
        shift: event.shiftKey === true,
      }))
    }
    // Capture on the document so the panel's own chord listener never sees the press being
    // recorded — otherwise rebinding ⌥Tab would also fire the grammar pass behind the dialog.
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [recording, onPick])
  return h('button', {
    type: 'button', ref: buttonRef,
    className: 'st-kbd st-kbd-record', 'data-testid': 'chord-recorder',
    'data-recording': recording ? 'true' : 'false',
    title: t('keys.recordHint'),
    onClick: () => setRecording((open) => !open),
  }, recording ? t('keys.recording') : chordLabel(chord, currentPlatform() === 'macos'))
}

/**
 * Page typography: font size, line height and measure.
 *
 * These were fixed in the stylesheet (15px on a 1.85 line, 820px wide), which is a guess about
 * the writer's eyes and screen. Steps rather than sliders: a range input invites a value
 * between the stops, and for type there is no such thing. The choices are stored per browser
 * because they belong to the reader, not to the manuscript.
 */
/**
 * The settings page: how the page looks, and how often it is written to disk.
 *
 * Typography was its own drawer, which meant the panel had two places for "preferences about
 * how this panel behaves" — one called 排版 and one that did not exist. Saving belongs beside
 * type: both are things the writer sets once and then expects to hold.
 *
 * Type: fixed values in the stylesheet (15px on a 1.85 line, 820px wide) were a guess about
 * the writer's eyes and screen. Steps rather than sliders, because a range input invites a
 * value between the stops and for type there is no such thing.
 *
 * Auto-save: see AUTO_SAVE_DEFAULT. The row says what the wait costs, because "five minutes"
 * only means anything as "this much typing could be lost".
 *
 * Both are stored per browser: they belong to the reader, not to the manuscript.
 */
export function SettingsPage({ t, typography, onChange, autoSaveMs, onAutoSave, autoSaveLocked, keys, onRebind, onResetChords, platform, library, onLibrary, onPickDirectory }) {
  // A page that reads `keys.ask` must survive being handed no keys at all: the settings drawer is
  // mounted by tests and by any host that assembles it directly, and a shortcut row is not a
  // reason for the whole page to throw. Defaults are what it shows in that case.
  const gestures = keys ?? resolveGestures(currentPlatform(), {})
  // Which platform's DEFAULTS a row falls back to. Passed down from the panel, which resolved the
  // same platform once for every chord; absent here it is read from the UA, like the recorder does.
  const keyPlatform = platform ?? currentPlatform()
  const chooseLibrary = async () => {
    if (typeof onPickDirectory !== 'function') return
    const path = await onPickDirectory()
    if (path === null || path === undefined || path === '') return
    if (typeof onLibrary === 'function') onLibrary(path)
  }
  return h('div', { className: 'st-settings' },
    h('div', { className: 'st-settings-group' },
      h('div', { className: 'st-settings-title' }, t('settings.library')),
      h('div', { className: 'st-library-picker' },
        h('button', {
          type: 'button', className: 'st-library-path', onClick: chooseLibrary,
          disabled: typeof onPickDirectory !== 'function',
          title: library ?? '',
        }, library === undefined || library === null || library === '' ? t('settings.libraryEmpty') : library),
        typeof onPickDirectory === 'function'
          ? h('button', { type: 'button', className: 'st-btn st-btn-ghost', onClick: chooseLibrary }, t('action.choose'))
          : null)),
    h('div', { className: 'st-settings-group' },
      h('div', { className: 'st-settings-title' }, t('settings.typography')),
      h('div', { className: 'st-type' },
        ['fontSize', 'lineHeight', 'width'].map((key) => h(TypeChoice, {
          key,
          t,
          label: t(key === 'width' ? 'label.measure' : key === 'fontSize' ? 'label.fontSize' : 'label.lineHeight'),
          options: TYPE_PRESETS[key],
          value: typography[key],
          // MERGED, not replaced. `onChange` stores whatever it is handed as the whole setting,
          // so passing `{ fontSize }` alone dropped `lineHeight` and `width`: the other two rows
          // then read `undefined`, found no nearest step, and showed their first one as chosen —
          // three rows that appeared to move each other. Spread the current value first.
          onPick: (value) => onChange({ ...typography, [key]: value }),
        })),
        /**
         * A preview in the writer's own prose rather than lorem ipsum: the point of the setting
         * is how their sentences read at this size.
         *
         * The box is a FIXED height and clips. It has to be: with a box that grew with its
         * text, choosing a larger size made the panel taller, the row above moved, and
         * comparing two sizes meant watching the frame jump rather than the letters. Same
         * frame, different type is the only way the comparison means anything.
         */
        h('div', { className: 'st-type-preview' },
          h('div', {
            className: 'st-type-preview-in',
            style: { fontSize: `${typography.fontSize}px`, lineHeight: String(typography.lineHeight) },
          }, t('label.typePreview'))),
        h('div', { className: 'st-type-foot' },
          h('button', {
            type: 'button', className: 'st-btn st-btn-ghost',
            onClick: () => onChange(TYPOGRAPHY_DEFAULT),
          }, t('action.resetTypography'))))),
    h('div', { className: 'st-settings-group' },
      h('div', { className: 'st-settings-title' }, t('settings.saving')),
      h('div', { className: 'st-type' },
        h('div', { className: 'st-type-row' },
          h('span', { className: 'st-type-label' }, t('label.autoSave')),
          SegGroup({
            label: t('label.autoSave'),
            options: AUTO_SAVE_PRESETS.map((option) => ({ value: option.value, label: t(option.key) })),
            value: autoSaveMs, onChange: onAutoSave,
            // A profile-set interval is the deployment's decision, so the control reports
            // it rather than pretending it can be changed here.
            disabled: autoSaveLocked === true,
          }))),
    // (The auto-save group closed above; the chord group below is the second child of the
    // settings column, so the outer call is still open.)
    // The writer's own chords. All four gestures, the composer's included: its DEFAULT is a lone
    // modifier press, which a recorder cannot express, so the row starts by showing that press and
    // the writer replaces it with a chord. "This one is not configurable" was the wrong answer —
    // the composer key is the one most likely to collide with something else on the machine.
    h('div', { className: 'st-settings-group' },
      h('div', { className: 'st-settings-title' }, t('settings.keys')),
      h('div', { className: 'st-type' },
        REBINDABLE_GESTURES.map((gesture) => h('div', { key: gesture, className: 'st-type-row' },
          h('span', { className: 'st-type-label' }, t(`keys.${gesture}`)),
          h(ChordRecorder, {
            t,
            chord: gestures[gesture],
            onPick: (chord) => onRebind(gesture, chord),
          }),
          // One row per gesture, so a reset can be one row's, not the whole table's: a writer who
          // only wants their composer key back should not have to give up the chords they chose
          // for the other three.
          h('button', {
            type: 'button', className: 'st-btn st-btn-ghost', 'data-testid': `chord-reset-${gesture}`,
            title: t('keys.resetHint'),
            onClick: () => onRebind(gesture, defaultChord(keyPlatform, gesture)),
          }, t('keys.resetOne'))))),
        h('button', {
          type: 'button', className: 'st-btn st-btn-ghost', 'data-testid': 'chords-reset',
          onClick: onResetChords,
        }, t('keys.reset')))))
}

/**
 * One shortcut, recorded by pressing it.
 *
 * Typing a chord as text would mean inventing a notation and then parsing it; pressing it is
 * the thing the writer already knows how to do, and it cannot be mistyped. The recorder takes
 * the next non-modifier keydown with its modifiers and reports it as a chord.
 *
 * Escape cancels, and so does clicking away: a half-captured shortcut must not silently become
 * the one that fires.
 */
