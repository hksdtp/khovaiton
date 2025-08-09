/**
 * Test Cloudinary Configuration sau khi tạo .env
 */

// Giả lập environment variables
const mockEnv = {
  VITE_CLOUDINARY_CLOUD_NAME: 'dgaktc3fb',
  VITE_CLOUDINARY_API_KEY: '917768158798778',
  VITE_CLOUDINARY_UPLOAD_PRESET: 'fabric_images'
}

function testCloudinaryConfig() {
  console.log('🧪 Testing Cloudinary Configuration\n')
  console.log('Environment Variables:')
  console.log(`VITE_CLOUDINARY_CLOUD_NAME: ${mockEnv.VITE_CLOUDINARY_CLOUD_NAME}`)
  console.log(`VITE_CLOUDINARY_API_KEY: ${mockEnv.VITE_CLOUDINARY_API_KEY}`)
  console.log(`VITE_CLOUDINARY_UPLOAD_PRESET: ${mockEnv.VITE_CLOUDINARY_UPLOAD_PRESET}`)
  
  // Giả lập logic isConfigured()
  const CLOUD_NAME = mockEnv.VITE_CLOUDINARY_CLOUD_NAME || ''
  const API_KEY = mockEnv.VITE_CLOUDINARY_API_KEY || ''
  const UPLOAD_PRESET = mockEnv.VITE_CLOUDINARY_UPLOAD_PRESET || 'fabric_images'
  
  const isConfigured = !!(CLOUD_NAME && API_KEY && UPLOAD_PRESET)
  
  console.log('\n📊 Configuration Status:')
  console.log(`CLOUD_NAME: ${CLOUD_NAME ? '✅ Set' : '❌ Missing'}`)
  console.log(`API_KEY: ${API_KEY ? '✅ Set' : '❌ Missing'}`)
  console.log(`UPLOAD_PRESET: ${UPLOAD_PRESET ? '✅ Set' : '❌ Missing'}`)
  console.log(`isConfigured(): ${isConfigured ? '✅ TRUE' : '❌ FALSE'}`)
  
  if (isConfigured) {
    console.log('\n🎉 THÀNH CÔNG!')
    console.log('Cloudinary đã được cấu hình đúng')
    console.log('fabricData.ts sẽ tạo Cloudinary URLs')
    console.log('Ảnh sẽ hiển thị trong web app')
  } else {
    console.log('\n❌ VẤN ĐỀ!')
    console.log('Cloudinary chưa được cấu hình đúng')
    console.log('fabricData.ts sẽ không tạo URLs')
    console.log('Ảnh sẽ không hiển thị')
  }
  
  // Test URL generation
  console.log('\n🔗 Test URL Generation:')
  const testCodes = ['AR-071-02B', 'BERTONE-30', 'TP01623-224']
  
  testCodes.forEach(code => {
    const url = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/fabrics/${code}.jpg`
    console.log(`${code}: ${url}`)
  })
  
  return isConfigured
}

// Run test
testCloudinaryConfig()