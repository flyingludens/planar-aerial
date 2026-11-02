/**
 * Which model does which job: the roles page and the two pickers.
 */
export const CSS_MODELS = `
      /* ---- models: the roles page, the two pickers, and the effort axis ---- */
      .st-models{display:flex;flex-direction:column;gap:var(--fang-space-16,16px);width:var(--st-settings-w,340px);max-width:100%}
      .st-model-file{font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-ui);color:var(--fang-ink-tertiary);
        font-family:var(--fang-font-mono);overflow-wrap:anywhere;padding-top:var(--fang-space-4,4px)}
      .st-model-row{display:flex;flex-direction:column;gap:var(--fang-space-8,8px);min-width:0;
        padding-top:var(--fang-space-12,12px);border-top:.5px solid var(--fang-border-edge)}
      .st-model-row:first-of-type{border-top:none;padding-top:0}
      .st-model-row-head{display:flex;align-items:center;gap:var(--fang-space-8,8px);min-width:0}
      .st-model-role{flex:none;font-size:var(--fang-font-size-md);line-height:var(--fang-line-height-md);font-weight:var(--fang-font-weight-medium);color:var(--fang-ink-primary)}
      .st-model-follow-tag{font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);color:var(--fang-ink-tertiary);
        overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .st-model-follow{margin-left:auto;font-size:var(--fang-font-size-sm);padding:0 var(--fang-space-8,8px)}
      /* The confirmation is the accent, briefly: the row's own state tag already changed, and this
         only has to say that the change reached the host. */
      .st-model-flash{margin-left:var(--fang-space-8,8px);font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);color:var(--fang-accent);
        animation:st-flash-in .16s var(--ds-ease-in-out,ease-in-out) both}
      @keyframes st-flash-in{from{opacity:0;translate:0 2px}to{opacity:1;translate:0 0}}
      @media (prefers-reduced-motion: reduce){.st-model-flash{animation:none}}
      /* The chip is a compact control in the composer; on this page it is the row's main control,
         so it takes the width and says so: a name with a caret and no surface around it reads as
         a label, and the writer would not know it can be pressed. */
      .st-mselect{position:relative;min-width:0}
.st-mselect-button{display:flex;align-items:center;gap:var(--fang-space-8,8px);width:100%;min-width:0;
        font-family:inherit;font-size:var(--fang-font-size-md);line-height:var(--fang-line-height-md);padding:var(--fang-space-4,4px) var(--fang-space-12,12px);
        border:none;border-radius:var(--fang-radius-sm,8px);cursor:pointer;
        background:var(--fang-surface);color:var(--fang-ink-primary);corner-shape:round;}
      .st-mselect-button:hover{background:var(--fang-hover-fill)}
      .st-mselect-button:focus-visible{outline:none;
        box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--fang-focus-ink)}
      .st-mselect-name{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;
        white-space:nowrap;text-align:left}
      .st-mselect-caret{flex:none;color:var(--fang-ink-tertiary)}
      /* The menu opens over the row it belongs to, not inside it: a list inside a 340px column
         would be clipped by the drawer's own scroll. */
      .st-mselect .st-model-menu{position:absolute;z-index:var(--fang-layer-menu);top:calc(100% + 4px);left:0;right:0;
        /* Reset the composer menu's bottom offset: with both top and bottom set the box is pinned
           to neither end and collapses to the height of its own padding. */
        bottom:auto;min-width:0;max-width:none;max-height:min(46vh,320px)}
      /* The effort axis: stops on one line, least to most. The line is the point — it says which
         way is more, which a dropdown cannot. */
      .st-effort{position:relative;display:flex;align-items:flex-start;margin-top:var(--fang-space-8,8px)}
      .st-effort::before{content:'';position:absolute;left:10%;right:10%;top:var(--st-effort-tick,5px);height:var(--st-rule-h,1px);
        background:var(--fang-border-edge)}
      .st-effort-stop{position:relative;flex:1 1 0;min-width:0;display:flex;flex-direction:column;
        align-items:center;gap:var(--fang-space-4,4px);padding:0;border:none;background:transparent;
        cursor:pointer;font-family:inherit}
      .st-effort-stop:focus-visible{outline:none}
      .st-effort-stop:focus-visible .st-effort-dot{
        box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--fang-focus-ink)}
      .st-effort-dot{width:var(--st-mark-md,9px);height:var(--st-mark-md,9px);border-radius:var(--fang-radius-pill,999px);corner-shape:round;flex:none;
        background:var(--fang-surface);box-shadow:inset 0 0 0 .5px var(--fang-border-strong);
        transition:background var(--ds-transition-duration-fast,.12s)}
      .st-effort-stop[data-on="true"] .st-effort-dot{background:var(--fang-accent);
        box-shadow:0 0 0 3px color-mix(in srgb, var(--fang-accent) 22%, transparent)}
      .st-effort-name{font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);color:var(--fang-ink-tertiary);
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
      .st-effort-stop[data-on="true"] .st-effort-name{color:var(--fang-ink-primary)}
      /* ---- custom providers ---- */
      .st-custom-models{display:flex;flex-direction:column;gap:var(--fang-space-8,8px);
        padding-top:var(--fang-space-12,12px);border-top:.5px solid var(--fang-border-edge)}
      .st-custom-models-head{display:flex;align-items:center;gap:var(--fang-space-8,8px)}
      .st-custom-add{margin-left:auto;font-size:var(--fang-font-size-sm)}
      .st-custom-provider{display:flex;flex-direction:column;gap:var(--fang-space-4,4px);
        padding:var(--fang-padding-sm) var(--fang-padding-md);border-radius:var(--fang-radius-sm,8px);
        background:var(--fang-surface-high)}
      .st-custom-provider-main{display:flex;align-items:baseline;gap:var(--fang-space-8,8px);min-width:0}
      .st-custom-provider-name{font-size:var(--fang-font-size-md);font-weight:var(--fang-font-weight-medium);color:var(--fang-ink-primary)}
      .st-custom-provider-kind{flex:none;font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);color:var(--fang-ink-tertiary)}
      .st-custom-provider-meta{font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);
        color:var(--fang-ink-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .st-custom-provider-actions{display:flex;align-items:center;gap:var(--fang-space-4,4px)}
      .st-custom-provider-actions .fang-btn{font-size:var(--fang-font-size-sm);padding:0 var(--fang-space-8,8px)}
      .st-custom-model-list{display:flex;flex-wrap:wrap;gap:var(--fang-space-4,4px);max-height:var(--st-model-list-max-h,160px);overflow:auto}
      .st-custom-model-chip{font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);
        padding:var(--fang-space-2,2px) var(--fang-space-8,8px);border-radius:var(--fang-radius-pill,999px);
        background:var(--fang-hover-fill);color:var(--fang-ink-secondary)}
`
