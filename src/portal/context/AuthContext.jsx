import React from 'react'
import { supabase } from '../../lib/supabaseClient'

const AuthContext = React.createContext({})

export function useAuth() {
  return React.useContext(AuthContext)
}

function normalizeTier(tier) {
  if (!tier) return null
  return String(tier).toLowerCase()
}

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null)
  const [client, setClient] = React.useState(null)
  const [isAdmin, setIsAdmin] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [authError, setAuthError] = React.useState(null)

  const fetchClientProfile = React.useCallback(async (email) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, email, client_id, company_name, tier')
        .eq('email', email)
        .maybeSingle()

      if (error) {
        console.warn('Client profile fetch error:', error)
        setClient(null)
        return
      }

      setClient(data || null)
    } catch (_e) {
      console.warn('Client profile fetch exception:', _e)
      setClient(null)
    }
  }, [])

  const refreshClientProfile = React.useCallback(async () => {
    if (!user?.email) return
    await fetchClientProfile(user.email)
  }, [fetchClientProfile, user?.email])

  React.useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let mounted = true

    async function load() {
      try {
        // Get current session without refreshing to avoid conflicts
        const { data, error } = await supabase.auth.getSession()
        if (!mounted) return

        if (error) {
          console.warn('Session error:', error)
          setAuthError(error.message)
          setUser(null)
          setClient(null)
          setIsAdmin(false)
          setLoading(false)
          return
        }

        const session = data?.session
        const u = session?.user || null
        setUser(u)
        setIsAdmin(Boolean(u?.app_metadata?.role === 'admin'))

        if (u?.email) {
          await fetchClientProfile(u.email)
        } else {
          setClient(null)
        }

        setLoading(false)
      } catch (e) {
        if (!mounted) return
        console.warn('Auth load error:', e)
        setAuthError(e?.message || 'Authentication error')
        setUser(null)
        setClient(null)
        setIsAdmin(false)
        setLoading(false)
      }
    }

    load()

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      console.log('Auth state change:', event, session?.user?.email)
      
      // Clear error on any auth state change
      setAuthError(null)
      
      const u = session?.user || null
      setUser(u)
      setIsAdmin(Boolean(u?.app_metadata?.role === 'admin'))

      if (u?.email) {
        await fetchClientProfile(u.email)
      } else {
        setClient(null)
      }

      setLoading(false)
    })

    return () => {
      mounted = false
      sub?.subscription?.unsubscribe()
    }
  }, [fetchClientProfile])

  async function signOut() {
    try {
      console.log('Starting sign out process...')
      
      // Clear state immediately to prevent race conditions
      setUser(null)
      setClient(null)
      setIsAdmin(false)
      setAuthError(null)
      setLoading(false)
      
      // Clear all local storage and session storage
      localStorage.clear()
      sessionStorage.clear()
      
      // Clear service worker caches if available
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys()
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          )
        } catch (e) {
          console.warn('Cache clearing failed:', e)
        }
      }
      
      // Sign out from Supabase with scope 'local' to avoid affecting other tabs
      await supabase.auth.signOut({ scope: 'local' })
      
      console.log('Sign out completed successfully')
      
      // Small delay to ensure everything is cleared
      await new Promise(resolve => setTimeout(resolve, 200))
      
    } catch (e) {
      console.warn('Sign out error:', e)
      // Even if sign out fails, state is already cleared
    }
  }

  async function resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })
    return { data, error }
  }

  const tier = normalizeTier(client?.tier)

  const value = {
    user,
    client,
    isAdmin,
    loading,
    authError,
    signOut,
    resetPassword,
    refreshClientProfile,
    isWingman: tier === 'wingman',
    isGuardian: tier === 'guardian',
    isApexCommand: tier === 'apex_command',
    isVirtualDispatcher: tier === 'virtual_dispatcher',
    isALaCarte: tier === 'ala_carte',
    isELDMonitoringOnly: tier === 'eld_monitoring_only',
    isBackOfficeCommand: tier === 'back_office_command',
    isDOTReadinessAudit: tier === 'dot_readiness_audit',
    hasTierAccess: (allowedTiers) => {
      const allowed = (allowedTiers || []).map(normalizeTier)
      if (!tier) return false
      return allowed.includes(tier)
    },
    // Helper functions for feature access
    hasELDAccess: () => tier !== null, // All tiers have ELD access
    hasIFTAAccess: () => ['guardian', 'apex_command', 'virtual_dispatcher', 'back_office_command', 'ala_carte'].includes(tier),
    hasDriverFilesAccess: () => ['guardian', 'apex_command', 'virtual_dispatcher', 'back_office_command'].includes(tier),
    hasCSAAccess: () => ['apex_command', 'back_office_command', 'ala_carte'].includes(tier),
    hasDataQAccess: () => ['apex_command', 'back_office_command', 'ala_carte'].includes(tier),
    hasVirtualDispatcherAccess: () => ['virtual_dispatcher', 'back_office_command'].includes(tier),
    hasDOTAuditAccess: () => ['dot_readiness_audit', 'back_office_command'].includes(tier),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
