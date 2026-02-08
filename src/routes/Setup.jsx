import React from 'react'
import Shell from '../components/Shell'

function missingVars() {
  const missing = []
  if (!import.meta.env.VITE_SUPABASE_URL) missing.push('VITE_SUPABASE_URL')
  if (!import.meta.env.VITE_SUPABASE_ANON_KEY) missing.push('VITE_SUPABASE_ANON_KEY')
  if (!import.meta.env.VITE_SUPABASE_FUNCTIONS_URL) missing.push('VITE_SUPABASE_FUNCTIONS_URL')
  return missing
}

export default function Setup() {
  const missing = missingVars()

  return (
    <Shell title="Setup Required" subtitle="Ghost Rider: Apex Operations">
      <div className="space-y-4">
        <div className="font-rajdhani text-white/70">
          The app is deployed, but required environment variables are missing. This commonly shows up as a black screen.
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="font-orbitron text-xs tracking-wide text-white/80">Missing Variables</div>
          <div className="mt-2 font-rajdhani text-white/70">
            {missing.length ? missing.join(', ') : 'None (refresh / redeploy if you still see this)'}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="font-orbitron text-xs tracking-wide text-white/80">Vercel → Project → Settings → Environment Variables</div>
          <pre className="mt-3 overflow-auto rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-xs text-white/80">
{`VITE_SUPABASE_URL=https://bhobxigykdnvmechmhjm.supabase.co
VITE_SUPABASE_ANON_KEY=*** your anon key ***
VITE_SUPABASE_FUNCTIONS_URL=https://bhobxigykdnvmechmhjm.functions.supabase.co`}
          </pre>
          <div className="mt-2 font-rajdhani text-white/60">
            After saving env vars, trigger a new deployment (Redeploy).
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="font-orbitron text-xs tracking-wide text-white/80">Supabase → Auth → URL Configuration</div>
          <div className="mt-2 font-rajdhani text-white/70">
            Add this Redirect URL so invite links complete sign-in:
          </div>
          <pre className="mt-3 overflow-auto rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-xs text-white/80">
{`https://ghost-rider-apex-ops-v4.vercel.app/auth/callback`}
          </pre>
        </div>
      </div>
    </Shell>
  )
}
