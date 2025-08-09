import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/common/design-system/components'
import { Fabric } from '../types'

interface VisibilityManagerProps {
  fabric: Fabric
  onVisibilityToggle: (fabricId: number, isHidden: boolean) => Promise<void>
  compact?: boolean
}

export function VisibilityManager({ fabric, onVisibilityToggle, compact = false }: VisibilityManagerProps) {
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    try {
      setLoading(true)
      await onVisibilityToggle(fabric.id, !fabric.isHidden)
    } catch (error) {
      console.error('Failed to toggle visibility:', error)
    } finally {
      setLoading(false)
    }
  }

  if (compact) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          handleToggle()
        }}
        disabled={loading}
        className={`p-1 h-6 w-6 ${
          fabric.isHidden
            ? 'text-red-600 hover:text-red-700'
            : 'text-gray-600 hover:text-gray-700'
        }`}
        title={fabric.isHidden ? 'Hiện sản phẩm' : 'Ẩn sản phẩm'}
      >
        {fabric.isHidden ? (
          <EyeOff className="w-3 h-3" />
        ) : (
          <Eye className="w-3 h-3" />
        )}
      </Button>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Hiển thị sản phẩm</h4>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          fabric.isHidden 
            ? 'bg-red-100 text-red-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {fabric.isHidden ? 'Đã ẩn' : 'Hiển thị'}
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">
              {fabric.isHidden ? 'Sản phẩm đang bị ẩn' : 'Sản phẩm đang hiển thị'}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {fabric.isHidden 
                ? 'Khách hàng không thể thấy sản phẩm này'
                : 'Khách hàng có thể thấy sản phẩm này'
              }
            </div>
          </div>
          
          <Button
            variant={fabric.isHidden ? "primary" : "secondary"}
            size="sm"
            onClick={handleToggle}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {fabric.isHidden ? (
              <>
                <Eye className="w-4 h-4" />
                {loading ? 'Đang hiện...' : 'Hiện'}
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                {loading ? 'Đang ẩn...' : 'Ẩn'}
              </>
            )}
          </Button>
        </div>
      </div>
      
      {fabric.isHidden && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <EyeOff className="w-4 h-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <div className="font-medium">Sản phẩm đã bị ẩn</div>
              <div className="mt-1">
                Sản phẩm này sẽ không hiển thị trong danh sách chính. 
                Bạn có thể bật "Hiển thị sản phẩm ẩn" trong bộ lọc để xem lại.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
