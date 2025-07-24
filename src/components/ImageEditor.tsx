/**
 * Image Editor Component
 * Allows users to crop, resize, and edit images after upload
 */

import { useState, useRef, useCallback } from 'react'
import { Save, RotateCw, Square, Maximize, X } from 'lucide-react'

interface ImageEditorProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  fabricCode: string
  onSave: (editedImageBlob: Blob) => Promise<void>
  className?: string
}

export function ImageEditor({
  isOpen,
  onClose,
  imageUrl,
  fabricCode,
  onSave,
  className = ''
}: ImageEditorProps) {
  const [rotation, setRotation] = useState(0)
  const [scale, setScale] = useState(1)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [isSaving, setIsSaving] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Handle image load
  const onImageLoad = useCallback(() => {
    // Image loaded successfully
  }, [])

  // Handle rotation
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  // Reset all adjustments
  const handleReset = () => {
    setRotation(0)
    setScale(1)
    setBrightness(100)
    setContrast(100)
  }

  // Generate canvas with edited image
  const generateEditedImage = useCallback(async (): Promise<Blob | null> => {
    const image = imgRef.current
    const canvas = canvasRef.current

    if (!image || !canvas) {
      console.error('Image or canvas not available')
      return null
    }

    // Wait for image to load completely
    if (!image.complete || image.naturalWidth === 0) {
      console.error('Image not loaded completely')
      return null
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.error('Cannot get canvas context')
      return null
    }

    try {
      // Calculate canvas dimensions based on rotation
      let canvasWidth = image.naturalWidth
      let canvasHeight = image.naturalHeight

      if (rotation === 90 || rotation === 270) {
        canvasWidth = image.naturalHeight
        canvasHeight = image.naturalWidth
      }

      // Set canvas size
      canvas.width = canvasWidth
      canvas.height = canvasHeight

      // Clear canvas
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)

      // Apply transformations
      ctx.save()

      // Move to center for rotation
      ctx.translate(canvasWidth / 2, canvasHeight / 2)

      // Apply rotation
      if (rotation !== 0) {
        ctx.rotate((rotation * Math.PI) / 180)
      }

      // Apply scale
      ctx.scale(scale, scale)

      // Apply filters
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`

      // Draw image centered
      ctx.drawImage(
        image,
        -image.naturalWidth / 2,
        -image.naturalHeight / 2,
        image.naturalWidth,
        image.naturalHeight
      )

      ctx.restore()

      // Convert canvas to blob
      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log('✅ Image blob generated successfully', blob.size, 'bytes')
              resolve(blob)
            } else {
              console.error('❌ Failed to generate blob')
              reject(new Error('Failed to generate blob'))
            }
          },
          'image/jpeg',
          0.9 // Quality
        )
      })
    } catch (error) {
      console.error('❌ Error generating edited image:', error)
      return null
    }
  }, [rotation, brightness, contrast, scale])

  // Handle save
  const handleSave = async () => {
    setIsSaving(true)

    try {
      console.log('🔄 Starting image save process...')

      // Validate image is loaded
      const image = imgRef.current
      if (!image || !image.complete) {
        throw new Error('Ảnh chưa được tải hoàn tất. Vui lòng đợi và thử lại.')
      }

      const editedBlob = await generateEditedImage()

      if (editedBlob) {
        console.log('✅ Generated edited image blob:', editedBlob.size, 'bytes')
        await onSave(editedBlob)
        console.log('✅ Image saved successfully')
        onClose()
      } else {
        throw new Error('Không thể tạo ảnh đã chỉnh sửa. Vui lòng thử lại.')
      }
    } catch (error) {
      console.error('❌ Failed to save edited image:', error)
      const errorMessage = error instanceof Error ? error.message : 'Không thể lưu ảnh đã chỉnh sửa. Vui lòng thử lại.'
      alert(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className={`fixed inset-0 z-50 ${className}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90" />

      {/* Modal Content */}
      <div className="relative w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm">
          <div>
            <h3 className="text-white font-semibold text-lg">
              Chỉnh sửa ảnh: {fabricCode}
            </h3>
            <p className="text-white/70 text-sm">
              Xoay, điều chỉnh độ sáng và độ tương phản
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Actions */}
            <button
              onClick={handleReset}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              title="Đặt lại"
            >
              <Maximize className="w-5 h-5" />
            </button>

            <button
              onClick={handleRotate}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              title="Xoay ảnh"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
          <div className="max-w-4xl max-h-full">
            <img
              ref={imgRef}
              src={imageUrl}
              alt={`Edit ${fabricCode}`}
              className="max-w-full max-h-full object-contain"
              style={{
                transform: `rotate(${rotation}deg) scale(${scale})`,
                filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                transition: 'all 0.3s ease'
              }}
              onLoad={onImageLoad}
              crossOrigin="anonymous"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 bg-black/50 backdrop-blur-sm">
          <div className="space-y-4">
            {/* Adjustment Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Scale Control */}
              <div className="flex items-center gap-3">
                <label className="text-white text-sm w-20">Kích thước:</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="text-white text-sm w-12">
                  {Math.round(scale * 100)}%
                </span>
              </div>

              {/* Brightness Control */}
              <div className="flex items-center gap-3">
                <label className="text-white text-sm w-20">Độ sáng:</label>
                <input
                  type="range"
                  min="50"
                  max="150"
                  step="5"
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-white text-sm w-12">
                  {brightness}%
                </span>
              </div>

              {/* Contrast Control */}
              <div className="flex items-center gap-3">
                <label className="text-white text-sm w-20">Tương phản:</label>
                <input
                  type="range"
                  min="50"
                  max="150"
                  step="5"
                  value={contrast}
                  onChange={(e) => setContrast(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-white text-sm w-12">
                  {contrast}%
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Hủy
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Lưu ảnh
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Hidden canvas for image processing */}
        <canvas
          ref={canvasRef}
          className="hidden"
        />
      </div>
    </div>
  )
}
