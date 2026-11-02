/**
 * The static homepage build: the welcome page without the plugin runtime.
 *
 * The visual layer is the same WelcomePage component the app opens on a first visit. The CTA is
 * the one site-specific control: it detects the visitor's OS and downloads the matching build.
 */
/* global __SITE_DOWNLOAD_MAC_ARM64__, __SITE_DOWNLOAD_MAC_INTEL__, __SITE_DOWNLOAD_WINDOWS__ */
import { createRoot } from 'react-dom/client'
import { React, h } from '../shared/react.js'
import { EN, ZH } from '../shared/locale.js'
import { WelcomePage } from '../panel/welcome.js'
import { Dropdown } from 'fang-style'
import { DARK_THEME } from '../shared/theme.js'
import { CSS_SHARED } from '../shared/styles.js'
import { CSS_LIBRARY } from '../panel/library.css.js'
import { CSS_WELCOME } from '../panel/welcome.css.js'
import { CSS_GLYPH } from '../panel/glyph-field.css.js'
import { CSS_SITE } from './site.css.js'

const DOWNLOADS = {
  macArm64: typeof __SITE_DOWNLOAD_MAC_ARM64__ === 'undefined' ? '' : __SITE_DOWNLOAD_MAC_ARM64__,
  macIntel: typeof __SITE_DOWNLOAD_MAC_INTEL__ === 'undefined' ? '' : __SITE_DOWNLOAD_MAC_INTEL__,
  windows: typeof __SITE_DOWNLOAD_WINDOWS__ === 'undefined' ? '' : __SITE_DOWNLOAD_WINDOWS__,
}

const theme = document.createElement('style')
theme.textContent = `${CSS_SHARED}${DARK_THEME}${CSS_LIBRARY}${CSS_WELCOME}${CSS_GLYPH}${CSS_SITE}`
document.head.appendChild(theme)

const zh = String(navigator.language ?? '').toLowerCase().startsWith('zh')
const dictionary = zh ? ZH : EN
// The site has a few strings of its own; keeping them out of the panel dictionary stops them
// from shipping in the plugin bundle, where nothing would read them.
const SITE_COPY = zh
  ? {
      download: '下载', downloadPreparing: '安装包准备中', macArch: '芯片',
      macArm: 'Apple Silicon', macIntel: 'Intel',
    }
  : {
      download: 'Download', downloadPreparing: 'Installer coming soon', macArch: 'Chip',
      macArm: 'Apple Silicon', macIntel: 'Intel',
    }
const t = (key, params = {}) => {
  let text = SITE_COPY[key] ?? dictionary[key] ?? key
  for (const [name, value] of Object.entries(params)) text = text.replaceAll(`{${name}}`, String(value))
  return text
}

function detectPlatform() {
  const ua = String(navigator.userAgent ?? '')
  const platform = String(navigator.platform ?? '')
  if (/Mac|iPhone|iPad|iPod/i.test(platform) || /Mac OS X/i.test(ua)) return 'mac'
  if (/Win/i.test(platform) || /Windows/i.test(ua)) return 'windows'
  return 'other'
}

function SiteDownload({ t }) {
  const platform = detectPlatform()
  const [arch, setArch] = React.useState('arm64')
  const [status, setStatus] = React.useState('')
  const url = platform === 'mac'
    ? (arch === 'arm64' ? DOWNLOADS.macArm64 : DOWNLOADS.macIntel)
    : platform === 'windows' ? DOWNLOADS.windows : ''

  const download = () => {
    if (url === '') { setStatus(t('downloadPreparing')); return }
    window.location.assign(url)
  }

  return h('div', { className: 'st-site-download' },
    h('div', { className: 'st-site-download-controls' },
      h('button', {
        type: 'button', className: 'fang-btn fang-btn-primary fang-btn-xl', onClick: download,
        disabled: platform === 'other',
        'data-download-url': url, 'data-platform': platform, 'data-arch': arch,
      }, t('download')),
      platform === 'mac'
        ? h(Dropdown, {
            label: t('macArch'),
            value: arch,
            options: [
              { value: 'arm64', label: t('macArm') },
              { value: 'x64', label: t('macIntel') },
            ],
            onChange: (next) => { setArch(next); setStatus('') },
            testId: 'site-mac-arch',
          })
        : null),
    status === '' ? null : h('p', { className: 'st-site-download-status' }, status))
}

const root = document.getElementById('root')
root.replaceChildren()
createRoot(root).render(h('div', { className: 'st-shell' },
  h(WelcomePage, {
    t,
    api: {},
    books: [],
    hasBook: false,
    primary: h(SiteDownload, { t }),
  })))
