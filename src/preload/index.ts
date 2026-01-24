import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { api } from '../controllers/api'
import currentLanguageService from '../services/currentLanguageService'

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('currentLanguage', currentLanguageService.getCurrentLanguage())
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.currentLanguage = currentLanguageService.getCurrentLanguage()
}
