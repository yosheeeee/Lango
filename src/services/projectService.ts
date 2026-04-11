import fs from 'fs'
import path from 'path'
import { CheckProjectStructureErrors } from '../domain/models/errors'
import { FileTreeGroup, FileTreeItem } from '../domain/models/fileTree'

export class ProjectService {
  private projectPath: string

  constructor(projectPath: string) {
    this.projectPath = projectPath
  }

  /**
   * Строит дерево файлов проекта с перекрёстной проверкой сирот.
   * Папки первого уровня считаются локализациями.
   * Файл помечается как isOrphan, если он присутствует НЕ во всех локализациях.
   */
  getFileTree(): FileTreeGroup[] {
    try {
      const locales = this.getLocaleFolders()
      if (locales.length === 0) return []

      // Собираем все уникальные относительные пути файлов across all locales
      const allFilePaths = new Map<string, Set<string>>() // relativePath -> Set<locale>

      for (const locale of locales) {
        const localePath = path.join(this.projectPath, locale)
        const files = this.collectJsonFiles(localePath, '')
        for (const filePath of files) {
          if (!allFilePaths.has(filePath)) {
            allFilePaths.set(filePath, new Set())
          }
          allFilePaths.get(filePath)!.add(locale)
        }
      }

      // Определяем сироты ли: файл есть не во всех локализациях
      const isOrphan = (relativePath: string): boolean => {
        const localesWithFile = allFilePaths.get(relativePath)
        return localesWithFile ? localesWithFile.size !== locales.length : false
      }

      // Строим дерево
      const tree: FileTreeGroup[] = locales.map((locale) => {
        const localePath = path.join(this.projectPath, locale)
        const nestedItems = this.buildTreeItems(localePath, '', isOrphan)
        return { name: locale, nestedItems }
      })

      return tree
    } catch {
      return []
    }
  }

  /**
   * Рекурсивно собирает .json файлы и строит дерево элементов.
   */
  private buildTreeItems(
    dirPath: string,
    relativeDir: string,
    isOrphanCheck: (relativePath: string) => boolean
  ): (FileTreeGroup | FileTreeItem)[] {
    const items: (FileTreeGroup | FileTreeItem)[] = []

    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true })
      const meaningfulItems = entries.filter((item) => !this.isSystemFile(item.name))

      // Сначала папки, потом файлы (для удобства отображения)
      const dirs = meaningfulItems
        .filter((i) => i.isDirectory())
        .sort((a, b) => a.name.localeCompare(b.name))
      const files = meaningfulItems
        .filter((i) => i.isFile() && i.name.toLowerCase().endsWith('.json'))
        .sort((a, b) => a.name.localeCompare(b.name))

      for (const dir of dirs) {
        const subDirPath = path.join(dirPath, dir.name)
        const subRelativeDir = relativeDir ? `${relativeDir}/${dir.name}` : dir.name
        const nestedItems = this.buildTreeItems(subDirPath, subRelativeDir, isOrphanCheck)

        // Папка — сирота, если хотя бы один её элемент — сирота
        const hasOrphan = nestedItems.some((item) => 'isOrphan' in item && item.isOrphan)

        items.push({
          name: dir.name,
          nestedItems,
          isOrphan: hasOrphan || undefined
        })
      }

      for (const file of files) {
        const relativePath = relativeDir ? `${relativeDir}/${file.name}` : file.name
        const nameWithoutExt = file.name.replace(/\.json$/i, '')
        items.push({
          name: nameWithoutExt,
          link: `/${relativeDir}/${nameWithoutExt}`.replace('//', '/'),
          isOrphan: isOrphanCheck(relativePath) || undefined
        })
      }
    } catch {
      // ignore
    }

    return items
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
