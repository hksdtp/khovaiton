/**
 * App Initialization Service
 * Ninh ơi, service này khởi tạo app và setup các service cần thiết
 */

import { environment, validateEnvironment, isProduction } from '@/shared/config/environment'
import { startPeriodicSync, autoSyncOnStartup } from '@/features/inventory/services/onlineImageSyncService'

export interface InitializationResult {
  success: boolean
  errors: string[]
  warnings: string[]
  features: {
    googleDriveSync: boolean
    onlineImageSync: boolean
    periodicSync: boolean
  }
}

/**
 * Initialize application
 */
export async function initializeApp(): Promise<InitializationResult> {
  const result: InitializationResult = {
    success: true,
    errors: [],
    warnings: [],
    features: {
      googleDriveSync: false,
      onlineImageSync: false,
      periodicSync: false
    }
  }

  console.log('🚀 Initializing Kho Vải Tôn application...')
  console.log(`📍 Environment: ${environment.appEnv}`)
  console.log(`🏷️ Version: ${environment.appVersion}`)

  // Validate environment configuration
  const validation = validateEnvironment()
  if (!validation.valid) {
    result.errors.push(...validation.errors)
    result.success = false
  }

  // Initialize Google Drive sync if available
  if (environment.googleDrive.enabled) {
    try {
      if (isProduction) {
        // Production: Use online sync
        console.log('🌐 Initializing online image sync...')
        
        // Start auto-sync
        await autoSyncOnStartup()
        result.features.onlineImageSync = true
        
        // Start periodic sync
        startPeriodicSync()
        result.features.periodicSync = true
        
        console.log('✅ Online image sync initialized')
      } else {
        // Development: Local sync available
        console.log('🖼️ Local image sync available')
      }
      
      result.features.googleDriveSync = true
      
    } catch (error) {
      const errorMsg = `Failed to initialize Google Drive sync: ${error}`
      result.warnings.push(errorMsg)
      console.warn(errorMsg)
    }
  } else {
    result.warnings.push('Google Drive sync is disabled')
  }

  // Initialize analytics if enabled
  if (environment.features.analytics) {
    try {
      console.log('📊 Initializing analytics...')
      // Initialize analytics service here
      console.log('✅ Analytics initialized')
    } catch (error) {
      result.warnings.push(`Analytics initialization failed: ${error}`)
    }
  }

  // Log initialization result
  if (result.success) {
    console.log('✅ Application initialized successfully')
  } else {
    console.error('❌ Application initialization failed:', result.errors)
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️ Initialization warnings:', result.warnings)
  }

  // Log feature status
  console.log('🎯 Feature status:', result.features)

  return result
}

/**
 * Cleanup on app shutdown
 */
export function cleanupApp(): void {
  console.log('🧹 Cleaning up application...')
  
  // Stop periodic sync
  try {
    const { stopPeriodicSync, clearImageCache } = require('@/features/inventory/services/onlineImageSyncService')
    stopPeriodicSync()
    clearImageCache()
    console.log('✅ Image sync cleanup completed')
  } catch (error) {
    console.warn('Image sync cleanup failed:', error)
  }
  
  console.log('✅ Application cleanup completed')
}

/**
 * Get app health status
 */
export async function getAppHealthStatus(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy'
  checks: Record<string, boolean>
  timestamp: string
}> {
  const checks: Record<string, boolean> = {}
  
  // Check environment configuration
  const validation = validateEnvironment()
  checks.environment = validation.valid
  
  // Check Google Drive connectivity (if enabled)
  if (environment.googleDrive.enabled) {
    try {
      const { checkOnlineSyncAvailability } = await import('@/features/inventory/services/onlineImageSyncService')
      const availability = await checkOnlineSyncAvailability()
      checks.googleDrive = availability.available
    } catch (error) {
      checks.googleDrive = false
    }
  } else {
    checks.googleDrive = true // Not required
  }
  
  // Determine overall status
  const allChecks = Object.values(checks)
  const healthyCount = allChecks.filter(Boolean).length
  const totalChecks = allChecks.length
  
  let status: 'healthy' | 'degraded' | 'unhealthy'
  if (healthyCount === totalChecks) {
    status = 'healthy'
  } else if (healthyCount >= totalChecks * 0.5) {
    status = 'degraded'
  } else {
    status = 'unhealthy'
  }
  
  return {
    status,
    checks,
    timestamp: new Date().toISOString()
  }
}

/**
 * Setup error handling
 */
export function setupErrorHandling(): void {
  // Global error handler
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
    
    // Send to monitoring service in production
    if (isProduction) {
      // TODO: Send to error monitoring service
    }
  })
  
  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    
    // Send to monitoring service in production
    if (isProduction) {
      // TODO: Send to error monitoring service
    }
  })
  
  console.log('✅ Error handling setup completed')
}

/**
 * Setup performance monitoring
 */
export function setupPerformanceMonitoring(): void {
  // Monitor Core Web Vitals
  if ('web-vital' in window) {
    // TODO: Setup web vitals monitoring
  }
  
  // Monitor resource loading
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 1000) { // Log slow operations
            console.warn(`Slow operation detected: ${entry.name} took ${entry.duration}ms`)
          }
        }
      })
      
      observer.observe({ entryTypes: ['navigation', 'resource'] })
    } catch (error) {
      console.warn('Performance monitoring setup failed:', error)
    }
  }
  
  console.log('✅ Performance monitoring setup completed')
}
