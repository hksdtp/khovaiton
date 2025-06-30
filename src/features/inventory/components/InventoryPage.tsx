import { Package, Filter, MoreHorizontal, TrendingUp, AlertTriangle } from 'lucide-react'
import { Button } from '@/common/design-system/components'
import { MainLayout } from '@/common/layouts'
import { useFabrics, useUploadFabricImage, useFabricStats } from '../hooks/useFabrics'
import { useInventoryStore, useInventorySelectors } from '../store/inventoryStore'
import { FabricGrid } from './FabricGrid'
import { SearchBar } from './SearchBar'
import { FilterPanel } from './FilterPanel'
import { Pagination } from './Pagination'
import { FabricDetailModal } from './FabricDetailModal'
import { ImageUploadModal } from './ImageUploadModal'

export function InventoryPage() {
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
  const uploadImageMutation = useUploadFabricImage()

  const handleUploadImage = (file: File) => {
    if (uploadingForId) {
      uploadImageMutation.mutate(
        { fabricId: uploadingForId, file },
        {
          onSuccess: () => {
            setUploadModal(false)
          },
        }
      )
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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-30 max-w-7xl mx-auto px-6 py-8">
        <FabricGrid
          fabrics={fabricsData?.data || []}
          onSelectFabric={setSelectedFabric}
          onUploadImage={(fabricId) => setUploadModal(true, fabricId)}
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
        />
      )}

      {isUploadModalOpen && uploadingForId && (
        <ImageUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setUploadModal(false)}
          onUpload={handleUploadImage}
          isUploading={uploadImageMutation.isPending}
        />
      )}
    </MainLayout>
  )
}
