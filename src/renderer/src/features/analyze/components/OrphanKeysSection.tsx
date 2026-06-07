import { Button } from '@renderer/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { routerPaths } from '@renderer/router/routerPaths'
import { Layers, Trash, Wrench } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OrphanKeyEntry } from 'src/domain/models/analytics'
import { ConfirmDialog } from './ConfirmDialog'
import { ProblemRow } from './ProblemRow'
import { ProblemSection, SectionRowList } from './ProblemSection'
import { useSectionState } from '../hooks/useSectionState'
import { Trans, useTranslation } from 'react-i18next'

type Props = {
  items: OrphanKeyEntry[]
  locales: string[]
}

export default function OrphanKeysSection({ items, locales }: Props) {
  const { search, setSearch, localeFilter, setLocaleFilter } = useSectionState()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [bulkConfirm, setBulkConfirm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<OrphanKeyEntry | null>(null)
  const { t } = useTranslation('analyze', { keyPrefix: 'orphanKeys' })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((k) => {
      if (q) {
        const hay = `${k.namespace} ${k.key}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (localeFilter) {
        if (!k.missingLocales.includes(localeFilter) && !k.presentLocales.includes(localeFilter))
          return false
      }
      return true
    })
  }, [items, search, localeFilter])

  // Мутации триггерят file-tree:changed, который через analyticsStore приводит
  // к debounced-refetch — дополнительные ручные fetchAnalytics не нужны.
  async function fixOne(e: OrphanKeyEntry) {
    setBusy(true)
    try {
      await window.api.project.fixOrphanKey(e.namespace, e.key)
    } finally {
      setBusy(false)
    }
  }

  async function deleteOne(e: OrphanKeyEntry) {
    setBusy(true)
    try {
      await window.api.project.deleteLocalizationKey(e.namespace, e.key)
    } finally {
      setBusy(false)
      setDeleteTarget(null)
    }
  }

  async function fixAll() {
    setBulkConfirm(false)
    setBusy(true)
    try {
      for (const k of items) {
        await window.api.project.fixOrphanKey(k.namespace, k.key)
      }
    } finally {
      setBusy(false)
    }
  }

  function openInEditor(e: OrphanKeyEntry) {
    navigate(`${routerPaths.editor}/ns/${e.namespace}?key=${encodeURIComponent(e.key)}`)
  }

  return (
    <>
      <ProblemSection
        title={t('title')}
        icon={Layers}
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
          {filtered.map((k) => (
            <ProblemRow
              key={`${k.namespace}::${k.key}`}
              namespace={k.namespace}
              keyPath={k.key}
              presentLocales={k.presentLocales}
              missingLocales={k.missingLocales}
              onNavigate={() => openInEditor(k)}
              rightActions={
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => fixOne(k)}
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
                        onClick={() => setDeleteTarget(k)}
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
            i18nKey="orphanKeys.fixDescription"
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
          deleteTarget && (
            <Trans
              i18nKey="orphanKeys.deleteDescription"
              ns="analyze"
              values={{ key: deleteTarget.key, namespace: deleteTarget.namespace }}
              components={{
                k: <span className="font-mono" />,
                ns: <span className="font-mono" />
              }}
            />
          )
        }
        confirmLabel={t('confirmDelete')}
        destructive
        onConfirm={() => deleteTarget && deleteOne(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
