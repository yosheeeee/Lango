import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { sessionService } from '../services/sessionService'
import { getProjectService, ProjectService } from '../services/projectService'
import { startFileWatcher, stopFileWatcher } from '../services/fileWatcher'
import { GenericControllerHandler } from './types'
import { CH } from './channels'

function withProject<Args extends unknown[], R>(
  fn: (svc: ProjectService, ...args: Args) => R | Promise<R>,
  fallback?: R
) {
  return async (_: IpcMainInvokeEvent, ...args: Args): Promise<R> => {
    const session = sessionService.getCurrentSession()
    if (!session) {
      if (fallback !== undefined) return fallback
      throw new Error('No active session')
    }
    return fn(getProjectService(session.path), ...args)
  }
}

// Получить дерево файлов текущего проекта
ipcMain.handle(
  CH.project.getFileTree,
  withProject((svc, name: string) => {
    startFileWatcher()
    return svc.getFileTreeAsync(name)
  }, null)
)

// Остановить watcher (вызывается при смене сессии или закрытии)
ipcMain.handle(CH.project.stopWatcher, () => {
  stopFileWatcher()
  return true
})

ipcMain.handle(
  CH.project.getLocaleFolders,
  withProject((svc) => svc.getLocaleFoldersAsync(), [])
)

ipcMain.handle(
  CH.project.createNamespace,
  withProject((svc, ns: string) => {
    svc.createNamespace(ns)
    return true
  })
)

ipcMain.handle(
  CH.project.fixOrphanNamespace,
  withProject((svc, ns: string) => {
    svc.fixOrphanNamespace(ns)
    return true
  })
)

ipcMain.handle(
  CH.project.deleteNamespace,
  withProject((svc, ns: string) => {
    svc.deleteNamespace(ns)
    return true
  })
)

ipcMain.handle(
  CH.project.deleteFolder,
  withProject((svc, fp: string) => {
    svc.deleteFolder(fp)
    return true
  })
)

ipcMain.handle(
  CH.project.createFolder,
  withProject((svc, fp: string) => {
    svc.createFolder(fp)
    return true
  })
)

ipcMain.handle(
  CH.project.createLocale,
  withProject((svc, loc: string) => {
    svc.createLocale(loc)
    return true
  })
)

ipcMain.handle(
  CH.project.deleteLocale,
  withProject((svc, loc: string) => {
    svc.deleteLocale(loc)
    return true
  })
)

ipcMain.handle(
  CH.project.deleteLocalizationKey,
  withProject((svc, ns: string, key: string) => {
    svc.deleteLocalizationKey(ns, key)
    return true
  })
)

ipcMain.handle(
  CH.project.renameLocalizationKey,
  withProject((svc, ns: string, oldKey: string, newKey: string) => {
    svc.renameLocalizationKey(ns, oldKey, newKey)
    return true
  })
)

ipcMain.handle(
  CH.project.getKeyTranslations,
  withProject((svc, ns: string, key: string) => svc.getKeyTranslations(ns, key), {})
)

ipcMain.handle(
  CH.project.updateLocalizationValue,
  withProject((svc, ns: string, key: string, loc: string, val: string) => {
    svc.updateLocalizationValue(ns, key, loc, val)
    return true
  })
)

ipcMain.handle(
  CH.project.batchUpdateLocalizationValues,
  withProject(
    (svc, updates: { namespace: string; key: string; locale: string; value: string }[]) => {
      svc.batchUpdateLocalizationValues(updates)
      return true
    }
  )
)

ipcMain.handle(
  CH.project.getNamespaceContent,
  withProject((svc, ns: string, loc: string) => svc.getNamespaceContentAsync(ns, loc), {})
)

ipcMain.handle(
  CH.project.getAllNamespacesContent,
  withProject((svc, loc: string) => svc.getAllNamespacesContentAsync(loc), {})
)

ipcMain.handle(
  CH.project.getNamespaceOrphanKeys,
  withProject((svc, ns: string) => svc.getNamespaceOrphanKeys(ns), [])
)

ipcMain.handle(
  CH.project.fixOrphanKey,
  withProject((svc, ns: string, key: string) => {
    svc.fixOrphanKey(ns, key)
    return true
  })
)

ipcMain.handle(
  CH.project.addLocalizationKey,
  withProject((svc, ns: string, key: string, parentKey?: string, isParent?: boolean) => {
    svc.addLocalizationKey(ns, key, parentKey, isParent)
    return true
  })
)

ipcMain.handle(CH.project.search, async (_, query: string, limit = 50, offset = 0) => {
  const session = sessionService.getCurrentSession()
  if (!session) return { items: [], total: 0, hasMore: false }
  return getProjectService(session.path).search(query, limit, offset)
})

ipcMain.handle(
  CH.project.getAnalytics,
  withProject((svc, srcLoc?: string | null) => svc.getAnalyticsAsync(srcLoc ?? null), null)
)

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
  batchUpdateLocalizationValues: (
    updates: { namespace: string; key: string; locale: string; value: string }[]
  ) => void updates,
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
    null as (ReturnType<ProjectService['getAnalyticsAsync']> & { _u: typeof sourceLocale }) | null
}
/* eslint-enable @typescript-eslint/no-unused-vars */

export type ProjectHandler = GenericControllerHandler<Service>
