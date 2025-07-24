/**
 * Full-size Image Viewer Modal
 * Allows users to view fabric images in full size with zoom and pan
 */

import React, { useState, useEffect } from 'react'
import { X, ZoomIn, ZoomOut, RotateCw, Download, Edit } from 'lucide-react'

interface ImageViewerModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  fabricCode: string
  fabricName?: string
  onEdit?: () => void
  className?: string
}

export function ImageViewerModal({
  isOpen,
  onClose,
  imageUrl,
  fabricCode,
  fabricName,
  onEdit,
  className = ''
}: ImageViewerModalProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [scale, setScale] = useState(1)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      setHasError(false)
      setRotation(0)
    }
  }, [isOpen, imageUrl])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleImageLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleImageError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `${fabricCode}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className={`fixed inset-0 z-50 ${className}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full h-full flex flex-col">
        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <h3 className="text-white font-semibold text-lg">
              {fabricCode}
            </h3>
            {fabricName && (
              <span className="text-white/70 text-sm">
                {fabricName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Action Buttons */}
            <button
              onClick={handleRotate}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              title="Xoay ảnh"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            <button
              onClick={handleDownload}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              title="Tải xuống"
            >
              <Download className="w-5 h-5" />
            </button>

            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 bg-blue-500/80 hover:bg-blue-500 rounded-lg text-white transition-colors"
                title="Chỉnh sửa ảnh"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div className="flex-1 relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-white/70">Đang tải ảnh...</p>
              </div>
            </div>
          )}

          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="p-4 bg-red-500/20 rounded-lg mb-4 mx-auto w-fit">
                  <X className="w-12 h-12 text-red-400" />
                </div>
                <p className="text-white/70">Không thể tải ảnh</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}

          {!hasError && (
            <div className="w-full h-full flex items-center justify-center relative">
              {/* Zoom Controls */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button
                  onClick={() => setScale(prev => Math.min(prev + 0.2, 3))}
                  className="p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"
                  title="Phóng to"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setScale(prev => Math.max(prev - 0.2, 0.2))}
                  className="p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"
                  title="Thu nhỏ"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setScale(1)}
                  className="p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors text-xs"
                  title="Đặt lại"
                >
                  1:1
                </button>
              </div>

              {/* Image */}
              <img
                src={imageUrl}
                alt={`${fabricCode} - ${fabricName || 'Fabric image'}`}
                className="max-w-full max-h-full object-contain select-none cursor-move"
                style={{
                  transform: `rotate(${rotation}deg) scale(${scale})`,
                  transition: 'transform 0.3s ease'
                }}
                onLoad={handleImageLoad}
                onError={handleImageError}
                draggable={false}
              />
            </div>
          )}
        </div>

        {/* Footer with Instructions */}
        <div className="relative z-10 p-4 bg-black/50 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-6 text-white/70 text-sm">
            <span>🔍 Dùng nút zoom để phóng to/thu nhỏ</span>
            <span>🔄 Xoay ảnh</span>
            <span>⌨️ ESC để đóng</span>
          </div>
        </div>
      </div>
    </div>
  )
}
