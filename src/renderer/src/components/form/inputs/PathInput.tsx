import { cn } from '@renderer/utils/cn'
import { Folder } from 'lucide-react'
import { FC } from 'react'
import { Button } from '@renderer/components/ui/button'
import { useTranslation } from 'react-i18next'

interface PathInputProps {
  value: string
  onChange?: (value: string) => void
  className?: string
}

export const PathInput: FC<PathInputProps> = ({ className, value, onChange }) => {
  const { t } = useTranslation('addNewProject')
  async function onButtonClick(): Promise<void> {
    const path = await window.api.session.openSelectFolderDialog()
    if (path) {
      onChange?.(path)
    }
  }
  return (
    <div
      className={cn(
        'flex gap-1 w-full overflow-hidden items-center justify-between',
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-gray-800 border-gray-600 h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 pr-1 shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm !text-base',
        'focus-visible:border-ring focus-visible:ring-gray-700/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-red-700/20 dark:aria-invalid:ring-red-700/40 aria-invalid:border-red-700',
        className
      )}
    >
      <p className="truncate" style={{ direction: 'rtl' }}>
        {value ? value : <span>{t('selectPath')}</span>}
      </p>
      <Button
        size={'unset'}
        className="h-full aspect-square shrink-0 text-sm"
        onClick={onButtonClick}
      >
        <Folder />
      </Button>
    </div>
  )
}
