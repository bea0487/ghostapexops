import { isSupabaseConfigured, supabase } from './supabaseClient'

function ensureSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then redeploy.')
  }
}

export async function signInWithPassword({ email, password }) {
  ensureSupabase()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  ensureSupabase()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  ensureSupabase()
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}
