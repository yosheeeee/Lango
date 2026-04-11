import { create } from 'zustand'

type LocalizationState = {
  locales: string[]
  isLoading: boolean
}

type LocalizationActions = {
  fetchLocales: () => Promise<void>
}

type LocalizationStore = LocalizationState & LocalizationActions

const initialState: LocalizationState = {
  locales: [],
  isLoading: false
}

export const useLocalizationStore = create<LocalizationStore>()((set) => ({
  ...initialState,

  fetchLocales: async () => {
    set({ isLoading: true })
    try {
      const locales = await window.api.project.getLocaleFolders()
      console.log('[localizationStore] fetchLocales result:', locales)
      set({ locales: locales ?? [], isLoading: false })
    } catch (e) {
      console.error('Failed to fetch locales:', e)
      set({ locales: [], isLoading: false })
    }
  }
}))
