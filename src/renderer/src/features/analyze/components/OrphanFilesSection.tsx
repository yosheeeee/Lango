import { Button } from '@renderer/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { routerPaths } from '@renderer/router/routerPaths'
import { FileWarning, Trash, Wrench } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OrphanFileEntry } from 'src/domain/models/analytics'
import { ConfirmDialog } from './ConfirmDialog'
import { ProblemRow } from './ProblemRow'
import { ProblemSection, SectionRowList } from './ProblemSection'
import { useSectionState } from '../hooks/useSectionState'
import { Trans, useTranslation } from 'react-i18next'

type Props = {
  items: OrphanFileEntry[]
  locales: string[]
}

export default function OrphanFilesSection({ items, locales }: Props) {
  const { search, setSearch, localeFilter, setLocaleFilter } = useSectionState()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [bulkConfirm, setBulkConfirm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const { t } = useTranslation('analyze', { keyPrefix: 'orphanFiles' })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((f) => {
      if (q && !f.namespace.toLowerCase().includes(q)) return false
      if (localeFilter) {
        const inMissing = f.missingLocales.includes(localeFilter)
        const inPresent = f.presentLocales.includes(localeFilter)
        if (!inMissing && !inPresent) return false
      }
      return true
    })
  }, [items, search, localeFilter])

  // Мутации сами триггерят file-tree:changed, который через analyticsStore
  // приводит к debounced-refetch — дополнительные ручные fetchAnalytics не нужны.
  async function fixOne(namespace: string) {
    setBusy(true)
    try {
      await window.api.project.fixOrphanNamespace(namespace)
    } catch {
      // skip
    } finally {
      setBusy(false)
    }
  }

  async function deleteOne(namespace: string) {
    setBusy(true)
    try {
      await window.api.project.deleteNamespace(namespace)
    } finally {
      setBusy(false)
      setDeleteTarget(null)
    }
  }

  async function fixAll() {
    setBulkConfirm(false)
    setBusy(true)
    try {
      for (const f of items) {
        try {
          await window.api.project.fixOrphanNamespace(f.namespace)
        } catch {
          // skip — namespace may have been deleted since analysis
        }
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <ProblemSection
        title={t('title')}
        icon={FileWarning}
        tone="orange"
        count={filtered.length}
        totalCount={items.length}
        searchValue={search}
        onSearchChange={setSearch}
        locales={locales}
        localeFilter={localeFilter}
        onLocaleFilterChange={setLocaleFilter}
        emptyText={t('empty')}
        actions={
          items.length > 0 ? (
            <Button size="sm" onClick={() => setBulkConfirm(true)} disabled={busy}>
              <Wrench /> {t('fixAll')}
            </Button>
          ) : null
        }
      >
        <SectionRowList>
          {filtered.map((f) => (
            <ProblemRow
              key={f.namespace}
              namespace={f.namespace}
              presentLocales={f.presentLocales}
              missingLocales={f.missingLocales}
              onNavigate={() => navigate(`${routerPaths.editor}/${f.namespace}`)}
              rightActions={
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => fixOne(f.namespace)}
                        disabled={busy}
                        className="size-7 flex items-center justify-center rounded-md text-gray-400 hover:text-orange-200 hover:bg-orange-900/50 cursor-pointer disabled:opacity-50 transition-colors"
                      >
                        <Wrench className="size-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">{t('fix')}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setDeleteTarget(f.namespace)}
                        disabled={busy}
                        className="size-7 flex items-center justify-center rounded-md text-gray-400 hover:text-red-200 hover:bg-red-900/50 cursor-pointer disabled:opacity-50 transition-colors"
                      >
                        <Trash className="size-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">{t('delete')}</TooltipContent>
                  </Tooltip>
                </>
              }
            />
          ))}
        </SectionRowList>
      </ProblemSection>

      <ConfirmDialog
        open={bulkConfirm}
        title={t('fixTitle')}
        description={
          <Trans
            i18nKey="orphanFiles.fixDescription"
            ns="analyze"
            values={{ count: items.length }}
            components={{ b: <b /> }}
          />
        }
        confirmLabel={t('fixAll')}
        onConfirm={fixAll}
        onCancel={() => setBulkConfirm(false)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title={t('deleteTitle')}
        description={
          <Trans
            i18nKey="orphanFiles.deleteDescription"
            ns="analyze"
            values={{ namespace: deleteTarget ?? '' }}
            components={{ ns: <span className="font-mono" /> }}
          />
        }
        confirmLabel={t('confirmDelete')}
        destructive
        onConfirm={() => deleteTarget && deleteOne(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
