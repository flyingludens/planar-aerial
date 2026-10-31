/**
 * The shapes both halves of the plugin agree on.
 *
 * This file is imported by the Node half (`lib/`) and bundled into the browser half
 * (`src/client/`), so it may not import either of them, Node built-ins, React or `fetch`.
 * An id is minted through `ids.js`; nothing here touches the disk or the network.
 */

export const BOOK_SCHEMA_VERSION = 3
export const BOARD_SCHEMA_VERSION = 4

export const NODE_LEVELS = ['volume', 'chapter', 'section']
export const NODE_STATUSES = ['todo', 'writing', 'done']

/**
 * The five kinds of card the board holds. One list, referenced by the normalizer, the applier, the
 * digest and the prompts: a second copy of these names is how "place" would end up spelled
 * "location" in one place and silently dropped in another.
 */
export const ENTITY_KINDS = ['character', 'place', 'faction', 'item', 'event']

/**
 * The fields every card has, whatever it is. `summary` is the one line the card front, the digest
 * and the context layer read; `description` is the long form that only the detail page and the
 * portrait prompt see; `notes` is the author's private margin. Splitting them is the whole reason
 * a long description cannot blow up a prompt's budget.
 */
export const SHARED_FIELDS = ['summary', 'description', 'notes']

/**
 * Fields only one kind carries. Everything here is optional: a card with nothing but a name is
 * still a valid card, and a writer who never fills in "arc" is not shown an error.
 *
 * References between cards are IDS, not names (`controlledBy`, `base`, `leader`, `holder`,
 * `where`). Renaming a card must not leave a dangling word in another card, and the same protocol
 * is what the edges already use.
 */
export const KIND_FIELDS = {
  character: ['role', 'gender', 'age', 'nationality', 'appearance', 'personality', 'motivation', 'arc'],
  place: ['location', 'atmosphere', 'controlledBy'],
  faction: ['purpose', 'base', 'leader', 'members'],
  item: ['origin', 'holder', 'significance'],
  event: ['when', 'where', 'participants', 'consequence'],
}

/** Fields holding a single entity id. Cleared when the target is gone, like a dangling edge. */
export const REFERENCE_FIELDS = ['controlledBy', 'base', 'leader', 'holder', 'where']
/** Fields holding an array of entity ids. */
export const REFERENCE_LIST_FIELDS = ['members', 'participants']

/** The board a book has before anything is put on it. */
export const EMPTY_MOSAIC = { schemaVersion: BOARD_SCHEMA_VERSION, entities: [], edges: [] }

/**
 * A fresh empty board.
 *
 * A factory rather than the constant above: a caller that spreads the board into a new value is
 * safe, but one that pushes onto it would otherwise edit the shared fallback for every reader.
 */
export const emptyBoard = () => ({ schemaVersion: BOARD_SCHEMA_VERSION, entities: [], edges: [] })
