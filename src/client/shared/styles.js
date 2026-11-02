/**
 * The stylesheet's floor as the project sees it: the bridge from the host's theme to the
 * fang-style library's tokens, then the project's own tokens, then the conventions that
 * are not any one component's.
 *
 * The library (FANG_CSS, loaded before this) owns the generic scale — ink, spacing, radii,
 * type, widths, layers, motion. What is here is what belongs to this project: the host
 * mapping (CSS_BRIDGE), the business tokens no library should know about, and the page
 * conventions (.st-input, .st-card, the diff marks, the session button) that several
 * pages share.
 *
 * A component's own styles live in a css module beside it.
 */
export const CSS_BRIDGE = `
      .fang-shell{
        --fang-ink-primary:var(--dsw-alias-label-primary,#f2f2f3);
        --fang-ink-secondary:var(--dsw-alias-label-secondary,#b8b8bd);
        --fang-ink-tertiary:var(--dsw-alias-label-tertiary,#8e8e93);
        --fang-bg-layer-1:var(--dsw-alias-bg-layer-1,#1c1c1e);
        --fang-bg-layer-2:var(--dsw-alias-bg-layer-2,#2c2c2e);
        --fang-border-hair:var(--dsw-alias-border-l2,#ffffff14);
        --fang-border-edge:var(--dsw-alias-border-l3,#ffffff1f);
        --fang-border-strong:var(--dsw-alias-border-l4,#ffffff29);
        --fang-radius-xs:var(--dsw-radius-xs,4px);
        --fang-radius-sm:var(--dsw-radius-sm,8px);
        --fang-radius-md:var(--dsw-radius-md,12px);
        --fang-radius-lg:var(--dsw-radius-lg,16px);
        --fang-radius-panel:var(--dsw-radius-panel,28px);
        --fang-focus-ring-width:var(--dsw-focus-ring-width,2px);
      }
`

export const CSS_SHARED = `
      /* ---- project tokens, on the same shell the library's tokens sit on.
         Business tokens only: the welcome canvas, the glyph field, the context bar's
         tones, the board's wall and wires, the composer's flow ring. Everything generic
         reads a --fang- token; where a value here used to restate a scale step it now
         points at that step instead of copying it. */
      .fang-shell{
        /* The send key. It used to be 朱红, a second colour of the panel's own; now it is the
           accent, so the one affirmative control in the composer and every other accented control
           are the same colour instead of two near-misses. The hover is a shade of that same
           colour rather than a second literal, the way the session button's is. */
        --st-send:var(--fang-accent);
        --st-send-hover:color-mix(in srgb, var(--fang-accent) 86%, #000000);
        /* The welcome page speaks in a serif face; the manuscript page keeps the UI sans. */
        --st-font-serif:"Iowan Old Style","Palatino Linotype","Songti SC","Noto Serif SC",serif;
        --st-welcome-title:clamp(56px,8.4vw,118px);
        --st-welcome-title-leading:.9;
        --st-welcome-title-tracking:-.035em;
        --st-welcome-measure:780px;
        --st-welcome-gutter:clamp(28px,6vw,96px);
        --st-welcome-latin-size:clamp(34px,4vw,48px);
        --st-welcome-latin-leading:1.15;
        --st-welcome-latin-tracking:.045em;
        /* Optical alignment: the Latin italic's first ink starts left of its box, the Chinese
           glyph starts right of its own. This nudge puts the two first strokes on one vertical. */
        --st-welcome-latin-nudge:.08em;
        --st-welcome-lede-size:clamp(18px,2.2vw,24px);
        /* The pointer's glyph field on the welcome canvas. */
        --st-glyph-radius:130px;
        --st-glyph-size:17px;
        --st-glyph-depth:color-mix(in srgb,var(--fang-ink-primary) 18%,transparent);
        --st-glyph-flip:380ms;
        --st-glyph-z:1;
        --st-glyph-blur:4px;
        --st-glyph-content-pad:6px;
        --st-glyph-ink:color-mix(in srgb,var(--fang-ink-tertiary) 45%,transparent);
        --st-glyph-ink-primary:color-mix(in srgb,var(--fang-ink-primary) 26%,transparent);
        --st-glyph-ink-accent:color-mix(in srgb,var(--fang-accent) 35%,transparent);
        --st-flow-border-w:1px;
        --st-flow-duration:4.5s;
        --st-welcome-wedge-z:0;
        --st-welcome-main-z:2;
        --st-welcome-back-z:3;
        --st-welcome-dialog-z:4;
        --st-welcome-dialog-w:480px;
        --st-welcome-dialog-title-size:20px;
        --st-welcome-dialog-input-size:16px;
        --st-mcp-w:460px;
        --st-mcp-code-h:220px;
        --st-mcp-dot:7px;
        --st-mcp-z:6;
        /* The menu glyph size. One step above the 16px interface icons so four rows at 16px type
           read as a list of destinations rather than as a column of small print, and below the
           label's own size so the glyph never outweighs the word it stands for. */
        --st-icon-menu:var(--fang-icon-lg);
        /* The ⋯ affordance on a card: a small hit box with three 2px dots in it.
           The dots are a MARK, not an icon — at 4px they read as three buttons stacked, and at 1px
           they disappear on a light picture. The hit box stays comfortable because a 2px target is
           not something to ask a pointer to find. */
        --st-icon-menu-dot:2px;
        /* The width of a settings column inside a drawer. The typography page and the models page
           both lay their rows out at this width, and it was written twice — which is how two pages
           that look like siblings came to be 340 and 340 by coincidence rather than by rule. */
        --st-settings-w:340px;

        /* ---- component geometry ----
           Every length below is a named decision rather than a number typed where it was needed.
           They are grouped here, next to the library scale they extend, so a page that wants the
           same measure as another page finds it instead of inventing a second one. */
        /* The dock's hairline row: tall enough for the copy above the line to breathe. */
        --st-hairline-row-h:22px;
        /* The event log's table: the drag handle's hit width, and the reading ceiling of the
           list itself — the column widths live with the component that renders them. */
        --st-event-resize-w:7px;
        --st-event-body-max-h:320px;
        /* A drawn rule: the light line under the dock and the busy bar's top edge. */
        --st-rule-h:1px;
        /* A row of segmented choices, and the round send control beside it. The track height
           itself is the library's — the context bar reads the same one the Segmented does. */
        --st-seg-gap:2px;
        --st-send-size:var(--fang-btn-height-lg);
        /* Chevrons and status dots: the small marks inside a row. */
        --st-mark-sm:4px;
        --st-mark-md:9px;
        --st-mark-lg:12px;
        /* The composer's model picker and the board's pick button. */
        --st-picker-min-w:220px;
        --st-menu-min-w:120px;
        --st-status-menu-min-w:240px;
        --st-review-max-w:520px;
        --st-review-chip-min-w:60px;
        /* The outline's node rows and the find field beside them. */
        --st-find-w:170px;
        --st-find-min-w:60px;
        --st-gutter-w:52px;
        /* The editor's floor: below this a page is not worth opening. */
        --st-editor-min-h:140px;
        /* The type preview's fixed frame: one line of the largest offered type at its loosest
           leading, plus the box's padding. Fixed on purpose — the frame must not jump when the
           chosen size changes; the sample is one line, so the frame is small. */
        --st-preview-h:72px;
        /* The entity page's label column, and the same column inside a fact row. */
        --st-fact-label-w:64px;
        --st-fact-label-w-compact:44px;
        /* The status bar's own height, and the effort axis's tick. */
        --st-statusbar-h:30px;
        --st-effort-tick:5px;

        --st-icon-menu-hit:20px;
        /* The session button's flowing ring: the band's width, the gradient itself, and one
           revolution's duration. The two companion hues are literals on purpose — they are a
           fixed chromatic chord around the accent, not theme surfaces, and all three stops sit
           at a lightness that reads on both themes. */
        --st-session-text-flow:linear-gradient(110deg, var(--fang-accent), color-mix(in srgb, var(--fang-accent) 45%, #fff), var(--fang-accent));
        --st-session-text-dur:5s;
        /* The rail's menu row. It is derived from the row's own parts rather than written as a
           number: the menu's type is one step up from the working size, and a row is its line box
           plus the padding above and below it. */
        --st-row-height-lg:calc(var(--fang-line-height-lg) + var(--fang-space-16));
        /* The gallery card's size. A DIFFERENT card from the graph's: the gallery is a page of
           objects read side by side, the graph is a map with wires that have to land on a known
           box. They shared one variable once, which meant the graph's 140px silently set the
           gallery's column width. */
        /* TWO kinds of card, and they are DIFFERENT COMPONENTS, not one shape at two scales.
           Mixing them into one pair of variables was wrong: the wall's cards are placed by a
           graph layout that computes wire endpoints from their size in JavaScript, so the card
           tile's size could not be changed without moving every wire.

             the wall's card   .st-mosaic-card       portrait fills it, caption over the lower half
             the card tile     .st-mosaic-page-card  portrait band, caption band under it

           Both are PORTRAIT — taller than wide. A card on the wall is a person standing in the
           story, and a wide, short box reads as a row in a table however it is painted; the picture
           has to be given its height back. The wall's is the narrower of the two (120x168): its
           picture is a backdrop for a name, so it needs less width than the page tile, which is the
           content of its own page. The numbers are separate because the components are. */
        --st-card-w:120px;
        --st-card-h:168px;
        /* The cards' SHAPE, not a size: width over height, read by every portrait frame that
           shows a board picture, so one place decides what "the same shape as a card" means. */
        --st-card-aspect:5 / 7;
        --st-gallery-w:184px;
        /* The card tile follows the trading-card standard: 2.5 by 3.5 inches, 1:1.4. That ratio is
           what every printed card game uses, and a reader has handled enough of them to feel when a
           card is wrong: 1:1.25 read as a square tile, not as a card. 184 * 1.4 = 258. */
        --st-gallery-h:258px;
        /* A BOOK card's height, stated as its parts: a square cover (which is the width), the
           identity line under it, one line of meta, and the ACTIONS ROW. Both the shelf card and
           the two trailing tiles (new book, rename) take this one value, so a row of the grid is
           level — written twice it was two numbers to keep in step for one intention. */
        --st-book-card-h:calc(var(--st-gallery-w) + var(--fang-row-height-compact)
          + var(--fang-line-height-sm) + var(--fang-row-height-compact)
          + var(--fang-space-4) + var(--fang-space-24));
        /* The board's own stacking order, INSIDE the sheet. These are not the library's
           --fang-layer-* planes — they are the layers a board page stacks among itself: the
           detail popover over the canvas, the card's ⋯ menu over the card, and the detail page
           over everything but the tabs. Written as numbers they were four unrelated integers;
           as a group they say "what covers what" in one place. */
        --st-mosaic-z-detail:1;
        --st-mosaic-z-card-pin:2;
        --st-mosaic-z-card-menu:3;
        --st-mosaic-z-card-menu-list:4;
        --st-mosaic-z-page:6;
        /* The relations wires. A stroke width is a drawing weight, not a length — it is set
           here with the layers above so the three widths that describe one line live together:
           the hair that is seen, the wide invisible target that takes the pointer, and the
           picked state that reads a step heavier. Unitless, as SVG strokes are. */
        --st-edge-w:1.2;
        --st-edge-hit-w:16;
        --st-edge-picked-w:2;
        --st-edge-opacity:.9;
        /* The investigation wall: a dark board, a red thread, and the metal pin at each card's
           top edge. The thread is a physical object, so its weight and colour are separate from
           the accent used by buttons and focus rings. */
        --st-board-wall:color-mix(in srgb, var(--fang-bg) 82%, #5b3a2e);
        --st-thread-idle:#f2f2f3;
        --st-thread-selected:#d24b4b;
        --st-thread:#d24b4b;
        --st-thread-ink:#f2f2f3;
        --st-thread-w:2;
        --st-thread-picked-w:3;
        --st-thread-label-size:var(--fang-font-size-sm);
        --st-thread-halo-w:3px;
        --st-pin-size:14px;
        --st-pin-metal:radial-gradient(circle at 32% 28%, #fff 0, #d8d8d8 28%, #8a8a8a 66%, #4a4a4a 100%);
        --st-pin-shadow:0 1px 2px rgba(0,0,0,.55);
        /* The two recurring fades. .6 is the quiet-mark tier (a separator dot, a disabled
           tool's icon); .5 is the discarded tier (a proposal the writer turned down). One-offs
           (an animation's start frame, the busy button) stay literals: a token used once is a
           second name for the number, not a decision. */
        --st-fade-quiet:.6;
        --st-fade-dim:.5;
        /* The vertical bookmarks' type: the tracking between glyphs, and the negative inline
           margin that pulls the slot letter-spacing adds AFTER the last glyph back out, so the
           selected pill sits centred on the text. The two are one decision — change the
           tracking and the pull follows it. */
        --st-tab-tracking:2px;
        --st-tab-tracking-pull:-1px;
        /* The welcome page's dot canvas: the dot itself, the lattice step, and how far the
           pointer's highlight reaches. The dots are theme-ink mixes, so the field reads on both
           themes; the bright layer is the pointer's neighbourhood, masked by its position. */
        --st-canvas-dot-size:1px;
        --st-canvas-grid:24px;
        --st-canvas-glow:160px;
        --st-canvas-dot:color-mix(in srgb, var(--fang-ink-primary) 14%, transparent);
        --st-canvas-dot-bright:color-mix(in srgb, var(--fang-ink-primary) 45%, transparent);
        /* The three board steps are what the investigation board's pages, its split panes and
           its slide-over all read, so a page cannot drift a few pixels away from its neighbour.
           The values are the library's spacing steps, named here by what they do on the board. */
        --st-board-gap:var(--fang-space-12);
        --st-board-inset:var(--fang-space-16);
        --st-board-inset-compact:var(--fang-space-12);
        /* The context composition bar. Each segment takes a tone from this eight-colour set,
           stable per part name so the same part keeps its colour when the scene changes. */
        --st-seg-0:#6f7f95;
        --st-seg-1:#8f7552;
        --st-seg-2:#5f7f68;
        --st-seg-3:#7f6278;
        --st-seg-4:#54727f;
        --st-seg-5:#7f7956;
        --st-seg-6:#726394;
        --st-seg-7:#8f6565;
        --st-overlay-inset:32px;
        --st-dialog-textarea-min-h:64px;
        /* The overview page's master-detail: the summary field's fixed height. The list column
           and the split's floor live with the library's split. */
        --st-overview-summary-h:96px;
        /* The card-detail surfaces. The popover, the page's portrait and the picture button are one
           system, so their three sizes live together rather than as fallbacks written where each
           rule happens to use them. */
        --st-detail-w:var(--fang-width-narrow);
        --st-detail-portrait:104px;
        --st-page-portrait:132px;
        --st-generate-size:28px;
        --st-detail-area-max:168px;
        /* The event log's first two columns. The third takes whatever is left, so these two are the
           only fixed widths in that table. */
        --st-log-col-time:96px;
        --st-log-col-name:190px;
        /* The board's floor clearance for the composer dock. */
        --st-mosaic-dock-clearance:150px;
        /* 随笔's dialog height: the capture field plus the list/detail split, not a full-height
           workspace. */
        --st-notes-h:348px;
        --st-notes-capture-h:120px;
        /* Custom-provider model chips: tall enough for a few rows, then scroll. */
        --st-model-list-max-h:160px;
        /* The board's plane in the layer table. The rail, menus, drawers and modals read the
           library's planes; this one is the board's own, between the drawer and the status
           popover — the board page is stacked among itself and over the page below it. */
        --st-layer-mosaic:70;
      }

      /* ---- input fields: one borderless convention ----
         Every field in the panel is a soft well, not a boxed control: a quiet layer fill, no
         stroke, and the focus ring as the only edge. A page of prose ringed with .5px rectangles
         reads as a form to fill in, and the editor itself — the largest input here — is already
         borderless. This is the rule the rest of the panel now follows instead of each field
         carrying its own border and its own radius. */
      .st-input,.st-find-input,.st-chat-input,.st-scan-steer-input{
        box-sizing:border-box;min-width:0;background:var(--fang-surface);
        color:var(--fang-ink-primary);border:none;border-radius:var(--fang-radius-sm);
        padding:var(--fang-space-4) var(--fang-space-8);font-family:inherit;
        font-size:var(--fang-font-size-md);line-height:var(--fang-line-height-md);
        outline:none}
      .st-input::placeholder,.st-find-input::placeholder,
      .st-chat-input::placeholder,.st-scan-steer-input::placeholder{color:var(--dsw-alias-label-dimmed,#e1e5ee)}
      /* Focus is the edge: the ring appears, and nothing shifts, because the border that used to
         change colour is gone and no replacement width is added. */
      .st-input:focus,.st-find-input:focus,.st-chat-input:focus,
      .st-scan-steer-input:focus{box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--fang-focus-ink)}
      /* A character card: a name row, one row of short fields, then the notes.
         One field per line made a 178px card out of a name, a role, a goal and a few traits — two
         people filled the drawer and the rest was scrolling. The name gets its own line because it
         is what the row is about; the other three share the next one. */
      .st-card{border:.5px solid var(--fang-border-edge);border-radius:var(--fang-radius-md);
        padding:var(--fang-space-12) var(--fang-space-12);margin-bottom:var(--fang-space-8);background:var(--fang-surface);min-width:0}
      .st-card[data-status="pending"]{border-color:var(--dsw-alias-state-warn-primary,#f59e0b)}
      .st-card[data-status="final"]{border-color:var(--fang-border-edge)}
      .st-card[data-collapsed="true"]{padding:var(--fang-space-8) var(--fang-space-12)}
      /* The title line of a list row. The row itself is the library's ListRow; this is the
         project's one addition to it — the bold first line each page fills in. */
      .st-list-row-title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
        font-size:var(--fang-font-size-md);line-height:var(--fang-line-height-md);font-weight:var(--fang-font-weight-strong)}
      .fang-list-row[data-active="true"] .st-list-row-title{font-weight:var(--fang-font-weight-strong)}
      /* The session button is the title row's one OUTLINE pill: no fill, so no control dominates
         the row. Its edge is a slow multi-hue light — the flowing ring — drawn by a pseudo-element
         masked to a thin band, so the gradient follows the pill's radius and the centre stays
         open for the label. The hue cycle is a registered custom property: conic gradients
         interpolate the angle, which makes the light run around the ring and loop seamlessly. */
      /* The session button's label carries the accent's own light: the gradient is clipped to the
         GLYPHS (background-clip: text), so the button keeps a quiet outline-free body and only
         the word Harness flows. Hover lifts the light instead of washing a box behind it. */
      .st-session-btn{font-family:inherit;font-size:var(--fang-font-size-md);line-height:var(--fang-line-height-md);
        height:var(--fang-btn-height,var(--fang-btn-height-lg));min-width:var(--fang-btn-height,var(--fang-btn-height-lg));
        display:inline-flex;align-items:center;justify-content:center;
        padding:0 var(--fang-space-16);
        border:none;border-radius:var(--fang-radius-pill);cursor:pointer;white-space:nowrap;flex:none;corner-shape:round;
        background:transparent;color:var(--fang-ink-primary)}
      .st-session-btn:hover{background:var(--fang-hover-fill)}
      /* The flowing outline is a button VARIANT, not a page-local decoration: it keeps the
         standard pill geometry and shares the same focus/hover rules as every other fang-btn. */
      .st-btn-flow{position:relative;isolation:isolate;color:var(--fang-ink-primary)}
      .st-btn-flow::before{content:'';position:absolute;inset:0;border-radius:inherit;padding:var(--st-flow-border-w);
        pointer-events:none;
        background:conic-gradient(from var(--st-flow-angle),var(--fang-accent),color-mix(in srgb,var(--fang-accent) 38%,#fff),var(--fang-accent));
        -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
        -webkit-mask-composite:xor;
        mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
        mask-composite:exclude;
        animation:st-flow-ring var(--st-flow-duration) linear infinite}
      .st-btn-flow-label{position:relative}
      @property --st-flow-angle{syntax:'<angle>';inherits:false;initial-value:0deg}
      @keyframes st-flow-ring{to{--st-flow-angle:360deg}}
      @media (prefers-reduced-motion: reduce){.st-btn-flow::before{animation:none}}
      /* The flowing light lives on the LABEL, not on the button: the wash a hover paints must
         stay on the button's own background, which it cannot be while that background is clipped
         into the glyphs. */
      .st-session-label{background-image:var(--st-session-text-flow);background-size:200% 100%;
        -webkit-background-clip:text;background-clip:text;color:transparent;
        font-style:italic;font-weight:var(--fang-font-weight-strong,600);
        animation:st-session-text-flow var(--st-session-text-dur,5s) linear infinite}
      .st-session-btn:hover .st-session-label{filter:brightness(1.15)}
      .st-session-btn:focus-visible{outline:none;
        box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--fang-focus-ink)}
      @keyframes st-session-text-flow{from{background-position:0% 0}to{background-position:200% 0}}
      @media (prefers-reduced-motion: reduce){.st-session-label{animation:none}}
      /* The title row's icons. The drawer buttons and the mosaic entry are flex rows so an icon
         and its label share a baseline; the icon never shrinks and never takes the label's last
         pixel. */
      .st-bar-icon{flex:none;width:var(--fang-icon-lg);height:var(--fang-icon-lg)}
      .st-card-action-icon{flex:none;width:var(--fang-icon-sm);height:var(--fang-icon-sm)}
      .st-icon-xs{flex:none;width:var(--fang-icon-xs);height:var(--fang-icon-xs)}
      .st-icon-sm{flex:none;width:var(--fang-icon-sm);height:var(--fang-icon-sm)}
      .st-icon-md{flex:none;width:var(--fang-icon-md);height:var(--fang-icon-md)}
      .st-icon-lg{flex:none;width:var(--fang-icon-lg);height:var(--fang-icon-lg)}
      .st-scan-where{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
        font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);color:var(--fang-ink-tertiary)}
      /* The two halves of a diff sit next to each other with nothing between them, so a deleted
         run and the added run that replaces it read as one string. A hair of horizontal padding
         and a small gap separates them without adding punctuation that is not in the text.
         The fills are mixed from the theme's diff colours at low strength rather than used whole:
         a solid green-and-red block inside a page of prose shouts, and the point of the diff is to
         point at the change, not to become the loudest thing on screen. */
      /* Opaque, not a translucent wash.
         The host's diff tokens are alpha 8-12%, which over dark prose is barely a tint and over
         light prose is invisible — and because a word diff alternates
         added and removed runs, a stack of faint washes reads as visual noise rather than as a
         change. These blocks are mixed from the theme's own opaque greens and reds at a strength
         chosen to stay readable behind text, and the text colour is set to match so the words on
         top are not fighting their own background. */
      .st-add{background:color-mix(in srgb, var(--dsw-static-green-500,#22c55e) 22%, var(--dsw-alias-bg-base,#f2f3f5));
        color:var(--fang-ink-primary);
        border-radius:var(--fang-radius-xs);padding:0 var(--fang-space-2);
        box-decoration-break:clone;-webkit-box-decoration-break:clone;corner-shape:round;}
      /* A removed run is a wash, an added run is a block: what is gone should recede, what is new
         should be read. The deletion is genuinely translucent — it sits over the page rather than
         replacing it — while the addition stays opaque so it does not disappear into the prose. */
      .st-del{background:color-mix(in srgb, var(--dsw-static-red-400,#f25a5a) 22%, transparent);
        text-decoration:line-through;text-decoration-thickness:1px;
        color:var(--fang-ink-secondary);
        border-radius:var(--fang-radius-xs);padding:0 var(--fang-space-2);margin-right:var(--fang-space-2);
        box-decoration-break:clone;-webkit-box-decoration-break:clone;corner-shape:round;}
      /* The words either side of an INSERTION, at low opacity and slightly smaller: they are there
         for orientation, not to be read. They must never compete with the suggestion itself. */
      .st-ctx{opacity:.34;font-size:95%;letter-spacing:.01em}
      .st-ctx-before{margin-right:var(--fang-space-2)}
      .st-ctx-after{margin-left:var(--fang-space-2)}
      /* An ellipsis marks a cut in the context, so a short window does not look like the whole of
         the surrounding prose. */
      .st-ctx-before::before,.st-ctx-after::after{content:'…';opacity:.6;margin:0 var(--fang-space-2)}
      /* An insertion has no diff styling: it is not a change to existing text, it is a sentence
         being added, and marking it green (or tinted) made it look like an edit. The contrast with
         the faded neighbours is what separates it — no colour needed. */
      .st-insert{color:var(--fang-ink-primary)}
      /* The pending completion: pale text under the caret, the host's code face. */
      .st-warn{padding:var(--fang-space-8) var(--fang-space-12);font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);color:var(--dsw-alias-state-warn-primary,#f59e0b);
        border-bottom:.5px solid var(--fang-border-edge)}
      /* The merged manuscript reads as a document, not as source: the headings carry the level
         structure the generator wrote, and the prose is the writer's own face and measure. */
`
