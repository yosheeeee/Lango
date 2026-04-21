import {
  CollapsibleTrigger,
  CollapsibleContent,
  Collapsible
} from '@renderer/components/ui/collapsible'
import { Input } from '@renderer/components/form'
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger
} from '@renderer/components/ui/popover'
import { DropdownMenuContent, DropdownMenuItem } from '@renderer/components/ui/dropdown'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { Button } from '@renderer/components/ui/button'
import { cn } from '@renderer/utils/cn'
import {
  Check,
  ChevronUp,
  FolderPlus,
  Globe,
  Pencil,
  Plus,
  Trash,
  Type,
  Wrench,
  X
} from 'lucide-react'
import { ComponentProps, useContext, useEffect, useRef, useState } from 'react'
import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui'
import { NamespaceCtx } from '../namespaceContext'
import { useLocalizationStore } from '@renderer/stores/localizationStore'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'
import { EditRowButton } from './EditRowButton'
import { LocaleTranslationsContent } from './LocaleTranslationsContent'
import { ParentKeyRenameInput } from './ParentKeyRenameInput'
import { KeyEditor } from './KeyEditor'
import { useTranslation } from 'react-i18next'

type EntryEditorProps = ValueEditorProps & ComponentProps<'div'>
export default function EntryEditor({
  namespace,
  translationKey,
  currentLocalizationValue,
  isOrphan,
  className,
  ...props
}: EntryEditorProps) {
  const [keyEditing, setKeyEditing] = useState(false)
  const { t } = useTranslation('editor', { keyPrefix: 'keyActions' })

  return (
    <div
      data-key={translationKey}
      className={cn(
        'flex-col flex w-full gap-2 rounded-md transition-colors',
        'data-[highlight=true]:ring-2 data-[highlight=true]:ring-amber-500/70 data-[highlight=true]:bg-amber-500/5',
        className
      )}
      {...props}
    >
      <div className="px-3 flex text-gray-400 text-sm items-center gap-2">
        <p>{translationKey}</p>
        {!keyEditing && (
          <Tooltip delayDuration={700}>
            <TooltipTrigger asChild>
              <button
                onClick={() => setKeyEditing(true)}
                className="cursor-pointer hover:text-gray-200"
              >
                <Pencil className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{t('edit')}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      {keyEditing ? (
        <KeyEditor
          namespace={namespace}
          onFinish={() => setKeyEditing(false)}
          translationKey={translationKey}
        />
      ) : (
        <ValueEditor
          namespace={namespace}
          translationKey={translationKey}
          currentLocalizationValue={currentLocalizationValue}
          isOrphan={isOrphan}
        />
      )}
    </div>
  )
}

type ValueEditorProps = {
  namespace: string
  translationKey: string
  currentLocalizationValue: string
  isOrphan?: boolean
}

function ValueEditor({ currentLocalizationValue, translationKey, isOrphan }: ValueEditorProps) {
  const ctx = useContext(NamespaceCtx)
  const { currentLocale } = useLocalizationStore()
  const [value, setValue] = useState(currentLocalizationValue)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { t } = useTranslation('editor', { keyPrefix: 'keyActions' })

  const isDirty = value !== currentLocalizationValue

  useEffect(() => {
    setValue(currentLocalizationValue)
  }, [currentLocalizationValue])

  async function handleSave() {
    if (!ctx || !currentLocale || !isDirty) return
    await window.api.project.updateLocalizationValue(
      ctx.namespace,
      translationKey,
      currentLocale,
      value
    )
    ctx.onRefresh()
  }

  function handleCancel() {
    setValue(currentLocalizationValue)
  }

  async function handleConfirmDelete() {
    if (!ctx) return
    setConfirmOpen(false)
    await window.api.project.deleteLocalizationKey(ctx.namespace, translationKey)
    ctx.onRefresh()
  }

  async function handleFixOrphan() {
    if (!ctx) return
    await window.api.project.fixOrphanKey(ctx.namespace, translationKey)
    ctx.onRefresh()
  }

  return (
    <>
      <div className="flex gap-2 items-center">
        <Popover>
          <PopoverAnchor asChild>
            <div className="flex w-full flex-1 focus-within:ring-gray-700/50 focus-within:ring-[3px] rounded-md">
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className={cn(
                  'flex-1 rounded-r-none focus-visible:ring-0',
                  !isDirty && 'rounded-r-none',
                  isOrphan && 'border-orange-500'
                )}
              />
              {isDirty && (
                <>
                  <button
                    onClick={handleSave}
                    className={cn(
                      'shrink-0 size-9 flex items-center justify-center [&>svg]:size-5 cursor-pointer text-gray-400 bg-gray-800 hover:bg-green-900 hover:text-green-300 transition-colors border border-l-0 border-gray-600',
                      isOrphan && 'border-orange-500'
                    )}
                  >
                    <Check />
                  </button>
                  <button
                    onClick={handleCancel}
                    className={cn(
                      'shrink-0 size-9 flex items-center justify-center [&>svg]:size-5 cursor-pointer text-gray-400 bg-gray-800 hover:bg-gray-700 transition-colors border border-l-0 border-gray-600',
                      isOrphan && 'border-orange-500'
                    )}
                  >
                    <X />
                  </button>
                </>
              )}
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    'shrink-0 size-9 flex items-center justify-center text-gray-400 bg-gray-800 hover:bg-transparent border-gray-600 border border-l-0 rounded-r-md cursor-pointer [&>svg]:size-5 transition-colors',
                    isOrphan && 'border-orange-500'
                  )}
                >
                  <Globe />
                </button>
              </PopoverTrigger>
            </div>
          </PopoverAnchor>
          <PopoverContent className="w-(--radix-popover-trigger-width) p-0 overflow-hidden gap-0">
            {ctx && (
              <LocaleTranslationsContent
                namespace={ctx.namespace}
                translationKey={translationKey}
              />
            )}
          </PopoverContent>
        </Popover>
        {isOrphan && (
          <Tooltip>
            <TooltipTrigger asChild>
              <EditRowButton
                onClick={handleFixOrphan}
                className="text-gray-400 rounded-md hover:bg-orange-900 hover:text-orange-300 transition-colors cursor-pointer"
              >
                <Wrench />
              </EditRowButton>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{t('fixOrphan')}</p>
            </TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <EditRowButton
              onClick={() => setConfirmOpen(true)}
              className="text-gray-400 rounded-md hover:bg-red-900 hover:text-red-300 transition-colors cursor-pointer"
            >
              <Trash />
            </EditRowButton>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{t('delete')}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <DeleteConfirmDialog
        open={confirmOpen}
        translationKey={translationKey}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  )
}

type KeyType = 'translation' | 'parent'

type AddKeyButtonProps = {
  parentKey?: string
  variant?: 'default' | 'small'
}

export function AddKeyButton({ parentKey, variant = 'default' }: AddKeyButtonProps) {
  const ctx = useContext(NamespaceCtx)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [keyType, setKeyType] = useState<KeyType>('translation')
  const [keyName, setKeyName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslation('editor', { keyPrefix: 'addKey' })

  function handleSelectType(type: KeyType) {
    setKeyType(type)
    setDropdownOpen(false)
    setPopoverOpen(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  async function confirm() {
    const trimmed = keyName.trim()
    if (!trimmed || !ctx) return cancel()
    await window.api.project.addLocalizationKey(
      ctx.namespace,
      trimmed,
      parentKey,
      keyType === 'parent'
    )
    setKeyName('')
    setPopoverOpen(false)
    ctx.onRefresh()
  }

  function cancel() {
    setKeyName('')
    setPopoverOpen(false)
  }

  const triggerEl =
    variant === 'small' ? (
      <EditRowButton className="size-5 [&>svg]:size-3 bg-gray-700 rounded-sm hover:bg-gray-500">
        <Plus />
      </EditRowButton>
    ) : (
      <Button size="sm">
        <Plus />
        {t('button')}
      </Button>
    )

  return (
    <Popover open={popoverOpen} onOpenChange={(open) => !open && cancel()}>
      <DropdownMenuPrimitive.Root open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuPrimitive.Trigger asChild>
          <PopoverAnchor asChild>{triggerEl}</PopoverAnchor>
        </DropdownMenuPrimitive.Trigger>
        <DropdownMenuContent align={variant === 'small' ? 'end' : 'start'}>
          <DropdownMenuItem onSelect={() => handleSelectType('translation')}>
            <Type />
            {t('translation')}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleSelectType('parent')}>
            <FolderPlus />
            {t('parent')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPrimitive.Root>
      <PopoverContent className="w-72 p-3" align="start" onFocusOutside={(e) => e.preventDefault()}>
        <p className="text-xs text-gray-400 mb-2">
          {keyType === 'parent' ? t('parentName') : t('translationName')}
        </p>
        <div className="flex gap-1.5">
          <Input
            ref={inputRef}
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') confirm()
              if (e.key === 'Escape') cancel()
            }}
            className="flex-1 h-8"
            placeholder="key.name"
          />
          <EditRowButton className="size-8 shrink-0 rounded-md hover:bg-gray-700" onClick={confirm}>
            <Check />
          </EditRowButton>
          <EditRowButton className="size-8 shrink-0 rounded-md hover:bg-gray-700" onClick={cancel}>
            <X />
          </EditRowButton>
        </div>
      </PopoverContent>
    </Popover>
  )
}

type CollapsibleTranslationEntry = Pick<ValueEditorProps, 'translationKey'> & {
  childNodes?: (CollapsibleTranslationEntry | ValueEditorProps)[]
}

export function CollabsibleTranslationsEntry({
  translationKey,
  childNodes
}: CollapsibleTranslationEntry) {
  const ctx = useContext(NamespaceCtx)
  const [isRenaming, setIsRenaming] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { t } = useTranslation('editor', { keyPrefix: 'keyActions' })

  async function handleConfirmDelete() {
    if (!ctx) return
    setConfirmOpen(false)
    await window.api.project.deleteLocalizationKey(ctx.namespace, translationKey)
    ctx.onRefresh()
  }

  return (
    <>
      <Collapsible
        defaultOpen
        data-key={translationKey}
        className="group rounded-md transition-colors data-[highlight=true]:ring-2 data-[highlight=true]:ring-amber-500/70 data-[highlight=true]:bg-amber-500/5"
      >
        <div className="flex items-center justify-between">
          {isRenaming ? (
            <ParentKeyRenameInput
              translationKey={translationKey}
              onFinish={() => setIsRenaming(false)}
            />
          ) : (
            <CollapsibleTrigger asChild>
              <div className="flex items-center gap-1 flex-1 select-none cursor-pointer">
                <ChevronUp className='group-data-[state="open"]:rotate-180 transition-transform text-gray-300' />
                <p>{translationKey}</p>
              </div>
            </CollapsibleTrigger>
          )}
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Tooltip>
              <TooltipTrigger asChild>
                <EditRowButton
                  className="size-5 [&>svg]:size-3 bg-gray-700 rounded-sm hover:bg-gray-500"
                  onClick={() => setIsRenaming(true)}
                >
                  <Pencil />
                </EditRowButton>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('edit')}</p>
              </TooltipContent>
            </Tooltip>
            <AddKeyButton parentKey={translationKey} variant="small" />
            <Tooltip>
              <TooltipTrigger asChild>
                <EditRowButton
                  className="size-5 [&>svg]:size-3 bg-gray-700 rounded-sm hover:bg-red-900 hover:text-red-300"
                  onClick={() => setConfirmOpen(true)}
                >
                  <Trash />
                </EditRowButton>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('delete')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        <CollapsibleContent className="pl-1.5 border-l border-l-gray-700 ml-3 flex flex-col gap-3 pt-2">
          {childNodes?.map((n, idx) =>
            'namespace' in n ? (
              <EntryEditor key={idx} {...n} />
            ) : (
              <CollabsibleTranslationsEntry key={idx} {...n} />
            )
          )}
        </CollapsibleContent>
      </Collapsible>
      <DeleteConfirmDialog
        open={confirmOpen}
        translationKey={translationKey}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  )
}
