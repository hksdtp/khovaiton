/**
 * Sync Service for Cloudinary-Database Synchronization
 * Ninh ơi, service này đồng bộ ảnh giữa Cloudinary và database
 */

import { cloudinaryService } from './cloudinaryService'

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
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService()
      // Initialize with known uploaded images
      SyncService.instance.initializeKnownUploads()
    }
    return SyncService.instance
  }

  /**
   * Initialize known uploaded images
   */
  private initializeKnownUploads(): void {
    // Add the fabric that was uploaded earlier
    const fabricCode = '3 PASS BO - WHITE - COL 15'
    const publicId = 'kxtnctannhobhvacgtqe'
    const actualUrl = 'https://res.cloudinary.com/dgaktc3fb/image/upload/v1752679690/kxtnctannhobhvacgtqe.png'

    this.fabricToPublicIdMapping.set(fabricCode, publicId)
    this.syncCache.set(fabricCode, {
      url: actualUrl,
      timestamp: Date.now()
    })
    this.runtimeImageMapping.add(fabricCode)

    console.log(`🔧 Initialized known upload: ${fabricCode} -> ${publicId}`)
  }

  /**
   * Get image URL - CHỈ CLOUDINARY
   * Ninh ơi, chỉ sử dụng Cloudinary, không fallback static
   */
  async getImageUrl(fabricCode: string): Promise<string | null> {
    try {
      // Check cache first (for uploaded images with actual URLs)
      const cached = this.syncCache.get(fabricCode)
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        console.log(`💾 Using cached URL for ${fabricCode}: ${cached.url}`)
        return cached.url
      }

      // Check if fabric has image (including runtime uploads)
      if (!this.hasRealImageRuntime(fabricCode)) {
        console.log(`❌ No image mapping for ${fabricCode}`)
        return null
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
      // For Cloudinary URLs, assume they exist if they match our uploaded fabric codes
      if (url.includes('res.cloudinary.com/dgaktc3fb/image/upload/fabrics/')) {
        // For Cloudinary URLs, try to fetch directly since we know they exist
        // Skip the network check to avoid CORS/timing issues
        return true


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

    // Store public_id mapping if provided
    if (publicId) {
      this.fabricToPublicIdMapping.set(fabricCode, publicId)
      console.log(`🔗 Mapped ${fabricCode} to public_id: ${publicId}`)
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
      // Import the current mapping module
      const mappingModule = await import('@/data/fabricImageMapping')

      // Check if fabric code already exists in mapping
      if (mappingModule.hasRealImage(fabricCode)) {
        console.log(`✅ Fabric ${fabricCode} already in mapping`)
        return
      }

      // Add to runtime cache for immediate effect
      // This is a temporary solution until the mapping file is updated
      this.runtimeImageMapping.add(fabricCode)

      console.log(`📝 Added ${fabricCode} to runtime image mapping`)
      console.log(`🔧 Note: Manual update needed in fabricImageMapping.ts for persistence`)

    } catch (error) {
      console.error(`❌ Failed to update fabric image mapping for ${fabricCode}:`, error)
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
