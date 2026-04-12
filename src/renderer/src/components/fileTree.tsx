import type {
  FileTreeGroup as FileTreeGroupType,
  FileTreeItem as FileTreeItemType
} from 'src/domain/models/fileTree'
import { cn } from '@renderer/utils/cn'
import { Slot } from '@radix-ui/react-slot'
import { ComponentProps, FC, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import {
  FileJson2,
  FileWarning,
  Folder,
  FolderOpen,
  LucidePlus,
  Trash2,
  Wrench
} from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible'
import { useFileTreeStore } from '@renderer/stores/fileTreeStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './dropdown'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from './dialog'
import { Button } from './button'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'

export type FileTreeGroup = FileTreeGroupType
export type FileTreeItem = FileTreeItemType

export function FileTreeGroup({
  name,
  nestedItems,
  defaultOpen = false,
  depth = 0,
  folderPath = ''
}: FileTreeGroupType & { defaultOpen?: boolean; depth?: number; folderPath?: string }) {
  const [open, setOpen] = useState(defaultOpen)
  const [creatingType, setCreatingType] = useState<'file' | 'folder' | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const Icon = open ? FolderOpen : Folder
  const { t } = useTranslation('editor', { keyPrefix: 'fileTree' })
  const { t: tCommon } = useTranslation('common')

  const startCreating = (type: 'file' | 'folder') => {
    setOpen(true)
    setCreatingType(type)
    setInputValue('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleCreate = async () => {
    const trimmed = inputValue.trim()
    if (!trimmed) {
      setCreatingType(null)
      return
    }
    const fullPath = folderPath ? `${folderPath}/${trimmed}` : trimmed
    if (creatingType === 'file') {
      await window.api.project.createNamespace(fullPath)
    } else {
      await window.api.project.createFolder(fullPath)
    }
    setCreatingType(null)
    setInputValue('')
    useFileTreeStore.getState().invalidateTree()
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCreate()
    } else if (e.key === 'Escape') {
      setCreatingType(null)
      setInputValue('')
    }
  }

  const handleDeleteFolder = async () => {
    await window.api.project.deleteFolder(folderPath)
    setConfirmOpen(false)
    useFileTreeStore.getState().invalidateTree()
  }

  return (
    <>
      <Collapsible key={name} open={open} onOpenChange={setOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <TreeItem
            className="justify-between w-full group"
            data-tree-item=""
            data-tree-folder=""
            data-tree-depth={depth}
          >
            <div className="flex items-center gap-1">
              <Icon className="size-[18px]" />
              {name}
            </div>
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {folderPath && (
                <button
                  data-delete-btn=""
                  className="opacity-0 cursor-pointer group-hover:opacity-100 flex items-center [&>svg]:size-[14px] text-gray-400 hover:text-red-400"
                  onClick={() => setConfirmOpen(true)}
                >
                  <Trash2 />
                </button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger
                  data-create-btn=""
                  className="flex items-center [&>svg]:size-[16px] bg-transparent p-0 h-auto rounded-sm text-gray-400 hover:text-white"
                >
                  <LucidePlus />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  side="bottom"
                  sideOffset={4}
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
                  <DropdownMenuItem onSelect={() => startCreating('file')}>
                    <FileJson2 />
                    {t('newFile')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => startCreating('folder')}>
                    <Folder />
                    {t('newFolder')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </TreeItem>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1 ml-5 style-lyra:ml-4">
          <div className="flex flex-col gap-1">
            {creatingType && (
              <div className="flex items-center gap-1 px-2 py-1">
                {creatingType === 'file' ? (
                  <FileJson2 className="size-[18px] shrink-0 text-gray-400" />
                ) : (
                  <Folder className="size-[18px] shrink-0 text-gray-400" />
                )}
                <input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  onBlur={() => {
                    setCreatingType(null)
                    setInputValue('')
                  }}
                  placeholder={
                    creatingType === 'file' ? t('filenamePlaceholder') : t('folderNamePlaceholder')
                  }
                  className="bg-transparent outline-none text-sm w-full placeholder:text-gray-600"
                />
              </div>
            )}
            {nestedItems.map((child) =>
              'nestedItems' in child ? (
                <FileTreeGroup
                  key={child.name + (folderPath ? `-${folderPath}` : '')}
                  {...child}
                  depth={depth + 1}
                  folderPath={folderPath ? `${folderPath}/${child.name}` : child.name}
                />
              ) : (
                <FileTreeItem key={child.link} {...child} depth={depth + 1} />
              )
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteFolder.title')}</DialogTitle>
            <DialogDescription>{t('deleteFolder.description', { name })}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button color="zinc">{tCommon('cancel')}</Button>
            </DialogClose>
            <Button color="cyan" onClick={handleDeleteFolder}>
              {tCommon('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function FileTreeItem({
  name,
  link,
  depth = 0,
  isOrphan
}: Omit<FileTreeItemType, 'locales'> & { depth?: number }) {
  const FileIcon = isOrphan ? FileWarning : FileJson2
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { t } = useTranslation('editor', { keyPrefix: 'fileTree' })
  const { t: tCommon } = useTranslation('common')

  const handleDelete = async () => {
    await window.api.project.deleteNamespace(link.slice(1))
    setConfirmOpen(false)
    useFileTreeStore.getState().invalidateTree()
  }

  const handleFixOrphan = async (e) => {
    // link вида "/auth/login", убираем ведущий слэш для namespacePath
    e.preventDefault()
    e.stopPropagation()
    const namespacePath = link.slice(1)
    await window.api.project.fixOrphanNamespace(namespacePath)
    useFileTreeStore.getState().invalidateTree()
  }

  return (
    <>
      <TreeItem
        asChild
        data-tree-item=""
        data-tree-depth={depth}
        data-orphan={isOrphan || undefined}
      >
        <NavLink to={link} className={'gap-1 justify-between group hover:underline'}>
          <div className="flex items-center gap-1">
            <FileIcon className={cn('size-[18px]', { 'text-red-500': isOrphan })} />
            <span>{name}</span>
          </div>
          <div className="flex items-center gap-2 [&_svg]:size-[14px]">
            {isOrphan && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleFixOrphan}
                    className="text-gray-400 hover:text-amber-500 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                  >
                    <Wrench />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('fixOrphan')}</p>
                </TooltipContent>
              </Tooltip>
            )}
            <button
              role="button"
              tabIndex={-1}
              data-delete-btn=""
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setConfirmOpen(true)
              }}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 cursor-pointer"
            >
              <Trash2 />
            </button>
          </div>
        </NavLink>
      </TreeItem>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteNamespace.title')}</DialogTitle>
            <DialogDescription>{t('deleteNamespace.description', { name })}</DialogDescription>
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

export const TreeItem: FC<ComponentProps<'button'> & { asChild?: boolean }> = ({
  asChild,
  className,
  ...props
}) => {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      type="button"
      {...props}
      className={cn(
        'flex items-center cursor-pointer px-2 py-1 focus-visible:ring-1 focus-visible:ring-gray-500 focus-visible:outline-none  rounded-md hover:bg-gray-800',
        className
      )}
    />
  )
}
