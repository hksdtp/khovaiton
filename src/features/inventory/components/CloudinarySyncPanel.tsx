/**
 * Panel để đồng bộ với Cloudinary
 * Ninh ơi, component này cho phép sync 2 chiều với Cloudinary
 */

import { useState } from 'react'
import { Button } from '@/common/design-system/components'
import { cloudinarySyncService, type CloudinaryImage } from '@/services/cloudinarySyncService'
import { syncService } from '@/services/syncService'
import { RefreshCw, Cloud, Database, CheckCircle, AlertCircle, Smartphone, ImageIcon } from 'lucide-react'

interface SyncStatus {
  isLoading: boolean
  lastSync?: Date
  totalImages: number
  mappedImages: number
  newMappings: number
  error?: string
}

export function CloudinarySyncPanel() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isLoading: false,
    totalImages: 0,
    mappedImages: 0,
    newMappings: 0
  })
  
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null)
  const [mappings, setMappings] = useState<CloudinaryImage[]>([])

  /**
   * Check if sync API is available
   */
  const checkAPI = async () => {
    const available = await cloudinarySyncService.checkAPIStatus()
    setApiAvailable(available)
    return available
  }

  /**
   * Perform full sync from Cloudinary
   */
  const handleFullSync = async () => {
    setSyncStatus(prev => ({ ...prev, isLoading: true, error: '' }))
    
    try {
      // Check API first
      const available = await checkAPI()
      if (!available) {
        throw new Error('Sync API không khả dụng. Cần deploy API endpoint.')
      }

      // Perform sync
      const result = await cloudinarySyncService.fullSync()
      
      if (result.success) {
        // Get updated mappings
        const syncResult = await cloudinarySyncService.syncFromCloudinary()
        if (syncResult.success) {
          setMappings(syncResult.mappings)
        }
        
        setSyncStatus({
          isLoading: false,
          lastSync: new Date(),
          totalImages: result.totalMappings,
          mappedImages: result.newMappings,
          newMappings: result.newMappings
        })
        
        // Force refresh fabric data
        window.location.reload()
        
      } else {
        throw new Error(result.error || 'Sync thất bại')
      }
      
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        error: (error as Error).message
      }))
    }
  }

  /**
   * Get current storage info
   */
  const getStorageInfo = () => {
    return syncService.getStorageInfo()
  }

  /**
   * Force cloud sync
   */
  const handleCloudSync = async () => {
    setSyncStatus(prev => ({ ...prev, isLoading: true, error: '' }))

    try {
      const result = await syncService.forceCloudSync()

      if (result.success) {
        setSyncStatus(prev => ({
          ...prev,
          isLoading: false,
          lastSync: new Date(),
          newMappings: result.localToCloud + result.cloudToLocal
        }))

        // Refresh page to show updated images
        window.location.reload()
      } else {
        throw new Error(result.error || 'Cloud sync failed')
      }
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        error: (error as Error).message
      }))
    }
  }

  /**
   * Clear all storage
   */
  const handleClearStorage = () => {
    if (confirm('Bạn có chắc muốn xóa tất cả dữ liệu đã lưu?')) {
      syncService.clearAllStorage()
      setSyncStatus({
        isLoading: false,
        totalImages: 0,
        mappedImages: 0,
        newMappings: 0
      })
      setMappings([])
      window.location.reload()
    }
  }

  /**
   * Refresh image status by checking Cloudinary
   */
  const handleRefreshImageStatus = async () => {
    setSyncStatus(prev => ({ ...prev, isLoading: true, error: '' }))

    try {
      // Get all fabric codes from current data
      const fabricModule = await import('@/shared/mocks/fabricData')
      const fabrics = await fabricModule.getMockFabrics()
      const fabricCodes = fabrics.map(f => f.code)

      // Refresh image status
      const result = await syncService.refreshImageStatus(fabricCodes)

      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        lastSync: new Date(),
        newMappings: result.updated.length
      }))

      if (result.updated.length > 0) {
        console.log(`✅ Updated image status for ${result.updated.length} fabrics:`, result.updated)
        // Refresh page to show updated counts
        window.location.reload()
      } else {
        console.log('ℹ️ No new images found')
      }

    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        error: (error as Error).message
      }))
    }
  }

  const storageInfo = getStorageInfo()

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Cloud className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Đồng bộ Cloudinary
        </h3>
      </div>

      {/* API Status */}
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
        <Database className="w-5 h-5" />
        <span className="text-sm font-medium">Trạng thái API:</span>
        {apiAvailable === null ? (
          <span className="text-gray-600">Chưa kiểm tra</span>
        ) : apiAvailable ? (
          <span className="text-green-600 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            Khả dụng
          </span>
        ) : (
          <span className="text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            Không khả dụng
          </span>
        )}
        <Button
          variant="secondary"
          size="sm"
          onClick={checkAPI}
          className="ml-auto"
        >
          Kiểm tra
        </Button>
      </div>

      {/* Storage Info */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-600 font-medium">Ảnh đã lưu</div>
          <div className="text-2xl font-bold text-blue-900">
            {storageInfo.uploadedCount}
          </div>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="text-sm text-green-600 font-medium">Cache</div>
          <div className="text-2xl font-bold text-green-900">
            {storageInfo.cacheCount}
          </div>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg">
          <div className="text-sm text-purple-600 font-medium flex items-center gap-1">
            <Smartphone className="w-3 h-3" />
            Cloud Sync
          </div>
          <div className="text-xs text-purple-700">
            {storageInfo.cloudSync?.lastSyncTime
              ? new Date(storageInfo.cloudSync.lastSyncTime).toLocaleTimeString('vi-VN')
              : 'Chưa sync'
            }
          </div>
        </div>
      </div>

      {/* Sync Status */}
      {syncStatus.lastSync && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            Lần sync cuối: {syncStatus.lastSync.toLocaleString('vi-VN')}
          </div>
          <div className="text-sm text-gray-600">
            Tổng ảnh: {syncStatus.totalImages} | 
            Đã map: {syncStatus.mappedImages} | 
            Mới: {syncStatus.newMappings}
          </div>
        </div>
      )}

      {/* Error Display */}
      {syncStatus.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm text-red-800">
            <strong>Lỗi:</strong> {syncStatus.error}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <Button
            onClick={handleFullSync}
            disabled={syncStatus.isLoading}
            isLoading={syncStatus.isLoading}
            className="flex-1"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Đồng bộ từ Cloudinary
          </Button>

          <Button
            variant="secondary"
            onClick={handleCloudSync}
            disabled={syncStatus.isLoading}
            className="flex-1"
          >
            <Smartphone className="w-4 h-4 mr-2" />
            Đồng bộ thiết bị
          </Button>
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleRefreshImageStatus}
            disabled={syncStatus.isLoading}
            className="flex-1"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Làm mới trạng thái ảnh
          </Button>

          <Button
            variant="secondary"
            onClick={handleClearStorage}
            disabled={syncStatus.isLoading}
            className="flex-1"
          >
            Xóa cache
          </Button>
        </div>
      </div>

      {/* Mappings List */}
      {mappings.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">
            Ảnh đã tìm thấy ({mappings.length})
          </h4>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {mappings.map((mapping, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 bg-gray-50 rounded text-sm"
              >
                <img
                  src={mapping.url}
                  alt={mapping.fabricCode}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="font-medium">{mapping.fabricCode}</div>
                  <div className="text-gray-600">{mapping.size} • {mapping.bytes} bytes</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>💡 <strong>Hướng dẫn:</strong></div>
        <div>• <strong>Đồng bộ từ Cloudinary:</strong> Tìm ảnh mới trên Cloudinary</div>
        <div>• <strong>Đồng bộ thiết bị:</strong> Đồng bộ ảnh giữa các thiết bị</div>
        <div>• <strong>Làm mới trạng thái ảnh:</strong> Cập nhật số lượng ảnh có/chưa có</div>
        <div>• Ảnh được lưu trên cloud để hiển thị đồng nhất</div>
        <div>• Tự động sync mỗi 30 giây</div>
      </div>
    </div>
  )
}
