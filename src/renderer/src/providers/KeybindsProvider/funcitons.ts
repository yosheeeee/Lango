import { useEditorStore } from '@renderer/stores/visibilityStore'

export const keybindFunctions = {
  'master.toggle'() {
    useEditorStore.getState().toggleMaster()
  },
  'cheatSheet.toggle'() {
    useEditorStore.getState().toggleCheetSheet()
  },
  'search.toggle'() {
    useEditorStore.getState().toggleSearch()
  }
} as const
