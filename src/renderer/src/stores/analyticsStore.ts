import { create } from 'zustand'
import { ProjectAnalytics } from 'src/domain/models/analytics'

type AnalyticsState = {
  data: ProjectAnalytics | null
  isLoading: boolean
  sourceLocale: string | null
  error: string | null
}

type AnalyticsActions = {
  setSourceLocale: (locale: string | null) => void
  fetchAnalytics: () => Promise<void>
  invalidate: () => void
}

type AnalyticsStore = AnalyticsState & AnalyticsActions

const initialState: AnalyticsState = {
  data: null,
  isLoading: false,
  sourceLocale: null,
  error: null
}

export const useAnalyticsStore = create<AnalyticsStore>()((set, get) => ({
  ...initialState,

  setSourceLocale: (locale) => {
    set({ sourceLocale: locale })
    void get().fetchAnalytics()
  },

  fetchAnalytics: async () => {
    set({ isLoading: true, error: null })
    try {
      const { sourceLocale } = get()
      const data = await window.api.project.getAnalytics(sourceLocale)
      set({ data: data ?? null, isLoading: false })
    } catch (e) {
      console.error('Failed to fetch analytics:', e)
      set({ error: (e as Error)?.message ?? 'Failed to fetch analytics', isLoading: false })
    }
  },

  invalidate: () => {
    void get().fetchAnalytics()
  }
}))

// Debounce для file-tree:changed
let invalidateTimer: ReturnType<typeof setTimeout> | null = null

/**
 * Подключает подписку на IPC file-tree:changed.
 * Вызывается один раз на уровне приложения (например, в провайдере).
 */
export function initializeAnalyticsInvalidation(): () => void {
  const ipc = window.electron?.ipcRenderer
  if (!ipc) return () => {}

  const handler = (): void => {
    if (invalidateTimer) clearTimeout(invalidateTimer)
    invalidateTimer = setTimeout(() => {
      // Только если в сторе уже есть данные (кто-то их запрашивал)
      if (useAnalyticsStore.getState().data) {
        useAnalyticsStore.getState().invalidate()
      }
      invalidateTimer = null
    }, 500)
  }

  ipc.on('file-tree:changed', handler)
  return () => {
    ipc.removeListener('file-tree:changed', handler)
    if (invalidateTimer) clearTimeout(invalidateTimer)
  }
}
