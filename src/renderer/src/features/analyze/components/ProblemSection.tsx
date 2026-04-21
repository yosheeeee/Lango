import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@renderer/components/ui/collapsible'
import { Input } from '@renderer/components/form'
import LocaleIcon from '@renderer/components/project/LocaleIcon'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown'
import { cn } from '@renderer/utils/cn'
import { ChevronDown, Filter, LucideIcon, Search } from 'lucide-react'
import { ComponentProps, FC, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

type ProblemSectionProps = {
  title: string
  icon: LucideIcon
  tone?: 'orange' | 'red' | 'amber' | 'cyan'
  count: number
  totalCount: number
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (v: string) => void
  locales: string[]
  localeFilter: string | null
  onLocaleFilterChange: (locale: string | null) => void
  actions?: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  emptyText?: string
}

const toneMap = {
  orange: 'text-orange-300',
  red: 'text-red-300',
  amber: 'text-amber-300',
  cyan: 'text-cyan-300'
} as const

export const ProblemSection: FC<ProblemSectionProps> = ({
  title,
  icon: Icon,
  tone = 'orange',
  count,
  totalCount,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  locales,
  localeFilter,
  onLocaleFilterChange,
  actions,
  children,
  defaultOpen = false,
  emptyText
}) => {
  const { t } = useTranslation('analyze', { keyPrefix: 'section' })
  const isEmpty = totalCount === 0
  const placeholder = searchPlaceholder ?? t('searchPlaceholder')
  const emptyLabel = emptyText ?? t('emptyDefault')

  return (
    <Collapsible
      defaultOpen={defaultOpen && totalCount > 0}
      className="rounded-md border border-gray-700 bg-gray-900/40 group"
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2 cursor-pointer">
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-2 flex-1 select-none">
            <ChevronDown className="size-4 transition-transform group-data-[state=closed]:-rotate-90 text-gray-400" />
            <Icon className={cn('size-4', toneMap[tone])} />
            <h4 className="font-medium">{title}</h4>
            <span
              className={cn(
                'text-xs px-1.5 py-0.5 rounded-md tabular-nums',
                tone === 'orange' && 'bg-orange-950/60 text-orange-300',
                tone === 'red' && 'bg-red-950/60 text-red-300',
                tone === 'amber' && 'bg-amber-950/60 text-amber-300',
                tone === 'cyan' && 'bg-cyan-950/60 text-cyan-300'
              )}
            >
              {totalCount}
            </span>
            {count !== totalCount && (
              <span className="text-[11px] text-gray-500">
                {t('showing', { shown: count, total: totalCount })}
              </span>
            )}
          </div>
        </CollapsibleTrigger>
        {actions && (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {actions}
          </div>
        )}
      </div>

      <CollapsibleContent className="border-t border-t-gray-700">
        {isEmpty ? (
          <div className="p-6 text-center text-sm text-gray-500">{emptyLabel}</div>
        ) : (
          <>
            <div className="flex items-center gap-2 px-3 py-2 border-b border-b-gray-800">
              <div className="flex items-center flex-1 gap-1.5 relative">
                <Search className="size-3.5 absolute left-2 text-gray-500 pointer-events-none" />
                <Input
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={placeholder}
                  className="pl-7 h-8 text-xs"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-800 hover:bg-gray-700 cursor-pointer text-xs">
                    <Filter className="size-3.5" />
                    {localeFilter ? (
                      <>
                        <LocaleIcon locale={localeFilter} className="size-3.5" />
                        <span>{localeFilter}</span>
                      </>
                    ) : (
                      <span>{t('allLocales')}</span>
                    )}
                    <ChevronDown className="size-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onLocaleFilterChange(null)}>
                    {t('allLocales')}
                  </DropdownMenuItem>
                  {locales.map((l) => (
                    <DropdownMenuItem
                      key={l}
                      onClick={() => onLocaleFilterChange(l)}
                      className="flex items-center gap-2"
                    >
                      <LocaleIcon locale={l} className="size-4" />
                      {l}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col divide-y divide-gray-800">{children}</div>
          </>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}

export const SectionRowList: FC<ComponentProps<'div'>> = ({ className, ...props }) => (
  <div {...props} className={cn('max-h-[420px] overflow-y-auto', className)} />
)
