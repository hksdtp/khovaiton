/**
 * Fix Failed Uploads Script
 * Ninh ơi, script này fix 2 files bị lỗi space
 */

import fs from 'fs'
import path from 'path'
import FormData from 'form-data'
import fetch from 'node-fetch'

// Cloudinary config
const CLOUD_NAME = 'dgaktc3fb'
const UPLOAD_PRESET = 'fabric_images'
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

// Failed files from previous upload
const FAILED_FILES = [
  {
    originalName: 'CAMVAL RBYY 210 .jpg',
    fabricCode: 'CAMVAL RBYY 210',
    reason: 'space at end'
  },
  {
    originalName: 'R700 - 19 .jpg', 
    fabricCode: 'R700 - 19',
    reason: 'space at end'
  }
]

// Source folder
const SOURCE_FOLDER = '/Users/nih/Downloads/vtt9'

/**
 * Find file in source folder (recursive)
 */
function findFileInFolder(fileName, folderPath) {
  try {
    const items = fs.readdirSync(folderPath)
    
    for (const item of items) {
      const itemPath = path.join(folderPath, item)
      const stat = fs.statSync(itemPath)
      
      if (stat.isDirectory()) {
        // Recursively search subdirectories
        const found = findFileInFolder(fileName, itemPath)
        if (found) return found
      } else if (item === fileName) {
        return itemPath
      }
    }
    
    return null
  } catch (error) {
    console.error(`Error searching in ${folderPath}:`, error.message)
    return null
  }
}

/**
 * Upload single image with fixed fabric code
 */
async function uploadFixedImage(filePath, originalFabricCode, fixedFabricCode) {
  try {
    console.log(`🔧 Fixing upload: ${originalFabricCode} → ${fixedFabricCode}`)
    console.log(`📁 File: ${filePath}`)

    const formData = new FormData()
    
    // Add file
    formData.append('file', fs.createReadStream(filePath))
    
    // Basic upload parameters
    formData.append('upload_preset', UPLOAD_PRESET)
    formData.append('cloud_name', CLOUD_NAME)
    
    // Fixed fabric code (trimmed)
    formData.append('public_id', fixedFabricCode)
    formData.append('folder', 'fabrics')
    
    // Tags for organization
    formData.append('tags', 'fabric,inventory,fixed_upload')
    
    // Context for metadata
    formData.append('context', `fabric_code=${fixedFabricCode},original_code=${originalFabricCode}`)

    const response = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Upload failed: ${errorData.error?.message || response.statusText}`)
    }

    const result = await response.json()
    
    console.log(`✅ Successfully fixed and uploaded: ${fixedFabricCode}`)
    console.log(`   URL: ${result.secure_url}`)
    console.log(`   Size: ${result.width}x${result.height}`)
    console.log(`   Bytes: ${result.bytes}`)
    
    return {
      success: true,
      originalFabricCode,
      fixedFabricCode,
      result
    }

  } catch (error) {
    console.error(`❌ Failed to fix upload ${originalFabricCode}:`, error.message)
    return {
      success: false,
      originalFabricCode,
      fixedFabricCode,
      error: error.message
    }
  }
}

/**
 * Test if fixed upload is accessible
 */
async function testFixedUpload(fabricCode) {
  try {
    const encodedCode = encodeURIComponent(fabricCode)
    const url = `https://res.cloudinary.com/dgaktc3fb/image/upload/fabrics/${encodedCode}`
    
    console.log(`🧪 Testing fixed upload: ${fabricCode}`)
    console.log(`   URL: ${url}`)
    
    const response = await fetch(url, { method: 'HEAD' })
    
    if (response.ok) {
      console.log(`   ✅ ACCESSIBLE - Status: ${response.status}`)
      return true
    } else {
      console.log(`   ❌ NOT ACCESSIBLE - Status: ${response.status}`)
      return false
    }
    
  } catch (error) {
    console.log(`   💥 ERROR: ${error.message}`)
    return false
  }
}

/**
 * Main fix function
 */
async function fixFailedUploads() {
  console.log('🔧 FIXING FAILED UPLOADS')
  console.log('=' .repeat(50))
  console.log(`📁 Source folder: ${SOURCE_FOLDER}`)
  console.log(`🎯 Files to fix: ${FAILED_FILES.length}`)
  console.log('')

  const results = {
    total: FAILED_FILES.length,
    fixed: 0,
    failed: 0,
    details: []
  }

  for (const failedFile of FAILED_FILES) {
    console.log(`[${results.details.length + 1}/${FAILED_FILES.length}] Processing: ${failedFile.originalName}`)
    console.log(`   Original code: "${failedFile.fabricCode}"`)
    console.log(`   Reason: ${failedFile.reason}`)
    
    // Find the file in source folder
    const filePath = findFileInFolder(failedFile.originalName, SOURCE_FOLDER)
    
    if (!filePath) {
      console.log(`   ❌ File not found in source folder`)
      results.failed++
      results.details.push({
        ...failedFile,
        success: false,
        error: 'File not found'
      })
      console.log('')
      continue
    }
    
    console.log(`   📁 Found: ${filePath}`)
    
    // Fix fabric code (trim spaces)
    const fixedFabricCode = failedFile.fabricCode.trim()
    console.log(`   Fixed code: "${fixedFabricCode}"`)
    
    // Upload with fixed code
    const uploadResult = await uploadFixedImage(filePath, failedFile.fabricCode, fixedFabricCode)
    results.details.push(uploadResult)
    
    if (uploadResult.success) {
      results.fixed++
      
      // Test accessibility
      console.log(`   🧪 Testing accessibility...`)
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait for Cloudinary processing
      const accessible = await testFixedUpload(fixedFabricCode)
      
      if (accessible) {
        console.log(`   🎉 Fix completed successfully!`)
      } else {
        console.log(`   ⚠️ Upload successful but not immediately accessible`)
      }
    } else {
      results.failed++
    }
    
    console.log('')
  }

  // Final summary
  console.log('=' .repeat(50))
  console.log('📊 FIX SUMMARY')
  console.log('=' .repeat(50))
  console.log(`Total files: ${results.total}`)
  console.log(`✅ Fixed: ${results.fixed}`)
  console.log(`❌ Failed: ${results.failed}`)
  console.log(`📈 Fix rate: ${((results.fixed / results.total) * 100).toFixed(1)}%`)
  
  if (results.fixed > 0) {
    console.log('')
    console.log('✅ SUCCESSFULLY FIXED:')
    results.details
      .filter(r => r.success)
      .forEach(r => {
        console.log(`   • "${r.originalFabricCode}" → "${r.fixedFabricCode}"`)
      })
  }

  if (results.failed > 0) {
    console.log('')
    console.log('❌ STILL FAILED:')
    results.details
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`   • ${r.originalFabricCode}: ${r.error}`)
      })
  }

  console.log('')
  console.log('🎉 Fix process completed!')
  console.log('🔗 Check results at: https://console.cloudinary.com/console/c-8bf0de9f08e89bff1bf9b6aa2cecd4d3/media_library/folders/fabrics')
  
  return results
}

// Run the fix
fixFailedUploads().catch(error => {
  console.error('💥 Fix process failed:', error)
  process.exit(1)
})

export { fixFailedUploads }
