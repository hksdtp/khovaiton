import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { imageUpdateService } from '@/services/imageUpdateService'
import { forceRefreshAllFabricImages } from '@/shared/mocks/fabricData'
import { fabricApi } from '../api/fabricApi'

interface ManualUrlFormProps {
  fabricCode: string
  compact?: boolean
}

export function ManualUrlForm({ fabricCode, compact = true }: ManualUrlFormProps) {
  const queryClient = useQueryClient()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setError(null)

    if (!url || !/^https?:\/\//i.test(url)) {
      setError('Vui lòng nhập URL hợp lệ (bắt đầu bằng http/https)')
      return
    }

    try {
      setLoading(true)
      console.log(`🚀 Starting manual URL update for ${fabricCode} with URL: ${url}`)

      const result = await imageUpdateService.handleManualUrlUpdate(fabricCode, url)
      console.log(`📋 Update result:`, result)

      if (result.success) {
        setMessage('Đã cập nhật URL ảnh. UI sẽ refresh ngay.')
        setUrl('')

        // Force refresh fabric data từ syncService
        console.log(`🔄 Refreshing fabric data...`)
        await forceRefreshAllFabricImages()

        // Force refresh fabricApi cache
        console.log(`🔄 Refreshing fabricApi cache...`)
        await fabricApi.forceRefreshData()

        // Force refresh UI ngay lập tức
        console.log(`🔄 Invalidating React Query cache...`)

        // Update all fabric-related cache patterns optimistically
        // 1. Base fabrics cache
        queryClient.setQueriesData(
          { queryKey: ['fabrics'] },
          (oldData: any) => {
            if (!oldData) return oldData

            // Handle both array format and paginated format
            if (Array.isArray(oldData)) {
              return oldData.map((fabric: any) =>
                fabric.code === fabricCode
                  ? { ...fabric, image: url }
                  : fabric
              )
            }

            if (oldData?.data && Array.isArray(oldData.data)) {
              return {
                ...oldData,
                data: oldData.data.map((fabric: any) =>
                  fabric.code === fabricCode
                    ? { ...fabric, image: url }
                    : fabric
                )
              }
            }

            return oldData
          }
        )

        // 2. Also update any fabric detail cache for this specific fabric
        queryClient.setQueriesData(
          { queryKey: ['fabrics', 'detail'] },
          (oldData: any) => {
            if (oldData?.code === fabricCode) {
              return { ...oldData, image: url }
            }
            return oldData
          }
        )

        await queryClient.invalidateQueries({ queryKey: ['fabrics'] })
        const refetchResult = await queryClient.refetchQueries({ queryKey: ['fabrics'] })
        console.log(`📊 Refetch result:`, refetchResult)

        // Show success message to user
        setMessage(`✅ Đã cập nhật URL cho vải "${fabricCode}" thành công!`)

        // Clear form
        setUrl('')

        // Debug: check if fabric.image is updated in the new data
        setTimeout(() => {
          const fabricQueries = queryClient.getQueriesData({ queryKey: ['fabrics'] })
          console.log(`🔍 Found ${fabricQueries.length} fabric-related queries`)

          fabricQueries.forEach(([queryKey, data]: [any, any], index) => {
            console.log(`🔍 Query ${index + 1} key:`, JSON.stringify(queryKey))

            // Handle different data formats
            let fabricList: any[] = []
            let dataInfo = ''

            if (Array.isArray(data)) {
              fabricList = data
              dataInfo = `Array with ${data.length} items`
            } else if (data?.data && Array.isArray(data.data)) {
              fabricList = data.data
              dataInfo = `Object with data array (${data.data.length} items)`
            } else if (data?.code) {
              // Single fabric detail
              fabricList = [data]
              dataInfo = `Single fabric: ${data.code}`
            } else if (data && typeof data === 'object') {
              // Handle other object formats (like stats, pagination info, etc.)
              console.log(`🔍 Query ${index + 1}: Object data (not fabric list)`, Object.keys(data))
              return
            } else {
              console.log(`🔍 Query ${index + 1}: Unknown data format`, typeof data, data)
              return
            }

            console.log(`🔍 Query ${index + 1}: ${dataInfo}`)

            // Try to find the fabric
            const fabric = fabricList.find((f: any) => f.code === fabricCode)

            if (fabric) {
              console.log(`🔍 Query ${index + 1}: Found ${fabricCode}, image: ${fabric.image}`)
              console.log(`🔍 Query ${index + 1}: Expected: ${url}`)
              console.log(`🔍 Query ${index + 1}: Match: ${fabric.image === url ? '✅' : '❌'}`)
            } else {
              console.log(`🔍 Query ${index + 1}: Fabric "${fabricCode}" not found`)
              // Show a few sample codes for debugging
              const sampleCodes = fabricList.slice(0, 3).map((f: any) => f.code)
              console.log(`🔍 Query ${index + 1}: Sample codes:`, sampleCodes)
            }
          })
        }, 500)

        console.log(`✅ UI refreshed after manual URL update for ${fabricCode}`)
      } else {
        console.error(`❌ Update failed:`, result)
        setError(result.error || 'Không thể cập nhật URL')
      }
    } catch (err) {
      console.error(`❌ Exception during update:`, err)
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <input
          type="url"
          placeholder="https://example.com/image.jpg"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={
            compact
              ? 'flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              : 'flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          }
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !url}
          className={
            compact
              ? 'px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              : 'px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          }
        >
          {loading ? 'Đang lưu...' : 'Đổi ảnh'}
        </button>
      </div>

      {message && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-md">
          ✅ {message}
        </div>
      )}

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
          ❌ {error}
        </div>
      )}

      <div className="text-xs text-gray-500">
        💡 Nhập URL ảnh từ internet để thay đổi ảnh sản phẩm tạm thời
      </div>
    </form>
  )
}

