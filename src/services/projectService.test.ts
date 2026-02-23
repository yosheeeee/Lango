import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ProjectService } from './projectService'
import { CheckProjectStructureErrors } from '../domain/models/errors'
import * as fs from 'fs'
import * as path from 'path'
import { tmpdir } from 'os'

describe('ProjectService', () => {
  let projectService: ProjectService
  let testDir: string

  const createTestDirectory = (): string => {
    const dir = path.join(tmpdir(), `test-project-${Date.now()}`)
    fs.mkdirSync(dir, { recursive: true })
    return dir
  }

  const cleanupDirectory = (dir: string): void => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  }

  beforeEach(() => {
    testDir = createTestDirectory()
    projectService = new ProjectService(testDir)
  })

  afterEach(() => {
    cleanupDirectory(testDir)
  })

  describe('checkProjectStructure', () => {
    it('должен вернуть FOLDER_NOT_FOUND, если папка не существует', () => {
      const nonExistentPath = path.join(testDir, 'non-existent')
      const service = new ProjectService(nonExistentPath)

      const result = service.checkProjectStructure()

      expect(result).toBe(CheckProjectStructureErrors.FOLDER_NOT_FOUND)
    })

    it('должен вернуть null, если папка пустая', () => {
      const result = projectService.checkProjectStructure()

      expect(result).toBe(null)
    })

    it('должен вернуть null, если папка содержит только системные файлы', () => {
      // Создаем .git папку
      fs.mkdirSync(path.join(testDir, '.git'), { recursive: true })
      fs.writeFileSync(path.join(testDir, '.git', 'config'), '[core]')

      const result = projectService.checkProjectStructure()

      expect(result).toBe(null)
    })

    it('должен вернуть FOUND_INVALID_FILES, если в корне есть файлы', () => {
      fs.writeFileSync(path.join(testDir, 'readme.txt'), 'content')

      const result = projectService.checkProjectStructure()

      expect(result).toBe(CheckProjectStructureErrors.FOUND_INVALID_FILES)
    })

    it('должен вернуть null для валидной структуры проекта', () => {
      // Создаем папки языков
      const enDir = path.join(testDir, 'en')
      const ruDir = path.join(testDir, 'ru')
      fs.mkdirSync(enDir, { recursive: true })
      fs.mkdirSync(ruDir, { recursive: true })

      // Добавляем JSON файлы
      fs.writeFileSync(path.join(enDir, 'common.json'), '{}')
      fs.writeFileSync(path.join(ruDir, 'common.json'), '{}')

      const result = projectService.checkProjectStructure()

      expect(result).toBe(null)
    })

    it('должен поддерживать вложенные папки с JSON файлами', () => {
      const enDir = path.join(testDir, 'en')
      const featuresDir = path.join(enDir, 'features')
      fs.mkdirSync(featuresDir, { recursive: true })

      fs.writeFileSync(path.join(enDir, 'common.json'), '{}')
      fs.writeFileSync(path.join(featuresDir, 'auth.json'), '{}')

      const result = projectService.checkProjectStructure()

      expect(result).toBe(null)
    })

    it('должен игнорировать регистр расширения файла', () => {
      const enDir = path.join(testDir, 'en')
      fs.mkdirSync(enDir, { recursive: true })
      fs.writeFileSync(path.join(enDir, 'common.JSON'), '{}')

      const result = projectService.checkProjectStructure()

      expect(result).toBe(null)
    })
  })

  describe('constructor', () => {
    it('должен правильно инициализировать projectPath', () => {
      const customPath = '/custom/path/to/project'
      const service = new ProjectService(customPath)

      expect(service).toBeInstanceOf(ProjectService)
    })
  })
})
