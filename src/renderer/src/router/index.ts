import { createHashRouter } from 'react-router-dom'
import { routerPaths } from './routerPaths'
import ProjectSelectPage from '@renderer/pages/ProjectSelect'
import EditorPage from '@renderer/pages/Editor'
import DetailEmpty from '@renderer/features/detail/emply'
import DetailPage from '@renderer/features/detail/index'
import LocaleEditorPage from '@renderer/features/localeEditor/index'
import AnalyzePage from '@renderer/features/analyze'

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
