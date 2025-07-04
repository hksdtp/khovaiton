/**
 * Google Drive Sync Modal
 * Ninh ơi, modal này giúp sync ảnh từ Google Drive về local
 */

import { useState, useEffect } from 'react'
import { Cloud, Download, RefreshCw, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'
import { Modal } from '@/common/design-system/components'
import { Button } from '@/common/design-system/components'
import {
  syncImagesFromDrive as syncImagesLocal,
  getDriveFiles,
  getSyncStatus,
  type SyncResult,
  type DriveFile
} from '../services/googleDriveService'
import {
  syncImagesFromDrive as syncImagesOnline,
  getSyncStatistics,
  type OnlineSyncResult,
  type SyncProgress
} from '../services/onlineImageSyncService'
import { isProduction } from '@/shared/config/environment'

interface GoogleDriveSyncModalProps {
  isOpen: boolean
  onClose: () => void
  onSyncComplete?: (result: SyncResult | OnlineSyncResult) => void
}

export function GoogleDriveSyncModal({
  isOpen,
  onClose,
  onSyncComplete
}: GoogleDriveSyncModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setSyncing] = useState(false)
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([])
  const [syncResult, setSyncResult] = useState<SyncResult | OnlineSyncResult | null>(null)
  const [syncProgress, setSyncProgress] = useState<SyncProgress>({ current: 0, total: 0, fileName: '', status: 'downloading' })
  const [syncStatus, setSyncStatus] = useState<any>(null)
  const [isOnlineMode] = useState(isProduction)

  // Load Drive files when modal opens
  useEffect(() => {
    if (isOpen) {
      loadDriveFiles()
      loadSyncStatus()
    }
  }, [isOpen])

  const loadDriveFiles = async () => {
    setIsLoading(true)
    try {
      if (isOnlineMode) {
        // For online mode, we don't need to load individual files
        // Just show statistics
        setDriveFiles([])
      } else {
        const files = await getDriveFiles()
        setDriveFiles(files)
      }
    } catch (error) {
      console.error('Failed to load Drive files:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadSyncStatus = async () => {
    try {
      if (isOnlineMode) {
        const stats = await getSyncStatistics()
        setSyncStatus({
          totalFiles: stats.totalImageFiles,
          syncedFiles: stats.cachedImages,
          lastSync: new Date()
        })
      } else {
        const status = await getSyncStatus()
        setSyncStatus(status)
      }
    } catch (error) {
      console.error('Failed to load sync status:', error)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    setSyncResult(null)
    setSyncProgress({ current: 0, total: 0, fileName: '', status: 'downloading' })

    try {
      if (isOnlineMode) {
        // Online sync for production
        const result = await syncImagesOnline((progress) => {
          setSyncProgress(progress)
        })

        setSyncResult(result)
        onSyncComplete?.(result)

      } else {
        // Local sync for development
        const result = await syncImagesLocal(
          undefined, // Use default folder ID
          (current, total, fileName) => {
            setSyncProgress({ current, total, fileName, status: 'downloading' })
          }
        )

        setSyncResult(result)
        onSyncComplete?.(result)
      }

      // Reload sync status
      await loadSyncStatus()

    } catch (error) {
      setSyncResult({
        success: false,
        message: `Lỗi sync: ${error}`,
        totalFiles: 0,
        processedFiles: 0,
        successCount: 0,
        errorCount: 1,
        errors: [String(error)],
        syncedImages: []
      })
    } finally {
      setSyncing(false)
    }
  }

  const renderSyncStatus = () => {
    if (!syncStatus) return null

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-3">📊 Trạng thái sync</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{syncStatus.totalFiles}</div>
            <div className="text-sm text-blue-700">Tổng ảnh Drive</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{syncStatus.syncedFiles}</div>
            <div className="text-sm text-green-700">Đã sync</div>
          </div>
        </div>

        {syncStatus.lastSync && (
          <div className="text-sm text-blue-600">
            Sync cuối: {syncStatus.lastSync.toLocaleString('vi-VN')}
          </div>
        )}
      </div>
    )
  }

  const renderDriveFiles = () => {
    if (isLoading) {
      return (
        <div className="text-center py-4">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-600">Đang tải danh sách ảnh...</p>
        </div>
      )
    }

    if (driveFiles.length === 0) {
      return (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-orange-600 mr-2" />
            <span className="text-orange-800">
              Không tìm thấy ảnh nào trong Google Drive folder
            </span>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">
          📁 Ảnh trong Google Drive ({driveFiles.length})
        </h3>
        
        <div className="max-h-40 overflow-y-auto space-y-2">
          {driveFiles.slice(0, 10).map((file, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-gray-700 truncate flex-1">{file.name}</span>
              <div className="flex items-center gap-2 ml-2">
                <span className="text-gray-500">
                  {Math.round(parseInt(file.size) / 1024)}KB
                </span>
                <a 
                  href={file.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
          
          {driveFiles.length > 10 && (
            <div className="text-sm text-gray-500 text-center pt-2">
              ... và {driveFiles.length - 10} ảnh khác
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderSyncProgress = () => {
    if (!isSyncing) return null

    const percentage = syncProgress.total > 0 
      ? Math.round((syncProgress.current / syncProgress.total) * 100) 
      : 0

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center mb-3">
          <Download className="w-5 h-5 text-blue-600 mr-2" />
          <span className="font-medium text-blue-900">Đang sync ảnh...</span>
        </div>
        
        <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <div className="text-sm text-blue-700">
          {syncProgress.current}/{syncProgress.total} - {syncProgress.fileName}
        </div>
      </div>
    )
  }

  const renderSyncResult = () => {
    if (!syncResult) return null

    return (
      <div className={`border rounded-lg p-4 mb-6 ${
        syncResult.success 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center mb-2">
          {syncResult.success ? (
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          )}
          <span className={`font-medium ${
            syncResult.success ? 'text-green-900' : 'text-red-900'
          }`}>
            {syncResult.message}
          </span>
        </div>

        {syncResult.errors.length > 0 && (
          <div className="mt-3">
            <p className="text-sm text-red-700 font-medium mb-1">Lỗi:</p>
            <div className="max-h-20 overflow-y-auto">
              {syncResult.errors.map((error, index) => (
                <p key={index} className="text-sm text-red-600">• {error}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="☁️ Sync từ Google Drive"
      size="lg"
    >
      <div className="p-6">
        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-900 mb-2">📋 Lưu ý quan trọng</h3>
          <div className="text-sm text-yellow-800 space-y-1">
            <p>• Folder Drive phải được public (Anyone with link can view)</p>
            <p>• Tên file ảnh phải chính xác với mã vải</p>
            <p>• Hỗ trợ: .jpg, .png, .webp (tối đa 10MB/ảnh)</p>
            <p>• Ảnh sẽ được download về máy bạn</p>
          </div>
        </div>

        {renderSyncStatus()}
        {renderDriveFiles()}
        {renderSyncProgress()}
        {renderSyncResult()}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={loadDriveFiles}
            disabled={isLoading || isSyncing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <div className="space-x-3">
            <Button variant="outline" onClick={onClose} disabled={isSyncing}>
              Đóng
            </Button>
            <Button 
              onClick={handleSync}
              disabled={isLoading || isSyncing || driveFiles.length === 0}
            >
              <Cloud className="w-4 h-4 mr-2" />
              {isSyncing ? 'Đang sync...' : 'Sync ảnh'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
