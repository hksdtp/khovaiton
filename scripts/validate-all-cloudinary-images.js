#!/usr/bin/env node

/**
 * Validate ALL Cloudinary Images
 * Ninh ơi, script này kiểm tra TẤT CẢ fabric codes được mark "true" trong real-image-mapping.json
 */

import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Cloudinary config
const CLOUD_NAME = 'dgaktc3fb'
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`

/**
 * Check if Cloudinary image actually exists
 */
async function checkCloudinaryImageExists(fabricCode) {
  return new Promise((resolve) => {
    try {
      const encodedCode = encodeURIComponent(fabricCode)
      const url = `${CLOUDINARY_BASE_URL}/fabrics/${encodedCode}.jpg`
      
      const urlObj = new URL(url)
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname,
        method: 'HEAD',
        timeout: 8000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      }
      
      const req = https.request(options, (res) => {
        const exists = res.statusCode === 200
        resolve({
          fabricCode,
          exists,
          statusCode: res.statusCode,
          url
        })
      })
      
      req.on('timeout', () => {
        resolve({
          fabricCode,
          exists: false,
          statusCode: 'TIMEOUT',
          url
        })
      })
      
      req.on('error', (error) => {
        resolve({
          fabricCode,
          exists: false,
          statusCode: 'ERROR',
          url,
          error: error.message
        })
      })
      
      req.setTimeout(8000)
      req.end()
      
    } catch (error) {
      resolve({
        fabricCode,
        exists: false,
        statusCode: 'EXCEPTION',
        error: error.message
      })
    }
  })
}

/**
 * Load fabric codes marked as "true" from real-image-mapping.json
 */
function loadFabricCodesMarkedTrue() {
  try {
    const mappingPath = path.join(__dirname, '../public/real-image-mapping.json')
    const data = JSON.parse(fs.readFileSync(mappingPath, 'utf8'))
    
    const fabricCodesWithTrue = []
    for (const [fabricCode, hasImage] of Object.entries(data.mapping)) {
      if (hasImage === true) {
        fabricCodesWithTrue.push(fabricCode)
      }
    }
    
    return fabricCodesWithTrue
  } catch (error) {
    console.error('❌ Error loading mapping file:', error.message)
    return []
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Validating ALL Cloudinary images marked as "true"...')
  console.log(`☁️ Cloud: ${CLOUD_NAME}`)
  
  const fabricCodes = loadFabricCodesMarkedTrue()
  console.log(`📦 Found ${fabricCodes.length} fabric codes marked as "true" to validate`)
  
  if (fabricCodes.length === 0) {
    console.error('❌ No fabric codes marked as "true" found!')
    process.exit(1)
  }
  
  console.log(`\n🎯 Validating ${fabricCodes.length} fabric codes...`)
  
  const results = []
  let existsCount = 0
  let missingCount = 0
  const batchSize = 5 // Process in small batches to avoid rate limiting
  
  for (let i = 0; i < fabricCodes.length; i += batchSize) {
    const batch = fabricCodes.slice(i, i + batchSize)
    console.log(`\n📦 Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(fabricCodes.length/batchSize)}: Checking ${batch.length} codes...`)
    
    const batchPromises = batch.map(async (fabricCode, index) => {
      console.log(`[${i + index + 1}/${fabricCodes.length}] ${fabricCode}`)
      const result = await checkCloudinaryImageExists(fabricCode)
      
      if (result.exists) {
        console.log(`✅ ${fabricCode}: EXISTS`)
        existsCount++
      } else {
        console.log(`❌ ${fabricCode}: ${result.statusCode}`)
        missingCount++
      }
      
      return result
    })
    
    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults)
    
    // Delay between batches
    if (i + batchSize < fabricCodes.length) {
      console.log('⏳ Waiting 2s before next batch...')
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  // Generate report
  console.log('\n📊 VALIDATION RESULTS:')
  console.log(`✅ Images found: ${existsCount}`)
  console.log(`❌ Images missing: ${missingCount}`)
  console.log(`📈 Accuracy rate: ${((existsCount / fabricCodes.length) * 100).toFixed(1)}%`)
  
  // Show missing images (should be updated to false)
  const missing = results.filter(r => !r.exists)
  if (missing.length > 0) {
    console.log(`\n❌ ${missing.length} fabric codes marked "true" but missing in Cloudinary:`)
    missing.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.fabricCode} (${result.statusCode})`)
    })
    
    console.log('\n🔧 These should be updated to "false" in real-image-mapping.json')
  }
  
  // Save validation report
  const reportData = {
    metadata: {
      generatedAt: new Date().toISOString(),
      cloudName: CLOUD_NAME,
      totalValidated: fabricCodes.length,
      existsCount,
      missingCount,
      accuracyRate: ((existsCount / fabricCodes.length) * 100).toFixed(1)
    },
    results: results.reduce((acc, result) => {
      acc[result.fabricCode] = result.exists
      return acc
    }, {}),
    missingCodes: missing.map(r => r.fabricCode)
  }
  
  const outputPath = path.join(__dirname, '../public/cloudinary-validation-report.json')
  fs.writeFileSync(outputPath, JSON.stringify(reportData, null, 2))
  console.log(`\n💾 Validation report saved to: ${outputPath}`)
}

// Run the script
main().catch(console.error)
