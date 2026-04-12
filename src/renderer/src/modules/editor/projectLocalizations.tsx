import { useEffect, useRef, useState } from 'react'
import LocaleIcon from '@renderer/components/localeIcon'
import { ResizablePanel } from '@renderer/components/resizable'
import { useSessionStore } from '@renderer/stores/sessionStore'
import { useLocalizationStore } from '@renderer/stores/localizationStore'
import { useTranslation } from 'react-i18next'
import { Globe, Plus } from 'lucide-react'

export default function ProjectLocalizations() {
  const { currentSession } = useSessionStore()
  const { locales, isLoading, fetchLocales, addLocale } = useLocalizationStore()
  const { t } = useTranslation('master')
  const [isCreating, setIsCreating] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchLocales()
  }, [currentSession?.id])

  const startCreating = () => {
    setIsCreating(true)
    setInputValue('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleCreate = async () => {
    const trimmed = inputValue.trim()
    if (!trimmed) {
      setIsCreating(false)
      return
    }
    try {
      await addLocale(trimmed)
      setIsCreating(false)
      setInputValue('')
    } catch (e) {
      console.error('Failed to create locale:', e)
      setIsCreating(false)
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCreate()
    } else if (e.key === 'Escape') {
      setIsCreating(false)
      setInputValue('')
    }
  }

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
        <div className="flex items-center justify-between">
          <p>{t('localizations.title')}</p>
          <button
            className="text-gray-200 hover:text-white transition-colors cursor-pointer"
            onClick={startCreating}
          >
            <Plus className="size-[18px]" />
          </button>
        </div>
        <div className="flex-1 flex flex-col gap-1">
          {isCreating && (
            <div className="flex items-center gap-1 px-2 py-1">
              <Globe className="size-[18px] shrink-0 text-gray-400" />
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleInputKeyDown}
                onBlur={() => {
                  setIsCreating(false)
                  setInputValue('')
                }}
                placeholder={t('localizations.newLocalePlaceholder')}
                className="bg-transparent outline-none text-sm w-full placeholder:text-gray-600"
              />
            </div>
          )}
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
