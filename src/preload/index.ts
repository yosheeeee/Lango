import { contextBridge, ipcRenderer } from 'electron'
import { api } from '../controllers/api'

const events = {
  onFileTreeChanged: (cb: () => void) => {
    const h = () => cb()
    ipcRenderer.on('file-tree:changed', h)
    return () => ipcRenderer.removeListener('file-tree:changed', h)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', { ...api, events })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.api = { ...api, events }
}
