import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui'
import { cn } from '@renderer/utils/cn'
import { ComponentProps } from 'react'

export function ToggleGroup({
  className,
  ...props
}: ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return (
    <ToggleGroupPrimitive.Root
      {...props}
      className={cn('flex rounded-md overflow-hidden border border-gray-700', className)}
    />
  )
}

export function ToggleGroupItem({
  className,
  ...props
}: ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      {...props}
      className={cn(
        'px-3 py-1.5 text-sm cursor-pointer transition-colors bg-gray-800 text-gray-400',
        'hover:bg-gray-700 hover:text-white',
        'data-[state=on]:bg-gray-700 data-[state=on]:text-white',
        '[&:not(:first-child)]:border-l [&:not(:first-child)]:border-gray-700',
        'outline-none',
        className
      )}
    />
  )
}
