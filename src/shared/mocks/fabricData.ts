import { Fabric, FabricType, FabricStatus } from '@/features/inventory/types'
import { batchFindFabricImages } from '@/features/inventory/services/imageService'
import { cloudinaryService } from '../../services/cloudinaryService'

/**
 * Real fabric data from Excel file "File tổng hợp tồn kho tầng 4 (27.06.2025).xlsx"
 * Converted from CSV format with 331 real fabric items
 */

/**
 * Load fabric inventory data from anhhung.xlsx (331 codes - VẢI TỒN KHO)
 * Ninh ơi, đã switch sang dữ liệu vải tồn kho thực tế
 */
async function loadRealFabricData(): Promise<Fabric[]> {
  try {
    // Load from fabric inventory data (331 codes - ONLY fabrics in stock)
    const response = await fetch('/anhhung-fabrics.json')
    if (!response.ok) {
      throw new Error(`Failed to load fabric inventory data: ${response.status}`)
    }

    const data = await response.json()
    console.log(`✅ Loaded ${data.metadata?.totalItems || data.fabrics?.length || 'unknown'} fabric codes from inventory (VẢI TỒN KHO)`)
    console.log(`📦 Total stock: ${data.metadata?.totalStock || 'unknown'} units`)
    console.log(`📊 Average stock: ${data.metadata?.averageStock || 'unknown'} units per fabric`)
    console.log(`📋 Units: ${data.metadata?.units?.join(', ') || 'unknown'}`)

    return data.fabrics
  } catch (error) {
    console.warn('Could not load fabric inventory data, trying fallback:', error)
    return loadIntegratedFallback()
  }
}

/**
 * Fallback to integrated Excel data if inventory data fails
 */
async function loadIntegratedFallback(): Promise<Fabric[]> {
  try {
    const response = await fetch('/fabrics_data.json')
    if (response.ok) {
      const data = await response.json()
      console.warn('⚠️ Using integrated Excel fallback data (608 codes)')
      return data.fabrics
    }
    throw new Error('Integrated data not available')
  } catch (error) {
    console.warn('Integrated fallback failed, trying CSV:', error)
    return loadCSVFallback()
  }
}

/**
 * Fallback to CSV data if all else fails
 */
async function loadCSVFallback(): Promise<Fabric[]> {
  try {
    const response = await fetch('/fabric_inventory_updated.csv')
    const csvText = await response.text()
    console.warn('⚠️ Using CSV fallback data (old system)')
    return parseCSVData(csvText)
  } catch (error) {
    console.error('All data sources failed, using minimal fallback:', error)
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
    const statusComputed = cleanValue(values[9]) as FabricStatus | undefined

    // Determine fabric status - ưu tiên sử dụng Status_Computed nếu có
    let status: FabricStatus = 'available'

    if (statusComputed && ['available', 'low_stock', 'out_of_stock', 'damaged', 'expired'].includes(statusComputed)) {
      // Sử dụng status đã được tính toán từ Python script
      status = statusComputed
    } else {
      // Fallback: tính toán status dựa trên quantity và condition

      // Kiểm tra trạng thái dựa trên số lượng
      if (quantity === 0) {
        status = 'out_of_stock'
      } else if (quantity < 10) {
        status = 'low_stock'
      }

      // Kiểm tra trạng thái dựa trên tình trạng vải (ưu tiên cao hơn)
      if (condition) {
        const conditionLower = condition.toLowerCase()

        // Vải có lỗi, hỏng, bẩn, mốc -> damaged
        if (conditionLower.includes('lỗi') ||
            conditionLower.includes('bẩn') ||
            conditionLower.includes('mốc') ||
            conditionLower.includes('hỏng') ||
            conditionLower.includes('loang')) {
          status = 'damaged'
        }
        // Vải tồn cũ -> vẫn available nhưng có ghi chú
        else if (conditionLower.includes('tồn cũ')) {
          // Giữ nguyên status dựa trên quantity, chỉ ghi nhận là vải cũ
          status = status // Không thay đổi status
        }
      }
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

    // INVENTORY-FOCUSED IMAGE LOADING: Prioritize fabrics with high stock
    console.log('🖼️ Loading images for fabric inventory (VẢI TỒN KHO)...')
    const fabricCodes = cachedFabrics.map(f => f.code)

    // Load image mapping data
    let cloudinaryImageMap = new Map<string, string>()

    // Load real image mapping to know which fabrics actually have images
    let realImageMapping: Record<string, boolean> = {}
    try {
      const mappingResponse = await fetch('/real-image-mapping.json')
      if (mappingResponse.ok) {
        const mappingData = await mappingResponse.json()
        realImageMapping = mappingData.mapping
        console.log(`✅ Loaded real image mapping: ${mappingData.metadata.withImagesCount}/${mappingData.metadata.totalFabrics} fabrics have images`)
      }
    } catch (error) {
      console.warn('Could not load real image mapping:', error)
    }

    // Use Cloudinary ONLY for fabrics that actually have images
    if (cloudinaryService.isConfigured()) {
      console.log('☁️ Using Cloudinary for fabrics with real images...')

      // Sort fabrics by quantity (high quantity = higher priority for images)
      const sortedFabrics = [...cachedFabrics].sort((a, b) => (b.quantity || 0) - (a.quantity || 0))

      sortedFabrics.forEach(fabric => {
        // Only generate Cloudinary URLs for fabrics that actually have images
        if (realImageMapping[fabric.code] === true) {
          const url = cloudinaryService.getFabricImageUrl(fabric.code, { width: 800, quality: 80 })
          if (url) {
            cloudinaryImageMap.set(fabric.code, url)
          }
        }
      })

      console.log(`☁️ Generated ${cloudinaryImageMap.size} Cloudinary URLs for fabrics with real images`)
    } else {
      console.log(`❌ Cloudinary not configured - skipping Cloudinary images`)
    }

    // Fallback to static images for codes not in Cloudinary
    const remainingCodes = fabricCodes.filter(code => !cloudinaryImageMap.has(code))
    const staticImageMap = await batchFindFabricImages(remainingCodes)
    console.log(`🖼️ Found ${staticImageMap.size} static images`)

    // Update fabrics with found images (Cloudinary priority, then static, then integrated data)
    const updatedFabrics = cachedFabrics.map(fabric => {
      // Priority: Cloudinary → Static → Integrated data → None
      const cloudinaryUrl = cloudinaryImageMap.get(fabric.code)
      const staticUrl = staticImageMap.get(fabric.code)
      const integratedUrl = fabric.image // From integrated data

      return {
        ...fabric,
        image: cloudinaryUrl || staticUrl || integratedUrl || undefined
      }
    })

    const withImages = updatedFabrics.filter(f => f.image).length
    const cloudinaryCount = cloudinaryImageMap.size
    const staticCount = staticImageMap.size
    const coverage = ((withImages / updatedFabrics.length) * 100).toFixed(1)

    console.log(`🎉 FABRIC INVENTORY ACTIVE: ${updatedFabrics.length} fabrics in stock`)
    console.log(`📊 Image Coverage: ${withImages}/${updatedFabrics.length} (${coverage}%)`)
    console.log(`📈 Sources: Cloudinary=${cloudinaryCount}, Static=${staticCount}`)
    console.log(`📦 Total Stock: ${updatedFabrics.reduce((sum, f) => sum + (f.quantity || 0), 0)} units`)

    // Show top 5 fabrics by quantity
    const topByQuantity = updatedFabrics
      .filter(f => f.quantity && f.quantity > 0)
      .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
      .slice(0, 5)

    if (topByQuantity.length > 0) {
      console.log(`🏆 Top fabrics by quantity:`)
      topByQuantity.forEach((fabric, index) => {
        console.log(`  ${index + 1}. ${fabric.code}: ${fabric.quantity} ${fabric.unit || 'units'}`)
      })
    }

    // Debug: Show some Cloudinary URLs that were found
    if (cloudinaryImageMap.size > 0) {
      console.log(`🔍 Sample Cloudinary URLs found:`)
      let count = 0
      for (const [code, url] of cloudinaryImageMap) {
        if (count < 3) {
          console.log(`   • ${code}: ${url}`)
          count++
        }
      }
    } else {
      console.log(`❌ No Cloudinary URLs were added to cloudinaryImageMap`)
    }

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
  const types: FabricType[] = ['Roller', 'Vải bọc', 'Suntrip', 'voan', 'Silhouette', 'lót', 'chính']
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
