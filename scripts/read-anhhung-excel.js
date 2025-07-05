#!/usr/bin/env node

/**
 * 📊 READ ANHHUNG EXCEL FILE
 * Ninh ơi, script này đọc file anhhung.xlsx và convert sang JSON cho web app
 */

import fs from 'fs'
import path from 'path'

// First, let's try to install the required package
async function installExcelJS() {
  console.log('📦 Installing ExcelJS package...')
  const { spawn } = await import('child_process')
  
  return new Promise((resolve, reject) => {
    const install = spawn('npm', ['install', 'exceljs'], { 
      stdio: 'inherit',
      cwd: process.cwd()
    })
    
    install.on('close', (code) => {
      if (code === 0) {
        console.log('✅ ExcelJS installed successfully')
        resolve(true)
      } else {
        console.log('❌ Failed to install ExcelJS')
        reject(false)
      }
    })
  })
}

async function readAnhHungExcel() {
  console.log('📊 READING ANHHUNG.XLSX - KHO VẢI TỒN')
  console.log('═══════════════════════════════════════════════════════════════\n')
  
  try {
    // Check if file exists
    const excelPath = path.join(process.cwd(), 'anhhung.xlsx')
    if (!fs.existsSync(excelPath)) {
      console.log('❌ File anhhung.xlsx not found')
      console.log('📍 Expected location:', excelPath)
      console.log('📁 Files in current directory:')
      const files = fs.readdirSync('.').filter(f => f.includes('xlsx') || f.includes('xls'))
      console.log(files.length > 0 ? files : 'No Excel files found')
      return
    }
    
    console.log('✅ Found anhhung.xlsx file')
    const stats = fs.statSync(excelPath)
    console.log(`📊 File size: ${(stats.size / 1024).toFixed(1)} KB`)
    console.log(`📅 Modified: ${stats.mtime.toLocaleString()}`)
    
    // Try to install and use ExcelJS
    try {
      await installExcelJS()
      
      // Import ExcelJS after installation
      const ExcelJS = await import('exceljs')
      const workbook = new ExcelJS.Workbook()
      
      console.log('\n🔄 Reading Excel file with ExcelJS...')
      await workbook.xlsx.readFile(excelPath)
      
      console.log(`📋 Found ${workbook.worksheets.length} worksheets`)
      
      // Get the first worksheet
      const worksheet = workbook.worksheets[0]
      console.log(`📄 Using worksheet: "${worksheet.name}"`)
      console.log(`📊 Dimensions: ${worksheet.rowCount} rows × ${worksheet.columnCount} columns`)
      
      // Read header row
      const headerRow = worksheet.getRow(1)
      const headers = []
      headerRow.eachCell((cell, colNumber) => {
        headers[colNumber - 1] = cell.value?.toString() || `Column${colNumber}`
      })
      
      console.log('\n📋 HEADERS:')
      headers.forEach((header, index) => {
        console.log(`  ${index + 1}. ${header}`)
      })
      
      // Read data rows
      const fabricData = []
      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber)
        const rowData = {}
        
        let hasData = false
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber - 1]
          const value = cell.value?.toString()?.trim() || ''
          if (value) hasData = true
          rowData[header] = value
        })
        
        if (hasData) {
          fabricData.push(rowData)
        }
      }
      
      console.log(`\n✅ Read ${fabricData.length} data rows`)
      
      // Show sample data
      console.log('\n📋 SAMPLE DATA (first 3 rows):')
      fabricData.slice(0, 3).forEach((row, index) => {
        console.log(`\nRow ${index + 1}:`)
        Object.entries(row).forEach(([key, value]) => {
          if (value) {
            console.log(`  ${key}: ${value}`)
          }
        })
      })
      
      // Convert to web app format
      console.log('\n🔄 Converting to web app format...')
      
      const webAppFabrics = fabricData.map((row, index) => {
        // Try to detect fabric code column
        const codeColumn = headers.find(h => 
          h.toLowerCase().includes('mã') || 
          h.toLowerCase().includes('code') ||
          h.toLowerCase().includes('id')
        ) || headers[1] // Default to second column
        
        const nameColumn = headers.find(h => 
          h.toLowerCase().includes('tên') || 
          h.toLowerCase().includes('name')
        ) || headers[2] // Default to third column
        
        const quantityColumn = headers.find(h => 
          h.toLowerCase().includes('số lượng') || 
          h.toLowerCase().includes('tồn') ||
          h.toLowerCase().includes('quantity')
        ) || headers[3] // Default to fourth column
        
        const unitColumn = headers.find(h => 
          h.toLowerCase().includes('đơn vị') || 
          h.toLowerCase().includes('unit')
        ) || headers[4] // Default to fifth column
        
        const code = row[codeColumn] || `VT${String(index + 1).padStart(3, '0')}`
        const name = row[nameColumn] || `Vải ${code}`
        const quantity = parseInt(row[quantityColumn]) || 0
        const unit = row[unitColumn] || 'm'
        
        return {
          id: `fabric-${index + 1}`,
          code: code,
          name: name,
          description: `Vải tồn kho - ${name}`,
          category: 'Vải tồn kho',
          subcategory: 'Kho chính',
          width: 150,
          composition: 'Chưa xác định',
          weight: 'Chưa xác định',
          color: 'Đa màu',
          pattern: 'Trơn',
          texture: 'Mềm mại',
          care: 'Giặt máy',
          price: 0,
          currency: 'VND',
          availability: quantity > 0 ? 'in_stock' : 'out_of_stock',
          stock: quantity,
          unit: unit,
          supplier: 'Kho nội bộ',
          location: 'T4 B1.2',
          dateAdded: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          tags: ['vải tồn', 'kho chính'],
          image: undefined // Will be mapped later
        }
      })
      
      // Create output data
      const outputData = {
        metadata: {
          source: 'anhhung.xlsx',
          processedAt: new Date().toISOString(),
          totalItems: webAppFabrics.length,
          totalStock: webAppFabrics.reduce((sum, f) => sum + f.stock, 0),
          inStock: webAppFabrics.filter(f => f.stock > 0).length,
          outOfStock: webAppFabrics.filter(f => f.stock === 0).length,
          description: 'Dữ liệu vải tồn kho từ file anhhung.xlsx - CHỈ VẢI CÒN TỒN KHO'
        },
        fabrics: webAppFabrics
      }
      
      // Save files
      const jsonPath = path.join(process.cwd(), 'anhhung-fabrics.json')
      fs.writeFileSync(jsonPath, JSON.stringify(outputData, null, 2))
      console.log(`\n💾 Saved JSON to: ${jsonPath}`)
      
      const csvPath = path.join(process.cwd(), 'anhhung.csv')
      const csvContent = [
        headers.join(','),
        ...fabricData.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
      ].join('\n')
      fs.writeFileSync(csvPath, csvContent)
      console.log(`💾 Saved CSV to: ${csvPath}`)
      
      // Copy to public and src/data
      const publicPath = path.join(process.cwd(), 'public/anhhung-fabrics.json')
      fs.writeFileSync(publicPath, JSON.stringify(outputData, null, 2))
      console.log(`📁 Copied to public: ${publicPath}`)
      
      const srcDataPath = path.join(process.cwd(), 'src/data/anhhung-fabrics.json')
      fs.writeFileSync(srcDataPath, JSON.stringify(outputData, null, 2))
      console.log(`📁 Copied to src/data: ${srcDataPath}`)
      
      // Generate summary
      console.log('\n📊 CONVERSION SUMMARY:')
      console.log(`📄 Source: anhhung.xlsx (${(stats.size / 1024).toFixed(1)} KB)`)
      console.log(`📊 Total Fabrics: ${outputData.metadata.totalItems}`)
      console.log(`📦 Total Stock: ${outputData.metadata.totalStock} units`)
      console.log(`✅ In Stock: ${outputData.metadata.inStock} fabrics`)
      console.log(`❌ Out of Stock: ${outputData.metadata.outOfStock} fabrics`)
      
      console.log('\n🎉 CONVERSION COMPLETE!')
      console.log('🔄 Next: Update web app to use anhhung-fabrics.json')
      console.log('📱 Web app will show ONLY fabrics in stock (vải tồn kho)')
      
    } catch (excelError) {
      console.log('❌ ExcelJS approach failed:', excelError.message)
      console.log('\n💡 MANUAL CONVERSION NEEDED:')
      console.log('1. Open anhhung.xlsx in Excel/Numbers/Google Sheets')
      console.log('2. Save/Export as CSV format')
      console.log('3. Name it anhhung.csv in the same directory')
      console.log('4. Run this script again')
    }
    
  } catch (error) {
    console.error('❌ Error reading Excel file:', error)
  }
}

// Run the reader
readAnhHungExcel().catch(console.error)
