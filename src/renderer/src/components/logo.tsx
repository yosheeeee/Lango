import { ComponentProps, FC } from 'react'
import logoSrc from '@renderer/assets/Lango_logo.png'

export const Logo: FC<Omit<ComponentProps<'img'>, 'src'>> = (props) => (
  <img {...props} src={logoSrc} />
)
