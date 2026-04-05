import { useEffect, useRef } from 'react'
import { tinykeys } from 'tinykeys'
import { FileTreeGroup } from '@renderer/components/fileTree'
import { useEditorStore } from '@renderer/stores/visibilityStore'

const mockTree: FileTreeGroup = {
  name: 'locales',
  nestedItems: [
    {
      name: 'en',
      nestedItems: [
        { name: 'common.json', link: '/locales/en/common' },
        { name: 'editor.json', link: '/locales/en/editor' },
        { name: 'headerMenu.json', link: '/locales/en/headerMenu' },
        {
          name: 'addNewProject',
          nestedItems: [
            {
              name: 'errors',
              nestedItems: [
                {
                  name: 'path_existed.json',
                  link: '/locales/en/addNewProject/errors/path_existed'
                },
                {
                  name: 'name_existed.json',
                  link: '/locales/en/addNewProject/errors/name_existed'
                },
                {
                  name: 'folder_not_found.json',
                  link: '/locales/en/addNewProject/errors/folder_not_found'
                },
                {
                  name: 'deepLevel4',
                  nestedItems: [
                    {
                      name: 'error_checking.json',
                      link: '/locales/en/addNewProject/errors/deepLevel4/error_checking'
                    }
                  ]
                }
              ]
            },
            { name: 'title.json', link: '/locales/en/addNewProject/title' },
            { name: 'name.json', link: '/locales/en/addNewProject/name' },
            { name: 'color.json', link: '/locales/en/addNewProject/color' },
            { name: 'projectPath.json', link: '/locales/en/addNewProject/projectPath' }
          ]
        },
        { name: 'projectSearch.json', link: '/locales/en/projectSearch' },
        { name: 'projectSelect.json', link: '/locales/en/projectSelect' },
        {
          name: 'cheetSheet',
          nestedItems: [
            {
              name: 'master',
              nestedItems: [
                {
                  name: 'deepNested',
                  nestedItems: [
                    { name: 'toggle.json', link: '/locales/en/cheetSheet/master/deepNested/toggle' }
                  ]
                }
              ]
            },
            {
              name: 'cheatSheet',
              nestedItems: [
                { name: 'toggle.json', link: '/locales/en/cheetSheet/cheatSheet/toggle' }
              ]
            },
            {
              name: 'search',
              nestedItems: [{ name: 'toggle.json', link: '/locales/en/cheetSheet/search/toggle' }]
            },
            { name: 'title.json', link: '/locales/en/cheetSheet/title' },
            { name: 'keybind.json', link: '/locales/en/cheetSheet/keybind' },
            { name: 'action.json', link: '/locales/en/cheetSheet/action' }
          ]
        }
      ]
    },
    {
      name: 'ru',
      nestedItems: [
        { name: 'common.json', link: '/locales/ru/common' },
        { name: 'editor.json', link: '/locales/ru/editor' },
        { name: 'headerMenu.json', link: '/locales/ru/headerMenu' },
        {
          name: 'addNewProject',
          nestedItems: [
            {
              name: 'errors',
              nestedItems: [
                {
                  name: 'path_existed.json',
                  link: '/locales/ru/addNewProject/errors/path_existed'
                },
                {
                  name: 'name_existed.json',
                  link: '/locales/ru/addNewProject/errors/name_existed'
                },
                {
                  name: 'folder_not_found.json',
                  link: '/locales/ru/addNewProject/errors/folder_not_found'
                }
              ]
            },
            { name: 'title.json', link: '/locales/ru/addNewProject/title' },
            { name: 'name.json', link: '/locales/ru/addNewProject/name' }
          ]
        },
        { name: 'projectSearch.json', link: '/locales/ru/projectSearch' },
        { name: 'projectSelect.json', link: '/locales/ru/projectSelect' },
        { name: 'cheetSheet.json', link: '/locales/ru/cheetSheet' }
      ]
    }
  ]
}

function getVisibleItems(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('[data-tree-item]')).filter(
    (el) => el.offsetHeight > 0
  )
}

export default function ProjectTree() {
  const { projectTreeRef: ref } = useEditorStore()

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const active = () => document.activeElement as HTMLElement
    const items = () => getVisibleItems(el)
    const idx = () => items().indexOf(active())

    const unsubscribe = tinykeys(el, {
      ArrowDown: (e) => {
        e.preventDefault()
        items()[idx() + 1]?.focus()
      },
      ArrowUp: (e) => {
        e.preventDefault()
        items()[Math.max(0, idx() - 1)]?.focus()
      },
      ArrowRight: (e) => {
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
        e.preventDefault()
        items()[idx() + 1]?.focus()
      },
      KeyK: (e) => {
        e.preventDefault()
        items()[Math.max(0, idx() - 1)]?.focus()
      },
      KeyL: (e) => {
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
  }, [])

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
      <FileTreeGroup {...mockTree} defaultOpen={true} />
    </section>
  )
}
