#!/usr/bin/env node

/**
 * 🔍 CLOUDINARY COMPLETE AUDIT
 * Ninh ơi, script này lấy TOÀN BỘ danh sách ảnh trên Cloudinary
 * và phân tích chi tiết codes còn thiếu
 */

import fs from 'fs'
import path from 'path'
import https from 'https'
import crypto from 'crypto'

// Cloudinary config
const CLOUD_NAME = 'dgaktc3fb'
const API_KEY = '917768158798778'
const API_SECRET = process.env.VITE_CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET || 'ZkCVC7alaaSgcnW5kVXYQbxL5uU'

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
 * Generate Cloudinary API signature
 */
function generateSignature(params, apiSecret) {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&')
  
  return crypto
    .createHash('sha1')
    .update(sortedParams + apiSecret)
    .digest('hex')
}

/**
 * Get all images from Cloudinary using Admin API
 */
async function getAllCloudinaryImages() {
  if (API_SECRET === 'your_api_secret_here') {
    console.log('⚠️  No API Secret provided. Using alternative method...')
    return getAllImagesByTesting()
  }

  console.log('☁️ Fetching all images from Cloudinary Admin API...')
  
  try {
    const timestamp = Math.round(Date.now() / 1000)
    const params = {
      timestamp,
      resource_type: 'image',
      type: 'upload',
      prefix: 'fabrics/',
      max_results: 500
    }
    
    const signature = generateSignature(params, API_SECRET)
    
    const postData = new URLSearchParams({
      ...params,
      api_key: API_KEY,
      signature
    }).toString()
    
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.cloudinary.com',
        path: `/v1_1/${CLOUD_NAME}/resources/image`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      }
      
      const req = https.request(options, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          try {
            const result = JSON.parse(data)
            if (result.resources) {
              console.log(`✅ Found ${result.resources.length} images via Admin API`)
              resolve(result.resources.map(r => r.public_id.replace('fabrics/', '')))
            } else {
              console.log('❌ Admin API failed, using alternative method...')
              getAllImagesByTesting().then(resolve)
            }
          } catch (error) {
            console.log('❌ Admin API error, using alternative method...')
            getAllImagesByTesting().then(resolve)
          }
        })
      })
      
      req.on('error', () => {
        console.log('❌ Admin API network error, using alternative method...')
        getAllImagesByTesting().then(resolve)
      })
      
      req.write(postData)
      req.end()
    })
  } catch (error) {
    console.log('❌ Admin API exception, using alternative method...')
    return getAllImagesByTesting()
  }
}

/**
 * Alternative method: Test known patterns to discover images
 */
async function getAllImagesByTesting() {
  console.log('🔍 Using intelligent testing method to discover images...')
  
  const discoveredImages = new Set()
  
  // Test known working images first
  const knownImages = [
    '71022-10', 'FB15144A3', 'YB0320-7', '07013D-88', '089C-1',
    '09-730-17', '10-780-1402', '10-780-17', '10-780-316', 
    '10-780-41', '10-780-5', '131-254', '22D-990-8'
  ]
  
  console.log('Testing known images...')
  for (const image of knownImages) {
    const exists = await testImageExists(image)
    if (exists) {
      discoveredImages.add(image)
    }
  }
  
  // Test common patterns
  console.log('Testing common patterns...')
  const patterns = [
    // Numbers with dashes
    ...generateNumberPatterns(),
    // FB codes
    ...generateFBPatterns(),
    // YB codes  
    ...generateYBPatterns(),
    // Other common patterns
    ...generateOtherPatterns()
  ]
  
  let tested = 0
  for (const pattern of patterns) {
    if (tested % 50 === 0) {
      process.stdout.write(`\r   Tested ${tested}/${patterns.length} patterns...`)
    }
    
    const exists = await testImageExists(pattern)
    if (exists) {
      discoveredImages.add(pattern)
    }
    
    tested++
    
    // Small delay to avoid overwhelming Cloudinary
    if (tested % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  console.log(`\n✅ Discovered ${discoveredImages.size} images via testing`)
  return Array.from(discoveredImages)
}

/**
 * Generate number-based patterns
 */
function generateNumberPatterns() {
  const patterns = []
  
  // Pattern: XXXXX-XX
  for (let i = 10000; i <= 99999; i += 1000) {
    for (let j = 1; j <= 20; j++) {
      patterns.push(`${i}-${j}`)
    }
  }
  
  // Pattern: XX-XXX-XX
  for (let i = 10; i <= 99; i += 5) {
    for (let j = 100; j <= 999; j += 50) {
      for (let k = 1; k <= 20; k += 2) {
        patterns.push(`${i}-${j}-${k}`)
      }
    }
  }
  
  return patterns.slice(0, 200) // Limit for performance
}

/**
 * Generate FB patterns
 */
function generateFBPatterns() {
  const patterns = []
  
  for (let i = 15100; i <= 15200; i++) {
    for (const suffix of ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A21']) {
      patterns.push(`FB${i}${suffix}`)
    }
  }
  
  return patterns
}

/**
 * Generate YB patterns
 */
function generateYBPatterns() {
  const patterns = []
  
  for (let i = 1; i <= 999; i++) {
    patterns.push(`YB${i.toString().padStart(3, '0')}`)
    patterns.push(`YB${i.toString().padStart(4, '0')}-${Math.floor(Math.random() * 10) + 1}`)
  }
  
  return patterns.slice(0, 100)
}

/**
 * Generate other common patterns
 */
function generateOtherPatterns() {
  const prefixes = ['AS', 'DCR', 'FS', 'HY', 'JK', 'N', 'SG', 'W']
  const patterns = []
  
  for (const prefix of prefixes) {
    for (let i = 1; i <= 999; i += 10) {
      patterns.push(`${prefix}${i}`)
      patterns.push(`${prefix}-${i}`)
      patterns.push(`${prefix}${i}-${Math.floor(Math.random() * 10) + 1}`)
    }
  }
  
  return patterns.slice(0, 200)
}

/**
 * Test if image exists
 */
async function testImageExists(imageName) {
  return new Promise((resolve) => {
    try {
      const url = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/fabrics/${encodeURIComponent(imageName)}`
      const urlObj = new URL(url)
      
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname,
        method: 'HEAD',
        timeout: 2000
      }
      
      const req = https.request(options, (res) => {
        resolve(res.statusCode === 200)
      })
      
      req.on('error', () => resolve(false))
      req.on('timeout', () => {
        req.destroy()
        resolve(false)
      })
      
      req.end()
    } catch (error) {
      resolve(false)
    }
  })
}

/**
 * Analyze missing codes
 */
function analyzeMissingCodes(fabricCodes, cloudinaryImages) {
  const missing = []
  const found = []
  
  for (const code of fabricCodes) {
    const exists = cloudinaryImages.includes(code)
    if (exists) {
      found.push(code)
    } else {
      // Analyze why missing
      const analysis = {
        code,
        reasons: []
      }
      
      if (code.includes(' ')) {
        analysis.reasons.push('Contains spaces')
      }
      if (code.includes('/')) {
        analysis.reasons.push('Contains forward slash')
      }
      if (code.includes('\\')) {
        analysis.reasons.push('Contains backslash')
      }
      if (/[^\w\s\-.]/.test(code)) {
        analysis.reasons.push('Contains special characters')
      }
      if (code.length > 25) {
        analysis.reasons.push('Very long name')
      }
      if (code.length < 3) {
        analysis.reasons.push('Very short name')
      }
      if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(code)) {
        analysis.reasons.push('Contains Vietnamese characters')
      }
      
      if (analysis.reasons.length === 0) {
        analysis.reasons.push('Unknown - may need manual upload')
      }
      
      missing.push(analysis)
    }
  }
  
  return { missing, found }
}

/**
 * Main audit function
 */
async function runCompleteAudit() {
  console.log('🔍 CLOUDINARY COMPLETE AUDIT')
  console.log('═══════════════════════════════════════════════════════════════\n')
  
  // Load fabric codes
  console.log('📂 Loading fabric codes from CSV...')
  const fabricCodes = await loadFabricCodes()
  console.log(`✅ Loaded ${fabricCodes.length} fabric codes\n`)
  
  // Get all Cloudinary images
  const cloudinaryImages = await getAllCloudinaryImages()
  console.log(`☁️ Total images on Cloudinary: ${cloudinaryImages.length}\n`)
  
  // Analyze missing codes
  console.log('🔍 Analyzing missing codes...')
  const { missing, found } = analyzeMissingCodes(fabricCodes, cloudinaryImages)
  
  // Generate report
  const report = `
📊 CLOUDINARY COMPLETE AUDIT REPORT
Generated: ${new Date().toLocaleString()}

═══════════════════════════════════════════════════════════════

📈 OVERVIEW STATISTICS
═══════════════════════════════════════════════════════════════
Total Fabric Codes in CSV: ${fabricCodes.length}
Total Images on Cloudinary: ${cloudinaryImages.length}
Successfully Mapped: ${found.length} (${((found.length / fabricCodes.length) * 100).toFixed(1)}%)
Missing Images: ${missing.length} (${((missing.length / fabricCodes.length) * 100).toFixed(1)}%)

═══════════════════════════════════════════════════════════════

✅ SUCCESSFULLY MAPPED (${found.length} codes)
═══════════════════════════════════════════════════════════════
${found.slice(0, 20).join('\n')}${found.length > 20 ? `\n... and ${found.length - 20} more` : ''}

═══════════════════════════════════════════════════════════════

❌ MISSING IMAGES ANALYSIS (${missing.length} codes)
═══════════════════════════════════════════════════════════════
${missing.slice(0, 30).map(m => `${m.code} → ${m.reasons.join(', ')}`).join('\n')}${missing.length > 30 ? `\n... and ${missing.length - 30} more` : ''}

═══════════════════════════════════════════════════════════════

🔍 MISSING CODES BY REASON
═══════════════════════════════════════════════════════════════
${generateReasonStats(missing)}

═══════════════════════════════════════════════════════════════

☁️ CLOUDINARY IMAGES (${cloudinaryImages.length} total)
═══════════════════════════════════════════════════════════════
${cloudinaryImages.slice(0, 50).join('\n')}${cloudinaryImages.length > 50 ? `\n... and ${cloudinaryImages.length - 50} more` : ''}

═══════════════════════════════════════════════════════════════

💡 RECOMMENDATIONS
═══════════════════════════════════════════════════════════════
1. Upload missing images for high-priority codes
2. Standardize naming convention for special characters
3. Create mapping table for Vietnamese characters
4. Implement bulk upload tool for remaining codes

═══════════════════════════════════════════════════════════════
`
  
  console.log(report)
  
  // Save files
  const reportPath = path.join(process.cwd(), 'cloudinary-complete-audit.txt')
  fs.writeFileSync(reportPath, report)
  console.log(`📄 Report saved to: ${reportPath}`)
  
  const dataPath = path.join(process.cwd(), 'cloudinary-audit-data.json')
  fs.writeFileSync(dataPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    fabricCodes,
    cloudinaryImages,
    found,
    missing,
    stats: {
      totalCodes: fabricCodes.length,
      totalImages: cloudinaryImages.length,
      mapped: found.length,
      missing: missing.length,
      mappingRate: ((found.length / fabricCodes.length) * 100).toFixed(1) + '%'
    }
  }, null, 2))
  console.log(`📊 Data saved to: ${dataPath}`)
}

/**
 * Generate reason statistics
 */
function generateReasonStats(missing) {
  const reasonCounts = {}
  
  missing.forEach(m => {
    m.reasons.forEach(reason => {
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1
    })
  })
  
  return Object.entries(reasonCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([reason, count]) => `${reason}: ${count} codes`)
    .join('\n')
}

// Run the complete audit
runCompleteAudit().catch(console.error)
