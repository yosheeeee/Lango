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
  const tree = projectService.getFileTree()
  // Запускаем watcher при запросе дерева
  startFileWatcher()
  return tree
})

// Остановить watcher (вызывается при смене сессии или закрытии)
ipcMain.handle('project:stopWatcher', () => {
  stopFileWatcher()
  return true
})

type Service = typeof projectServiceStub

const projectServiceStub = {
  getFileTree: () => null as unknown as ReturnType<ProjectService['getFileTree']>,
  stopWatcher: () => true
}

export type ProjectHandler = GenericControllerHandler<Service>
