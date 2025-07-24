/**
 * Auto Sync Service - Tự động đồng bộ trạng thái ảnh
 * Tự động kiểm tra và cập nhật trạng thái ảnh từ Cloudinary
 */

import { syncService } from './syncService'
// import { cloudinaryService } from './cloudinaryService'

export interface AutoSyncConfig {
  enabled: boolean
  intervalMinutes: number
  maxRetries: number
  notifyOnUpdate: boolean
}

export interface AutoSyncStatus {
  isRunning: boolean
  lastSync: Date | null
  nextSync: Date | null
  totalChecked: number
  newImagesFound: number
  errors: string[]
  config: AutoSyncConfig
}

class AutoSyncService {
  private static instance: AutoSyncService
  private intervalId: NodeJS.Timeout | null = null
  private isRunning = false
  private status: AutoSyncStatus
  private config: AutoSyncConfig

  constructor() {
    this.config = {
      enabled: true,
      intervalMinutes: 5, // Kiểm tra mỗi 5 phút
      maxRetries: 3,
      notifyOnUpdate: true
    }

    this.status = {
      isRunning: false,
      lastSync: null,
      nextSync: null,
      totalChecked: 0,
      newImagesFound: 0,
      errors: [],
      config: this.config
    }

    // Load config from localStorage
    this.loadConfig()
  }

  static getInstance(): AutoSyncService {
    if (!AutoSyncService.instance) {
      AutoSyncService.instance = new AutoSyncService()
    }
    return AutoSyncService.instance
  }

  /**
   * Load config from localStorage
   */
  private loadConfig(): void {
    try {
      const saved = localStorage.getItem('autoSyncConfig')
      if (saved) {
        const savedConfig = JSON.parse(saved)
        this.config = { ...this.config, ...savedConfig }
        this.status.config = this.config
      }
    } catch (error) {
      console.warn('⚠️ Failed to load auto-sync config:', error)
    }
  }

  /**
   * Save config to localStorage
   */
  private saveConfig(): void {
    try {
      localStorage.setItem('autoSyncConfig', JSON.stringify(this.config))
    } catch (error) {
      console.warn('⚠️ Failed to save auto-sync config:', error)
    }
  }

  /**
   * Start auto sync
   */
  start(): void {
    if (this.isRunning) {
      console.log('🔄 Auto-sync is already running')
      return
    }

    if (!this.config.enabled) {
      console.log('⏸️ Auto-sync is disabled')
      return
    }

    console.log(`🚀 Starting auto-sync (every ${this.config.intervalMinutes} minutes)`)
    
    this.isRunning = true
    this.status.isRunning = true
    this.updateNextSyncTime()

    // Run immediately first time
    this.performSync()

    // Set up interval
    this.intervalId = setInterval(() => {
      this.performSync()
    }, this.config.intervalMinutes * 60 * 1000)
  }

  /**
   * Stop auto sync
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('⏹️ Auto-sync is not running')
      return
    }

    console.log('⏹️ Stopping auto-sync')
    
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    this.isRunning = false
    this.status.isRunning = false
    this.status.nextSync = null
  }

  /**
   * Perform sync operation
   */
  private async performSync(): Promise<void> {
    console.log('🔄 Auto-sync: Starting sync operation...')
    
    try {
      // Get all fabric codes
      const fabricModule = await import('@/shared/mocks/fabricData')
      const fabrics = await fabricModule.getMockFabrics()
      const fabricCodes = fabrics.map(f => f.code)

      console.log(`📊 Auto-sync: Checking ${fabricCodes.length} fabric codes...`)

      // Perform refresh
      const result = await syncService.refreshImageStatus(fabricCodes)

      // Update status
      this.status.lastSync = new Date()
      this.status.totalChecked = result.total
      this.status.newImagesFound += result.updated.length
      this.updateNextSyncTime()

      if (result.updated.length > 0) {
        console.log(`✅ Auto-sync: Found ${result.updated.length} new images`)
        console.log(`📝 New images for: ${result.updated.join(', ')}`)

        // Show notification if enabled
        if (this.config.notifyOnUpdate) {
          this.showNotification(result.updated.length, result.updated)
        }

        // Trigger UI update
        this.notifyUIUpdate(result.updated.length)

        // Invalidate React Query cache to refresh UI
        this.invalidateQueryCache()

        // Auto-refresh page to show updated counts (optional)
        // Uncomment if you want automatic page refresh
        // setTimeout(() => {
        //   window.location.reload()
        // }, 2000)
      } else {
        console.log('ℹ️ Auto-sync: No new images found')
      }

      // Clear errors on success
      this.status.errors = []

    } catch (error) {
      const errorMessage = (error as Error).message
      console.error('❌ Auto-sync error:', errorMessage)
      
      this.status.errors.push(`${new Date().toLocaleTimeString()}: ${errorMessage}`)
      
      // Keep only last 5 errors
      if (this.status.errors.length > 5) {
        this.status.errors = this.status.errors.slice(-5)
      }
    }
  }

  /**
   * Update next sync time
   */
  private updateNextSyncTime(): void {
    if (this.isRunning && this.config.enabled) {
      const nextSync = new Date()
      nextSync.setMinutes(nextSync.getMinutes() + this.config.intervalMinutes)
      this.status.nextSync = nextSync
    }
  }

  /**
   * Show browser notification
   */
  private showNotification(count: number, fabricCodes: string[]): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🖼️ Tìm thấy ảnh mới!', {
        body: `Đã tìm thấy ${count} ảnh mới cho các mẫu vải`,
        icon: '/favicon.ico',
        tag: 'auto-sync-update'
      })
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      // Request permission
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.showNotification(count, fabricCodes)
        }
      })
    }
  }

  /**
   * Notify UI components about updates
   */
  private notifyUIUpdate(newImageCount: number): void {
    // Dispatch custom event for UI components to listen
    const event = new CustomEvent('autoSyncUpdate', {
      detail: {
        newImageCount,
        timestamp: new Date(),
        status: this.status
      }
    })
    window.dispatchEvent(event)
  }

  /**
   * Invalidate React Query cache to refresh UI
   */
  private invalidateQueryCache(): void {
    try {
      // Dispatch event to invalidate React Query cache
      const event = new CustomEvent('invalidateImageStatusCache', {
        detail: {
          timestamp: new Date(),
          reason: 'auto-sync-update'
        }
      })
      window.dispatchEvent(event)

      console.log('🔄 Invalidated React Query cache for image status')
    } catch (error) {
      console.warn('⚠️ Failed to invalidate query cache:', error)
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AutoSyncConfig>): void {
    const oldEnabled = this.config.enabled
    const oldInterval = this.config.intervalMinutes

    this.config = { ...this.config, ...newConfig }
    this.status.config = this.config
    this.saveConfig()

    console.log('⚙️ Auto-sync config updated:', this.config)

    // Restart if interval changed or enabled status changed
    if (this.isRunning && (
      oldInterval !== this.config.intervalMinutes ||
      oldEnabled !== this.config.enabled
    )) {
      this.stop()
      if (this.config.enabled) {
        this.start()
      }
    } else if (!oldEnabled && this.config.enabled) {
      this.start()
    } else if (oldEnabled && !this.config.enabled) {
      this.stop()
    }
  }

  /**
   * Get current status
   */
  getStatus(): AutoSyncStatus {
    return { ...this.status }
  }

  /**
   * Manual trigger sync
   */
  async triggerSync(): Promise<void> {
    console.log('🔄 Manual trigger auto-sync...')
    await this.performSync()
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.status.totalChecked = 0
    this.status.newImagesFound = 0
    this.status.errors = []
    console.log('📊 Auto-sync statistics reset')
  }
}

// Export singleton instance
export const autoSyncService = AutoSyncService.getInstance()

// Auto-start when module loads
setTimeout(() => {
  autoSyncService.start()
}, 2000) // Wait 2 seconds after page load
