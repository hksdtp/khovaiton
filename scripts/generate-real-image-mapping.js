#!/usr/bin/env node

/**
 * 🗺️ GENERATE REAL IMAGE MAPPING
 * Ninh ơi, script này tạo mapping chính xác của ảnh có thật
 */

import fs from 'fs'
import path from 'path'

function generateRealImageMapping() {
  console.log('🗺️ GENERATING REAL IMAGE MAPPING')
  console.log('═══════════════════════════════════════════════════════════════\n')
  
  try {
    // Get all static image files
    const fabricImagesDir = path.join(process.cwd(), 'public/images/fabrics')
    if (!fs.existsSync(fabricImagesDir)) {
      console.log('❌ public/images/fabrics directory not found')
      return
    }
    
    const imageFiles = fs.readdirSync(fabricImagesDir)
      .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
    
    console.log(`📁 Found ${imageFiles.length} image files in static directory`)
    
    // Extract fabric codes from filenames
    const staticImageCodes = new Set()
    imageFiles.forEach(filename => {
      // Remove extension to get fabric code
      const code = filename.replace(/\.(jpg|jpeg|png|webp)$/i, '')
      staticImageCodes.add(code)
    })
    
    console.log(`📋 Extracted ${staticImageCodes.size} unique fabric codes from static images`)
    
    // Load fabric inventory data
    const fabricDataPath = path.join(process.cwd(), 'public/anhhung-fabrics.json')
    if (!fs.existsSync(fabricDataPath)) {
      console.log('❌ anhhung-fabrics.json not found')
      return
    }
    
    const fabricData = JSON.parse(fs.readFileSync(fabricDataPath, 'utf-8'))
    const allFabrics = fabricData.fabrics
    
    console.log(`📊 Total fabrics in inventory: ${allFabrics.length}`)
    
    // Create mapping
    const imageMapping = {}
    let withImagesCount = 0
    let withoutImagesCount = 0
    
    allFabrics.forEach(fabric => {
      const hasImage = staticImageCodes.has(fabric.code)
      imageMapping[fabric.code] = hasImage
      
      if (hasImage) {
        withImagesCount++
      } else {
        withoutImagesCount++
      }
    })
    
    // Show sample mappings
    console.log('\n📋 SAMPLE MAPPINGS:')
    const sampleFabrics = allFabrics.slice(0, 10)
    sampleFabrics.forEach(fabric => {
      const hasImage = imageMapping[fabric.code]
      console.log(`  ${fabric.code}: ${hasImage ? '✅ HAS IMAGE' : '❌ NO IMAGE'}`)
    })
    
    // Statistics
    const coverage = (withImagesCount / allFabrics.length) * 100
    console.log('\n📊 REAL IMAGE STATISTICS:')
    console.log(`✅ Fabrics with images: ${withImagesCount}/${allFabrics.length} (${coverage.toFixed(1)}%)`)
    console.log(`❌ Fabrics without images: ${withoutImagesCount}/${allFabrics.length} (${(100 - coverage).toFixed(1)}%)`)
    
    // Show some fabrics with images
    const fabricsWithImages = allFabrics.filter(f => imageMapping[f.code]).slice(0, 10)
    console.log('\n✅ SAMPLE FABRICS WITH IMAGES:')
    fabricsWithImages.forEach((fabric, index) => {
      console.log(`  ${index + 1}. ${fabric.code} - ${fabric.name}`)
    })
    
    // Show some fabrics without images
    const fabricsWithoutImages = allFabrics.filter(f => !imageMapping[f.code]).slice(0, 10)
    console.log('\n❌ SAMPLE FABRICS WITHOUT IMAGES:')
    fabricsWithoutImages.forEach((fabric, index) => {
      console.log(`  ${index + 1}. ${fabric.code} - ${fabric.name}`)
    })
    
    // Create final mapping data
    const mappingData = {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalFabrics: allFabrics.length,
        totalImageFiles: imageFiles.length,
        uniqueImageCodes: staticImageCodes.size,
        withImagesCount: withImagesCount,
        withoutImagesCount: withoutImagesCount,
        coverage: coverage,
        source: 'static images in public/images/fabrics'
      },
      mapping: imageMapping,
      fabricsWithImages: allFabrics.filter(f => imageMapping[f.code]).map(f => f.code),
      fabricsWithoutImages: allFabrics.filter(f => !imageMapping[f.code]).map(f => f.code)
    }
    
    // Save mapping
    const outputPath = path.join(process.cwd(), 'public/real-image-mapping.json')
    fs.writeFileSync(outputPath, JSON.stringify(mappingData, null, 2))
    console.log(`\n💾 Saved real image mapping to: ${outputPath}`)
    
    // Also save to src/data for development
    const srcOutputPath = path.join(process.cwd(), 'src/data/real-image-mapping.json')
    fs.writeFileSync(srcOutputPath, JSON.stringify(mappingData, null, 2))
    console.log(`📁 Copied to src/data: ${srcOutputPath}`)
    
    // Generate TypeScript constant for hasRealImage function
    const tsConstant = `// Auto-generated fabric codes with real images
// Generated at: ${new Date().toISOString()}
export const FABRICS_WITH_IMAGES = new Set([
${fabricsWithImages.map(f => `  '${f.code}'`).join(',\n')}
])

export function hasRealImage(fabricCode: string): boolean {
  return FABRICS_WITH_IMAGES.has(fabricCode)
}`
    
    const tsPath = path.join(process.cwd(), 'src/data/fabricImageMapping.ts')
    fs.writeFileSync(tsPath, tsConstant)
    console.log(`📄 Generated TypeScript mapping: ${tsPath}`)
    
    console.log('\n🎉 REAL IMAGE MAPPING COMPLETE!')
    console.log('🔄 Next: Update web app to use this real mapping')
    
  } catch (error) {
    console.error('❌ Error generating image mapping:', error)
  }
}

// Run the generator
generateRealImageMapping().catch(console.error)
