/**
 * The board's shared write path: how a field on one entity is changed.
 *
 * The canvas popover and the detail page both edit the entity they show. Both used to carry
 * their own copy of the same eight lines; one write path is why "the popover saved it" and
 * "the page saved it" cannot come to mean different things.
 *
 * The transformation itself lives in `domain/board.js`, beside the normalizer, so the field
 * whitelist is the same one a save and a read use.
 */
import { patchEntity } from '../../../domain/board.js'

/**
 * Patch one entity's fields in place on the board, through the panel's `updateBook` — the same
 * write a layout drag uses, so an edit rides the ordinary save queue. A board that is not
 * loaded yet has nothing to patch, so the call quietly does nothing.
 */
export function patchEntityOnBoard(book, updateBook, entityId, fields) {
  const current = book?.mosaic
  if (current === undefined || current === null) return
  updateBook({ ...book, mosaic: patchEntity(current, entityId, fields) })
}
