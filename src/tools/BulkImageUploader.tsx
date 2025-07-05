/**
 * Bulk Image Uploader Tool
 * Ninh ơi, tool này để upload hàng loạt ảnh từ máy tính lên Cloudinary
 */

import React, { useState, useRef } from 'react'
import { Upload, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/common/design-system/components'
import { cloudinaryService } from '@/services/cloudinaryService'

interface UploadResult {
  fileName: string
  fabricCode: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  url?: string
  error?: string
}

export function BulkImageUploader() {
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [currentUploading, setCurrentUploading] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Extract fabric code from filename
  const extractFabricCode = (fileName: string): string => {
    // Remove file extension
    const nameWithoutExt = fileName.replace(/\.(jpg|jpeg|png|webp)$/i, '')
    
    // Common patterns to extract fabric code
    // Example: "3 PASS BO - WHITE - COL 15.jpg" -> "3 PASS BO - WHITE - COL 15"
    return nameWithoutExt
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    if (files.length === 0) return

    console.log(`📁 Selected ${files.length} files for upload`)

    // Initialize upload results
    const results: UploadResult[] = files.map(file => ({
      fileName: file.name,
      fabricCode: extractFabricCode(file.name),
      status: 'pending'
    }))

    setUploadResults(results)
  }

  const uploadSingleFile = async (file: File, fabricCode: string): Promise<void> => {
    try {
      setCurrentUploading(fabricCode)
      
      // Update status to uploading
      setUploadResults(prev => prev.map(result => 
        result.fabricCode === fabricCode 
          ? { ...result, status: 'uploading' }
          : result
      ))

      console.log(`🚀 Uploading ${file.name} as ${fabricCode}`)

      const uploadResult = await cloudinaryService.uploadImage(file, {
        fabricCode,
        tags: ['bulk_upload', 'local_images']
      })

      // Update status to success
      setUploadResults(prev => prev.map(result =>
        result.fabricCode === fabricCode
          ? { ...result, status: 'success', url: uploadResult.secure_url }
          : result
      ))

      console.log(`✅ Successfully uploaded ${fabricCode}`)

    } catch (error) {
      console.error(`❌ Failed to upload ${fabricCode}:`, error)
      
      // Update status to error
      setUploadResults(prev => prev.map(result => 
        result.fabricCode === fabricCode 
          ? { ...result, status: 'error', error: (error as Error).message }
          : result
      ))
    } finally {
      setCurrentUploading(null)
    }
  }

  const startBulkUpload = async () => {
    if (!fileInputRef.current?.files) return

    setIsUploading(true)
    const files = Array.from(fileInputRef.current.files)

    console.log(`🚀 Starting bulk upload of ${files.length} images`)

    // Upload files sequentially to avoid rate limiting
    for (const file of files) {
      const fabricCode = extractFabricCode(file.name)
      await uploadSingleFile(file, fabricCode)
      
      // Small delay between uploads
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setIsUploading(false)
    console.log(`✅ Bulk upload completed`)
  }

  const getStatusIcon = (status: UploadResult['status']) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-gray-400" />
      case 'uploading':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusColor = (status: UploadResult['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-50 border-gray-200'
      case 'uploading':
        return 'bg-blue-50 border-blue-200'
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
    }
  }

  const successCount = uploadResults.filter(r => r.status === 'success').length
  const errorCount = uploadResults.filter(r => r.status === 'error').length
  const pendingCount = uploadResults.filter(r => r.status === 'pending').length

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Bulk Image Uploader
        </h1>
        <p className="text-gray-600">
          Upload nhiều ảnh vải từ máy tính lên Cloudinary
        </p>
      </div>

      {/* File Selection */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
        onDrop={(e) => {
          e.preventDefault()
          const files = Array.from(e.dataTransfer.files).filter(file =>
            file.type.startsWith('image/')
          )
          if (files.length > 0) {
            const event = { target: { files } } as any
            handleFileSelect(event)
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={(e) => e.preventDefault()}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="mb-4"
        >
          Chọn nhiều ảnh
        </Button>

        <p className="text-sm text-gray-500 mb-2">
          Chọn tất cả ảnh vải cần upload hoặc kéo thả vào đây
        </p>
        <p className="text-xs text-gray-400">
          Tên file sẽ được dùng làm fabric code (bỏ đuôi .jpg/.png)
        </p>
      </div>

      {/* Upload Results */}
      {uploadResults.length > 0 && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600">
                Tổng: {uploadResults.length} files
              </span>
              {successCount > 0 && (
                <span className="text-green-600">
                  ✅ Thành công: {successCount}
                </span>
              )}
              {errorCount > 0 && (
                <span className="text-red-600">
                  ❌ Lỗi: {errorCount}
                </span>
              )}
              {pendingCount > 0 && (
                <span className="text-gray-600">
                  ⏳ Chờ: {pendingCount}
                </span>
              )}
            </div>

            <Button
              onClick={startBulkUpload}
              disabled={isUploading || uploadResults.length === 0}
              isLoading={isUploading}
            >
              {isUploading ? 'Đang upload...' : 'Bắt đầu upload'}
            </Button>
          </div>

          {/* File List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {uploadResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <div className="font-medium text-sm">
                        {result.fabricCode}
                      </div>
                      <div className="text-xs text-gray-500">
                        {result.fileName}
                      </div>
                    </div>
                  </div>

                  {result.status === 'uploading' && currentUploading === result.fabricCode && (
                    <div className="text-xs text-blue-600">
                      Đang upload...
                    </div>
                  )}

                  {result.status === 'error' && result.error && (
                    <div className="text-xs text-red-600 max-w-xs truncate">
                      {result.error}
                    </div>
                  )}

                  {result.status === 'success' && (
                    <div className="text-xs text-green-600">
                      Hoàn thành
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">💡 Hướng dẫn:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Tên file sẽ được dùng làm fabric code (bỏ đuôi .jpg/.png)</li>
          <li>• Ví dụ: "3 PASS BO - WHITE - COL 15.jpg" → fabric code: "3 PASS BO - WHITE - COL 15"</li>
          <li>• Upload từng file một để tránh lỗi rate limiting</li>
          <li>• Ảnh sẽ được lưu trong folder "fabrics" trên Cloudinary</li>
        </ul>
      </div>
    </div>
  )
}
