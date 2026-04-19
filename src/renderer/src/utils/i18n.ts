import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { Language } from 'src/domain/models/currentLanguage'

export async function initI18n(language: Language): Promise<typeof i18n> {
  await i18n
    .use(
      resourcesToBackend((lang: string, namespace: string) => {
        return import(`../locales/${lang}/${namespace}.json`).catch((error) => {
          console.error(`Failed to load translation file for ${lang}/${namespace}.json:`, error)
          return { default: {} }
        })
      })
    )
    .use(initReactI18next)
    .init({
      lng: language || 'ru',
      fallbackLng: 'ru',
      defaultNS: 'projectSelect',
      react: {
        useSuspense: false
      },
      interpolation: {
        escapeValue: false
      }
    })

  return i18n
}

export default i18n
