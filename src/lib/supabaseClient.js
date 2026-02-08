import { createClient } from '@supabase/supabase-js'

// Support both Vite (VITE_), Next.js (NEXT_PUBLIC_), and Node.js (process.env)
const getEnvVar = (key) => {
  // Try Next.js public env vars first
  if (typeof process !== 'undefined' && process.env) {
    const nextPublicKey = key.replace('VITE_', 'NEXT_PUBLIC_')
    if (process.env[nextPublicKey]) {
      return process.env[nextPublicKey]
    }
    // Also try the original key
    if (process.env[key]) {
      return process.env[key]
    }
  }
  
  // Try import.meta.env (Vite)
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key]
    }
  } catch (e) {
    // import.meta not available
  }
  
  return null
}

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL')
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY')

// Debug logging (remove in production)
if (process.env.NODE_ENV !== 'production') {
  console.log('Supabase Client Init:', {
    url: supabaseUrl ? 'configured' : 'missing',
    key: supabaseAnonKey ? 'configured' : 'missing'
  })
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null
