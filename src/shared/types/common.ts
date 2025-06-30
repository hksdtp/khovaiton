/**
 * Common types used across the application
 */

export interface BaseEntity {
  id: number
  createdAt?: Date
  updatedAt?: Date
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginationResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  code?: string
  details?: Record<string, unknown>
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}
