import { create } from 'zustand'

type LocalizationState = {
  locales: string[]
  isLoading: boolean
  currentLocale: string | null
}

type LocalizationActions = {
  fetchLocales: () => Promise<void>
  addLocale: (localeName: string) => Promise<void>
  deleteLocale: (localeName: string) => Promise<void>
  setCurrentLocale: (localeName: string) => void
}

type LocalizationStore = LocalizationState & LocalizationActions

const initialState: LocalizationState = {
  locales: [],
  currentLocale: null,
  isLoading: false
}

export const useLocalizationStore = create<LocalizationStore>()((set) => ({
  ...initialState,

  fetchLocales: async () => {
    set({ isLoading: true })
    try {
      const locales = await window.api.project.getLocaleFolders()
      set((s) => ({
        locales: locales ?? [],
        currentLocale: s.currentLocale && locales?.includes(s.currentLocale) ? s.currentLocale : (locales[0] ?? null)
      }))
    } catch (e) {
      console.error('Failed to fetch locales:', e)
      set({ locales: [] })
    } finally {
      set({ isLoading: false })
    }
  },

  addLocale: async (localeName: string) => {
    await window.api.project.createLocale(localeName)
    set((state) => ({ locales: [...state.locales, localeName].sort() }))
  },

  deleteLocale: async (localeName: string) => {
    await window.api.project.deleteLocale(localeName)
    set((state) => {
      const filteredLocales = state.locales.filter((l) => l !== localeName)
      return {
        locales: filteredLocales,
        currentLocale: state.currentLocale == localeName ? filteredLocales[0] : state.currentLocale
      }
    })
  },

  setCurrentLocale: (localeName: string) => {
    set({ currentLocale: localeName })
  }
}))
