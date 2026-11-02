/**
 * One entity in full: the popover over the canvas, and the page that opens over it.
 *
 * Both are the same object read at two scales, so they share one layout grammar: a head, a
 * portrait beside its identifying facts, then sections stacked under a hairline. The page adds
 * the long prose and the relations; the popover is the quick read while the graph stays in view.
 */
export const CSS_ENTITY = `
      /* ---- the detail popover over the canvas ---- */
      .st-mosaic-detail{position:absolute;right:var(--st-board-inset);top:var(--st-board-inset);
        width:var(--st-detail-w);max-height:calc(100% - var(--st-board-inset) * 2);overflow:auto;
        display:flex;flex-direction:column;gap:var(--st-board-gap);
        border:var(--fang-hairline) solid var(--fang-ink-edge);border-radius:var(--fang-radius-lg,16px);corner-shape:round;
        background:var(--fang-surface);padding:var(--st-board-inset);z-index:var(--st-mosaic-z-detail);
        box-shadow:var(--fang-card-shadow-lift)}
      /* The head is a media row: picture on the left, the editable identity on the right. */
      .st-mosaic-detail-head{display:flex;align-items:flex-start;gap:var(--st-board-gap);min-width:0}
      .st-mosaic-detail-identity{display:flex;flex-direction:column;gap:var(--fang-padding-sm);
        flex:1 1 auto;min-width:0}
      /* The portrait keeps the board card's own shape, so a picture and its card read as one
         system rather than as two different crops of the same subject. */
      .st-mosaic-detail-portrait{position:relative;flex:none;
        width:var(--st-detail-portrait);aspect-ratio:var(--st-card-aspect,5 / 7);
        border-radius:var(--fang-radius-md,12px);corner-shape:round;overflow:hidden}
      .st-mosaic-detail-frame{width:100%;height:100%;overflow:hidden;
        border-radius:var(--fang-radius-md,12px);corner-shape:round;
        display:grid;place-items:center;
        background:var(--fang-surface-high);
        box-shadow:inset 0 0 0 var(--fang-hairline) var(--fang-ink-edge)}
      .st-mosaic-detail-frame img{width:100%;height:100%;object-fit:cover;display:block}
      .st-mosaic-detail-initial{user-select:none;font-weight:var(--fang-font-weight-strong);
        font-size:var(--fang-font-size-lg);line-height:1;
        color:var(--fang-ink-faint)}
      /* The picture button sits on the portrait's corner at the portrait's own scale: the glyph
         identifies it, so it reads as part of the card rather than as a button glued to it. */
      .st-mosaic-detail-generate{position:absolute;right:var(--fang-padding-xs);bottom:var(--fang-padding-xs);
        width:var(--st-generate-size);height:var(--st-generate-size);
        display:grid;place-items:center;padding:0;border:none;cursor:pointer;
        border-radius:var(--fang-radius-pill,999px);corner-shape:round;
        background:var(--fang-accent);
        color:var(--fang-on-accent,#fff);
        box-shadow:var(--dsw-shadow-lv2,0 4px 12px rgba(0,0,0,.02),0 2px 8px rgba(0,0,0,.04));
        transition:transform .12s var(--ds-ease-in-out,ease-in-out),opacity .12s}
      .st-mosaic-detail-generate:hover:not(:disabled){transform:scale(1.08)}
      .st-mosaic-detail-generate:disabled{cursor:progress;opacity:.75}
      .st-mosaic-detail-generate:focus-visible{outline:none;
        box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--fang-focus-ink)}
      /* Spinning while the model works: the one motion here, and the only signal that a click
         that takes seconds is still alive. */
      .st-mosaic-detail-generate[data-busy="true"] svg{animation:st-think-spin 1s linear infinite}
      .st-mosaic-detail-title{font-weight:var(--fang-font-weight-strong);flex:1;min-width:0;
        font-size:var(--fang-font-size-lg);line-height:var(--fang-line-height-lg);
        color:var(--fang-ink-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .st-mosaic-detail-close{flex:none;padding:0 var(--fang-padding-xs)}
      /* A section is a label over its content, never a two-column form: the label is a caption,
         and the field under it is the width of the panel. */
      .st-mosaic-detail-section{display:flex;flex-direction:column;gap:var(--fang-padding-xs);min-width:0}
      .st-mosaic-detail-label{font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);
        color:var(--fang-ink-tertiary);margin:0;
        display:flex;align-items:center;gap:var(--fang-padding-sm)}
      /* The editable fields in the panel: one rule, so the name, the role and the summary are the
         same control. Three different looks made it impossible to tell what could be typed in. */
      .st-mosaic-field{width:100%;box-sizing:border-box;font-family:inherit;
        font-size:var(--fang-font-size-md);line-height:var(--fang-line-height-md);
        padding:var(--fang-padding-xs) var(--fang-padding-sm);
        border:1px solid var(--fang-border-hair);border-radius:var(--fang-radius-sm,8px);
        background:var(--fang-surface);color:var(--fang-ink-primary);
        outline:none;resize:none}
      .st-mosaic-field:focus{border-color:var(--fang-accent)}
      /* The name is the panel's title, so it is set at title size and weight — but it is still an
         input, and it looks like one on focus so the writer can tell it can be changed. */
      .st-mosaic-field-title{font-size:var(--fang-font-size-lg);line-height:var(--fang-line-height-lg);
        font-weight:var(--fang-font-weight-strong);padding:var(--fang-padding-xs) var(--fang-padding-sm)}
      /* The textareas grow with their content up to a ceiling: a fixed rows count showed three
         lines of a summary that might be one or fifteen. */
      .st-mosaic-field-area{min-height:calc(var(--fang-row-height-compact,26px) * 2);max-height:var(--st-detail-area-max);
        scrollbar-width:thin;resize:none}
      /* Chips and the field that adds one, as one wrapped row: the plus belongs at the end of the
         list it extends, not on a line of its own below it. */
      .st-mosaic-chip-row{display:flex;flex-wrap:wrap;align-items:center;gap:var(--fang-padding-xs)}
      .st-mosaic-chip-row .st-mosaic-chip{margin:0}
      /* A generation that failed says so where the button was pressed. */
      .st-mosaic-detail-error{margin:0;padding:var(--fang-padding-sm);
        border-radius:var(--fang-radius-sm,8px);
        background:color-mix(in srgb, var(--dsw-alias-state-error-primary,#ec1313) 10%, transparent);
        color:var(--dsw-alias-state-error-primary,#ec1313);
        font-size:var(--fang-font-size-sm);line-height:1.55;
        overflow-wrap:anywhere}
      .st-mosaic-detail-row{display:flex;gap:var(--fang-padding-sm);align-items:baseline;flex-wrap:wrap;
        font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);
        color:var(--fang-ink-secondary)}
      .st-mosaic-detail-field-label{flex:none;width:var(--st-fact-label-w-compact);font-size:var(--fang-font-size-sm);
        line-height:var(--fang-line-height-sm);color:var(--fang-ink-tertiary)}
      .st-mosaic-detail-field-value{flex:1 1 auto;min-width:0;font-size:var(--fang-font-size-sm);
        line-height:var(--fang-line-height-sm);color:var(--fang-ink-primary);
        white-space:pre-wrap;word-break:break-word}
      .st-mosaic-detail-note{margin:0;font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-ui);
        color:var(--fang-ink-secondary);white-space:pre-wrap;word-break:break-word}
      .st-mosaic-detail-holder{font-weight:var(--fang-font-weight-medium);color:var(--fang-ink-primary)}
      .st-mosaic-detail-kind{flex:none}
      .st-mosaic-badge{flex:none;font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);
        padding:0 var(--fang-padding-sm);border-radius:var(--fang-radius-pill,999px);corner-shape:round;border:var(--fang-hairline) solid var(--fang-border-strong);
        color:var(--fang-ink-tertiary)}
      .st-mosaic-chip{display:inline-block;font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);
        padding:0 var(--fang-padding-sm);border-radius:var(--fang-radius-pill,999px);corner-shape:round;margin:0 var(--fang-padding-xs) var(--fang-padding-xs) 0;
        background:var(--fang-hover-fill);color:var(--fang-ink-tertiary)}
      /* The static pages: one plain card per entity on the world, cast and item pages. */
      .st-mosaic-page-card h4{margin:0 0 var(--fang-padding-xs);
        font-size:var(--fang-font-size-md);line-height:var(--fang-line-height-md);
        color:var(--fang-ink-primary)}
      .st-mosaic-page-card p{margin:0;
        font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);
        color:var(--fang-ink-secondary)}
      .st-mosaic-page-holder{font-weight:var(--fang-font-weight-medium);color:var(--fang-ink-primary);margin:0 0 var(--fang-padding-xs)}

      /* ---- the entity page: a left-side page, rounded on its open edge ---- */
      /* It stays a left-side panel, flush against the board's left edge: the board is the map you
         came from, and a page that floats away from the edge reads as a separate window. Only the
         right edge is rounded, the way a drawer is rounded on its inner side. */
      .st-mosaic-page{position:absolute;inset:0 auto 0 0;width:min(var(--fang-width-compact),86%);z-index:var(--st-mosaic-z-page);
        display:flex;flex-direction:column;min-height:0;
        background:var(--fang-surface);
        border-right:var(--fang-hairline) solid var(--fang-ink-edge);
        border-radius:0 var(--fang-radius-lg,16px) var(--fang-radius-lg,16px) 0;corner-shape:round;
        box-shadow:var(--fang-panel-shadow-right);
        overflow:hidden;
        animation:st-mosaic-page-in .18s var(--ds-ease-out,ease-out) both}
      /* Slide in from off the left edge and settle: the movement says the page is a layer over the
         board, not a replacement for it. With reduced motion the fade alone carries that. */
      @keyframes st-mosaic-page-in{
        from{transform:translateX(-100%);opacity:.4}
        60%{opacity:1}
        to{transform:translateX(0);opacity:1}}
      .st-mosaic-page[data-closing="true"]{animation:st-mosaic-page-out .16s var(--ds-ease-in,ease-in) both}
      @keyframes st-mosaic-page-out{
        from{transform:translateX(0);opacity:1}
        to{transform:translateX(-100%);opacity:0}}
      @media (prefers-reduced-motion: reduce){
        .st-mosaic-page{animation:st-mosaic-page-fade .12s linear both}
        .st-mosaic-page[data-closing="true"]{animation:st-mosaic-page-fade-out .12s linear both}
        @keyframes st-mosaic-page-fade{from{opacity:0}to{opacity:1}}
        @keyframes st-mosaic-page-fade-out{from{opacity:1}to{opacity:0}}
      }
      /* The head takes the same inset as the body, so the title and the first row start on one
         vertical line instead of the title sitting a few pixels further out. */
      .st-mosaic-page-head{display:flex;align-items:center;gap:var(--fang-padding-sm);
        padding:var(--st-board-inset-compact) var(--st-board-inset);flex:none;
        border-bottom:var(--fang-hairline) solid var(--fang-ink-hair)}
      .st-mosaic-page-title{margin:0;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
        font-size:var(--fang-font-size-lg);line-height:var(--fang-line-height-lg);
        font-weight:var(--fang-font-weight-strong);color:var(--fang-ink-primary)}
      .st-mosaic-page-head .st-mosaic-field{flex:1 1 auto;min-width:0;width:auto}
      .st-mosaic-page-scroll{flex:1 1 auto;min-height:0;overflow:auto;padding:var(--st-board-inset);
        display:flex;flex-direction:column;gap:var(--st-board-gap)}
      /* The summary band: picture left, identifying facts right. Both columns start at the top, so
         a short picture does not leave its facts floating in the middle. */
      .st-mosaic-page-summary{display:flex;gap:var(--st-board-inset);align-items:flex-start}
      .st-mosaic-page-image{flex:none;width:var(--st-page-portrait);min-width:0}
      .st-mosaic-page-image .st-mosaic-detail-portrait{
        width:100%;height:auto}
      .st-mosaic-page-image .st-mosaic-detail-frame{height:100%}
      .st-mosaic-page-image .st-mosaic-detail-initial{font-size:var(--fang-font-size-xl)}
      .st-mosaic-page-facts{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:var(--fang-padding-sm)}
      /* The brief facts beside the portrait are label-and-value on ONE line: a column of stacked
         labels would be as tall as the picture and read as a form. Only the prose fields below
         get the stacked label-over-value treatment. */
      .st-mosaic-page-facts .st-mosaic-page-row{display:flex;flex-direction:row;align-items:baseline;
        gap:var(--fang-padding-sm);min-width:0}
      .st-mosaic-page-facts .st-mosaic-page-label{flex:none;width:auto;min-width:var(--st-fact-label-w-compact);
        white-space:nowrap}
      .st-mosaic-page-facts .st-mosaic-page-value{flex:1 1 auto;min-width:0}
      .st-mosaic-page-facts .st-mosaic-field{flex:1 1 auto;width:auto;min-width:0}
      /* Every field is a label over its value, and the value WRAPS: this is the place the writer
         reads the full text, so it must not be clipped the way a card is. */
      .st-mosaic-page-row{display:flex;flex-direction:column;gap:var(--fang-padding-xs);min-width:0}
      .st-mosaic-page-label{flex:none;font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);
        color:var(--fang-ink-tertiary)}
      .st-mosaic-page-value{flex:1 1 auto;min-width:0;word-break:break-word;white-space:pre-wrap;
        font-size:var(--fang-font-size-md);line-height:var(--fang-line-height-ui);
        color:var(--fang-ink-primary)}
      /* An empty field keeps its line height: without this the label would sit alone on a zero-
         height row, which reads as a broken table rather than as a fact waiting to be filled. */
      .st-mosaic-page-value:empty{display:block;min-height:var(--fang-line-height-md)}
      /* The long-form half: one section per field, separated by a hairline, so the page has a
         reading rhythm instead of an undifferentiated stack of rows. The summary band above keeps
         its rows tight because they are identity, not prose. */
      .st-mosaic-page-body{display:flex;flex-direction:column;gap:0;min-width:0;
        border-top:var(--fang-hairline) solid var(--fang-ink-hair)}
      .st-mosaic-page-body>.st-mosaic-page-row{padding:var(--st-board-inset-compact) 0;
        border-bottom:var(--fang-hairline) solid var(--fang-ink-hair)}
      .st-mosaic-page-body>.st-mosaic-page-row:last-child{border-bottom:none;padding-bottom:0}
      .st-mosaic-page-edges{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:var(--fang-padding-xs)}
      /* One edge is a run of TEXT, not a row of boxes: name, kind and note flow inline and wrap
         naturally, so a long note continues at the same rhythm instead of breaking into pieces. */
      .st-mosaic-page-edge{font-size:var(--fang-font-size-md);line-height:var(--fang-line-height-ui);min-width:0}
      .st-mosaic-page-edge-other{font-weight:var(--fang-font-weight-medium);color:var(--fang-ink-primary);
        margin-right:var(--fang-padding-sm)}
      .st-mosaic-page-edge-kind{color:var(--fang-ink-secondary);
        margin-right:var(--fang-padding-sm)}
      .st-mosaic-page-edge-note{color:var(--fang-ink-tertiary)}

      .st-mosaic-detail-direction-section{gap:var(--fang-padding-xs)}
      .st-mosaic-detail-direction{display:flex;align-items:center;gap:var(--fang-space-8,8px);flex-wrap:wrap;
        font-size:var(--fang-font-size-md);line-height:var(--fang-line-height-md);color:var(--fang-ink-primary)}
      .st-mosaic-detail-party{display:inline-flex;align-items:baseline;gap:var(--fang-space-4,4px);min-width:0}
      .st-mosaic-detail-party-label{font-size:var(--fang-font-size-sm);color:var(--fang-ink-tertiary)}
      .st-mosaic-detail-direction-arrow{color:var(--st-thread);font-weight:var(--fang-font-weight-strong)}
`
