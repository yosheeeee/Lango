import { contextBridge, ipcRenderer } from 'electron'
import { api } from '../controllers/api'

const events = {
  onFileTreeChanged: (cb: () => void) => {
    const h = () => cb()
    ipcRenderer.on('file-tree:changed', h)
    return () => ipcRenderer.removeListener('file-tree:changed', h)
  }
}

const windowControls = {
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', { ...api, events })
    contextBridge.exposeInMainWorld('windowControls', windowControls)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.api = { ...api, events }
  // @ts-ignore
  window.windowControls = windowControls
}
