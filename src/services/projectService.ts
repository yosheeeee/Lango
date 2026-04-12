import fs from 'fs'
import path from 'path'
import { CheckProjectStructureErrors } from '../domain/models/errors'
import { FileTreeData, FileTreeGroup, FileTreeItem } from '../domain/models/fileTree'

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

    const buildItems = (
      node: DirNode,
      relativeDir: string
    ): (FileTreeGroup | FileTreeItem)[] => {
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
    const copyStructure = (
      items: (typeof tree.root.nestedItems),
      relativeDir: string
    ) => {
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
          } catch (e) {
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
}
