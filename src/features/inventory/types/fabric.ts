import { BaseEntity } from '@/shared/types'

/**
 * Fabric inventory types
 */

export interface FabricImage {
  file: string
  type: 'main' | 'detail' | 'color_card'
  match_type: 'exact' | 'partial'
}

export interface Fabric extends BaseEntity {
  code: string
  name: string
  unit: string
  quantity: number
  location: string
  type?: FabricType | undefined // Loại vải (có thể null trong data thật)
  note?: string | undefined
  image?: string | undefined

  // Fields mới từ Excel data
  condition?: string | undefined // Tình trạng (từ cột "Tình trạng")
  remarks?: string | undefined // Ghi chú (từ cột "Ghi chú")
  application?: string | undefined // Ứng dụng vải (lót, voan, bọc, mành...)

  // Fields mở rộng cho tương lai
  width?: number | undefined // Khổ vải (cm) - extract từ name
  material?: string | undefined // Chất liệu - extract từ name
  color?: string | undefined // Màu sắc - extract từ name
  supplier?: string | undefined // Nhà cung cấp
  purchaseDate?: Date | undefined // Ngày nhập
  expiryDate?: Date | undefined // Ngày hết hạn
  minStock?: number | undefined // Tồn kho tối thiểu
  maxStock?: number | undefined // Tồn kho tối đa
  costPerUnit?: number | undefined // Giá thành/đơn vị

  // Fields từ tích hợp dữ liệu
  images?: FabricImage[] | undefined // Danh sách ảnh
  hasImages?: boolean | undefined // Có ảnh hay không

  // Computed status từ condition
  status: FabricStatus
}

export type FabricType =
  | 'Roller'      // 85 fabrics (25.4%) - Nhiều nhất
  | 'Vải bọc'     // 23 fabrics (6.9%)
  | 'Suntrip'     // 7 fabrics (2.1%)
  | 'voan'        // 4 fabrics (1.2%)
  | 'Silhouette'  // 2 fabrics (0.6%)
  | 'lót'         // 1 fabric (0.3%)
  | 'chính'       // Fabrics có từ "chính" trong tên (78 fabrics)
  | string // Allow any string for flexibility with real data

export type FabricStatus = 
  | 'available' 
  | 'low_stock' 
  | 'out_of_stock' 
  | 'damaged' 
  | 'expired'

export interface FabricFilters {
  search?: string
  type?: FabricType | 'all'
  location?: string | 'all'
  status?: FabricStatus | 'all'
  minQuantity?: number
  maxQuantity?: number
  imageStatus?: 'all' | 'with_images' | 'without_images'
}

export interface FabricSortOptions {
  field: keyof Fabric
  direction: 'asc' | 'desc'
}

export interface CreateFabricRequest {
  code: string
  name: string
  unit: string
  quantity: number
  location: string
  type?: FabricType
  note?: string
  condition?: string // Tình trạng
  remarks?: string // Ghi chú
  application?: string // Ứng dụng vải
  width?: number
  material?: string
  color?: string
  supplier?: string
  purchaseDate?: Date
  expiryDate?: Date
  minStock?: number
  maxStock?: number
  costPerUnit?: number
}

export interface UpdateFabricRequest extends Partial<CreateFabricRequest> {
  id: number
}

export interface FabricImageUpload {
  fabricId: number
  file: File
}

export interface FabricStats {
  totalItems: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
  damagedItems: number
  byType: Record<FabricType, number>
  byLocation: Record<string, number>
}
