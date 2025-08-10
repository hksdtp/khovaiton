import { createClient } from '@supabase/supabase-js'

// Force Supabase configuration (bypass environment variables if needed)
const FORCE_SUPABASE_URL = 'https://zgrfqkytbmahxcbgpkxx.supabase.co'
const FORCE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncmZxa3l0Ym1haHhjYmdwa3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNjI1MTAsImV4cCI6MjA2MTczODUxMH0.a6giZZFMrj6jBhLip3ShOFCyTHt5dbe31UDGCECh0Zs'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FORCE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FORCE_SUPABASE_ANON_KEY

console.log('🔍 Environment check:')
console.log(`  VITE_SUPABASE_URL: ${supabaseUrl}`)
console.log(`  VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'Set' : 'Not set'}`)

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Using mock mode.')
  console.warn('Expected:')
  console.warn('  VITE_SUPABASE_URL=https://zgrfqkytbmahxcbgpkxx.supabase.co')
  console.warn('  VITE_SUPABASE_ANON_KEY=your-anon-key')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Mock mode for development when Supabase is not configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

console.log(`🔗 Supabase configured: ${isSupabaseConfigured}`)

// Test connection immediately if configured
if (isSupabaseConfigured) {
  const testConnection = async () => {
    try {
      const { error } = await supabase.from('fabrics').select('count').limit(1)
      if (error) {
        console.error('❌ Supabase connection test failed:', error)
      } else {
        console.log('✅ Supabase connection test successful!')
      }
    } catch (err) {
      console.error('❌ Supabase connection exception:', err)
    }
  }
  testConnection()
}
