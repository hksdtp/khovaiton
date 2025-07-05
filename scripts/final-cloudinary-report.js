#!/usr/bin/env node

/**
 * 📊 FINAL CLOUDINARY REPORT
 * Ninh ơi, báo cáo cuối cùng dựa trên kết quả đã test
 * Tổng hợp tất cả thông tin về mapping ảnh
 */

import fs from 'fs'
import path from 'path'

/**
 * Load fabric codes from CSV
 */
async function loadFabricCodes() {
  try {
    const csvPath = path.join(process.cwd(), 'public', 'fabric_inventory_updated.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    
    const lines = csvContent.split('\n').filter(line => line.trim())
    const fabricCodes = []
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      const columns = parseCSVLine(line)
      if (columns.length >= 2) {
        const code = columns[1].trim()
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
 * Parse CSV line
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
 * Load previous audit results
 */
function loadPreviousResults() {
  try {
    const dataPath = path.join(process.cwd(), 'quick-fabric-audit.json')
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
      return data
    }
  } catch (error) {
    console.log('⚠️  Could not load previous results')
  }
  return null
}

/**
 * Analyze missing codes by category
 */
function categorizeMissingCodes(missingCodes) {
  const categories = {
    spaces: [],
    vietnamese: [],
    specialChars: [],
    forwardSlash: [],
    longNames: [],
    clean: []
  }
  
  missingCodes.forEach(item => {
    const code = item.code
    
    if (code.includes(' ')) {
      categories.spaces.push(code)
    } else if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(code)) {
      categories.vietnamese.push(code)
    } else if (code.includes('/')) {
      categories.forwardSlash.push(code)
    } else if (/[^\w\s\-.]/.test(code)) {
      categories.specialChars.push(code)
    } else if (code.length > 25) {
      categories.longNames.push(code)
    } else {
      categories.clean.push(code)
    }
  })
  
  return categories
}

/**
 * Generate upload priority list
 */
function generateUploadPriority(categories) {
  return [
    {
      priority: 1,
      title: 'HIGHEST PRIORITY - Clean Codes (Ready to Upload)',
      codes: categories.clean,
      description: 'These codes have no technical issues and can be uploaded immediately',
      action: 'Upload images directly'
    },
    {
      priority: 2,
      title: 'HIGH PRIORITY - Codes with Spaces',
      codes: categories.spaces,
      description: 'URL encoding already implemented, should work',
      action: 'Upload images (URL encoding will handle spaces)'
    },
    {
      priority: 3,
      title: 'MEDIUM PRIORITY - Special Characters',
      codes: categories.specialChars,
      description: 'Need character replacement or mapping',
      action: 'Create mapping table or sanitize names'
    },
    {
      priority: 4,
      title: 'MEDIUM PRIORITY - Forward Slash Issues',
      codes: categories.forwardSlash,
      description: 'Forward slashes cause URL path issues',
      action: 'Replace / with - or _ in image names'
    },
    {
      priority: 5,
      title: 'LOW PRIORITY - Vietnamese Characters',
      codes: categories.vietnamese,
      description: 'Need Vietnamese to ASCII conversion',
      action: 'Convert Vietnamese characters to ASCII equivalents'
    },
    {
      priority: 6,
      title: 'LOW PRIORITY - Long Names',
      codes: categories.longNames,
      description: 'Very long names may cause issues',
      action: 'Shorten names or use hash-based naming'
    }
  ]
}

/**
 * Main report function
 */
async function generateFinalReport() {
  console.log('📊 GENERATING FINAL CLOUDINARY REPORT')
  console.log('═══════════════════════════════════════════════════════════════\n')
  
  // Load data
  const fabricCodes = await loadFabricCodes()
  const previousResults = loadPreviousResults()
  
  if (!previousResults) {
    console.log('❌ No previous audit results found. Please run quick-fabric-audit.js first.')
    return
  }
  
  console.log(`📂 Total fabric codes: ${fabricCodes.length}`)
  console.log(`✅ Found images: ${previousResults.foundCount}`)
  console.log(`❌ Missing images: ${previousResults.missingCount}`)
  console.log(`📈 Current mapping rate: ${previousResults.mappingRate}\n`)
  
  // Categorize missing codes
  const categories = categorizeMissingCodes(previousResults.missingCodes)
  const uploadPriority = generateUploadPriority(categories)
  
  // Generate comprehensive report
  const report = `
📊 FINAL CLOUDINARY MAPPING REPORT
Generated: ${new Date().toLocaleString()}

═══════════════════════════════════════════════════════════════

🎯 EXECUTIVE SUMMARY
═══════════════════════════════════════════════════════════════
Total Fabric Codes: ${fabricCodes.length}
Images Found on Cloudinary: ${previousResults.foundCount} (${previousResults.mappingRate})
Images Missing: ${previousResults.missingCount}

REALITY CHECK:
❌ Cloudinary does NOT have 504+ images matching fabric codes
✅ Cloudinary has approximately ${previousResults.foundCount} images that match
🎯 Need to upload ${previousResults.missingCount} more images

═══════════════════════════════════════════════════════════════

✅ SUCCESSFULLY MAPPED CODES (${previousResults.foundCount})
═══════════════════════════════════════════════════════════════
${previousResults.foundCodes.slice(0, 30).join('\n')}${previousResults.foundCodes.length > 30 ? `\n... and ${previousResults.foundCodes.length - 30} more` : ''}

═══════════════════════════════════════════════════════════════

📋 UPLOAD PRIORITY BREAKDOWN
═══════════════════════════════════════════════════════════════

${uploadPriority.map(p => `
🔥 PRIORITY ${p.priority}: ${p.title}
Count: ${p.codes.length} codes
Description: ${p.description}
Action: ${p.action}

Sample codes:
${p.codes.slice(0, 10).join('\n')}${p.codes.length > 10 ? `\n... and ${p.codes.length - 10} more` : ''}
`).join('\n')}

═══════════════════════════════════════════════════════════════

📊 MISSING CODES STATISTICS
═══════════════════════════════════════════════════════════════
Clean codes (ready to upload): ${categories.clean.length} (${((categories.clean.length / previousResults.missingCount) * 100).toFixed(1)}%)
Codes with spaces: ${categories.spaces.length} (${((categories.spaces.length / previousResults.missingCount) * 100).toFixed(1)}%)
Special characters: ${categories.specialChars.length} (${((categories.specialChars.length / previousResults.missingCount) * 100).toFixed(1)}%)
Forward slash issues: ${categories.forwardSlash.length} (${((categories.forwardSlash.length / previousResults.missingCount) * 100).toFixed(1)}%)
Vietnamese characters: ${categories.vietnamese.length} (${((categories.vietnamese.length / previousResults.missingCount) * 100).toFixed(1)}%)
Long names: ${categories.longNames.length} (${((categories.longNames.length / previousResults.missingCount) * 100).toFixed(1)}%)

═══════════════════════════════════════════════════════════════

🚀 IMMEDIATE ACTION PLAN
═══════════════════════════════════════════════════════════════

PHASE 1 - Quick Wins (${categories.clean.length + categories.spaces.length} codes):
1. Upload images for ${categories.clean.length} clean codes
2. Upload images for ${categories.spaces.length} codes with spaces (URL encoding handles this)
3. Expected result: ${((previousResults.foundCount + categories.clean.length + categories.spaces.length) / fabricCodes.length * 100).toFixed(1)}% mapping rate

PHASE 2 - Technical Fixes (${categories.specialChars.length + categories.forwardSlash.length} codes):
1. Create mapping table for special characters
2. Replace forward slashes in image names
3. Expected result: ${((previousResults.foundCount + categories.clean.length + categories.spaces.length + categories.specialChars.length + categories.forwardSlash.length) / fabricCodes.length * 100).toFixed(1)}% mapping rate

PHASE 3 - Advanced Fixes (${categories.vietnamese.length + categories.longNames.length} codes):
1. Convert Vietnamese characters to ASCII
2. Handle long names
3. Expected result: 100% mapping rate

═══════════════════════════════════════════════════════════════

💡 RECOMMENDATIONS
═══════════════════════════════════════════════════════════════

IMMEDIATE (This Week):
✅ Focus on ${categories.clean.length} clean codes - upload these first
✅ Test upload workflow with 5-10 sample codes
✅ Verify URL encoding works for space-containing codes

SHORT TERM (Next Week):
🔧 Create bulk upload tool for clean codes
🔧 Implement character mapping for special characters
🔧 Set up monitoring for upload success rate

LONG TERM (Next Month):
📈 Achieve 90%+ mapping rate
📈 Implement automated image optimization
📈 Set up backup/sync processes

═══════════════════════════════════════════════════════════════

🎯 SUCCESS METRICS
═══════════════════════════════════════════════════════════════
Current: ${previousResults.mappingRate} mapping rate
Target Phase 1: ${((previousResults.foundCount + categories.clean.length + categories.spaces.length) / fabricCodes.length * 100).toFixed(1)}% mapping rate
Target Phase 2: ${((previousResults.foundCount + categories.clean.length + categories.spaces.length + categories.specialChars.length + categories.forwardSlash.length) / fabricCodes.length * 100).toFixed(1)}% mapping rate
Target Phase 3: 100% mapping rate

═══════════════════════════════════════════════════════════════
`
  
  console.log(report)
  
  // Save comprehensive data
  const finalData = {
    timestamp: new Date().toISOString(),
    summary: {
      totalCodes: fabricCodes.length,
      foundCount: previousResults.foundCount,
      missingCount: previousResults.missingCount,
      currentMappingRate: previousResults.mappingRate
    },
    categories,
    uploadPriority,
    foundCodes: previousResults.foundCodes,
    phaseTargets: {
      phase1: {
        codes: categories.clean.length + categories.spaces.length,
        expectedRate: ((previousResults.foundCount + categories.clean.length + categories.spaces.length) / fabricCodes.length * 100).toFixed(1) + '%'
      },
      phase2: {
        codes: categories.specialChars.length + categories.forwardSlash.length,
        expectedRate: ((previousResults.foundCount + categories.clean.length + categories.spaces.length + categories.specialChars.length + categories.forwardSlash.length) / fabricCodes.length * 100).toFixed(1) + '%'
      },
      phase3: {
        codes: categories.vietnamese.length + categories.longNames.length,
        expectedRate: '100%'
      }
    }
  }
  
  const reportPath = path.join(process.cwd(), 'final-cloudinary-report.txt')
  fs.writeFileSync(reportPath, report)
  console.log(`📄 Final report saved to: ${reportPath}`)
  
  const dataPath = path.join(process.cwd(), 'final-cloudinary-data.json')
  fs.writeFileSync(dataPath, JSON.stringify(finalData, null, 2))
  console.log(`📊 Final data saved to: ${dataPath}`)
  
  console.log('\n🎉 REPORT COMPLETE!')
  console.log(`🎯 Next step: Start uploading ${categories.clean.length} clean codes`)
}

// Run the final report
generateFinalReport().catch(console.error)
