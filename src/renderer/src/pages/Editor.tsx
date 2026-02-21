import { EditorLayout } from '@renderer/layouts/EditorLayout'
import { EditorHeader } from '@renderer/modules/editorHeader'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

export default function EditorPage(): ReactNode {
  const { t } = useTranslation('editor')
  return (
    <EditorLayout>
      <EditorHeader />
      {t('welcomeMessage')}
    </EditorLayout>
  )
}
