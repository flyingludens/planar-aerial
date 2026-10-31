/**
 * The MCP endpoint card, anchored to the top-right title-row control.
 */
export const CSS_MCP = `
      .st-mcp-backdrop{position:absolute;inset:0;z-index:var(--st-mcp-z);display:flex;align-items:flex-start;justify-content:flex-end;
        padding:var(--st-space-24,24px);background:color-mix(in srgb,var(--st-bg,#000) 40%,transparent)}
      .st-mcp-panel{width:min(var(--st-mcp-w),100%);display:flex;flex-direction:column;gap:var(--st-space-12,12px);
        padding:var(--st-space-20,20px);border:var(--st-hairline) solid var(--st-ink-edge);
        border-radius:var(--st-radius-lg,16px);background:var(--st-surface-high);
        box-shadow:var(--st-card-shadow-lift)}
      .st-mcp-head{display:flex;align-items:center;justify-content:space-between;gap:var(--st-space-8,8px)}
      .st-mcp-title{margin:0;font-size:var(--st-text-lg);line-height:var(--st-text-lg-leading);font-weight:var(--st-font-weight-strong)}
      .st-mcp-note,.st-mcp-error{margin:0;font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading)}
      .st-mcp-error{color:var(--dsw-alias-state-warn-primary,var(--st-fallback-warn))}
      .st-mcp-row{display:flex;align-items:center;gap:var(--st-space-8,8px);min-width:0}
      .st-mcp-row-config{justify-content:space-between}
      .st-mcp-label{font-size:var(--st-text-sm);color:var(--st-text-tertiary);flex:none}
      .st-mcp-value{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--st-font-mono);
        font-size:var(--st-text-sm);color:var(--st-text-primary)}
      .st-mcp-config{margin:0;padding:var(--st-space-12,12px);overflow:auto;max-height:var(--st-mcp-code-h);
        border-radius:var(--st-radius-md,12px);background:var(--st-bg);font-family:var(--st-font-mono);
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);color:var(--st-text-secondary);white-space:pre}

      .st-mcp-status{display:flex;align-items:center;gap:var(--st-space-6,6px);font-size:var(--st-text-sm);color:var(--st-text-tertiary)}
      .st-mcp-dot{width:var(--st-mcp-dot);height:var(--st-mcp-dot);border-radius:var(--st-radius-pill);background:var(--st-text-tertiary);flex:none}
      .st-mcp-connected{color:var(--st-text-secondary)}
      .st-mcp-connected .st-mcp-dot{background:var(--st-accent)}
`
