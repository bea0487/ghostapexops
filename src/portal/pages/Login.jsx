import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  
  const { user, loading, signIn, resetPassword } = useAuth()
  const navigate = useNavigate()

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/portal/dashboard', { replace: true })
    }
  }, [user, loading, navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const { error } = await signIn(email, password)
    
    if (error) {
      setError(error.message || 'Invalid email or password')
      setIsLoading(false)
    } else {
      navigate('/portal/dashboard')
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const { error } = await resetPassword(email)
    
    if (error) {
      setError(error.message || 'Failed to send reset email')
    } else {
      setResetSent(true)
    }
    setIsLoading(false)
  }

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-cyan-400 font-orbitron text-xl">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back to website link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-8 font-rajdhani"
        >
          <ArrowLeft size={18} />
          Back to Website
        </Link>

        {/* Login Card */}
        <div className="bg-[#0d0d14] border border-cyan-500/20 rounded-2xl p-8 shadow-2xl shadow-cyan-500/5">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center mb-4">
              <span className="font-orbitron font-bold text-black text-xl">GR</span>
            </div>
            <h1 className="font-orbitron font-bold text-white text-xl">CLIENT PORTAL</h1>
            <p className="text-gray-400 font-rajdhani mt-2">Ghost Rider: Apex Operations</p>
          </div>

          {showForgotPassword ? (
            // Forgot Password Form
            <div>
              {resetSent ? (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                    <Mail className="text-cyan-400" size={32} />
                  </div>
                  <h2 className="font-rajdhani font-semibold text-white text-lg mb-2">Check Your Email</h2>
                  <p className="text-gray-400 font-rajdhani mb-6">
                    We sent a password reset link to <span className="text-cyan-400">{email}</span>
                  </p>
                  <button
                    onClick={() => {
                      setShowForgotPassword(false)
                      setResetSent(false)
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-rajdhani font-medium"
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword}>
                  <h2 className="font-rajdhani font-semibold text-white text-lg mb-2">Reset Password</h2>
                  <p className="text-gray-400 font-rajdhani mb-6 text-sm">
                    Enter your email and we'll send you a reset link.
                  </p>

                  {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                      <AlertCircle size={18} />
                      {error}
                    </div>
                  )}

                  <div className="mb-6">
                    <label className="block text-gray-400 font-rajdhani text-sm mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-[#0a0a0f] border border-cyan-500/30 rounded-lg py-3 pl-11 pr-4 text-white font-rajdhani focus:outline-none focus:border-cyan-400 transition-colors"
                        placeholder="you@company.com"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-rajdhani font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="w-full mt-4 text-gray-400 hover:text-white font-rajdhani font-medium transition-colors"
                  >
                    Back to Login
                  </button>
                </form>
              )}
            </div>
          ) : (
            // Login Form
            <form onSubmit={handleLogin}>
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-gray-400 font-rajdhani text-sm mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-[#0a0a0f] border border-cyan-500/30 rounded-lg py-3 pl-11 pr-4 text-white font-rajdhani focus:outline-none focus:border-cyan-400 transition-colors"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-400 font-rajdhani text-sm mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-[#0a0a0f] border border-cyan-500/30 rounded-lg py-3 pl-11 pr-4 text-white font-rajdhani focus:outline-none focus:border-cyan-400 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-rajdhani font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>

              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="w-full mt-4 text-gray-400 hover:text-cyan-400 font-rajdhani text-sm transition-colors"
              >
                Forgot your password?
              </button>

              <div className="mt-6 pt-6 border-t border-cyan-500/20">
                <p className="text-center text-gray-400 font-rajdhani text-sm mb-3">
                  Don't have an account?
                </p>
                <Link
                  to="/portal/register"
                  className="block w-full text-center border-2 border-cyan-500 text-cyan-400 font-rajdhani font-semibold py-3 rounded-lg hover:bg-cyan-500/10 transition-all duration-300"
                >
                  Create Account
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Help text */}
        <p className="text-center text-gray-500 font-rajdhani text-sm mt-6">
          Need help? Contact us at{' '}
          <a href="mailto:ghostrider.apexops@zohomail.com" className="text-cyan-400 hover:text-cyan-300">
            ghostrider.apexops@zohomail.com
          </a>
        </p>
      </div>
    </div>
  )
}

export default Login
