import { Button } from '@renderer/components/button'
import { ChevronUp, ListCollapseIcon, MoveLeft, MoveRight, Plus } from 'lucide-react'
import { useFileTreeStore } from '@renderer/stores/fileTreeStore'
import { FileTreeGroup, FileTreeItem } from 'src/domain/models/fileTree'
import { useParams, useNavigate } from 'react-router-dom'
import { useCallback, useMemo } from 'react'
import { routerPaths } from '@renderer/router/routerPaths'
import EntryEditor, { CollabsibleTranslationsEntry } from './entryEditor'
import { ActiveLocalizationSwitcher } from './activeLocalizationSwitcher'

export default function DetailEditor() {
  return (
    <section id="detail-editor" className="flex-1 h-full flex flex-col gap-2 p-3">
      <div className="flex-1 h-full flex flex-col gap-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-end gap-1">
            <p className="text-xl">Current Localization:</p>
            <ActiveLocalizationSwitcher />
          </div>
          <Button size={'sm'}>
            <Plus />
            Add Key
          </Button>
        </div>
        <EntryEditor
          namespace="auth"
          currentLocalizationValue="hello guys"
          translationKey="login.title"
        />
        <CollabsibleTranslationsEntry
          translationKey="test"
          childNodes={[
            {
              namespace: 'auth',
              currentLocalizationValue: 'hello guys',
              translationKey: 'auth.test'
            }
          ]}
        />
      </div>
      <NavigateButtons />
    </section>
  )
}

/**
 * Рекурсивно собирает все link из FileTreeItem в плоский отсортированный массив.
 * Link имеет вид "/common", "/auth/login" — сохраняем как есть.
 */
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
    // filePath из useParams — это "common", а link в дереве — "/common"
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
