import { LucideIcon, PartyPopper } from 'lucide-react'
import { FC } from 'react'

type EmptyStateProps = {
  icon?: LucideIcon
  title: string
  description?: string
}

export const EmptyState: FC<EmptyStateProps> = ({
  icon: Icon = PartyPopper,
  title,
  description
}) => (
  <div className="flex flex-col items-center justify-center gap-2 p-10 text-center rounded-md border border-dashed border-gray-700 bg-gray-900/30">
    <Icon className="size-8 text-gray-500" />
    <p className="text-sm font-medium text-gray-200">{title}</p>
    {description && <p className="text-xs text-gray-500 max-w-md">{description}</p>}
  </div>
)
