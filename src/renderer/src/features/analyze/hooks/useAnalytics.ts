import { useAnalyticsStore } from '@renderer/stores/analyticsStore'
import { useLocalizationStore } from '@renderer/stores/localizationStore'
import { useEffect } from 'react'

/**
 * Управляет жизненным циклом analyticsStore: фетчит данные при монтировании
 * и инициализирует sourceLocale первой доступной локалью, если он не задан.
 */
export function useAnalytics() {
  const store = useAnalyticsStore()
  const { locales } = useLocalizationStore()

  useEffect(() => {
    if (store.sourceLocale === null && locales.length > 0) {
      useAnalyticsStore.setState({ sourceLocale: locales[0] })
    }
  }, [locales, store.sourceLocale])

  useEffect(() => {
    void store.fetchAnalytics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.sourceLocale])

  return store
}
