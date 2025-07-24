import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useInventoryStore } from '../store/inventoryStore'
import { useFabrics } from '../hooks/useFabrics'
import { useImageStatusUpdates } from '../hooks/useImageStatusUpdates'

/**
 * 🖼️ IMAGE STATUS FILTER COMPONENT
 * Ninh ơi, component này tạo 2 lựa chọn filter cho vải có/chưa có ảnh
 */

interface ImageStatusFilterProps {
  className?: string
}

export function ImageStatusFilter({ className = '' }: ImageStatusFilterProps) {
  const { filters, setFilters } = useInventoryStore()
  const { refreshImageStatusCounts } = useImageStatusUpdates()
  const queryClient = useQueryClient()

  // Get fabric counts for each image status - THEO CONTEXT HIỆN TẠI
  // Lấy filters hiện tại nhưng loại bỏ imageStatus để tính toán chính xác
  const baseFilters = { ...filters }
  delete baseFilters.imageStatus

  const allFabricsQuery = useFabrics(baseFilters, { page: 1, limit: 1000 })
  const withImagesQuery = useFabrics({ ...baseFilters, imageStatus: 'with_images' }, { page: 1, limit: 1000 })
  const withoutImagesQuery = useFabrics({ ...baseFilters, imageStatus: 'without_images' }, { page: 1, limit: 1000 })

  const allCount = allFabricsQuery.data?.total || 0
  const withImagesCount = withImagesQuery.data?.total || 0
  const withoutImagesCount = withoutImagesQuery.data?.total || 0

  // Auto-refresh counts when any query data changes
  useEffect(() => {
    refreshImageStatusCounts()
  }, [allFabricsQuery.data, withImagesQuery.data, withoutImagesQuery.data, refreshImageStatusCounts])

  // Listen for auto-sync cache invalidation
  useEffect(() => {
    const handleInvalidateCache = (_event: CustomEvent) => {
      console.log('🔄 Auto-sync triggered cache invalidation, refreshing image status...')

      // Invalidate all fabric queries to force refresh
      queryClient.invalidateQueries({ queryKey: ['fabrics'] })

      // Also refresh the image status counts
      refreshImageStatusCounts()
    }

    window.addEventListener('invalidateImageStatusCache', handleInvalidateCache as EventListener)

    return () => {
      window.removeEventListener('invalidateImageStatusCache', handleInvalidateCache as EventListener)
    }
  }, [queryClient, refreshImageStatusCounts])

  const handleImageStatusChange = (imageStatus: 'all' | 'with_images' | 'without_images') => {
    setFilters({ ...filters, imageStatus })
  }

  const getButtonClass = (status: 'all' | 'with_images' | 'without_images') => {
    const isActive = filters.imageStatus === status || (status === 'all' && !filters.imageStatus)
    return `
      px-4 py-2 rounded-lg font-medium transition-all duration-200 
      ${isActive 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }
    `.trim()
  }

  const getCountBadge = (count: number, isActive: boolean) => (
    <span className={`
      ml-2 px-2 py-1 text-xs rounded-full font-semibold
      ${isActive 
        ? 'bg-blue-500 text-white' 
        : 'bg-gray-300 text-gray-600'
      }
    `.trim()}>
      {count}
    </span>
  )

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">
          🖼️ Trạng thái ảnh
        </h3>
        <div className="text-xs text-gray-500">
          {/* Hiển thị context hiện tại thay vì tổng toàn bộ */}
          {Object.keys(baseFilters).some(key => baseFilters[key as keyof typeof baseFilters] && baseFilters[key as keyof typeof baseFilters] !== 'all')
            ? `Trong bộ lọc: ${allCount} vải`
            : `Tổng: ${allCount} vải`
          }
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* All Fabrics */}
        <button
          onClick={() => handleImageStatusChange('all')}
          className={getButtonClass('all')}
          disabled={allFabricsQuery.isLoading}
        >
          <div className="flex items-center justify-between">
            <span>📋 Tất cả</span>
            {getCountBadge(allCount, filters.imageStatus === 'all' || !filters.imageStatus)}
          </div>
        </button>

        {/* With Images */}
        <button
          onClick={() => handleImageStatusChange('with_images')}
          className={getButtonClass('with_images')}
          disabled={withImagesQuery.isLoading}
        >
          <div className="flex items-center justify-between">
            <span>✅ Có ảnh</span>
            {getCountBadge(withImagesCount, filters.imageStatus === 'with_images')}
          </div>
        </button>

        {/* Without Images */}
        <button
          onClick={() => handleImageStatusChange('without_images')}
          className={getButtonClass('without_images')}
          disabled={withoutImagesQuery.isLoading}
        >
          <div className="flex items-center justify-between">
            <span>❌ Chưa có ảnh</span>
            {getCountBadge(withoutImagesCount, filters.imageStatus === 'without_images')}
          </div>
        </button>
      </div>

      {/* Coverage Stats */}
      {allCount > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>📊 Tỷ lệ có ảnh:</span>
            <span className="font-semibold">
              {((withImagesCount / allCount) * 100).toFixed(1)}%
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(withImagesCount / allCount) * 100}%` }}
            />
          </div>
          
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>✅ {withImagesCount} có ảnh</span>
            <span>❌ {withoutImagesCount} chưa có</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {(allFabricsQuery.isLoading || withImagesQuery.isLoading || withoutImagesQuery.isLoading) && (
        <div className="mt-3 text-center">
          <div className="inline-flex items-center text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Đang tải...
          </div>
        </div>
      )}
    </div>
  )
}
