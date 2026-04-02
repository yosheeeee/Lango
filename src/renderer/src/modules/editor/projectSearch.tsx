import { Input } from '@renderer/components/form'
import { Search } from 'lucide-react'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

export const ProjectSearch: FC = () => {
  const { t } = useTranslation('projectSearch')
  return (
    <div className="relative">
      <Input
        placeholder={t('searchPlaceholder')}
        className="pl-10 py-1 h-6.25 !text-sm placeholder:text-center"
      />
      <Search className="size-4 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
    </div>
  )
}
