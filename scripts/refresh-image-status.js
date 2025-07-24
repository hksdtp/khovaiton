/**
 * Script to test refresh image status functionality
 * Run this in browser console on http://localhost:3004/sale
 */

async function testRefreshImageStatus() {
  console.log('🔄 Testing refresh image status...')
  
  try {
    // Import required modules
    const { syncService } = await import('/src/services/syncService.ts')
    const fabricModule = await import('/src/shared/mocks/fabricData.ts')
    
    console.log('📦 Modules loaded successfully')
    
    // Get all fabric codes
    const fabrics = await fabricModule.getMockFabrics()
    const fabricCodes = fabrics.map(f => f.code)
    
    console.log(`📊 Total fabrics: ${fabricCodes.length}`)
    
    // Check current status
    console.log('📊 Current image status:')
    let hasImageCount = 0
    let noImageCount = 0
    
    for (const fabric of fabrics) {
      if (fabric.image) {
        hasImageCount++
      } else {
        noImageCount++
      }
    }
    
    console.log(`✅ Has image: ${hasImageCount}`)
    console.log(`❌ No image: ${noImageCount}`)
    console.log(`📊 Coverage: ${((hasImageCount / fabricCodes.length) * 100).toFixed(1)}%`)
    
    // Test refresh functionality
    console.log('\n🔄 Running refresh image status...')
    const result = await syncService.refreshImageStatus(fabricCodes)
    
    console.log(`✅ Refresh completed:`)
    console.log(`   - Total checked: ${result.total}`)
    console.log(`   - Updated: ${result.updated.length}`)
    
    if (result.updated.length > 0) {
      console.log(`📝 Updated fabric codes:`)
      result.updated.forEach(code => {
        console.log(`   • ${code}`)
      })
    }
    
    // Check runtime mapping
    console.log('\n🔍 Runtime image mapping:')
    const storageInfo = syncService.getStorageInfo()
    console.log(`   - Runtime count: ${storageInfo.runtimeCount}`)
    console.log(`   - Cache count: ${storageInfo.cacheCount}`)
    console.log(`   - Uploaded count: ${storageInfo.uploadedCount}`)
    
    return {
      success: true,
      totalFabrics: fabricCodes.length,
      currentHasImage: hasImageCount,
      currentNoImage: noImageCount,
      refreshResult: result,
      storageInfo
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

async function testHasRealImage() {
  console.log('🔍 Testing hasRealImage function...')
  
  try {
    const { hasRealImage } = await import('/src/data/fabricImageMapping.ts')
    
    // Test some fabric codes
    const testCodes = [
      '3 PASS BO - WHITE - COL 15',
      '33139-2-270', 
      'FB15144A3',
      'DCR-MELIA-COFFEE',
      'NONEXISTENT-CODE'
    ]
    
    console.log('📊 Testing hasRealImage for sample codes:')
    for (const code of testCodes) {
      const hasImage = hasRealImage(code)
      console.log(`   ${hasImage ? '✅' : '❌'} ${code}: ${hasImage}`)
    }
    
    return { success: true }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return { success: false, error: error.message }
  }
}

async function runAllTests() {
  console.log('🚀 Running all image status tests...\n')
  
  const test1 = await testHasRealImage()
  console.log('\n' + '='.repeat(50) + '\n')
  
  const test2 = await testRefreshImageStatus()
  
  console.log('\n' + '='.repeat(50))
  console.log('📊 Test Summary:')
  console.log(`   hasRealImage test: ${test1.success ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`   refreshImageStatus test: ${test2.success ? '✅ PASS' : '❌ FAIL'}`)
  
  if (test2.success) {
    console.log(`\n📈 Results:`)
    console.log(`   Total fabrics: ${test2.totalFabrics}`)
    console.log(`   Has image: ${test2.currentHasImage} (${((test2.currentHasImage / test2.totalFabrics) * 100).toFixed(1)}%)`)
    console.log(`   No image: ${test2.currentNoImage} (${((test2.currentNoImage / test2.totalFabrics) * 100).toFixed(1)}%)`)
    console.log(`   New images found: ${test2.refreshResult.updated.length}`)
  }
  
  return {
    hasRealImageTest: test1,
    refreshImageStatusTest: test2
  }
}

// Export functions for manual testing
window.testRefreshImageStatus = testRefreshImageStatus
window.testHasRealImage = testHasRealImage
window.runAllTests = runAllTests

console.log('🔧 Image status test functions loaded!')
console.log('📝 Available functions:')
console.log('   - testRefreshImageStatus()')
console.log('   - testHasRealImage()')
console.log('   - runAllTests()')
console.log('\n💡 Run runAllTests() to test everything')
