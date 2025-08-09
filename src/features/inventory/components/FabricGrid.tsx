import { Fabric } from '../types'
import { FabricCard } from './FabricCard'

interface FabricGridProps {
  fabrics: Fabric[]
  onSelectFabric: (fabric: Fabric) => void
  onUploadImage: (fabricId: number) => void
  onViewImage?: (imageUrl: string, fabricCode: string, fabricName: string) => void
  onPriceUpdate?: ((fabricId: number, price: number | null, note?: string) => Promise<void>) | undefined
  onVisibilityToggle?: ((fabricId: number, isHidden: boolean) => Promise<void>) | undefined
  isMarketingMode?: boolean
  isLoading?: boolean
}

export function FabricGrid({
  fabrics,
  onSelectFabric,
  onUploadImage,
  onViewImage,
  onPriceUpdate,
  onVisibilityToggle,
  isMarketingMode = false,
  isLoading = false
}: FabricGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-80 bg-gray-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (fabrics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="p-6 bg-gray-100 rounded-lg mb-4">
          <svg
            className="w-16 h-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Không tìm thấy vải nào
        </h3>
        <p className="text-gray-600 text-center max-w-md">
          Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm để xem thêm kết quả.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {fabrics.map((fabric) => (
        <FabricCard
          key={fabric.id}
          fabric={fabric}
          onSelect={onSelectFabric}
          onUploadImage={onUploadImage}
          onViewImage={onViewImage || (() => {})}
          onPriceUpdate={onPriceUpdate}
          onVisibilityToggle={onVisibilityToggle}
          isMarketingMode={isMarketingMode}
          className="animate-fade-in"
        />
      ))}
    </div>
  )
}
