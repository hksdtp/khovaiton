import {
  Fabric,
  FabricFilters,
  CreateFabricRequest,
  UpdateFabricRequest,
  FabricStats
} from '../types'
import { PaginationParams, PaginationResponse } from '@/shared/types'
import { mockFabrics, getMockFabrics } from '@/shared/mocks/fabricData'
import { hasRealImage } from '@/data/fabricImageMapping'
import { localStorageService } from '../services/localStorageService'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

// Cache for real fabric data
let realFabrics: Fabric[] = mockFabrics

// Ninh ơi, đã chuyển sang sử dụng hasRealImage từ fabricImageMapping.ts để đồng bộ

/**
 * Mock API delay for realistic behavior
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Simulate API errors occasionally
 */
const shouldSimulateError = () => Math.random() < 0.05 // 5% chance

/**
 * Load fabrics from Supabase database
 */
async function loadFabricsFromSupabase(): Promise<Fabric[]> {
  if (!isSupabaseConfigured) {
    console.log('📦 Supabase not configured, using mock data')
    return getMockFabrics()
  }

  try {
    console.log('☁️ Loading fabrics from Supabase...')
    const { data, error } = await supabase
      .from('fabrics')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Supabase error:', error)
      console.log('📦 Falling back to mock data')
      return getMockFabrics()
    }

    if (!data || data.length === 0) {
      console.log('📦 No data in Supabase, using mock data')
      return getMockFabrics()
    }

    // Convert Supabase data to Fabric format
    const fabrics: Fabric[] = data.map(row => ({
      id: row.id,
      code: row.code,
      name: row.name,
      type: row.type || 'unknown',
      quantity: row.quantity || 0,
      unit: row.unit || 'pieces',
      location: row.location || 'Unknown',
      status: row.status || 'available',
      image: row.custom_image_url || row.image || '',
      price: row.price,
      priceNote: row.price_note,
      priceUpdatedAt: row.price_updated_at ? new Date(row.price_updated_at) : undefined,
      isHidden: row.is_hidden || false,
      customImageUrl: row.custom_image_url,
      customImageUpdatedAt: row.custom_image_updated_at ? new Date(row.custom_image_updated_at) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }))

    console.log(`✅ Loaded ${fabrics.length} fabrics from Supabase`)
    return fabrics
  } catch (error) {
    console.error('❌ Error loading from Supabase:', error)
    console.log('📦 Falling back to mock data')
    return getMockFabrics()
  }
}

/**
 * Initialize real fabric data
 */
async function initializeRealData() {
  try {
    realFabrics = await loadFabricsFromSupabase()
  } catch (error) {
    console.warn('Using fallback fabric data:', error)
  }
}

/**
 * Force refresh fabric data (useful after manual URL updates)
 */
async function forceRefreshFabricData() {
  try {
    console.log('🔄 Force refreshing fabric data...')
    realFabrics = await loadFabricsFromSupabase()
    console.log('✅ Fabric data refreshed')
  } catch (error) {
    console.warn('Failed to refresh fabric data:', error)
  }
}

// Initialize data on module load
initializeRealData()

/**
 * Sort fabrics with status priority
 */
function sortFabricsWithStatusPriority(fabrics: Fabric[]): Fabric[] {
  return [...fabrics].sort((a, b) => {
    // Status priority (lower number = higher priority)
    const statusPriority = {
      'available': 1,      // Có sẵn - ưu tiên cao nhất
      'low_stock': 2,      // Sắp hết - ưu tiên cao
      'out_of_stock': 3,   // Hết hàng - ưu tiên trung bình
      'expired': 4,        // Hết hạn - ưu tiên thấp
      'damaged': 5         // Lỗi nhẹ - ưu tiên thấp nhất
    }

    const aPriority = statusPriority[a.status] || 999
    const bPriority = statusPriority[b.status] || 999

    if (aPriority !== bPriority) {
      return aPriority - bPriority
    }

    // If same status, sort by name
    return a.name.localeCompare(b.name, 'vi', { numeric: true })
  })
}

/**
 * Fabric API service
 */
export const fabricApi = {
  /**
   * Get paginated fabrics with filters
   */
  async getFabrics(
    filters: FabricFilters = {},
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<PaginationResponse<Fabric>> {
    await delay(300)

    if (shouldSimulateError()) {
      throw new Error('Failed to fetch fabrics')
    }

    // Ensure we have the latest real data
    if (realFabrics.length <= 10) {
      try {
        console.log('🔄 Refreshing fabric data...')
        realFabrics = await getMockFabrics()
        console.log(`✅ Loaded ${realFabrics.length} fabrics`)
      } catch (error) {
        console.warn('Could not refresh fabric data:', error)
      }
    }

    // Apply localStorage updates to all fabrics
    let filteredFabrics = realFabrics.map(fabric =>
      localStorageService.applyUpdatesToFabric(fabric)
    )

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filteredFabrics = filteredFabrics.filter(fabric =>
        fabric.code.toLowerCase().includes(searchLower) ||
        fabric.name.toLowerCase().includes(searchLower) ||
        fabric.location.toLowerCase().includes(searchLower) ||
        (fabric.condition && fabric.condition.toLowerCase().includes(searchLower)) ||
        (fabric.remarks && fabric.remarks.toLowerCase().includes(searchLower))
      )
    }

    if (filters.type && filters.type !== 'all') {
      filteredFabrics = filteredFabrics.filter(fabric => {
        // Xử lý đặc biệt cho "chính" - filter theo tên chứa "chính"
        if (filters.type === 'chính') {
          return fabric.name.toLowerCase().includes('chính')
        }
        // Các loại khác filter theo type thông thường
        return fabric.type === filters.type
      })
    }

    if (filters.location && filters.location !== 'all') {
      filteredFabrics = filteredFabrics.filter(fabric => 
        fabric.location.includes(filters.location!)
      )
    }

    if (filters.status && filters.status !== 'all') {
      filteredFabrics = filteredFabrics.filter(fabric => fabric.status === filters.status)
    }

    if (filters.minQuantity !== undefined) {
      filteredFabrics = filteredFabrics.filter(fabric => fabric.quantity >= filters.minQuantity!)
    }

    if (filters.maxQuantity !== undefined) {
      filteredFabrics = filteredFabrics.filter(fabric => fabric.quantity <= filters.maxQuantity!)
    }

    // Apply visibility filter - IMPORTANT: Filter hidden products unless explicitly requested
    if (!filters.showHidden) {
      // By default, hide products that are marked as hidden
      filteredFabrics = filteredFabrics.filter(fabric => !fabric.isHidden)
    }

    // Apply price status filter
    if (filters.priceStatus && filters.priceStatus !== 'all') {
      if (filters.priceStatus === 'with_price') {
        filteredFabrics = filteredFabrics.filter(fabric =>
          fabric.price !== null && fabric.price !== undefined && fabric.price > 0
        )
      } else if (filters.priceStatus === 'without_price') {
        filteredFabrics = filteredFabrics.filter(fabric =>
          !fabric.price || fabric.price <= 0
        )
      }
    }

    // Apply image status filter with real image checking
    if (filters.imageStatus && filters.imageStatus !== 'all') {
      if (filters.imageStatus === 'with_images') {
        filteredFabrics = filteredFabrics.filter(fabric => {
          // Check if fabric actually has an image (not just a generated URL)
          return hasRealImage(fabric.code)
        })
      } else if (filters.imageStatus === 'without_images') {
        filteredFabrics = filteredFabrics.filter(fabric => {
          // Check if fabric doesn't have a real image
          return !hasRealImage(fabric.code)
        })
      }
    }

    // Apply sorting with status priority
    const sortedFabrics = sortFabricsWithStatusPriority(filteredFabrics)

    // Apply pagination
    const startIndex = (pagination.page - 1) * pagination.limit
    const endIndex = startIndex + pagination.limit
    const paginatedFabrics = sortedFabrics.slice(startIndex, endIndex)

    return {
      data: paginatedFabrics,
      total: filteredFabrics.length,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(filteredFabrics.length / pagination.limit),
    }
  },

  /**
   * Get fabric by ID
   */
  async getFabricById(id: number): Promise<Fabric> {
    await delay(200)
    
    if (shouldSimulateError()) {
      throw new Error('Failed to fetch fabric')
    }

    const fabric = realFabrics.find(f => f.id === id)
    if (!fabric) {
      throw new Error('Fabric not found')
    }

    return fabric
  },

  /**
   * Create new fabric
   */
  async createFabric(data: CreateFabricRequest): Promise<Fabric> {
    await delay(500)
    
    if (shouldSimulateError()) {
      throw new Error('Failed to create fabric')
    }

    const newFabric: Fabric = {
      ...data,
      id: Math.max(...realFabrics.map(f => f.id)) + 1,
      status: 'available',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    realFabrics.push(newFabric)
    return newFabric
  },

  /**
   * Update fabric
   */
  async updateFabric(data: UpdateFabricRequest): Promise<Fabric> {
    await delay(400)
    
    if (shouldSimulateError()) {
      throw new Error('Failed to update fabric')
    }

    const index = realFabrics.findIndex(f => f.id === data.id)
    if (index === -1) {
      throw new Error('Fabric not found')
    }

    const updatedFabric = {
      ...realFabrics[index]!,
      ...data,
      updatedAt: new Date(),
    }

    realFabrics[index] = updatedFabric
    return updatedFabric
  },

  /**
   * Delete fabric
   */
  async deleteFabric(id: number): Promise<void> {
    await delay(300)
    
    if (shouldSimulateError()) {
      throw new Error('Failed to delete fabric')
    }

    const index = realFabrics.findIndex(f => f.id === id)
    if (index === -1) {
      throw new Error('Fabric not found')
    }

    realFabrics.splice(index, 1)
  },

  /**
   * Upload fabric image
   */
  async uploadFabricImage(fabricId: number, file: File): Promise<string> {
    await delay(1000)
    
    if (shouldSimulateError()) {
      throw new Error('Failed to upload image')
    }

    // Simulate file upload and return URL
    const imageUrl = URL.createObjectURL(file)
    
    // Update fabric with image
    const fabric = realFabrics.find(f => f.id === fabricId)
    if (fabric) {
      fabric.image = imageUrl
      fabric.updatedAt = new Date()
    }

    return imageUrl
  },

  /**
   * Get fabric statistics
   */
  async getFabricStats(): Promise<FabricStats> {
    await delay(200)
    
    if (shouldSimulateError()) {
      throw new Error('Failed to fetch statistics')
    }

    const stats: FabricStats = {
      totalItems: realFabrics.length,
      totalValue: realFabrics.reduce((sum, fabric) =>
        sum + (fabric.costPerUnit || 0) * fabric.quantity, 0
      ),
      lowStockItems: realFabrics.filter(f => f.status === 'low_stock').length,
      outOfStockItems: realFabrics.filter(f => f.status === 'out_of_stock').length,
      damagedItems: realFabrics.filter(f => f.status === 'damaged').length,
      byType: realFabrics.reduce((acc, fabric) => {
        const type = fabric.type || 'Unknown'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byLocation: realFabrics.reduce((acc, fabric) => {
        const location = fabric.location.split(' ')[0] || 'Unknown'
        acc[location] = (acc[location] || 0) + 1
        return acc
      }, {} as Record<string, number>),
    }

    return stats
  },

  /**
   * Force refresh fabric data
   */
  async forceRefreshData(): Promise<void> {
    await forceRefreshFabricData()
  },
}
