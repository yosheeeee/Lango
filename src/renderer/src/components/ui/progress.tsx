import { cn } from '@renderer/utils/cn'
import { ComponentProps, FC } from 'react'

type ProgressProps = ComponentProps<'div'> & {
  /** Значение от 0 до 100. */
  value: number
  /** Цвет полосы — подбирается по значению, если не задан. */
  color?: 'auto' | 'green' | 'amber' | 'red' | 'cyan'
}

function resolveColor(value: number): 'green' | 'amber' | 'red' {
  if (value >= 90) return 'green'
  if (value >= 50) return 'amber'
  return 'red'
}

const colorMap: Record<'green' | 'amber' | 'red' | 'cyan', string> = {
  green: 'bg-green-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  cyan: 'bg-cyan-500'
}

export const Progress: FC<ProgressProps> = ({ value, color = 'auto', className, ...props }) => {
  const clamped = Math.max(0, Math.min(100, value))
  const resolved = color === 'auto' ? resolveColor(clamped) : color
  return (
    <div
      {...props}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className={cn('w-full h-2 rounded-full bg-gray-800 overflow-hidden', className)}
    >
      <div
        className={cn('h-full transition-[width] duration-300', colorMap[resolved])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
