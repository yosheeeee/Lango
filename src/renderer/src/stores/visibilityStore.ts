import { createRef } from 'react'
import { create } from 'zustand'

type VisibilityState = {
  cheetSheet: boolean
  masterPanel: boolean
}

type VisibilityActions = {
  setCheetSheet: (newVal: boolean) => void
  toggleMaster: () => void
  toggleCheetSheet: () => void
  toggleSearch: () => void
}
type VisibilityStore = VisibilityState & VisibilityActions

const searchInputRef = createRef<HTMLInputElement>()
const treePanelRef = createRef<HTMLDivElement>()

export const useEditorStore = create<VisibilityStore>()((set) => ({
  cheetSheet: false,
  masterPanel: true,
  toggleMaster: () => set((prev) => ({ masterPanel: !prev.masterPanel })),
  setCheetSheet: (newVal: boolean) => set({ cheetSheet: newVal }),
  toggleCheetSheet: () => set((prev) => ({ cheetSheet: !prev.cheetSheet })),
  toggleSearch: () => {
    if (!searchInputRef.current) return
    searchInputRef.current.focus()
  }
}))

export { searchInputRef, treePanelRef }
