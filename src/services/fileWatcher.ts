import fs from 'fs'
import { BrowserWindow } from 'electron'
import { sessionService } from '../services/sessionService'

const IGNORED_PATTERNS = ['.DS_Store', 'Thumbs.db', 'desktop.ini', '.git', '.idea', '.vscode']

let watcher: fs.FSWatcher | null = null

function shouldIgnore(fileName: string): boolean {
  return IGNORED_PATTERNS.some((pattern) => fileName.toLowerCase().includes(pattern.toLowerCase()))
}

function notifyRenderer(): void {
  const windows = BrowserWindow.getAllWindows()
  for (const win of windows) {
    win.webContents.send('file-tree:changed')
  }
}

/**
 * Запускает наблюдение за папкой текущего проекта.
 * Если уже есть активный watcher — останавливает его.
 */
export function startFileWatcher(): void {
  stopFileWatcher()

  const session = sessionService.getCurrentSession()
  if (!session) return

  const projectPath = session.path
  if (!fs.existsSync(projectPath)) return

  watcher = fs.watch(projectPath, { recursive: true }, (_eventType, filename) => {
    if (!filename || shouldIgnore(filename)) return

    // Проверяем, что изменение касается .json файлов
    if (!filename.toLowerCase().endsWith('.json')) return

    // Debounce: fs.watch может срабатывать несколько раз
    notifyRendererDebounced()
  })
}

/**
 * Останавливает активный watcher.
 */
export function stopFileWatcher(): void {
  if (watcher) {
    watcher.close()
    watcher = null
  }
}

// Debounce для предотвращения множественных срабатываний
let debounceTimer: NodeJS.Timeout | null = null

function notifyRendererDebounced(): void {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    notifyRenderer()
    debounceTimer = null
  }, 300)
}
