#!/usr/bin/env node

/**
 * 📊 PROCESS ANHHUNG EXCEL FILE
 * Ninh ơi, script này đọc file anhhung.xlsx và convert thành dữ liệu vải tồn kho
 */

import fs from 'fs'
import path from 'path'

// Since we can't directly read Excel in Node.js without additional libraries,
// let's create a manual processor that can handle the data

/**
 * Process the Excel file and extract fabric inventory data
 */
async function processAnhHungExcel() {
  console.log('📊 PROCESSING ANHHUNG.XLSX - KHO VẢI TỒN')
  console.log('═══════════════════════════════════════════════════════════════\n')
  
  try {
    // Check if file exists
    const excelPath = path.join(process.cwd(), 'anhhung.xlsx')
    if (!fs.existsSync(excelPath)) {
      console.log('❌ File anhhung.xlsx not found')
      console.log('📍 Expected location:', excelPath)
      return
    }
    
    console.log('✅ Found anhhung.xlsx file')
    const stats = fs.statSync(excelPath)
    console.log(`📊 File size: ${(stats.size / 1024).toFixed(1)} KB`)
    console.log(`📅 Modified: ${stats.mtime.toLocaleString()}`)
    
    console.log('\n🔧 NEXT STEPS:')
    console.log('1. Convert Excel to CSV manually or using Excel app')
    console.log('2. Save as anhhung.csv in the same directory')
    console.log('3. Run this script again to process CSV data')
    
    // Check if CSV version exists
    const csvPath = path.join(process.cwd(), 'anhhung.csv')
    if (fs.existsSync(csvPath)) {
      console.log('\n✅ Found anhhung.csv - processing...')
      await processCSVData(csvPath)
    } else {
      console.log('\n⚠️  anhhung.csv not found')
      console.log('📝 Please convert anhhung.xlsx to anhhung.csv first')
      
      // Create sample CSV structure
      const sampleCSV = `STT,Mã vải,Tên vải,Số lượng tồn,Đơn vị,Ghi chú
1,VT001,Vải cotton trắng,50,m,Còn tồn kho
2,VT002,Vải lụa đỏ,25,m,Còn tồn kho
3,VT003,Vải jean xanh,100,m,Còn tồn kho`
      
      const samplePath = path.join(process.cwd(), 'anhhung-sample.csv')
      fs.writeFileSync(samplePath, sampleCSV)
      console.log(`📄 Created sample CSV structure: ${samplePath}`)
    }
    
  } catch (error) {
    console.error('❌ Error processing Excel file:', error)
  }
}

/**
 * Process CSV data
 */
async function processCSVData(csvPath) {
  try {
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = csvContent.split('\n').filter(line => line.trim())
    
    console.log(`📊 CSV has ${lines.length} lines`)
    
    if (lines.length < 2) {
      console.log('❌ CSV file appears to be empty or has no data rows')
      return
    }
    
    // Parse header
    const header = parseCSVLine(lines[0])
    console.log('📋 CSV Headers:', header)
    
    // Parse data rows
    const fabricData = []
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      const columns = parseCSVLine(line)
      if (columns.length >= 2) {
        const fabricItem = {
          stt: columns[0]?.trim() || '',
          code: columns[1]?.trim() || '',
          name: columns[2]?.trim() || '',
          quantity: columns[3]?.trim() || '',
          unit: columns[4]?.trim() || '',
          note: columns[5]?.trim() || ''
        }
        
        // Only add if has code
        if (fabricItem.code && fabricItem.code !== 'Mã vải') {
          fabricData.push(fabricItem)
        }
      }
    }
    
    console.log(`✅ Processed ${fabricData.length} fabric items`)
    
    // Show sample data
    console.log('\n📋 SAMPLE DATA:')
    fabricData.slice(0, 5).forEach((item, index) => {
      console.log(`${index + 1}. ${item.code} - ${item.name} (${item.quantity} ${item.unit})`)
    })
    
    // Generate fabric data for web app
    const webAppData = fabricData.map((item, index) => ({
      id: `fabric-${index + 1}`,
      code: item.code,
      name: item.name || `Vải ${item.code}`,
      description: item.note || `Vải tồn kho - ${item.name}`,
      category: 'Vải tồn kho',
      subcategory: 'Kho chính',
      width: 150, // Default width
      composition: 'Chưa xác định',
      weight: 'Chưa xác định',
      color: 'Đa màu',
      pattern: 'Trơn',
      texture: 'Mềm mại',
      care: 'Giặt máy',
      price: 0,
      currency: 'VND',
      availability: 'in_stock',
      stock: parseInt(item.quantity) || 0,
      unit: item.unit || 'm',
      supplier: 'Kho nội bộ',
      location: 'T4 B1.2',
      dateAdded: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      tags: ['vải tồn', 'kho chính'],
      image: undefined // Will be mapped later
    }))
    
    // Save processed data
    const outputData = {
      metadata: {
        source: 'anhhung.xlsx',
        processedAt: new Date().toISOString(),
        totalItems: webAppData.length,
        description: 'Dữ liệu vải tồn kho từ file anhhung.xlsx'
      },
      fabrics: webAppData
    }
    
    const outputPath = path.join(process.cwd(), 'src/data/anhhung-fabrics.json')
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2))
    console.log(`💾 Saved processed data to: ${outputPath}`)
    
    // Copy to public for web access
    const publicPath = path.join(process.cwd(), 'public/anhhung-fabrics.json')
    fs.writeFileSync(publicPath, JSON.stringify(outputData, null, 2))
    console.log(`📁 Copied to public: ${publicPath}`)
    
    // Generate summary
    const summary = {
      totalFabrics: webAppData.length,
      categories: [...new Set(webAppData.map(f => f.category))],
      suppliers: [...new Set(webAppData.map(f => f.supplier))],
      locations: [...new Set(webAppData.map(f => f.location))],
      totalStock: webAppData.reduce((sum, f) => sum + f.stock, 0),
      units: [...new Set(webAppData.map(f => f.unit))],
      processedAt: new Date().toISOString()
    }
    
    console.log('\n📊 SUMMARY:')
    console.log(`Total Fabrics: ${summary.totalFabrics}`)
    console.log(`Total Stock: ${summary.totalStock} units`)
    console.log(`Categories: ${summary.categories.join(', ')}`)
    console.log(`Units: ${summary.units.join(', ')}`)
    
    const summaryPath = path.join(process.cwd(), 'anhhung-summary.json')
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2))
    console.log(`📋 Summary saved to: ${summaryPath}`)
    
    console.log('\n🎉 PROCESSING COMPLETE!')
    console.log('🔄 Next: Update web app to use anhhung-fabrics.json')
    
  } catch (error) {
    console.error('❌ Error processing CSV:', error)
  }
}

/**
 * Parse CSV line handling quotes
 */
function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
}

// Run the processor
processAnhHungExcel().catch(console.error)
