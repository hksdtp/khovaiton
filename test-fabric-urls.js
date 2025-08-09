/**
 * Test URL generation sau khi sửa CloudinaryService
 */

// Giả lập CloudinaryService getFabricImageUrl function
const CLOUDINARY_CLOUD_NAME = 'dgaktc3fb'

// Giả lập FABRIC_CODE_CORRECTIONS (rút gọn)
const FABRIC_CODE_CORRECTIONS = {
  'AR-079-02B': {"cloudinaryFileName": "AR-071-02B", "confidence": 88},
  'TP01623-224': {"cloudinaryFileName": "TP01623-224", "confidence": 95},
  'BERTONE-30': {"cloudinaryFileName": "BERTONE-30", "confidence": 100}
}

function getFabricImageUrl(fabricCode) {
  // Kiểm tra correction
  let actualFabricCode = fabricCode
  let isRandomId = false
  
  if (FABRIC_CODE_CORRECTIONS[fabricCode]) {
    const correction = FABRIC_CODE_CORRECTIONS[fabricCode]
    if (correction.confidence && correction.confidence > 60) {
      actualFabricCode = correction.cloudinaryFileName
      isRandomId = /^[a-z0-9]+$/i.test(actualFabricCode)
    }
  }

  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`

  let publicId
  if (isRandomId) {
    publicId = actualFabricCode
    if (!actualFabricCode.includes('.')) {
      publicId += '.jpg'
    }
  } else {
    // Logic MỚI: ưu tiên fabrics/ trước
    if (actualFabricCode.startsWith('fabrics/')) {
      publicId = actualFabricCode
      if (publicId.startsWith('fabrics/fabrics/')) {
        publicId = publicId.replace('fabrics/fabrics/', 'fabrics/')
      }
    } else if (actualFabricCode.startsWith('fabric_images/')) {
      publicId = actualFabricCode
    } else {
      // MẶC ĐỊNH: thêm fabrics/ prefix
      publicId = `fabrics/${actualFabricCode}`
    }
    if (!actualFabricCode.includes('.')) {
      publicId += '.jpg'
    }
  }

  return `${baseUrl}/${publicId}`
}

// Test với các fabric codes có ảnh thật
const testCodes = [
  'AR-071-02B',
  'BERTONE-30', 
  'TP01623-224',
  'AR-079-02B', // correction case
  'DCR-RP1120',
  '71022-10'
]

console.log('🧪 Test URL generation sau khi sửa CloudinaryService\n')

testCodes.forEach(code => {
  const url = getFabricImageUrl(code)
  console.log(`${code}:`)
  console.log(`  → ${url}`)
  console.log('')
})

// Test với browser để kiểm tra URLs
async function testUrlsInBrowser() {
  console.log('🌐 Kiểm tra URLs trong browser...\n')
  
  for (const code of testCodes) {
    const url = getFabricImageUrl(code)
    try {
      const response = await fetch(url, { method: 'HEAD' })
      const status = response.ok ? '✅' : '❌'
      console.log(`${status} ${code}: ${response.status}`)
    } catch (error) {
      console.log(`❌ ${code}: Error - ${error.message}`)
    }
  }
}

// Nếu chạy trong browser
if (typeof window !== 'undefined') {
  testUrlsInBrowser()
}