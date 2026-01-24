import { ComponentProps, FC } from 'react'
import logoSrc from '@renderer/assets/Lango_logo.png'
import { cn } from '@renderer/utils/cn'

export const Logo: FC<Omit<ComponentProps<'img'>, 'src'>> = (props) => (
  <img {...props} src={logoSrc} />
)
export const InlineLogo: FC<Omit<ComponentProps<'div'>, 'children'>> = (props) => (
  <div {...props} className={cn('flex items-end gap-[0.075em]', props.className)}>
    <Logo className="h-[1.33em] block mb-[0.16em]" />
    <h2 className="font-semibold text-[1em] leading-none">ango</h2>
  </div>
)
