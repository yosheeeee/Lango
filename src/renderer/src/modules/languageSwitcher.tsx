import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@renderer/components/dropdown'
import { cn } from '@renderer/utils/cn'
import { ChevronDown } from 'lucide-react'
import { ComponentProps, FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Language } from 'src/domain/models/currentLanguage'
import { useLanguageStore } from '@renderer/stores/languageStore'

const languageTitles: Record<Language, string> = {
  en: 'ENG',
  ru: 'РУС'
}

export const LanguageSwitcher: FC<
  ComponentProps<'div'> & {
    optionProps?: Omit<ComponentProps<typeof LanguageComponent>, 'language'>
    menuProps?: Omit<ComponentProps<typeof DropdownMenu>, 'children'>
    selectedContainerClassName?: string
  }
> = ({ optionProps, menuProps, className, selectedContainerClassName, ...props }) => {
  const { i18n } = useTranslation()
  const { currentLanguage, setCurrentLanguage } = useLanguageStore()
  const [language, setLanguage] = useState<Language>(currentLanguage || 'ru')

  const onSelectLanguage = async (lang: Language): Promise<void> => {
    try {
      await window.api.currentLanguage.setCurrentLanguage(lang)
      i18n.changeLanguage(lang)
      setCurrentLanguage(lang)
      setLanguage(lang)
    } catch (error) {
      console.error('Error setting language:', error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className={cn('flex gap-2 items-center pr-2', className)} {...props}>
          <LanguageComponent language={language} className={selectedContainerClassName} />
          <ChevronDown className="size-4 group-data-[state=open]:rotate-180 transition-transform" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent {...menuProps}>
        {Object.keys(languageTitles).map((key) => {
          const lang = key as Language
          return (
            <DropdownMenuItem asChild onClick={async () => await onSelectLanguage(lang)} key={key}>
              <LanguageComponent language={lang} {...optionProps} />
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const LanguageComponent: FC<{ language: Language } & ComponentProps<'div'>> = ({
  language,
  ...props
}) => {
  const [flag, setFlag] = useState(null)
  useEffect(() => {
    const loadFlag = async () => {
      setFlag((await import(`@renderer/assets/flags/${language}.svg`)).default)
    }
    loadFlag()
  }, [language])
  return (
    <div {...props} className={cn('flex items-center gap-1', props?.className)}>
      {flag && <img src={flag} className="h-4.5 block" />}
      <span className="select-none leading-none">{languageTitles[language]}</span>
    </div>
  )
}
