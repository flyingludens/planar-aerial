/**
 * Electron main process: one window, one shared service, one IPC route table.
 *
 * The service is built once with the standalone model provider. IPC hands the renderer's
 * `(path, body)` calls to the same Web-Request handler the HTTP adapter exposes, so the route
 * logic is not aware that it is running outside DSH.
 */
import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createStoryService } from '../lib/service.js'
import { createStoryHttpHandler } from '../lib/adapters/http.js'
import { createStandaloneProvider } from './provider.js'
import { listAllBooks } from '../lib/store.js'
import { startMcpServer } from './mcp.js'

const here = dirname(fileURLToPath(import.meta.url))
const provider = createStandaloneProvider()

function storyService() {
  return createStoryService({
    config: { settingsPath: join(app.getPath('userData'), 'storywriting', 'settings.json') },
    host: {
      llm: provider,
      // No host default: the shared service's built-in Agnes default applies, exactly as it does
      // in DSH when the host names no model of its own.
      get: () => undefined,
    },
  })
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 900,
    minHeight: 640,
    backgroundColor: '#0b0b0c',
    // No native title bar. On macOS the traffic lights stay, inset over the panel's own title
    // row; on other platforms the window keeps its system frame until custom controls exist.
    ...(process.platform === 'darwin'
      ? { titleBarStyle: 'hiddenInset', trafficLightPosition: { x: 18, y: 22 } }
      : {}),
    webPreferences: {
      preload: join(here, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })
  window.loadFile(join(here, '..', 'dist', 'electron', 'index.html'))
}

let mcp = null

app.whenReady().then(async () => {
  const service = storyService()
  const search = createStoryHttpHandler(service)
  try {
    const booksTool = {
      name: 'story_books',
      description: 'List the books in the configured library. Pass a returned folder as the book argument of the other story tools.',
      parameters: { type: 'object', properties: {}, additionalProperties: false },
      output: {
        schema: { type: 'object', properties: { library: { type: 'string' }, books: { type: 'array', items: { type: 'object' } } }, required: ['library', 'books'], additionalProperties: false },
        render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }],
      },
      async execute() {
        const { library } = await service.resolveLibrary()
        return { library, books: await listAllBooks(library) }
      },
    }
    mcp = await startMcpServer({ tools: [...service.tools, booksTool], version: app.getVersion() })
  } catch (failure) {
    mcp = { error: String(failure?.message ?? failure) }
  }
  ipcMain.handle('story:mcpInfo', () => (mcp === null || mcp.error !== undefined
    ? { ok: false, error: mcp?.error ?? 'MCP is not running' }
    : {
        ok: true, url: mcp.url, token: mcp.token, config: JSON.stringify(mcp.config, null, 2),
        ...(typeof mcp.status === 'function' ? mcp.status() : {}),
      }))
  ipcMain.handle('story:openHarness', async () => {
    const candidates = [
      process.env.PLANAR_HARNESS_PATH,
      ...(process.platform === 'darwin' ? ['/Applications/OpenCode.app'] : []),
    ].filter((value) => typeof value === 'string' && value !== '')
    for (const candidate of candidates) {
      const failure = await shell.openPath(candidate).catch((error) => String(error?.message ?? error))
      if (failure === '') return { ok: true }
    }
    try {
      await shell.openExternal('opencode://')
      return { ok: true }
    } catch (failure) {
      return { ok: false, error: String(failure?.message ?? failure) }
    }
  })
  ipcMain.handle('story:pickDirectory', async () => {
    const win = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0]
    app.focus({ steal: true })
    win?.focus()
    const options = { properties: ['openDirectory', 'createDirectory', 'promptToCreate'] }
    const result = win === undefined || win === null
      ? await dialog.showOpenDialog(options)
      : await dialog.showOpenDialog(win, options)
    return result.canceled || result.filePaths.length === 0 ? null : result.filePaths[0]
  })

  ipcMain.handle('story:request', async (_event, { path, body }) => {
    const request = new Request(`http://story.local${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    })
    const response = await search(request)
    const data = await response.json().catch(() => ({ ok: false, error: 'invalid host answer' }))
    return { ok: response.ok, data }
  })

  createWindow()
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('before-quit', () => { if (mcp !== null && typeof mcp.close === 'function') mcp.close() })
