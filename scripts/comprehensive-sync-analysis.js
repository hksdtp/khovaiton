#!/usr/bin/env node

/**
 * 📊 COMPREHENSIVE SYNC ANALYSIS
 * Ninh ơi, script này tạo báo cáo toàn diện về:
 * 1. Tất cả file ảnh trên Cloudinary
 * 2. Tất cả fabric codes trong source code
 * 3. Phương án đồng bộ tối ưu
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
 * Get static images from public folder
 */
function getStaticImages() {
  try {
    const staticPath = path.join(process.cwd(), 'public', 'images', 'fabrics')
    if (!fs.existsSync(staticPath)) {
      return []
    }
    
    const files = fs.readdirSync(staticPath)
    return files
      .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
      .map(file => file.replace(/\.(jpg|jpeg|png|webp)$/i, ''))
  } catch (error) {
    console.log('⚠️  No static images found')
    return []
  }
}

/**
 * Test if image exists on Cloudinary
 */
async function testCloudinaryImage(imageName) {
  return new Promise((resolve) => {
    try {
      const encodedName = encodeURIComponent(imageName)
      const url = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/fabrics/${encodedName}`
      
      const urlObj = new URL(url)
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname,
        method: 'HEAD',
        timeout: 3000
      }
      
      const req = https.request(options, (res) => {
        resolve({
          name: imageName,
          exists: res.statusCode === 200,
          url
        })
      })
      
      req.on('error', () => resolve({ name: imageName, exists: false, url: '' }))
      req.on('timeout', () => {
        req.destroy()
        resolve({ name: imageName, exists: false, url: '' })
      })
      
      req.end()
    } catch (error) {
      resolve({ name: imageName, exists: false, url: '' })
    }
  })
}

/**
 * Discover Cloudinary images by testing fabric codes
 */
async function discoverCloudinaryImages(fabricCodes) {
  console.log('🔍 Discovering Cloudinary images...')
  
  const cloudinaryImages = []
  const BATCH_SIZE = 10
  
  for (let i = 0; i < fabricCodes.length; i += BATCH_SIZE) {
    const batch = fabricCodes.slice(i, i + BATCH_SIZE)
    
    process.stdout.write(`\r   Testing ${i + 1}-${Math.min(i + BATCH_SIZE, fabricCodes.length)}/${fabricCodes.length}...`)
    
    const batchPromises = batch.map(testCloudinaryImage)
    const batchResults = await Promise.all(batchPromises)
    
    const found = batchResults.filter(r => r.exists)
    cloudinaryImages.push(...found.map(r => r.name))
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  console.log(`\n✅ Found ${cloudinaryImages.length} images on Cloudinary`)
  return cloudinaryImages
}

/**
 * Analyze sync status
 */
function analyzeSyncStatus(fabricCodes, cloudinaryImages, staticImages) {
  const analysis = {
    // Perfect matches
    inBothCloudinaryAndCodes: [],
    inBothStaticAndCodes: [],
    
    // Partial matches
    inCloudinaryOnly: [],
    inStaticOnly: [],
    inCodesOnly: [],
    
    // Overlaps
    inBothCloudinaryAndStatic: [],
    
    // Statistics
    stats: {}
  }
  
  // Find intersections
  fabricCodes.forEach(code => {
    const inCloudinary = cloudinaryImages.includes(code)
    const inStatic = staticImages.includes(code)
    
    if (inCloudinary && inStatic) {
      analysis.inBothCloudinaryAndStatic.push(code)
    }
    
    if (inCloudinary) {
      analysis.inBothCloudinaryAndCodes.push(code)
    } else if (inStatic) {
      analysis.inBothStaticAndCodes.push(code)
    } else {
      analysis.inCodesOnly.push(code)
    }
  })
  
  // Find orphaned images
  cloudinaryImages.forEach(img => {
    if (!fabricCodes.includes(img)) {
      analysis.inCloudinaryOnly.push(img)
    }
  })
  
  staticImages.forEach(img => {
    if (!fabricCodes.includes(img)) {
      analysis.inStaticOnly.push(img)
    }
  })
  
  // Calculate statistics
  analysis.stats = {
    totalCodes: fabricCodes.length,
    totalCloudinaryImages: cloudinaryImages.length,
    totalStaticImages: staticImages.length,
    
    codesWithCloudinary: analysis.inBothCloudinaryAndCodes.length,
    codesWithStatic: analysis.inBothStaticAndCodes.length,
    codesWithoutImages: analysis.inCodesOnly.length,
    
    cloudinaryOrphans: analysis.inCloudinaryOnly.length,
    staticOrphans: analysis.inStaticOnly.length,
    duplicateImages: analysis.inBothCloudinaryAndStatic.length,
    
    cloudinaryCoverage: ((analysis.inBothCloudinaryAndCodes.length / fabricCodes.length) * 100).toFixed(1),
    staticCoverage: ((analysis.inBothStaticAndCodes.length / fabricCodes.length) * 100).toFixed(1),
    totalCoverage: (((analysis.inBothCloudinaryAndCodes.length + analysis.inBothStaticAndCodes.length) / fabricCodes.length) * 100).toFixed(1)
  }
  
  return analysis
}

/**
 * Generate sync recommendations
 */
function generateSyncRecommendations(analysis) {
  const recommendations = []
  
  // Current approach analysis
  recommendations.push({
    title: "CURRENT APPROACH ANALYSIS",
    status: analysis.stats.cloudinaryCoverage > 50 ? "GOOD" : "NEEDS_IMPROVEMENT",
    description: `Current Cloudinary-first approach covers ${analysis.stats.cloudinaryCoverage}% of fabric codes`,
    details: [
      `✅ ${analysis.stats.codesWithCloudinary} codes have Cloudinary images`,
      `📁 ${analysis.stats.codesWithStatic} codes have static images`,
      `❌ ${analysis.stats.codesWithoutImages} codes have no images`,
      `🔄 ${analysis.stats.duplicateImages} codes have both Cloudinary and static images`
    ]
  })
  
  // Migration recommendations
  if (analysis.stats.codesWithStatic > 0) {
    recommendations.push({
      title: "MIGRATION OPPORTUNITY",
      status: "ACTION_NEEDED",
      description: `Migrate ${analysis.stats.codesWithStatic} static images to Cloudinary`,
      details: [
        `📤 Upload ${analysis.stats.codesWithStatic} static images to Cloudinary`,
        `🗑️ Remove static images after successful upload`,
        `🎯 This would increase coverage to ${((analysis.stats.codesWithCloudinary + analysis.stats.codesWithStatic) / analysis.stats.totalCodes * 100).toFixed(1)}%`
      ]
    })
  }
  
  // Missing images
  if (analysis.stats.codesWithoutImages > 0) {
    recommendations.push({
      title: "MISSING IMAGES",
      status: "CRITICAL",
      description: `${analysis.stats.codesWithoutImages} fabric codes have no images`,
      details: [
        `📸 Need to source and upload ${analysis.stats.codesWithoutImages} images`,
        `🎯 Priority: Clean codes without special characters`,
        `📋 Create upload checklist and workflow`
      ]
    })
  }
  
  // Cleanup recommendations
  if (analysis.stats.cloudinaryOrphans > 0 || analysis.stats.staticOrphans > 0) {
    recommendations.push({
      title: "CLEANUP OPPORTUNITIES",
      status: "OPTIONAL",
      description: "Remove orphaned images not matching any fabric codes",
      details: [
        `☁️ ${analysis.stats.cloudinaryOrphans} orphaned Cloudinary images`,
        `📁 ${analysis.stats.staticOrphans} orphaned static images`,
        `💾 Could save storage space and reduce confusion`
      ]
    })
  }
  
  // Sync strategy
  recommendations.push({
    title: "OPTIMAL SYNC STRATEGY",
    status: "RECOMMENDED",
    description: "Cloudinary-first with smart fallback",
    details: [
      `✅ Keep current Cloudinary-first approach`,
      `🔄 Migrate remaining static images to Cloudinary`,
      `📤 Implement bulk upload tool for missing images`,
      `🎯 Target: 95%+ Cloudinary coverage`,
      `📊 Monitor and report sync status regularly`
    ]
  })
  
  return recommendations
}

/**
 * Main analysis function
 */
async function runComprehensiveAnalysis() {
  console.log('📊 COMPREHENSIVE SYNC ANALYSIS')
  console.log('═══════════════════════════════════════════════════════════════\n')
  
  // Load all data sources
  console.log('📂 Loading fabric codes from CSV...')
  const fabricCodes = await loadFabricCodes()
  console.log(`✅ Loaded ${fabricCodes.length} fabric codes`)
  
  console.log('\n📁 Scanning static images...')
  const staticImages = getStaticImages()
  console.log(`✅ Found ${staticImages.length} static images`)
  
  console.log('\n☁️ Discovering Cloudinary images...')
  const cloudinaryImages = await discoverCloudinaryImages(fabricCodes)
  
  console.log('\n🔍 Analyzing sync status...')
  const analysis = analyzeSyncStatus(fabricCodes, cloudinaryImages, staticImages)
  
  console.log('\n💡 Generating recommendations...')
  const recommendations = generateSyncRecommendations(analysis)
  
  // Generate comprehensive report
  const report = `
📊 COMPREHENSIVE SYNC ANALYSIS REPORT
Generated: ${new Date().toLocaleString()}

═══════════════════════════════════════════════════════════════

📈 OVERVIEW STATISTICS
═══════════════════════════════════════════════════════════════
Total Fabric Codes: ${analysis.stats.totalCodes}
Total Cloudinary Images: ${analysis.stats.totalCloudinaryImages}
Total Static Images: ${analysis.stats.totalStaticImages}

Coverage Analysis:
├── Cloudinary Coverage: ${analysis.stats.cloudinaryCoverage}% (${analysis.stats.codesWithCloudinary} codes)
├── Static Coverage: ${analysis.stats.staticCoverage}% (${analysis.stats.codesWithStatic} codes)
├── Total Coverage: ${analysis.stats.totalCoverage}% (${analysis.stats.codesWithCloudinary + analysis.stats.codesWithStatic} codes)
└── Missing Images: ${((analysis.stats.codesWithoutImages / analysis.stats.totalCodes) * 100).toFixed(1)}% (${analysis.stats.codesWithoutImages} codes)

═══════════════════════════════════════════════════════════════

☁️ CLOUDINARY IMAGES (${analysis.stats.totalCloudinaryImages} files)
═══════════════════════════════════════════════════════════════
${cloudinaryImages.slice(0, 50).join('\n')}${cloudinaryImages.length > 50 ? `\n... and ${cloudinaryImages.length - 50} more` : ''}

═══════════════════════════════════════════════════════════════

📁 STATIC IMAGES (${analysis.stats.totalStaticImages} files)
═══════════════════════════════════════════════════════════════
${staticImages.slice(0, 50).join('\n')}${staticImages.length > 50 ? `\n... and ${staticImages.length - 50} more` : ''}

═══════════════════════════════════════════════════════════════

🔄 DUPLICATE IMAGES (${analysis.stats.duplicateImages} codes have both)
═══════════════════════════════════════════════════════════════
${analysis.inBothCloudinaryAndStatic.slice(0, 20).join('\n')}${analysis.inBothCloudinaryAndStatic.length > 20 ? `\n... and ${analysis.inBothCloudinaryAndStatic.length - 20} more` : ''}

═══════════════════════════════════════════════════════════════

❌ MISSING IMAGES (${analysis.stats.codesWithoutImages} codes)
═══════════════════════════════════════════════════════════════
${analysis.inCodesOnly.slice(0, 30).join('\n')}${analysis.inCodesOnly.length > 30 ? `\n... and ${analysis.inCodesOnly.length - 30} more` : ''}

═══════════════════════════════════════════════════════════════

🗑️ ORPHANED IMAGES
═══════════════════════════════════════════════════════════════
Cloudinary Orphans (${analysis.stats.cloudinaryOrphans}):
${analysis.inCloudinaryOnly.slice(0, 20).join('\n')}${analysis.inCloudinaryOnly.length > 20 ? `\n... and ${analysis.inCloudinaryOnly.length - 20} more` : ''}

Static Orphans (${analysis.stats.staticOrphans}):
${analysis.inStaticOnly.slice(0, 20).join('\n')}${analysis.inStaticOnly.length > 20 ? `\n... and ${analysis.inStaticOnly.length - 20} more` : ''}

═══════════════════════════════════════════════════════════════

💡 SYNC RECOMMENDATIONS
═══════════════════════════════════════════════════════════════

${recommendations.map(rec => `
🎯 ${rec.title} [${rec.status}]
${rec.description}

${rec.details.map(detail => `   ${detail}`).join('\n')}
`).join('\n')}

═══════════════════════════════════════════════════════════════

🚀 IMPLEMENTATION ROADMAP
═══════════════════════════════════════════════════════════════

PHASE 1 - IMMEDIATE (This Week):
✅ Migrate ${analysis.stats.codesWithStatic} static images to Cloudinary
✅ Test bulk upload workflow
✅ Verify image quality and optimization

PHASE 2 - SHORT TERM (Next Week):
📤 Upload images for ${Math.min(50, analysis.stats.codesWithoutImages)} high-priority missing codes
🔧 Implement automated sync monitoring
📊 Set up coverage tracking dashboard

PHASE 3 - LONG TERM (Next Month):
📸 Source and upload remaining ${Math.max(0, analysis.stats.codesWithoutImages - 50)} images
🗑️ Clean up orphaned images
🎯 Achieve 95%+ Cloudinary coverage
📈 Implement automated backup and sync

═══════════════════════════════════════════════════════════════

🎯 SUCCESS METRICS
═══════════════════════════════════════════════════════════════
Current Cloudinary Coverage: ${analysis.stats.cloudinaryCoverage}%
Target Phase 1: ${((analysis.stats.codesWithCloudinary + analysis.stats.codesWithStatic) / analysis.stats.totalCodes * 100).toFixed(1)}%
Target Phase 2: ${((analysis.stats.codesWithCloudinary + analysis.stats.codesWithStatic + Math.min(50, analysis.stats.codesWithoutImages)) / analysis.stats.totalCodes * 100).toFixed(1)}%
Target Phase 3: 95%+

═══════════════════════════════════════════════════════════════
`
  
  console.log(report)
  
  // Save comprehensive data
  const reportPath = path.join(process.cwd(), 'comprehensive-sync-report.txt')
  fs.writeFileSync(reportPath, report)
  console.log(`📄 Report saved to: ${reportPath}`)
  
  const dataPath = path.join(process.cwd(), 'comprehensive-sync-data.json')
  fs.writeFileSync(dataPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    analysis,
    recommendations,
    lists: {
      fabricCodes,
      cloudinaryImages,
      staticImages
    }
  }, null, 2))
  console.log(`📊 Data saved to: ${dataPath}`)
  
  console.log('\n🎉 ANALYSIS COMPLETE!')
  console.log(`🎯 Next step: Migrate ${analysis.stats.codesWithStatic} static images to Cloudinary`)
}

// Run the comprehensive analysis
runComprehensiveAnalysis().catch(console.error)
