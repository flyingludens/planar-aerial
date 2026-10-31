/**
 * The shared new-book dialog.
 */
export const CSS_NEWBOOK = `
      .st-newbook-backdrop{position:absolute;inset:0;z-index:var(--st-welcome-dialog-z);display:grid;place-items:center;
        padding:var(--st-space-24,24px);background:color-mix(in srgb,var(--st-bg,#000) 68%,transparent);
        animation:st-newbook-backdrop-in 160ms ease both}
      .st-newbook{width:min(var(--st-welcome-dialog-w),100%);display:flex;flex-direction:column;gap:var(--st-space-24,24px);
        padding:var(--st-space-24,24px);border:var(--st-hairline) solid var(--st-ink-edge);
        border-radius:var(--st-radius-lg,16px);background:var(--st-surface-high);
        box-shadow:var(--st-card-shadow-lift);animation:st-newbook-in 180ms var(--ds-ease-in-out,ease-in-out) both}
      .st-newbook-title{margin:0;font-family:var(--st-font-serif);font-size:var(--st-welcome-dialog-title-size);
        line-height:var(--st-text-xl-leading);font-weight:var(--st-font-weight-normal);color:var(--st-text-primary)}
      .st-newbook-input{width:100%;box-sizing:border-box;padding:var(--st-space-8,8px) 0;
        border:none;border-bottom:var(--st-hairline) solid var(--st-ink-edge);border-radius:0;
        background:transparent;color:var(--st-text-primary);font-family:var(--st-font-serif);
        font-size:var(--st-welcome-dialog-input-size);line-height:var(--st-text-xl-leading);outline:none}
      .st-newbook-input::placeholder{color:var(--st-text-tertiary)}
      .st-newbook-input:focus{border-bottom-color:var(--st-accent);box-shadow:0 1px 0 var(--st-accent)}
      .st-newbook-error{margin:0;font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--dsw-alias-state-warn-primary,var(--st-fallback-warn))}
      .st-newbook-actions{display:flex;justify-content:flex-end;gap:var(--st-space-8,8px)}
      .st-newbook-open{margin-right:auto}
      @keyframes st-newbook-backdrop-in{from{opacity:0}to{opacity:1}}
      @keyframes st-newbook-in{from{opacity:0;translate:0 var(--st-space-4,4px)}to{opacity:1;translate:0 0}}
      @media (prefers-reduced-motion: reduce){.st-newbook-backdrop,.st-newbook{animation:none}}
`
