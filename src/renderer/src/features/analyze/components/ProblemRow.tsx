import LocaleIcon from '@renderer/components/project/LocaleIcon'
import { Badge } from '@renderer/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { cn } from '@renderer/utils/cn'
import { ArrowRight } from 'lucide-react'
import { FC, ReactNode } from 'react'

type ProblemRowProps = {
  namespace: string
  keyPath?: string
  presentLocales?: string[]
  missingLocales?: string[]
  highlightedLocales?: string[]
  highlightTone?: 'orange' | 'red' | 'amber' | 'cyan'
  subtitle?: ReactNode
  onNavigate?: () => void
  rightActions?: ReactNode
}

export const ProblemRow: FC<ProblemRowProps> = ({
  namespace,
  keyPath,
  presentLocales,
  missingLocales,
  highlightedLocales,
  highlightTone = 'orange',
  subtitle,
  onNavigate,
  rightActions
}) => {
  return (
    <div className="flex items-center gap-2 px-3 py-2 hover:bg-gray-800/40 transition-colors">
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-mono text-gray-300 truncate">{namespace}</span>
          {keyPath && (
            <>
              <span className="text-gray-600">›</span>
              <span className="font-mono text-gray-200 truncate">{keyPath}</span>
            </>
          )}
        </div>
        {(presentLocales || missingLocales || highlightedLocales || subtitle) && (
          <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
            {presentLocales?.map((l) => (
              <Badge key={`p-${l}`} color="green">
                <LocaleIcon locale={l} className="size-3" />
                {l}
              </Badge>
            ))}
            {missingLocales?.map((l) => (
              <Badge key={`m-${l}`} color="orange">
                <LocaleIcon locale={l} className="size-3" />
                {l}
              </Badge>
            ))}
            {highlightedLocales?.map((l) => (
              <Badge key={`h-${l}`} color={highlightTone}>
                <LocaleIcon locale={l} className="size-3" />
                {l}
              </Badge>
            ))}
            {subtitle && <span className="text-gray-500">{subtitle}</span>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {rightActions}
        {onNavigate && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onNavigate}
                className={cn(
                  'size-7 flex items-center justify-center rounded-md text-gray-400 hover:text-cyan-200 hover:bg-cyan-900/50 cursor-pointer transition-colors'
                )}
              >
                <ArrowRight className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Open</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  )
}
