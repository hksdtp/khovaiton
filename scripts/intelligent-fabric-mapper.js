#!/usr/bin/env node

/**
 * 🧠 INTELLIGENT FABRIC MAPPING CHECKER
 * Ninh ơi, script này tìm ra pattern mapping chính xác giữa:
 * - 331 fabric codes trong CSV
 * - 504 ảnh trên Cloudinary
 * 
 * Thử nhiều naming variations để tìm matches!
 */

import fs from 'fs'
import path from 'path'
import https from 'https'

// Cloudinary config
const CLOUD_NAME = 'dgaktc3fb'
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`

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
 * Generate naming variations for a fabric code
 */
function generateNamingVariations(fabricCode) {
  const variations = new Set()
  
  // Original
  variations.add(fabricCode)
  
  // Basic transformations
  variations.add(fabricCode.toLowerCase())
  variations.add(fabricCode.toUpperCase())
  
  // Replace spaces
  variations.add(fabricCode.replace(/\s+/g, '-'))
  variations.add(fabricCode.replace(/\s+/g, '_'))
  variations.add(fabricCode.replace(/\s+/g, ''))
  
  // Replace special characters
  variations.add(fabricCode.replace(/[^\w\s-]/g, ''))
  variations.add(fabricCode.replace(/[^\w\s-]/g, '-'))
  variations.add(fabricCode.replace(/[^\w]/g, '-'))
  variations.add(fabricCode.replace(/[^\w]/g, '_'))
  variations.add(fabricCode.replace(/[^\w]/g, ''))
  
  // Combinations
  const cleaned = fabricCode.replace(/[^\w\s]/g, '')
  variations.add(cleaned.replace(/\s+/g, '-'))
  variations.add(cleaned.replace(/\s+/g, '_'))
  variations.add(cleaned.replace(/\s+/g, ''))
  
  // Lowercase combinations
  variations.add(cleaned.toLowerCase().replace(/\s+/g, '-'))
  variations.add(cleaned.toLowerCase().replace(/\s+/g, '_'))
  variations.add(cleaned.toLowerCase().replace(/\s+/g, ''))
  
  // Remove multiple dashes/underscores
  Array.from(variations).forEach(v => {
    variations.add(v.replace(/-+/g, '-'))
    variations.add(v.replace(/_+/g, '_'))
    variations.add(v.replace(/[-_]+/g, '-'))
    variations.add(v.replace(/[-_]+/g, '_'))
  })
  
  // Remove leading/trailing special chars
  Array.from(variations).forEach(v => {
    variations.add(v.replace(/^[-_]+|[-_]+$/g, ''))
  })
  
  return Array.from(variations).filter(v => v.length > 0)
}

/**
 * Test if image exists on Cloudinary
 */
async function testCloudinaryImage(imageName) {
  return new Promise((resolve) => {
    try {
      const encodedName = encodeURIComponent(imageName)
      const url = `${CLOUDINARY_BASE_URL}/fabrics/${encodedName}`
      
      const urlObj = new URL(url)
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: 'HEAD',
        timeout: 3000
      }
      
      const req = https.request(options, (res) => {
        resolve({
          imageName,
          exists: res.statusCode === 200,
          url
        })
      })
      
      req.on('error', () => resolve({ imageName, exists: false, url: '' }))
      req.on('timeout', () => {
        req.destroy()
        resolve({ imageName, exists: false, url: '' })
      })
      
      req.end()
    } catch (error) {
      resolve({ imageName, exists: false, url: '' })
    }
  })
}

/**
 * Find best match for a fabric code
 */
async function findBestMatch(fabricCode) {
  const variations = generateNamingVariations(fabricCode)
  
  console.log(`🔍 Testing ${fabricCode} (${variations.length} variations)`)
  
  // Test variations in parallel (but limited)
  const BATCH_SIZE = 5
  for (let i = 0; i < variations.length; i += BATCH_SIZE) {
    const batch = variations.slice(i, i + BATCH_SIZE)
    const results = await Promise.all(batch.map(testCloudinaryImage))
    
    // Find first match
    const match = results.find(r => r.exists)
    if (match) {
      console.log(`   ✅ FOUND: ${match.imageName}`)
      return {
        fabricCode,
        matchedName: match.imageName,
        cloudinaryUrl: match.url,
        found: true
      }
    }
    
    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  console.log(`   ❌ NOT FOUND`)
  return {
    fabricCode,
    matchedName: null,
    cloudinaryUrl: null,
    found: false
  }
}

/**
 * Main mapping function
 */
async function runIntelligentMapping() {
  console.log('🧠 Starting Intelligent Fabric Mapping...\n')
  
  // Load fabric codes
  const fabricCodes = await loadFabricCodes()
  console.log(`📂 Loaded ${fabricCodes.length} fabric codes\n`)
  
  if (fabricCodes.length === 0) {
    console.log('❌ No fabric codes found')
    return
  }
  
  // Test first 30 codes for speed (can increase later)
  const testCodes = fabricCodes.slice(0, 30)
  console.log(`🎯 Testing first ${testCodes.length} codes...\n`)
  
  const mappingResults = []
  
  for (let i = 0; i < testCodes.length; i++) {
    const code = testCodes[i]
    console.log(`[${i + 1}/${testCodes.length}]`)
    
    const result = await findBestMatch(code)
    mappingResults.push(result)
    
    console.log('') // Empty line for readability
  }
  
  // Generate statistics
  const found = mappingResults.filter(r => r.found)
  const notFound = mappingResults.filter(r => !r.found)
  
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('📊 INTELLIGENT MAPPING RESULTS')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log(`Total Tested: ${mappingResults.length}`)
  console.log(`✅ Found Matches: ${found.length} (${((found.length / mappingResults.length) * 100).toFixed(1)}%)`)
  console.log(`❌ Not Found: ${notFound.length} (${((notFound.length / mappingResults.length) * 100).toFixed(1)}%)`)
  console.log('')
  
  if (found.length > 0) {
    console.log('✅ SUCCESSFUL MAPPINGS:')
    found.forEach(r => {
      console.log(`   "${r.fabricCode}" → "${r.matchedName}"`)
    })
    console.log('')
  }
  
  if (notFound.length > 0) {
    console.log('❌ NOT FOUND:')
    notFound.slice(0, 10).forEach(r => {
      console.log(`   "${r.fabricCode}"`)
    })
    if (notFound.length > 10) {
      console.log(`   ... and ${notFound.length - 10} more`)
    }
    console.log('')
  }
  
  // Save mapping table
  const mappingTable = {}
  found.forEach(r => {
    mappingTable[r.fabricCode] = r.matchedName
  })
  
  const mappingPath = path.join(process.cwd(), 'fabric-mapping-table.json')
  fs.writeFileSync(mappingPath, JSON.stringify(mappingTable, null, 2))
  console.log(`💾 Mapping table saved to: ${mappingPath}`)
  
  // Save detailed results
  const detailsPath = path.join(process.cwd(), 'intelligent-mapping-results.json')
  fs.writeFileSync(detailsPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalTested: mappingResults.length,
    found: found.length,
    notFound: notFound.length,
    successRate: ((found.length / mappingResults.length) * 100).toFixed(1) + '%',
    mappingResults
  }, null, 2))
  console.log(`📊 Detailed results saved to: ${detailsPath}`)
  
  console.log('')
  console.log('🎯 NEXT STEPS:')
  console.log('1. Review mapping table')
  console.log('2. Update cloudinaryService to use mapping')
  console.log('3. Test with full dataset if results look good')
  console.log('4. Implement mapping in web app')
}

// Run the intelligent mapper
runIntelligentMapping().catch(console.error)
