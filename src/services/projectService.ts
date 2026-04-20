import fs from 'fs'
import path from 'path'
import { CheckProjectStructureErrors } from '../domain/models/errors'
import { FileTreeData, FileTreeGroup, FileTreeItem } from '../domain/models/fileTree'
import { SearchMatch, SearchResult } from '../domain/models/search'
import {
  DuplicateValueEntry,
  EmptyValueEntry,
  LocaleCoverage,
  OrphanFileEntry,
  OrphanKeyEntry,
  ProjectAnalytics,
  UntranslatedEntry
} from '../domain/models/analytics'

export class ProjectService {
  private projectPath: string

  constructor(projectPath: string) {
    this.projectPath = projectPath
  }

  /**
   * Строит унифицированное дерево файлов: каждый файл приходит 1 раз
   * с указанием локалей и флагом isOrphan если присутствует не везде.
   */
  getFileTree(projectName: string): FileTreeData {
    try {
      const locales = this.getLocaleFolders()
      if (locales.length === 0) return { root: { name: projectName, nestedItems: [] }, locales: [] }

      // Собираем все уникальные относительные пути файлов across all locales
      const allFilePaths = new Map<string, Set<string>>() // relativePath -> Set<locale>
      const allDirPaths = new Map<string, Set<string>>() // dirPath -> Set<locale>

      for (const locale of locales) {
        const localePath = path.join(this.projectPath, locale)
        const files = this.collectJsonFiles(localePath, '')
        for (const filePath of files) {
          if (!allFilePaths.has(filePath)) {
            allFilePaths.set(filePath, new Set())
          }
          allFilePaths.get(filePath)!.add(locale)
        }
        const dirs = this.collectDirectories(localePath, '')
        for (const dirPath of dirs) {
          if (!allDirPaths.has(dirPath)) {
            allDirPaths.set(dirPath, new Set())
          }
          allDirPaths.get(dirPath)!.add(locale)
        }
      }

      const nestedItems = this.buildUnifiedTree(allFilePaths, allDirPaths, locales)
      const root: FileTreeGroup = { name: projectName, nestedItems }

      return { root, locales }
    } catch {
      return { root: { name: projectName, nestedItems: [] }, locales: [] }
    }
  }

  /**
   * Строит единое дерево из плоской карты путей файлов.
   */
  private buildUnifiedTree(
    allFilePaths: Map<string, Set<string>>,
    allDirPaths: Map<string, Set<string>>,
    allLocales: string[]
  ): (FileTreeGroup | FileTreeItem)[] {
    type DirNode = {
      dirs: Map<string, DirNode>
      files: Map<string, Set<string>>
    }

    const root: DirNode = { dirs: new Map(), files: new Map() }

    for (const [relativePath, localesSet] of allFilePaths) {
      const parts = relativePath.split('/')
      let node = root
      for (let i = 0; i < parts.length - 1; i++) {
        const dir = parts[i]
        if (!node.dirs.has(dir)) {
          node.dirs.set(dir, { dirs: new Map(), files: new Map() })
        }
        node = node.dirs.get(dir)!
      }
      node.files.set(parts[parts.length - 1], localesSet)
    }

    // Добавляем пустые папки, которые не содержат файлов
    for (const [dirPath] of allDirPaths) {
      const parts = dirPath.split('/')
      let node = root
      for (const part of parts) {
        if (!node.dirs.has(part)) {
          node.dirs.set(part, { dirs: new Map(), files: new Map() })
        }
        node = node.dirs.get(part)!
      }
    }

    const buildItems = (node: DirNode, relativeDir: string): (FileTreeGroup | FileTreeItem)[] => {
      const items: (FileTreeGroup | FileTreeItem)[] = []

      const sortedDirs = [...node.dirs.entries()].sort(([a], [b]) => a.localeCompare(b))
      for (const [dirName, dirNode] of sortedDirs) {
        const subRelativeDir = relativeDir ? `${relativeDir}/${dirName}` : dirName
        const nestedItems = buildItems(dirNode, subRelativeDir)
        const hasOrphan = nestedItems.some((item) => 'isOrphan' in item && item.isOrphan)
        items.push({
          name: dirName,
          nestedItems,
          isOrphan: hasOrphan || undefined
        })
      }

      const sortedFiles = [...node.files.entries()].sort(([a], [b]) => a.localeCompare(b))
      for (const [filename, localesSet] of sortedFiles) {
        const nameWithoutExt = filename.replace(/\.json$/i, '')
        const link = relativeDir ? `/${relativeDir}/${nameWithoutExt}` : `/${nameWithoutExt}`
        const fileLocales = [...localesSet].sort()
        const isOrphan = localesSet.size < allLocales.length
        items.push({
          name: nameWithoutExt,
          link,
          locales: fileLocales,
          isOrphan: isOrphan || undefined
        })
      }

      return items
    }

    return buildItems(root, '')
  }

  /**
   * Рекурсивно собирает все поддиректории (для отображения пустых папок).
   */
  private collectDirectories(dirPath: string, relativeDir: string): string[] {
    const dirs: string[] = []
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true })
      for (const item of entries.filter((e) => !this.isSystemFile(e.name))) {
        if (item.isDirectory()) {
          const sub = relativeDir ? `${relativeDir}/${item.name}` : item.name
          dirs.push(sub)
          dirs.push(...this.collectDirectories(path.join(dirPath, item.name), sub))
        }
      }
    } catch {
      // ignore
    }
    return dirs
  }

  /**
   * Рекурсивно собирает все .json файлы в директории (для проверки сирот).
   */
  private collectJsonFiles(dirPath: string, relativeDir: string): string[] {
    const files: string[] = []
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true })
      const meaningfulItems = entries.filter((item) => !this.isSystemFile(item.name))

      for (const item of meaningfulItems) {
        if (item.isDirectory()) {
          const subDirPath = path.join(dirPath, item.name)
          const subRelativeDir = relativeDir ? `${relativeDir}/${item.name}` : item.name
          files.push(...this.collectJsonFiles(subDirPath, subRelativeDir))
        } else if (item.isFile() && item.name.toLowerCase().endsWith('.json')) {
          const relativePath = relativeDir ? `${relativeDir}/${item.name}` : item.name
          files.push(relativePath)
        }
      }
    } catch {
      // ignore
    }
    return files
  }

  /**
   * Создаёт пустой JSON-неймспейс во всех папках локализаций.
   * namespacePath — относительный путь без расширения, например "common" или "auth/login"
   */
  createNamespace(namespacePath: string): void {
    const locales = this.getLocaleFolders()
    if (locales.length === 0) throw new Error('No locale folders found')

    for (const locale of locales) {
      const filePath = path.join(this.projectPath, locale, `${namespacePath}.json`)
      fs.mkdirSync(path.dirname(filePath), { recursive: true })
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '{}', 'utf-8')
      }
    }
  }

  /**
   * Добавляет неймспейс в отсутствующие локали, копируя ключи из существующего файла.
   * Отличается от createNamespace тем, что копирует структуру ключей с пустыми значениями.
   */
  fixOrphanNamespace(namespacePath: string): void {
    const locales = this.getLocaleFolders()
    if (locales.length === 0) throw new Error('No locale folders found')

    // Находим первую локаль где файл уже существует
    let sourceLocale: string | null = null
    let sourceJson: Record<string, unknown> = {}
    for (const locale of locales) {
      const filePath = path.join(this.projectPath, locale, `${namespacePath}.json`)
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf-8')
          sourceJson = JSON.parse(content)
          sourceLocale = locale
          break
        } catch {
          // ignore
        }
      }
    }
    if (!sourceLocale) throw new Error(`No existing file found for namespace "${namespacePath}"`)

    // Очищаем значения, сохраняя структуру
    const emptiedJson = this.emptyValues(sourceJson)

    // Создаём файл в локалях где его нет
    for (const locale of locales) {
      const filePath = path.join(this.projectPath, locale, `${namespacePath}.json`)
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true })
        fs.writeFileSync(filePath, JSON.stringify(emptiedJson, null, 2), 'utf-8')
      }
    }
  }

  /**
   * Удаляет .json файл неймспейса из всех папок локализаций.
   * namespacePath — относительный путь без расширения, например "common" или "auth/login"
   */
  deleteNamespace(namespacePath: string): void {
    const locales = this.getLocaleFolders()
    for (const locale of locales) {
      const filePath = path.join(this.projectPath, locale, `${namespacePath}.json`)
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      } catch {
        // ignore missing files
      }
    }
  }

  /**
   * Создаёт папку во всех папках локализаций.
   * folderPath — относительный путь, например "auth" или "auth/sub"
   */
  deleteFolder(folderPath: string): void {
    const locales = this.getLocaleFolders()
    for (const locale of locales) {
      const dirPath = path.join(this.projectPath, locale, folderPath)
      try {
        if (fs.existsSync(dirPath)) {
          fs.rmSync(dirPath, { recursive: true })
        }
      } catch {
        // ignore
      }
    }
  }

  createFolder(folderPath: string): void {
    const locales = this.getLocaleFolders()
    if (locales.length === 0) throw new Error('No locale folders found')

    for (const locale of locales) {
      const dirPath = path.join(this.projectPath, locale, folderPath)
      fs.mkdirSync(dirPath, { recursive: true })
    }
  }

  /**
   * Возвращает список папок первого уровня (локализаций), исключая системные.
   */
  getLocaleFolders(): string[] {
    try {
      const entries = fs.readdirSync(this.projectPath, { withFileTypes: true })
      return entries
        .filter((e) => e.isDirectory() && !this.isSystemFile(e.name))
        .map((e) => e.name)
        .sort()
    } catch {
      return []
    }
  }

  /**
   * Создаёт новую локаль с полным переносом структуры неймспейсов
   * из существующих локалей (за исключением файлов-сирот).
   * Ключи копируются 1-в-1, но со значениями-пустыми строками.
   */
  createLocale(localeName: string): void {
    const existingLocales = this.getLocaleFolders()
    if (existingLocales.includes(localeName)) {
      throw new Error(`Locale "${localeName}" already exists`)
    }
    if (existingLocales.length === 0) {
      throw new Error('No existing locales to copy structure from')
    }

    // Получаем дерево ДО создания папки, чтобы не считать все файлы сиротами
    const tree = this.getFileTree('temp')

    // Создаём папку новой локали
    const newLocalePath = path.join(this.projectPath, localeName)
    fs.mkdirSync(newLocalePath, { recursive: true })

    // Рекурсивно копируем структуру только для НЕ-сирот
    const copyStructure = (items: typeof tree.root.nestedItems, relativeDir: string) => {
      for (const item of items) {
        if ('nestedItems' in item) {
          // Это папка — пропускаем сироты
          if (item.isOrphan) continue
          const dirPath = relativeDir ? `${relativeDir}/${item.name}` : item.name
          const fullPath = path.join(newLocalePath, dirPath)
          fs.mkdirSync(fullPath, { recursive: true })
          copyStructure(item.nestedItems, dirPath)
        } else {
          // Это файл — пропускаем сироты
          if (item.isOrphan) continue
          const fileName = `${item.name}.json`
          const filePath = relativeDir ? `${relativeDir}/${fileName}` : fileName
          const fullPath = path.join(newLocalePath, filePath)

          // Берём файл из первой локали где он есть
          const sourceLocale = item.locales[0]
          if (!sourceLocale) continue
          const sourcePath = path.join(this.projectPath, sourceLocale, filePath)

          try {
            const content = fs.readFileSync(sourcePath, 'utf-8')
            const json = JSON.parse(content)
            // Рекурсивно очищаем значения, сохраняя структуру ключей
            const emptiedJson = this.emptyValues(json)
            fs.writeFileSync(fullPath, JSON.stringify(emptiedJson, null, 2), 'utf-8')
          } catch {
            // Если файл не удалось прочитать — создаём пустой
            fs.writeFileSync(fullPath, '{}', 'utf-8')
          }
        }
      }
    }

    copyStructure(tree.root.nestedItems, '')
  }

  /**
   * Рекурсивно заменяет все значения в объекте на пустые строки,
   * сохраняя структуру ключей.
   */
  private emptyValues(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result[key] = this.emptyValues(value as Record<string, unknown>)
      } else {
        result[key] = ''
      }
    }
    return result
  }

  getKeyTranslations(namespace: string, key: string): Record<string, string> {
    const locales = this.getLocaleFolders()
    const result: Record<string, string> = {}
    const keyParts = key.split('.')

    for (const locale of locales) {
      const filePath = path.join(this.projectPath, locale, `${namespace}.json`)
      try {
        const content = fs.readFileSync(filePath, 'utf-8')
        const json = JSON.parse(content)
        const val = this.getNestedValue(json, keyParts)
        result[locale] = typeof val === 'string' ? val : ''
      } catch {
        result[locale] = ''
      }
    }
    return result
  }

  updateLocalizationValue(namespace: string, key: string, locale: string, value: string): void {
    const filePath = path.join(this.projectPath, locale, `${namespace}.json`)
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const json = JSON.parse(content)
      const keyParts = key.split('.')
      const parent = keyParts.length > 1 ? this.getNestedValue(json, keyParts.slice(0, -1)) : json
      if (!parent || typeof parent !== 'object' || Array.isArray(parent)) return
      ;(parent as Record<string, unknown>)[keyParts[keyParts.length - 1]] = value
      fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf-8')
    } catch {
      // ignore
    }
  }

  getNamespaceContent(namespace: string, locale: string): Record<string, unknown> {
    const filePath = path.join(this.projectPath, locale, `${namespace}.json`)
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(content)
    } catch {
      return {}
    }
  }

  /**
   * Удаляет ключ (и все дочерние ключи если это объект) из JSON файла неймспейса во всех локалях.
   * @param namespace — путь без расширения, например "common" или "auth/login"
   * @param key — путь к ключу через точку, например "button.submit" или "header"
   */
  deleteLocalizationKey(namespace: string, key: string): void {
    const locales = this.getLocaleFolders()
    if (locales.length === 0) throw new Error('No locale folders found')

    const keyParts = key.split('.')

    for (const locale of locales) {
      const filePath = path.join(this.projectPath, locale, `${namespace}.json`)
      try {
        if (!fs.existsSync(filePath)) continue

        const content = fs.readFileSync(filePath, 'utf-8')
        const json = JSON.parse(content)

        // Удаляем ключ из объекта
        const deleted = this.deleteNestedKey(json, keyParts)

        if (deleted) {
          fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf-8')
        }
      } catch {
        // ignore invalid JSON or missing files
      }
    }
  }

  /**
   * Рекурсивно удаляет ключ из объекта по массиву частей пути.
   * Возвращает true если ключ был найден и удалён.
   */
  private deleteNestedKey(obj: Record<string, unknown>, parts: string[]): boolean {
    if (parts.length === 0) return false

    const [firstPart, ...restParts] = parts

    // Если это последний ключ в пути — удаляем его
    if (restParts.length === 0) {
      if (firstPart in obj) {
        delete obj[firstPart]
        return true
      }
      return false
    }

    // Если ключ не существует или не является объектом — не найдено
    if (
      !(firstPart in obj) ||
      typeof obj[firstPart] !== 'object' ||
      obj[firstPart] === null ||
      Array.isArray(obj[firstPart])
    ) {
      return false
    }

    // Рекурсивно удаляем из вложенного объекта
    return this.deleteNestedKey(obj[firstPart] as Record<string, unknown>, restParts)
  }

  /**
   * Переименовывает ключ в JSON файле неймспейса во всех локалях.
   * @param namespace — путь без расширения, например "common" или "auth/login"
   * @param oldKey — старый путь к ключу через точку, например "button.submit"
   * @param newKey — новое имя ключа (последняя часть пути), например "submitBtn"
   */
  renameLocalizationKey(namespace: string, oldKey: string, newKey: string): void {
    const locales = this.getLocaleFolders()
    if (locales.length === 0) throw new Error('No locale folders found')

    const oldKeyParts = oldKey.split('.')
    const parentParts = oldKeyParts.slice(0, -1)
    const oldKeyName = oldKeyParts[oldKeyParts.length - 1]

    for (const locale of locales) {
      const filePath = path.join(this.projectPath, locale, `${namespace}.json`)
      try {
        if (!fs.existsSync(filePath)) continue

        const content = fs.readFileSync(filePath, 'utf-8')
        const json = JSON.parse(content)

        // Находим родительский объект и значение старого ключа
        const parent = this.getNestedValue(json, parentParts)
        if (!parent || typeof parent !== 'object' || !(oldKeyName in parent)) continue

        const value = parent[oldKeyName]

        // Удаляем старый ключ
        delete parent[oldKeyName]

        // Добавляем новый ключ с тем же значением
        parent[newKey] = value

        fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf-8')
      } catch {
        // ignore invalid JSON or missing files
      }
    }
  }

  /**
   * Получает вложенное значение из объекта по массиву частей пути.
   */
  private getNestedValue(obj: Record<string, unknown>, parts: string[]): unknown {
    let current: unknown = obj
    for (const part of parts) {
      if (current === null || typeof current !== 'object' || !(part in current)) {
        return undefined
      }
      current = (current as Record<string, unknown>)[part]
    }
    return current
  }

  /**
   * Добавляет новый ключ в JSON файл неймспейса во всех локалях.
   * @param namespace — путь без расширения, например "common" или "auth/login"
   * @param key — имя нового ключа
   * @param parentKey (optional) — путь к родительскому ключу через точку, например "button.variants". Если не указан — ключ добавляется в корень
   */
  addLocalizationKey(namespace: string, key: string, parentKey?: string, isParent = false): void {
    const locales = this.getLocaleFolders()
    if (locales.length === 0) throw new Error('No locale folders found')

    const parentParts = parentKey ? parentKey.split('.') : []

    for (const locale of locales) {
      const filePath = path.join(this.projectPath, locale, `${namespace}.json`)
      try {
        if (!fs.existsSync(filePath)) continue

        const content = fs.readFileSync(filePath, 'utf-8')
        const json = JSON.parse(content)

        // Находим родительский объект (или корень, если parentKey не указан)
        const parent = parentParts.length > 0 ? this.getNestedValue(json, parentParts) : json

        // Проверяем что родитель существует и является объектом
        if (!parent || typeof parent !== 'object' || Array.isArray(parent)) continue

        parent[key] = isParent ? {} : ''

        fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf-8')
      } catch {
        // ignore invalid JSON or missing files
      }
    }
  }

  getAllNamespacesContent(locale: string): Record<string, Record<string, unknown>> {
    const locales = this.getLocaleFolders()
    if (!locales.includes(locale)) return {}

    const localePath = path.join(this.projectPath, locale)
    const result: Record<string, Record<string, unknown>> = {}

    const collect = (dirPath: string, relativeDir: string) => {
      try {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true })
        for (const entry of entries) {
          if (this.isSystemFile(entry.name)) continue
          if (entry.isDirectory()) {
            const sub = relativeDir ? `${relativeDir}/${entry.name}` : entry.name
            collect(path.join(dirPath, entry.name), sub)
          } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.json')) {
            const nameWithoutExt = entry.name.replace(/\.json$/i, '')
            const namespace = relativeDir ? `${relativeDir}/${nameWithoutExt}` : nameWithoutExt
            try {
              const content = fs.readFileSync(path.join(dirPath, entry.name), 'utf-8')
              result[namespace] = JSON.parse(content)
            } catch {
              result[namespace] = {}
            }
          }
        }
      } catch {
        // ignore
      }
    }

    collect(localePath, '')
    return result
  }

  getNamespaceOrphanKeys(namespace: string): string[] {
    const locales = this.getLocaleFolders()
    if (locales.length === 0) return []

    const keyLocales = new Map<string, Set<string>>()

    for (const locale of locales) {
      const filePath = path.join(this.projectPath, locale, `${namespace}.json`)
      try {
        const content = fs.readFileSync(filePath, 'utf-8')
        const json = JSON.parse(content)
        const leafKeys = this.flattenLeafKeys(json, '')
        for (const key of leafKeys) {
          if (!keyLocales.has(key)) keyLocales.set(key, new Set())
          keyLocales.get(key)!.add(locale)
        }
      } catch {
        // ignore
      }
    }

    return [...keyLocales.entries()]
      .filter(([, set]) => set.size < locales.length)
      .map(([key]) => key)
  }

  fixOrphanKey(namespace: string, key: string): void {
    const locales = this.getLocaleFolders()
    const keyParts = key.split('.')

    for (const locale of locales) {
      const filePath = path.join(this.projectPath, locale, `${namespace}.json`)
      try {
        if (!fs.existsSync(filePath)) continue

        const content = fs.readFileSync(filePath, 'utf-8')
        const json = JSON.parse(content)

        const existingValue = this.getNestedValue(json, keyParts)
        if (existingValue === undefined) {
          const parent =
            keyParts.length > 1 ? this.getNestedValue(json, keyParts.slice(0, -1)) : json
          if (parent && typeof parent === 'object' && !Array.isArray(parent)) {
            ;(parent as Record<string, unknown>)[keyParts[keyParts.length - 1]] = ''
            fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf-8')
          }
        }
      } catch {
        // ignore
      }
    }
  }

  /**
   * Агрегированная аналитика проекта: один проход по всем локалям/неймспейсам.
   * @param sourceLocale — если задан, заполняется секция `untranslated` (ключи,
   *   значения которых в других локалях идентичны sourceLocale).
   */
  getAnalytics(sourceLocale?: string | null): ProjectAnalytics {
    const locales = this.getLocaleFolders()
    const emptyResult: ProjectAnalytics = {
      totals: {
        locales: 0,
        namespaces: 0,
        uniqueKeys: 0,
        totalKeyInstances: 0,
        orphanFiles: 0,
        orphanKeys: 0,
        emptyValues: 0,
        duplicateGroups: 0,
        untranslatedKeys: 0
      },
      perLocale: [],
      orphanFiles: [],
      orphanKeys: [],
      emptyValues: [],
      duplicates: [],
      untranslated: [],
      sourceLocale: null
    }
    if (locales.length === 0) return emptyResult

    const effectiveSourceLocale =
      sourceLocale && locales.includes(sourceLocale) ? sourceLocale : null

    // 1) Читаем всё содержимое: locale -> namespace -> json
    const perLocaleContent: Record<string, Record<string, Record<string, unknown>>> = {}
    const allNamespaces = new Set<string>()
    for (const locale of locales) {
      const content = this.getAllNamespacesContent(locale)
      perLocaleContent[locale] = content
      for (const ns of Object.keys(content)) allNamespaces.add(ns)
    }

    const namespaces = [...allNamespaces].sort()

    const orphanFiles: OrphanFileEntry[] = []
    const orphanKeys: OrphanKeyEntry[] = []
    const emptyValues: EmptyValueEntry[] = []
    const untranslated: UntranslatedEntry[] = []

    // locale -> Set<"namespace.key"> (присутствует)
    const localePresentKeys: Record<string, Set<string>> = {}
    // locale -> count пустых значений
    const localeEmptyCount: Record<string, number> = {}
    for (const l of locales) {
      localePresentKeys[l] = new Set()
      localeEmptyCount[l] = 0
    }

    // 2) Дубликаты: locale -> Map<value, [{ns, key}]>
    const duplicateMaps: Record<string, Map<string, { namespace: string; key: string }[]>> = {}
    for (const l of locales) duplicateMaps[l] = new Map()

    let totalKeyInstances = 0
    const uniqueKeySet = new Set<string>()

    for (const namespace of namespaces) {
      // какие локали содержат этот файл
      const presentLocales = locales.filter((l) => namespace in perLocaleContent[l])
      const missingFileLocales = locales.filter((l) => !(namespace in perLocaleContent[l]))
      if (missingFileLocales.length > 0) {
        orphanFiles.push({
          namespace,
          presentLocales,
          missingLocales: missingFileLocales
        })
      }

      // key -> Map<locale, value>
      const keyMap = new Map<string, Map<string, string>>()

      for (const locale of presentLocales) {
        const json = perLocaleContent[locale][namespace] ?? {}
        const leafKeys = this.flattenLeafKeys(json, '')
        for (const key of leafKeys) {
          const rawValue = this.getNestedValue(json, key.split('.'))
          const value = typeof rawValue === 'string' ? rawValue : ''
          if (!keyMap.has(key)) keyMap.set(key, new Map())
          keyMap.get(key)!.set(locale, value)

          const combined = `${namespace}::${key}`
          uniqueKeySet.add(combined)
          totalKeyInstances += 1
          localePresentKeys[locale].add(combined)
          if (value === '') localeEmptyCount[locale] += 1

          // Для дубликатов — игнорируем пустые строки
          if (value !== '') {
            const bucket = duplicateMaps[locale].get(value)
            if (bucket) bucket.push({ namespace, key })
            else duplicateMaps[locale].set(value, [{ namespace, key }])
          }
        }
      }

      // Проходим по собранным ключам неймспейса
      for (const [key, localeValues] of keyMap) {
        const keyPresentLocales = [...localeValues.keys()].sort()
        const keyMissingLocales = locales.filter((l) => !localeValues.has(l))
        if (keyMissingLocales.length > 0) {
          orphanKeys.push({
            namespace,
            key,
            presentLocales: keyPresentLocales,
            missingLocales: keyMissingLocales
          })
        }

        // Пустые значения
        const emptyLocales: string[] = []
        for (const [loc, v] of localeValues) if (v === '') emptyLocales.push(loc)
        if (emptyLocales.length > 0) {
          emptyValues.push({ namespace, key, emptyLocales: emptyLocales.sort() })
        }

        // Непереведённые
        if (effectiveSourceLocale && localeValues.has(effectiveSourceLocale)) {
          const srcValue = localeValues.get(effectiveSourceLocale)!
          if (srcValue !== '') {
            const matchingLocales: string[] = []
            for (const [loc, v] of localeValues) {
              if (loc === effectiveSourceLocale) continue
              if (v === srcValue) matchingLocales.push(loc)
            }
            if (matchingLocales.length > 0) {
              untranslated.push({
                namespace,
                key,
                value: srcValue,
                locales: matchingLocales.sort()
              })
            }
          }
        }
      }
    }

    // 3) Покрытие по локалям
    const uniqueKeysCount = uniqueKeySet.size
    const perLocale: LocaleCoverage[] = locales.map((locale) => {
      const presentKeys = localePresentKeys[locale].size
      const emptyValuesCount = localeEmptyCount[locale]
      const translated = presentKeys - emptyValuesCount
      const coveragePercent = uniqueKeysCount === 0 ? 100 : (translated / uniqueKeysCount) * 100
      return {
        locale,
        totalKeys: uniqueKeysCount,
        presentKeys,
        missingKeys: uniqueKeysCount - presentKeys,
        emptyValues: emptyValuesCount,
        coveragePercent: Math.round(coveragePercent * 10) / 10
      }
    })

    // 4) Дубликаты: оставляем группы > 1
    const duplicates: DuplicateValueEntry[] = []
    for (const locale of locales) {
      for (const [value, occurrences] of duplicateMaps[locale]) {
        if (occurrences.length > 1) {
          duplicates.push({ locale, value, occurrences })
        }
      }
    }
    duplicates.sort((a, b) => b.occurrences.length - a.occurrences.length)

    // 5) Сортируем стабильно
    orphanFiles.sort((a, b) => a.namespace.localeCompare(b.namespace))
    orphanKeys.sort((a, b) => a.namespace.localeCompare(b.namespace) || a.key.localeCompare(b.key))
    emptyValues.sort((a, b) => a.namespace.localeCompare(b.namespace) || a.key.localeCompare(b.key))
    untranslated.sort(
      (a, b) => a.namespace.localeCompare(b.namespace) || a.key.localeCompare(b.key)
    )

    return {
      totals: {
        locales: locales.length,
        namespaces: namespaces.length,
        uniqueKeys: uniqueKeysCount,
        totalKeyInstances,
        orphanFiles: orphanFiles.length,
        orphanKeys: orphanKeys.length,
        emptyValues: emptyValues.length,
        duplicateGroups: duplicates.length,
        untranslatedKeys: untranslated.length
      },
      perLocale,
      orphanFiles,
      orphanKeys,
      emptyValues,
      duplicates,
      untranslated,
      sourceLocale: effectiveSourceLocale
    }
  }

  private flattenLeafKeys(obj: Record<string, unknown>, prefix: string): string[] {
    const keys: string[] = []
    for (const [k, v] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${k}` : k
      if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
        keys.push(...this.flattenLeafKeys(v as Record<string, unknown>, fullKey))
      } else {
        keys.push(fullKey)
      }
    }
    return keys
  }

  /**
   * Удаляет папку локали и все её содержимое.
   */
  deleteLocale(localeName: string): void {
    const localePath = path.join(this.projectPath, localeName)
    if (fs.existsSync(localePath)) {
      fs.rmSync(localePath, { recursive: true })
    }
  }

  checkProjectStructure(): string | null {
    try {
      // Проверяем, существует ли папка
      if (!fs.existsSync(this.projectPath)) {
        return CheckProjectStructureErrors.FOLDER_NOT_FOUND
      }

      // Получаем содержимое корня
      const rootItems = fs.readdirSync(this.projectPath, { withFileTypes: true })

      // Фильтруем системный мусор, чтобы он не влиял на проверку
      const meaningfulItems = rootItems.filter((item) => !this.isSystemFile(item.name))

      // Если папка пустая - считаем, что это не валидный проект (или верните true, если пустой проект допустим)
      if (meaningfulItems.length === 0) {
        return null
      }

      // ПРОВЕРКА 1: Корневой уровень (должны быть только папки языков)
      for (const item of meaningfulItems) {
        if (!item.isDirectory()) {
          return CheckProjectStructureErrors.FOUND_INVALID_FILES
        }

        // ПРОВЕРКА 2: Содержимое папки языка
        const languagePath = path.join(this.projectPath, item.name)
        const chekDirResult = this.isValidContentDirectory(languagePath)
        if (!this.isValidContentDirectory(languagePath)) {
          return chekDirResult
        }
      }

      return null
    } catch {
      return CheckProjectStructureErrors.ERROR_CHECKING
    }
  }

  /**
   * Рекурсивная проверка содержимого папки.
   * Разрешено: .json файлы и вложенные папки.
   */
  private isValidContentDirectory(dirPath: string): null | string {
    const items = fs.readdirSync(dirPath, { withFileTypes: true })
    const meaningfulItems = items.filter((item) => !this.isSystemFile(item.name))

    for (const item of meaningfulItems) {
      if (item.isDirectory()) {
        // Если это папка - рекурсивно проверяем её внутренности
        const subDirPath = path.join(dirPath, item.name)
        if (!this.isValidContentDirectory(subDirPath)) {
          return null
        }
      } else if (item.isFile()) {
        // Если это файл - он обязан быть .json
        if (!item.name.toLowerCase().endsWith('.json')) {
          return CheckProjectStructureErrors.FOUND_INVALID_FILES
        }
      } else {
        // Сокеты, симлинки и прочее - запрещено
        return CheckProjectStructureErrors.FOUND_INVALID_FILES
      }
    }

    return null
  }

  /**
   * Вспомогательный метод для игнорирования системных файлов ОС
   */
  private isSystemFile(filename: string): boolean {
    const ignoredFiles = [
      '.ds_store', // macOS
      'thumbs.db', // Windows
      'desktop.ini', // Windows
      '.git', // Git
      '.idea', // WebStorm/IntelliJ
      '.vscode' // VS Code
    ]
    return ignoredFiles.includes(filename.toLowerCase())
  }

  async search(query: string, limit: number = 50, offset: number = 0): Promise<SearchResult> {
    if (!query || !query.trim()) return { items: [], total: 0, hasMore: false }

    const q = query.toLowerCase().trim()
    const results: SearchMatch[] = []
    const locales = this.getLocaleFolders()

    // 1. Search in locale names
    for (const locale of locales) {
      if (locale.toLowerCase().includes(q)) {
        const idx = locale.toLowerCase().indexOf(q)
        results.push({
          type: 'locale',
          path: locale,
          displayName: locale,
          matchedText: locale,
          highlight: { start: idx, end: idx + q.length },
          relevance: this.calcRelevance(locale, q, 'locale')
        })
      }
    }

    // 2. Collect all namespace files and search
    const namespaceFiles: {
      namespace: string
      locale: string
      content: Record<string, unknown>
    }[] = []

    for (const locale of locales) {
      const localePath = path.join(this.projectPath, locale)
      await this.collectNamespaceFiles(localePath, '', locale, namespaceFiles)
    }

    const seenNamespaces = new Set<string>()

    for (const { namespace, content } of namespaceFiles) {
      // Search in namespace name
      if (!seenNamespaces.has(namespace) && namespace.toLowerCase().includes(q)) {
        const idx = namespace.toLowerCase().indexOf(q)
        seenNamespaces.add(namespace)
        results.push({
          type: 'namespace',
          path: namespace,
          displayName: namespace,
          matchedText: namespace,
          highlight: { start: idx, end: idx + q.length },
          relevance: this.calcRelevance(namespace, q, 'namespace')
        })
      }

      // Search in keys and values
      this.searchInObject(content, namespace, q, results)

      // Early exit
      if (results.length >= limit * 2) break
    }

    // Sort by relevance desc, then displayName asc
    results.sort((a, b) => {
      if (b.relevance !== a.relevance) return b.relevance - a.relevance
      return a.displayName.localeCompare(b.displayName)
    })

    const total = results.length
    const items = results.slice(offset, offset + limit)

    return {
      items,
      total,
      hasMore: offset + limit < total
    }
  }

  private async collectNamespaceFiles(
    dirPath: string,
    relativeDir: string,
    locale: string,
    results: { namespace: string; locale: string; content: Record<string, unknown> }[]
  ): Promise<void> {
    try {
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true })
      for (const entry of entries) {
        if (this.isSystemFile(entry.name)) continue

        const fullPath = path.join(dirPath, entry.name)
        const relPath = relativeDir ? `${relativeDir}/${entry.name}` : entry.name

        if (entry.isDirectory()) {
          await this.collectNamespaceFiles(fullPath, relPath, locale, results)
        } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.json')) {
          const namespace = relPath.replace(/\.json$/i, '')
          try {
            const content = await fs.promises.readFile(fullPath, 'utf-8')
            const json = JSON.parse(content)
            results.push({ namespace, locale, content: json as Record<string, unknown> })
          } catch {
            results.push({ namespace, locale, content: {} })
          }
        }
      }
    } catch {
      // Ignore
    }
  }

  private calcRelevance(text: string, query: string, type?: string): number {
    const lower = text.toLowerCase()
    const q = query.toLowerCase()

    let score = 50

    if (lower === q) score = 100
    else if (lower.startsWith(q)) score = 80

    if (type === 'namespace' || type === 'key') score += 20

    return score
  }

  private searchInObject(
    obj: Record<string, unknown>,
    namespace: string,
    query: string,
    results: SearchMatch[]
  ): void {
    const search = (obj: Record<string, unknown>, parentKey: string) => {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = parentKey ? `${parentKey}.${key}` : key
        const lowerKey = key.toLowerCase()
        const q = query.toLowerCase()

        // Search in key
        if (lowerKey.includes(q)) {
          const idx = lowerKey.indexOf(q)
          results.push({
            type: 'key',
            path: `${namespace}.${fullKey}`,
            displayName: fullKey,
            matchedText: key,
            highlight: { start: idx, end: idx + query.length },
            relevance: this.calcRelevance(key, query, 'key')
          })
        }

        // Search in value
        if (typeof value === 'string' && value.toLowerCase().includes(q)) {
          const idx = value.toLowerCase().indexOf(q)
          const displayValue = value.length > 50 ? value.slice(0, 50) + '...' : value
          results.push({
            type: 'value',
            path: `${namespace}.${fullKey}`,
            displayName: `${fullKey}: "${displayValue}"`,
            matchedText: value,
            highlight: { start: idx, end: idx + query.length },
            relevance: this.calcRelevance(value, query, 'value')
          })
        }

        // Recurse for nested objects
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          search(value as Record<string, unknown>, fullKey)
        }
      }
    }
    search(obj, '')
  }
}
