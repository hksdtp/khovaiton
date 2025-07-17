/**
 * Service để đồng bộ 2 chiều với Cloudinary
 * Ninh ơi, service này cho phép sync từ Cloudinary về web app
 */

interface CloudinaryImage {
  fabricCode: string
  publicId: string
  url: string
  createdAt: string
  size: string
  bytes: number
}

interface SyncResult {
  success: boolean
  total: number
  mapped: number
  unmapped: number
  mappings: CloudinaryImage[]
  error?: string
}

class CloudinarySyncService {
  private static instance: CloudinarySyncService
  private readonly API_BASE = '/api/cloudinary-sync'

  static getInstance(): CloudinarySyncService {
    if (!CloudinarySyncService.instance) {
      CloudinarySyncService.instance = new CloudinarySyncService()
    }
    return CloudinarySyncService.instance
  }

  /**
   * List all images from Cloudinary
   */
  async listAllImages(maxResults = 500): Promise<{
    success: boolean
    total: number
    images: any[]
    error?: string
  }> {
    try {
      const response = await fetch(`${this.API_BASE}?action=list&maxResults=${maxResults}`)
      return await response.json()
    } catch (error) {
      return {
        success: false,
        total: 0,
        images: [],
        error: (error as Error).message
      }
    }
  }

  /**
   * Search images by query
   */
  async searchImages(query: string): Promise<{
    success: boolean
    total: number
    images: any[]
    error?: string
  }> {
    try {
      const response = await fetch(this.API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'search', query })
      })
      return await response.json()
    } catch (error) {
      return {
        success: false,
        total: 0,
        images: [],
        error: (error as Error).message
      }
    }
  }

  /**
   * Get details for specific images
   */
  async getImageDetails(publicIds: string[]): Promise<{
    success: boolean
    images: any[]
    error?: string
  }> {
    try {
      const response = await fetch(this.API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'details', publicIds })
      })
      return await response.json()
    } catch (error) {
      return {
        success: false,
        images: [],
        error: (error as Error).message
      }
    }
  }

  /**
   * Sync all images from Cloudinary and try to map to fabric codes
   */
  async syncFromCloudinary(): Promise<SyncResult> {
    try {
      console.log('🔄 Starting sync from Cloudinary...')
      
      const response = await fetch(`${this.API_BASE}?action=sync`)
      const result = await response.json()
      
      if (result.success) {
        console.log(`✅ Sync completed: ${result.mapped}/${result.total} images mapped`)
        console.log(`📊 Found ${result.mappings.length} fabric mappings:`)
        
        result.mappings.forEach((mapping: CloudinaryImage) => {
          console.log(`   • ${mapping.fabricCode}: ${mapping.publicId}`)
        })
      } else {
        console.error('❌ Sync failed:', result.error)
      }
      
      return result
    } catch (error) {
      console.error('❌ Sync error:', error)
      return {
        success: false,
        total: 0,
        mapped: 0,
        unmapped: 0,
        mappings: [],
        error: (error as Error).message
      }
    }
  }

  /**
   * Update local storage with synced mappings
   */
  async updateLocalMappings(mappings: CloudinaryImage[]): Promise<void> {
    try {
      // Get current localStorage data
      const storageKey = 'khovaiton_fabric_uploads'
      const stored = localStorage.getItem(storageKey)
      const currentData = stored ? JSON.parse(stored) : { fabricToPublicIdMapping: {} }
      
      // Add new mappings
      let newMappings = 0
      mappings.forEach(mapping => {
        if (!currentData.fabricToPublicIdMapping[mapping.fabricCode]) {
          currentData.fabricToPublicIdMapping[mapping.fabricCode] = mapping.publicId
          newMappings++
        }
      })
      
      // Save back to localStorage
      currentData.timestamp = Date.now()
      localStorage.setItem(storageKey, JSON.stringify(currentData))
      
      console.log(`💾 Updated localStorage with ${newMappings} new mappings`)
      
    } catch (error) {
      console.error('❌ Failed to update local mappings:', error)
    }
  }

  /**
   * Full sync: Get from Cloudinary and update local storage
   */
  async fullSync(): Promise<{
    success: boolean
    newMappings: number
    totalMappings: number
    error?: string
  }> {
    try {
      console.log('🚀 Starting full sync...')
      
      // Sync from Cloudinary
      const syncResult = await this.syncFromCloudinary()
      
      if (!syncResult.success) {
        return {
          success: false,
          newMappings: 0,
          totalMappings: 0,
          error: syncResult.error || 'Unknown error'
        }
      }
      
      // Update local storage
      await this.updateLocalMappings(syncResult.mappings)
      
      console.log('✅ Full sync completed!')
      
      return {
        success: true,
        newMappings: syncResult.mapped,
        totalMappings: syncResult.total,
      }
      
    } catch (error) {
      console.error('❌ Full sync error:', error)
      return {
        success: false,
        newMappings: 0,
        totalMappings: 0,
        error: (error as Error).message
      }
    }
  }

  /**
   * Check if sync API is available
   */
  async checkAPIStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}?action=list&maxResults=1`)
      const result = await response.json()
      return result.success
    } catch (error) {
      console.warn('⚠️ Sync API not available:', error)
      return false
    }
  }
}

// Export singleton instance
export const cloudinarySyncService = CloudinarySyncService.getInstance()

// Export types
export type { CloudinaryImage, SyncResult }
