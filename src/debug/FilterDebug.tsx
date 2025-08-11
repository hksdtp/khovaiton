import { useState, useEffect } from 'react'
import { useFabrics } from '@/features/inventory/hooks/useFabrics'
import { useInventoryStore } from '@/features/inventory/store/inventoryStore'

export function FilterDebug() {
  const { filters, setFilters } = useInventoryStore()
  const [debugInfo, setDebugInfo] = useState<any>({})

  // Test different filter combinations
  const allQuery = useFabrics({}, { page: 1, limit: 1000 })
  const withImagesQuery = useFabrics({ imageStatus: 'with_images' }, { page: 1, limit: 1000 })
  const withoutImagesQuery = useFabrics({ imageStatus: 'without_images' }, { page: 1, limit: 1000 })

  useEffect(() => {
    const info = {
      currentFilters: filters,
      allQuery: {
        loading: allQuery.isLoading,
        total: allQuery.data?.total,
        dataLength: allQuery.data?.data?.length,
        error: allQuery.error?.message
      },
      withImagesQuery: {
        loading: withImagesQuery.isLoading,
        total: withImagesQuery.data?.total,
        dataLength: withImagesQuery.data?.data?.length,
        error: withImagesQuery.error?.message
      },
      withoutImagesQuery: {
        loading: withoutImagesQuery.isLoading,
        total: withoutImagesQuery.data?.total,
        dataLength: withoutImagesQuery.data?.data?.length,
        error: withoutImagesQuery.error?.message
      }
    }
    setDebugInfo(info)
    console.log('🔍 Filter Debug Info:', info)
  }, [filters, allQuery, withImagesQuery, withoutImagesQuery])

  const handleFilterTest = (imageStatus: string) => {
    console.log(`🧪 Testing filter: ${imageStatus}`)
    setFilters({ imageStatus: imageStatus as any })
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-md z-50">
      <h3 className="font-bold text-sm mb-2">🔍 Filter Debug</h3>
      
      <div className="text-xs space-y-2">
        <div>
          <strong>Current Filter:</strong> {filters.imageStatus || 'none'}
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-blue-50 p-2 rounded">
            <div className="font-bold">{debugInfo.allQuery?.total || 0}</div>
            <div>All</div>
          </div>
          <div className="bg-green-50 p-2 rounded">
            <div className="font-bold">{debugInfo.withImagesQuery?.total || 0}</div>
            <div>With Images</div>
          </div>
          <div className="bg-red-50 p-2 rounded">
            <div className="font-bold">{debugInfo.withoutImagesQuery?.total || 0}</div>
            <div>Without Images</div>
          </div>
        </div>
        
        <div className="flex gap-1">
          <button 
            onClick={() => handleFilterTest('all')}
            className="px-2 py-1 bg-blue-500 text-white text-xs rounded"
          >
            All
          </button>
          <button 
            onClick={() => handleFilterTest('with_images')}
            className="px-2 py-1 bg-green-500 text-white text-xs rounded"
          >
            With
          </button>
          <button 
            onClick={() => handleFilterTest('without_images')}
            className="px-2 py-1 bg-red-500 text-white text-xs rounded"
          >
            Without
          </button>
        </div>
        
        {(debugInfo.allQuery?.error || debugInfo.withImagesQuery?.error || debugInfo.withoutImagesQuery?.error) && (
          <div className="text-red-600 text-xs">
            <strong>Errors:</strong>
            {debugInfo.allQuery?.error && <div>All: {debugInfo.allQuery.error}</div>}
            {debugInfo.withImagesQuery?.error && <div>With: {debugInfo.withImagesQuery.error}</div>}
            {debugInfo.withoutImagesQuery?.error && <div>Without: {debugInfo.withoutImagesQuery.error}</div>}
          </div>
        )}
      </div>
    </div>
  )
}
