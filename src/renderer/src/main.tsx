import '@fontsource/geist'
import '@fontsource/geist/600.css'
import '@fontsource/geist/700.css'
import '@fontsource/geist/500.css'
import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import './utils/i18n' // Import without assigning to variable since it initializes automatically

async function startApp() {
  // Wait for i18n to initialize before rendering the app
  const i18n = await import('./utils/i18n')

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  )
}

startApp()
