#!/usr/bin/env node

/**
 * 🚀 QUICK FABRIC AUDIT
 * Ninh ơi, script này test trực tiếp 331 fabric codes với Cloudinary
 * Nhanh và chính xác hơn!
 */

import fs from 'fs'
import path from 'path'
import https from 'https'

const CLOUD_NAME = 'dgaktc3fb'

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
 * Test if image exists on Cloudinary
 */
async function testImageExists(fabricCode) {
  return new Promise((resolve) => {
    try {
      const encodedCode = encodeURIComponent(fabricCode)
      const url = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/fabrics/${encodedCode}`
      
      const urlObj = new URL(url)
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname,
        method: 'HEAD',
        timeout: 3000
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
 * Analyze why a code is missing
 */
function analyzeWhyMissing(fabricCode) {
  const reasons = []
  
  if (fabricCode.includes(' ')) {
    reasons.push('Contains spaces')
  }
  if (fabricCode.includes('/')) {
    reasons.push('Contains forward slash (/)')
  }
  if (fabricCode.includes('\\')) {
    reasons.push('Contains backslash (\\)')
  }
  if (fabricCode.includes('%')) {
    reasons.push('Contains percent sign (%)')
  }
  if (fabricCode.includes('&')) {
    reasons.push('Contains ampersand (&)')
  }
  if (fabricCode.includes('+')) {
    reasons.push('Contains plus sign (+)')
  }
  if (fabricCode.includes('=')) {
    reasons.push('Contains equals sign (=)')
  }
  if (fabricCode.includes('?')) {
    reasons.push('Contains question mark (?)')
  }
  if (fabricCode.includes('#')) {
    reasons.push('Contains hash (#)')
  }
  if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(fabricCode)) {
    reasons.push('Contains Vietnamese characters')
  }
  if (fabricCode.length > 30) {
    reasons.push('Very long name (>30 chars)')
  }
  if (fabricCode.length < 2) {
    reasons.push('Very short name (<2 chars)')
  }
  if (/[^\w\s\-.]/.test(fabricCode)) {
    reasons.push('Contains other special characters')
  }
  
  if (reasons.length === 0) {
    reasons.push('Unknown reason - may need manual upload')
  }
  
  return reasons
}

/**
 * Main audit function
 */
async function runQuickAudit() {
  console.log('🚀 QUICK FABRIC AUDIT')
  console.log('═══════════════════════════════════════════════════════════════\n')
  
  // Load fabric codes
  console.log('📂 Loading fabric codes from CSV...')
  const fabricCodes = await loadFabricCodes()
  console.log(`✅ Loaded ${fabricCodes.length} fabric codes\n`)
  
  if (fabricCodes.length === 0) {
    console.log('❌ No fabric codes found')
    return
  }
  
  console.log('🔍 Testing all fabric codes with Cloudinary...\n')
  
  const results = []
  const BATCH_SIZE = 10
  
  for (let i = 0; i < fabricCodes.length; i += BATCH_SIZE) {
    const batch = fabricCodes.slice(i, i + BATCH_SIZE)
    
    console.log(`Testing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(fabricCodes.length / BATCH_SIZE)} (codes ${i + 1}-${Math.min(i + BATCH_SIZE, fabricCodes.length)})`)
    
    const batchPromises = batch.map(testImageExists)
    const batchResults = await Promise.all(batchPromises)
    
    results.push(...batchResults)
    
    // Show progress
    const found = batchResults.filter(r => r.exists).length
    console.log(`   ✅ Found: ${found}/${batch.length} in this batch`)
    
    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  // Analyze results
  const found = results.filter(r => r.exists)
  const missing = results.filter(r => !r.exists)
  
  console.log('\n═══════════════════════════════════════════════════════════════')
  console.log('📊 AUDIT RESULTS')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log(`Total Fabric Codes: ${fabricCodes.length}`)
  console.log(`✅ Images Found: ${found.length} (${((found.length / fabricCodes.length) * 100).toFixed(1)}%)`)
  console.log(`❌ Images Missing: ${missing.length} (${((missing.length / fabricCodes.length) * 100).toFixed(1)}%)`)
  console.log('')
  
  if (found.length > 0) {
    console.log('✅ CODES WITH IMAGES:')
    found.slice(0, 20).forEach(r => {
      console.log(`   ${r.fabricCode}`)
    })
    if (found.length > 20) {
      console.log(`   ... and ${found.length - 20} more`)
    }
    console.log('')
  }
  
  if (missing.length > 0) {
    console.log('❌ MISSING CODES WITH ANALYSIS:')
    
    // Analyze missing codes
    const missingWithReasons = missing.map(r => ({
      ...r,
      reasons: analyzeWhyMissing(r.fabricCode)
    }))
    
    missingWithReasons.slice(0, 30).forEach(r => {
      console.log(`   ${r.fabricCode} → ${r.reasons.join(', ')}`)
    })
    
    if (missing.length > 30) {
      console.log(`   ... and ${missing.length - 30} more`)
    }
    console.log('')
    
    // Reason statistics
    console.log('🔍 MISSING REASONS BREAKDOWN:')
    const reasonCounts = {}
    missingWithReasons.forEach(r => {
      r.reasons.forEach(reason => {
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1
      })
    })
    
    Object.entries(reasonCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([reason, count]) => {
        console.log(`   ${reason}: ${count} codes (${((count / missing.length) * 100).toFixed(1)}%)`)
      })
  }
  
  // Save detailed results
  const reportData = {
    timestamp: new Date().toISOString(),
    totalCodes: fabricCodes.length,
    foundCount: found.length,
    missingCount: missing.length,
    mappingRate: ((found.length / fabricCodes.length) * 100).toFixed(1) + '%',
    foundCodes: found.map(r => r.fabricCode),
    missingCodes: missing.map(r => ({
      code: r.fabricCode,
      reasons: analyzeWhyMissing(r.fabricCode),
      statusCode: r.statusCode
    })),
    allResults: results
  }
  
  const dataPath = path.join(process.cwd(), 'quick-fabric-audit.json')
  fs.writeFileSync(dataPath, JSON.stringify(reportData, null, 2))
  console.log(`\n📊 Detailed results saved to: ${dataPath}`)
  
  console.log('\n💡 NEXT STEPS:')
  console.log('1. Review missing codes list')
  console.log('2. Upload images for codes without special character issues')
  console.log('3. Create mapping for codes with naming issues')
  console.log('4. Implement bulk upload tool')
}

// Run the quick audit
runQuickAudit().catch(console.error)
