/**
 * Debug script để fix ảnh upload
 * Ninh ơi, chạy script này trong browser console để debug
 */

console.log('🔧 Debug Image Fix Script')

// Test fabric code
const fabricCode = '3 PASS BO - WHITE - COL 15'

// Check if syncService is available
if (typeof window !== 'undefined' && window.syncService) {
  console.log('✅ syncService available')
  
  // Clear cache
  window.syncService.clearCache()
  console.log('🗑️ Cache cleared')
  
  // Check cache stats
  const stats = window.syncService.getCacheStats()
  console.log('📊 Cache stats:', stats)
  
  // Test getImageUrl
  window.syncService.getImageUrl(fabricCode).then(url => {
    console.log(`🔗 Image URL for ${fabricCode}:`, url)
  }).catch(error => {
    console.error('❌ Error getting image URL:', error)
  })
  
} else {
  console.log('❌ syncService not available in window')
  console.log('Available globals:', Object.keys(window).filter(k => k.includes('sync') || k.includes('Service')))
}

// Check if fabric data is available
if (typeof window !== 'undefined' && window.fabricData) {
  console.log('✅ fabricData available')
  
  const fabric = window.fabricData.find(f => f.code === fabricCode)
  if (fabric) {
    console.log('🔍 Found fabric:', fabric)
    console.log('🖼️ Current image URL:', fabric.image)
  } else {
    console.log('❌ Fabric not found in data')
  }
} else {
  console.log('❌ fabricData not available in window')
}

// Manual test URLs
const testUrls = [
  'https://res.cloudinary.com/dgaktc3fb/image/upload/v1752680644/vlnq1zurpkqnyiillqv6.png', // Latest upload
  'https://res.cloudinary.com/dgaktc3fb/image/upload/vlnq1zurpkqnyiillqv6', // Without version
  'https://res.cloudinary.com/dgaktc3fb/image/upload/q_80,w_800/fabrics/3%20PASS%20BO%20-%20WHITE%20-%20COL%2015.jpg' // Generated URL
]

console.log('🧪 Testing URLs...')
testUrls.forEach((url, index) => {
  fetch(url, { method: 'HEAD' })
    .then(response => {
      console.log(`${index + 1}. ${response.ok ? '✅' : '❌'} ${url} - ${response.status}`)
    })
    .catch(error => {
      console.log(`${index + 1}. ❌ ${url} - Error: ${error.message}`)
    })
})

// Instructions
console.log(`
📋 Manual Fix Instructions:
1. Open browser console
2. Run: syncService.clearCache()
3. Run: location.reload()
4. Check if image appears for fabric: ${fabricCode}

🔗 Expected working URL:
https://res.cloudinary.com/dgaktc3fb/image/upload/v1752680644/vlnq1zurpkqnyiillqv6.png
`)
