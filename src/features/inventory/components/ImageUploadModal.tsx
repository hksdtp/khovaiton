import { useRef } from 'react'
import { Upload } from 'lucide-react'
import { Modal, Button } from '@/common/design-system/components'

interface ImageUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (file: File) => void
  isUploading?: boolean
}

export function ImageUploadModal({
  isOpen,
  onClose,
  onUpload,
  isUploading = false,
}: ImageUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onUpload(file)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      onUpload(file)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm ảnh sản phẩm"
      size="md"
    >
      <div className="p-6">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="p-3 bg-blue-100 rounded-lg mb-4 mx-auto w-fit group-hover:bg-blue-200 transition-colors duration-200">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          
          {isUploading ? (
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full animate-pulse" />
              </div>
              <p className="text-gray-900 font-medium">Đang tải lên...</p>
            </div>
          ) : (
            <>
              <p className="text-gray-900 mb-2 font-medium">Kéo thả ảnh vào đây</p>
              <p className="text-gray-600 text-sm">Hoặc click để chọn file</p>
              <p className="text-gray-500 text-xs mt-2">
                PNG, JPG, GIF (tối đa 10MB)
              </p>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        <div className="mt-6 flex gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            disabled={isUploading}
            size="sm"
          >
            Hủy
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1"
            disabled={isUploading}
            isLoading={isUploading}
            size="sm"
          >
            Chọn file
          </Button>
        </div>
      </div>
    </Modal>
  )
}
