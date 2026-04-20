import '@fontsource/geist'
import '@fontsource/geist/600.css'
import '@fontsource/geist/700.css'
import '@fontsource/geist/500.css'
import './index.css'
import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { ErrorBoundary } from '@renderer/components/ui/ErrorBoundary'
import { initI18n } from './utils/i18n'
import { initializeSessionStore } from './stores/sessionStore'
import { initializeLanguageStore } from './stores/languageStore'

function LoadingFallback() {
  return <div className="flex items-center justify-center min-h-screen">Loading...</div>
}

async function startApp(): Promise<void> {
  const language = await initializeLanguageStore()
  await initI18n(language)
  await initializeSessionStore()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <RouterProvider router={router} />
        </Suspense>
      </ErrorBoundary>
    </StrictMode>
  )
}

startApp()
