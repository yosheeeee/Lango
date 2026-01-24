import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@renderer/components/dropdown'
import { cn } from '@renderer/utils/cn'
import { ComponentProps, FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Language } from 'src/domain/models/currentLanguage'

const languageTitles: Record<Language, string> = {
  en: 'ENG',
  ru: 'РУС'
}

export const LanguageSwitcher: FC = () => {
  const { i18n } = useTranslation()
  const [currentLanguage, setCurrentLanguage] = useState<Language>(window.currentLanguage || 'ru')

  async function onSelectLanguage(lang: Language): Promise<void> {
    try {
      await window.api.currentLanguage.setCurrentLanguage(lang)
      i18n.changeLanguage(lang)
      setCurrentLanguage(lang)
    } catch (error) {
      console.error('Error setting language:', error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <LanguageComponent language={currentLanguage} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {Object.keys(languageTitles).map((key) => {
          const lang = key as Language
          return (
            <DropdownMenuItem asChild onClick={async () => await onSelectLanguage(lang)} key={key}>
              <LanguageComponent language={lang} />
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
      {flag && <img src={flag} className="h-[18px]" />}
      <span className="text-lg">{languageTitles[language]}</span>
    </div>
  )
}
