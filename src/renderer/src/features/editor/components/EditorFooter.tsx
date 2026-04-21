import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { routerPaths } from '@renderer/router/routerPaths'
import { useAnalyticsStore } from '@renderer/stores/analyticsStore'
import { useFileTreeStore } from '@renderer/stores/fileTreeStore'
import { useLocalizationStore } from '@renderer/stores/localizationStore'
import { cn } from '@renderer/utils/cn'
import { File, FileWarning, Globe, LockKeyholeOpen, Pen, Sparkles } from 'lucide-react'
import { ComponentProps, FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

export default function EditorFooter() {
  return (
    <section className="border-t border-t-gray-700 py-1 px-3 flex min-h-[34px] gap-5 text-sm select-none">
      <LocalizationGroup />
      <FilesTreeGroup />
      <RightGroup />
    </section>
  )
}

function RightGroup() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { t } = useTranslation('footer', { keyPrefix: 'editorMode' })
  const isAnalyze = pathname.includes('analyze')
  function onChangeRoute() {
    navigate(
      isAnalyze ? routerPaths.editor : [routerPaths.editor, routerPaths.editorAnalyze].join('/')
    )
  }
  return (
    <FooterGroup className="ml-auto justify-self-end">
      <button
        onClick={onChangeRoute}
        className="flex items-center gap-1.5 cursor-pointer py-0.5 px-1.5 rounded-sm bg-cyan-900 hover:bg-cyan-700"
      >
        {isAnalyze ? (
          <>
            <Pen className="size-4" />
            {t('editor')}
          </>
        ) : (
          <>
            <Sparkles className="size-4" />
            {t('analyze')}
          </>
        )}
      </button>
    </FooterGroup>
  )
}

function LocalizationGroup() {
  const { locales } = useLocalizationStore()
  const { t } = useTranslation('footer', { keyPrefix: 'localization' })
  // Если пользователь уже открывал страницу Analyze — analyticsStore содержит
  // данные; покажем точное число. Иначе не триггерим тяжёлый getAnalytics.
  const data = useAnalyticsStore((s) => s.data)
  const missingKeys = data ? data.totals.orphanKeys + data.totals.emptyValues : null

  return (
    <FooterGroup>
      <FooterFileTreeItem text={t('title')} Icon={Globe} count={locales?.length ?? 0} />
      <FooterFileTreeItem
        text={missingKeys === null ? t('missingKeys.unknown') : t('missingKeys.known')}
        Icon={LockKeyholeOpen}
        count={missingKeys ?? '—'}
      />
    </FooterGroup>
  )
}

function FilesTreeGroup() {
  const { totalFiles, orphanFiles } = useFileTreeStore()
  const { t } = useTranslation('footer', { keyPrefix: 'filesTree' })

  return (
    <FooterGroup>
      <FooterFileTreeItem text={t('total')} Icon={File} count={totalFiles} />
      <FooterFileTreeItem text={t('orphans')} Icon={FileWarning} count={orphanFiles} />
    </FooterGroup>
  )
}

const FooterFileTreeItem = ({
  text,
  count,
  Icon
}: {
  text: string
  count: number | string
  Icon: FC
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <div className="flex items-center gap-1 [&>svg]:size-[18px]">
        <Icon />
        {count}
      </div>
    </TooltipTrigger>
    <TooltipContent>
      <p>{text}</p>
    </TooltipContent>
  </Tooltip>
)

const FooterGroup: FC<ComponentProps<'div'>> = ({ className, ...props }) => (
  <div {...props} className={cn('flex items-center gap-3', className)} />
)
