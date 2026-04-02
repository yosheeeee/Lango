import { Button } from '@renderer/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@renderer/components/dropdown'
import { useModulesVisibility } from '@renderer/providers/ModulesVisibilityProvider'
import { useSessionStore } from '@renderer/stores/sessionStore'
import { Menu } from 'lucide-react'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

export const HeaderMenu: FC = () => {
  const { clearSession } = useSessionStore()
  const { toggleMasterVisible, masterVisibile } = useModulesVisibility()
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
        <DropdownMenuItem onClick={toggleMasterVisible}>
          {t(masterVisibile ? 'offMaster' : 'onMaster')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
