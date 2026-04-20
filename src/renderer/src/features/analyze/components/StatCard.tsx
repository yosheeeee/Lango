import { cn } from '@renderer/utils/cn'
import { LucideIcon } from 'lucide-react'
import { FC } from 'react'

type Tone = 'gray' | 'orange' | 'red' | 'cyan' | 'green' | 'amber'

type StatCardProps = {
  title: string
  value: number | string
  icon: LucideIcon
  tone?: Tone
  hint?: string
}

const toneMap: Record<Tone, string> = {
  gray: 'text-gray-300',
  orange: 'text-orange-300',
  red: 'text-red-300',
  cyan: 'text-cyan-300',
  green: 'text-green-300',
  amber: 'text-amber-300'
}

export const StatCard: FC<StatCardProps> = ({ title, value, icon: Icon, tone = 'gray', hint }) => (
  <div className="flex flex-col gap-2 p-3 rounded-md border border-gray-700 bg-gray-800/40">
    <div className="flex items-center justify-between">
      <p className="text-xs text-gray-400 uppercase tracking-wide">{title}</p>
      <Icon className={cn('size-4', toneMap[tone])} />
    </div>
    <p className={cn('text-2xl font-semibold tabular-nums', toneMap[tone])}>{value}</p>
    {hint && <p className="text-[11px] text-gray-500">{hint}</p>}
  </div>
)
