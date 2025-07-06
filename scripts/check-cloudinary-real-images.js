#!/usr/bin/env node

/**
 * Check Real Cloudinary Images
 * Ninh ơi, script này kiểm tra ảnh thực sự tồn tại trong Cloudinary
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
      // Generate Cloudinary URL with .jpg extension
      const encodedCode = encodeURIComponent(fabricCode)
      const url = `${CLOUDINARY_BASE_URL}/fabrics/${encodedCode}.jpg`
      
      const urlObj = new URL(url)
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname,
        method: 'HEAD',
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      }
      
      const req = https.request(options, (res) => {
        const exists = res.statusCode === 200
        console.log(`${exists ? '✅' : '❌'} ${fabricCode}: ${res.statusCode} - ${url}`)
        
        resolve({
          fabricCode,
          exists,
          statusCode: res.statusCode,
          url
        })
      })
      
      req.on('timeout', () => {
        console.log(`⏰ TIMEOUT ${fabricCode}`)
        resolve({
          fabricCode,
          exists: false,
          statusCode: 'TIMEOUT',
          url: `${CLOUDINARY_BASE_URL}/fabrics/${encodedCode}.jpg`
        })
      })
      
      req.on('error', (error) => {
        console.log(`❌ ERROR ${fabricCode}: ${error.message}`)
        resolve({
          fabricCode,
          exists: false,
          statusCode: 'ERROR',
          url: `${CLOUDINARY_BASE_URL}/fabrics/${encodedCode}.jpg`,
          error: error.message
        })
      })
      
      req.setTimeout(10000)
      req.end()
      
    } catch (error) {
      console.log(`❌ EXCEPTION ${fabricCode}: ${error.message}`)
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
 * Load fabric codes from problematic list
 */
function loadFabricCodes() {
  // Return the problematic codes directly since we know them from 404 errors
  return [
    '3 PASS BO - WHITE - COL 15',
    '71022-7',
    '33139-2-270',
    'A9003-5',
    'DCR-MELIA-NHẠT',
    'DCR-71022-8',
    '8059',
    '8015-1',
    'AS22541-5',
    'FB15169A4',
    'FB15148A21',
    'FB15198A5',
    'FB15141A21',
    'AS22878-7',
    '99-129-39',
    'FB15198A6',
    'FS-PURPLE',
    'FB15157A1'
  ]
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Checking real Cloudinary images...')
  console.log(`☁️ Cloud: ${CLOUD_NAME}`)
  console.log(`🌐 Base URL: ${CLOUDINARY_BASE_URL}`)
  
  const fabricCodes = loadFabricCodes()
  console.log(`📦 Found ${fabricCodes.length} fabric codes to check`)
  
  if (fabricCodes.length === 0) {
    console.error('❌ No fabric codes found!')
    process.exit(1)
  }
  
  console.log(`\n🎯 Checking ${fabricCodes.length} problematic fabric codes...`)

  const results = []
  let existsCount = 0
  let missingCount = 0

  for (let i = 0; i < fabricCodes.length; i++) {
    const fabricCode = fabricCodes[i]
    console.log(`\n[${i + 1}/${fabricCodes.length}] Checking: ${fabricCode}`)
    
    const result = await checkCloudinaryImageExists(fabricCode)
    results.push(result)
    
    if (result.exists) {
      existsCount++
    } else {
      missingCount++
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  // Generate report
  console.log('\n📊 CLOUDINARY REAL IMAGE CHECK RESULTS:')
  console.log(`✅ Images found: ${existsCount}`)
  console.log(`❌ Images missing: ${missingCount}`)
  console.log(`📈 Success rate: ${((existsCount / problematicCodes.length) * 100).toFixed(1)}%`)
  
  // Save results
  const reportData = {
    metadata: {
      generatedAt: new Date().toISOString(),
      cloudName: CLOUD_NAME,
      totalChecked: fabricCodes.length,
      existsCount,
      missingCount,
      successRate: ((existsCount / fabricCodes.length) * 100).toFixed(1)
    },
    results: results.reduce((acc, result) => {
      acc[result.fabricCode] = result.exists
      return acc
    }, {})
  }
  
  const outputPath = path.join(__dirname, '../public/cloudinary-real-mapping.json')
  fs.writeFileSync(outputPath, JSON.stringify(reportData, null, 2))
  console.log(`\n💾 Report saved to: ${outputPath}`)
  
  // Show missing images
  const missing = results.filter(r => !r.exists)
  if (missing.length > 0) {
    console.log('\n❌ Missing images in Cloudinary:')
    missing.forEach(result => {
      console.log(`   • ${result.fabricCode} (${result.statusCode})`)
    })
  }
}

// Run the script
main().catch(console.error)
