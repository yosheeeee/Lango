import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown'
import { useLocalizationStore } from '@renderer/stores/localizationStore'
import { ChevronDown, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@renderer/components/ui/button'

export default function LocaleEditorHeader() {
  const { locales, currentLocale, setCurrentLocale } = useLocalizationStore()
  const { t } = useTranslation('master')

  return (
    <section className="py-1 px-3 flex items-center justify-between border-b border-b-gray-700">
      <div className="flex items-center gap-2">
        <Globe className="size-4" />
        <p className="text-sm">{t('localizations.title')}</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="gap-1">
            {currentLocale}
            <ChevronDown className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {locales?.map((locale) => (
            <DropdownMenuItem key={locale} onClick={() => setCurrentLocale(locale)}>
              {locale}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </section>
  )
}
