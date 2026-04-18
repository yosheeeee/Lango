export type SearchMatchType = 'namespace' | 'key' | 'value' | 'locale'

export type SearchMatch = {
  type: SearchMatchType
  path: string
  displayName: string
  matchedText: string
  highlight: { start: number; end: number }
  relevance: number
}

export type SearchResult = {
  items: SearchMatch[]
  total: number
  hasMore: boolean
}
