import LocaleIcon from '@renderer/components/project/LocaleIcon'
import { routerPaths } from '@renderer/router/routerPaths'
import { Copy } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { DuplicateValueEntry } from 'src/domain/models/analytics'
import { ProblemRow } from './ProblemRow'
import { ProblemSection, SectionRowList } from './ProblemSection'
import { useSectionState } from '../hooks/useSectionState'
import { useTranslation } from 'react-i18next'

type Props = {
  items: DuplicateValueEntry[]
  locales: string[]
}

export default function DuplicatesSection({ items, locales }: Props) {
  const { search, setSearch, localeFilter, setLocaleFilter } = useSectionState()
  const navigate = useNavigate()
  const { t } = useTranslation('analyze', { keyPrefix: 'duplicates' })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((d) => {
      if (q) {
        const hay =
          `${d.value} ${d.occurrences.map((o) => o.namespace + o.key).join(' ')}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (localeFilter && d.locale !== localeFilter) return false
      return true
    })
  }, [items, search, localeFilter])

  return (
    <ProblemSection
      title={t('title')}
      icon={Copy}
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
        {filtered.map((d, idx) => (
          <div
            key={`${d.locale}::${idx}::${d.value}`}
            className="px-3 py-2 hover:bg-gray-800/40 transition-colors flex flex-col gap-2"
          >
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <LocaleIcon locale={d.locale} className="size-3.5" />
                <span>{d.locale}</span>
              </div>
              <span className="text-gray-600">·</span>
              <span className="font-mono text-amber-200 truncate">&quot;{d.value}&quot;</span>
              <span className="ml-auto text-[11px] text-gray-500">
                {t('occurrences', { count: d.occurrences.length })}
              </span>
            </div>
            <div className="flex flex-col gap-1 pl-4 border-l border-l-gray-800">
              {d.occurrences.map((o) => (
                <ProblemRow
                  key={`${o.namespace}::${o.key}`}
                  namespace={o.namespace}
                  keyPath={o.key}
                  onNavigate={() =>
                    navigate(
                      `${routerPaths.editor}/ns/${o.namespace}?key=${encodeURIComponent(o.key)}`
                    )
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </SectionRowList>
    </ProblemSection>
  )
}
