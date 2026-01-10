import { ipcMain } from 'electron'
import { sessionService } from '../services/sessionService'
import { Session } from '../domain/models/session'

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

export interface SessionHandler {
  getSessions: () => Promise<Session[]>
  addSession: (sessionData: Omit<Session, 'id'>) => Promise<Session>
  removeSession: (id: number) => Promise<boolean>
  getCurrentSession: () => Promise<Session | null>
  setCurrentSession: (id: number) => Promise<Session | null>
  removeCurrentSession: () => Promise<boolean>
  openSelectFolderDialog: () => Promise<string | null>
}
