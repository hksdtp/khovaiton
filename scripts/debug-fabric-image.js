#!/usr/bin/env node

/**
 * Debug script to check specific fabric image status
 * Usage: node scripts/debug-fabric-image.js "Datender 24sil"
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load fabric data
const fabricDataPath = path.join(__dirname, '../src/data/fabrics_data.json')
const fabricData = JSON.parse(fs.readFileSync(fabricDataPath, 'utf8'))

// Load image mapping
const imageMappingPath = path.join(__dirname, '../src/data/fabricImageMapping.ts')
const imageMappingContent = fs.readFileSync(imageMappingPath, 'utf8')

// Extract fabric codes from mapping
const fabricCodesMatch = imageMappingContent.match(/FABRICS_WITH_CLOUDINARY_IMAGES = new Set\(\[([\s\S]*?)\]\)/);
const fabricCodes = new Set()

if (fabricCodesMatch) {
  const codesString = fabricCodesMatch[1]
  const matches = codesString.match(/'([^']+)'/g)
  if (matches) {
    matches.forEach(match => {
      const code = match.replace(/'/g, '')
      fabricCodes.add(code)
    })
  }
}

function debugFabric(searchTerm) {
  console.log(`🔍 Debugging fabric: "${searchTerm}"`)
  console.log('=' .repeat(60))
  
  // Find fabric in data
  const matchingFabrics = fabricData.fabrics.filter(fabric => 
    fabric.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fabric.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  if (matchingFabrics.length === 0) {
    console.log('❌ No fabrics found matching:', searchTerm)
    return
  }
  
  matchingFabrics.forEach((fabric, index) => {
    console.log(`\n📦 Fabric ${index + 1}:`)
    console.log(`   ID: ${fabric.id}`)
    console.log(`   Code: "${fabric.code}"`)
    console.log(`   Name: "${fabric.name}"`)
    console.log(`   Quantity: ${fabric.quantity} ${fabric.unit}`)
    console.log(`   Location: ${fabric.location}`)
    console.log(`   Status: ${fabric.status}`)
    
    // Check image mapping
    const hasImageInMapping = fabricCodes.has(fabric.code)
    console.log(`   In Image Mapping: ${hasImageInMapping ? '✅ YES' : '❌ NO'}`)
    
    // Check hasImages field
    console.log(`   hasImages field: ${fabric.hasImages !== undefined ? fabric.hasImages : 'undefined'}`)
    
    // Check image field
    console.log(`   image field: ${fabric.image || 'undefined'}`)
    
    // Generate Cloudinary URL
    const cloudinaryUrl = `https://res.cloudinary.com/dgaktc3fb/image/upload/fabrics/${fabric.code}.jpg`
    console.log(`   Cloudinary URL: ${cloudinaryUrl}`)
    
    // Analysis
    console.log(`\n🔍 Analysis:`)
    if (hasImageInMapping && !fabric.hasImages) {
      console.log(`   ⚠️  ISSUE: In mapping but hasImages is false/undefined`)
    }
    if (!hasImageInMapping && fabric.hasImages) {
      console.log(`   ⚠️  ISSUE: hasImages is true but not in mapping`)
    }
    if (hasImageInMapping && fabric.hasImages) {
      console.log(`   ✅ Consistent: Both mapping and hasImages agree`)
    }
    if (!hasImageInMapping && !fabric.hasImages) {
      console.log(`   ✅ Consistent: No image in both mapping and hasImages`)
    }
  })
  
  console.log(`\n📊 Summary:`)
  console.log(`   Total fabrics found: ${matchingFabrics.length}`)
  console.log(`   Total fabrics in mapping: ${fabricCodes.size}`)
  console.log(`   Mapping includes: ${Array.from(fabricCodes).slice(0, 5).join(', ')}...`)
}

// Get search term from command line
const searchTerm = process.argv[2]

if (!searchTerm) {
  console.log('Usage: node scripts/debug-fabric-image.js "search term"')
  console.log('Example: node scripts/debug-fabric-image.js "Datender"')
  process.exit(1)
}

debugFabric(searchTerm)

// Also show some general stats
console.log(`\n📈 General Stats:`)
console.log(`   Total fabrics in data: ${fabricData.fabrics.length}`)
console.log(`   Total fabrics with images in mapping: ${fabricCodes.size}`)
console.log(`   Coverage: ${((fabricCodes.size / fabricData.fabrics.length) * 100).toFixed(1)}%`)

// Check for potential mapping issues
console.log(`\n🔍 Checking for mapping issues...`)
const fabricsWithHasImages = fabricData.fabrics.filter(f => f.hasImages === true)
const fabricsWithImageField = fabricData.fabrics.filter(f => f.image)

console.log(`   Fabrics with hasImages=true: ${fabricsWithHasImages.length}`)
console.log(`   Fabrics with image field: ${fabricsWithImageField.length}`)

if (fabricsWithHasImages.length !== fabricCodes.size) {
  console.log(`   ⚠️  Mismatch: hasImages count (${fabricsWithHasImages.length}) != mapping count (${fabricCodes.size})`)
}
