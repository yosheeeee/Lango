import { ipcMain } from 'electron'
import { sessionService } from '../services/sessionService'
import { ProjectService } from '../services/projectService'
import { startFileWatcher, stopFileWatcher } from '../services/fileWatcher'
import { GenericControllerHandler } from './types'

// Получить дерево файлов текущего проекта
ipcMain.handle('project:getFileTree', () => {
  const session = sessionService.getCurrentSession()
  if (!session) return null
  const projectService = new ProjectService(session.path)
  const treeData = projectService.getFileTree(session.name)
  // Запускаем watcher при запросе дерева
  startFileWatcher()
  return treeData
})

// Остановить watcher (вызывается при смене сессии или закрытии)
ipcMain.handle('project:stopWatcher', () => {
  stopFileWatcher()
  return true
})

// Получить список локализаций текущего проекта
ipcMain.handle('project:getLocaleFolders', () => {
  const session = sessionService.getCurrentSession()
  if (!session) return []
  const projectService = new ProjectService(session.path)
  return projectService.getLocaleFolders()
})

// Создать неймспейс (пустой .json файл) во всех локализациях
ipcMain.handle('project:createNamespace', (_, namespacePath: string) => {
  const session = sessionService.getCurrentSession()
  if (!session) throw new Error('No active session')
  const projectService = new ProjectService(session.path)
  projectService.createNamespace(namespacePath)
  return true
})

// Добавить неймспейс в отсутствующие локали с копированием ключей
ipcMain.handle('project:fixOrphanNamespace', (_, namespacePath: string) => {
  const session = sessionService.getCurrentSession()
  if (!session) throw new Error('No active session')
  const projectService = new ProjectService(session.path)
  projectService.fixOrphanNamespace(namespacePath)
  return true
})

// Удалить неймспейс из всех локализаций
ipcMain.handle('project:deleteNamespace', (_, namespacePath: string) => {
  const session = sessionService.getCurrentSession()
  if (!session) throw new Error('No active session')
  const projectService = new ProjectService(session.path)
  projectService.deleteNamespace(namespacePath)
  return true
})

// Удалить папку из всех локализаций
ipcMain.handle('project:deleteFolder', (_, folderPath: string) => {
  const session = sessionService.getCurrentSession()
  if (!session) throw new Error('No active session')
  const projectService = new ProjectService(session.path)
  projectService.deleteFolder(folderPath)
  return true
})

// Создать папку во всех локализациях
ipcMain.handle('project:createFolder', (_, folderPath: string) => {
  const session = sessionService.getCurrentSession()
  if (!session) throw new Error('No active session')
  const projectService = new ProjectService(session.path)
  projectService.createFolder(folderPath)
  return true
})

// Создать новую локаль с копированием структуры неймспейсов
ipcMain.handle('project:createLocale', (_, localeName: string) => {
  const session = sessionService.getCurrentSession()
  if (!session) throw new Error('No active session')
  const projectService = new ProjectService(session.path)
  projectService.createLocale(localeName)
  return true
})

// Удалить локаль
ipcMain.handle('project:deleteLocale', (_, localeName: string) => {
  const session = sessionService.getCurrentSession()
  if (!session) throw new Error('No active session')
  const projectService = new ProjectService(session.path)
  projectService.deleteLocale(localeName)
  return true
})

// Удалить ключ локализации из всех файлов неймспейсов
ipcMain.handle('project:deleteLocalizationKey', (_, namespace: string, key: string) => {
  const session = sessionService.getCurrentSession()
  if (!session) throw new Error('No active session')
  const projectService = new ProjectService(session.path)
  projectService.deleteLocalizationKey(namespace, key)
  return true
})

// Переименовать ключ локализации во всех файлах неймспейсов
ipcMain.handle(
  'project:renameLocalizationKey',
  (_, namespace: string, oldKey: string, newKey: string) => {
    const session = sessionService.getCurrentSession()
    if (!session) throw new Error('No active session')
    const projectService = new ProjectService(session.path)
    projectService.renameLocalizationKey(namespace, oldKey, newKey)
    return true
  }
)

// Получить переводы одного ключа по всем локалям
ipcMain.handle('project:getKeyTranslations', (_, namespace: string, key: string) => {
  const session = sessionService.getCurrentSession()
  if (!session) return {}
  const projectService = new ProjectService(session.path)
  return projectService.getKeyTranslations(namespace, key)
})

// Обновить значение перевода для конкретной локали
ipcMain.handle(
  'project:updateLocalizationValue',
  (_, namespace: string, key: string, locale: string, value: string) => {
    const session = sessionService.getCurrentSession()
    if (!session) throw new Error('No active session')
    const projectService = new ProjectService(session.path)
    projectService.updateLocalizationValue(namespace, key, locale, value)
    return true
  }
)

// Получить содержимое неймспейса (ключи + значения) для конкретной локали
ipcMain.handle('project:getNamespaceContent', (_, namespace: string, locale: string) => {
  const session = sessionService.getCurrentSession()
  if (!session) return {}
  const projectService = new ProjectService(session.path)
  return projectService.getNamespaceContent(namespace, locale)
})

// Получить содержимое всех неймспейсов для конкретной локали
ipcMain.handle('project:getAllNamespacesContent', (_, locale: string) => {
  const session = sessionService.getCurrentSession()
  if (!session) return {}
  const projectService = new ProjectService(session.path)
  return projectService.getAllNamespacesContent(locale)
})

// Получить список ключей-сирот (отсутствующих в ≥1 локали) для неймспейса
ipcMain.handle('project:getNamespaceOrphanKeys', (_, namespace: string) => {
  const session = sessionService.getCurrentSession()
  if (!session) return []
  const projectService = new ProjectService(session.path)
  return projectService.getNamespaceOrphanKeys(namespace)
})

// Исправить ключ-сироту (добавить в недостающие локали)
ipcMain.handle('project:fixOrphanKey', (_, namespace: string, key: string) => {
  const session = sessionService.getCurrentSession()
  if (!session) throw new Error('No active session')
  const projectService = new ProjectService(session.path)
  projectService.fixOrphanKey(namespace, key)
  return true
})

// Добавить новый ключ локализации во все файлы неймспейсов
ipcMain.handle(
  'project:addLocalizationKey',
  (_, namespace: string, key: string, parentKey?: string, isParent?: boolean) => {
    const session = sessionService.getCurrentSession()
    if (!session) throw new Error('No active session')
    const projectService = new ProjectService(session.path)
    projectService.addLocalizationKey(namespace, key, parentKey, isParent)
    return true
  }
)

ipcMain.handle('project:search', async (_, query: string, limit = 50, offset = 0) => {
  const session = sessionService.getCurrentSession()
  if (!session) return { items: [], total: 0, hasMore: false }
  const projectService = new ProjectService(session.path)
  return await projectService.search(query, limit, offset)
})

// Агрегированная аналитика проекта
ipcMain.handle('project:getAnalytics', (_, sourceLocale?: string | null) => {
  const session = sessionService.getCurrentSession()
  if (!session) return null
  const projectService = new ProjectService(session.path)
  return projectService.getAnalytics(sourceLocale ?? null)
})

type Service = typeof projectServiceStub

// Stub for type inference — used only via `typeof` in Service type
/* eslint-disable @typescript-eslint/no-unused-vars */
const projectServiceStub = {
  getFileTree: () => null as unknown as ReturnType<ProjectService['getFileTree']> | null,
  stopWatcher: () => true,
  getLocaleFolders: () => [] as unknown as ReturnType<ProjectService['getLocaleFolders']>,
  createNamespace: (namespacePath: string) => void namespacePath,
  fixOrphanNamespace: (namespacePath: string) => void namespacePath,
  deleteNamespace: (namespacePath: string) => void namespacePath,
  createFolder: (folderPath: string) => void folderPath,
  deleteFolder: (folderPath: string) => void folderPath,
  createLocale: (localeName: string) => void localeName,
  deleteLocale: (localeName: string) => void localeName,
  getKeyTranslations: (namespace: string, key: string) =>
    ({}) as ReturnType<ProjectService['getKeyTranslations']> & {
      _u: typeof namespace & typeof key
    },
  updateLocalizationValue: (namespace: string, key: string, locale: string, value: string) =>
    void (namespace + key + locale + value),
  getNamespaceContent: (namespace: string, locale: string) =>
    null as unknown as ReturnType<ProjectService['getNamespaceContent']> & {
      _unused: typeof namespace & typeof locale
    },
  deleteLocalizationKey: (namespace: string, key: string) => void (namespace + key),
  renameLocalizationKey: (namespace: string, oldKey: string, newKey: string) =>
    void (namespace + oldKey + newKey),
  addLocalizationKey: (namespace: string, key: string, parentKey?: string, isParent?: boolean) =>
    void (namespace + key + (parentKey ?? '') + String(isParent)),
  getNamespaceOrphanKeys: (namespace: string) =>
    null as unknown as string[] & { _u: typeof namespace },
  fixOrphanKey: (namespace: string, key: string) => void (namespace + key),
  getAllNamespacesContent: (locale: string) =>
    null as unknown as ReturnType<ProjectService['getAllNamespacesContent']> & {
      _u: typeof locale
    },
  search: (_: string, _limit?: number, _offset?: number) =>
    void (_ + String(_limit) + String(_offset)),
  getAnalytics: (sourceLocale?: string | null) =>
    null as (ReturnType<ProjectService['getAnalytics']> & { _u: typeof sourceLocale }) | null
}
/* eslint-enable @typescript-eslint/no-unused-vars */

export type ProjectHandler = GenericControllerHandler<Service>
