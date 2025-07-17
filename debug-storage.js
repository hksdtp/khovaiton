/**
 * Debug script để test localStorage persistence
 * Ninh ơi, chạy script này trong browser console để debug storage
 */

console.log('🔧 Debug Storage Persistence Script')

// Check if syncService is available
if (typeof window !== 'undefined' && window.syncService) {
  console.log('✅ syncService available')
  
  // Get storage info
  const storageInfo = window.syncService.getStorageInfo()
  console.log('📊 Storage Info:', storageInfo)
  
  // Test fabric codes
  const testFabrics = ['3 PASS BO - WHITE - COL 15', '33139-2-270']
  
  console.log('🧪 Testing fabric image URLs...')
  testFabrics.forEach(async (fabricCode) => {
    try {
      const url = await window.syncService.getImageUrl(fabricCode)
      console.log(`🔗 ${fabricCode}: ${url || 'No URL'}`)
    } catch (error) {
      console.error(`❌ Error for ${fabricCode}:`, error)
    }
  })
  
  // Check localStorage directly
  const storageKey = 'khovaiton_fabric_uploads'
  const stored = localStorage.getItem(storageKey)
  console.log('💾 Raw localStorage data:', stored ? JSON.parse(stored) : 'No data')
  
  // Test functions
  console.log(`
📋 Available Test Functions:
1. window.syncService.getStorageInfo() - Get storage information
2. window.syncService.clearCache() - Clear memory cache only
3. window.syncService.clearAllStorage() - Clear everything including localStorage
4. window.syncService.getImageUrl('fabricCode') - Get image URL for fabric
5. localStorage.getItem('khovaiton_fabric_uploads') - Check raw storage

🔧 Test Commands:
// Check storage
console.log(syncService.getStorageInfo())

// Test specific fabric
syncService.getImageUrl('3 PASS BO - WHITE - COL 15').then(url => console.log('URL:', url))

// Clear all and test persistence
syncService.clearAllStorage()
location.reload() // Then check if data is gone

// Manual storage test
localStorage.setItem('test', 'value')
console.log(localStorage.getItem('test'))
localStorage.removeItem('test')
`)

} else {
  console.log('❌ syncService not available in window')
  
  // Check localStorage directly
  const storageKey = 'khovaiton_fabric_uploads'
  const stored = localStorage.getItem(storageKey)
  console.log('💾 Raw localStorage data:', stored ? JSON.parse(stored) : 'No data')
  
  // Test localStorage functionality
  try {
    localStorage.setItem('test_storage', JSON.stringify({ test: true, timestamp: Date.now() }))
    const testData = localStorage.getItem('test_storage')
    console.log('✅ localStorage working:', testData)
    localStorage.removeItem('test_storage')
  } catch (error) {
    console.error('❌ localStorage not working:', error)
  }
}

// Instructions for manual testing
console.log(`
🧪 Manual Test Steps:
1. Upload an image for any fabric
2. Check if image appears immediately
3. Refresh the page (F5 or Ctrl+R)
4. Check if image still appears after refresh
5. Run: syncService.getStorageInfo() to see stored data

Expected Result:
- Image should persist after page refresh
- Storage should contain fabric codes and public_ids
- URLs should be generated from stored public_ids
`)
