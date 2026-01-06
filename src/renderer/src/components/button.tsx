import { cn } from '@renderer/utils/cn'
import { cva, VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { ComponentProps, FC } from 'react'

const buttonVariants = cva(
  'flex items-center justify-center cursor-pointer disabled:cursor-default transition-colors [&>svg]:size-[1.4em]',
  {
    variants: {
      color: {
        zinc: 'bg-zinc-600 text-white hover:bg-zinc-500'
      },
      radius: {
        md: 'rounded-md gap-2.5'
      },
      size: {
        md: 'text-md py-2 px-4',
        lg: 'text-lg py-3 px-6'
      }
    },
    defaultVariants: {
      color: 'zinc',
      radius: 'md',
      size: 'md'
    }
  }
)

export const Button: FC<
  ComponentProps<'button'> & { asChild?: boolean } & VariantProps<typeof buttonVariants>
> = ({ asChild, className, ...props }) => {
  const Comp = asChild ? Slot : 'button'
  return <Comp {...props} className={cn(buttonVariants({ ...props }), className)} />
}
