import { Camera, MapPin, Package } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Card } from '@/common/design-system/components'
import { cn, formatQuantity } from '@/shared/utils'
import { Fabric } from '../types'
import { ManualUrlForm } from './ManualUrlForm'
import { StatusBadge } from './StatusBadge'
import { PriceManager } from './PriceManager'
import { VisibilityManager } from './VisibilityManager'
import { ProductDeletionManager } from './ProductDeletionManager'

interface FabricCardProps {
  fabric: Fabric
  onSelect: (fabric: Fabric) => void
  onUploadImage: (fabricId: number) => void
  onViewImage?: (imageUrl: string, fabricCode: string, fabricName: string) => void
  onPriceUpdate?: ((fabricId: number, price: number | null, note?: string) => Promise<void>) | undefined
  onVisibilityToggle?: ((fabricId: number, isHidden: boolean) => Promise<void>) | undefined
  onDelete?: ((fabricId: number, permanent: boolean) => Promise<void>) | undefined
  isMarketingMode?: boolean
  isSaleMode?: boolean
  className?: string
}

export function FabricCard({
  fabric,
  onSelect,
  onUploadImage,
  onViewImage,
  onPriceUpdate,
  onVisibilityToggle,
  onDelete,
  isMarketingMode = false,
  isSaleMode = false,
  className = ''
}: FabricCardProps) {
  const location = useLocation()
  const isMarketingVersion = location.pathname === '/marketing'

  // Debug: Log fabric price changes
  console.log(`🎯 FabricCard ${fabric.code} render - price: ${fabric.price} (${typeof fabric.price}), priceNote: ${fabric.priceNote}`)
  console.log(`🎯 Boolean check: Boolean(fabric.price) = ${Boolean(fabric.price)}, fabric.price ? true : false = ${fabric.price ? true : false}`)

  // Handle card click differently for marketing vs sales
  const handleCardClick = () => {
    if (isMarketingMode && !fabric.price && onPriceUpdate) {
      // On marketing page, if no price, don't open modal - let user click "Thêm giá" button
      return
    }
    // Otherwise, open detail modal as usual
    onSelect(fabric)
  }


  return (
    <Card
      hover
      className={cn(
        'group cursor-pointer animate-fade-in overflow-hidden',
        fabric.isHidden && 'opacity-60 border-red-200 bg-red-50/30',
        className
      )}
      onClick={handleCardClick}
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

        {/* Floating Camera Button - Ẩn trong phiên bản Marketing */}
        {!isMarketingVersion && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onUploadImage(fabric.id)
            }}
            className="absolute top-3 right-3 p-2 bg-white/90 rounded-lg border border-gray-200 text-gray-700 opacity-0 group-hover:opacity-100 hover:bg-white transition-all duration-200 shadow-sm"
          >
            <Camera className="w-4 h-4" />
          </button>
        )}

        {/* Hidden Badge */}
        {fabric.isHidden && (
          <div className="absolute top-3 right-3">
            <div className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-sm">
              ĐÃ ẨN
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Tags */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-md border border-blue-200">
            {fabric.code}
          </span>
          <StatusBadge status={fabric.status} />
          {fabric.type && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md border border-gray-200">
              {fabric.type}
            </span>
          )}
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

        {/* Price Display & Management */}
        <div className="mb-3">
          {(fabric.price || fabric.liquidationPrice) ? (
            <div className="space-y-2">
              {/* Giá bán thông thường */}
              {fabric.price && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-green-700">
                        {new Intl.NumberFormat('vi-VN', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(fabric.price)} ₫/{fabric.unit || 'm'}
                      </div>
                      {fabric.priceNote && (
                        <div className="text-sm text-green-600 mt-1">{fabric.priceNote}</div>
                      )}
                    </div>
                    {onPriceUpdate && !isMarketingVersion && (
                      <div className="flex items-center gap-1">
                        <PriceManager
                          fabric={fabric}
                          onPriceUpdate={onPriceUpdate}
                          compact={true}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Giá thanh lý */}
              {fabric.liquidationPrice && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-orange-600 font-medium mb-1">🏷️ Giá thanh lý</div>
                      <div className="text-lg font-bold text-orange-700">
                        {new Intl.NumberFormat('vi-VN', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(fabric.liquidationPrice)} ₫/{fabric.unit || 'm'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mb-3">
              {onPriceUpdate && !isMarketingVersion && (
                <PriceManager
                  fabric={fabric}
                  onPriceUpdate={onPriceUpdate}
                  compact={true}
                />
              )}
            </div>
          )}
        </div>

        {/* Visibility Management - Ẩn trong phiên bản Marketing */}
        {!isMarketingVersion && (
          <div className="flex items-center justify-end mb-3 gap-2">
            {onVisibilityToggle && (
              <VisibilityManager
                fabric={fabric}
                onVisibilityToggle={onVisibilityToggle}
                compact={true}
              />
            )}

            {/* Product Deletion Management - Only in SALE mode */}
            {isSaleMode && onDelete && (
              <ProductDeletionManager
                fabric={fabric}
                onDelete={onDelete}
                onVisibilityToggle={onVisibilityToggle || (() => Promise.resolve())}
                compact={true}
                showDeleteButton={true}
                showHideButton={false} // Already handled by VisibilityManager
                showRestoreButton={false}
              />
            )}
          </div>
        )}

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

        {/* Manual Image URL override - Ẩn trong phiên bản marketing */}
        {!isMarketingMode && (
          <div className="mt-4 border-t border-gray-100 pt-3">
            <details className="group">
              <summary className="text-xs text-gray-500 cursor-pointer select-none hover:text-blue-600 transition-colors list-none">
                <div className="flex items-center gap-1">
                  <span className="group-open:rotate-90 transition-transform">▶</span>
                  <span>⚙️ Đổi URL ảnh thủ công</span>
                </div>
              </summary>
              <div className="mt-2">
                <ManualUrlForm fabricCode={fabric.code} />
              </div>
            </details>
          </div>
        )}
      </div>
    </Card>
  )
}
