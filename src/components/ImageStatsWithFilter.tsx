/**
 * Combined Image Stats Display + Filter Component
 * Ninh ơi, component này kết hợp hiển thị số liệu và filter ảnh
 * Gọn gàng hơn thay vì 2 component riêng biệt
 */

import { useState, useEffect } from 'react'
import { Image, ImageOff, Package, Filter, EyeOff, Trash2 } from 'lucide-react'
import { useFabricStats } from '@/features/inventory/hooks/useFabrics'
import { useInventoryStore } from '@/features/inventory/store/inventoryStore'
import { useFabrics } from '@/features/inventory/hooks/useFabrics'
import { useQueryClient } from '@tanstack/react-query'
import { FabricFilters } from '@/features/inventory/types'

interface ImageStatsWithFilterProps {
  className?: string
  overrideFilters?: FabricFilters // Optional override filters from parent
}

export function ImageStatsWithFilter({ className = '', overrideFilters }: ImageStatsWithFilterProps) {
  const { data: statsData, isLoading } = useFabricStats()
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const { filters, setFilters } = useInventoryStore()
  const queryClient = useQueryClient()

  // Use override filters if provided, otherwise use store filters
  const activeFilters = overrideFilters || filters

  // Get fabric counts for each image status - THEO CONTEXT HIỆN TẠI
  const baseFilters = { ...activeFilters }
  delete baseFilters.imageStatus

  const allFabricsQuery = useFabrics(baseFilters, { page: 1, limit: 1000 })
  const withImagesQuery = useFabrics({ ...baseFilters, imageStatus: 'with_images' }, { page: 1, limit: 1000 })
  const withoutImagesQuery = useFabrics({ ...baseFilters, imageStatus: 'without_images' }, { page: 1, limit: 1000 })

  // Get hidden products stats
  const hiddenFabricsQuery = useFabrics({ ...baseFilters, showHidden: true }, { page: 1, limit: 1000 })

  const allCount = allFabricsQuery.data?.total || 0
  const withImagesCount = withImagesQuery.data?.total || 0
  const withoutImagesCount = withoutImagesQuery.data?.total || 0
  const hiddenCount = (hiddenFabricsQuery.data?.total || 0) - allCount // Hidden = Total with hidden - Total without hidden

  // Listen for realtime updates
  useEffect(() => {
    const handleRealtimeUpdate = (event: CustomEvent) => {
      const { type, data } = event.detail
      
      console.log(`📊 Stats updated: ${type}`, data)
      setLastUpdate(new Date())
      
      // Invalidate all fabric queries to force refresh
      queryClient.invalidateQueries({ queryKey: ['fabrics'] })
    }

    window.addEventListener('realtimeUpdate', handleRealtimeUpdate as EventListener)

    return () => {
      window.removeEventListener('realtimeUpdate', handleRealtimeUpdate as EventListener)
    }
  }, [queryClient])

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (!statsData) {
    return null
  }

  // Calculate image stats from available data
  const totalFabrics = allCount || statsData.totalItems || 0
  const fabricsWithImages = withImagesCount || 0
  const fabricsWithoutImages = withoutImagesCount || 0
  const fabricsHidden = hiddenCount || 0

  const imagePercentage = totalFabrics > 0 ? Math.round((fabricsWithImages / totalFabrics) * 100) : 0
  const hiddenPercentage = (totalFabrics + fabricsHidden) > 0 ? Math.round((fabricsHidden / (totalFabrics + fabricsHidden)) * 100) : 0

  const handleFilterChange = (imageStatus: string | null) => {
    setFilters({
      ...activeFilters,
      imageStatus: imageStatus === null ? 'all' : imageStatus as 'with_images' | 'without_images'
    })
  }

  const handleHiddenToggle = () => {
    setFilters({
      ...activeFilters,
      showHidden: !activeFilters.showHidden
    })
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Stats Display */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 flex-wrap">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              Hiển thị: <span className="text-blue-600 font-semibold">{totalFabrics}</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Image className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700">
              Có ảnh: <span className="text-green-600 font-semibold">{fabricsWithImages}</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <ImageOff className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-700">
              Chưa có ảnh: <span className="text-orange-600 font-semibold">{fabricsWithoutImages}</span>
            </span>
          </div>

          {fabricsHidden > 0 && (
            <div className="flex items-center space-x-2">
              <EyeOff className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-gray-700">
                Đã ẩn: <span className="text-red-600 font-semibold">{fabricsHidden}</span>
              </span>
            </div>
          )}

          <div className="text-sm text-gray-500">
            ({imagePercentage}% có ảnh{fabricsHidden > 0 ? `, ${hiddenPercentage}% đã ẩn` : ''})
          </div>
        </div>

        {lastUpdate && (
          <div className="text-xs text-gray-400">
            Cập nhật: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Lọc:</span>
        
        <button
          onClick={() => handleFilterChange(null)}
          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
            !activeFilters.imageStatus || activeFilters.imageStatus === 'all'
              ? 'bg-blue-100 text-blue-700 border-blue-300'
              : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
          }`}
        >
          Tất cả ({allCount})
        </button>

        <button
          onClick={() => handleFilterChange('with_images')}
          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
            activeFilters.imageStatus === 'with_images'
              ? 'bg-green-100 text-green-700 border-green-300'
              : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
          }`}
        >
          Có ảnh ({withImagesCount})
        </button>

        <button
          onClick={() => handleFilterChange('without_images')}
          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
            activeFilters.imageStatus === 'without_images'
              ? 'bg-orange-100 text-orange-700 border-orange-300'
              : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
          }`}
        >
          Chưa có ảnh ({withoutImagesCount})
        </button>

        {/* Hidden products toggle */}
        <button
          onClick={handleHiddenToggle}
          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
            activeFilters.showHidden
              ? 'bg-red-100 text-red-700 border-red-300'
              : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
          }`}
          title={activeFilters.showHidden ? 'Ẩn sản phẩm đã ẩn' : 'Hiển thị sản phẩm đã ẩn'}
        >
          <EyeOff className="w-3 h-3 inline mr-1" />
          {activeFilters.showHidden ? 'Ẩn SP đã ẩn' : `Hiện SP đã ẩn (${fabricsHidden})`}
        </button>
      </div>
    </div>
  )
}
