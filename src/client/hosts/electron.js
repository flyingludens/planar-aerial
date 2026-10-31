/**
 * The Electron renderer entry: the shared panel, mounted without a host plugin runtime.
 *
 * Everything below the mount is the same code DSH loads. The only host-specific pieces are the
 * transport (preload IPC) and the translation binding; no page is copied.
 */
import { createRoot } from 'react-dom/client'
import { h } from '../shared/react.js'
import { createStoryApi } from '../api.js'
import { EN, ZH } from '../shared/locale.js'
import { StoryPanelBody } from '../panel/core.js'
import { DARK_THEME } from '../shared/theme.js'

const theme = document.createElement('style')
theme.textContent = DARK_THEME
document.head.appendChild(theme)

const dictionary = String(navigator.language ?? '').toLowerCase().startsWith('zh') ? ZH : EN
const t = (key, params = {}) => {
  let text = dictionary[key] ?? key
  for (const [name, value] of Object.entries(params)) text = text.replaceAll(`{${name}}`, String(value))
  return text
}

const transport = async (path, body) => {
  const answer = await window.storyHost.request(path, body)
  if (answer?.ok !== true) throw new Error(answer?.data?.error || `${path} failed`)
  return answer.data
}

const root = document.getElementById('root')
root.replaceChildren()
createRoot(root).render(h(StoryPanelBody, {
  t,
  api: createStoryApi(transport),
  pickDirectory: () => window.storyHost.pickDirectory(),
  mcpInfo: () => window.storyHost.mcpInfo(),
  openHarness: () => window.storyHost.openHarness(),
  config: {},
}))
