/**
 * Test script để kiểm tra ảnh đã upload
 * Ninh ơi, script này test xem ảnh có hiển thị đúng không
 */

// Test fabric code đã upload
const fabricCode = '3 PASS BO - WHITE - COL 15'

// Test URL generation
console.log('🧪 Testing image URL generation...')

// Import services
import('./src/services/cloudinaryService.js').then(({ cloudinaryService }) => {
  console.log('☁️ Cloudinary configured:', cloudinaryService.isConfigured())
  
  const url = cloudinaryService.getFabricImageUrl(fabricCode, {
    width: 800,
    quality: 80
  })
  
  console.log('🔗 Generated URL:', url)
  
  // Test if URL is accessible
  if (url) {
    fetch(url, { method: 'HEAD' })
      .then(response => {
        console.log('✅ Image accessible:', response.ok)
        console.log('📊 Response status:', response.status)
        console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()))
      })
      .catch(error => {
        console.error('❌ Image not accessible:', error)
      })
  }
}).catch(error => {
  console.error('❌ Failed to import cloudinaryService:', error)
})

// Test mapping
import('./src/data/fabricImageMapping.js').then(({ hasRealImage }) => {
  console.log('📋 Has real image mapping:', hasRealImage(fabricCode))
}).catch(error => {
  console.error('❌ Failed to import mapping:', error)
})
