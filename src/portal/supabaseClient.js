import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const getJwtRole = (jwt) => {
  try {
    const parts = String(jwt || '').split('.')
    if (parts.length < 2) return null
    const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(payloadJson)
    return payload?.role || null
  } catch {
    return null
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!')
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Set' : '✗ Missing')
  throw new Error('Missing required Supabase environment variables. Please check your .env file or Vercel environment variables.')
}

// Guardrail: service_role keys must never be used in the browser
if (typeof window !== 'undefined' && supabaseAnonKey) {
  const role = getJwtRole(supabaseAnonKey)
  if (role && role !== 'anon') {
    console.error(
      `SECURITY ERROR: VITE_SUPABASE_ANON_KEY appears to be a '${role}' key. ` +
      `The browser must use an 'anon' key only. Update your Vercel/Vite env vars immediately.`
    )
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
