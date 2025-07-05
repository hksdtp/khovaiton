#!/usr/bin/env node

/**
 * ☁️ CLOUDINARY ADMIN API AUDIT
 * Ninh ơi, script này dùng Admin API để lấy CHÍNH XÁC tất cả ảnh trên Cloudinary
 * Với API Secret: ZkCVC7alaaSgcnW5kVXYQbxL5uU
 */

import fs from 'fs'
import path from 'path'
import https from 'https'
import crypto from 'crypto'

// Cloudinary config
const CLOUD_NAME = 'dgaktc3fb'
const API_KEY = '917768158798778'
const API_SECRET = 'ZkCVC7alaaSgcnW5kVXYQbxL5uU'

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
  console.log('☁️ Fetching ALL images from Cloudinary Admin API...')
  
  const allImages = []
  let nextCursor = null
  let pageCount = 0
  
  do {
    pageCount++
    console.log(`   📄 Fetching page ${pageCount}...`)
    
    try {
      const timestamp = Math.round(Date.now() / 1000)
      const params = {
        timestamp,
        resource_type: 'image',
        type: 'upload',
        max_results: 500
      }
      
      // Add cursor for pagination
      if (nextCursor) {
        params.next_cursor = nextCursor
      }
      
      const signature = generateSignature(params, API_SECRET)
      
      const postData = new URLSearchParams({
        ...params,
        api_key: API_KEY,
        signature
      }).toString()
      
      const pageResult = await new Promise((resolve, reject) => {
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
              if (result.error) {
                reject(new Error(result.error.message))
              } else {
                resolve(result)
              }
            } catch (error) {
              reject(error)
            }
          })
        })
        
        req.on('error', reject)
        req.write(postData)
        req.end()
      })
      
      if (pageResult.resources) {
        allImages.push(...pageResult.resources)
        console.log(`   ✅ Found ${pageResult.resources.length} images on page ${pageCount}`)
        nextCursor = pageResult.next_cursor
      } else {
        break
      }
      
    } catch (error) {
      console.error(`❌ Error fetching page ${pageCount}:`, error.message)
      break
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000))
    
  } while (nextCursor && pageCount < 20) // Safety limit
  
  console.log(`✅ Total images found: ${allImages.length}`)
  return allImages
}

/**
 * Analyze images and fabric codes
 */
function analyzeImagesAndCodes(fabricCodes, cloudinaryImages) {
  console.log('\n🔍 Analyzing images and fabric codes...')
  
  // Extract image names (remove folder prefixes)
  const imageNames = cloudinaryImages.map(img => {
    let name = img.public_id
    
    // Remove common folder prefixes
    if (name.startsWith('fabrics/')) {
      name = name.replace('fabrics/', '')
    }
    if (name.startsWith('fabric_images/')) {
      name = name.replace('fabric_images/', '')
    }
    
    return name
  })
  
  console.log(`📊 Extracted ${imageNames.length} image names`)
  
  // Find exact matches
  const exactMatches = []
  const missingCodes = []
  const extraImages = []
  
  // Check each fabric code
  for (const code of fabricCodes) {
    if (imageNames.includes(code)) {
      exactMatches.push(code)
    } else {
      missingCodes.push(code)
    }
  }
  
  // Find extra images (not in fabric codes)
  for (const imageName of imageNames) {
    if (!fabricCodes.includes(imageName)) {
      extraImages.push(imageName)
    }
  }
  
  return {
    exactMatches,
    missingCodes,
    extraImages,
    imageNames,
    fabricCodes
  }
}

/**
 * Analyze why codes are missing
 */
function analyzeWhyMissing(missingCodes) {
  return missingCodes.map(code => {
    const reasons = []
    
    if (code.includes(' ')) reasons.push('Contains spaces')
    if (code.includes('/')) reasons.push('Contains forward slash (/)')
    if (code.includes('\\')) reasons.push('Contains backslash (\\)')
    if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(code)) {
      reasons.push('Contains Vietnamese characters')
    }
    if (code.length > 30) reasons.push('Very long name (>30 chars)')
    if (code.length < 2) reasons.push('Very short name (<2 chars)')
    if (/[^\w\s\-.]/.test(code)) reasons.push('Contains special characters')
    
    if (reasons.length === 0) {
      reasons.push('No obvious issues - needs manual upload')
    }
    
    return { code, reasons }
  })
}

/**
 * Main audit function
 */
async function runAdminAudit() {
  console.log('☁️ CLOUDINARY ADMIN API AUDIT')
  console.log('═══════════════════════════════════════════════════════════════\n')
  
  // Load fabric codes
  console.log('📂 Loading fabric codes from CSV...')
  const fabricCodes = await loadFabricCodes()
  console.log(`✅ Loaded ${fabricCodes.length} fabric codes\n`)
  
  // Get all Cloudinary images
  const cloudinaryImages = await getAllCloudinaryImages()
  
  // Analyze
  const analysis = analyzeImagesAndCodes(fabricCodes, cloudinaryImages)
  const missingAnalysis = analyzeWhyMissing(analysis.missingCodes)
  
  // Generate report
  const report = `
☁️ CLOUDINARY ADMIN API AUDIT REPORT
Generated: ${new Date().toLocaleString()}

═══════════════════════════════════════════════════════════════

📈 OVERVIEW STATISTICS
═══════════════════════════════════════════════════════════════
Total Fabric Codes in CSV: ${fabricCodes.length}
Total Images on Cloudinary: ${cloudinaryImages.length}
Exact Matches: ${analysis.exactMatches.length} (${((analysis.exactMatches.length / fabricCodes.length) * 100).toFixed(1)}%)
Missing Codes: ${analysis.missingCodes.length} (${((analysis.missingCodes.length / fabricCodes.length) * 100).toFixed(1)}%)
Extra Images: ${analysis.extraImages.length}

═══════════════════════════════════════════════════════════════

✅ EXACT MATCHES (${analysis.exactMatches.length} codes)
═══════════════════════════════════════════════════════════════
${analysis.exactMatches.slice(0, 50).join('\n')}${analysis.exactMatches.length > 50 ? `\n... and ${analysis.exactMatches.length - 50} more` : ''}

═══════════════════════════════════════════════════════════════

❌ MISSING CODES (${analysis.missingCodes.length} codes)
═══════════════════════════════════════════════════════════════
${missingAnalysis.slice(0, 30).map(m => `${m.code} → ${m.reasons.join(', ')}`).join('\n')}${analysis.missingCodes.length > 30 ? `\n... and ${analysis.missingCodes.length - 30} more` : ''}

═══════════════════════════════════════════════════════════════

🔍 MISSING REASONS BREAKDOWN
═══════════════════════════════════════════════════════════════
${generateReasonStats(missingAnalysis)}

═══════════════════════════════════════════════════════════════

📸 EXTRA IMAGES (${analysis.extraImages.length} images not in CSV)
═══════════════════════════════════════════════════════════════
${analysis.extraImages.slice(0, 50).join('\n')}${analysis.extraImages.length > 50 ? `\n... and ${analysis.extraImages.length - 50} more` : ''}

═══════════════════════════════════════════════════════════════

💡 CONCLUSIONS
═══════════════════════════════════════════════════════════════
1. Cloudinary has ${cloudinaryImages.length} total images
2. Only ${analysis.exactMatches.length} match exactly with fabric codes
3. ${analysis.missingCodes.length} fabric codes need images uploaded
4. ${analysis.extraImages.length} images exist but don't match any fabric codes

═══════════════════════════════════════════════════════════════
`
  
  console.log(report)
  
  // Save files
  const reportPath = path.join(process.cwd(), 'cloudinary-admin-audit.txt')
  fs.writeFileSync(reportPath, report)
  console.log(`📄 Report saved to: ${reportPath}`)
  
  const dataPath = path.join(process.cwd(), 'cloudinary-admin-data.json')
  fs.writeFileSync(dataPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    stats: {
      totalCodes: fabricCodes.length,
      totalImages: cloudinaryImages.length,
      exactMatches: analysis.exactMatches.length,
      missingCodes: analysis.missingCodes.length,
      extraImages: analysis.extraImages.length,
      matchRate: ((analysis.exactMatches.length / fabricCodes.length) * 100).toFixed(1) + '%'
    },
    exactMatches: analysis.exactMatches,
    missingCodes: analysis.missingCodes,
    extraImages: analysis.extraImages,
    missingAnalysis,
    allCloudinaryImages: cloudinaryImages.map(img => ({
      public_id: img.public_id,
      format: img.format,
      created_at: img.created_at,
      bytes: img.bytes
    }))
  }, null, 2))
  console.log(`📊 Data saved to: ${dataPath}`)
}

/**
 * Generate reason statistics
 */
function generateReasonStats(missingAnalysis) {
  const reasonCounts = {}
  
  missingAnalysis.forEach(m => {
    m.reasons.forEach(reason => {
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1
    })
  })
  
  return Object.entries(reasonCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([reason, count]) => `${reason}: ${count} codes`)
    .join('\n')
}

// Run the admin audit
runAdminAudit().catch(console.error)
