/**
 * The shelf: the grid of book covers, and the dialogs that open over it.
 */
export const CSS_LIBRARY = `
      /* ---- the library: the shelf of books, and the dialogs over it ---- */
      /* The welcome page is a DOT CANVAS, the way a design tool's empty state is: the lattice
         says "work surface, not document", and a second, brighter dot layer is revealed in a
         circle around the pointer, so the field answers the mouse. The bright layer is the same
         lattice in stronger ink, masked to a position the component writes into CSS variables
         on pointermove. */
      .st-canvas{position:relative;
        background-image:radial-gradient(var(--st-canvas-dot) var(--st-canvas-dot-size), transparent 0);
        background-size:var(--st-canvas-grid) var(--st-canvas-grid)}
      .st-canvas::before{content:'';position:absolute;inset:0;pointer-events:none;
        background-image:radial-gradient(var(--st-canvas-dot-bright) var(--st-canvas-dot-size), transparent 0);
        background-size:var(--st-canvas-grid) var(--st-canvas-grid);
        -webkit-mask-image:radial-gradient(circle var(--st-canvas-glow) at var(--st-pointer-x,-999px) var(--st-pointer-y,-999px), #000, transparent);
        mask-image:radial-gradient(circle var(--st-canvas-glow) at var(--st-pointer-x,-999px) var(--st-pointer-y,-999px), #000, transparent)}
      .st-library{flex:1 1 auto;min-height:0;overflow:auto;padding:var(--st-space-8,8px) var(--st-shelf-gutter) var(--st-space-24,24px)}
      /* The head carries .st-titlebar (the titlebar row recipe): divider, paddings and the
         leading clearance all come from there. What is local: the gap to the grid below, and
         the min-width floor for the truncating title. */
      .st-library-head{margin-bottom:var(--st-space-16,16px);min-width:0}
      .st-library-title{margin:0;font-size:var(--st-text-xl);line-height:var(--st-text-xl-leading);font-weight:var(--st-font-weight-strong);color:var(--st-text-primary)}
      /* The shelf's cards ARE the board's gallery cards: one component, one size, one set of
         shadows, so the two places the writer browses look like one system. What is left here is
         the part a gallery card does not provide — the two inline editors and the body inside a
         card. Shadows are mixed from the theme ink rather than written as black: a literal rgba
         shadow is invisible on a dark theme, which is exactly how the old shelf card disappeared. */
      .st-book-card{display:flex;flex-direction:column;gap:var(--st-space-4,4px);padding:var(--st-space-16,16px) var(--st-space-16,16px);text-align:left;
        font-family:inherit;
        border:var(--st-hairline) solid var(--st-ink-edge);
        border-radius:var(--st-radius-lg,16px);background:var(--st-surface);color:var(--st-text-primary);
        /* The shared card recipe: a book and a character sit at the same height because they read
           the same two tokens, not because two rules were written to agree. */
        box-shadow:var(--st-card-shadow);
        /* The hovered card lifts, like every other card in the panel: the row of covers reads as
           pickable objects rather than as text tiles. */
        transition:var(--st-card-motion)}
      .st-book-card:hover{transform:translateY(-2px);box-shadow:var(--st-card-shadow-lift)}
      .st-book-meta{font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);color:var(--st-text-secondary)}
      /* The two trailing tiles are CARDS, not buttons: same width, same radius, same dashed edge as
         a book card, so the last cell of the grid lines up with the ones before it. A fluid-width
         tile in a fixed-width grid was visibly a different size — the thing the writer pointed at. */
      .st-book-new{width:var(--st-gallery-w);box-sizing:border-box;
        /* The same height as a book card, for the same reason: the grid's last cell is a card too. */
        height:var(--st-book-card-h);
        align-items:center;justify-content:center;text-align:center;
        border-style:dashed;color:var(--st-text-secondary)}
      .st-book-plus{font-size:var(--st-text-xl);line-height:1;font-weight:var(--st-font-weight-normal)}
      /* The new-book tile is the only CONTROL in the shelf grid, and it is a real <button>. Two
         things follow from that and neither was written down: a button does not get a hand cursor
         by default, and st-book-card carries no state motion, so the tile sat perfectly still
         while every book beside it lifted under the pointer. That stillness is what read as "this
         one is not a card you can pick". The lift itself is NOT redefined here — the tile is
         grouped into the gallery card's hover rule, so there is one recipe for the whole grid. */
      .st-book-add{cursor:pointer;transition:var(--st-card-motion)}
      /* The ring is an OUTLINE, not a box-shadow. The hover state further down the sheet paints a
         box-shadow, and a focus ring written the same way would lose to it — same specificity, and
         the hover rule comes later. Outline lives on its own channel, so focus stays visible while
         the pointer is over the tile. */
      .st-book-add:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--st-focus-ink);
        outline-offset:var(--st-space-2,2px)}
      /* Pressing settles it back down. Written as :hover:active rather than :active so it beats the
         hover rule above on specificity instead of relying on source order. */
      .st-book-add:hover:active{transform:none}
      /* A form that happens to sit in the grid: same footprint as a tile, laid out as a column of
         controls rather than centred as a label. */
      .st-book-form{justify-content:flex-start;align-items:stretch;text-align:left}
      /* The click target inside a card. It is a div, not a button: the gallery card around it is
         already the button, and a button inside a button is invalid markup that browsers resolve
         by ignoring one of the two. */
      .st-book-open{display:flex;flex-direction:column;gap:var(--st-space-4,4px);flex:1 1 auto;min-width:0;
        background:none;border:none;padding:0;text-align:left;font-family:inherit;color:inherit;cursor:pointer}
      /* A real modal: the whole panel is dimmed and the question sits in a rounded card. */
      /* A dialog is centred on the PANEL, which is the surface it belongs to.
         It was fixed-positioned, and that means "the viewport" — but this panel is one occupant
         of the host's centre column, and that column clips its contents. A fixed overlay inside
         a clipped ancestor is still clipped by it, and is placed against the viewport rather than
         against the panel, so the card sat off-centre and its edges were cut. This panel's own
         sidebar comment already records the same lesson for the drawer; the dialogs had not
         learned it.
         Absolute, against the nearest positioned ancestor — the shell — centres on exactly the
         box the writer is looking at, and is not clipped by anything above it. */
      .fang-backdrop{position:absolute;inset:0;z-index:var(--st-layer-modal);display:flex;align-items:center;justify-content:center;
        padding:var(--st-space-24,24px);background:color-mix(in srgb, var(--dsw-alias-bg-base,var(--st-fallback-page)) 62%, transparent);
        backdrop-filter:blur(2px)}
      .fang-dialog{width:min(var(--st-dialog-w),100%);display:flex;flex-direction:column;gap:var(--st-inset-md);padding:var(--st-inset-xl);
        border-radius:var(--st-radius-panel,28px);corner-shape:round;border:var(--st-hairline) solid var(--dsw-alias-border-l3,var(--st-fallback-border-l3));
        background:var(--st-surface-high);box-shadow:var(--dsw-shadow-lv2,0 4px 12px rgba(0,0,0,.02),0 2px 8px rgba(0,0,0,.04));
        font-family:var(--st-font-family);font-size:var(--st-text-md);line-height:var(--st-line-height-ui);color:var(--st-text-primary)}
      .fang-dialog-title{font-size:var(--st-text-lg);line-height:var(--st-text-lg-leading);font-weight:var(--st-font-weight-strong)}
      /* A reading dialog: a fixed head with the close control, and a body that scrolls. The panel
         caps its height so a long manuscript stays one dialog rather than one very tall page. */
      .fang-dialog-panel{max-height:min(84vh,var(--st-dialog-max-h))}
      .fang-dialog-head{display:flex;align-items:center;gap:var(--st-space-8,8px);flex:none}
      .fang-dialog-scroll{flex:1 1 auto;min-height:0;overflow:auto}
      .fang-dialog-body{display:flex;flex-direction:column;gap:var(--st-space-8,8px);color:var(--st-text-secondary)}
      /* A labelled field inside a dialog: the label sits above its control, one line of small text. */
      .st-dialog-field{display:flex;flex-direction:column;gap:var(--st-space-4,4px);min-width:0}
      /* A segmented control is a compact choice, not a full-width field. As a flex child of the
         column it would otherwise stretch to the dialog's width and look like a text input. */
      .st-dialog-field>.fang-segmented{align-self:flex-start}
      .st-dialog-label{font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-tertiary)}
      .st-dialog-textarea{min-height:var(--st-dialog-textarea-min-h);resize:none;font-family:inherit}
      .st-dialog-error{margin:0;color:var(--dsw-alias-state-warn-primary,var(--st-fallback-warn))}
      .st-dialog-hint{font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);color:var(--st-text-tertiary)}
      .fang-dialog-actions{display:flex;justify-content:flex-end;gap:var(--st-space-8,8px);margin-top:var(--st-space-4,4px)}
      .st-check{display:flex;align-items:center;gap:var(--st-space-8,8px);font-size:var(--st-text-md);cursor:pointer;
        color:var(--st-text-primary)}
      /* A bottom sheet: slides up over the manuscript, rounded on its top corners only, which is
         what makes it read as "coming from the edge" rather than as a floating dialog. */
      /* The panel renders inside the host's centre column, which has overflow: hidden, so a fixed
         overlay gets clipped and the sheet shows as a narrow strip in the wrong place. Positioning
         it absolute against the panel shell covers exactly the panel, which is the surface a modal
         belongs to anyway. */
`
