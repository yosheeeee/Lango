import { useSessionStore } from '@renderer/stores/sessionStore'
import { useState, useEffect, createContext, useContext, FC, PropsWithChildren } from 'react'
import { Session } from 'src/domain/models/session'

const projectsContext = createContext<ReturnType<typeof useProjectsContext>>()

function useProjectsContext() {
  const { setSession } = useSessionStore()
  const [projects, setProjects] = useState<Session[]>([])

  async function fetchSessions() {
    const sessions = await window.api.session.getSessions()
    setProjects(sessions)
  }

  function onAddNewSession(newSession: Session) {
    setProjects((prev) => [newSession, ...prev])
  }

  function onDeleteSession(id: Session['id']) {
    setProjects((prev) => prev.filter((s) => s.id != id))
  }

  async function selectSession(s: Session) {
    await window.api.session.setCurrentSession(s.id)
    setSession(s)
    console.log('session selected')
  }

  useEffect(() => {
    fetchSessions()
  }, [])

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
  return context
}

export function useProject(project: Session) {
  const { onDeleteSession, selectSession } = useContext(projectsContext)

  const onDeleteProject = async () => {
    await window.api.session.removeSession(project.id)
    onDeleteSession(project.id)
  }

  const onSelectProject = () => selectSession(project)

  return {
    onDeleteProject,
    onSelectProject
  }
}

export const ProjectsProvider: FC<PropsWithChildren> = ({ children }) => {
  const data = useProjectsContext()
  return <projectsContext.Provider value={data}>{children}</projectsContext.Provider>
}
