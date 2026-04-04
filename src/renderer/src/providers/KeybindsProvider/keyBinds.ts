import { keybindFunctions } from './funcitons'

type KeybindsMap = Record<keyof typeof keybindFunctions, string>

export const keyBinds: KeybindsMap = {
  'master.toggle': 'Control+KeyB',
  'cheatSheet.toggle': 'Control+KeyK',
  'search.toggle': 'Control+KeyP'
}
