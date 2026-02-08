import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'

export default function ProtectedRoute({ children }) {
  const location = useLocation()
  const [loading, setLoading] = React.useState(true)
  const [authed, setAuthed] = React.useState(false)

  React.useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthed(false)
      setLoading(false)
      return
    }

    let mounted = true

    async function init() {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setAuthed(Boolean(data.session))
      setLoading(false)
    }

    init()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setAuthed(Boolean(session))
      setLoading(false)
    })

    return () => {
      mounted = false
      sub?.subscription?.unsubscribe()
    }
  }, [])

  if (!isSupabaseConfigured) return <Navigate to="/setup" replace />
  if (loading) return null
  if (!authed) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return children
}
