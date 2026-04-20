import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@renderer/utils/cn'
import { Input } from '@renderer/components/form'
import LocaleIcon from '@renderer/components/project/LocaleIcon'

type LocaleRowProps = {
  locale: string
  value: string
  onSave: (value: string) => void
}

export function LocaleRow({ locale, value, onSave }: LocaleRowProps) {
  const [localValue, setLocalValue] = useState(value)
  const isDirty = localValue !== value

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  function handleCancel() {
    setLocalValue(value)
  }

  return (
    <div className="flex items-center p-2">
      <div className="flex flex-1 focus-within:ring-[3px] focus-within:ring-gray-700/50 rounded-md">
        <div className="flex items-center gap-1.5 px-2 h-9 bg-gray-800 border border-gray-600  rounded-l-md shrink-0 text-gray-400 max-w-12.5 overflow-hidden">
          <LocaleIcon locale={locale} className="size-4 shrink-0" />
          <span className="text-sm leading-none truncate shrink-0">{locale}</span>
        </div>
        <Input
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSave(localValue)
            if (e.key === 'Escape') handleCancel()
          }}
          className={cn(
            'flex-1 rounded-none border-l-0 focus-visible:ring-0',
            !isDirty && 'rounded-r-md'
          )}
        />
        {isDirty && (
          <>
            <button
              onClick={() => onSave(localValue)}
              className="shrink-0 size-9 flex items-center justify-center [&>svg]:size-5 cursor-pointer text-gray-400 bg-gray-800 hover:bg-green-900 hover:text-green-300 transition-colors border border-l-0 border-gray-600"
            >
              <Check />
            </button>
            <button
              onClick={handleCancel}
              className="shrink-0 size-9 flex items-center justify-center [&>svg]:size-5 cursor-pointer text-gray-400 bg-gray-800 hover:bg-gray-700 transition-colors border border-l-0 border-gray-600 rounded-r-md"
            >
              <X />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
