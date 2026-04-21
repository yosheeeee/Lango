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
import { useTranslation } from 'react-i18next'

type StatsCardsProps = {
  totals?: ProjectAnalyticsTotals
}

export default function StatsCards({ totals }: StatsCardsProps) {
  const { t } = useTranslation('analyze', { keyPrefix: 'stats' })
  const s = totals ?? {
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
      <StatCard title={t('locales')} value={s.locales} icon={Globe} tone="cyan" />
      <StatCard title={t('namespaces')} value={s.namespaces} icon={FolderTree} tone="cyan" />
      <StatCard
        title={t('uniqueKeys')}
        value={s.uniqueKeys.toLocaleString()}
        icon={KeyRound}
        tone="cyan"
        hint={t('totalInstances', { count: s.totalKeyInstances })}
      />
      <StatCard title={t('orphanFiles')} value={s.orphanFiles} icon={FileWarning} tone="orange" />
      <StatCard title={t('orphanKeys')} value={s.orphanKeys} icon={Layers} tone="orange" />
      <StatCard title={t('emptyValues')} value={s.emptyValues} icon={Hash} tone="amber" />
      <StatCard title={t('duplicateGroups')} value={s.duplicateGroups} icon={Copy} tone="amber" />
      <StatCard title={t('untranslated')} value={s.untranslatedKeys} icon={Languages} tone="red" />
    </div>
  )
}
