import { cn } from '@renderer/utils/cn'
import { cva, VariantProps } from 'class-variance-authority'
import { ComponentProps, FC } from 'react'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md border font-medium leading-none whitespace-nowrap select-none',
  {
    variants: {
      color: {
        gray: 'bg-gray-800 text-gray-200 border-gray-700',
        orange: 'bg-orange-950/60 text-orange-300 border-orange-900',
        red: 'bg-red-950/60 text-red-300 border-red-900',
        cyan: 'bg-cyan-950/60 text-cyan-300 border-cyan-900',
        green: 'bg-green-950/60 text-green-300 border-green-900',
        amber: 'bg-amber-950/60 text-amber-300 border-amber-900'
      },
      size: {
        sm: 'text-[11px] py-0.5 px-1.5',
        md: 'text-xs py-1 px-2'
      }
    },
    defaultVariants: {
      color: 'gray',
      size: 'sm'
    }
  }
)

export type BadgeProps = ComponentProps<'span'> & VariantProps<typeof badgeVariants>

export const Badge: FC<BadgeProps> = ({ className, color, size, ...props }) => (
  <span {...props} className={cn(badgeVariants({ color, size }), className)} />
)
