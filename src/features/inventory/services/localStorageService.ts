/**
 * Local storage service for mock mode when database is not available
 */

interface FabricUpdate {
  id: number
  price?: number | null
  priceNote?: string
  isHidden?: boolean
  updatedAt: string
}

class LocalStorageService {
  private static instance: LocalStorageService
  private readonly STORAGE_KEY = 'khovaiton_fabric_updates'

  static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService()
    }
    return LocalStorageService.instance
  }

  /**
   * Get all fabric updates from localStorage
   */
  private getUpdates(): Record<number, FabricUpdate> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return {}
    }
  }

  /**
   * Save fabric updates to localStorage
   */
  private saveUpdates(updates: Record<number, FabricUpdate>): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updates))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  /**
   * Update fabric price in localStorage
   */
  updatePrice(fabricId: number, price: number | null, note?: string): void {
    const updates = this.getUpdates()
    updates[fabricId] = {
      ...updates[fabricId],
      id: fabricId,
      price,
      priceNote: note,
      updatedAt: new Date().toISOString()
    }
    this.saveUpdates(updates)
    console.log(`💾 Price updated in localStorage for fabric ${fabricId}`)
  }

  /**
   * Update fabric visibility in localStorage
   */
  updateVisibility(fabricId: number, isHidden: boolean): void {
    const updates = this.getUpdates()
    updates[fabricId] = {
      ...updates[fabricId],
      id: fabricId,
      isHidden,
      updatedAt: new Date().toISOString()
    }
    this.saveUpdates(updates)
    console.log(`💾 Visibility updated in localStorage for fabric ${fabricId}`)
  }

  /**
   * Get fabric update from localStorage
   */
  getFabricUpdate(fabricId: number): FabricUpdate | null {
    const updates = this.getUpdates()
    return updates[fabricId] || null
  }

  /**
   * Get all fabric updates
   */
  getAllUpdates(): Record<number, FabricUpdate> {
    return this.getUpdates()
  }

  /**
   * Clear all updates
   */
  clearUpdates(): void {
    localStorage.removeItem(this.STORAGE_KEY)
    console.log('💾 Cleared all fabric updates from localStorage')
  }

  /**
   * Apply updates to fabric data
   */
  applyUpdatesToFabric(fabric: any): any {
    const update = this.getFabricUpdate(fabric.id)
    if (!update) return fabric

    return {
      ...fabric,
      price: update.price !== undefined ? update.price : fabric.price,
      priceNote: update.priceNote !== undefined ? update.priceNote : fabric.priceNote,
      isHidden: update.isHidden !== undefined ? update.isHidden : fabric.isHidden,
      priceUpdatedAt: update.price !== undefined ? new Date(update.updatedAt) : fabric.priceUpdatedAt
    }
  }
}

export const localStorageService = LocalStorageService.getInstance()
