import { ResizablePanel, ResizablePanelGroup } from '@renderer/components/ui/resizable'
import DetailLayout from '@renderer/layouts/DetailLayout'
import { EditorLayout } from '@renderer/layouts/EditorLayout'
import MasterLayout from '@renderer/layouts/MasterLayout'
import { EditorFooter, EditorHeader } from '@renderer/features/editor'
import { ReactNode, useEffect } from 'react'
import { initializeAnalyticsInvalidation } from '@renderer/stores/analyticsStore'

export default function EditorPage(): ReactNode {
  useEffect(() => {
    const unsubscribe = initializeAnalyticsInvalidation()
    return unsubscribe
  }, [])

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
