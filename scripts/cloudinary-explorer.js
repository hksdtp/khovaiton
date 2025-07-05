#!/usr/bin/env node

/**
 * 🔍 CLOUDINARY EXPLORER
 * Ninh ơi, script này khám phá cấu trúc thực tế trên Cloudinary
 * để hiểu tại sao chỉ có 6.7% match
 */

import https from 'https'

const CLOUD_NAME = 'dgaktc3fb'

/**
 * Test different folder structures
 */
async function testFolderStructures() {
  const testPaths = [
    'fabrics/',
    'fabric_images/',
    '', // Root
    'uploads/',
    'images/',
    'vtt9/',
    'fabric-images/',
    'kho-vai/'
  ]
  
  console.log('🔍 Testing different folder structures...\n')
  
  for (const folder of testPaths) {
    console.log(`Testing folder: "${folder}"`)
    
    // Test with a known working image name
    const testImages = ['71022-10', 'FB15144A3', '089C-1', '07013D-88']
    
    for (const imageName of testImages) {
      const url = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${folder}${imageName}`
      const result = await testImageUrl(url)
      
      if (result.exists) {
        console.log(`   ✅ FOUND: ${imageName} in "${folder}"`)
        console.log(`   📍 URL: ${url}`)
        return { folder, imageName, url }
      }
    }
    
    console.log(`   ❌ No test images found in "${folder}"`)
  }
  
  return null
}

/**
 * Test if URL exists
 */
async function testImageUrl(url) {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url)
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: 'HEAD',
        timeout: 3000
      }
      
      const req = https.request(options, (res) => {
        resolve({
          url,
          exists: res.statusCode === 200,
          statusCode: res.statusCode
        })
      })
      
      req.on('error', () => resolve({ url, exists: false, statusCode: 'ERROR' }))
      req.on('timeout', () => {
        req.destroy()
        resolve({ url, exists: false, statusCode: 'TIMEOUT' })
      })
      
      req.end()
    } catch (error) {
      resolve({ url, exists: false, statusCode: 'ERROR' })
    }
  })
}

/**
 * Test common image naming patterns
 */
async function testNamingPatterns() {
  console.log('\n🎯 Testing common naming patterns...\n')
  
  const baseFolder = 'fabrics/' // Assuming this is correct
  const testCodes = ['71022-10', 'FB15144A3'] // Known working codes
  
  const patterns = [
    (code) => code, // Exact
    (code) => code.toLowerCase(),
    (code) => code.toUpperCase(),
    (code) => code + '.jpg',
    (code) => code + '.png',
    (code) => code + '.webp',
    (code) => code.replace(/\s+/g, '-'),
    (code) => code.replace(/\s+/g, '_'),
    (code) => code.replace(/[^\w]/g, '-'),
    (code) => code.replace(/[^\w]/g, '_'),
  ]
  
  for (const code of testCodes) {
    console.log(`Testing patterns for: ${code}`)
    
    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i]
      const transformedCode = pattern(code)
      const url = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${baseFolder}${encodeURIComponent(transformedCode)}`
      
      const result = await testImageUrl(url)
      if (result.exists) {
        console.log(`   ✅ Pattern ${i + 1}: "${transformedCode}" → WORKS`)
        console.log(`   📍 URL: ${url}`)
      } else {
        console.log(`   ❌ Pattern ${i + 1}: "${transformedCode}" → ${result.statusCode}`)
      }
    }
    console.log('')
  }
}

/**
 * Test sample of uploaded images from previous uploads
 */
async function testKnownUploads() {
  console.log('\n📋 Testing known uploaded images...\n')
  
  // These should exist based on previous upload logs
  const knownImages = [
    '71022-10',
    'FB15144A3', 
    'YB0320-7',
    '07013D-88',
    '089C-1',
    '09-730-17',
    '10-780-1402',
    '10-780-17',
    '10-780-316',
    '10-780-41',
    '10-780-5',
    '131-254',
    '22D-990-8'
  ]
  
  const baseUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/fabrics/`
  
  for (const imageName of knownImages) {
    const url = baseUrl + encodeURIComponent(imageName)
    const result = await testImageUrl(url)
    
    if (result.exists) {
      console.log(`✅ ${imageName} → EXISTS`)
    } else {
      console.log(`❌ ${imageName} → ${result.statusCode}`)
    }
  }
}

/**
 * Main exploration function
 */
async function exploreCloudinary() {
  console.log('🔍 CLOUDINARY STRUCTURE EXPLORATION')
  console.log('═══════════════════════════════════════════════════════════════\n')
  
  // Test folder structures
  const folderResult = await testFolderStructures()
  
  if (folderResult) {
    console.log(`\n🎉 Found working folder: "${folderResult.folder}"`)
    console.log(`📍 Example URL: ${folderResult.url}`)
  } else {
    console.log('\n❌ No working folder structure found!')
  }
  
  // Test naming patterns
  await testNamingPatterns()
  
  // Test known uploads
  await testKnownUploads()
  
  console.log('\n═══════════════════════════════════════════════════════════════')
  console.log('🎯 CONCLUSIONS:')
  console.log('1. Check if images are in correct folder')
  console.log('2. Verify naming convention')
  console.log('3. Consider if 504 images are from different source')
  console.log('4. May need to reorganize Cloudinary structure')
  console.log('═══════════════════════════════════════════════════════════════')
}

// Run exploration
exploreCloudinary().catch(console.error)
