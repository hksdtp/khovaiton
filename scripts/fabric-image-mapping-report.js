#!/usr/bin/env node

/**
 * 📊 FABRIC IMAGE MAPPING REPORT
 * Ninh ơi, script này tạo báo cáo chi tiết về việc mapping ảnh vào web app
 * 
 * Phân tích:
 * 1. Tổng số fabric codes trong web app
 * 2. Số ảnh được map thành công từ Cloudinary
 * 3. Số ảnh bị lỗi 404 và lý do
 * 4. Phân tích pattern và đề xuất giải pháp
 */

import fs from 'fs'
import path from 'path'
import https from 'https'

// Cloudinary config
const CLOUD_NAME = 'dgaktc3fb'
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`

/**
 * Load fabric codes from CSV file
 */
async function loadFabricCodes() {
  try {
    const csvPath = path.join(process.cwd(), 'public', 'fabric_inventory_updated.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    
    const lines = csvContent.split('\n').filter(line => line.trim())
    const fabricCodes = []
    
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      // Parse CSV line (handle quoted fields)
      const columns = parseCSVLine(line)
      if (columns.length >= 2) {
        const code = columns[1].trim() // Code is in column 2 (index 1)
        if (code && code !== 'Mã vải') {
          fabricCodes.push(code)
        }
      }
    }
    
    return fabricCodes
  } catch (error) {
    console.error('❌ Error loading fabric codes:', error)
    return []
  }
}

/**
 * Parse CSV line handling quoted fields
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

/**
 * Check if Cloudinary image exists
 */
async function checkCloudinaryImage(fabricCode) {
  return new Promise((resolve) => {
    try {
      // Generate Cloudinary URL
      const encodedCode = encodeURIComponent(fabricCode)
      const url = `${CLOUDINARY_BASE_URL}/fabrics/${encodedCode}`
      
      // Make HEAD request to check if image exists
      const urlObj = new URL(url)
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: 'HEAD',
        timeout: 5000
      }
      
      const req = https.request(options, (res) => {
        resolve({
          fabricCode,
          exists: res.statusCode === 200,
          statusCode: res.statusCode,
          url
        })
      })
      
      req.on('error', () => {
        resolve({
          fabricCode,
          exists: false,
          statusCode: 'ERROR',
          url,
          error: 'Network error'
        })
      })
      
      req.on('timeout', () => {
        req.destroy()
        resolve({
          fabricCode,
          exists: false,
          statusCode: 'TIMEOUT',
          url,
          error: 'Request timeout'
        })
      })
      
      req.end()
    } catch (error) {
      resolve({
        fabricCode,
        exists: false,
        statusCode: 'ERROR',
        url: '',
        error: error.message
      })
    }
  })
}

/**
 * Analyze fabric code patterns
 */
function analyzeFabricCodePatterns(fabricCodes) {
  const patterns = {
    withSpaces: [],
    withDashes: [],
    withNumbers: [],
    withSpecialChars: [],
    longCodes: [],
    shortCodes: []
  }
  
  fabricCodes.forEach(code => {
    if (code.includes(' ')) patterns.withSpaces.push(code)
    if (code.includes('-')) patterns.withDashes.push(code)
    if (/\d/.test(code)) patterns.withNumbers.push(code)
    if (/[^a-zA-Z0-9\s\-]/.test(code)) patterns.withSpecialChars.push(code)
    if (code.length > 20) patterns.longCodes.push(code)
    if (code.length < 5) patterns.shortCodes.push(code)
  })
  
  return patterns
}

/**
 * Generate detailed report
 */
async function generateReport() {
  console.log('🚀 Starting Fabric Image Mapping Analysis...\n')
  
  // Load fabric codes
  console.log('📂 Loading fabric codes from CSV...')
  const fabricCodes = await loadFabricCodes()
  console.log(`✅ Loaded ${fabricCodes.length} fabric codes\n`)
  
  if (fabricCodes.length === 0) {
    console.log('❌ No fabric codes found. Please check CSV file.')
    return
  }
  
  // Analyze patterns
  console.log('🔍 Analyzing fabric code patterns...')
  const patterns = analyzeFabricCodePatterns(fabricCodes)
  
  // Check Cloudinary images (sample first 50 for speed)
  console.log('☁️ Checking Cloudinary images (sample)...')
  const sampleCodes = fabricCodes.slice(0, 50)
  const imageResults = []
  
  for (let i = 0; i < sampleCodes.length; i++) {
    const code = sampleCodes[i]
    process.stdout.write(`\r   Checking ${i + 1}/${sampleCodes.length}: ${code.substring(0, 20)}...`)
    
    const result = await checkCloudinaryImage(code)
    imageResults.push(result)
    
    // Small delay to avoid overwhelming Cloudinary
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  console.log('\n')
  
  // Generate statistics
  const stats = {
    total: fabricCodes.length,
    sampleSize: sampleCodes.length,
    mapped: imageResults.filter(r => r.exists).length,
    missing: imageResults.filter(r => !r.exists).length,
    errors: imageResults.filter(r => r.error).length
  }
  
  // Generate report
  const report = `
📊 FABRIC IMAGE MAPPING REPORT
Generated: ${new Date().toLocaleString()}

═══════════════════════════════════════════════════════════════

📈 OVERVIEW STATISTICS
═══════════════════════════════════════════════════════════════
Total Fabric Codes in Web App: ${stats.total}
Sample Tested: ${stats.sampleSize}
Successfully Mapped: ${stats.mapped} (${((stats.mapped / stats.sampleSize) * 100).toFixed(1)}%)
Missing Images: ${stats.missing} (${((stats.missing / stats.sampleSize) * 100).toFixed(1)}%)
Network Errors: ${stats.errors}

═══════════════════════════════════════════════════════════════

✅ SUCCESSFULLY MAPPED IMAGES
═══════════════════════════════════════════════════════════════
${imageResults.filter(r => r.exists).map(r => `✓ ${r.fabricCode}`).join('\n') || 'None found in sample'}

═══════════════════════════════════════════════════════════════

❌ MISSING IMAGES (404 Errors)
═══════════════════════════════════════════════════════════════
${imageResults.filter(r => !r.exists && !r.error).map(r => `✗ ${r.fabricCode} (Status: ${r.statusCode})`).join('\n') || 'None in sample'}

═══════════════════════════════════════════════════════════════

🔍 FABRIC CODE PATTERN ANALYSIS
═══════════════════════════════════════════════════════════════
Codes with Spaces: ${patterns.withSpaces.length} (${((patterns.withSpaces.length / stats.total) * 100).toFixed(1)}%)
Codes with Dashes: ${patterns.withDashes.length} (${((patterns.withDashes.length / stats.total) * 100).toFixed(1)}%)
Codes with Numbers: ${patterns.withNumbers.length} (${((patterns.withNumbers.length / stats.total) * 100).toFixed(1)}%)
Codes with Special Chars: ${patterns.withSpecialChars.length} (${((patterns.withSpecialChars.length / stats.total) * 100).toFixed(1)}%)
Long Codes (>20 chars): ${patterns.longCodes.length} (${((patterns.longCodes.length / stats.total) * 100).toFixed(1)}%)
Short Codes (<5 chars): ${patterns.shortCodes.length} (${((patterns.shortCodes.length / stats.total) * 100).toFixed(1)}%)

═══════════════════════════════════════════════════════════════

🚨 COMMON ISSUES & CAUSES
═══════════════════════════════════════════════════════════════
1. URL Encoding Issues:
   - Spaces in fabric codes need proper encoding
   - Special characters may cause 404 errors
   
2. Naming Inconsistencies:
   - Fabric codes in CSV vs uploaded image names
   - Case sensitivity differences
   
3. Missing Uploads:
   - Not all fabric codes have corresponding images
   - Images may exist but with different naming

═══════════════════════════════════════════════════════════════

💡 RECOMMENDATIONS
═══════════════════════════════════════════════════════════════
1. IMMEDIATE FIXES:
   ✓ URL encoding is already implemented
   ✓ Cloudinary overwrite is enabled
   
2. IMPROVE MAPPING:
   • Upload missing images for high-priority fabric codes
   • Standardize fabric code naming convention
   • Create mapping table for code variations
   
3. MONITORING:
   • Regular checks for new fabric codes
   • Automated image upload workflow
   • Error logging for failed image loads

═══════════════════════════════════════════════════════════════

🎯 NEXT STEPS
═══════════════════════════════════════════════════════════════
1. Review missing images list
2. Upload priority fabric images
3. Implement bulk upload tool
4. Set up monitoring dashboard

═══════════════════════════════════════════════════════════════
`
  
  // Save report to file
  const reportPath = path.join(process.cwd(), 'fabric-image-mapping-report.txt')
  fs.writeFileSync(reportPath, report)
  
  console.log(report)
  console.log(`\n📄 Report saved to: ${reportPath}`)
  
  // Save detailed data as JSON
  const detailedData = {
    timestamp: new Date().toISOString(),
    stats,
    patterns,
    imageResults,
    fabricCodes: fabricCodes.slice(0, 100) // First 100 codes
  }
  
  const dataPath = path.join(process.cwd(), 'fabric-image-mapping-data.json')
  fs.writeFileSync(dataPath, JSON.stringify(detailedData, null, 2))
  console.log(`📊 Detailed data saved to: ${dataPath}`)
}

// Run the report
generateReport().catch(console.error)
