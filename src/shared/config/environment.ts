/**
 * Environment Configuration
 * Ninh ơi, file này quản lý tất cả environment variables
 */

export interface EnvironmentConfig {
  // App
  appEnv: 'development' | 'production' | 'test'
  appName: string
  appVersion: string

  // API
  api: {
    baseUrl: string
    timeout: number
  }

  // Features
  features: {
    batchImport: boolean
    analytics: boolean
  }
  
  // Performance
  performance: {
    imageCacheTtl: number
    maxImageSize: number
  }
  
  // Security
  security: {
    enableCsp: boolean
    allowedOrigins: string[]
  }
}

/**
 * Get environment variable with fallback
 */
function getEnvVar(key: string, fallback: string = ''): string {
  try {
    return import.meta.env[key] || fallback
  } catch (error) {
    console.warn(`Failed to get env var ${key}:`, error)
    return fallback
  }
}

/**
 * Get boolean environment variable
 */
function getBooleanEnvVar(key: string, fallback: boolean = false): boolean {
  const value = getEnvVar(key)
  if (!value) return fallback
  return value.toLowerCase() === 'true'
}

/**
 * Get number environment variable
 */
function getNumberEnvVar(key: string, fallback: number = 0): number {
  const value = getEnvVar(key)
  if (!value) return fallback
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? fallback : parsed
}

/**
 * Environment configuration
 */
export const environment: EnvironmentConfig = {
  // App
  appEnv: (getEnvVar('VITE_APP_ENV', 'development') as any) || 'development',
  appName: getEnvVar('VITE_APP_NAME', 'Kho Vải Tôn'),
  appVersion: getEnvVar('VITE_APP_VERSION', '1.0.0'),

  // API
  api: {
    baseUrl: getEnvVar('VITE_API_BASE_URL', window.location.origin),
    timeout: getNumberEnvVar('VITE_API_TIMEOUT', 10000)
  },

  // Features
  features: {
    batchImport: getBooleanEnvVar('VITE_ENABLE_BATCH_IMPORT', true),
    analytics: getBooleanEnvVar('VITE_ENABLE_ANALYTICS', false)
  },
  
  // Performance
  performance: {
    imageCacheTtl: getNumberEnvVar('VITE_IMAGE_CACHE_TTL', 3600),
    maxImageSize: getNumberEnvVar('VITE_MAX_IMAGE_SIZE', 10485760) // 10MB
  },
  
  // Security
  security: {
    enableCsp: getBooleanEnvVar('VITE_ENABLE_CSP', true),
    allowedOrigins: getEnvVar('VITE_ALLOWED_ORIGINS', '').split(',').filter(Boolean)
  }
}

/**
 * Validate environment configuration
 */
export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Check app configuration
  if (!environment.appName) {
    errors.push('App name is required')
  }
  
  // Check API configuration
  if (!environment.api.baseUrl) {
    errors.push('VITE_API_BASE_URL is required')
  }
  
  // Check performance limits
  if (environment.performance.maxImageSize < 1024) {
    errors.push('VITE_MAX_IMAGE_SIZE should be at least 1KB')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Get environment info for debugging
 */
export function getEnvironmentInfo(): Record<string, any> {
  return {
    appEnv: environment.appEnv,
    appName: environment.appName,
    appVersion: environment.appVersion,
    features: environment.features,

    buildTime: new Date().toISOString()
  }
}

/**
 * Check if running in development
 */
export const isDevelopment = environment.appEnv === 'development'

/**
 * Check if running in production
 */
export const isProduction = environment.appEnv === 'production'

/**
 * Check if app is properly configured
 */
export const isAppConfigured = !!(
  environment.appName &&
  environment.api.baseUrl
)

/**
 * Log environment info on startup
 */
if (isDevelopment) {
  console.log('🔧 Environment Info:', getEnvironmentInfo())
  
  const validation = validateEnvironment()
  if (!validation.valid) {
    console.warn('⚠️ Environment validation errors:', validation.errors)
  }
}
