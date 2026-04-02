import { useSessionStore } from '@renderer/stores/sessionStore'
import {
  useState,
  useEffect,
  createContext,
  useContext,
  FC,
  PropsWithChildren,
  useCallback
} from 'react'
import { Session } from 'src/domain/models/session'

const projectsContext = createContext<ReturnType<typeof useProjectsContext> | null>(null)

function useProjectsContext() {
  const { setSession, sessions: projects, setSessions: setProjects } = useSessionStore()

  const fetchSessions = useCallback(async (): Promise<void> => {
    const sessions = await window.api.session.getSessions()
    setProjects(sessions)
  }, [])

  const onAddNewSession = useCallback((newSession: Session): void => {
    setProjects((prev) => [newSession, ...prev])
  }, [])

  const onDeleteSession = useCallback((id: Session['id']): void => {
    setProjects((prev) => prev.filter((s) => s.id != id))
  }, [])

  const selectSession = useCallback(
    async (s: Session): Promise<void> => {
      await window.api.session.setCurrentSession(s.id)
      setSession(s)
      console.log('session selected')
    },
    [setSession]
  )

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  return {
    projects,
    selectSession,
    onDeleteSession,
    onAddNewSession,
    fetchSessions
  }
}

export function useProjects() {
  const context = useContext(projectsContext)
  if (!context) {
    throw new Error('useProjects must be used within a ProjectsProvider')
  }
  return context
}

export function useProject(project: Session) {
  const context = useContext(projectsContext)
  if (!context) {
    throw new Error('useProject must be used within a ProjectsProvider')
  }
  const { onDeleteSession, selectSession } = context

  const onDeleteProject = async (): Promise<void> => {
    await window.api.session.removeSession(project.id)
    onDeleteSession(project.id)
  }

  const onSelectProject = async (): Promise<void> => selectSession(project)

  return {
    onDeleteProject,
    onSelectProject
  }
}

export const ProjectsProvider: FC<PropsWithChildren> = ({ children }) => {
  const data = useProjectsContext()
  return <projectsContext.Provider value={data}>{children}</projectsContext.Provider>
}
