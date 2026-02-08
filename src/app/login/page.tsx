'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { login } = await import('@/api/auth')
      const result = await login({ email, password })

      if (result.error) {
        setError(result.error.message)
        setLoading(false)
        return
      }

      if (result.data) {
        localStorage.setItem('ghost_apex_session', JSON.stringify(result.data))
        router.push('/client/dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 cyber-grid opacity-20"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" 
           style={{ background: 'radial-gradient(circle, hsl(var(--cyber-teal)) 0%, transparent 70%)' }}></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" 
           style={{ background: 'radial-gradient(circle, hsl(var(--cyber-purple)) 0%, transparent 70%)' }}></div>

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black-ops mb-2">
            <span className="glow-text-cyan" style={{ color: 'hsl(var(--cyber-teal))' }}>GHOST</span>{' '}
            <span className="glow-text-purple" style={{ color: 'hsl(var(--cyber-purple))' }}>RIDER</span>
          </h1>
          <p className="text-xl font-sirin tracking-wider cyber-gradient-text">
            APEX OPERATIONS
          </p>
          <div className="mt-4 inline-block px-4 py-1 glass rounded-full">
            <span className="text-xs uppercase tracking-widest" style={{ color: 'hsl(var(--cyber-teal))' }}>
              DOT Compliance Experts
            </span>
          </div>
        </div>

        {/* Login Card */}
        <div className="glass rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-sirin text-center mb-6 glow-text-cyan" style={{ color: 'hsl(var(--cyber-teal))' }}>
            CLIENT PORTAL ACCESS
          </h2>

          {error && (
            <div className="mb-6 p-4 rounded-lg" style={{ 
              background: 'hsl(var(--destructive) / 0.2)', 
              border: '1px solid hsl(var(--destructive) / 0.5)' 
            }}>
              <p className="text-sm text-center" style={{ color: 'hsl(var(--destructive))' }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 uppercase tracking-wide" 
                     style={{ color: 'hsl(var(--cyber-teal))' }}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg transition-all duration-300 focus:outline-none"
                style={{
                  background: 'hsl(var(--input))',
                  border: '2px solid hsl(var(--border))',
                  color: 'hsl(var(--foreground))'
                }}
                placeholder="your@email.com"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 uppercase tracking-wide" 
                     style={{ color: 'hsl(var(--cyber-teal))' }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg transition-all duration-300 focus:outline-none"
                style={{
                  background: 'hsl(var(--input))',
                  border: '2px solid hsl(var(--border))',
                  color: 'hsl(var(--foreground))'
                }}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded"
                  style={{ accentColor: 'hsl(var(--cyber-teal))' }}
                />
                <span className="ml-2" style={{ color: 'hsl(var(--muted-foreground))' }}>Remember me</span>
              </label>
              <Link href="/forgot-password" className="transition-colors" 
                    style={{ color: 'hsl(var(--cyber-teal))' }}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-cyber-primary w-full text-lg font-shoulders tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  AUTHENTICATING...
                </span>
              ) : (
                'ACCESS PORTAL'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid hsl(var(--border))' }}>
            <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Need access?{' '}
              <Link href="/contact" className="font-medium transition-colors" 
                    style={{ color: 'hsl(var(--cyber-purple))' }}>
                Contact Support
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
            © 2024 Ghost Rider: Apex Operations. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
