import { Input } from '@renderer/components/form'
import { searchInputRef } from '@renderer/stores/visibilityStore'
import { Search, FileJson2, Braces, Languages, Globe } from 'lucide-react'
import { FC, useEffect, useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { routerPaths } from '@renderer/router/routerPaths'
import { useLocalizationStore } from '@renderer/stores/localizationStore'
import { Popover, PopoverAnchor, PopoverContent } from '@renderer/components/ui/popover'

type SearchMatch = {
  type: 'namespace' | 'key' | 'value' | 'locale'
  path: string
  displayName: string
  matchedText: string
  highlight: { start: number; end: number }
}

type SearchResult = {
  items: SearchMatch[]
  total: number
  hasMore: boolean
}

const typeIcons = {
  namespace: FileJson2,
  key: Braces,
  value: Languages,
  locale: Globe
}

const typeLabels = {
  namespace: 'namespace',
  key: 'key',
  value: 'value',
  locale: 'locale'
}

function HighlightMatch({
  text,
  highlight
}: {
  text: string
  highlight: { start: number; end: number }
}) {
  if (!highlight) return <>{text}</>
  const { start, end } = highlight
  return (
    <>
      {text.slice(0, start)}
      <mark className="bg-cyan-200 dark:bg-cyan-500/30 font-semibold rounded-sm px-0.5">
        {text.slice(start, end)}
      </mark>
      {text.slice(end)}
    </>
  )
}

export const ProjectSearch: FC = () => {
  const { t } = useTranslation('projectSearch')
  const navigate = useNavigate()
  const { setCurrentLocale } = useLocalizationStore()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchMatch[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [offset, setOffset] = useState(0)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (searchQuery: string, searchOffset = 0) => {
    if (!searchQuery.trim()) {
      setResults([])
      setTotal(0)
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    try {
      const result = (await window.api.project.search(searchQuery, 50, searchOffset)) as
        | SearchResult
        | undefined
      if (!result) return
      if (searchOffset === 0) {
        setResults(result.items)
        setTotal(result.total)
      } else {
        setResults((prev) => [...prev, ...result.items])
      }
      setIsOpen(true)
    } catch (e) {
      console.error('Search error:', e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      search(query)
      setOffset(0)
    }, 1000)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, search])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleItemClick = (item: SearchMatch) => {
    setIsOpen(false)
    setQuery('')

    switch (item.type) {
      case 'namespace':
        navigate(`${routerPaths.editor}/ns/${item.path}`)
        break
      case 'key':
      case 'value': {
        const dotIdx = item.path.indexOf('.')
        const ns = dotIdx === -1 ? item.path : item.path.slice(0, dotIdx)
        const key = dotIdx === -1 ? '' : item.path.slice(dotIdx + 1)
        if (!key) {
          navigate(`${routerPaths.editor}/ns/${ns}`)
        } else {
          navigate(`${routerPaths.editor}/ns/${ns}?key=${encodeURIComponent(key)}`)
        }
        break
      }
      case 'locale':
        setCurrentLocale(item.path)
        break
    }
  }

  const handleLoadMore = () => {
    const newOffset = offset + 50
    setOffset(newOffset)
    search(query, newOffset)
  }

  const showLoadMore = results.length < total
  const shouldShowPopover = isOpen && results.length > 0

  return (
    <Popover open={shouldShowPopover} onOpenChange={setIsOpen}>
      <PopoverAnchor asChild>
        <div className="relative">
          <Input
            ref={searchInputRef}
            placeholder={t('searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.length > 0 && results.length > 0) setIsOpen(true)
            }}
            className="pl-10 py-1 h-6.25 !text-sm placeholder:text-center"
          />
          <Search className="size-4 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="size-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </PopoverAnchor>

      <PopoverContent
        align="center"
        sideOffset={4}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="w-(--radix-popper-anchor-width) min-w-max p-1 max-h-80 overflow-y-auto"
      >
        {results.map((item, idx) => {
          const Icon = typeIcons[item.type]
          return (
            <button
              key={`${item.type}-${item.path}-${idx}`}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleItemClick(item)}
              className="w-full px-3 py-2 flex items-center gap-2 text-left cursor-pointer rounded-md hover:bg-gray-700 focus:bg-gray-700 outline-none"
            >
              <Icon className="size-4 text-cyan-500 shrink-0" />
              <span className="text-sm truncate flex-1">
                <HighlightMatch text={item.displayName} highlight={item.highlight} />
              </span>
              <span className="text-xs text-gray-400 shrink-0">{t(typeLabels[item.type])}</span>
            </button>
          )
        })}

        {showLoadMore && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleLoadMore}
            className="w-full px-3 py-2 text-sm text-cyan-500 cursor-pointer text-center font-medium rounded-md hover:bg-gray-700 outline-none"
          >
            {t('loadMore')} ({total - results.length} {t('more')})
          </button>
        )}
      </PopoverContent>
    </Popover>
  )
}
