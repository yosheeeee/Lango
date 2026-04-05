import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@renderer/components/resizable'
import ProjectTree from '@renderer/modules/editor/projectTree'
import { useEditorStore } from '@renderer/stores/visibilityStore'
import { cn } from '@renderer/utils/cn'
import { FC } from 'react'

interface MasterLayoutProps {}

const MasterLayout: FC<MasterLayoutProps> = () => {
  const { masterPanel } = useEditorStore()
  const hiddenClassName = cn({ hidden: !masterPanel })

  return (
    <>
      <ResizablePanel className={hiddenClassName} minSize={'100px'} defaultSize={'30%'}>
        <ResizablePanelGroup orientation="vertical">
          <ResizablePanel defaultSize={'70%'} minSize={'100px'}>
            <ProjectTree />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={'30%'} minSize={'100px'}>
            <p>Localizations</p>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle className={hiddenClassName} />
    </>
  )
}

export default MasterLayout
