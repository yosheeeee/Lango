import { useState } from 'react'

export type SectionState = {
  search: string
  setSearch: (v: string) => void
  localeFilter: string | null
  setLocaleFilter: (l: string | null) => void
}

export function useSectionState(): SectionState {
  const [search, setSearch] = useState('')
  const [localeFilter, setLocaleFilter] = useState<string | null>(null)
  return { search, setSearch, localeFilter, setLocaleFilter }
}
