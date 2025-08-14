import { supabase, isSupabaseConfigured } from '@/lib/supabase'

// Get Supabase config for fallback REST API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zgrfqkytbmahxcbgpkxx.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncmZxa3l0Ym1haHhjYmdwa3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNjI1MTAsImV4cCI6MjA2MTczODUxMH0.a6giZZFMrj6jBhLip3ShOFCyTHt5dbe31UDGCECh0Zs'
import { localStorageService } from './localStorageService'
import { Fabric } from '../types'

export interface FabricUpdateResult {
  success: boolean
  error?: string
  fabric?: Fabric | undefined
}

// Helper function to convert database format to app format
function convertDatabaseToApp(data: any): Fabric {
  return {
    ...data,
    price: data.price,
    priceNote: data.price_note,
    priceUpdatedAt: data.price_updated_at ? new Date(data.price_updated_at) : undefined,
    isHidden: data.is_hidden || false,
    isDeleted: data.is_deleted || false,
    deletedAt: data.deleted_at ? new Date(data.deleted_at) : undefined,
    customImageUrl: data.custom_image_url,
    customImageUpdatedAt: data.custom_image_updated_at ? new Date(data.custom_image_updated_at) : undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  }
}

class FabricUpdateService {
  private static instance: FabricUpdateService

  static getInstance(): FabricUpdateService {
    if (!FabricUpdateService.instance) {
      FabricUpdateService.instance = new FabricUpdateService()
    }
    return FabricUpdateService.instance
  }

  /**
   * Cập nhật giá sản phẩm
   */
  async updatePrice(
    fabricId: number,
    price: number | null,
    note?: string
  ): Promise<FabricUpdateResult> {
    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      console.warn('⚠️ Supabase not configured, using localStorage for price update')
      localStorageService.updatePrice(fabricId, price, note)
      return {
        success: true
      }
    }

    try {
      console.log(`💰 Updating price for fabric ${fabricId}:`, { price, note })
      console.log(`🔗 Supabase configured: ${isSupabaseConfigured}`)
      console.log(`🔑 Using Supabase client for update`)

      const updateData: any = {
        price,
        price_note: note || null,
        price_updated_at: price ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      }

      console.log(`📤 Update data:`, updateData)

      const { data, error } = await supabase
        .from('fabrics')
        .update(updateData)
        .eq('id', fabricId)
        .select()

      if (error) {
        console.error('❌ Supabase error updating price:', error)
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })

        // Try fallback with REST API if Supabase client fails
        console.log('🔄 Trying fallback with REST API...')
        try {
          const fallbackResponse = await fetch(`${supabaseUrl}/rest/v1/fabrics?id=eq.${fabricId}`, {
            method: 'PATCH',
            headers: {
              'apikey': supabaseAnonKey,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(updateData)
          })

          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            console.log('✅ Fallback REST API success:', fallbackData)

            if (fallbackData && fallbackData.length > 0) {
              return {
                success: true,
                fabric: convertDatabaseToApp(fallbackData[0])
              }
            }
          } else {
            const fallbackError = await fallbackResponse.text()
            console.error('❌ Fallback REST API failed:', fallbackError)
          }
        } catch (fallbackErr) {
          console.error('❌ Fallback REST API exception:', fallbackErr)
        }

        return {
          success: false,
          error: `Không thể cập nhật giá: ${error.message}`
        }
      }

      console.log('✅ Price updated successfully:', data)

      // Handle array response from update query
      if (data && data.length > 0) {
        return {
          success: true,
          fabric: convertDatabaseToApp(data[0])
        }
      } else {
        console.warn('⚠️ Update successful but no data returned')
        return {
          success: true,
          fabric: undefined
        }
      }
    } catch (error) {
      console.error('❌ Exception updating price:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        return {
          success: false,
          error: 'Không thể kết nối đến database. Vui lòng kiểm tra kết nối mạng và thử lại.'
        }
      }

      return {
        success: false,
        error: `Lỗi cập nhật giá: ${errorMessage}`
      }
    }
  }

  /**
   * Cập nhật trạng thái ẩn/hiện sản phẩm
   */
  async updateVisibility(
    fabricId: number,
    isHidden: boolean
  ): Promise<FabricUpdateResult> {
    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      console.warn('⚠️ Supabase not configured, using localStorage for visibility update')
      localStorageService.updateVisibility(fabricId, isHidden)
      return {
        success: true
      }
    }

    try {
      console.log(`👁️ Updating visibility for fabric ${fabricId}:`, { isHidden })

      const updateData = {
        is_hidden: isHidden,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('fabrics')
        .update(updateData)
        .eq('id', fabricId)
        .select()

      if (error) {
        console.error('❌ Supabase error updating visibility:', error)
        return {
          success: false,
          error: `Không thể cập nhật trạng thái hiển thị: ${error.message}`
        }
      }

      console.log('✅ Visibility updated successfully:', data)

      // Handle array response from update query
      if (data && data.length > 0) {
        return {
          success: true,
          fabric: convertDatabaseToApp(data[0])
        }
      } else {
        console.warn('⚠️ Visibility update successful but no data returned')
        return {
          success: true,
          fabric: undefined
        }
      }
    } catch (error) {
      console.error('❌ Exception updating visibility:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        return {
          success: false,
          error: 'Không thể kết nối đến database. Vui lòng kiểm tra kết nối mạng và thử lại.'
        }
      }

      return {
        success: false,
        error: `Lỗi cập nhật hiển thị: ${errorMessage}`
      }
    }
  }

  /**
   * Batch update multiple fabrics visibility
   */
  async batchUpdateVisibility(
    fabricIds: number[], 
    isHidden: boolean
  ): Promise<FabricUpdateResult> {
    try {
      console.log(`👁️ Batch updating visibility for ${fabricIds.length} fabrics:`, { isHidden })

      const updateData = {
        is_hidden: isHidden,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('fabrics')
        .update(updateData)
        .in('id', fabricIds)
        .select()

      if (error) {
        console.error('❌ Supabase error batch updating visibility:', error)
        return {
          success: false,
          error: `Database error: ${error.message}`
        }
      }

      console.log(`✅ Batch visibility updated successfully: ${data.length} fabrics`)

      return {
        success: true
      }
    } catch (error) {
      console.error('❌ Exception batch updating visibility:', error)
      return {
        success: false,
        error: (error as Error).message
      }
    }
  }

  /**
   * Cập nhật custom image URL
   */
  async updateCustomImageUrl(
    fabricId: number,
    customImageUrl: string
  ): Promise<FabricUpdateResult> {
    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      console.warn('⚠️ Supabase not configured, using localStorage for custom image URL')
      localStorageService.updateCustomImageUrl(fabricId, customImageUrl)
      return {
        success: true
      }
    }

    try {
      console.log(`🖼️ Updating custom image URL for fabric ${fabricId}:`, customImageUrl)

      const updateData = {
        custom_image_url: customImageUrl,
        custom_image_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('fabrics')
        .update(updateData)
        .eq('id', fabricId)
        .select()

      if (error) {
        console.error('❌ Supabase error updating custom image URL:', error)
        return {
          success: false,
          error: `Không thể cập nhật URL ảnh: ${error.message}`
        }
      }

      console.log('✅ Custom image URL updated successfully:', data)

      // Handle array response from update query
      if (data && data.length > 0) {
        return {
          success: true,
          fabric: convertDatabaseToApp(data[0])
        }
      } else {
        console.warn('⚠️ Custom image update successful but no data returned')
        return {
          success: true,
          fabric: undefined
        }
      }
    } catch (error) {
      console.error('❌ Exception updating custom image URL:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        return {
          success: false,
          error: 'Không thể kết nối đến database. Vui lòng kiểm tra kết nối mạng và thử lại.'
        }
      }

      return {
        success: false,
        error: `Lỗi cập nhật URL ảnh: ${errorMessage}`
      }
    }
  }

  /**
   * Delete product permanently
   */
  async deleteProduct(fabricId: number): Promise<FabricUpdateResult> {
    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      console.warn('⚠️ Supabase not configured, using localStorage for product deletion')
      localStorageService.deleteProduct(fabricId)
      return {
        success: true
      }
    }

    try {
      console.log(`🗑️ Permanently deleting fabric ${fabricId}`)

      const { error } = await supabase
        .from('fabrics')
        .delete()
        .eq('id', fabricId)

      if (error) {
        console.error('❌ Supabase error deleting product:', error)
        return {
          success: false,
          error: `Không thể xóa sản phẩm: ${error.message}`
        }
      }

      console.log('✅ Product deleted successfully')

      return {
        success: true
      }
    } catch (error) {
      console.error('❌ Exception deleting product:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        return {
          success: false,
          error: 'Không thể kết nối đến database. Vui lòng kiểm tra kết nối mạng và thử lại.'
        }
      }

      return {
        success: false,
        error: `Lỗi xóa sản phẩm: ${errorMessage}`
      }
    }
  }

  /**
   * Soft delete product (mark as deleted but keep in database)
   */
  async softDeleteProduct(fabricId: number): Promise<FabricUpdateResult> {
    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      console.warn('⚠️ Supabase not configured, using localStorage for soft delete')
      localStorageService.softDeleteProduct(fabricId)
      return {
        success: true
      }
    }

    try {
      console.log(`🗑️ Soft deleting fabric ${fabricId}`)

      const updateData = {
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('fabrics')
        .update(updateData)
        .eq('id', fabricId)
        .select()

      if (error) {
        console.error('❌ Supabase error soft deleting product:', error)
        return {
          success: false,
          error: `Không thể xóa sản phẩm: ${error.message}`
        }
      }

      console.log('✅ Product soft deleted successfully:', data)

      return {
        success: true,
        fabric: data && data.length > 0 ? convertDatabaseToApp(data[0]) : undefined
      }
    } catch (error) {
      console.error('❌ Exception soft deleting product:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      return {
        success: false,
        error: `Lỗi xóa sản phẩm: ${errorMessage}`
      }
    }
  }

  /**
   * Restore soft deleted product
   */
  async restoreProduct(fabricId: number): Promise<FabricUpdateResult> {
    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      console.warn('⚠️ Supabase not configured, using localStorage for restore')
      localStorageService.restoreProduct(fabricId)
      return {
        success: true
      }
    }

    try {
      console.log(`🔄 Restoring fabric ${fabricId}`)

      const updateData = {
        is_deleted: false,
        deleted_at: null,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('fabrics')
        .update(updateData)
        .eq('id', fabricId)
        .select()

      if (error) {
        console.error('❌ Supabase error restoring product:', error)
        return {
          success: false,
          error: `Không thể khôi phục sản phẩm: ${error.message}`
        }
      }

      console.log('✅ Product restored successfully:', data)

      return {
        success: true,
        fabric: data && data.length > 0 ? convertDatabaseToApp(data[0]) : undefined
      }
    } catch (error) {
      console.error('❌ Exception restoring product:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      return {
        success: false,
        error: `Lỗi khôi phục sản phẩm: ${errorMessage}`
      }
    }
  }

  /**
   * Get fabric statistics including hidden and priced items
   */
  async getFabricStats(): Promise<{
    total: number
    visible: number
    hidden: number
    withPrice: number
    withoutPrice: number
    deleted: number
  }> {
    try {
      const { data, error } = await supabase
        .from('fabrics')
        .select('id, is_hidden, price, is_deleted')

      if (error) {
        console.error('❌ Error getting fabric stats:', error)
        return { total: 0, visible: 0, hidden: 0, withPrice: 0, withoutPrice: 0, deleted: 0 }
      }

      const total = data.length
      const deleted = data.filter(f => f.is_deleted).length
      const active = data.filter(f => !f.is_deleted)
      const hidden = active.filter(f => f.is_hidden).length
      const visible = active.length - hidden
      const withPrice = active.filter(f => f.price !== null && f.price !== undefined).length
      const withoutPrice = active.length - withPrice

      return {
        total,
        visible,
        hidden,
        withPrice,
        withoutPrice,
        deleted
      }
    } catch (error) {
      console.error('❌ Exception getting fabric stats:', error)
      return { total: 0, visible: 0, hidden: 0, withPrice: 0, withoutPrice: 0, deleted: 0 }
    }
  }
}

export const fabricUpdateService = FabricUpdateService.getInstance()
