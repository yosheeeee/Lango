import { routerPaths } from '@renderer/router/routerPaths'
import { Hash } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { EmptyValueEntry } from 'src/domain/models/analytics'
import { ProblemRow } from './ProblemRow'
import { ProblemSection, SectionRowList } from './ProblemSection'
import { useSectionState } from '../hooks/useSectionState'

type Props = {
  items: EmptyValueEntry[]
  locales: string[]
}

export default function EmptyValuesSection({ items, locales }: Props) {
  const { search, setSearch, localeFilter, setLocaleFilter } = useSectionState()
  const navigate = useNavigate()

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
      title="Empty values"
      icon={Hash}
      tone="amber"
      count={filtered.length}
      totalCount={items.length}
      searchValue={search}
      onSearchChange={setSearch}
      locales={locales}
      localeFilter={localeFilter}
      onLocaleFilterChange={setLocaleFilter}
      emptyText="No empty values found."
    >
      <SectionRowList>
        {filtered.map((e) => (
          <ProblemRow
            key={`${e.namespace}::${e.key}`}
            namespace={e.namespace}
            keyPath={e.key}
            highlightedLocales={e.emptyLocales}
            highlightTone="amber"
            subtitle={<>empty in {e.emptyLocales.length} locale(s)</>}
            onNavigate={() =>
              navigate(`${routerPaths.editor}/${e.namespace}?key=${encodeURIComponent(e.key)}`)
            }
          />
        ))}
      </SectionRowList>
    </ProblemSection>
  )
}
