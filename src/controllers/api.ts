import { ipcRenderer } from 'electron'
import { ControllerHandler } from './types'
import { Session } from '../domain/models/session'
import { Language } from '../domain/models/currentLanguage'

// API для renderer процесса
export const api: ControllerHandler = {
  session: {
    getSessions: (): Promise<Session[]> => ipcRenderer.invoke('sessions:get'),
    addSession: (sessionData: Omit<Session, 'id'>): Promise<Session> =>
      ipcRenderer.invoke('session:add', sessionData),
    removeSession: (id: number): Promise<boolean> => ipcRenderer.invoke('session:remove', id),
    getCurrentSession: (): Promise<Session | null> =>
      ipcRenderer.invoke('session:getCurrentSession'),
    setCurrentSession: (id: number): Promise<Session | null> =>
      ipcRenderer.invoke('session:setCurrentSession', id),
    removeCurrentSession: (): Promise<boolean> =>
      ipcRenderer.invoke('session:removeCurrentSession'),
    openSelectFolderDialog: (): Promise<string | null> =>
      ipcRenderer.invoke('session:openSelectFolderDialog')
  },
  currentLanguage: {
    getCurrentLanguage: () => ipcRenderer.invoke('getCurrentLanguage'),
    setCurrentLanguage: (lang: Language) => ipcRenderer.invoke('setCurrentLanguage', lang)
  }
}
