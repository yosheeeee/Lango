import { Input } from '@renderer/components/form'
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger
} from '@renderer/components/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/tooltip'
import { cn } from '@renderer/utils/cn'
import { Check, Globe, Pencil, Trash, X } from 'lucide-react'
import { ComponentProps, useState } from 'react'

type EntryEditorProps = ValueEditorProps & ComponentProps<'div'>
export default function EntryEditor({
  namespace,
  translationKey,
  currentLocalizationValue,
  className,
  ...props
}: EntryEditorProps) {
  const [keyEditing, setKeyEditing] = useState(false)

  function onFinishKeyEditing() {
    setKeyEditing(false)
  }

  return (
    <div className={cn('flex-col flex w-full gap-2', className)} {...props}>
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
              <p>Edit key</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      {keyEditing ? (
        <KeyEditor
          namespace={namespace}
          onFinish={onFinishKeyEditing}
          translationKey={translationKey}
        />
      ) : (
        <ValueEditor
          namespace={namespace}
          translationKey={translationKey}
          currentLocalizationValue={currentLocalizationValue}
        />
      )}
    </div>
  )
}

type ValueEditorProps = {
  namespace: string
  translationKey: string
  currentLocalizationValue: string
}

function ValueEditor({ currentLocalizationValue, translationKey, namespace }: ValueEditorProps) {
  return (
    <div className="flex gap-2 items-center">
      <Popover>
        <PopoverAnchor asChild>
          <div className="flex w-full flex-1 focus-within:border-ring focus-within:ring-gray-700/50 focus-within:ring-[3px] rounded-md">
            <Input
              value={currentLocalizationValue}
              className="flex-1 rounded-r-none focus-visible:ring-0 "
            />
            <PopoverTrigger asChild>
              <button className="shrink-0 flex items-center justify-center aspect-square size-9 text-gray-400 bg-gray-800 hover:bg-transparent border-gray-600 border border-l-0 rounded-md rounded-l-none cursor-pointer">
                <Globe className="size-5" />
              </button>
            </PopoverTrigger>
          </div>
        </PopoverAnchor>
        <PopoverContent className="w-(--radix-popover-trigger-width) overflow-x-hidden">
          hello world
        </PopoverContent>
      </Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="size-9 flex items-center justify-center text-gray-400 rounded-md hover:bg-red-900 hover:text-red-300 transition-colors cursor-pointer">
            <Trash className="size-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Delete key</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

type KeyEditorProps = Pick<ValueEditorProps, 'namespace' | 'translationKey'> & {
  onFinish: () => void
}

function KeyEditor({ onFinish, namespace, translationKey }: KeyEditorProps) {
  return (
    <div className="flex gap-2.5 w-full">
      <Input className="flex-1" />
      <div className="flex gap-1 shrink-0">
        <button onClick={onFinish} className="size-9 flex items-center justify-center">
          <Check />
        </button>
        <button onClick={onFinish} className="size-9 flex items-center justify-center">
          <X />
        </button>
      </div>
    </div>
  )
}
