import React from 'react'
import { useNavigate } from 'react-router-dom'
import Shell from '../components/Shell'
import Field from '../components/Field'
import Input from '../components/Input'
import Button from '../components/Button'
import { supabase } from '../lib/supabaseClient'

async function callBootstrap(secret) {
  const base =
    import.meta.env.VITE_SUPABASE_FUNCTIONS_URL ||
    (import.meta.env.VITE_SUPABASE_URL ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1` : '')
  if (!base) throw new Error('Missing VITE_SUPABASE_URL (or VITE_SUPABASE_FUNCTIONS_URL override)')
  if (!import.meta.env.VITE_SUPABASE_ANON_KEY) throw new Error('Missing VITE_SUPABASE_ANON_KEY')

  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  if (!token) throw new Error('No active session')

  const res = await fetch(`${base}/bootstrap-admin`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      'x-bootstrap-secret': secret,
    },
  })

  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.error || 'Request failed')
  return json
}

export default function BootstrapAdmin() {
  const navigate = useNavigate()
  const [secret, setSecret] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [status, setStatus] = React.useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setStatus('')
    setLoading(true)

    try {
      const res = await callBootstrap(secret)
      setStatus(`Admin enabled for user: ${res.user_id}`)
      setTimeout(() => {
        navigate('/portal', { replace: true })
      }, 800)
    } catch (e2) {
      setError(e2?.message || 'Bootstrap failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Shell title="Bootstrap Admin" subtitle="One-time admin setup">
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-5 font-rajdhani text-white/70">
          Use this once to enable your admin account. You must be signed in first, then enter the bootstrap secret.
        </div>

        {error ? (
          <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 font-rajdhani text-red-200">{error}</div>
        ) : null}

        {status ? (
          <div className="rounded-xl border border-cyan-400/20 bg-cyan-500/10 p-3 font-rajdhani text-cyan-100">{status}</div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Bootstrap Secret" hint="Set as BOOTSTRAP_ADMIN_SECRET in Supabase Function secrets">
            <Input value={secret} onChange={(e) => setSecret(e.target.value)} type="password" required />
          </Field>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Enabling…' : 'Enable Admin'}
          </Button>
        </form>
      </div>
    </Shell>
  )
}
