import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'

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
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete key</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{' '}
            <span className="text-white font-mono">{translationKey}</span>? This will remove the key
            from all locales and cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onCancel}>Cancel</Button>
          <Button onClick={onConfirm} className="bg-red-700 hover:bg-red-600 text-white">
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
