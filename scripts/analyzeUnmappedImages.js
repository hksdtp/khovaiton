#!/usr/bin/env node

/**
 * Script phân tích ảnh chưa được map và tạo mapping tự động
 * Ninh ơi, script này sẽ tìm cách map 420 ảnh còn lại với fabric codes
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// File paths
const FABRIC_JSON_FILE = path.join(__dirname, '../public/anhhung-fabrics.json')
const CLOUDINARY_REPORT_FILE = path.join(__dirname, '../cloudinary-total-report.json')
const FABRIC_MAPPING_FILE = path.join(__dirname, '../src/data/fabricImageMapping.ts')

/**
 * Load fabric codes from JSON
 */
function loadFabricCodes() {
  console.log('📋 Loading fabric codes...')
  
  const content = fs.readFileSync(FABRIC_JSON_FILE, 'utf8')
  const data = JSON.parse(content)
  
  const fabricCodes = data.fabrics.map(fabric => fabric.code).filter(Boolean)
  console.log(`✅ Loaded ${fabricCodes.length} fabric codes`)
  
  return fabricCodes
}

/**
 * Load Cloudinary images from report
 */
function loadCloudinaryImages() {
  console.log('☁️ Loading Cloudinary images...')
  
  const content = fs.readFileSync(CLOUDINARY_REPORT_FILE, 'utf8')
  const data = JSON.parse(content)
  
  const images = data.fabricImages.fabricCodes
  console.log(`✅ Loaded ${images.length} Cloudinary images`)
  
  return images
}

/**
 * Load current mapping
 */
function loadCurrentMapping() {
  console.log('🗺️ Loading current mapping...')
  
  const content = fs.readFileSync(FABRIC_MAPPING_FILE, 'utf8')
  
  // Extract fabric codes from the mapping file
  const matches = content.match(/'([^']+)'/g)
  if (!matches) return []
  
  const mappedCodes = matches.map(match => match.replace(/'/g, ''))
  console.log(`✅ Current mapping: ${mappedCodes.length} codes`)
  
  return mappedCodes
}

/**
 * Normalize string for comparison
 */
function normalizeString(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric
}

/**
 * Calculate similarity between two strings
 */
function calculateSimilarity(str1, str2) {
  const norm1 = normalizeString(str1)
  const norm2 = normalizeString(str2)
  
  // Exact match
  if (norm1 === norm2) return 1.0
  
  // Check if one contains the other
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    return 0.8
  }
  
  // Levenshtein distance
  const matrix = []
  const len1 = norm1.length
  const len2 = norm2.length
  
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (norm1.charAt(i - 1) === norm2.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        )
      }
    }
  }
  
  const distance = matrix[len1][len2]
  const maxLen = Math.max(len1, len2)
  
  return maxLen === 0 ? 1 : (maxLen - distance) / maxLen
}

/**
 * Find best matches for unmapped images
 */
function findBestMatches(fabricCodes, cloudinaryImages, currentMapping) {
  console.log('🔍 Finding best matches for unmapped images...')
  
  const unmappedImages = cloudinaryImages.filter(img => !currentMapping.includes(img))
  const unmappedFabrics = fabricCodes.filter(code => !currentMapping.includes(code))
  
  console.log(`📊 Unmapped images: ${unmappedImages.length}`)
  console.log(`📊 Unmapped fabrics: ${unmappedFabrics.length}`)
  
  const matches = []
  const usedFabrics = new Set()
  
  // Find matches for each unmapped image
  unmappedImages.forEach(image => {
    let bestMatch = null
    let bestScore = 0
    
    unmappedFabrics.forEach(fabric => {
      if (usedFabrics.has(fabric)) return
      
      const score = calculateSimilarity(image, fabric)
      
      if (score > bestScore && score >= 0.6) { // Minimum 60% similarity
        bestMatch = fabric
        bestScore = score
      }
    })
    
    if (bestMatch) {
      matches.push({
        image: image,
        fabric: bestMatch,
        score: bestScore,
        confidence: bestScore >= 0.9 ? 'high' : bestScore >= 0.7 ? 'medium' : 'low'
      })
      usedFabrics.add(bestMatch)
    }
  })
  
  return { matches, unmappedImages, unmappedFabrics }
}

/**
 * Categorize matches by confidence
 */
function categorizeMatches(matches) {
  const categories = {
    high: matches.filter(m => m.confidence === 'high'),
    medium: matches.filter(m => m.confidence === 'medium'),
    low: matches.filter(m => m.confidence === 'low')
  }
  
  return categories
}

/**
 * Generate new mapping file with additional matches
 */
function generateNewMapping(currentMapping, newMatches, confidence = 'medium') {
  console.log(`📝 Generating new mapping with ${confidence}+ confidence matches...`)
  
  const validMatches = newMatches.filter(m => {
    if (confidence === 'high') return m.confidence === 'high'
    if (confidence === 'medium') return ['high', 'medium'].includes(m.confidence)
    return true // all matches
  })
  
  const additionalCodes = validMatches.map(m => m.fabric)
  const allCodes = [...currentMapping, ...additionalCodes].sort()
  
  const content = `/**
 * Fabric Image Mapping - AUTO-UPDATED WITH SMART MATCHING
 * Ninh ơi, file này đã được cập nhật với ${additionalCodes.length} fabric codes mới
 * Sử dụng smart matching với confidence >= ${confidence}
 * 
 * Generated: ${new Date().toISOString()}
 * Original mapping: ${currentMapping.length} codes
 * New matches: ${additionalCodes.length} codes
 * Total: ${allCodes.length} codes
 */

const FABRICS_WITH_CLOUDINARY_IMAGES = new Set([
${allCodes.map(code => `  '${code}'`).join(',\n')}
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

  return { content, allCodes, additionalCodes }
}

/**
 * Save analysis report
 */
function saveAnalysisReport(analysis) {
  const reportPath = path.join(__dirname, '../image-mapping-analysis.json')
  fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2), 'utf8')
  console.log(`📄 Analysis report saved: ${reportPath}`)
  return reportPath
}

/**
 * Display analysis summary
 */
function displaySummary(analysis) {
  console.log('=' .repeat(60))
  console.log('🔍 IMAGE MAPPING ANALYSIS REPORT')
  console.log('=' .repeat(60))
  console.log(`📅 Timestamp: ${analysis.timestamp}`)
  console.log(`📊 Total Cloudinary images: ${analysis.cloudinaryImages.length}`)
  console.log(`📋 Total fabric codes: ${analysis.fabricCodes.length}`)
  console.log(`🗺️ Current mapping: ${analysis.currentMapping.length}`)
  console.log(`❓ Unmapped images: ${analysis.unmappedImages.length}`)
  console.log(`❓ Unmapped fabrics: ${analysis.unmappedFabrics.length}`)
  console.log('')
  
  console.log('🎯 POTENTIAL MATCHES:')
  console.log(`  🟢 High confidence (≥90%): ${analysis.categories.high.length}`)
  console.log(`  🟡 Medium confidence (70-89%): ${analysis.categories.medium.length}`)
  console.log(`  🔴 Low confidence (60-69%): ${analysis.categories.low.length}`)
  console.log('')
  
  console.log('🟢 HIGH CONFIDENCE MATCHES (first 10):')
  analysis.categories.high.slice(0, 10).forEach(match => {
    console.log(`  ✅ ${match.image} → ${match.fabric} (${Math.round(match.score * 100)}%)`)
  })
  
  if (analysis.categories.high.length > 10) {
    console.log(`  ... and ${analysis.categories.high.length - 10} more`)
  }
  
  console.log('')
  console.log('🟡 MEDIUM CONFIDENCE MATCHES (first 5):')
  analysis.categories.medium.slice(0, 5).forEach(match => {
    console.log(`  ⚠️ ${match.image} → ${match.fabric} (${Math.round(match.score * 100)}%)`)
  })
  
  console.log('=' .repeat(60))
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Analyzing unmapped images and creating smart mapping...')
  console.log('=' .repeat(60))
  
  try {
    // Load data
    const fabricCodes = loadFabricCodes()
    const cloudinaryImages = loadCloudinaryImages()
    const currentMapping = loadCurrentMapping()
    
    // Find matches
    const { matches, unmappedImages, unmappedFabrics } = findBestMatches(
      fabricCodes, 
      cloudinaryImages, 
      currentMapping
    )
    
    // Categorize matches
    const categories = categorizeMatches(matches)
    
    // Create analysis report
    const analysis = {
      timestamp: new Date().toISOString(),
      fabricCodes: fabricCodes,
      cloudinaryImages: cloudinaryImages,
      currentMapping: currentMapping,
      unmappedImages: unmappedImages,
      unmappedFabrics: unmappedFabrics,
      matches: matches,
      categories: categories,
      recommendations: {
        highConfidence: `Apply ${categories.high.length} high confidence matches immediately`,
        mediumConfidence: `Review ${categories.medium.length} medium confidence matches manually`,
        lowConfidence: `Consider ${categories.low.length} low confidence matches carefully`
      }
    }
    
    // Save analysis
    saveAnalysisReport(analysis)
    
    // Display summary
    displaySummary(analysis)
    
    // Generate new mapping options
    console.log('📝 MAPPING OPTIONS:')
    
    const highOnlyMapping = generateNewMapping(currentMapping, matches, 'high')
    console.log(`  🟢 High confidence only: +${highOnlyMapping.additionalCodes.length} codes (total: ${highOnlyMapping.allCodes.length})`)
    
    const mediumPlusMapping = generateNewMapping(currentMapping, matches, 'medium')
    console.log(`  🟡 Medium+ confidence: +${mediumPlusMapping.additionalCodes.length} codes (total: ${mediumPlusMapping.allCodes.length})`)
    
    // Ask user which option to apply
    console.log('')
    console.log('🤔 RECOMMENDATION:')
    console.log('  Apply HIGH confidence matches immediately for safety')
    console.log('  Review MEDIUM confidence matches manually')
    
    console.log('🎉 Analysis completed!')
    
    return analysis
    
  } catch (error) {
    console.error('💥 Script failed:', error)
    process.exit(1)
  }
}

// Run script
main().catch(error => {
  console.error('💥 Unexpected error:', error)
  process.exit(1)
})
