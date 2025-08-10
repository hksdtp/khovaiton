// Console test for Supabase connection
// Run this in browser console to test Supabase

import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export const runSupabaseTest = async () => {
  console.log('🔍 Starting Supabase connection test...')
  
  // 1. Check configuration
  console.log(`📊 isSupabaseConfigured: ${isSupabaseConfigured}`)
  console.log(`📊 VITE_SUPABASE_URL: ${import.meta.env.VITE_SUPABASE_URL}`)
  console.log(`📊 VITE_SUPABASE_ANON_KEY: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}`)
  
  if (!isSupabaseConfigured) {
    console.error('❌ Supabase not configured!')
    return
  }
  
  try {
    // 2. Test basic connection
    console.log('🔗 Testing basic connection...')
    const { data: testData, error: testError } = await supabase
      .from('fabrics')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('❌ Connection test failed:', testError)
      return
    }
    
    console.log('✅ Basic connection successful')
    
    // 3. Test reading fabrics
    console.log('📖 Testing fabric read...')
    const { data: fabrics, error: readError } = await supabase
      .from('fabrics')
      .select('*')
      .limit(5)
    
    if (readError) {
      console.error('❌ Fabric read failed:', readError)
      return
    }
    
    console.log(`✅ Read ${fabrics?.length || 0} fabrics:`)
    fabrics?.forEach((fabric, index) => {
      console.log(`  ${index + 1}. ${fabric.code} - Price: ${fabric.price || 'None'} - Custom URL: ${fabric.custom_image_url || 'None'}`)
    })
    
    // 4. Test custom URL update
    if (fabrics && fabrics.length > 0) {
      const testFabric = fabrics[0]
      const testUrl = `https://picsum.photos/400/300?random=${Date.now()}`
      
      console.log(`🖼️ Testing custom URL update for ${testFabric.code}...`)
      const { data: updateData, error: updateError } = await supabase
        .from('fabrics')
        .update({
          custom_image_url: testUrl,
          custom_image_updated_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', testFabric.id)
        .select()
        .single()
      
      if (updateError) {
        console.error('❌ Custom URL update failed:', updateError)
      } else {
        console.log('✅ Custom URL updated successfully:', updateData)
      }
      
      // 5. Test price update
      const testPrice = Math.floor(Math.random() * 1000000) + 100000
      const testNote = `Console test at ${new Date().toLocaleTimeString()}`
      
      console.log(`💰 Testing price update for ${testFabric.code}...`)
      const { data: priceData, error: priceError } = await supabase
        .from('fabrics')
        .update({
          price: testPrice,
          price_note: testNote,
          price_updated_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', testFabric.id)
        .select()
        .single()
      
      if (priceError) {
        console.error('❌ Price update failed:', priceError)
      } else {
        console.log('✅ Price updated successfully:', priceData)
      }
    }
    
    console.log('🎉 All tests completed!')
    
  } catch (error) {
    console.error('❌ Test failed with exception:', error)
  }
}

// Auto-run test
console.log('🚀 Supabase console test loaded. Run runSupabaseTest() to start.')

// Make it available globally for console access
(window as any).runSupabaseTest = runSupabaseTest
(window as any).supabase = supabase
(window as any).isSupabaseConfigured = isSupabaseConfigured
