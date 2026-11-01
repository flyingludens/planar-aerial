/**
 * The board: the card that drops over the page, its bookmark column, and the bands every
 * page inside it is built from.
 */
export const CSS_BOARD = `
      /* ---- the board: its surface and bookmark column ---- */
      /* No dimming layer: the board is a panel over the page, not a modal. The backdrop stays
         because it is the sheet's positioning context, but it paints nothing and passes clicks
         through, so the composer below stays visible and typeable. */
      .st-mosaic-backdrop{position:absolute;inset:var(--st-titlebar-height,68px) 0 0 0;z-index:var(--st-layer-mosaic);
        display:flex;align-items:flex-start;justify-content:center;
        padding-bottom:var(--st-mosaic-dock-clearance);
        pointer-events:auto;
        animation:st-mosaic-scrim-in var(--st-motion-open,180ms) ease both}
      @keyframes st-mosaic-scrim-in{from{opacity:0}to{opacity:1}}
      /* A raised surface, not a coloured rectangle: a hairline edge, a layered shadow, and a
         one-pixel inner highlight along the top. It takes its own clicks back — the layer
         around it passes everything through. */
      .st-mosaic-sheet{pointer-events:auto;
        width:calc(100% - var(--st-overlay-inset));height:100%;flex:none;min-height:0;
        background:var(--st-surface);
        border:.5px solid var(--st-ink-edge);
        border-radius:var(--st-radius-lg,16px);corner-shape:round;
        display:flex;overflow:hidden;position:relative;
        box-shadow:inset 0 1px 0 color-mix(in srgb, var(--st-highlight,#fff) 10%, transparent),
                   0 2px 6px rgba(0,0,0,.14),
                   0 16px 40px rgba(0,0,0,.28),
                   0 40px 80px rgba(0,0,0,.22);
        animation:st-mosaic-in var(--st-motion-open,180ms) var(--ds-ease-in-out,ease-in-out) both}
      /* A drop, not a slide: the card unfolds downward, and folds back up the same way. */
      @keyframes st-mosaic-in{from{transform:translateY(-16px);opacity:0}to{transform:none;opacity:1}}
      .st-closing.st-mosaic-backdrop{animation:st-mosaic-scrim-out var(--st-motion-close,140ms) ease both}
      @keyframes st-mosaic-scrim-out{from{opacity:1}to{opacity:0}}
      .st-closing .st-mosaic-sheet{animation:st-mosaic-out var(--st-motion-close,140ms) var(--ds-ease-in-out,ease-in-out) both}
      @keyframes st-mosaic-out{from{transform:none;opacity:1}to{transform:translateY(-16px);opacity:0}}
      /* The bookmarks are a rail a step BELOW the page beside it: the content reads as the
         surface and the rail as its spine. */

      /* ---- the board's pages: bands, canvas, and the card drawn on it ---- */
      .st-mosaic-tabs{display:flex;flex-direction:column;gap:var(--st-space-8,8px);padding:var(--st-space-12,12px) var(--st-space-8,8px);
        border-left:.5px solid var(--st-ink-edge);
        background:var(--st-ink-whisper)}
      /* The vertical text is padded evenly on both sides: letter-spacing adds one slot after
         the last glyph, and the negative inline margin pulls it back out, so the selected pill
         sits centred. */
      .st-mosaic-tab{border:none;background:transparent;padding:var(--st-space-12,12px) 0;cursor:pointer;
        border-radius:var(--st-radius-sm,8px);corner-shape:round;
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        writing-mode:vertical-rl;letter-spacing:var(--st-tab-tracking);margin-inline:var(--st-tab-tracking-pull);
        text-align:center;box-sizing:border-box;
        color:var(--st-text-tertiary)}
      .st-mosaic-tab:hover{background:var(--st-hover-fill)}
      .st-mosaic-tab:active{background:var(--st-active-fill)}
      /* The selected bookmark: a brighter FILL and weight, no coloured ring — selection is a
         brightness step, not an accent, so the board's colour stays reserved for the wires and
         the actions that need it. */
      .st-mosaic-tab[data-active="true"]{background:var(--st-selected-fill);
        color:var(--st-text-primary);font-weight:var(--st-font-weight-strong)}
      .st-mosaic-body{flex:1;min-width:0;overflow:hidden;padding:var(--st-board-inset);display:flex;flex-direction:column}
      /* Every page is three bands: a title, ONE non-growing row of controls, then the content.
         The operation area is the same height on every bookmark — layout is decided once. Only
         a non-board page's content scrolls; the canvas page hands its height to the board. */
      .st-mosaic-band{display:flex;flex-direction:column;gap:var(--st-board-gap);flex:1 1 auto;min-height:0}
      .st-mosaic-band-heading{margin:0;font-weight:var(--st-font-weight-strong);
        font-size:var(--st-text-lg);line-height:var(--st-text-lg-leading);
        color:var(--st-text-primary)}
      /* The title row: name on the left, tools at the trailing edge of the same line. One
         non-wrapping flex row, so a long title truncates instead of pushing the buttons down. */
      .st-mosaic-band-head{display:flex;align-items:center;gap:var(--st-space-12,12px);flex-wrap:nowrap;min-width:0}
      .st-mosaic-band-head .st-mosaic-band-heading{flex:0 1 auto;min-width:0;
        overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .st-mosaic-band-tools{display:flex;gap:var(--st-space-8,8px);align-items:center;margin-left:auto;flex:none}
      /* Inside the title row the header carries no outer margin of its own — in a one-line row
         it just pushes the buttons off centre. */
      .st-mosaic-band-tools .st-mosaic-head{margin:0;flex-direction:row;align-items:center}
      .st-mosaic-band-tools .st-mosaic-check-row{gap:var(--st-space-4,4px)}
      .st-mosaic-band-content{display:flex;flex-direction:column;gap:var(--st-board-gap);min-width:0;flex:1 1 auto;min-height:0;overflow:auto}
      /* The relations board fills the page exactly: canvas grows, foot row keeps its height. */
      .st-mosaic-board{display:flex;flex-direction:column;gap:0;flex:1 1 auto;min-height:0}
      .st-mosaic-board .st-mosaic-focus{flex:none;margin:var(--st-space-8,8px) 0 0;padding:var(--st-space-12,12px) 0 0}
      .st-mosaic-band-content:has(> .st-mosaic-board){overflow:hidden;padding-bottom:0}
      /* A split page (概览 / 提案 / 流派) owns its own scrolling columns; letting the outer band
         scroll as well produced two scrollbars and a detail pane that could be scrolled away. */
      .st-mosaic-band-content:has(> .st-split){overflow:hidden}
      /* The canvas: a positioning context with a floor, and a WELL one layer below the sheet —
         a recessed fill and an inner hairline, so the cards visibly sit ON something. */
      .st-mosaic-canvas{position:relative;flex:1 1 auto;min-height:0;overflow:hidden;padding:0;
        border-radius:var(--st-radius-md,12px);
        background:transparent;
        box-shadow:none}
      /* The two selectors are the board's FOOT, above a hairline. No frame of their own — the
         panel's fields are borderless with a fill, and a box around a filled select is a box in
         a box. */
      .st-mosaic-focus{display:flex;flex-wrap:wrap;gap:var(--st-space-12,12px);align-items:center;
        margin:var(--st-board-inset) 0 0;padding:var(--st-board-inset) 0 0;border-top:none}
      .st-mosaic-focus-label{flex:none;font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-tertiary)}
      /* One picker: a framed field holding a button, and a list anchored to that field. The
         field is the positioning context, so the list opens UPWARD from it — the OS would open
         a native select upward over the control at the foot of a sheet; this direction is ours. */
      .st-mosaic-pick{position:relative;display:flex;gap:var(--st-space-8,8px);align-items:center;min-width:0;
        padding:var(--st-inset-xs) var(--st-inset-sm);border:1px solid var(--dsw-alias-border-l4,var(--st-fallback-border-l4));
        border-radius:var(--st-radius-sm,8px);corner-shape:round;background:var(--st-surface-high)}
      .st-mosaic-pick:focus-within{border-color:var(--st-accent)}
      .st-mosaic-pick-button{display:flex;align-items:center;gap:var(--st-space-4,4px);max-width:var(--st-picker-min-w,220px);min-width:0;
        padding:var(--st-space-2,2px) var(--st-space-4,4px);border:none;border-radius:var(--st-radius-xs,4px);corner-shape:round;background:transparent;
        color:var(--st-text-primary);font-family:inherit;
        font-size:var(--st-text-md);line-height:var(--st-text-md-leading);
        cursor:pointer;text-align:left;outline:none}
      .st-mosaic-pick-button:focus-visible{box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--st-focus-ink)}
      .st-mosaic-pick-value{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .st-mosaic-pick-list{position:absolute;z-index:var(--st-layer-menu);bottom:calc(100% + 4px);left:0;
        display:flex;flex-direction:column;min-width:100%;max-width:min(320px,calc(100vw - 48px));
        max-height:min(46vh,320px);overflow:auto;padding:var(--st-space-4,4px);
        border-radius:var(--st-radius-md,12px);corner-shape:round;background:var(--st-surface-high);
        box-shadow:var(--dsw-elevation-prominent,0 0 0 .5px rgba(0,0,0,.08),0 2px 8px rgba(0,0,0,.12));
        scrollbar-width:thin}
      .st-mosaic-pick-option{display:flex;align-items:center;width:100%;padding:var(--st-space-8,8px) var(--st-space-12,12px);border:none;
        border-radius:var(--st-radius-sm,8px);corner-shape:round;background:transparent;
        color:var(--st-text-primary);font-family:inherit;
        font-size:var(--st-text-md);line-height:var(--st-text-md-leading);
        cursor:pointer;text-align:left;outline:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .st-mosaic-pick-option:hover{background:var(--st-hover-fill)}
      .st-mosaic-pick-option[aria-checked="true"]{color:var(--st-text-primary);font-weight:var(--st-font-weight-strong);
        background:var(--st-selected-fill)}
      .st-mosaic-wires{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}
      /* The visible line reads the card border's own token — the same colour as the boxes it
         joins, in whichever theme is loaded. The border token is invisible on a dark theme, so
         a theme-specific hairline here drew nothing. */
      .st-mosaic-edge{stroke:var(--st-thread);stroke-width:var(--st-thread-w);stroke-linecap:round;
        stroke-opacity:1;pointer-events:none}
      /* The hit line: wide, transparent, takes the pointer. It carries hover for both lines via
         the adjacent-sibling combinator — the two lines are SIBLINGS, hit first, and a <line>
         cannot have children for a descendant combinator to find. */
      .st-mosaic-edge-hit{stroke:transparent;stroke-width:var(--st-edge-hit-w);pointer-events:stroke;cursor:pointer}
      .st-mosaic-edge-hit:hover + .st-mosaic-edge{stroke:var(--dsw-alias-label-primary,var(--st-fallback-ink-contrast));stroke-opacity:1}
      .st-mosaic-edge-picked{stroke:var(--st-thread);stroke-width:var(--st-thread-picked-w);stroke-opacity:1}
      .st-mosaic-edge-arrow{fill:var(--st-thread);pointer-events:none}
      .st-mosaic-edge-label{fill:var(--st-thread-ink);font-family:var(--st-font-family);font-size:var(--st-thread-label-size);
        font-weight:var(--st-font-weight-medium);paint-order:stroke;stroke:var(--st-board-wall);
        stroke-width:var(--st-thread-halo-w);stroke-linejoin:round;pointer-events:none;user-select:none}
      /* A card is a RAISED object on the board — its own shadow is what separates it from the
         wall behind it. The height is set, not grown from content: the wires are drawn from the
         same number (see CARD_H), and a card that sized itself to its name would move its own
         endpoints. */

`
