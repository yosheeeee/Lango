import { InlineLogo } from '@renderer/components/logo'
import { ComponentProps, FC } from 'react'
import { LanguageSwitcher } from '../languageSwitcher'
import { ProjectSearch } from './projectSearch'
import { HeaderMenu } from './headerMenu'
import { cn } from '@renderer/utils/cn'
import SessionSwitcher from './sessionSwitcher'

export const EditorHeader: FC<ComponentProps<'header'>> = () => {
  return (
    <header className="flex items-center justify-between py-1 px-3 border-b-gray-700 border-b select-none">
      <HeaderGroup>
        <HeaderMenu />
        <SessionSwitcher />
      </HeaderGroup>
      <HeaderGroup>
        <ProjectSearch />
      </HeaderGroup>
      <HeaderGroup className="flex items-center gap-3">
        <LanguageSwitcher
          className="!py-1 gap-1"
          selectedContainerClassName="py-0 text-xs font-semibold [&>img]:h-3!"
        />
        <InlineLogo className="text-xs ml-auto" />
      </HeaderGroup>
    </header>
  )
}

const HeaderGroup: FC<ComponentProps<'div'>> = ({ className, ...props }) => (
  <div {...props} className={cn('flex items-center gap-3', className)} />
)
