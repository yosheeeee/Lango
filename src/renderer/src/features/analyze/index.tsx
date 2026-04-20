import { FileQuestion, Loader2 } from 'lucide-react'
import AnalyzeHeader from './components/AnalyzeHeader'
import DuplicatesSection from './components/DuplicatesSection'
import EmptyValuesSection from './components/EmptyValuesSection'
import { EmptyState } from './components/EmptyState'
import LocaleCoverageTable from './components/LocaleCoverageTable'
import OrphanFilesSection from './components/OrphanFilesSection'
import OrphanKeysSection from './components/OrphanKeysSection'
import StatsCards from './components/StatsCards'
import UntranslatedSection from './components/UntranslatedSection'
import { useAnalytics } from './hooks/useAnalytics'

export default function AnalyzePage() {
  const { data, isLoading, error } = useAnalytics()

  const locales = data?.perLocale.map((p) => p.locale) ?? []
  const hasProject = data !== null
  const singleLocale = data !== null && data.totals.locales === 1

  return (
    <section className="flex-1 h-full overflow-hidden flex flex-col">
      <AnalyzeHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {isLoading && !data && (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-400">
            <Loader2 className="size-4 animate-spin" />
            Analyzing project…
          </div>
        )}

        {!isLoading && !hasProject && (
          <EmptyState
            icon={FileQuestion}
            title="No project data"
            description="Open a project or create locales to see analytics."
          />
        )}

        {error && (
          <div className="p-4 rounded-md border border-red-800 bg-red-950/40 text-sm text-red-300">
            {error}
          </div>
        )}

        {data && (
          <>
            <StatsCards totals={data.totals} />
            <LocaleCoverageTable rows={data.perLocale} sourceLocale={data.sourceLocale} />

            {singleLocale ? (
              <div className="p-3 rounded-md border border-cyan-900 bg-cyan-950/30 text-sm text-cyan-200">
                Only one locale detected — orphan file / key detection is unavailable.
              </div>
            ) : (
              <>
                <OrphanFilesSection items={data.orphanFiles} locales={locales} />
                <OrphanKeysSection items={data.orphanKeys} locales={locales} />
              </>
            )}

            <EmptyValuesSection items={data.emptyValues} locales={locales} />
            <DuplicatesSection items={data.duplicates} locales={locales} />
            <UntranslatedSection
              items={data.untranslated}
              locales={locales}
              sourceLocale={data.sourceLocale}
            />
          </>
        )}
      </div>
    </section>
  )
}
