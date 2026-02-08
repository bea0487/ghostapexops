import { supabase } from './supabaseClient'

export async function fetchMyClientProfile() {
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr

  const email = userData?.user?.email
  if (!email) throw new Error('Not signed in')

  const { data, error } = await supabase
    .from('clients')
    .select('id, email, client_id, company_name, tier')
    .eq('email', email)
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error('No client profile found for this user yet.')
  return data
}
