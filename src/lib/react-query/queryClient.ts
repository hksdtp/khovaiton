import { QueryClient } from '@tanstack/react-query'

/**
 * Create and configure React Query client
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache time: 10 minutes  
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times
      retry: 3,
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus in production
      refetchOnWindowFocus: process.env.NODE_ENV === 'production',
      // Don't refetch on reconnect by default
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
      // Retry delay for mutations
      retryDelay: 1000,
    },
  },
})

/**
 * Error handler for React Query
 */
export function handleQueryError(error: unknown) {
  console.error('Query error:', error)
  
  // You can add global error handling here
  // For example, show toast notifications, redirect to login, etc.
  
  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes('401')) {
      // Handle unauthorized errors
      console.warn('Unauthorized access detected')
    }
    
    if (error.message.includes('Network')) {
      // Handle network errors
      console.warn('Network error detected')
    }
  }
}
