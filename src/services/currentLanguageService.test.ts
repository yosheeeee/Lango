import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import currentLanguageService from './currentLanguageService'
import store from '../domain/store'

describe('CurrentLanguageService', () => {
  beforeEach(() => {
    store.clear()
  })

  afterEach(() => {
    store.clear()
  })

  describe('getCurrentLanguage', () => {
    it('должен вернуть язык по умолчанию (ru)', () => {
      const language = currentLanguageService.getCurrentLanguage()

      expect(language).toBe('ru')
    })
  })

  describe('setCurrentLanguage', () => {
    it('должен установить язык en', () => {
      currentLanguageService.setCurrentLanguage('en')

      expect(currentLanguageService.getCurrentLanguage()).toBe('en')
    })

    it('должен сохранить язык в хранилище', () => {
      currentLanguageService.setCurrentLanguage('en')

      expect(store.get('currentLanguage')).toBe('en')
    })

    it('должен изменить язык с ru на en', () => {
      currentLanguageService.setCurrentLanguage('ru')
      currentLanguageService.setCurrentLanguage('en')

      expect(currentLanguageService.getCurrentLanguage()).toBe('en')
    })

    it('должен изменить язык с en на ru', () => {
      currentLanguageService.setCurrentLanguage('en')
      currentLanguageService.setCurrentLanguage('ru')

      expect(currentLanguageService.getCurrentLanguage()).toBe('ru')
    })
  })

  describe('инициализация', () => {
    it('должен быть синглтоном', async () => {
      const module1 = currentLanguageService
      const module2 = await import('./currentLanguageService')
      const service2 = module2.default

      expect(module1).toBe(service2)
    })
  })
})
