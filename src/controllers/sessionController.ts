import { ipcMain } from 'electron'
import { sessionService } from '../services/sessionService'
import { GenericControllerHandler } from './types'

// Получить все сессии
ipcMain.handle('sessions:get', () => {
  return sessionService.getSessions()
})

// Добавить новую сессию
ipcMain.handle('session:add', (_, sessionData) => {
  return sessionService.addSession(sessionData)
})

// Удалить сессию по ID
ipcMain.handle('session:remove', (_, id: number) => {
  return sessionService.removeSession(id)
})

// Получить текущую сессию
ipcMain.handle('session:getCurrentSession', () => {
  return sessionService.getCurrentSession()
})

// Установить текущую сессию
ipcMain.handle('session:setCurrentSession', (_, id: number) => {
  return sessionService.setCurrentSession(id)
})

// Удалить текущую сессию
ipcMain.handle('session:removeCurrentSession', () => {
  sessionService.removeCurrentSession()
  return true
})

// Открыть диалог выбора папки
ipcMain.handle('session:openSelectFolderDialog', () => {
  return sessionService.openSelectFolderDialog()
})

type Service = typeof sessionService

export type SessionHandler = GenericControllerHandler<Service>
