/**
 * Detailed Cloudinary Connection Test
 * Script kiểm tra chi tiết kết nối Cloudinary với các pattern URL khác nhau
 */

const CLOUDINARY_CLOUD_NAME = 'dgaktc3fb'
const CLOUDINARY_API_KEY = '917768158798778'

// Test different URL patterns for fabric images
async function testFabricImagePatterns() {
  console.log('🔍 Testing different fabric image URL patterns...\n')
  
  const testPatterns = [
    // Pattern 1: Direct fabric code
    {
      pattern: 'Direct fabric code',
      urls: [
        'https://res.cloudinary.com/dgaktc3fb/image/upload/AR-071-02B.jpg',
        'https://res.cloudinary.com/dgaktc3fb/image/upload/TP01623-224.jpg',
        'https://res.cloudinary.com/dgaktc3fb/image/upload/BERTONE-30.jpg'
      ]
    },
    
    // Pattern 2: fabrics/ folder
    {
      pattern: 'fabrics/ folder',
      urls: [
        'https://res.cloudinary.com/dgaktc3fb/image/upload/fabrics/AR-071-02B.jpg',
        'https://res.cloudinary.com/dgaktc3fb/image/upload/fabrics/TP01623-224.jpg',
        'https://res.cloudinary.com/dgaktc3fb/image/upload/fabrics/BERTONE-30.jpg'
      ]
    },
    
    // Pattern 3: fabric_images/ folder (new structure)
    {
      pattern: 'fabric_images/ folder',
      urls: [
        'https://res.cloudinary.com/dgaktc3fb/image/upload/fabric_images/AR-071-02B.jpg',
        'https://res.cloudinary.com/dgaktc3fb/image/upload/fabric_images/TP01623-224.jpg',
        'https://res.cloudinary.com/dgaktc3fb/image/upload/fabric_images/BERTONE-30.jpg'
      ]
    },
    
    // Pattern 4: Random IDs (từ FABRIC_CODE_CORRECTIONS)
    {
      pattern: 'Random Cloudinary IDs',
      urls: [
        'https://res.cloudinary.com/dgaktc3fb/image/upload/kxtnctannhobhvacgtqe.jpg',
        'https://res.cloudinary.com/dgaktc3fb/image/upload/a44zn2hnktvmktsfdt7g.jpg',
        'https://res.cloudinary.com/dgaktc3fb/image/upload/agc184xbjm0n715e5aet.jpg'
      ]
    },
    
    // Pattern 5: With version numbers
    {
      pattern: 'With version numbers',
      urls: [
        'https://res.cloudinary.com/dgaktc3fb/image/upload/v1752679690/kxtnctannhobhvacgtqe.png',
        'https://res.cloudinary.com/dgaktc3fb/image/upload/v1751648065/fabric_images/3%20PASS%20BO%20-%20WHITE%20-%20COL%2015.jpg'
      ]
    }
  ]
  
  const results = {}
  
  for (const patternGroup of testPatterns) {
    console.log(`\n📂 Testing ${patternGroup.pattern}:`)
    results[patternGroup.pattern] = []
    
    for (const url of patternGroup.urls) {
      try {
        const response = await fetch(url, { method: 'HEAD' })
        const status = response.ok ? '✅' : '❌'
        const statusText = `${response.status} ${response.statusText}`
        
        console.log(`   ${status} ${url}`)
        console.log(`      Status: ${statusText}`)
        
        results[patternGroup.pattern].push({
          url,
          success: response.ok,
          status: response.status,
          statusText: response.statusText
        })
        
      } catch (error) {
        console.log(`   ❌ ${url}`)
        console.log(`      Error: ${error.message}`)
        
        results[patternGroup.pattern].push({
          url,
          success: false,
          error: error.message
        })
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  return results
}

// Test upload capabilities
async function testUploadEndpoint() {
  console.log('\n🔍 Testing upload endpoint accessibility...\n')
  
  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
  
  try {
    // Test with OPTIONS request to check CORS
    const optionsResponse = await fetch(uploadUrl, { method: 'OPTIONS' })
    console.log(`📋 OPTIONS request: ${optionsResponse.status} ${optionsResponse.statusText}`)
    
    // Test with empty POST (should fail but tell us about endpoint)
    const postResponse = await fetch(uploadUrl, { 
      method: 'POST',
      body: new FormData() // Empty form data
    })
    
    if (postResponse.status === 400) {
      console.log('✅ Upload endpoint is accessible (400 expected for empty request)')
    } else {
      console.log(`📋 POST request: ${postResponse.status} ${postResponse.statusText}`)
    }
    
    const responseText = await postResponse.text()
    console.log('📄 Response preview:', responseText.substring(0, 200))
    
  } catch (error) {
    console.log('❌ Upload endpoint test failed:', error.message)
  }
}

// Test configuration validity
async function testConfigurationValidity() {
  console.log('\n🔍 Testing configuration validity...\n')
  
  console.log(`🏷️ Cloud Name: ${CLOUDINARY_CLOUD_NAME}`)
  console.log(`🔑 API Key: ${CLOUDINARY_API_KEY?.substring(0, 8)}...`)
  
  // Test if cloud exists by trying to access a known Cloudinary sample image
  try {
    const sampleUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/sample.jpg`
    const response = await fetch(sampleUrl, { method: 'HEAD' })
    
    if (response.ok) {
      console.log('✅ Cloud name is valid')
    } else {
      console.log('❌ Cloud name might be invalid or cloud not accessible')
      console.log(`   Status: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    console.log('❌ Configuration test failed:', error.message)
  }
}

// Test some known working images from the corrections mapping
async function testKnownWorkingImages() {
  console.log('\n🔍 Testing known working images from fabric corrections...\n')
  
  const knownWorkingImages = [
    'AR-071-02B',
    'BERTONE-30', 
    'DCR-RP1120',
    '71022-10',
    'YB0320-7'
  ]
  
  for (const fabricCode of knownWorkingImages) {
    const testUrls = [
      `https://res.cloudinary.com/dgaktc3fb/image/upload/${fabricCode}.jpg`,
      `https://res.cloudinary.com/dgaktc3fb/image/upload/fabrics/${fabricCode}.jpg`,
      `https://res.cloudinary.com/dgaktc3fb/image/upload/fabric_images/${fabricCode}.jpg`
    ]
    
    console.log(`\n🧵 Testing fabric: ${fabricCode}`)
    
    for (const url of testUrls) {
      try {
        const response = await fetch(url, { method: 'HEAD' })
        const status = response.ok ? '✅' : '❌'
        
        console.log(`   ${status} ${url.replace('https://res.cloudinary.com/dgaktc3fb/image/upload/', '')}`)
        
        if (response.ok) {
          break // Found working URL, no need to test others
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`)
      }
    }
  }
}

// Main test function
async function runDetailedTests() {
  console.log('🚀 Starting Detailed Cloudinary Tests\n')
  console.log('=' .repeat(60))
  
  await testConfigurationValidity()
  await testKnownWorkingImages()
  await testFabricImagePatterns()
  await testUploadEndpoint()
  
  console.log('\n' + '=' .repeat(60))
  console.log('✨ Detailed tests completed!')
  console.log('\n💡 Tips:')
  console.log('   - ✅ means the image/endpoint is accessible')
  console.log('   - ❌ means there might be an issue or image doesn\'t exist')
  console.log('   - 404 is normal for non-existent images')
  console.log('   - 400 for uploads means endpoint is working but needs proper data')
}

// Export for use in other modules or run directly
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testFabricImagePatterns,
    testUploadEndpoint,
    testConfigurationValidity,
    testKnownWorkingImages,
    runDetailedTests
  }
} else {
  // Run tests if executed directly
  runDetailedTests()
}