import { TitleBar } from '@renderer/components/ui/TitleBar'
import { TooltipProvider } from '@renderer/components/ui/tooltip'
import KeybindsProvider from '@renderer/providers/KeybindsProvider'
import { routerPaths } from '@renderer/router/routerPaths'
import { useSessionStore } from '@renderer/stores/sessionStore'
import { FC, PropsWithChildren, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export const EditorLayout: FC<PropsWithChildren> = ({ children }) => {
  const navigate = useNavigate()
  const { currentSession } = useSessionStore()

  useEffect(() => {
    if (!currentSession) {
      navigate(routerPaths.projectSelect, { replace: true })
    }
  }, [currentSession])

  return (
    <section className="flex flex-col w-full h-full">
      <TitleBar />
      <TooltipProvider>
        <KeybindsProvider>{children}</KeybindsProvider>
      </TooltipProvider>
    </section>
  )
}
