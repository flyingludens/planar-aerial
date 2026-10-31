/**
 * The overview page: a chapter list beside the selected chapter's dossier.
 *
 * The list is navigation, the pane is the reading surface. The selected row is lifted off the
 * list with its own shadow, so selection reads as depth rather than as a coloured ring the
 * board reserves for wires and actions.
 */
export const CSS_OVERVIEW = `
      .st-overview{display:flex;flex-direction:column;gap:var(--st-board-gap);flex:1 1 auto;min-height:0}
      .st-overview-actions{display:flex;align-items:center;gap:var(--st-inset-md);min-width:0}
      .st-overview-field{display:flex;flex-direction:column;gap:var(--st-inset-sm);min-height:0}
      .st-overview-label{font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-tertiary)}
      /* The one editable field on the page: a quiet fill, like every other field in the panel.
         Fixed height: the writer edits a line of summary, and a resizable box changed the
         reading pane's layout under the text every time the handle moved. */
      .st-overview-summary{width:100%;box-sizing:border-box;height:var(--st-overview-summary-h,96px);
        overflow:auto;resize:none;padding:var(--st-space-8,8px) var(--st-space-8,8px);border:none;
        border-radius:var(--st-radius-sm,8px);background:var(--st-surface-high);
        color:var(--st-text-primary);
        font-family:inherit;font-size:var(--st-text-md);line-height:var(--st-line-height-ui);outline:none}
      .st-overview-summary:focus{box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--st-focus-ink)}
      .st-overview-text{margin:0;font-size:var(--st-text-md);line-height:var(--st-line-height-ui);
        color:var(--st-text-primary);white-space:pre-wrap;word-break:break-word}
      .st-overview-body{font-size:var(--st-text-md);line-height:var(--st-line-height-ui);
        color:var(--st-text-secondary);
        white-space:pre-wrap;word-break:break-word}
      /* The whole-book summary belongs to the page, not to a chapter: it sits under the split,
         above the audits, behind a hairline. */

      /* 流派 uses the shared split: the list is navigation, the pane is the prompt. */
      .st-writing-style-actions{display:flex;align-items:center;gap:var(--st-space-8,8px);flex-wrap:wrap;align-self:flex-start}
      .st-writing-style-generate{align-self:flex-start;flex:none}
      .st-writing-style-prompt{margin:0;font-size:var(--st-text-sm);line-height:var(--st-line-height-ui);
        color:var(--st-text-secondary);
        white-space:pre-wrap;word-break:break-word}
      .st-overview-global{flex:none;padding-top:var(--st-board-gap);
        border-top:var(--st-hairline,.5px) solid var(--st-ink-hair)}
`
