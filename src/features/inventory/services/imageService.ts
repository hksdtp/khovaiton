/**
 * Image Service - Tự động map ảnh vải dựa trên mã hàng
 * Ninh ơi, service này sẽ tự động tìm và load ảnh cho từng loại vải
 * Updated: Ưu tiên Cloudinary, fallback static images
 */

import { syncService } from '@/services/syncService'

export interface ImageMapping {
  fabricCode: string
  imagePath: string | null
  isAvailable: boolean
}

/**
 * Supported image formats
 */
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.webp'] as const

/**
 * Base path for fabric images
 */
const FABRIC_IMAGES_BASE_PATH = '/images/fabrics'

/**
 * Normalize fabric code for file matching
 * Loại bỏ ký tự đặc biệt, chuẩn hóa tên file
 */
function normalizeFabricCode(code: string): string {
  return code
    .trim()
    .replace(/[<>:"/\\|?*]/g, '_') // Replace invalid filename chars
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
}

/**
 * Generate possible image paths for a fabric code
 */
function generateImagePaths(fabricCode: string): string[] {
  const normalizedCode = normalizeFabricCode(fabricCode)
  const paths: string[] = []
  
  // Try different formats
  SUPPORTED_FORMATS.forEach(format => {
    paths.push(`${FABRIC_IMAGES_BASE_PATH}/${normalizedCode}${format}`)
    paths.push(`${FABRIC_IMAGES_BASE_PATH}/${fabricCode}${format}`) // Original name
  })
  
  return paths
}

/**
 * Check if image exists at given path
 */
async function checkImageExists(imagePath: string): Promise<boolean> {
  try {
    const response = await fetch(imagePath, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Find image for fabric code
 * Tự động tìm ảnh dựa trên mã vải
 * Priority: Cloudinary > Static > null
 */
export async function findFabricImage(fabricCode: string): Promise<string | null> {
  if (!fabricCode) return null

  // Use sync service for Cloudinary-first approach
  const imageUrl = await syncService.getImageUrl(fabricCode)
  if (imageUrl) {
    return imageUrl
  }

  // Fallback to original logic for static images
  const possiblePaths = generateImagePaths(fabricCode)

  // Check each possible path
  for (const path of possiblePaths) {
    const exists = await checkImageExists(path)
    if (exists) {
      return path
    }
  }

  return null
}

/**
 * Batch find images for multiple fabric codes
 * Tối ưu cho việc load nhiều ảnh cùng lúc
 * Uses sync service for Cloudinary-first approach
 */
export async function batchFindFabricImages(
  fabricCodes: string[]
): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>()

  // Process in batches to avoid overwhelming the server
  const BATCH_SIZE = 10

  for (let i = 0; i < fabricCodes.length; i += BATCH_SIZE) {
    const batch = fabricCodes.slice(i, i + BATCH_SIZE)

    const batchPromises = batch.map(async (code) => {
      // Use sync service for Cloudinary-first approach
      const imagePath = await syncService.getImageUrl(code)
      return { code, imagePath }
    })

    const batchResults = await Promise.all(batchPromises)

    batchResults.forEach(({ code, imagePath }) => {
      results.set(code, imagePath)
    })
  }

  return results
}

/**
 * Get image mapping report
 * Báo cáo tình trạng ảnh cho admin
 */
export async function getImageMappingReport(
  fabricCodes: string[]
): Promise<{
  total: number
  withImages: number
  withoutImages: number
  mappings: ImageMapping[]
}> {
  const imageMap = await batchFindFabricImages(fabricCodes)
  
  const mappings: ImageMapping[] = fabricCodes.map(code => ({
    fabricCode: code,
    imagePath: imageMap.get(code) || null,
    isAvailable: !!imageMap.get(code)
  }))
  
  const withImages = mappings.filter(m => m.isAvailable).length
  const withoutImages = mappings.length - withImages
  
  return {
    total: mappings.length,
    withImages,
    withoutImages,
    mappings
  }
}

/**
 * Preload images for better performance
 * Cache ảnh để load nhanh hơn
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

/**
 * Batch preload images
 */
export async function batchPreloadImages(imagePaths: string[]): Promise<void> {
  const BATCH_SIZE = 5 // Limit concurrent image loads
  
  for (let i = 0; i < imagePaths.length; i += BATCH_SIZE) {
    const batch = imagePaths.slice(i, i + BATCH_SIZE)
    await Promise.allSettled(batch.map(preloadImage))
  }
}
