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
    it('должен вернуть FOLDER_NOT_FOUND, если папка не существует', async () => {
      const nonExistentPath = path.join(testDir, 'non-existent')
      const service = new ProjectService(nonExistentPath)

      const result = service.checkProjectStructure()

      expect(result).toBe(CheckProjectStructureErrors.FOLDER_NOT_FOUND)
    })

    it('должен вернуть null, если папка пустая', async () => {
      const result = projectService.checkProjectStructure()

      expect(result).toBe(null)
    })

    it('должен вернуть null, если папка содержит только системные файлы', async () => {
      // Создаем .git папку
      fs.mkdirSync(path.join(testDir, '.git'), { recursive: true })
      fs.writeFileSync(path.join(testDir, '.git', 'config'), '[core]')

      const result = projectService.checkProjectStructure()

      expect(result).toBe(null)
    })

    it('должен вернуть FOUND_INVALID_FILES, если в корне есть файлы', async () => {
      fs.writeFileSync(path.join(testDir, 'readme.txt'), 'content')

      const result = projectService.checkProjectStructure()

      expect(result).toBe(CheckProjectStructureErrors.FOUND_INVALID_FILES)
    })

    it('должен вернуть null для валидной структуры проекта', async () => {
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

    it('должен поддерживать вложенные папки с JSON файлами', async () => {
      const enDir = path.join(testDir, 'en')
      const featuresDir = path.join(enDir, 'features')
      fs.mkdirSync(featuresDir, { recursive: true })

      fs.writeFileSync(path.join(enDir, 'common.json'), '{}')
      fs.writeFileSync(path.join(featuresDir, 'auth.json'), '{}')

      const result = projectService.checkProjectStructure()

      expect(result).toBe(null)
    })

    it('должен игнорировать регистр расширения файла', async () => {
      const enDir = path.join(testDir, 'en')
      fs.mkdirSync(enDir, { recursive: true })
      fs.writeFileSync(path.join(enDir, 'common.JSON'), '{}')

      const result = projectService.checkProjectStructure()

      expect(result).toBe(null)
    })
  })

  describe('constructor', () => {
    it('должен правильно инициализировать projectPath', async () => {
      const customPath = '/custom/path/to/project'
      const service = new ProjectService(customPath)

      expect(service).toBeInstanceOf(ProjectService)
    })
  })

  describe('getLocaleFolders', () => {
    it('должен вернуть список папок локализаций', async () => {
      fs.mkdirSync(path.join(testDir, 'en'), { recursive: true })
      fs.mkdirSync(path.join(testDir, 'ru'), { recursive: true })
      fs.mkdirSync(path.join(testDir, '.git'), { recursive: true })

      const result = projectService.getLocaleFolders()

      expect(result).toEqual(['en', 'ru'])
    })
  })

  describe('createLocale', () => {
    it('должен создать новую локаль с копированием структуры ключей', async () => {
      const enDir = path.join(testDir, 'en')
      const ruDir = path.join(testDir, 'ru')
      fs.mkdirSync(enDir, { recursive: true })
      fs.mkdirSync(ruDir, { recursive: true })
      fs.writeFileSync(
        path.join(enDir, 'common.json'),
        JSON.stringify({ greeting: 'Hello', farewell: 'Bye' }, null, 2)
      )
      fs.writeFileSync(
        path.join(ruDir, 'common.json'),
        JSON.stringify({ greeting: 'Привет', farewell: 'Пока' }, null, 2)
      )

      projectService.createLocale('fr')

      const frCommon = JSON.parse(fs.readFileSync(path.join(testDir, 'fr', 'common.json'), 'utf-8'))
      expect(frCommon).toEqual({ greeting: '', farewell: '' })
    })

    it('должен создать вложенную структуру папок', async () => {
      const enDir = path.join(testDir, 'en')
      const authEnDir = path.join(enDir, 'auth')
      fs.mkdirSync(authEnDir, { recursive: true })
      fs.writeFileSync(path.join(enDir, 'common.json'), JSON.stringify({ key: 'value' }, null, 2))
      fs.writeFileSync(
        path.join(authEnDir, 'login.json'),
        JSON.stringify({ title: 'Login' }, null, 2)
      )

      const ruDir = path.join(testDir, 'ru')
      const authRuDir = path.join(ruDir, 'auth')
      fs.mkdirSync(authRuDir, { recursive: true })
      fs.writeFileSync(
        path.join(ruDir, 'common.json'),
        JSON.stringify({ key: 'значение' }, null, 2)
      )
      fs.writeFileSync(
        path.join(authRuDir, 'login.json'),
        JSON.stringify({ title: 'Вход' }, null, 2)
      )

      projectService.createLocale('de')

      expect(fs.existsSync(path.join(testDir, 'de', 'auth'))).toBe(true)
      const deLogin = JSON.parse(
        fs.readFileSync(path.join(testDir, 'de', 'auth', 'login.json'), 'utf-8')
      )
      expect(deLogin).toEqual({ title: '' })
    })

    it('должен пропустить файлы-сироты', async () => {
      const enDir = path.join(testDir, 'en')
      const ruDir = path.join(testDir, 'ru')
      fs.mkdirSync(enDir, { recursive: true })
      fs.mkdirSync(ruDir, { recursive: true })
      fs.writeFileSync(path.join(enDir, 'common.json'), JSON.stringify({ key: 'value' }, null, 2))
      // orphan.json только в en
      fs.writeFileSync(
        path.join(enDir, 'orphan.json'),
        JSON.stringify({ orphanKey: 'orphanValue' }, null, 2)
      )
      fs.writeFileSync(
        path.join(ruDir, 'common.json'),
        JSON.stringify({ key: 'значение' }, null, 2)
      )

      projectService.createLocale('fr')

      expect(fs.existsSync(path.join(testDir, 'fr', 'common.json'))).toBe(true)
      expect(fs.existsSync(path.join(testDir, 'fr', 'orphan.json'))).toBe(false)
    })

    it('должен выбросить ошибку если локаль уже существует', async () => {
      fs.mkdirSync(path.join(testDir, 'en'), { recursive: true })
      fs.writeFileSync(path.join(testDir, 'en', 'common.json'), '{}')

      expect(() => projectService.createLocale('en')).toThrow('Locale "en" already exists')
    })

    it('должен выбросить ошибку если нет локалей для копирования', async () => {
      expect(() => projectService.createLocale('fr')).toThrow(
        'No existing locales to copy structure from'
      )
    })

    it('должен очистить значения с вложенной структурой', async () => {
      const enDir = path.join(testDir, 'en')
      const ruDir = path.join(testDir, 'ru')
      fs.mkdirSync(enDir, { recursive: true })
      fs.mkdirSync(ruDir, { recursive: true })
      fs.writeFileSync(
        path.join(enDir, 'common.json'),
        JSON.stringify({ nested: { a: '1', b: '2' }, flat: 'value' }, null, 2)
      )
      fs.writeFileSync(
        path.join(ruDir, 'common.json'),
        JSON.stringify({ nested: { a: 'один', b: 'два' }, flat: 'значение' }, null, 2)
      )

      projectService.createLocale('de')

      const deCommon = JSON.parse(fs.readFileSync(path.join(testDir, 'de', 'common.json'), 'utf-8'))
      expect(deCommon).toEqual({ nested: { a: '', b: '' }, flat: '' })
    })
  })

  describe('deleteLocale', () => {
    it('должен удалить папку локали', async () => {
      const enDir = path.join(testDir, 'en')
      const ruDir = path.join(testDir, 'ru')
      fs.mkdirSync(enDir, { recursive: true })
      fs.mkdirSync(ruDir, { recursive: true })
      fs.writeFileSync(path.join(enDir, 'common.json'), '{}')
      fs.writeFileSync(path.join(ruDir, 'common.json'), '{}')

      projectService.deleteLocale('ru')

      expect(fs.existsSync(ruDir)).toBe(false)
      expect(fs.existsSync(enDir)).toBe(true)
    })

    it('не должен падать если папки не существует', async () => {
      expect(() => projectService.deleteLocale('nonexistent')).not.toThrow()
    })
  })

  describe('fixOrphanNamespace', () => {
    it('должен скопировать файл в отсутствующую локаль с пустыми значениями', async () => {
      const enDir = path.join(testDir, 'en')
      const ruDir = path.join(testDir, 'ru')
      fs.mkdirSync(enDir, { recursive: true })
      fs.mkdirSync(ruDir, { recursive: true })
      fs.writeFileSync(
        path.join(enDir, 'common.json'),
        JSON.stringify({ key1: 'value1', key2: 'value2' }, null, 2)
      )
      // В ru нет common.json — это orphan

      projectService.fixOrphanNamespace('common')

      const ruCommon = JSON.parse(fs.readFileSync(path.join(ruDir, 'common.json'), 'utf-8'))
      expect(ruCommon).toEqual({ key1: '', key2: '' })
    })

    it('должен создать вложенную структуру папок при фиксе', async () => {
      const enDir = path.join(testDir, 'en')
      const authEnDir = path.join(enDir, 'auth')
      fs.mkdirSync(authEnDir, { recursive: true })
      fs.writeFileSync(
        path.join(authEnDir, 'login.json'),
        JSON.stringify({ title: 'Login' }, null, 2)
      )

      const ruDir = path.join(testDir, 'ru')
      fs.mkdirSync(ruDir, { recursive: true })
      // В ru нет auth/login.json

      projectService.fixOrphanNamespace('auth/login')

      const ruLogin = JSON.parse(fs.readFileSync(path.join(ruDir, 'auth', 'login.json'), 'utf-8'))
      expect(ruLogin).toEqual({ title: '' })
    })

    it('должен выбросить ошибку если файл нигде не существует', async () => {
      fs.mkdirSync(path.join(testDir, 'en'), { recursive: true })

      expect(() => projectService.fixOrphanNamespace('nonexistent')).toThrow(
        'No existing file found for namespace "nonexistent"'
      )
    })
  })

  describe('createNamespace', () => {
    it('должен создать пустой неймспейс во всех локалях', async () => {
      const enDir = path.join(testDir, 'en')
      const ruDir = path.join(testDir, 'ru')
      fs.mkdirSync(enDir, { recursive: true })
      fs.mkdirSync(ruDir, { recursive: true })

      projectService.createNamespace('common')

      expect(JSON.parse(fs.readFileSync(path.join(enDir, 'common.json'), 'utf-8'))).toEqual({})
      expect(JSON.parse(fs.readFileSync(path.join(ruDir, 'common.json'), 'utf-8'))).toEqual({})
    })
  })

  describe('deleteNamespace', () => {
    it('должен удалить неймспейс из всех локалей', async () => {
      const enDir = path.join(testDir, 'en')
      const ruDir = path.join(testDir, 'ru')
      fs.mkdirSync(enDir, { recursive: true })
      fs.mkdirSync(ruDir, { recursive: true })
      fs.writeFileSync(path.join(enDir, 'common.json'), '{}')
      fs.writeFileSync(path.join(ruDir, 'common.json'), '{}')

      projectService.deleteNamespace('common')

      expect(fs.existsSync(path.join(enDir, 'common.json'))).toBe(false)
      expect(fs.existsSync(path.join(ruDir, 'common.json'))).toBe(false)
    })
  })

  describe('createFolder', () => {
    it('должен создать папку во всех локалях', async () => {
      const enDir = path.join(testDir, 'en')
      const ruDir = path.join(testDir, 'ru')
      fs.mkdirSync(enDir, { recursive: true })
      fs.mkdirSync(ruDir, { recursive: true })

      projectService.createFolder('auth')

      expect(fs.existsSync(path.join(enDir, 'auth'))).toBe(true)
      expect(fs.existsSync(path.join(ruDir, 'auth'))).toBe(true)
    })
  })

  describe('deleteFolder', () => {
    it('должен удалить папку из всех локалей', async () => {
      const enDir = path.join(testDir, 'en')
      const ruDir = path.join(testDir, 'ru')
      fs.mkdirSync(path.join(enDir, 'auth'), { recursive: true })
      fs.mkdirSync(path.join(ruDir, 'auth'), { recursive: true })

      projectService.deleteFolder('auth')

      expect(fs.existsSync(path.join(enDir, 'auth'))).toBe(false)
      expect(fs.existsSync(path.join(ruDir, 'auth'))).toBe(false)
    })
  })

  describe('getAnalytics', () => {
    it('возвращает пустой результат для пустого проекта', async () => {
      const result = await projectService.getAnalyticsAsync()
      expect(result.totals.locales).toBe(0)
      expect(result.perLocale).toEqual([])
      expect(result.orphanFiles).toEqual([])
    })

    it('считает уникальные ключи, покрытие и пустые значения', async () => {
      const enDir = path.join(testDir, 'en')
      const ruDir = path.join(testDir, 'ru')
      fs.mkdirSync(enDir, { recursive: true })
      fs.mkdirSync(ruDir, { recursive: true })

      fs.writeFileSync(
        path.join(enDir, 'common.json'),
        JSON.stringify({ hello: 'Hello', bye: 'Bye' })
      )
      fs.writeFileSync(
        path.join(ruDir, 'common.json'),
        JSON.stringify({ hello: 'Привет', bye: '' })
      )

      const result = await projectService.getAnalyticsAsync()

      expect(result.totals.locales).toBe(2)
      expect(result.totals.uniqueKeys).toBe(2)
      expect(result.totals.emptyValues).toBe(1) // bye пустой в ru
      expect(result.totals.orphanFiles).toBe(0)
      expect(result.totals.orphanKeys).toBe(0)

      const en = result.perLocale.find((l) => l.locale === 'en')!
      const ru = result.perLocale.find((l) => l.locale === 'ru')!
      expect(en.coveragePercent).toBe(100)
      expect(ru.coveragePercent).toBe(50) // 1 из 2 переведён
      expect(ru.emptyValues).toBe(1)
    })

    it('находит файлы-сироты и ключи-сироты', async () => {
      const enDir = path.join(testDir, 'en')
      const ruDir = path.join(testDir, 'ru')
      fs.mkdirSync(enDir, { recursive: true })
      fs.mkdirSync(ruDir, { recursive: true })

      fs.writeFileSync(path.join(enDir, 'common.json'), JSON.stringify({ a: '1', b: '2' }))
      fs.writeFileSync(path.join(ruDir, 'common.json'), JSON.stringify({ a: 'А' }))
      fs.writeFileSync(path.join(enDir, 'only-en.json'), JSON.stringify({ x: 'x' }))

      const result = await projectService.getAnalyticsAsync()

      expect(result.totals.orphanFiles).toBe(1)
      expect(result.orphanFiles[0].namespace).toBe('only-en')
      expect(result.orphanFiles[0].missingLocales).toEqual(['ru'])

      expect(result.totals.orphanKeys).toBeGreaterThan(0)
      const orphanB = result.orphanKeys.find((k) => k.key === 'b')
      expect(orphanB).toBeDefined()
      expect(orphanB!.missingLocales).toEqual(['ru'])
    })

    it('находит дубликаты значений внутри локали', async () => {
      const enDir = path.join(testDir, 'en')
      fs.mkdirSync(enDir, { recursive: true })
      fs.writeFileSync(
        path.join(enDir, 'common.json'),
        JSON.stringify({ a: 'Save', b: 'Save', c: 'Cancel' })
      )

      const result = await projectService.getAnalyticsAsync()

      expect(result.totals.duplicateGroups).toBe(1)
      expect(result.duplicates[0].value).toBe('Save')
      expect(result.duplicates[0].occurrences).toHaveLength(2)
    })

    it('находит непереведённые ключи (совпадающие с sourceLocale)', async () => {
      const enDir = path.join(testDir, 'en')
      const ruDir = path.join(testDir, 'ru')
      fs.mkdirSync(enDir, { recursive: true })
      fs.mkdirSync(ruDir, { recursive: true })

      fs.writeFileSync(
        path.join(enDir, 'common.json'),
        JSON.stringify({ name: 'Name', email: 'Email', age: 'Age' })
      )
      fs.writeFileSync(
        path.join(ruDir, 'common.json'),
        JSON.stringify({ name: 'Имя', email: 'Email', age: 'Age' })
      )

      const result = await projectService.getAnalyticsAsync('en')

      expect(result.sourceLocale).toBe('en')
      expect(result.untranslated).toHaveLength(2)
      const emailEntry = result.untranslated.find((u) => u.key === 'email')
      expect(emailEntry).toBeDefined()
      expect(emailEntry!.locales).toEqual(['ru'])
    })

    it('корректно обрабатывает вложенные ключи', async () => {
      const enDir = path.join(testDir, 'en')
      const ruDir = path.join(testDir, 'ru')
      fs.mkdirSync(enDir, { recursive: true })
      fs.mkdirSync(ruDir, { recursive: true })
      fs.writeFileSync(
        path.join(enDir, 'common.json'),
        JSON.stringify({ button: { submit: 'Submit', cancel: 'Cancel' } })
      )
      fs.writeFileSync(
        path.join(ruDir, 'common.json'),
        JSON.stringify({ button: { submit: 'Отправить' } })
      )

      const result = await projectService.getAnalyticsAsync()

      expect(result.totals.uniqueKeys).toBe(2)
      const orphan = result.orphanKeys.find((k) => k.key === 'button.cancel')
      expect(orphan).toBeDefined()
      expect(orphan!.missingLocales).toEqual(['ru'])
    })
  })
})
