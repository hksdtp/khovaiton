#!/usr/bin/env node

/**
 * 🔍 CHECK REAL IMAGES
 * Ninh ơi, script này kiểm tra ảnh nào THỰC SỰ TỒN TẠI
 */

import fs from 'fs'
import path from 'path'

async function checkImageExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch (error) {
    return false
  }
}

async function checkRealImages() {
  console.log('🔍 CHECKING REAL IMAGES - FABRIC INVENTORY')
  console.log('═══════════════════════════════════════════════════════════════\n')
  
  try {
    // Load fabric data
    const dataPath = path.join(process.cwd(), 'public/anhhung-fabrics.json')
    if (!fs.existsSync(dataPath)) {
      console.log('❌ anhhung-fabrics.json not found')
      return
    }
    
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
    const fabrics = data.fabrics
    
    console.log(`📊 Total fabrics: ${fabrics.length}`)
    console.log('🔄 Checking image availability...\n')
    
    const results = {
      cloudinary: { exists: [], missing: [] },
      static: { exists: [], missing: [] },
      total: { withImages: [], withoutImages: [] }
    }
    
    // Check first 20 fabrics for speed
    const sampleFabrics = fabrics.slice(0, 20)
    console.log(`🧪 Testing sample of ${sampleFabrics.length} fabrics:\n`)
    
    for (let i = 0; i < sampleFabrics.length; i++) {
      const fabric = sampleFabrics[i]
      const code = fabric.code
      
      console.log(`${(i + 1).toString().padStart(2, ' ')}. ${code}`)
      
      // Check Cloudinary
      const cloudinaryUrl = `https://res.cloudinary.com/dgaktc3fb/image/upload/fabrics/${encodeURIComponent(code)}.jpg`
      const cloudinaryExists = await checkImageExists(cloudinaryUrl)
      
      // Check Static
      const staticUrl = `/images/fabrics/${encodeURIComponent(code)}.jpg`
      const staticPath = path.join(process.cwd(), 'public', staticUrl)
      const staticExists = fs.existsSync(staticPath)
      
      console.log(`    ☁️  Cloudinary: ${cloudinaryExists ? '✅' : '❌'}`)
      console.log(`    📁 Static: ${staticExists ? '✅' : '❌'}`)
      
      // Track results
      if (cloudinaryExists) {
        results.cloudinary.exists.push(code)
      } else {
        results.cloudinary.missing.push(code)
      }
      
      if (staticExists) {
        results.static.exists.push(code)
      } else {
        results.static.missing.push(code)
      }
      
      // Overall status
      const hasAnyImage = cloudinaryExists || staticExists
      if (hasAnyImage) {
        results.total.withImages.push(code)
        console.log(`    🎯 Status: ✅ HAS IMAGE`)
      } else {
        results.total.withoutImages.push(code)
        console.log(`    🎯 Status: ❌ NO IMAGE`)
      }
      
      console.log()
    }
    
    // Summary
    console.log('📊 SAMPLE RESULTS SUMMARY:')
    console.log(`☁️  Cloudinary: ${results.cloudinary.exists.length}/${sampleFabrics.length} exist (${((results.cloudinary.exists.length / sampleFabrics.length) * 100).toFixed(1)}%)`)
    console.log(`📁 Static: ${results.static.exists.length}/${sampleFabrics.length} exist (${((results.static.exists.length / sampleFabrics.length) * 100).toFixed(1)}%)`)
    console.log(`🎯 Total with images: ${results.total.withImages.length}/${sampleFabrics.length} (${((results.total.withImages.length / sampleFabrics.length) * 100).toFixed(1)}%)`)
    console.log(`❌ Total without images: ${results.total.withoutImages.length}/${sampleFabrics.length} (${((results.total.withoutImages.length / sampleFabrics.length) * 100).toFixed(1)}%)`)
    
    // Extrapolate to full dataset
    const cloudinaryRate = results.cloudinary.exists.length / sampleFabrics.length
    const staticRate = results.static.exists.length / sampleFabrics.length
    const totalWithImagesRate = results.total.withImages.length / sampleFabrics.length
    
    console.log('\n📈 EXTRAPOLATED TO FULL DATASET (331 fabrics):')
    console.log(`☁️  Estimated Cloudinary: ${Math.round(cloudinaryRate * fabrics.length)} fabrics`)
    console.log(`📁 Estimated Static: ${Math.round(staticRate * fabrics.length)} fabrics`)
    console.log(`✅ Estimated with images: ${Math.round(totalWithImagesRate * fabrics.length)} fabrics`)
    console.log(`❌ Estimated without images: ${Math.round((1 - totalWithImagesRate) * fabrics.length)} fabrics`)
    
    // Generate mapping for web app
    const imageMapping = {}
    results.total.withImages.forEach(code => {
      imageMapping[code] = true
    })
    results.total.withoutImages.forEach(code => {
      imageMapping[code] = false
    })
    
    // Save mapping
    const mappingPath = path.join(process.cwd(), 'public/real-image-mapping.json')
    fs.writeFileSync(mappingPath, JSON.stringify({
      metadata: {
        checkedAt: new Date().toISOString(),
        sampleSize: sampleFabrics.length,
        totalFabrics: fabrics.length,
        cloudinaryRate: cloudinaryRate,
        staticRate: staticRate,
        totalWithImagesRate: totalWithImagesRate
      },
      mapping: imageMapping
    }, null, 2))
    
    console.log(`\n💾 Saved real image mapping to: ${mappingPath}`)
    console.log('\n🎉 IMAGE CHECK COMPLETE!')
    console.log('💡 Use this data to fix Image Status Filter logic')
    
  } catch (error) {
    console.error('❌ Error checking images:', error)
  }
}

// Run the checker
checkRealImages().catch(console.error)
