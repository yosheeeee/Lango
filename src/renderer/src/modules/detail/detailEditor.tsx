import { Button } from '@renderer/components/button'
import { ToggleGroup, ToggleGroupItem } from '@renderer/components/toggleGroup'
import { MoveLeft, MoveRight } from 'lucide-react'
import { useFileTreeStore } from '@renderer/stores/fileTreeStore'
import { FileTreeGroup, FileTreeItem } from 'src/domain/models/fileTree'
import { useParams, useNavigate } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { routerPaths } from '@renderer/router/routerPaths'
import EntryEditor, { AddKeyButton, CollabsibleTranslationsEntry } from './entryEditor'
import { ActiveLocalizationSwitcher } from './activeLocalizationSwitcher'
import { useLocalizationStore } from '@renderer/stores/localizationStore'
import { NamespaceCtx } from './namespaceContext'

type ValueEditorNode = {
  namespace: string
  translationKey: string
  currentLocalizationValue: string
}

type CollapsibleNode = {
  translationKey: string
  childNodes: (CollapsibleNode | ValueEditorNode)[]
}

type FilterType = 'all' | 'empty' | 'orphan'

function jsonToNodes(
  obj: Record<string, unknown>,
  namespace: string,
  parentKey = ''
): (CollapsibleNode | ValueEditorNode)[] {
  return Object.entries(obj).map(([key, value]) => {
    const fullKey = parentKey ? `${parentKey}.${key}` : key
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return {
        translationKey: fullKey,
        childNodes: jsonToNodes(value as Record<string, unknown>, namespace, fullKey)
      }
    }
    return {
      namespace,
      translationKey: fullKey,
      currentLocalizationValue: typeof value === 'string' ? value : ''
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
      if (matches) acc.push(node)
    }
    return acc
  }, [])
}

function useNamespaceContent(namespace: string | undefined) {
  const { currentLocale } = useLocalizationStore()
  const [content, setContent] = useState<Record<string, unknown>>({})
  const [orphanKeys, setOrphanKeys] = useState<Set<string>>(new Set())
  const [version, setVersion] = useState(0)

  const refresh = useCallback(() => setVersion((v) => v + 1), [])

  useEffect(() => {
    if (!namespace || !currentLocale) {
      setContent({})
      setOrphanKeys(new Set())
      return
    }
    Promise.all([
      window.api.project.getNamespaceContent(namespace, currentLocale),
      window.api.project.getNamespaceOrphanKeys(namespace)
    ]).then(([c, keys]) => {
      setContent(c)
      setOrphanKeys(new Set(keys))
    })
  }, [namespace, currentLocale, version])

  return { content, orphanKeys, refresh }
}

export default function DetailEditor() {
  const { filePath } = useParams<{ filePath: string }>()
  const { content, orphanKeys, refresh } = useNamespaceContent(filePath)
  const [filter, setFilter] = useState<FilterType>('all')

  const nodes = useMemo(
    () => (filePath ? jsonToNodes(content, filePath) : []),
    [content, filePath]
  )

  const filteredNodes = useMemo(
    () => filterNodes(nodes, filter, orphanKeys),
    [nodes, filter, orphanKeys]
  )

  return (
    <NamespaceCtx.Provider value={{ namespace: filePath ?? '', onRefresh: refresh }}>
      <section id="detail-editor" className="flex-1 h-full flex flex-col gap-2 p-3">
        <div className="flex-1 h-full flex flex-col gap-4 overflow-hidden">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-end gap-2">
              <p className="text-xl">Current Localization:</p>
              <ActiveLocalizationSwitcher />
            </div>
            <div className="flex items-center gap-2">
              <ToggleGroup
                type="single"
                value={filter}
                onValueChange={(v) => v && setFilter(v as FilterType)}
              >
                <ToggleGroupItem value="all">Все ключи</ToggleGroupItem>
                <ToggleGroupItem value="empty">Не заполненные</ToggleGroupItem>
                <ToggleGroupItem value="orphan">Сироты</ToggleGroupItem>
              </ToggleGroup>
              <AddKeyButton />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto flex flex-col gap-4">
            {filteredNodes.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                Ключи не найдены
              </div>
            ) : (
              filteredNodes.map((node) =>
                'childNodes' in node ? (
                  <CollabsibleTranslationsEntry key={node.translationKey} {...node} />
                ) : (
                  <EntryEditor key={node.translationKey} {...node} />
                )
              )
            )}
          </div>
        </div>
        <NavigateButtons />
      </section>
    </NamespaceCtx.Provider>
  )
}

function flattenFileTree(items: (FileTreeGroup | FileTreeItem)[]): string[] {
  const links: string[] = []

  for (const item of items) {
    if ('nestedItems' in item) {
      links.push(...flattenFileTree(item.nestedItems))
    } else {
      links.push(item.link)
    }
  }

  return links.sort()
}

function useNamespaceNavigation() {
  const { root } = useFileTreeStore()
  const { filePath } = useParams<{ filePath: string }>()
  const navigate = useNavigate()

  const namespaces = useMemo(() => {
    if (!root) return []
    return flattenFileTree(root.nestedItems)
  }, [root])

  const currentIndex = useMemo(() => {
    if (!filePath) return -1
    return namespaces.indexOf(`/${filePath}`)
  }, [namespaces, filePath])

  const onMoveNext = useCallback(() => {
    if (currentIndex >= 0 && currentIndex < namespaces.length - 1) {
      const nextLink = namespaces[currentIndex + 1]
      navigate([routerPaths.editor, nextLink].join(''), { replace: true })
    }
  }, [currentIndex, namespaces, navigate])

  const onMovePrev = useCallback(() => {
    if (currentIndex > 0) {
      const prevLink = namespaces[currentIndex - 1]
      navigate([routerPaths.editor, prevLink].join(''), { replace: true })
    }
  }, [currentIndex, namespaces, navigate])

  return {
    onMoveNext,
    onMovePrev,
    hasNext: currentIndex >= 0 && currentIndex < namespaces.length - 1,
    hasPrev: currentIndex > 0
  }
}

function NavigateButtons() {
  const { onMoveNext, onMovePrev, hasNext, hasPrev } = useNamespaceNavigation()

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
