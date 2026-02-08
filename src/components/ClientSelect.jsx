import React from 'react'
import { supabase } from '../lib/supabaseClient'
import Field from './Field'

export default function ClientSelect({ value, onChange, label = 'Client', required = true }) {
  const [clients, setClients] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    async function load() {
      if (!supabase) return
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('id, company_name, email, client_id')
          .order('company_name', { ascending: true })
        
        if (error) throw error
        setClients(data || [])
      } catch (e) {
        console.error('Failed to load clients for select', e)
        setError('Failed to load clients')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <Field label={label} error={error}>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={loading}
          className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 pr-10 font-rajdhani text-white outline-none focus:border-cyan-500/40 focus:bg-black/60 disabled:opacity-50"
        >
          <option value="">{loading ? 'Loading clients...' : 'Select a Client...'}</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.company_name ? `${c.company_name} (${c.email})` : c.email}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </Field>
  )
}
