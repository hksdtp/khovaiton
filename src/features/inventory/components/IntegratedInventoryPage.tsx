// src/features/inventory/components/IntegratedInventoryPage.tsx
import { useState, useEffect } from 'react'
import { Search, Grid, List, BarChart3, Image, Package } from 'lucide-react'
import { useFabrics, useFabricStats, useFabricFilterOptions, useIntegrationSummary } from '../hooks/useLocalFabrics'
import { useInventoryStore } from '../store/inventoryStore'

/**
 * Component trang quản lý kho vải với dữ liệu đã tích hợp
 */
export function IntegratedInventoryPage() {
  const {
    filters,
    sortOptions,
    viewMode,
    currentPage,
    itemsPerPage,
    setFilters,
    setViewMode,
    setCurrentPage,
    setItemsPerPage,
  } = useInventoryStore()

  // Load dữ liệu
  const { data: fabricsResult, isLoading, error } = useFabrics(filters, sortOptions, currentPage, itemsPerPage)
  const { data: stats } = useFabricStats()
  const { data: summary } = useIntegrationSummary()
  const filterOptions = useFabricFilterOptions()

  // Local state
  const [searchTerm, setSearchTerm] = useState(filters.search || '')
  const [showStats, setShowStats] = useState(false)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ search: searchTerm })
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, setFilters])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Lỗi tải dữ liệu
            </h2>
            <p className="text-red-600 dark:text-red-300">
              Không thể tải dữ liệu vải. Vui lòng kiểm tra lại file dữ liệu.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Kho Vải Tôn - Dữ liệu Tích hợp
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Quản lý {stats?.totalFabrics || 0} mã vải với {stats?.mappedImages || 0} ảnh
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Thống kê
              </button>
              
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-600 shadow-sm'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 shadow-sm'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Panel */}
      {showStats && stats && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center">
                  <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Tổng vải</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {stats.totalFabrics}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center">
                  <Image className="w-8 h-8 text-green-600 dark:text-green-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Có ảnh</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {stats.fabricsWithImages}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="flex items-center">
                  <BarChart3 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Tỷ lệ có ảnh</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {stats.coveragePercentage}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <div className="flex items-center">
                  <Image className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Tổng ảnh</p>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      {stats.totalImages}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Integration Summary */}
            {summary && (
              <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Thông tin tích hợp dữ liệu
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Vải có ảnh:</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {summary.fabrics_with_images}/{summary.total_fabrics} ({summary.coverage_percentage}%)
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Ảnh đã map:</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {summary.mapped_images}/{summary.total_images}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Ảnh chưa sử dụng:</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {summary.unmapped_images}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã vải, tên, vị trí..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2">
              <select
                value={filters.type || 'all'}
                onChange={(e) => setFilters({ type: e.target.value === 'all' ? undefined : e.target.value as any })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả loại</option>
                {filterOptions.types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select
                value={filters.status || 'all'}
                onChange={(e) => setFilters({ status: e.target.value === 'all' ? undefined : e.target.value as any })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                {filterOptions.statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'available' ? 'Có sẵn' :
                     status === 'low_stock' ? 'Sắp hết' :
                     status === 'out_of_stock' ? 'Hết hàng' :
                     status === 'damaged' ? 'Hỏng' : status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</span>
          </div>
        ) : fabricsResult ? (
          <>
            {/* Results Info */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                Hiển thị {fabricsResult.items.length} trong tổng số {fabricsResult.totalItems} mục
              </p>
              
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value={20}>20 mục/trang</option>
                <option value={50}>50 mục/trang</option>
                <option value={100}>100 mục/trang</option>
              </select>
            </div>

            {/* Fabric Grid/List */}
            {viewMode === 'grid' ? (
              <FabricGrid fabrics={fabricsResult.items} />
            ) : (
              <FabricList fabrics={fabricsResult.items} />
            )}

            {/* Pagination */}
            {fabricsResult.totalPages > 1 && (
              <Pagination
                currentPage={fabricsResult.currentPage}
                totalPages={fabricsResult.totalPages}
                onPageChange={setCurrentPage}
                hasNextPage={fabricsResult.hasNextPage}
                hasPrevPage={fabricsResult.hasPrevPage}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Không tìm thấy dữ liệu vải</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Placeholder components - sẽ implement chi tiết sau
function FabricGrid({ fabrics }: { fabrics: any[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {fabrics.map((fabric) => (
        <div key={fabric.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
            {fabric.hasImages ? (
              <Image className="w-8 h-8 text-gray-400" />
            ) : (
              <Package className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{fabric.code}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-xs mb-2 line-clamp-2">{fabric.name}</p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">{fabric.quantity} {fabric.unit}</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              fabric.status === 'available' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
              fabric.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
              fabric.status === 'out_of_stock' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
            }`}>
              {fabric.status === 'available' ? 'Có sẵn' :
               fabric.status === 'low_stock' ? 'Sắp hết' :
               fabric.status === 'out_of_stock' ? 'Hết hàng' :
               fabric.status === 'damaged' ? 'Hỏng' : fabric.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function FabricList({ fabrics }: { fabrics: any[] }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Mã vải
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Tên vải
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Số lượng
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Vị trí
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Ảnh
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {fabrics.map((fabric) => (
            <tr key={fabric.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                {fabric.code}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {fabric.name}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {fabric.quantity} {fabric.unit}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {fabric.location}
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  fabric.status === 'available' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                  fabric.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                  fabric.status === 'out_of_stock' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {fabric.status === 'available' ? 'Có sẵn' :
                   fabric.status === 'low_stock' ? 'Sắp hết' :
                   fabric.status === 'out_of_stock' ? 'Hết hàng' :
                   fabric.status === 'damaged' ? 'Hỏng' : fabric.status}
                </span>
              </td>
              <td className="px-4 py-3">
                {fabric.hasImages ? (
                  <span className="text-green-600 dark:text-green-400 text-sm">
                    {fabric.images?.length || 0} ảnh
                  </span>
                ) : (
                  <span className="text-gray-400 text-sm">Không có</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Pagination({ currentPage, totalPages, onPageChange, hasNextPage, hasPrevPage }: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  hasNextPage: boolean
  hasPrevPage: boolean
}) {
  return (
    <div className="flex items-center justify-between mt-6">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Trước
        </button>
        
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Trang {currentPage} / {totalPages}
        </span>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sau
        </button>
      </div>
    </div>
  )
}
