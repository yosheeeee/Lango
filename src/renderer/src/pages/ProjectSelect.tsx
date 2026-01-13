import { Button } from '@renderer/components/button'
import { Logo } from '@renderer/components/logo'
import { ProjectSelectLayout } from '@renderer/layouts/ProjectSelectLayout'
import { AddNewProjectModal } from '@renderer/modules/addNewProjectModal'
import { FilePlus2 } from 'lucide-react'
import { ReactNode } from 'react'

export default function ProjectSelectPage(): ReactNode {
  return (
    <ProjectSelectLayout className="justify-around">
      <header className="flex px-6 py-6">
        <div className="flex items-end gap-0.5">
          <Logo className="h-10 block mb-1" />
          <h2 className="font-semibold text-3xl leading-none">ango</h2>
        </div>
      </header>
      <main className="flex-1 h-full  flex flex-col items-center justify-center gap-5 w-full max-w-md mx-auto">
        <h1 className="text-4xl">Select a Project</h1>
        <div className="flex flex-col gap-3 w-full">
          <div className="flex flex-col gap-1 bg-amber-950 rounded-lg py-2 px-3 cursor-pointer transition-colors hover:bg-amber-900">
            <h3 className="text-lg font-semibold">Test project</h3>
            <p className="opacity-70 text-sm truncate" style={{ direction: 'rtl' }}>
              /home/yoshee/my/Lango/src/renderer/src/pages/ProjectSelect.tsx
            </p>
          </div>
        </div>
        <div className="relative border-t border-t-white w-full">
          <p className="absolute bottom-[50%] left-1/2 translate-y-1/2 -translate-x-1/2 bg-gray-900 px-3 text-lg">
            or
          </p>
        </div>
        <AddNewProjectModal>
          <Button size={'lg'} className="w-full">
            <FilePlus2 />
            Add new project
          </Button>
        </AddNewProjectModal>
      </main>
    </ProjectSelectLayout>
  )
}
