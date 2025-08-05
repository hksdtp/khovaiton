/**
 * Vercel Serverless Function để lưu/đọc fabric mappings
 * Ninh ơi, API này đồng bộ mappings giữa các thiết bị
 */

// Sử dụng Vercel KV hoặc file system tạm thời
// Trong production nên dùng database thật

let fabricMappings = new Map()

/**
 * Load mappings from storage (tạm thời dùng memory)
 * Trong production sẽ dùng database
 */
function loadMappings() {
  // TODO: Load from database
  // For now, use in-memory storage
  return Object.fromEntries(fabricMappings)
}

/**
 * Save mappings to storage
 */
function saveMappings(mappings) {
  // TODO: Save to database
  // For now, use in-memory storage
  Object.entries(mappings).forEach(([fabricCode, publicId]) => {
    fabricMappings.set(fabricCode, publicId)
  })
  return true
}

/**
 * Get all fabric mappings
 */
function getAllMappings() {
  return {
    success: true,
    mappings: loadMappings(),
    count: fabricMappings.size,
    timestamp: Date.now()
  }
}

/**
 * Update fabric mappings
 */
function updateMappings(newMappings) {
  try {
    let updatedCount = 0
    
    Object.entries(newMappings).forEach(([fabricCode, publicId]) => {
      if (!fabricMappings.has(fabricCode) || fabricMappings.get(fabricCode) !== publicId) {
        fabricMappings.set(fabricCode, publicId)
        updatedCount++
      }
    })
    
    return {
      success: true,
      updatedCount,
      totalCount: fabricMappings.size,
      timestamp: Date.now()
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Add single fabric mapping
 */
function addMapping(fabricCode, publicId) {
  try {
    const isNew = !fabricMappings.has(fabricCode)
    fabricMappings.set(fabricCode, publicId)
    
    return {
      success: true,
      isNew,
      fabricCode,
      publicId,
      totalCount: fabricMappings.size,
      timestamp: Date.now()
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
async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  try {
    const { method } = req
    const { action, ...params } = method === 'GET' ? req.query : req.body
    
    switch (method) {
      case 'GET':
        // Get all mappings
        const allMappings = getAllMappings()
        return res.status(200).json(allMappings)
        
      case 'POST':
        switch (action) {
          case 'update':
            // Update multiple mappings
            if (!params.mappings) {
              return res.status(400).json({ 
                success: false, 
                error: 'mappings parameter required' 
              })
            }
            const updateResult = updateMappings(params.mappings)
            return res.status(200).json(updateResult)
            
          case 'add':
            // Add single mapping
            if (!params.fabricCode || !params.publicId) {
              return res.status(400).json({ 
                success: false, 
                error: 'fabricCode and publicId parameters required' 
              })
            }
            const addResult = addMapping(params.fabricCode, params.publicId)
            return res.status(200).json(addResult)
            
          default:
            return res.status(400).json({
              success: false,
              error: 'Invalid action. Use: update or add'
            })
        }
        
      case 'PUT':
        // Replace all mappings
        if (!req.body.mappings) {
          return res.status(400).json({ 
            success: false, 
            error: 'mappings parameter required' 
          })
        }
        
        // Clear existing and set new
        fabricMappings.clear()
        const replaceResult = updateMappings(req.body.mappings)
        return res.status(200).json(replaceResult)
        
      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed'
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

// Initialize with known mappings
fabricMappings.set('3 PASS BO - WHITE - COL 15', 'fabric_images/3 PASS BO - WHITE - COL 15')
fabricMappings.set('33139-2-270', 'n4t1aa79vfgvkmwdlmml') // Latest upload

// Export as default for Vercel
module.exports = handler
