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
    const items = Array.from(document.querySelectorAll<HTMLElement>('[data-tree-item]')).filter(
      (el) => el.offsetHeight > 0
    )
    const idx = items.indexOf(active)
    if (idx === -1) return

    const depth = parseInt(active?.dataset.treeDepth ?? '0')
    const isFolder = active?.hasAttribute('data-tree-folder')

    // Найти целевую папку
    let targetFolder: HTMLElement | undefined
    if (isFolder) {
      targetFolder = active
    } else {
      // Найти родительскую папку (как в ArrowLeft)
      targetFolder = items
        .slice(0, idx)
        .reverse()
        .find((el) => parseInt(el.dataset.treeDepth ?? '0') < depth && el.hasAttribute('data-tree-folder'))
    }

    const btn = targetFolder?.querySelector<HTMLElement>('[data-create-btn]')
    if (btn) {
      // Radix DropdownMenu открывается через pointerdown, не через click
      btn.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          cancelable: true,
          pointerType: 'mouse'
        })
      )
    }
  },
  'projectTree.deleteItem'() {
    const active = document.activeElement as HTMLElement
    if (!active?.hasAttribute('data-tree-item')) return
    active.querySelector<HTMLElement>('[data-delete-btn]')?.click()
  }
} as const
