import { useEffect, useRef, useState } from 'react'
import { tinykeys } from 'tinykeys'
import { FileTreeGroup } from '@renderer/components/project/FileTree'
import { treePanelRef } from '@renderer/stores/visibilityStore'
import { useSessionStore } from '@renderer/stores/sessionStore'
import { useFileTreeStore } from '@renderer/stores/fileTreeStore'
import { useLocalizationStore } from '@renderer/stores/localizationStore'
import { useTranslation } from 'react-i18next'
import { FileJson2, Globe, Plus } from 'lucide-react'

function getVisibleItems(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('[data-tree-item]')).filter(
    (el) => el.offsetHeight > 0
  )
}

export default function ProjectTree() {
  const ref = treePanelRef
  const { currentSession } = useSessionStore()
  const { root, isLoading, fetchTree, invalidateTree } = useFileTreeStore()
  const { addLocale, fetchLocales, locales } = useLocalizationStore()
  const { t } = useTranslation('editor', { keyPrefix: 'projectTree' })
  const [creatingStep, setCreatingStep] = useState<'locale' | 'namespace' | null>(null)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const startAddingNamespace = async () => {
    if (locales.length === 0) {
      setCreatingStep('locale')
      setInputValue('')
      setTimeout(() => inputRef.current?.focus(), 0)
    } else {
      setCreatingStep('namespace')
      setInputValue('')
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  const handleCreate = async () => {
    const trimmed = inputValue.trim()
    if (!trimmed) {
      setCreatingStep(null)
      return
    }
    if (creatingStep === 'locale') {
      try {
        await addLocale(trimmed)
        setInputValue('')
        setCreatingStep('namespace')
        setTimeout(() => inputRef.current?.focus(), 0)
      } catch (e) {
        console.error('Failed to create locale:', e)
        setCreatingStep(null)
      }
    } else {
      try {
        await window.api.project.createNamespace(trimmed)
        setCreatingStep(null)
        setInputValue('')
        invalidateTree()
      } catch (e) {
        console.error('Failed to create namespace:', e)
        setCreatingStep(null)
      }
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCreate()
    } else if (e.key === 'Escape') {
      setCreatingStep(null)
      setInputValue('')
    }
  }

  useEffect(() => {
    fetchTree()
    fetchLocales()
  }, [currentSession?.id])

  useEffect(() => {
    const handler = () => {
      invalidateTree()
    }
    const unsubscribe = window.api.events.onFileTreeChanged(handler)
    return unsubscribe
  }, [currentSession?.id])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const active = () => document.activeElement as HTMLElement
    const items = () => getVisibleItems(el)
    const idx = () => items().indexOf(active())
    const isInput = () => document.activeElement instanceof HTMLInputElement

    const unsubscribe = tinykeys(el, {
      ArrowDown: (e) => {
        if (isInput()) return
        e.preventDefault()
        items()[idx() + 1]?.focus()
      },
      ArrowUp: (e) => {
        if (isInput()) return
        e.preventDefault()
        items()[Math.max(0, idx() - 1)]?.focus()
      },
      ArrowRight: (e) => {
        if (isInput()) return
        e.preventDefault()
        const node = active()
        if (!node?.hasAttribute('data-tree-folder')) return
        if (node.getAttribute('data-state') === 'open') {
          items()[idx() + 1]?.focus()
        } else {
          node.click()
        }
      },
      ArrowLeft: (e) => {
        if (isInput()) return
        e.preventDefault()
        const node = active()
        if (node?.hasAttribute('data-tree-folder') && node.getAttribute('data-state') === 'open') {
          node.click()
        } else {
          const list = items()
          const i = idx()
          const depth = parseInt(node?.dataset.treeDepth ?? '0')
          list
            .slice(0, i)
            .reverse()
            .find(
              (el) =>
                parseInt(el.dataset.treeDepth ?? '0') < depth && el.hasAttribute('data-tree-folder')
            )
            ?.focus()
        }
      },
      KeyJ: (e) => {
        if (isInput()) return
        e.preventDefault()
        items()[idx() + 1]?.focus()
      },
      KeyK: (e) => {
        if (isInput()) return
        e.preventDefault()
        items()[Math.max(0, idx() - 1)]?.focus()
      },
      KeyL: (e) => {
        if (isInput()) return
        e.preventDefault()
        const node = active()
        if (!node?.hasAttribute('data-tree-folder')) return
        if (node.getAttribute('data-state') === 'open') {
          items()[idx() + 1]?.focus()
        } else {
          node.click()
        }
      },
      KeyH: (e) => {
        if (isInput()) return
        e.preventDefault()
        const node = active()
        if (node?.hasAttribute('data-tree-folder') && node.getAttribute('data-state') === 'open') {
          node.click()
        } else {
          const list = items()
          const i = idx()
          const depth = parseInt(node?.dataset.treeDepth ?? '0')
          list
            .slice(0, i)
            .reverse()
            .find(
              (el) =>
                parseInt(el.dataset.treeDepth ?? '0') < depth && el.hasAttribute('data-tree-folder')
            )
            ?.focus()
        }
      }
    })

    return unsubscribe
  }, [root])

  if (!currentSession) {
    return (
      <section
        ref={ref}
        id="project-tree"
        tabIndex={0}
        className="flex items-center justify-center h-full w-full px-4 py-3 min-w-max outline-none text-gray-400"
      >
        {t('noProject')}
      </section>
    )
  }

  if (isLoading && !root) {
    return (
      <section
        ref={ref}
        id="project-tree"
        tabIndex={0}
        className="flex items-center justify-center h-full w-full px-4 py-3 min-w-max outline-none text-gray-400"
      >
        {t('loading')}
      </section>
    )
  }

  if (!root || root.nestedItems.length === 0) {
    return (
      <section
        ref={ref}
        id="project-tree"
        tabIndex={0}
        className="flex flex-col items-center justify-center gap-3 h-full w-full px-4 py-3 min-w-max outline-none text-gray-400"
      >
        <p>{t('noFolders')}</p>
        {creatingStep ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 rounded-md">
            {creatingStep === 'locale' ? (
              <Globe className="size-[18px] shrink-0 text-gray-400" />
            ) : (
              <FileJson2 className="size-[18px] shrink-0 text-gray-400" />
            )}
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              onBlur={() => {
                setCreatingStep(null)
                setInputValue('')
              }}
              placeholder={creatingStep === 'locale' ? 'locale name' : 'namespace name'}
              className="bg-transparent outline-none text-sm w-28 placeholder:text-gray-600 text-gray-200"
            />
          </div>
        ) : (
          <button
            onClick={startAddingNamespace}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <Plus className="size-4" />
            {t('addNamespace')}
          </button>
        )}
      </section>
    )
  }

  return (
    <section
      ref={ref}
      id="project-tree"
      tabIndex={0}
      className="flex items-start justify-start h-full w-full px-4 py-3 min-w-max outline-none"
      onFocus={(e) => {
        if (e.target === e.currentTarget) {
          getVisibleItems(e.currentTarget).at(0)?.focus()
        }
      }}
    >
      <div className="flex flex-col gap-1 w-full">
        <FileTreeGroup {...root} defaultOpen={true} folderPath="" />
      </div>
    </section>
  )
}
