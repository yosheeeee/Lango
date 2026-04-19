import { createContext } from 'react'

type NamespaceCtxValue = {
  namespace: string
  onRefresh: () => void
  orphanKeys: Set<string>
}

export const NamespaceCtx = createContext<NamespaceCtxValue | null>(null)
