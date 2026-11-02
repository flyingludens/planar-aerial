/**
 * The panel's stylesheet, as one template string.
 *
 * It is a string rather than a CSS file because the bundle is a single classic script: there is
 * no CSS loader, and the loader does not deliver sibling files to the browser. One `<style>`
 * element is injected from this string on mount and removed on unmount.
 *
 * Two rules for editing it, both learned the hard way:
 *
 *  - **No backticks in comments.** A backtick ends the template string early, and what follows
 *    parses as an expression. `node --check` catches that only when the character after the
 *    backtick cannot start a member access; writing `.st-foo` in a comment produced a valid
 *    tagged template that failed at runtime instead.
 *  - **The indentation inside is content, not formatting.** Reindenting the code around this
 *    file must not touch these lines.
 *
 * Order: the library's sheet first, then the bridge that maps the host theme onto the
 * library's tokens, then everything project-side. The bridge must come after FANG_CSS —
 * it overrides the library's dark-theme defaults with the host's variables.
 */
import { FANG_CSS } from 'fang-style'
import { CSS_BRIDGE, CSS_SHARED } from './shared/styles.js'
import { CSS_CORE } from './panel/core.css.js'
import { CSS_LIBRARY } from './panel/library.css.js'
import { CSS_WELCOME } from './panel/welcome.css.js'
import { CSS_NEWBOOK } from './panel/new-book-dialog.css.js'
import { CSS_MCP } from './panel/mcp-panel.css.js'
import { CSS_GLYPH } from './panel/glyph-field.css.js'
import { CSS_NOTES } from './panel/notes.css.js'
import { CSS_COMPOSER } from './panel/composer.css.js'
import { CSS_SCAN } from './panel/scan.css.js'
import { CSS_STATUS } from './panel/status.css.js'
import { CSS_MODELS } from './panel/models.css.js'
import { CSS_SETTINGS } from './panel/settings.css.js'
import { CSS_CONTEXT } from './panel/context.css.js'
import { CSS_OUTLINE } from './panel/outline.css.js'
import { CSS_RAIL } from './panel/rail.css.js'
import { CSS_BOARD } from './mosaic/board.css.js'
import { CSS_CARDS } from './mosaic/cards.css.js'
import { CSS_ENTITY } from './mosaic/entity.css.js'
import { CSS_REVIEW } from './mosaic/review.css.js'
import { CSS_OVERVIEW } from './mosaic/overview.css.js'

/**
 * The whole sheet, in the order the parts were split out of it.
 *
 * One template string still: the loader injects one `<style>` element from this, and a rule's
 * position in it decides the cascade. The order below is therefore not cosmetic — shared tokens
 * and the frame come first because everything else is laid out inside them, and a component's
 * own rules come after the conventions they override.
 *
 * Each part lives beside the component it dresses. Changing one page's look means opening one
 * file, which is the whole reason the sheet is no longer one block.
 */
export const CSS = `${FANG_CSS}
${CSS_BRIDGE}
${CSS_SHARED}
${CSS_CORE}
${CSS_LIBRARY}
${CSS_WELCOME}
${CSS_NEWBOOK}
${CSS_MCP}
${CSS_GLYPH}
${CSS_NOTES}
${CSS_COMPOSER}
${CSS_SCAN}
${CSS_STATUS}
${CSS_MODELS}
${CSS_SETTINGS}
${CSS_CONTEXT}
${CSS_OUTLINE}
${CSS_RAIL}
${CSS_BOARD}
${CSS_CARDS}
${CSS_ENTITY}
${CSS_REVIEW}
${CSS_OVERVIEW}`
