/**
 * Online Image Sync Service
 * Ninh ơi, service này sync ảnh từ Google Drive cho production
 */

import {
  getAllDriveFiles,
  filterImageFiles,
  downloadFileBlob,
  checkFolderAccess,
  getFolderInfo
} from './googleDriveApiService'
// import type { DriveApiFile } from './googleDriveApiService'
import { environment } from '@/shared/config/environment'

export interface OnlineSyncResult {
  success: boolean
  message: string
  totalFiles: number
  processedFiles: number
  successCount: number
  errorCount: number
  errors: string[]
  syncedImages: SyncedImage[]
}

export interface SyncedImage {
  fabricCode: string
  fileName: string
  driveFileId: string
  imageUrl: string
  size: number
  lastModified: string
}

export interface SyncProgress {
  current: number
  total: number
  fileName: string
  status: 'downloading' | 'processing' | 'caching' | 'complete'
}

/**
 * Cache for synced images
 */
const imageCache = new Map<string, string>()
const syncedImagesStore = new Map<string, SyncedImage>()

/**
 * Extract fabric code from filename
 */
function extractFabricCodeFromFilename(filename: string): string {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')
  
  // Clean up common prefixes/suffixes
  return nameWithoutExt
    .replace(/^(vai|fabric)[-_\s]*/i, '')
    .replace(/[-_\s]*(image|img|photo)$/i, '')
    .trim()
}

/**
 * Create blob URL for image
 */
function createImageUrl(blob: Blob): string {
  return URL.createObjectURL(blob)
}

/**
 * Cache image with fabric code
 */
function cacheImage(fabricCode: string, imageUrl: string): void {
  // Revoke old URL if exists
  const oldUrl = imageCache.get(fabricCode)
  if (oldUrl) {
    URL.revokeObjectURL(oldUrl)
  }
  
  imageCache.set(fabricCode, imageUrl)
}

/**
 * Get cached image URL
 */
export function getCachedImageUrl(fabricCode: string): string | null {
  return imageCache.get(fabricCode) || null
}

/**
 * Check if Google Drive is configured and accessible
 */
export async function checkOnlineSyncAvailability(): Promise<{
  available: boolean
  reason?: string
}> {
  // Check environment configuration
  if (!environment.googleDrive.enabled) {
    return { available: false, reason: 'Google Drive sync is disabled' }
  }
  
  if (!environment.googleDrive.apiKey) {
    return { available: false, reason: 'Google Drive API key not configured' }
  }
  
  if (!environment.googleDrive.folderId) {
    return { available: false, reason: 'Google Drive folder ID not configured' }
  }
  
  // Check folder access
  try {
    const hasAccess = await checkFolderAccess()
    if (!hasAccess) {
      return { available: false, reason: 'Cannot access Google Drive folder' }
    }
  } catch (error) {
    return { available: false, reason: `Drive access error: ${error}` }
  }
  
  return { available: true }
}

/**
 * Get sync statistics
 */
export async function getSyncStatistics(): Promise<{
  totalDriveFiles: number
  totalImageFiles: number
  cachedImages: number
  folderInfo: Awaited<ReturnType<typeof getFolderInfo>>
}> {
  const folderInfo = await getFolderInfo()
  const allFiles = await getAllDriveFiles()
  const imageFiles = filterImageFiles(allFiles)
  
  return {
    totalDriveFiles: allFiles.length,
    totalImageFiles: imageFiles.length,
    cachedImages: imageCache.size,
    folderInfo
  }
}

/**
 * Sync images from Google Drive
 */
export async function syncImagesFromDrive(
  onProgress?: (progress: SyncProgress) => void
): Promise<OnlineSyncResult> {
  const result: OnlineSyncResult = {
    success: false,
    message: '',
    totalFiles: 0,
    processedFiles: 0,
    successCount: 0,
    errorCount: 0,
    errors: [],
    syncedImages: []
  }
  
  try {
    // Check availability
    const availability = await checkOnlineSyncAvailability()
    if (!availability.available) {
      result.message = availability.reason || 'Sync not available'
      return result
    }
    
    // Get all image files from Drive
    onProgress?.({ current: 0, total: 0, fileName: 'Loading file list...', status: 'downloading' })
    
    const allFiles = await getAllDriveFiles()
    const imageFiles = filterImageFiles(allFiles)
    
    result.totalFiles = imageFiles.length
    
    if (imageFiles.length === 0) {
      result.message = 'No image files found in Google Drive folder'
      return result
    }
    
    // Process each image file
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      if (!file) continue

      result.processedFiles++

      try {
        // Update progress
        onProgress?.({
          current: i + 1,
          total: imageFiles.length,
          fileName: file.name,
          status: 'downloading'
        })
        
        // Extract fabric code
        const fabricCode = extractFabricCodeFromFilename(file.name)
        
        // Download image
        onProgress?.({
          current: i + 1,
          total: imageFiles.length,
          fileName: file.name,
          status: 'processing'
        })
        
        const blob = await downloadFileBlob(file)
        
        // Create image URL
        onProgress?.({
          current: i + 1,
          total: imageFiles.length,
          fileName: file.name,
          status: 'caching'
        })
        
        const imageUrl = createImageUrl(blob)
        
        // Cache image
        cacheImage(fabricCode, imageUrl)
        
        // Store sync info
        const syncedImage: SyncedImage = {
          fabricCode,
          fileName: file.name,
          driveFileId: file.id,
          imageUrl,
          size: parseInt(file.size || '0'),
          lastModified: file.modifiedTime
        }
        
        syncedImagesStore.set(fabricCode, syncedImage)
        result.syncedImages.push(syncedImage)
        result.successCount++
        
        onProgress?.({
          current: i + 1,
          total: imageFiles.length,
          fileName: file.name,
          status: 'complete'
        })
        
        console.log(`✅ Synced: ${file.name} → ${fabricCode}`)
        
      } catch (error) {
        result.errorCount++
        const errorMsg = `Failed to sync ${file.name}: ${error}`
        result.errors.push(errorMsg)
        console.error(errorMsg)
      }
    }
    
    // Generate result message
    if (result.successCount > 0) {
      result.success = true
      result.message = `Successfully synced ${result.successCount}/${result.totalFiles} images`
    } else {
      result.message = 'No images were synced successfully'
    }
    
    return result
    
  } catch (error) {
    result.message = `Sync failed: ${error}`
    result.errors.push(String(error))
    return result
  }
}

/**
 * Get synced image for fabric code
 */
export function getSyncedImage(fabricCode: string): SyncedImage | null {
  return syncedImagesStore.get(fabricCode) || null
}

/**
 * Get all synced images
 */
export function getAllSyncedImages(): SyncedImage[] {
  return Array.from(syncedImagesStore.values())
}

/**
 * Clear image cache
 */
export function clearImageCache(): void {
  // Revoke all blob URLs
  for (const url of imageCache.values()) {
    URL.revokeObjectURL(url)
  }
  
  imageCache.clear()
  syncedImagesStore.clear()
}

/**
 * Auto-sync on app startup
 */
export async function autoSyncOnStartup(): Promise<void> {
  if (!environment.features.realTimeSync) {
    return
  }
  
  try {
    const availability = await checkOnlineSyncAvailability()
    if (availability.available) {
      console.log('🔄 Starting auto-sync...')
      const result = await syncImagesFromDrive()
      console.log(`🔄 Auto-sync completed: ${result.successCount} images`)
    }
  } catch (error) {
    console.warn('Auto-sync failed:', error)
  }
}

/**
 * Periodic sync (every 30 minutes)
 */
let syncInterval: NodeJS.Timeout | null = null

export function startPeriodicSync(): void {
  if (syncInterval) {
    clearInterval(syncInterval)
  }
  
  syncInterval = setInterval(async () => {
    try {
      await autoSyncOnStartup()
    } catch (error) {
      console.warn('Periodic sync failed:', error)
    }
  }, 30 * 60 * 1000) // 30 minutes
}

export function stopPeriodicSync(): void {
  if (syncInterval) {
    clearInterval(syncInterval)
    syncInterval = null
  }
}
