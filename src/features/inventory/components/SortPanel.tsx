import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { FabricSortOptions } from '../types'
import { Fabric } from '../types'

interface SortPanelProps {
  sortOptions: FabricSortOptions
  onSortChange: (sort: FabricSortOptions) => void
  className?: string
}

export function SortPanel({ sortOptions, onSortChange, className = '' }: SortPanelProps) {
  const sortFields: Array<{
    field: keyof Fabric
    label: string
    description: string
  }> = [
    {
      field: 'status',
      label: 'Trạng thái',
      description: 'Có sẵn → Sắp hết → Hết hàng → Hết hạn → Lỗi nhẹ'
    },
    {
      field: 'name',
      label: 'Tên vải',
      description: 'Sắp xếp theo tên vải A-Z hoặc Z-A'
    },
    {
      field: 'code',
      label: 'Mã vải',
      description: 'Sắp xếp theo mã vải'
    },
    {
      field: 'quantity',
      label: 'Số lượng',
      description: 'Sắp xếp theo số lượng tồn kho'
    },
    {
      field: 'location',
      label: 'Vị trí',
      description: 'Sắp xếp theo vị trí lưu trữ'
    },
    {
      field: 'updatedAt',
      label: 'Cập nhật',
      description: 'Sắp xếp theo thời gian cập nhật'
    }
  ]

  const handleFieldChange = (field: keyof Fabric) => {
    // Nếu chọn cùng field, đổi direction
    if (sortOptions.field === field) {
      onSortChange({
        field,
        direction: sortOptions.direction === 'asc' ? 'desc' : 'asc'
      })
    } else {
      // Nếu chọn field mới, mặc định là asc (trừ status luôn là asc)
      onSortChange({
        field,
        direction: field === 'status' ? 'asc' : 'asc'
      })
    }
  }

  const getSortIcon = (field: keyof Fabric) => {
    if (sortOptions.field !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />
    }
    
    if (sortOptions.direction === 'asc') {
      return <ArrowUp className="w-4 h-4 text-blue-600" />
    } else {
      return <ArrowDown className="w-4 h-4 text-blue-600" />
    }
  }

  const getButtonClass = (field: keyof Fabric) => {
    const isActive = sortOptions.field === field
    return `flex items-center justify-between w-full px-3 py-2 text-sm text-left rounded-lg border transition-all duration-200 ${
      isActive
        ? 'bg-blue-50 border-blue-200 text-blue-900 shadow-sm'
        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
    }`
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-1">Sắp xếp theo</h3>
        <p className="text-xs text-gray-500">Chọn tiêu chí sắp xếp sản phẩm</p>
      </div>
      
      <div className="p-4 space-y-2">
        {sortFields.map(({ field, label, description }) => (
          <button
            key={field}
            onClick={() => handleFieldChange(field)}
            className={getButtonClass(field)}
            title={description}
          >
            <div className="flex-1">
              <div className="font-medium">{label}</div>
              {sortOptions.field === field && (
                <div className="text-xs text-blue-600 mt-0.5">
                  {sortOptions.direction === 'asc' ? 'Tăng dần' : 'Giảm dần'}
                  {field === 'status' && sortOptions.direction === 'asc' && ' (Ưu tiên)'}
                </div>
              )}
            </div>
            {getSortIcon(field)}
          </button>
        ))}
      </div>
      
      {/* Status Priority Info */}
      {sortOptions.field === 'status' && (
        <div className="p-4 bg-blue-50 border-t border-blue-200">
          <div className="text-xs text-blue-800">
            <div className="font-medium mb-1">Thứ tự ưu tiên:</div>
            <div className="space-y-0.5">
              <div>1. ✅ Có sẵn</div>
              <div>2. ⚠️ Sắp hết</div>
              <div>3. ❌ Hết hàng</div>
              <div>4. ⏰ Hết hạn</div>
              <div>5. 🔧 Lỗi nhẹ</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
