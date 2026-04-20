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
    navigate(`${routerPaths.editor}/${e.namespace}?key=${encodeURIComponent(e.key)}`)
  }

  return (
    <>
      <ProblemSection
        title="Orphan keys"
        icon={Layers}
        tone="orange"
        count={filtered.length}
        totalCount={items.length}
        searchValue={search}
        onSearchChange={setSearch}
        locales={locales}
        localeFilter={localeFilter}
        onLocaleFilterChange={setLocaleFilter}
        emptyText="Every key exists in every locale."
        actions={
          items.length > 0 ? (
            <Button size="sm" onClick={() => setBulkConfirm(true)} disabled={busy}>
              <Wrench /> Fix all
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
                    <TooltipContent side="top">Fix (add to missing locales)</TooltipContent>
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
                    <TooltipContent side="top">Delete from all locales</TooltipContent>
                  </Tooltip>
                </>
              }
            />
          ))}
        </SectionRowList>
      </ProblemSection>

      <ConfirmDialog
        open={bulkConfirm}
        title="Fix all orphan keys"
        description={
          <>
            This will add <b>{items.length}</b> missing keys (with empty values) across all locales.
          </>
        }
        confirmLabel="Fix all"
        onConfirm={fixAll}
        onCancel={() => setBulkConfirm(false)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete key"
        description={
          deleteTarget && (
            <>
              Delete <span className="font-mono">{deleteTarget.key}</span> from{' '}
              <span className="font-mono">{deleteTarget.namespace}</span> in all locales? This
              cannot be undone.
            </>
          )
        }
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteTarget && deleteOne(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
