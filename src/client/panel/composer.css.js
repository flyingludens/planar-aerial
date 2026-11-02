/**
 * Everything in the dock under the page: the composer, the model seat inside it, the
 * thinking row, the answer log, and the strip that shows who is in the chapter.
 */
export const CSS_COMPOSER = `
      /* ---- the dock: the composer slot, its hairline, and the working state ---- */
      .st-ai-dock{flex:none;display:flex;flex-direction:column;gap:var(--fang-space-12,12px);min-width:0;position:relative;
        /* The card's bottom edge clears the window by its own radius. It is the last row of a
           column that ends at the panel's bottom edge, and an element flush with an ancestor's
           edge has its outer edge — and with it the outer half of the rounded corner — painted
           UNDER that edge. A 28px corner therefore drew a thin line across its bottom, which read
           as a rule covering the box's lower edge rather than as a rounded card. Nested shapes are
           safe: their clipping ancestor is this card, not the window. */
        margin:0 0 var(--fang-space-4,4px);
        padding:var(--fang-space-16,16px) var(--fang-space-16,16px) var(--fang-space-12,12px);border:none;
        border-radius:var(--fang-radius-panel,28px);
        background:var(--dsw-specific-input-major,var(--fang-surface-high));
        box-shadow:var(--dsw-elevation-soft,0 0 0 .5px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.03),0 0 24px rgba(0,0,0,.03));
        /* Interface type by default, NOT the manuscript's.
           The dock is one card holding three unlike things: a question box, a reply, and a proposed
           passage. Only the last one is a sentence of the book, so only it is set in the book's
           type. Declaring the manuscript size here made everything inherit it — the composer's own
           field typed at 16/1.9 while every other input in dsh types at 13/20, which read as a box
           borrowed from another application. The manuscript metrics live on .st-ai-dock-text below,
           where the three kinds are told apart.
           The 16px in this card belongs to the INPUT and to a short passage, and to nothing else:
           the buttons, the cast list and the scan panel each set their own 13px, so they stay the
           size they were. */
        font-family:inherit;font-size:var(--fang-font-size-md);
        line-height:var(--fang-line-height-md);
        color:var(--fang-ink-primary);
        /* Grows with its content. A fixed 320px cap cut a long answer short and made the writer
           scroll inside a box that looked like it had room — the dock is a region of the page, so
           it takes the height it needs and the page scrolls, not the answer. The ceiling exists
           only so a runaway reply cannot push the manuscript off screen entirely. */
        max-height:none;
        animation:st-dock-in .18s var(--ds-ease-in-out,ease-in-out) both}
      /* The card's one coloured ornament, borrowed from the input-first tools: a hairline of the
         accent along the TOP edge only, fading out at both ends. It marks the box the writer
         types into without putting a border around it. */
      .st-ai-dock::before{content:'';position:absolute;top:0;left:var(--fang-space-24,24px);right:var(--fang-space-24,24px);
        height:var(--fang-hairline);border-radius:var(--fang-radius-pill,999px);corner-shape:round;
        background:linear-gradient(90deg, transparent, var(--fang-accent) 50%, transparent);
        opacity:.55;pointer-events:none}
      /* A fade, not a slide: it belongs to the page above it and should not look like it flew in. */
      @keyframes st-dock-in{from{opacity:0}to{opacity:1}}
      /* The slot holds BOTH faces of the dock — the open box and, pressed directly against its
         bottom edge, the hairline. No margin between them: the line is where the box closes. */
      .st-dock-slot{flex:none;display:flex;flex-direction:column;min-width:0}
      .st-dock-slot .st-hairline{margin-top:0}
      /* The dock's persistent hairline: one glowing line at the page's bottom edge. It is the
         same element in three moods — the idle breathing glow, the working line with its rotating
         copy, and the kept result waiting to be re-opened — so the dock never truly disappears.
         The thinking copy sits ABOVE the line: the button stacks a copy row over the glow row. */
      .st-hairline{position:relative;display:flex;flex-direction:column;justify-content:flex-end;
        gap:var(--fang-space-2,2px);width:100%;
        min-height:var(--st-hairline-row-h,22px);padding:0;border:none;background:transparent;cursor:default;
        font-family:inherit;color:var(--fang-ink-tertiary);outline:none;margin-top:var(--fang-space-8,8px)}
      /* Only a kept line is a button: it holds a result one click away. Idle is ambient. */
      .st-hairline[data-state="kept"]{cursor:pointer}
      /* Idle and kept are the same face of the dock at rest: same glow speed, same strength,
         same click. Only working is brighter — that is the one state that means "wait". */
      .st-hairline:focus-visible{box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--fang-focus-ink);
        border-radius:var(--fang-radius-sm,8px)}
      /* The line itself, at rest: a plain 1px rule in the border grey.
         It used to glow in every state — weaker when idle, held when a result waited, strongest
         while the model worked. That made the accent the panel's permanent furniture at the bottom
         edge, and it made "there is something here" and "something is happening" look like two
         strengths of the same thing. They are different things:
           at rest        a rule, the way any other edge in this panel is drawn
           a result waits a rule, plus the word saying so — the line stays quiet
           working        the only lit state: the accent, and it breathes
         Nothing about the line is a promise until there is something behind it. */
      /* THE LINE IS A GRADIENT, NOT A STROKE.
         It is brightest at its centre and fades to nothing at both ends, so it reads as a light
         lying on the page rather than as a divider drawn across it. A solid rule would have to be
         clipped by something to fade; a mask does it without another element.
         The track is a flex row, and the lit part is this element centred in it — which is what
         lets the line GROW outward from its middle instead of sliding: at rest it occupies a third
         of the width, and while the model works it takes all of it. */
      .st-hairline-glow{position:relative;flex:0 0 auto;width:33.33%;height:var(--st-rule-h,1px);min-width:0;
        align-self:center;
        /* The gradient is the whole visual: transparent, up to a bright centre, back to transparent.
           Mixed from the border ink at rest, from the accent while working, so one shape serves
           both states and only the colour changes. */
        background:linear-gradient(to right,
          transparent 0%,
          color-mix(in srgb, var(--fang-border-edge) 40%, transparent) 22%,
          var(--fang-border-edge) 50%,
          color-mix(in srgb, var(--fang-border-edge) 40%, transparent) 78%,
          transparent 100%);
        /* No rounding and no shadow: the ends are already the fade, and a radius on a 1px line drew
           two darker dots where the gradient was leaving. */
        border-radius:0;
        box-shadow:none;
        transition:width var(--ds-transition-duration-slow,260ms) var(--ds-ease-in-out,ease-in-out),
          height var(--ds-transition-duration-slow,260ms) var(--ds-ease-in-out,ease-in-out),
          background var(--ds-transition-duration-slow,260ms) var(--ds-ease-in-out,ease-in-out)}
      /* WORKING: the same line as at rest, stretched across the page and lit.
         The line ITSELF does not change shape. It stays a 1px gradient — the resting line, longer —
         and everything that makes it read as glowing lives in a drop-shadow. That matters beyond
         taste: a drop-shadow is cast from the element's own painted alpha, so the halo fades out
         exactly where the gradient does and the light converges at both ends on its own. A
         box-shadow would be cast from the BOX instead, drawing a bright bar along a line that has
         already gone transparent there.
         The fill peaks at 62% rather than a solid bar, so the 1px line stays a line; the light it
         throws is brighter than that, because a halo that cannot be seen reads as no halo at all.
         An earlier version peaked at 85% with an 80px cast, and at that strength the glow was the
         brightest thing in the panel while the writer was reading — these are just under it. */
      .st-hairline[data-state="working"] .st-hairline-glow{
        width:100%;
        background:linear-gradient(to right,
          transparent 0%,
          color-mix(in srgb, var(--fang-accent) 16%, transparent) 26%,
          color-mix(in srgb, var(--fang-accent) 62%, transparent) 50%,
          color-mix(in srgb, var(--fang-accent) 16%, transparent) 74%,
          transparent 100%);
        filter:drop-shadow(0 0 4px color-mix(in srgb, var(--fang-accent) 65%, transparent))
          drop-shadow(0 0 12px color-mix(in srgb, var(--fang-accent) 32%, transparent))
          drop-shadow(0 0 30px color-mix(in srgb, var(--fang-accent) 16%, transparent));
        animation:st-hairline-breathe 0.9s ease-in-out infinite}
      /* The breath: 0.9s, and only 18% of the range. Fast enough to read as alive at a glance and
         slow enough not to strobe; a wider sweep at this speed did look like a pulse, which pulls
         the eye off the page every second. */
      @keyframes st-hairline-breathe{0%,100%{opacity:.82}50%{opacity:1}}
      /* The copy row: single line above the glow, caption scale, clipped so a long question
         cannot push the line taller. While working the rotating beats render inside this row;
         the row is absent in every other state, so the line sits alone. */
      .st-hairline-copy{display:block;min-width:0;overflow:hidden;
        text-overflow:ellipsis;white-space:nowrap;font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);
        color:var(--fang-ink-tertiary)}
      .st-hairline[data-state="working"] .st-hairline-copy{color:var(--fang-ink-secondary)}
      /* The thinking row inside the hairline must not impose the box's own spacing. */
      .st-hairline .st-ai-thinking{padding:0}
      /* The output area.
         Interface type by default; the book's own metrics are applied below, and only to a passage
         short enough that reading it feels like reading the page. A declaration here would be the
         wrong default for every kind of answer at once. */
      .st-ai-dock-text{min-height:0;overflow:visible;white-space:pre-wrap;word-break:break-word}
      /* A SHORT passage is set in the book's own type: the writer is meant to read it as the
         sentence it will become, which is the whole point of showing it here rather than in a
         dialog. Four or five lines is the limit — past that the block stops reading as part of the
         page and becomes a wall inside a card. The threshold comes from data-prose, which the
         panel computes from the page settings (proseLineBudget), so it moves with the type size
         instead of being a fixed character count. */
      .st-ai-dock[data-prose="short"][data-kind="rewrite"] .st-ai-dock-text,
      .st-ai-dock[data-prose="short"][data-kind="continue"] .st-ai-dock-text{
        font-size:var(--st-font-size,16px);line-height:var(--st-line-height,1.9)}
      /* Every kind of answer scrolls inside a ceiling rather than growing without bound. Without
         one, a long continuation pushed the manuscript off the top of the window and the dock
         became the page; with one, the answer is readable and the page keeps its shape. The
         ceiling is never reached by a SHORT passage — five lines at any size the panel offers is
         far under 60vh — so the two rules do not fight: data-prose decides the type, this decides
         what happens to a long one. */
      .st-ai-dock[data-kind="rewrite"] .st-ai-dock-text,
      .st-ai-dock[data-kind="continue"] .st-ai-dock-text,
      .st-ai-dock[data-kind="cast"] .st-ai-dock-text{
        max-height:var(--st-dock-text-max-height,60vh);overflow:auto;
        scrollbar-width:thin;
        scrollbar-color:var(--dsw-alias-scrollbar-bg-l2,#e5e5e5) transparent}
      /* A chat reply keeps the manuscript's type.
         Shrinking it to 13px made an answer look like a tooltip: the same model, in the same panel,
         suddenly writing in a smaller voice. What differs is the STRUCTURE — a reply has no
         first-line indent, no paragraph spacing of its own, no measure of its own — not the size of
         the letters. Only a very long reply gets a ceiling, and then it scrolls rather than growing
         without bound. */
      /* A long reply takes the room it needs and the PAGE scrolls, not the answer. The only ceiling
         is most of the viewport, so an unusually long answer stays reachable by scrolling the
         manuscript rather than by scrolling a narrow box inside it — a scroll area inside a page
         that also scrolls is the worst of both. */
      .st-ai-dock[data-kind="chat"] .st-ai-dock-text{
        max-height:var(--st-dock-text-max-height,60vh);overflow:auto;
        /* Not the book's type: a reply is a remark, not a passage. */
        font-size:var(--fang-font-size-md);line-height:var(--fang-line-height-md);
        color:var(--fang-ink-primary)}
      /* Once it does have to scroll, the shortest useful affordance: the text is clipped at the
         bottom edge, and the box says so instead of silently hiding half the answer. */
      .st-ai-dock[data-kind="chat"] .st-ai-dock-text{
        scrollbar-width:thin;
        scrollbar-color:var(--dsw-alias-scrollbar-bg-l2,#e5e5e5) transparent}
      /* The question above its answer: quieter than the reply, because it is a prompt, not content. */
      .st-ai-dock[data-kind="chat"] .st-ai-question{font-size:var(--fang-font-size-sm);line-height:1.55;opacity:.8}
      .st-ai-dock[data-kind="chat"]{gap:var(--fang-space-8,8px);padding:var(--fang-space-16,16px) var(--fang-space-16,16px) var(--fang-space-12,12px)}
      /* While thinking there is no suggestion text and no buttons, so the shell is one row. */
      .st-ai-dock-busy{gap:0;padding:var(--fang-space-12,12px) var(--fang-space-16,16px)}
      /* Positioned: it is the containing block the steer field is measured against, so the field can
         fill the room between the retry pill and the trailing button. */
      .st-ai-dock-actions{position:relative;display:flex;align-items:center;gap:var(--fang-space-4,4px);flex:none;flex-wrap:wrap;margin-top:var(--fang-space-2,2px)}
      /* The status bar: one quiet line under the page. */
      /* Centred: the bar is a read-out, so a centred line under a centred page reads as part of
         the same column rather than as a toolbar with left-aligned controls. */
      /* No top border: the page ends where the bar begins, and a rule across the bottom of the
         window read as a frame rather than as a separation. The layer behind it does the work. */

      /* ---- the composer's model seat: the host's own picker, copied ----
         Every number here is from dsh's ModelSelect: a 28px transparent chip at 13/20 with the
         effort in caption tone, a 4px-padded card on the prominent elevation, 34px rows, and a
         trailing check rather than a filled row. Two panes, so the effort is one click away
         instead of at the bottom of a scroll. */
      .st-seat{position:relative;min-width:0}
.st-seat-trigger{display:flex;align-items:center;gap:var(--fang-space-4,4px);min-width:0;
        max-width:min(360px,45cqw);height:var(--fang-segmented-height,28px);padding:0 var(--fang-space-4,4px) 0 var(--fang-space-8,8px);
        border:none;border-radius:var(--fang-radius-sm,8px);outline:none;background:transparent;
        color:var(--fang-ink-secondary);font-family:inherit;font-size:var(--fang-font-size-md);line-height:var(--fang-line-height-md);
        font-weight:var(--fang-font-weight-normal);cursor:pointer;corner-shape:round;}
      .st-seat-trigger:hover{background:var(--fang-hover-fill)}
      /* The panel has one accent, and the focus ring is part of it: the host's own rule falls back
         to a fixed business blue, which is the one colour here that would not follow a skin. */
      .st-seat-trigger:focus-visible{outline:none;
        box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--fang-focus-ink)}
      .st-seat-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      /* The effort gives up its room first, so the model name keeps its last pixel. */
      .st-seat-effort{flex-shrink:1000;min-width:0;overflow:hidden;text-overflow:ellipsis;
        white-space:nowrap;color:var(--fang-ink-tertiary)}
/* Opens upward BY DEFAULT: the composer sits at the bottom of the page, and the host's card
         is placed from the trigger rect for the same reason. The side is decided at the click from
         the room the chip actually has (data-side, set in ComposerModelSeat) — in the settings
         drawer the same chip is near the top of a page, and a card that could only open one way
         was clipped by the page it opened into. */
      .st-seat-menu{position:absolute;z-index:var(--fang-layer-menu);right:0;bottom:calc(100% + 6px);
        display:flex;flex-direction:column;width:max-content;
        min-width:min(240px,calc(100vw - 32px));max-width:min(420px,calc(100vw - 32px));
        max-height:min(360px,calc(100vh - 96px));overflow:hidden;padding:var(--fang-space-4,4px);
        border:none;border-radius:var(--fang-radius-md,12px);background:var(--fang-surface-high);
        box-shadow:var(--dsw-elevation-prominent,var(--dsw-shadow-lv2,0 0 0 .5px rgba(0,0,0,.08),0 2px 8px rgba(0,0,0,.04)));
        color:var(--fang-ink-primary);corner-shape:round;}
      .st-seat-menu[data-side="down"]{bottom:auto;top:calc(100% + 6px)}
      .st-seat-groups{min-height:0;overflow-y:auto}
/* A root row: the name of the setting on the left, its current value on the right. */
      .st-seat-cell{display:flex;align-items:center;gap:var(--fang-space-8,8px);width:auto;min-width:100%;height:var(--fang-row-height,34px);
        padding:0 var(--fang-space-8,8px);border:none;border-radius:var(--fang-radius-md,12px);background:transparent;
        color:var(--fang-ink-primary);font-family:inherit;font-size:var(--fang-font-size-md);line-height:var(--fang-line-height-md);
        cursor:pointer;text-align:left;outline:none;corner-shape:round;}
      .st-seat-cell:hover,.st-seat-cell:focus-visible{background:var(--fang-hover-fill)}
      .st-seat-cell-label{flex:0 0 auto;white-space:nowrap}
      .st-seat-cell-value{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;
        white-space:nowrap;text-align:right;color:var(--fang-ink-tertiary)}
.st-seat-option{display:flex;align-items:center;gap:var(--fang-space-8,8px);width:auto;min-width:100%;
        min-height:var(--fang-row-height,34px);padding:var(--fang-space-4,4px) var(--fang-space-8,8px);border:none;border-radius:var(--fang-radius-md,12px);
        background:transparent;color:inherit;font-family:inherit;font-size:var(--fang-font-size-md);line-height:var(--fang-line-height-md);
        text-align:left;cursor:pointer;outline:none;corner-shape:round;}
      .st-seat-option:hover,.st-seat-option:focus-visible{background:var(--fang-hover-fill)}
      .st-seat-option-name{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      /* The marker is the trailing check, not a filled row: the host's menu does the same, and a
         filled row reads as "hovered" in a menu that also has hover. */
      .st-seat-check{display:grid;place-items:center;flex:0 0 14px;color:var(--fang-ink-primary)}
      .st-seat-group{font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);color:var(--fang-ink-tertiary);
        padding:var(--fang-space-8,8px) var(--fang-space-8,8px) var(--fang-space-2,2px)}
      .st-seat-empty{padding:var(--fang-space-8,8px);font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);color:var(--fang-ink-tertiary)}
      .st-seat-back{display:flex;align-items:center;gap:var(--fang-space-4,4px);width:auto;min-width:100%;height:var(--fang-row-height-compact,26px);
        padding:0 var(--fang-space-8,8px);border:none;border-radius:var(--fang-radius-md,12px);background:transparent;
        color:var(--fang-ink-tertiary);font-family:inherit;font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);
        cursor:pointer;text-align:left;outline:none}
      .st-seat-back:hover,.st-seat-back:focus-visible{background:var(--fang-hover-fill);
        color:var(--fang-ink-primary)}
      .st-seat-back .fang-chevron-right{width:var(--fang-space-12,12px);height:var(--fang-space-12,12px);transform:rotate(180deg)}
      .st-model-item-id{margin-left:auto;font-family:var(--fang-font-mono);font-size:var(--fang-font-size-sm);
        color:var(--fang-ink-tertiary);overflow:hidden;text-overflow:ellipsis;
        white-space:nowrap;max-width:55%}
      /* A proposed cast change: one line per entity, the verb first because that is the decision. */

      /* ---- the cast strip: who is in this chapter, and what they want ---- */
      .st-cast{display:flex;flex-direction:column;gap:var(--fang-space-8,8px);min-width:0;
        max-height:min(40vh,360px);overflow:auto;scrollbar-width:thin;
        scrollbar-color:var(--dsw-alias-scrollbar-bg-l2,#e5e5e5) transparent}
      .st-cast-row{display:flex;align-items:baseline;gap:var(--fang-space-8,8px);min-width:0;
        font-size:var(--fang-font-size-md);line-height:var(--fang-line-height-ui);color:var(--fang-ink-primary)}
      .st-cast-tag{flex:none;font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);padding:0 var(--fang-space-8,8px);border-radius:var(--fang-radius-pill,999px);corner-shape:round;
        background:color-mix(in srgb, var(--dsw-static-green-500,#22c55e) 18%, transparent);
        color:var(--fang-ink-primary)}
      /* An update changes what is already there, so it is marked with the accent rather than the
         green of something new. */
      .st-cast-tag[data-verb="update"]{background:color-mix(in srgb, var(--fang-accent) 18%, transparent);
        color:var(--fang-accent)}
      .st-cast-target{flex:none;font-size:var(--fang-font-size-sm);color:var(--fang-ink-tertiary)}
      .st-cast-name{min-width:0;font-weight:var(--fang-font-weight-medium);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .st-cast-detail{min-width:0;font-size:var(--fang-font-size-sm);color:var(--fang-ink-tertiary);
        overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

      /* ---- the working state ----
         The accent is the THEME's brand colour, not a colour of ours: on a red theme it is red,
         on a green one green. --fang-accent is the single place that decision is made, so nothing
         else in this stylesheet has to know which theme is active.
         Nothing here invents a colour of its own: the working state uses the theme accent and a
         change of opacity, so it stays quiet on a page of prose. */
      /* One row: the dots, then the question and the state together. */
      .st-ai-thinking{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:var(--fang-space-8,8px);
        font-size:var(--fang-font-size-md);line-height:var(--fang-line-height-md);color:var(--fang-ink-tertiary);overflow:hidden}
      .st-ai-thinking-row{display:flex;align-items:center;justify-content:flex-start;gap:var(--fang-space-4,4px);min-width:0;flex-wrap:nowrap}
      /* All the labels share one grid cell, so the row never changes width as the copy turns
         over; a changing width would make the dots slide sideways every two seconds. */
      .st-ai-thinking-labels{display:grid;min-width:0;justify-items:start;text-align:left}
      /* The first label is visible from the first frame and the rest wait their turn: a state that
         starts as nothing but three dots for a fifth of a second looks like it is still loading. */
      .st-ai-thinking-label{grid-area:1/1;min-width:0;overflow:hidden;text-overflow:ellipsis;
        white-space:nowrap;opacity:0;animation:st-say 7.2s ease-in-out infinite}
      .st-ai-thinking-label:first-child{opacity:1;animation-delay:0s}
      @keyframes st-say{
        0%{opacity:0;transform:translateY(3px)}
        4%,22%{opacity:1;transform:none}
        27%,100%{opacity:0;transform:translateY(-3px)}
      }
      /* The first label needs its own keyframes: sharing the turn-taking animation would leave it
         invisible at t=0, which is exactly when it has to be readable. */
      .st-ai-thinking-label:first-child{animation-name:st-say-first}
      @keyframes st-say-first{
        0%,22%{opacity:1;transform:none}
        27%,96%{opacity:0;transform:translateY(-3px)}
        100%{opacity:1;transform:none}
      }
      /* The thinking marker: a small spinner at the row's head, hard against the left edge. The
         mark is a rotating arc, not three dots: dots read as a loading placeholder, an arc reads
         as something thinking. The 2px top nudge is optical: a 10px circle centered on a 20px
         line sits half a pixel high otherwise. */
      .st-ai-thinking-mark{flex:none;width:var(--fang-space-12,12px);height:var(--fang-space-12,12px);margin:var(--fang-space-2,2px) 0 0;
        border:1.5px solid color-mix(in srgb, var(--fang-accent) 40%, transparent);
        border-top-color:var(--fang-accent);border-radius:var(--fang-radius-pill,999px);corner-shape:round;
        animation:st-think-spin 1s linear infinite}
      /* The row leads with the spinner and nothing else: no leading gap, no indent. The 4px gap
         keeps the copy reading as ONE line starting at the row's left edge, not as a badge beside
         a caption. */

      @keyframes st-think-spin{to{transform:rotate(360deg)}}
      /* The question box, set to match the host's own composer.
         The host publishes its composer metrics as variables, so this reads the same gaps and the
         same maximum height rather than inventing its own numbers; the surface, radius and type
         scale come from the same tokens the rest of the panel uses. It is not the host's lexcial
         editor, but it should not read as a foreign widget dropped into the page. */

      /* ---- the composer: the field, the send button, and the model menu ---- */
      .st-chat-composer{display:flex;flex-direction:column;
        gap:calc(var(--dsh-composer-stack-gap, var(--fang-space-8,8px)) + var(--fang-space-2,2px));
        width:100%;min-width:0}
      /* The one field that is NOT a well: it sits inside the dock's own card, which already
         supplies the surface, so a second fill inside it would read as a box in a box. It keeps
         the shared rule's no-border and no-outline, and overrides only the fill and the padding. */
      /* The ONE place in the dock that uses the interface size, and the only thing the writer types
         into. 16/24, a fixed pair that does not follow the page: it used to inherit the manuscript's
         size and leading, which made a one-line question look like a paragraph of the novel and
         three lines tall before a word was typed. The buttons, the reply and the cast list around
         it keep the 13px the rest of dsh uses — enlarging those was never asked for.
         The height cap is the host's own variable so the two composers stop growing at the same
         point. */
      .st-chat-input{width:100%;min-width:0;resize:none;background:transparent;
        border:none;outline:none;color:var(--fang-ink-primary);
        font-family:inherit;font-size:var(--st-font-ui,16px);
        line-height:var(--st-leading-ui,24px);
        max-height:var(--dsh-composer-text-max-height,336px);
        padding:0;margin:0;overflow:auto}
      .st-chat-input::placeholder{color:var(--fang-ink-tertiary)}
      /* No focus ring: the field is inside the dock's card, and a ring around it alone draws a box
         inside a box — at 2px it reads as exactly the border this field does not have. The caret
         and the dock's own surface mark where typing goes. */
      .st-chat-input:focus,.st-chat-input:focus-visible{box-shadow:none;outline:none}
      /* The control row under the input, laid out the way the host's composer lays out its own:
         the hint on the left, the model chip and the send button pushed to the right. */
      .st-chat-row{display:flex;align-items:center;gap:var(--fang-space-12,12px);min-width:0;flex-wrap:wrap}
      .st-chat-trailing{display:flex;align-items:center;gap:var(--fang-space-12,12px);margin-left:auto;flex:none}
      /* The menu opens upward by default: the composer's chip sits at the bottom of the page, so a
         downward menu would fall off the window. The settings page overrides this. */
      .st-model-menu{position:absolute;bottom:calc(100% + 6px);right:0;z-index:var(--fang-layer-menu);
        min-width:var(--st-picker-min-w,220px);max-width:min(320px,80vw);max-height:min(52vh,360px);overflow:auto;
        display:flex;flex-direction:column;padding:var(--fang-space-8,8px);
        border-radius:var(--fang-radius-md,12px);border:.5px solid var(--fang-border-edge);
        background:var(--fang-surface-high);box-shadow:var(--dsw-shadow-lv2,0 4px 12px rgba(0,0,0,.02),0 2px 8px rgba(0,0,0,.04))}
      .st-model-group-name{font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);color:var(--fang-ink-tertiary);
        padding:var(--fang-space-8,8px) var(--fang-space-8,8px) var(--fang-space-2,2px)}
.st-model-item{display:flex;align-items:center;gap:var(--fang-space-8,8px);width:100%;text-align:left;
        font-family:inherit;font-size:var(--fang-font-size-md);line-height:var(--fang-line-height-md);padding:var(--fang-space-4,4px) var(--fang-space-8,8px);
        border:none;border-radius:var(--fang-radius-sm,8px);background:transparent;cursor:pointer;
        color:var(--fang-ink-secondary);corner-shape:round;}
      .st-model-item:hover{background:var(--fang-hover-fill);color:var(--fang-ink-primary)}
      .st-model-item[data-current="true"]{color:var(--fang-ink-primary);font-weight:var(--fang-font-weight-medium)}
      .st-model-item[data-current="true"]::after{content:'✓';margin-left:auto;
        color:var(--fang-accent);font-size:var(--fang-font-size-sm)}
      .st-model-item-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
      .st-model-empty{padding:var(--fang-space-8,8px);font-size:var(--fang-font-size-sm);color:var(--fang-ink-tertiary)}
      /* A count beside the history button, so an empty log does not invite a click. */
      .st-count{font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);padding:0 var(--fang-space-4,4px);border-radius:var(--fang-radius-pill,999px);corner-shape:round;margin-left:var(--fang-space-4,4px);
        background:var(--fang-hover-fill);color:var(--fang-ink-tertiary);
        font-variant-numeric:tabular-nums}
      /* The answers card: one block per exchange, question first, then what came back. */

      /* ---- answers: what was asked, and what came back ---- */
      .st-answers{display:flex;flex-direction:column;gap:var(--fang-space-16,16px)}
      .st-answer{border-bottom:.5px solid var(--fang-border-edge);padding-bottom:var(--fang-space-16,16px)}
      .st-answer:last-child{border-bottom:none;padding-bottom:0}
      .st-answer-head{display:flex;align-items:baseline;gap:var(--fang-space-8,8px);margin-bottom:var(--fang-space-8,8px);flex-wrap:wrap}
      .st-answer-question{font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);color:var(--fang-ink-tertiary);
        min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:52%}
      .st-answer-body{white-space:pre-wrap;word-break:break-word;
        font-size:var(--st-font-size,16px);line-height:var(--st-line-height,1.9);
        color:var(--fang-ink-primary)}
      /* The send key: the host's own circular key, filled with the panel accent.
         The host drew this control before we did, so it is copied rather than reinvented: a 34px
         square, a grid that centres the glyph, a 999px radius, and — the line we were missing —
         corner-shape: round.
         That last one is not decoration. DSH's theme declares a superellipse token and applies
         corner-shape to every element through a universal selector. A superellipse is the squircle:
         a 50% radius drawn with it is a rounded square, not a circle. So every round control in the
         host resets corner-shape to round, and this one has to do the same. Without it the button
         measures 34 by 34 with a 17px radius and still does not look round.
         Colour is the accent, like every other affirmative control here; --st-send is the one place
         that decides it, and it points at --fang-accent. */
      /* Every dimension is pinned, including the minimums and the flex basis.
         A height alone is not enough to keep a control square: a min-height from anywhere above it
         — a host stylesheet, a reset, a dialog template — silently stretches the box while the
         width stays put, and the radius then draws an ellipse instead of a circle. Naming
         min-width, min-height and the flex basis makes the square a property of this rule rather
         than of the cascade around it. */
      .st-chat-send{display:grid;place-items:center;padding:0;
        width:var(--st-send-size,34px);height:var(--st-send-size,34px);
        flex:none;aspect-ratio:1/1;
        border:none;border-radius:var(--fang-radius-pill,999px);corner-shape:round;cursor:pointer;
        background:var(--st-send,#c3272b);
        color:var(--fang-on-accent,#fff);
        transition:background-color var(--ds-transition-duration-fast,.12s) var(--ds-ease-in-out,ease-in-out)}
      .st-chat-send:hover:not(:disabled){background:var(--st-send-hover,#c9352a)}
      .st-chat-send:focus-visible{outline:none;
        box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--fang-focus-ink)}
      .st-chat-send:disabled{opacity:.4;cursor:not-allowed}
      /* The question above the answer (and above the working state): the reply needs a subject, and
         once the composer has folded away this is the only record of what was asked. */
      /* The question above a finished answer: a record of what was asked, above the reply. No rule
         under it — the answer below is already a separate block, and a line there separated two
         things that belong together. */
      .st-ai-question{font-size:var(--fang-font-size-md);line-height:var(--fang-line-height-ui);color:var(--fang-ink-tertiary);
        white-space:pre-wrap;word-break:break-word}
      /* While the model works the question is inline with the state, so it is one line:
         "这里该怎么收？ · 在想下一句". The question does not fade or rotate; the state does. */
      .st-ai-thinking-ask{color:var(--fang-ink-secondary);min-width:0;
        overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:60%}
      .st-ai-thinking-sep{opacity:.45;flex:none}
      /* The dock's own edge, one hairline in the accent, breathing slowly: it says "busy" from
         across the page without drawing a line over the text. */
      .st-ai-dock-busy{position:relative;overflow:hidden}
      .st-ai-dock-busy::before{content:'';position:absolute;top:0;left:0;right:0;height:var(--st-rule-h,1px);
        background:var(--fang-accent);opacity:.3;animation:st-breathe 2.6s ease-in-out infinite}
      @keyframes st-breathe{0%,100%{opacity:.18}50%{opacity:.5}}
      /* Motion is decoration here: with reduced motion the colour and the words still carry the
         state, and nothing moves. */
      @media (prefers-reduced-motion: reduce){
        .st-ai-dock-busy::before{display:none}
        .st-ai-dock{animation:none}
        /* With the rotation off, every label would sit on top of every other one; the first
           carries the state and the rest step aside. */
        .st-ai-thinking-label{animation:none;opacity:0}
        .st-ai-thinking-label:first-child{opacity:1}
      }

      /* ---- the history drawer's pages: the answers, and the system event log ---- */
      .st-answers-pages{display:flex;flex-direction:column;gap:var(--fang-space-12,12px);min-height:0}
      /* The page switcher is a control, not a full-width band. */
      .st-answers-pages>.fang-segmented{align-self:flex-start}
      /* One row per event: a fixed-width clock column, then the line. Failed calls carry the
         failure code the host reported — the UNKNOWN the writer could previously never see twice
         in context — and are marked in the error colour so a scan finds them. */
      .st-event-log{display:flex;flex-direction:column;gap:var(--fang-space-2,2px);
        font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);
        font-family:var(--fang-font-mono)}
      .st-event-toolbar{display:flex;gap:var(--fang-space-8,8px);align-items:center}
      /* The type filter is a compact select, not a row of time chips: the option list can grow
         without widening the drawer, and it says what it filters in one word. */
      .st-event-filter{flex:none;width:auto;max-width:100%}
      /* Hug the current value instead of reserving a fixed block: "全部类型" needs four glyphs,
         not a field as wide as the event table. */
      .st-event-filter .fang-dropdown-button{width:auto}
      .st-event-filter:focus{box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--fang-focus-ink)}
      .st-event-table{border-bottom:var(--fang-hairline) solid var(--fang-border-edge)}
      .st-event-head{display:flex;align-items:center;min-width:0;user-select:none}
      .st-event-th{position:relative;display:flex;align-items:center;padding:var(--fang-space-2,2px) var(--fang-space-8,8px);
        font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);color:var(--fang-ink-secondary);
        overflow:hidden;white-space:nowrap}
      .st-event-resize{position:absolute;top:0;right:-3px;width:var(--st-event-resize-w);height:100%;cursor:col-resize}
      .st-event-resize:hover{background:var(--fang-focus-ink)}
      .st-event-body{display:flex;flex-direction:column;gap:var(--fang-space-2,2px);min-height:0;
        font-family:var(--fang-font-mono);max-height:var(--st-event-body-max-h);overflow:auto}
      .st-event-row{display:flex;gap:var(--fang-space-8,8px);align-items:baseline;min-width:0}
      .st-event-row[data-ok="false"] .st-event-text{color:var(--dsw-alias-state-error-primary,#ec1313)}
      .st-event-time{flex:none;width:var(--st-event-time-w,var(--st-log-col-time));color:var(--fang-ink-tertiary)}
      .st-event-name{flex:none;width:var(--st-event-name-w,var(--st-log-col-name));overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--fang-ink-primary)}
      .st-event-text{min-width:0;overflow-wrap:anywhere;color:var(--fang-ink-secondary)}
`
