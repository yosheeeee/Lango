import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@renderer/components'
import { keyBinds } from '@renderer/providers/KeybindsProvider/keyBinds'
import { useEditorStore } from '@renderer/stores/visibilityStore'
import { useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'

const formatKeyCombo = (combo: string): string => {
  return combo.replace('Control', 'Ctrl').replace('Key', '').split('+').join(' + ')
}

export default function KeybindsCheetSheet() {
  const { cheetSheet, toggleCheetSheet } = useEditorStore()
  const { t } = useTranslation('cheetSheet')

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && cheetSheet) {
        toggleCheetSheet()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [cheetSheet, toggleCheetSheet])

  return (
    <Dialog open={cheetSheet} onOpenChange={toggleCheetSheet}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {Object.entries(keyBinds).map(([commandId, keys]) => {
            const label = t(commandId, { defaultValue: '' })
            if (!label) return null

            return (
              <div
                key={commandId}
                className="flex items-center gap-4 justify-between p-3 rounded-lg border bg-muted/50 hover:bg-muted transition-colors"
              >
                <p className="text-sm">{label}</p>

                <kbd className="px-3 py-1.5 text-xs font-mono font-semibold bg-background border rounded-md shadow-sm">
                  {formatKeyCombo(keys)}
                </kbd>
              </div>
            )
          })}
        </div>

        <div className="text-xs text-muted-foreground text-center pt-4 border-t">
          <Trans
            t={t}
            i18nKey="escToClose"
            components={[
              <kbd key="esc" className="px-1.5 py-0.5 text-xs font-mono bg-background border rounded" />
            ]}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
