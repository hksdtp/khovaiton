import { Suspense, useEffect, useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryProvider } from './providers'
import { router } from './router'
import {
  initializeApp,
  setupErrorHandling,
  setupPerformanceMonitoring,
  type InitializationResult
} from './services/appInitializationService'

// import { isDevelopment } from '@/shared/config/environment'

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
  const [initResult, setInitResult] = useState<InitializationResult | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    async function initialize() {
      try {
        // Setup error handling first
        setupErrorHandling()

        // Setup performance monitoring
        setupPerformanceMonitoring()

        // Initialize app
        const result = await initializeApp()
        setInitResult(result)

      } catch (error) {
        console.error('App initialization failed:', error)
        setInitResult({
          success: false,
          errors: [`Initialization failed: ${error}`],
          warnings: [],
          features: {
            googleDriveSync: false,
            onlineImageSync: false,
            periodicSync: false
          }
        })
      } finally {
        setIsInitializing(false)
      }
    }

    initialize()
  }, [])

  // Show loading screen during initialization
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Khởi động Kho Vải Tôn</h2>
          <p className="text-gray-600">Đang tải dữ liệu và đồng bộ ảnh...</p>
        </div>
      </div>
    )
  }

  // Show error screen if initialization failed critically
  if (initResult && !initResult.success && initResult.errors.length > 0) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-red-900 mb-2">Lỗi khởi động</h2>
          <div className="text-red-700 text-sm space-y-1">
            {initResult.errors.map((error, index) => (
              <p key={index}>• {error}</p>
            ))}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <QueryProvider>
      <Suspense fallback={<LoadingFallback />}>
        <RouterProvider router={router} />
      </Suspense>
    </QueryProvider>
  )
}

export default App
