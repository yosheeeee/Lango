import { createHashRouter } from 'react-router-dom'
import { routerPaths } from './routerPaths'
import ProjectSelectPage from '@renderer/pages/ProjectSelect'
import EditorPage from '@renderer/pages/Editor'
import DetailEmpty from '@renderer/modules/detail/emply'
import DetailPage from '@renderer/modules/detail'

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
        path: routerPaths.editorFile,
        Component: DetailPage
      }
    ]
  }
])
