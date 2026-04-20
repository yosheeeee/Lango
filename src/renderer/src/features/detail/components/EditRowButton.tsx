import { ComponentProps, FC } from 'react'
import { cn } from '@renderer/utils/cn'

export const EditRowButton: FC<ComponentProps<'button'>> = ({ className, ...props }) => (
  <button
    {...props}
    className={cn(
      'size-9 flex items-center justify-center [&>svg]:size-5 cursor-pointer',
      className
    )}
  />
)
