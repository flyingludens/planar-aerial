/**
 * The rail's own frame: the scrolling tree on top, and the fixed function menu under it.
 *
 * The rail used to be one scrolling box, and its content decided how tall the card looked. Two
 * things follow from splitting it: the tree scrolls on its own, so a long book cannot push the
 * menu off the bottom of the panel, and the menu occupies the lower half of the card
 * whatever the tree holds.
 */
export const CSS_RAIL = `
      /* ---- the rail: a scrolling upper region and a fixed one under it ---- */
      .st-rail-body{display:flex;flex-direction:column;min-height:0;flex:1 1 auto;min-width:0}
      /* The card is split in half: the tree above, the menu below.
         A FIXED share rather than "whatever the tree needs": the menu is a region of the panel, not
         a footer stuck under a list. Sized to its content the tree pushed the menu down to a strip
         at the bottom edge on any book with more than a handful of sections, which is why the menu
         read as an afterthought. Half the card is enough for a chapter list to be scanned and
         scrolled, and it puts the menu's first row at the card's midpoint — a place the eye can
         find without hunting.
         The tree still scrolls inside its share: a long book does not make the card taller. */
      .st-rail-body .st-scroll{flex:0 1 50%;min-height:0}
      /* The menu's own block: the remaining half, top-aligned. Not stretched to fill — a
         list that spreads its rows to the bottom edge would look like a settings form; the blank
         space under the last row is what says the list has ended.
         Its inline padding is WIDER than the tree's above it (16 against the scroll box's 12),
         which is deliberate: the tree is a dense outline where every pixel of width buys a longer
         title, while the menu is four short words and reads as cramped when it starts at the same
         line. The extra inset is what makes it a menu in the card rather than a continuation of
         the list. */
      .st-rail-menu{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;justify-content:flex-start;
        padding:var(--st-space-16,16px) var(--st-space-16,16px) var(--st-space-16,16px)}

      /* ---- the function list ----
         Set to the host sidebar's own panel list, because that is what this is: a vertical menu of
         destinations at the bottom of a narrow column. The numbers are the host's, taken from
         ui-sidebar/SidebarRoot.module.css rather than guessed:
           row     min-height 36, padding 7/8, gap 8, radius radius-md, rows 4 apart
           text    14px at the inherited weight (the host's sidebar root is 14px)
         The group has no heading. It is not one subject — the shelf is navigation, save writes the
         file, export leaves the panel, about is a read-out — and a label that names only the first
         of those would be worse than none. */
      .st-rail-tools{display:flex;flex-direction:column;gap:var(--st-space-4,4px);min-width:0}

/* One destination per line. Full width, 36 tall, at reading size — the same row the host
         uses for its own panels, so the menu reads as a sibling of the sidebar rather than as a
         strip of small print appended to a tree. */
      .st-rail-tool{display:flex;align-items:center;gap:var(--st-space-8,8px);
        width:100%;min-width:0;min-height:var(--st-row-height-lg,36px);
        padding:var(--st-space-8,8px);box-sizing:border-box;
        border:none;border-radius:var(--st-radius-md,12px);background:transparent;cursor:pointer;
        font-family:inherit;font-size:var(--st-text-lg);line-height:var(--st-text-lg-leading);
        font-weight:var(--st-font-weight-normal);color:var(--st-text-primary);text-align:left;corner-shape:round;}
      .st-rail-tool:hover:not(:disabled){background:var(--st-hover-fill)}
      .st-rail-tool:active:not(:disabled){background:var(--st-active-fill)}
      /* Focus is an INSET ring, matching the host's panel rows: an outer ring on a full-width row
         would draw over the column's edge instead of around the row. */
      .st-rail-tool:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--st-focus-ink);
        outline-offset:-2px}
      /* A destination that needs the book is disabled without one, and says so by looking like it.
         The ink drops, not the whole row's opacity: a faded glyph reads as a smudge. */
      .st-rail-tool:disabled{cursor:not-allowed;color:var(--st-text-tertiary)}
      .st-rail-tool:disabled .st-rail-tool-icon{opacity:var(--st-fade-quiet)}
      /* The glyph gets a fixed box so four labels share one left edge — the alignment comes from
         the slot being measured, not from four icons happening to be about as wide. */
      .st-rail-tool-icon{flex:none;display:inline-flex;align-items:center;justify-content:center;
        width:var(--st-icon-menu,18px);height:var(--st-icon-menu,18px);
        color:var(--st-text-secondary)}
      .st-rail-tool:hover:not(:disabled) .st-rail-tool-icon,
      .st-rail-tool:focus-visible .st-rail-tool-icon{color:var(--st-text-primary)}
      /* The label is what shortens when the column is narrow; the glyph is what identifies the row. */
      .st-rail-tool-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
`
