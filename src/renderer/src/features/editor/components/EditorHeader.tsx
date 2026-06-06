import { InlineLogo } from '@renderer/components/project/Logo'
import { ComponentProps, FC } from 'react'
import { LanguageSwitcher } from '@renderer/components/ui/LanguageSwitcher'
import { ProjectSearch } from './ProjectSearch'
import { HeaderMenu } from './HeaderMenu'
import { cn } from '@renderer/utils/cn'
import SessionSwitcher from './SessionSwitcher'

export const EditorHeader: FC<ComponentProps<'header'>> = () => {
  return (
    <header
      className="flex items-center justify-between py-1 px-3 border-b-gray-700 border-b select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
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
  <div
    {...props}
    className={cn('flex items-center gap-3', className)}
    style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
  />
)
