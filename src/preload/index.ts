import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { api } from '../controllers/api'
import currentLanguageService from '../services/currentLanguageService'
import { sessionService } from '../services/sessionService'

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('currentLanguage', currentLanguageService.getCurrentLanguage())
    contextBridge.exposeInMainWorld('currentSession', sessionService.getCurrentSession())
    contextBridge.exposeInMainWorld('sessions', sessionService.getSessions())
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
  // @ts-ignore (define in dts)
  window.currentSession = sessionService.getCurrentSession()
  // @ts-ignore (define in dts)
  window.sessions = sessionService.getSessions()
}
