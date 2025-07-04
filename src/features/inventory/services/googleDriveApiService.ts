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
const FOLDER_ID = environment.googleDrive.folderId
const API_KEY = environment.googleDrive.apiKey

/**
 * Check if API is configured
 */
export function isApiConfigured(): boolean {
  return !!(FOLDER_ID && API_KEY)
}

/**
 * Get files from Google Drive folder using API
 */
export async function getDriveApiFiles(
  folderId: string = FOLDER_ID,
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
      throw new Error(`Drive API error: ${response.status} ${response.statusText}`)
    }

    const data: DriveApiResponse = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching Drive files:', error)
    throw error
  }
}

/**
 * Get all files from folder (handle pagination)
 */
export async function getAllDriveFiles(folderId: string = FOLDER_ID): Promise<DriveApiFile[]> {
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
  
  const response = await fetch(downloadUrl)
  
  if (!response.ok) {
    throw new Error(`Failed to download ${file.name}: ${response.statusText}`)
  }

  return response.blob()
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
export async function checkFolderAccess(folderId: string = FOLDER_ID): Promise<boolean> {
  try {
    await getDriveApiFiles(folderId)
    return true
  } catch (error) {
    console.error('Folder access check failed:', error)
    return false
  }
}

/**
 * Get folder info
 */
export async function getFolderInfo(folderId: string = FOLDER_ID): Promise<{
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

  // Get all files
  const allFiles = await getAllDriveFiles(folderId)
  const imageFiles = filterImageFiles(allFiles)
  
  const totalSize = allFiles.reduce((sum, file) => sum + parseInt(file.size || '0'), 0)

  return {
    name: folderData.name || 'Unknown Folder',
    fileCount: allFiles.length,
    imageCount: imageFiles.length,
    totalSize
  }
}

/**
 * Search files by name pattern
 */
export async function searchFiles(
  pattern: string,
  folderId: string = FOLDER_ID
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
