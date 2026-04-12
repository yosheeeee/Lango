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

type Service = typeof projectServiceStub

const projectServiceStub = {
  getFileTree: () => null as unknown as ReturnType<ProjectService['getFileTree']> | null,
  stopWatcher: () => true,
  getLocaleFolders: () => [] as unknown as ReturnType<ProjectService['getLocaleFolders']>,
  createNamespace: (_namespacePath: string) => true,
  deleteNamespace: (_namespacePath: string) => true,
  createFolder: (_folderPath: string) => true,
  deleteFolder: (_folderPath: string) => true,
  createLocale: (_localeName: string) => true,
  deleteLocale: (_localeName: string) => true
}

export type ProjectHandler = GenericControllerHandler<Service>
