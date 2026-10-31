/**
 * Which model the panel's own actions use, and the list behind both pickers.
 *
 * One hook rather than five state declarations inside the panel: the role names, the catalogue
 * both pickers draw from, the effort levels of the chosen model, and the epoch that ties them
 * together are one subject — refresh one and the other three are stale.
 *
 * @param api        - the route table; `meta`, `catalog` and `efforts` fill the lists.
 * @param bookFolder - the open book, or undefined on the shelf. Re-fetched when it changes.
 * @param dockScope  - the per-book key the dock store is bucketed by.
 */
import { React } from '../shared/react.js'
import { useDockState } from '../shared/hooks.js'

export function useModels({ api, bookFolder, dockScope }) {
  // The panel's own failure channel. Every other writer reports there, so a failed model write
  // goes to the same place rather than to a corner of this hook.
  const [, setAiError] = useDockState(dockScope, 'aiError', '')
  /**
   * Which model the panel's own actions use. Fetched once per book: the roles rarely change,
   * and the status bar must not trigger a request every time it renders.
   */
  const [roleModels, setRoleModels] = React.useState(null)

  /**
   * Bumped when something changes which model a role uses: the model page, or the composer's
   * chip (which switches the session model, and every unpinned role follows it). The names the
   * status bar and the chip show are re-read after it, so the panel never says a model it is
   * not about to use.
   */
  const [modelEpoch, setModelEpoch] = React.useState(0)
  const refreshModels = () => setModelEpoch((epoch) => epoch + 1)
  React.useEffect(() => {
    if (bookFolder === undefined) { setRoleModels(null); return undefined }
    // The status bar is decoration: a host without this route, or a failed request, must leave
    // the panel working and simply not name a model, never break the page underneath it.
    if (typeof api.meta !== 'function') return undefined
    let cancelled = false
    api.meta().then((data) => { if (!cancelled) setRoleModels(data?.roles ?? null) }, () => {})
    return () => { cancelled = true }
  }, [bookFolder, modelEpoch])
  const [catalog, setCatalog] = React.useState([])
  /** The levels the CHAT model offers, for the composer's axis. Empty when it has none. */
  const [chatEfforts, setChatEfforts] = React.useState([])
  React.useEffect(() => {
    if (typeof api.catalog !== 'function') return undefined
    let cancelled = false
    api.catalog().then((data) => { if (!cancelled) setCatalog(data?.groups ?? []) }, () => {})
    return () => { cancelled = true }
  }, [modelEpoch])
  const chatSelection = roleModels === null || roleModels === undefined ? undefined : roleModels.chat
  React.useEffect(() => {
    if (typeof api.efforts !== 'function' || chatSelection === undefined || chatSelection === null) {
      setChatEfforts([])
      return undefined
    }
    let cancelled = false
    api.efforts(chatSelection.provider, chatSelection.model).then(
      (data) => { if (!cancelled) setChatEfforts(data?.efforts ?? []) },
      () => { if (!cancelled) setChatEfforts([]) },
    )
    return () => { cancelled = true }
  }, [chatSelection === null || chatSelection === undefined ? '' : `${chatSelection.provider}/${chatSelection.model}`, modelEpoch])

  /**
   * Set the chat's model from the composer.
   *
   * It writes the plugin's own config file rather than switching the SESSION model: the chip
   * says "this is who will answer a question here", and the session's model belongs to dsh,
   * not to this panel. Changing it there also used to move every role that had no model of its
   * own, which is a much bigger change than the writer asked for.
   */
  const changeChatModel = (selection) => {
    if (typeof api.setModel !== 'function') return
    if (selection === null || typeof selection !== 'object') return
    api.setModel('chat', selection).then(
      () => { refreshModels() },
      (error) => setAiError(error.message),
    )
  }
  const changeChatEffort = (id) => {
    const current = chatSelection
    if (current === null || current === undefined) return
    changeChatModel({ provider: current.provider, model: current.model, ...(id === '' ? {} : { reasoningEffort: id }) })
  }

  return {
    roleModels, roleModelsEpoch: modelEpoch, refreshModels,
    catalog, chatEfforts, chatSelection,
    setChatEffort: changeChatEffort, setChatModel: changeChatModel,
  }
}
