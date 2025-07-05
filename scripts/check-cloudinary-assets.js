#!/usr/bin/env node

/**
 * Script để kiểm tra assets trên Cloudinary
 */

import https from 'https'

const CLOUD_NAME = 'dgaktc3fb'

/**
 * Kiểm tra một số ảnh cụ thể
 */
async function checkSpecificImages() {
  console.log('🔍 Checking specific uploaded images...\n')
  
  const testImages = [
    '08-SILVER',
    '089C-1',
    '09-730-17',
    '10-780-17',
    '10-780-5',
    '120087',
    '120092',
    '130003',
    '131-250'
  ]
  
  for (const fabricCode of testImages) {
    const url = `https://res.cloudinary.com/dgaktc3fb/image/upload/fabrics/${fabricCode}`
    
    try {
      const result = await checkImageExists(url)
      if (result.exists) {
        console.log(`✅ ${fabricCode}: EXISTS`)
        console.log(`   URL: ${url}`)
        console.log(`   Size: ${result.size} bytes`)
        console.log(`   Type: ${result.contentType}`)
      } else {
        console.log(`❌ ${fabricCode}: NOT FOUND`)
      }
    } catch (error) {
      console.log(`❌ ${fabricCode}: ERROR - ${error.message}`)
    }
    console.log('')
  }
}

/**
 * Kiểm tra xem ảnh có tồn tại không
 */
function checkImageExists(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD' }, (res) => {
      resolve({
        exists: res.statusCode === 200,
        size: res.headers['content-length'],
        contentType: res.headers['content-type'],
        statusCode: res.statusCode
      })
    })
    
    req.on('error', (error) => {
      resolve({
        exists: false,
        error: error.message
      })
    })
    
    req.setTimeout(10000, () => {
      req.destroy()
      resolve({
        exists: false,
        error: 'Timeout'
      })
    })
    
    req.end()
  })
}

/**
 * Test với các URL format khác nhau
 */
async function testDifferentFormats() {
  console.log('🧪 Testing different URL formats...\n')
  
  const fabricCode = '08-SILVER'
  const formats = [
    `https://res.cloudinary.com/dgaktc3fb/image/upload/fabrics/${fabricCode}`,
    `https://res.cloudinary.com/dgaktc3fb/image/upload/v1751678818/fabrics/${fabricCode}.jpg`,
    `https://res.cloudinary.com/dgaktc3fb/image/upload/fabrics/${fabricCode}.jpg`,
    `https://res.cloudinary.com/dgaktc3fb/raw/upload/fabrics/${fabricCode}`,
  ]
  
  for (const url of formats) {
    try {
      const result = await checkImageExists(url)
      console.log(`${result.exists ? '✅' : '❌'} ${url}`)
      if (result.exists) {
        console.log(`   Status: ${result.statusCode}`)
        console.log(`   Size: ${result.size} bytes`)
        console.log(`   Type: ${result.contentType}`)
      }
    } catch (error) {
      console.log(`❌ ${url} - ERROR: ${error.message}`)
    }
    console.log('')
  }
}

/**
 * Kiểm tra web app có load được ảnh không
 */
async function testWebAppImageLoading() {
  console.log('🌐 Testing web app image loading...\n')
  
  // Test với cloudinaryService URL format
  const fabricCode = '08-SILVER'
  const webAppUrl = `https://res.cloudinary.com/dgaktc3fb/image/upload/fabrics/${fabricCode}`
  
  console.log(`Testing web app URL format: ${webAppUrl}`)
  
  try {
    const result = await checkImageExists(webAppUrl)
    if (result.exists) {
      console.log('✅ Web app URL format works!')
      console.log(`   This image should display in the web app`)
      console.log(`   Size: ${result.size} bytes`)
      console.log(`   Type: ${result.contentType}`)
    } else {
      console.log('❌ Web app URL format failed')
      console.log(`   Status: ${result.statusCode}`)
    }
  } catch (error) {
    console.log(`❌ Error testing web app URL: ${error.message}`)
  }
}

// Main function
async function main() {
  console.log('🔍 CLOUDINARY ASSETS CHECK')
  console.log('==========================\n')
  
  await checkSpecificImages()
  await testDifferentFormats()
  await testWebAppImageLoading()
  
  console.log('\n📋 SUMMARY:')
  console.log('- If images show ✅ EXISTS, they should display in web app')
  console.log('- If images show ❌ NOT FOUND, they need to be uploaded')
  console.log('- Check the Cloudinary console link you provided for full asset list')
}

main().catch(console.error)
