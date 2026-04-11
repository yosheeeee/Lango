import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/tooltip'
import { useFileTreeStore } from '@renderer/stores/fileTreeStore'
import { useLocalizationStore } from '@renderer/stores/localizationStore'
import { cn } from '@renderer/utils/cn'
import { File, FileWarning, Globe, LockKeyholeOpen } from 'lucide-react'
import { ComponentProps, FC } from 'react'
import { useTranslation } from 'react-i18next'

export default function EditorFooter() {
  return (
    <section className="border-t border-t-gray-700 py-1 px-3 flex min-h-[34px] gap-5 text-sm select-none">
      <LocalizationGroup />
      <FilesTreeGroup />
    </section>
  )
}

function LocalizationGroup() {
  const { locales } = useLocalizationStore()
  return (
    <FooterGroup>
      <FooterFileTreeItem text={'Localizations'} Icon={Globe} count={locales?.length ?? 0} />
      <FooterFileTreeItem text={'Missing keys'} Icon={LockKeyholeOpen} count={0} />
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

const FooterFileTreeItem = ({ text, count, Icon }: { text: string; count: number; Icon: FC }) => (
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
  <div {...props} className={cn('flex items-center gap-3')} />
)
