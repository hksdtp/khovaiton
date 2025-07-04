/**
 * Google Drive Service
 * Ninh ơi, service này giúp sync ảnh từ Google Drive về local
 */

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  size: string
  downloadUrl?: string
  webViewLink: string
}

export interface SyncResult {
  success: boolean
  message: string
  downloadedCount: number
  errorCount: number
  errors: string[]
  files: DriveFile[]
}

/**
 * Google Drive folder ID từ URL
 * URL: https://drive.google.com/drive/folders/1YiRnl2CfccL6rH98S8UlWexgckV_dnbU
 */
const DRIVE_FOLDER_ID = '1YiRnl2CfccL6rH98S8UlWexgckV_dnbU'

/**
 * Google Drive API endpoints
 */
// const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3'

/**
 * Extract folder ID from Google Drive URL
 */
export function extractFolderIdFromUrl(url: string): string | null {
  const match = url.match(/\/folders\/([a-zA-Z0-9-_]+)/)
  return match ? match[1] || null : null
}

/**
 * Generate direct download URL for Google Drive file
 */
export function generateDirectDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`
}

/**
 * Check if file is an image
 */
function isImageFile(file: DriveFile): boolean {
  const imageTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ]
  
  return imageTypes.includes(file.mimeType) || 
         /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name)
}

/**
 * Get files from Google Drive folder (public access)
 * Sử dụng public API, không cần authentication
 */
export async function getDriveFiles(_folderId: string = DRIVE_FOLDER_ID): Promise<DriveFile[]> {
  try {
    // Note: Cần API key để sử dụng. Tạm thời return mock data
    console.warn('Google Drive API cần API key. Sử dụng mock data.')

    return getMockDriveFiles()
  } catch (error) {
    console.error('Error fetching Drive files:', error)
    throw new Error('Không thể truy cập Google Drive folder')
  }
}

/**
 * Mock data cho testing (sẽ thay bằng real API)
 */
function getMockDriveFiles(): DriveFile[] {
  return [
    {
      id: 'mock1',
      name: '3 PASS BO - WHITE - COL 15.jpg',
      mimeType: 'image/jpeg',
      size: '1024000',
      webViewLink: 'https://drive.google.com/file/d/mock1/view'
    },
    {
      id: 'mock2', 
      name: '33139-2-270.png',
      mimeType: 'image/png',
      size: '2048000',
      webViewLink: 'https://drive.google.com/file/d/mock2/view'
    },
    {
      id: 'mock3',
      name: '71022-10.jpg',
      mimeType: 'image/jpeg', 
      size: '1536000',
      webViewLink: 'https://drive.google.com/file/d/mock3/view'
    }
  ]
}

/**
 * Download single file from Google Drive
 */
export async function downloadDriveFile(file: DriveFile): Promise<Blob> {
  const downloadUrl = generateDirectDownloadUrl(file.id)
  
  const response = await fetch(downloadUrl, {
    method: 'GET',
    headers: {
      'Accept': 'image/*'
    }
  })
  
  if (!response.ok) {
    throw new Error(`Failed to download ${file.name}: ${response.statusText}`)
  }
  
  return response.blob()
}

/**
 * Sync images from Google Drive to local storage
 */
export async function syncImagesFromDrive(
  folderId: string = DRIVE_FOLDER_ID,
  onProgress?: (current: number, total: number, fileName: string) => void
): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    message: '',
    downloadedCount: 0,
    errorCount: 0,
    errors: [],
    files: []
  }
  
  try {
    // Get all files from Drive folder
    const allFiles = await getDriveFiles(folderId)
    const imageFiles = allFiles.filter(isImageFile)
    
    result.files = imageFiles
    
    if (imageFiles.length === 0) {
      result.message = 'Không tìm thấy ảnh nào trong folder'
      return result
    }
    
    // Download each image
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]

      if (!file) continue

      try {
        onProgress?.(i + 1, imageFiles.length, file.name)

        // Download file
        const blob = await downloadDriveFile(file)

        // Save to local storage (browser)
        await saveImageToLocal(file.name, blob)

        result.downloadedCount++
        console.log(`✅ Downloaded: ${file.name}`)

      } catch (error) {
        result.errorCount++
        const errorMsg = `Failed to download ${file.name}: ${error}`
        result.errors.push(errorMsg)
        console.error(errorMsg)
      }
    }
    
    // Generate result message
    if (result.downloadedCount > 0) {
      result.success = true
      result.message = `Thành công: ${result.downloadedCount}/${imageFiles.length} ảnh được sync`
    } else {
      result.message = 'Không có ảnh nào được download thành công'
    }
    
    return result
    
  } catch (error) {
    result.message = `Lỗi sync: ${error}`
    result.errors.push(String(error))
    return result
  }
}

/**
 * Save image blob to local storage
 * Note: Browser không thể write trực tiếp vào file system
 * Cần server-side solution hoặc user manual download
 */
async function saveImageToLocal(fileName: string, blob: Blob): Promise<void> {
  // Tạo download link cho user
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.style.display = 'none'
  
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  
  URL.revokeObjectURL(url)
}

/**
 * Get sync status
 */
export async function getSyncStatus(): Promise<{
  lastSync: Date | null
  totalFiles: number
  syncedFiles: number
}> {
  // Mock implementation
  return {
    lastSync: new Date(),
    totalFiles: 150,
    syncedFiles: 45
  }
}
