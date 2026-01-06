import { createHashRouter } from 'react-router-dom'
import { routerPaths } from './routerPaths'
import ProjectSelectPage from '@renderer/pages/ProjectSelect'
import EditorPage from '@renderer/pages/Editor'

export const router = createHashRouter([
  {
    path: routerPaths.projectSelect,
    Component: ProjectSelectPage
  },
  {
    path: routerPaths.editor,
    Component: EditorPage
  }
])
