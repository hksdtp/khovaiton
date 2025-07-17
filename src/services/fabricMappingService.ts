/**
 * Service để đồng bộ fabric mappings giữa các thiết bị
 * Ninh ơi, service này đảm bảo ảnh hiển thị đồng nhất trên mọi thiết bị
 */

interface FabricMapping {
  [fabricCode: string]: string // publicId
}

interface MappingResponse {
  success: boolean
  mappings?: FabricMapping
  count?: number
  timestamp?: number
  error?: string
}

interface UpdateResponse {
  success: boolean
  updatedCount?: number
  totalCount?: number
  timestamp?: number
  error?: string
}

class FabricMappingService {
  private static instance: FabricMappingService
  private readonly API_BASE = '/api/fabric-mappings'
  private lastSyncTime = 0
  private readonly SYNC_INTERVAL = 30000 // 30 seconds

  static getInstance(): FabricMappingService {
    if (!FabricMappingService.instance) {
      FabricMappingService.instance = new FabricMappingService()
    }
    return FabricMappingService.instance
  }

  /**
   * Get all mappings from cloud
   */
  async getAllMappings(): Promise<MappingResponse> {
    try {
      const response = await fetch(this.API_BASE)
      const result = await response.json()
      
      if (result.success) {
        console.log(`☁️ Loaded ${result.count} mappings from cloud`)
      }
      
      return result
    } catch (error) {
      console.error('❌ Failed to get cloud mappings:', error)
      return {
        success: false,
        error: (error as Error).message
      }
    }
  }

  /**
   * Update mappings in cloud
   */
  async updateMappings(mappings: FabricMapping): Promise<UpdateResponse> {
    try {
      const response = await fetch(this.API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', mappings })
      })
      
      const result = await response.json()
      
      if (result.success) {
        console.log(`☁️ Updated ${result.updatedCount} mappings in cloud`)
      }
      
      return result
    } catch (error) {
      console.error('❌ Failed to update cloud mappings:', error)
      return {
        success: false,
        error: (error as Error).message
      }
    }
  }

  /**
   * Add single mapping to cloud
   */
  async addMapping(fabricCode: string, publicId: string): Promise<UpdateResponse> {
    try {
      const response = await fetch(this.API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', fabricCode, publicId })
      })
      
      const result = await response.json()
      
      if (result.success) {
        console.log(`☁️ Added mapping ${fabricCode} → ${publicId} to cloud`)
      }
      
      return result
    } catch (error) {
      console.error('❌ Failed to add cloud mapping:', error)
      return {
        success: false,
        error: (error as Error).message
      }
    }
  }

  /**
   * Sync localStorage with cloud storage
   */
  async syncWithCloud(): Promise<{
    success: boolean
    localToCloud: number
    cloudToLocal: number
    error?: string
  }> {
    try {
      console.log('🔄 Starting cloud sync...')
      
      // Get local mappings
      const localMappings = this.getLocalMappings()
      
      // Get cloud mappings
      const cloudResult = await this.getAllMappings()
      if (!cloudResult.success) {
        throw new Error(cloudResult.error || 'Failed to get cloud mappings')
      }
      
      const cloudMappings = cloudResult.mappings || {}
      
      // Find differences
      const localToCloudUpdates: FabricMapping = {}
      const cloudToLocalUpdates: FabricMapping = {}
      
      // Check local → cloud
      Object.entries(localMappings).forEach(([fabricCode, publicId]) => {
        if (!cloudMappings[fabricCode] || cloudMappings[fabricCode] !== publicId) {
          localToCloudUpdates[fabricCode] = publicId
        }
      })
      
      // Check cloud → local
      Object.entries(cloudMappings).forEach(([fabricCode, publicId]) => {
        if (!localMappings[fabricCode] || localMappings[fabricCode] !== publicId) {
          cloudToLocalUpdates[fabricCode] = publicId
        }
      })
      
      // Update cloud with local changes
      let localToCloudCount = 0
      if (Object.keys(localToCloudUpdates).length > 0) {
        const updateResult = await this.updateMappings(localToCloudUpdates)
        if (updateResult.success) {
          localToCloudCount = updateResult.updatedCount || 0
        }
      }
      
      // Update local with cloud changes
      let cloudToLocalCount = 0
      if (Object.keys(cloudToLocalUpdates).length > 0) {
        this.updateLocalMappings(cloudToLocalUpdates)
        cloudToLocalCount = Object.keys(cloudToLocalUpdates).length
      }
      
      this.lastSyncTime = Date.now()
      
      console.log(`✅ Sync completed: ${localToCloudCount} local→cloud, ${cloudToLocalCount} cloud→local`)
      
      return {
        success: true,
        localToCloud: localToCloudCount,
        cloudToLocal: cloudToLocalCount
      }
      
    } catch (error) {
      console.error('❌ Cloud sync failed:', error)
      return {
        success: false,
        localToCloud: 0,
        cloudToLocal: 0,
        error: (error as Error).message
      }
    }
  }

  /**
   * Get mappings from localStorage
   */
  private getLocalMappings(): FabricMapping {
    try {
      const stored = localStorage.getItem('khovaiton_fabric_uploads')
      if (stored) {
        const data = JSON.parse(stored)
        return data.fabricToPublicIdMapping || {}
      }
      return {}
    } catch (error) {
      console.warn('⚠️ Failed to get local mappings:', error)
      return {}
    }
  }

  /**
   * Update localStorage with new mappings
   */
  private updateLocalMappings(newMappings: FabricMapping): void {
    try {
      const storageKey = 'khovaiton_fabric_uploads'
      const stored = localStorage.getItem(storageKey)
      const currentData = stored ? JSON.parse(stored) : { fabricToPublicIdMapping: {} }
      
      // Merge new mappings
      Object.entries(newMappings).forEach(([fabricCode, publicId]) => {
        currentData.fabricToPublicIdMapping[fabricCode] = publicId
      })
      
      currentData.timestamp = Date.now()
      localStorage.setItem(storageKey, JSON.stringify(currentData))
      
      console.log(`💾 Updated localStorage with ${Object.keys(newMappings).length} new mappings`)
      
    } catch (error) {
      console.error('❌ Failed to update local mappings:', error)
    }
  }

  /**
   * Auto sync periodically
   */
  startAutoSync(): void {
    // Initial sync
    this.syncWithCloud()
    
    // Periodic sync
    setInterval(() => {
      this.syncWithCloud()
    }, this.SYNC_INTERVAL)
    
    console.log(`🔄 Auto-sync started (every ${this.SYNC_INTERVAL / 1000}s)`)
  }

  /**
   * Sync after upload
   */
  async syncAfterUpload(fabricCode: string, publicId: string): Promise<void> {
    try {
      // Add to cloud immediately
      await this.addMapping(fabricCode, publicId)
      
      // Full sync to ensure consistency
      await this.syncWithCloud()
      
    } catch (error) {
      console.error('❌ Failed to sync after upload:', error)
    }
  }

  /**
   * Check if sync is needed
   */
  needsSync(): boolean {
    return Date.now() - this.lastSyncTime > this.SYNC_INTERVAL
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return {
      lastSyncTime: this.lastSyncTime,
      needsSync: this.needsSync(),
      autoSyncInterval: this.SYNC_INTERVAL
    }
  }
}

// Export singleton instance
export const fabricMappingService = FabricMappingService.getInstance()

// Export types
export type { FabricMapping, MappingResponse, UpdateResponse }
