import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import { Trans, useTranslation } from 'react-i18next'

export type DeleteConfirmDialogProps = {
  open: boolean
  translationKey: string
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirmDialog({
  open,
  translationKey,
  onConfirm,
  onCancel
}: DeleteConfirmDialogProps) {
  const { t } = useTranslation('editor', { keyPrefix: 'deleteKey' })

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            <Trans
              i18nKey="deleteKey.description"
              ns="editor"
              values={{ key: translationKey }}
              components={{ k: <span className="text-white font-mono" /> }}
            />
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onCancel}>{t('cancel')}</Button>
          <Button onClick={onConfirm} className="bg-red-700 hover:bg-red-600 text-white">
            {t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
