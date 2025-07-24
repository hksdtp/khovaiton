import { Camera, MapPin, Package } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Card } from '@/common/design-system/components'
import { cn, formatQuantity } from '@/shared/utils'
import { Fabric } from '../types'

interface FabricCardProps {
  fabric: Fabric
  onSelect: (fabric: Fabric) => void
  onUploadImage: (fabricId: number) => void
  onViewImage?: (imageUrl: string, fabricCode: string, fabricName: string) => void
  className?: string
}

export function FabricCard({
  fabric,
  onSelect,
  onUploadImage,
  onViewImage,
  className
}: FabricCardProps) {
  const location = useLocation()
  const isMarketingVersion = location.pathname === '/marketing'
  const getStatusColor = (status: Fabric['status']) => {
    switch (status) {
      case 'available':
        return 'text-green-700 border-green-200'
      case 'low_stock':
        return 'text-yellow-700 border-yellow-200'
      case 'out_of_stock':
        return 'text-red-700 border-red-200'
      case 'damaged':
        return 'text-orange-700 border-orange-200'
      default:
        return 'text-gray-700 border-gray-200'
    }
  }

  const getStatusText = (status: Fabric['status']) => {
    switch (status) {
      case 'available':
        return 'Có sẵn'
      case 'low_stock':
        return 'Sắp hết'
      case 'out_of_stock':
        return 'Hết hàng'
      case 'damaged':
        return 'Lỗi nhẹ'
      default:
        return 'Không xác định'
    }
  }

  return (
    <Card
      hover
      className={cn(
        'group cursor-pointer animate-fade-in overflow-hidden',
        className
      )}
      onClick={() => onSelect(fabric)}
    >
      {/* Image Section */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {fabric.image ? (
          <div
            className="relative w-full h-full cursor-pointer group/image"
            onClick={(e) => {
              e.stopPropagation()
              onViewImage?.(fabric.image!, fabric.code, fabric.name)
            }}
          >
            <img
              src={fabric.image}
              alt={fabric.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* View overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-colors duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 bg-white/90 rounded-lg px-3 py-2">
                <span className="text-sm font-medium text-gray-800">👁️ Xem ảnh</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="p-4 bg-gray-200 rounded-lg mb-3 mx-auto w-fit">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <span className="text-sm text-gray-500">Chưa có ảnh</span>
            </div>
          </div>
        )}
        
        {/* Floating Camera Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onUploadImage(fabric.id)
          }}
          className="absolute top-3 right-3 p-2 bg-white/90 rounded-lg border border-gray-200 text-gray-700 opacity-0 group-hover:opacity-100 hover:bg-white transition-all duration-200 shadow-sm"
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* Status Badge */}
        <div className="absolute bottom-3 left-3">
          <span
            className={cn(
              'px-2 py-1 text-xs font-medium rounded-md bg-white/90 border',
              getStatusColor(fabric.status)
            )}
          >
            {getStatusText(fabric.status)}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Tags */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-md border border-blue-200">
            {fabric.code}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md border border-gray-200">
            {fabric.type}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 leading-snug text-base group-hover:text-blue-600 transition-colors duration-200">
          {fabric.name}
        </h3>

        {/* Quantity */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-600 text-sm">Số lượng:</span>
          <span className="font-semibold text-green-600 text-base">
            {formatQuantity(fabric.quantity, fabric.unit)}
          </span>
        </div>

        {/* Material & Width */}
        {(fabric.material || fabric.width) && (
          <div className="flex items-center justify-between mb-3 text-sm">
            {fabric.material && (
              <span className="text-gray-600">{fabric.material}</span>
            )}
            {fabric.width && (
              <span className="text-gray-600">W{fabric.width}cm</span>
            )}
          </div>
        )}

        {/* Location - Ẩn trong phiên bản Marketing */}
        {!isMarketingVersion && (
          <div className="flex items-center gap-2 text-sm mb-3">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600 truncate">{fabric.location}</span>
          </div>
        )}

        {/* Condition - Bỏ hiển thị chi tiết */}

        {/* Remarks */}
        {fabric.remarks && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
            <div className="text-blue-800 text-xs">
              <span className="font-medium">Ghi chú: </span>
              {fabric.remarks}
            </div>
          </div>
        )}

        {/* Legacy Note (for backward compatibility) */}
        {fabric.note && !fabric.condition && !fabric.remarks && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
            <span className="text-yellow-800 text-xs">{fabric.note}</span>
          </div>
        )}
      </div>
    </Card>
  )
}
