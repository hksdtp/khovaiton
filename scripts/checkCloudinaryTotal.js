#!/usr/bin/env node

/**
 * Script kiểm tra tổng số ảnh trên Cloudinary
 * Ninh ơi, script này sẽ đếm tất cả ảnh trong folder fabric_images
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Cloudinary config
const CLOUDINARY_CLOUD_NAME = 'dgaktc3fb'
const CLOUDINARY_API_KEY = '917768158798778'
const CLOUDINARY_API_SECRET = 'ZkCVC7alaaSgcnW5kVXYQbxL5uU' // From memory

/**
 * Get Cloudinary Admin API URL
 */
function getCloudinaryAdminUrl(endpoint) {
  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${endpoint}`
}

/**
 * Create Basic Auth header for Cloudinary Admin API
 */
function getAuthHeader() {
  const credentials = Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString('base64')
  return `Basic ${credentials}`
}

/**
 * Get all resources from Cloudinary with pagination
 */
async function getAllCloudinaryResources() {
  console.log('☁️ Fetching all resources from Cloudinary...')
  
  let allResources = []
  let nextCursor = null
  let pageCount = 0
  
  do {
    pageCount++
    console.log(`📄 Fetching page ${pageCount}...`)
    
    try {
      const url = getCloudinaryAdminUrl('resources/image')
      const params = new URLSearchParams({
        max_results: '500', // Maximum per request
        resource_type: 'image'
      })
      
      if (nextCursor) {
        params.append('next_cursor', nextCursor)
      }
      
      const response = await fetch(`${url}?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      console.log(`  ✅ Page ${pageCount}: ${data.resources.length} resources`)
      
      allResources = allResources.concat(data.resources)
      nextCursor = data.next_cursor
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
      
    } catch (error) {
      console.error(`❌ Error fetching page ${pageCount}:`, error.message)
      break
    }
    
  } while (nextCursor)
  
  return allResources
}

/**
 * Analyze resources by folder
 */
function analyzeResourcesByFolder(resources) {
  console.log('📊 Analyzing resources by folder...')
  
  const folderStats = {}
  const fabricImages = []
  
  resources.forEach(resource => {
    // Extract folder from public_id
    const publicId = resource.public_id
    const folderMatch = publicId.match(/^([^\/]+)\//)
    const folder = folderMatch ? folderMatch[1] : 'root'
    
    // Initialize folder stats
    if (!folderStats[folder]) {
      folderStats[folder] = {
        count: 0,
        totalBytes: 0,
        formats: new Set()
      }
    }
    
    folderStats[folder].count++
    folderStats[folder].totalBytes += resource.bytes || 0
    folderStats[folder].formats.add(resource.format)
    
    // Check if it's a fabric image
    if (folder === 'fabric_images' || folder === 'fabrics') {
      fabricImages.push({
        publicId: publicId,
        fabricCode: publicId.replace(/^(fabric_images|fabrics)\//, '').replace(/\.[^.]+$/, ''),
        format: resource.format,
        bytes: resource.bytes,
        width: resource.width,
        height: resource.height,
        createdAt: resource.created_at
      })
    }
  })
  
  return { folderStats, fabricImages }
}

/**
 * Generate detailed report
 */
function generateReport(resources, folderStats, fabricImages) {
  const report = {
    timestamp: new Date().toISOString(),
    cloudinaryAccount: CLOUDINARY_CLOUD_NAME,
    summary: {
      totalResources: resources.length,
      totalFabricImages: fabricImages.length,
      totalFolders: Object.keys(folderStats).length
    },
    folderBreakdown: {},
    fabricImages: {
      count: fabricImages.length,
      fabricCodes: fabricImages.map(img => img.fabricCode).sort(),
      byFormat: {},
      totalSizeMB: Math.round(fabricImages.reduce((sum, img) => sum + (img.bytes || 0), 0) / 1024 / 1024 * 100) / 100
    }
  }
  
  // Process folder stats
  Object.entries(folderStats).forEach(([folder, stats]) => {
    report.folderBreakdown[folder] = {
      count: stats.count,
      sizeMB: Math.round(stats.totalBytes / 1024 / 1024 * 100) / 100,
      formats: Array.from(stats.formats).sort()
    }
  })
  
  // Process fabric images by format
  fabricImages.forEach(img => {
    if (!report.fabricImages.byFormat[img.format]) {
      report.fabricImages.byFormat[img.format] = 0
    }
    report.fabricImages.byFormat[img.format]++
  })
  
  return report
}

/**
 * Save report to file
 */
function saveReport(report) {
  const reportPath = path.join(__dirname, '../cloudinary-total-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8')
  console.log(`📄 Report saved: ${reportPath}`)
  return reportPath
}

/**
 * Display summary
 */
function displaySummary(report) {
  console.log('=' .repeat(60))
  console.log('☁️ CLOUDINARY TOTAL IMAGES REPORT')
  console.log('=' .repeat(60))
  console.log(`📅 Timestamp: ${report.timestamp}`)
  console.log(`🏢 Account: ${report.cloudinaryAccount}`)
  console.log(`📊 Total resources: ${report.summary.totalResources}`)
  console.log(`🖼️ Total fabric images: ${report.summary.totalFabricImages}`)
  console.log(`📁 Total folders: ${report.summary.totalFolders}`)
  console.log('')
  
  console.log('📁 FOLDER BREAKDOWN:')
  Object.entries(report.folderBreakdown).forEach(([folder, stats]) => {
    console.log(`  ${folder}: ${stats.count} images (${stats.sizeMB} MB) - ${stats.formats.join(', ')}`)
  })
  console.log('')
  
  console.log('🖼️ FABRIC IMAGES DETAILS:')
  console.log(`  Total: ${report.fabricImages.count} images`)
  console.log(`  Size: ${report.fabricImages.totalSizeMB} MB`)
  console.log(`  Formats:`)
  Object.entries(report.fabricImages.byFormat).forEach(([format, count]) => {
    console.log(`    ${format}: ${count} images`)
  })
  console.log('')
  
  console.log('🎯 FABRIC CODES SAMPLE (first 10):')
  report.fabricImages.fabricCodes.slice(0, 10).forEach(code => {
    console.log(`  ✅ ${code}`)
  })
  if (report.fabricImages.fabricCodes.length > 10) {
    console.log(`  ... and ${report.fabricImages.fabricCodes.length - 10} more`)
  }
  
  console.log('=' .repeat(60))
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Checking total images on Cloudinary...')
  console.log(`🏢 Account: ${CLOUDINARY_CLOUD_NAME}`)
  console.log('=' .repeat(60))
  
  try {
    // Get all resources
    const resources = await getAllCloudinaryResources()
    console.log(`✅ Total resources fetched: ${resources.length}`)
    
    // Analyze by folder
    const { folderStats, fabricImages } = analyzeResourcesByFolder(resources)
    
    // Generate report
    const report = generateReport(resources, folderStats, fabricImages)
    
    // Save report
    saveReport(report)
    
    // Display summary
    displaySummary(report)
    
    console.log('🎉 Cloudinary total check completed!')
    
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
