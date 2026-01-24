import { Button } from '@renderer/components/button'
import { Logo } from '@renderer/components/logo'
import { ProjectSelectLayout } from '@renderer/layouts/ProjectSelectLayout'
import { AddNewProjectModal } from '@renderer/modules/addNewProjectModal'
import { LanguageSwitcher } from '@renderer/modules/languageSwitcher'
import { cn } from '@renderer/utils/cn'
import { projectColors } from '@renderer/utils/projectColors'
import { FilePlus2, Trash, Trash2 } from 'lucide-react'
import { ReactNode, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Session } from 'src/domain/models/session'

export default function ProjectSelectPage(): ReactNode {
  const [projects, setProjects] = useState<Session[]>([])
  const { t } = useTranslation('projectSelect')

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

  useEffect(() => {
    fetchSessions()
  }, [])

  return (
    <ProjectSelectLayout className="justify-around">
      <header className="flex px-6 py-6 justify-between">
        <div className="flex items-end gap-0.5">
          <Logo className="h-10 block mb-1" />
          <h2 className="font-semibold text-3xl leading-none">ango</h2>
        </div>
        <LanguageSwitcher />
      </header>
      <main className="flex-1 h-full  flex flex-col items-center justify-center gap-5 w-full max-w-md mx-auto">
        <h1 className="text-4xl">{t('title')}</h1>
        <div className="flex flex-col gap-3 w-full">
          {projects.length ? (
            projects.map((p) => <Project {...p} onDelete={onDeleteSession} key={p.id} />)
          ) : (
            <p className="text-center font-[500]">{t('noProjects')}</p>
          )}
        </div>
        <div className="relative border-t border-t-white w-full">
          <p className="absolute bottom-[50%] left-1/2 translate-y-1/2 -translate-x-1/2 bg-gray-900 px-3 text-lg">
            {t('or')}
          </p>
        </div>
        <AddNewProjectModal onAdded={onAddNewSession}>
          <Button size={'lg'} className="w-full">
            <FilePlus2 />
            {t('addNewProject')}
          </Button>
        </AddNewProjectModal>
      </main>
    </ProjectSelectLayout>
  )
}

function Project({
  id,
  name,
  color,
  path,
  onDelete: onOutherDelete
}: Session & { onDelete: (id: Session['id']) => void }) {
  const colors = projectColors[color]
  async function onDelete() {
    await window.api.session.removeSession(id)
    onOutherDelete(id)
  }
  return (
    <div
      key={id}
      className={cn(
        'flex flex-col gap-1 rounded-lg py-2 px-3 cursor-pointer transition-colors',
        colors?.base,
        colors?.hover
      )}
    >
      <div className="flex justify-between gap-2 flex-wrap items-center">
        <h3 className="text-lg font-semibold">{name}</h3>
        <button
          onClick={onDelete}
          className={cn('cursor-pointer', 'hover:text-red-500 transition-colors')}
        >
          <Trash className="size-4" />
        </button>
      </div>
      <p className="opacity-70 text-sm truncate self-start" style={{ direction: 'rtl' }}>
        {path}
      </p>
    </div>
  )
}
