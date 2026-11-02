/**
 * The MCP endpoint card, anchored to the top-right title-row control.
 */
export const CSS_MCP = `
      .st-mcp-backdrop{position:absolute;inset:0;z-index:var(--st-mcp-z);display:flex;align-items:flex-start;justify-content:flex-end;
        padding:var(--fang-space-24,24px);background:color-mix(in srgb,var(--fang-bg,#000) 40%,transparent)}
      .st-mcp-panel{width:min(var(--st-mcp-w),100%);display:flex;flex-direction:column;gap:var(--fang-space-12,12px);
        padding:var(--st-mcp-panel-pad);border:var(--fang-hairline) solid var(--fang-ink-edge);
        border-radius:var(--fang-radius-lg,16px);background:var(--fang-surface-high);
        box-shadow:var(--fang-card-shadow-lift)}
      .st-mcp-head{display:flex;align-items:center;justify-content:space-between;gap:var(--fang-space-8,8px)}
      .st-mcp-title{margin:0;font-size:var(--fang-font-size-lg);line-height:var(--fang-line-height-lg);font-weight:var(--fang-font-weight-strong)}
      .st-mcp-note,.st-mcp-error{margin:0;font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm)}
      .st-mcp-error{color:var(--dsw-alias-state-warn-primary,#f59e0b)}
      .st-mcp-row{display:flex;align-items:center;gap:var(--fang-space-8,8px);min-width:0}
      .st-mcp-row-config{justify-content:space-between}
      .st-mcp-label{font-size:var(--fang-font-size-sm);color:var(--fang-ink-tertiary);flex:none}
      .st-mcp-value{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--fang-font-mono);
        font-size:var(--fang-font-size-sm);color:var(--fang-ink-primary)}
      .st-mcp-config{margin:0;padding:var(--fang-space-12,12px);overflow:auto;max-height:var(--st-mcp-code-h);
        border-radius:var(--fang-radius-md,12px);background:var(--fang-bg);font-family:var(--fang-font-mono);
        font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);color:var(--fang-ink-secondary);white-space:pre}

      .st-mcp-status{display:flex;align-items:center;gap:var(--st-mcp-status-gap);font-size:var(--fang-font-size-sm);color:var(--fang-ink-tertiary)}
      .st-mcp-dot{width:var(--st-mcp-dot);height:var(--st-mcp-dot);border-radius:var(--fang-radius-pill);background:var(--fang-ink-tertiary);flex:none}
      .st-mcp-connected{color:var(--fang-ink-secondary)}
      .st-mcp-connected .st-mcp-dot{background:var(--fang-accent)}
`
