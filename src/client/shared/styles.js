/**
 * The stylesheet's floor: the token table, the frame every page sits in, and the two
 * conventions that are not any one component's — a borderless field, and a title row.
 *
 * Tokens come first because everything else reads them. The frame comes next: the shell, the
 * rail, the page column and the scroll area are what every other rule is laid out inside.
 *
 * A component's own styles live in a css module beside it. What is here is what several of
 * them share, which is why it is in shared/ rather than next to one component.
 */
export const CSS_SHARED = `
      /* Radii, semantic colours and the focus ring are host tokens, read from the shipped theme
         rather than invented. Type is NOT: the panel has its own four-step scale and its own font
         stack, because a writing surface mounted into an arbitrary host column should not inherit
         its typography from an ancestor it does not control. See the scale below.
         The one host-managed offset is --dsh-frame-leading-clearance: the shell raises it when
         the sidebar collapses so the frame's leading controls keep their seat. */
      .st-root,.st-root *,.st-shell *{box-sizing:border-box}
      /* The single place the accent is decided: every focus ring, selection, card edge, primary
         action and the send key read this one variable.
         It is the panel's OWN colour, not the host's brand token. The host's brand resolves to a
         near-white on the dark theme the panel runs on, so everything painted with it came out
         white on a near-black page — the panel's "accent" was the absence of one. Naming a colour
         here is what makes the panel look like itself on either host theme.
         The colour is 朱红 (#c3272b), picked on the dark canvas the panel actually runs on —
         the earlier #e34234 read orange against the near-black page, so the accent is a step
         redder and a step darker than that first literal.
         The literal is the value itself rather than a variable: a var() whose fallback is another
         var() is not a fallback at all, and with no theme loaded the whole declaration is invalid
         and every background: var(--st-accent) rule silently paints nothing. */
      /* The panel's type, declared on the one element every other rule sits inside.
         Family here rather than per component, and the working size too: a rule that sets no size
         inherits 13/20, which is what almost every control in this panel is. That is what makes the
         31 "font-family: inherit" rules mean something — they inherit the PANEL's stack, not
         whichever host ancestor happened to declare one. */
      .st-shell{font-family:var(--st-font-family);
        font-size:var(--st-text-md);
        --st-accent:#c3272b;
        /* The panel's ground: pure black by decision, not the host's bg token — the host's base
           in the running dark theme is a grey. Layered surfaces (rail, cards, inputs) keep their
           theme layers and read as raised off this ground. The status bar shares it, so the
           bottom strip does not read as a separate grey band. */
        --st-bg:#000;
        /* THE FALLBACK PALETTE: what every host alias resolves to when the theme is absent.
           Defined once, here; the var(--alias, var(--st-fallback-*)) pattern is safe because these
           are declared on this same rule, in scope for every rule that reads them — unlike a
           literal copied into two hundred var() calls, where changing one changed only one. */
        --st-fallback-ink:#0f1115;
        --st-fallback-ink-soft:#61666b;
        --st-fallback-ink-faint:#81858c;
        --st-fallback-ink-caption:#adb2b8;
        --st-fallback-ink-dimmed:#e1e5ee;
        --st-fallback-ink-contrast:#fff;
        --st-fallback-hover:#2631480f;
        --st-fallback-border-l2:#00000014;
        --st-fallback-border-l3:#0000001f;
        --st-fallback-border-l4:#00000029;
        --st-fallback-page:#f2f3f5;
        --st-fallback-error:#ec1313;
        --st-fallback-warn:#f59e0b;
        --st-fallback-green:#22c55e;
        --st-fallback-scrollbar:#e5e5e5;
        --st-fallback-scrollbar-hover:#d4d4d4;
        /* THE TEXT INK TIERS. Three names for three jobs: a heading or value (primary), body
           copy and controls (secondary), and labels, metadata and disabled copy (tertiary).
           Captions used to have a fourth, almost identical tier; they use tertiary now, so two
           labels side by side can no longer be two different greys by accident. */
        --st-text-primary:var(--dsw-alias-label-primary,var(--st-fallback-ink));
        --st-text-secondary:var(--dsw-alias-label-secondary,var(--st-fallback-ink-soft));
        --st-text-tertiary:var(--dsw-alias-label-tertiary,var(--st-fallback-ink-faint));        /* THE SPACING SCALE.
           Six steps, not seventeen near-duplicates: 2px is the hairline step for marks and tight
           controls, then every layout distance is 4, 8, 12, 16 or 24. A step off that rhythm (6, 10,
           14, 20) is exactly how two adjacent cards came to have 10 and 12 of inner padding: each
           looked right where it was typed, and nothing kept them in step.
           The steps are named by their value rather than by size (sm/md/lg) because a name is an
           opinion and a number is a fact — --st-space-8 says exactly what it is. */
        --st-space-2:2px;
        --st-space-4:4px;
        --st-space-8:8px;
        --st-space-12:12px;
        --st-space-16:16px;
        --st-space-24:24px;
        /* THE LAYOUT SCALE. Spacing says how far apart two things are; these say how a page is
           built, and they must be shared or every board page becomes its own grid. The three
           board steps are what the investigation board's pages, its split panes and its slide-over
           all read, so a page cannot drift a few pixels away from its neighbour. The inset ladder
           is the same idea for controls: an inner padding is one of four sizes, never a one-off. */
        --st-board-gap:var(--st-space-12);
        --st-board-inset:var(--st-space-16);
        --st-board-inset-compact:var(--st-space-12);
        --st-inset-xs:var(--st-space-4);
        --st-inset-sm:var(--st-space-8);
        --st-inset-md:var(--st-space-12);
        --st-inset-xl:var(--st-space-24);
        /* THE RADIUS SCALE, on the same principle as the spacing one.
           The host ships five radii (xs 4, sm 8, md 12, lg 16, panel 28) and every one of them is used
           here through its token. What was NOT covered were the values written locally — 1, 2, 3, 6,
           7, 9 and 18 — each one a small radius that happened to look right where it was typed, and
           none of them shared with the rule beside it. That is the same fragmentation the spacing
           scale was introduced to end: two adjacent chips with 3px and 4px corners, a tag with 2px
           next to a badge with 6px.
           The steps below are the ones this panel actually needs, mapped onto the host's tokens where
           a token exists so a change of theme still reaches them. --st-radius-pill covers 999px,
           which is not a measurement but "as round as the box allows" — it is the same intention
           everywhere it appears, so it deserves a name too. */
        --st-radius-xs:var(--dsw-radius-xs,4px);
        --st-radius-sm:var(--dsw-radius-sm,8px);
        --st-radius-md:var(--dsw-radius-md,12px);
        --st-radius-lg:var(--dsw-radius-lg,16px);
        --st-radius-panel:var(--dsw-radius-panel,28px);
        /* A SHAPE, not a step. The five above are sizes and come from dsh; this one says "as round as
           the box allows", which is a different intention and the only way a 4px dot and a 30px pill
           can both be round. dsh itself writes 999px where it means this, so the value is the same
           as the host's rather than a new invention — it just needed a name so it is not a stray
           literal in sixteen rules. */
        --st-radius-pill:999px;
        /* The two inks the panel draws its own depth with. Not host tokens because they are not part
           of the theme: a drop shadow is black at some opacity whatever the palette says, and the
           highlight that catches a floating card's top edge is white. Naming them keeps the exact
           rgba out of five different rules. */
        --st-shade:0,0,0;
        --st-highlight:#fff;
        /* The send key. It used to be 朱红, a second colour of the panel's own; now it is the
           accent, so the one affirmative control in the composer and every other accented control
           are the same colour instead of two near-misses. The hover is a shade of that same
           colour rather than a second literal, the way the session button's is. */
        --st-send:var(--st-accent,#c3272b);
        --st-send-hover:color-mix(in srgb, var(--st-accent) 86%, #000000);
        /* The keyboard-focus ink. Not the host's focus-ring-color: the shipped dark theme sets it
           to transparent, which on the pure-black ground made every focused control invisible.
           Derived from the primary label so it reads on the ground, on the grey layers and on
           the accent fills alike; each rule keeps its own ring geometry (box-shadow or outline). */
        --st-focus-ink:color-mix(in srgb, var(--dsw-alias-label-primary,var(--st-fallback-ink-contrast)) 45%, transparent);
        /* The two raised surfaces, derived FROM the host's layer tokens instead of read raw: the
           host tuned its greys for its own near-black base, and on the pure-black ground they sat
           a step too light. Each surface pulls its layer 72% toward the ground — one visible step
           of separation, not the full gap. Every raised fill in the panel reads one of these two:
           cards, rail, menus and the tooltip on --st-surface; inputs, selected pills, sheets and
           the model pickers on --st-surface-high. */
        --st-surface:color-mix(in srgb, var(--dsw-alias-bg-layer-1,#232324) 72%, var(--st-bg));
        --st-surface-high:color-mix(in srgb, var(--dsw-alias-bg-layer-2,#2c2c2e) 72%, var(--st-bg));
        /* The selected state of a button, a tab or a list row. Surface-high against the page floor
           was only a few percent of grey apart, which on the near-black ground read as "not
           selected". This mixes the theme ink into the raised surface so the step is visible in
           both themes: lighter than the floor on dark, darker on light.
           The hover tier is quieter than selection on purpose — hover says "under the pointer",
           selection says "this is the one open right now". */
        --st-selected-fill:color-mix(in srgb, var(--st-text-primary) 18%, var(--st-surface));
        /* One hover wash for every button, tab and row. The old per-component hover used a 6%
           transparent ink that disappeared on the near-black ground; this is the same visual
           weight everywhere, so hover and selection cannot look like two different systems. */
        --st-hover-fill:color-mix(in srgb, var(--st-text-primary) 9%, var(--st-surface));
        /* A pressed control is one step darker than hover but still quieter than selection. */
        --st-active-fill:color-mix(in srgb, var(--st-text-primary) 14%, var(--st-surface));
        --st-list-hover:var(--st-hover-fill);
        /* The ink tiers: how strongly the theme's own ink is laid over a surface, for edges,
           dividers, hover ghosts and placeholder glyphs. Written as whole colour mixes (the ink
           at a strength over transparency) so a rule states the TIER it wants, not a percentage.
           Four tiers, quietest first:
             whisper  3%   hover ghosts, marks that are almost not there
             hair     8%   inset dividers and the quietest strokes
             edge    14%   every visible border and ring
             faint   45%   placeholder glyphs that must still be read as a character */
        --st-ink-whisper:color-mix(in srgb, var(--st-text-primary) 3%, transparent);
        --st-ink-hair:color-mix(in srgb, var(--st-text-primary) 8%, transparent);
        --st-ink-edge:color-mix(in srgb, var(--st-text-primary) 14%, transparent);
        --st-ink-faint:color-mix(in srgb, var(--st-text-primary) 45%, transparent);
        /* The ink that sits ON an accent surface: primary buttons, the send key, accent badges.
           Not the host's label-primary-foreground alias — in the theme the panel runs on that
           alias resolves to a dark ink, which read on the old light pink but turns into black
           text on the dark vermilion. White is a constant on purpose, for the same reason the
           tooltip bubble's ink is one. */
        /* The title row's height, in one place: the drawers start below it, so the number cannot
           drift from the row it describes. */
        /* THE TYPE SCALE: four steps, and the panel's own.
           The panel used the host's eleven-step ramp, of which it actually needed nine — and three
           of those nine were token names the host does not ship (2xs-12, l-18, 2xl-22), so those
           rules silently fell back to their literal and stopped tracking the theme. Nine sizes for
           one panel is also more than the panel can use: 12 and 13 sat one pixel apart and were
           picking up each other's work, so the same caption tier read at two sizes in two drawers.
           Four steps, chosen by ROLE rather than by size, because a role is what a rule is trying
           to express when it sets type:

             --st-text-sm    12px/18   the smallest tier: badges, counts, keycaps, IDs, group labels
             --st-text-md    13px/20   the working size: every control, field, card label, menu row
             --st-text-lg    16px/24   section and dialog titles, and the manuscript's interface type
             --st-text-xl    20px/28   a page title, and the one oversized glyph on the new-book tile

           Two things are deliberately NOT on this scale:
             the manuscript itself, which is the writer's own size setting (--st-font-size), and
             the composer's field, which is interface type held at 16/24 so a one-line question is
             not typed at caption size (--st-font-ui).

           Every step carries its leading with it: a size and its line height are one decision, and
           splitting them is how 94 rules ended up with a leading from a different tier than their
           size. */
        --st-text-sm:12px;
        --st-text-sm-leading:18px;
        --st-text-md:13px;
        --st-text-md-leading:20px;
        --st-text-lg:16px;
        --st-text-lg-leading:24px;
        --st-text-xl:20px;
        --st-text-xl-leading:28px;
        /* The two line-height tiers. The steps above carry their own leading for CONTROL text;
           these two are the PROSE rhythms: 1.6 for interface prose that sits inside cards and
           drawers, 1.9 for the manuscript itself (--st-line-height, set per writer in the type
           page — this one is the default, not the floor). */
        --st-line-height-ui:1.6;
        --st-line-height-reading:1.65;
        /* The font family, declared ONCE.
           The panel used to inherit whatever the host's body carried, with four rules repeating the
           host token in full and thirty-one saying "inherit". Both were guesses about a context the
           panel does not own: it is mounted into whichever column the host chooses, and a font
           declared by an ancestor two levels up is not a decision this panel made.
           The stack is written out as literals rather than as the host's font variable because the
           panel is not meant to nod along with the host's typography — it is a writing surface, and
           its own text metrics are its own. The CJK faces are named explicitly: without them a CJK
           fallback is chosen per-platform and the same document reads at different widths on two
           machines. */
        --st-font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans CJK SC",Roboto,sans-serif;
        /* The three weights the panel uses. Read from variables so a rule states intent, not a number. */
        --st-font-weight-normal:400;
        --st-font-weight-medium:500;
        --st-font-weight-strong:600;
        /* The monospace stack, for keycaps and model ids. */
        --st-font-mono:ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace;
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
        --st-glyph-depth:color-mix(in srgb,var(--st-text-primary) 18%,transparent);
        --st-glyph-flip:380ms;
        --st-glyph-z:1;
        --st-glyph-blur:4px;
        --st-glyph-content-pad:6px;
        --st-glyph-ink:color-mix(in srgb,var(--st-text-tertiary) 45%,transparent);
        --st-glyph-ink-primary:color-mix(in srgb,var(--st-text-primary) 26%,transparent);
        --st-glyph-ink-accent:color-mix(in srgb,var(--st-accent) 35%,transparent);
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
        /* ICON SIZES. One ladder for every glyph in the panel: 12 inline, 14 small actions,
           16 controls, 18 title-row/rail icons. A 13px book glyph next to an 18px board glyph
           was the same kind of control drawn at two weights. */
        --st-icon-xs:12px;
        --st-icon-sm:14px;
        --st-icon-md:16px;
        --st-icon-lg:18px;
        --st-icon-menu:var(--st-icon-lg);
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
           They are grouped here, next to the scale they extend, so a page that wants the same
           measure as another page finds it instead of inventing a second one. */
        /* The dock's hairline row: tall enough for the copy above the line to breathe. */
        --st-hairline-row-h:22px;
        /* The event log's table: the drag handle's hit width, and the reading ceiling of the
           list itself — the column widths live with the component that renders them. */
        --st-event-resize-w:7px;
        --st-event-body-max-h:320px;
        /* A drawn rule: the light line under the dock and the busy bar's top edge. */
        --st-rule-h:1px;
        /* A row of segmented choices, and the round send control beside it. */
        --st-seg-h:28px;
        --st-send-size:var(--st-btn-h-lg,36px);
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
        /* 8px of top air (the same drop the shelf head gets from its container) plus the bar
           itself: 16px padding-top, one 36px pill row, 8px padding-bottom. The overlay insets
           declare this value, so bar and overlays move together. */
        --st-titlebar-height:68px;
        /* The session button's flowing ring: the band's width, the gradient itself, and one
           revolution's duration. The two companion hues are literals on purpose — they are a
           fixed chromatic chord around the accent, not theme surfaces, and all three stops sit
           at a lightness that reads on both themes. */
        --st-session-text-flow:linear-gradient(110deg, var(--st-accent), color-mix(in srgb, var(--st-accent) 45%, #fff), var(--st-accent));
        --st-session-text-dur:5s;
        /* The heights of the panel's own control rows. These are not spacing steps: a menu row is as
           tall as one line of text plus its padding, and two menus that answer the same question must
           not be 34 and 32 tall because they were written a week apart.
           The "lg" step carries the rail's menu. It is derived from the row's own parts rather than
           written as a number: the menu's type is one step up from the working size, and a row is its
           line box plus the padding above and below it. Written as 36 it was correct only while the
           menu was at 14px — the moment the type grew, the row kept the old height and the glyph sat
           in it with 8px less room than the padding says it should have. */
        --st-row-height-lg:calc(var(--st-text-lg-leading) + var(--st-space-16,16px));
        /* The BUTTON height ladder: one step for standalone buttons (title row, dialogs, panels),
           one for the inline marks that live inside a text row. Rows and fields keep the row
           heights above — buttons and rows are different ladders. */
        --st-btn-h-xl:48px;
        --st-btn-h-lg:36px;
        --st-btn-h-sm:26px;
        --st-row-height:34px;
        --st-row-height-compact:26px;
        --st-hit-target:44px;
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
        /* The board's own stacking order, INSIDE the sheet. These are not the panel's
           --st-layer-* planes — they are the layers a board page stacks among itself: the
           detail popover over the canvas, the card's ⋯ menu over the card, and the detail page
           over everything but the tabs. Written as numbers they were four unrelated integers;
           as a group they say "what covers what" in one place. */
        --st-mosaic-z-detail:1;
        --st-mosaic-z-card-menu:2;
        --st-mosaic-z-card-menu-list:3;
        --st-mosaic-z-page:6;
        /* The relations wires. A stroke width is a drawing weight, not a length — it is set
           here with the layers above so the three widths that describe one line live together:
           the hair that is seen, the wide invisible target that takes the pointer, and the
           picked state that reads a step heavier. Unitless, as SVG strokes are. */
        --st-edge-w:1.2;
        --st-edge-hit-w:16;
        --st-edge-picked-w:2;
        --st-edge-opacity:.9;
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
        --st-canvas-dot:color-mix(in srgb, var(--st-text-primary) 14%, transparent);
        --st-canvas-dot-bright:color-mix(in srgb, var(--st-text-primary) 45%, transparent);
        /* The page gutter: the shelf's side padding, and the inset both titlebars' dividers keep
           from the panel edges. Wider than a spacing step, because the dot field needs air at the
           edges to read as a canvas rather than as a padded form. */
        --st-shelf-gutter:28px;
        /* Fixed widths that are a layout decision, not a spacing step: the outline's column, the
           confirmation dialog's reading width, and the gap the board keeps from the panel edges.
           Named so a rule that wants one does not carry its own copy of the number. */
        /* THE WIDTH LADDER. Panels used to carry their own pixel widths inline: a dialog said 820,
           its sibling 620, a drawer 720, another 980. Those are six fixed tiers now, so a panel
           picks a role ("wide", "reading") instead of memorising a number, and two dialogs that
           hold the same kind of content cannot end up 200px apart. */
        --st-w-narrow:340px;
        --st-w-compact:440px;
        --st-w-medium:620px;
        --st-w-reading:720px;
        --st-w-wide:820px;
        --st-w-max:980px;
        --st-rail-w:264px;
        --st-dialog-w:var(--st-w-compact);
        --st-dialog-textarea-min-h:64px;
        --st-dialog-max-h:760px;
        --st-overlay-inset:32px;
        /* The overview page's master-detail: the chapter list's column, the floor below which the
           split stops shrinking (it scrolls instead), and the summary field's fixed height. */
        --st-split-list-w:220px;
        --st-split-min-h:320px;
        --st-overview-summary-h:96px;
        /* The card-detail surfaces. The popover, the page's portrait and the picture button are one
           system, so their three sizes live together rather than as fallbacks written where each
           rule happens to use them. */
        --st-detail-w:var(--st-w-narrow);
        --st-detail-portrait:104px;
        --st-page-portrait:132px;
        --st-generate-size:28px;
        --st-detail-area-max:168px;
        /* The event log's first two columns. The third takes whatever is left, so these two are the
           only fixed widths in that table. */
        --st-log-col-time:96px;
        --st-log-col-name:190px;
        /* The board's floor clearance for the composer dock, and the side sheet's default ceiling.
           Both are layout decisions read from one place rather than fallbacks typed in the rule. */
        --st-mosaic-dock-clearance:150px;
        --st-sheet-max:var(--st-w-wide);
        /* 随笔's dialog height: the capture field plus the list/detail split, not a full-height
           workspace. */
        --st-notes-h:348px;
        /* Custom-provider model chips: tall enough for a few rows, then scroll. */
        --st-model-list-max-h:160px;
        --st-notes-capture-h:120px;
        /* A card's edge. Half a pixel at 1x, one at 2x — the browser rounds it, and writing 1px
           made every card look like it had a drawn border. Named because the same hairline is the
           first layer of every shadow in this stylesheet. */
        --st-hairline:.5px;
        /* THE CARD SHADOW, in two states.
           This used to be argued the other way: "a box-shadow cannot be a token, because a layer
           list carries its own colours, so a stored offset list could not be re-coloured". That is
           true of storing the OFFSETS alone — and it is exactly why the recipe was then written
           out longhand in every card rule. The conclusion did not follow: storing the WHOLE shadow,
           colours included, works, because each colour is a color-mix of the theme ink and is
           substituted wherever the token is used. Two rules now share one recipe instead of
           agreeing by luck.

           What is stored is the recipe itself: a hairline contact layer, a close ambient layer, a
           wide soft layer. The first layer takes the shared hairline width, so a card's edge and
           the shadow sitting on that edge cannot drift apart. */
        --st-card-shadow:
          0 0 0 var(--st-hairline) color-mix(in srgb, var(--st-text-primary) 6%, transparent),
          0 1px 2px color-mix(in srgb, var(--st-text-primary) 7%, transparent),
          0 6px 16px color-mix(in srgb, var(--st-text-primary) 6%, transparent);
        /* The lifted state: the same three layers, closer and darker, so a card reads as picked up
           rather than as a different object. */
        --st-card-shadow-lift:
          0 0 0 var(--st-hairline) color-mix(in srgb, var(--st-text-primary) 8%, transparent),
          0 2px 4px color-mix(in srgb, var(--st-text-primary) 9%, transparent),
          0 12px 26px color-mix(in srgb, var(--st-text-primary) 10%, transparent);
        /* THE PANEL SHADOW, for the surfaces that slide in over the page: the two side sheets and
           the outline card.
           A card sits ON something, so its shadow is a contact layer — a hairline, a close cast,
           one soft spread. A panel does not sit on anything: it is a whole surface lifted off the
           page, and it needs separation at its own scale.
           There are two of them, because the direction is not shareable: the sheet enters from the
           RIGHT and its shadow is thrown LEFT, and the outline enters from the left and throws its
           shadow right. One token cannot carry both signs, and a rule that flipped the offset
           with calc() would be a second place the distance can be got wrong. The offset and blur
           are not spacing steps — they describe a light, not a gap — so they are written here
           rather than borrowed from the spacing scale.
           The reach is deliberately short: 6px of offset and 20px of blur is enough to lift the
           surface off the page and no more. A wide, dark throw (18/48 at 18%) looked like the panel
           was hovering half a metre above the page, and on a full-height sheet it read as a dark
           band down the side of the manuscript rather than as depth.
           Every colour is a mix of the theme ink, never a literal black: a fixed rgba shadow is
           invisible on the dark theme, which is how the old shelf card disappeared. */
        --st-panel-shadow-left:
          0 0 0 var(--st-hairline) color-mix(in srgb, var(--st-text-primary) 8%, transparent),
          -6px 0 20px color-mix(in srgb, var(--st-text-primary) 10%, transparent);
        --st-panel-shadow-right:
          0 0 0 var(--st-hairline) color-mix(in srgb, var(--st-text-primary) 8%, transparent),
          6px 0 20px color-mix(in srgb, var(--st-text-primary) 10%, transparent);
        /* The panel's INNER rim: a light line along the top edge, so the surface reads as having a
           thickness rather than being a rectangle of paint. Inset, because a real light would catch
           that edge and not the outside of it. Kept apart from the outer shadow so a rule can take
           one without the other. */
        --st-panel-rim:
          inset 0 1px 0 0 color-mix(in srgb, var(--st-text-primary) 6%, transparent);
        /* A card's state motion: the lift, the edge and the shadow, all on one duration. The
           fallbacks are written in ms rather than .14s so the value still reads as a literal length
           to the stylesheet's own hygiene check. */
        --st-card-motion:box-shadow var(--ds-transition-duration-fast,140ms) var(--ds-ease-in-out,ease-in-out),
          transform var(--ds-transition-duration-fast,140ms) var(--ds-ease-in-out,ease-in-out),
          border-color var(--ds-transition-duration-fast,140ms) var(--ds-ease-in-out,ease-in-out);
        /* A BOOK card's height, stated as its parts: a square cover (which is the width), the
           identity line under it, one line of meta, and the ACTIONS ROW. Both the shelf card and
           the two trailing tiles (new book, rename) take this one value, so a row of the grid is
           level — written twice it was two numbers to keep in step for one intention.

           The actions row is the term that is easy to forget and was: the card clips its contents
           (overflow: hidden, so a hover lift cannot spill), so a row that the sum did not account
           for was not visible but was cut off. Rename and delete sat below the card's own bottom
           edge — present in the tree, unreachable by a pointer. */
        /* The three --st-* terms need no fallback: they are declared on this same rule, a few lines
           above. The host font token DOES, because "no theme" is a supported state and a var()
           without one invalidates the whole declaration. */
        --st-book-card-h:calc(var(--st-gallery-w) + var(--st-row-height-compact)
          + var(--st-text-sm-leading) + var(--st-row-height-compact)
          + var(--st-space-4) + var(--st-space-24));
        /* THE LAYER TABLE.
           Overlays used to carry their own z-index where they were written, so which one covered
           which was decided by DOM order and by luck: the board and a drawer were both 70, and a
           model menu (60) opened while the board was up disappeared behind it. Every overlay now
           takes its layer from this table, and the ordering below IS the rule:
           the outline sits lowest, menus above it, the shared scrim above those, the board above
           the scrim, a drawer above the board (opening one from the board must work), and the
           status popover on top of everything because it is a transient reply. */
        --st-layer-rail:30;
        --st-layer-menu:60;
        --st-layer-mosaic:70;
        --st-layer-drawer:75;
        --st-layer-status:80;
        --st-layer-modal:90;
        /* THE MOTION PAIR. One duration for every overlay, so the outline, a drawer and the board
           all feel like the same system. Closing is faster than opening: an entrance is read,
           an exit only has to get out of the way. */
        --st-motion-open:180ms;
        --st-motion-close:140ms;
        display:flex;flex-direction:column;height:100%;min-height:0;min-width:0;
        font-family:var(--st-font-family);font-size:var(--st-text-md);line-height:var(--st-line-height-ui);
        background:var(--st-bg);color:var(--st-text-primary)}

      /* ---- the title row: the book title, its menu, and the three drawer buttons ---- */
      .st-titlebar{display:flex;align-items:center;gap:var(--st-space-8,8px);flex:none;margin-bottom:var(--st-space-16,16px);min-width:0;
        /* No fixed height: the bar is its content (one row of 36px pills) plus vertical padding,
           so it can never clip its own controls. The padding must keep the bar at the height the
           overlay insets declare (--st-titlebar-height) — bar and insets move together. */
        padding-top:var(--st-space-16,16px);padding-bottom:var(--st-space-8,8px);padding-left:max(var(--st-space-16,16px), calc(var(--dsh-frame-leading-clearance, 0) + var(--st-space-8,8px)));padding-right:var(--st-space-12,12px);
        border-bottom:var(--st-hairline) solid var(--dsw-alias-border-l3,var(--st-fallback-border-l3))}
      /* A border paints on the element's own box, so the element's padding cannot inset it —
         only a container or a margin can. The shelf head sits inside its scroll container, whose
         padding supplies the top air and the page gutter; the shell's own bar has no container,
         so it declares the same two insets as margins. Both dividers then share one geometry:
         the same side inset and the same drop from the panel's top edge. */
      .st-shell>.st-titlebar{margin-top:var(--st-space-8,8px);margin-left:var(--st-shelf-gutter);margin-right:var(--st-shelf-gutter)}
      .st-title{margin:0;font-size:var(--st-text-xl);line-height:var(--st-text-xl-leading);font-weight:var(--st-font-weight-strong);color:var(--st-text-primary);
        overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:0 1 auto}
      /* The title row's icons. The drawer buttons and the mosaic entry are flex rows so an icon
         and its label share a baseline; the icon never shrinks and never takes the label's last
         pixel. */
      .st-bar-icon{flex:none;width:var(--st-icon-lg);height:var(--st-icon-lg)}
      .st-card-action-icon{flex:none;width:var(--st-icon-sm);height:var(--st-icon-sm)}
      .st-icon-xs{flex:none;width:var(--st-icon-xs);height:var(--st-icon-xs)}
      .st-icon-sm{flex:none;width:var(--st-icon-sm);height:var(--st-icon-sm)}
      .st-icon-md{flex:none;width:var(--st-icon-md);height:var(--st-icon-md)}
      .st-icon-lg{flex:none;width:var(--st-icon-lg);height:var(--st-icon-lg)}

      /* The frame: rail, page column, and the scroll area inside them ---- */
      .st-root{display:flex;flex:1 1 auto;min-height:0;min-width:0;width:100%;overflow:hidden}
      .st-col{display:flex;flex-direction:column;min-height:0;min-width:0}
      /* The outline is an overlay, not a column: it covers the left edge of the page and slides in
         from there. inset-block:0 with left:0 is what makes it flush: the card touches the
         panel's left edge and both the top and the bottom with no gap, and only its right side is
         rounded, because the other two corners are against the frame.
         Its positioning context is this layer, which spans the whole shell BELOW the title row:
         the card has to reach the panel's bottom edge, and the status bar is inside that span, so
         a context that ended at the bar could never produce it. */
      .st-rail-layer{position:absolute;z-index:var(--st-layer-rail);
        inset:var(--st-titlebar-height,68px) 0 0 0;
        /* A span, not a surface: it paints nothing and takes no clicks, so a folded outline cannot
           swallow a click meant for the page under it. */
        pointer-events:none}
      .st-rail{position:absolute;inset:0 auto 0 0;width:var(--st-rail-w);pointer-events:auto;
        display:flex;flex-direction:column;min-height:0;
        background:var(--st-surface);border:none;
        border-radius:0 var(--st-radius-lg,16px) var(--st-radius-lg,16px) 0;
        /* The left-entry twin of the sheet's shadow: this card is attached to the left frame and
           comes in from that edge, so its cast goes right, away from where it is anchored. */
        box-shadow:var(--st-panel-rim),var(--st-panel-shadow-right);
        animation:st-rail-in var(--st-motion-open,180ms) var(--ds-ease-in-out,ease-in-out) both}
      @keyframes st-rail-in{from{transform:translateX(-18px);opacity:0}to{transform:none;opacity:1}}
      /* Leaving is the entrance run backwards, and faster: an exit only has to get out of the way.
         A closing overlay keeps its node for the duration, so the animation is seen instead of the
         element vanishing between frames. */
      .st-closing .st-rail{animation:st-rail-out var(--st-motion-close,140ms) var(--ds-ease-in-out,ease-in-out) both}
      @keyframes st-rail-out{from{transform:none;opacity:1}to{transform:translateX(-18px);opacity:0}}
      .st-rail-collapsed{display:none}
      /* The scrim is invisible: the page stays readable while the outline is open, and a dimming
         layer over the manuscript would defeat the point of glancing at the contents. */
      .st-rail-scrim{position:absolute;inset:0;z-index:calc(var(--st-layer-rail) - 1);background:transparent}
      /* The few gaps that used to be inline styles on individual elements. They are the same steps as
         the scale above, named by what they do — the margin between two rows, a hint under its field,
         a block of evidence under a section — so the JSX says what the gap is FOR and the number
         lives in one place with every other number. */
      .st-gap-under-row{margin-bottom:var(--st-space-12,12px)}
      .st-gap-under-hint{margin-bottom:var(--st-space-8,8px)}
      .st-gap-over-row{margin-top:var(--st-space-8,8px)}
      .st-gap-over-section{margin-top:var(--st-space-12,12px)}
      .st-mid{flex:1 1 auto;min-width:0}
      .st-rail-toggle{display:inline-flex;align-items:center;justify-content:center;
        /* flex: none below already forbids shrinking; max-width/max-height said the same thing twice
           more, which is three places to keep in step for one intention. */
        /* The hit target, not the compact row step. It was 26 square — the size of a chip inside a
           field — and it is not inside a field: it is the first control in the title row, beside
           buttons that all sit at 26 with a gap. At the shared target step it is as reachable as
           anything else in that row and no longer reads as decoration. */
        width:var(--st-btn-h-lg,36px);height:var(--st-btn-h-lg,36px);padding:0;
        border:none;background:transparent;color:var(--st-text-primary);cursor:pointer;white-space:nowrap;
        border-radius:var(--st-radius-pill,999px);flex:none;corner-shape:round;
        /* The leading inset is the titlebar's own padding (the same leading clearance the shelf
           head takes) — no per-button margin on top of it, so both views start their row at the
           same distance from the frame edge. */}
      /* The rail's own scroll box fills the card: the tree is longer than the card on any book
         with more than a handful of sections, and a box sized to its content pushed the last row
         past the bottom edge instead of scrolling to it. */
      .st-rail .st-scroll{flex:1 1 auto;min-height:0}
      .st-scroll{overflow:auto;padding:var(--st-space-12,12px);min-height:0;min-width:0}
      /* ---- the shared master-detail split: 概览 / 提案 / 流派 ---- */
      .st-split{display:flex;gap:var(--st-board-gap);flex:1 1 auto;min-height:var(--st-split-min-h,320px);min-width:0}
      .st-split-list{flex:0 0 var(--st-split-list-w,220px);min-width:0;min-height:0;
        display:flex;flex-direction:column;overflow:hidden;padding:0}
      .st-split-detail{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;min-height:0;
        overflow:hidden;border:var(--st-hairline,.5px) solid var(--st-ink-edge);
        border-radius:var(--st-radius-md,12px);corner-shape:round;background:var(--st-surface)}
      .st-split-detail-head{display:flex;align-items:baseline;gap:var(--st-space-8,8px);flex:none;
        padding:var(--st-board-inset-compact) var(--st-board-inset);
        border-bottom:var(--st-hairline,.5px) solid var(--st-ink-hair)}
      .st-split-detail-title{margin:0;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
        font-size:var(--st-text-lg);line-height:var(--st-text-lg-leading);font-weight:var(--st-font-weight-strong);
        color:var(--st-text-primary)}
      .st-split-detail-meta{flex:none;margin-left:auto;font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-tertiary)}
      .st-split-detail-body{flex:1 1 auto;min-height:0;overflow:auto;
        display:flex;flex-direction:column;gap:var(--st-board-gap);padding:var(--st-board-inset)}
      .st-card{border:.5px solid var(--dsw-alias-border-l3,var(--st-fallback-border-l3));border-radius:var(--st-radius-md,12px);
        padding:var(--st-space-12,12px) var(--st-space-12,12px);margin-bottom:var(--st-space-8,8px);background:var(--st-surface);min-width:0}
      .st-card[data-status="pending"]{border-color:var(--dsw-alias-state-warn-primary,var(--st-fallback-warn))}
      .st-card[data-status="final"]{border-color:var(--dsw-alias-border-l3,var(--st-fallback-border-l3))}
      .st-card[data-collapsed="true"]{padding:var(--st-space-8,8px) var(--st-space-12,12px)}
      /* THE ONE LIST. Chapters, proposals and snapshots are all "a column of comparable rows":
         every row keeps its own hairline border, there is no gap between them, and the row under
         the pointer lifts off the column. Selected is the same lift with a stronger fill. */
      .st-list{display:flex;flex-direction:column;gap:var(--st-space-2);min-width:0;min-height:0;flex:1 1 auto;overflow:auto;
        padding:var(--st-space-4);
        border:var(--st-hairline) solid var(--st-ink-edge);border-radius:var(--st-radius-md,12px);corner-shape:round;
        background:var(--st-surface)}
      .st-list-row{position:relative;display:flex;flex-direction:column;gap:var(--st-space-2,2px);
        width:100%;min-width:0;box-sizing:border-box;
        padding:var(--st-space-10,10px) var(--st-space-12,12px);
        border:none;background:transparent;text-align:left;font-family:inherit;
        color:var(--st-text-primary);
        border-radius:var(--st-radius-sm,8px);corner-shape:round;
        transition:background var(--ds-transition-duration-fast,140ms) var(--ds-ease-in-out,ease-in-out)}
      .st-list-row:hover{background:var(--st-list-hover)}
      .st-list-row[data-active="true"]{background:var(--st-selected-fill);
        color:var(--st-text-primary)}
      button.st-list-row{cursor:pointer}
      .st-list-row-title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
        font-size:var(--st-text-md);line-height:var(--st-text-md-leading);font-weight:var(--st-font-weight-strong)}
      .st-list-row[data-active="true"] .st-list-row-title{font-weight:var(--st-font-weight-strong)}
      .st-list-row-meta{min-width:0;font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-secondary)}
      /* A character card: a name row, one row of short fields, then the notes.
         One field per line made a 178px card out of a name, a role, a goal and a few traits — two
         people filled the drawer and the rest was scrolling. The name gets its own line because it
         is what the row is about; the other three share the next one. */

      /* ---- input fields: one borderless convention ----
         Every field in the panel is a soft well, not a boxed control: a quiet layer fill, no
         stroke, and the focus ring as the only edge. A page of prose ringed with .5px rectangles
         reads as a form to fill in, and the editor itself — the largest input here — is already
         borderless. This is the rule the rest of the panel now follows instead of each field
         carrying its own border and its own radius. */
      .st-input,.st-find-input,.st-chat-input,.st-scan-steer-input{
        box-sizing:border-box;min-width:0;background:var(--st-surface);
        color:var(--st-text-primary);border:none;border-radius:var(--st-radius-sm,8px);
        padding:var(--st-space-4,4px) var(--st-space-8,8px);font-family:inherit;
        font-size:var(--st-text-md);line-height:var(--st-text-md-leading);
        outline:none}
      .st-input::placeholder,.st-find-input::placeholder,
      .st-chat-input::placeholder,.st-scan-steer-input::placeholder{color:var(--dsw-alias-label-dimmed,var(--st-fallback-ink-dimmed))}
      /* Focus is the edge: the ring appears, and nothing shifts, because the border that used to
         change colour is gone and no replacement width is added. */
      .st-input:focus,.st-find-input:focus,.st-chat-input:focus,
      .st-scan-steer-input:focus{box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--st-focus-ink)}
      /* The panel's own dropdown and file trigger. Both exist because the browser's native
         controls paint outside the panel's stacking order: the log filter's option list was
         covered by the control itself, and a bare file input is an OS widget in the middle of
         a styled form. The popup here is a child of the panel, so it always sits above it. */
      .st-dropdown{position:relative;display:inline-flex;min-width:0;max-width:100%}
      .st-dropdown-button{box-sizing:border-box;display:inline-flex;align-items:center;gap:var(--st-space-8,8px);
        width:100%;height:var(--st-row-height,34px);padding:0 var(--st-space-12,12px);
        border:none;border-radius:var(--st-radius-sm,8px);background:var(--st-surface);
        color:var(--st-text-primary);font-family:inherit;
        font-size:var(--st-text-md);line-height:var(--st-text-md-leading);text-align:left;
        cursor:pointer;outline:none;white-space:nowrap}
      .st-dropdown-button:hover{background:var(--st-hover-fill)}
      .st-dropdown-button:focus-visible{box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--st-focus-ink)}
      .st-dropdown-value{min-width:0;overflow:hidden;text-overflow:ellipsis}
      .st-dropdown-list{position:absolute;z-index:var(--st-layer-menu);top:calc(100% + 4px);left:0;
        display:flex;flex-direction:column;min-width:100%;max-width:min(320px,calc(100vw - 48px));
        max-height:min(46vh,320px);overflow:auto;padding:var(--st-space-4,4px);
        border-radius:var(--st-radius-md,12px);corner-shape:round;background:var(--st-surface-high);
        box-shadow:var(--dsw-elevation-prominent,0 0 0 .5px rgba(0,0,0,.08),0 2px 8px rgba(0,0,0,.12));
        scrollbar-width:thin}
      .st-dropdown-option{display:block;width:100%;padding:var(--st-space-8,8px) var(--st-space-12,12px);
        border:none;border-radius:var(--st-radius-sm,8px);corner-shape:round;background:transparent;
        color:var(--st-text-primary);font-family:inherit;
        font-size:var(--st-text-md);line-height:var(--st-text-md-leading);text-align:left;
        cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .st-dropdown-option:hover{background:var(--st-hover-fill)}
      .st-dropdown-option[aria-selected="true"]{background:var(--st-selected-fill);
        color:var(--st-text-primary);font-weight:var(--st-font-weight-strong)}
      .st-file-button{display:inline-flex;align-items:center;min-width:0}
      .st-file-input{position:absolute;width:0;height:0;opacity:0;pointer-events:none}
      /* A field that is only a line of text in a row (renaming a node in the outline) keeps the
         fill but drops the padding: it sits inside the row, not on a page of its own. */
      /* Buttons are text with a hover wash, not bordered chips. A writing surface ringed with
         outlines reads as a form; the host's own toolbars are flat, and so is this. */
      /* Buttons are equal-height pills: one height token, the shape closed by the pill radius,
         and the circle case (a button holding only an icon) falls out of equal width and
         height for free. Inline controls that live inside a text row (the outline's rename and
         remove marks) override --st-btn-h down to the compact row instead of inheriting it. */
      .st-btn{font-family:inherit;font-size:var(--st-text-md);line-height:var(--st-text-md-leading);
        height:var(--st-btn-h,var(--st-btn-h-lg,36px));min-width:var(--st-btn-h,var(--st-btn-h-lg,36px));
        padding:0 var(--st-space-12,12px);
        display:inline-flex;align-items:center;justify-content:center;
        border-radius:var(--st-radius-pill,999px);border:none;corner-shape:round;
        background:transparent;color:var(--st-text-secondary);cursor:pointer;white-space:nowrap;flex:none}
      .st-btn:hover:not(:disabled){background:var(--st-hover-fill);color:var(--st-text-primary)}
      .st-btn:active:not(:disabled){background:var(--st-active-fill);color:var(--st-text-primary)}
      .st-btn:focus-visible{box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--st-focus-ink);outline:none}
      .st-btn:disabled{opacity:.45;cursor:not-allowed}
      /* The affirmative button fills with the accent, like everything else that means "this one".
         It used to take the host's primary fill, which is the brand token: on the dark theme that
         is near-white, so the confirm button in every dialog was the same white slab as the page's
         own controls and the panel's colour appeared nowhere. */
      /* The affirmative button fills with the accent, like everything else that means "this one".
         Its horizontal padding sits a step above the other buttons: a capsule whose two end arcs
         are the widest thing in the shape reads as an oval — the straight run between the ends
         is what makes a pill read as a pill, and a short label needs the extra padding to show it. */
      .st-btn-primary{background:var(--st-accent,#c3272b);color:var(--st-on-accent,#fff);
        padding:0 var(--st-space-16,16px)}
      /* The session button is the title row's one OUTLINE pill: no fill, so no control dominates
         the row. Its edge is a slow multi-hue light — the flowing ring — drawn by a pseudo-element
         masked to a thin band, so the gradient follows the pill's radius and the centre stays
         open for the label. The hue cycle is a registered custom property: conic gradients
         interpolate the angle, which makes the light run around the ring and loop seamlessly. */
      /* The session button's label carries the accent's own light: the gradient is clipped to the
         GLYPHS (background-clip: text), so the button keeps a quiet outline-free body and only
         the word Harness flows. Hover lifts the light instead of washing a box behind it. */
      .st-session-btn{font-family:inherit;font-size:var(--st-text-md);line-height:var(--st-text-md-leading);
        height:var(--st-btn-h,var(--st-btn-h-lg,36px));min-width:var(--st-btn-h,var(--st-btn-h-lg,36px));
        display:inline-flex;align-items:center;justify-content:center;
        padding:0 var(--st-space-16,16px);
        border:none;border-radius:var(--st-radius-pill,999px);cursor:pointer;white-space:nowrap;flex:none;corner-shape:round;
        background:transparent;color:var(--st-text-primary)}
      .st-session-btn:hover{background:var(--st-hover-fill)}
      /* The flowing outline is a button VARIANT, not a page-local decoration: it keeps the
         standard pill geometry and shares the same focus/hover rules as every other st-btn. */
      .st-btn-flow{position:relative;isolation:isolate;color:var(--st-text-primary)}
      .st-btn-flow::before{content:'';position:absolute;inset:0;border-radius:inherit;padding:var(--st-flow-border-w);
        pointer-events:none;
        background:conic-gradient(from var(--st-flow-angle),var(--st-accent),color-mix(in srgb,var(--st-accent) 38%,#fff),var(--st-accent));
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
        font-style:italic;font-weight:var(--st-font-weight-strong,600);
        animation:st-session-text-flow var(--st-session-text-dur,5s) linear infinite}
      .st-session-btn:hover .st-session-label{filter:brightness(1.15)}
      .st-session-btn:focus-visible{outline:none;
        box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--st-focus-ink)}
      @keyframes st-session-text-flow{from{background-position:0% 0}to{background-position:200% 0}}
      @media (prefers-reduced-motion: reduce){.st-session-label{animation:none}}
      .st-btn-primary:hover:not(:disabled){background:color-mix(in srgb, var(--st-accent) 86%, #000000);color:var(--st-on-accent,#fff)}
      /* The hero size for a page whose only action is this one button. It is a step on the same
         size ladder, not a local override: height, type and padding move together. */
      .st-btn.st-btn-xl{--st-btn-h:var(--st-btn-h-xl,48px);font-size:var(--st-text-lg);line-height:var(--st-text-lg-leading);
        padding:0 var(--st-space-24,24px)}
      .st-btn-ghost{background:transparent;padding:0 var(--st-space-8,8px);color:var(--st-text-tertiary)}
      .st-btn-ghost:hover:not(:disabled){background:var(--st-hover-fill);color:var(--st-text-primary)}
      .st-btn-ghost:active:not(:disabled){background:var(--st-active-fill);color:var(--st-text-primary)}
      /* An icon-only button is the same 36px control as every other st-btn: one height token,
         one pill radius, and no text padding. It is a variant, not a bespoke square. */
      .st-btn-ghost.st-btn-icon{padding:0;background:var(--st-bg);
        box-shadow:inset 0 0 0 var(--st-hairline) var(--st-ink-edge)}
      /* Inputs keep a hairline: a field with no edge at all disappears into the page. */
      .st-btn[aria-pressed="true"]:not(:disabled),.st-btn[aria-pressed="true"]:hover:not(:disabled){background:var(--st-selected-fill);color:var(--st-text-primary)}
      /* The panel's own tooltip: a dark bubble opening DOWNWARD from the control, with a small
         caret pointing back up at it. It sits on the same grey layer every popover uses — a
         raised card like the rest, not a darker-than-page mix, which on the pure-black ground
         had nothing left to darken into. */
      .st-tip{position:absolute;z-index:var(--st-layer-menu);transform:translateX(-50%);
        pointer-events:none;padding:var(--st-space-4,4px) var(--st-space-12,12px);
        border:var(--st-hairline) solid color-mix(in srgb, #fff 14%, transparent);border-radius:var(--st-radius-sm,8px);corner-shape:round;
        background:var(--st-surface);
        color:#fff;font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        white-space:nowrap;box-shadow:0 2px 8px color-mix(in srgb, #000 30%, transparent)}
      .st-tip::after{content:'';position:absolute;top:calc(-1 * var(--st-space-4,4px));left:calc(50% - var(--st-space-4,4px));
        width:var(--st-space-8,8px);height:var(--st-space-8,8px);background:inherit;
        transform:rotate(45deg);border-radius:var(--st-hairline)}
      .st-row{display:flex;gap:var(--st-space-8,8px);align-items:center;min-width:0}
      .st-spacer{flex:1 1 auto;min-width:0}
      .st-muted{color:var(--st-text-tertiary);font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading)}
      .st-scan-where{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);color:var(--st-text-tertiary)}
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
      .st-add{background:color-mix(in srgb, var(--dsw-static-green-500,var(--st-fallback-green)) 22%, var(--dsw-alias-bg-base,var(--st-fallback-page)));
        color:var(--st-text-primary);
        border-radius:var(--st-radius-xs,4px);padding:0 var(--st-space-2,2px);
        box-decoration-break:clone;-webkit-box-decoration-break:clone;corner-shape:round;}
/* A removed run is a wash, an added run is a block: what is gone should recede, what is new
         should be read. The deletion is genuinely translucent — it sits over the page rather than
         replacing it — while the addition stays opaque so it does not disappear into the prose. */
      .st-del{background:color-mix(in srgb, var(--dsw-static-red-400,#f25a5a) 22%, transparent);
        text-decoration:line-through;text-decoration-thickness:1px;
        color:var(--st-text-secondary);
        border-radius:var(--st-radius-xs,4px);padding:0 var(--st-space-2,2px);margin-right:var(--st-space-2,2px);
        box-decoration-break:clone;-webkit-box-decoration-break:clone;corner-shape:round;}
      /* The words either side of an INSERTION, at low opacity and slightly smaller: they are there
         for orientation, not to be read. They must never compete with the suggestion itself. */
      .st-ctx{opacity:.34;font-size:95%;letter-spacing:.01em}
      .st-ctx-before{margin-right:var(--st-space-2,2px)}
      .st-ctx-after{margin-left:var(--st-space-2,2px)}
      /* An ellipsis marks a cut in the context, so a short window does not look like the whole of
         the surrounding prose. */
      .st-ctx-before::before,.st-ctx-after::after{content:'…';opacity:.6;margin:0 var(--st-space-2,2px)}
      /* An insertion has no diff styling: it is not a change to existing text, it is a sentence
         being added, and marking it green (or tinted) made it look like an edit. The contrast with
         the faded neighbours is what separates it — no colour needed. */
      .st-insert{color:var(--st-text-primary)}
      /* The pending completion: pale text under the caret, the host's code face. */
      .st-warn{padding:var(--st-space-8,8px) var(--st-space-12,12px);font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);color:var(--dsw-alias-state-warn-primary,var(--st-fallback-warn));
        border-bottom:.5px solid var(--dsw-alias-border-l3,var(--st-fallback-border-l3))}
      /* The merged manuscript reads as a document, not as source: the headings carry the level
         structure the generator wrote, and the prose is the writer's own face and measure. */
`
