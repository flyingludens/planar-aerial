/**
 * The book's full conversation, as a real dsh Session.
 *
 * A book folder is registered as a Workspace like any other project directory, so the sidebar
 * behaves exactly as it does for a code project — full conversation, tools, streaming, history.
 * The only difference is the name, which carries a prefix so book workspaces are recognisable
 * at a glance among the other projects.
 *
 * This is a different job from the side chat in the dock: that one asks the model about a
 * passage and lives inside the panel; this one hands the writer over to the host's own session
 * view, which the panel cannot reproduce and should not try to.
 */
import { React } from '../shared/react.js'

/**
 * @param {object} options
 * @param {object} [options.layout]        the host's layout service; absent means no session view
 * @param {object} [options.uiWorkspace]   the host's workspace service; absent means the same
 * @param {object} options.workspaces      create/rename, for registering a book folder
 * @param {object[]} options.items         the host's workspace rows, to find an existing one
 * @param {Function} [options.useSessions] the host's session-list hook
 * @param {object} options.book            the open manuscript, for its title
 * @param {string} options.bookFolder      the folder name, the fallback title
 * @param {string} [options.bookPath]      the folder's absolute path, the identity to match on
 * @param {Function} options.t             the dictionary
 */
export function useBookConversation({ layout, uiWorkspace, workspaces, items, useSessions, book, bookFolder, bookPath, t }) {
  // Hooks run during render only: reading the session list inside a click handler was a
  // hook-order violation (error #321). The snapshot is taken here, the handler reads it.
  const sessions = useSessions === undefined ? undefined : useSessions((snapshot) => snapshot)
  const [chatError, setChatError] = React.useState('')

  const workspaceNameFor = (title) => `${t('label.workspacePrefix')} · ${title}`

  /**
   * Register a book folder as a Workspace, or rename an existing one so it carries the prefix.
   * Returns the Workspace id a Session should start in.
   */
  const ensureBookWorkspace = async (absolutePath) => {
    const title = String(book?.title || bookFolder || '').trim()
    const name = workspaceNameFor(title === '' ? String(bookFolder ?? '') : title)
    const existing = items.find((row) => row.path === absolutePath)
    if (existing !== undefined) {
      // An older book workspace may still carry the bare folder name; rename it once.
      if (existing.title !== name) {
        try { await workspaces.rename(existing.workspaceId, name) } catch { /* the row stays usable */ }
      }
      return existing.workspaceId
    }
    const view = await workspaces.create({ path: absolutePath })
    const created = view?.workspaceId ?? view?.id
    if (created !== undefined && (view?.title ?? name) !== name) {
      try { await workspaces.rename(created, name) } catch { /* the path still works */ }
    }
    return created
  }

  /** Conversations already started for this book, newest first. */
  const bookSessions = () => {
    const list = sessions?.byId === undefined ? [] : Object.values(sessions.byId)
    return list
      .filter((row) => row.cwd === bookPath)
      .sort((a, b) => String(b.updatedAt ?? '').localeCompare(String(a.updatedAt ?? '')))
  }

  /**
   * Open the book's conversation: an existing Session when there is one, otherwise a new one
   * in the book's own workspace. The host switches the centre column itself; switching here
   * as well would abort the creation it is waiting on.
   */
  const openConversation = () => {
    if (layout === undefined) { setChatError(t('label.noLayout')); return }
    if (uiWorkspace === undefined) { setChatError(t('label.noWorkspaceService')); return }
    const rows = bookSessions()
    if (rows.length > 0) { uiWorkspace.openSession(rows[0].id); setChatError(''); return }
    setChatError('')
    ensureBookWorkspace(bookPath)
      .then((workspaceId) => {
        if (workspaceId === undefined) { setChatError(t('label.noWorkspaceForBook')); return }
        uiWorkspace.startSession(workspaceId)
      })
      .catch((error) => setChatError(error.message))
  }

  return { chatError, openConversation }
}
