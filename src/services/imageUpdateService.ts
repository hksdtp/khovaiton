/**
 * Image Update Service - Real-time image status updates
 * Handles cache invalidation and UI updates when images are uploaded/changed
 */

import { QueryClient } from '@tanstack/react-query'
import { syncService } from './syncService'
import { CloudinaryUploadResult } from './cloudinaryService'

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

      // 3. Invalidate all related queries to trigger refetch
      await this.invalidateAllImageQueries()

      // 4. Force refresh specific fabric image
      await this.refreshFabricImage(fabricCode)

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
   * Update fabric image in React Query cache optimistically
   */
  private updateFabricInCache(fabricCode: string, imageUrl: string) {
    if (!this.queryClient) return

    // Update all fabric list queries
    this.queryClient.setQueriesData(
      { queryKey: ['fabrics'] },
      (oldData: any) => {
        if (!oldData?.data) return oldData

        return {
          ...oldData,
          data: oldData.data.map((fabric: any) => 
            fabric.code === fabricCode 
              ? { ...fabric, image: imageUrl }
              : fabric
          )
        }
      }
    )

    console.log(`🔄 Updated fabric ${fabricCode} in cache with new image`)
  }

  /**
   * Invalidate all image-related queries
   */
  private async invalidateAllImageQueries() {
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
  private async refreshFabricImage(fabricCode: string) {
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
      await syncService.updateFabricImage(fabricCode, null, null)

      // 2. Update fabric data in cache
      this.updateFabricInCache(fabricCode, '')

      // 3. Invalidate queries
      await this.invalidateAllImageQueries()

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
