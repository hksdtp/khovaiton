/**
 * Google Drive API Service for Production
 * Ninh ơi, service này sử dụng Google Drive API thật cho production
 */

export interface DriveApiFile {
  id: string
  name: string
  mimeType: string
  size: string
  webViewLink: string
  webContentLink?: string
  thumbnailLink?: string
  modifiedTime: string
}

export interface DriveApiResponse {
  files: DriveApiFile[]
  nextPageToken?: string
}

import { environment } from '@/shared/config/environment'

/**
 * Google Drive API configuration
 */
const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3'
const MAIN_FOLDER_ID = environment.googleDrive.folderId
const API_KEY = environment.googleDrive.apiKey

/**
 * Subfolder IDs for fabric images
 */
const FABRIC_SUBFOLDERS = [
  '1N0kD1XzoQ2quVLgPwywZBVkMGyebECif', // Ảnh vải - Phần 1
  '1GKq_J5Xd_93docDHgKABeg85lqyksz22'  // Ảnh vải - Phần 2
]

/**
 * Check if API is configured
 */
export function isApiConfigured(): boolean {
  return !!(MAIN_FOLDER_ID && API_KEY)
}

/**
 * Get files from Google Drive folder using API
 */
export async function getDriveApiFiles(
  folderId: string = MAIN_FOLDER_ID,
  pageToken?: string
): Promise<DriveApiResponse> {
  if (!API_KEY) {
    throw new Error('Google Drive API key not configured')
  }

  const params = new URLSearchParams({
    key: API_KEY,
    q: `'${folderId}' in parents and trashed=false`,
    fields: 'files(id,name,mimeType,size,webViewLink,webContentLink,thumbnailLink,modifiedTime),nextPageToken',
    pageSize: '100'
  })

  if (pageToken) {
    params.append('pageToken', pageToken)
  }

  const url = `${DRIVE_API_BASE}/files?${params}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error(`Drive API error: ${response.status} ${response.statusText}`, errorText)

      // Handle specific CORS/403 errors
      if (response.status === 403) {
        throw new Error(`Drive API access denied (403). Please check API key restrictions for domain: ${window.location.origin}`)
      }

      throw new Error(`Drive API error: ${response.status} ${response.statusText}`)
    }

    const data: DriveApiResponse = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching Drive files:', error)

    // Handle network/CORS errors
    if (error instanceof TypeError && error.message.includes('Load failed')) {
      throw new Error('Network error: Unable to connect to Google Drive API. Please check CORS settings.')
    }

    throw error
  }
}

/**
 * Get all files from folder (handle pagination)
 */
export async function getAllDriveFiles(folderId: string = MAIN_FOLDER_ID): Promise<DriveApiFile[]> {
  const allFiles: DriveApiFile[] = []
  let nextPageToken: string | undefined

  do {
    const response = await getDriveApiFiles(folderId, nextPageToken)
    allFiles.push(...response.files)
    nextPageToken = response.nextPageToken
  } while (nextPageToken)

  return allFiles
}

/**
 * Get all files from multiple subfolders
 */
export async function getAllFilesFromSubfolders(subfolderIds: string[] = FABRIC_SUBFOLDERS): Promise<DriveApiFile[]> {
  const allFiles: DriveApiFile[] = []

  for (const folderId of subfolderIds) {
    try {
      console.log(`📁 Scanning subfolder: ${folderId}`)
      const folderFiles = await getAllDriveFiles(folderId)
      allFiles.push(...folderFiles)
      console.log(`✅ Found ${folderFiles.length} files in subfolder ${folderId}`)
    } catch (error) {
      console.error(`❌ Failed to scan subfolder ${folderId}:`, error)
    }
  }

  console.log(`📊 Total files from all subfolders: ${allFiles.length}`)
  return allFiles
}

/**
 * Filter image files
 */
export function filterImageFiles(files: DriveApiFile[]): DriveApiFile[] {
  const imageTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png', 
    'image/webp',
    'image/gif'
  ]

  return files.filter(file => 
    imageTypes.includes(file.mimeType) || 
    /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name)
  )
}

/**
 * Get direct download URL for file
 */
export function getDirectDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`
}

/**
 * Download file as blob
 */
export async function downloadFileBlob(file: DriveApiFile): Promise<Blob> {
  const downloadUrl = file.webContentLink || getDirectDownloadUrl(file.id)

  try {
    const response = await fetch(downloadUrl, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'image/*'
      }
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error(`Download error for ${file.name}: ${response.status} ${response.statusText}`, errorText)

      // Handle specific CORS/403 errors
      if (response.status === 403) {
        throw new Error(`Access denied for ${file.name}. Check API key restrictions for domain: ${window.location.origin}`)
      }

      throw new Error(`Failed to download ${file.name}: ${response.status} ${response.statusText}`)
    }

    return response.blob()
  } catch (error) {
    console.error(`Error downloading ${file.name}:`, error)

    // Handle network/CORS errors
    if (error instanceof TypeError && error.message.includes('Load failed')) {
      throw new Error(`Network error downloading ${file.name}: Unable to connect to Google Drive. Please check CORS settings.`)
    }

    throw error
  }
}

/**
 * Get file metadata
 */
export async function getFileMetadata(fileId: string): Promise<DriveApiFile> {
  if (!API_KEY) {
    throw new Error('Google Drive API key not configured')
  }

  const params = new URLSearchParams({
    key: API_KEY,
    fields: 'id,name,mimeType,size,webViewLink,webContentLink,thumbnailLink,modifiedTime'
  })

  const url = `${DRIVE_API_BASE}/files/${fileId}?${params}`

  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Failed to get file metadata: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Check if folder is accessible
 */
export async function checkFolderAccess(folderId: string = MAIN_FOLDER_ID): Promise<boolean> {
  try {
    await getDriveApiFiles(folderId)
    return true
  } catch (error) {
    console.error('Folder access check failed:', error)
    return false
  }
}

/**
 * Check if all subfolders are accessible
 */
export async function checkSubfoldersAccess(): Promise<{
  accessible: boolean
  results: { folderId: string; accessible: boolean; error?: string }[]
}> {
  const results: { folderId: string; accessible: boolean; error?: string }[] = []

  for (const folderId of FABRIC_SUBFOLDERS) {
    try {
      const accessible = await checkFolderAccess(folderId)
      results.push({ folderId, accessible })
    } catch (error) {
      results.push({
        folderId,
        accessible: false,
        error: String(error)
      })
    }
  }

  const allAccessible = results.every(r => r.accessible)

  return {
    accessible: allAccessible,
    results
  }
}

/**
 * Get folder info
 */
export async function getFolderInfo(folderId: string = MAIN_FOLDER_ID): Promise<{
  name: string
  fileCount: number
  imageCount: number
  totalSize: number
}> {
  if (!API_KEY) {
    throw new Error('Google Drive API key not configured')
  }

  // Get folder metadata
  const folderParams = new URLSearchParams({
    key: API_KEY,
    fields: 'name'
  })

  const folderResponse = await fetch(`${DRIVE_API_BASE}/files/${folderId}?${folderParams}`)
  const folderData = await folderResponse.json()

  // Get all files from subfolders
  const allFiles = await getAllFilesFromSubfolders()
  const imageFiles = filterImageFiles(allFiles)

  const totalSize = allFiles.reduce((sum, file) => sum + parseInt(file.size || '0'), 0)

  return {
    name: folderData.name || 'Fabric Images',
    fileCount: allFiles.length,
    imageCount: imageFiles.length,
    totalSize
  }
}

/**
 * Get detailed info for all subfolders
 */
export async function getSubfoldersInfo(): Promise<{
  mainFolder: string
  subfolders: Array<{
    id: string
    name: string
    fileCount: number
    imageCount: number
    totalSize: number
  }>
  totalFiles: number
  totalImages: number
  totalSize: number
}> {
  const subfolders = []
  let totalFiles = 0
  let totalImages = 0
  let totalSize = 0

  for (const folderId of FABRIC_SUBFOLDERS) {
    try {
      const info = await getFolderInfo(folderId)
      subfolders.push({
        id: folderId,
        ...info
      })
      totalFiles += info.fileCount
      totalImages += info.imageCount
      totalSize += info.totalSize
    } catch (error) {
      console.error(`Failed to get info for subfolder ${folderId}:`, error)
      subfolders.push({
        id: folderId,
        name: 'Error loading',
        fileCount: 0,
        imageCount: 0,
        totalSize: 0
      })
    }
  }

  return {
    mainFolder: MAIN_FOLDER_ID,
    subfolders,
    totalFiles,
    totalImages,
    totalSize
  }
}

/**
 * Search files by name pattern
 */
export async function searchFiles(
  pattern: string,
  folderId: string = MAIN_FOLDER_ID
): Promise<DriveApiFile[]> {
  if (!API_KEY) {
    throw new Error('Google Drive API key not configured')
  }

  const params = new URLSearchParams({
    key: API_KEY,
    q: `'${folderId}' in parents and name contains '${pattern}' and trashed=false`,
    fields: 'files(id,name,mimeType,size,webViewLink,webContentLink,thumbnailLink,modifiedTime)',
    pageSize: '100'
  })

  const url = `${DRIVE_API_BASE}/files?${params}`

  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data.files || []
}

/**
 * Get usage statistics
 */
export async function getUsageStats(): Promise<{
  storageQuota: number
  storageUsed: number
  storageUsedInDrive: number
}> {
  if (!API_KEY) {
    throw new Error('Google Drive API key not configured')
  }

  const params = new URLSearchParams({
    key: API_KEY,
    fields: 'storageQuota,user'
  })

  const url = `${DRIVE_API_BASE}/about?${params}`

  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Failed to get usage stats: ${response.statusText}`)
  }

  const data = await response.json()
  
  return {
    storageQuota: parseInt(data.storageQuota?.limit || '0'),
    storageUsed: parseInt(data.storageQuota?.usage || '0'),
    storageUsedInDrive: parseInt(data.storageQuota?.usageInDrive || '0')
  }
}
