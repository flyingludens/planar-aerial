/**
 * The pointer's patch of the dot lattice: a soft clearing, then small tilted glyphs.
 */
export const CSS_GLYPH = `
      .st-glyph-field{position:absolute;inset:0;z-index:var(--st-glyph-z);overflow:hidden;pointer-events:none;
        -webkit-mask-image:radial-gradient(circle var(--st-glyph-radius) at var(--st-pointer-x,-999px) var(--st-pointer-y,-999px),#000 0%,#000 70%,transparent 100%);
        mask-image:radial-gradient(circle var(--st-glyph-radius) at var(--st-pointer-x,-999px) var(--st-pointer-y,-999px),#000 0%,#000 70%,transparent 100%)}
      .st-glyph-field::before{content:'';position:absolute;inset:0;opacity:0;transition:opacity var(--ds-transition-duration-fast,.12s);
        background:radial-gradient(circle var(--st-glyph-radius) at var(--st-pointer-x,-999px) var(--st-pointer-y,-999px),
          var(--fang-bg,#0b0b0c) 0%, var(--fang-bg,#0b0b0c) 70%, transparent 100%)}
      .st-glyph-field[data-visible="true"]::before{opacity:1}
      .st-glyph-slot{position:absolute;left:0;top:0;width:var(--st-canvas-grid);height:var(--st-canvas-grid);
        display:grid;place-items:center;perspective:var(--st-glyph-perspective,120px)}
      .st-glyph-face{font-family:var(--st-font-serif);font-size:var(--st-glyph-size);line-height:1;font-weight:var(--fang-font-weight-normal);
        opacity:0;color:var(--st-glyph-ink);text-shadow:0 1px 0 var(--st-glyph-depth);
        transform:rotateX(var(--st-glyph-rx,0deg)) rotateY(calc(var(--st-glyph-ry,0deg) - 82deg)) scale(.72);
        transform-style:preserve-3d;transition:opacity var(--st-glyph-flip,320ms) ease;
        will-change:transform,opacity}
      /* Clear the lattice under an active cell. The soft radial shade alone left stray dots in
         the gaps between glyphs, which made the patch read as text pasted over the canvas. */
      .st-glyph-slot[data-on="true"]{background:var(--fang-bg,#0b0b0c)}
      .st-glyph-slot[data-tone="primary"] .st-glyph-face{color:var(--st-glyph-ink-primary)}
      .st-glyph-slot[data-tone="accent"] .st-glyph-face{color:var(--st-glyph-ink-accent)}
      /* Only the glyph is filtered. A backdrop or tint here would paint a visible rectangle over
         the canvas; this leaves every dot and the empty field untouched. */
      .st-glyph-slot[data-content="true"] .st-glyph-face{filter:blur(var(--st-glyph-blur,4px))}
      .st-glyph-slot[data-on="true"] .st-glyph-face{opacity:1;
        transform:rotateX(var(--st-glyph-rx,0deg)) rotateY(var(--st-glyph-ry,0deg)) scale(1);
        animation:st-glyph-flip var(--st-glyph-flip,380ms) cubic-bezier(.2,.7,.2,1) both;
        animation-delay:var(--st-glyph-delay,0ms)}
      @keyframes st-glyph-flip{
        from{opacity:0;transform:rotateX(calc(var(--st-glyph-rx,0deg) + 18deg)) rotateY(calc(var(--st-glyph-ry,0deg) - 100deg)) scale(.7)}
        to{opacity:1;transform:rotateX(var(--st-glyph-rx,0deg)) rotateY(var(--st-glyph-ry,0deg)) scale(1)}
      }
`
