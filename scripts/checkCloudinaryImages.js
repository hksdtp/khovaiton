#!/usr/bin/env node

/**
 * Script kiểm tra ảnh Cloudinary thật và cập nhật mapping
 * Ninh ơi, script này sẽ kiểm tra từng fabric code trên Cloudinary
 * Chỉ giữ lại những ảnh thật, loại bỏ ảnh static/giả
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Cloudinary config
const CLOUDINARY_CLOUD_NAME = 'dgaktc3fb'
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`

// File paths
const FABRIC_JSON_FILE = path.join(__dirname, '../public/anhhung-fabrics.json')
const FABRIC_MAPPING_FILE = path.join(__dirname, '../src/data/fabricImageMapping.ts')

/**
 * Get all fabric codes from anhhung-fabrics.json
 */
function getAllFabricCodes() {
  console.log('📋 Loading fabric codes from anhhung-fabrics.json...')

  try {
    const content = fs.readFileSync(FABRIC_JSON_FILE, 'utf8')
    const data = JSON.parse(content)

    if (!data.fabrics || !Array.isArray(data.fabrics)) {
      console.error('❌ Invalid fabric data structure')
      return []
    }

    const fabricCodes = data.fabrics.map(fabric => fabric.code).filter(Boolean)

    // Remove duplicates
    const uniqueCodes = [...new Set(fabricCodes)]
    console.log(`✅ Found ${uniqueCodes.length} unique fabric codes`)
    console.log(`📊 Total items: ${data.metadata?.totalItems || 'unknown'}`)

    return uniqueCodes
  } catch (error) {
    console.error('❌ Error reading anhhung-fabrics.json:', error.message)
    return []
  }
}

/**
 * Check if Cloudinary image exists - test multiple URL formats
 */
async function checkCloudinaryImage(fabricCode) {
  // Test different URL formats
  const urlFormats = [
    `${CLOUDINARY_BASE_URL}/q_80,w_800/fabric_images/${encodeURIComponent(fabricCode)}.jpg`,
    `${CLOUDINARY_BASE_URL}/q_80,w_800/fabrics/${encodeURIComponent(fabricCode)}.jpg`,
    `${CLOUDINARY_BASE_URL}/fabric_images/${encodeURIComponent(fabricCode)}.jpg`,
    `${CLOUDINARY_BASE_URL}/fabrics/${encodeURIComponent(fabricCode)}.jpg`,
    `${CLOUDINARY_BASE_URL}/${encodeURIComponent(fabricCode)}.jpg`
  ]

  for (const imageUrl of urlFormats) {
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' })
      if (response.ok) {
        console.log(`  ✅ ${fabricCode} - Found at: ${imageUrl}`)
        return true
      }
    } catch (error) {
      // Continue to next format
    }
  }

  return false
}

/**
 * Check all fabric codes against Cloudinary
 */
async function checkAllCloudinaryImages(fabricCodes) {
  console.log('☁️ Checking Cloudinary images...')
  console.log(`🔍 Testing ${fabricCodes.length} fabric codes...`)
  
  const results = {
    withImages: [],
    withoutImages: [],
    errors: []
  }
  
  let processed = 0
  const batchSize = 10
  
  for (let i = 0; i < fabricCodes.length; i += batchSize) {
    const batch = fabricCodes.slice(i, i + batchSize)
    
    const batchPromises = batch.map(async (code) => {
      try {
        const hasImage = await checkCloudinaryImage(code)
        if (hasImage) {
          results.withImages.push(code)
          console.log(`  ✅ ${code}`)
        } else {
          results.withoutImages.push(code)
          console.log(`  ❌ ${code}`)
        }
      } catch (error) {
        results.errors.push({ code, error: error.message })
        console.log(`  🚨 ${code} - Error: ${error.message}`)
      }
    })
    
    await Promise.all(batchPromises)
    processed += batch.length
    
    console.log(`📊 Progress: ${processed}/${fabricCodes.length} (${Math.round(processed/fabricCodes.length*100)}%)`)
    
    // Small delay to avoid rate limiting
    if (i + batchSize < fabricCodes.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  return results
}

/**
 * Generate updated mapping file
 */
function generateUpdatedMapping(fabricsWithImages) {
  console.log('📝 Generating updated mapping file...')
  
  const sortedCodes = fabricsWithImages.sort()
  
  const content = `/**
 * Fabric Image Mapping - CLOUDINARY ONLY
 * Ninh ơi, file này chỉ chứa fabric codes có ảnh THẬT trên Cloudinary
 * Đã loại bỏ tất cả ảnh static/giả/mặc định
 * 
 * Generated: ${new Date().toISOString()}
 * Total fabrics with Cloudinary images: ${sortedCodes.length}
 */

const FABRICS_WITH_CLOUDINARY_IMAGES = new Set([
${sortedCodes.map(code => `  '${code}'`).join(',\n')}
])

export function hasRealImage(fabricCode: string): boolean {
  return FABRICS_WITH_CLOUDINARY_IMAGES.has(fabricCode)
}

export function getAllFabricsWithImages(): string[] {
  return Array.from(FABRICS_WITH_CLOUDINARY_IMAGES)
}

export function getFabricImageCount(): number {
  return FABRICS_WITH_CLOUDINARY_IMAGES.size
}

// Chỉ sử dụng Cloudinary - không có static images
export function hasStaticImage(fabricCode: string): boolean {
  return false
}

export function hasCloudinaryImage(fabricCode: string): boolean {
  return FABRICS_WITH_CLOUDINARY_IMAGES.has(fabricCode)
}
`

  fs.writeFileSync(FABRIC_MAPPING_FILE, content, 'utf8')
  console.log(`✅ Updated ${FABRIC_MAPPING_FILE}`)
  console.log(`📊 Cloudinary images: ${sortedCodes.length}`)
}

/**
 * Generate detailed report
 */
function generateReport(results, totalCodes) {
  const report = {
    timestamp: new Date().toISOString(),
    total: totalCodes,
    withImages: results.withImages.length,
    withoutImages: results.withoutImages.length,
    errors: results.errors.length,
    coverage: Math.round((results.withImages.length / totalCodes) * 100 * 100) / 100,
    fabricsWithImages: results.withImages.sort(),
    fabricsWithoutImages: results.withoutImages.sort(),
    errors: results.errors
  }
  
  const reportPath = path.join(__dirname, '../cloudinary-check-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8')
  
  console.log('=' .repeat(60))
  console.log('📊 CLOUDINARY IMAGE CHECK REPORT')
  console.log('=' .repeat(60))
  console.log(`📅 Timestamp: ${report.timestamp}`)
  console.log(`📋 Total fabric codes: ${report.total}`)
  console.log(`✅ With Cloudinary images: ${report.withImages} (${report.coverage}%)`)
  console.log(`❌ Without images: ${report.withoutImages}`)
  console.log(`🚨 Errors: ${report.errors}`)
  console.log(`📄 Report saved: ${reportPath}`)
  console.log('=' .repeat(60))
  
  return report
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Checking Cloudinary images for fabric inventory...')
  console.log('🎯 Goal: Only use REAL Cloudinary images, remove static/fake images')
  console.log('=' .repeat(60))
  
  // Get all fabric codes
  const fabricCodes = getAllFabricCodes()
  if (fabricCodes.length === 0) {
    console.error('❌ No fabric codes found. Exiting.')
    process.exit(1)
  }
  
  // Test with first 10 codes to find correct URL format
  console.log('🧪 Testing first 10 codes to find correct URL format...')
  const testCodes = fabricCodes.slice(0, 10)
  const testResults = await checkAllCloudinaryImages(testCodes)

  if (testResults.withImages.length === 0) {
    console.log('⚠️ No images found in test batch. Checking all codes anyway...')
  } else {
    console.log(`✅ Found ${testResults.withImages.length} images in test batch`)
  }

  // Check all Cloudinary images
  const results = await checkAllCloudinaryImages(fabricCodes)
  
  // Generate report
  const report = generateReport(results, fabricCodes.length)
  
  // Update mapping file
  generateUpdatedMapping(results.withImages)
  
  console.log('🎉 Cloudinary image check completed!')
  console.log(`✅ Found ${results.withImages.length} fabrics with real Cloudinary images`)
  console.log(`❌ ${results.withoutImages.length} fabrics without images`)
}

// Run script
main().catch(error => {
  console.error('💥 Script failed:', error)
  process.exit(1)
})
