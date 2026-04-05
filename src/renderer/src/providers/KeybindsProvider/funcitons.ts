import { useEditorStore } from '@renderer/stores/visibilityStore'

export const keybindFunctions = {
  'master.toggle'() {
    useEditorStore.getState().toggleMaster()
  },
  'projectTree.focus'() {
    let { masterPanel, projectTreeRef, toggleMaster } = useEditorStore.getState()
    if (!masterPanel) {
      toggleMaster()
      requestAnimationFrame(() => projectTreeRef?.current?.focus())
    } else {
      projectTreeRef?.current?.focus()
    }
  },
  'cheatSheet.toggle'() {
    useEditorStore.getState().toggleCheetSheet()
  },
  'search.toggle'() {
    useEditorStore.getState().toggleSearch()
  }
} as const
