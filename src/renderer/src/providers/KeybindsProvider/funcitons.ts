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
    console.log('[newItem] вызван')
    const active = document.activeElement as HTMLElement
    console.log('[newItem] active:', active?.tagName, active?.className?.slice(0, 50))
    console.log('[newItem] data-tree-folder:', active?.hasAttribute('data-tree-folder'))
    console.log('[newItem] data-tree-item:', active?.hasAttribute('data-tree-item'))

    const items = Array.from(document.querySelectorAll<HTMLElement>('[data-tree-item]')).filter(
      (el) => el.offsetHeight > 0
    )
    const idx = items.indexOf(active)
    console.log('[newItem] items count:', items.length, 'idx:', idx)
    console.log('[newItem] items:', items.map((el) => ({
      name: el.textContent?.slice(0, 20),
      depth: el.dataset.treeDepth,
      isFolder: el.hasAttribute('data-tree-folder'),
      createBtn: !!el.querySelector('[data-create-btn]')
    })))
    if (idx === -1) {
      console.log('[newItem] не найден active в items, выход')
      return
    }

    const depth = parseInt(active?.dataset.treeDepth ?? '0')
    const isFolder = active?.hasAttribute('data-tree-folder')
    console.log('[newItem] depth:', depth, 'isFolder:', isFolder)

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

    console.log('[newItem] targetFolder:', targetFolder?.textContent?.slice(0, 20))
    console.log('[newItem] createBtn:', targetFolder?.querySelector('[data-create-btn]'))

    const btn = targetFolder?.querySelector<HTMLElement>('[data-create-btn]')
    if (btn) {
      // Radix DropdownMenu открывается через onPointerDown, не через click
      const pointerEvent = new PointerEvent('pointerdown', {
        bubbles: true,
        cancelable: true,
        pointerType: 'mouse'
      })
      console.log('[newItem] dispatch pointerdown')
      btn.dispatchEvent(pointerEvent)
    }
  },
  'projectTree.deleteItem'() {
    const active = document.activeElement as HTMLElement
    if (!active?.hasAttribute('data-tree-item')) return
    active.querySelector<HTMLElement>('[data-delete-btn]')?.click()
  }
} as const
