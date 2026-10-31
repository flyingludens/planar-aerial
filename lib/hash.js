import { createHash } from 'node:crypto'

/**
 * The hash a cached summary and a provenance fact are stamped with.
 *
 * It lives on its own because three modules need it and none of them needs the rest of
 * `overview.js`: the store stamps tokens, the overview decides staleness, and the fact checker
 * asks whether the prose still says what it said when the fact was accepted. Keeping it there
 * made `overview.js` and `context.js` import each other.
 */
export function hashText(text) {
  return createHash('sha256').update(text ?? '', 'utf8').digest('hex')
}
