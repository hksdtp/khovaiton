#!/usr/bin/env node

/**
 * Test script để kiểm tra ảnh Cloudinary có load được không
 */

import https from 'https'
import http from 'http'

const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/dgaktc3fb/image/upload/fabrics'

// Danh sách fabric codes để test (từ những ảnh đã upload)
const TEST_FABRIC_CODES = [
  '08-SILVER',
  '089C-1',
  '09-730-17',
  '10-780-17',
  '10-780-5',
  '100023009124',
  '120087',
  '120092',
  '130003',
  '131-250'
]

/**
 * Kiểm tra URL có accessible không
 */
function checkUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https:') ? https : http
    
    const req = protocol.request(url, { method: 'HEAD' }, (res) => {
      resolve({
        url,
        status: res.statusCode,
        success: res.statusCode >= 200 && res.statusCode < 300,
        headers: {
          contentType: res.headers['content-type'],
          contentLength: res.headers['content-length']
        }
      })
    })
    
    req.on('error', (error) => {
      resolve({
        url,
        status: 0,
        success: false,
        error: error.message
      })
    })
    
    req.setTimeout(10000, () => {
      req.destroy()
      resolve({
        url,
        status: 0,
        success: false,
        error: 'Timeout'
      })
    })
    
    req.end()
  })
}

/**
 * Test tất cả fabric codes
 */
async function testAllFabrics() {
  console.log('🧪 Testing Cloudinary image URLs...\n')
  
  const results = []
  
  for (const fabricCode of TEST_FABRIC_CODES) {
    const url = `${CLOUDINARY_BASE_URL}/${fabricCode}`
    console.log(`Testing: ${fabricCode}`)
    
    const result = await checkUrl(url)
    results.push({ fabricCode, ...result })
    
    if (result.success) {
      console.log(`✅ ${fabricCode}: OK (${result.status})`)
      if (result.headers.contentType) {
        console.log(`   Content-Type: ${result.headers.contentType}`)
      }
      if (result.headers.contentLength) {
        console.log(`   Size: ${result.headers.contentLength} bytes`)
      }
    } else {
      console.log(`❌ ${fabricCode}: FAILED (${result.status || 'ERROR'})`)
      if (result.error) {
        console.log(`   Error: ${result.error}`)
      }
    }
    console.log('')
  }
  
  // Tổng kết
  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  
  console.log('📊 SUMMARY:')
  console.log(`✅ Successful: ${successful}/${TEST_FABRIC_CODES.length}`)
  console.log(`❌ Failed: ${failed}/${TEST_FABRIC_CODES.length}`)
  console.log(`📈 Success rate: ${((successful / TEST_FABRIC_CODES.length) * 100).toFixed(1)}%`)
  
  if (failed > 0) {
    console.log('\n❌ Failed URLs:')
    results.filter(r => !r.success).forEach(r => {
      console.log(`   ${r.fabricCode}: ${r.url}`)
    })
  }
  
  if (successful > 0) {
    console.log('\n✅ Working URLs:')
    results.filter(r => r.success).forEach(r => {
      console.log(`   ${r.fabricCode}: ${r.url}`)
    })
  }
  
  return results
}

/**
 * Test với transformations
 */
async function testWithTransformations() {
  console.log('\n🔧 Testing with transformations...\n')
  
  const fabricCode = '08-SILVER'
  const transformations = [
    '',
    'w_400',
    'w_400,h_300',
    'w_400,h_300,f_webp',
    'w_400,h_300,f_webp,q_80'
  ]
  
  for (const transform of transformations) {
    const url = transform 
      ? `${CLOUDINARY_BASE_URL.replace('/fabrics', '')}/${transform}/fabrics/${fabricCode}`
      : `${CLOUDINARY_BASE_URL}/${fabricCode}`
    
    console.log(`Testing transformation: ${transform || 'none'}`)
    const result = await checkUrl(url)
    
    if (result.success) {
      console.log(`✅ OK (${result.status})`)
    } else {
      console.log(`❌ FAILED (${result.status || 'ERROR'})`)
    }
    console.log(`   URL: ${url}\n`)
  }
}

// Chạy tests
async function main() {
  try {
    await testAllFabrics()
    await testWithTransformations()
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

// Chạy script nếu được gọi trực tiếp
main()

export { checkUrl, testAllFabrics, testWithTransformations }
