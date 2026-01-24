import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import resourcesToBackend from 'i18next-resources-to-backend'

i18n
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
    lng: window.currentLanguage || 'ru', // Use lng instead of just fallbackLng to set the initial language
    fallbackLng: 'ru',
    defaultNS: 'projectSelect',
    debug: true, // Enable debug mode to see what's happening
    react: {
      useSuspense: false
    },
    interpolation: {
      escapeValue: false // React already safes from xss
    }
  })

export default i18n
