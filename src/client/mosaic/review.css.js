/**
 * What the model proposes, and how the writer decides on it.
 */
export const CSS_REVIEW = `
      /* ---- the review page: what the model proposes, and how a proposal is decided ---- */
      .st-mosaic-head{display:flex;flex-direction:column;gap:var(--st-space-8,8px);margin:0 0 var(--st-space-12,12px)}
      /* The two AI entries read as CHIPS, not as bare text buttons: a hairline edge groups them
         as actions on the page, the way suggestion chips sit under an input in design tools. */
      .st-mosaic-check-row .st-btn{box-shadow:inset 0 0 0 .5px var(--dsw-alias-border-l4,var(--st-fallback-border-l4))}
      .st-mosaic-check-row{display:flex;gap:var(--st-space-8,8px);align-items:center;min-width:0}
      /* The result of a 梳理/检查 that produced no review cards: a quiet panel rather than a
         status-bar flash the writer can miss after a long wait. */
      .st-mosaic-notice{font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-secondary);
        padding:var(--st-space-12,12px) var(--st-space-12,12px);
        border:var(--st-hairline,.5px) solid var(--st-ink-edge);
        border-radius:var(--st-radius-sm,8px);background:var(--st-surface)}
      .st-mosaic-proposal-wrap{margin:0 0 var(--st-space-12,12px)}
      .st-mosaic-proposal-title{margin:0 0 var(--st-space-8,8px);font-weight:var(--st-font-weight-strong);
        font-size:var(--st-text-md);line-height:var(--st-text-md-leading);
        color:var(--st-text-primary)}
      .st-mosaic-proposal-evidence{margin:0 0 var(--st-space-8,8px);padding:var(--st-space-8,8px) var(--st-space-8,8px);
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-secondary);
        background:var(--st-hover-fill);border-radius:var(--st-radius-sm,8px)}
      .st-mosaic-proposal-op{font-weight:var(--st-font-weight-strong);
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-primary)}
      .st-mosaic-proposal-detail{margin:var(--st-space-2,2px) 0 var(--st-space-4,4px);
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-secondary);word-break:break-word}
      /* The proposals page and the snapshot page are the same shared list at different contents. */
      .st-mosaic-proposals-empty{padding:var(--st-space-16,16px) 0;text-align:center;
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-tertiary)}
      .st-mosaic-proposal-head{display:flex;align-items:baseline;gap:var(--st-space-8,8px);
        margin:0 0 var(--st-space-2,2px);min-width:0}
      .st-mosaic-proposal-meta{font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-tertiary);word-break:break-word}
      .st-mosaic-proposal-count{flex:1 1 auto;min-width:0;
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-tertiary)}
      .st-mosaic-proposal-status{flex:0 0 auto;
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-tertiary)}
      .st-mosaic-proposal-status[data-status="accepted"]{color:var(--st-accent)}
      .st-mosaic-proposal-changes{margin:0 0 var(--st-space-8,8px);padding-left:var(--st-space-16,16px);
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-secondary);word-break:break-word}
      .st-mosaic-proposal[data-status="rejected"]{opacity:var(--st-fade-dim)}
      .st-mosaic-fields{display:flex;gap:var(--st-space-8,8px);margin:var(--st-space-4,4px) 0}
      .st-mosaic-name{flex:1;min-width:0;box-sizing:border-box;
        border:1px solid var(--dsw-alias-border-l4,var(--st-fallback-border-l4));border-radius:var(--st-radius-sm,8px);
        background:var(--st-surface-high);padding:var(--st-space-2,2px) var(--st-space-8,8px);font-family:inherit;
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-primary)}
      .st-mosaic-quote{margin:var(--st-space-4,4px) 0 0;
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-tertiary)}
      .st-mosaic-proposal-actions{display:flex;gap:var(--st-space-8,8px);margin-top:var(--st-space-8,8px)}
      .st-mosaic-apply-row{display:flex;gap:var(--st-space-8,8px);align-items:center;margin:var(--st-space-4,4px) 0 var(--st-space-12,12px)}
      .st-mosaic-chip-toggle{cursor:pointer}
      .st-mosaic-status-add{flex:1;min-width:var(--st-review-chip-min-w,60px);padding:var(--st-space-2,2px) var(--st-space-8,8px);border:1px solid var(--dsw-alias-border-l2,var(--st-fallback-border-l2));border-radius:var(--st-radius-pill,999px);corner-shape:round;background:var(--st-surface);color:var(--st-text-primary);font-size:var(--st-text-md)}
      .st-mosaic-tab-badge{display:inline-block;margin-left:var(--st-space-4,4px);padding:0 var(--st-space-4,4px);border-radius:var(--st-radius-pill,999px);corner-shape:round;
        background:var(--st-accent);color:var(--st-on-accent,#fff);
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading)}
      /* Snapshots: the same list as the chapter column and the proposal page, with a restore
         button at the trailing end of each row. */
      .st-mosaic-version-row{flex-direction:row;align-items:center;gap:var(--st-space-12,12px)}
      .st-mosaic-version-text{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:var(--st-space-2,2px)}
`
