/**
 * The standalone app's dark theme.
 *
 * DSH supplies its own `--dsw-*` theme variables and this panel follows them. Electron has no
 * host theme, so this file is the one place its equivalents live: colours, radii and shadows
 * that the shared components already read. Keeping it here (rather than in the HTML shell) means
 * changing a token for the standalone app is a source edit beside the components it dresses, not
 * a second stylesheet hidden in electron/.
 */
export const DARK_THEME = `
:root{
  --dsw-alias-label-primary:#f2f2f3;
  --dsw-alias-label-secondary:#b8b8bd;
  --dsw-alias-label-tertiary:#8e8e93;
  --dsw-alias-label-dimmed:#6e6e73;
  --dsw-alias-label-caption:#77777c;
  --dsw-alias-bg-base:#0b0b0c;
  --dsw-alias-bg-layer-0:#111112;
  --dsw-alias-bg-layer-1:#1c1c1e;
  --dsw-alias-bg-layer-2:#2c2c2e;
  --dsw-alias-border-l2:#ffffff14;
  --dsw-alias-border-l3:#ffffff1f;
  --dsw-alias-border-l4:#ffffff29;
  --dsw-alias-interactive-bg-hover:#ffffff14;
  --dsw-alias-state-error-primary:#ff6b6b;
  --dsw-alias-state-warn-primary:#f5b942;
  --dsw-alias-scrollbar-bg-l2:#3a3a3c;
  --dsw-alias-scrollbar-hover-l2:#4a4a4c;
  --dsw-specific-input-major:#2c2c2e;
  --dsw-static-green-500:#22c55e;
  --dsw-static-red-400:#ff6b6b;
  --dsw-focus-ring-width:2px;
  --dsw-radius-xs:4px;
  --dsw-radius-sm:8px;
  --dsw-radius-md:12px;
  --dsw-radius-lg:16px;
  --dsw-radius-panel:28px;
  --dsw-shadow-lv2:0 4px 12px rgba(0,0,0,.24),0 2px 8px rgba(0,0,0,.18);
  --dsw-shadow-lv3:0 12px 32px rgba(0,0,0,.32);
  --dsw-elevation-soft:0 0 0 .5px rgba(255,255,255,.08),0 4px 16px rgba(0,0,0,.24);
  --dsw-elevation-prominent:0 0 0 .5px rgba(255,255,255,.1),0 12px 32px rgba(0,0,0,.4);
  color-scheme:dark;
}
`
