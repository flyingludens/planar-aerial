/** 随笔: quick capture above, notebook list and reading pane below. */
export const CSS_NOTES = `
      .st-notes-dialog{height:min(72vh,var(--st-notes-h));padding-top:var(--st-inset-md)}
      /* The notebook is an aside, not a modal takeover: the page behind stays sharp. */
      .st-notes-backdrop{backdrop-filter:none;-webkit-backdrop-filter:none}
      .fang-dialog-body.st-notes-body{flex:1 1 auto;display:flex;flex-direction:column;min-height:0;overflow:hidden}
      .st-notes{display:flex;flex-direction:column;gap:var(--st-board-gap);flex:1 1 auto;min-height:0}
      /* The capture area is its own region; the list and the detail below are two independent
         boxes with a gap between them, not one outer frame split by a line. */
      .st-notes-capture{flex:none;padding-bottom:var(--st-board-gap);
        border-bottom:var(--st-hairline) solid var(--st-ink-edge)}
      /* The panel's standard borderless input, sized for a thought rather than one line. Its
         focus ring is suppressed here: a bordered focus state made the capture box look like a
         form field, which is the opposite of a quick note. */
      .st-notes-capture .st-input{min-height:var(--st-notes-capture-h);resize:none;
        background:var(--st-surface-high);padding:var(--st-inset-sm) var(--st-inset-md)}
      .st-notes-capture .st-input:focus{box-shadow:none}
      .st-notes .fang-split{flex:1 1 auto;min-height:0}
      /* A pane title is part of its content; no rule between them. */
      .st-notes .fang-split-detail-head{border-bottom:none}
      .st-notes-detail{min-height:0;white-space:pre-wrap;word-break:break-word;
        font-size:var(--st-text-md);line-height:var(--st-line-height-ui);
        color:var(--st-text-primary)}
      .st-notes .fang-split-detail-body{display:flex;flex-direction:column}
`
