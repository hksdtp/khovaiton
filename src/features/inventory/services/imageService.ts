/**
 * Image Service - CHỈ SỬ DỤNG CLOUDINARY
 * Ninh ơi, service này chỉ sử dụng ảnh thật từ Cloudinary
 * Đã loại bỏ static images và ảnh giả/mặc định
 */

import { cloudinaryService } from '@/services/cloudinaryService'
import { hasRealImage } from '@/data/fabricImageMapping'

export interface ImageMapping {
  fabricCode: string
  imagePath: string | null
  isAvailable: boolean
  source: 'cloudinary' | 'none'
}

/**
 * Get fabric image URL - CHỈ TỪ CLOUDINARY
 * Ninh ơi, chỉ trả về ảnh thật từ Cloudinary, không có fallback
 */
export function getFabricImageUrl(fabricCode: string): string | null {
  // Chỉ trả về URL nếu fabric code có ảnh thật trên Cloudinary
  if (!hasRealImage(fabricCode)) {
    return null
  }

  // Sử dụng Cloudinary service để tạo URL
  return cloudinaryService.getFabricImageUrl(fabricCode, {
    width: 800,
    quality: 80
  })
}

/**
 * Find image for fabric code - CHỈ CLOUDINARY
 * Ninh ơi, chỉ trả về ảnh thật từ Cloudinary
 */
export async function findFabricImage(fabricCode: string): Promise<string | null> {
  return getFabricImageUrl(fabricCode)
}

/**
 * Batch find images for multiple fabric codes - CHỈ CLOUDINARY
 * Ninh ơi, chỉ trả về ảnh thật từ Cloudinary
 */
export async function batchFindFabricImages(
  fabricCodes: string[]
): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>()

  fabricCodes.forEach(code => {
    const imageUrl = getFabricImageUrl(code)
    results.set(code, imageUrl)
  })

  return results
}

/**
 * Get image mapping report - CHỈ CLOUDINARY
 * Báo cáo tình trạng ảnh thật từ Cloudinary
 */
export async function getImageMappingReport(
  fabricCodes: string[]
): Promise<{
  total: number
  withImages: number
  withoutImages: number
  mappings: ImageMapping[]
}> {
  const mappings: ImageMapping[] = fabricCodes.map(code => {
    const imageUrl = getFabricImageUrl(code)
    return {
      fabricCode: code,
      imagePath: imageUrl,
      isAvailable: !!imageUrl,
      source: imageUrl ? 'cloudinary' as const : 'none' as const
    }
  })

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
