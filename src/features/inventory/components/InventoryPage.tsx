import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Package, MoreHorizontal, TrendingUp, AlertTriangle, Filter, RefreshCw } from 'lucide-react'
import { Button } from '@/common/design-system/components'
import { MainLayout } from '@/common/layouts'
import { useFabrics, useFabricStats, useRefreshFabricData } from '../hooks/useFabrics'
import { cloudinaryService } from '@/services/cloudinaryService'

import { imageUpdateService } from '@/services/imageUpdateService'
import { realtimeUpdateService } from '@/services/realtimeUpdateService'
import { fabricUpdateService } from '../services/fabricUpdateService'
import { getContextualFilters } from '../utils/marketingFilters'
import { useInventoryStore, useInventorySelectors } from '../store/inventoryStore'
import { FabricGrid } from './FabricGrid'
import { SearchBar } from './SearchBar'
{/* Tạm comment các import không sử dụng */}
import { FilterPanel } from './FilterPanel'
{/* import { SortPanel } from './SortPanel' */}
{/* import { ImageStatusFilter } from './ImageStatusFilter' */}
import { Pagination } from './Pagination'
import { FabricDetailModal } from './FabricDetailModal'
import { ImageUploadModal } from './ImageUploadModal'
{/* import { CloudinarySyncPanel } from './CloudinarySyncPanel' */}

import { ImageViewerModal } from '@/components/ImageViewerModal'
import { ImageEditor } from '@/components/ImageEditor'
import { ImageStatsWithFilter } from '@/components/ImageStatsWithFilter'
import { useQueryClient } from '@tanstack/react-query'
// import { FilterDebug } from '@/debug/FilterDebug'
import { HiddenProductsAnalyzer } from '@/tools/HiddenProductsAnalyzer'


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
  // Tạm comment các state không sử dụng
  // const [showSyncPanel, setShowSyncPanel] = useState(false)
  // const [isSortOpen, setIsSortOpen] = useState(false)

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

  const [showHiddenAnalyzer, setShowHiddenAnalyzer] = useState(false)

  // Initialize services with query client
  imageUpdateService.setQueryClient(queryClient)
  realtimeUpdateService.setQueryClient(queryClient)

  const {
    filters,
    // sortOptions, // Tạm comment vì không dùng
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
    // setSortOptions, // Tạm comment vì không dùng
    setCurrentPage,
    setItemsPerPage,
    resetFilters,
  } = useInventoryStore()

  const { getPaginationParams } = useInventorySelectors()

  // Apply contextual filters based on current page (marketing vs sales)
  const contextualFilters = getContextualFilters(location.pathname, filters)

  const { data: fabricsData, isLoading, error } = useFabrics(
    contextualFilters,
    getPaginationParams()
  )

  const { data: statsData } = useFabricStats()
  const refreshFabricData = useRefreshFabricData()

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
      fabricName: fabricName || ''
    })
  }

  // Handle price update
  const handlePriceUpdate = async (fabricId: number, price: number | null, note?: string) => {
    try {
      // Validate fabric exists in current data - check all fabric cache entries
      const allCacheData = queryClient.getQueriesData({ queryKey: ['fabrics'] })
      console.log(`🔍 All cache entries:`, allCacheData)

      // Find fabric in any cache entry
      let fabricExists = false
      let allFabricIds: number[] = []

      for (const [queryKey, data] of allCacheData) {
        console.log(`🔍 Checking cache entry:`, queryKey, data)
        if (data && typeof data === 'object' && 'data' in data && data.data && Array.isArray(data.data)) {
          const fabricIds = data.data.map((f: any) => f.id)
          allFabricIds.push(...fabricIds)
          if (data.data.some((fabric: any) => fabric.id === fabricId)) {
            fabricExists = true
            break
          }
        } else if (Array.isArray(data)) {
          // Handle direct array format
          const fabricIds = data.map((f: any) => f.id)
          allFabricIds.push(...fabricIds)
          if (data.some((fabric: any) => fabric.id === fabricId)) {
            fabricExists = true
            break
          }
        }
      }

      console.log(`🔍 All available fabric IDs:`, [...new Set(allFabricIds)])

      if (!fabricExists) {
        console.error(`❌ Fabric ID ${fabricId} not found in any cache`)
        console.error(`❌ Available IDs: ${[...new Set(allFabricIds)].join(', ') || 'none'}`)
        console.error(`❌ Total cache entries: ${allCacheData.length}`)
        alert(`❌ Lỗi: Sản phẩm ID ${fabricId} không tồn tại trong cache.\nAvailable IDs: ${[...new Set(allFabricIds)].slice(0, 10).join(', ')}\nVui lòng refresh trang.`)
        return
      }

      console.log(`💰 Updating price for fabric ${fabricId}: ${price}`)
      const result = await fabricUpdateService.updatePrice(fabricId, price, note)
      if (result.success) {
        console.log('✅ Price updated successfully')

        // Show success message
        if (result.error) {
          // Mock mode - show warning
          alert(`⚠️ Giá đã được cập nhật tạm thời.\n\n${result.error}`)
        } else {
          // Real database update
          alert('✅ Giá đã được cập nhật thành công!')
        }

        // Only invalidate stats, not the main fabric list (to preserve manual cache update)
        queryClient.invalidateQueries({ queryKey: ['fabric-stats'] })

        // Update specific fabric in cache - Force update even if no data returned
        // Vì Supabase update có thể thành công nhưng không return data
        console.log('🔧 Attempting to update cache...')

        // Update all fabric list queries (match pattern ['fabrics', 'list', ...])
        const cacheUpdateResult = queryClient.setQueriesData(
          { queryKey: ['fabrics', 'list'] }, // Match fabric list queries
          (oldData: any) => {
            console.log('📦 Old cache data:', oldData)

            if (!oldData?.data) {
              console.log('❌ No data in cache to update')
              return oldData
            }

            const updatedData = oldData.data.map((fabric: any) => {
              if (fabric.id === fabricId) {
                const updatedFabric = {
                  ...fabric,
                  price: price ? Number(price) : null, // Ensure price is number or null
                  priceNote: note, // Sử dụng note từ input
                  priceUpdatedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
                console.log(`✅ Updated fabric ${fabricId}:`, updatedFabric)
                console.log(`💰 Price type: ${typeof updatedFabric.price}, value: ${updatedFabric.price}`)
                return updatedFabric
              }
              return fabric
            })

            const newData = { ...oldData, data: updatedData }
            console.log('📦 New cache data:', newData)
            return newData
          }
        )

        console.log('🔧 Cache update result:', cacheUpdateResult)
        console.log(`📝 Force updated fabric ${fabricId} in cache with price: ${price}`)

        // Debug: Check if fabric data is updated in cache
        const currentCacheData = queryClient.getQueriesData({ queryKey: ['fabrics'] })
        console.log('🔍 Current cache data after update:', currentCacheData)

        // Find the updated fabric in cache
        const updatedFabric = currentCacheData
          .flatMap(([_, data]: any) => data?.data || [])
          .find((f: any) => f.id === fabricId)
        console.log(`🎯 Updated fabric ${fabricId} in cache:`, updatedFabric)

        // Cũng update cache cho fabric-stats
        queryClient.invalidateQueries({ queryKey: ['fabric-stats'] })

        // Skip realtime update to avoid cache conflicts
        console.log('✅ Skipping realtime update to preserve cache')

        // Skip force invalidation to preserve manual cache update
        console.log('✅ Skipping force invalidation to preserve cache update')

        console.log('🔄 Price update completed without page reload')
      } else {
        throw new Error(result.error || 'Failed to update price')
      }
    } catch (error) {
      console.error('❌ Failed to update price:', error)
      alert(`❌ ${(error as Error).message}`)
    }
  }

  // Handle visibility toggle
  const handleVisibilityToggle = async (fabricId: number, isHidden: boolean) => {
    try {
      const result = await fabricUpdateService.updateVisibility(fabricId, isHidden)
      if (result.success) {
        console.log(`✅ Visibility updated: ${isHidden ? 'hidden' : 'visible'}`)

        // Show success message
        if (result.error) {
          // Mock mode - show warning
          alert(`⚠️ Trạng thái hiển thị đã được cập nhật tạm thời.\n\n${result.error}`)
        } else {
          // Real database update
          const action = isHidden ? 'ẩn' : 'hiện'
          alert(`✅ Sản phẩm đã được ${action} thành công!`)
        }

        // Invalidate React Query cache for smooth updates (no page reload)
        queryClient.invalidateQueries({ queryKey: ['fabrics'] })
        queryClient.invalidateQueries({ queryKey: ['fabric-stats'] })

        // Update specific fabric in cache if we have the updated data
        if (result.fabric) {
          queryClient.setQueriesData(
            { queryKey: ['fabrics'] },
            (oldData: any) => {
              if (!oldData?.data) return oldData

              const updatedData = oldData.data.map((fabric: any) => {
                if (fabric.id === fabricId) {
                  return {
                    ...fabric,
                    isHidden: result.fabric!.isHidden,
                    updatedAt: result.fabric!.updatedAt
                  }
                }
                return fabric
              })

              return { ...oldData, data: updatedData }
            }
          )
          console.log(`📝 Updated fabric ${fabricId} in cache with new visibility: ${isHidden ? 'hidden' : 'visible'}`)
        }

        // Trigger real-time update event
        await realtimeUpdateService.onVisibilityToggled(fabricId, isHidden)

        console.log('🔄 Visibility update completed without page reload')
      } else {
        throw new Error(result.error || 'Failed to update visibility')
      }
    } catch (error) {
      console.error('❌ Failed to update visibility:', error)
      alert(`❌ ${(error as Error).message}`)
    }
  }

  // Handle product deletion
  const handleProductDelete = async (fabricId: number, permanent: boolean) => {
    try {
      const result = permanent
        ? await fabricUpdateService.deleteProduct(fabricId)
        : await fabricUpdateService.updateVisibility(fabricId, true) // Soft delete by hiding

      if (result.success) {
        console.log(`✅ Product ${permanent ? 'deleted permanently' : 'hidden'}`)

        // Show success message
        if (result.error) {
          // Mock mode - show warning
          const action = permanent ? 'xóa' : 'ẩn'
          alert(`⚠️ Sản phẩm đã được ${action} tạm thời.\n\n${result.error}`)
        } else {
          // Real database update
          const action = permanent ? 'xóa vĩnh viễn' : 'ẩn'
          alert(`✅ Sản phẩm đã được ${action} thành công!`)
        }

        // Close modal if product was deleted
        if (selectedFabric && selectedFabric.id === fabricId) {
          setSelectedFabric(null)
        }

        // Refresh data
        await queryClient.invalidateQueries({ queryKey: ['fabrics'] })
        await queryClient.invalidateQueries({ queryKey: ['fabric-stats'] })
      } else {
        throw new Error(result.error || 'Failed to delete product')
      }
    } catch (error) {
      console.error('❌ Exception deleting product:', error)
      alert(`❌ ${(error as Error).message}`)
    }
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
                {/* Filter button - Only show in SALE mode */}
                {!isMarketingVersion && (
                  <Button
                    variant={isFilterOpen ? "primary" : "secondary"}
                    onClick={() => setFilterOpen(!isFilterOpen)}
                    size="sm"
                  >
                    <Filter className="w-4 h-4" />
                    Lọc
                  </Button>
                )}

                {/* Refresh Data Button */}
                <Button
                  variant="secondary"
                  onClick={refreshFabricData}
                  size="sm"
                  title="Làm mới dữ liệu sau khi thay đổi bulk"
                >
                  <RefreshCw className="w-4 h-4" />
                  Làm mới
                </Button>

                {/* Tạm ẩn các nút Sort và Sync */}
                {/* <Button
                  variant={isSortOpen ? "primary" : "secondary"}
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  size="sm"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  Sắp xếp
                </Button>

                <Button
                  variant={showSyncPanel ? "primary" : "secondary"}
                  onClick={() => setShowSyncPanel(!showSyncPanel)}
                  size="sm"
                >
                  <Package className="w-4 h-4" />
                  Đồng bộ
                </Button> */}

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

                {/* Button More - HIDDEN */}
                {false && (
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Search Bar */}
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
            />

            {/* Advanced Filter Panel - Only show in SALE mode */}
            {!isMarketingVersion && (
              <FilterPanel
                isOpen={isFilterOpen}
                onClose={() => setFilterOpen(false)}
                filters={filters}
                onFiltersChange={setFilters}
                onResetFilters={resetFilters}
                resultCount={fabricsData?.total}
              />
            )}

            {/* Sort Panel */}
            {/* {isSortOpen && (
              <div className="mb-6">
                <SortPanel
                  sortOptions={sortOptions}
                  onSortChange={setSortOptions}
                  className="max-w-md"
                />
              </div>
            )} */}

            {/* Cloudinary Sync Panel */}
            {/* {showSyncPanel && (
              <div className="mt-6">
                <CloudinarySyncPanel />
              </div>
            )} */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-30 max-w-7xl mx-auto px-6 py-8">
        {/* Image Stats + Filter - Kết hợp hiển thị số liệu và filter */}
        {!isMarketingVersion && (
          <ImageStatsWithFilter
            className="mb-6"
            overrideFilters={contextualFilters}
          />
        )}



        <FabricGrid
          fabrics={fabricsData?.data || []}
          onSelectFabric={setSelectedFabric}
          onUploadImage={(fabricId) => setUploadModal(true, fabricId)}
          onViewImage={handleViewImage}
          onPriceUpdate={handlePriceUpdate}
          onVisibilityToggle={isMarketingVersion ? undefined : handleVisibilityToggle}
          onDelete={isMarketingVersion ? undefined : handleProductDelete}
          isMarketingMode={isMarketingVersion}
          isSaleMode={!isMarketingVersion}
          isLoading={isLoading}
        />

        {/* Pagination */}
        {fabricsData && (
          <div className="mt-8 mb-24 relative z-50">
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
          onPriceUpdate={isMarketingVersion ? undefined : handlePriceUpdate}
          onVisibilityToggle={isMarketingVersion ? undefined : handleVisibilityToggle}
          onDelete={isMarketingVersion ? undefined : handleProductDelete}
          isSaleMode={!isMarketingVersion}
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
        fabricName={imageViewerState.fabricName || ''}
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

      {/* Debug Component - Hidden */}
      {/* {process.env.NODE_ENV === 'development' && !isMarketingVersion && (
        <FilterDebug />
      )} */}

      {/* Hidden Products Analyzer - Development only - HIDDEN */}
      {false && process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => setShowHiddenAnalyzer(true)}
          className="fixed bottom-4 left-4 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors shadow-lg z-30 flex items-center gap-2"
          title="Phân tích sản phẩm đã ẩn"
        >
          📊 Phân tích sản phẩm ẩn
        </button>
      )}

      {/* Hidden Products Analyzer Modal */}
      {showHiddenAnalyzer && (
        <HiddenProductsAnalyzer onClose={() => setShowHiddenAnalyzer(false)} />
      )}

    </MainLayout>
  )
}
