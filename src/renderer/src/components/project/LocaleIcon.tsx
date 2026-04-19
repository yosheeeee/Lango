import { ComponentProps, FC } from 'react'
import * as Flags from 'country-flag-icons/react/3x2'
import { hasFlag } from 'country-flag-icons'
import { Globe } from 'lucide-react'

const languageToCountryMap = {
  en: 'GB',
  uk: 'UA',
  ja: 'JP',
  ko: 'KR',
  zh: 'CN',
  cs: 'CZ',
  da: 'DK',
  sv: 'SE',
  el: 'GR',
  he: 'IL',
  ar: 'SA',
  fa: 'IR',
  vi: 'VN',
  sr: 'RS',
  sl: 'SI',
  sk: 'SK',
  hi: 'IN',
  ur: 'PK',
  ms: 'MY',
  et: 'EE',
  sq: 'AL',
  ka: 'GE',
  kk: 'KZ',
  be: 'BY'
}

export const getCountryCodeFromLocale = (localeStr) => {
  if (!localeStr || typeof localeStr !== 'string') return null

  const normalizedLocale = localeStr.replace('_', '-')
  const parts = normalizedLocale.split('-')

  const languageCode = parts[0].toLowerCase()

  if (parts.length > 1) {
    const regionPart = parts.slice(1).find((part) => part.length === 2 && /^[a-zA-Z]+$/.test(part))

    if (regionPart) {
      return regionPart.toUpperCase()
    }
  }

  const fallbackCountryCode = languageToCountryMap[languageCode] || languageCode.toUpperCase()

  return fallbackCountryCode
}

const LocaleIcon: FC<ComponentProps<'svg'> & { locale: string }> = ({ locale, ...props }) => {
  const countryCode = getCountryCodeFromLocale(locale)

  if (countryCode && hasFlag(countryCode)) {
    const FlagComponent = Flags[countryCode]

    return <FlagComponent title={locale} {...props} />
  }

  return <Globe {...props} />
}

export default LocaleIcon
