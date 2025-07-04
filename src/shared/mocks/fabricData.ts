import { Fabric, FabricType, FabricStatus } from '@/features/inventory/types'
import { batchFindFabricImages } from '@/features/inventory/services/imageService'
// import { getCachedImageUrl, autoSyncOnStartup } from '@/features/inventory/services/onlineImageSyncService'
// import { environment, isProduction } from '@/shared/config/environment'
import { cloudinaryService } from '../../services/cloudinaryService'

/**
 * Real fabric data from Excel file "File tổng hợp tồn kho tầng 4 (27.06.2025).xlsx"
 * Converted from CSV format with 331 real fabric items
 */

/**
 * Parse real CSV data from Excel file into Fabric objects
 */
async function loadRealFabricData(): Promise<Fabric[]> {
  try {
    // Read the CSV file we created from Excel
    const response = await fetch('/fabric_inventory_updated.csv')
    const csvText = await response.text()

    return parseCSVData(csvText)
  } catch (error) {
    console.warn('Could not load real fabric data, using fallback data:', error)
    return generateFallbackData()
  }
}

function parseCSVData(csvText: string): Fabric[] {
  const lines = csvText.split('\n').filter(line => line.trim())

  return lines.slice(1).map((line, index) => {
    const values = parseCSVLine(line)

    // Map CSV columns to our data structure
    const stt = parseFloat(values[0] || '0') || index + 1
    const code = cleanValue(values[1]) || `FABRIC-${index + 1}`
    const name = cleanValue(values[2]) || `Vải ${index + 1}`
    const unit = cleanValue(values[3]) || 'm'
    const quantity = parseFloat(values[4] || '0') || 0
    const location = cleanValue(values[5]) || 'T4'
    const type = cleanValue(values[6]) as FabricType | undefined
    const condition = cleanValue(values[7])
    const remarks = cleanValue(values[8])

    // Determine fabric status based on quantity and condition
    let status: FabricStatus = 'available'
    if (quantity < 10) {
      status = 'low_stock'
    }
    if (quantity === 0) {
      status = 'out_of_stock'
    }
    if (condition?.includes('Lỗi') || condition?.includes('bẩn') || condition?.includes('mốc')) {
      status = 'damaged'
    }

    // Extract width from name
    const widthMatch = name?.match(/[Ww](\d+)cm|[Kk]hổ\s*(\d+)cm/)
    const width = widthMatch ? parseInt(widthMatch[1] || widthMatch[2] || '0') : undefined

    // Extract material from name
    let material: string | undefined
    if (name?.toLowerCase().includes('polyeste')) material = 'Polyester'
    else if (name?.toLowerCase().includes('cotton')) material = 'Cotton'
    else if (name?.toLowerCase().includes('lụa')) material = 'Silk'
    else if (name?.toLowerCase().includes('voan')) material = 'Chiffon'

    // Extract color from name
    let color: string | undefined
    if (name?.toLowerCase().includes('trắng') || name?.toLowerCase().includes('white')) color = 'Trắng'
    else if (name?.toLowerCase().includes('xanh')) color = 'Xanh'
    else if (name?.toLowerCase().includes('đỏ')) color = 'Đỏ'
    else if (name?.toLowerCase().includes('vàng')) color = 'Vàng'

    return {
      id: Math.floor(stt),
      code,
      name,
      unit,
      quantity,
      location,
      type,
      condition,
      remarks,
      note: condition || remarks, // Backward compatibility
      width,
      material,
      color,
      status,
      createdAt: new Date(2025, 5, 27), // File date: 27.06.2025
      updatedAt: new Date(),
    }
  }).filter(fabric => fabric.code && fabric.name) // Filter out invalid entries
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}

function cleanValue(value: string | undefined): string | undefined {
  if (!value || value === 'NaN' || value === 'nan' || value.trim() === '') {
    return undefined
  }
  return value.replace(/"/g, '').trim()
}

function generateFallbackData(): Fabric[] {
  // Fallback data in case CSV loading fails
  return [
    {
      id: 1,
      code: '3 PASS BO - WHITE - COL 15',
      name: 'Vải 3 PASS BO - WHITE - COL 15 Khổ 280cm',
      unit: 'm',
      quantity: 45.97,
      location: 'T4 giữa A-B (phía trong)',
      type: 'lót',
      condition: 'Lỗi nhẹ, bẩn, mốc nhẹ',
      note: 'Lỗi nhẹ, bẩn, mốc nhẹ',
      width: 280,
      material: 'Cotton',
      color: 'Trắng',
      status: 'damaged',
      createdAt: new Date(2025, 5, 27),
      updatedAt: new Date(),
    },
    // Add a few more fallback items...
  ]
}

/**
 * Real fabric inventory data loaded from Excel file
 * This will be loaded asynchronously from the CSV file
 */
let cachedFabrics: Fabric[] | null = null

export async function getMockFabrics(): Promise<Fabric[]> {
  if (cachedFabrics) {
    return cachedFabrics
  }

  try {
    // Load fabric data first
    cachedFabrics = await loadRealFabricData()

    // MULTI-SOURCE IMAGE LOADING: Cloudinary → Static → Placeholder
    console.log('🖼️ Loading images from multiple sources...')
    const fabricCodes = cachedFabrics.map(f => f.code)

    // Try Cloudinary first if configured
    let cloudinaryImageMap = new Map<string, string>()
    if (cloudinaryService.isConfigured()) {
      console.log('☁️ Checking Cloudinary for images...')
      try {
        const cloudinaryExists = await cloudinaryService.batchCheckImages(fabricCodes)
        cloudinaryExists.forEach((exists, code) => {
          if (exists) {
            const url = cloudinaryService.getFabricImageUrl(code, { width: 800, quality: 80 })
            if (url) {
              cloudinaryImageMap.set(code, url)
            }
          }
        })
        console.log(`☁️ Found ${cloudinaryImageMap.size} images in Cloudinary`)
      } catch (error) {
        console.warn('⚠️ Cloudinary check failed:', error)
      }
    }

    // Fallback to static images for codes not in Cloudinary
    const remainingCodes = fabricCodes.filter(code => !cloudinaryImageMap.has(code))
    const staticImageMap = await batchFindFabricImages(remainingCodes)
    console.log(`🖼️ Found ${staticImageMap.size} static images`)

    // Update fabrics with found images (Cloudinary priority)
    const updatedFabrics = cachedFabrics.map(fabric => ({
      ...fabric,
      image: cloudinaryImageMap.get(fabric.code) || staticImageMap.get(fabric.code) || undefined
    }))

    const withImages = updatedFabrics.filter(f => f.image).length
    const cloudinaryCount = cloudinaryImageMap.size
    const staticCount = staticImageMap.size

    console.log(`✅ Image loading complete:`)
    console.log(`   • Cloudinary: ${cloudinaryCount} images`)
    console.log(`   • Static: ${staticCount} images`)
    console.log(`   • Total: ${withImages}/${updatedFabrics.length} fabrics with images`)

    cachedFabrics = updatedFabrics
    return updatedFabrics

  } catch (error) {
    console.error('Failed to load fabric data:', error)
    cachedFabrics = generateFallbackData()
    return cachedFabrics
  }
}

/**
 * Synchronous version for backward compatibility
 * Returns fallback data immediately, real data will be loaded async
 */
export const mockFabrics: Fabric[] = generateFallbackData()

/**
 * Generate additional mock fabrics for testing
 */
export function generateMockFabrics(count: number): Fabric[] {
  const types: FabricType[] = ['chính', 'lót', 'voan', 'Roller', 'Suntrip']
  const locations = ['T4 A1', 'T4 B2', 'T4 C3', 'T4 D4', 'T4 E5']
  const materials = ['Cotton', 'Polyester', 'Silk', 'Linen', 'Wool']
  const colors = ['Trắng', 'Đen', 'Xanh', 'Đỏ', 'Vàng', 'Tím', 'Hồng']

  return Array.from({ length: count }, (_, index) => ({
    id: 1000 + index,
    code: `MOCK-${String(index + 1).padStart(4, '0')}`,
    name: `Vải Mock ${index + 1}`,
    unit: Math.random() > 0.8 ? 'kg' : 'm',
    quantity: Math.floor(Math.random() * 100),
    location: locations[Math.floor(Math.random() * locations.length)]!,
    type: types[Math.floor(Math.random() * types.length)]!,
    width: 280 + Math.floor(Math.random() * 40),
    material: materials[Math.floor(Math.random() * materials.length)],
    color: colors[Math.floor(Math.random() * colors.length)],
    status: 'available' as FabricStatus,
    createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
    updatedAt: new Date(),
  })) as Fabric[]
}
