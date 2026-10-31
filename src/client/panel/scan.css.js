/**
 * A section scan: the row of actions a proposal offers, and the findings list.
 */
export const CSS_SCAN = `
      /* ---- the action row under a proposal, and a section scan ---- */
      .st-dock-act{font-family:inherit;font-size:var(--st-text-md);line-height:var(--st-text-md-leading);
        padding:var(--st-space-4,4px) var(--st-space-12,12px);
        border:none;border-radius:var(--st-radius-sm,8px);background:transparent;
        color:var(--st-text-secondary);cursor:pointer;corner-shape:round;}
      .st-dock-act:hover{background:var(--st-hover-fill);color:var(--st-text-primary)}
      .st-dock-act:focus-visible{box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--st-focus-ink);outline:none}
      .st-dock-act-primary{color:var(--st-accent);font-weight:var(--st-font-weight-medium)}
      .st-dock-act-primary:hover{color:var(--st-accent)}
      .st-dock-act-quiet{color:var(--st-text-tertiary);margin-left:auto}

      /* ---- a section scan: a copy-edit, or a grammar critique ----
         Interface type, not the manuscript's: these are notes ABOUT the text, and setting them in
         the same size and leading as the prose made a list of findings read like a chapter. The
         dock's shared surface, radius and elevation still apply — only the type changes. */
      .st-ai-dock[data-kind="scan"]{gap:var(--st-space-12,12px);padding:var(--st-space-16,16px) var(--st-space-16,16px) var(--st-space-12,12px);
        font-family:inherit;font-size:var(--st-text-md);line-height:var(--st-line-height-ui)}
      .st-scan{display:flex;flex-direction:column;gap:var(--st-space-12,12px);min-width:0}
      .st-scan-head{display:flex;align-items:center;gap:var(--st-space-8,8px);min-width:0}
      .st-scan-title{font-size:var(--st-text-md);line-height:var(--st-text-md-leading);font-weight:var(--st-font-weight-medium);color:var(--st-text-primary)}
      .st-scan-count{font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);color:var(--st-text-tertiary);
        font-variant-numeric:tabular-nums}
      /* The list scrolls, the header and the footer do not: a dozen findings would otherwise push
         the manuscript out of view, and the way to close a scan would be off the bottom of it. */
      .st-scan-list{display:flex;flex-direction:column;min-width:0;
        max-height:min(46vh,440px);overflow:auto;scrollbar-width:thin;
        scrollbar-color:var(--dsw-alias-scrollbar-bg-l2,var(--st-fallback-scrollbar)) transparent}
      /* Rules between rows, none above the first: the list is one block of related findings, and a
         box around each of them would read as a table of separate things. */
      .st-scan-row{padding:var(--st-space-8,8px) 0;border-top:.5px solid var(--dsw-alias-border-l3,var(--st-fallback-border-l3));min-width:0}
      .st-scan-row:first-child{border-top:none;padding-top:0}
      .st-scan-row:last-child{padding-bottom:0}
      .st-scan-row-head{display:flex;align-items:baseline;gap:var(--st-space-8,8px);min-width:0;margin-bottom:var(--st-space-2,2px)}
      /* The kind of problem, as a quiet chip in the theme's own colour. */
      .st-scan-tag{flex:none;font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);padding:0 var(--st-space-8,8px);border-radius:var(--st-radius-pill,999px);corner-shape:round;
        background:color-mix(in srgb, var(--st-accent) 14%, transparent);color:var(--st-accent)}
      /* Where it is. On one line: the quote can be a whole sentence and a wrapped quote buried the
         finding it was pointing at. The full text is still in the tooltip. */
      .st-scan-what{color:var(--st-text-primary);white-space:pre-wrap;word-break:break-word}
      /* The correction: a different thing from the complaint, so a different colour and an arrow
         rather than a second sentence in the same tone. */
      .st-scan-fix{margin-top:var(--st-space-2,2px);color:var(--st-text-secondary);
        white-space:pre-wrap;word-break:break-word}
      .st-scan-arrow{color:var(--st-accent);margin-right:var(--st-space-4,4px)}
      .st-scan-empty{color:var(--st-text-tertiary)}
      .st-scan-foot{display:flex;align-items:center;gap:var(--st-space-4,4px);flex:none}
      /* The critique's verdict: the overall judgement the points then back up. Prose, but set
         slightly quieter than the list, because the list is the actionable half. */
      .st-critique-verdict{color:var(--st-text-secondary);white-space:pre-wrap;
        word-break:break-word;padding:var(--st-space-2,2px) 0 var(--st-space-4,4px)}
      /* The steer: a chevron-labelled toggle that opens a one-line input. Flat like every other
         control in the dock; the chevron rotates the way the session chip's does. */
      /* The steer: a chevron that opens a small popover ABOVE its row. Absolutely positioned, so
         opening it never reflows the row it belongs to — the buttons stay exactly where they were. */
      /* NOT positioned: the input it opens is anchored to the action row above it, so a containing
         block here would shrink it back to the chevron's 20px. Static is what makes the nearest
         positioned ancestor — the action row — the one that counts. */
      /* Not positioned: the field it opens is laid out against the action row, so a containing
         block here would shrink it back to the chevron's own width. */
      .st-scan-steer{position:static;display:inline-flex;min-width:0}
.st-scan-steer-toggle{display:inline-flex;align-items:center;gap:var(--st-space-2,2px);font-family:inherit;
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);padding:var(--st-space-2,2px) var(--st-space-8,8px);border:none;border-radius:var(--st-radius-sm,8px);
        background:transparent;color:var(--st-text-tertiary);cursor:pointer;white-space:nowrap;corner-shape:round;}
      .st-scan-steer-toggle:hover{background:var(--st-hover-fill);
        color:var(--st-text-primary)}
      .st-scan-steer-toggle:focus-visible{outline:none;
        box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--st-focus-ink)}
      /* A normal flex item in the row, right after the chevron — not a popover.
         A floating box has to be told where to sit and how wide to be, and both answers depend on a
         layout it cannot see; in the flow it takes the room the row has left over and the row's own
         flex layout decides which control it stops before.
         Its vertical padding is the row's shared one, so the field is the height of the buttons
         beside it: a taller field would push the row open and shift everything above it. */
      .st-scan-steer-input{flex:1 1 auto;min-width:0;
        padding-top:var(--st-space-4,4px);padding-bottom:var(--st-space-4,4px);
        line-height:var(--st-text-md-leading)}

/* The retry group in the rewrite dock: button and chevron read as one control, so they sit
         in a flat pill with no seam between them.
         Each half is rounded only on its OUTER edge, which is what makes the pair read as one pill:
         a hovered half paints a shape with the pill's own corner on the outside and a straight edge
         at the seam, so the two halves always line up.
         The group must not clip: the field it opens is a child of it, and overflow: hidden here would
         cut that field off. */
      .st-retry-group{display:inline-flex;align-items:center;gap:0;
        border-radius:var(--st-radius-sm,8px);corner-shape:round;}
      /* When the steer field is open it is a CHILD of this group but must take part in the row's
         layout, not the group's. Contents makes the group generate no box: the retry button, the
         chevron and the field become siblings of 放弃, and the row's flex layout hands the field the
         leftover room — so it can never sit on top of anything. */
      .st-retry-group:has(.st-scan-steer-input){display:contents}
/* The half-rounding is on the ELEMENTS, not on the container, so it survives the container
         dissolving into display: contents. One rule each, no open/closed variants to keep in step. */
      .st-retry-group .st-dock-act{border-radius:var(--st-radius-sm,8px) 0 0 var(--st-radius-sm,8px);corner-shape:round;}
/* The chevron carries the same type and the same vertical padding as 重试 beside it, which is
         what makes the pair one pill: at its own 12/18 metrics it stood 22px against the button's
         28px and read as a small tag stuck to a tall button. The metric comes from the shared row
         variable, so the two cannot drift apart again. */
      .st-retry-group .st-scan-steer-toggle{border-radius:0 var(--st-radius-sm,8px) var(--st-radius-sm,8px) 0;
        font-size:var(--st-text-md);
        line-height:var(--st-text-md-leading);
        padding:var(--st-space-4,4px) var(--st-space-8,8px);corner-shape:round;}
      /* The model page: one row per role, the chip on the right where the composer puts it. */
`
