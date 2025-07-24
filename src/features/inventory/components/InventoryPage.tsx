import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Package, Filter, MoreHorizontal, TrendingUp, AlertTriangle, Eye, Edit } from 'lucide-react'
import { Button } from '@/common/design-system/components'
import { MainLayout } from '@/common/layouts'
import { useFabrics, useFabricStats } from '../hooks/useFabrics'
import { cloudinaryService } from '@/services/cloudinaryService'
import { syncService } from '@/services/syncService'
import { imageUpdateService } from '@/services/imageUpdateService'
import { useInventoryStore, useInventorySelectors } from '../store/inventoryStore'
import { FabricGrid } from './FabricGrid'
import { SearchBar } from './SearchBar'
import { FilterPanel } from './FilterPanel'
import { ImageStatusFilter } from './ImageStatusFilter'
import { Pagination } from './Pagination'
import { FabricDetailModal } from './FabricDetailModal'
import { ImageUploadModal } from './ImageUploadModal'
import { CloudinarySyncPanel } from './CloudinarySyncPanel'
import { AutoSyncStatusComponent } from '@/components/AutoSyncStatus'
import { ImageViewerModal } from '@/components/ImageViewerModal'
import { ImageEditor } from '@/components/ImageEditor'
import { useQueryClient } from '@tanstack/react-query'
import { refreshFabricImage } from '@/shared/mocks/fabricData'

export function InventoryPage() {
  const location = useLocation()
  const isMarketingVersion = location.pathname === '/marketing'
  const queryClient = useQueryClient()

  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
    fabricCode?: string
  }>({ type: null, message: '' })
  const [showSyncPanel, setShowSyncPanel] = useState(false)

  // Image viewer and editor states
  const [imageViewerState, setImageViewerState] = useState<{
    isOpen: boolean
    imageUrl: string
    fabricCode: string
    fabricName?: string
  }>({
    isOpen: false,
    imageUrl: '',
    fabricCode: '',
    fabricName: ''
  })

  const [imageEditorState, setImageEditorState] = useState<{
    isOpen: boolean
    imageUrl: string
    fabricCode: string
  }>({
    isOpen: false,
    imageUrl: '',
    fabricCode: ''
  })

  // Initialize image update service with query client
  imageUpdateService.setQueryClient(queryClient)

  const {
    filters,
    searchTerm,
    selectedFabric,
    isFilterOpen,
    isUploadModalOpen,
    uploadingForId,
    itemsPerPage,
    setSearchTerm,
    setSelectedFabric,
    setFilterOpen,
    setUploadModal,
    setFilters,
    setCurrentPage,
    setItemsPerPage,
    resetFilters,
  } = useInventoryStore()

  const { getPaginationParams } = useInventorySelectors()

  const { data: fabricsData, isLoading, error } = useFabrics(
    filters,
    getPaginationParams()
  )

  const { data: statsData } = useFabricStats()

  // Listen for auto-sync updates to refresh data
  useEffect(() => {
    const handleAutoSyncUpdate = (event: CustomEvent) => {
      console.log('🔄 Auto-sync found new images, refreshing inventory data...')

      // Invalidate all fabric-related queries
      queryClient.invalidateQueries({ queryKey: ['fabrics'] })
      queryClient.invalidateQueries({ queryKey: ['fabric-stats'] })

      console.log(`✅ Refreshed data after finding ${event.detail.newImageCount} new images`)
    }

    window.addEventListener('autoSyncUpdate', handleAutoSyncUpdate as EventListener)

    return () => {
      window.removeEventListener('autoSyncUpdate', handleAutoSyncUpdate as EventListener)
    }
  }, [queryClient])

  const handleUploadImage = async (file: File) => {
    if (!uploadingForId) return

    setIsUploading(true)
    setUploadStatus({ type: null, message: '' })

    try {
      console.log(`🚀 Starting upload for fabric ID: ${uploadingForId}`)

      // Get fabric code from the fabric data
      const fabric = fabricsData?.data.find(f => f.id === uploadingForId)
      if (!fabric) {
        throw new Error('Fabric not found')
      }

      const result = await cloudinaryService.uploadImage(file, {
        fabricCode: fabric.code,
        tags: ['manual_upload', 'inventory']
      })

      console.log(`✅ Upload successful for ${fabric.code}:`, result)

      // Use new image update service for real-time updates
      const updateResult = await imageUpdateService.handleImageUpload(fabric.code, result)

      if (updateResult.success) {
        // Show success message with option to edit
        setUploadStatus({
          type: 'success',
          message: `Ảnh đã được upload thành công cho ${fabric.code}!`,
          fabricCode: fabric.code
        })

        // Open image editor for immediate editing
        setImageEditorState({
          isOpen: true,
          imageUrl: result.secure_url,
          fabricCode: fabric.code
        })

        console.log(`🎉 Upload completed and cache refreshed for ${fabric.code}`)
      } else {
        throw new Error(updateResult.error || 'Failed to update image cache')
      }

      // Close modal after short delay to show success message
      setTimeout(() => {
        setUploadModal(false)
        setUploadStatus({ type: null, message: '' })
      }, 2000)

    } catch (error) {
      console.error(`❌ Upload failed:`, error)
      setUploadStatus({
        type: 'error',
        message: `Upload thất bại: ${(error as Error).message}`
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Handle opening image viewer
  const handleViewImage = (imageUrl: string, fabricCode: string, fabricName?: string) => {
    setImageViewerState({
      isOpen: true,
      imageUrl,
      fabricCode,
      fabricName
    })
  }

  // Handle opening image editor
  const handleEditImage = (imageUrl: string, fabricCode: string) => {
    setImageViewerState({ isOpen: false, imageUrl: '', fabricCode: '', fabricName: '' })
    setImageEditorState({
      isOpen: true,
      imageUrl,
      fabricCode
    })
  }

  // Handle saving edited image
  const handleSaveEditedImage = async (editedImageBlob: Blob) => {
    try {
      // Convert blob to file
      const file = new File([editedImageBlob], `${imageEditorState.fabricCode}_edited.jpg`, {
        type: 'image/jpeg'
      })

      // Upload the edited image
      const result = await cloudinaryService.uploadImage(file, {
        fabricCode: imageEditorState.fabricCode,
        tags: ['edited_image', 'manual_upload']
      })

      // Update using image update service
      await imageUpdateService.handleImageUpload(imageEditorState.fabricCode, result)

      // Show success message
      setUploadStatus({
        type: 'success',
        message: `Ảnh đã được chỉnh sửa và lưu thành công cho ${imageEditorState.fabricCode}!`,
        fabricCode: imageEditorState.fabricCode
      })

      console.log(`✅ Edited image saved for ${imageEditorState.fabricCode}`)

    } catch (error) {
      console.error('Failed to save edited image:', error)
      setUploadStatus({
        type: 'error',
        message: `Không thể lưu ảnh đã chỉnh sửa: ${(error as Error).message}`
      })
    }
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="p-6 bg-red-100 rounded-lg mb-4 mx-auto w-fit">
              <Package className="w-16 h-16 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Có lỗi xảy ra
            </h2>
            <p className="text-gray-600 mb-4">
              {error.message || 'Không thể tải dữ liệu vải'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Thử lại
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="relative z-40">
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            {/* Title Section */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-lg shadow-sm">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    Vải Tồn Kho
                  </h1>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">
                      {fabricsData?.total || 0} sản phẩm
                    </span>
                    {statsData && (
                      <>
                        <span className="text-green-600 flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {statsData.totalItems} tổng
                        </span>
                        {statsData.lowStockItems > 0 && (
                          <span className="text-orange-600 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            {statsData.lowStockItems} sắp hết
                          </span>
                        )}
                      </>
                    )}
                    <span className="text-gray-500">• Cập nhật realtime</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant={isFilterOpen ? "primary" : "secondary"}
                  onClick={() => setFilterOpen(!isFilterOpen)}
                  size="sm"
                >
                  <Filter className="w-4 h-4" />
                  Lọc
                </Button>

                <Button
                  variant={showSyncPanel ? "primary" : "secondary"}
                  onClick={() => setShowSyncPanel(!showSyncPanel)}
                  size="sm"
                >
                  <Package className="w-4 h-4" />
                  Đồng bộ
                </Button>
                {/* Tạm ẩn 2 nút này theo yêu cầu */}
                {/* <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.open('/tools/bulk-upload', '_blank')}
                >
                  <Upload className="w-4 h-4" />
                  Bulk Upload
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.open('/tools/sync-manager', '_blank')}
                >
                  <RefreshCw className="w-4 h-4" />
                  Sync Manager
                </Button> */}
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
            />

            {/* Advanced Filter Panel */}
            <FilterPanel
              isOpen={isFilterOpen}
              onClose={() => setFilterOpen(false)}
              filters={filters}
              onFiltersChange={setFilters}
              onResetFilters={resetFilters}
              resultCount={fabricsData?.total}
            />

            {/* Cloudinary Sync Panel */}
            {showSyncPanel && (
              <div className="mt-6">
                <CloudinarySyncPanel />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-30 max-w-7xl mx-auto px-6 py-8">
        {/* Image Status Filter - Ẩn trong phiên bản Marketing */}
        {!isMarketingVersion && (
          <ImageStatusFilter className="mb-6" />
        )}

        {/* Auto Sync Status - Chỉ hiển thị trong phiên bản Sale */}
        {!isMarketingVersion && (
          <AutoSyncStatusComponent className="mb-6" />
        )}

        <FabricGrid
          fabrics={fabricsData?.data || []}
          onSelectFabric={setSelectedFabric}
          onUploadImage={(fabricId) => setUploadModal(true, fabricId)}
          onViewImage={handleViewImage}
          isLoading={isLoading}
        />

        {/* Pagination */}
        {fabricsData && (
          <div className="mt-8">
            <Pagination
              currentPage={fabricsData.page}
              totalPages={fabricsData.totalPages}
              totalItems={fabricsData.total}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedFabric && (
        <FabricDetailModal
          fabric={selectedFabric}
          isOpen={!!selectedFabric}
          onClose={() => setSelectedFabric(null)}
          onUploadImage={(fabricId) => setUploadModal(true, fabricId)}
          onViewImage={handleViewImage}
        />
      )}

      {isUploadModalOpen && uploadingForId && (
        <ImageUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => {
            setUploadModal(false)
            setUploadStatus({ type: null, message: '' })
          }}
          onUpload={handleUploadImage}
          isUploading={isUploading}
          uploadStatus={uploadStatus}
        />
      )}

      {/* Image Viewer Modal */}
      <ImageViewerModal
        isOpen={imageViewerState.isOpen}
        onClose={() => setImageViewerState({ isOpen: false, imageUrl: '', fabricCode: '', fabricName: '' })}
        imageUrl={imageViewerState.imageUrl}
        fabricCode={imageViewerState.fabricCode}
        fabricName={imageViewerState.fabricName}
        onEdit={() => handleEditImage(imageViewerState.imageUrl, imageViewerState.fabricCode)}
      />

      {/* Image Editor Modal */}
      <ImageEditor
        isOpen={imageEditorState.isOpen}
        onClose={() => setImageEditorState({ isOpen: false, imageUrl: '', fabricCode: '' })}
        imageUrl={imageEditorState.imageUrl}
        fabricCode={imageEditorState.fabricCode}
        onSave={handleSaveEditedImage}
      />

    </MainLayout>
  )
}
