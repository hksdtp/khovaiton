import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'

// Lazy load components for code splitting
const InventoryPage = lazy(() => import('@/features/inventory'))
const SaleInventoryPage = lazy(() => import('@/features/marketing/components/SaleInventoryPage').then(module => ({ default: module.SaleInventoryPage })))
const MarketingInventoryPage = lazy(() => import('@/features/marketing/components/MarketingInventoryPage').then(module => ({ default: module.MarketingInventoryPage })))
const VersionSelector = lazy(() => import('@/features/marketing/components/VersionSelector').then(module => ({ default: module.VersionSelector })))
const BulkImageUploader = lazy(() => import('@/tools/BulkImageUploader').then(module => ({ default: module.BulkImageUploader })))
const SyncManager = lazy(() => import('@/tools/SyncManager').then(module => ({ default: module.SyncManager })))
const SupabaseTest = lazy(() => import('@/debug/SupabaseTest'))

/**
 * Application routes configuration
 * Ninh ơi, đã thêm 2 phiên bản: Sale và Marketing
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <VersionSelector />,
    errorElement: <div>Something went wrong!</div>,
  },
  {
    path: '/inventory',
    element: <InventoryPage />,
  },
  // SALE VERSION - Phiên bản cho Sale team (hiện tại)
  {
    path: '/sale',
    element: <SaleInventoryPage />,
  },
  // MARKETING VERSION - Phiên bản cho Marketing team (có popup thu thập thông tin)
  {
    path: '/marketing',
    element: <MarketingInventoryPage />,
  },
  {
    path: '/tools/bulk-upload',
    element: <BulkImageUploader />,
  },
  {
    path: '/tools/sync-manager',
    element: <SyncManager />,
  },
  {
    path: '/debug/supabase',
    element: <SupabaseTest />,
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
], {
  future: {
    // Enable React Router v7 future flags to remove warnings
    // v7_startTransition: true, // Not available in current version
  }
})
