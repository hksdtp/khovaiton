#!/usr/bin/env node

/**
 * Script áp dụng smart mapping tự động
 * Ninh ơi, script này sẽ áp dụng các matches đã phân tích
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// File paths
const ANALYSIS_REPORT_FILE = path.join(__dirname, '../image-mapping-analysis.json')
const FABRIC_MAPPING_FILE = path.join(__dirname, '../src/data/fabricImageMapping.ts')

/**
 * Load analysis report
 */
function loadAnalysisReport() {
  console.log('📊 Loading analysis report...')
  
  const content = fs.readFileSync(ANALYSIS_REPORT_FILE, 'utf8')
  const analysis = JSON.parse(content)
  
  console.log(`✅ Loaded analysis with ${analysis.matches.length} potential matches`)
  
  return analysis
}

/**
 * Apply mapping with specified confidence level
 */
function applyMapping(analysis, confidenceLevel = 'high', dryRun = false) {
  console.log(`🎯 Applying ${confidenceLevel} confidence mapping...`)
  console.log(`🔍 Dry run: ${dryRun ? 'YES' : 'NO'}`)
  
  // Filter matches by confidence
  let validMatches = []
  
  switch (confidenceLevel) {
    case 'high':
      validMatches = analysis.categories.high
      break
    case 'medium':
      validMatches = [...analysis.categories.high, ...analysis.categories.medium]
      break
    case 'all':
      validMatches = analysis.matches
      break
    default:
      throw new Error(`Invalid confidence level: ${confidenceLevel}`)
  }
  
  console.log(`📋 Selected ${validMatches.length} matches for ${confidenceLevel} confidence`)
  
  // Create new mapping
  const currentMapping = analysis.currentMapping
  const newCodes = validMatches.map(match => match.fabric)
  const allCodes = [...currentMapping, ...newCodes].sort()
  
  // Remove duplicates
  const uniqueCodes = [...new Set(allCodes)]
  
  console.log(`📊 Mapping summary:`)
  console.log(`  Current: ${currentMapping.length} codes`)
  console.log(`  Adding: ${newCodes.length} codes`)
  console.log(`  Total: ${uniqueCodes.length} codes`)
  console.log(`  Coverage: ${Math.round(uniqueCodes.length / analysis.fabricCodes.length * 100)}% of all fabric codes`)
  
  // Generate new mapping file content
  const content = `/**
 * Fabric Image Mapping - SMART MAPPING APPLIED
 * Ninh ơi, file này đã được cập nhật với smart mapping
 * 
 * Applied: ${new Date().toISOString()}
 * Confidence level: ${confidenceLevel}
 * Original mapping: ${currentMapping.length} codes
 * New matches: ${newCodes.length} codes
 * Total: ${uniqueCodes.length} codes
 * Coverage: ${Math.round(uniqueCodes.length / analysis.fabricCodes.length * 100)}% of all fabric codes
 */

const FABRICS_WITH_CLOUDINARY_IMAGES = new Set([
${uniqueCodes.map(code => `  '${code}'`).join(',\n')}
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

  if (!dryRun) {
    // Backup current mapping
    const backupPath = `${FABRIC_MAPPING_FILE}.backup.${Date.now()}`
    fs.copyFileSync(FABRIC_MAPPING_FILE, backupPath)
    console.log(`💾 Backup created: ${backupPath}`)
    
    // Write new mapping
    fs.writeFileSync(FABRIC_MAPPING_FILE, content, 'utf8')
    console.log(`✅ New mapping applied to ${FABRIC_MAPPING_FILE}`)
  } else {
    console.log('🔍 DRY RUN - No files were modified')
  }
  
  return {
    currentMapping,
    newCodes,
    uniqueCodes,
    validMatches,
    content
  }
}

/**
 * Display detailed matches
 */
function displayMatches(matches, title) {
  console.log(`\n${title}:`)
  console.log('=' .repeat(60))
  
  matches.forEach((match, index) => {
    const confidence = match.score >= 0.9 ? '🟢' : match.score >= 0.7 ? '🟡' : '🔴'
    const num = (index + 1).toString().padStart(2, ' ')
    console.log(`${num}. ${confidence} ${match.image} → ${match.fabric} (${Math.round(match.score * 100)}%)`)
  })
}

/**
 * Interactive mode - let user choose what to apply
 */
function interactiveMode(analysis) {
  console.log('\n🤔 INTERACTIVE MODE')
  console.log('=' .repeat(60))
  
  console.log('Available options:')
  console.log('1. 🟢 Apply HIGH confidence matches only (31 matches)')
  console.log('2. 🟡 Apply HIGH + MEDIUM confidence matches (85 matches)')
  console.log('3. 🔴 Apply ALL matches (100 matches)')
  console.log('4. 🔍 Dry run - preview changes only')
  console.log('5. 📊 Show detailed matches')
  console.log('6. ❌ Cancel')
  
  // For demo, we'll apply high confidence matches
  console.log('\n🎯 Applying HIGH confidence matches (recommended)...')
  return applyMapping(analysis, 'high', false)
}

/**
 * Validate mapping results
 */
function validateMapping(result, analysis) {
  console.log('\n✅ VALIDATION RESULTS:')
  console.log('=' .repeat(60))
  
  const coverage = result.uniqueCodes.length / analysis.fabricCodes.length
  const improvement = (result.uniqueCodes.length - analysis.currentMapping.length) / analysis.currentMapping.length
  
  console.log(`📊 Coverage: ${Math.round(coverage * 100)}% (${result.uniqueCodes.length}/${analysis.fabricCodes.length})`)
  console.log(`📈 Improvement: +${Math.round(improvement * 100)}% (${result.newCodes.length} new codes)`)
  console.log(`🎯 Confidence: Applied ${result.validMatches.length} matches`)
  
  // Check for potential issues
  const duplicates = result.newCodes.filter((code, index) => result.newCodes.indexOf(code) !== index)
  if (duplicates.length > 0) {
    console.log(`⚠️ Warning: ${duplicates.length} duplicate codes found`)
  }
  
  const longCodes = result.uniqueCodes.filter(code => code.length > 50)
  if (longCodes.length > 0) {
    console.log(`⚠️ Warning: ${longCodes.length} unusually long codes found`)
  }
  
  console.log('✅ Validation completed')
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Applying smart mapping to fabric images...')
  console.log('=' .repeat(60))
  
  try {
    // Load analysis
    const analysis = loadAnalysisReport()
    
    // Show summary
    console.log('\n📊 ANALYSIS SUMMARY:')
    console.log(`Total Cloudinary images: ${analysis.cloudinaryImages.length}`)
    console.log(`Total fabric codes: ${analysis.fabricCodes.length}`)
    console.log(`Current mapping: ${analysis.currentMapping.length}`)
    console.log(`Potential matches: ${analysis.matches.length}`)
    console.log(`  🟢 High confidence: ${analysis.categories.high.length}`)
    console.log(`  🟡 Medium confidence: ${analysis.categories.medium.length}`)
    console.log(`  🔴 Low confidence: ${analysis.categories.low.length}`)
    
    // Show high confidence matches
    displayMatches(analysis.categories.high, '🟢 HIGH CONFIDENCE MATCHES')
    
    // Apply medium+ confidence matches for maximum coverage
    console.log('\n🎯 APPLYING MEDIUM+ CONFIDENCE MATCHES (MAXIMUM COVERAGE)')
    const result = applyMapping(analysis, 'medium', false)
    
    // Validate results
    validateMapping(result, analysis)
    
    console.log('\n🎉 Smart mapping completed successfully!')
    console.log('📝 Next steps:')
    console.log('  1. Test the web app to verify new mappings work')
    console.log('  2. Review medium confidence matches manually if needed')
    console.log('  3. Consider cleaning up unused images on Cloudinary')
    
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
