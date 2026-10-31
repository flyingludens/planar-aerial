/**
 * Which model does which job: the roles page and the two pickers.
 */
export const CSS_MODELS = `
      /* ---- models: the roles page, the two pickers, and the effort axis ---- */
      .st-models{display:flex;flex-direction:column;gap:var(--st-space-16,16px);width:var(--st-settings-w,340px);max-width:100%}
      .st-model-file{font-size:var(--st-text-sm);line-height:var(--st-line-height-ui);color:var(--st-text-tertiary);
        font-family:var(--st-font-mono);overflow-wrap:anywhere;padding-top:var(--st-space-4,4px)}
      .st-model-row{display:flex;flex-direction:column;gap:var(--st-space-8,8px);min-width:0;
        padding-top:var(--st-space-12,12px);border-top:.5px solid var(--dsw-alias-border-l3,var(--st-fallback-border-l3))}
      .st-model-row:first-of-type{border-top:none;padding-top:0}
      .st-model-row-head{display:flex;align-items:center;gap:var(--st-space-8,8px);min-width:0}
      .st-model-role{flex:none;font-size:var(--st-text-md);line-height:var(--st-text-md-leading);font-weight:var(--st-font-weight-medium);color:var(--st-text-primary)}
      .st-model-follow-tag{font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);color:var(--st-text-tertiary);
        overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .st-model-follow{margin-left:auto;font-size:var(--st-text-sm);padding:0 var(--st-space-8,8px)}
      /* The confirmation is the accent, briefly: the row's own state tag already changed, and this
         only has to say that the change reached the host. */
      .st-model-flash{margin-left:var(--st-space-8,8px);font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);color:var(--st-accent);
        animation:st-flash-in .16s var(--ds-ease-in-out,ease-in-out) both}
      @keyframes st-flash-in{from{opacity:0;translate:0 2px}to{opacity:1;translate:0 0}}
      @media (prefers-reduced-motion: reduce){.st-model-flash{animation:none}}
      /* The chip is a compact control in the composer; on this page it is the row's main control,
         so it takes the width and says so: a name with a caret and no surface around it reads as
         a label, and the writer would not know it can be pressed. */
      .st-mselect{position:relative;min-width:0}
.st-mselect-button{display:flex;align-items:center;gap:var(--st-space-8,8px);width:100%;min-width:0;
        font-family:inherit;font-size:var(--st-text-md);line-height:var(--st-text-md-leading);padding:var(--st-space-4,4px) var(--st-space-12,12px);
        border:none;border-radius:var(--st-radius-sm,8px);cursor:pointer;
        background:var(--st-surface);color:var(--st-text-primary);corner-shape:round;}
      .st-mselect-button:hover{background:var(--st-hover-fill)}
      .st-mselect-button:focus-visible{outline:none;
        box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--st-focus-ink)}
      .st-mselect-name{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;
        white-space:nowrap;text-align:left}
      .st-mselect-caret{flex:none;color:var(--st-text-tertiary)}
      /* The menu opens over the row it belongs to, not inside it: a list inside a 340px column
         would be clipped by the drawer's own scroll. */
      .st-mselect .st-model-menu{position:absolute;z-index:var(--st-layer-menu);top:calc(100% + 4px);left:0;right:0;
        /* Reset the composer menu's bottom offset: with both top and bottom set the box is pinned
           to neither end and collapses to the height of its own padding. */
        bottom:auto;min-width:0;max-width:none;max-height:min(46vh,320px)}
      /* The effort axis: stops on one line, least to most. The line is the point — it says which
         way is more, which a dropdown cannot. */
      .st-effort{position:relative;display:flex;align-items:flex-start;margin-top:var(--st-space-8,8px)}
      .st-effort::before{content:'';position:absolute;left:10%;right:10%;top:var(--st-effort-tick,5px);height:var(--st-rule-h,1px);
        background:var(--dsw-alias-border-l3,var(--st-fallback-border-l3))}
      .st-effort-stop{position:relative;flex:1 1 0;min-width:0;display:flex;flex-direction:column;
        align-items:center;gap:var(--st-space-4,4px);padding:0;border:none;background:transparent;
        cursor:pointer;font-family:inherit}
      .st-effort-stop:focus-visible{outline:none}
      .st-effort-stop:focus-visible .st-effort-dot{
        box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--st-focus-ink)}
      .st-effort-dot{width:var(--st-mark-md,9px);height:var(--st-mark-md,9px);border-radius:var(--st-radius-pill,999px);corner-shape:round;flex:none;
        background:var(--st-surface);box-shadow:inset 0 0 0 .5px var(--dsw-alias-border-l4,var(--st-fallback-border-l4));
        transition:background var(--ds-transition-duration-fast,.12s)}
      .st-effort-stop[data-on="true"] .st-effort-dot{background:var(--st-accent);
        box-shadow:0 0 0 3px color-mix(in srgb, var(--st-accent) 22%, transparent)}
      .st-effort-name{font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);color:var(--st-text-tertiary);
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
      .st-effort-stop[data-on="true"] .st-effort-name{color:var(--st-text-primary)}
      /* ---- custom providers ---- */
      .st-custom-models{display:flex;flex-direction:column;gap:var(--st-space-8,8px);
        padding-top:var(--st-space-12,12px);border-top:.5px solid var(--dsw-alias-border-l3,var(--st-fallback-border-l3))}
      .st-custom-models-head{display:flex;align-items:center;gap:var(--st-space-8,8px)}
      .st-custom-add{margin-left:auto;font-size:var(--st-text-sm)}
      .st-custom-provider{display:flex;flex-direction:column;gap:var(--st-space-4,4px);
        padding:var(--st-inset-sm) var(--st-inset-md);border-radius:var(--st-radius-sm,8px);
        background:var(--st-surface-high)}
      .st-custom-provider-main{display:flex;align-items:baseline;gap:var(--st-space-8,8px);min-width:0}
      .st-custom-provider-name{font-size:var(--st-text-md);font-weight:var(--st-font-weight-medium);color:var(--st-text-primary)}
      .st-custom-provider-kind{flex:none;font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);color:var(--st-text-tertiary)}
      .st-custom-provider-meta{font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .st-custom-provider-actions{display:flex;align-items:center;gap:var(--st-space-4,4px)}
      .st-custom-provider-actions .st-btn{font-size:var(--st-text-sm);padding:0 var(--st-space-8,8px)}
      .st-custom-model-list{display:flex;flex-wrap:wrap;gap:var(--st-space-4,4px);max-height:var(--st-model-list-max-h,160px);overflow:auto}
      .st-custom-model-chip{font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        padding:var(--st-space-2,2px) var(--st-space-8,8px);border-radius:var(--st-radius-pill,999px);
        background:var(--st-hover-fill);color:var(--st-text-secondary)}
`
