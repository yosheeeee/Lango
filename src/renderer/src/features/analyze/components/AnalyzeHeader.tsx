import { Button } from '@renderer/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown'
import LocaleIcon from '@renderer/components/project/LocaleIcon'
import { routerPaths } from '@renderer/router/routerPaths'
import { useAnalyticsStore } from '@renderer/stores/analyticsStore'
import { useLocalizationStore } from '@renderer/stores/localizationStore'
import { ChevronDown, RefreshCw, Sparkles, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function AnalyzeHeader() {
  const { sourceLocale, setSourceLocale, fetchAnalytics, isLoading } = useAnalyticsStore()
  const { locales } = useLocalizationStore()
  const { t } = useTranslation('analyze')

  return (
    <header
      id="analyze-header"
      className="py-1 px-3 flex items-center text-sm justify-between border-b border-b-gray-700 [&_svg]:size-4"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="text-cyan-300" />
        <p className="font-medium">{t('title')}</p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">{t('sourceLocale')}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-800 hover:bg-gray-700 cursor-pointer text-xs">
              {sourceLocale ? (
                <>
                  <LocaleIcon locale={sourceLocale} className="size-3.5" />
                  <span>{sourceLocale}</span>
                </>
              ) : (
                <span className="text-gray-400">{t('notSet')}</span>
              )}
              <ChevronDown className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSourceLocale(null)}>
              <span className="text-gray-400">— {t('none')} —</span>
            </DropdownMenuItem>
            {locales.map((l) => (
              <DropdownMenuItem
                key={l}
                onClick={() => setSourceLocale(l)}
                className="flex items-center gap-2"
              >
                <LocaleIcon locale={l} className="size-4" />
                {l}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="sm"
          onClick={() => fetchAnalytics()}
          disabled={isLoading}
          className="!py-1 !px-2"
        >
          <RefreshCw className={isLoading ? 'animate-spin' : ''} />
          {t('refresh')}
        </Button>

        <Link
          to={routerPaths.editor}
          className="aspect-square size-7 cursor-pointer hover:bg-gray-700 items-center flex justify-center rounded-sm transition-colors"
        >
          <X />
        </Link>
      </div>
    </header>
  )
}
