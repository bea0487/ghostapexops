import React from 'react'
import { supabase } from '../lib/supabaseClient'
import Shell from '../components/Shell'
import Button from '../components/Button'
import { fetchMyClientProfile } from '../lib/profiles'

function formatTier(t) {
  if (!t) return ''
  if (t === 'wingman') return 'Wingman'
  if (t === 'guardian') return 'Guardian'
  if (t === 'apex_command') return 'Apex Command'
  return t
}

export default function ClientDashboard() {
  const [profile, setProfile] = React.useState(null)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    let mounted = true

    async function load() {
      setError('')
      try {
        const p = await fetchMyClientProfile()
        if (!mounted) return
        setProfile(p)
      } catch (e) {
        if (!mounted) return
        setError(e?.message || 'Unable to load client profile')
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  async function onSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <Shell
      title="Client Dashboard"
      subtitle={profile ? `${profile.company_name || profile.client_id} • ${formatTier(profile.tier)}` : 'Loading…'}
      right={<Button onClick={onSignOut}>Sign Out</Button>}
    >
      {error ? (
        <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 font-rajdhani text-red-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="font-orbitron text-xs tracking-wide text-white/80">ELD Reports</div>
          <div className="mt-2 font-rajdhani text-white/60">Available for Wingman+ tiers.</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="font-orbitron text-xs tracking-wide text-white/80">IFTA Reports</div>
          <div className="mt-2 font-rajdhani text-white/60">Available for Guardian+ tiers.</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="font-orbitron text-xs tracking-wide text-white/80">Support Tickets</div>
          <div className="mt-2 font-rajdhani text-white/60">Create and track support issues.</div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
        <div className="font-orbitron text-xs tracking-wide text-white/80">Next</div>
        <div className="mt-2 font-rajdhani text-white/60">
          I’ll wire the tier-based tables (read-only reports + create tickets) once the backend is deployed.
        </div>
      </div>
    </Shell>
  )
}
