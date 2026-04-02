import { cn } from '@renderer/utils/cn'
import { cva, VariantProps } from 'class-variance-authority'
import { Slot } from '@radix-ui/react-slot'
import { ComponentProps, FC } from 'react'

const buttonVariants = cva(
  'flex items-center justify-center cursor-pointer disabled:cursor-default transition-colors [&>svg]:size-[1.4em] outline-none',
  {
    variants: {
      color: {
        zinc: 'bg-zinc-600 text-white hover:bg-zinc-500',
        cyan: 'bg-cyan-400 text-cyan-950 hover:bg-cyan-500',
        transparent: ''
      },
      radius: {
        md: 'rounded-md gap-2.5'
      },
      size: {
        md: 'text-md py-2 px-4',
        lg: 'text-lg py-3 px-6',
        sm: 'text-sm p-2',
        unset: ''
      },
      weight: {
        semibold: 'font-semibold',
        default: ''
      }
    },
    defaultVariants: {
      color: 'zinc',
      radius: 'md',
      size: 'md',
      weight: 'default'
    }
  }
)

export const Button: FC<
  ComponentProps<'button'> & { asChild?: boolean } & VariantProps<typeof buttonVariants>
> = ({ asChild, className, ...props }) => {
  const Comp = asChild ? Slot : 'button'
  return <Comp type="button" {...props} className={cn(buttonVariants({ ...props }), className)} />
}
