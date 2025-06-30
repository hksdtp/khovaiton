import { Camera, MapPin } from 'lucide-react'
import { Modal, Button } from '@/common/design-system/components'
import { formatQuantity } from '@/shared/utils'
import { Fabric } from '../types'

interface FabricDetailModalProps {
  fabric: Fabric
  isOpen: boolean
  onClose: () => void
  onUploadImage: (fabricId: number) => void
}

export function FabricDetailModal({
  fabric,
  isOpen,
  onClose,
  onUploadImage,
}: FabricDetailModalProps) {
  const getStatusText = (status: Fabric['status']) => {
    switch (status) {
      case 'available':
        return 'Có sẵn'
      case 'low_stock':
        return 'Sắp hết'
      case 'out_of_stock':
        return 'Hết hàng'
      case 'damaged':
        return 'Hỏng'
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
          <div className="mb-6 rounded-lg overflow-hidden bg-gray-50 border border-gray-200">
            <img
              src={fabric.image}
              alt={fabric.name}
              className="w-full h-64 object-cover"
            />
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

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Vị trí kho
            </label>
            <p className="text-gray-900 bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              {fabric.location}
            </p>
          </div>

          {fabric.condition && (
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
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Button
            onClick={() => onUploadImage(fabric.id)}
            className="flex-1"
            leftIcon={<Camera className="w-4 h-4" />}
          >
            {fabric.image ? 'Đổi ảnh' : 'Thêm ảnh'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
