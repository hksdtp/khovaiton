/**
 * Cloudinary Upload Component
 * Ninh ơi, component này cho phép upload ảnh fabric lên Cloudinary
 */

import React, { useState, useRef, useCallback } from 'react'
import { cloudinaryService, CloudinaryUploadResult } from '../services/cloudinaryService'

interface CloudinaryUploadProps {
  fabricCode: string
  onUploadSuccess?: (result: CloudinaryUploadResult) => void
  onUploadError?: (error: Error) => void
  className?: string
  disabled?: boolean
}

export const CloudinaryUpload: React.FC<CloudinaryUploadProps> = ({
  fabricCode,
  onUploadSuccess,
  onUploadError,
  className = '',
  disabled = false
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check if Cloudinary is configured
  const isConfigured = cloudinaryService.isConfigured()

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file || !isConfigured) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      const error = new Error('Chỉ chấp nhận file ảnh (JPG, PNG, WebP)')
      onUploadError?.(error)
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      const error = new Error('File quá lớn. Tối đa 5MB.')
      onUploadError?.(error)
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const result = await cloudinaryService.uploadImage(file, {
        fabricCode,
        tags: ['manual_upload']
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Success
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
        onUploadSuccess?.(result)
      }, 500)

    } catch (error) {
      setIsUploading(false)
      setUploadProgress(0)
      onUploadError?.(error as Error)
    }
  }, [fabricCode, isConfigured, onUploadSuccess, onUploadError])

  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleFileSelect])

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)

    const file = event.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
  }, [])

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading && isConfigured) {
      fileInputRef.current?.click()
    }
  }, [disabled, isUploading, isConfigured])

  if (!isConfigured) {
    return (
      <div className={`p-4 border-2 border-red-300 rounded-lg bg-red-50 ${className}`}>
        <div className="text-center text-red-600">
          <div className="text-sm font-medium">⚠️ Cloudinary chưa được cấu hình</div>
          <div className="text-xs mt-1">Vui lòng kiểm tra environment variables</div>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />
      
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative p-6 border-2 border-dashed rounded-lg transition-all cursor-pointer
          ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          ${isUploading ? 'bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'}
        `}
      >
        {isUploading ? (
          <div className="text-center">
            <div className="text-blue-600 font-medium mb-2">
              📤 Đang upload ảnh cho {fabricCode}...
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="text-sm text-gray-600">{uploadProgress}%</div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-4xl mb-2">📸</div>
            <div className="text-gray-700 font-medium mb-1">
              Upload ảnh cho {fabricCode}
            </div>
            <div className="text-sm text-gray-500 mb-2">
              Kéo thả ảnh vào đây hoặc click để chọn file
            </div>
            <div className="text-xs text-gray-400">
              Hỗ trợ: JPG, PNG, WebP • Tối đa 5MB
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Mobile Camera Upload Component
interface MobileCameraUploadProps {
  fabricCode: string
  onUploadSuccess?: (result: CloudinaryUploadResult) => void
  onUploadError?: (error: Error) => void
  className?: string
}

export const MobileCameraUpload: React.FC<MobileCameraUploadProps> = ({
  fabricCode,
  onUploadSuccess,
  onUploadError,
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCameraCapture = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const result = await cloudinaryService.uploadImage(file, {
        fabricCode,
        tags: ['mobile_camera']
      })

      setIsUploading(false)
      onUploadSuccess?.(result)

    } catch (error) {
      setIsUploading(false)
      onUploadError?.(error as Error)
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [fabricCode, onUploadSuccess, onUploadError])

  const handleClick = useCallback(() => {
    if (!isUploading) {
      fileInputRef.current?.click()
    }
  }, [isUploading])

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
        disabled={isUploading}
      />
      
      <button
        onClick={handleClick}
        disabled={isUploading}
        className={`
          w-full p-4 rounded-lg font-medium transition-all
          ${isUploading 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
          }
        `}
      >
        {isUploading ? (
          <span>📤 Đang upload...</span>
        ) : (
          <span>📷 Chụp ảnh {fabricCode}</span>
        )}
      </button>
    </div>
  )
}

export default CloudinaryUpload
