import { Dialog, DialogContent, DialogTitle } from '@renderer/components/dialog'
import {
  TableHead,
  TableHeader,
  Table,
  TableBody,
  TableRow,
  TableCell
} from '@renderer/components/table'
import { keyBinds } from '@renderer/providers/KeybindsProvider/keyBinds'
import { useEditorStore } from '@renderer/stores/visibilityStore'
import { useTranslation } from 'react-i18next'

export default function KeybindsCheetSheet() {
  const { t } = useTranslation('cheetSheet')
  const { cheetSheet, setCheetSheet } = useEditorStore()
  return (
    <Dialog open={cheetSheet} onOpenChange={setCheetSheet}>
      <DialogContent className="max-w-[600px] w-full">
        <DialogTitle>{t('title')}</DialogTitle>
        <div className="border border-gray-700 rounded-[10px] bg-gray-800">
          <Table>
            <TableHeader className="border-b border-b-gray-500">
              <TableHead>{t('action')}</TableHead>
              <TableHead>{t('keybind')}</TableHead>
            </TableHeader>
            <TableBody>
              {Object.entries(keyBinds).map(([key, bind]) => (
                <TableRow>
                  <TableCell>{t(key)}</TableCell>
                  <TableCell>
                    <div className="rounded-md bg-gray-600 w-max px-2 py-0.5 mx-auto">
                      {formatKeyBind(bind)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const needToReplace = {
  Control: 'Ctrl',
  Key: '',
  '+': ' + '
}

function formatKeyBind(keybind: string) {
  return Object.entries(needToReplace).reduce(
    (prev, [key, value]) => prev.replace(key, value),
    keybind
  )
}
