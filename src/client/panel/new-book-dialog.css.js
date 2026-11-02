/**
 * The shared new-book dialog.
 */
export const CSS_NEWBOOK = `
      .st-newbook-backdrop{position:absolute;inset:0;z-index:var(--st-welcome-dialog-z);display:grid;place-items:center;
        padding:var(--fang-space-24,24px);background:color-mix(in srgb,var(--fang-bg,#000) 68%,transparent);
        animation:st-newbook-backdrop-in 160ms ease both}
      .st-newbook{width:min(var(--st-welcome-dialog-w),100%);display:flex;flex-direction:column;gap:var(--fang-space-24,24px);
        padding:var(--fang-space-24,24px);border:var(--fang-hairline) solid var(--fang-ink-edge);
        border-radius:var(--fang-radius-lg,16px);background:var(--fang-surface-high);
        box-shadow:var(--fang-card-shadow-lift);animation:st-newbook-in 180ms var(--ds-ease-in-out,ease-in-out) both}
      .st-newbook-title{margin:0;font-family:var(--st-font-serif);font-size:var(--st-welcome-dialog-title-size);
        line-height:var(--fang-line-height-xl);font-weight:var(--fang-font-weight-normal);color:var(--fang-ink-primary)}
      .st-newbook-input{width:100%;box-sizing:border-box;padding:var(--fang-space-8,8px) 0;
        border:none;border-bottom:var(--fang-hairline) solid var(--fang-ink-edge);border-radius:0;
        background:transparent;color:var(--fang-ink-primary);font-family:var(--st-font-serif);
        font-size:var(--st-welcome-dialog-input-size);line-height:var(--fang-line-height-xl);outline:none}
      .st-newbook-input::placeholder{color:var(--fang-ink-tertiary)}
      .st-newbook-input:focus{border-bottom-color:var(--fang-accent);box-shadow:0 1px 0 var(--fang-accent)}
      .st-newbook-error{margin:0;font-size:var(--fang-font-size-sm);line-height:var(--fang-line-height-sm);
        color:var(--dsw-alias-state-warn-primary,#f59e0b)}
      .st-newbook-actions{display:flex;justify-content:flex-end;gap:var(--fang-space-8,8px)}
      .st-newbook-open{margin-right:auto}
      @keyframes st-newbook-backdrop-in{from{opacity:0}to{opacity:1}}
      @keyframes st-newbook-in{from{opacity:0;translate:0 var(--fang-space-4,4px)}to{opacity:1;translate:0 0}}
      @media (prefers-reduced-motion: reduce){.st-newbook-backdrop,.st-newbook{animation:none}}
`
