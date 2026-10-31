/**
 * The board's use cases: the steps that change what the writer sees, separated from the pages
 * that draw them.
 *
 * `MosaicSheet` used to hold the apply sequence twice (once for the review page, once for the
 * proposals page), the portrait cache and the delete cascade. Each is a job with a start and an
 * end, not a rendering decision: applying a proposal must flush the pending save, call the route,
 * adopt the book and token it answers with, and report the count. The pages now call one function
 * and draw its result.
 *
 * Reads stay in the pages. Only the writes and the effects that must accompany them live here.
 */
import { React } from '../shared/react.js'
import { createEntity, emptyBoard, patchEntity, removeEntity } from '../../../domain/board.js'

/**
 * @param api        - the route table.
 * @param bookFolder - the open book, the address every route takes.
 * @param book       - the open book, read for its board.
 * @param updateBook - the panel's one local write path (screen + save queue).
 * @param adoptWritten - adopts a book a route wrote, with its token.
 * @param flushSave  - lands pending typing before a route reads what is on disk.
 * @param onNotice   - the status bar's message slot.
 * @param t          - the translator, for the one notice this hook writes.
 */
export function useBoardActions({ api, bookFolder, book, updateBook, adoptWritten, flushSave, onNotice, t }) {
  const mosaic = book?.mosaic
  /**
   * Change one card. The transformation (and its field whitelist) is in `domain/board.js`, so a
   * patch here and a save elsewhere cannot disagree about which fields exist.
   */
  const patchCard = (entityId, fields) => {
    if (mosaic === undefined || mosaic === null) return
    updateBook({ ...book, mosaic: patchEntity(mosaic, entityId, fields) })
  }

  /** A new card, from the one constructor both halves share. */
  const createCard = (kind, fields = {}) => {
    const current = mosaic ?? emptyBoard()
    const { name = '', ...rest } = fields
    const entity = createEntity(kind, name, rest)
    updateBook({ ...book, mosaic: { ...current, entities: (current.entities ?? []).concat([entity]) } })
    return entity
  }

  /** Remove a card and every edge that pointed at it. */
  const removeCard = (entityId) => {
    if (mosaic === undefined || mosaic === null) return
    updateBook({ ...book, mosaic: removeEntity(mosaic, entityId) })
  }

  /**
   * Apply a batch of board changes and adopt the answer.
   *
   * The order is the whole point: flush the debounce, let the host write and answer, then adopt
   * the board half and the token together. The route has already written the file, so nothing
   * here queues a save; `after` is for the caller's own state (the review's verdicts), not for
   * persistence.
   */
  const applyChanges = async (changes, options = {}) => {
    if (!Array.isArray(changes) || changes.length === 0) return undefined
    if (typeof flushSave === 'function') await flushSave()
    const data = await api.mosaicApply(bookFolder, changes, options.proposalId, options.provenance)
    if (typeof adoptWritten === 'function') {
      adoptWritten({
        merge: (prevBook) => (prevBook === null || prevBook === undefined ? prevBook : {
          ...prevBook,
          mosaic: data.book?.mosaic ?? prevBook.mosaic,
        }),
        token: data.token,
        savedAt: data.savedAt,
      })
    }
    if (typeof onNotice === 'function') {
      onNotice(t('mosaic.applied', { applied: (data.applied ?? []).length, skipped: data.skipped ?? 0 }))
    }
    if (typeof options.after === 'function') options.after(data)
    return data
  }

  /*
   * Portraits.
   *
   * Three pieces with three lifetimes: one generation at a time (`busyId`), an error that clears
   * on the next attempt, and a cache that outlives the open card so re-opening one does not
   * re-fetch an unchanged image. The cache holds the PATH, not the bytes: a data URI in book.json
   * would turn a readable manuscript into a blob, re-saved on every keystroke.
   */
  const [portraitBusyId, setPortraitBusyId] = React.useState(null)
  const [portraitError, setPortraitError] = React.useState('')
  const [portraits, setPortraits] = React.useState({})
  // Tracked outside React state: a callback that depended on the cache would change identity on
  // every picture and re-run the effect that reads it.
  const portraitRequests = React.useRef(new Set())
  const loadPortrait = React.useCallback(async (path) => {
    if (typeof path !== 'string' || path === '') return
    if (portraitRequests.current.has(path)) return
    portraitRequests.current.add(path)
    try {
      const data = await api.mosaicPortraitRead(bookFolder, path)
      setPortraits((current) => ({ ...current, [path]: data?.ok === true ? data.dataUri : null }))
    } catch {
      // A picture that cannot be read is a missing picture, not a panel error.
      setPortraits((current) => ({ ...current, [path]: null }))
    }
  }, [api, bookFolder])
  // Which language the portrait prompt is written in, read from the panel's own translated copy —
  // a CJK character in a label means the writer is reading the Chinese dictionary, the only
  // distinction the prompt needs.
  const promptLanguage = /[\u4e00-\u9fff]/.test(t('mosaic.generatePortrait')) ? 'zh' : 'en'
  // Every portrait the BOARD shows, not only the open card's: the graph and the gallery draw every
  // card at once. The dependency is the joined list of paths, so a newly generated portrait (its
  // path is new) is collected on the next pass.
  const boardPortraitPaths = React.useMemo(() => {
    const list = []
    for (const entity of mosaic?.entities ?? []) {
      if (typeof entity.portrait === 'string' && entity.portrait !== '') list.push(entity.portrait)
    }
    return list.join('\n')
  }, [mosaic?.entities])
  React.useEffect(() => {
    if (boardPortraitPaths === '') return
    for (const path of boardPortraitPaths.split('\n')) loadPortrait(path)
  }, [boardPortraitPaths, loadPortrait])
  const portraitOf = (entity) => {
    const path = entity?.portrait
    if (typeof path !== 'string' || path === '') return null
    return Object.prototype.hasOwnProperty.call(portraits, path) ? portraits[path] : null
  }
  // The galleries read the same resolver under the name they use for it: "portrait" is the
  // panel's word for the file, "picture" the card's word for what it draws.
  const pictureOf = portraitOf
  const generatePortrait = async (entity) => {
    if (portraitBusyId !== null) return
    setPortraitBusyId(entity.id)
    setPortraitError('')
    try {
      const data = await api.mosaicPortrait(bookFolder, entity, promptLanguage)
      if (data?.ok !== true) throw new Error(data?.error ?? t('mosaic.portraitFailed'))
      patchCard(entity.id, { portrait: data.path })
      setPortraits((current) => ({ ...current, [data.path]: data.dataUri ?? null }))
    } catch (error) {
      setPortraitError(error?.message ?? String(error))
    } finally {
      setPortraitBusyId(null)
    }
  }

  return {
    patchCard, createCard, removeCard, applyChanges,
    portraits, portraitBusyId, portraitError, portraitOf, pictureOf, generatePortrait,
  }
}
