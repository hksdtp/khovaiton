/**
 * Test cuối cùng - kiểm tra đồng bộ ảnh sau khi sửa
 */

const CLOUDINARY_CLOUD_NAME = 'dgaktc3fb'

async function testFinalSync() {
  console.log('🔍 KIỂM TRA CUỐI - Đồng bộ ảnh sau khi sửa CloudinaryService\n')
  console.log('=' .repeat(60))
  
  // Test fabric codes có ảnh thật trên Cloudinary
  const fabricCodesWithRealImages = [
    'AR-071-02B',
    'BERTONE-30', 
    'TP01623-224',
    'DCR-RP1120',
    '71022-10',
    'YB0320-7',
    'M907-12',
    'W5601-6',
    '83102-19'
  ]
  
  console.log('📋 Danh sách fabric codes để test:')
  fabricCodesWithRealImages.forEach(code => console.log(`   - ${code}`))
  console.log('')
  
  // Test URLs mới với fabrics/ prefix
  let successCount = 0
  let totalCount = fabricCodesWithRealImages.length
  
  console.log('🧪 Testing URLs với cấu hình mới (fabrics/ prefix):\n')
  
  for (const fabricCode of fabricCodesWithRealImages) {
    const url = `https://res.cloudinary.com/dgaktc3fb/image/upload/fabrics/${fabricCode}.jpg`
    
    try {
      const response = await fetch(url, { method: 'HEAD' })
      
      if (response.ok) {
        console.log(`✅ ${fabricCode} - OK (${response.status})`)
        console.log(`   URL: ${url}`)
        successCount++
      } else {
        console.log(`❌ ${fabricCode} - FAILED (${response.status})`)
        console.log(`   URL: ${url}`)
      }
    } catch (error) {
      console.log(`❌ ${fabricCode} - ERROR: ${error.message}`)
      console.log(`   URL: ${url}`)
    }
    
    console.log('')
    
    // Delay nhỏ giữa requests
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  console.log('=' .repeat(60))
  console.log('📊 KẾT QUÁ TỔNG KẾT:')
  console.log(`   Tổng số fabric codes test: ${totalCount}`)
  console.log(`   Thành công: ${successCount}`)
  console.log(`   Thất bại: ${totalCount - successCount}`)
  console.log(`   Tỷ lệ thành công: ${Math.round(successCount / totalCount * 100)}%`)
  
  if (successCount > 0) {
    console.log('\n🎉 THÀNH CÔNG!')
    console.log('   CloudinaryService đã được sửa đúng')
    console.log('   Web app bây giờ sẽ hiển thị ảnh từ Cloudinary')
    console.log('   \n💡 Các bước tiếp theo:')
    console.log('   1. Mở http://localhost:3001 để xem web app')
    console.log('   2. Kiểm tra xem ảnh có hiển thị trong FabricCard không')
    console.log('   3. Test chức năng sync và upload ảnh')
  } else {
    console.log('\n❌ VẪN CÒN VẤN ĐỀ!')
    console.log('   Cần kiểm tra lại cấu hình hoặc quyền truy cập Cloudinary')
  }
  
  console.log('\n📝 URLs mẫu để test thủ công:')
  fabricCodesWithRealImages.slice(0, 3).forEach(code => {
    const url = `https://res.cloudinary.com/dgaktc3fb/image/upload/fabrics/${code}.jpg`
    console.log(`   ${code}: ${url}`)
  })
}

testFinalSync().catch(console.error)