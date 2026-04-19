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
    getLocaleFolders: () => ipcRenderer.invoke('project:getLocaleFolders'),
    createNamespace: (namespacePath: string) =>
      ipcRenderer.invoke('project:createNamespace', namespacePath),
    fixOrphanNamespace: (namespacePath: string) =>
      ipcRenderer.invoke('project:fixOrphanNamespace', namespacePath),
    deleteNamespace: (namespacePath: string) =>
      ipcRenderer.invoke('project:deleteNamespace', namespacePath),
    createFolder: (folderPath: string) => ipcRenderer.invoke('project:createFolder', folderPath),
    deleteFolder: (folderPath: string) => ipcRenderer.invoke('project:deleteFolder', folderPath),
    createLocale: (localeName: string) => ipcRenderer.invoke('project:createLocale', localeName),
    deleteLocale: (localeName: string) => ipcRenderer.invoke('project:deleteLocale', localeName),
    getKeyTranslations: (namespace: string, key: string) =>
      ipcRenderer.invoke('project:getKeyTranslations', namespace, key),
    updateLocalizationValue: (namespace: string, key: string, locale: string, value: string) =>
      ipcRenderer.invoke('project:updateLocalizationValue', namespace, key, locale, value),
    getNamespaceContent: (namespace: string, locale: string) =>
      ipcRenderer.invoke('project:getNamespaceContent', namespace, locale),
    deleteLocalizationKey: (namespace: string, key: string) =>
      ipcRenderer.invoke('project:deleteLocalizationKey', namespace, key),
    renameLocalizationKey: (namespace: string, oldKey: string, newKey: string) =>
      ipcRenderer.invoke('project:renameLocalizationKey', namespace, oldKey, newKey),
    addLocalizationKey: (namespace: string, key: string, parentKey?: string, isParent?: boolean) =>
      ipcRenderer.invoke('project:addLocalizationKey', namespace, key, parentKey, isParent),
    getNamespaceOrphanKeys: (namespace: string) =>
      ipcRenderer.invoke('project:getNamespaceOrphanKeys', namespace),
    fixOrphanKey: (namespace: string, key: string) =>
      ipcRenderer.invoke('project:fixOrphanKey', namespace, key),
    getAllNamespacesContent: (locale: string) =>
      ipcRenderer.invoke('project:getAllNamespacesContent', locale),
    search: (query: string, _limit = 50, _offset = 0) =>
      ipcRenderer.invoke('project:search', query, _limit, _offset)
  }
}
