import { useEffect, useState } from 'react'
import { useLocalizationStore } from '@renderer/stores/localizationStore'
import { LocaleRow } from './LocaleRow'

type LocaleTranslationsContentProps = {
  namespace: string
  translationKey: string
}

export function LocaleTranslationsContent({
  namespace,
  translationKey
}: LocaleTranslationsContentProps) {
  const { currentLocale } = useLocalizationStore()
  const [translations, setTranslations] = useState<Record<string, string> | null>(null)

  useEffect(() => {
    window.api.project.getKeyTranslations(namespace, translationKey).then(setTranslations)
  }, [namespace, translationKey])

  async function handleSave(locale: string, newValue: string) {
    await window.api.project.updateLocalizationValue(namespace, translationKey, locale, newValue)
    setTranslations((prev) => (prev ? { ...prev, [locale]: newValue } : prev))
  }

  if (!translations) {
    return <p className="p-3 text-xs text-gray-400">Loading…</p>
  }

  const otherLocales = Object.entries(translations).filter(([locale]) => locale !== currentLocale)

  if (otherLocales.length === 0) {
    return <p className="p-3 text-xs text-gray-400">No other locales.</p>
  }

  return (
    <div className="flex flex-col divide-y divide-gray-700">
      {otherLocales.map(([locale, val]) => (
        <LocaleRow key={locale} locale={locale} value={val} onSave={(v) => handleSave(locale, v)} />
      ))}
    </div>
  )
}
