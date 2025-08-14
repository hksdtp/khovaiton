import { useState } from 'react'
import { Trash2, EyeOff, Eye, AlertTriangle, RotateCcw } from 'lucide-react'
import { Button } from '@/common/design-system/components'
import { Fabric } from '../types'

interface ProductDeletionManagerProps {
  fabric: Fabric
  onDelete: (fabricId: number, permanent: boolean) => Promise<void>
  onVisibilityToggle: (fabricId: number, isHidden: boolean) => Promise<void>
  onRestore?: (fabricId: number) => Promise<void>
  compact?: boolean
  showDeleteButton?: boolean
  showHideButton?: boolean
  showRestoreButton?: boolean
}

export function ProductDeletionManager({
  fabric,
  onDelete,
  onVisibilityToggle,
  onRestore,
  compact = false,
  showDeleteButton = true,
  showHideButton = true,
  showRestoreButton = false
}: ProductDeletionManagerProps) {
  const [loading, setLoading] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [deleteType, setDeleteType] = useState<'permanent' | 'hide'>('hide')

  const handleDeleteClick = (permanent: boolean) => {
    setDeleteType(permanent ? 'permanent' : 'hide')
    setShowConfirmModal(true)
  }

  const handleConfirmDelete = async () => {
    try {
      setLoading(true)
      if (deleteType === 'permanent') {
        await onDelete(fabric.id, true)
      } else {
        await onVisibilityToggle(fabric.id, true)
      }
      setShowConfirmModal(false)
    } catch (error) {
      console.error('Failed to delete/hide product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVisibilityToggle = async () => {
    try {
      setLoading(true)
      await onVisibilityToggle(fabric.id, !fabric.isHidden)
    } catch (error) {
      console.error('Failed to toggle visibility:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async () => {
    if (!onRestore) return
    try {
      setLoading(true)
      await onRestore(fabric.id)
    } catch (error) {
      console.error('Failed to restore product:', error)
    } finally {
      setLoading(false)
    }
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {/* Hide/Show Toggle */}
        {showHideButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleVisibilityToggle()
            }}
            disabled={loading}
            className={`p-1 h-6 w-6 ${
              fabric.isHidden
                ? 'text-orange-600 hover:text-orange-700'
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
        )}

        {/* Restore Button (for hidden products) */}
        {showRestoreButton && fabric.isHidden && onRestore && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleRestore()
            }}
            disabled={loading}
            className="p-1 h-6 w-6 text-green-600 hover:text-green-700"
            title="Khôi phục sản phẩm"
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
        )}

        {/* Delete Button */}
        {showDeleteButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteClick(true)
            }}
            disabled={loading}
            className="p-1 h-6 w-6 text-red-600 hover:text-red-700"
            title="Xóa vĩnh viễn"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <ConfirmDeleteModal
            fabric={fabric}
            deleteType={deleteType}
            onConfirm={handleConfirmDelete}
            onCancel={() => setShowConfirmModal(false)}
            loading={loading}
          />
        )}
      </div>
    )
  }

  // Full size component
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          🗑️ Quản lý sản phẩm
        </h4>
        
        <div className="space-y-3">
          {/* Hide/Show Section */}
          <div className="flex items-center justify-between p-3 bg-white rounded border">
            <div>
              <div className="text-sm font-medium">
                {fabric.isHidden ? 'Sản phẩm đang bị ẩn' : 'Sản phẩm đang hiển thị'}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {fabric.isHidden 
                  ? 'Khách hàng không thể thấy sản phẩm này trong phiên bản Marketing'
                  : 'Khách hàng có thể thấy sản phẩm này trong phiên bản Marketing'
                }
              </div>
            </div>
            
            <Button
              variant={fabric.isHidden ? "primary" : "secondary"}
              size="sm"
              onClick={handleVisibilityToggle}
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

          {/* Delete Section */}
          <div className="flex items-center justify-between p-3 bg-red-50 rounded border border-red-200">
            <div>
              <div className="text-sm font-medium text-red-900">
                Xóa sản phẩm vĩnh viễn
              </div>
              <div className="text-xs text-red-700 mt-1">
                ⚠️ Hành động này không thể hoàn tác. Sản phẩm sẽ bị xóa khỏi database.
              </div>
            </div>
            
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDeleteClick(true)}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {loading ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <ConfirmDeleteModal
          fabric={fabric}
          deleteType={deleteType}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirmModal(false)}
          loading={loading}
        />
      )}
    </div>
  )
}

// Confirmation Modal Component
interface ConfirmDeleteModalProps {
  fabric: Fabric
  deleteType: 'permanent' | 'hide'
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}

function ConfirmDeleteModal({
  fabric,
  deleteType,
  onConfirm,
  onCancel,
  loading
}: ConfirmDeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {deleteType === 'permanent' ? 'Xóa vĩnh viễn?' : 'Ẩn sản phẩm?'}
            </h3>
          </div>
        </div>

        <div className="mb-6">
          <div className="text-sm text-gray-600 mb-3">
            Bạn có chắc chắn muốn {deleteType === 'permanent' ? 'xóa vĩnh viễn' : 'ẩn'} sản phẩm:
          </div>
          <div className="p-3 bg-gray-50 rounded border">
            <div className="font-medium text-gray-900">{fabric.code}</div>
            <div className="text-sm text-gray-600">{fabric.name}</div>
          </div>
          
          {deleteType === 'permanent' ? (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
              <div className="text-sm text-red-800">
                ⚠️ <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác. 
                Sản phẩm sẽ bị xóa hoàn toàn khỏi hệ thống.
              </div>
            </div>
          ) : (
            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded">
              <div className="text-sm text-orange-800">
                💡 Sản phẩm sẽ bị ẩn khỏi phiên bản Marketing nhưng vẫn có thể 
                được quản lý trong phiên bản SALE.
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
            className="flex-1"
          >
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Đang xử lý...' : (deleteType === 'permanent' ? 'Xóa vĩnh viễn' : 'Ẩn sản phẩm')}
          </Button>
        </div>
      </div>
    </div>
  )
}
