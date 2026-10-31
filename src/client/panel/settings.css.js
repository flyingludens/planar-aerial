/**
 * The panel's own preferences.
 */
export const CSS_SETTINGS = `
      /* ---- settings: the preference page and its groups ---- */
      .st-settings{display:flex;flex-direction:column;gap:var(--st-space-16,16px)}
      .st-settings-group{display:flex;flex-direction:column;gap:var(--st-space-8,8px)}
      .st-settings-group + .st-settings-group{padding-top:var(--st-space-16,16px);
        border-top:.5px solid var(--dsw-alias-border-l3,var(--st-fallback-border-l3))}
      .st-settings-title{font-size:var(--st-text-md);
        line-height:var(--st-text-md-leading);font-weight:var(--st-font-weight-medium);
        color:var(--st-text-primary)}
      /* The AI dock: the suggestion, the thinking state, and their buttons.
         It sits UNDER the page, the width of the measure, in normal flow. It used to be an
         absolutely positioned card pinned under the caret line, which meant it covered the very
         paragraph being edited and swallowed clicks on it — so with a suggestion open the writer
         could not read or touch the text underneath. A textarea cannot hold a block between its
         own lines, so the honest place for it is below the page: nothing is covered, the full
         measure is used, and every other control stays reachable.

         No border and no shadow: on a dark page a drop shadow reads as a top edge, which is what
         "there is still a border on it" was pointing at. The raised layer alone separates it. */
      /* The surface, radius and shadow come from the host's own composer card: its panel radius,
         its input-major surface and its soft elevation are exactly what the dsh input box uses, so
         the dock and the host composer are the same rounded card rather than two surfaces that
         nearly match. Each token is read first with a fallback for a host that does not publish
         it. */

      .st-library-picker{display:flex;align-items:center;gap:var(--st-space-8,8px);min-width:0}
      .st-library-path{flex:1 1 auto;min-width:0;height:var(--st-row-height,32px);padding:0 var(--st-space-12,12px);
        border:var(--st-hairline) solid var(--st-ink-edge);border-radius:var(--st-radius-sm,8px);
        background:var(--st-surface);color:var(--st-text-primary);font-family:inherit;font-size:var(--st-text-md);
        text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer}
      .st-library-path:disabled{cursor:default;color:var(--st-text-tertiary)}
`
