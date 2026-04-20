import store from '../domain/store'
import { Session } from '../domain/models/session'
import { clearProjectServiceCache, ProjectService } from './projectService'
import { SessionServiceErrors } from '../domain/models/errors'

type NewSessionDto = Omit<Session, 'id'>
class SessionService {
  /**
   * Получает список всех сохраненных сессий
   */
  getSessions(): Session[] {
    return store.get('sessions', [])
  }

  /**
   * Добавляет новую сессию
   */
  addSession(
    session: NewSessionDto
  ): Session | { errors: Partial<Record<keyof NewSessionDto, string>> } {
    const project = new ProjectService(session.path)
    const checkResult = project.checkProjectStructure()

    if (checkResult != null) {
      return {
        errors: {
          path: checkResult
        }
      }
    }
    const sessions = this.getSessions()

    if (sessions.find((s) => s.path == session.path)) {
      return {
        errors: {
          path: SessionServiceErrors.PATH_EXISTED
        }
      }
    }
    if (sessions.find((s) => s.name == session.name)) {
      return {
        errors: {
          name: SessionServiceErrors.NAME_EXISTED
        }
      }
    }

    const projectService = new ProjectService(session.path)
    const errorCheck = projectService.checkProjectStructure()
    if (errorCheck) {
      return {
        errors: {
          path: errorCheck
        }
      }
    }

    const id = sessions.length > 0 ? Math.max(...sessions.map((s) => s.id)) + 1 : 1
    const newSession: Session = { ...session, id }

    store.set('sessions', [...sessions, newSession])
    return newSession
  }

  /**
   * Удаляет сессию по ID
   */
  removeSession(id: number): boolean {
    const sessions = this.getSessions()
    const filteredSessions = sessions.filter((session) => session.id !== id)

    // Если сессия была удалена, обновляем хранилище
    if (filteredSessions.length !== sessions.length) {
      store.set('sessions', filteredSessions)

      // Если удалили текущую сессию, очищаем её
      const currentSession = this.getCurrentSession()
      if (currentSession && currentSession.id === id) {
        this.removeCurrentSession()
      }

      return true
    }

    return false
  }

  /**
   * Возвращает текущую выбранную сессию
   */
  getCurrentSession(): Session | null {
    return store.get('currentSession', null)
  }

  /**
   * Устанавливает текущую сессию
   */
  setCurrentSession(id: number): Session | null {
    const sessions = this.getSessions()
    const session = sessions.find((sess) => sess.id === id) || null

    if (session) {
      clearProjectServiceCache()
      store.set('currentSession', session)
    }

    return session
  }

  /**
   * Удаляет текущую сессию (очищает выбор)
   */
  removeCurrentSession(): void {
    clearProjectServiceCache()
    store.set('currentSession', null)
  }

  /**
   * Удаляет все сессии
   */
  removeAllSessions(): void {
    store.set('sessions', [])
    this.removeCurrentSession()
  }

  /**
   * Открывает диалоговое окно для выбора папки
   */
  async openSelectFolderDialog(): Promise<string | null> {
    const { dialog, BrowserWindow } = await import('electron')

    const focusedWindow = BrowserWindow.getFocusedWindow()

    // Настройки выносим в отдельную переменную
    const options: Electron.OpenDialogOptions = {
      title: 'Выберите папку проекта',
      buttonLabel: 'Выбрать',
      properties: ['openDirectory', 'createDirectory']
    }

    // Если окно есть, привязываем диалог к нему (модальное окно)
    // Если нет — просто открываем диалог
    const result = focusedWindow
      ? await dialog.showOpenDialog(focusedWindow, options)
      : await dialog.showOpenDialog(options)

    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0]
    }

    return null
  }
}

// ЭКСПОРТИРУЕМ ГОТОВЫЙ ЭКЗЕМПЛЯР (СИНГЛТОН)
export const sessionService = new SessionService()
