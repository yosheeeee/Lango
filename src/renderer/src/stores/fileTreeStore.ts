import { create } from 'zustand'
import { FileTreeGroup, FileTreeItem } from 'src/domain/models/fileTree'

type FileTreeState = {
  tree: FileTreeGroup[] | null
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
  tree: null,
  totalFiles: 0,
  orphanFiles: 0,
  isLoading: false
}

export const useFileTreeStore = create<FileTreeStore>()((set) => ({
  ...initialState,

  fetchTree: async () => {
    set({ isLoading: true })
    try {
      const tree = await window.api.project.getFileTree()
      if (tree && tree.length > 0) {
        const { total, orphans } = countFiles(tree.flatMap((t) => t.nestedItems))
        set({ tree, totalFiles: total, orphanFiles: orphans })
      } else {
        set({ tree: tree ?? null, totalFiles: 0, orphanFiles: 0 })
      }
    } catch (e) {
      console.error('Failed to fetch file tree:', e)
      set({ tree: null, totalFiles: 0, orphanFiles: 0 })
    } finally {
      set({ isLoading: false })
    }
  },

  invalidateTree: async () => {
    set({ isLoading: true })
    try {
      const tree = await window.api.project.getFileTree()
      if (tree && tree.length > 0) {
        const { total, orphans } = countFiles(tree.flatMap((t) => t.nestedItems))
        set({ tree, totalFiles: total, orphanFiles: orphans })
      } else {
        set({ tree: tree ?? null, totalFiles: 0, orphanFiles: 0 })
      }
    } catch (e) {
      console.error('Failed to invalidate file tree:', e)
    } finally {
      set({ isLoading: false })
    }
  }
}))
