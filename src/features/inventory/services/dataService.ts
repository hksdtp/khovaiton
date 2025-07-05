// src/features/inventory/services/dataService.ts
import { Fabric } from '../types/fabric'

interface FabricsData {
  metadata: {
    total_items: number
    total_images: number
    mapped_images: number
    fabrics_with_images: number
    generated_at: string
    source_excel: string
    source_images: string
  }
  fabrics: Fabric[]
  image_mapping: Record<string, Array<{
    fabric_code: string
    fabric_name: string
    type: string
  }>>
}

interface IntegrationSummary {
  total_fabrics: number
  fabrics_with_images: number
  coverage_percentage: number
  total_images: number
  mapped_images: number
  unmapped_images: number
  fabric_types: Record<string, number>
  fabric_locations: Record<string, number>
  fabric_statuses: Record<string, number>
}

/**
 * Service để load và quản lý dữ liệu vải từ file JSON
 */
export class DataService {
  private static instance: DataService
  private fabricsData: FabricsData | null = null
  private integrationSummary: IntegrationSummary | null = null

  private constructor() {}

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService()
    }
    return DataService.instance
  }

  /**
   * Load dữ liệu vải từ file JSON
   */
  async loadFabricsData(): Promise<FabricsData> {
    if (this.fabricsData) {
      return this.fabricsData
    }

    try {
      const response = await fetch('/src/data/fabrics_data.json')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      this.fabricsData = await response.json()
      return this.fabricsData!
    } catch (error) {
      console.error('Lỗi load dữ liệu vải:', error)
      throw new Error('Không thể load dữ liệu vải')
    }
  }

  /**
   * Load báo cáo tích hợp
   */
  async loadIntegrationSummary(): Promise<IntegrationSummary> {
    if (this.integrationSummary) {
      return this.integrationSummary
    }

    try {
      const response = await fetch('/src/data/integration_summary.json')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      this.integrationSummary = await response.json()
      return this.integrationSummary!
    } catch (error) {
      console.error('Lỗi load báo cáo tích hợp:', error)
      throw new Error('Không thể load báo cáo tích hợp')
    }
  }

  /**
   * Lấy danh sách tất cả vải
   */
  async getAllFabrics(): Promise<Fabric[]> {
    const data = await this.loadFabricsData()
    return data.fabrics
  }

  /**
   * Tìm vải theo ID
   */
  async getFabricById(id: number): Promise<Fabric | null> {
    const fabrics = await this.getAllFabrics()
    return fabrics.find(fabric => fabric.id === id) || null
  }

  /**
   * Tìm vải theo mã
   */
  async getFabricByCode(code: string): Promise<Fabric | null> {
    const fabrics = await this.getAllFabrics()
    return fabrics.find(fabric => fabric.code === code) || null
  }

  /**
   * Lấy danh sách vải có ảnh
   */
  async getFabricsWithImages(): Promise<Fabric[]> {
    const fabrics = await this.getAllFabrics()
    return fabrics.filter(fabric => fabric.hasImages)
  }

  /**
   * Lấy danh sách vải không có ảnh
   */
  async getFabricsWithoutImages(): Promise<Fabric[]> {
    const fabrics = await this.getAllFabrics()
    return fabrics.filter(fabric => !fabric.hasImages)
  }

  /**
   * Lấy mapping ảnh
   */
  async getImageMapping(): Promise<Record<string, Array<{
    fabric_code: string
    fabric_name: string
    type: string
  }>>> {
    const data = await this.loadFabricsData()
    return data.image_mapping
  }

  /**
   * Lấy URL ảnh cho vải
   */
  getImageUrl(imagePath: string): string {
    // Tạo URL cho ảnh local
    // Trong production, có thể cần upload lên Cloudinary
    return `/images/fabrics/${imagePath}`
  }

  /**
   * Lấy ảnh chính của vải
   */
  getMainImage(fabric: Fabric): string | null {
    if (!fabric.images || fabric.images.length === 0) {
      return null
    }

    // Tìm ảnh chính (type: 'main')
    const mainImage = fabric.images.find(img => img.type === 'main')
    if (mainImage) {
      return this.getImageUrl(mainImage.file)
    }

    // Nếu không có ảnh chính, lấy ảnh đầu tiên
    if (fabric.images && fabric.images.length > 0) {
      return this.getImageUrl(fabric.images[0]?.file || "")
    }

    return null
  }

  /**
   * Lấy tất cả ảnh của vải
   */
  getAllImages(fabric: Fabric): Array<{
    url: string
    type: string
    file: string
  }> {
    if (!fabric.images) {
      return []
    }

    return fabric.images.map(img => ({
      url: this.getImageUrl(img.file),
      type: img.type,
      file: img.file
    }))
  }

  /**
   * Lấy thống kê tổng quan
   */
  async getStats(): Promise<{
    totalFabrics: number
    fabricsWithImages: number
    coveragePercentage: number
    totalImages: number
    mappedImages: number
    unmappedImages: number
    byType: Record<string, number>
    byLocation: Record<string, number>
    byStatus: Record<string, number>
  }> {
    const summary = await this.loadIntegrationSummary()
    
    return {
      totalFabrics: summary.total_fabrics,
      fabricsWithImages: summary.fabrics_with_images,
      coveragePercentage: summary.coverage_percentage,
      totalImages: summary.total_images,
      mappedImages: summary.mapped_images,
      unmappedImages: summary.unmapped_images,
      byType: summary.fabric_types,
      byLocation: summary.fabric_locations,
      byStatus: summary.fabric_statuses
    }
  }

  /**
   * Tìm kiếm vải
   */
  async searchFabrics(query: string): Promise<Fabric[]> {
    const fabrics = await this.getAllFabrics()
    const searchTerm = query.toLowerCase().trim()

    if (!searchTerm) {
      return fabrics
    }

    return fabrics.filter(fabric => 
      fabric.code.toLowerCase().includes(searchTerm) ||
      fabric.name.toLowerCase().includes(searchTerm) ||
      (fabric.location && fabric.location.toLowerCase().includes(searchTerm)) ||
      (fabric.type && fabric.type.toLowerCase().includes(searchTerm))
    )
  }

  /**
   * Lọc vải theo tiêu chí
   */
  async filterFabrics(filters: {
    type?: string
    location?: string
    status?: string
    hasImages?: boolean
    minQuantity?: number
    maxQuantity?: number
  }): Promise<Fabric[]> {
    const fabrics = await this.getAllFabrics()

    return fabrics.filter(fabric => {
      // Lọc theo loại
      if (filters.type && filters.type !== 'all' && fabric.type !== filters.type) {
        return false
      }

      // Lọc theo vị trí
      if (filters.location && filters.location !== 'all' && fabric.location !== filters.location) {
        return false
      }

      // Lọc theo trạng thái
      if (filters.status && filters.status !== 'all' && fabric.status !== filters.status) {
        return false
      }

      // Lọc theo có ảnh
      if (filters.hasImages !== undefined && fabric.hasImages !== filters.hasImages) {
        return false
      }

      // Lọc theo số lượng
      if (filters.minQuantity !== undefined && fabric.quantity < filters.minQuantity) {
        return false
      }

      if (filters.maxQuantity !== undefined && fabric.quantity > filters.maxQuantity) {
        return false
      }

      return true
    })
  }

  /**
   * Sắp xếp vải
   */
  sortFabrics(fabrics: Fabric[], field: keyof Fabric, direction: 'asc' | 'desc'): Fabric[] {
    return [...fabrics].sort((a, b) => {
      const aValue = a[field]
      const bValue = b[field]

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      let comparison = 0
      if (aValue < bValue) comparison = -1
      if (aValue > bValue) comparison = 1

      return direction === 'desc' ? -comparison : comparison
    })
  }

  /**
   * Phân trang
   */
  paginateFabrics(fabrics: Fabric[], page: number, limit: number): {
    items: Fabric[]
    totalItems: number
    totalPages: number
    currentPage: number
    hasNextPage: boolean
    hasPrevPage: boolean
  } {
    const totalItems = fabrics.length
    const totalPages = Math.ceil(totalItems / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const items = fabrics.slice(startIndex, endIndex)

    return {
      items,
      totalItems,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  }
}

// Export singleton instance
export const dataService = DataService.getInstance()
