import { ProjectsProvider } from '@renderer/stores/providers/ProjectsProvider'
import { routerPaths } from '@renderer/router/routerPaths'
import { useSessionStore } from '@renderer/stores/sessionStore'
import { cn } from '@renderer/utils/cn'
import { ComponentProps, FC, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export const ProjectSelectLayout: FC<ComponentProps<'section'>> = ({ className, ...props }) => {
  const navigate = useNavigate()
  const { currentSession } = useSessionStore()

  useEffect(() => {
    if (currentSession) {
      navigate(routerPaths.editor, { replace: true })
    }
  }, [currentSession])

  return (
    <ProjectsProvider>
      <section
        className={cn('flex flex-col  gap-5 h-full w-full justify-around', className)}
        {...props}
      />
    </ProjectsProvider>
  )
}
