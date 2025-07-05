import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'

// Lazy load components for code splitting
const InventoryPage = lazy(() => import('@/features/inventory'))
const BulkImageUploader = lazy(() => import('@/tools/BulkImageUploader').then(module => ({ default: module.BulkImageUploader })))
const SyncManager = lazy(() => import('@/tools/SyncManager').then(module => ({ default: module.SyncManager })))

/**
 * Application routes configuration
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <InventoryPage />,
    errorElement: <div>Something went wrong!</div>,
  },
  {
    path: '/inventory',
    element: <InventoryPage />,
  },
  {
    path: '/tools/bulk-upload',
    element: <BulkImageUploader />,
  },
  {
    path: '/tools/sync-manager',
    element: <SyncManager />,
  },
  // Add more routes here as features are added
  {
    path: '*',
    element: (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">404</h1>
          <p className="text-white/60">Trang không tồn tại</p>
        </div>
      </div>
    ),
  },
])
