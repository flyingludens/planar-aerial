/**
 * The first-run page: the dot canvas, a display-size serif name, and one action.
 */
export const CSS_WELCOME = `
      /* ---- the welcome page: one display line, one door ---- */
      .st-welcome{flex:1 1 auto;min-height:0;overflow:auto;display:flex;flex-direction:column;
        padding:var(--fang-space-16,16px) var(--st-welcome-gutter) var(--fang-space-24,24px)}
      /* The page is a canvas, not a document: the same lattice the shelf uses, with a quiet accent
         wedge at the far edge so the empty first screen has a direction. */
      .st-welcome::after{content:'';position:absolute;right:0;bottom:0;width:38%;height:54%;pointer-events:none;
        background:linear-gradient(135deg,transparent 18%,color-mix(in srgb,var(--fang-accent) 22%,transparent) 78%);
        clip-path:polygon(100% 0,100% 100%,0 100%);opacity:.55;z-index:var(--st-welcome-wedge-z)}
      .st-welcome-main{margin:auto 0;width:100%;max-width:var(--st-welcome-measure);display:flex;flex-direction:column;
        align-items:flex-start;position:relative;z-index:var(--st-welcome-main-z)}
      .st-welcome-title{display:inline-block;margin:var(--fang-space-8,8px) 0 0;font-family:var(--st-font-serif);font-weight:var(--fang-font-weight-normal);
        font-size:var(--st-welcome-title);line-height:var(--st-welcome-title-leading);letter-spacing:var(--st-welcome-title-tracking);
        color:var(--fang-ink-primary);white-space:nowrap}
      .st-welcome-accent{color:var(--fang-accent)}
      .st-welcome-latin{width:fit-content;margin:var(--fang-space-12,12px) 0 0 var(--st-welcome-latin-nudge);font-family:var(--st-font-serif);font-style:italic;
        font-size:var(--st-welcome-latin-size);line-height:var(--st-welcome-latin-leading);
        letter-spacing:var(--st-welcome-latin-tracking);color:var(--fang-ink-secondary)}
      /* One column, not four separate boxes: the gaps between the blocks are the part that most
         often caught a glyph between two headings, so the wash spans the whole copy column. The
         width follows the content, leaving the empty canvas to the right sharp. */
      /* The copy column is a layout wrapper only. The blur lives on individual glyphs (see
         glyph-field.css), never on a background patch behind the column. */
      .st-welcome-copy{display:flex;flex-direction:column;align-items:flex-start;width:fit-content;max-width:100%}
      .st-welcome-lede{width:fit-content;max-width:var(--st-welcome-measure);margin:var(--fang-space-24,24px) 0 0;font-family:var(--st-font-serif);
        font-size:var(--st-welcome-lede-size);line-height:var(--fang-line-height-reading);color:var(--fang-ink-secondary)}
      .st-welcome-cta{display:flex;flex-direction:column;align-items:flex-start;gap:var(--fang-space-12,12px);
        margin-top:var(--fang-space-24,24px);padding-top:var(--fang-space-16,16px)}
      .st-welcome-actions{width:fit-content;display:flex;align-items:center;gap:var(--fang-space-16,16px);flex-wrap:wrap}
      .st-welcome-error{margin:0;font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);color:var(--dsw-alias-state-warn-primary,#f59e0b)}
      @media (max-width: 640px){.st-welcome-title{white-space:normal}}

      .st-welcome-back{position:absolute;z-index:var(--st-welcome-back-z);left:max(var(--st-welcome-gutter,28px),calc(var(--dsh-frame-leading-clearance,0px) + var(--fang-space-8,8px)));top:var(--fang-space-16,16px);
        color:var(--fang-ink-primary)}


`
