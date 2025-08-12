import { Camera, MapPin } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Modal, Button } from '@/common/design-system/components'
import { formatQuantity } from '@/shared/utils'
import { Fabric } from '../types'
import { ManualUrlForm } from './ManualUrlForm'
import { PriceManager } from './PriceManager'
import { VisibilityManager } from './VisibilityManager'


interface FabricDetailModalProps {
  fabric: Fabric
  isOpen: boolean
  onClose: () => void
  onUploadImage: (fabricId: number) => void
  onViewImage?: (imageUrl: string, fabricCode: string, fabricName: string) => void
  onPriceUpdate?: ((fabricId: number, price: number | null, note?: string) => Promise<void>) | undefined
  onVisibilityToggle?: ((fabricId: number, isHidden: boolean) => Promise<void>) | undefined
}

export function FabricDetailModal({
  fabric,
  isOpen,
  onClose,
  onUploadImage,
  onViewImage,
  onPriceUpdate,
  onVisibilityToggle,
}: FabricDetailModalProps) {
  const location = useLocation()
  const isMarketingVersion = location.pathname === '/marketing'
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

  const getStatusColor = (status: Fabric['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-50 border-green-200 text-green-700'
      case 'low_stock':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700'
      case 'out_of_stock':
        return 'bg-red-50 border-red-200 text-red-700'
      case 'damaged':
        return 'bg-orange-50 border-orange-200 text-orange-700'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700'
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết sản phẩm"
      size="lg"
    >
      <div className="p-6 overflow-y-auto max-h-[70vh] bg-white">
        {/* Image */}
        {fabric.image && (
          <div
            className="mb-6 rounded-lg overflow-hidden bg-gray-50 border border-gray-200 cursor-pointer group/image relative"
            onClick={() => onViewImage?.(fabric.image!, fabric.code, fabric.name)}
          >
            <img
              src={fabric.image}
              alt={fabric.name}
              className="w-full h-64 object-cover transition-transform duration-300 group-hover/image:scale-105"
            />
            {/* View overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-colors duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 bg-white/90 rounded-lg px-4 py-2">
                <span className="text-sm font-medium text-gray-800">👁️ Xem ảnh full size</span>
              </div>
            </div>
          </div>
        )}

        {/* Details */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Mã vải
            </label>
            <p className="text-xl font-bold text-gray-900 bg-gray-50 rounded-lg p-4 border border-gray-200">
              {fabric.code}
            </p>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Tên sản phẩm
            </label>
            <p className="text-gray-900 bg-gray-50 rounded-lg p-4 border border-gray-200 leading-relaxed">
              {fabric.name}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Số lượng
              </label>
              <p className="text-xl font-bold text-green-700 bg-green-50 rounded-lg p-4 border border-green-200">
                {formatQuantity(fabric.quantity, fabric.unit)}
              </p>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Trạng thái
              </label>
              <p className={`font-medium rounded-lg p-4 border ${getStatusColor(fabric.status)}`}>
                {getStatusText(fabric.status)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Loại vải
              </label>
              <p className="text-gray-900 bg-gray-50 rounded-lg p-4 border border-gray-200">
                {fabric.type}
              </p>
            </div>

            {fabric.material && (
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Chất liệu
                </label>
                <p className="text-gray-900 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  {fabric.material}
                </p>
              </div>
            )}
          </div>

          {fabric.width && (
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Khổ vải
              </label>
              <p className="text-gray-900 bg-gray-50 rounded-lg p-4 border border-gray-200">
                {fabric.width}cm
              </p>
            </div>
          )}

          {/* Vị trí kho - Ẩn trong phiên bản Marketing */}
          {!isMarketingVersion && (
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Vị trí kho
              </label>
              <p className="text-gray-900 bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                {fabric.location}
              </p>
            </div>
          )}

          {/* Tình trạng - Ẩn trong phiên bản Marketing */}
          {fabric.condition && !isMarketingVersion && (
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Tình trạng
              </label>
              <p className="text-orange-800 bg-orange-50 border border-orange-200 rounded-lg p-4">
                {fabric.condition}
              </p>
            </div>
          )}

          {fabric.remarks && (
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Ghi chú
              </label>
              <p className="text-blue-800 bg-blue-50 border border-blue-200 rounded-lg p-4">
                {fabric.remarks}
              </p>
            </div>
          )}

          {/* Legacy note field for backward compatibility */}
          {fabric.note && !fabric.condition && !fabric.remarks && (
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Ghi chú
              </label>
              <p className="text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                {fabric.note}
              </p>
            </div>
          )}

          {/* Ứng dụng vải */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Ứng dụng vải
            </label>
            <p className="text-blue-800 bg-blue-50 border border-blue-200 rounded-lg p-4">
              {fabric.application || 'Chưa xác định ứng dụng'}
            </p>
          </div>
        </div>

        {/* Price Management */}
        {onPriceUpdate && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <PriceManager
              fabric={fabric}
              onPriceUpdate={onPriceUpdate}
              compact={false}
            />
          </div>
        )}

        {/* Visibility Management */}
        {onVisibilityToggle && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <VisibilityManager
              fabric={fabric}
              onVisibilityToggle={onVisibilityToggle}
              compact={false}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-4">
          <Button
            onClick={() => onUploadImage(fabric.id)}
            className="w-full"
            leftIcon={<Camera className="w-4 h-4" />}
          >
            {fabric.image ? 'Đổi ảnh' : 'Thêm ảnh'}
          </Button>

          {/* Nút/ô đổi URL ảnh thủ công - Ẩn trong phiên bản marketing */}
          {!isMarketingVersion && (
            <div className="border-t border-gray-200 pt-4">
              <div className="text-sm text-gray-600 mb-3 font-medium">
                🔧 Đổi URL ảnh thủ công
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <ManualUrlForm fabricCode={fabric.code} compact={false} />
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
