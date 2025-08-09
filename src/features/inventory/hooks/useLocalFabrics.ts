// src/features/inventory/hooks/useLocalFabrics.ts
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { dataService } from '../services/dataService'
import { Fabric, FabricFilters, FabricSortOptions } from '../types/fabric'
import { hasRealImage } from '@/data/fabricImageMapping'
import { useMemo } from 'react'

/**
 * Hook để quản lý dữ liệu vải từ file JSON local
 */

// Query keys
export const fabricQueryKeys = {
  all: ['fabrics'] as const,
  lists: () => [...fabricQueryKeys.all, 'list'] as const,
  list: (filters: FabricFilters, sort: FabricSortOptions, page: number, limit: number) =>
    [...fabricQueryKeys.lists(), { filters, sort, page, limit }] as const,
  details: () => [...fabricQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...fabricQueryKeys.details(), id] as const,
  stats: () => [...fabricQueryKeys.all, 'stats'] as const,
  summary: () => [...fabricQueryKeys.all, 'summary'] as const,
}

/**
 * Hook để load tất cả dữ liệu vải
 */
export function useAllFabrics() {
  return useQuery({
    queryKey: fabricQueryKeys.all,
    queryFn: () => dataService.getAllFabrics(),
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 10 * 60 * 1000, // 10 phút
  })
}

/**
 * Hook để load dữ liệu vải với filter, sort và pagination
 */
export function useFabrics(
  filters: FabricFilters = {},
  sort: FabricSortOptions = { field: 'status', direction: 'asc' },
  page: number = 1,
  limit: number = 20
) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: fabricQueryKeys.list(filters, sort, page, limit),
    queryFn: async () => {
      console.log('🔍 useFabrics query running with:', { filters, sort, page, limit })

      // Lấy tất cả dữ liệu từ cache hoặc load mới
      let allFabrics = queryClient.getQueryData<Fabric[]>(fabricQueryKeys.all)

      if (!allFabrics) {
        console.log('📦 Loading fabrics from dataService...')
        try {
          allFabrics = await dataService.getAllFabrics()
          console.log(`✅ Loaded ${allFabrics.length} fabrics`)
          queryClient.setQueryData(fabricQueryKeys.all, allFabrics)
        } catch (error) {
          console.error('❌ Failed to load fabrics:', error)
          throw error
        }
      } else {
        console.log(`📋 Using cached fabrics: ${allFabrics.length} items`)
      }

      if (!allFabrics || allFabrics.length === 0) {
        console.warn('⚠️ No fabrics data available')
        return {
          items: [],
          totalItems: 0,
          totalPages: 0,
          currentPage: page,
          hasNextPage: false,
          hasPrevPage: false
        }
      }

      // Apply filters
      let filteredFabrics = allFabrics

      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        filteredFabrics = filteredFabrics.filter(fabric =>
          fabric.code.toLowerCase().includes(searchTerm) ||
          fabric.name.toLowerCase().includes(searchTerm) ||
          (fabric.location && fabric.location.toLowerCase().includes(searchTerm)) ||
          (fabric.type && fabric.type.toLowerCase().includes(searchTerm))
        )
      }

      // Type filter
      if (filters.type && filters.type !== 'all') {
        filteredFabrics = filteredFabrics.filter(fabric => {
          // Xử lý đặc biệt cho "chính" - filter theo tên chứa "chính"
          if (filters.type === 'chính') {
            return fabric.name.toLowerCase().includes('chính')
          }
          // Các loại khác filter theo type thông thường
          return fabric.type === filters.type
        })
      }

      // Location filter
      if (filters.location && filters.location !== 'all') {
        filteredFabrics = filteredFabrics.filter(fabric => fabric.location === filters.location)
      }

      // Status filter
      if (filters.status && filters.status !== 'all') {
        filteredFabrics = filteredFabrics.filter(fabric => fabric.status === filters.status)
      }

      // Quantity filters
      if (filters.minQuantity !== undefined) {
        filteredFabrics = filteredFabrics.filter(fabric => fabric.quantity >= filters.minQuantity!)
      }

      if (filters.maxQuantity !== undefined) {
        filteredFabrics = filteredFabrics.filter(fabric => fabric.quantity <= filters.maxQuantity!)
      }

      // Apply image status filter with real image checking
      if (filters.imageStatus && filters.imageStatus !== 'all') {
        if (filters.imageStatus === 'with_images') {
          filteredFabrics = filteredFabrics.filter(fabric => {
            // Check if fabric actually has an image (not just a generated URL)
            return hasRealImage(fabric.code)
          })
        } else if (filters.imageStatus === 'without_images') {
          filteredFabrics = filteredFabrics.filter(fabric => {
            // Check if fabric doesn't have a real image
            return !hasRealImage(fabric.code)
          })
        }
      }

      // Apply sorting - ưu tiên sắp xếp theo trạng thái
      console.log(`🔄 Sorting ${filteredFabrics.length} fabrics by ${sort.field} ${sort.direction}`)
      let sortedFabrics: Fabric[]
      if (sort.field === 'status') {
        // Sắp xếp chỉ theo trạng thái
        sortedFabrics = dataService.sortFabricsByStatus(filteredFabrics)
        console.log('📊 Sorted by status priority')
      } else {
        // Sắp xếp theo field khác nhưng vẫn ưu tiên trạng thái
        sortedFabrics = dataService.sortFabrics(filteredFabrics, sort.field, sort.direction)
        console.log(`📊 Sorted by ${sort.field} with status priority`)
      }

      // Apply pagination
      const paginatedResult = dataService.paginateFabrics(sortedFabrics, page, limit)
      console.log(`📄 Paginated result: ${paginatedResult.items.length} items on page ${page}/${paginatedResult.totalPages}`)

      return paginatedResult
    },
    staleTime: 2 * 60 * 1000, // 2 phút
    gcTime: 5 * 60 * 1000, // 5 phút
  })
}

/**
 * Hook để lấy chi tiết một vải
 */
export function useFabric(id: number) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: fabricQueryKeys.detail(id),
    queryFn: async () => {
      // Thử lấy từ cache trước
      const allFabrics = queryClient.getQueryData<Fabric[]>(fabricQueryKeys.all)
      if (allFabrics) {
        const fabric = allFabrics.find(f => f.id === id)
        if (fabric) return fabric
      }

      // Nếu không có trong cache, load từ service
      return dataService.getFabricById(id)
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook để lấy vải theo mã
 */
export function useFabricByCode(code: string) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: [...fabricQueryKeys.details(), 'code', code],
    queryFn: async () => {
      // Thử lấy từ cache trước
      const allFabrics = queryClient.getQueryData<Fabric[]>(fabricQueryKeys.all)
      if (allFabrics) {
        const fabric = allFabrics.find(f => f.code === code)
        if (fabric) return fabric
      }

      // Nếu không có trong cache, load từ service
      return dataService.getFabricByCode(code)
    },
    enabled: !!code,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook để lấy thống kê
 */
export function useFabricStats() {
  return useQuery({
    queryKey: fabricQueryKeys.stats(),
    queryFn: () => dataService.getStats(),
    staleTime: 10 * 60 * 1000, // 10 phút
    gcTime: 30 * 60 * 1000, // 30 phút
  })
}

/**
 * Hook để lấy báo cáo tích hợp
 */
export function useIntegrationSummary() {
  return useQuery({
    queryKey: fabricQueryKeys.summary(),
    queryFn: () => dataService.loadIntegrationSummary(),
    staleTime: 30 * 60 * 1000, // 30 phút
    gcTime: 60 * 60 * 1000, // 1 giờ
  })
}

/**
 * Hook để lấy danh sách unique values cho filters
 */
export function useFabricFilterOptions() {
  const { data: allFabrics } = useAllFabrics()

  return useMemo(() => {
    if (!allFabrics) {
      return {
        types: [],
        locations: [],
        statuses: [],
      }
    }

    const types = Array.from(new Set(allFabrics.map(f => f.type).filter(Boolean)))
    const locations = Array.from(new Set(allFabrics.map(f => f.location).filter(Boolean)))
    const statuses = Array.from(new Set(allFabrics.map(f => f.status)))

    return {
      types: types.sort(),
      locations: locations.sort(),
      statuses: statuses.sort(),
    }
  }, [allFabrics])
}

/**
 * Hook để lấy ảnh của vải
 */
export function useFabricImages(fabric: Fabric | null) {
  return useMemo(() => {
    if (!fabric) {
      return {
        mainImage: null,
        allImages: [],
        hasImages: false,
      }
    }

    const mainImage = dataService.getMainImage(fabric)
    const allImages = dataService.getAllImages(fabric)

    return {
      mainImage,
      allImages,
      hasImages: allImages.length > 0,
    }
  }, [fabric])
}

/**
 * Hook để search fabrics với debounce
 */
export function useSearchFabrics(query: string, _debounceMs: number = 300) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: [...fabricQueryKeys.lists(), 'search', query],
    queryFn: async () => {
      if (!query.trim()) {
        return []
      }

      // Thử lấy từ cache trước
      let allFabrics = queryClient.getQueryData<Fabric[]>(fabricQueryKeys.all)
      
      if (!allFabrics) {
        allFabrics = await dataService.getAllFabrics()
        queryClient.setQueryData(fabricQueryKeys.all, allFabrics)
      }

      return dataService.searchFabrics(query)
    },
    enabled: !!query.trim(),
    staleTime: 1 * 60 * 1000, // 1 phút
    gcTime: 2 * 60 * 1000, // 2 phút
  })
}

/**
 * Hook để prefetch dữ liệu
 */
export function usePrefetchFabrics() {
  const queryClient = useQueryClient()

  const prefetchAllFabrics = () => {
    queryClient.prefetchQuery({
      queryKey: fabricQueryKeys.all,
      queryFn: () => dataService.getAllFabrics(),
      staleTime: 5 * 60 * 1000,
    })
  }

  const prefetchFabricStats = () => {
    queryClient.prefetchQuery({
      queryKey: fabricQueryKeys.stats(),
      queryFn: () => dataService.getStats(),
      staleTime: 10 * 60 * 1000,
    })
  }

  return {
    prefetchAllFabrics,
    prefetchFabricStats,
  }
}

/**
 * Hook để invalidate cache khi cần refresh dữ liệu
 */
export function useRefreshFabrics() {
  const queryClient = useQueryClient()

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: fabricQueryKeys.all })
  }

  const refreshStats = () => {
    queryClient.invalidateQueries({ queryKey: fabricQueryKeys.stats() })
  }

  const refreshSummary = () => {
    queryClient.invalidateQueries({ queryKey: fabricQueryKeys.summary() })
  }

  return {
    refreshAll,
    refreshStats,
    refreshSummary,
  }
}
