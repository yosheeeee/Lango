import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@renderer/components/dropdown'
import { cn } from '@renderer/utils/cn'
import { ChevronDown } from 'lucide-react'
import { ComponentProps, FC } from 'react'
import { useLocalizationStore } from '@renderer/stores/localizationStore'
import LocaleIcon from '@renderer/components/localeIcon'

export const ActiveLocalizationSwitcher: FC<ComponentProps<'div'>> = ({ className, ...props }) => {
  const { locales, currentLocale, setCurrentLocale } = useLocalizationStore()

  const handleSelectLocale = (locale: string) => {
    setCurrentLocale(locale)
  }

  if (!currentLocale || locales.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className={cn('flex gap-2 items-center pr-2 py-1.5!', className)} {...props}>
          <LocaleComponent locale={currentLocale} />
          <ChevronDown className="size-4 group-data-[state=open]:rotate-180 transition-transform" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {locales.map((locale) => (
          <DropdownMenuItem key={locale} onClick={() => handleSelectLocale(locale)}>
            <LocaleComponent locale={locale} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const LocaleComponent: FC<{ locale: string }> = ({ locale }) => {
  return (
    <div className="flex items-center gap-1">
      <LocaleIcon locale={locale} className="size-4" />
      <span className="select-none leading-none">{locale}</span>
    </div>
  )
}
