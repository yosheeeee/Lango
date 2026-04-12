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

      const nestedItems = this.buildUnifiedTree(allFilePaths, locales)
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
