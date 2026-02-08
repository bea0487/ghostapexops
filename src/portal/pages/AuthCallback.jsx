import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const AuthCallback = () => {
  const navigate = useNavigate()
  const [message, setMessage] = useState('Verifying your account...')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash parameters from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type')

        // Also check query parameters (some flows use query params)
        const queryParams = new URLSearchParams(window.location.search)
        const errorCode = queryParams.get('error')
        const errorDescription = queryParams.get('error_description')

        if (errorCode) {
          setMessage(`Error: ${errorDescription || errorCode}`)
          setTimeout(() => navigate('/portal/login'), 3000)
          return
        }

        if (accessToken && refreshToken) {
          // Set the session
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (error) {
            console.error('Session error:', error)
            setMessage('Error verifying account. Redirecting to login...')
            setTimeout(() => navigate('/portal/login'), 2000)
            return
          }

          if (type === 'recovery') {
            // Password reset - redirect to settings to change password
            setMessage('Account verified! Redirecting to change your password...')
            setTimeout(() => navigate('/portal/settings'), 1500)
          } else {
            // Normal confirmation or magic link
            setMessage('Account verified! Redirecting to dashboard...')
            setTimeout(() => navigate('/portal/dashboard'), 1500)
          }
        } else {
          // No tokens - check if we're already authenticated
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            navigate('/portal/dashboard')
          } else {
            setMessage('No authentication found. Redirecting to login...')
            setTimeout(() => navigate('/portal/login'), 2000)
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setMessage('An error occurred. Redirecting to login...')
        setTimeout(() => navigate('/portal/login'), 2000)
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative text-center">
        <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center mb-6">
          <span className="font-orbitron font-bold text-black text-xl">GR</span>
        </div>
        
        <div className="animate-pulse text-cyan-400 font-orbitron text-xl mb-4">
          {message}
        </div>
        
        <div className="flex justify-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  )
}

export default AuthCallback
