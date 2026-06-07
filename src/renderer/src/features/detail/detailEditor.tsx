import { Button } from '@renderer/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@renderer/components/ui/toggleGroup'
import { MoveLeft, MoveRight } from 'lucide-react'
import { useFileTreeStore } from '@renderer/stores/fileTreeStore'
import { FileTreeGroup, FileTreeItem } from 'src/domain/models/fileTree'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { routerPaths } from '@renderer/router/routerPaths'
import EntryEditor, { AddKeyButton, CollabsibleTranslationsEntry } from './components/EntryEditor'
import { ActiveLocalizationSwitcher } from './activeLocalizationSwitcher'
import { useLocalizationStore } from '@renderer/stores/localizationStore'
import { NamespaceCtx } from './namespaceContext'
import { useTranslation } from 'react-i18next'

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
  const [searchParams] = useSearchParams()
  const targetKey = searchParams.get('key')
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const { t } = useTranslation('localeEditor', { keyPrefix: 'filter' })
  const { t: tGeneral } = useTranslation('localeEditor')

  const nodes = useMemo(
    () => (filePath ? jsonToNodes(content, filePath, '', orphanKeys) : []),
    [content, filePath, orphanKeys]
  )

  const filteredNodes = useMemo(
    () => filterNodes(nodes, filter, orphanKeys),
    [nodes, filter, orphanKeys]
  )

  // Автоматический скролл и подсветка ключа по ?key= query-параметру
  useEffect(() => {
    if (!targetKey) return
    const container = scrollContainerRef.current
    if (!container) return

    let cancelled = false
    let attempts = 0
    const maxAttempts = 20

    const findAndHighlight = (): void => {
      if (cancelled) return
      const el = container.querySelector<HTMLElement>(`[data-key="${CSS.escape(targetKey)}"]`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.dataset.highlight = 'true'
        setTimeout(() => {
          if (!cancelled) delete el.dataset.highlight
        }, 1800)
        return
      }
      attempts += 1
      if (attempts < maxAttempts) setTimeout(findAndHighlight, 80)
    }

    // Немного задержки, чтобы DOM успел отрендериться после получения контента
    const t = setTimeout(findAndHighlight, 60)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [targetKey, content])

  return (
    <NamespaceCtx.Provider value={{ namespace: filePath ?? '', onRefresh: refresh, orphanKeys }}>
      <section id="detail-editor" className="flex-1 overflow-hidden flex flex-col gap-2 p-3">
        <div className="flex-1 h-full flex flex-col gap-4 overflow-hidden">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-end gap-2">
              <p className="text-xl">{tGeneral('currentLocalization')}</p>
              {ActiveLocalizationSwitcher && <ActiveLocalizationSwitcher />}
            </div>
            <div className="flex items-center gap-2">
              <ToggleGroup
                type="single"
                value={filter}
                onValueChange={(v) => v && setFilter(v as FilterType)}
              >
                <ToggleGroupItem value="all">{t('all')}</ToggleGroupItem>
                <ToggleGroupItem value="empty">{t('empty')}</ToggleGroupItem>
                <ToggleGroupItem value="orphan">{t('orphan')}</ToggleGroupItem>
              </ToggleGroup>
              <AddKeyButton />
            </div>
          </div>
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto flex flex-col gap-4">
            {filteredNodes.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                {tGeneral('noKeys')}
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
      navigate(`${routerPaths.editor}/ns${nextLink}`, { replace: true })
    }
  }, [currentIndex, namespaces, navigate])

  const onMovePrev = useCallback(() => {
    if (currentIndex > 0) {
      const prevLink = namespaces[currentIndex - 1]
      navigate(`${routerPaths.editor}/ns${prevLink}`, { replace: true })
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
  const { t } = useTranslation('localeEditor', { keyPrefix: 'navigation' })

  return (
    <div className="flex items-center justify-between gap-2.5 shrink-0">
      <Button onClick={onMovePrev} disabled={!hasPrev}>
        <MoveLeft /> {t('prev')}
      </Button>
      <Button onClick={onMoveNext} disabled={!hasNext}>
        {t('next')}
        <MoveRight />
      </Button>
    </div>
  )
}
