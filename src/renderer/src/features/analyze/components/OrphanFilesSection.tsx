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
        await window.api.project.fixOrphanNamespace(f.namespace)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <ProblemSection
        title="Orphan files"
        icon={FileWarning}
        tone="orange"
        count={filtered.length}
        totalCount={items.length}
        searchValue={search}
        onSearchChange={setSearch}
        locales={locales}
        localeFilter={localeFilter}
        onLocaleFilterChange={setLocaleFilter}
        emptyText="All files exist in every locale."
        actions={
          items.length > 0 ? (
            <Button size="sm" onClick={() => setBulkConfirm(true)} disabled={busy}>
              <Wrench /> Fix all
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
                    <TooltipContent side="top">Fix (add missing files)</TooltipContent>
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
        title="Fix all orphan files"
        description={
          <>
            This will create missing files for <b>{items.length}</b> namespaces in every locale that
            lacks them. Keys will be copied with empty values.
          </>
        }
        confirmLabel="Fix all"
        onConfirm={fixAll}
        onCancel={() => setBulkConfirm(false)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete namespace"
        description={
          <>
            Delete <span className="font-mono">{deleteTarget}</span> from all locales? This cannot
            be undone.
          </>
        }
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteTarget && deleteOne(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
