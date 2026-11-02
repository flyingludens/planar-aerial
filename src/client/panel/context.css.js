/**
 * The context window's only new pieces.
 *
 * Everything else is the panel's existing furniture: Dialog, SplitPane, List/ListRow, the fixed
 * summary field, the proposals action row. Left here: the split body's height, the composition
 * bar (with its tone tokens), and the fixed copies region that holds a standard List.
 */
export const CSS_CONTEXT = `
      .st-ctx-dialog-body{height:68vh;overflow:hidden}
      .st-ctx-dialog-body .fang-split{flex:1 1 auto;min-height:0;height:100%}
      .st-ctx-bar{flex:none;display:flex;gap:var(--st-seg-gap);height:var(--fang-segmented-height);
        margin:var(--st-board-inset-compact) var(--st-board-inset) 0}
      .st-ctx-seg{flex:1 1 auto;min-width:0;padding:0 var(--fang-space-4);border:0;cursor:pointer;
        border-radius:var(--fang-radius-xs);color:var(--fang-on-accent);overflow:hidden}
      .st-ctx-seg[data-tone="0"]{background:var(--st-seg-0)}
      .st-ctx-seg[data-tone="1"]{background:var(--st-seg-1)}
      .st-ctx-seg[data-tone="2"]{background:var(--st-seg-2)}
      .st-ctx-seg[data-tone="3"]{background:var(--st-seg-3)}
      .st-ctx-seg[data-tone="4"]{background:var(--st-seg-4)}
      .st-ctx-seg[data-tone="5"]{background:var(--st-seg-5)}
      .st-ctx-seg[data-tone="6"]{background:var(--st-seg-6)}
      .st-ctx-seg[data-tone="7"]{background:var(--st-seg-7)}
      .st-ctx-seg[data-active="true"]{box-shadow:0 0 0 var(--fang-space-2) var(--fang-accent)}
      .st-ctx-seg-label{display:block;font-size:var(--fang-font-size-sm);line-height:var(--fang-segmented-height);
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .st-ctx-official{flex:1 1 auto;min-height:0;overflow:auto;display:flex;flex-direction:column;
        gap:var(--fang-space-8);padding:var(--st-board-inset)}
      .st-ctx-mine{flex:0 0 40%;min-height:0;overflow:auto;display:flex;flex-direction:column;
        gap:var(--fang-space-8);padding:var(--st-board-inset);
        border-top:var(--fang-hairline) solid var(--fang-ink-hair)}
`
