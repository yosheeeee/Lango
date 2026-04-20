import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronUp, MoveLeft, MoveRight } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@renderer/components/ui/toggleGroup'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent
} from '@renderer/components/ui/collapsible'
import { useLocalizationStore } from '@renderer/stores/localizationStore'
import { useFileTreeStore } from '@renderer/stores/fileTreeStore'
import { FileTreeGroup, FileTreeItem } from 'src/domain/models/fileTree'
import { routerPaths } from '@renderer/router/routerPaths'
import { NamespaceCtx } from '@renderer/features/detail/namespaceContext'
import EntryEditor, {
  CollabsibleTranslationsEntry
} from '@renderer/features/detail/components/EntryEditor'
import { cn } from '@renderer/utils/cn'

type ValueEditorNode = {
  namespace: string
  translationKey: string
  currentLocalizationValue: string
  isOrphan?: boolean
}

type CollapsibleNode = {
  translationKey: string
  childNodes: (CollapsibleNode | ValueEditorNode)[]
}

type FilterType = 'all' | 'empty' | 'orphan'

function jsonToNodes(
  obj: Record<string, unknown>,
  namespace: string,
  parentKey = '',
  orphanKeys: Set<string>
): (CollapsibleNode | ValueEditorNode)[] {
  return Object.entries(obj).map(([key, value]) => {
    const fullKey = parentKey ? `${parentKey}.${key}` : key
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return {
        translationKey: fullKey,
        childNodes: jsonToNodes(value as Record<string, unknown>, namespace, fullKey, orphanKeys)
      }
    }
    return {
      namespace,
      translationKey: fullKey,
      currentLocalizationValue: typeof value === 'string' ? value : '',
      isOrphan: orphanKeys.has(fullKey) || undefined
    }
  })
}

function filterNodes(
  nodes: (CollapsibleNode | ValueEditorNode)[],
  filter: FilterType,
  orphanKeys: Set<string>
): (CollapsibleNode | ValueEditorNode)[] {
  if (filter === 'all') return nodes
  return nodes.reduce<(CollapsibleNode | ValueEditorNode)[]>((acc, node) => {
    if ('childNodes' in node) {
      const filtered = filterNodes(node.childNodes, filter, orphanKeys)
      if (filtered.length > 0) acc.push({ ...node, childNodes: filtered })
    } else {
      const matches =
        filter === 'empty'
          ? node.currentLocalizationValue === ''
          : filter === 'orphan'
            ? orphanKeys.has(node.translationKey)
            : true
      if (matches) acc.push({ ...node, isOrphan: orphanKeys.has(node.translationKey) || undefined })
    }
    return acc
  }, [])
}

function flattenNamespaces(items: (FileTreeGroup | FileTreeItem)[]): string[] {
  const result: string[] = []
  for (const item of items) {
    if ('nestedItems' in item) {
      result.push(...flattenNamespaces(item.nestedItems))
    } else {
      result.push(item.link.replace(/^\//, ''))
    }
  }
  return result.sort()
}

function useLocaleContent(locale: string | undefined) {
  const [allContent, setAllContent] = useState<Record<string, Record<string, unknown>>>({})
  const [orphanKeysMap, setOrphanKeysMap] = useState<Record<string, Set<string>>>({})
  const [version, setVersion] = useState(0)
  const refresh = useCallback(() => setVersion((v) => v + 1), [])

  useEffect(() => {
    if (!locale) {
      setAllContent({})
      setOrphanKeysMap({})
      return
    }
    window.api.project.getAllNamespacesContent(locale).then((content) => {
      setAllContent(content)
      const namespaces = Object.keys(content)
      Promise.all(
        namespaces.map((ns) =>
          window.api.project.getNamespaceOrphanKeys(ns).then((keys) => [ns, keys] as const)
        )
      ).then((results) => {
        const map: Record<string, Set<string>> = {}
        for (const [ns, keys] of results) {
          map[ns] = new Set(keys)
        }
        setOrphanKeysMap(map)
      })
    })
  }, [locale, version])

  return { allContent, orphanKeysMap, refresh }
}

function useLocaleNavigation() {
  const { locales } = useLocalizationStore()
  const { localeName } = useParams<{ localeName: string }>()
  const navigate = useNavigate()

  const currentIndex = locales.indexOf(localeName ?? '')

  const onMoveNext = useCallback(() => {
    if (currentIndex < locales.length - 1) {
      navigate(`${routerPaths.editor}/locale/${locales[currentIndex + 1]}`, { replace: true })
    }
  }, [currentIndex, locales, navigate])

  const onMovePrev = useCallback(() => {
    if (currentIndex > 0) {
      navigate(`${routerPaths.editor}/locale/${locales[currentIndex - 1]}`, { replace: true })
    }
  }, [currentIndex, locales, navigate])

  return {
    onMoveNext,
    onMovePrev,
    hasNext: currentIndex >= 0 && currentIndex < locales.length - 1,
    hasPrev: currentIndex > 0
  }
}

function NamespaceSection({
  namespace,
  content,
  filter,
  orphanKeys,
  onRefresh
}: {
  namespace: string
  content: Record<string, unknown>
  filter: FilterType
  orphanKeys: Set<string>
  onRefresh: () => void
}) {
  const [open, setOpen] = useState(true)

  const nodes = useMemo(
    () => jsonToNodes(content, namespace, '', orphanKeys),
    [content, namespace, orphanKeys]
  )
  const filteredNodes = useMemo(
    () => filterNodes(nodes, filter, orphanKeys),
    [nodes, filter, orphanKeys]
  )

  if (filter !== 'all' && filteredNodes.length === 0) return null

  return (
    <NamespaceCtx.Provider value={{ namespace, onRefresh, orphanKeys }}>
      <Collapsible open={open} onOpenChange={setOpen} className="group flex flex-col gap-2">
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer px-1 py-0.5 rounded hover:bg-gray-800 select-none">
            <ChevronUp
              className={cn(
                'size-[16px] shrink-0 transition-transform duration-200',
                'group-data-[state=closed]:rotate-180'
              )}
            />
            <p className="text-sm font-medium text-gray-300">{namespace}</p>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="flex flex-col gap-4 pl-4">
          {filteredNodes.length === 0 ? (
            <p className="text-gray-500 text-sm py-2 text-center">Ключи не найдены</p>
          ) : (
            filteredNodes.map((node) =>
              'childNodes' in node ? (
                <CollabsibleTranslationsEntry key={node.translationKey} {...node} />
              ) : (
                <EntryEditor key={node.translationKey} {...node} />
              )
            )
          )}
        </CollapsibleContent>
      </Collapsible>
    </NamespaceCtx.Provider>
  )
}

function NavigateButtons() {
  const { onMoveNext, onMovePrev, hasNext, hasPrev } = useLocaleNavigation()

  return (
    <div className="flex items-center justify-between gap-2.5">
      <Button onClick={onMovePrev} disabled={!hasPrev}>
        <MoveLeft /> Prev
      </Button>
      <Button onClick={onMoveNext} disabled={!hasNext}>
        Next
        <MoveRight />
      </Button>
    </div>
  )
}

export default function LocaleEditor() {
  const { localeName } = useParams<{ localeName: string }>()
  const { setCurrentLocale } = useLocalizationStore()
  const { root } = useFileTreeStore()

  useEffect(() => {
    if (localeName) setCurrentLocale(localeName)
  }, [localeName, setCurrentLocale])

  const { allContent, orphanKeysMap, refresh } = useLocaleContent(localeName)
  const [filter, setFilter] = useState<FilterType>('all')

  const namespaces = useMemo(() => (root ? flattenNamespaces(root.nestedItems) : []), [root])

  const orderedContent = useMemo(
    () =>
      namespaces
        .filter((ns) => allContent[ns] !== undefined)
        .map((ns) => ({ namespace: ns, content: allContent[ns] })),
    [namespaces, allContent]
  )

  const hasAnyVisible = orderedContent.some(({ namespace, content }) => {
    if (filter === 'all') return Object.keys(content).length > 0
    const orphanKeys = orphanKeysMap[namespace] ?? new Set<string>()
    const nodes = jsonToNodes(content, namespace, '', orphanKeys)
    return filterNodes(nodes, filter, orphanKeys).length > 0
  })

  return (
    <section id="locale-editor" className="flex-1 overflow-hidden flex flex-col gap-2 p-3">
      <div className="flex-1 h-full flex flex-col gap-4 overflow-hidden">
        <div className="flex w-full items-center justify-end">
          <ToggleGroup
            type="single"
            value={filter}
            onValueChange={(v) => v && setFilter(v as FilterType)}
          >
            <ToggleGroupItem value="all">Все ключи</ToggleGroupItem>
            <ToggleGroupItem value="empty">Не заполненные</ToggleGroupItem>
            <ToggleGroupItem value="orphan">Сироты</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col gap-6">
          {!hasAnyVisible ? (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
              Ключи не найдены
            </div>
          ) : (
            orderedContent.map(({ namespace, content }) => (
              <NamespaceSection
                key={namespace}
                namespace={namespace}
                content={content}
                filter={filter}
                orphanKeys={orphanKeysMap[namespace] ?? new Set()}
                onRefresh={refresh}
              />
            ))
          )}
        </div>
      </div>
      <NavigateButtons />
    </section>
  )
}
