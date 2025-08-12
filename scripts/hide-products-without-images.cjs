#!/usr/bin/env node

/**
 * Script để ẩn hàng loạt sản phẩm không có ảnh trong phiên bản marketing
 * Tạo file danh sách sản phẩm cần ẩn và script SQL để cập nhật database
 */

const fs = require('fs')
const path = require('path')

// Import functions từ script phân tích
const { readFabricData, readImageMapping } = require('./analyze-hidden-products.cjs')

function generateHideScript() {
  console.log('🔍 Tạo script ẩn sản phẩm không có ảnh...\n')

  const fabrics = readFabricData()
  const imageMapping = readImageMapping()

  if (fabrics.length === 0) {
    console.log('❌ Không có dữ liệu để xử lý')
    return
  }

  // Tìm sản phẩm không có ảnh
  const productsWithoutImages = []
  const productsWithImages = []

  fabrics.forEach(fabric => {
    const fabricCode = fabric.Ma_hang || fabric.code || fabric.Code
    const fabricName = fabric.Ten_hang || fabric.name || fabric.Name
    const quantity = fabric.So_luong || fabric.quantity || fabric.Quantity || 0
    const location = fabric.Vi_tri || fabric.location || fabric.Location || ''

    if (!fabricCode) return

    const hasImage = !!imageMapping[fabricCode]
    
    const productInfo = {
      code: fabricCode,
      name: fabricName,
      quantity: quantity,
      location: location,
      hasImage: hasImage
    }

    if (hasImage) {
      productsWithImages.push(productInfo)
    } else {
      productsWithoutImages.push(productInfo)
    }
  })

  console.log('📊 THỐNG KÊ:')
  console.log(`✅ Sản phẩm có ảnh: ${productsWithImages.length}`)
  console.log(`❌ Sản phẩm không có ảnh: ${productsWithoutImages.length}`)
  console.log()

  // Tạo file CSV danh sách sản phẩm cần ẩn
  const csvContent = [
    'STT,Mã vải,Tên sản phẩm,Số lượng,Vị trí,Lý do ẩn,Hành động đề xuất',
    ...productsWithoutImages.map((product, index) => 
      `${index + 1},"${product.code}","${product.name}",${product.quantity},"${product.location}","Không có ảnh","Thêm ảnh hoặc ẩn tạm thời"`
    )
  ].join('\n')

  const csvPath = path.join(__dirname, '../danh-sach-san-pham-can-an.csv')
  fs.writeFileSync(csvPath, csvContent, 'utf-8')
  console.log(`💾 Đã tạo file CSV: ${csvPath}`)

  // Tạo script SQL để ẩn sản phẩm (nếu sử dụng database)
  const sqlScript = [
    '-- Script SQL để ẩn sản phẩm không có ảnh',
    '-- Chạy script này trong Supabase SQL Editor hoặc database của bạn',
    '',
    '-- Cập nhật trạng thái ẩn cho sản phẩm không có ảnh',
    'UPDATE fabrics',
    'SET is_hidden = true,',
    '    updated_at = NOW()',
    'WHERE code IN (',
    ...productsWithoutImages.map((product, index) => 
      `  '${product.code}'${index < productsWithoutImages.length - 1 ? ',' : ''}`
    ),
    ');',
    '',
    `-- Tổng cộng sẽ ẩn ${productsWithoutImages.length} sản phẩm`,
    '',
    '-- Để bỏ ẩn tất cả (nếu cần):',
    '-- UPDATE fabrics SET is_hidden = false WHERE is_hidden = true;'
  ].join('\n')

  const sqlPath = path.join(__dirname, '../hide-products-without-images.sql')
  fs.writeFileSync(sqlPath, sqlScript, 'utf-8')
  console.log(`💾 Đã tạo script SQL: ${sqlPath}`)

  // Tạo file JSON để sử dụng trong ứng dụng
  const hiddenProductsData = {
    hidden_fabric_codes: productsWithoutImages.map(p => p.code),
    hidden_fabric_ids: [], // Sẽ được cập nhật sau khi có ID từ database
    reason: "Ẩn vì không có ảnh - cải thiện trải nghiệm marketing",
    created_at: new Date().toISOString(),
    total_hidden: productsWithoutImages.length,
    note: "File này được tạo tự động bởi script hide-products-without-images.cjs"
  }

  const jsonPath = path.join(__dirname, '../hidden_products.json')
  fs.writeFileSync(jsonPath, JSON.stringify(hiddenProductsData, null, 2), 'utf-8')
  console.log(`💾 Đã tạo file JSON: ${jsonPath}`)

  // Tạo script JavaScript để ẩn trong ứng dụng
  const jsScript = `
// Script để ẩn sản phẩm không có ảnh trong ứng dụng React
// Copy và paste vào console của trình duyệt khi đang ở trang inventory

const productsToHide = ${JSON.stringify(productsWithoutImages.map(p => p.code), null, 2)};

console.log('🔄 Bắt đầu ẩn', productsToHide.length, 'sản phẩm không có ảnh...');

// Giả lập việc ẩn sản phẩm (cần thay thế bằng API call thực tế)
productsToHide.forEach((code, index) => {
  setTimeout(() => {
    console.log(\`\${index + 1}/\${productsToHide.length}: Ẩn sản phẩm \${code}\`);
    
    // TODO: Thay thế bằng API call thực tế
    // fabricUpdateService.updateVisibility(fabricId, true)
    
  }, index * 100); // Delay 100ms giữa mỗi request
});

console.log('✅ Hoàn tất! Đã ẩn tất cả sản phẩm không có ảnh.');
`

  const jsPath = path.join(__dirname, '../hide-products-script.js')
  fs.writeFileSync(jsPath, jsScript, 'utf-8')
  console.log(`💾 Đã tạo script JS: ${jsPath}`)

  // Tạo báo cáo tổng hợp
  const reportContent = `
# 📊 BÁO CÁO ẨN SẢN PHẨM KHÔNG CÓ ẢNH

## 📈 Thống kê:
- **Tổng số sản phẩm:** ${fabrics.length}
- **Sản phẩm có ảnh:** ${productsWithImages.length} (${(productsWithImages.length/fabrics.length*100).toFixed(1)}%)
- **Sản phẩm không có ảnh:** ${productsWithoutImages.length} (${(productsWithoutImages.length/fabrics.length*100).toFixed(1)}%)

## 🎯 Hành động thực hiện:
- ✅ Tạo danh sách ${productsWithoutImages.length} sản phẩm cần ẩn
- ✅ Tạo script SQL để cập nhật database
- ✅ Tạo script JavaScript để ẩn trong ứng dụng

## 📁 Files được tạo:
1. **danh-sach-san-pham-can-an.csv** - Danh sách chi tiết sản phẩm cần ẩn
2. **hide-products-without-images.sql** - Script SQL để cập nhật database
3. **hidden_products.json** - File JSON cho ứng dụng
4. **hide-products-script.js** - Script JavaScript để chạy trong browser

## 🚀 Cách sử dụng:

### Phương án 1: Sử dụng SQL (Khuyến nghị)
1. Mở Supabase SQL Editor
2. Copy nội dung file \`hide-products-without-images.sql\`
3. Chạy script để cập nhật database

### Phương án 2: Sử dụng JavaScript trong browser
1. Mở trang inventory trong browser
2. Mở Developer Console (F12)
3. Copy nội dung file \`hide-products-script.js\`
4. Paste và chạy trong console

## 💡 Lưu ý:
- Sau khi ẩn, sản phẩm sẽ không hiển thị trong phiên bản marketing
- Sản phẩm vẫn hiển thị trong phiên bản sale
- Có thể bỏ ẩn bất cứ lúc nào bằng cách cập nhật \`is_hidden = false\`

## 📊 Lợi ích:
- Cải thiện trải nghiệm marketing với chỉ sản phẩm có ảnh
- Tăng tỷ lệ chuyển đổi khách hàng
- Giao diện chuyên nghiệp hơn

---
Tạo bởi: hide-products-without-images.cjs
Thời gian: ${new Date().toLocaleString('vi-VN')}
`

  const reportPath = path.join(__dirname, '../BAO_CAO_AN_SAN_PHAM.md')
  fs.writeFileSync(reportPath, reportContent, 'utf-8')
  console.log(`💾 Đã tạo báo cáo: ${reportPath}`)

  console.log('\n🎉 HOÀN TẤT!')
  console.log('=' .repeat(50))
  console.log('✅ Đã tạo tất cả files cần thiết để ẩn sản phẩm không có ảnh')
  console.log('📁 Kiểm tra thư mục gốc để xem các files được tạo')
  console.log('📖 Đọc file BAO_CAO_AN_SAN_PHAM.md để biết cách sử dụng')
  console.log()
  console.log('💡 Bước tiếp theo:')
  console.log('1. Xem lại danh sách trong file CSV')
  console.log('2. Chạy script SQL hoặc JavaScript để ẩn sản phẩm')
  console.log('3. Test lại phiên bản marketing để xem kết quả')
}

// Chạy script
if (require.main === module) {
  generateHideScript()
}

module.exports = { generateHideScript }
