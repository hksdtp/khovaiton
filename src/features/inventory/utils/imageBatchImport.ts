/**
 * Image Batch Import Utility
 * Ninh ơi, tool này giúp import hàng loạt ảnh từ thư viện của bạn
 */

import { getImageMappingReport } from '../services/imageService'

export interface ImportResult {
  success: boolean
  message: string
  processedCount: number
  successCount: number
  errorCount: number
  errors: string[]
}

export interface ImageFile {
  name: string
  path: string
  size: number
  type: string
}

/**
 * Extract fabric code from image filename
 * Trích xuất mã vải từ tên file ảnh
 */
function extractFabricCodeFromFilename(filename: string): string {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')
  
  // Clean up the name (remove common prefixes/suffixes)
  return nameWithoutExt
    .replace(/^(vai|fabric)[-_\s]*/i, '') // Remove "vai" or "fabric" prefix
    .replace(/[-_\s]*(image|img|photo)$/i, '') // Remove image suffixes
    .trim()
}

/**
 * Validate image file
 */
function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File không phải là ảnh' }
  }
  
  // Check file size (max 10MB)
  const MAX_SIZE = 10 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File quá lớn (tối đa 10MB)' }
  }
  
  // Check supported formats
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!supportedTypes.includes(file.type)) {
    return { valid: false, error: 'Format không được hỗ trợ' }
  }
  
  return { valid: true }
}

/**
 * Process single image file
 */
async function processImageFile(
  file: File,
  fabricCodes: string[]
): Promise<{ success: boolean; fabricCode?: string; error?: string }> {
  // Validate file
  const validation = validateImageFile(file)
  if (!validation.valid) {
    return { success: false, error: validation.error || 'Validation failed' }
  }
  
  // Extract fabric code from filename
  const extractedCode = extractFabricCodeFromFilename(file.name)
  
  // Find matching fabric code
  const matchingCode = fabricCodes.find(code => 
    code.toLowerCase().includes(extractedCode.toLowerCase()) ||
    extractedCode.toLowerCase().includes(code.toLowerCase())
  )
  
  if (!matchingCode) {
    return { 
      success: false, 
      error: `Không tìm thấy mã vải phù hợp cho file: ${file.name}` 
    }
  }
  
  return { success: true, fabricCode: matchingCode }
}

/**
 * Batch import images from file list
 * Import hàng loạt ảnh từ danh sách file
 */
export async function batchImportImages(
  files: FileList | File[],
  fabricCodes: string[]
): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    message: '',
    processedCount: 0,
    successCount: 0,
    errorCount: 0,
    errors: []
  }
  
  const fileArray = Array.from(files)
  result.processedCount = fileArray.length
  
  if (fileArray.length === 0) {
    result.message = 'Không có file nào được chọn'
    return result
  }
  
  // Process each file
  for (const file of fileArray) {
    try {
      const processResult = await processImageFile(file, fabricCodes)
      
      if (processResult.success && processResult.fabricCode) {
        result.successCount++
        console.log(`✅ Mapped: ${file.name} → ${processResult.fabricCode}`)
      } else {
        result.errorCount++
        result.errors.push(processResult.error || 'Unknown error')
      }
    } catch (error) {
      result.errorCount++
      result.errors.push(`Error processing ${file.name}: ${error}`)
    }
  }
  
  // Generate summary message
  if (result.successCount > 0) {
    result.success = true
    result.message = `Thành công: ${result.successCount}/${result.processedCount} ảnh được import`
  } else {
    result.message = 'Không có ảnh nào được import thành công'
  }
  
  return result
}

/**
 * Generate import instructions for user
 * Hướng dẫn cho Ninh cách chuẩn bị ảnh
 */
export function generateImportInstructions(): string {
  return `
📋 HƯỚNG DẪN IMPORT ẢNH HÀNG LOẠT

1. 📁 Chuẩn bị thư mục ảnh:
   - Đặt tất cả ảnh vào folder: public/images/fabrics/
   
2. 📝 Quy tắc đặt tên file:
   - Tên file = Mã vải + extension
   - Ví dụ: "3 PASS BO - WHITE - COL 15.jpg"
   - Hỗ trợ: .jpg, .jpeg, .png, .webp
   
3. ✅ Lưu ý:
   - Tên file phải chính xác với mã vải trong CSV
   - Kích thước tối đa: 10MB/ảnh
   - Tránh ký tự đặc biệt: < > : " / \\ | ? *
   
4. 🚀 Sau khi copy ảnh:
   - Refresh trang web
   - Ảnh sẽ tự động hiển thị
   
💡 Tip: Dùng batch rename tool để đổi tên hàng loạt nếu cần!
  `.trim()
}

/**
 * Check import readiness
 * Kiểm tra sẵn sàng import
 */
export async function checkImportReadiness(fabricCodes: string[]): Promise<{
  ready: boolean
  report: Awaited<ReturnType<typeof getImageMappingReport>>
}> {
  const report = await getImageMappingReport(fabricCodes)
  
  return {
    ready: report.withImages > 0,
    report
  }
}
