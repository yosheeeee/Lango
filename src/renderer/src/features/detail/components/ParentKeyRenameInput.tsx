import { useContext, useState } from 'react'
import { Check, X } from 'lucide-react'
import { Input } from '@renderer/components/form'
import { NamespaceCtx } from '../namespaceContext'
import { EditRowButton } from './EditRowButton'

export type ParentKeyRenameInputProps = {
  translationKey: string
  onFinish: () => void
}

export function ParentKeyRenameInput({ translationKey, onFinish }: ParentKeyRenameInputProps) {
  const ctx = useContext(NamespaceCtx)
  const [value, setValue] = useState(() => translationKey.split('.').at(-1) ?? '')

  async function confirm() {
    const newName = value.trim()
    if (!newName || !ctx) return onFinish()
    await window.api.project.renameLocalizationKey(ctx.namespace, translationKey, newName)
    ctx.onRefresh()
    onFinish()
  }

  return (
    <div className="flex gap-2.5 flex-1 min-w-0">
      <Input
        autoFocus
        className="flex-1"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') confirm()
          if (e.key === 'Escape') onFinish()
        }}
      />
      <div className="flex gap-1 shrink-0">
        <EditRowButton onClick={confirm}>
          <Check />
        </EditRowButton>
        <EditRowButton onClick={onFinish}>
          <X />
        </EditRowButton>
      </div>
    </div>
  )
}
