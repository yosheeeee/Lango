import { Button } from '@renderer/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@renderer/components/dropdown'
import { useSessionStore } from '@renderer/stores/sessionStore'
import { Menu } from 'lucide-react'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useEditorStore } from '@renderer/stores/visibilityStore'

export const HeaderMenu: FC = () => {
  const { clearSession } = useSessionStore()
  const { toggleMaster, masterPanel, toggleCheetSheet } = useEditorStore()
  const { t } = useTranslation('headerMenu')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="!p-1">
          <Menu className="!size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={clearSession}>{t('exitProject')}</DropdownMenuItem>
        <DropdownMenuItem onClick={toggleMaster}>
          {t(masterPanel ? 'onMaster' : 'offMaster')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleCheetSheet}>{t('openKeybinds')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
