/**
 * Realtime Update Service
 * Ninh ơi, service này cập nhật realtime khi upload/xóa ảnh
 * Đơn giản và hiệu quả hơn auto-sync
 */

import { QueryClient } from '@tanstack/react-query'

export interface ImageStats {
  withImages: number
  withoutImages: number
  total: number
}

class RealtimeUpdateService {
  private static instance: RealtimeUpdateService
  private queryClient: QueryClient | null = null

  static getInstance(): RealtimeUpdateService {
    if (!RealtimeUpdateService.instance) {
      RealtimeUpdateService.instance = new RealtimeUpdateService()
    }
    return RealtimeUpdateService.instance
  }

  /**
   * Set query client for cache invalidation
   */
  setQueryClient(queryClient: QueryClient) {
    this.queryClient = queryClient
  }

  /**
   * Update image stats when upload new image
   */
  async onImageUploaded(fabricCode: string) {
    console.log(`📸 Image uploaded for ${fabricCode}, updating stats...`)
    
    if (!this.queryClient) {
      console.warn('QueryClient not set, skipping cache update')
      return
    }

    // Invalidate fabric queries to refresh data
    await this.queryClient.invalidateQueries({ queryKey: ['fabrics'] })
    await this.queryClient.invalidateQueries({ queryKey: ['fabric-stats'] })

    // Dispatch custom event for UI updates
    this.dispatchUpdateEvent('image-uploaded', { fabricCode })
    
    console.log(`✅ Stats updated after uploading image for ${fabricCode}`)
  }

  /**
   * Update image stats when delete image
   */
  async onImageDeleted(fabricCode: string) {
    console.log(`🗑️ Image deleted for ${fabricCode}, updating stats...`)
    
    if (!this.queryClient) {
      console.warn('QueryClient not set, skipping cache update')
      return
    }

    // Invalidate fabric queries to refresh data
    await this.queryClient.invalidateQueries({ queryKey: ['fabrics'] })
    await this.queryClient.invalidateQueries({ queryKey: ['fabric-stats'] })

    // Dispatch custom event for UI updates
    this.dispatchUpdateEvent('image-deleted', { fabricCode })
    
    console.log(`✅ Stats updated after deleting image for ${fabricCode}`)
  }

  /**
   * Batch update for multiple images
   */
  async onBatchImagesUpdated(fabricCodes: string[], action: 'uploaded' | 'deleted') {
    console.log(`📦 Batch ${action} for ${fabricCodes.length} fabrics, updating stats...`)
    
    if (!this.queryClient) {
      console.warn('QueryClient not set, skipping cache update')
      return
    }

    // Invalidate fabric queries to refresh data
    await this.queryClient.invalidateQueries({ queryKey: ['fabrics'] })
    await this.queryClient.invalidateQueries({ queryKey: ['fabric-stats'] })

    // Dispatch custom event for UI updates
    this.dispatchUpdateEvent('batch-images-updated', { 
      fabricCodes, 
      action,
      count: fabricCodes.length 
    })
    
    console.log(`✅ Stats updated after batch ${action} for ${fabricCodes.length} fabrics`)
  }

  /**
   * Update stats when price is updated
   */
  async onPriceUpdated(fabricId: number, price: number | null) {
    console.log(`💰 Price updated for fabric ${fabricId}:`, price ? `${price.toLocaleString('vi-VN')} VND` : 'Removed')

    if (!this.queryClient) {
      console.warn('QueryClient not set, skipping cache update')
      return
    }

    // Invalidate fabric queries to refresh data
    await this.queryClient.invalidateQueries({ queryKey: ['fabrics'] })
    await this.queryClient.invalidateQueries({ queryKey: ['fabric-stats'] })

    // Dispatch custom event for UI updates
    this.dispatchUpdateEvent('price-updated', { fabricId, price })

    console.log(`✅ Stats updated after price change for fabric ${fabricId}`)
  }

  /**
   * Update stats when visibility is toggled
   */
  async onVisibilityToggled(fabricId: number, isHidden: boolean) {
    console.log(`👁️ Visibility toggled for fabric ${fabricId}:`, isHidden ? 'Hidden' : 'Visible')

    if (!this.queryClient) {
      console.warn('QueryClient not set, skipping cache update')
      return
    }

    // Invalidate fabric queries to refresh data
    await this.queryClient.invalidateQueries({ queryKey: ['fabrics'] })
    await this.queryClient.invalidateQueries({ queryKey: ['fabric-stats'] })

    // Dispatch custom event for UI updates
    this.dispatchUpdateEvent('visibility-toggled', { fabricId, isHidden })

    console.log(`✅ Stats updated after visibility change for fabric ${fabricId}`)
  }

  /**
   * Force refresh all data
   */
  async forceRefresh() {
    console.log('🔄 Force refreshing all fabric data...')

    if (!this.queryClient) {
      console.warn('QueryClient not set, skipping cache update')
      return
    }

    // Invalidate all fabric-related queries
    await this.queryClient.invalidateQueries({ queryKey: ['fabrics'] })
    await this.queryClient.invalidateQueries({ queryKey: ['fabric-stats'] })

    // Dispatch custom event for UI updates
    this.dispatchUpdateEvent('force-refresh', {})

    console.log('✅ Force refresh completed')
  }

  /**
   * Dispatch custom event for UI components to listen
   */
  private dispatchUpdateEvent(type: string, data: any) {
    const event = new CustomEvent('realtimeUpdate', {
      detail: { type, data, timestamp: Date.now() }
    })
    window.dispatchEvent(event)
  }

  /**
   * Get current image stats from cache
   */
  getCurrentStats(): ImageStats | null {
    if (!this.queryClient) {
      return null
    }

    try {
      const statsData = this.queryClient.getQueryData(['fabric-stats'])
      if (statsData && typeof statsData === 'object') {
        const stats = statsData as any
        return {
          withImages: stats.withImages || 0,
          withoutImages: stats.withoutImages || 0,
          total: stats.totalItems || 0
        }
      }
    } catch (error) {
      console.warn('Failed to get current stats from cache:', error)
    }

    return null
  }

  /**
   * Update specific fabric in cache
   */
  updateFabricInCache(fabricCode: string, imageUrl: string) {
    if (!this.queryClient) {
      return
    }

    try {
      // Update all fabric list queries
      this.queryClient.setQueriesData(
        { queryKey: ['fabrics'] },
        (oldData: any) => {
          if (!oldData?.data) return oldData

          const updatedData = oldData.data.map((fabric: any) => {
            if (fabric.code === fabricCode) {
              return { ...fabric, image: imageUrl }
            }
            return fabric
          })

          return { ...oldData, data: updatedData }
        }
      )

      console.log(`📝 Updated fabric ${fabricCode} in cache with image: ${imageUrl ? 'YES' : 'NO'}`)
    } catch (error) {
      console.warn('Failed to update fabric in cache:', error)
    }
  }
}

// Export singleton instance
export const realtimeUpdateService = RealtimeUpdateService.getInstance()
