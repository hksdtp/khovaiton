import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { FabricFilters, FabricSortOptions, Fabric } from '../types'

// URL params utilities
const updateURLParams = (filters: FabricFilters, page: number, itemsPerPage: number) => {
  const params = new URLSearchParams()

  if (filters.search) params.set('search', filters.search)
  if (filters.type && filters.type !== 'all') params.set('type', filters.type)
  if (filters.location && filters.location !== 'all') params.set('location', filters.location)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.minQuantity) params.set('minQuantity', filters.minQuantity.toString())
  if (filters.maxQuantity) params.set('maxQuantity', filters.maxQuantity.toString())
  if (page > 1) params.set('page', page.toString())
  if (itemsPerPage !== 20) params.set('limit', itemsPerPage.toString())

  const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`
  window.history.replaceState({}, '', newURL)
}

const getFiltersFromURL = (): { filters: FabricFilters; page: number; itemsPerPage: number } => {
  const params = new URLSearchParams(window.location.search)

  const filters: FabricFilters = {
    search: params.get('search') || '',
    type: (params.get('type') as any) || 'all' as const,
    location: params.get('location') || 'all' as const,
    status: (params.get('status') as any) || 'all' as const,
  }

  const minQuantity = params.get('minQuantity')
  const maxQuantity = params.get('maxQuantity')

  if (minQuantity) filters.minQuantity = parseFloat(minQuantity)
  if (maxQuantity) filters.maxQuantity = parseFloat(maxQuantity)

  return {
    filters,
    page: parseInt(params.get('page') || '1'),
    itemsPerPage: parseInt(params.get('limit') || '20'),
  }
}

interface InventoryState {
  // Filters and search
  filters: FabricFilters
  sortOptions: FabricSortOptions
  searchTerm: string
  
  // UI state
  selectedFabric: Fabric | null
  isFilterOpen: boolean
  isUploadModalOpen: boolean
  uploadingForId: number | null
  
  // View preferences
  viewMode: 'grid' | 'list'
  itemsPerPage: number
  currentPage: number
  
  // Actions
  setFilters: (filters: Partial<FabricFilters>) => void
  setSortOptions: (sort: FabricSortOptions) => void
  setSearchTerm: (term: string) => void
  setSelectedFabric: (fabric: Fabric | null) => void
  setFilterOpen: (open: boolean) => void
  setUploadModal: (open: boolean, fabricId?: number) => void
  setViewMode: (mode: 'grid' | 'list') => void
  setItemsPerPage: (count: number) => void
  setCurrentPage: (page: number) => void
  resetFilters: () => void
}

// Initialize from URL params
const urlData = typeof window !== 'undefined' ? getFiltersFromURL() : {
  filters: { search: '', type: 'all' as const, location: 'all' as const, status: 'all' as const },
  page: 1,
  itemsPerPage: 20
}

const initialFilters: FabricFilters = urlData.filters

const initialSortOptions: FabricSortOptions = {
  field: 'updatedAt',
  direction: 'desc',
}

export const useInventoryStore = create<InventoryState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        filters: initialFilters,
        sortOptions: initialSortOptions,
        searchTerm: '',
        selectedFabric: null,
        isFilterOpen: false,
        isUploadModalOpen: false,
        uploadingForId: null,
        viewMode: 'grid',
        itemsPerPage: urlData.itemsPerPage,
        currentPage: urlData.page,

        // Actions
        setFilters: (newFilters) =>
          set((state) => {
            const updatedFilters = { ...state.filters, ...newFilters }
            const newPage = 1 // Reset to first page when filters change

            // Update URL params
            updateURLParams(updatedFilters, newPage, state.itemsPerPage)

            return {
              filters: updatedFilters,
              currentPage: newPage,
            }
          }),

        setSortOptions: (sort) =>
          set(() => ({
            sortOptions: sort,
            currentPage: 1,
          })),

        setSearchTerm: (term) =>
          set((state) => ({
            searchTerm: term,
            filters: { ...state.filters, search: term },
            currentPage: 1,
          })),

        setSelectedFabric: (fabric) =>
          set(() => ({
            selectedFabric: fabric,
          })),

        setFilterOpen: (open) =>
          set(() => ({
            isFilterOpen: open,
          })),

        setUploadModal: (open, fabricId) =>
          set(() => ({
            isUploadModalOpen: open,
            uploadingForId: fabricId || null,
          })),

        setViewMode: (mode) =>
          set(() => ({
            viewMode: mode,
          })),

        setItemsPerPage: (count) =>
          set((state) => {
            const newPage = 1

            // Update URL params
            updateURLParams(state.filters, newPage, count)

            return {
              itemsPerPage: count,
              currentPage: newPage,
            }
          }),

        setCurrentPage: (page) =>
          set((state) => {
            // Update URL params
            updateURLParams(state.filters, page, state.itemsPerPage)

            return {
              currentPage: page,
            }
          }),

        resetFilters: () =>
          set((state) => {
            const resetFilters = {
              search: '',
              type: 'all' as const,
              location: 'all' as const,
              status: 'all' as const,
            }
            const newPage = 1

            // Update URL params
            updateURLParams(resetFilters, newPage, state.itemsPerPage)

            return {
              filters: resetFilters,
              sortOptions: initialSortOptions,
              searchTerm: '',
              currentPage: newPage,
            }
          }),
      }),
      {
        name: 'inventory-store',
        partialize: (state) => ({
          filters: state.filters,
          sortOptions: state.sortOptions,
          viewMode: state.viewMode,
          itemsPerPage: state.itemsPerPage,
        }),
      }
    ),
    {
      name: 'inventory-store',
    }
  )
)

// Selectors for computed values
export const useInventorySelectors = () => {
  const store = useInventoryStore()
  
  return {
    // Get current pagination params
    getPaginationParams: () => ({
      page: store.currentPage,
      limit: store.itemsPerPage,
    }),
    
    // Check if any filters are active
    hasActiveFilters: () => {
      const { filters } = store
      return (
        filters.search !== '' ||
        filters.type !== 'all' ||
        filters.location !== 'all' ||
        filters.status !== 'all' ||
        filters.minQuantity !== undefined ||
        filters.maxQuantity !== undefined
      )
    },
    
    // Get filter summary for display
    getFilterSummary: () => {
      const { filters } = store
      const active = []
      
      if (filters.search) active.push(`Tìm kiếm: "${filters.search}"`)
      if (filters.type !== 'all') active.push(`Loại: ${filters.type}`)
      if (filters.location !== 'all') active.push(`Vị trí: ${filters.location}`)
      if (filters.status !== 'all') active.push(`Trạng thái: ${filters.status}`)
      
      return active
    },
  }
}
