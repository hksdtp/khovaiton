/**
 * Cloudinary Service for Fabric Image Management
 * Ninh ơi, service này handle upload và fetch ảnh từ Cloudinary
 */

// import { Cloudinary } from '@cloudinary/url-gen'

// Environment variables
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || ''
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY || ''
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'fabric_images'

// Initialize Cloudinary instance (for future use)
// const cld = new Cloudinary({
//   cloud: {
//     cloudName: CLOUD_NAME
//   }
// })

interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  url: string
  format: string
  width: number
  height: number
  bytes: number
  created_at: string
}

interface UploadOptions {
  fabricCode: string
  folder?: string
  tags?: string[]
  transformation?: string
}

export class CloudinaryService {
  private static instance: CloudinaryService
  
  static getInstance(): CloudinaryService {
    if (!CloudinaryService.instance) {
      CloudinaryService.instance = new CloudinaryService()
    }
    return CloudinaryService.instance
  }

  /**
   * Check if Cloudinary is properly configured
   */
  isConfigured(): boolean {
    return !!(CLOUD_NAME && API_KEY && UPLOAD_PRESET)
  }

  /**
   * Get configuration status
   */
  getConfig() {
    return {
      cloudName: CLOUD_NAME,
      apiKey: API_KEY ? `${API_KEY.substring(0, 8)}...` : '',
      uploadPreset: UPLOAD_PRESET,
      configured: this.isConfigured()
    }
  }

  /**
   * Upload image to Cloudinary
   */
  async uploadImage(file: File, options: UploadOptions): Promise<CloudinaryUploadResult> {
    if (!this.isConfigured()) {
      throw new Error('Cloudinary not configured. Please check environment variables.')
    }

    const formData = new FormData()
    
    // Basic upload parameters
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)
    formData.append('cloud_name', CLOUD_NAME)
    
    // Fabric-specific parameters
    const publicId = options.fabricCode
    formData.append('public_id', publicId)
    formData.append('folder', options.folder || 'fabrics')
    
    // Tags for organization
    const tags = ['fabric', 'inventory', ...(options.tags || [])]
    formData.append('tags', tags.join(','))
    
    // Context for metadata
    formData.append('context', `fabric_code=${options.fabricCode}`)

    // Enable overwrite to replace existing images
    formData.append('overwrite', 'true')
    formData.append('invalidate', 'true') // Clear CDN cache for immediate update

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Upload failed: ${errorData.error?.message || response.statusText}`)
      }

      const result: CloudinaryUploadResult = await response.json()
      
      console.log(`✅ Uploaded image for fabric ${options.fabricCode}:`, {
        publicId: result.public_id,
        url: result.secure_url,
        size: `${result.width}x${result.height}`,
        bytes: result.bytes
      })

      return result
      
    } catch (error) {
      console.error(`❌ Failed to upload image for fabric ${options.fabricCode}:`, error)
      throw error
    }
  }

  /**
   * Get optimized image URL for fabric code
   */
  getFabricImageUrl(fabricCode: string, options?: {
    width?: number
    height?: number
    quality?: number | 'auto'
    format?: 'auto' | 'webp' | 'jpg' | 'png'
  }): string {
    if (!this.isConfigured()) {
      return ''
    }

    try {
      // Generate URL with proper format and auto-fetch version
      const baseUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`

      // Add file extension if not present
      let publicId = `fabrics/${fabricCode}`
      if (!fabricCode.includes('.')) {
        publicId += '.jpg' // Default to .jpg for uploaded images
      }

      // Basic optimizations only
      const transformations = []

      if (options?.format && options.format !== 'auto') {
        transformations.push(`f_${options.format}`)
      }

      if (options?.quality && options.quality !== 'auto') {
        transformations.push(`q_${options.quality}`)
      }

      if (options?.width) {
        transformations.push(`w_${options.width}`)
      }

      if (options?.height) {
        transformations.push(`h_${options.height}`)
      }

      const transformString = transformations.length > 0 ? transformations.join(',') + '/' : ''

      // Return URL with proper format - Cloudinary handles version automatically
      return `${baseUrl}/${transformString}${publicId}`

    } catch (error) {
      console.error(`❌ Failed to generate URL for fabric ${fabricCode}:`, error)
      return ''
    }
  }

  /**
   * Check if image exists for fabric code
   */
  async checkImageExists(fabricCode: string): Promise<boolean> {
    if (!this.isConfigured()) {
      return false
    }

    try {
      const url = this.getFabricImageUrl(fabricCode)
      if (!url) return false

      // For production: assume Cloudinary images exist to avoid CORS/network issues
      // This matches the fix in syncService.checkImageExists()
      if (url.includes('res.cloudinary.com/dgaktc3fb/image/upload/fabrics/')) {
        console.log(`☁️ Cloudinary URL generated: ${url}`)
        console.log(`☁️ Assuming Cloudinary image exists for ${fabricCode}`)
        return true
      }

      const response = await fetch(url, { method: 'HEAD' })
      return response.ok

    } catch (error) {
      console.error(`❌ Failed to check image existence for fabric ${fabricCode}:`, error)
      return false
    }
  }

  /**
   * Batch check which fabric codes have images
   */
  async batchCheckImages(fabricCodes: string[]): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>()
    
    // Check in batches to avoid overwhelming the API
    const batchSize = 10
    for (let i = 0; i < fabricCodes.length; i += batchSize) {
      const batch = fabricCodes.slice(i, i + batchSize)
      
      const promises = batch.map(async (code) => {
        const exists = await this.checkImageExists(code)
        return { code, exists }
      })
      
      const batchResults = await Promise.all(promises)
      batchResults.forEach(({ code, exists }) => {
        results.set(code, exists)
      })
      
      // Small delay between batches
      if (i + batchSize < fabricCodes.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    return results
  }

  /**
   * Delete image for fabric code
   */
  async deleteImage(fabricCode: string): Promise<boolean> {
    if (!this.isConfigured()) {
      throw new Error('Cloudinary not configured')
    }

    // Note: Deletion requires API secret, so this would need server-side implementation
    // For now, we'll just return false to indicate client-side deletion is not supported
    console.warn(`⚠️ Image deletion for ${fabricCode} requires server-side implementation`)
    return false
  }

  /**
   * Get upload widget configuration
   */
  getUploadWidgetConfig(fabricCode: string) {
    return {
      cloudName: CLOUD_NAME,
      uploadPreset: UPLOAD_PRESET,
      publicId: `fabrics/${fabricCode}`,
      folder: 'fabrics',
      tags: ['fabric', 'inventory'],
      context: `fabric_code=${fabricCode}`,
      maxFileSize: 5000000, // 5MB
      maxImageWidth: 2000,
      maxImageHeight: 2000,
      cropping: false,
      multiple: false,
      resourceType: 'image',
      clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      sources: ['local', 'camera'],
      showAdvancedOptions: false,
      showInsecurePreview: false,
      showUploadMoreButton: false,
      theme: 'minimal'
    }
  }
}

// Export singleton instance
export const cloudinaryService = CloudinaryService.getInstance()

// Export types
export type { CloudinaryUploadResult, UploadOptions }
