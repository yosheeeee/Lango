import { useEffect, useRef, useState } from 'react'
import LocaleIcon from '@renderer/components/localeIcon'
import { ResizablePanel } from '@renderer/components/resizable'
import { useSessionStore } from '@renderer/stores/sessionStore'
import { useLocalizationStore } from '@renderer/stores/localizationStore'
import { useTranslation } from 'react-i18next'
import { Globe, Plus, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@renderer/components/dialog'
import { Button } from '@renderer/components/button'

export default function ProjectLocalizations() {
  const { currentSession } = useSessionStore()
  const { locales, isLoading, fetchLocales, addLocale, deleteLocale } = useLocalizationStore()
  const { t } = useTranslation('master')
  const { t: tCommon } = useTranslation('common')
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
            <LocalizationNode
              key={locale}
              name={locale}
              canDelete={locales.length > 1}
              onDelete={deleteLocale}
            />
          ))}
        </div>
      </div>
    </ResizablePanel>
  )
}

function LocalizationNode({
  name,
  canDelete,
  onDelete
}: {
  name: string
  canDelete: boolean
  onDelete: (name: string) => void
}) {
  const { t } = useTranslation('master')
  const { t: tCommon } = useTranslation('common')
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleDelete = async () => {
    await onDelete(name)
    setConfirmOpen(false)
  }

  return (
    <>
      <div className="flex items-center gap-2 py-1 px-2 group justify-between">
        <div className="flex items-center gap-2">
          <LocaleIcon locale={name} className="size-[20px] rounded-md" />
          <p>{name}</p>
        </div>
        {canDelete && (
          <button
            data-delete-btn=""
            className="opacity-0 group-hover:opacity-100 flex items-center [&>svg]:size-[14px] text-gray-400 hover:text-red-400"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 />
          </button>
        )}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteLocale.title')}</DialogTitle>
            <DialogDescription>
              {t('deleteLocale.description', { name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button color="zinc">{tCommon('cancel')}</Button>
            </DialogClose>
            <Button color="cyan" onClick={handleDelete}>
              {tCommon('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
