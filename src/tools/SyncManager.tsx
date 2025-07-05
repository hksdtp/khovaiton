/**
 * Sync Manager Tool
 * Ninh ơi, tool này quản lý đồng bộ giữa Cloudinary và database
 */

import React, { useState, useEffect } from 'react'
import { RefreshCw, Cloud, HardDrive, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react'
import { Button } from '@/common/design-system/components'
import { syncService, SyncStats } from '@/services/syncService'
import { useFabrics } from '@/features/inventory/hooks/useFabrics'

export function SyncManager() {
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [syncStatus, setSyncStatus] = useState<{
    cloudinary: number
    staticFiles: number
    missing: number
  } | null>(null)

  const { data: fabricsData } = useFabrics({
    page: 1,
    limit: 1000, // Get all fabrics for sync
    search: '',
    filters: {}
  })

  const fabricCodes = fabricsData?.data.map(f => f.code) || []

  // Load sync status on mount
  useEffect(() => {
    if (fabricCodes.length > 0) {
      loadSyncStatus()
    }
  }, [fabricCodes.length])

  const loadSyncStatus = async () => {
    if (fabricCodes.length === 0) return

    try {
      const status = await syncService.getSyncStatus(fabricCodes)
      setSyncStatus(status)
    } catch (error) {
      console.error('Failed to load sync status:', error)
    }
  }

  const handleFullSync = async () => {
    if (fabricCodes.length === 0) return

    setIsLoading(true)
    try {
      console.log(`🔄 Starting full sync for ${fabricCodes.length} fabrics`)
      
      const stats = await syncService.syncAllFabrics(fabricCodes)
      setSyncStats(stats)
      setLastSyncTime(new Date())
      
      // Refresh status
      await loadSyncStatus()
      
      console.log(`✅ Full sync completed:`, stats)
    } catch (error) {
      console.error('❌ Full sync failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearCache = () => {
    syncService.clearCache()
    loadSyncStatus() // Refresh status
  }

  const getCacheStats = () => {
    return syncService.getCacheStats()
  }

  const cacheStats = getCacheStats()

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Sync Manager
        </h1>
        <p className="text-gray-600">
          Quản lý đồng bộ ảnh giữa Cloudinary và static files
        </p>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cloudinary Images */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <Cloud className="w-6 h-6 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Cloudinary</h3>
          </div>
          <div className="text-2xl font-bold text-blue-900 mb-1">
            {syncStatus?.cloudinary || 0}
          </div>
          <div className="text-sm text-blue-700">
            ảnh trên cloud
          </div>
        </div>

        {/* Static Images */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <HardDrive className="w-6 h-6 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Static Files</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {syncStatus?.staticFiles || 0}
          </div>
          <div className="text-sm text-gray-700">
            ảnh local
          </div>
        </div>

        {/* Missing Images */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="font-semibold text-red-900">Missing</h3>
          </div>
          <div className="text-2xl font-bold text-red-900 mb-1">
            {syncStatus?.missing || 0}
          </div>
          <div className="text-sm text-red-700">
            chưa có ảnh
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Sync Actions
        </h3>
        
        <div className="flex items-center gap-4 flex-wrap">
          <Button
            onClick={handleFullSync}
            disabled={isLoading || fabricCodes.length === 0}
            isLoading={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {isLoading ? 'Đang sync...' : 'Full Sync'}
          </Button>

          <Button
            variant="secondary"
            onClick={handleClearCache}
            className="flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Clear Cache
          </Button>

          <Button
            variant="ghost"
            onClick={loadSyncStatus}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Status
          </Button>
        </div>

        {lastSyncTime && (
          <div className="mt-4 text-sm text-gray-600">
            Last sync: {lastSyncTime.toLocaleString()}
          </div>
        )}
      </div>

      {/* Cache Stats */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Cache Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">Cache Size</div>
            <div className="text-lg font-semibold">{cacheStats.size} entries</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-600">Total Fabrics</div>
            <div className="text-lg font-semibold">{fabricCodes.length} codes</div>
          </div>
        </div>
      </div>

      {/* Sync Results */}
      {syncStats && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Last Sync Results</h3>
          
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{syncStats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{syncStats.synced}</div>
              <div className="text-sm text-gray-600">Synced</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{syncStats.missing}</div>
              <div className="text-sm text-gray-600">Missing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{syncStats.errors}</div>
              <div className="text-sm text-gray-600">Errors</div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {syncStats.results.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  result.status === 'synced' 
                    ? 'bg-green-50 border-green-200'
                    : result.status === 'missing'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {result.status === 'synced' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {result.status === 'missing' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                    {result.status === 'error' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    
                    <div>
                      <div className="font-medium text-sm">{result.fabricCode}</div>
                      {result.error && (
                        <div className="text-xs text-red-600">{result.error}</div>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    {result.status === 'synced' && '☁️ Cloudinary'}
                    {result.status === 'missing' && '❌ No image'}
                    {result.status === 'error' && '⚠️ Error'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">💡 Hướng dẫn:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Full Sync:</strong> Kiểm tra tất cả fabric codes và cập nhật cache</li>
          <li>• <strong>Clear Cache:</strong> Xóa cache để force reload ảnh từ Cloudinary</li>
          <li>• <strong>Priority:</strong> Cloudinary → Static Files → Missing</li>
          <li>• <strong>Cache TTL:</strong> 5 phút (tự động refresh)</li>
        </ul>
      </div>
    </div>
  )
}
