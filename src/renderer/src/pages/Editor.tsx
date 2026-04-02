import DetailLayout from '@renderer/layouts/DetailLayout'
import { EditorLayout } from '@renderer/layouts/EditorLayout'
import MasterLayout from '@renderer/layouts/MasterLayout'
import EditorFooter from '@renderer/modules/editor/editorFooter'
import { EditorHeader } from '@renderer/modules/editor/editorHeader'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

export default function EditorPage(): ReactNode {
  const { t } = useTranslation('editor')
  return (
    <EditorLayout>
      <EditorHeader />
      <section id="main-editor" className="flex-1">
        <MasterLayout />
        <DetailLayout />
      </section>
      <EditorFooter />
    </EditorLayout>
  )
}
