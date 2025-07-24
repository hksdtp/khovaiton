/**
 * Hook for real-time image status updates
 * Provides optimistic updates and real-time synchronization for image status
 */

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { imageUpdateService } from '@/services/imageUpdateService'

export function useImageStatusUpdates() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Initialize image update service with query client
    imageUpdateService.setQueryClient(queryClient)
  }, [queryClient])

  /**
   * Trigger immediate refresh of image status counts
   */
  const refreshImageStatusCounts = async () => {
    await imageUpdateService.refreshImageStatusCounts()
  }

  /**
   * Handle optimistic image update
   */
  const updateImageOptimistically = (fabricCode: string, imageUrl: string) => {
    // Update all fabric queries optimistically
    queryClient.setQueriesData(
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

    // Invalidate related queries to trigger refetch
    queryClient.invalidateQueries({ queryKey: ['fabric-stats'] })
  }

  /**
   * Handle image deletion optimistically
   */
  const removeImageOptimistically = (fabricCode: string) => {
    // Update all fabric queries optimistically
    queryClient.setQueriesData(
      { queryKey: ['fabrics'] },
      (oldData: any) => {
        if (!oldData?.data) return oldData

        return {
          ...oldData,
          data: oldData.data.map((fabric: any) => 
            fabric.code === fabricCode 
              ? { ...fabric, image: null }
              : fabric
          )
        }
      }
    )

    // Invalidate related queries to trigger refetch
    queryClient.invalidateQueries({ queryKey: ['fabric-stats'] })
  }

  return {
    refreshImageStatusCounts,
    updateImageOptimistically,
    removeImageOptimistically
  }
}
