/**
 * Cards: on the canvas and in a gallery. One card shell, two uses.
 */
export const CSS_CARDS = `
      /* ---- a card on the canvas: the photo, the caption, and the wires between them ---- */
      /* THE CARD IS ITS PICTURE.
         The portrait fills the whole box — no inset, no inner border, no band with a frame around
         it — and the caption LIES OVER its lower half. That is what the writer asked for, and it
         is also what makes the card readable as a person rather than as a form: a framed thumbnail
         with a caption beneath it is a passport photo, and the wall was a grid of them.
         The card is padded by nothing: the picture runs to its own rounded edge. */
      .st-mosaic-card{position:absolute;box-sizing:border-box;
        width:var(--st-card-w,120px);height:var(--st-card-h,168px);
        padding:0;overflow:hidden;
        border:1px solid var(--fang-border-hair);border-radius:var(--fang-radius-md,12px);
        background:var(--fang-surface);cursor:grab;user-select:none;touch-action:none;
        box-shadow:var(--dsw-shadow-lv2,0 1px 2px rgba(0,0,0,.08),0 2px 8px rgba(0,0,0,.06));
        transition:box-shadow .12s ease}
      /* The picture: the card's whole box, cropped to fill it. No frame of its own — the card's
         own border is the only edge, which is why nothing here draws a second one. */
      .st-mosaic-card-photo{position:absolute;inset:0;overflow:hidden;
        display:grid;place-items:center;background:var(--fang-surface)}
      .st-mosaic-card-photo img{width:100%;height:100%;object-fit:cover;display:block}
      /* The initial is centred in the picture's VISIBLE half, not in the card.
         The picture fills the whole card and the caption covers the lower half, so centring the
         letter in the box put it exactly on the seam — half of it behind the scrim, which is what
         made a one-letter card look broken. It is offset up by a quarter of the card's height so it
         sits in the middle of the band that is actually seen. */
      /* The monogram on a card with no photograph yet. It is centred in the card — the caption
         band below is the same surface colour, so what the eye sees is a glyph centred in the
         open upper half — and it is large enough to read as a deliberate face-holder rather than
         as a stray character in a corner. The old upward offset belonged to the translucent
         scrim era and has nothing to push away from now. */
      .st-mosaic-card-photo .st-mosaic-card-initial{user-select:none;font-weight:var(--fang-font-weight-strong);
        font-size:calc(var(--fang-font-size-xl,20px) * 2);line-height:1;
        color:var(--fang-ink-faint)}
      /* The seam between the picture and the caption exists only when there IS a picture: on a
         plain card it is a line across an empty surface, cutting the card into two slabs. */
      /* The caption over the lower half of the picture, anchored to the BOTTOM edge. It covers
         exactly HALF the card, measured from its bottom edge — not "as much as its two lines
         need": a picture band on top and a caption band below is what makes every card in a
         wall break at the same line, where a content-sized caption left neighbours showing
         different amounts of picture and the wall looked ragged. The fraction is written
         against the card's own height so it follows --st-card-h instead of repeating a number
         that goes stale the next time the card is resized.
         A scrim under it is what keeps the title legible over an arbitrary photograph — without
         one, a pale picture made the name disappear and a busy one made it unreadable. */
      /* The band is exactly as tall as its text: by default two lines (name and identity), and
         it is NOT a fixed half of the card — a fixed half, filled opaquely, covered half of
         every photograph for the sake of one line of text. Hovering adds the introduction and
         the band grows for that one card alone. */
      .st-mosaic-card-caption{position:absolute;left:0;right:0;bottom:0;box-sizing:border-box;
        display:flex;flex-direction:column;justify-content:flex-end;gap:0;
        min-width:0;padding:var(--fang-padding-xs) var(--fang-padding-sm);
        /* OPAQUE, on the writer's instruction: the old scrim was a translucent black ramp that
           let the photograph ghost through under the text. The band is the card's own surface
           now; the hairline along its top edge — drawn only when a photograph is above it — is
           the boundary the ramp used to draw. */
        background:var(--fang-surface)}
      .st-mosaic-card:not(.st-mosaic-card-plain) .st-mosaic-card-caption{
        box-shadow:inset 0 var(--fang-hairline) 0 var(--fang-border-hair)}
      /* The ⋯ menu, in the card's top-right corner. It fades in with the card's hover on a wall
         where cards are the content, and stays out of the picture until then: a permanent glyph on
         every card in a grid of pictures is furniture. */
      .st-card-menu{position:absolute;top:var(--fang-padding-sm);right:var(--fang-padding-sm);
        z-index:var(--st-mosaic-z-card-menu);display:flex;flex-direction:column;align-items:flex-end}
      /* No fill and no ring until it is used: a dark pill behind the dots darkened the corner of
         every card and competed with the picture, so the three dots ARE the control.
         GREY, from the theme's own caption ink, and no shadow: the dots used to be white with a
         drop shadow to survive a photograph, which made them the brightest thing on a card whose
         picture is a placeholder. Quiet ink reads on both the empty field and a real image. */
      .st-card-menu-trigger{display:inline-flex;align-items:center;justify-content:center;
        width:var(--st-icon-menu-hit,20px);height:var(--st-icon-menu-hit,20px);padding:0;
        border:none;border-radius:var(--fang-radius-pill,999px);corner-shape:round;
        background:transparent;cursor:pointer;
        color:var(--fang-ink-tertiary);
        opacity:0;transition:opacity var(--ds-transition-duration-fast,.12s) var(--ds-ease-in-out,ease-in-out)}
      /* The three dots, stacked. Drawn as dots rather than as a glyph so they are identical in size
         and spacing on every card: a vertical ellipsis character spaces itself by the font.
         One pixel each — a menu affordance is a mark, not a button's worth of ink. */
      .st-card-menu-dots{display:flex;flex-direction:column;align-items:center;
        gap:var(--fang-space-2,2px)}
      .st-card-menu-dots>i{display:block;width:var(--st-icon-menu-dot,2px);height:var(--st-icon-menu-dot,2px);
        border-radius:var(--fang-radius-pill,999px);corner-shape:round;background:currentColor}
      .st-mosaic-page-card:hover .st-card-menu-trigger,
      .st-mosaic-card:hover .st-card-menu-trigger,
      .st-card-menu-trigger:focus-visible,
      .st-card-menu-trigger[aria-expanded="true"]{opacity:1}
      /* Hover brightens the DOTS, never the box: a fill appearing under the pointer is the same
         darkening the trigger was freed from, just later. */
      .st-card-menu-trigger:hover{opacity:1}
      .st-card-menu-trigger:hover{color:var(--fang-ink-primary)}
      .st-card-menu-trigger:focus-visible{outline:none;
        box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--fang-focus-ink)}
      /* The list opens to the LEFT of the corner so a card at the grid's right edge does not push
         its own menu off the wall. */
      .st-card-menu-list{position:absolute;top:calc(100% + 4px);right:0;z-index:var(--st-mosaic-z-card-menu-list);
        display:flex;flex-direction:column;min-width:var(--st-menu-min-w,120px);padding:var(--fang-space-8,8px);
        border-radius:var(--fang-radius-md,12px);corner-shape:round;background:var(--fang-surface-high);
        box-shadow:0 4px 16px rgba(0,0,0,.28)}
      /* Menu rows are TALL — generous vertical padding is what reads as airy; the type stays at
         the working step. */
      .st-card-menu-item{display:block;width:100%;padding:var(--fang-space-8,8px) var(--fang-space-12,12px);
        border:none;border-radius:var(--fang-radius-sm,8px);corner-shape:round;background:transparent;text-align:left;
        font-family:inherit;font-size:var(--fang-font-size-md);line-height:var(--fang-line-height-md);
        color:var(--fang-ink-primary);cursor:pointer}
      .st-card-menu-item:hover{background:var(--fang-hover-fill)}
      .st-card-menu-item.fang-danger{color:var(--dsw-alias-state-error-primary,#ec1313)}
      .st-card-menu-item.fang-danger:hover{background:var(--dsw-alias-state-error-primary,#ec1313);color:#fff}
      .st-mosaic-card:hover{box-shadow:var(--dsw-shadow-lv3,0 2px 4px rgba(0,0,0,.1),0 8px 20px rgba(0,0,0,.1))}
      .st-mosaic-card:active{cursor:grabbing}
      /* Both lines sit on the scrim, so both are chosen for a dark backing rather than for the
         theme's page: the label tokens would turn dark-on-dark in a light theme. The name takes
         the working step, not the title step — at the title step a two-line caption took most
         of the band and squeezed the picture — and the weight still separates it from the line
         under it. */
      .st-mosaic-card-name{display:block;font-weight:var(--fang-font-weight-strong);
        font-size:var(--fang-font-size-md);line-height:var(--fang-line-height-md);
        color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      /* The introduction, clamped to two lines. A writer's description can be a paragraph; the
         band is a fixed half of the card, so the text is what has to give. Two lines is enough for
         a sentence — which is what a card is for — and anything longer belongs in the popover. */
      /* The introduction appears only UNDER THE POINTER: by default the card shows its name and
         its identity line, and a wall of cards stays a wall of pictures — a paragraph on every
         card covered the photograph and made the board read as text. Reading the intro is a
         deliberate look at ONE card, which is exactly what a hover is. */
      .st-mosaic-card-intro{display:none;-webkit-line-clamp:2;-webkit-box-orient:vertical;
        overflow:hidden;margin-top:var(--fang-space-2,2px);
        font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);
        color:color-mix(in srgb, #fff 66%, transparent)}
      .st-mosaic-card:hover .st-mosaic-card-intro{display:-webkit-box}
      .st-mosaic-card-sub{display:block;
        font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);
        color:color-mix(in srgb, #fff 76%, transparent);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      /* The detail popover floats over the canvas's near corner: reading one card or one edge
         should not displace the others, and a ✕ plus an empty-canvas click both put it away.
         Its styles live in entity.css with the detail page it shares. */

      /* ---- the gallery: cards laid out as a page of objects, not as a map ---- */
      .st-mosaic-gallery{display:grid;gap:var(--st-board-gap);align-items:start;
        grid-template-columns:repeat(auto-fill,var(--st-gallery-w,184px));
        padding:var(--fang-space-2) 0 var(--st-board-gap)}
      /* Every dimension is pinned, and the height is a contract: a card with a two-line summary
         and a card with none are the same size, so a row of them is a grid rather than a jagged
         stack. Content that overflows is clipped here and read in full in the detail popover.
         A card is an OBJECT, so it is drawn as one: a raised surface with a soft, layered shadow
         rather than a flat rectangle with a hairline. The three shadows are the ones a real card
         casts — a tight contact shadow at the edge, a close ambient one, and a wide soft one — and
         each is mixed from the theme ink so it works on a light and a dark theme alike. The
         proportions are stated as parts rather than one total: the picture band and the text band
         each claim a fixed share of the same height, instead of the picture being squeezed by
         whatever the prose needed. */
      .st-mosaic-page-card{width:var(--st-gallery-w,184px);height:var(--st-gallery-h,258px);
        /* A card is a BUTTON, so the pointer says so. Without an explicit cursor the browser
           chooses one from the content underneath the pointer, and text meant to be readable got
           the I-beam that means "you may place a caret here" — which is not what clicking a card
           does. It also suppresses the text selection a drag across the gallery would start. */
        cursor:pointer;user-select:none;
        margin:0;padding:0;overflow:hidden;
        display:flex;flex-direction:column;flex:none;min-width:0;max-width:none;
        border:1px solid var(--fang-ink-edge);
        border-radius:var(--fang-radius-lg,16px);corner-shape:round;
        background:var(--fang-surface);
        box-shadow:var(--fang-card-shadow);
        transition:var(--fang-card-motion)}
      /* Hover lifts it a little and deepens the shadow: the card reads as pickable without moving
         far enough to disturb the row. The new-book tile is in this list because it is a cell of
         the same grid; it is not a gallery card, so its own class supplies the cursor and the
         transition, and only the appearance is shared. */
      .st-mosaic-page-card:hover,.st-book-add:hover{transform:translateY(-2px);
        border-color:var(--fang-ink-edge);
        box-shadow:var(--fang-card-shadow-lift)}
      /* The new-book tile while its own dialog is open: the accent edge and the lifted position,
         the pair the board's selected card uses to say "this one". Written AFTER the hover rule
         because it is the same specificity — above it, hovering the open tile would repaint the
         accent edge back to plain ink. The ring is an outline, not a box-shadow, so it does not
         fight the hover shadow for the same property. */
      .st-book-add[aria-expanded="true"]{transform:translateY(-2px);
        border-color:var(--fang-accent);
        outline:var(--dsw-focus-ring-width,2px) solid color-mix(in srgb, var(--fang-accent) 45%, transparent);
        outline-offset:0;
        color:var(--fang-ink-primary)}

      /* ---- the portrait band inside a card, and the page a card opens ---- */
      /* The picture's half, FIXED at 62% of the card, and neither half may grow or shrink: the
         text half was once flex 1 1 auto, so a long summary took height from the picture and
         the same card was a different shape depending on how much prose it held. Both halves
         are a stated share now, so the division is the same on every card and only the text
         INSIDE the lower half varies. 62% is what a trading card gives its art; the remaining
         38% holds the name and two lines. The band must be a box with a height of its own,
         because the picture inside it is sized as a share of that height — as a content-sized
         column the percentage had nothing to resolve against and the picture collapsed. A faint
         vertical wash in the band's background gives it depth even while it is empty, so the
         frame reads as a window rather than a blank panel. */
      .st-mosaic-portrait{position:relative;flex:0 0 62%;min-height:0;
        display:flex;flex-direction:column;gap:0;
        border-bottom:.5px solid var(--fang-ink-hair);
        background:
          linear-gradient(180deg,
            var(--fang-ink-whisper),
            transparent 60%),
          var(--fang-surface-high)}
      /* The frame FILLS its half. A percentage here as well applied the 62% twice — the picture
         ended up at 38% of the card and the name row took the rest of the picture's box. */
      .st-mosaic-portrait-frame{flex:1 1 auto;width:100%;display:block;overflow:hidden;min-height:0}
      .st-mosaic-portrait-frame img{width:100%;height:100%;object-fit:cover;display:block}
      /* The placeholder initial sits in a coin of its own: it reads as "a picture goes here" rather
         than as stray text, and it is quiet enough that a real image will clearly replace it. */
      .st-mosaic-portrait-initial{user-select:none;
        width:var(--fang-hit-target,44px);height:var(--fang-hit-target,44px);border-radius:var(--fang-radius-pill,999px);corner-shape:round;
        display:grid;place-items:center;
        font-size:var(--fang-font-size-lg);line-height:1;font-weight:var(--fang-font-weight-strong);
        color:var(--fang-ink-faint);
        background:color-mix(in srgb, var(--fang-surface) 70%, transparent);
        box-shadow:
          inset 0 0 0 .5px var(--fang-ink-edge),
          0 1px 2px var(--fang-ink-hair)}
      /* The caption line: the name, then the role beside it. The name carries the weight and the
         ink; the role is set quiet and set off by a small dot, so one line says who this is AND
         what they are without needing two rows. It is the text half's first line, not a band of
         its own — the half's height is what is fixed, not this row's. */
      .st-mosaic-portrait-hint{flex:none;padding:var(--fang-padding-sm) var(--fang-padding-md) 0;
        display:flex;align-items:baseline;justify-content:flex-start;
        gap:var(--fang-space-8,8px);flex-wrap:nowrap;box-sizing:border-box;min-width:0;
        font-size:var(--fang-font-size-lg);line-height:var(--fang-line-height-lg);font-weight:var(--fang-font-weight-strong);
        overflow:hidden;white-space:nowrap}
      /* Text shrinks to an ellipsis; the GAP between the two parts does not. The name gives way
         first (it is the longer field and the one with a fallback — the picture already shows its
         initial), and the role only gives way after it. A pinned flex-shrink on the gap stops
         a long line from squeezing the space between name and role down to nothing, which is what
         made two crowded words look like one run-on label. */
      .st-mosaic-portrait-name{min-width:0;flex:0 1 auto;overflow:hidden;text-overflow:ellipsis;
        white-space:nowrap;font-weight:var(--fang-font-weight-strong);color:var(--fang-ink-primary);
        font-size:var(--fang-font-size-lg);line-height:var(--fang-line-height-lg)}
      /* The subtitle, one step down from the title it sits beside. It inherited the title's size
         before, so a card read as two names of equal weight with a dot between them. */
      .st-mosaic-portrait-role{min-width:0;flex:0 1 auto;max-width:52%;overflow:hidden;text-overflow:ellipsis;
        white-space:nowrap;color:var(--fang-ink-tertiary);
        font-size:var(--fang-font-size-md);line-height:var(--fang-line-height-md);font-weight:var(--fang-font-weight-normal)}
      .st-mosaic-portrait-hint>*{flex-shrink:0}
      .st-mosaic-portrait-hint>.st-mosaic-portrait-name{flex-shrink:1}
      .st-mosaic-portrait-role::before{content:'·';margin-right:var(--fang-space-8,8px);opacity:var(--st-fade-quiet)}
      /* The description sits UNDER the picture, which is the reading order a card implies. */
      /* The description area takes exactly what is left after the picture and its caption, and
         clips: the card's outer height is the contract, so the body is the part that gives. */
      /* The detail page: a drawer from the LEFT INSIDE the sheet, over the board rather than
         beside it — the board stays where the writer left it and closing this returns to it.
         It comes in from the left edge because that is where the board's own navigation lives:
         a page you opened from a card arrives from the side you came from. */

      /* A BOOK card is the gallery card with a shorter body: the square cover and the identity
         line are the same, but there is no three-line summary under them — a book has a chapter
         count, not prose. The gallery's full height would leave most of the card empty, so a
         book card is as tall as its cover plus its caption plus its one line of meta. The height
         is written as those parts rather than as a number, so it follows the width token: the
         cover is square, the caption is a row height, and the meta line is one text line plus
         its padding. */
      .st-mosaic-page-card[data-kind="book"]{height:var(--st-book-card-h)}

      /* ---- the card body, and the chips a card can carry ---- */
      /* The caption's half, fixed at 38% of the card: title on top, body under it, and the body
         takes what the title leaves. Its first line is the summary — the sentence a reader needs
         to know what this card is — so the body is what gives when the text runs long, never the
         picture half above it. */
      .st-mosaic-card-text{flex:0 0 38%;min-height:0;overflow:hidden;
        display:flex;flex-direction:column;min-width:0}
      .st-mosaic-card-body{flex:1 1 auto;min-height:0;overflow:hidden;
        display:flex;flex-direction:column;gap:var(--fang-space-2,2px);
        padding:var(--fang-padding-xs) var(--fang-padding-md) var(--fang-padding-sm);min-width:0}
      /* Every text line in the card is one line: a name, a role, a holder. The summary is the one
         block allowed several, and it is capped so it cannot push the card taller. */
      .st-mosaic-card-body h4,.st-mosaic-card-body p{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin:0}
      .st-mosaic-card-body .st-mosaic-card-summary{white-space:normal;display:-webkit-box;
        -webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
      .st-mosaic-chips{margin-top:var(--fang-padding-xs)}
      .st-mosaic-empty{margin:0;
        font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);
        color:var(--fang-ink-tertiary)}
      /* The review flow on the relations page: a header row above the canvas holds the check and
         ask entries; the fetched proposal renders as one card per change below it. Each card
         keeps its edit fields, verdict buttons and evidence quote in one column; the bookmark
         badge counts what is still owed a verdict. */

      /* The relations wall treats a card as a PHOTOGRAPH, not a framed tile: no inner border,
         a raised paper shadow, a small stable tilt, and a metal pin at its top centre. The
         gallery keeps its framed object treatment; only the canvas gets this one. */
      .st-mosaic-canvas .st-mosaic-card-pinned{border:1px solid var(--fang-ink-edge);background:var(--fang-surface);
        border-radius:var(--fang-radius-sm,8px);
        box-shadow:0 1px 2px rgba(0,0,0,.34),0 8px 18px rgba(0,0,0,.28),0 18px 38px rgba(0,0,0,.2);
        transform:rotate(var(--st-card-tilt,0deg))}
      .st-mosaic-canvas .st-mosaic-card-pinned:hover{box-shadow:0 2px 4px rgba(0,0,0,.36),0 12px 24px rgba(0,0,0,.34),0 24px 48px rgba(0,0,0,.24)}
      .st-mosaic-canvas .st-mosaic-card-pinned.st-mosaic-card-plain{background:var(--fang-surface)}
      .st-mosaic-canvas .st-mosaic-card-pinned .st-mosaic-card-photo{border-radius:var(--fang-radius-sm,8px)}
      .st-mosaic-card-pin{display:none}
      .st-mosaic-card-pinned .st-mosaic-card-pin{display:block;position:absolute;z-index:var(--st-mosaic-z-card-pin);
        left:50%;top:var(--st-card-pin-y,12px);width:var(--st-pin-size);height:var(--st-pin-size);
        transform:translate(-50%,-50%);border-radius:var(--fang-radius-pill);corner-shape:round;
        background:var(--st-pin-metal);box-shadow:var(--st-pin-shadow);pointer-events:none}
`
