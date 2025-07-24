/**
 * Auto Sync Status Component
 * Hiển thị trạng thái tự động đồng bộ và cho phép cấu hình
 */

import React, { useState, useEffect } from 'react'
import { autoSyncService, AutoSyncStatus } from '@/services/autoSyncService'
import { Play, Pause, Settings, RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react'

interface AutoSyncStatusProps {
  className?: string
}

export const AutoSyncStatusComponent: React.FC<AutoSyncStatusProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<AutoSyncStatus>(autoSyncService.getStatus())
  const [showSettings, setShowSettings] = useState(false)
  const [newImageCount, setNewImageCount] = useState(0)

  useEffect(() => {
    // Update status every second
    const statusInterval = setInterval(() => {
      setStatus(autoSyncService.getStatus())
    }, 1000)

    // Listen for auto-sync updates
    const handleAutoSyncUpdate = (event: CustomEvent) => {
      const newCount = event.detail.newImageCount
      setNewImageCount(prev => prev + newCount)
      setStatus(autoSyncService.getStatus())

      // Show success message
      if (newCount > 0) {
        console.log(`🎉 Auto-sync UI update: Found ${newCount} new images, refreshing display...`)
      }

      // Reset counter after 5 seconds
      setTimeout(() => {
        setNewImageCount(0)
      }, 5000)
    }

    window.addEventListener('autoSyncUpdate', handleAutoSyncUpdate as EventListener)

    return () => {
      clearInterval(statusInterval)
      window.removeEventListener('autoSyncUpdate', handleAutoSyncUpdate as EventListener)
    }
  }, [])

  const handleToggleAutoSync = () => {
    if (status.isRunning) {
      autoSyncService.stop()
    } else {
      autoSyncService.start()
    }
  }

  const handleManualSync = async () => {
    await autoSyncService.triggerSync()
  }

  const handleConfigChange = (key: string, value: any) => {
    autoSyncService.updateConfig({ [key]: value })
  }

  const formatTimeRemaining = () => {
    if (!status.nextSync) return 'Không hoạt động'
    
    const now = new Date()
    const diff = status.nextSync.getTime() - now.getTime()
    
    if (diff <= 0) return 'Đang chạy...'
    
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${status.isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <h3 className="font-semibold text-gray-900">Tự động đồng bộ</h3>
          {newImageCount > 0 && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full animate-bounce">
              +{newImageCount} ảnh mới!
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleManualSync}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Đồng bộ ngay"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
            title="Cài đặt"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleToggleAutoSync}
            className={`p-2 rounded-lg transition-colors ${
              status.isRunning 
                ? 'text-red-600 hover:text-red-700 hover:bg-red-50' 
                : 'text-green-600 hover:text-green-700 hover:bg-green-50'
            }`}
            title={status.isRunning ? 'Dừng tự động đồng bộ' : 'Bắt đầu tự động đồng bộ'}
          >
            {status.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Status Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{status.totalChecked}</div>
          <div className="text-xs text-gray-600">Đã kiểm tra</div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{status.newImagesFound}</div>
          <div className="text-xs text-gray-600">Ảnh mới tìm thấy</div>
        </div>
      </div>

      {/* Timing Info */}
      <div className="space-y-2 text-sm">
        {status.lastSync && (
          <div className="flex items-center gap-2 text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Lần cuối: {status.lastSync.toLocaleTimeString()}</span>
          </div>
        )}
        
        {status.isRunning && (
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>Tiếp theo: {formatTimeRemaining()}</span>
          </div>
        )}
        
        {status.errors.length > 0 && (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span>Lỗi gần nhất: {status.errors[status.errors.length - 1]}</span>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
          <h4 className="font-medium text-gray-900">Cài đặt tự động đồng bộ</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Bật tự động đồng bộ</label>
              <input
                type="checkbox"
                checked={status.config.enabled}
                onChange={(e) => handleConfigChange('enabled', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Tần suất (phút)</label>
              <select
                value={status.config.intervalMinutes}
                onChange={(e) => handleConfigChange('intervalMinutes', parseInt(e.target.value))}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value={1}>1 phút</option>
                <option value={2}>2 phút</option>
                <option value={5}>5 phút</option>
                <option value={10}>10 phút</option>
                <option value={15}>15 phút</option>
                <option value={30}>30 phút</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Thông báo khi có ảnh mới</label>
              <input
                type="checkbox"
                checked={status.config.notifyOnUpdate}
                onChange={(e) => handleConfigChange('notifyOnUpdate', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => autoSyncService.resetStats()}
              className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Reset thống kê
            </button>
            
            <button
              onClick={() => setShowSettings(false)}
              className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
