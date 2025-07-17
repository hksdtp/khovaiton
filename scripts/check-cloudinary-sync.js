/**
 * Kiểm tra khả năng đồng bộ 2 chiều với Cloudinary
 * Ninh ơi, script này check ảnh đã upload và khả năng sync
 */

import https from 'https'
import crypto from 'crypto'

// Cloudinary config (cần API secret để gọi Admin API)
const CLOUD_NAME = 'dgaktc3fb'
const API_KEY = '917768158798778'
const API_SECRET = 'ZkCVC7alaaSgcnW5kVXYQbxL5uU' // Cần để gọi Admin API

/**
 * Tạo signature cho Cloudinary Admin API
 */
function generateSignature(params, apiSecret) {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&')
  
  return crypto
    .createHash('sha1')
    .update(sortedParams + apiSecret)
    .digest('hex')
}

/**
 * Gọi Cloudinary Admin API
 */
function callCloudinaryAPI(endpoint, params = {}) {
  return new Promise((resolve, reject) => {
    const timestamp = Math.round(Date.now() / 1000)
    const signatureParams = { ...params, timestamp, api_key: API_KEY }
    const signature = generateSignature(signatureParams, API_SECRET)
    
    const postData = new URLSearchParams({
      ...signatureParams,
      signature
    }).toString()
    
    const options = {
      hostname: 'api.cloudinary.com',
      port: 443,
      path: `/v1_1/${CLOUD_NAME}/${endpoint}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }
    
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => data += chunk)
      res.on('end', () => {
        try {
          resolve(JSON.parse(data))
        } catch (error) {
          reject(new Error(`Parse error: ${data}`))
        }
      })
    })
    
    req.on('error', reject)
    req.write(postData)
    req.end()
  })
}

/**
 * Kiểm tra ảnh đã upload
 */
async function checkUploadedImages() {
  console.log('🔍 Checking uploaded images...')
  
  const uploadedImages = [
    { fabricCode: '3 PASS BO - WHITE - COL 15', publicId: 'kxtnctannhobhvacgtqe' },
    { fabricCode: '33139-2-270', publicId: 'mfpxvks1qcxcrjac1roc' }
  ]
  
  for (const img of uploadedImages) {
    try {
      console.log(`\n📋 Checking ${img.fabricCode} (${img.publicId})...`)
      
      // Get resource details
      const result = await callCloudinaryAPI('resources/image/upload', {
        public_ids: img.publicId
      })
      
      if (result.resources && result.resources.length > 0) {
        const resource = result.resources[0]
        console.log(`✅ Found on Cloudinary:`)
        console.log(`   - Public ID: ${resource.public_id}`)
        console.log(`   - URL: ${resource.secure_url}`)
        console.log(`   - Size: ${resource.width}x${resource.height}`)
        console.log(`   - Bytes: ${resource.bytes}`)
        console.log(`   - Created: ${resource.created_at}`)
        console.log(`   - Tags: ${resource.tags?.join(', ') || 'None'}`)
      } else {
        console.log(`❌ Not found on Cloudinary`)
      }
    } catch (error) {
      console.error(`❌ Error checking ${img.fabricCode}:`, error.message)
    }
  }
}

/**
 * Tìm tất cả ảnh trong folder fabrics
 */
async function listAllFabricImages() {
  console.log('\n🔍 Listing all images in fabrics folder...')
  
  try {
    const result = await callCloudinaryAPI('resources/image/upload', {
      type: 'upload',
      prefix: 'fabrics/',
      max_results: 500
    })
    
    console.log(`📊 Found ${result.resources?.length || 0} images in fabrics folder:`)
    
    if (result.resources) {
      result.resources.forEach((resource, index) => {
        console.log(`${index + 1}. ${resource.public_id} (${resource.width}x${resource.height}, ${resource.bytes} bytes)`)
      })
    }
    
    return result.resources || []
  } catch (error) {
    console.error('❌ Error listing fabric images:', error.message)
    return []
  }
}

/**
 * Tìm ảnh không có trong mapping
 */
async function findUnmappedImages() {
  console.log('\n🔍 Finding unmapped images...')
  
  try {
    // Get all images (không chỉ trong folder fabrics)
    const result = await callCloudinaryAPI('resources/image/upload', {
      type: 'upload',
      max_results: 500
    })
    
    const knownPublicIds = new Set(['kxtnctannhobhvacgtqe', 'mfpxvks1qcxcrjac1roc'])
    const unmappedImages = []
    
    if (result.resources) {
      result.resources.forEach(resource => {
        if (!knownPublicIds.has(resource.public_id)) {
          unmappedImages.push(resource)
        }
      })
    }
    
    console.log(`📊 Found ${unmappedImages.length} unmapped images:`)
    unmappedImages.slice(0, 10).forEach((resource, index) => {
      console.log(`${index + 1}. ${resource.public_id} (${resource.created_at})`)
    })
    
    if (unmappedImages.length > 10) {
      console.log(`... and ${unmappedImages.length - 10} more`)
    }
    
    return unmappedImages
  } catch (error) {
    console.error('❌ Error finding unmapped images:', error.message)
    return []
  }
}

/**
 * Kiểm tra khả năng đồng bộ 2 chiều
 */
async function checkTwoWaySync() {
  console.log('\n🔄 Checking two-way sync capabilities...')
  
  console.log(`
📋 Current Capabilities:
✅ Web App → Cloudinary:
   - Upload images via unsigned preset
   - Store fabric code in context/tags
   - Get upload response with public_id
   - Save mapping in localStorage

❓ Cloudinary → Web App:
   - Need Admin API to list/search images
   - Need to match images to fabric codes
   - Need persistent storage (database)
   - Need periodic sync or webhooks

🔧 Required for Full 2-Way Sync:
1. Server-side component with API secret
2. Database to store fabric-image mappings
3. Cloudinary webhook for real-time updates
4. Periodic sync job for missed updates
5. Image recognition or naming convention

💡 Possible Solutions:
1. Use Cloudinary context/tags to store fabric codes
2. Implement server-side sync endpoint
3. Set up Cloudinary upload webhook
4. Create admin interface for manual mapping
5. Use AI to match images to fabric descriptions
`)
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Cloudinary Sync Check Starting...')
  console.log('=' .repeat(60))
  
  try {
    await checkUploadedImages()
    await listAllFabricImages()
    await findUnmappedImages()
    await checkTwoWaySync()
    
    console.log('\n' + '=' .repeat(60))
    console.log('✅ Cloudinary sync check completed!')
    
  } catch (error) {
    console.error('❌ Main error:', error)
  }
}

// Run if called directly
main()
