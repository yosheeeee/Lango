import { InlineLogo } from '@renderer/components/logo'
import { ComponentProps, FC } from 'react'
import { LanguageSwitcher } from './languageSwitcher'
import { ProjectSearch } from './projectSearch'
import { HeaderMenu } from './headerMenu'

export const EditorHeader: FC<ComponentProps<'header'>> = () => {
  return (
    <header className="flex items-center justify-between py-1 px-3 border-b-gray-700 border-b">
      <div>
        <HeaderMenu />
      </div>
      <div>
        <ProjectSearch />
      </div>
      <div className="flex items-center gap-3">
        <LanguageSwitcher
          className="!py-1 gap-1"
          selectedContainerClassName="py-0 text-xs font-semibold [&>img]:h-3!"
        />
        <InlineLogo className="text-xs ml-auto" />
      </div>
    </header>
  )
}
