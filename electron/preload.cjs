const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('storyHost', {
  request: (path, body) => ipcRenderer.invoke('story:request', { path, body }),
  pickDirectory: () => ipcRenderer.invoke('story:pickDirectory'),
  mcpInfo: () => ipcRenderer.invoke('story:mcpInfo'),
  openHarness: () => ipcRenderer.invoke('story:openHarness'),
})
