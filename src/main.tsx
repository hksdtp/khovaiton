import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import './assets/styles/index.css'

// Import console test for debugging
import './debug/ConsoleTest'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Debug Supabase connection
import { supabase, isSupabaseConfigured } from './lib/supabase'

// Make Supabase available in console for debugging
;(window as any).supabase = supabase
;(window as any).isSupabaseConfigured = isSupabaseConfigured

// Auto-test Supabase connection
setTimeout(async () => {
  console.log('🔍 Auto-testing Supabase connection...')
  console.log(`📊 isSupabaseConfigured: ${isSupabaseConfigured}`)
  console.log(`📊 VITE_SUPABASE_URL: ${import.meta.env.VITE_SUPABASE_URL}`)
  console.log(`📊 VITE_SUPABASE_ANON_KEY: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}`)

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('fabrics').select('count').limit(1)
      if (error) {
        console.error('❌ Supabase connection failed:', error)
      } else {
        console.log('✅ Supabase connection successful!')

        // Test reading fabrics
        const { data: fabrics, error: readError } = await supabase
          .from('fabrics')
          .select('id, code, name, price, custom_image_url')
          .limit(3)

        if (readError) {
          console.error('❌ Fabric read failed:', readError)
        } else {
          console.log(`✅ Read ${fabrics?.length || 0} fabrics from Supabase:`)
          fabrics?.forEach(f => console.log(`  - ${f.code}: price=${f.price}, custom_url=${f.custom_image_url}`))
        }
      }
    } catch (err) {
      console.error('❌ Supabase test exception:', err)
    }
  } else {
    console.error('❌ Supabase not configured!')
  }
}, 2000)
