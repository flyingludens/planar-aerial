/**
 * The writer's setup for the panel: how the text looks, how often it is saved, and what the
 * keys do.
 *
 * The three are one subject because of where they are stored: per browser, not per book. A
 * writer who wants a larger face on their laptop does not necessarily want it on the shared
 * desktop, and the same goes for a two-minute save interval and for a rebound chord. None of
 * these is a fact about the manuscript, so none of them travels with it.
 */
import { React } from '../shared/react.js'
import { usePersisted } from 'fang-style'
import { normalizeTypography } from '../shared/logic.js'
import { normalizeAutoSave } from '../shared/save-queue.js'
import { resolveGestures, currentPlatform } from '../shared/gestures.js'
import { STORAGE_KEYS } from '../shared/storage.js'

/**
 * @param {object} options
 * @param {string} [options.platform]  the host's platform id; absent falls back to the UA
 * @param {number} [options.saveInterval]  a deployment-set interval, which outranks the writer's
 */
export function usePreferences({ platform, saveInterval }) {
  /**
   * The writer's own chords, if they rebound any.
   *
   * Only the gestures they changed are stored, so a default that improves in a later version
   * still reaches everyone who never touched that gesture.
   */
  const [chordOverrides, updateChordOverrides] = usePersisted(
    STORAGE_KEYS.chords,
    (raw) => { try { return JSON.parse(raw ?? 'null') ?? {} } catch { return {} } },
    (value) => JSON.stringify(value),
  )
  // Resolved once for the whole panel: the editor's listener, the keycaps in the title row and
  // the settings page all read this one answer, so a rebind cannot reach one and miss another.
  const keyPlatform = platform ?? currentPlatform()
  const keys = resolveGestures(keyPlatform, chordOverrides)
  /**
   * How the page looks: font size, line height and measure.
   *
   * A corrupt or absent entry falls back to the defaults instead of throwing on mount.
   */
  const [typography, updateTypography] = usePersisted(
    STORAGE_KEYS.typography,
    (raw) => {
      // A stored entry is JSON; anything unreadable is the same as nothing stored.
      try { return normalizeTypography(JSON.parse(raw ?? 'null')) } catch { return normalizeTypography(null) }
    },
    (value) => JSON.stringify(value),
  )
  /**
   * How often typing is written to disk.
   *
   * A profile-set interval wins over the writer's own choice, and the settings page then
   * reports the value in force instead of offering buttons that cannot change anything —
   * that is what `autoSaveLocked` tells it.
   */
  const [autoSaveMs, persistAutoSave] = usePersisted(
    STORAGE_KEYS.autoSaveMs,
    (raw) => normalizeAutoSave(raw),
    (value) => String(value),
    saveInterval === undefined ? undefined : normalizeAutoSave(saveInterval),
  )
  /**
   * The save queue, reached from handlers that run BEFORE the hook that creates it.
   *
   * `updateAutoSave` is defined above `useBookData` (the settings page needs it while the book
   * may still be loading), so it cannot close over the queue directly. The panel fills this ref
   * on every render once the hook has returned, and it is null only on the very first render —
   * before which no handler can fire.
   */
  const queueRef = React.useRef(null)
  const updateAutoSave = (value) => {
    const next = normalizeAutoSave(value)
    persistAutoSave(next)
    // The queue holds the timer, so it has to be told; a re-render alone would leave the
    // already-armed timer on the old interval.
    queueRef.current?.setIntervalMs(next)
  }

  return {
    keys, chordOverrides, updateChordOverrides,
    // The platform the chords were resolved for. Returned so the settings page can offer "reset this
    // row" against the same defaults the editor is using, rather than re-reading the UA and
    // risking a different answer.
    platform: keyPlatform,
    typography, updateTypography,
    autoSaveMs, updateAutoSave, autoSaveLocked: saveInterval !== undefined,
    queueRef,
  }
}
