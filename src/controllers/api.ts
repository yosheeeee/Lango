import { ipcRenderer } from 'electron'
import { ControllerHandler } from './types'
import { Session } from '../domain/models/session'
import { Language } from '../domain/models/currentLanguage'
import { CH } from './channels'

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
    getFileTree: () => ipcRenderer.invoke(CH.project.getFileTree),
    stopWatcher: () => ipcRenderer.invoke(CH.project.stopWatcher),
    getLocaleFolders: () => ipcRenderer.invoke(CH.project.getLocaleFolders),
    createNamespace: (namespacePath: string) =>
      ipcRenderer.invoke(CH.project.createNamespace, namespacePath),
    fixOrphanNamespace: (namespacePath: string) =>
      ipcRenderer.invoke(CH.project.fixOrphanNamespace, namespacePath),
    deleteNamespace: (namespacePath: string) =>
      ipcRenderer.invoke(CH.project.deleteNamespace, namespacePath),
    createFolder: (folderPath: string) => ipcRenderer.invoke(CH.project.createFolder, folderPath),
    deleteFolder: (folderPath: string) => ipcRenderer.invoke(CH.project.deleteFolder, folderPath),
    createLocale: (localeName: string) => ipcRenderer.invoke(CH.project.createLocale, localeName),
    deleteLocale: (localeName: string) => ipcRenderer.invoke(CH.project.deleteLocale, localeName),
    getKeyTranslations: (namespace: string, key: string) =>
      ipcRenderer.invoke(CH.project.getKeyTranslations, namespace, key),
    updateLocalizationValue: (namespace: string, key: string, locale: string, value: string) =>
      ipcRenderer.invoke(CH.project.updateLocalizationValue, namespace, key, locale, value),
    batchUpdateLocalizationValues: (
      updates: { namespace: string; key: string; locale: string; value: string }[]
    ) => ipcRenderer.invoke(CH.project.batchUpdateLocalizationValues, updates),
    getNamespaceContent: (namespace: string, locale: string) =>
      ipcRenderer.invoke(CH.project.getNamespaceContent, namespace, locale),
    deleteLocalizationKey: (namespace: string, key: string) =>
      ipcRenderer.invoke(CH.project.deleteLocalizationKey, namespace, key),
    renameLocalizationKey: (namespace: string, oldKey: string, newKey: string) =>
      ipcRenderer.invoke(CH.project.renameLocalizationKey, namespace, oldKey, newKey),
    addLocalizationKey: (namespace: string, key: string, parentKey?: string, isParent?: boolean) =>
      ipcRenderer.invoke(CH.project.addLocalizationKey, namespace, key, parentKey, isParent),
    getNamespaceOrphanKeys: (namespace: string) =>
      ipcRenderer.invoke(CH.project.getNamespaceOrphanKeys, namespace),
    fixOrphanKey: (namespace: string, key: string) =>
      ipcRenderer.invoke(CH.project.fixOrphanKey, namespace, key),
    getAllNamespacesContent: (locale: string) =>
      ipcRenderer.invoke(CH.project.getAllNamespacesContent, locale),
    search: (query: string, _limit = 50, _offset = 0) =>
      ipcRenderer.invoke(CH.project.search, query, _limit, _offset),
    getAnalytics: (sourceLocale?: string | null) =>
      ipcRenderer.invoke(CH.project.getAnalytics, sourceLocale ?? null)
  }
}
