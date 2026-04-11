import { ResizablePanel, ResizablePanelGroup } from '@renderer/components/resizable'
import DetailLayout from '@renderer/layouts/DetailLayout'
import { EditorLayout } from '@renderer/layouts/EditorLayout'
import MasterLayout from '@renderer/layouts/MasterLayout'
import EditorFooter from '@renderer/modules/editor/editorFooter'
import { EditorHeader } from '@renderer/modules/editor/editorHeader'
import { ReactNode } from 'react'

export default function EditorPage(): ReactNode {
  return (
    <EditorLayout>
      <EditorHeader />
      <ResizablePanelGroup orientation="horizontal" className="flex-1 h-full">
        <MasterLayout />
        <ResizablePanel defaultSize={'75%'}>
          <DetailLayout />
        </ResizablePanel>
      </ResizablePanelGroup>
      <EditorFooter />
    </EditorLayout>
  )
}
