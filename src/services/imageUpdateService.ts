/**
 * Image Update Service - Real-time image status updates
 * Handles cache invalidation and UI updates when images are uploaded/changed
 */

import { QueryClient } from '@tanstack/react-query'
import { syncService } from './syncService'
import { CloudinaryUploadResult } from './cloudinaryService'
import { realtimeUpdateService } from './realtimeUpdateService'
import { fabricMappingService } from './fabricMappingService'
import { fabricUpdateService } from '@/features/inventory/services/fabricUpdateService'

export interface ImageUpdateResult {
  fabricCode: string
  imageUrl: string
  publicId: string
  success: boolean
  error?: string
}

class ImageUpdateService {
  private static instance: ImageUpdateService
  private queryClient: QueryClient | null = null

  static getInstance(): ImageUpdateService {
    if (!ImageUpdateService.instance) {
      ImageUpdateService.instance = new ImageUpdateService()
    }
    return ImageUpdateService.instance
  }

  /**
   * Initialize with QueryClient instance
   */
  setQueryClient(queryClient: QueryClient) {
    this.queryClient = queryClient
    // Also set for realtime update service
    realtimeUpdateService.setQueryClient(queryClient)
  }

  /**
   * Handle successful image upload with comprehensive cache updates
   */
  async handleImageUpload(
    fabricCode: string,
    uploadResult: CloudinaryUploadResult
  ): Promise<ImageUpdateResult> {
    try {
      console.log(`🔄 Processing image update for ${fabricCode}`)

      // 1. Update sync service cache immediately
      await syncService.updateFabricImage(
        fabricCode,
        uploadResult.secure_url,
        uploadResult.public_id
      )

      // 2. Update fabric data in React Query cache optimistically
      this.updateFabricInCache(fabricCode, uploadResult.secure_url)

      // 3. Use realtime update service for efficient updates
      await realtimeUpdateService.onImageUploaded(fabricCode)

      console.log(`✅ Image update completed for ${fabricCode}`)

      return {
        fabricCode,
        imageUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        success: true
      }

    } catch (error) {
      console.error(`❌ Failed to process image update for ${fabricCode}:`, error)

      return {
        fabricCode,
        imageUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        success: false,
        error: (error as Error).message
      }
    }
  }

  /**
   * Manually set/override image URL for a fabric (temporary/manual fix)
   * Useful when auto-mapping is not correct.
   */
  async handleManualUrlUpdate(
    fabricCode: string,
    imageUrl: string
  ): Promise<ImageUpdateResult> {
    try {
      console.log(`✍️ Manually setting image URL for ${fabricCode}`)

      // 1) Update sync cache immediately (no publicId for manual URL)
      await syncService.updateFabricImage(fabricCode, imageUrl)

      // 1.1) Push mapping lên cloud để đa thiết bị (lưu trực tiếp URL)
      await fabricMappingService.updateMappings({ [fabricCode]: imageUrl })

      // 1.2) Save to database for cross-device sync
      try {
        // Find fabric ID from code
        const fabricQueries = this.queryClient?.getQueriesData({ queryKey: ['fabrics'] }) || []
        let fabricId: number | null = null

        for (const [, data] of fabricQueries) {
          let fabricList: any[] = []

          if (Array.isArray(data)) {
            fabricList = data
          } else if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
            fabricList = (data as any).data
          }

          const fabric = fabricList.find((f: any) => f.code === fabricCode)
          if (fabric) {
            fabricId = fabric.id
            break
          }
        }

        if (fabricId) {
          console.log(`💾 Saving custom image URL to database for fabric ${fabricId}`)
          const dbResult = await fabricUpdateService.updateCustomImageUrl(fabricId, imageUrl)
          if (dbResult.success) {
            console.log(`✅ Custom image URL saved to database`)
          } else {
            console.warn(`⚠️ Database save failed, but local cache updated:`, dbResult.error)
          }
        } else {
          console.warn(`⚠️ Could not find fabric ID for code ${fabricCode}, skipping database save`)
        }
      } catch (dbError) {
        console.warn(`⚠️ Database save failed, but local cache updated:`, dbError)
      }

      // 2) Optimistically update UI (React Query caches)
      this.updateFabricInCache(fabricCode, imageUrl)

      // 3) Trigger realtime refresh for any counters/views
      await realtimeUpdateService.onImageUploaded(fabricCode)

      // 4) Debug: verify URL is actually stored
      const verifyUrl = await syncService.getImageUrl(fabricCode)
      console.log(`🔍 Verification: ${fabricCode} -> ${verifyUrl}`)

      console.log(`✅ Manual image URL set for ${fabricCode}`)

      return {
        fabricCode,
        imageUrl,
        publicId: '',
        success: true,
      }
    } catch (error) {
      console.error(`❌ Failed to set manual image URL for ${fabricCode}:`, error)
      return {
        fabricCode,
        imageUrl,
        publicId: '',
        success: false,
        error: (error as Error).message,
      }
    }
  }

  /**
   * Update fabric image in React Query cache optimistically
   */
  private updateFabricInCache(fabricCode: string, imageUrl: string) {
    if (!this.queryClient) return

    // Update all fabric list queries
    this.queryClient.setQueriesData(
      { queryKey: ['fabrics'] },
      (oldData: any) => {
        if (!oldData?.data) return oldData

        let updated = false
        const newData = {
          ...oldData,
          data: oldData.data.map((fabric: any) => {
            if (fabric.code === fabricCode) {
              updated = true
              return { ...fabric, image: imageUrl }
            }
            return fabric
          })
        }

        if (updated) {
          console.log(`🔄 Updated fabric ${fabricCode} in cache with new image`)
        } else {
          console.log(`⚠️ Fabric ${fabricCode} not found in this cache (${oldData.data.length} items)`)
        }

        return newData
      }
    )

    // Also invalidate all fabric queries to ensure fresh data
    this.queryClient.invalidateQueries({ queryKey: ['fabrics'] })
  }

  /**
   * Invalidate all image-related queries
   */
  async invalidateAllImageQueries() {
    if (!this.queryClient) return

    // Invalidate fabric queries
    await this.queryClient.invalidateQueries({ queryKey: ['fabrics'] })

    // Invalidate fabric stats (for image counts)
    await this.queryClient.invalidateQueries({ queryKey: ['fabric-stats'] })

    // Invalidate any image-specific queries
    await this.queryClient.invalidateQueries({ queryKey: ['fabric-images'] })

    console.log('🔄 Invalidated all image-related queries')
  }

  /**
   * Force refresh specific fabric image
   */
  async refreshFabricImage(fabricCode: string) {
    try {
      // Force refresh the image URL in sync service
      await syncService.refreshFabricImage(fabricCode)
      console.log(`🔄 Refreshed image for ${fabricCode}`)
    } catch (error) {
      console.warn(`⚠️ Could not refresh image for ${fabricCode}:`, error)
    }
  }

  /**
   * Trigger immediate UI update for image status filters
   */
  async refreshImageStatusCounts() {
    if (!this.queryClient) return

    // Refetch all fabric queries with different image status filters
    await this.queryClient.refetchQueries({ 
      queryKey: ['fabrics'],
      type: 'active'
    })

    console.log('🔄 Refreshed image status counts')
  }

  /**
   * Handle image deletion
   */
  async handleImageDeletion(fabricCode: string): Promise<boolean> {
    try {
      console.log(`🗑️ Processing image deletion for ${fabricCode}`)

      // 1. Update sync service cache
      await syncService.updateFabricImage(fabricCode, '', '')

      // 2. Update fabric data in cache
      this.updateFabricInCache(fabricCode, '')

      // 3. Use realtime update service for efficient updates
      await realtimeUpdateService.onImageDeleted(fabricCode)

      console.log(`✅ Image deletion completed for ${fabricCode}`)
      return true

    } catch (error) {
      console.error(`❌ Failed to process image deletion for ${fabricCode}:`, error)
      return false
    }
  }

  /**
   * Batch update multiple fabric images
   */
  async handleBatchImageUpdate(updates: Array<{
    fabricCode: string
    uploadResult: CloudinaryUploadResult
  }>): Promise<ImageUpdateResult[]> {
    const results: ImageUpdateResult[] = []

    for (const update of updates) {
      const result = await this.handleImageUpload(
        update.fabricCode, 
        update.uploadResult
      )
      results.push(result)
    }

    // Final refresh of all counts
    await this.refreshImageStatusCounts()

    return results
  }
}

export const imageUpdateService = ImageUpdateService.getInstance()
