import { ResizablePanel } from '@renderer/components/resizable'
import { useEditorStore } from '@renderer/stores/visibilityStore'
import { FC } from 'react'

interface MasterLayoutProps {}

const MasterLayout: FC<MasterLayoutProps> = () => {
  const { masterPanel } = useEditorStore()

  if (!masterPanel) return null

  return (
    <ResizablePanel minSize={'100px'} defaultSize={'30%'}>
      <section id="master" className="w-full h-full flex items-center justify-center">
        <p>Master</p>
      </section>
    </ResizablePanel>
  )
}

export default MasterLayout
