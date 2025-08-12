import { useState, useEffect } from 'react'
import { Download, Eye, EyeOff, Image, ImageOff } from 'lucide-react'
import { Button } from '@/common/design-system/components'
import { useFabrics } from '@/features/inventory/hooks/useFabrics'
import { Fabric } from '@/features/inventory/types'

interface HiddenProductsAnalyzerProps {
  onClose: () => void
}

interface ProductAnalysis {
  hiddenWithoutImages: Fabric[]
  hiddenWithImages: Fabric[]
  visibleWithoutImages: Fabric[]
  totalHidden: number
  totalWithoutImages: number
}

export function HiddenProductsAnalyzer({ onClose }: HiddenProductsAnalyzerProps) {
  const { data: fabrics = [], isLoading } = useFabrics()
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null)

  useEffect(() => {
    if (fabrics.length > 0) {
      analyzeProducts(fabrics)
    }
  }, [fabrics])

  const analyzeProducts = (fabricList: Fabric[]) => {
    const hiddenWithoutImages = fabricList.filter(f => f.isHidden && !f.image)
    const hiddenWithImages = fabricList.filter(f => f.isHidden && f.image)
    const visibleWithoutImages = fabricList.filter(f => !f.isHidden && !f.image)
    
    setAnalysis({
      hiddenWithoutImages,
      hiddenWithImages,
      visibleWithoutImages,
      totalHidden: fabricList.filter(f => f.isHidden).length,
      totalWithoutImages: fabricList.filter(f => !f.image).length
    })
  }

  const exportToCSV = (products: Fabric[], filename: string) => {
    const headers = ['Mã vải', 'Tên sản phẩm', 'Số lượng', 'Vị trí', 'Trạng thái', 'Có ảnh', 'Đã ẩn', 'Ghi chú']
    
    const csvContent = [
      headers.join(','),
      ...products.map(product => [
        `"${product.code}"`,
        `"${product.name}"`,
        product.quantity,
        `"${product.location}"`,
        `"${product.status}"`,
        product.image ? 'Có' : 'Không',
        product.isHidden ? 'Có' : 'Không',
        `"${product.note || product.remarks || ''}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Đang phân tích dữ liệu...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              📊 Phân Tích Sản Phẩm Đã Ẩn
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <EyeOff className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-800">Đã ẩn không có ảnh</span>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {analysis.hiddenWithoutImages.length}
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <EyeOff className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-orange-800">Đã ẩn có ảnh</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {analysis.hiddenWithImages.length}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ImageOff className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Hiện không có ảnh</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">
                {analysis.visibleWithoutImages.length}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Tổng đã ẩn</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {analysis.totalHidden}
              </div>
            </div>
          </div>

          {/* Main Focus: Hidden Products Without Images */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-800 flex items-center gap-2">
                <EyeOff className="w-5 h-5" />
                Sản phẩm đã ẩn vì không có ảnh ({analysis.hiddenWithoutImages.length})
              </h3>
              <Button
                onClick={() => exportToCSV(analysis.hiddenWithoutImages, 'san-pham-da-an-khong-co-anh.csv')}
                className="flex items-center gap-2"
                size="sm"
              >
                <Download className="w-4 h-4" />
                Xuất CSV
              </Button>
            </div>

            {analysis.hiddenWithoutImages.length === 0 ? (
              <p className="text-red-700">✅ Không có sản phẩm nào bị ẩn vì thiếu ảnh!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-red-200">
                      <th className="text-left p-2 font-medium text-red-800">Mã vải</th>
                      <th className="text-left p-2 font-medium text-red-800">Tên sản phẩm</th>
                      <th className="text-left p-2 font-medium text-red-800">Số lượng</th>
                      <th className="text-left p-2 font-medium text-red-800">Vị trí</th>
                      <th className="text-left p-2 font-medium text-red-800">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.hiddenWithoutImages.map((product) => (
                      <tr key={product.id} className="border-b border-red-100 hover:bg-red-100">
                        <td className="p-2 font-mono text-red-700">{product.code}</td>
                        <td className="p-2 text-red-700">{product.name}</td>
                        <td className="p-2 text-red-700">{product.quantity}</td>
                        <td className="p-2 text-red-700">{product.location}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            product.status === 'available' ? 'bg-green-100 text-green-700' :
                            product.status === 'low_stock' ? 'bg-yellow-100 text-yellow-700' :
                            product.status === 'out_of_stock' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {product.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Other Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hidden with Images */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-orange-800 flex items-center gap-2">
                  <EyeOff className="w-4 h-4" />
                  Đã ẩn nhưng có ảnh ({analysis.hiddenWithImages.length})
                </h4>
                {analysis.hiddenWithImages.length > 0 && (
                  <Button
                    onClick={() => exportToCSV(analysis.hiddenWithImages, 'san-pham-da-an-co-anh.csv')}
                    size="sm"
                    variant="ghost"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <div className="max-h-40 overflow-y-auto">
                {analysis.hiddenWithImages.length === 0 ? (
                  <p className="text-orange-700 text-sm">Không có sản phẩm nào</p>
                ) : (
                  <div className="space-y-1">
                    {analysis.hiddenWithImages.slice(0, 10).map((product) => (
                      <div key={product.id} className="text-sm text-orange-700">
                        <span className="font-mono">{product.code}</span> - {product.name}
                      </div>
                    ))}
                    {analysis.hiddenWithImages.length > 10 && (
                      <div className="text-xs text-orange-600">
                        ... và {analysis.hiddenWithImages.length - 10} sản phẩm khác
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Visible without Images */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-yellow-800 flex items-center gap-2">
                  <ImageOff className="w-4 h-4" />
                  Hiện nhưng không có ảnh ({analysis.visibleWithoutImages.length})
                </h4>
                {analysis.visibleWithoutImages.length > 0 && (
                  <Button
                    onClick={() => exportToCSV(analysis.visibleWithoutImages, 'san-pham-hien-khong-co-anh.csv')}
                    size="sm"
                    variant="ghost"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <div className="max-h-40 overflow-y-auto">
                {analysis.visibleWithoutImages.length === 0 ? (
                  <p className="text-yellow-700 text-sm">✅ Tất cả sản phẩm hiện đều có ảnh!</p>
                ) : (
                  <div className="space-y-1">
                    {analysis.visibleWithoutImages.slice(0, 10).map((product) => (
                      <div key={product.id} className="text-sm text-yellow-700">
                        <span className="font-mono">{product.code}</span> - {product.name}
                      </div>
                    ))}
                    {analysis.visibleWithoutImages.length > 10 && (
                      <div className="text-xs text-yellow-600">
                        ... và {analysis.visibleWithoutImages.length - 10} sản phẩm khác
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <Button
              onClick={() => exportToCSV(analysis.hiddenWithoutImages, 'danh-sach-san-pham-can-them-anh.csv')}
              className="flex items-center gap-2"
              disabled={analysis.hiddenWithoutImages.length === 0}
            >
              <Download className="w-4 h-4" />
              Xuất danh sách cần thêm ảnh
            </Button>
            
            <Button
              onClick={onClose}
              variant="secondary"
            >
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
