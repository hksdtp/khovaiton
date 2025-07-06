#!/usr/bin/env node

/**
 * Fix Mapping from Validation Results
 * Ninh ơi, script này tự động update real-image-mapping.json dựa trên kết quả validation
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Main function
 */
async function main() {
  console.log('🔧 Fixing real-image-mapping.json from validation results...')
  
  // Load validation report
  const validationPath = path.join(__dirname, '../public/cloudinary-validation-report.json')
  const mappingPath = path.join(__dirname, '../public/real-image-mapping.json')
  
  if (!fs.existsSync(validationPath)) {
    console.error('❌ Validation report not found! Run validate-all-cloudinary-images.js first.')
    process.exit(1)
  }
  
  const validationData = JSON.parse(fs.readFileSync(validationPath, 'utf8'))
  const mappingData = JSON.parse(fs.readFileSync(mappingPath, 'utf8'))
  
  console.log(`📊 Validation results: ${validationData.metadata.existsCount} exists, ${validationData.metadata.missingCount} missing`)
  
  // Update mapping based on validation results
  let updatedCount = 0
  let alreadyCorrectCount = 0
  
  for (const [fabricCode, actualExists] of Object.entries(validationData.results)) {
    const currentMapping = mappingData.mapping[fabricCode]
    
    if (currentMapping !== actualExists) {
      console.log(`🔄 Updating ${fabricCode}: ${currentMapping} → ${actualExists}`)
      mappingData.mapping[fabricCode] = actualExists
      updatedCount++
    } else {
      alreadyCorrectCount++
    }
  }
  
  // Update metadata
  const totalFabrics = Object.keys(mappingData.mapping).length
  const withImages = Object.values(mappingData.mapping).filter(v => v === true).length
  const withoutImages = totalFabrics - withImages
  const coverage = ((withImages / totalFabrics) * 100).toFixed(1)
  
  mappingData.metadata = {
    ...mappingData.metadata,
    lastUpdated: new Date().toISOString(),
    totalFabrics,
    withImagesCount: withImages,
    withoutImagesCount: withoutImages,
    coverage: `${coverage}%`,
    source: "Cloudinary validation + static images",
    validationDate: validationData.metadata.generatedAt,
    validationAccuracy: validationData.metadata.accuracyRate + '%'
  }
  
  // Regenerate fabric lists
  const fabricsWithImages = []
  const fabricsWithoutImages = []
  
  for (const [fabricCode, hasImage] of Object.entries(mappingData.mapping)) {
    if (hasImage === true) {
      fabricsWithImages.push(fabricCode)
    } else {
      fabricsWithoutImages.push(fabricCode)
    }
  }
  
  mappingData.fabricsWithImages = fabricsWithImages.sort()
  mappingData.fabricsWithoutImages = fabricsWithoutImages.sort()
  
  // Save updated mapping
  fs.writeFileSync(mappingPath, JSON.stringify(mappingData, null, 2))
  
  console.log('\n✅ MAPPING UPDATE COMPLETED!')
  console.log(`🔄 Updated: ${updatedCount} fabric codes`)
  console.log(`✓ Already correct: ${alreadyCorrectCount} fabric codes`)
  console.log(`📊 Final stats: ${withImages} with images, ${withoutImages} without images (${coverage}% coverage)`)
  console.log(`💾 Updated mapping saved to: ${mappingPath}`)
  
  // Show summary of changes
  if (updatedCount > 0) {
    console.log('\n📋 SUMMARY OF CHANGES:')
    console.log(`• Fixed ${updatedCount} incorrect mappings`)
    console.log(`• Eliminated potential 404 errors for ${validationData.metadata.missingCount} fabric codes`)
    console.log(`• Web app will now only load images that actually exist`)
  }
}

// Run the script
main().catch(console.error)
