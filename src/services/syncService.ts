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
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService()
    }
    return SyncService.instance
  }

  /**
   * Get image URL with Cloudinary priority
   */
  async getImageUrl(fabricCode: string): Promise<string | null> {
    try {
      // Check cache first
      const cached = this.syncCache.get(fabricCode)
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.url
      }

      // Check if image exists in Cloudinary
      const cloudinaryUrl = cloudinaryService.getFabricImageUrl(fabricCode)
      
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

      // Fallback to static image
      const staticUrl = `/images/fabrics/${fabricCode}.jpg`
      const staticExists = await this.checkImageExists(staticUrl)
      
      if (staticExists) {
        console.log(`📁 Using static image for ${fabricCode}`)
        return staticUrl
      }

      console.log(`❌ No image found for ${fabricCode}`)
      return null

    } catch (error) {
      console.error(`Error getting image for ${fabricCode}:`, error)
      return `/images/fabrics/${fabricCode}.jpg` // Fallback
    }
  }

  /**
   * Check if image URL exists
   */
  private async checkImageExists(url: string): Promise<boolean> {
    try {
      // For Cloudinary URLs, assume they exist if they match our uploaded fabric codes
      if (url.includes('res.cloudinary.com/dgaktc3fb/image/upload/fabrics/')) {
        // List of known uploaded fabric codes (from our upload script)
        const uploadedFabrics = [
          '08-SILVER', '089C-1', '09-730-17', '10-780-17', '10-780-5',
          '100023009124', '120087', '120092', '130003', '131-250',
          '07013D-31', '07013D-88', '09 Putty', '10 780 -17', '10 780 4',
          '10-780-1402', '10-780-316', '10-780-41', '102 902', '1021-7M ANTARES 1000-2300',
          '10780 -5', '1080.05 DUBLIN', '10808', '114800', '120170', '120188',
          '130 479', '1300 17', '130004', '130008', '131-254', '131259',
          '131464', '131510', '131513', '132268', '132310', '13590-2',
          '140362', '142 499', '142-421', '1423 93', '142335', '14239',
          '142405', '142417', '143062', '18 Sesame_KEA_S18', '180004', '200.8 10M'
        ]

        const parts = url.split('/fabrics/')
        if (parts.length > 1 && parts[1]) {
          const fabricCode = decodeURIComponent(parts[1])
          if (uploadedFabrics.includes(fabricCode)) {
            return true
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
  async updateFabricImage(fabricCode: string, cloudinaryUrl: string): Promise<void> {
    // Update cache immediately
    this.syncCache.set(fabricCode, {
      url: cloudinaryUrl,
      timestamp: Date.now()
    })

    console.log(`🔄 Updated image cache for ${fabricCode}`)
    
    // TODO: Update database record if needed
    // await fabricApi.updateFabricImage(fabricCode, cloudinaryUrl)
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
}

// Export singleton instance
export const syncService = SyncService.getInstance()

// Export types
export type { SyncResult, SyncStats }
