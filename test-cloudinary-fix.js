/**
 * Test Cloudinary Upload Fix
 * Ninh ơi, script này test xem fix lỗi unsigned upload đã hoạt động chưa
 */

// Use built-in fetch and FormData (Node.js 18+)
import fs from 'fs'
import path from 'path'

// Cloudinary config
const CLOUD_NAME = 'dgaktc3fb'
const UPLOAD_PRESET = 'fabric_images' // unsigned preset
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

/**
 * Test unsigned upload (FIXED VERSION)
 */
async function testUnsignedUpload() {
  console.log('🧪 Testing FIXED unsigned upload...\n')

  // Create a simple test image (1x1 pixel PNG)
  const testImageBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
    0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x01, 0x5C, 0xC2, 0x5D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ])

  const formData = new FormData()

  // ONLY send parameters allowed for unsigned upload
  const blob = new Blob([testImageBuffer], { type: 'image/png' })
  formData.append('file', blob, 'test-fabric.png')
  formData.append('upload_preset', UPLOAD_PRESET)
  
  // DO NOT send these (they cause 400 error with unsigned):
  // - overwrite
  // - public_id  
  // - folder
  // - tags
  // - context
  // - invalidate

  console.log('📤 Uploading with ONLY allowed parameters:')
  console.log('   - file: test-fabric.png')
  console.log('   - upload_preset:', UPLOAD_PRESET)
  console.log('')

  try {
    const response = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: formData
    })

    console.log('📊 Response status:', response.status)
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ SUCCESS! Upload worked with unsigned preset')
      console.log('📋 Result:')
      console.log('   - public_id:', result.public_id)
      console.log('   - secure_url:', result.secure_url)
      console.log('   - format:', result.format)
      console.log('   - width:', result.width)
      console.log('   - height:', result.height)
      console.log('   - bytes:', result.bytes)
      console.log('')
      console.log('🎉 FIX CONFIRMED: Unsigned upload now works!')
      
      return { success: true, result }
    } else {
      const errorText = await response.text()
      console.log('❌ FAILED:', response.status)
      console.log('📄 Error response:', errorText)
      
      return { success: false, error: errorText }
    }

  } catch (error) {
    console.log('💥 EXCEPTION:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Test the old way (with forbidden parameters) to confirm it fails
 */
async function testOldWayStillFails() {
  console.log('\n🧪 Testing OLD way (should still fail)...\n')

  const testImageBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
    0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x01, 0x5C, 0xC2, 0x5D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ])

  const formData = new FormData()

  // Send the OLD way (with forbidden parameters)
  const blob = new Blob([testImageBuffer], { type: 'image/png' })
  formData.append('file', blob, 'test-fabric-old.png')
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('public_id', 'TEST_FABRIC_OLD') // This should cause 400
  formData.append('overwrite', 'true') // This should cause 400
  formData.append('folder', 'fabrics') // This should cause 400

  console.log('📤 Uploading with FORBIDDEN parameters (old way):')
  console.log('   - file: test-fabric-old.png')
  console.log('   - upload_preset:', UPLOAD_PRESET)
  console.log('   - public_id: TEST_FABRIC_OLD (FORBIDDEN)')
  console.log('   - overwrite: true (FORBIDDEN)')
  console.log('   - folder: fabrics (FORBIDDEN)')
  console.log('')

  try {
    const response = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: formData
    })

    console.log('📊 Response status:', response.status)
    
    if (response.ok) {
      console.log('😱 UNEXPECTED: Old way worked (this should not happen)')
      const result = await response.json()
      console.log('📋 Result:', result)
      return { success: true, result }
    } else {
      const errorText = await response.text()
      console.log('✅ EXPECTED: Old way failed as expected')
      console.log('📄 Error response:', errorText)
      
      if (errorText.includes('Overwrite parameter is not allowed')) {
        console.log('🎯 CONFIRMED: Got the exact error we expected to fix')
      }
      
      return { success: false, error: errorText }
    }

  } catch (error) {
    console.log('💥 EXCEPTION:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🔧 CLOUDINARY UPLOAD FIX VERIFICATION')
  console.log('=====================================\n')

  // Test 1: New fixed way should work
  const fixedResult = await testUnsignedUpload()
  
  // Test 2: Old way should still fail
  const oldResult = await testOldWayStillFails()
  
  // Summary
  console.log('\n📊 TEST SUMMARY')
  console.log('===============')
  console.log('Fixed unsigned upload:', fixedResult.success ? '✅ WORKS' : '❌ FAILED')
  console.log('Old way (with forbidden params):', oldResult.success ? '😱 UNEXPECTED' : '✅ FAILS AS EXPECTED')
  
  if (fixedResult.success && !oldResult.success) {
    console.log('\n🎉 CONCLUSION: Fix is working correctly!')
    console.log('   - Unsigned upload works when using only allowed parameters')
    console.log('   - Old way with forbidden parameters still fails as expected')
    console.log('   - CloudinaryService.uploadImage should now work in the web app')
  } else {
    console.log('\n⚠️  CONCLUSION: Something is not right')
    if (!fixedResult.success) {
      console.log('   - Fixed version still failing:', fixedResult.error)
    }
    if (oldResult.success) {
      console.log('   - Old version unexpectedly working')
    }
  }
}

// Run the tests
runTests().catch(console.error)
