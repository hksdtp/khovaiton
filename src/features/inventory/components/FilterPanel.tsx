import { useState } from 'react'
import { X, RotateCcw } from 'lucide-react'
import { Button } from '@/common/design-system/components'
import { FabricFilters, FabricType, FabricStatus } from '../types'

interface FilterPanelProps {
  isOpen: boolean
  onClose: () => void
  filters: FabricFilters
  onFiltersChange: (filters: Partial<FabricFilters>) => void
  onResetFilters: () => void
  resultCount?: number | undefined
}

export function FilterPanel({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onResetFilters,
  resultCount,
}: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<FabricFilters>(filters)

  const fabricTypes: (FabricType | 'all')[] = [
    'all',
    'Roller',      // 85 fabrics (25.4%) - Nhiều nhất
    'Vải bọc',     // 23 fabrics (6.9%)
    'Suntrip',     // 7 fabrics (2.1%)
    'voan',        // 4 fabrics (1.2%)
    'Silhouette',  // 2 fabrics (0.6%)
    'lót',         // 1 fabric (0.3%)
    'chính',       // Thêm lại - có 78 fabrics có từ "chính" trong tên
  ]

  const fabricStatuses: (FabricStatus | 'all')[] = [
    'all',
    'available',
    'low_stock',
    'out_of_stock',
    'damaged',
  ]

  const locations = [
    'all',
    'T4 D3+E3',
    'T4 G3.1',
    'T4 F3',
    'T4.H1',
    'T4 B1.2',
    'T4 giữa A-B',
    'T4 A1',
    'T4 B2',
    'T4 C3',
  ]



  const handleLocalFilterChange = (key: keyof FabricFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
  }

  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
  }

  const handleResetFilters = () => {
    const resetFilters: FabricFilters = {
      search: '',
      type: 'all',
      location: 'all',
      status: 'all',
    }
    setLocalFilters(resetFilters)
    onResetFilters()
  }

  const getStatusText = (status: FabricStatus | 'all') => {
    switch (status) {
      case 'all': return 'Tất cả'
      case 'available': return 'Có sẵn'
      case 'low_stock': return 'Sắp hết'
      case 'out_of_stock': return 'Hết hàng'
      case 'damaged': return 'Hỏng'
      default: return status
    }
  }

  if (!isOpen) return null

  return (
    <div className="animate-slide-in bg-white border border-gray-200 rounded-lg shadow-lg p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Bộ lọc nâng cao</h3>
          {resultCount !== undefined && (
            <p className="text-sm text-gray-600 mt-1">
              {resultCount} kết quả được tìm thấy
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Loại vải */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loại vải
          </label>
          <select
            value={localFilters.type || 'all'}
            onChange={(e) => handleLocalFilterChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tất cả loại</option>
            {fabricTypes.slice(1).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Vị trí kho */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vị trí kho
          </label>
          <select
            value={localFilters.location || 'all'}
            onChange={(e) => handleLocalFilterChange('location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tất cả vị trí</option>
            {locations.slice(1).map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {/* Trạng thái ảnh */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🖼️ Trạng thái ảnh
          </label>
          <select
            value={localFilters.imageStatus || 'all'}
            onChange={(e) => handleLocalFilterChange('imageStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">📋 Tất cả</option>
            <option value="with_images">✅ Có ảnh</option>
            <option value="without_images">❌ Chưa có ảnh</option>
          </select>
        </div>

        {/* Trạng thái */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái
          </label>
          <select
            value={localFilters.status || 'all'}
            onChange={(e) => handleLocalFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {fabricStatuses.map((status) => (
              <option key={status} value={status}>
                {getStatusText(status)}
              </option>
            ))}
          </select>
        </div>

        {/* Số lượng tối thiểu */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số lượng tối thiểu
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={localFilters.minQuantity || ''}
            onChange={(e) => handleLocalFilterChange('minQuantity', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Số lượng tối đa */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số lượng tối đa
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={localFilters.maxQuantity || ''}
            onChange={(e) => handleLocalFilterChange('maxQuantity', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="1000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Price Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái giá
          </label>
          <select
            value={localFilters.priceStatus || 'all'}
            onChange={(e) => handleLocalFilterChange('priceStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="with_price">Có giá</option>
            <option value="without_price">Chưa có giá</option>
          </select>
        </div>

        {/* Visibility Filter */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={localFilters.showHidden || false}
              onChange={(e) => handleLocalFilterChange('showHidden', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Hiển thị sản phẩm đã ẩn
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Bao gồm các sản phẩm đã bị ẩn khỏi danh sách chính
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
        <Button
          variant="secondary"
          onClick={handleResetFilters}
          leftIcon={<RotateCcw className="w-4 h-4" />}
          size="sm"
        >
          Reset bộ lọc
        </Button>
        
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            size="sm"
          >
            Hủy
          </Button>
          <Button
            onClick={handleApplyFilters}
            size="sm"
          >
            Áp dụng bộ lọc
          </Button>
        </div>
      </div>
    </div>
  )
}
