import { FileJson2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function DetailEmpty() {
  const { t } = useTranslation('editor', { keyPrefix: 'detailEmpty' })

  return (
    <div className="flex-1 flex flex-col h-full items-center justify-center gap-4 text-gray-400">
      <FileJson2 className="size-16" />
      <p className="text-lg">{t('title')}</p>
      <p className="text-sm">{t('description')}</p>
    </div>
  )
}
