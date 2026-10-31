/**
 * The one read-out line at the bottom, and the card it opens.
 */
export const CSS_STATUS = `
      /* ---- the status bar: one read-out line, and the card it opens ---- */
      .st-statusbar{flex:0 0 auto;display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);position:relative;
        align-items:center;gap:var(--st-space-12,12px);
        height:var(--st-statusbar-h,30px);padding:0 var(--st-space-16,16px);
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);color:var(--st-text-tertiary);
        border:none;background:var(--st-bg);
        white-space:nowrap;overflow:visible}
      /* The read-out is one cell of the grid: it stays centred between the corner slot and an
         empty balancing column. */
      /* The row itself does NOT clip: a popup hangs inside it now, and clipping the row is what made
         the model card disappear. Only the two text items, which are the ones that can overflow,
         keep their ellipsis. */
      .st-status-run{grid-column:2;display:flex;align-items:center;gap:var(--st-space-8,8px);min-width:0;overflow:visible}
      .st-status-run .st-status-item,
      .st-status-run .st-status-name,
      .st-status-run .st-status-count{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .st-status-item{overflow:hidden;text-overflow:ellipsis;min-width:0}
      /* Notices live at the bottom-left corner, whatever else the bar is reporting.
         Every hint and error used to be rendered where it happened — inside the dock, above the
         shelf, at the top of a drawer — so the same kind of message appeared in five different
         places and none of them was where the writer was looking. One corner, one place to read.
         Positioned rather than flowed in: the read-out in the middle is centred, and adding a
         flowing item would push it off centre every time a message appeared. */
      .st-status-notice{grid-column:1;justify-self:start;min-width:0;max-width:100%;
        overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left}
      .st-status-notice[data-tone="error"]{color:var(--dsw-alias-state-error-primary,var(--st-fallback-error))}
      .st-status-notice[data-tone="warn"]{color:var(--dsw-alias-state-warn-primary,var(--st-fallback-warn))}
      .st-status-notice[data-tone="info"]{color:var(--st-text-tertiary)}
      .st-status-sep{opacity:.45}
      /* No spacer: with everything centred, the save state and the model sit in the same run as
         the counts instead of being pushed to opposite ends. */
      .st-status-spacer{display:none}
      .st-status-key{color:var(--st-text-tertiary);margin-right:var(--st-space-4,4px)}
      /* The model cell is a control now, so it looks like one without shouting: it inherits the
         read-out's type, gains a pointer, and shows a pressed state while its card is open. */
      .st-status-model{border:none;background:none;padding:0 var(--st-space-4,4px);margin:0 -4px;font:inherit;
        color:inherit;cursor:pointer;border-radius:var(--st-radius-xs,4px);corner-shape:round;text-align:left}
      .st-status-model:hover{background:var(--st-hover-fill)}
      .st-status-model[data-open="true"]{background:var(--st-selected-fill);
        color:var(--st-text-primary)}
      .st-status-model:focus-visible{outline:none;
        box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--st-focus-ink)}
      /* The button and its card, as one unit. Inline-flex so the box is exactly the button's own
         size — that is what makes left:50% below mean "half the button's width". Positioned, so it
         is the card's containing block, and explicitly NOT overflow: hidden, which would clip the
         card that hangs above it. */
      .st-status-model-slot{position:relative;display:inline-flex;min-width:0}
      /* Above the button and centred on it. It floats over the page rather than pushing the
         read-out sideways: the bar's height is what the editor measures.
         ABSOLUTE against the slot, never fixed against the window: the panel lives inside the
         host's centre column, so the window edge is not the panel edge.
         Centring is CSS on both sides — left:50% is half the button, translateX(-50%) is half the
         card. Neither width is known in advance and neither has to be: the browser measures both. */
      /* The card exists to be READ, so it is sized to its content up to a generous cap. It was once
         capped against the bar's width, which on a narrow window squeezed the model names into
         "agnes /…" — a detail card that hides the detail. */
      .st-status-pop{position:absolute;z-index:var(--st-layer-status);
        left:50%;bottom:calc(100% + 6px);transform:translateX(-50%);
        width:max-content;
        min-width:var(--st-status-menu-min-w,240px);max-width:min(360px,calc(100vw - 48px));
        box-sizing:border-box;padding:var(--st-space-12,12px) var(--st-space-12,12px);
        /* The card must LOOK like a card. It used to take the theme's raised layer, which in the
           dark theme is a shade off the page it floats over: the text arrived with no visible
           edge, so the only way to judge where the card was is the last character of the longest
           line — which reads as "the card is not centred on its button" no matter where it sits.
           A surface this small needs a boundary, not a shadow, so it gets a fill of its own plus a
           hairline and a rim of light along the top edge. */
        background:var(--st-surface-high);
        color:var(--dsw-alias-label-primary,var(--st-fallback-ink-contrast));
        border:.5px solid var(--dsw-alias-border-l3,#ffffff2e);
        border-radius:var(--st-radius-md,12px);corner-shape:round;
        box-shadow:var(--dsw-shadow-lv3,0 8px 24px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)),
          inset 0 1px 0 0 var(--dsw-alias-border-l2,#ffffff17);
        display:flex;flex-direction:column;gap:var(--st-space-4,4px);
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading)}
      .st-status-pop-row{display:flex;gap:var(--st-space-8,8px);align-items:baseline;min-width:0}
      .st-status-pop-role{flex:none;white-space:nowrap;color:var(--st-text-tertiary)}
      /* Full name, wrapped if it must be. The ellipsis belongs to the BAR — a one-line read-out — not
         to the card that is opened specifically to show what the bar had to shorten. */
      .st-status-pop-model{min-width:0;white-space:normal;overflow-wrap:anywhere}
      .st-status-pop-empty{color:var(--st-text-tertiary)}
      /* The section name carries the weight in this pair; the position sits behind it as context,
         so a long title can still be read before the count. */
      .st-status-name{color:var(--st-text-secondary);margin-right:var(--st-space-8,8px);
        overflow:hidden;text-overflow:ellipsis;max-width:34ch;display:inline-block;vertical-align:bottom}
      .st-status-count{color:var(--st-text-tertiary)}
      /* The saved time is a read-out. Only a failure changes its colour: a timestamp that is a
         little stale is still a timestamp, and tinting it would turn information into an alarm. */
      .st-status-item[data-tone="error"]{color:var(--dsw-alias-state-error-primary,var(--st-fallback-error))}
      /* A write just landed: a wash behind the timestamp, fading out. The text does not change, so
         the reading stays truthful while the marker says "that was this instant". */
      .st-status-flash{animation:st-status-flash 1.4s var(--ds-ease-in-out,ease-in-out) both;border-radius:var(--st-radius-xs,4px)}
      @keyframes st-status-flash{
        0%{background:color-mix(in srgb, var(--st-accent) 34%, transparent);color:var(--st-text-primary)}
        100%{background:transparent}
      }
      @media (prefers-reduced-motion: reduce){
        /* No fade: the colour simply appears and goes, which still marks the moment. */
        .st-status-flash{animation:none;background:color-mix(in srgb, var(--st-accent) 22%, transparent)}
      }
      /* The dock's buttons: readable at arm's length, still flat. */
`
