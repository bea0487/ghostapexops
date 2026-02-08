import React from 'react'
import { useNavigate } from 'react-router-dom'
import Shell from '../components/Shell'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [message, setMessage] = React.useState('Finalizing sign-in…')

  React.useEffect(() => {
    let mounted = true

    async function run() {
      try {
        if (!isSupabaseConfigured) {
          navigate('/setup', { replace: true })
          return
        }

        // Handles invite / magic link / OAuth code flow if present.
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
        }

        // If session exists (code flow, magic link), we can route to home redirect.
        const { data } = await supabase.auth.getSession()
        if (!mounted) return

        if (data.session) {
          navigate('/', { replace: true })
          return
        }

        setMessage('Sign-in link expired or already used. Please sign in again.')
        setTimeout(() => {
          navigate('/login', { replace: true })
        }, 1200)
      } catch (e) {
        if (!mounted) return
        setMessage(e?.message || 'Unable to finalize sign-in. Redirecting to login…')
        setTimeout(() => {
          navigate('/login', { replace: true })
        }, 1200)
      }
    }

    run()

    return () => {
      mounted = false
    }
  }, [navigate])

  return (
    <Shell title="Ghost Rider: Apex Operations" subtitle="Auth Callback">
      <div className="font-rajdhani text-white/70">{message}</div>
    </Shell>
  )
}
