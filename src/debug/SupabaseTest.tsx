import React, { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { fabricUpdateService } from '@/features/inventory/services/fabricUpdateService'

export const SupabaseTest: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([])
  const [testFabricCode, setTestFabricCode] = useState('COTTON001')
  const [testImageUrl, setTestImageUrl] = useState('https://picsum.photos/400/300?random=999')
  const [fabricData, setFabricData] = useState<any>(null)

  const log = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(message)
  }

  const clearLogs = () => {
    setLogs([])
  }

  const checkSupabaseConnection = async () => {
    log('🔍 Checking Supabase connection...')
    
    try {
      log(`📊 isSupabaseConfigured: ${isSupabaseConfigured}`)
      
      if (!isSupabaseConfigured) {
        log('❌ Supabase not configured')
        log('📋 Environment variables:')
        log(`  VITE_SUPABASE_URL: ${import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Not set'}`)
        log(`  VITE_SUPABASE_ANON_KEY: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}`)
        return
      }

      log('✅ Supabase configured, testing connection...')
      
      // Test basic connection
      const { error } = await supabase
        .from('fabrics')
        .select('count')
        .limit(1)

      if (error) {
        log(`❌ Supabase connection error: ${error.message}`)
      } else {
        log('✅ Supabase connection successful')
        log(`📊 Database accessible`)
      }
    } catch (error) {
      log(`❌ Connection test failed: ${(error as Error).message}`)
    }
  }

  const testDatabaseRead = async () => {
    log('📖 Testing database read...')
    
    try {
      const { data, error } = await supabase
        .from('fabrics')
        .select('*')
        .limit(5)

      if (error) {
        log(`❌ Database read error: ${error.message}`)
        return
      }

      log(`✅ Read ${data?.length || 0} fabrics from database`)
      
      if (data && data.length > 0) {
        log('📊 Sample fabric data:')
        data.forEach((fabric, index) => {
          log(`  ${index + 1}. ${fabric.code} - ${fabric.name}`)
          if (fabric.custom_image_url) {
            log(`     Custom URL: ${fabric.custom_image_url}`)
          }
        })
      }
    } catch (error) {
      log(`❌ Database read failed: ${(error as Error).message}`)
    }
  }

  const testCustomImageUpdate = async () => {
    log('🖼️ Testing custom image URL update...')

    if (!testFabricCode || !testImageUrl) {
      log('❌ Please enter both fabric code and image URL')
      return
    }

    try {
      // First, find the fabric ID
      const { data: fabrics, error: findError } = await supabase
        .from('fabrics')
        .select('id, code, name, image, custom_image_url')
        .eq('code', testFabricCode)
        .limit(1)

      if (findError) {
        log(`❌ Error finding fabric: ${findError.message}`)
        return
      }

      if (!fabrics || fabrics.length === 0) {
        log(`❌ Fabric with code "${testFabricCode}" not found`)
        return
      }

      const fabric = fabrics[0]
      if (!fabric) {
        log(`❌ No fabric data found`)
        return
      }

      log(`✅ Found fabric: ${fabric.code} (ID: ${fabric.id})`)
      log(`📊 Current image: ${fabric.image}`)
      log(`📊 Current custom URL: ${fabric.custom_image_url || 'None'}`)

      // Update using fabricUpdateService
      log(`🔄 Updating custom image URL to: ${testImageUrl}`)
      const result = await fabricUpdateService.updateCustomImageUrl(fabric.id, testImageUrl)

      if (result.success) {
        log('✅ Custom image URL updated successfully')
        if (result.fabric) {
          log(`📊 Updated fabric data: ${JSON.stringify(result.fabric, null, 2)}`)
          setFabricData(result.fabric)
        }
      } else {
        log(`❌ Update failed: ${result.error}`)
      }
    } catch (error) {
      log(`❌ Update test failed: ${(error as Error).message}`)
    }
  }

  const testPriceUpdate = async () => {
    log('💰 Testing price update...')

    if (!testFabricCode) {
      log('❌ Please enter fabric code')
      return
    }

    try {
      // First, find the fabric ID
      const { data: fabrics, error: findError } = await supabase
        .from('fabrics')
        .select('id, code, name, price, price_note, price_updated_at')
        .eq('code', testFabricCode)
        .limit(1)

      if (findError) {
        log(`❌ Error finding fabric: ${findError.message}`)
        return
      }

      if (!fabrics || fabrics.length === 0) {
        log(`❌ Fabric with code "${testFabricCode}" not found`)
        return
      }

      const fabric = fabrics[0]
      if (!fabric) {
        log(`❌ No fabric data found`)
        return
      }

      log(`✅ Found fabric: ${fabric.code} (ID: ${fabric.id})`)
      log(`📊 Current price: ${fabric.price ? `${fabric.price.toLocaleString('vi-VN')} VND` : 'None'}`)
      log(`📊 Current note: ${fabric.price_note || 'None'}`)

      // Test price update
      const testPrice = Math.floor(Math.random() * 1000000) + 100000 // Random price 100k-1.1M
      const testNote = `Test price update at ${new Date().toLocaleTimeString()}`

      log(`🔄 Updating price to: ${testPrice.toLocaleString('vi-VN')} VND`)
      log(`🔄 Note: ${testNote}`)

      const result = await fabricUpdateService.updatePrice(fabric.id, testPrice, testNote)

      if (result.success) {
        log('✅ Price updated successfully')
        if (result.fabric) {
          log(`📊 Updated fabric data: ${JSON.stringify(result.fabric, null, 2)}`)
          setFabricData(result.fabric)
        }
      } else {
        log(`❌ Price update failed: ${result.error}`)
      }
    } catch (error) {
      log(`❌ Price update test failed: ${(error as Error).message}`)
    }
  }

  const checkFabricData = async () => {
    log('📊 Checking current fabric data...')

    try {
      const { data, error } = await supabase
        .from('fabrics')
        .select('*')
        .eq('code', testFabricCode)
        .limit(1)

      if (error) {
        log(`❌ Error fetching fabric: ${error.message}`)
        return
      }

      if (!data || data.length === 0) {
        log(`❌ Fabric "${testFabricCode}" not found`)
        return
      }

      const fabric = data[0]
      log(`✅ Current fabric data:`)
      log(`  Code: ${fabric.code}`)
      log(`  Name: ${fabric.name}`)
      log(`  Image: ${fabric.image}`)
      log(`  Custom URL: ${fabric.custom_image_url || 'None'}`)
      log(`  Custom Updated: ${fabric.custom_image_updated_at || 'Never'}`)
      log(`  Updated At: ${fabric.updated_at}`)

      setFabricData(fabric)
    } catch (error) {
      log(`❌ Check failed: ${(error as Error).message}`)
    }
  }

  const forceRefreshWebapp = () => {
    log('🔄 Force refreshing webapp...')

    // Clear React Query cache
    if (window.location.href.includes('localhost:5173')) {
      log('💾 Clearing localStorage cache...')

      // Clear fabric-related localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.includes('fabric') || key.includes('khovaiton')) {
          localStorage.removeItem(key)
          log(`  Removed: ${key}`)
        }
      })

      log('🔄 Reloading page to force fresh data...')
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } else {
      log('⚠️ Not in webapp context')
    }
  }

  useEffect(() => {
    log('🚀 Supabase Test Component loaded')
    checkSupabaseConnection()
  }, [])

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🔍 Supabase Cross-Device Sync Debug</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>🔧 Test Controls</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
          <button onClick={checkSupabaseConnection}>Check Connection</button>
          <button onClick={testDatabaseRead}>Test Read</button>
          <button onClick={testCustomImageUpdate}>Test Custom URL Update</button>
          <button onClick={testPriceUpdate}>Test Price Update</button>
          <button onClick={checkFabricData}>Check Fabric Data</button>
          <button onClick={forceRefreshWebapp}>Force Refresh Webapp</button>
          <button onClick={clearLogs}>Clear Logs</button>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            type="text"
            value={testFabricCode}
            onChange={(e) => setTestFabricCode(e.target.value)}
            placeholder="Fabric Code"
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <input
            type="url"
            value={testImageUrl}
            onChange={(e) => setTestImageUrl(e.target.value)}
            placeholder="New Image URL"
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', flex: 1 }}
          />
        </div>
      </div>

      {fabricData && (
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>📊 Current Fabric Data</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'start' }}>
            <div>
              <strong>Original Image:</strong><br />
              <img
                src={fabricData.image || 'https://via.placeholder.com/100x100?text=No+Image'}
                alt={fabricData.code}
                style={{ width: '100px', height: '100px', objectFit: 'cover', border: '1px solid #ddd' }}
              />
              <br />
              <small>{fabricData.image || 'No image'}</small>
            </div>

            {fabricData.customImageUrl && (
              <div>
                <strong>Custom Image:</strong><br />
                <img
                  src={fabricData.customImageUrl}
                  alt="Custom"
                  style={{ width: '100px', height: '100px', objectFit: 'cover', border: '1px solid #ddd' }}
                />
                <br />
                <small>{fabricData.customImageUrl}</small>
                <br />
                <small>Updated: {fabricData.customImageUpdatedAt}</small>
              </div>
            )}

            <div>
              <strong>Price Information:</strong><br />
              <div style={{ padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
                <div><strong>Price:</strong> {fabricData.price ? `${fabricData.price.toLocaleString('vi-VN')} VND` : 'No price set'}</div>
                <div><strong>Note:</strong> {fabricData.priceNote || 'No note'}</div>
                <div><strong>Updated:</strong> {fabricData.priceUpdatedAt ? new Date(fabricData.priceUpdatedAt).toLocaleString('vi-VN') : 'Never'}</div>
              </div>
            </div>

            <div>
              <strong>Visibility:</strong><br />
              <div style={{ padding: '10px', background: fabricData.isHidden ? '#fee' : '#efe', borderRadius: '4px' }}>
                <div><strong>Status:</strong> {fabricData.isHidden ? '🚫 Hidden' : '✅ Visible'}</div>
                <div><strong>Updated:</strong> {fabricData.updatedAt ? new Date(fabricData.updatedAt).toLocaleString('vi-VN') : 'Unknown'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h3>📋 Debug Logs</h3>
        <div 
          style={{ 
            background: '#000', 
            color: '#0f0', 
            padding: '10px', 
            borderRadius: '4px', 
            fontFamily: 'monospace', 
            fontSize: '12px',
            maxHeight: '400px',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap'
          }}
        >
          {logs.join('\n')}
        </div>
      </div>

      <div style={{ padding: '15px', background: '#f0f8ff', borderRadius: '8px' }}>
        <h3>📋 Instructions</h3>
        <ol>
          <li><strong>Check Connection:</strong> Verify Supabase is configured and accessible</li>
          <li><strong>Test Read:</strong> Read sample fabric data from database</li>
          <li><strong>Test Custom URL Update:</strong> Update a fabric's custom image URL</li>
          <li><strong>Check Fabric Data:</strong> Verify the update was saved correctly</li>
        </ol>
        <p><strong>Expected Result:</strong> Custom image URL should be saved to database and visible across all devices.</p>
      </div>
    </div>
  )
}

export default SupabaseTest
