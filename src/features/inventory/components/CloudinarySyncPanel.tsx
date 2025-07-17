/**
 * Panel để đồng bộ với Cloudinary
 * Ninh ơi, component này cho phép sync 2 chiều với Cloudinary
 */

import { useState } from 'react'
import { Button } from '@/common/design-system/components'
import { cloudinarySyncService, type CloudinaryImage } from '@/services/cloudinarySyncService'
import { syncService } from '@/services/syncService'
import { RefreshCw, Cloud, Database, CheckCircle, AlertCircle } from 'lucide-react'

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
      <div className="grid grid-cols-2 gap-4">
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
          onClick={handleClearStorage}
          disabled={syncStatus.isLoading}
        >
          Xóa cache
        </Button>
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
        <div>• Nhấn "Đồng bộ từ Cloudinary" để tìm ảnh mới</div>
        <div>• Hệ thống sẽ tự động map ảnh với mã vải</div>
        <div>• Ảnh được lưu trong localStorage để persist</div>
      </div>
    </div>
  )
}
