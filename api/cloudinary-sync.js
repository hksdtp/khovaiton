/**
 * Vercel Serverless Function để đồng bộ với Cloudinary
 * Ninh ơi, API này cho phép đồng bộ 2 chiều với Cloudinary
 */

import crypto from 'crypto'

// Cloudinary config từ environment variables
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dgaktc3fb'
const API_KEY = process.env.CLOUDINARY_API_KEY || '917768158798778'
const API_SECRET = process.env.CLOUDINARY_API_SECRET || 'ZkCVC7alaaSgcnW5kVXYQbxL5uU'

/**
 * Generate Cloudinary API signature
 */
function generateSignature(params, apiSecret) {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&')
  
  return crypto
    .createHash('sha1')
    .update(sortedParams + apiSecret)
    .digest('hex')
}

/**
 * Call Cloudinary Admin API
 */
async function callCloudinaryAPI(endpoint, params = {}) {
  const timestamp = Math.round(Date.now() / 1000)
  const signatureParams = { ...params, timestamp, api_key: API_KEY }
  const signature = generateSignature(signatureParams, API_SECRET)
  
  const body = new URLSearchParams({
    ...signatureParams,
    signature
  })
  
  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString()
  })
  
  if (!response.ok) {
    throw new Error(`Cloudinary API error: ${response.status} ${response.statusText}`)
  }
  
  return await response.json()
}

/**
 * List all images from Cloudinary
 */
async function listAllImages(maxResults = 500) {
  try {
    const result = await callCloudinaryAPI('resources/image/upload', {
      type: 'upload',
      max_results: maxResults
    })
    
    return {
      success: true,
      total: result.resources?.length || 0,
      images: result.resources || []
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Search images by tags or context
 */
async function searchImages(query) {
  try {
    const result = await callCloudinaryAPI('resources/search', {
      expression: query,
      max_results: 100
    })
    
    return {
      success: true,
      total: result.total_count || 0,
      images: result.resources || []
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Get specific image details
 */
async function getImageDetails(publicIds) {
  try {
    const result = await callCloudinaryAPI('resources/image/upload', {
      public_ids: Array.isArray(publicIds) ? publicIds.join(',') : publicIds
    })
    
    return {
      success: true,
      images: result.resources || []
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Main handler function
 */
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  try {
    const { action, ...params } = req.method === 'GET' ? req.query : req.body
    
    switch (action) {
      case 'list':
        const listResult = await listAllImages(params.maxResults)
        return res.status(200).json(listResult)
        
      case 'search':
        if (!params.query) {
          return res.status(400).json({ success: false, error: 'Query parameter required' })
        }
        const searchResult = await searchImages(params.query)
        return res.status(200).json(searchResult)
        
      case 'details':
        if (!params.publicIds) {
          return res.status(400).json({ success: false, error: 'publicIds parameter required' })
        }
        const detailsResult = await getImageDetails(params.publicIds)
        return res.status(200).json(detailsResult)
        
      case 'sync':
        // Get all images and try to match with fabric codes
        const allImages = await listAllImages(1000)
        if (!allImages.success) {
          return res.status(500).json(allImages)
        }
        
        // Try to extract fabric codes from context, tags, or filename
        const mappings = []
        allImages.images.forEach(image => {
          let fabricCode = null
          
          // Check context for fabric code
          if (image.context && image.context.fabricCode) {
            fabricCode = image.context.fabricCode
          }
          // Check tags for fabric code pattern
          else if (image.tags) {
            const fabricTag = image.tags.find(tag => tag.includes('fabric_'))
            if (fabricTag) {
              fabricCode = fabricTag.replace('fabric_', '')
            }
          }
          // Try to extract from public_id if it looks like a fabric code
          else if (image.public_id && !image.public_id.includes('/')) {
            // Simple heuristic: if public_id looks like fabric code pattern
            if (/^[A-Z0-9\-\s]+$/i.test(image.public_id)) {
              fabricCode = image.public_id
            }
          }
          
          if (fabricCode) {
            mappings.push({
              fabricCode,
              publicId: image.public_id,
              url: image.secure_url,
              createdAt: image.created_at,
              size: `${image.width}x${image.height}`,
              bytes: image.bytes
            })
          }
        })
        
        return res.status(200).json({
          success: true,
          total: allImages.total,
          mapped: mappings.length,
          unmapped: allImages.total - mappings.length,
          mappings
        })
        
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action. Use: list, search, details, or sync'
        })
    }
    
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
