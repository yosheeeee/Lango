import store from '../domain/store'
import { Session } from '../domain/models/session'

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
  addSession(session: Omit<Session, 'id'>): Session {
    const sessions = this.getSessions()
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
      store.set('currentSession', session)
    }

    return session
  }

  /**
   * Удаляет текущую сессию (очищает выбор)
   */
  removeCurrentSession(): void {
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

    // Get the currently focused window or create a reference if needed
    const focusedWindow = BrowserWindow.getFocusedWindow()

    const result = await dialog.showOpenDialog(
      focusedWindow || {
        properties: ['openDirectory'],
        title: 'Выберите папку проекта',
        buttonLabel: 'Выбрать'
      }
    )

    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0]
    }

    return null
  }
}

// ЭКСПОРТИРУЕМ ГОТОВЫЙ ЭКЗЕМПЛЯР (СИНГЛТОН)
export const sessionService = new SessionService()
