import { lazy } from 'react'
import { createHashRouter } from 'react-router-dom'
import { routerPaths } from './routerPaths'

const ProjectSelectPage = lazy(() => import('@renderer/pages/ProjectSelect'))
const EditorPage = lazy(() => import('@renderer/pages/Editor'))
const DetailEmpty = lazy(() => import('@renderer/features/detail/emply'))
const DetailPage = lazy(() => import('@renderer/features/detail/index'))
const LocaleEditorPage = lazy(() => import('@renderer/features/localeEditor/index'))
const AnalyzePage = lazy(() => import('@renderer/features/analyze'))

export const router = createHashRouter([
  {
    path: routerPaths.projectSelect,
    Component: ProjectSelectPage
  },
  {
    path: routerPaths.editor,
    Component: EditorPage,
    children: [
      {
        index: true,
        Component: DetailEmpty
      },
      {
        path: routerPaths.editorLocale,
        Component: LocaleEditorPage
      },
      {
        path: routerPaths.editorFile,
        Component: DetailPage
      },
      {
        path: routerPaths.editorAnalyze,
        Component: AnalyzePage
      }
    ]
  }
])
