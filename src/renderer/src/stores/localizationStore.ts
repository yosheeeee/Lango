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
      console.log('[localizationStore] fetchLocales result:', locales)
      set({ locales: locales ?? [], currentLocale: locales[0] ?? null, isLoading: false })
    } catch (e) {
      console.error('Failed to fetch locales:', e)
      set({ locales: [], isLoading: false })
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
  }
}))
