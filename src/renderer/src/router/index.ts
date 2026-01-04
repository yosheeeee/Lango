import App from '@renderer/App'
import { createHashRouter } from 'react-router-dom'

export const router = createHashRouter([
  {
    index: true,
    Component: App
  }
])
