/**
 * The plugin's browser half: the registration, and what the tests can reach.
 *
 * Every component lives in a module beside this one; this file only assembles them into the
 * shape the host applies and the shape the tests inspect. It is the one place that knows where
 * everything is, which is why it is also the only place a new module has to be added.
 */
import { NS, ZH, EN } from './shared/locale.js'
import { STORAGE_KEYS } from './shared/storage.js'
import { PanelIcon } from './shared/icons.js'
import { ConfirmDialog, Drawer, useClosingAnimation, writeStored } from 'fang-style'
import { useBookData } from './shared/hooks.js'
import { useBoardActions } from './mosaic/board-state.js'
import {
  diffWords, findMatches, normalizeTypography, TYPOGRAPHY_DEFAULT,
  TYPOGRAPHY_BOUNDS, patchRow, appendRow, removeRow, rowId, clockTime, createHistory,
  renderMarkdownBlocks, routeChatQuestion, paintRuns,
  proseLineBudget, TYPE_PRESETS, UI_FONT_SIZE, UI_LINE_HEIGHT,
} from './shared/logic.js'
import {
  createSaveQueue, AUTO_SAVE_DEFAULT, AUTO_SAVE_PRESETS, normalizeAutoSave,
} from './shared/save-queue.js'
import {
  gestureKeys, chordMatches, currentPlatform, isModifierChord, createLoneModifierWatcher,
} from './shared/gestures.js'
import { StoryPanelBody, StoryPanelBoundary } from './panel/core.js'
import { BookLibrary } from './panel/library.js'
import { TreeNav, ChapterEditor } from './panel/outline.js'
import { ChatComposer, AiThinking, AnswerLog } from './panel/composer.js'
import { StatusBar } from './panel/status.js'
import { ModelsPage } from './panel/models.js'
import { SettingsPage } from './panel/settings.js'
import { RailTools, AboutBox, exportFileName, downloadText } from './panel/rail-tools.js'
import { MosaicPortrait, MosaicGalleryCard, MosaicCards, MosaicCast } from './mosaic/cards.js'
import { OverviewPage, WritingStylesPage } from './mosaic/tabs.js'
import { CARD_W, CARD_H, CARD_STEP_X, CARD_STEP_Y } from './mosaic/geometry.js'
import { api } from './api.js'

export default {
  inject: ['slots', 'locale', 'connection', 'workspaces'],
  // Only the word diff survived the move to selection-based editing: it is what renders
  // the transient proposal block, and it is the one piece worth testing in isolation.
  // Pure pieces worth testing alone: the word diff renders the proposal card, the save queue
  // decides whether a burst of keystrokes reaches the disk, the find helpers drive the search
  // bar, and typography normalisation is what keeps a corrupt stored value from breaking mount.
  __logic: {
    diffWords, createSaveQueue, findMatches, normalizeTypography,
    TYPOGRAPHY_DEFAULT, TYPOGRAPHY_BOUNDS,
    // The row edits the three reference drawers share. Pure, so a test can pin them without
    // mounting a component, and the same functions the pages actually call.
    patchRow, appendRow, removeRow, rowId, clockTime,
    // The auto-save schedule: the default is what the settings page shows as chosen, so a
    // test that pins "five minutes" has to read the same constant the panel uses.
    AUTO_SAVE_DEFAULT, AUTO_SAVE_PRESETS, normalizeAutoSave,
    // The editor pieces that decide what a keystroke does and what a document looks like,
    // exposed so both can be tested without a browser.
    createHistory, renderMarkdownBlocks, routeChatQuestion, paintRuns, createLoneModifierWatcher,
    // The two pure helpers behind 导出: the file name a download gets, and what the download does
    // when there is no document to do it with. Exposed here with the other pure pieces because
    // they are functions, not components — __components is walked by a test that mounts each
    // entry, and a bag of helpers would fail it.
    exportFileName, downloadText,
    // How long a passage may be and still be set in the book's own type. Derived from the
    // page settings, so it is a pure function a test can pin at every size the panel offers —
    // TYPE_PRESETS is exported alongside it so that test walks the real steps rather than a
    // copy of them.
    proseLineBudget, TYPE_PRESETS, UI_FONT_SIZE, UI_LINE_HEIGHT,
    // The board's geometry: the card's box and the grid's pitch. Exported so a test can state
    // the wire arithmetic against the same numbers the component uses, instead of restating
    // them — a test that carries its own copy passes when the real one changes and the wires
    // stop landing on the cards.
    CARD_W, CARD_H, CARD_STEP_X, CARD_STEP_Y,
    // The chord table and matcher: the gestures are platform-specific, and getting the
    // modifiers or the Shift rule wrong is silent, so both are tested without a browser.
    gestureKeys, chordMatches, currentPlatform, isModifierChord,
  },
  // Components are exposed for tests: a stub React can execute each body, which is the only
  // reliable way to catch hook-order and dangling-name crashes before a real render.
  // Hooks that own a whole job rather than a widget. Exposed so they can be driven on their
  // own: `useBookData` is the book lifecycle, and testing it through a mounted panel would
  // test the panel's layout at the same time.
  __hooks: { useBookData, useClosingAnimation, useBoardActions },
  __components: {
    StoryPanel: StoryPanelBody, StoryPanelBoundary, BookLibrary, TreeNav, ChapterEditor, ConfirmDialog, Drawer,
    OverviewPage, WritingStylesPage, SettingsPage, ModelsPage, StatusBar, AiThinking, ChatComposer, AnswerLog,
    // The two gallery pages and the card they share. Exposed because a page mounted through
    // the whole sheet is hard to assert a single attribute against — and it was the shared card
    // that had to keep the clickable and non-clickable cases apart.
    MosaicGalleryCard, MosaicCast, MosaicCards, MosaicPortrait,
    // The rail's function row. Mounted whole in the panel, but its four buttons are independent
    // outcomes — a shelf, a save, a download and a dialog — and each one has to be driven on its
    // own to prove it is not a decorative label.
    RailTools, AboutBox,
  },
  apply(ctx, config) {
    // A render crash takes the whole panel with it — no border, no status bar — and the host
    // offers no console in the desktop build. These two listeners are the only way the failure
    // can be read back afterwards: they keep the message and the first frame of the stack in
    // the same storage the panel already uses, under a key nobody else writes.
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      const record = (kind) => (event) => {
        const error = event?.error ?? event?.reason
        writeStored(STORAGE_KEYS.lastError, JSON.stringify({
          kind,
          at: new Date().toISOString(),
          message: String(error?.message ?? event?.message ?? error ?? ''),
          stack: String(error?.stack ?? '').split('\n').slice(0, 12).join('\n'),
        }))
      }
      window.addEventListener('error', record('error'))
      window.addEventListener('unhandledrejection', record('rejection'))
    }
    ctx.effect(() => ctx.locale.register(NS, { zh: ZH, en: EN }), 'storywriting: dictionaries')
    const t = ctx.locale.bind(NS)
    // A main panel: the writing desk gets the full centre width, and the conversation moves to
    // the host's right sidebar, which is where a side conversation belongs.
    // ctx.inject starts this registration as a child plugin that WAITS for `layout`, so the
    // service is live by the time the panel mounts. Reading it with ctx.get() inside apply
    // returned undefined while the provider was still starting, which made the handoff
    // button silently do nothing — the fetch of `layout` is the whole point of this guard.
    // Only the services the panel cannot work without are injected here. `sessions` is read
    // opportunistically: adding it to this list made the panel fail to register at all on a
    // host that did not provide it, which is a far worse outcome than a missing feature.
    // (`modelDirectories` used to be read here for the composer's chip. Both pickers now draw
    // from the host catalogue over a route, so the panel no longer depends on that service.)
    ctx.inject(['layout', 'workspaces', 'uiWorkspace'], (scope) => {
      scope.slots.inject('main', () => scope.slots.register({
        name: 'main', key: 'story', locale: NS,
        // `useWorkspaces`/`useSessions` arrive as slot standard props; the services the
        // panel calls directly are read here so a missing one cannot break mounting.
        inject: () => ({
          t, api, config,
          layout: scope.layout,
          workspaces: scope.workspaces,
          uiWorkspace: scope.uiWorkspace,
          // Read from the container rather than from this scope, and defensively: it is
          // optional, and a host (or a test double) without `get` must leave the panel
          // standing. A missing service is a small loss; a panel that does not render is not.
          sessionsService: typeof ctx.get === 'function' ? ctx.get('sessions') : undefined,
        }),
      }, StoryPanelBoundary))
    })
    ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
      name: 'sidebar.panellist', id: 'story', order: 20, locale: NS, label: () => t('panel'),
    }, PanelIcon))
  },
}
