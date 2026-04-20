import { ProjectAnalyticsTotals } from 'src/domain/models/analytics'
import {
  Copy,
  FileWarning,
  FolderTree,
  Globe,
  Hash,
  KeyRound,
  Languages,
  Layers
} from 'lucide-react'
import { StatCard } from './StatCard'

type StatsCardsProps = {
  totals?: ProjectAnalyticsTotals
}

export default function StatsCards({ totals }: StatsCardsProps) {
  const t = totals ?? {
    locales: 0,
    namespaces: 0,
    uniqueKeys: 0,
    totalKeyInstances: 0,
    orphanFiles: 0,
    orphanKeys: 0,
    emptyValues: 0,
    duplicateGroups: 0,
    untranslatedKeys: 0
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <StatCard title="Locales" value={t.locales} icon={Globe} tone="cyan" />
      <StatCard title="Namespaces" value={t.namespaces} icon={FolderTree} tone="cyan" />
      <StatCard
        title="Unique keys"
        value={t.uniqueKeys.toLocaleString()}
        icon={KeyRound}
        tone="cyan"
        hint={`${t.totalKeyInstances.toLocaleString()} total instances`}
      />
      <StatCard title="Orphan files" value={t.orphanFiles} icon={FileWarning} tone="orange" />
      <StatCard title="Orphan keys" value={t.orphanKeys} icon={Layers} tone="orange" />
      <StatCard title="Empty values" value={t.emptyValues} icon={Hash} tone="amber" />
      <StatCard title="Duplicate groups" value={t.duplicateGroups} icon={Copy} tone="amber" />
      <StatCard title="Untranslated" value={t.untranslatedKeys} icon={Languages} tone="red" />
    </div>
  )
}
