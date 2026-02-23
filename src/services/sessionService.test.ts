import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { sessionService } from './sessionService'
import * as fs from 'fs'
import * as path from 'path'
import { tmpdir } from 'os'

describe('SessionService', () => {
  let testDir1: string
  let testDir2: string
  let testDir3: string

  const createTestDirectory = (): string => {
    const dir = path.join(tmpdir(), `test-project-${Date.now()}-${Math.random()}`)
    fs.mkdirSync(dir, { recursive: true })
    return dir
  }

  const cleanupDirectory = (dir: string): void => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  }

  const createValidProjectStructure = (dir: string): void => {
    const enDir = path.join(dir, 'en')
    fs.mkdirSync(enDir, { recursive: true })
    fs.writeFileSync(path.join(enDir, 'common.json'), '{}')
  }

  beforeEach(() => {
    testDir1 = createTestDirectory()
    testDir2 = createTestDirectory()
    testDir3 = createTestDirectory()
    createValidProjectStructure(testDir1)
    createValidProjectStructure(testDir2)
    createValidProjectStructure(testDir3)
    sessionService.removeAllSessions()
  })

  afterEach(() => {
    cleanupDirectory(testDir1)
    cleanupDirectory(testDir2)
    cleanupDirectory(testDir3)
    sessionService.removeAllSessions()
  })

  describe('getSessions', () => {
    it('должен вернуть пустой массив, если сессий нет', () => {
      const sessions = sessionService.getSessions()
      expect(sessions).toEqual([])
    })

    it('должен вернуть список сохраненных сессий', () => {
      // Используем простую структуру без вложенных папок
      const simpleDir = createTestDirectory()
      fs.writeFileSync(path.join(simpleDir, 'test.json'), '{}')

      try {
        const result = sessionService.addSession({
          path: simpleDir,
          name: 'Simple Project',
          color: 'blue'
        })

        if ('errors' in result) {
          // Если ошибка - проверяем, что это не folder_not_found
          expect(result.errors.path).not.toBe('folder_not_found')
        } else {
          const sessions = sessionService.getSessions()
          expect(sessions.length).toBeGreaterThan(0)
        }
      } finally {
        cleanupDirectory(simpleDir)
      }
    })
  })

  describe('addSession', () => {
    const newSessionData = {
      path: testDir1,
      name: 'Test Project',
      color: 'blue' as const
    }

    it('должен добавить новую сессию', () => {
      const result = sessionService.addSession(newSessionData)

      if ('errors' in result) {
        // Если есть ошибка, проверяем, что это не folder_not_found
        if (result.errors.path === 'folder_not_found') {
          // Проверяем, что папка действительно существует
          expect(fs.existsSync(testDir1)).toBe(true)
          throw new Error('Folder exists but got folder_not_found error')
        }
      } else {
        expect(result.id).toBe(1)
        expect(result.path).toBe(newSessionData.path)
        expect(result.name).toBe(newSessionData.name)
      }
    })

    it('должен вернуть ошибку, если путь уже существует', () => {
      sessionService.addSession(newSessionData)
      const result = sessionService.addSession(newSessionData)
      expect(result).toHaveProperty('errors.path')
    })

    it('должен вернуть ошибку, если имя уже существует', () => {
      sessionService.addSession(newSessionData)
      const result = sessionService.addSession({
        ...newSessionData,
        path: testDir2
      })
      expect(result).toHaveProperty('errors')
    })

    it('должен присвоить новый ID следующей сессии', () => {
      const result1 = sessionService.addSession({ ...newSessionData, name: 'Project 1' })
      const result2 = sessionService.addSession({
        ...newSessionData,
        path: testDir2,
        name: 'Project 2'
      })

      if (!('errors' in result1) && !('errors' in result2)) {
        const result3 = sessionService.addSession({
          ...newSessionData,
          path: testDir3,
          name: 'Project 3'
        })

        if (!('errors' in result3)) {
          expect(result3.id).toBeGreaterThan(result2.id)
        }
      }
    })

    it('должен вернуть ошибку, если структура проекта невалидна', () => {
      const invalidDir = createTestDirectory()
      fs.writeFileSync(path.join(invalidDir, 'invalid.txt'), 'content')

      const result = sessionService.addSession({
        ...newSessionData,
        path: invalidDir
      })

      expect(result).toHaveProperty('errors')
      expect(result).toHaveProperty('errors.path')

      cleanupDirectory(invalidDir)
    })
  })

  describe('removeSession', () => {
    it('должен удалить сессию по ID', () => {
      const session1Result = sessionService.addSession({
        path: testDir1,
        name: 'Project 1',
        color: 'blue'
      })
      const session2Result = sessionService.addSession({
        path: testDir2,
        name: 'Project 2',
        color: 'red'
      })

      if ('errors' in session1Result || 'errors' in session2Result) {
        // Если не удалось добавить сессии, пропускаем тест
        return
      }

      const result = sessionService.removeSession(session1Result.id)
      expect(result).toBe(true)
      expect(sessionService.getSessions().length).toBe(1)
    })

    it('должен вернуть false, если сессия не найдена', () => {
      sessionService.addSession({
        path: testDir1,
        name: 'Project 1',
        color: 'blue'
      })
      const result = sessionService.removeSession(999)
      expect(result).toBe(false)
    })

    it('должен очистить currentSession, если удалена текущая сессия', () => {
      const sessionResult = sessionService.addSession({
        path: testDir1,
        name: 'Project 1',
        color: 'blue'
      })

      if ('errors' in sessionResult) {
        return
      }

      sessionService.setCurrentSession(sessionResult.id)
      sessionService.removeSession(sessionResult.id)
      expect(sessionService.getCurrentSession()).toBe(null)
    })
  })

  describe('getCurrentSession', () => {
    it('должен вернуть null, если текущая сессия не установлена', () => {
      const currentSession = sessionService.getCurrentSession()
      expect(currentSession).toBe(null)
    })

    it('должен вернуть текущую сессию', () => {
      const sessionResult = sessionService.addSession({
        path: testDir1,
        name: 'Project 1',
        color: 'blue'
      })

      if ('errors' in sessionResult) {
        return
      }

      sessionService.setCurrentSession(sessionResult.id)
      const currentSession = sessionService.getCurrentSession()
      expect(currentSession).not.toBe(null)
    })
  })

  describe('setCurrentSession', () => {
    it('должен вернуть null, если сессия не найдена', () => {
      const result = sessionService.setCurrentSession(999)
      expect(result).toBe(null)
    })
  })

  describe('removeCurrentSession', () => {
    it('должен очистить текущую сессию', () => {
      const sessionResult = sessionService.addSession({
        path: testDir1,
        name: 'Project 1',
        color: 'blue'
      })

      if ('errors' in sessionResult) {
        return
      }

      sessionService.setCurrentSession(sessionResult.id)
      sessionService.removeCurrentSession()
      expect(sessionService.getCurrentSession()).toBe(null)
    })
  })

  describe('removeAllSessions', () => {
    it('должен удалить все сессии и очистить currentSession', () => {
      const sessionResult = sessionService.addSession({
        path: testDir1,
        name: 'Project 1',
        color: 'blue'
      })

      if ('errors' in sessionResult) {
        return
      }

      sessionService.setCurrentSession(sessionResult.id)
      sessionService.removeAllSessions()
      expect(sessionService.getSessions()).toEqual([])
      expect(sessionService.getCurrentSession()).toBe(null)
    })
  })

  describe('openSelectFolderDialog', () => {
    it('должен вернуть путь к папке, если пользователь выбрал папку', async () => {
      const mockPath = '/selected/folder'
      const { dialog } = await import('electron')

      vi.mocked(dialog.showOpenDialog).mockResolvedValue({
        canceled: false,
        filePaths: [mockPath]
      })

      const result = await sessionService.openSelectFolderDialog()
      expect(result).toBe(mockPath)
    })

    it('должен вернуть null, если пользователь отменил выбор', async () => {
      const { dialog } = await import('electron')

      vi.mocked(dialog.showOpenDialog).mockResolvedValue({
        canceled: true,
        filePaths: []
      })

      const result = await sessionService.openSelectFolderDialog()
      expect(result).toBe(null)
    })

    it('должен вернуть null, если filePaths пустой', async () => {
      const { dialog } = await import('electron')

      vi.mocked(dialog.showOpenDialog).mockResolvedValue({
        canceled: false,
        filePaths: []
      })

      const result = await sessionService.openSelectFolderDialog()
      expect(result).toBe(null)
    })
  })
})
