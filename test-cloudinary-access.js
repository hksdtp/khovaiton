/**
 * Test Cloudinary Connection & Access
 * Script để kiểm tra kết nối và quyền truy cập Cloudinary
 */

const CLOUDINARY_CLOUD_NAME = 'dgaktc3fb'
const CLOUDINARY_API_KEY = '917768158798778'

// Test 1: Check basic Cloudinary connection
async function testCloudinaryConnection() {
  console.log('🔍 Testing Cloudinary basic connection...')
  
  try {
    // Test if we can access Cloudinary's basic info endpoint
    const response = await fetch(`https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/c_limit,h_60,w_90/sample.jpg`)
    
    if (response.ok) {
      console.log('✅ Basic Cloudinary connection successful')
      console.log(`   Cloud Name: ${CLOUDINARY_CLOUD_NAME}`)
      return true
    } else {
      console.log('❌ Basic Cloudinary connection failed')
      console.log(`   Status: ${response.status} - ${response.statusText}`)
      return false
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message)
    return false
  }
}

// Test 2: Check if we can access fabric images folder
async function testFabricImagesAccess() {
  console.log('\n🔍 Testing fabric images access...')
  
  const testImages = [
    'fabric_images/3 PASS BO - WHITE - COL 15.jpg',
    'fabric_images/kxtnctannhobhvacgtqe.jpg',
    'fabrics/AR-071-02B.jpg',
    'TP01623-224.jpg'
  ]
  
  for (const imagePath of testImages) {
    try {
      const url = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${imagePath}`
      const response = await fetch(url, { method: 'HEAD' })
      
      if (response.ok) {
        console.log(`✅ Can access: ${imagePath}`)
        console.log(`   URL: ${url}`)
      } else {
        console.log(`❌ Cannot access: ${imagePath}`)
        console.log(`   Status: ${response.status}`)
      }
    } catch (error) {
      console.log(`❌ Error accessing ${imagePath}:`, error.message)
    }
  }
}

// Test 3: Test unsigned upload capability
async function testUnsignedUpload() {
  console.log('\n🔍 Testing unsigned upload capability...')
  
  try {
    // Create a small test image (1x1 pixel PNG)
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#FF0000'
    ctx.fillRect(0, 0, 1, 1)
    
    // Convert to blob
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
    const testFile = new File([blob], 'test-image.png', { type: 'image/png' })
    
    const formData = new FormData()
    formData.append('file', testFile)
    formData.append('upload_preset', 'fabric_images') // Your upload preset
    
    console.log('📤 Attempting unsigned upload...')
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    )
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Unsigned upload successful!')
      console.log(`   Public ID: ${result.public_id}`)
      console.log(`   URL: ${result.secure_url}`)
      console.log(`   Size: ${result.width}x${result.height}`)
      return result
    } else {
      const error = await response.json()
      console.log('❌ Unsigned upload failed')
      console.log(`   Error: ${error.error?.message || 'Unknown error'}`)
      return null
    }
  } catch (error) {
    console.log('❌ Upload test error:', error.message)
    return null
  }
}

// Test 4: Check API limits and quota
async function testAPIQuota() {
  console.log('\n🔍 Testing API quota and limits...')
  
  try {
    // Try to get account info (this might fail if we don't have admin API access)
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/usage`,
      {
        headers: {
          'Authorization': `Basic ${btoa(CLOUDINARY_API_KEY + ':')}`
        }
      }
    )
    
    if (response.ok) {
      const usage = await response.json()
      console.log('✅ API access working')
      console.log('   Usage info:', usage)
    } else {
      console.log('ℹ️ Admin API not accessible (expected for security)')
      console.log('   This is normal - admin functions require API secret')
    }
  } catch (error) {
    console.log('ℹ️ Admin API test failed (expected):', error.message)
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Cloudinary Access Tests\n')
  console.log('=' .repeat(50))
  
  const results = {
    connection: false,
    fabricAccess: false,
    upload: false,
    quota: false
  }
  
  // Test connection
  results.connection = await testCloudinaryConnection()
  
  // Test fabric images access
  await testFabricImagesAccess()
  
  // Test upload (only in browser environment)
  if (typeof document !== 'undefined') {
    results.upload = await testUnsignedUpload()
  } else {
    console.log('\n⚠️ Upload test skipped (requires browser environment)')
  }
  
  // Test API quota
  await testAPIQuota()
  
  // Summary
  console.log('\n' + '=' .repeat(50))
  console.log('📊 TEST SUMMARY:')
  console.log(`   Basic Connection: ${results.connection ? '✅' : '❌'}`)
  console.log(`   Fabric Images: Check individual results above`)
  console.log(`   Upload Test: ${results.upload ? '✅' : '⚠️ Skipped or Failed'}`)
  console.log(`   API Quota: ℹ️ Limited access (normal)`)
  
  if (results.connection) {
    console.log('\n🎉 Cloudinary connection is working!')
    console.log('   You can use the fabric image features')
  } else {
    console.log('\n💔 Cloudinary connection issues detected')
    console.log('   Check your configuration and network')
  }
}

// Export for use in other modules or run directly
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testCloudinaryConnection,
    testFabricImagesAccess,
    testUnsignedUpload,
    testAPIQuota,
    runAllTests
  }
} else {
  // Run tests if executed directly in browser
  runAllTests()
}