import { createContext } from 'react'

type NamespaceCtxValue = {
  namespace: string
  onRefresh: () => void
}

export const NamespaceCtx = createContext<NamespaceCtxValue | null>(null)
