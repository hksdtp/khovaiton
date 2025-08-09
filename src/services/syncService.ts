/**
 * Sync Service for Cloudinary-Database Synchronization
 * Ninh ơi, service này đồng bộ ảnh giữa Cloudinary và database
 */

import { cloudinaryService } from './cloudinaryService'
import { fabricMappingService } from './fabricMappingService'

interface SyncResult {
  fabricCode: string
  status: 'synced' | 'missing' | 'error'
  cloudinaryUrl?: string
  error?: string
}

interface SyncStats {
  total: number
  synced: number
  missing: number
  errors: number
  results: SyncResult[]
}

class SyncService {
  private static instance: SyncService
  private syncCache = new Map<string, { url: string; timestamp: number }>()
  private runtimeImageMapping = new Set<string>() // Runtime cache for newly uploaded images
  private fabricToPublicIdMapping = new Map<string, string>() // Map fabric codes to actual Cloudinary public_ids
  private fabricToDirectUrlMapping = new Map<string, string>() // Map fabric codes to direct URLs (manual)
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes
  private mappingsLoaded = false // Track if we've loaded mappings from cloud
  private readonly STORAGE_KEY = 'khovaiton_fabric_uploads' // localStorage key

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService()
      // Initialize with known uploaded images and load from localStorage
      SyncService.instance.loadFromStorage()
      SyncService.instance.initializeKnownUploads()
      // Load mappings from cloud for cross-device sync
      SyncService.instance.loadMappingsFromCloud()
      // Start cloud sync
      SyncService.instance.initializeCloudSync()
    }
    return SyncService.instance
  }

  /**
   * Load mappings from cloud storage for cross-device sync
   */
  private async loadMappingsFromCloud(): Promise<void> {
    if (this.mappingsLoaded) {
      return // Already loaded
    }

    try {
      console.log('☁️ Loading fabric mappings from cloud for cross-device sync...')
      const response = await fabricMappingService.getAllMappings()

      if (response.success && response.mappings) {
        // Load mappings into direct URL mapping (these are custom URLs)
        for (const [fabricCode, url] of Object.entries(response.mappings)) {
          if (url.startsWith('http')) {
            // This is a direct URL (custom image)
            this.fabricToDirectUrlMapping.set(fabricCode, url)
            console.log(`☁️ Loaded custom URL for ${fabricCode}: ${url}`)
          } else {
            // This is a publicId (uploaded image)
            this.fabricToPublicIdMapping.set(fabricCode, url)
            console.log(`☁️ Loaded publicId for ${fabricCode}: ${url}`)
          }
        }

        console.log(`✅ Loaded ${Object.keys(response.mappings).length} mappings from cloud`)
        this.mappingsLoaded = true
      } else {
        console.warn('⚠️ Failed to load mappings from cloud:', response.error)
      }
    } catch (error) {
      console.warn('⚠️ Error loading mappings from cloud:', error)
    }
  }

  /**
   * Load uploaded images from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)

        // Restore fabric to public_id mapping
        if (data.fabricToPublicIdMapping) {
          Object.entries(data.fabricToPublicIdMapping).forEach(([fabricCode, publicId]) => {
            this.fabricToPublicIdMapping.set(fabricCode, publicId as string)
            this.runtimeImageMapping.add(fabricCode)

            // Generate URL from public_id
            const url = `https://res.cloudinary.com/dgaktc3fb/image/upload/${publicId}`
            this.syncCache.set(fabricCode, {
              url,
              timestamp: Date.now()
            })
          })

          console.log(`💾 Loaded ${this.fabricToPublicIdMapping.size} uploaded images from storage`)
        }

        // Restore fabric to direct URL mapping (manual URLs)
        if (data.fabricToDirectUrlMapping) {
          Object.entries(data.fabricToDirectUrlMapping).forEach(([fabricCode, directUrl]) => {
            this.fabricToDirectUrlMapping.set(fabricCode, directUrl as string)
            this.runtimeImageMapping.add(fabricCode)

            // Use direct URL
            this.syncCache.set(fabricCode, {
              url: directUrl as string,
              timestamp: Date.now()
            })
          })

          console.log(`💾 Loaded ${this.fabricToDirectUrlMapping.size} manual URLs from storage`)
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to load from storage:', error)
    }
  }

  /**
   * Save uploaded images to localStorage
   */
  private saveToStorage(): void {
    try {
      const data = {
        fabricToPublicIdMapping: Object.fromEntries(this.fabricToPublicIdMapping),
        fabricToDirectUrlMapping: Object.fromEntries(this.fabricToDirectUrlMapping),
        timestamp: Date.now()
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
      console.log(`💾 Saved ${this.fabricToPublicIdMapping.size} publicIds + ${this.fabricToDirectUrlMapping.size} direct URLs to storage`)
    } catch (error) {
      console.warn('⚠️ Failed to save to storage:', error)
    }
  }

  /**
   * Initialize known uploaded images
   */
  private initializeKnownUploads(): void {
    // Add known uploaded fabrics (if not already loaded from storage)
    const knownUploads = [
      {
        fabricCode: '3 PASS BO - WHITE - COL 15',
        publicId: 'kxtnctannhobhvacgtqe',
        url: 'https://res.cloudinary.com/dgaktc3fb/image/upload/v1752679690/kxtnctannhobhvacgtqe.png'
      },
      {
        fabricCode: '33139-2-270',
        publicId: 'mfpxvks1qcxcrjac1roc',
        url: 'https://res.cloudinary.com/dgaktc3fb/image/upload/v1752722045/mfpxvks1qcxcrjac1roc.png'
      }
    ]

    let needsSave = false

    knownUploads.forEach(({ fabricCode, publicId, url }) => {
      if (!this.fabricToPublicIdMapping.has(fabricCode)) {
        this.fabricToPublicIdMapping.set(fabricCode, publicId)
        this.syncCache.set(fabricCode, {
          url,
          timestamp: Date.now()
        })
        this.runtimeImageMapping.add(fabricCode)

        console.log(`🔧 Initialized known upload: ${fabricCode} -> ${publicId}`)
        needsSave = true
      }
    })

    // Save to storage if any new uploads were added
    if (needsSave) {
      this.saveToStorage()
    }
  }

  /**
   * Get image URL - CHỈ CLOUDINARY
   * Ninh ơi, chỉ sử dụng Cloudinary, không fallback static
   */
  async getImageUrl(fabricCode: string): Promise<string | null> {
    try {
      // Ensure mappings are loaded from cloud for cross-device sync
      await this.loadMappingsFromCloud()

      // Check cache first (for uploaded images with actual URLs)
      const cached = this.syncCache.get(fabricCode)
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        console.log(`💾 Using cached URL for ${fabricCode}: ${cached.url}`)
        return cached.url
      }

      // FORCE USE CLOUDINARY ONLY - All images uploaded to Cloudinary
      // Check if fabric has image in runtime mapping first
      if (!this.hasRealImageRuntime(fabricCode)) {
        console.log(`🔍 No runtime mapping for ${fabricCode}, checking Cloudinary directly...`)
        
        // Direct Cloudinary check - force use since all images uploaded
        const cloudinaryUrl = cloudinaryService.getFabricImageUrl(fabricCode)
        if (cloudinaryUrl) {
          console.log(`☁️ Using Cloudinary URL for ${fabricCode}: ${cloudinaryUrl}`)
          
          // Cache the Cloudinary URL
          this.syncCache.set(fabricCode, {
            url: cloudinaryUrl,
            timestamp: Date.now()
          })
          
          return cloudinaryUrl
        }
        
        console.log(`❌ No Cloudinary URL available for ${fabricCode}`)
        return null
      }

      // Check for manual direct URL first (highest priority)
      if (this.fabricToDirectUrlMapping.has(fabricCode)) {
        const directUrl = this.fabricToDirectUrlMapping.get(fabricCode)!
        console.log(`🎯 Using manual direct URL for ${fabricCode}: ${directUrl}`)

        // Cache the direct URL
        this.syncCache.set(fabricCode, {
          url: directUrl,
          timestamp: Date.now()
        })

        return directUrl
      }

      // For newly uploaded images, use the actual URL from cache
      if (this.fabricToPublicIdMapping.has(fabricCode)) {
        const publicId = this.fabricToPublicIdMapping.get(fabricCode)!
        const actualUrl = `https://res.cloudinary.com/dgaktc3fb/image/upload/${publicId}`

        console.log(`🆕 Using actual uploaded URL for ${fabricCode}: ${actualUrl}`)

        // Cache the actual URL
        this.syncCache.set(fabricCode, {
          url: actualUrl,
          timestamp: Date.now()
        })

        return actualUrl
      }

      // CHỈ kiểm tra Cloudinary - không fallback (for existing images)
      const cloudinaryUrl = cloudinaryService.getFabricImageUrl(fabricCode)

      if (!cloudinaryUrl) {
        console.log(`❌ No Cloudinary URL for ${fabricCode}`)
        return null
      }

      // Test if Cloudinary image exists
      const exists = await this.checkImageExists(cloudinaryUrl)

      if (exists) {
        // Cache the result
        this.syncCache.set(fabricCode, {
          url: cloudinaryUrl,
          timestamp: Date.now()
        })

        console.log(`☁️ Using Cloudinary image for ${fabricCode}`)
        return cloudinaryUrl
      }

      console.log(`❌ Cloudinary image not found for ${fabricCode}`)
      return null

    } catch (error) {
      console.error(`Error getting Cloudinary image for ${fabricCode}:`, error)
      return null // Không fallback
    }
  }

  /**
   * Check if image URL exists
   */
  private async checkImageExists(url: string): Promise<boolean> {
    try {
      // For Cloudinary URLs, do a proper check
      if (url.includes('res.cloudinary.com/dgaktc3fb/image/upload/fabrics/')) {
        try {
          const response = await fetch(url, { method: 'HEAD' })
          return response.ok
        } catch (error) {
          // If CORS error, try with GET request to a small version
          try {
            const testUrl = url.replace('/image/upload/', '/image/upload/w_1,h_1/')
            const response = await fetch(testUrl)
            return response.ok
          } catch {
            return false
          }
        }
      }

      const response = await fetch(url, { method: 'HEAD' })
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * Sync all fabric images
   */
  async syncAllFabrics(fabricCodes: string[]): Promise<SyncStats> {
    console.log(`🔄 Starting sync for ${fabricCodes.length} fabrics`)
    
    const results: SyncResult[] = []
    let synced = 0
    let missing = 0
    let errors = 0

    for (const fabricCode of fabricCodes) {
      try {
        const cloudinaryUrl = cloudinaryService.getFabricImageUrl(fabricCode)
        const exists = await this.checkImageExists(cloudinaryUrl)

        if (exists) {
          results.push({
            fabricCode,
            status: 'synced',
            cloudinaryUrl
          })
          synced++
          
          // Update cache
          this.syncCache.set(fabricCode, {
            url: cloudinaryUrl,
            timestamp: Date.now()
          })
        } else {
          results.push({
            fabricCode,
            status: 'missing'
          })
          missing++
        }
      } catch (error) {
        results.push({
          fabricCode,
          status: 'error',
          error: (error as Error).message
        })
        errors++
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    const stats: SyncStats = {
      total: fabricCodes.length,
      synced,
      missing,
      errors,
      results
    }

    console.log(`✅ Sync completed:`, stats)
    return stats
  }

  /**
   * Force refresh cache for specific fabric
   */
  async refreshFabricImage(fabricCode: string): Promise<string | null> {
    // Remove from cache
    this.syncCache.delete(fabricCode)
    
    // Get fresh URL
    return this.getImageUrl(fabricCode)
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.syncCache.clear()
    console.log('🗑️ Image cache cleared')
  }

  /**
   * Clear all storage (including localStorage)
   */
  clearAllStorage(): void {
    this.syncCache.clear()
    this.runtimeImageMapping.clear()
    this.fabricToPublicIdMapping.clear()
    this.fabricToDirectUrlMapping.clear()

    try {
      localStorage.removeItem(this.STORAGE_KEY)
      console.log('🗑️ All storage cleared (cache + localStorage)')
    } catch (error) {
      console.warn('⚠️ Failed to clear localStorage:', error)
    }
  }

  /**
   * Initialize cloud sync
   */
  private async initializeCloudSync(): Promise<void> {
    try {
      // Load mappings from cloud immediately (for fresh devices)
      await this.loadFromCloud()
      // Start auto-sync for cross-device consistency
      fabricMappingService.startAutoSync()
      console.log('☁️ Cloud sync initialized')
    } catch (error) {
      console.warn('⚠️ Failed to initialize cloud sync:', error)
    }
  }

  /**
   * Load mappings from cloud and apply to runtime caches
   */
  private async loadFromCloud(): Promise<void> {
    try {
      const res = await fabricMappingService.getAllMappings()
      if (!res.success || !res.mappings) return

      Object.entries(res.mappings).forEach(([fabricCode, value]) => {
        // value có thể là publicId hoặc là URL đầy đủ
        let url = ''
        if (typeof value === 'string' && /^https?:\/\//i.test(value)) {
          url = value
        } else {
          const publicId = String(value)
          this.fabricToPublicIdMapping.set(fabricCode, publicId)
          url = `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`
        }
        this.syncCache.set(fabricCode, { url, timestamp: Date.now() })
      })

      // Persist to localStorage as well (optional)
      this.saveToStorage()

      console.log(`☁️ Loaded ${Object.keys(res.mappings).length} mappings from cloud into runtime cache`)
    } catch (error) {
      console.warn('⚠️ Could not load mappings from cloud:', error)
    }
  }

  /**
   * Get storage info
   */
  getStorageInfo() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      const data = stored ? JSON.parse(stored) : null
      const cloudSyncStatus = fabricMappingService.getSyncStatus()

      return {
        hasStorage: !!stored,
        uploadedCount: this.fabricToPublicIdMapping.size,
        runtimeCount: this.runtimeImageMapping.size,
        cacheCount: this.syncCache.size,
        storageData: data,
        fabricCodes: Array.from(this.fabricToPublicIdMapping.keys()),
        cloudSync: cloudSyncStatus
      }
    } catch (error) {
      return {
        hasStorage: false,
        uploadedCount: 0,
        runtimeCount: 0,
        cacheCount: 0,
        error: (error as Error).message
      }
    }
  }

  /**
   * Force cloud sync
   */
  async forceCloudSync(): Promise<{
    success: boolean
    localToCloud: number
    cloudToLocal: number
    error?: string
  }> {
    return await fabricMappingService.syncWithCloud()
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      size: this.syncCache.size,
      entries: Array.from(this.syncCache.entries()).map(([code, data]) => ({
        fabricCode: code,
        url: data.url,
        age: Date.now() - data.timestamp
      }))
    }
  }

  /**
   * Batch update fabric images after upload
   */
  async updateFabricImage(fabricCode: string, cloudinaryUrl: string, publicId?: string): Promise<void> {
    // Update cache immediately with actual URL
    this.syncCache.set(fabricCode, {
      url: cloudinaryUrl,
      timestamp: Date.now()
    })

    // If we have a Cloudinary publicId, store and sync it to cloud for cross-device
    if (publicId && publicId.trim()) {
      this.fabricToPublicIdMapping.set(fabricCode, publicId)
      console.log(`🔗 Mapped ${fabricCode} to public_id: ${publicId}`)

      // Save to localStorage for persistence (optional)
      this.saveToStorage()

      // Sync with cloud storage for cross-device consistency
      await fabricMappingService.syncAfterUpload(fabricCode, publicId)
    } else {
      // This is a manual URL (no publicId), save as direct URL
      this.fabricToDirectUrlMapping.set(fabricCode, cloudinaryUrl)
      console.log(`🔗 Mapped ${fabricCode} to direct URL: ${cloudinaryUrl}`)

      // Save to localStorage for persistence
      this.saveToStorage()
    }

    console.log(`🔄 Updated image cache for ${fabricCode}`)

    // Update fabric image mapping file
    await this.updateFabricImageMapping(fabricCode)

    // TODO: Update database record if needed
    // await fabricApi.updateFabricImage(fabricCode, cloudinaryUrl)
  }

  /**
   * Update fabric image mapping in runtime after successful upload
   */
  private async updateFabricImageMapping(fabricCode: string): Promise<void> {
    try {
      // Always add to runtime cache for immediate effect
      this.runtimeImageMapping.add(fabricCode)

      console.log(`📝 Added ${fabricCode} to runtime image mapping`)
      console.log(`✅ Fabric ${fabricCode} now has image status: true`)

    } catch (error) {
      console.error(`❌ Failed to update fabric image mapping for ${fabricCode}:`, error)
    }
  }

  /**
   * Check if fabric has runtime image (newly uploaded)
   */
  hasRuntimeImage(fabricCode: string): boolean {
    return this.runtimeImageMapping.has(fabricCode) || this.syncCache.has(fabricCode)
  }

  /**
   * Refresh image status by checking Cloudinary directly
   */
  async refreshImageStatus(fabricCodes: string[]): Promise<{
    updated: string[]
    total: number
  }> {
    console.log('🔄 Refreshing image status from Cloudinary...')
    const updated: string[] = []

    for (const fabricCode of fabricCodes) {
      try {
        // Check if image exists on Cloudinary
        const cloudinaryUrl = cloudinaryService.getFabricImageUrl(fabricCode)
        if (cloudinaryUrl) {
          const exists = await this.checkImageExists(cloudinaryUrl)

          if (exists && !this.hasRuntimeImage(fabricCode)) {
            // Add to runtime mapping if found on Cloudinary but not in our cache
            this.runtimeImageMapping.add(fabricCode)
            this.syncCache.set(fabricCode, {
              url: cloudinaryUrl,
              timestamp: Date.now()
            })
            updated.push(fabricCode)
            console.log(`✅ Found new image for ${fabricCode}`)
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to check image for ${fabricCode}:`, error)
      }
    }

    console.log(`🔄 Image status refresh completed: ${updated.length}/${fabricCodes.length} updated`)
    return {
      updated,
      total: fabricCodes.length
    }
  }

  /**
   * Get sync status for fabric codes
   */
  async getSyncStatus(fabricCodes: string[]): Promise<{
    cloudinary: number
    staticFiles: number
    missing: number
  }> {
    let cloudinary = 0
    let staticFiles = 0
    let missing = 0

    for (const code of fabricCodes) {
      const url = await this.getImageUrl(code)

      if (!url) {
        missing++
      } else if (url.includes('cloudinary.com')) {
        cloudinary++
      } else {
        staticFiles++
      }
    }

    return { cloudinary, staticFiles, missing }
  }

  /**
   * Check if fabric has image (including runtime uploads)
   */
  hasRealImageRuntime(fabricCode: string): boolean {
    // Check runtime mapping first (for newly uploaded images)
    if (this.runtimeImageMapping.has(fabricCode)) {
      return true
    }

    // Fallback to static mapping
    try {
      const { hasRealImage } = require('@/data/fabricImageMapping')
      return hasRealImage(fabricCode)
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const syncService = SyncService.getInstance()

// Export types
export type { SyncResult, SyncStats }
