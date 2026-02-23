import { cn } from '@renderer/utils/cn'
import { Popover } from 'radix-ui'
import { FC, useState } from 'react'
import { Button } from '../button'
import { Pipette } from 'lucide-react'
import { projectColors } from '@renderer/utils/projectColors'
import { Color } from 'src/domain/models/session'

interface ColorSelectInputProps {
  value: Color
  onChange?: (value: Color) => void
  className?: string
}

export const ColorSelectInput: FC<ColorSelectInputProps> = ({ className, onChange, value }) => {
  const [open, setOpen] = useState(false)
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Anchor asChild>
        <div
          className={cn(
            'flex gap-1 w-full overflow-hidden items-center justify-between',
            'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-gray-800 border-gray-600 h-9 w-full min-w-0 rounded-md border bg-transparent px-1 py-1 shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm !text-base',
            {
              'border-ring ring-gray-700/50 ring-[3px] border-gray-600': open
            },
            'aria-invalid:border-red-700',
            'group-[*[data-error="true"]]:border-red-700 group-[*[data-error="true"]]:ring-red-700/20 dark:group-[*[data-error="true"]]:ring-red-700/40 ',
            className
          )}
        >
          <div
            className={cn(
              'w-full flex-1 h-full rounded-md transition-colors',
              projectColors[value]?.accent
            )}
          />
          <Popover.Trigger asChild>
            <Button
              color="transparent"
              size={'unset'}
              className="h-full aspect-square shrink-0 text-xs hover:bg-white/20"
            >
              <Pipette />
            </Button>
          </Popover.Trigger>
        </div>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          sideOffset={4}
          className={cn(
            'bg-gray-700  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-(--radix-popper-anchor-width) origin-(--radix-popover-content-transform-origin) rounded-md border border-gray-600 p-2 shadow-md outline-hidden'
          )}
        >
          <div className="flex flex-wrap gap-1 justify-center">
            {Object.entries(projectColors).map(([key, val]) => (
              <button
                key={key}
                onClick={() => {
                  onChange?.(key as Color)
                  setOpen(false)
                }}
                className={cn('size-[25px] rounded-sm cursor-pointer', val.accent, val.hover)}
              ></button>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
