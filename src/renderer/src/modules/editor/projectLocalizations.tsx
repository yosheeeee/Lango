import { useEffect, useTransition } from 'react'
import LocaleIcon from '@renderer/components/localeIcon'
import { ResizablePanel } from '@renderer/components/resizable'
import { useSessionStore } from '@renderer/stores/sessionStore'
import { useLocalizationStore } from '@renderer/stores/localizationStore'
import { useTranslation } from 'react-i18next'

export default function ProjectLocalizations() {
  const { currentSession } = useSessionStore()
  const { locales, isLoading, fetchLocales } = useLocalizationStore()
  const { t } = useTranslation('master')

  useEffect(() => {
    fetchLocales()
  }, [currentSession?.id])

  if (!currentSession) {
    return (
      <ResizablePanel defaultSize={'30%'} minSize={'100px'}>
        <p className="flex items-center justify-center h-full text-gray-400">No project selected</p>
      </ResizablePanel>
    )
  }

  if (isLoading && locales.length === 0) {
    return (
      <ResizablePanel defaultSize={'30%'} minSize={'100px'}>
        <p className="flex items-center justify-center h-full text-gray-400">Loading...</p>
      </ResizablePanel>
    )
  }

  return (
    <ResizablePanel defaultSize={'30%'} minSize={'100px'}>
      <div className="w-full h-full flex flex-col gap-3 px-4 py-3">
        <p>{t('localizations.title')}</p>
        <div className="flex-1 flex flex-col gap-1">
          {locales.map((locale) => (
            <LocalizationNode key={locale} name={locale} />
          ))}
        </div>
      </div>
    </ResizablePanel>
  )
}

function LocalizationNode({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 py-1 px-2">
      <LocaleIcon locale={name} className="size-[20px] rounded-md" />
      <p>{name}</p>
    </div>
  )
}
