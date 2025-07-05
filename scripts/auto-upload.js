/**
 * Auto Upload Script for Fabric Images
 * Ninh ơi, script này tự động upload tất cả ảnh từ folder lên Cloudinary
 */

import fs from 'fs'
import path from 'path'
import FormData from 'form-data'
import fetch from 'node-fetch'

// Cloudinary config
const CLOUD_NAME = 'dgaktc3fb'
const UPLOAD_PRESET = 'fabric_images'
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

// Source folder
const SOURCE_FOLDER = '/Users/nih/Downloads/vtt9'

// Supported image formats
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.webp', '.heic']

/**
 * Extract fabric code from filename
 */
function extractFabricCode(fileName) {
  // Remove file extension and trim whitespace
  const nameWithoutExt = fileName.replace(/\.(jpg|jpeg|png|webp|heic)$/i, '')
  return nameWithoutExt.trim()
}

/**
 * Check if file is an image
 */
function isImageFile(fileName) {
  const ext = path.extname(fileName).toLowerCase()
  return SUPPORTED_FORMATS.includes(ext)
}

/**
 * Upload single image to Cloudinary
 */
async function uploadImage(filePath, fabricCode) {
  try {
    console.log(`🚀 Uploading ${fabricCode}...`)

    const formData = new FormData()
    
    // Add file
    formData.append('file', fs.createReadStream(filePath))
    
    // Basic upload parameters
    formData.append('upload_preset', UPLOAD_PRESET)
    formData.append('cloud_name', CLOUD_NAME)
    
    // Fabric-specific parameters
    formData.append('public_id', fabricCode)
    formData.append('folder', 'fabrics')
    
    // Tags for organization
    formData.append('tags', 'fabric,inventory,auto_upload')
    
    // Context for metadata
    formData.append('context', `fabric_code=${fabricCode}`)

    const response = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Upload failed: ${errorData.error?.message || response.statusText}`)
    }

    const result = await response.json()
    
    console.log(`✅ Successfully uploaded ${fabricCode}`)
    console.log(`   URL: ${result.secure_url}`)
    console.log(`   Size: ${result.width}x${result.height}`)
    console.log(`   Bytes: ${result.bytes}`)
    
    return {
      success: true,
      fabricCode,
      result
    }

  } catch (error) {
    console.error(`❌ Failed to upload ${fabricCode}:`, error.message)
    return {
      success: false,
      fabricCode,
      error: error.message
    }
  }
}

/**
 * Get all image files from source folder (recursive)
 */
function getImageFiles(folderPath) {
  const imageFiles = []

  function scanDirectory(dirPath) {
    try {
      const items = fs.readdirSync(dirPath)

      for (const item of items) {
        const itemPath = path.join(dirPath, item)
        const stat = fs.statSync(itemPath)

        if (stat.isDirectory()) {
          // Recursively scan subdirectories
          scanDirectory(itemPath)
        } else if (stat.isFile() && isImageFile(item)) {
          imageFiles.push({
            fileName: item,
            filePath: itemPath,
            fabricCode: extractFabricCode(item)
          })
        }
      }
    } catch (error) {
      console.error(`❌ Error reading directory ${dirPath}:`, error.message)
    }
  }

  scanDirectory(folderPath)
  return imageFiles
}

/**
 * Main upload function
 */
async function autoUpload() {
  console.log('🎯 Starting Auto Upload Process')
  console.log(`📁 Source folder: ${SOURCE_FOLDER}`)
  console.log(`☁️  Target: Cloudinary (${CLOUD_NAME})`)
  console.log('=' .repeat(50))

  // Check if source folder exists
  if (!fs.existsSync(SOURCE_FOLDER)) {
    console.error(`❌ Source folder not found: ${SOURCE_FOLDER}`)
    process.exit(1)
  }

  // Get all image files
  const imageFiles = getImageFiles(SOURCE_FOLDER)
  
  if (imageFiles.length === 0) {
    console.log('❌ No image files found in source folder')
    process.exit(0)
  }

  console.log(`📸 Found ${imageFiles.length} image files`)
  console.log('')

  // Upload results tracking
  const results = {
    total: imageFiles.length,
    success: 0,
    failed: 0,
    details: []
  }

  // Upload each file
  for (let i = 0; i < imageFiles.length; i++) {
    const { fileName, filePath, fabricCode } = imageFiles[i]
    
    console.log(`[${i + 1}/${imageFiles.length}] Processing: ${fileName}`)
    console.log(`   Fabric Code: ${fabricCode}`)
    
    const result = await uploadImage(filePath, fabricCode)
    results.details.push(result)
    
    if (result.success) {
      results.success++
    } else {
      results.failed++
    }

    // Small delay between uploads to avoid rate limiting
    if (i < imageFiles.length - 1) {
      console.log('   ⏳ Waiting 1 second...')
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    console.log('')
  }

  // Final summary
  console.log('=' .repeat(50))
  console.log('📊 UPLOAD SUMMARY')
  console.log('=' .repeat(50))
  console.log(`Total files: ${results.total}`)
  console.log(`✅ Successful: ${results.success}`)
  console.log(`❌ Failed: ${results.failed}`)
  console.log(`📈 Success rate: ${((results.success / results.total) * 100).toFixed(1)}%`)
  
  if (results.failed > 0) {
    console.log('')
    console.log('❌ FAILED UPLOADS:')
    results.details
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`   • ${r.fabricCode}: ${r.error}`)
      })
  }

  console.log('')
  console.log('🎉 Auto upload completed!')
  console.log('🔗 Check results at: https://console.cloudinary.com/console/c-8bf0de9f08e89bff1bf9b6aa2cecd4d3/media_library/folders/fabrics')
}

// Run the auto upload
autoUpload().catch(error => {
  console.error('💥 Auto upload failed:', error)
  process.exit(1)
})

export { autoUpload, uploadImage, getImageFiles }
