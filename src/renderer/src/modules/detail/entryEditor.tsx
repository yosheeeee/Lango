import {
  CollapsibleTrigger,
  CollapsibleContent,
  Collapsible
} from '@renderer/components/collapsible'
import { Input } from '@renderer/components/form'
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger
} from '@renderer/components/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/tooltip'
import { cn } from '@renderer/utils/cn'
import { Check, ChevronUp, Globe, Pencil, Plus, Trash, X } from 'lucide-react'
import { ComponentProps, FC, useRef, useState } from 'react'

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
              <EditRowButton className="shrink-0  text-gray-400 bg-gray-800 hover:bg-transparent border-gray-600 border border-l-0 rounded-md rounded-l-none cursor-pointer">
                <Globe />
              </EditRowButton>
            </PopoverTrigger>
          </div>
        </PopoverAnchor>
        <PopoverContent className="w-(--radix-popover-trigger-width) overflow-x-hidden">
          hello world
        </PopoverContent>
      </Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <EditRowButton className="text-gray-400 rounded-md hover:bg-red-900 hover:text-red-300 transition-colors cursor-pointer">
            <Trash />
          </EditRowButton>
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
        <EditRowButton onClick={onFinish}>
          <Check />
        </EditRowButton>
        <EditRowButton onClick={onFinish}>
          <X />
        </EditRowButton>
      </div>
    </div>
  )
}

type CollapsibleTranslationEntry = Pick<ValueEditorProps, 'translationKey'> & {
  childNodes?: (CollapsibleTranslationEntry | ValueEditorProps)[]
}
export function CollabsibleTranslationsEntry({
  translationKey,
  childNodes
}: CollapsibleTranslationEntry) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between group select-none cursor-pointer">
          <div className="flex items-center gap-1">
            <ChevronUp className='group-data-[state="open"]:rotate-180 transition-transform text-gray-300' />
            <p>{translationKey}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <EditRowButton className="size-5 [&>svg]:size-3 bg-gray-700 rounded-sm hover:bg-gray-500">
                  <Pencil />
                </EditRowButton>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit key</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <EditRowButton className="size-5 [&>svg]:size-3 bg-gray-700 rounded-sm hover:bg-gray-500">
                  <Plus />
                </EditRowButton>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add key</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <EditRowButton className="size-5 [&>svg]:size-3 bg-gray-700 rounded-sm hover:bg-red-900 hover:text-red-300">
                  <Trash />
                </EditRowButton>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete key</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-1.5 border-l border-l-gray-700 ml-3 flex felx-gol gap-3 pt-2">
        {childNodes?.map((n) =>
          'childNodes' in n ? <CollabsibleTranslationsEntry {...n} /> : <EntryEditor {...n} />
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}

const EditRowButton: FC<ComponentProps<'button'>> = ({ className, ...props }) => (
  <button
    {...props}
    className={cn(
      'size-9 flex items-center justify-center [&>svg]:size-5 cursor-pointer',
      className
    )}
  />
)
