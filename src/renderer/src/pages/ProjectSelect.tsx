import { Button } from '@renderer/components/button'
import { InlineLogo } from '@renderer/components/logo'
import { ProjectSelectLayout } from '@renderer/layouts/ProjectSelectLayout'
import { AddNewProjectModal } from '@renderer/modules/addNewProjectModal'
import { LanguageSwitcher } from '@renderer/modules/languageSwitcher'
import { useProject, useProjects } from '@renderer/providers/ProjectsProvider'
import { cn } from '@renderer/utils/cn'
import { projectColors } from '@renderer/utils/projectColors'
import { FilePlus2, Trash } from 'lucide-react'
import { ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'
import { Session } from 'src/domain/models/session'

export default function ProjectSelectPage(): React.JSX.Element {
  return (
    <ProjectSelectLayout className="justify-around">
      <PageContent />
    </ProjectSelectLayout>
  )
}

function PageContent(): React.JSX.Element {
  const { onAddNewSession, projects } = useProjects()
  const { t } = useTranslation('projectSelect')
  return (
    <>
      <header className="flex px-6 py-6 justify-between">
        <InlineLogo className="text-3xl" />
        <LanguageSwitcher />
      </header>
      <main className="flex-1 h-full  flex flex-col items-center justify-center gap-5 w-full max-w-md mx-auto">
        <h1 className="text-4xl">{t('title')}</h1>
        <div className="flex flex-col gap-3 w-full">
          {projects?.length ? (
            projects.map((p) => <Project {...p} key={p.id} />)
          ) : (
            <p className="text-center font-[500]">{t('noProject')}</p>
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
    </>
  )
}

function Project({
  id,
  name,
  color,
  path,
  className,
  ...props
}: Session & Omit<ComponentProps<'div'>, 'id'>) {
  const { onDeleteProject, onSelectProject } = useProject({ id, name, color, path })
  const colors = projectColors[color]

  return (
    <div
      key={id}
      className={cn(
        'flex flex-col gap-1 rounded-lg py-2 px-3 cursor-pointer transition-colors',
        colors?.base,
        colors?.hover,
        className
      )}
      onClick={onSelectProject}
      {...props}
    >
      <div className="flex justify-between gap-2 flex-wrap items-center">
        <h3 className="text-lg font-semibold">{name}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDeleteProject()
          }}
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
