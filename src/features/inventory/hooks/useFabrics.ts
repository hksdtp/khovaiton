import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fabricApi } from '../api/fabricApi'
import { 
  FabricFilters, 
  CreateFabricRequest, 
  UpdateFabricRequest 
} from '../types'
import { PaginationParams } from '@/shared/types'

/**
 * Query keys for fabric-related queries
 */
export const fabricKeys = {
  all: ['fabrics'] as const,
  lists: () => [...fabricKeys.all, 'list'] as const,
  list: (filters: FabricFilters, pagination: PaginationParams) => 
    [...fabricKeys.lists(), { filters, pagination }] as const,
  details: () => [...fabricKeys.all, 'detail'] as const,
  detail: (id: number) => [...fabricKeys.details(), id] as const,
  stats: () => [...fabricKeys.all, 'stats'] as const,
}

/**
 * Hook to fetch paginated fabrics with filters
 */
export function useFabrics(
  filters: FabricFilters = {},
  pagination: PaginationParams = { page: 1, limit: 20 }
) {
  return useQuery({
    queryKey: fabricKeys.list(filters, pagination),
    queryFn: () => fabricApi.getFabrics(filters, pagination),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to fetch single fabric by ID
 */
export function useFabric(id: number) {
  return useQuery({
    queryKey: fabricKeys.detail(id),
    queryFn: () => fabricApi.getFabricById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to fetch fabric statistics
 */
export function useFabricStats() {
  return useQuery({
    queryKey: fabricKeys.stats(),
    queryFn: () => fabricApi.getFabricStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to create new fabric
 */
export function useCreateFabric() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateFabricRequest) => fabricApi.createFabric(data),
    onSuccess: () => {
      // Invalidate and refetch fabric lists
      queryClient.invalidateQueries({ queryKey: fabricKeys.lists() })
      queryClient.invalidateQueries({ queryKey: fabricKeys.stats() })
    },
  })
}

/**
 * Hook to update fabric
 */
export function useUpdateFabric() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateFabricRequest) => fabricApi.updateFabric(data),
    onSuccess: (updatedFabric) => {
      // Update the specific fabric in cache
      queryClient.setQueryData(
        fabricKeys.detail(updatedFabric.id),
        updatedFabric
      )
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: fabricKeys.lists() })
      queryClient.invalidateQueries({ queryKey: fabricKeys.stats() })
    },
  })
}

/**
 * Hook to delete fabric
 */
export function useDeleteFabric() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => fabricApi.deleteFabric(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: fabricKeys.detail(deletedId) })

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: fabricKeys.lists() })
      queryClient.invalidateQueries({ queryKey: fabricKeys.stats() })
    },
  })
}

/**
 * Hook to update fabric visibility (hide/show)
 */
export function useUpdateFabricVisibility() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ fabricId, isHidden }: { fabricId: number; isHidden: boolean }) =>
      fabricApi.updateFabricVisibility(fabricId, isHidden),
    onSuccess: (_, { fabricId, isHidden }) => {
      // Update the specific fabric in cache
      queryClient.setQueryData(
        fabricKeys.detail(fabricId),
        (oldData: any) => oldData ? { ...oldData, isHidden } : oldData
      )

      // Invalidate lists and stats to refresh counts
      queryClient.invalidateQueries({ queryKey: fabricKeys.lists() })
      queryClient.invalidateQueries({ queryKey: fabricKeys.stats() })

      console.log(`✅ Visibility updated for fabric ${fabricId}: ${isHidden ? 'hidden' : 'visible'}`)
    },
  })
}

/**
 * Hook to force refresh all fabric data (useful after bulk operations)
 */
export function useRefreshFabricData() {
  const queryClient = useQueryClient()

  return () => {
    console.log('🔄 Force refreshing all fabric data...')

    // Clear all fabric-related cache
    queryClient.removeQueries({ queryKey: fabricKeys.all })
    queryClient.invalidateQueries({ queryKey: fabricKeys.lists() })
    queryClient.invalidateQueries({ queryKey: fabricKeys.stats() })

    // Reset pagination to page 1 if possible
    const inventoryStore = (window as any).inventoryStore
    if (inventoryStore?.setCurrentPage) {
      inventoryStore.setCurrentPage(1)
    }

    console.log('✅ Fabric data refresh initiated')
  }
}

/**
 * Hook to upload fabric image
 */
export function useUploadFabricImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ fabricId, file }: { fabricId: number; file: File }) =>
      fabricApi.uploadFabricImage(fabricId, file),
    onSuccess: (imageUrl, { fabricId }) => {
      // Update fabric in cache with new image
      queryClient.setQueryData(
        fabricKeys.detail(fabricId),
        (oldData: any) => oldData ? { ...oldData, image: imageUrl } : oldData
      )

      // Invalidate lists and stats to show updated image and counts
      queryClient.invalidateQueries({ queryKey: fabricKeys.lists() })
      queryClient.invalidateQueries({ queryKey: fabricKeys.stats() })

      console.log(`✅ Image uploaded for fabric ${fabricId}, cache updated`)
    },
  })
}
