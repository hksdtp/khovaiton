/**
 * Fabric Image Upload Component
 * Ninh ơi, component này integrate vào fabric cards để upload ảnh
 */

import React, { useState } from 'react'
import { CloudinaryUpload, MobileCameraUpload } from './CloudinaryUpload'
import { CloudinaryUploadResult } from '../services/cloudinaryService'

interface FabricImageUploadProps {
  fabricCode: string
  currentImageUrl?: string
  onImageUpdated?: (newImageUrl: string) => void
  className?: string
}

export const FabricImageUpload: React.FC<FabricImageUploadProps> = ({
  fabricCode,
  currentImageUrl: _currentImageUrl,
  onImageUpdated,
  className = ''
}) => {
  const [showUpload, setShowUpload] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleUploadSuccess = (result: CloudinaryUploadResult) => {
    console.log(`✅ Upload success for ${fabricCode}:`, result)
    setUploadSuccess(true)
    setUploadError(null)
    setShowUpload(false)
    
    // Update parent component
    onImageUpdated?.(result.secure_url)
    
    // Auto-hide success message
    setTimeout(() => {
      setUploadSuccess(false)
    }, 3000)
  }

  const handleUploadError = (error: Error) => {
    console.error(`❌ Upload error for ${fabricCode}:`, error)
    setUploadError(error.message)
    setUploadSuccess(false)
    
    // Auto-hide error message
    setTimeout(() => {
      setUploadError(null)
    }, 5000)
  }

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  return (
    <div className={`relative ${className}`}>
      {/* Upload Button */}
      {!showUpload && (
        <button
          onClick={() => setShowUpload(true)}
          className="absolute top-2 right-2 z-10 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all"
          title={`Upload ảnh cho ${fabricCode}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}

      {/* Upload Interface */}
      {showUpload && (
        <div className="absolute inset-0 z-20 bg-white rounded-lg shadow-xl border-2 border-blue-200">
          <div className="p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-900">
                Upload ảnh cho {fabricCode}
              </h3>
              <button
                onClick={() => setShowUpload(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Upload Components */}
            <div className="space-y-3">
              {isMobile ? (
                <>
                  {/* Mobile: Camera + File Upload */}
                  <MobileCameraUpload
                    fabricCode={fabricCode}
                    onUploadSuccess={handleUploadSuccess}
                    onUploadError={handleUploadError}
                  />
                  <div className="text-center text-sm text-gray-500">hoặc</div>
                  <CloudinaryUpload
                    fabricCode={fabricCode}
                    onUploadSuccess={handleUploadSuccess}
                    onUploadError={handleUploadError}
                    className="min-h-[120px]"
                  />
                </>
              ) : (
                <>
                  {/* Desktop: Drag & Drop */}
                  <CloudinaryUpload
                    fabricCode={fabricCode}
                    onUploadSuccess={handleUploadSuccess}
                    onUploadError={handleUploadError}
                    className="min-h-[150px]"
                  />
                </>
              )}
            </div>

            {/* Status Messages */}
            {uploadSuccess && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-green-800 text-sm font-medium">
                  ✅ Upload thành công!
                </div>
                <div className="text-green-600 text-xs mt-1">
                  Ảnh đã được lưu vào Cloudinary
                </div>
              </div>
            )}

            {uploadError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-800 text-sm font-medium">
                  ❌ Upload thất bại
                </div>
                <div className="text-red-600 text-xs mt-1">
                  {uploadError}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-600">
                <div className="font-medium mb-1">💡 Lưu ý:</div>
                <ul className="space-y-1">
                  <li>• Tên file sẽ tự động là: {fabricCode}.jpg</li>
                  <li>• Hỗ trợ: JPG, PNG, WebP</li>
                  <li>• Tối đa: 5MB</li>
                  <li>• Ảnh sẽ tự động tối ưu cho web</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Bulk Upload Component for multiple fabrics
interface BulkUploadProps {
  fabricCodes: string[]
  onUploadComplete?: (results: { [fabricCode: string]: string }) => void
  className?: string
}

export const BulkFabricUpload: React.FC<BulkUploadProps> = ({
  fabricCodes,
  onUploadComplete,
  className = ''
}) => {
  const [uploadResults, setUploadResults] = useState<{ [fabricCode: string]: string }>({})
  const [currentUploading, setCurrentUploading] = useState<string | null>(null)

  const handleSingleUploadSuccess = (fabricCode: string) => (result: CloudinaryUploadResult) => {
    const newResults = {
      ...uploadResults,
      [fabricCode]: result.secure_url
    }
    setUploadResults(newResults)
    setCurrentUploading(null)
    
    // Check if all uploads complete
    if (Object.keys(newResults).length === fabricCodes.length) {
      onUploadComplete?.(newResults)
    }
  }

  const handleSingleUploadError = (fabricCode: string) => (error: Error) => {
    console.error(`Upload failed for ${fabricCode}:`, error)
    setCurrentUploading(null)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-lg font-medium">
        Upload ảnh cho {fabricCodes.length} fabric codes
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fabricCodes.map(fabricCode => (
          <div key={fabricCode} className="border rounded-lg p-4">
            <div className="font-medium mb-2">{fabricCode}</div>
            
            {uploadResults[fabricCode] ? (
              <div className="text-green-600 text-sm">
                ✅ Đã upload
              </div>
            ) : currentUploading === fabricCode ? (
              <div className="text-blue-600 text-sm">
                📤 Đang upload...
              </div>
            ) : (
              <CloudinaryUpload
                fabricCode={fabricCode}
                onUploadSuccess={handleSingleUploadSuccess(fabricCode)}
                onUploadError={handleSingleUploadError(fabricCode)}
                className="min-h-[100px]"
              />
            )}
          </div>
        ))}
      </div>
      
      <div className="text-sm text-gray-600">
        Đã upload: {Object.keys(uploadResults).length}/{fabricCodes.length}
      </div>
    </div>
  )
}

export default FabricImageUpload
