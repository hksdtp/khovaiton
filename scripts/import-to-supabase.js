#!/usr/bin/env node

/**
 * Import fabric data from JSON to Supabase
 * Chạy script này để import dữ liệu vào Supabase database
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Supabase config
const SUPABASE_URL = 'https://zgrfqkytbmahxcbgpkxx.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncmZxa3l0Ym1haHhjYmdwa3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNjI1MTAsImV4cCI6MjA2MTczODUxMH0.a6giZZFMrj6jBhLip3ShOFCyTHt5dbe31UDGCECh0Zs'

async function importFabricsToSupabase() {
  try {
    console.log('🚀 Starting fabric import to Supabase...')
    
    // Load fabric data
    const dataPath = path.join(path.dirname(__dirname), 'public/fabrics_data.json')
    if (!fs.existsSync(dataPath)) {
      console.error('❌ File not found:', dataPath)
      return
    }
    
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
    const allFabrics = data.fabrics

    console.log(`📊 Found ${allFabrics.length} fabrics in file`)

    // Remove duplicates by code
    const uniqueFabrics = []
    const seenCodes = new Set()

    for (const fabric of allFabrics) {
      if (!seenCodes.has(fabric.code)) {
        seenCodes.add(fabric.code)
        uniqueFabrics.push(fabric)
      } else {
        console.log(`⚠️  Skipping duplicate code: ${fabric.code}`)
      }
    }

    const fabrics = uniqueFabrics
    console.log(`📊 After removing duplicates: ${fabrics.length} fabrics to import`)
    
    // Check current data in Supabase
    console.log('🔍 Checking current data in Supabase...')
    const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/fabrics?select=count`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'count=exact'
      }
    })
    
    const currentCount = parseInt(checkResponse.headers.get('content-range')?.split('/')[1] || '0')
    console.log(`📋 Current fabrics in database: ${currentCount}`)
    
    if (currentCount > 10) {
      console.log('⚠️  Database already has data. Clearing first...')
      
      // Clear existing data
      const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/fabrics`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=minimal'
        }
      })
      
      if (deleteResponse.ok) {
        console.log('✅ Cleared existing data')
      } else {
        console.error('❌ Failed to clear data:', await deleteResponse.text())
        return
      }
    }
    
    // Prepare data for Supabase (only columns that exist in the table)
    const supabaseFabrics = fabrics.map(fabric => {
      // Generate image URL from images array
      let imageUrl = null
      if (fabric.images && fabric.images.length > 0) {
        const mainImage = fabric.images.find(img => img.type === 'main') || fabric.images[0]
        if (mainImage) {
          // Create Cloudinary URL
          imageUrl = `https://res.cloudinary.com/dgaktc3fb/image/upload/fabrics/${encodeURIComponent(mainImage.file)}`
        }
      }

      return {
        code: (fabric.code || '').substring(0, 50), // Limit to 50 chars
        name: fabric.name,
        type: (fabric.type || '').substring(0, 50), // Limit to 50 chars
        quantity: fabric.quantity || 0,
        unit: (fabric.unit || 'pieces').substring(0, 20), // Limit to 20 chars
        location: fabric.location || 'Unknown',
        status: (fabric.status || 'available').substring(0, 20), // Limit to 20 chars
        image: imageUrl,
        is_hidden: fabric.isHidden || false,
        price: fabric.price || null,
        price_note: fabric.priceNote || null,
        price_updated_at: fabric.priceUpdatedAt || null,
        custom_image_url: fabric.customImageUrl || null,
        custom_image_updated_at: fabric.customImageUpdatedAt || null,
        created_at: fabric.createdAt || new Date().toISOString(),
        updated_at: fabric.updatedAt || new Date().toISOString()
      }
    })
    
    // Import in batches (Supabase has limits)
    const batchSize = 100
    let imported = 0
    
    for (let i = 0; i < supabaseFabrics.length; i += batchSize) {
      const batch = supabaseFabrics.slice(i, i + batchSize)
      
      console.log(`📤 Importing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(supabaseFabrics.length/batchSize)} (${batch.length} items)...`)
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/fabrics`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(batch)
      })
      
      if (response.ok) {
        imported += batch.length
        console.log(`✅ Batch imported successfully (${imported}/${supabaseFabrics.length})`)
      } else {
        const error = await response.text()
        console.error(`❌ Failed to import batch:`, error)
        break
      }
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    console.log(`\n🎉 Import completed!`)
    console.log(`📊 Total imported: ${imported}/${supabaseFabrics.length} fabrics`)
    
    // Verify import
    console.log('\n🔍 Verifying import...')
    const verifyResponse = await fetch(`${SUPABASE_URL}/rest/v1/fabrics?select=count`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'count=exact'
      }
    })
    
    const finalCount = parseInt(verifyResponse.headers.get('content-range')?.split('/')[1] || '0')
    console.log(`✅ Final count in database: ${finalCount}`)
    
    if (finalCount === imported) {
      console.log('🎯 Import verification successful!')
    } else {
      console.log('⚠️  Count mismatch - please check manually')
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error)
  }
}

// Run import
importFabricsToSupabase()
