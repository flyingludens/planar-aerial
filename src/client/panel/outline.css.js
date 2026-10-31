/**
 * The chapter tree and its inline editors.
 */
export const CSS_OUTLINE = `
      /* ---- the outline: the chapter tree and its inline editors ---- */
      .st-tree{display:flex;flex-direction:column;gap:var(--st-space-2,2px)}
.st-node{display:flex;align-items:baseline;gap:var(--st-space-8,8px);padding:var(--st-space-4,4px) var(--st-space-8,8px) var(--st-space-4,4px) 0;border-radius:var(--st-radius-sm,8px);
        cursor:pointer;font-size:var(--st-text-md);line-height:var(--st-text-md-leading);color:var(--st-text-secondary);min-width:0;corner-shape:round;}
      .st-node:hover{background:var(--st-hover-fill)}
      .st-node[data-current="true"]{background:var(--st-selected-fill);color:var(--st-text-primary)}
      .st-node[data-level="volume"]{color:var(--st-text-primary);font-weight:var(--st-font-weight-strong)}
      .st-node[data-level="chapter"]{font-weight:var(--st-font-weight-medium);color:var(--st-text-primary)}
      .st-node-caret{flex:none;width:var(--st-space-12,12px);font-size:var(--st-text-sm);color:var(--st-text-tertiary)}
      .st-node-dot{flex:none;width:var(--st-mark-sm,4px);height:var(--st-mark-sm,4px);border-radius:var(--st-radius-pill,999px);corner-shape:round;background:var(--dsw-alias-border-l4,var(--st-fallback-border-l4));margin-top:var(--st-space-8,8px)}
      .st-node-input{flex:1 1 auto;min-width:0;font-size:var(--st-text-md);padding:var(--st-space-2,2px) var(--st-space-4,4px)}
      /* The two actions appear together on hover: they belong to the same row and hiding one of
         them made the other look like the row's only option. They override the button height
         down to the compact row, so the pill system does not inflate the tree. */
      .st-node-remove,.st-node-rename{--st-btn-h:var(--st-btn-h-sm,26px);opacity:0;flex:none;padding:0 var(--st-space-4,4px);line-height:var(--st-text-sm-leading)}
      .st-node:hover .st-node-remove,.st-node:hover .st-node-rename,
      .st-node:focus-within .st-node-remove,.st-node:focus-within .st-node-rename{opacity:1}
      .st-node-rename:hover{color:var(--st-accent) !important}
      .st-node-remove:hover{color:var(--dsw-alias-state-error-primary,var(--st-fallback-error)) !important}
/* The name is part of a clickable row, so it takes the hand too. It used to say "text",
         which made the row read as a line of prose you could put a caret in — the row selects a
         chapter, it does not edit one. Double-click still renames, and the caret appears in the
         input that opens for it, which is where a text cursor belongs. */
      .st-node-name{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
        cursor:pointer;border-radius:var(--st-radius-xs,4px);corner-shape:round;}
      .st-node:hover .st-node-name{color:var(--st-text-primary)}

      /* The mosaic sheet: a card that drops from the panel's top edge, the way a reference panel
         unfolds downward. It stops above the dock — the composer is the one region of the page
         this board must never cover — and its height is FIXED: a board that grows with its
         content reflows the canvas under the writer's cursor. The dimmed area covers the shell
         between the title row and the dock slot, so both stay clickable. */
      /* Behind the board. It is a real scrim now: darker than the page and blurred, so the manuscript
         underneath reads as "put away" rather than as another surface at the same depth as the board.
         It used to be a 55% wash of the page's own colour, which on a dark theme left the board and
         the page as the same value — the sheet floated on nothing. */
      /* The dimmed area covers the WHOLE panel, dock included, so a click anywhere outside the
         board dismisses it. The dock clearance is a PADDING here, not part of the inset: with it
         carved out of the inset the strip below the board belonged to the editor, and clicking
         the empty space under the board did nothing — the one gesture every other popover in the
         panel answers. Padding keeps the board itself out of the dock while the scrim still
         catches the click. */
`
