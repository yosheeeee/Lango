import { ComponentProps, FC } from 'react'
// Импортируем все флаги в объект Flags
import * as Flags from 'country-flag-icons/react/3x2'
import { hasFlag } from 'country-flag-icons'
import { Globe } from 'lucide-react'

// 1. СЛОВАРЬ ИСКЛЮЧЕНИЙ: Код языка (ISO 639-1) -> Код страны (ISO 3166-1)
// Вписываем ТОЛЬКО те языки, код которых НЕ совпадает с кодом их страны.
// (например, 'ru' -> 'RU' или 'fr' -> 'FR' писать не нужно, скрипт поймет это сам)
const languageToCountryMap = {
  en: 'GB', // Английский -> Великобритания (можно поменять на 'US', если больше нравится флаг США)
  uk: 'UA', // Украинский -> Украина (КРИТИЧНО! 'UK' - это Великобритания)
  ja: 'JP', // Японский -> Япония
  ko: 'KR', // Корейский -> Южная Корея
  zh: 'CN', // Китайский -> Китай
  cs: 'CZ', // Чешский -> Чехия
  da: 'DK', // Датский -> Дания
  sv: 'SE', // Шведский -> Швеция
  el: 'GR', // Греческий -> Греция
  he: 'IL', // Иврит -> Израиль
  ar: 'SA', // Арабский -> Саудовская Аравия
  fa: 'IR', // Персидский -> Иран
  vi: 'VN', // Вьетнамский -> Вьетнам
  sr: 'RS', // Сербский -> Сербия
  sl: 'SI', // Словенский -> Словения
  sk: 'SK', // Словацкий -> Словакия
  hi: 'IN', // Хинди -> Индия
  ur: 'PK', // Урду -> Пакистан
  ms: 'MY', // Малайский -> Малайзия
  et: 'EE', // Эстонский -> Эстония
  sq: 'AL', // Албанский -> Албания
  ka: 'GE', // Грузинский -> Грузия
  kk: 'KZ', // Казахский -> Казахстан
  be: 'BY' // Белорусский -> Беларусь
}

// 2. УМНАЯ ФУНКЦИЯ ИЗВЛЕЧЕНИЯ КОДА СТРАНЫ
export const getCountryCodeFromLocale = (localeStr) => {
  if (!localeStr || typeof localeStr !== 'string') return null

  // Нормализуем строку (на случай, если пришло 'ru_RU' вместо 'ru-RU')
  const normalizedLocale = localeStr.replace('_', '-')
  const parts = normalizedLocale.split('-')

  const languageCode = parts[0].toLowerCase()

  // Если локаль содержит регион (например: 'en-US', 'zh-Hant-TW')
  if (parts.length > 1) {
    // Ищем сегмент из 2-х латинских букв (это и есть код страны)
    // Начинаем искать со второго элемента, пропуская язык
    const regionPart = parts.slice(1).find((part) => part.length === 2 && /^[a-zA-Z]+$/.test(part))

    if (regionPart) {
      return regionPart.toUpperCase() // Для 'zh-Hant-TW' вернет 'TW'
    }
  }

  // Если в локали нет кода страны (например, просто 'en' или 'uk'),
  // ищем в нашем словаре исключений. Если там пусто — просто переводим код языка в верхний регистр.
  const fallbackCountryCode = languageToCountryMap[languageCode] || languageCode.toUpperCase()

  return fallbackCountryCode
}

// 3. ИКОНКА ЛОКАЛИ (КОМПОНЕНТ)
const LocaleIcon: FC<ComponentProps<'svg'> & { locale: string }> = ({ locale, ...props }) => {
  const countryCode = getCountryCodeFromLocale(locale)

  // Проверяем, существует ли такой флаг в библиотеке
  if (countryCode && hasFlag(countryCode)) {
    // Достаем SVG-компонент по ключу
    const FlagComponent = Flags[countryCode]

    return <FlagComponent title={locale} {...props} />
  }

  // FALLBACK: Возвращаем Глобус, если локаль нестандартная
  // (например 'default', 'global', или код для которого нет флага)
  return <Globe {...props} />
}

export default LocaleIcon
