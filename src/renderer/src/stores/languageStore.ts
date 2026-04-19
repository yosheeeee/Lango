import { Language } from 'src/domain/models/currentLanguage'
import { create } from 'zustand'

type LanguageState = {
  currentLanguage: Language
}

type LanguageActions = {
  setCurrentLanguage: (lang: Language) => void
}

type LanguageStore = LanguageState & LanguageActions

const initialState: LanguageState = {
  currentLanguage: 'ru'
}

export const useLanguageStore = create<LanguageStore>()((set) => ({
  ...initialState,
  setCurrentLanguage: (lang) => set({ currentLanguage: lang })
}))

export async function initializeLanguageStore(): Promise<Language> {
  try {
    const lang = await window.api.currentLanguage.getCurrentLanguage()
    const resolvedLang = lang ?? 'ru'
    useLanguageStore.setState({ currentLanguage: resolvedLang })
    return resolvedLang
  } catch {
    return 'ru'
  }
}
