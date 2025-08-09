import { Fabric, FabricFilters } from '../types'

/**
 * Marketing-specific filters that ensure only customer-ready products are shown
 */
export function getMarketingFilters(): FabricFilters {
  return {
    // Never show hidden products on marketing page
    showHidden: false,
    
    // Only show products with good status
    status: 'all', // We'll filter manually for better control
    
    // Prefer products with images for better presentation
    imageStatus: 'all'
  }
}

/**
 * Apply marketing-specific filtering logic
 * This ensures the marketing page only shows products suitable for customers
 */
export function filterFabricsForMarketing(fabrics: Fabric[]): Fabric[] {
  return fabrics.filter(fabric => {
    // 1. Never show hidden products
    if (fabric.isHidden) {
      return false
    }
    
    // 2. Only show products with good availability status
    if (fabric.status === 'out_of_stock' || fabric.status === 'expired') {
      return false
    }
    
    // 3. Show damaged products but with lower priority (handled in sorting)
    // We don't filter them out completely as they might still be sellable
    
    // 4. Must have some quantity available
    if (!fabric.quantity || fabric.quantity <= 0) {
      return false
    }
    
    return true
  })
}

/**
 * Sort fabrics for marketing display
 * Prioritizes products that are most suitable for customers
 */
export function sortFabricsForMarketing(fabrics: Fabric[]): Fabric[] {
  return [...fabrics].sort((a, b) => {
    // 1. Products with prices come first
    const aHasPrice = a.price && a.price > 0
    const bHasPrice = b.price && b.price > 0
    
    if (aHasPrice && !bHasPrice) return -1
    if (!aHasPrice && bHasPrice) return 1
    
    // 2. Products with images come first
    const aHasImage = !!a.image
    const bHasImage = !!b.image
    
    if (aHasImage && !bHasImage) return -1
    if (!aHasImage && bHasImage) return 1
    
    // 3. Status priority (available > low_stock > damaged)
    const statusPriority = {
      'available': 1,
      'low_stock': 2,
      'damaged': 3,
      'out_of_stock': 4,
      'expired': 5
    }
    
    const aPriority = statusPriority[a.status] || 999
    const bPriority = statusPriority[b.status] || 999
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority
    }
    
    // 4. Higher quantity comes first
    const aQty = a.quantity || 0
    const bQty = b.quantity || 0
    
    if (aQty !== bQty) {
      return bQty - aQty
    }
    
    // 5. Alphabetical by name
    return a.name.localeCompare(b.name, 'vi', { numeric: true })
  })
}

/**
 * Check if current page is marketing page
 */
export function isMarketingPage(pathname: string): boolean {
  return pathname === '/marketing' || pathname.startsWith('/marketing/')
}

/**
 * Get appropriate filters based on current page context
 */
export function getContextualFilters(pathname: string, baseFilters: FabricFilters): FabricFilters {
  if (isMarketingPage(pathname)) {
    return {
      ...baseFilters,
      ...getMarketingFilters()
    }
  }
  
  // For sales/inventory pages, use filters as-is
  return baseFilters
}
