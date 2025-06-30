import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryProvider } from './providers'
import { router } from './router'

/**
 * Loading fallback component
 */
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60">Đang tải...</p>
      </div>
    </div>
  )
}

/**
 * Main App component
 */
function App() {
  return (
    <QueryProvider>
      <Suspense fallback={<LoadingFallback />}>
        <RouterProvider router={router} />
      </Suspense>
    </QueryProvider>
  )
}

export default App
