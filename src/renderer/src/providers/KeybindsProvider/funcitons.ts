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
  },
  'projectTree.newItem'() {
    const active = document.activeElement as HTMLElement
    if (!active?.hasAttribute('data-tree-folder')) return
    active.querySelector<HTMLElement>('[data-create-btn]')?.click()
  },
  'projectTree.deleteItem'() {
    const active = document.activeElement as HTMLElement
    if (!active?.hasAttribute('data-tree-item')) return
    active.querySelector<HTMLElement>('[data-delete-btn]')?.click()
  }
} as const
