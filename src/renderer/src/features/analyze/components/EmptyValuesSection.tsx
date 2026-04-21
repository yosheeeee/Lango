import { routerPaths } from '@renderer/router/routerPaths'
import { Hash } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { EmptyValueEntry } from 'src/domain/models/analytics'
import { ProblemRow } from './ProblemRow'
import { ProblemSection, SectionRowList } from './ProblemSection'
import { useSectionState } from '../hooks/useSectionState'
import { useTranslation } from 'react-i18next'

type Props = {
  items: EmptyValueEntry[]
  locales: string[]
}

export default function EmptyValuesSection({ items, locales }: Props) {
  const { search, setSearch, localeFilter, setLocaleFilter } = useSectionState()
  const navigate = useNavigate()
  const { t } = useTranslation('analyze', { keyPrefix: 'emptyValues' })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((e) => {
      if (q) {
        const hay = `${e.namespace} ${e.key}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (localeFilter && !e.emptyLocales.includes(localeFilter)) return false
      return true
    })
  }, [items, search, localeFilter])

  return (
    <ProblemSection
      title={t('title')}
      icon={Hash}
      tone="amber"
      count={filtered.length}
      totalCount={items.length}
      searchValue={search}
      onSearchChange={setSearch}
      locales={locales}
      localeFilter={localeFilter}
      onLocaleFilterChange={setLocaleFilter}
      emptyText={t('empty')}
    >
      <SectionRowList>
        {filtered.map((e) => (
          <ProblemRow
            key={`${e.namespace}::${e.key}`}
            namespace={e.namespace}
            keyPath={e.key}
            highlightedLocales={e.emptyLocales}
            highlightTone="amber"
            subtitle={<>{t('subtitle', { count: e.emptyLocales.length })}</>}
            onNavigate={() =>
              navigate(`${routerPaths.editor}/${e.namespace}?key=${encodeURIComponent(e.key)}`)
            }
          />
        ))}
      </SectionRowList>
    </ProblemSection>
  )
}
