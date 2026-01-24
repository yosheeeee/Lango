import { Language } from '../domain/models/currentLanguage'
import store from '../domain/store'

class CurrentLanguageService {
  private currentLanguage: Language
  constructor() {
    this.currentLanguage = store.get('currentLanguage')
  }
  setCurrentLanguage(lang: Language): void {
    store.set('currentLanguage', lang)
    this.currentLanguage = lang
  }
  getCurrentLanguage(): Language {
    return this.currentLanguage
  }
}

export default new CurrentLanguageService()
