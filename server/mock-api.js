/**
 * Mock API Server for Kho Vải Tồn
 * Provides backend API endpoints for development
 */

const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json())

// Mock data storage
let fabricMappings = {}
let cloudinaryImages = []

// Load existing fabric data
function loadFabricData() {
  try {
    const fabricDataPath = path.join(__dirname, '../public/anhhung-fabrics.json')
    if (fs.existsSync(fabricDataPath)) {
      const data = JSON.parse(fs.readFileSync(fabricDataPath, 'utf8'))
      console.log(`📦 Loaded ${data.fabrics?.length || 0} fabric codes`)
      return data.fabrics || []
    }
  } catch (error) {
    console.warn('⚠️ Could not load fabric data:', error.message)
  }
  return []
}

// Mock Cloudinary images (simulate some existing images)
function generateMockCloudinaryImages() {
  const fabrics = loadFabricData()
  const mockImages = []
  
  // Simulate that 35% of fabrics have images (matching current stats)
  const imageCount = Math.floor(fabrics.length * 0.35)
  
  for (let i = 0; i < imageCount; i++) {
    const fabric = fabrics[i]
    if (fabric) {
      mockImages.push({
        public_id: `fabrics/${fabric.code}`,
        secure_url: `https://res.cloudinary.com/dgaktc3fb/image/upload/fabrics/${fabric.code}.jpg`,
        width: 800,
        height: 600,
        format: 'jpg',
        created_at: new Date().toISOString(),
        fabricCode: fabric.code
      })
    }
  }
  
  console.log(`🖼️ Generated ${mockImages.length} mock Cloudinary images`)
  return mockImages
}

// Initialize mock data
cloudinaryImages = generateMockCloudinaryImages()

// API Routes

/**
 * GET /api/cloudinary-sync?action=list
 * List all images from Cloudinary
 */
app.get('/api/cloudinary-sync', (req, res) => {
  const { action, maxResults = 500 } = req.query
  
  console.log(`📡 API Call: GET /api/cloudinary-sync?action=${action}`)
  
  if (action === 'list') {
    const images = cloudinaryImages.slice(0, parseInt(maxResults))
    
    res.json({
      success: true,
      total: images.length,
      images: images,
      message: `Listed ${images.length} images from Cloudinary`
    })
  } else {
    res.json({
      success: false,
      error: 'Invalid action. Use action=list'
    })
  }
})

/**
 * POST /api/cloudinary-sync
 * Sync images from Cloudinary
 */
app.post('/api/cloudinary-sync', (req, res) => {
  const { action, query } = req.body
  
  console.log(`📡 API Call: POST /api/cloudinary-sync`, { action, query })
  
  if (action === 'sync') {
    // Simulate sync process
    const fabrics = loadFabricData()
    const mappings = []
    
    // Map existing mock images to fabric codes
    cloudinaryImages.forEach(img => {
      if (img.fabricCode) {
        mappings.push({
          fabricCode: img.fabricCode,
          publicId: img.public_id,
          url: img.secure_url
        })
      }
    })
    
    res.json({
      success: true,
      total: cloudinaryImages.length,
      mapped: mappings.length,
      unmapped: cloudinaryImages.length - mappings.length,
      mappings: mappings,
      message: `Synced ${mappings.length} fabric images`
    })
    
  } else if (action === 'search') {
    // Search images by query
    const filteredImages = cloudinaryImages.filter(img => 
      img.public_id.toLowerCase().includes(query.toLowerCase()) ||
      img.fabricCode?.toLowerCase().includes(query.toLowerCase())
    )
    
    res.json({
      success: true,
      total: filteredImages.length,
      images: filteredImages,
      message: `Found ${filteredImages.length} images matching "${query}"`
    })
    
  } else {
    res.json({
      success: false,
      error: 'Invalid action. Use action=sync or action=search'
    })
  }
})

/**
 * POST /api/fabric-mappings
 * Save fabric image mappings
 */
app.post('/api/fabric-mappings', (req, res) => {
  const { mappings } = req.body
  
  console.log(`📡 API Call: POST /api/fabric-mappings`, { count: mappings?.length || 0 })
  
  if (mappings && Array.isArray(mappings)) {
    // Save mappings to memory (in real app, this would be database)
    mappings.forEach(mapping => {
      fabricMappings[mapping.fabricCode] = mapping
    })
    
    res.json({
      success: true,
      count: mappings.length,
      message: `Saved ${mappings.length} fabric mappings`
    })
  } else {
    res.json({
      success: false,
      error: 'Invalid mappings data'
    })
  }
})

/**
 * GET /api/fabric-mappings
 * Get fabric image mappings
 */
app.get('/api/fabric-mappings', (req, res) => {
  console.log(`📡 API Call: GET /api/fabric-mappings`)
  
  res.json({
    success: true,
    mappings: fabricMappings,
    count: Object.keys(fabricMappings).length,
    message: `Retrieved ${Object.keys(fabricMappings).length} fabric mappings`
  })
})

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Mock API server is running'
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock API Server started on http://localhost:${PORT}`)
  console.log(`📊 Available endpoints:`)
  console.log(`   GET  /api/health`)
  console.log(`   GET  /api/cloudinary-sync?action=list`)
  console.log(`   POST /api/cloudinary-sync`)
  console.log(`   GET  /api/fabric-mappings`)
  console.log(`   POST /api/fabric-mappings`)
  console.log(``)
  console.log(`🖼️ Mock data:`)
  console.log(`   ${cloudinaryImages.length} Cloudinary images`)
  console.log(`   ${Object.keys(fabricMappings).length} fabric mappings`)
  console.log(``)
  console.log(`💡 Frontend can now connect to: http://localhost:${PORT}`)
})

module.exports = app
