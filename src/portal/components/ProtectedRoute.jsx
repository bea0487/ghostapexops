import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'

// Protects routes - requires authentication
export const ProtectedRoute = ({ children }) => {
  const { user, loading, authError } = useAuth()
  const [showRetry, setShowRetry] = useState(false)
  const [forceStop, setForceStop] = useState(false)

  useEffect(() => {
    // Show retry button after 5 seconds of loading
    const timer = setTimeout(() => {
      if (loading) setShowRetry(true)
    }, 5000)
    
    // Force stop loading after 10 seconds
    const forceTimer = setTimeout(() => {
      if (loading) {
        console.warn('Loading timeout - forcing stop')
        setForceStop(true)
      }
    }, 10000)
    
    return () => {
      clearTimeout(timer)
      clearTimeout(forceTimer)
    }
  }, [loading])

  // If loading timeout, allow access if user exists
  if (loading && !forceStop) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-4">
        <div className="animate-pulse text-cyan-400 font-orbitron text-xl">
          Loading...
        </div>
        {showRetry && (
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-3">Taking longer than expected...</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 font-rajdhani"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    )
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-4">
        <div className="text-red-400 font-orbitron text-xl">Authentication Error</div>
        <p className="text-gray-400 text-sm">{authError}</p>
        <button 
          onClick={() => window.location.href = '/portal/login'}
          className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 font-rajdhani"
        >
          Go to Login
        </button>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/portal/login" replace />
  }

  return children
}

// Protects routes by tier - requires specific service tier(s)
export const TierProtectedRoute = ({ children, allowedTiers }) => {
  const { user, client, loading, hasTierAccess, authError } = useAuth()
  const [showRetry, setShowRetry] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) setShowRetry(true)
    }, 5000)
    return () => clearTimeout(timer)
  }, [loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-4">
        <div className="animate-pulse text-cyan-400 font-orbitron text-xl">
          Loading...
        </div>
        {showRetry && (
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-3">Taking longer than expected...</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 font-rajdhani"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/portal/login" replace />
  }

  if (!hasTierAccess(allowedTiers)) {
    return <Navigate to="/portal/dashboard" replace />
  }

  return children
}
