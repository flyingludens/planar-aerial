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
      .st-library{flex:1 1 auto;min-height:0;overflow:auto;padding:var(--fang-space-8,8px) var(--fang-frame-gutter) var(--fang-space-24,24px)}
      /* The head carries .fang-titlebar (the titlebar row recipe): divider, paddings and the
         leading clearance all come from there. What is local: the gap to the grid below, and
         the min-width floor for the truncating title. */
      .st-library-head{margin-bottom:var(--fang-space-16,16px);min-width:0}
      .st-library-title{margin:0;font-size:var(--fang-font-size-xl);line-height:var(--fang-line-height-xl);font-weight:var(--fang-font-weight-strong);color:var(--fang-ink-primary)}
      /* The shelf's cards ARE the board's gallery cards: one component, one size, one set of
         shadows, so the two places the writer browses look like one system. What is left here is
         the part a gallery card does not provide — the two inline editors and the body inside a
         card. Shadows are mixed from the theme ink rather than written as black: a literal rgba
         shadow is invisible on a dark theme, which is exactly how the old shelf card disappeared. */
      .st-book-card{display:flex;flex-direction:column;gap:var(--fang-space-4,4px);padding:var(--fang-space-16,16px) var(--fang-space-16,16px);text-align:left;
        font-family:inherit;
        border:var(--fang-hairline) solid var(--fang-ink-edge);
        border-radius:var(--fang-radius-lg,16px);background:var(--fang-surface);color:var(--fang-ink-primary);
        /* The shared card recipe: a book and a character sit at the same height because they read
           the same two tokens, not because two rules were written to agree. */
        box-shadow:var(--fang-card-shadow);
        /* The hovered card lifts, like every other card in the panel: the row of covers reads as
           pickable objects rather than as text tiles. */
        transition:var(--fang-card-motion)}
      .st-book-card:hover{transform:translateY(-2px);box-shadow:var(--fang-card-shadow-lift)}
      .st-book-meta{font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);color:var(--fang-ink-secondary)}
      /* The two trailing tiles are CARDS, not buttons: same width, same radius, same dashed edge as
         a book card, so the last cell of the grid lines up with the ones before it. A fluid-width
         tile in a fixed-width grid was visibly a different size — the thing the writer pointed at. */
      .st-book-new{width:var(--st-gallery-w);box-sizing:border-box;
        /* The same height as a book card, for the same reason: the grid's last cell is a card too. */
        height:var(--st-book-card-h);
        align-items:center;justify-content:center;text-align:center;
        border-style:dashed;color:var(--fang-ink-secondary)}
      .st-book-plus{font-size:var(--fang-font-size-xl);line-height:1;font-weight:var(--fang-font-weight-normal)}
      /* The new-book tile is the only CONTROL in the shelf grid, and it is a real <button>. Two
         things follow from that and neither was written down: a button does not get a hand cursor
         by default, and st-book-card carries no state motion, so the tile sat perfectly still
         while every book beside it lifted under the pointer. That stillness is what read as "this
         one is not a card you can pick". The lift itself is NOT redefined here — the tile is
         grouped into the gallery card's hover rule, so there is one recipe for the whole grid. */
      .st-book-add{cursor:pointer;transition:var(--fang-card-motion)}
      /* The ring is an OUTLINE, not a box-shadow. The hover state further down the sheet paints a
         box-shadow, and a focus ring written the same way would lose to it — same specificity, and
         the hover rule comes later. Outline lives on its own channel, so focus stays visible while
         the pointer is over the tile. */
      .st-book-add:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--fang-focus-ink);
        outline-offset:var(--fang-space-2,2px)}
      /* Pressing settles it back down. Written as :hover:active rather than :active so it beats the
         hover rule above on specificity instead of relying on source order. */
      .st-book-add:hover:active{transform:none}
      /* A form that happens to sit in the grid: same footprint as a tile, laid out as a column of
         controls rather than centred as a label. */
      .st-book-form{justify-content:flex-start;align-items:stretch;text-align:left}
      /* The click target inside a card. It is a div, not a button: the gallery card around it is
         already the button, and a button inside a button is invalid markup that browsers resolve
         by ignoring one of the two. */
      .st-book-open{display:flex;flex-direction:column;gap:var(--fang-space-4,4px);flex:1 1 auto;min-width:0;
        background:none;border:none;padding:0;text-align:left;font-family:inherit;color:inherit;cursor:pointer}
      /* A labelled field inside a dialog: the label sits above its control, one line of small text. */
      .st-dialog-field{display:flex;flex-direction:column;gap:var(--fang-space-4,4px);min-width:0}
      /* A segmented control is a compact choice, not a full-width field. As a flex child of the
         column it would otherwise stretch to the dialog's width and look like a text input. */
      .st-dialog-field>.fang-segmented{align-self:flex-start}
      .st-dialog-label{font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);
        color:var(--fang-ink-tertiary)}
      .st-dialog-textarea{min-height:var(--st-dialog-textarea-min-h);resize:none;font-family:inherit}
      .st-dialog-error{margin:0;color:var(--dsw-alias-state-warn-primary,#f59e0b)}
      .st-dialog-hint{font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);color:var(--fang-ink-tertiary)}
      .st-check{display:flex;align-items:center;gap:var(--fang-space-8,8px);font-size:var(--fang-font-size-md);cursor:pointer;
        color:var(--fang-ink-primary)}
      /* A bottom sheet: slides up over the manuscript, rounded on its top corners only, which is
         what makes it read as "coming from the edge" rather than as a floating dialog. */
      /* The panel renders inside the host's centre column, which has overflow: hidden, so a fixed
         overlay gets clipped and the sheet shows as a narrow strip in the wrong place. Positioning
         it absolute against the panel shell covers exactly the panel, which is the surface a modal
         belongs to anyway. */
`
