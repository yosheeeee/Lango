import { create } from 'zustand'
import { FileTreeGroup, FileTreeItem } from 'src/domain/models/fileTree'

type FileTreeState = {
  root: FileTreeGroup | null
  locales: string[]
  totalFiles: number
  orphanFiles: number
  isLoading: boolean
}

type FileTreeActions = {
  fetchTree: () => Promise<void>
  invalidateTree: () => Promise<void>
}

type FileTreeStore = FileTreeState & FileTreeActions

/**
 * Рекурсивно считает файлы и сироты в дереве.
 */
function countFiles(items: (FileTreeGroup | FileTreeItem)[]): { total: number; orphans: number } {
  let total = 0
  let orphans = 0

  for (const item of items) {
    if ('nestedItems' in item) {
      const sub = countFiles(item.nestedItems)
      total += sub.total
      orphans += sub.orphans
    } else {
      total += 1
      if (item.isOrphan) orphans += 1
    }
  }

  return { total, orphans }
}

const initialState: FileTreeState = {
  root: null,
  locales: [],
  totalFiles: 0,
  orphanFiles: 0,
  isLoading: false
}

export const useFileTreeStore = create<FileTreeStore>()((set) => {
  const doFetch = async (silent: boolean) => {
    if (!silent) set({ isLoading: true })
    try {
      const data = await window.api.project.getFileTree()
      if (data) {
        const { total, orphans } = countFiles(data.root.nestedItems)
        set({ root: data.root, locales: data.locales, totalFiles: total, orphanFiles: orphans })
      } else {
        set({ root: null, locales: [], totalFiles: 0, orphanFiles: 0 })
      }
    } catch (e) {
      console.error('Failed to fetch file tree:', e)
      set({ root: null, locales: [], totalFiles: 0, orphanFiles: 0 })
    } finally {
      set({ isLoading: false })
    }
  }

  return {
    ...initialState,
    fetchTree: () => doFetch(false),
    invalidateTree: () => doFetch(true)
  }
})
