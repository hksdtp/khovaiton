#!/usr/bin/env node

/**
 * Script phân tích tại sao chỉ map được 91/509 ảnh Cloudinary
 * Ninh ơi, script này sẽ phân tích chi tiết nguyên nhân
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
 * Load data from files
 */
function loadData() {
  console.log('📋 Loading data for analysis...')
  
  // Load fabric codes from inventory
  const fabricContent = fs.readFileSync(FABRIC_JSON_FILE, 'utf8')
  const fabricData = JSON.parse(fabricContent)
  const fabricCodes = fabricData.fabrics.map(fabric => fabric.code).filter(Boolean)
  
  // Load Cloudinary images
  const cloudinaryContent = fs.readFileSync(CLOUDINARY_REPORT_FILE, 'utf8')
  const cloudinaryData = JSON.parse(cloudinaryContent)
  const cloudinaryImages = cloudinaryData.fabricImages.fabricCodes
  
  // Load current mapping
  const mappingContent = fs.readFileSync(FABRIC_MAPPING_FILE, 'utf8')
  const mappedMatches = mappingContent.match(/'([^']+)'/g)
  const mappedCodes = mappedMatches ? mappedMatches.map(match => match.replace(/'/g, '')) : []
  
  console.log(`✅ Loaded ${fabricCodes.length} fabric codes from inventory`)
  console.log(`✅ Loaded ${cloudinaryImages.length} images from Cloudinary`)
  console.log(`✅ Loaded ${mappedCodes.length} mapped codes`)
  
  return { fabricCodes, cloudinaryImages, mappedCodes }
}

/**
 * Normalize string for comparison
 */
function normalizeString(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '') // Remove all spaces
    .replace(/[^a-z0-9-]/g, '') // Keep only alphanumeric and hyphens
}

/**
 * Analyze naming patterns
 */
function analyzeNamingPatterns(fabricCodes, cloudinaryImages) {
  console.log('\n🔍 ANALYZING NAMING PATTERNS...')
  
  const patterns = {
    fabricCodes: {
      withSpaces: fabricCodes.filter(code => code.includes(' ')).length,
      withHyphens: fabricCodes.filter(code => code.includes('-')).length,
      withNumbers: fabricCodes.filter(code => /\d/.test(code)).length,
      withSpecialChars: fabricCodes.filter(code => /[^a-zA-Z0-9\s-]/.test(code)).length,
      avgLength: Math.round(fabricCodes.reduce((sum, code) => sum + code.length, 0) / fabricCodes.length)
    },
    cloudinaryImages: {
      withSpaces: cloudinaryImages.filter(img => img.includes(' ')).length,
      withHyphens: cloudinaryImages.filter(img => img.includes('-')).length,
      withNumbers: cloudinaryImages.filter(img => /\d/.test(img)).length,
      withSpecialChars: cloudinaryImages.filter(img => /[^a-zA-Z0-9\s-]/.test(img)).length,
      withParentheses: cloudinaryImages.filter(img => /\([^)]+\)/.test(img)).length,
      avgLength: Math.round(cloudinaryImages.reduce((sum, img) => sum + img.length, 0) / cloudinaryImages.length)
    }
  }
  
  console.log('\n📊 FABRIC CODES PATTERNS:')
  console.log(`  With spaces: ${patterns.fabricCodes.withSpaces}/${fabricCodes.length} (${Math.round(patterns.fabricCodes.withSpaces/fabricCodes.length*100)}%)`)
  console.log(`  With hyphens: ${patterns.fabricCodes.withHyphens}/${fabricCodes.length} (${Math.round(patterns.fabricCodes.withHyphens/fabricCodes.length*100)}%)`)
  console.log(`  With numbers: ${patterns.fabricCodes.withNumbers}/${fabricCodes.length} (${Math.round(patterns.fabricCodes.withNumbers/fabricCodes.length*100)}%)`)
  console.log(`  Average length: ${patterns.fabricCodes.avgLength} chars`)
  
  console.log('\n📊 CLOUDINARY IMAGES PATTERNS:')
  console.log(`  With spaces: ${patterns.cloudinaryImages.withSpaces}/${cloudinaryImages.length} (${Math.round(patterns.cloudinaryImages.withSpaces/cloudinaryImages.length*100)}%)`)
  console.log(`  With hyphens: ${patterns.cloudinaryImages.withHyphens}/${cloudinaryImages.length} (${Math.round(patterns.cloudinaryImages.withHyphens/cloudinaryImages.length*100)}%)`)
  console.log(`  With numbers: ${patterns.cloudinaryImages.withNumbers}/${cloudinaryImages.length} (${Math.round(patterns.cloudinaryImages.withNumbers/cloudinaryImages.length*100)}%)`)
  console.log(`  With parentheses: ${patterns.cloudinaryImages.withParentheses}/${cloudinaryImages.length} (${Math.round(patterns.cloudinaryImages.withParentheses/cloudinaryImages.length*100)}%)`)
  console.log(`  Average length: ${patterns.cloudinaryImages.avgLength} chars`)
  
  return patterns
}

/**
 * Find potential matches with fuzzy matching
 */
function findPotentialMatches(fabricCodes, cloudinaryImages, mappedCodes) {
  console.log('\n🔍 FINDING POTENTIAL MATCHES...')
  
  const unmappedFabrics = fabricCodes.filter(code => !mappedCodes.includes(code))
  const unmappedImages = cloudinaryImages.filter(img => !mappedCodes.some(mapped => {
    return normalizeString(img) === normalizeString(mapped)
  }))
  
  console.log(`📊 Unmapped fabrics: ${unmappedFabrics.length}/${fabricCodes.length}`)
  console.log(`📊 Unmapped images: ${unmappedImages.length}/${cloudinaryImages.length}`)
  
  const potentialMatches = []
  
  unmappedFabrics.forEach(fabric => {
    const normalizedFabric = normalizeString(fabric)
    
    unmappedImages.forEach(image => {
      const normalizedImage = normalizeString(image)
      
      // Exact match after normalization
      if (normalizedFabric === normalizedImage) {
        potentialMatches.push({
          fabric,
          image,
          type: 'exact_normalized',
          confidence: 1.0
        })
      }
      // Contains match
      else if (normalizedFabric.includes(normalizedImage) || normalizedImage.includes(normalizedFabric)) {
        const confidence = Math.min(normalizedFabric.length, normalizedImage.length) / Math.max(normalizedFabric.length, normalizedImage.length)
        if (confidence >= 0.7) {
          potentialMatches.push({
            fabric,
            image,
            type: 'contains',
            confidence
          })
        }
      }
    })
  })
  
  // Sort by confidence
  potentialMatches.sort((a, b) => b.confidence - a.confidence)
  
  return { potentialMatches, unmappedFabrics, unmappedImages }
}

/**
 * Categorize unmapped images
 */
function categorizeUnmappedImages(unmappedImages) {
  console.log('\n📂 CATEGORIZING UNMAPPED IMAGES...')
  
  const categories = {
    duplicates: [],
    oldFormats: [],
    specialChars: [],
    noMatch: []
  }
  
  unmappedImages.forEach(image => {
    if (/\([^)]+\)/.test(image)) {
      categories.duplicates.push(image)
    } else if (image.includes(' ') && image.includes('-')) {
      categories.oldFormats.push(image)
    } else if (/[^a-zA-Z0-9\s-]/.test(image)) {
      categories.specialChars.push(image)
    } else {
      categories.noMatch.push(image)
    }
  })
  
  console.log(`📊 Duplicates (with parentheses): ${categories.duplicates.length}`)
  console.log(`📊 Old formats (spaces + hyphens): ${categories.oldFormats.length}`)
  console.log(`📊 Special characters: ${categories.specialChars.length}`)
  console.log(`📊 No clear pattern: ${categories.noMatch.length}`)
  
  return categories
}

/**
 * Generate analysis report
 */
function generateAnalysisReport(data, patterns, matches, categories) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFabricCodes: data.fabricCodes.length,
      totalCloudinaryImages: data.cloudinaryImages.length,
      currentlyMapped: data.mappedCodes.length,
      mappingRate: Math.round((data.mappedCodes.length / data.fabricCodes.length) * 100 * 100) / 100,
      potentialNewMatches: matches.potentialMatches.length
    },
    analysis: {
      namingPatterns: patterns,
      potentialMatches: matches.potentialMatches.slice(0, 50), // Top 50
      unmappedCategories: {
        duplicates: categories.duplicates.length,
        oldFormats: categories.oldFormats.length,
        specialChars: categories.specialChars.length,
        noMatch: categories.noMatch.length
      }
    },
    recommendations: [
      `Found ${matches.potentialMatches.filter(m => m.confidence >= 0.9).length} high-confidence potential matches`,
      `${categories.duplicates.length} images appear to be duplicates with (1), (2) suffixes`,
      `${categories.oldFormats.length} images use old naming format with spaces`,
      `Consider normalizing image names to match fabric code format`,
      `${Math.round((data.mappedCodes.length / data.cloudinaryImages.length) * 100)}% of Cloudinary images are currently utilized`
    ],
    examples: {
      duplicates: categories.duplicates.slice(0, 10),
      oldFormats: categories.oldFormats.slice(0, 10),
      potentialMatches: matches.potentialMatches.slice(0, 10)
    }
  }
  
  const reportPath = path.join(__dirname, '../cloudinary-mapping-analysis.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8')
  
  return report
}

/**
 * Display analysis summary
 */
function displaySummary(report) {
  console.log('\n' + '=' .repeat(60))
  console.log('📊 CLOUDINARY MAPPING ANALYSIS REPORT')
  console.log('=' .repeat(60))
  console.log(`📅 Timestamp: ${report.timestamp}`)
  console.log(`📋 Total fabric codes: ${report.summary.totalFabricCodes}`)
  console.log(`☁️ Total Cloudinary images: ${report.summary.totalCloudinaryImages}`)
  console.log(`🗺️ Currently mapped: ${report.summary.currentlyMapped} (${report.summary.mappingRate}%)`)
  console.log(`🎯 Potential new matches: ${report.summary.potentialNewMatches}`)
  console.log('')
  
  console.log('🔍 KEY FINDINGS:')
  report.recommendations.forEach(rec => {
    console.log(`  • ${rec}`)
  })
  console.log('')
  
  console.log('📂 UNMAPPED IMAGE CATEGORIES:')
  console.log(`  🔄 Duplicates: ${report.analysis.unmappedCategories.duplicates}`)
  console.log(`  📝 Old formats: ${report.analysis.unmappedCategories.oldFormats}`)
  console.log(`  🔤 Special chars: ${report.analysis.unmappedCategories.specialChars}`)
  console.log(`  ❓ No pattern: ${report.analysis.unmappedCategories.noMatch}`)
  console.log('')
  
  console.log('💡 TOP POTENTIAL MATCHES:')
  report.examples.potentialMatches.forEach((match, i) => {
    console.log(`  ${i+1}. "${match.fabric}" ↔ "${match.image}" (${Math.round(match.confidence*100)}%)`)
  })
  
  console.log('=' .repeat(60))
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Analyzing Cloudinary mapping efficiency...')
  console.log('🎯 Goal: Understand why only 91/509 images are mapped')
  console.log('=' .repeat(60))
  
  try {
    // Load data
    const data = loadData()
    
    // Analyze patterns
    const patterns = analyzeNamingPatterns(data.fabricCodes, data.cloudinaryImages)
    
    // Find potential matches
    const matches = findPotentialMatches(data.fabricCodes, data.cloudinaryImages, data.mappedCodes)
    
    // Categorize unmapped images
    const categories = categorizeUnmappedImages(matches.unmappedImages)
    
    // Generate report
    const report = generateAnalysisReport(data, patterns, matches, categories)
    
    // Display summary
    displaySummary(report)
    
    console.log('🎉 Analysis completed!')
    console.log(`📄 Detailed report saved: cloudinary-mapping-analysis.json`)
    
  } catch (error) {
    console.error('💥 Analysis failed:', error)
    process.exit(1)
  }
}

// Run analysis
main().catch(error => {
  console.error('💥 Unexpected error:', error)
  process.exit(1)
})
