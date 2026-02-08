import React from 'react'
import { Navigate } from 'react-router-dom'
import Shell from '../components/Shell'
import { supabase } from '../lib/supabaseClient'

export default function HomeRedirect() {
  const [loading, setLoading] = React.useState(true)
  const [isAdmin, setIsAdmin] = React.useState(false)

  React.useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const { data, error } = await supabase.auth.getUser()
        if (error) throw error
        if (!mounted) return
        const role = data?.user?.app_metadata?.role
        setIsAdmin(role === 'admin')
      } catch (_e) {
        if (!mounted) return
        setIsAdmin(false)
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return <Shell title="Loading" subtitle="Ghost Rider: Apex Operations">Loading…</Shell>
  }

  if (isAdmin) return <Navigate to="/admin" replace />
  return <Navigate to="/app" replace />
}
