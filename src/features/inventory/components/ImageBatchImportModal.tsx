/**
 * Image Batch Import Modal
 * Ninh ơi, modal này giúp bạn import hàng loạt ảnh và xem báo cáo mapping
 */

import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, Info, RefreshCw } from 'lucide-react'
import { Modal } from '@/common/design-system/components'
import { Button } from '@/common/design-system/components'
import {
  generateImportInstructions
} from '../utils/imageBatchImport'
import { getImageMappingReport } from '../services/imageService'

interface ImageBatchImportModalProps {
  isOpen: boolean
  onClose: () => void
  fabricCodes: string[]
  onImportComplete?: () => void
}

export function ImageBatchImportModal({
  isOpen,
  onClose,
  fabricCodes,
  onImportComplete
}: ImageBatchImportModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [mappingReport, setMappingReport] = useState<Awaited<ReturnType<typeof getImageMappingReport>> | null>(null)
  const [showInstructions, setShowInstructions] = useState(true)

  // Load mapping report when modal opens
  useEffect(() => {
    if (isOpen && fabricCodes.length > 0) {
      loadMappingReport()
    }
  }, [isOpen, fabricCodes])

  const loadMappingReport = async () => {
    setIsLoading(true)
    try {
      const report = await getImageMappingReport(fabricCodes)
      setMappingReport(report)
    } catch (error) {
      console.error('Failed to load mapping report:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    loadMappingReport()
    onImportComplete?.()
  }

  const renderMappingStats = () => {
    if (!mappingReport) return null

    const { total, withImages, withoutImages } = mappingReport
    const percentage = total > 0 ? Math.round((withImages / total) * 100) : 0

    return (
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">📊 Báo cáo mapping ảnh</h3>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{total}</div>
            <div className="text-sm text-gray-600">Tổng vải</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{withImages}</div>
            <div className="text-sm text-gray-600">Có ảnh</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{withoutImages}</div>
            <div className="text-sm text-gray-600">Chưa có ảnh</div>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="text-center text-sm text-gray-600 mt-1">
          {percentage}% hoàn thành
        </div>
      </div>
    )
  }

  const renderMissingImages = () => {
    if (!mappingReport) return null

    const missingImages = mappingReport.mappings
      .filter(m => !m.isAvailable)
      .slice(0, 10) // Show first 10 missing

    if (missingImages.length === 0) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">
              🎉 Tất cả vải đều đã có ảnh!
            </span>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center mb-3">
          <AlertCircle className="w-5 h-5 text-orange-600 mr-2" />
          <span className="text-orange-800 font-medium">
            Vải chưa có ảnh ({missingImages.length} đầu tiên):
          </span>
        </div>
        
        <div className="max-h-32 overflow-y-auto">
          {missingImages.map((mapping, index) => (
            <div key={index} className="text-sm text-orange-700 py-1">
              • {mapping.fabricCode}
            </div>
          ))}
        </div>
        
        {mappingReport.withoutImages > 10 && (
          <div className="text-sm text-orange-600 mt-2">
            ... và {mappingReport.withoutImages - 10} vải khác
          </div>
        )}
      </div>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🖼️ Import ảnh hàng loạt"
      size="lg"
    >
      <div className="p-6">
        {/* Instructions Toggle */}
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInstructions(!showInstructions)}
            className="mb-4"
          >
            <Info className="w-4 h-4 mr-2" />
            {showInstructions ? 'Ẩn hướng dẫn' : 'Hiện hướng dẫn'}
          </Button>

          {showInstructions && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <pre className="text-sm text-blue-800 whitespace-pre-wrap font-mono">
                {generateImportInstructions()}
              </pre>
            </div>
          )}
        </div>

        {/* Mapping Report */}
        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-gray-600">Đang kiểm tra ảnh...</p>
          </div>
        ) : (
          <>
            {renderMappingStats()}
            {renderMissingImages()}
          </>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <div className="space-x-3">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
            <Button 
              onClick={handleRefresh}
              disabled={isLoading}
            >
              Áp dụng thay đổi
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
