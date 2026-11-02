/**
 * The overview page: a chapter list beside the selected chapter's dossier.
 *
 * The list is navigation, the pane is the reading surface. The selected row is lifted off the
 * list with its own shadow, so selection reads as depth rather than as a coloured ring the
 * board reserves for wires and actions.
 */
export const CSS_OVERVIEW = `
      .st-overview{display:flex;flex-direction:column;gap:var(--st-board-gap);flex:1 1 auto;min-height:0}
      .st-overview-actions{display:flex;align-items:center;gap:var(--fang-padding-md);min-width:0}
      .st-overview-field{display:flex;flex-direction:column;gap:var(--fang-padding-sm);min-height:0}
      .st-overview-label{font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);
        color:var(--fang-ink-tertiary)}
      /* The one editable field on the page: a quiet fill, like every other field in the panel.
         Fixed height: the writer edits a line of summary, and a resizable box changed the
         reading pane's layout under the text every time the handle moved. */
      .st-overview-summary{width:100%;box-sizing:border-box;height:var(--st-overview-summary-h,96px);
        overflow:auto;resize:none;padding:var(--fang-space-8,8px) var(--fang-space-8,8px);border:none;
        border-radius:var(--fang-radius-sm,8px);background:var(--fang-surface-high);
        color:var(--fang-ink-primary);
        font-family:inherit;font-size:var(--fang-font-size-md);line-height:var(--fang-line-height-ui);outline:none}
      .st-overview-summary:focus{box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--fang-focus-ink)}
      .st-overview-text{margin:0;font-size:var(--fang-font-size-md);line-height:var(--fang-line-height-ui);
        color:var(--fang-ink-primary);white-space:pre-wrap;word-break:break-word}
      .st-overview-body{font-size:var(--fang-font-size-md);line-height:var(--fang-line-height-ui);
        color:var(--fang-ink-secondary);
        white-space:pre-wrap;word-break:break-word}
      /* The whole-book summary belongs to the page, not to a chapter: it sits under the split,
         above the audits, behind a hairline. */

      /* 流派 uses the shared split: the list is navigation, the pane is the prompt. */
      .st-writing-style-actions{display:flex;align-items:center;gap:var(--fang-space-8,8px);flex-wrap:wrap;align-self:flex-start}
      .st-writing-style-generate{align-self:flex-start;flex:none}
      .st-writing-style-prompt{margin:0;font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-ui);
        color:var(--fang-ink-secondary);
        white-space:pre-wrap;word-break:break-word}
      .st-overview-global{flex:none;padding-top:var(--st-board-gap);
        border-top:var(--fang-hairline,.5px) solid var(--fang-ink-hair)}
`
