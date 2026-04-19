import '@fontsource/geist'
import '@fontsource/geist/600.css'
import '@fontsource/geist/700.css'
import '@fontsource/geist/500.css'
import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { initI18n } from './utils/i18n'
import { initializeSessionStore } from './stores/sessionStore'
import { initializeLanguageStore } from './stores/languageStore'

async function startApp(): Promise<void> {
  const language = await initializeLanguageStore()
  await initI18n(language)
  await initializeSessionStore()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  )
}

startApp()
