import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { localStorageService } from './localStorageService'
import { Fabric } from '../types'

export interface FabricUpdateResult {
  success: boolean
  error?: string
  fabric?: Fabric
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

      const updateData: any = {
        price,
        price_note: note || null,
        price_updated_at: price ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('fabrics')
        .update(updateData)
        .eq('id', fabricId)
        .select()
        .single()

      if (error) {
        console.error('❌ Supabase error updating price:', error)
        return {
          success: false,
          error: `Không thể cập nhật giá: ${error.message}`
        }
      }

      console.log('✅ Price updated successfully:', data)

      // Convert database format to app format
      const updatedFabric: Fabric = {
        ...data,
        price: data.price,
        priceNote: data.price_note,
        priceUpdatedAt: data.price_updated_at ? new Date(data.price_updated_at) : undefined,
        isHidden: data.is_hidden || false,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }

      return {
        success: true,
        fabric: updatedFabric
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
        .single()

      if (error) {
        console.error('❌ Supabase error updating visibility:', error)
        return {
          success: false,
          error: `Không thể cập nhật trạng thái hiển thị: ${error.message}`
        }
      }

      console.log('✅ Visibility updated successfully:', data)

      // Convert database format to app format
      const updatedFabric: Fabric = {
        ...data,
        price: data.price,
        priceNote: data.price_note,
        priceUpdatedAt: data.price_updated_at ? new Date(data.price_updated_at) : undefined,
        isHidden: data.is_hidden || false,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }

      return {
        success: true,
        fabric: updatedFabric
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
   * Get fabric statistics including hidden and priced items
   */
  async getFabricStats(): Promise<{
    total: number
    visible: number
    hidden: number
    withPrice: number
    withoutPrice: number
  }> {
    try {
      const { data, error } = await supabase
        .from('fabrics')
        .select('id, is_hidden, price')

      if (error) {
        console.error('❌ Error getting fabric stats:', error)
        return { total: 0, visible: 0, hidden: 0, withPrice: 0, withoutPrice: 0 }
      }

      const total = data.length
      const hidden = data.filter(f => f.is_hidden).length
      const visible = total - hidden
      const withPrice = data.filter(f => f.price !== null && f.price !== undefined).length
      const withoutPrice = total - withPrice

      return {
        total,
        visible,
        hidden,
        withPrice,
        withoutPrice
      }
    } catch (error) {
      console.error('❌ Exception getting fabric stats:', error)
      return { total: 0, visible: 0, hidden: 0, withPrice: 0, withoutPrice: 0 }
    }
  }
}

export const fabricUpdateService = FabricUpdateService.getInstance()
