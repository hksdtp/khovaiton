#!/usr/bin/env node

/**
 * Script để cập nhật fabricImageMapping.ts với TẤT CẢ fabric codes có ảnh
 * Ninh ơi, script này sẽ scan cả Cloudinary + static images để tạo mapping chính xác
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Đường dẫn đến thư mục static images
const STATIC_IMAGES_DIR = path.join(__dirname, '../public/images/fabrics')
const FABRIC_MAPPING_FILE = path.join(__dirname, '../src/data/fabricImageMapping.ts')

// Supported image formats
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.webp']

/**
 * Normalize fabric code từ filename
 */
function normalizeFabricCode(filename) {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.(jpg|jpeg|png|webp)$/i, '')
  return nameWithoutExt.trim()
}

/**
 * Scan static images directory
 */
function scanStaticImages() {
  console.log('🔍 Scanning static images...')
  
  if (!fs.existsSync(STATIC_IMAGES_DIR)) {
    console.warn('⚠️ Static images directory not found:', STATIC_IMAGES_DIR)
    return new Set()
  }

  const files = fs.readdirSync(STATIC_IMAGES_DIR)
  const fabricCodes = new Set()

  files.forEach(file => {
    const ext = path.extname(file).toLowerCase()
    if (SUPPORTED_FORMATS.includes(ext)) {
      const fabricCode = normalizeFabricCode(file)
      fabricCodes.add(fabricCode)
      console.log(`  ✅ Found: ${fabricCode} (${file})`)
    }
  })

  console.log(`📊 Static images: ${fabricCodes.size} fabric codes`)
  return fabricCodes
}

/**
 * Load existing Cloudinary mapping
 */
function loadCloudinaryMapping() {
  console.log('☁️ Loading existing Cloudinary mapping...')
  
  try {
    const content = fs.readFileSync(FABRIC_MAPPING_FILE, 'utf8')
    const matches = content.match(/FABRICS_WITH_IMAGES = new Set\(\[([\s\S]*?)\]\)/m)
    
    if (!matches) {
      console.warn('⚠️ Could not parse existing mapping')
      return new Set()
    }

    const fabricCodes = new Set()
    const lines = matches[1].split('\n')
    
    lines.forEach(line => {
      const match = line.match(/'([^']+)'/g)
      if (match) {
        match.forEach(quoted => {
          const code = quoted.replace(/'/g, '')
          if (code.trim()) {
            fabricCodes.add(code.trim())
          }
        })
      }
    })

    console.log(`📊 Cloudinary mapping: ${fabricCodes.size} fabric codes`)
    return fabricCodes
  } catch (error) {
    console.error('❌ Error loading Cloudinary mapping:', error.message)
    return new Set()
  }
}

/**
 * Generate new mapping file with separate sources
 */
function generateMappingFile(staticCodes, cloudinaryCodes) {
  console.log('📝 Generating new mapping file...')

  const allCodes = new Set([...staticCodes, ...cloudinaryCodes])
  const sortedAllCodes = Array.from(allCodes).sort()
  const sortedStaticCodes = Array.from(staticCodes).sort()
  const sortedCloudinaryCodes = Array.from(cloudinaryCodes).sort()

  const content = `/**
 * Fabric Image Mapping - AUTO-GENERATED
 * Ninh ơi, file này được tự động tạo bởi updateFabricImageMapping.js
 * Tách riêng 2 nguồn ảnh: Static + Cloudinary để tránh 404 errors
 *
 * Generated: ${new Date().toISOString()}
 * Static images: ${sortedStaticCodes.length}
 * Cloudinary images: ${sortedCloudinaryCodes.length}
 * Total unique: ${sortedAllCodes.length}
 */

// Static images (local files in /public/images/fabrics/)
const FABRICS_WITH_STATIC_IMAGES = new Set([
${sortedStaticCodes.map(code => `  '${code}'`).join(',\n')}
])

// Cloudinary images (verified to exist on Cloudinary)
const FABRICS_WITH_CLOUDINARY_IMAGES = new Set([
${sortedCloudinaryCodes.map(code => `  '${code}'`).join(',\n')}
])

// Combined set for hasRealImage function
const FABRICS_WITH_IMAGES = new Set([
${sortedAllCodes.map(code => `  '${code}'`).join(',\n')}
])

export function hasRealImage(fabricCode: string): boolean {
  return FABRICS_WITH_IMAGES.has(fabricCode)
}

export function hasStaticImage(fabricCode: string): boolean {
  return FABRICS_WITH_STATIC_IMAGES.has(fabricCode)
}

export function hasCloudinaryImage(fabricCode: string): boolean {
  return FABRICS_WITH_CLOUDINARY_IMAGES.has(fabricCode)
}

export function getAllFabricsWithImages(): string[] {
  return Array.from(FABRICS_WITH_IMAGES)
}

export function getFabricImageCount(): number {
  return FABRICS_WITH_IMAGES.size
}

export function getStaticImageCount(): number {
  return FABRICS_WITH_STATIC_IMAGES.size
}

export function getCloudinaryImageCount(): number {
  return FABRICS_WITH_CLOUDINARY_IMAGES.size
}
`

  fs.writeFileSync(FABRIC_MAPPING_FILE, content, 'utf8')
  console.log(`✅ Updated ${FABRIC_MAPPING_FILE}`)
  console.log(`📊 Static: ${sortedStaticCodes.length}, Cloudinary: ${sortedCloudinaryCodes.length}, Total: ${sortedAllCodes.length}`)
}

/**
 * Main function
 */
function main() {
  console.log('🚀 Updating fabric image mapping...')
  console.log('=' .repeat(50))
  
  // Scan static images
  const staticCodes = scanStaticImages()
  
  // Load Cloudinary mapping
  const cloudinaryCodes = loadCloudinaryMapping()
  
  // Combine both sets
  const allCodes = new Set([...staticCodes, ...cloudinaryCodes])
  
  console.log('=' .repeat(50))
  console.log(`📊 SUMMARY:`)
  console.log(`   Static images: ${staticCodes.size}`)
  console.log(`   Cloudinary: ${cloudinaryCodes.size}`)
  console.log(`   Total unique: ${allCodes.size}`)
  console.log('=' .repeat(50))
  
  // Generate new mapping file with separate sources
  generateMappingFile(staticCodes, cloudinaryCodes)
  
  console.log('🎉 Fabric image mapping updated successfully!')
}

// Run script
main()
