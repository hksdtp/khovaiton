/**
 * Test Mapping Script
 * Ninh ơi, script này test xem ảnh đã được map vào app chưa
 */

import fs from 'fs'
import path from 'path'

// Cloudinary config
const CLOUD_NAME = 'dgaktc3fb'
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/fabrics/`

/**
 * Get fabric codes from uploaded images
 */
function getUploadedFabricCodes() {
  // Read from upload summary or scan Cloudinary
  // For now, let's use some sample codes from the upload
  return [
    '07 013D -26',
    '07013D -31', 
    '71022-10',
    'VANILLA 01',
    'VANILLA 02',
    'ACHIEVEMENT-02-FEATHEN',
    'AMAZING 136-GULL',
    'BARCLAY-03',
    'ENGINE IRON 03',
    'ELITE EB5115 WHITE MUSHROOM'
  ]
}

/**
 * Test if Cloudinary image exists
 */
async function testCloudinaryImage(fabricCode) {
  try {
    // Encode fabric code for URL
    const encodedCode = encodeURIComponent(fabricCode)
    const url = `${CLOUDINARY_BASE_URL}${encodedCode}`
    
    console.log(`🔍 Testing: ${fabricCode}`)
    console.log(`   URL: ${url}`)
    
    const response = await fetch(url, { method: 'HEAD' })
    
    if (response.ok) {
      console.log(`   ✅ EXISTS - Status: ${response.status}`)
      return { fabricCode, exists: true, url, status: response.status }
    } else {
      console.log(`   ❌ NOT FOUND - Status: ${response.status}`)
      return { fabricCode, exists: false, url, status: response.status }
    }
    
  } catch (error) {
    console.log(`   💥 ERROR: ${error.message}`)
    return { fabricCode, exists: false, url: '', error: error.message }
  }
}

/**
 * Test app integration
 */
async function testAppIntegration() {
  try {
    console.log('🌐 Testing app integration...')
    
    // Test if app is running
    const appResponse = await fetch('http://localhost:3002')
    if (!appResponse.ok) {
      throw new Error('App is not running on localhost:3002')
    }
    
    console.log('✅ App is running')
    
    // Test API endpoint if exists
    try {
      const apiResponse = await fetch('http://localhost:3002/api/fabrics')
      if (apiResponse.ok) {
        console.log('✅ API endpoint accessible')
      } else {
        console.log('⚠️ API endpoint not found (normal for static app)')
      }
    } catch {
      console.log('⚠️ No API endpoint (normal for static app)')
    }
    
  } catch (error) {
    console.log(`❌ App integration test failed: ${error.message}`)
  }
}

/**
 * Main test function
 */
async function runMappingTest() {
  console.log('🎯 FABRIC IMAGE MAPPING TEST')
  console.log('=' .repeat(50))
  
  // Test app integration
  await testAppIntegration()
  console.log('')
  
  // Get fabric codes to test
  const fabricCodes = getUploadedFabricCodes()
  console.log(`📋 Testing ${fabricCodes.length} fabric codes`)
  console.log('')
  
  // Test results
  const results = {
    total: fabricCodes.length,
    found: 0,
    notFound: 0,
    errors: 0,
    details: []
  }
  
  // Test each fabric code
  for (const fabricCode of fabricCodes) {
    const result = await testCloudinaryImage(fabricCode)
    results.details.push(result)
    
    if (result.exists) {
      results.found++
    } else if (result.error) {
      results.errors++
    } else {
      results.notFound++
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('')
  }
  
  // Summary
  console.log('=' .repeat(50))
  console.log('📊 MAPPING TEST SUMMARY')
  console.log('=' .repeat(50))
  console.log(`Total tested: ${results.total}`)
  console.log(`✅ Found: ${results.found}`)
  console.log(`❌ Not found: ${results.notFound}`)
  console.log(`💥 Errors: ${results.errors}`)
  console.log(`📈 Success rate: ${((results.found / results.total) * 100).toFixed(1)}%`)
  
  if (results.found > 0) {
    console.log('')
    console.log('✅ SUCCESSFUL MAPPINGS:')
    results.details
      .filter(r => r.exists)
      .forEach(r => {
        console.log(`   • ${r.fabricCode}`)
      })
  }
  
  if (results.notFound > 0) {
    console.log('')
    console.log('❌ NOT FOUND:')
    results.details
      .filter(r => !r.exists && !r.error)
      .forEach(r => {
        console.log(`   • ${r.fabricCode} (Status: ${r.status})`)
      })
  }
  
  if (results.errors > 0) {
    console.log('')
    console.log('💥 ERRORS:')
    results.details
      .filter(r => r.error)
      .forEach(r => {
        console.log(`   • ${r.fabricCode}: ${r.error}`)
      })
  }
  
  console.log('')
  console.log('🎉 Mapping test completed!')
  console.log('🔗 Check images in app: http://localhost:3002')
  console.log('☁️ Check Cloudinary: https://console.cloudinary.com/console/c-8bf0de9f08e89bff1bf9b6aa2cecd4d3/media_library/folders/fabrics')
}

// Run the test
runMappingTest().catch(error => {
  console.error('💥 Test failed:', error)
  process.exit(1)
})
