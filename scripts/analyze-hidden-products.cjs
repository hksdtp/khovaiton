#!/usr/bin/env node

/**
 * Script để phân tích sản phẩm đã ẩn trong phiên bản marketing
 * Tạo báo cáo chi tiết về những sản phẩm không có ảnh đã bị ẩn
 */

const fs = require('fs')
const path = require('path')

// Đọc dữ liệu fabric từ file CSV
function readFabricData() {
  try {
    const csvPath = path.join(__dirname, '../public/fabric_inventory_updated.csv')
    if (!fs.existsSync(csvPath)) {
      console.log('❌ Không tìm thấy file fabric_inventory_updated.csv')
      return []
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = csvContent.split('\n').filter(line => line.trim())
    
    if (lines.length === 0) {
      console.log('❌ File CSV rỗng')
      return []
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    console.log('📋 Headers found:', headers)

    // Parse data
    const fabrics = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      if (values.length >= headers.length) {
        const fabric = {}
        headers.forEach((header, index) => {
          fabric[header] = values[index] || ''
        })
        fabrics.push(fabric)
      }
    }

    console.log(`✅ Đã đọc ${fabrics.length} sản phẩm từ CSV`)
    return fabrics
  } catch (error) {
    console.error('❌ Lỗi đọc file CSV:', error.message)
    return []
  }
}

// Đọc dữ liệu mapping ảnh
function readImageMapping() {
  try {
    const mappingPath = path.join(__dirname, '../public/image_mapping.json')
    if (!fs.existsSync(mappingPath)) {
      console.log('⚠️ Không tìm thấy file image_mapping.json')
      return {}
    }

    const mappingContent = fs.readFileSync(mappingPath, 'utf-8')
    const mapping = JSON.parse(mappingContent)
    console.log(`✅ Đã đọc ${Object.keys(mapping).length} mapping ảnh`)
    return mapping
  } catch (error) {
    console.error('❌ Lỗi đọc file mapping:', error.message)
    return {}
  }
}

// Đọc dữ liệu sản phẩm ẩn từ localStorage simulation
function readHiddenProducts() {
  try {
    // Giả lập đọc từ localStorage hoặc database
    // Trong thực tế, bạn có thể kết nối với Supabase hoặc đọc từ file khác
    const hiddenPath = path.join(__dirname, '../hidden_products.json')
    if (!fs.existsSync(hiddenPath)) {
      console.log('⚠️ Không tìm thấy file hidden_products.json, tạo file mẫu...')
      
      // Tạo file mẫu với một số sản phẩm ẩn
      const sampleHidden = {
        "hidden_fabric_ids": [],
        "hidden_fabric_codes": [],
        "note": "File này chứa danh sách sản phẩm đã bị ẩn trong phiên bản marketing"
      }
      
      fs.writeFileSync(hiddenPath, JSON.stringify(sampleHidden, null, 2))
      return sampleHidden
    }

    const hiddenContent = fs.readFileSync(hiddenPath, 'utf-8')
    const hiddenData = JSON.parse(hiddenContent)
    console.log(`✅ Đã đọc ${hiddenData.hidden_fabric_codes?.length || 0} sản phẩm ẩn`)
    return hiddenData
  } catch (error) {
    console.error('❌ Lỗi đọc file hidden products:', error.message)
    return { hidden_fabric_ids: [], hidden_fabric_codes: [] }
  }
}

// Phân tích dữ liệu
function analyzeProducts() {
  console.log('🔍 Bắt đầu phân tích sản phẩm...\n')

  const fabrics = readFabricData()
  const imageMapping = readImageMapping()
  const hiddenData = readHiddenProducts()

  if (fabrics.length === 0) {
    console.log('❌ Không có dữ liệu để phân tích')
    return
  }

  // Phân loại sản phẩm
  const analysis = {
    total: fabrics.length,
    withImages: [],
    withoutImages: [],
    hiddenWithoutImages: [],
    hiddenWithImages: [],
    visibleWithoutImages: [],
    visibleWithImages: []
  }

  fabrics.forEach(fabric => {
    const fabricCode = fabric.Ma_hang || fabric.code || fabric.Code
    const fabricName = fabric.Ten_hang || fabric.name || fabric.Name
    const quantity = fabric.So_luong || fabric.quantity || fabric.Quantity || 0
    const location = fabric.Vi_tri || fabric.location || fabric.Location || ''

    if (!fabricCode) return

    // Kiểm tra có ảnh không
    const hasImage = !!imageMapping[fabricCode]
    
    // Kiểm tra có bị ẩn không
    const isHidden = hiddenData.hidden_fabric_codes?.includes(fabricCode) || false

    const productInfo = {
      code: fabricCode,
      name: fabricName,
      quantity: quantity,
      location: location,
      hasImage: hasImage,
      isHidden: isHidden,
      imageUrl: imageMapping[fabricCode] || null
    }

    // Phân loại
    if (hasImage) {
      analysis.withImages.push(productInfo)
      if (isHidden) {
        analysis.hiddenWithImages.push(productInfo)
      } else {
        analysis.visibleWithImages.push(productInfo)
      }
    } else {
      analysis.withoutImages.push(productInfo)
      if (isHidden) {
        analysis.hiddenWithoutImages.push(productInfo)
      } else {
        analysis.visibleWithoutImages.push(productInfo)
      }
    }
  })

  // In báo cáo
  console.log('📊 KẾT QUẢ PHÂN TÍCH:')
  console.log('=' .repeat(50))
  console.log(`📦 Tổng số sản phẩm: ${analysis.total}`)
  console.log(`🖼️  Có ảnh: ${analysis.withImages.length} (${(analysis.withImages.length/analysis.total*100).toFixed(1)}%)`)
  console.log(`📷 Không có ảnh: ${analysis.withoutImages.length} (${(analysis.withoutImages.length/analysis.total*100).toFixed(1)}%)`)
  console.log()

  console.log('🎯 TRỌNG TÂM: SẢN PHẨM ĐÃ ẨN VÌ KHÔNG CÓ ẢNH')
  console.log('=' .repeat(50))
  console.log(`❌ Đã ẩn vì không có ảnh: ${analysis.hiddenWithoutImages.length}`)
  
  if (analysis.hiddenWithoutImages.length > 0) {
    console.log('\n📋 DANH SÁCH CHI TIẾT:')
    analysis.hiddenWithoutImages.forEach((product, index) => {
      console.log(`${index + 1}. ${product.code} - ${product.name}`)
      console.log(`   📍 Vị trí: ${product.location}`)
      console.log(`   📦 Số lượng: ${product.quantity}`)
      console.log()
    })

    // Xuất CSV
    const csvContent = [
      'STT,Mã vải,Tên sản phẩm,Số lượng,Vị trí,Trạng thái,Ghi chú',
      ...analysis.hiddenWithoutImages.map((product, index) => 
        `${index + 1},"${product.code}","${product.name}",${product.quantity},"${product.location}","Đã ẩn vì không có ảnh","Cần thêm ảnh để hiển thị"`
      )
    ].join('\n')

    const outputPath = path.join(__dirname, '../san-pham-da-an-khong-co-anh.csv')
    fs.writeFileSync(outputPath, csvContent, 'utf-8')
    console.log(`💾 Đã xuất danh sách ra file: ${outputPath}`)
  } else {
    console.log('✅ Không có sản phẩm nào bị ẩn vì thiếu ảnh!')
  }

  console.log('\n📈 THỐNG KÊ KHÁC:')
  console.log('=' .repeat(50))
  console.log(`🔒 Đã ẩn nhưng có ảnh: ${analysis.hiddenWithImages.length}`)
  console.log(`👁️  Hiện nhưng không có ảnh: ${analysis.visibleWithoutImages.length}`)
  console.log(`✅ Hiện và có ảnh: ${analysis.visibleWithImages.length}`)

  // Gợi ý hành động
  console.log('\n💡 GỢI Ý HÀNH ĐỘNG:')
  console.log('=' .repeat(50))
  
  if (analysis.hiddenWithoutImages.length > 0) {
    console.log(`1. 📸 Cần thêm ảnh cho ${analysis.hiddenWithoutImages.length} sản phẩm đã ẩn`)
    console.log('   → Sau khi thêm ảnh, có thể bỏ ẩn để hiển thị trong marketing')
  }
  
  if (analysis.visibleWithoutImages.length > 0) {
    console.log(`2. ⚠️  Có ${analysis.visibleWithoutImages.length} sản phẩm hiện nhưng không có ảnh`)
    console.log('   → Nên thêm ảnh hoặc ẩn tạm thời để cải thiện trải nghiệm marketing')
  }

  if (analysis.hiddenWithImages.length > 0) {
    console.log(`3. 🔍 Có ${analysis.hiddenWithImages.length} sản phẩm đã ẩn nhưng có ảnh`)
    console.log('   → Kiểm tra lý do ẩn, có thể bỏ ẩn nếu phù hợp')
  }

  console.log('\n🎉 Phân tích hoàn tất!')
}

// Chạy phân tích
if (require.main === module) {
  analyzeProducts()
}

module.exports = { analyzeProducts, readFabricData, readImageMapping, readHiddenProducts }
