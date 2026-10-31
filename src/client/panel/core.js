/**
 * The panel itself: the shell, the routing, and the state every page reads.
 *
 * This is the only file that knows about all the others. It decides which page is on screen —
 * the shelf, the desk, a drawer, the board — and it owns the manuscript lifecycle: loading it,
 * saving it, and handing the four ways to change it down to whoever needs one.
 *
 * `StoryPanelBoundary` sits outside `StoryPanelBody` on purpose: the host has no error boundary
 * over a main panel, so a throw while rendering removes the whole column. A boundary can only
 * catch that if it is not inside the function that throws.
 */
import { React, h } from '../shared/react.js'
import {
  useBookData, usePersisted, useClosingAnimation, useDockState,
} from '../shared/hooks.js'
import { findNode } from '../../../domain/tree.js'
import { statusAfterText } from '../../../domain/book.js'
import { STORAGE_KEYS, readStored, writeStored, storageAvailable } from '../shared/storage.js'
import { RailIcon } from '../shared/ui.js'
import { BookLibrary } from './library.js'
import { WelcomePage } from './welcome.js'
import { BoardIcon, ModelIcon, NotebookIcon, SlidersIcon, TooltipLayer, McpIcon } from '../shared/ui.js'
import { RailTools, AboutBox } from './rail-tools.js'
import { TreeNav, ChapterEditor } from './outline.js'
import { StatusBar } from './status.js'
import { ModelsPage } from './models.js'
import { SettingsPage } from './settings.js'
import { McpPanel } from './mcp-panel.js'
import { useModels } from './models-state.js'
import { useLibrary } from './library-state.js'
import { useBookConversation } from './conversation-state.js'
import { AnswerLogOverlay, RemoveNodeOverlay, SheetOverlay, MosaicOverlay } from './overlays.js'
import { NotesPanel } from './notes.js'
import { useTreeEdits } from './tree-state.js'
import { useAiActions } from './ai-state.js'
import { usePreferences } from './prefs-state.js'
import { CSS } from '../styles.js'

/**
 * The panel, with its own failure surface.
 *
 * The host has no error boundary over a main panel: anything thrown while rendering removes
 * the whole column, status bar included, and leaves nothing to read — which is exactly how a
 * one-line bug looks like "the plugin does not load". A class boundary is the only React
 * mechanism that can catch it, and it must live OUTSIDE the function whose render throws, so
 * the panel's body moved into `StoryPanelBody` and this wraps it.
 */
export class StoryPanelBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Kept where a later build can read it back: the desktop app ships no console.
    try {
      writeStored(STORAGE_KEYS.lastError, JSON.stringify({
        at: new Date().toISOString(),
        message: String(error?.message ?? error),
        stack: String(error?.stack ?? '').split('\n').slice(0, 14).join('\n'),
        component: String(info?.componentStack ?? '').split('\n').slice(0, 14).join('\n'),
      }))
    } catch { /* private mode */ }
  }

  render() {
    if (this.state.error === null) return h(StoryPanelBody, this.props)
    // Shown where the writer is looking, in the panel's own chrome, rather than as a blank
    // column: the message and the first frames are what turn "it is gone" into a diagnosis.
    const error = this.state.error
    return h('div', { className: 'st-shell' },
      h('div', { className: 'st-warn' },
        h('div', null, '写故事面板渲染时出错：'),
        h('pre', { style: { whiteSpace: 'pre-wrap', margin: '6px 0 0' } },
          String(error?.message ?? error)),
        h('pre', { style: { whiteSpace: 'pre-wrap', margin: '6px 0 0', opacity: 0.7 } },
          String(error?.stack ?? '').split('\n').slice(0, 6).join('\n'))))
  }
}

export function StoryPanelBody(props) {
  // Every service the panel hands down to a child must be destructured here: a name that is
  // only read at render time (like `workspaces` below) throws a ReferenceError the moment the
  // branch runs, and the host's slot error boundary then renders nothing at all.
  const { t, api, layout, uiWorkspace, workspaces, useWorkspaces, useSessions } = props
  // Optional services, read off the props the slot injection provides. Separate from the
  // destructure above so their absence is ordinary rather than a crash.
  React.useEffect(() => {
    // One style element per mount; unmount removes it via the effect cleanup.
    const style = document.createElement('style')
    style.textContent = CSS
    document.head.appendChild(style)
    return () => style.remove()
  }, [])
  // A standalone host has no workspace service. The panel still works without one; only the
  // "open the full conversation" handoff needs it, and that button is hidden when it is absent.
  const workspaceSnapshot = typeof useWorkspaces === 'function'
    ? useWorkspaces((snapshot) => snapshot)
    : undefined
  const items = workspaceSnapshot?.items ?? []
  // The shell's box, for the tooltip layer: bubbles position themselves against it, and the
  // listeners that swap title attributes for the drawn bubble are attached to it.
  const shellRef = React.useRef(null)
  // book and token travel together: the token names the exact bytes the book came from,
  // and saving with it is what stops an edit from landing on a different file.
  // Which drawer is open from the bottom, or null for none. One at a time: they are reference
  // panels over the text, not a workspace of their own.
  const [drawer, setDrawer] = React.useState(null)
  // The mosaic board opens over the manuscript like a drawer, but it is not one of them: it
  // holds its own state so it can stay open across a drawer toggle rather than be a fifth tab.
  // The board's open state and its last page survive a window switch, a reload, and a
  // restart: a writer who lives in the board should not re-open it on every window focus.
  // Stored per browser like the typography preference — how the panel looks is a property
  // of the person, not of the manuscript.
  const [mosaicOpen, setMosaicOpen] = usePersisted(STORAGE_KEYS.mosaicOpen,
    (raw) => raw === 'true', (value) => (value === true ? 'true' : 'false'))
  const [mosaicTab, setMosaicTab] = usePersisted(STORAGE_KEYS.mosaicTab,
    (raw) => (typeof raw === 'string' && raw !== '' ? raw : 'relations'), (value) => String(value))
  // Both overlays leave the way they arrived: the drawer slides back out to the right edge,
  // the board folds back up. The board's state is a remembered preference, so its `open` flag
  // is the same value the toggle writes — the hook only delays the unmount.
  const drawerMotion = useClosingAnimation(drawer)
  const mosaicMotion = useClosingAnimation(mosaicOpen === true ? mosaicOpen : null)
  // The board is the page while it is open: the outline's floating cards and an open drawer
  // compete with it for the same attention and the same clicks, so opening the board puts
  // both away. Each comes back on its own toggle; nothing is lost.
  React.useEffect(() => {
    if (mosaicOpen) {
      setRailHidden(true)
      setDrawer(null)
    }
  }, [mosaicOpen])
  /**
   * The proposal 检查本章 fetched, reviewed in the sheet but never persisted: the board on
   * disk only changes when the writer applies, and a saved half-reviewed proposal would make
   * book.json describe edits nobody approved. `null` is "nothing under review".
   *
   * It lives in the dock store, not in this component: the board is closed by a window switch
   * and the in-flight request keeps running, so the answer must land somewhere that outlives
   * the render that started it.
   */
  // (declared after `dockScope`, which needs the loaded book)
  /**
   * How the panel looks, how often it saves, and what the keys do.
   *
   * Stored per browser, never per book: see prefs-state.js.
   */
  const {
    keys, chordOverrides, updateChordOverrides, platform: keyPlatform,
    typography, updateTypography,
    autoSaveMs, updateAutoSave, autoSaveLocked,
    queueRef,
  } = usePreferences({ platform: props.platform, saveInterval: props.config?.saveInterval })
  /** The book directory, and the one way to change it. See library-state.js. */
  const { library, chooseLibrary } = useLibrary(api)
  // The desktop passes a native picker; DSH exposes the same capability on its workspace
  // service. Reading it here keeps one settings page and one new-book dialog for both hosts.
  const pickDirectory = typeof props.pickDirectory === 'function'
    ? props.pickDirectory
    : (uiWorkspace !== undefined && uiWorkspace !== null && typeof uiWorkspace.pickDirectory === 'function'
        ? () => uiWorkspace.pickDirectory()
        : undefined)
  const mcpInfo = typeof props.mcpInfo === 'function' ? props.mcpInfo : undefined
  const openHarness = typeof props.openHarness === 'function' ? props.openHarness : undefined

  // The outline starts folded: the manuscript is the page, and the directory is a tool the
  // writer opens when they need it.
  const [railHidden, setRailHidden] = React.useState(true)
  // The outline is the panel's leftmost overlay and follows the same open/close rhythm as the
  // drawers and the board: it slides out instead of blinking away.
  const railMotion = useClosingAnimation(railHidden ? null : 'rail')
  // undefined is the workspace's original book, which exists before any library entry.
  const [bookFolder, setBookFolder] = React.useState(undefined)
  const [startOpen, setStartOpen] = React.useState(false)
  // No storage at all is a render harness, not a new writer: keep the old shelf-first behaviour
  // there so component tests can mount without a browser. In a real browser an absent key means
  // this is the first visit.
  const [startSeen, setStartSeen] = React.useState(() => readStored(STORAGE_KEYS.welcomeSeen) === '1'
    || readStored(STORAGE_KEYS.lastBook) !== null
    || !storageAvailable())
  // The book folder's own absolute path, for matching it to a workspace row.
  const [bookPath, setBookPath] = React.useState(undefined)
  /**
   * The workspace root that OWNS the open book. Books can live under different workspaces, so
   * every read and write has to address the one the book came from; using the panel's current
   * workspace would look for the book in a directory it is not in.
   */
  /**
   * The book last opened in this workspace, so entering 写故事 lands in the manuscript the
   * writer was in rather than on the shelf. Keyed by the library root: two workspaces must not
   * restore each other's books.
   */
  /**
   * The one message the panel is currently showing, and the one place it is shown.
   *
   * Each failure used to be rendered where it happened: the dock drew its own, the shelf drew
   * its own above the cards, a drawer drew its own at the top, and the chat error sat under the
   * title row. The same class of message therefore appeared in five different places, and none
   * of them was where the writer was looking. They are collected here and drawn in the status
   * bar's bottom-left corner, which is on screen whichever page is open.
   */
  const [shelfNotice, setShelfNotice] = React.useState('')
  // A notice carries its TONE with its text. The rail's function row reports outcomes that are
  // neither failures nor warnings — "exported, here is the file name" — and the status bar already
  // knows how to draw all three. Encoding the tone in the string (a leading "!") would have been a
  // second, worse vocabulary for the same thing.
  // The 关于 card's open state lives HERE, not in the rail. The rail is an absolutely positioned
  // card inside the panel: anything rendered inside it is clipped to 264px of column, so a dialog
  // mounted there centres on the directory instead of on the panel the writer is looking at.
  const [aboutOpen, setAboutOpen] = React.useState(false)
  const [mcpOpen, setMcpOpen] = React.useState(false)
  const [mcpState, setMcpState] = React.useState({ loading: false, error: '', info: null })
  // 随笔 is a book-wide scratchpad, not a panel about one chapter. Its own overlay state here
  // keeps it mutually exclusive with the board and the reference drawers.
  const [notesOpen, setNotesOpen] = React.useState(false)
  const [drawerNotice, setDrawerNotice] = React.useState({ text: '', tone: 'info' })
  // The default is the NEUTRAL tone, not the error one: most callers are reporting that something
  // finished ("applied 3 changes", "exported the file"), and the ones that are reporting a failure
  // already say so. A red message for a successful action is worse than a plain one for a failure.
  const noticeRow = (text, tone = 'info') => setDrawerNotice({ text: String(text ?? ''), tone })
  const [collapsed, setCollapsed] = React.useState(new Set())
  const [chapterId, setChapterId] = React.useState('')
  const [selected, setSelected] = React.useState('')

  // Until a book is chosen, book IO addresses the workspace a new book would be created in.
  // The open book: reading, holding and writing it. One hook, because "which manuscript is on
  // screen and what does saving it mean" is one job — it just used to be tangled into this
  // component's 1500 lines.
  const bookData = useBookData({
    api, library, bookFolder, t, autoSaveMs,
    // A fetched proposal belongs to the book it was checked against: its changes carry entity
    // ids resolved against THAT board. Only the PROPOSAL goes; the board itself is fine.
    //
    // The board used to CLOSE here too, which is what made it shut itself when the writer
    // switched windows. Whether the board is open is the writer's state, not a fact about a
    // book, and it is remembered across exactly that.
    onLoaded: (loaded) => {
      setChapterId(loaded.chapters[0]?.id ?? '')
      // A fetched proposal belongs to the book it was checked against. Its changes carry entity
      // ids resolved against THAT board, so applying book A's review to book B is not a miss —
      // entity.upsert matches by kind+name and would overwrite. Only the PROPOSAL goes.
      setMosaicProposal(null)
    },
  })
  const {
    state, book, books, setBooks, refreshShelf, queue, saveStatus,
    flushSave, adoptWritten, saveNow, updateBook,
  } = bookData
  queueRef.current = queue

  /** Open a directory the writer chose: a book folder, a shelf, or an empty folder for a new book. */
  const openDirectory = async () => {
    if (typeof pickDirectory !== 'function') return
    let path
    try { path = await pickDirectory() } catch (failure) {
      setShelfNotice(String(failure?.message ?? failure))
      return
    }
    if (path === null || path === undefined || path === '') return
    try {
      flushSave()
      const data = await api.openDirectory(path)
      await chooseLibrary(data.library)
      setBooks(Array.isArray(data.books) ? data.books : [])
      setStartOpen(false)
      if (data.kind === 'book') {
        setBookPath(undefined)
        setBookFolder(data.bookFolder)
      } else {
        setBookFolder(undefined)
      }
    } catch (failure) {
      setShelfNotice(String(failure?.message ?? failure))
    }
  }
  /**
   * The book's own conversation — a real dsh Session, not an in-panel imitation.
   *
   * It needs the manuscript for its title and its path, so it is called after `useBookData`.
   * See conversation-state.js.
   */
  const { chatError, openConversation } = useBookConversation({
    layout, uiWorkspace, workspaces, items, useSessions, book, bookFolder, bookPath, t,
  })
  // Which book is open is remembered, and restoring it needs the listing — which is a fact
  // about the LIBRARY. These live here, after the hook that fetches it.
  //
  // It is remembered by the book's own ID, not by its folder. The folder is derived from the
  // title, so renaming a book moves it: a remembered folder name pointed at a directory that no
  // longer existed, and the panel fell back to the shelf on the next launch. The id is minted
  // once at creation and a rename does not touch it.
  const lastBookKey = STORAGE_KEYS.lastBook
  const [restored, setRestored] = React.useState(false)
  React.useEffect(() => {
    if (restored || bookFolder !== undefined || !library || books.length === 0) return
    setRestored(true)
    let stored = ''
    stored = readStored(lastBookKey) ?? ''
    if (stored === '') return
    // An id first, then a folder name. The second is not dead code: a value written before ids
    // existed IS a folder name, and so is one written by a host whose shelf rows carry no id.
    // Without the fallback the upgrade — or that host — would drop the writer on the shelf with
    // no explanation.
    const entry = books.find((row) => row.id === stored) ?? books.find((row) => row.folder === stored)
    // The remembered book may have been deleted since; the shelf is the answer then.
    if (entry === undefined) return
    setBookFolder(entry.folder)
    setBookPath(entry.absolutePath)
  }, [restored, bookFolder, library, books, lastBookKey])
  /**
   * Record the open book, preferring its id.
   *
   * Written as two separate conditions rather than one, because this is where the bug that sent
   * the writer back to the shelf every launch came from: `entry.id !== stored` is TRUE when the
   * id is undefined, and the write then stored the string "undefined" — a value no book can ever
   * match. A key is only written when there is a real value to write; when the host's shelf does
   * not carry ids, the folder name is written instead, which the restore above can still use.
   */
  React.useEffect(() => {
    if (bookFolder === undefined) return
    const entry = books.find((row) => row.folder === bookFolder)
    if (entry === undefined) return
    const id = typeof entry.id === 'string' && entry.id !== '' ? entry.id : entry.folder
    if (typeof id !== 'string' || id === '') return
    if (readStored(lastBookKey) !== id) writeStored(lastBookKey, id)
  }, [bookFolder, books, lastBookKey])
  /**
   * The book the shelf was opened from, so the library can offer a way back.
   *
   * `bookFolder` is undefined while the shelf is showing, so the answer comes from the same
   * remembered key the restore effect uses. Undefined when there is nothing to go back to: a
   * first visit, or a remembered book that has since been deleted.
   */
  const remembered = bookFolder !== undefined
    ? undefined
    : (() => {
      let stored = ''
      stored = readStored(lastBookKey) ?? ''
      if (stored === '') return undefined
      // The same two-step lookup as the restore effect: an id, then a folder name. This one has to
      // agree with that one, or "back to the book" and "the book that opens on launch" would be
      // two different books on a host whose rows carry no id.
      return books.find((row) => row.id === stored) ?? books.find((row) => row.folder === stored)
    })()

  const chapter = book?.chapters.find((c) => c.id === chapterId) ?? book?.chapters[0]
  // Edits travel through the TREE (the stored shape); `chapters` is only a derived view.
  /**
   * The only way to write the tree. `chapters` is derived from `nodes`, so every tree edit
   * must refresh both; leaving that to each call site is how the editor ended up rendering a
   * stale leaf while `nodes` already held the new text.
   */
  /**
   * Every edit that changes the tree's shape. See tree-state.js.
   *
   * `chapter` and `chapterId` are read for one decision: after deleting the chapter the editor
   * has open, the selection has to be cleared or the desk shows a row that no longer exists.
   */
  const {
    patchChapter, onSummary, addNode, renameNode,
    doomed, countUnder, confirmRemove, cancelRemove, removeTreeNode,
  } = useTreeEdits({ t, book, updateBook, chapter, selected, setSelected, chapterId, setChapterId })

  /**
   * Every AI action hangs off a selection, so the panel holds at most one proposal and one
   * error at a time. They are transient: `proposal` is not written into the book until the
   * writer accepts it, so a reload simply forgets it.
   *
   * These live in the dock store rather than in plain state because the panel is rebuilt
   * whenever the host swaps the centre column, and the request that is running does not stop
   * with it. See `useDockState`: without this the thinking row disappeared on a window switch
   * and the answer that arrived a moment later was dropped on the floor.
   */
  /**
   * The bucket this book's transient state is kept in.
   *
   * Keyed on the book's ID, not its folder: a rename moves the folder, and keying on it meant a
   * rename silently threw away the proposal under review, the answer history and the running
   * request's state — all of which are about the manuscript, not about the directory name. The
   * folder is kept as the fallback for a book that has not loaded yet, so the panel's very first
   * render still has a bucket of its own rather than sharing the empty one.
   */
  const dockScope = `story:${book?.id ?? bookFolder ?? ''}`
  // Board work lives in the same dock store: a window switch unmounts the board page, but the
  // fetch and its result must survive it, and the main thinking row reads the same keys.
  const [mosaicProposal, setMosaicProposal] = useDockState(dockScope, 'mosaicProposal', null)
  const [mosaicBusy] = useDockState(dockScope, 'mosaicBusy', false)
  const [mosaicNote] = useDockState(dockScope, 'mosaicNote', '')
  /**
   * Everything the panel asks the model to do, and the dock state its answers land in.
   *
   * The dock store is read HERE rather than in this file: the seven keys, the nine actions and
   * the one slot they share are one subject. See ai-state.js.
   */
  const {
    proposal, setProposal, aiError, aiBusy, aiNote, scan, chat, setChat, answers, answersError,
    dismissProposal, clearStuck,
    clearScan, runReview, runCritique, applyCast, insertFromLog,
    askSelection, askContinue, askChat,
  } = useAiActions({ api, bookFolder, chapter, book, adoptWritten, flushSave, dockScope, t })
  /**
   * The model lists, the two pickers, and the composer chip that writes the chat role.
   *
   * Five states that describe one subject, moved to their own hook: see models-state.js.
   */
  const {
    roleModels, refreshModels, catalog, chatEfforts,
    setChatModel: changeChatModel, setChatEffort: changeChatEffort,
  } = useModels({ api, bookFolder, dockScope })

  // A watchman on the working state. The busy flags live in a store that outlives a re-mount,
  // so a request whose finally never ran — a render crash mid-flight, a panel rebuilt under a
  // pending await — used to leave the AI button a stuck ellipsis forever. No real ask runs
  // past two minutes; past that the state is a corpse, and the watchman clears it. The chat
  // flag clears too: a hung request there freezes the dock in the working state the same way.
  React.useEffect(() => {
    const stuck = aiBusy === true || (chat !== null && chat !== undefined && chat.busy === true)
    if (!stuck) return undefined
    const timer = globalThis.setTimeout(() => {
      clearStuck()
    }, 120000)
    return () => clearTimeout(timer)
  }, [aiBusy, chat])
  const [answerLog, setAnswerLog] = React.useState(false)


  /**
   * Every main-surface panel is mutually exclusive: the board, the preference drawers, the
   * answer history, 关于 and the outline. Two of them open at once stacked over the same page
   * and the writer cannot tell which one owns the click — so opening one shuts the rest.
   */
  const closePanelsExcept = (keep) => {
    if (keep !== 'drawer') setDrawer(null)
    if (keep !== 'board') setMosaicOpen(false)
    if (keep !== 'answers') setAnswerLog(false)
    if (keep !== 'about') setAboutOpen(false)
    if (keep !== 'mcp') setMcpOpen(false)
    if (keep !== 'notes') setNotesOpen(false)
    if (keep !== 'rail') setRailHidden(true)
  }
  const closeAllPanels = () => closePanelsExcept('')

  const openMcp = async () => {
    closePanelsExcept('mcp')
    setMcpOpen(true)
    setMcpState({ loading: true, error: '', info: null })
    try {
      const info = await mcpInfo()
      setMcpState({ loading: false, error: info?.ok === false ? String(info.error ?? '') : '', info: info?.ok === false ? null : info })
    } catch (failure) {
      setMcpState({ loading: false, error: String(failure?.message ?? failure), info: null })
    }
  }
  React.useEffect(() => {
    if (!mcpOpen || mcpInfo === undefined) return undefined
    let cancelled = false
    const read = async () => {
      try {
        const info = await mcpInfo()
        if (!cancelled) setMcpState((previous) => ({
          ...previous, loading: false,
          error: info?.ok === false ? String(info.error ?? '') : '',
          info: info?.ok === false ? null : info,
        }))
      } catch (failure) {
        if (!cancelled) setMcpState((previous) => ({ ...previous, loading: false, error: String(failure?.message ?? failure) }))
      }
    }
    const timer = globalThis.setInterval(read, 3000)
    read()
    return () => { cancelled = true; globalThis.clearInterval(timer) }
  }, [mcpOpen, mcpInfo])



  /**
   * Reference material lives in the title bar and opens from the bottom. These were tabs in
   * the rail, which made them compete with the outline for the same column; a drawer keeps
   * the manuscript in place while the writer checks a name or a setting.
   */
  // The five reference drawers merged into the mosaic board, where their content belongs.
  // Typography and models stay here: they are the writer's own preferences for THIS panel,
  // not material about the book, and a board page would bury them behind the bookmarks.
  // Models first, then settings: the model picker is what a writer reaches for while working,
  // and settings is the one they visit to configure once. The order reads left to right in
  // that priority.
  const drawers = ['models', 'typography']
  const drawerButtons = h(React.Fragment, null,
    drawers.map((key) => h('button', {
      key, type: 'button',
      className: 'st-btn st-btn-ghost st-drawer-btn',
      'aria-haspopup': 'dialog',
      'aria-expanded': drawer === key ? 'true' : 'false',
      // The open drawer is the button's selected state. Without it the button went back to its
      // resting fill and only the hover wash said anything, so moving the pointer over it after
      // opening the panel looked like a second, unrelated change.
      'aria-pressed': drawer === key ? 'true' : 'false',
      // A drawer covers the page, so a write still sitting in the debounce is flushed first:
      // the writer is about to work elsewhere and must not leave a sentence in memory.
      //
      // Opening a drawer also puts the board away, the same way opening the board puts a drawer
      // away. The two are overlays on the same surface and only one may own it; the board's
      // open state is REMEMBERED across sessions, so without this a writer who left the board
      // up came back to it sitting behind every drawer they opened — which read as "clicking
      // Settings opens the model page as well".
      onClick: () => {
        flushSave()
        if (drawer === key) { setDrawer(null); return }
        closePanelsExcept('drawer')
        setDrawer(key)
      },
    }, key === 'models' ? h(ModelIcon) : h(SlidersIcon), t(`tab.${key}`))))

  /**
   * One button, and it makes whatever goes UNDER the current selection:
   *
   *   selected volume  → a chapter in it
   *   selected chapter → a section in it
   *   selected section → another section beside it
   *   nothing selected → the first volume
   *
   * That is the whole outline interaction. Three buttons asked the writer to translate "what
   * am I making" into a level every time, which is the confusion this replaces.
   */
  const addUnderSelection = () => {
    const node = selected === '' ? undefined : findNode(book.nodes, selected)
    if (node === undefined) { addNode('volume'); return }
    if (node.level === 'volume') { addNode('chapter'); return }
    addNode('section')
  }

  const markStartSeen = () => {
    writeStored(STORAGE_KEYS.welcomeSeen, '1')
    setStartSeen(true)
  }

  /**
   * The directory holds the outline and nothing else. Background, cast, relationships,
   * versions and the overview are drawers now: they are reference material the writer opens
   * over the manuscript, not something that displaces it.
   */
  const leftPane = () => h('div', { className: 'st-rail-body' },
    // The tree's own box: it scrolls, and the function row below it does not. One scrolling box
    // for both meant a long book pushed the row off the bottom of the panel.
    h('div', { className: 'st-scroll' },
      h('div', { className: 'st-row st-gap-under-row' },
        h('button', { type: 'button', className: 'st-btn st-btn-primary', onClick: addUnderSelection }, t('action.addUnder'))),
      h(TreeNav, {
      // The outline highlights what the WRITER selected, not merely the chapter being edited:
      // a volume or chapter must show as current too, because the next node is created under
      // the selection.
      t, book, activeId: selected === '' ? chapter?.id : selected,
      onSelect: (id) => { flushSave(); setSelected(id); setChapterId(id) }, collapsed,
      onToggle: (id) => setCollapsed((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id); else next.add(id)
        return next
      }),
        onRename: renameNode, onRemove: removeTreeNode,
      })),
    // The four book-level actions, pinned to the card's bottom edge. See rail-tools.js.
    h(RailTools, {
      t, book,
      // While the shelf is showing there is nowhere to go: the row keeps its shape and the button
      // reports that it cannot be used instead of doing nothing quietly.
      onStart: () => {
        flushSave()
        closePanelsExcept('')
        setStartOpen(true)
      },
      onShelf: () => { setBookFolder(undefined) },
      onSave: saveNow,
      onExport: async () => {
        // Read the merged manuscript from the route rather than rendering it here: the server is
        // the one that knows how a book becomes markdown, and a second implementation in the panel
        // would be a second answer to "what does this book look like on disk".
        const data = await api.manuscript(bookFolder)
        return typeof data?.markdown === 'string' ? data.markdown : ''
      },
      onNotice: noticeRow,
      onAbout: () => { closePanelsExcept('about'); setAboutOpen(true) },
      onOpen: pickDirectory === undefined ? undefined : openDirectory,
      saving: saveStatus?.status === 'saving',
    }))

  /** The body of one drawer: only the writer's own preferences remain here. The five
      reference pages moved into the mosaic board, where the book's material belongs. */
  const drawerBody = (key) => {
    if (key === 'typography') return h(SettingsPage, {
      t, typography, onChange: updateTypography,
      autoSaveMs, onAutoSave: updateAutoSave,
      // A profile-set interval is not the writer's to change, so the row reports it instead
      // of offering buttons that would do nothing.
      autoSaveLocked,
      // The resolved chords, so the row shows the key that actually fires — including one the
      // writer rebound, and including a platform default they never touched.
      keys,
      // Which platform's defaults a single row falls back to, resolved once here so the settings
      // page and the editor cannot disagree about what "the default" is.
      platform: keyPlatform,
      onRebind: (gesture, chord) => updateChordOverrides({ ...chordOverrides, [gesture]: chord }),
      // Reset clears the stored overrides rather than writing the current defaults down: a
      // stored copy of a default would freeze it, and a later version improving the default
      // would never reach this writer.
      onResetChords: () => updateChordOverrides({}),
      library,
      onLibrary: chooseLibrary,
      onPickDirectory: pickDirectory,
    })
    return h(ModelsPage, { t, api, onChange: refreshModels, onNotice: noticeRow })
  }

  const middle = () => {
    // The library is a setting, so the only thing that can be missing here is the settings
    // answer itself: while it is in flight the panel shows its loading state rather than
    // claiming there is no workspace.
    if (library === undefined) return h('div', { className: 'st-scroll st-muted' }, t('label.loading'))
    if (state.status === 'loading') return h('div', { className: 'st-scroll st-muted' }, t('label.loading'))
    if (state.status === 'error') return h('div', { className: 'st-warn' }, state.error)
    // A book that is selected but not yet in `state` used to render NOTHING here: the middle
    // of the panel went blank while the request was in flight, which reads as the plugin
    // having crashed. Every branch that has a reason to be empty says so instead.
    if (!book) return h('div', { className: 'st-scroll st-muted' }, t('label.loading'))
    if (!chapter) {
      return h('div', { className: 'st-mid-body' },
        h('div', { className: 'st-scroll st-muted' }, t('label.emptyChapters')))
    }
    // A flex column, not a scrolling box: the editor is the page and takes the remaining
    // height, scrolling internally. Wrapping it in `.st-scroll` left it 220px tall with a
    // second scrollbar around it.
    return h('div', { className: 'st-mid-body' },
      h(ChapterEditor, {
        t, chapter,
        // The panel resolves the chords once; the editor only reads them.
        keys,
        busy: aiBusy || mosaicBusy,
        // The writer's direction for THIS pass, shown in the thinking line while it runs.
        aiNote: mosaicBusy ? mosaicNote : aiNote,
        saveStatus,
        typography,
        // Cmd+S: the panel owns the queue, so the keystroke writes through it rather than
        // through a second path that could race the interval.
        onSaveNow: saveNow,
        // The side chat lives in the panel (it owns the route and the transcript) and renders
        // in the editor's dock, which is where the writer is.
        chat,
        // The role models the panel fetched for the status bar; the composer names the `chat`
        // one, because that is who will answer a question typed into it.
        chatModels: roleModels,
        // One catalogue for both pickers, and the levels the chat model offers.
        chatCatalog: catalog,
        chatEfforts,
        onChatModelChange: changeChatModel,
        onChatEffortChange: changeChatEffort,
        // The history card lives in the panel; the button that opens it sits with the other AI
        // controls in the editor's header, which is where the writer's hand already is.
        answerCount: answers.length,
        onAnswersToggle: () => {
          if (answerLog) { setAnswerLog(false); return }
          closePanelsExcept('answers')
          setAnswerLog(true)
        },
        onAnswersOpen: () => answerLog,
        // The two whole-section actions, and their result. The editor owns the caret; the panel
        // owns the calls.
        scan,
        onReview: () => runReview(chapter.text ?? ''),
        // The editor owns the caret, so it hands the windows over the same way it does for a
        // question: the panel cannot read the textarea's selection from out here.
        onCritique: (caret, direction) => runCritique(caret, direction),
        onScanClose: clearScan,
        // The chord toggles. Pressing it while the composer is open is the obvious way to put
        // it away again, and it is what every other toggle in this panel does.
        // It also dismisses a scan, which is the one thing that outranks the composer: a
        // section scan owns the dock while it is up, so without this the keystroke would open
        // a box nobody could see. A proposal needs no dismissal — the composer outranks it,
        // and closing the composer brings the answer straight back.
        onChatOpen: () => {
          clearScan()
          setChat((prev) => ({ ...prev, open: prev.open !== true }))
        },
        onChatClose: () => setChat((prev) => ({ ...prev, open: false })),
        onChatSend: askChat,
        // A proposal for another chapter is not this chapter's business.
        suggestion: proposal !== null && proposal.chapterId === chapter.id ? proposal : null,
        onText: (text) => patchChapter((c) => ({ ...c, text, status: statusAfterText(text, c.status) })),
        // Losing focus is the one moment before a close that the browser always delivers:
        // a page frozen on `pagehide` never gets to finish its fetch.
        onFlush: flushSave,
        onAskSelection: askSelection,
        onContinue: askContinue,
        onAccept: () => {
          const p = proposal
          dismissProposal()
          if (p !== null && p.kind === 'cast') applyCast(p)
        },
        onReject: dismissProposal,
        onRetry: (direction) => {
          const p = proposal
          setProposal(null)
          if (!p) return
          // A rewrite retries the SAME passage through the rewrite route. An insert (a
          // continuation or a chat answer) has no passage to rewrite — sending its empty
          // baseText to the rewrite route is what made the model answer "请提供需要改写的
          // 原文段落" — so its retry re-runs the request that produced it, from the same
          // spot. A direction typed in the dock rides with a rewrite; an insert's re-run
          // re-asks the original question or continuation as it was.
          if (p.kind === 'continue') {
            const at = Number.isInteger(p.caret) ? p.caret : (chapter.text ?? '').length
            askContinue(p.chapterTextAtAsk ?? chapter.text ?? '', at)
            return
          }
          if (p.kind === 'chat') {
            askChat(p.chatQuestion ?? p.question ?? '', p.baseText, p.caret)
            return
          }
          // The same range, not whatever happens to be selected after the click: retrying is a
          // second attempt at the SAME passage. A direction, typed in the dock, rides with it.
          askSelection(p.baseText, p.wholeText ?? '', { start: p.from, end: p.to }, p.context, direction)
        },
      }))
  }

  // A resident title row of its own: a main panel replaces the conversation shell, so without
  // this the panel has no header and its top edge collides with the frame's leading seat.
  // One condition, in one place. `root` is every path this panel could read from, book folders
  // The settings answer is the only thing that has to be there. There is no "pick a workspace"
  // state any more: the library is one directory the plugin is told about, so a fresh profile
  // opens on an empty shelf instead of a warning about a workspace it does not need.
  if (library === undefined) {
    return h('div', { className: 'st-shell' }, h('div', { className: 'st-scroll st-muted' }, t('label.loading')))
  }
  if (startOpen || (bookFolder === undefined && (!startSeen || books.length === 0))) {
    return h('div', { className: 'st-shell', ref: shellRef },
      h(WelcomePage, {
        t, api, books,
        hasBook: bookFolder !== undefined,
        onSeen: markStartSeen,
        onCreated: (folder, list, absolutePath) => {
          markStartSeen()
          setStartOpen(false)
          setBooks(list)
          setBookFolder(folder)
          setBookPath(absolutePath)
        },
        onLibrary: () => {
          markStartSeen()
          setStartOpen(false)
          if (bookFolder !== undefined) setBookFolder(undefined)
        },
        onBack: () => setStartOpen(false),
        onOpenDirectory: pickDirectory === undefined ? undefined : openDirectory,
      }),
      h(TooltipLayer, { rootRef: shellRef }))
  }
  if (bookFolder === undefined) {
    return h('div', { className: 'st-shell', ref: shellRef },
      h(BookLibrary, {
        t, api, library, books, workspaces, workspaceSnapshot,
        onNotice: setShelfNotice,
        // Back to the book the shelf was opened from. The remembered folder is read here
        // instead of being kept in its own state: it is the same value the panel restores on
        // the next launch, and a second copy could drift from it.
        onBack: remembered === undefined ? undefined : () => {
          setBookFolder(remembered.folder)
          setBookPath(remembered.absolutePath)
        },
        backTitle: remembered?.title ?? '',
        // A rename moves the folder but not the book's id, so the remembered book needs no
        // repair here — it is the same book under a new name. Only the two live pointers move:
        // the open book has to follow the folder that exists now, and the shelf is re-read.
        onRenamed: (entry, data) => {
          if (bookFolder !== undefined && bookFolder === entry.folder && data?.folder !== undefined) {
            setBookFolder(data.folder)
          }
          refreshShelf()
        },
        onDeleted: refreshShelf,
        onOpen: (folder, absolutePath) => { setBookFolder(folder); setBookPath(absolutePath) },
        onCreated: (folder, list, absolutePath) => { setBooks(list); setBookFolder(folder); setBookPath(absolutePath) },
        onOpenDirectory: pickDirectory === undefined ? undefined : openDirectory,
      }),
      h(TooltipLayer, { rootRef: shellRef }))
  }

  return h('div', { className: 'st-shell', ref: shellRef },
    h('div', {
      className: 'st-titlebar',
      // Empty space in the title row puts the board away.
      //
      // The board owns the page while it is open, and the row above it is the one strip that
      // always stays visible — so it is where a writer's hand goes to dismiss something. A press
      // on a BUTTON in the row is obviously not that: the check walks up from the target and
      // ignores anything inside a control, so the drawer toggles, the book menu and the session
      // button keep their own behaviour.
      //
      // Mouse-down rather than click, matching every other dismiss-on-outside in this panel: the
      // press is what the writer means, and waiting for the release would also fire after a drag
      // that merely started on the bar.
      onMouseDown: (event) => {
        const target = event?.target
        if (target !== null && target !== undefined && typeof target.closest === 'function'
          && target.closest('button, a, input, select, textarea, [role="menu"], [role="menuitem"]') !== null) return
        // Empty title-row space belongs to no panel: it puts away whichever one is up.
        closeAllPanels()
      },
    },
      h('button', {
        type: 'button', className: 'st-btn st-btn-ghost st-rail-toggle',
        title: railHidden ? t('action.showRail') : t('action.hideRail'),
        'aria-label': railHidden ? t('action.showRail') : t('action.hideRail'),
        'aria-expanded': railHidden ? 'false' : 'true',
        onClick: () => {
          // The outline is one of the panels: opening it shuts the others.
          if (railHidden) closePanelsExcept('rail')
          setRailHidden((wasHidden) => !wasHidden)
        },
      }, h(RailIcon, { collapsed: railHidden })),
      // The book's name, and nothing behind it. It was a menu of the other books with the library
      // as its last row; the caret beside it invited a click that opened a list over the page the
      // writer was reading. The title of a page is a heading — switching books is the shelf's job,
      // and the shelf is one press away in the outline's own menu.
      h('h1', { className: 'st-title' }, book?.title || t('panel')),
      // The board button sits against the title, not with the preference drawers at the far end.
      // It acts on the book the title names — the same subject — while 模型 and 排版 are the
      // panel's own settings; putting all three together made a writer read the row as
      // "three things about this panel" instead of "this book, then the panel".
      h('button', {
        type: 'button',
        className: 'st-btn st-btn-ghost st-drawer-btn',
        'data-testid': 'mosaic-open',
        'aria-haspopup': 'dialog',
        'aria-expanded': mosaicOpen ? 'true' : 'false',
        // The same pressed state the find and ask buttons use: the row tells the writer which
        // of its controls owns the page below it.
        'aria-pressed': mosaicOpen ? 'true' : 'false',
        // Closing the outline is the effect above's job, not this handler's: one rule in one place.
        onClick: () => {
          if (mosaicOpen) { setMosaicOpen(false); return }
          closePanelsExcept('board')
          setMosaicOpen(true)
        },
      }, h(BoardIcon), t('mosaic.open')),
      // 随笔 sits beside the board button because both act on the book, not on the panel's own
      // settings. It is a separate surface: notes are whole-book, the board is the cast graph.
      book === null || book === undefined ? null : h('button', {
        type: 'button', className: 'st-btn st-btn-ghost st-drawer-btn',
        'data-testid': 'notes-open', 'aria-haspopup': 'dialog',
        'aria-expanded': notesOpen ? 'true' : 'false',
        'aria-pressed': notesOpen ? 'true' : 'false',
        onClick: () => {
          if (notesOpen) { setNotesOpen(false); return }
          closePanelsExcept('notes')
          setNotesOpen(true)
        },
      }, h(NotebookIcon), t('notes.title')),
      // No progress caption beside the title. "1 章 · 已定稿 1 段" read as a label the title needed,
      // when the title is the page's name and needs nothing after it. The same counts are already
      // in the status bar, at the bottom, where a read-out belongs.
      h('span', { className: 'st-spacer' }),
      mcpInfo === undefined ? null : h('button', {
        type: 'button', className: 'st-btn st-btn-ghost st-drawer-btn',
        'data-testid': 'mcp-open', 'aria-haspopup': 'dialog', 'aria-expanded': mcpOpen ? 'true' : 'false',
        onClick: openMcp,
      }, h(McpIcon), t('mcp.title')),
      drawerButtons,
      // The full conversation, not an in-panel imitation: a real Session has the tools,
      // streaming and history this panel cannot reproduce. A standalone host without the
      // layout/workspace services simply has no such button.
      layout !== undefined && uiWorkspace !== undefined ? h('button', {
        type: 'button', className: 'st-session-btn',
        onClick: openConversation,
      }, h('span', { className: 'st-session-label' }, t('action.openChat'))) : null),
    h('div', { className: 'st-root' },
      // No side chat: the book's conversation is a real dsh Session behind 去完整对话, so a
      // second, cut-down chat beside the manuscript was a worse copy of the same idea.
      // The outline is an OVERLAY on the page rather than a column beside it: it slides in
      // from the left edge, over the text, and closing it gives the manuscript its width back.
      h('div', { className: 'st-col st-mid' }, middle(),
        // The click-away layer stays over the PAGE and nothing else. Inside the rail's own layer it
        // would span the status bar and the composer too, so a click in the question box would
        // dismiss the outline instead of typing — and the box is exactly where the writer's hand
        // goes next.
        railMotion.mounted
          ? h('div', { className: 'st-rail-scrim', onClick: () => setRailHidden(true), role: 'presentation' })
          : null)),
    // The status bar is the bottom edge of the PANEL, not of the writing column: it spans the
    // whole width, under the outline and the page alike, so it stays put when the outline
    // opens and covers the same ground whatever the writer is doing.
    h(StatusBar, {
      t, book: state.book,
      chapter: state.book?.chapters.find((c) => c.id === chapterId) ?? state.book?.chapters[0],
      saveStatus, model: roleModels,
      // A drawer or the board owns the page while it is open. The model card is an aside that
      // belongs to the bar, so it must not stay open behind a panel: the writer closed it by
      // opening something else, and a card left floating there reappears the moment the panel
      // closes — which reads as "Settings opened the model page as well".
      covered: drawer !== null || mosaicOpen || answerLog || aboutOpen || notesOpen,
      // One message at a time, most-blocking first. A load failure outranks a failed save,
      // which outranks an AI error, which outranks the note that the last answer was cut short.
      // A message that merely informs — a truncated list, a recovered draft — is amber rather
      // than red, so "this went wrong" and "read this with care" do not look alike.
      notice: (() => {
        const first = [
          { text: shelfNotice, tone: 'error' },
          { text: drawerNotice.text, tone: drawerNotice.tone },
          { text: state.error, tone: 'error' },
          { text: state.saveError, tone: 'error' },
          { text: aiError, tone: 'error' },
          { text: chatError, tone: 'error' },
          { text: scan?.error ?? '', tone: 'error' },
          { text: scan?.truncated === true ? t('scan.truncated') : '', tone: 'warn' },
          { text: state.recovered ? t('label.recovered') : '', tone: 'warn' },
        ].find((row) => String(row.text ?? '') !== '')
        return first ?? { text: '', tone: 'info' }
      })(),
    }),
    // The outline is a SHELL child, after the status bar: positioned against the shell, its card
    // runs from under the title row to the very bottom edge of the panel. Measured against the
    // writing column it stopped at the bar's top edge, which left a strip of page under a card
    // that is meant to be flush with the frame. z-index keeps it under the overlays below.
    h('div', {
      className: `st-rail-layer${railMotion.closing ? ' st-closing' : ''}`,
    },
      // The rail node always exists and carries its own collapsed class: the exit animation needs
      // the node for its duration, and the state is readable from the class whether or not a
      // browser is animating it.
      h('div', { className: `st-rail${railHidden ? ' st-rail-collapsed' : ''}` },
        railMotion.mounted ? leftPane() : null)),
    // 关于, mounted at the PANEL's level. See the note where `aboutOpen` is declared.
    aboutOpen ? h(AboutBox, { t, onClose: () => setAboutOpen(false) }) : null,
    mcpOpen ? h(McpPanel, {
      t, loading: mcpState.loading, error: mcpState.error, info: mcpState.info,
      onClose: () => setMcpOpen(false),
      onLaunch: openHarness,
    }) : null,
    // The things that open over the manuscript, in the order they stack. See overlays.js
    // for each one's own reasoning; the decisions stay here.
    notesOpen ? h(NotesPanel, {
      t, book, updateBook, onClose: () => setNotesOpen(false),
    }) : null,
    h(AnswerLogOverlay, {
      open: answerLog, t, answers, loadError: answersError,
      // An old answer is inserted the same way the newest one is: the editor owns the range
      // and the undo history, so it does the work.
      onInsert: (entry) => { insertFromLog(entry); setAnswerLog(false) },
      onClose: () => setAnswerLog(false),
    }),
    // Deleting from the outline asks first.
    h(RemoveNodeOverlay, {
      t, doomed, countUnder, onConfirm: confirmRemove, onCancel: cancelRemove,
    }),
    h(SheetOverlay, {
      t, motion: drawerMotion, onClose: () => setDrawer(null), body: drawerBody,
    }),
    // Last, so the board sits over a drawer if both are somehow open.
    h(MosaicOverlay, {
      mounted: mosaicMotion.mounted, book: state.book,
      t, updateBook, onSummary,
      tab: mosaicTab, onTab: setMosaicTab,
      closing: mosaicMotion.closing,
      // What the review flow needs: the folder the routes address, the chapter 检查本章 reads,
      // and the proposal itself. The panel owns the proposal state and hands down its setter;
      // nothing is persisted — a proposal the writer never accepts is re-fetched by the next
      // 检查本章.
      mosaicProposal,
      api, bookFolder, chapter,
      onProposal: setMosaicProposal,
      // The apply route writes the file, so the review header needs the same two panel
      // services a drawer gets: a flush before it reads, and the write result it adopts.
      onFlush: flushSave, onAdoptWritten: adoptWritten,
      // The merged reference pages ride on the same services their drawers used, plus the two
      // ways a page reports back: a notice, and the book a route wrote.
      onNotice: noticeRow,
      onClose: () => setMosaicOpen(false),
    }),
    // Last: the drawn tooltip layer, so a bubble can sit over every overlay above.
    h(TooltipLayer, { rootRef: shellRef }),
  )
}
/**
 * The book title, and the list of books behind it.
 *
 * The title used to be a plain link to the library, which meant that switching between two
 * books cost a whole screen: click the title, find the card, click it. A writer with several
 * books open does that constantly, so the title is a menu now — the books it knows about, with
 * the current one marked, and the library as the last row rather than the only destination.
 *
 * The library stays reachable because creating, renaming and deleting belong there; this menu
 * is for going somewhere that already exists.
 */
