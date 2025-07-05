/**
 * Test App Images Script
 * Ninh ơi, script này test ảnh trong app có hiển thị không
 */

import fs from 'fs'

// Sample fabric codes from upload
const SAMPLE_FABRIC_CODES = [
  '07 013D -26',
  '07013D -31', 
  '71022-10',
  'VANILLA 01',
  'VANILLA 02',
  'ACHIEVEMENT-02-FEATHEN',
  'AMAZING 136-GULL',
  'BARCLAY-03',
  'ENGINE IRON 03',
  'ELITE EB5115 WHITE MUSHROOM',
  '120052 cankhoto',
  '120053 cankhoto',
  'CAMVAL RBYY 210',  // This one failed upload
  'R700 - 19'         // This one failed upload
]

/**
 * Test Cloudinary service integration
 */
async function testCloudinaryService() {
  console.log('🧪 Testing Cloudinary Service Integration')
  console.log('=' .repeat(50))
  
  const results = {
    total: SAMPLE_FABRIC_CODES.length,
    accessible: 0,
    notFound: 0,
    details: []
  }
  
  for (const fabricCode of SAMPLE_FABRIC_CODES) {
    try {
      // Test direct Cloudinary URL
      const encodedCode = encodeURIComponent(fabricCode)
      const cloudinaryUrl = `https://res.cloudinary.com/dgaktc3fb/image/upload/fabrics/${encodedCode}`
      
      console.log(`🔍 Testing: ${fabricCode}`)
      
      const response = await fetch(cloudinaryUrl, { method: 'HEAD' })
      
      if (response.ok) {
        console.log(`   ✅ Cloudinary: ACCESSIBLE`)
        results.accessible++
        results.details.push({
          fabricCode,
          cloudinaryAccessible: true,
          cloudinaryUrl
        })
      } else {
        console.log(`   ❌ Cloudinary: NOT FOUND (${response.status})`)
        results.notFound++
        results.details.push({
          fabricCode,
          cloudinaryAccessible: false,
          cloudinaryUrl,
          status: response.status
        })
      }
      
    } catch (error) {
      console.log(`   💥 ERROR: ${error.message}`)
      results.details.push({
        fabricCode,
        cloudinaryAccessible: false,
        error: error.message
      })
    }
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 300))
  }
  
  // Summary
  console.log('')
  console.log('📊 CLOUDINARY TEST SUMMARY')
  console.log('=' .repeat(30))
  console.log(`Total: ${results.total}`)
  console.log(`✅ Accessible: ${results.accessible}`)
  console.log(`❌ Not found: ${results.notFound}`)
  console.log(`📈 Success rate: ${((results.accessible / results.total) * 100).toFixed(1)}%`)
  
  return results
}

/**
 * Generate test data for app
 */
function generateTestData(cloudinaryResults) {
  console.log('')
  console.log('📝 Generating Test Data for App')
  console.log('=' .repeat(50))
  
  const testFabrics = cloudinaryResults.details
    .filter(item => item.cloudinaryAccessible)
    .slice(0, 5) // Take first 5 successful ones
    .map((item, index) => ({
      id: index + 1,
      code: item.fabricCode,
      name: `Test Fabric ${item.fabricCode}`,
      image: item.cloudinaryUrl,
      status: 'available',
      quantity: Math.floor(Math.random() * 100) + 10,
      unit: 'mét',
      location: 'Kho A',
      supplier: 'Test Supplier',
      notes: `Auto-generated test data for ${item.fabricCode}`
    }))
  
  console.log(`Generated ${testFabrics.length} test fabric records`)
  
  // Save to file for manual testing
  const testDataPath = 'scripts/test-fabric-data.json'
  fs.writeFileSync(testDataPath, JSON.stringify(testFabrics, null, 2))
  console.log(`💾 Saved test data to: ${testDataPath}`)
  
  return testFabrics
}

/**
 * Test image optimization
 */
async function testImageOptimization() {
  console.log('')
  console.log('🖼️ Testing Image Optimization')
  console.log('=' .repeat(50))
  
  const testCode = 'VANILLA 01'
  const baseUrl = `https://res.cloudinary.com/dgaktc3fb/image/upload/fabrics/${encodeURIComponent(testCode)}`
  
  const optimizations = [
    { name: 'Original', url: baseUrl },
    { name: 'Auto format', url: `${baseUrl}.auto` },
    { name: 'WebP 800px', url: `https://res.cloudinary.com/dgaktc3fb/image/upload/w_800,f_webp/fabrics/${encodeURIComponent(testCode)}` },
    { name: 'Auto quality', url: `https://res.cloudinary.com/dgaktc3fb/image/upload/q_auto/fabrics/${encodeURIComponent(testCode)}` },
    { name: 'Optimized', url: `https://res.cloudinary.com/dgaktc3fb/image/upload/w_800,q_auto,f_auto/fabrics/${encodeURIComponent(testCode)}` }
  ]
  
  for (const opt of optimizations) {
    try {
      const response = await fetch(opt.url, { method: 'HEAD' })
      const size = response.headers.get('content-length')
      const type = response.headers.get('content-type')
      
      console.log(`${opt.name}:`)
      console.log(`   Status: ${response.status}`)
      console.log(`   Size: ${size ? `${Math.round(size / 1024)}KB` : 'Unknown'}`)
      console.log(`   Type: ${type || 'Unknown'}`)
      console.log(`   URL: ${opt.url}`)
      console.log('')
      
    } catch (error) {
      console.log(`${opt.name}: ERROR - ${error.message}`)
    }
  }
}

/**
 * Main test function
 */
async function runAppImageTest() {
  console.log('🎯 APP IMAGE INTEGRATION TEST')
  console.log('=' .repeat(60))
  console.log(`Testing ${SAMPLE_FABRIC_CODES.length} fabric codes`)
  console.log('')
  
  try {
    // Test Cloudinary accessibility
    const cloudinaryResults = await testCloudinaryService()
    
    // Generate test data
    const testFabrics = generateTestData(cloudinaryResults)
    
    // Test image optimization
    await testImageOptimization()
    
    // Final summary
    console.log('')
    console.log('🎉 APP IMAGE TEST COMPLETED!')
    console.log('=' .repeat(60))
    console.log(`✅ Images accessible: ${cloudinaryResults.accessible}/${cloudinaryResults.total}`)
    console.log(`📝 Test data generated: ${testFabrics.length} records`)
    console.log('')
    console.log('🔗 Next steps:')
    console.log('   1. Open app: http://localhost:3002')
    console.log('   2. Check inventory page for images')
    console.log('   3. Test upload functionality')
    console.log('   4. Verify image optimization')
    console.log('')
    console.log('☁️ Cloudinary console: https://console.cloudinary.com/console/c-8bf0de9f08e89bff1bf9b6aa2cecd4d3/media_library/folders/fabrics')
    
  } catch (error) {
    console.error('💥 Test failed:', error)
    process.exit(1)
  }
}

// Run the test
runAppImageTest()
