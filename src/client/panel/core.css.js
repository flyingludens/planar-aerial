/**
 * The manuscript preview and the drawer.
 *
 * The preview is the book set in its own type — headings, paragraphs, rules, and the marks a
 * scan leaves in the text. The drawer is the panel that drops from the title row over the desk.
 */
export const CSS_CORE = `
      /* ---- the manuscript preview: headings, paragraphs, rules, and the issue marks in the text ---- */
      .st-manuscript{margin:var(--st-space-8,8px) 0 0;padding:var(--st-space-16,16px) var(--st-space-16,16px);max-height:min(60vh,640px);overflow:auto;
        word-break:break-word;font-family:var(--st-font-family);font-size:var(--st-text-md);line-height:1.9;
        color:var(--st-text-primary);background:var(--st-surface-high);
        border-radius:var(--st-radius-md,12px)}
      .st-md-h{margin:1.1em 0 .5em;font-weight:var(--st-font-weight-strong);line-height:1.4;color:var(--st-text-primary)}
      .st-md-h:first-child{margin-top:0}
      .st-md-h1{font-size:var(--st-text-xl)}
      .st-md-h2{font-size:var(--st-text-lg)}
      .st-md-h3{font-size:var(--st-text-lg)}
      .st-md-h4,.st-md-h5,.st-md-h6{font-size:var(--st-text-lg);color:var(--st-text-secondary)}
      .st-md-p{margin:0 0 .85em;text-indent:2em}
      .st-md-p:last-child{margin-bottom:0}
      .st-md-rule{border:none;border-top:.5px solid var(--dsw-alias-border-l3,var(--st-fallback-border-l3));margin:1.2em 0}
      .st-issue{display:flex;gap:var(--st-space-8,8px);align-items:baseline;padding:var(--st-space-4,4px) 0;font-size:var(--st-text-md);line-height:var(--st-line-height-ui)}
      /* Scrollbars: the host themes them; leaving them default is the most visible inconsistency. */
      .st-scroll{scrollbar-gutter:stable}
      .st-scroll::-webkit-scrollbar{width:var(--st-space-12,12px);height:var(--st-space-12,12px)}
      .st-scroll::-webkit-scrollbar-track{background:var(--dsw-alias-scrollbar-bg-l2,var(--st-fallback-scrollbar));border-radius:var(--st-radius-pill,999px);corner-shape:round;margin:var(--st-space-2,2px)}
      .st-scroll::-webkit-scrollbar-thumb{background:var(--dsw-alias-scrollbar-bg-l2,var(--st-fallback-scrollbar));border-radius:var(--st-radius-pill,999px);corner-shape:round}
      .st-scroll::-webkit-scrollbar-thumb:hover{background:var(--dsw-alias-scrollbar-hover-l2,var(--st-fallback-scrollbar-hover))}
      .st-scroll{scrollbar-width:thin;scrollbar-color:var(--dsw-alias-scrollbar-bg-l2,var(--st-fallback-scrollbar)) transparent}
      /* Text selection follows the theme instead of the browser default blue.
         It is mixed from the ACCENT, not filled with a surface token: the module-platform token is
         a page background (a near-white grey), so the selection read as a grey slab laid over the
         text and the ink under it disappeared into the slab. A tint of the brand colour at low
         opacity marks the range and leaves the words readable, which is the only thing a
         selection has to do. */
      .st-shell::selection{background:color-mix(in srgb, var(--st-accent) 26%, transparent);
        color:var(--st-text-primary)}
      /* Destructive hover on the book delete affordance. */
      /* Caption tier: quieter than secondary, for counts and metadata. */
      .st-caption{color:var(--st-text-tertiary);font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading)}
      /* Rail toggle: a proper hit target rather than a bare glyph. */
      /* The page owns the full width now: the outline floats over it instead of taking a column. */
      .st-mid{padding:0 var(--st-space-4,4px);position:relative}
      /* The overlay covers the page and nothing else: the title bar stays reachable, which is
         where its toggle lives. */
      .st-root{position:relative}
      /* The library: a card grid, using the host's raised-surface radius. */

      /* ---- the sheet: a drawer that drops from the title row, and the desk under it ---- */
      .st-shell{position:relative}
      /* A centred dialog over the panel. It is absolute, not fixed: the host's centre column has
         overflow: hidden, and a fixed overlay is clipped by it, which is why the sheet was a narrow
         strip in the wrong place. */
      /* The backdrop is only a dimming layer now: the panel itself is flush against the right edge,
         so there is nothing to centre. */
      /* Below the title bar, never over it. A full-inset overlay covered the whole shell including
         the title row, so the book name and the panel buttons were dimmed and unclickable while a
         drawer was open — and the controls you need to close it live in that row. The offset is the
         title row's own height, declared once on the shell. */
      .st-sheet-backdrop{position:absolute;inset:var(--st-titlebar-height,68px) 0 0 0;z-index:var(--st-layer-drawer);
        display:flex;align-items:stretch;justify-content:flex-end;
        /* No wash over the page.
           A panel that slides in from the edge is not a modal: the manuscript beside it stays
           readable and stays the surface the writer is working on. Dimming it said "you cannot use
           this until you close the drawer", which was never true — the drawer is reference material
           consulted WHILE writing. Its separation is the flyout shadow on the panel itself, which
           is exactly what a shadow is for; a second dim on top of it was doing the same job twice
           and painting the page grey to do it.
           The layer stays because it is the click-away target and the panel's positioning context. */
        background:transparent}
      /* A panel that comes in from the right: full height, rounded on its inner edge only, like the
         outline rounded on its right edge. The two corners against the frame stay square.
         Its depth is two things, not one: the flyout shadow (dark, thrown LEFT, the direction it
         arrived from) and an inner rim along the top edge. The single lv3 shadow it used to carry
         is a card recipe — right for a 184px card, invisible under a 700px panel that reaches the
         top and bottom edges. */
      .st-sheet{display:flex;flex-direction:column;
        height:100%;max-height:none;overflow:hidden;
        border:none;border-radius:var(--st-radius-panel,28px) 0 0 var(--st-radius-panel,28px);
        background:var(--st-surface-high);
        box-shadow:var(--st-panel-rim),var(--st-panel-shadow-left);
        font-family:var(--st-font-family);font-size:var(--st-text-md);line-height:var(--st-line-height-ui);
        color:var(--st-text-primary);animation:st-sheet-in var(--st-motion-open,180ms) var(--ds-ease-in-out,ease-in-out) both;
        /* Width follows the CONTENT, not a tier. Three fixed sizes were still a guess: a cast with
           two people got a 560px panel mostly full of nothing, and a graph with twelve needed more
           than 820. Sizing to fit takes what the content asks for, with a floor so a one-line
           panel is not a strip and a ceiling a page may raise, capped by the window. */
        width:fit-content;min-width:min(320px,100%);
        max-width:min(var(--st-sheet-max),100%)}
      /* A panel that names a width tier keeps that width; only the tierless ones size to their
         content. The history panel is prose and its width used to jump with the longest answer. */
      .st-sheet[data-size]{width:var(--st-sheet-max)}
      @keyframes st-sheet-in{from{transform:translateX(24px);opacity:0}to{transform:none;opacity:1}}
      .st-closing .st-sheet{animation:st-sheet-out var(--st-motion-close,140ms) var(--ds-ease-in-out,ease-in-out) both}
      @keyframes st-sheet-out{from{transform:none;opacity:1}to{transform:translateX(24px);opacity:0}}
      .st-closing .st-sheet-backdrop{animation:st-scrim-out var(--st-motion-close,140ms) ease both}
      @keyframes st-scrim-out{from{opacity:1}to{opacity:0}}
      @media (max-width: 640px){
        /* Below this the content cannot lay itself out in a column narrower than the window, so the
           panel takes the whole width and drops its rounded inner edge. */
        .st-sheet{width:100%;min-width:0;border-radius:0}
      }
      .st-sheet-head{display:flex;align-items:center;gap:var(--st-space-8,8px);padding:var(--st-space-16,16px) var(--st-space-16,16px) var(--st-space-12,12px);flex:none;
        border-bottom:.5px solid var(--dsw-alias-border-l3,var(--st-fallback-border-l3))}
      .st-sheet-title{margin:0;font-size:var(--st-text-lg);line-height:var(--st-text-lg-leading);font-weight:var(--st-font-weight-strong)}
      .st-sheet-body{flex:1 1 auto;min-height:0;overflow:auto;padding:var(--st-space-16,16px) var(--st-space-16,16px) var(--st-space-16,16px)}
      /* An icon and a label in one control: flex with centred alignment, or the svg sits on the
         text baseline and rides above it. The gap is the space between them. */
      /* Title-row buttons share the rail toggle's height, so the row is a line of EQUAL pills —
         the 40px circle at the left end and these at the right end are the same object. */
      /* Title-row buttons read as chrome on the frame: their ink is the theme's primary label —
         white on the dark theme — not the quieter secondary the inner-panel ghosts use, which
         all but disappears against the frame edge. The session button's flowing label paints its
         own gradient and is untouched by this. */
      .st-titlebar .st-btn{color:var(--st-text-primary)}
      .st-titlebar .st-rail-toggle{color:var(--st-text-primary)}
      .st-drawer-btn{display:inline-flex;align-items:center;gap:var(--st-space-4,4px);
        font-size:var(--st-text-md);line-height:var(--st-text-md-leading);padding:0 var(--st-space-8,8px)}
      /* Icons never stretch or shrink with the label beside them. */
      .st-drawer-btn .st-bar-icon{display:block}
      /* The writing surface: one uninterrupted editor with its own header. */
      /* The desk fills the column instead of floating in its middle: the editor is the page, so
         it takes every pixel the header leaves and scrolls internally. Its width is a variable
         because the writer can set it, and the two text layers read their metrics from the same
         three variables so they cannot drift apart. */
      .st-mid-body{display:flex;flex-direction:column;flex:1 1 auto;min-height:0;min-width:0}
      .st-desk{display:flex;flex-direction:column;flex:1 1 auto;min-height:0;width:100%;
        max-width:var(--st-width,760px);margin:0 auto;padding:var(--st-space-16,16px) var(--st-space-24,24px) 0}
      /* The dock slot is the panel's bottom edge in every state — box open, folded to the
         hairline, or idle. The desk's bottom padding would sit UNDER the hairline as a strip of
         dead page and push the line off the edge, so the padding moves into the slot itself:
         content keeps its breathing room above the line, and the line touches the edge. */
      .st-desk{padding-bottom:0}
      .st-dock-slot{padding-top:var(--st-space-16,16px)}
      .st-desk-head{display:flex;align-items:center;gap:var(--st-space-12,12px);margin-bottom:var(--st-space-16,16px);flex-wrap:wrap}
      .st-desk-title{margin:0;font-size:var(--st-text-lg);line-height:var(--st-text-lg-leading);font-weight:var(--st-font-weight-strong)}
      /* flex:1 plus a zero min-height is what makes a textarea take the remaining height: without
         the min-height reset a flex child refuses to shrink and the editor collapses to one line. */
      .st-editor-wrap{display:flex;flex-direction:column;flex:1 1 auto;min-height:0}
      /* A transparent textarea over a painted copy of the same text: the copy is what draws the
         continuation and the search hits, while the textarea keeps the caret, selection and input
         handling. Both layers share every metric — including the width the scrollbar eats, which
         is measured and applied to the paint layer, or the two wrap at different points. */
      .st-editor-stack{position:relative;display:flex;flex:1 1 auto;min-height:var(--st-editor-min-h,140px);min-width:0}
      .st-editor-paint,.st-editor-over{font-family:inherit;font-size:var(--st-font-size,16px);
        line-height:var(--st-line-height,1.9);
        padding:0;margin:0;border:0;letter-spacing:normal;word-spacing:normal;
        white-space:pre-wrap;overflow-wrap:break-word;word-break:break-word;
        tab-size:4;box-sizing:border-box}
      .st-editor-paint{position:absolute;inset:0;overflow:hidden;pointer-events:none;
        color:var(--st-text-primary)}
      /* The continuation reads as "the sentence going on", so it is the same text in a lighter
         ink rather than a block underneath. */
      .st-editor-full{flex:1 1 auto;min-height:0;resize:none}
      .st-editor-over{position:relative;width:100%;height:100%;background:transparent;
        color:transparent;caret-color:var(--st-text-primary);outline:none;resize:none;
        overflow:auto;scrollbar-gutter:stable}
      /* The overlay is transparent ink drawn ON TOP of the paint layer, so its selection must be
         a tint without a colour: filling it with a surface token covered the visible text with a
         grey rectangle. A tint over a transparent fill marks the range and lets the paint show. */
      .st-editor-over::selection{background:color-mix(in srgb, var(--st-accent) 26%, transparent);color:transparent}
      /* A selection the textarea cannot draw because focus moved away — the composer, a button —
         is drawn here instead. It is mixed from the accent so it is unmistakably a selection and
         still quieter than a live one: the module-platform token is only a few points off the page
         background, which made the passage look unselected again, the exact thing this is here to
         prevent. */
      .st-selected{background:color-mix(in srgb, var(--st-accent) 26%, transparent);
        border-radius:var(--st-radius-xs,4px);box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--st-accent) 38%, transparent)}
      /* A search hit is a wash behind the glyphs; the current one also gets a ring. The text
         colour is deliberately left alone: overriding it made the highlighted word unreadable on
         some themes, and a highlight that recolours the words it marks is worse than one that
         does not. A colour mix rather than a background token keeps the wash visible on both the
         light and the dark page. */
      .st-hit{background:color-mix(in srgb, var(--st-accent) 30%, transparent);
        border-radius:var(--st-radius-xs,4px)}
      .st-hit[data-active="true"]{background:color-mix(in srgb, var(--dsw-alias-state-warn-primary,var(--st-fallback-warn)) 55%, transparent);
        box-shadow:inset 0 0 0 1px var(--dsw-alias-state-warn-primary,var(--st-fallback-warn))}
      /* The find bar: one row above the page, never over it, so the text does not reflow while
         the writer moves between hits. */
      /* In the header row: no margin of its own, and allowed to shrink, or it would push the
         header wider than the measure on a narrow window. */
      .st-find{display:flex;align-items:center;gap:var(--st-space-4,4px);flex:0 1 auto;min-width:0}
      /* The search field is one of the shared borderless fields; only its width belongs here.
         It sits in the header row, so it keeps the row's height rather than the page's. */
      .st-find-input{width:var(--st-find-w,170px);min-width:var(--st-find-min-w,60px);flex:0 1 auto;padding:var(--st-space-2,2px) var(--st-space-8,8px)}
      .st-find-count{font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);color:var(--st-text-tertiary);
        flex:none;font-variant-numeric:tabular-nums}
      /* Typography: three rows of named steps.
         A fixed width on the page, not fit-content: the preview's text gets wider as the size goes
         up, and a panel that resized itself while the writer compared sizes made the comparison
         useless. One width for all three settings. */
      /* A DEFINITE width, then a percentage cap. min(340px, 100%) looks equivalent and is not: a
         percentage width counts as auto while the drawer measures its content, so the preview's
         text at 20px made the sheet 860px wide and at 14px 624px — the panel resized itself when
         the writer changed the size, which is exactly what the preview must not do. */
      .st-type{display:flex;flex-direction:column;gap:var(--st-space-8,8px);width:var(--st-settings-w,340px);max-width:100%}
      .st-type-row{display:flex;align-items:center;gap:var(--st-space-12,12px);min-width:0}
      .st-type-label{flex:none;width:var(--st-gutter-w,52px);font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-secondary)}
      /* The segmented control: one track, the chosen step raised inside it. Cheaper than three
         sliders and it says how many choices there are before you touch it. */
      .st-seg{display:inline-flex;align-items:center;gap:var(--st-space-2,2px);min-width:0;padding:var(--st-space-2,2px);
        border-radius:var(--st-radius-pill,999px);corner-shape:round;background:var(--st-surface);
        box-shadow:inset 0 0 0 var(--st-hairline) var(--dsw-alias-border-l2,var(--st-fallback-border-l2))}
      .st-seg-item{font-family:inherit;font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);padding:var(--st-space-2,2px) var(--st-space-12,12px);
        border:none;border-radius:var(--st-radius-pill,999px);background:transparent;corner-shape:round;
        color:var(--st-text-secondary);cursor:pointer;white-space:nowrap}
      .st-seg-item:hover{background:var(--st-hover-fill);color:var(--st-text-primary)}
      .st-seg-item:active{background:var(--st-active-fill)}
      .st-seg-item:focus-visible{outline:none;
        box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--st-focus-ink)}
      .st-seg-item[aria-pressed="true"]{background:var(--st-selected-fill);
        color:var(--st-text-primary);
        box-shadow:inset 0 0 0 .5px var(--dsw-alias-border-l4,var(--st-fallback-border-l4))}
      /* A FIXED frame, and a smaller one than before: the sample is one line, so the frame is one
         line of the largest offered type plus padding — 72px, not the 150px the three-line copy
         needed. Fixed, not content-sized: the frame must not jump when the type changes. */
      .st-type-preview{height:var(--st-preview-h,72px);padding:var(--st-space-12,12px) var(--st-space-16,16px);border-radius:var(--st-radius-sm,8px);
        background:var(--st-surface);color:var(--st-text-primary);
        box-shadow:inset 0 0 0 var(--st-hairline) var(--dsw-alias-border-l2,var(--st-fallback-border-l2));
        overflow:hidden;contain:content}
      .st-type-preview-in{white-space:pre-wrap;overflow-wrap:anywhere}
      .st-type-foot{display:flex;justify-content:flex-end}
      /* The settings page: named groups, because it now holds two unrelated kinds of preference.
         Without a heading the page reads as one long form and the saving row looks like a fourth
         type setting. A hairline between groups is enough — a card around each would make the
         drawer look like a form to submit rather than a panel that applies as you press. */
`
