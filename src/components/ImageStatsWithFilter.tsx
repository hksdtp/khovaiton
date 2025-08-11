/**
 * Combined Image Stats Display + Filter Component
 * Ninh ơi, component này kết hợp hiển thị số liệu và filter ảnh
 * Gọn gàng hơn thay vì 2 component riêng biệt
 */

import { useState, useEffect } from 'react'
import { Image, ImageOff, Package, Filter } from 'lucide-react'
import { useFabricStats } from '@/features/inventory/hooks/useFabrics'
import { useInventoryStore } from '@/features/inventory/store/inventoryStore'
import { useFabrics } from '@/features/inventory/hooks/useFabrics'
import { useQueryClient } from '@tanstack/react-query'

interface ImageStatsWithFilterProps {
  className?: string
}

export function ImageStatsWithFilter({ className = '' }: ImageStatsWithFilterProps) {
  const { data: statsData, isLoading } = useFabricStats()
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const { filters, setFilters } = useInventoryStore()
  const queryClient = useQueryClient()

  // Get fabric counts for each image status - THEO CONTEXT HIỆN TẠI
  const baseFilters = { ...filters }
  delete baseFilters.imageStatus

  const allFabricsQuery = useFabrics(baseFilters, { page: 1, limit: 1000 })
  const withImagesQuery = useFabrics({ ...baseFilters, imageStatus: 'with_images' }, { page: 1, limit: 1000 })
  const withoutImagesQuery = useFabrics({ ...baseFilters, imageStatus: 'without_images' }, { page: 1, limit: 1000 })

  const allCount = allFabricsQuery.data?.total || 0
  const withImagesCount = withImagesQuery.data?.total || 0
  const withoutImagesCount = withoutImagesQuery.data?.total || 0

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
  const totalFabrics = statsData.totalItems || 0
  const fabricsWithImages = allFabricsQuery.data?.data?.filter(f => f.image).length || 0
  const fabricsWithoutImages = totalFabrics - fabricsWithImages

  const imagePercentage = totalFabrics > 0 ? Math.round((fabricsWithImages / totalFabrics) * 100) : 0

  const handleFilterChange = (imageStatus: string | null) => {
    setFilters({
      ...filters,
      imageStatus: imageStatus as 'all' | 'with_images' | 'without_images'
    })
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Stats Display */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              Tổng: <span className="text-blue-600 font-semibold">{totalFabrics}</span>
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
          
          <div className="text-sm text-gray-500">
            ({imagePercentage}% có ảnh)
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
            !filters.imageStatus
              ? 'bg-blue-100 text-blue-700 border-blue-300'
              : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
          }`}
        >
          Tất cả ({allCount})
        </button>
        
        <button
          onClick={() => handleFilterChange('with_images')}
          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
            filters.imageStatus === 'with_images'
              ? 'bg-green-100 text-green-700 border-green-300'
              : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
          }`}
        >
          Có ảnh ({withImagesCount})
        </button>
        
        <button
          onClick={() => handleFilterChange('without_images')}
          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
            filters.imageStatus === 'without_images'
              ? 'bg-orange-100 text-orange-700 border-orange-300'
              : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
          }`}
        >
          Chưa có ảnh ({withoutImagesCount})
        </button>
      </div>
    </div>
  )
}
