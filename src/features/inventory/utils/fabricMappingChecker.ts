/**
 * Fabric mapping checker - runs in browser with proper referrer
 */

import { getAllFilesFromSubfolders, filterImageFiles } from '../services/googleDriveApiService'
import { getMockFabrics } from '../../../shared/mocks/fabricData'

export interface MappingResult {
  totalSourceCodes: number
  totalDriveFiles: number
  perfectMatches: string[]
  missingInDrive: string[]
  extraInDrive: string[]
  matchPercentage: number
}

/**
 * Extract fabric code from filename (remove extension)
 */
function extractFabricCodeFromFilename(filename: string): string {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')
  return nameWithoutExt.trim()
}

/**
 * Check mapping between fabric codes in source and files in Google Drive
 */
export async function checkFabricMapping(): Promise<MappingResult> {
  console.log('🔍 Starting fabric mapping check...')
  
  try {
    // Load fabric codes from source
    const fabricData = await getMockFabrics()
    const sourceFabricCodes = new Set(fabricData.map((f: any) => f.code as string))
    
    console.log(`📋 Loaded ${sourceFabricCodes.size} fabric codes from source`)
    
    // Get all files from Google Drive subfolders
    const allDriveFiles = await getAllFilesFromSubfolders()
    const imageFiles = filterImageFiles(allDriveFiles)
    
    console.log(`🖼️ Found ${imageFiles.length} image files in Google Drive`)
    
    // Extract fabric codes from filenames
    const driveFabricCodes = new Set<string>()
    const filenameToCode = new Map<string, string>()
    
    for (const file of imageFiles) {
      const fabricCode = extractFabricCodeFromFilename(file.name)
      driveFabricCodes.add(fabricCode)
      filenameToCode.set(file.name, fabricCode)
    }
    
    // Find matches and mismatches
    const perfectMatches = Array.from(sourceFabricCodes).filter((code: string) =>
      driveFabricCodes.has(code)
    )

    const missingInDrive = Array.from(sourceFabricCodes).filter((code: string) =>
      !driveFabricCodes.has(code)
    )

    const extraInDrive = Array.from(driveFabricCodes).filter((code: string) =>
      !sourceFabricCodes.has(code)
    )
    
    const matchPercentage = sourceFabricCodes.size > 0 
      ? (perfectMatches.length / sourceFabricCodes.size) * 100 
      : 0
    
    const result: MappingResult = {
      totalSourceCodes: sourceFabricCodes.size,
      totalDriveFiles: driveFabricCodes.size,
      perfectMatches: perfectMatches.sort() as string[],
      missingInDrive: missingInDrive.sort() as string[],
      extraInDrive: extraInDrive.sort() as string[],
      matchPercentage
    }
    
    // Log results
    console.log('📊 MAPPING ANALYSIS RESULTS:')
    console.log(`✅ Perfect matches: ${perfectMatches.length}`)
    console.log(`❌ Missing in Drive: ${missingInDrive.length}`)
    console.log(`⚠️ Extra in Drive: ${extraInDrive.length}`)
    console.log(`📈 Match rate: ${matchPercentage.toFixed(1)}%`)
    
    if (perfectMatches.length > 0) {
      console.log('✅ Sample matches:', perfectMatches.slice(0, 5))
    }
    
    if (missingInDrive.length > 0) {
      console.log('❌ Sample missing:', missingInDrive.slice(0, 5))
    }
    
    if (extraInDrive.length > 0) {
      console.log('⚠️ Sample extra:', extraInDrive.slice(0, 5))
    }
    
    return result
    
  } catch (error) {
    console.error('❌ Error checking fabric mapping:', error)
    throw error
  }
}

/**
 * Generate detailed mapping report
 */
export function generateMappingReport(result: MappingResult): string {
  const lines = [
    '🔍 FABRIC MAPPING ANALYSIS REPORT',
    '=' .repeat(50),
    '',
    `📊 SUMMARY:`,
    `   Source fabric codes: ${result.totalSourceCodes}`,
    `   Drive image files: ${result.totalDriveFiles}`,
    `   Perfect matches: ${result.perfectMatches.length}`,
    `   Missing in Drive: ${result.missingInDrive.length}`,
    `   Extra in Drive: ${result.extraInDrive.length}`,
    `   Match rate: ${result.matchPercentage.toFixed(1)}%`,
    '',
  ]
  
  if (result.perfectMatches.length > 0) {
    lines.push('✅ PERFECT MATCHES:')
    result.perfectMatches.forEach(code => {
      lines.push(`   ✓ ${code}`)
    })
    lines.push('')
  }
  
  if (result.missingInDrive.length > 0) {
    lines.push('❌ MISSING IN DRIVE:')
    result.missingInDrive.forEach(code => {
      lines.push(`   ✗ ${code}`)
    })
    lines.push('')
  }
  
  if (result.extraInDrive.length > 0) {
    lines.push('⚠️ EXTRA IN DRIVE:')
    result.extraInDrive.forEach(code => {
      lines.push(`   ? ${code}`)
    })
    lines.push('')
  }
  
  // Recommendations
  lines.push('💡 RECOMMENDATIONS:')
  
  if (result.matchPercentage >= 80) {
    lines.push('   🎉 Excellent mapping! Ready for production.')
  } else if (result.matchPercentage >= 50) {
    lines.push('   ⚠️ Moderate mapping. Consider uploading missing images.')
  } else {
    lines.push('   ❌ Poor mapping. Need to upload many missing images.')
  }
  
  if (result.missingInDrive.length > 0) {
    lines.push(`   📤 Upload ${result.missingInDrive.length} missing images to Google Drive`)
  }
  
  if (result.extraInDrive.length > 0) {
    lines.push(`   🧹 Consider removing ${result.extraInDrive.length} extra images or adding to inventory`)
  }
  
  return lines.join('\n')
}
