#!/usr/bin/env node

/**
 * 📊 PROCESS ANHHUNG CSV FILE
 * Ninh ơi, script này đọc file anhhung.csv và convert thành dữ liệu vải tồn kho
 */

import fs from 'fs'
import path from 'path'

function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''))
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim().replace(/^"|"$/g, ''))
  return result
}

async function processAnhHungCSV() {
  console.log('📊 PROCESSING ANHHUNG.CSV - KHO VẢI TỒN')
  console.log('═══════════════════════════════════════════════════════════════\n')
  
  try {
    // Check if CSV file exists
    const csvPath = path.join(process.cwd(), 'anhhung.csv')
    if (!fs.existsSync(csvPath)) {
      console.log('❌ File anhhung.csv not found')
      console.log('📍 Expected location:', csvPath)
      console.log('\n💡 PLEASE CONVERT EXCEL TO CSV FIRST:')
      console.log('1. Open anhhung.xlsx in Excel/Numbers/Google Sheets')
      console.log('2. Export/Save As CSV format')
      console.log('3. Save as anhhung.csv in this directory')
      console.log('4. Run this script again')
      
      // Show available files
      const files = fs.readdirSync('.').filter(f => 
        f.includes('xlsx') || f.includes('xls') || f.includes('csv')
      )
      if (files.length > 0) {
        console.log('\n📁 Available files:')
        files.forEach(file => console.log(`  • ${file}`))
      }
      return
    }
    
    console.log('✅ Found anhhung.csv file')
    const stats = fs.statSync(csvPath)
    console.log(`📊 File size: ${(stats.size / 1024).toFixed(1)} KB`)
    console.log(`📅 Modified: ${stats.mtime.toLocaleString()}`)
    
    // Read CSV content
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = csvContent.split('\n').filter(line => line.trim())
    
    console.log(`\n📋 CSV has ${lines.length} lines`)
    
    if (lines.length < 2) {
      console.log('❌ CSV file appears to be empty or has no data rows')
      return
    }
    
    // Parse header
    const headers = parseCSVLine(lines[0])
    console.log('\n📋 CSV HEADERS:')
    headers.forEach((header, index) => {
      console.log(`  ${index + 1}. ${header}`)
    })
    
    // Parse data rows
    const rawData = []
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      const columns = parseCSVLine(line)
      if (columns.length >= 2) {
        const rowData = {}
        headers.forEach((header, index) => {
          rowData[header] = columns[index]?.trim() || ''
        })
        
        // Only add if has meaningful data
        const hasData = Object.values(rowData).some(value => value && value !== '')
        if (hasData) {
          rawData.push(rowData)
        }
      }
    }
    
    console.log(`\n✅ Processed ${rawData.length} data rows`)
    
    // Show sample data
    console.log('\n📋 SAMPLE DATA (first 3 rows):')
    rawData.slice(0, 3).forEach((row, index) => {
      console.log(`\nRow ${index + 1}:`)
      Object.entries(row).forEach(([key, value]) => {
        if (value) {
          console.log(`  ${key}: ${value}`)
        }
      })
    })
    
    // Auto-detect column mappings
    console.log('\n🔍 AUTO-DETECTING COLUMNS:')
    
    const codeColumn = headers.find(h => 
      h.toLowerCase().includes('mã') || 
      h.toLowerCase().includes('code') ||
      h.toLowerCase().includes('id') ||
      h.toLowerCase().includes('stt')
    ) || headers[0]
    
    const nameColumn = headers.find(h => 
      h.toLowerCase().includes('tên') || 
      h.toLowerCase().includes('name') ||
      h.toLowerCase().includes('vải')
    ) || headers[1]
    
    const quantityColumn = headers.find(h => 
      h.toLowerCase().includes('số lượng') || 
      h.toLowerCase().includes('tồn') ||
      h.toLowerCase().includes('quantity') ||
      h.toLowerCase().includes('sl')
    ) || headers[2]
    
    const unitColumn = headers.find(h => 
      h.toLowerCase().includes('đơn vị') || 
      h.toLowerCase().includes('unit') ||
      h.toLowerCase().includes('dv')
    ) || headers[3]
    
    console.log(`  📋 Code Column: "${codeColumn}"`)
    console.log(`  📋 Name Column: "${nameColumn}"`)
    console.log(`  📋 Quantity Column: "${quantityColumn}"`)
    console.log(`  📋 Unit Column: "${unitColumn}"`)
    
    // Convert to web app format
    console.log('\n🔄 Converting to web app format...')
    
    const webAppFabrics = rawData.map((row, index) => {
      const code = row[codeColumn] || `VT${String(index + 1).padStart(3, '0')}`
      const name = row[nameColumn] || `Vải ${code}`
      const quantityStr = row[quantityColumn] || '0'
      const quantity = parseInt(quantityStr.replace(/[^\d]/g, '')) || 0
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
        image: undefined // Will be mapped with existing images
      }
    })
    
    // Filter only fabrics with stock > 0 (VẢI TỒN KHO)
    const inStockFabrics = webAppFabrics.filter(f => f.stock > 0)
    
    console.log(`\n📊 FILTERING RESULTS:`)
    console.log(`  📦 Total fabrics: ${webAppFabrics.length}`)
    console.log(`  ✅ In stock: ${inStockFabrics.length}`)
    console.log(`  ❌ Out of stock: ${webAppFabrics.length - inStockFabrics.length}`)
    
    // Create output data (ONLY IN-STOCK FABRICS)
    const outputData = {
      metadata: {
        source: 'anhhung.csv (from anhhung.xlsx)',
        processedAt: new Date().toISOString(),
        totalItems: inStockFabrics.length,
        totalStock: inStockFabrics.reduce((sum, f) => sum + f.stock, 0),
        averageStock: Math.round(inStockFabrics.reduce((sum, f) => sum + f.stock, 0) / inStockFabrics.length),
        units: [...new Set(inStockFabrics.map(f => f.unit))],
        description: 'Dữ liệu vải tồn kho - CHỈ VẢI CÒN TỒN KHO (stock > 0)'
      },
      fabrics: inStockFabrics
    }
    
    // Save files
    const jsonPath = path.join(process.cwd(), 'anhhung-fabrics.json')
    fs.writeFileSync(jsonPath, JSON.stringify(outputData, null, 2))
    console.log(`\n💾 Saved JSON to: ${jsonPath}`)
    
    // Copy to public and src/data
    const publicPath = path.join(process.cwd(), 'public/anhhung-fabrics.json')
    fs.writeFileSync(publicPath, JSON.stringify(outputData, null, 2))
    console.log(`📁 Copied to public: ${publicPath}`)
    
    const srcDataPath = path.join(process.cwd(), 'src/data/anhhung-fabrics.json')
    fs.writeFileSync(srcDataPath, JSON.stringify(outputData, null, 2))
    console.log(`📁 Copied to src/data: ${srcDataPath}`)
    
    // Generate summary
    console.log('\n📊 FINAL SUMMARY:')
    console.log(`📄 Source: anhhung.csv`)
    console.log(`📊 Fabrics in stock: ${outputData.metadata.totalItems}`)
    console.log(`📦 Total stock: ${outputData.metadata.totalStock} units`)
    console.log(`📊 Average stock: ${outputData.metadata.averageStock} units per fabric`)
    console.log(`📋 Units: ${outputData.metadata.units.join(', ')}`)
    
    // Show top fabrics by stock
    const topFabrics = inStockFabrics
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 5)
    
    console.log('\n🏆 TOP 5 FABRICS BY STOCK:')
    topFabrics.forEach((fabric, index) => {
      console.log(`  ${index + 1}. ${fabric.code} - ${fabric.name} (${fabric.stock} ${fabric.unit})`)
    })
    
    console.log('\n🎉 PROCESSING COMPLETE!')
    console.log('🔄 Next: Update web app to use anhhung-fabrics.json')
    console.log('📱 Web app will show ONLY fabrics with stock > 0')
    console.log('🖼️ Images will be mapped from existing Cloudinary/static sources')
    
  } catch (error) {
    console.error('❌ Error processing CSV:', error)
  }
}

// Run the processor
processAnhHungCSV().catch(console.error)
