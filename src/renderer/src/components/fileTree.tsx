import type {
  FileTreeGroup as FileTreeGroupType,
  FileTreeItem as FileTreeItemType
} from 'src/domain/models/fileTree'
import { cn } from '@renderer/utils/cn'
import { Slot } from '@radix-ui/react-slot'
import { ComponentProps, FC, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FileJson2, FileWarning, Folder, FolderOpen, LucidePlus } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible'

export type FileTreeGroup = FileTreeGroupType
export type FileTreeItem = FileTreeItemType

export function FileTreeGroup({
  name,
  nestedItems,
  defaultOpen = false,
  depth = 0
}: FileTreeGroupType & { defaultOpen?: boolean; depth?: number }) {
  const [open, setOpen] = useState(defaultOpen)
  const Icon = open ? FolderOpen : Folder
  return (
    <Collapsible key={name} open={open} onOpenChange={setOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <TreeItem
          className="justify-between w-full"
          data-tree-item=""
          data-tree-folder=""
          data-tree-depth={depth}
        >
          <div className="flex items-center gap-1">
            <Icon className="size-[18px]" />
            {name}
          </div>
          <div className="flex items-center gap-1 [&>svg]:size-[16px]">
            <LucidePlus />
          </div>
        </TreeItem>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1 ml-5 style-lyra:ml-4">
        <div className="flex flex-col gap-1">
          {nestedItems.map((child) =>
            'nestedItems' in child ? (
              <FileTreeGroup {...child} depth={depth + 1} />
            ) : (
              <FileTreeItem {...child} depth={depth + 1} />
            )
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function FileTreeItem({
  name,
  link,
  depth = 0,
  isOrphan
}: FileTreeItemType & { depth?: number }) {
  const FileIcon = isOrphan ? FileWarning : FileJson2
  return (
    <TreeItem asChild data-tree-item="" data-tree-depth={depth} data-orphan={isOrphan || undefined}>
      <NavLink to={link} className={'hover:underline gap-1 justify-between'}>
        <div className="flex items-center gap-1">
          <FileIcon className={cn('size-[18px]', { 'text-red-500': isOrphan })} />
          <span>{name}</span>
        </div>
      </NavLink>
    </TreeItem>
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
