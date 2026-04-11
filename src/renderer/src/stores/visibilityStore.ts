import React, { RefObject } from 'react'
import { create } from 'zustand'

type VisibilityState = {
  cheetSheet: boolean
  masterPanel: boolean
  searchRef: RefObject<HTMLInputElement | null>
  projectTreeRef: RefObject<HTMLDivElement | null>
}

type VisibilityActions = {
  setCheetSheet: (newVal: boolean) => void
  toggleMaster: () => void
  toggleCheetSheet: () => void
  toggleSearch: () => void
}
type VisibilityStore = VisibilityState & VisibilityActions

export const useEditorStore = create<VisibilityStore>()((set, get) => ({
  cheetSheet: false,
  masterPanel: true,
  searchRef: React.createRef<HTMLInputElement>(),
  projectTreeRef: React.createRef<HTMLDivElement>(),
  toggleMaster: () => {
    let newState = false
    set((prev) => {
      newState = !prev.masterPanel
      return {
        masterPanel: newState
      }
    })
    if (newState) {
      requestAnimationFrame(() => {
        get().projectTreeRef.current?.focus()
      })
    }
  },
  setCheetSheet: (newVal: boolean) => set({ cheetSheet: newVal }),
  toggleCheetSheet: () =>
    set((prev) => ({
      cheetSheet: !prev.cheetSheet
    })),
  toggleSearch: () => {
    const searchInput = get().searchRef.current
    if (!searchInput) return
    if (document.activeElement === searchInput) {
      searchInput.blur()
    } else {
      searchInput.focus()
    }
  }
}))
