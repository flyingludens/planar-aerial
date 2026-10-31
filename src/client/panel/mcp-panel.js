/**
 * The MCP endpoint card.
 *
 * It shows the two things a harness needs: the URL and the configuration block with its bearer
 * token. Nothing else is a setting here; the server itself belongs to the desktop process.
 */
import { React, h } from '../shared/react.js'

const copy = async (text) => {
  try { await navigator.clipboard.writeText(text) } catch { /* no clipboard permission */ }
}

export function McpPanel({ t, info, error, loading, onClose, onLaunch }) {
  const [launchError, setLaunchError] = React.useState('')
  const config = info?.config ?? ''
  const launch = async () => {
    if (typeof onLaunch !== 'function') return
    setLaunchError('')
    try {
      const result = await onLaunch()
      if (result?.ok === false) setLaunchError(String(result.error ?? ''))
    } catch (failure) { setLaunchError(String(failure?.message ?? failure)) }
  }
  return h('div', {
    className: 'st-mcp-backdrop', role: 'presentation',
    onMouseDown: (event) => { if (event.target === event.currentTarget) onClose() },
  },
    h('div', { className: 'st-mcp-panel', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('mcp.title') },
      h('div', { className: 'st-mcp-head' },
        h('h2', { className: 'st-mcp-title' }, t('mcp.title')),
        h('button', { type: 'button', className: 'st-btn st-btn-ghost', onClick: onClose }, t('action.close'))),
      loading ? h('p', { className: 'st-mcp-note' }, t('label.loading')) : null,
      error === '' ? null : h('p', { className: 'st-mcp-error' }, error),
      info === null || info === undefined ? null : h(React.Fragment, null,
        h('div', { className: `st-mcp-status${info.connected === true ? ' st-mcp-connected' : ''}` },
          h('span', { className: 'st-mcp-dot' }),
          info.connected === true ? t('mcp.connected') : t('mcp.waiting')),
        typeof onLaunch === 'function'
          ? h('button', { type: 'button', className: 'st-btn st-btn-primary', onClick: launch }, t('mcp.launch'))
          : null,
        launchError === '' ? null : h('p', { className: 'st-mcp-error' }, launchError),
        h('div', { className: 'st-mcp-row' },
          h('span', { className: 'st-mcp-label' }, t('mcp.endpoint')),
          h('code', { className: 'st-mcp-value' }, info.url),
          h('button', { type: 'button', className: 'st-btn st-btn-ghost', onClick: () => copy(info.url) }, t('action.copy'))),
        h('div', { className: 'st-mcp-row st-mcp-row-config' },
          h('span', { className: 'st-mcp-label' }, t('mcp.config')),
          h('button', { type: 'button', className: 'st-btn st-btn-ghost', onClick: () => copy(config) }, t('action.copy'))),
        h('pre', { className: 'st-mcp-config' }, config))))
}
