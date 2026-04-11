import { ipcRenderer } from 'electron'
import { ControllerHandler } from './types'
import { Session } from '../domain/models/session'
import { Language } from '../domain/models/currentLanguage'

// API для renderer процесса
export const api: ControllerHandler = {
  session: {
    getSessions: () => ipcRenderer.invoke('sessions:get'),
    addSession: (sessionData: Omit<Session, 'id'>) =>
      ipcRenderer.invoke('session:add', sessionData),
    removeSession: (id: number) => ipcRenderer.invoke('session:remove', id),
    getCurrentSession: () => ipcRenderer.invoke('session:getCurrentSession'),
    setCurrentSession: (id: number) => ipcRenderer.invoke('session:setCurrentSession', id),
    removeCurrentSession: () => ipcRenderer.invoke('session:removeCurrentSession'),
    removeAllSessions: () => ipcRenderer.invoke('session:removeAllSessions'),
    openSelectFolderDialog: () => ipcRenderer.invoke('session:openSelectFolderDialog')
  },
  currentLanguage: {
    getCurrentLanguage: () => ipcRenderer.invoke('getCurrentLanguage'),
    setCurrentLanguage: (lang: Language) => ipcRenderer.invoke('setCurrentLanguage', lang)
  },
  project: {
    getFileTree: () => ipcRenderer.invoke('project:getFileTree'),
    stopWatcher: () => ipcRenderer.invoke('project:stopWatcher'),
    getLocaleFolders: () => ipcRenderer.invoke('project:getLocaleFolders')
  }
}
