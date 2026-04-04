import KeybindsCheetSheet from '@renderer/modules/editor/keybindsCheetSheet'
import { PropsWithChildren, useEffect } from 'react'
import { keyBinds } from './keyBinds'
import { tinykeys } from 'tinykeys'
import { keybindFunctions } from './funcitons'

export default function KeybindsProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    const bindingsForTinykeys = {}

    Object.entries(keyBinds).forEach(([commandId, keys]) => {
      bindingsForTinykeys[keys] = (event) => {
        event.preventDefault() // Часто в IDE нужно отменять стандартное поведение браузера
        keybindFunctions[commandId]()
      }
    })
    const unsubscribe = tinykeys(window, bindingsForTinykeys)

    return () => {
      unsubscribe()
    }
  }, [keyBinds])

  return (
    <>
      {children}
      <KeybindsCheetSheet />
    </>
  )
}
