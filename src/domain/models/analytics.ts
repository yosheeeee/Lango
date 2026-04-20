export type LocaleCoverage = {
  locale: string
  /** Всего уникальных ключей в проекте (пересечение всех неймспейсов и локалей). */
  totalKeys: number
  /** Сколько из totalKeys присутствует в этой локали. */
  presentKeys: number
  /** totalKeys - presentKeys. */
  missingKeys: number
  /** Сколько ключей, которые присутствуют, имеют пустое строковое значение. */
  emptyValues: number
  /** Процент переведённых ключей: (presentKeys - emptyValues) / totalKeys * 100. */
  coveragePercent: number
}

export type OrphanFileEntry = {
  /** Относительный путь без расширения, напр. "auth/login". */
  namespace: string
  presentLocales: string[]
  missingLocales: string[]
}

export type OrphanKeyEntry = {
  namespace: string
  /** Точечный путь ключа, напр. "button.submit". */
  key: string
  presentLocales: string[]
  missingLocales: string[]
}

export type EmptyValueEntry = {
  namespace: string
  key: string
  /** Локали, в которых значение — пустая строка. */
  emptyLocales: string[]
}

export type DuplicateValueEntry = {
  locale: string
  value: string
  occurrences: { namespace: string; key: string }[]
}

export type UntranslatedEntry = {
  namespace: string
  key: string
  /** Значение из sourceLocale, которое совпадает с другими локалями. */
  value: string
  /** Локали (≠ sourceLocale), где значение идентично sourceLocale. */
  locales: string[]
}

export type ProjectAnalyticsTotals = {
  locales: number
  namespaces: number
  uniqueKeys: number
  totalKeyInstances: number
  orphanFiles: number
  orphanKeys: number
  emptyValues: number
  duplicateGroups: number
  untranslatedKeys: number
}

export type ProjectAnalytics = {
  totals: ProjectAnalyticsTotals
  perLocale: LocaleCoverage[]
  orphanFiles: OrphanFileEntry[]
  orphanKeys: OrphanKeyEntry[]
  emptyValues: EmptyValueEntry[]
  duplicates: DuplicateValueEntry[]
  untranslated: UntranslatedEntry[]
  sourceLocale: string | null
}
