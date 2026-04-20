import { routerPaths } from '@renderer/router/routerPaths'
import { Languages } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { UntranslatedEntry } from 'src/domain/models/analytics'
import { ProblemRow } from './ProblemRow'
import { ProblemSection, SectionRowList } from './ProblemSection'
import { useSectionState } from '../hooks/useSectionState'

type Props = {
  items: UntranslatedEntry[]
  locales: string[]
  sourceLocale: string | null
}

export default function UntranslatedSection({ items, locales, sourceLocale }: Props) {
  const { search, setSearch, localeFilter, setLocaleFilter } = useSectionState()
  const navigate = useNavigate()

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((u) => {
      if (q) {
        const hay = `${u.namespace} ${u.key} ${u.value}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (localeFilter && !u.locales.includes(localeFilter)) return false
      return true
    })
  }, [items, search, localeFilter])

  if (!sourceLocale) {
    return (
      <ProblemSection
        title="Untranslated keys"
        icon={Languages}
        tone="red"
        count={0}
        totalCount={0}
        searchValue={search}
        onSearchChange={setSearch}
        locales={locales}
        localeFilter={localeFilter}
        onLocaleFilterChange={setLocaleFilter}
        emptyText="Select a source locale in the header to detect untranslated keys."
      >
        <div />
      </ProblemSection>
    )
  }

  return (
    <ProblemSection
      title={`Untranslated keys (source: ${sourceLocale})`}
      icon={Languages}
      tone="red"
      count={filtered.length}
      totalCount={items.length}
      searchValue={search}
      onSearchChange={setSearch}
      locales={locales.filter((l) => l !== sourceLocale)}
      localeFilter={localeFilter}
      onLocaleFilterChange={setLocaleFilter}
      emptyText="All keys are translated."
    >
      <SectionRowList>
        {filtered.map((u) => (
          <ProblemRow
            key={`${u.namespace}::${u.key}`}
            namespace={u.namespace}
            keyPath={u.key}
            highlightedLocales={u.locales}
            highlightTone="red"
            subtitle={<span className="font-mono truncate">= &quot;{u.value}&quot;</span>}
            onNavigate={() =>
              navigate(`${routerPaths.editor}/${u.namespace}?key=${encodeURIComponent(u.key)}`)
            }
          />
        ))}
      </SectionRowList>
    </ProblemSection>
  )
}
