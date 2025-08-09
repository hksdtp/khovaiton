import { useState } from 'react'
import { DollarSign, Edit3, Save, X, Trash2 } from 'lucide-react'
import { Button } from '@/common/design-system/components'
import { Fabric } from '../types'

interface PriceManagerProps {
  fabric: Fabric
  onPriceUpdate: (fabricId: number, price: number | null, note?: string) => Promise<void>
  compact?: boolean
}

export function PriceManager({ fabric, onPriceUpdate, compact = false }: PriceManagerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [price, setPrice] = useState(fabric.price?.toString() || '')
  const [note, setNote] = useState(fabric.priceNote || '')
  const [loading, setLoading] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const formatInputPrice = (value: string) => {
    // Remove non-digits
    const numbers = value.replace(/\D/g, '')
    if (!numbers) return ''

    // Format with thousand separators
    return new Intl.NumberFormat('vi-VN').format(parseInt(numbers))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const priceValue = price ? parseFloat(price.replace(/[^\d]/g, '')) : null
      await onPriceUpdate(fabric.id, priceValue, note)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update price:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePriceChange = (value: string) => {
    const formatted = formatInputPrice(value)
    setPrice(formatted)
  }

  const handleCancel = () => {
    setPrice(fabric.price?.toString() || '')
    setNote(fabric.priceNote || '')
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (confirm('Bạn có chắc muốn xóa giá sản phẩm này?')) {
      try {
        setLoading(true)
        await onPriceUpdate(fabric.id, null, '')
      } catch (error) {
        console.error('Failed to delete price:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  if (compact) {
    return (
      <>
        <div className="flex items-center gap-2">
          {fabric.price ? (
            <>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  {formatPrice(fabric.price)}
                </div>
                {fabric.priceNote && (
                  <div className="text-xs text-gray-500">{fabric.priceNote}</div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEditing(true)
                }}
                className="p-1 h-6 w-6 text-blue-600 hover:text-blue-700"
                title="Sửa giá"
              >
                <Edit3 className="w-3 h-3" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setIsEditing(true)
              }}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              title="Thêm giá"
            >
              <DollarSign className="w-3 h-3 mr-1" />
              Thêm giá
            </Button>
          )}
        </div>

        {isEditing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleCancel}>
            <div className="bg-white rounded-lg p-6 w-96 max-w-sm mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-semibold text-lg mb-4 text-gray-900">
                {fabric.price ? 'Sửa giá' : 'Thêm giá'} - {fabric.code}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Giá bán (VND)</label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    placeholder="Nhập giá bán..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="VD: Giá sỉ, Giá lẻ..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mt-6">
                <div>
                  {fabric.price && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDelete}
                      disabled={loading}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Xóa giá
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? 'Đang lưu...' : 'Lưu'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  // Full version for detail modal
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Giá bán</h4>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit3 className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Giá bán (VND)</label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Nhập giá bán..."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Ghi chú</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú về giá..."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex justify-between">
            <div>
              {fabric.price && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Xóa giá
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-3">
          {fabric.price ? (
            <div>
              <div className="text-lg font-semibold text-green-600">
                {formatPrice(fabric.price)}
              </div>
              {fabric.priceNote && (
                <div className="text-sm text-gray-600 mt-1">
                  {fabric.priceNote}
                </div>
              )}
              {fabric.priceUpdatedAt && (
                <div className="text-xs text-gray-400 mt-1">
                  Cập nhật: {new Date(fabric.priceUpdatedAt).toLocaleDateString('vi-VN')}
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-2">
              <DollarSign className="w-6 h-6 mx-auto mb-1 text-gray-400" />
              <div className="text-sm">Chưa có giá</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
