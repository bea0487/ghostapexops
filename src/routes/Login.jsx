import React from 'react'
import { useNavigate } from 'react-router-dom'
import Shell from '../components/Shell'
import Field from '../components/Field'
import Input from '../components/Input'
import Button from '../components/Button'
import { signInWithPassword } from '../lib/auth'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [isSignUp, setIsSignUp] = React.useState(false)

  async function withTimeout(fn, ms, timeoutMessage) {
    let timeoutId
    try {
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(timeoutMessage)), ms)
      })
      return await Promise.race([fn(), timeoutPromise])
    } finally {
      clearTimeout(timeoutId)
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      if (isSignUp) {
        // Sign up new user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        
        if (error) throw error
        
        if (data?.user) {
          if (data.user.email_confirmed_at) {
            // Email already confirmed, redirect based on role
            const isAdmin = data.user.app_metadata?.role === 'admin'
            if (isAdmin) {
              navigate('/admin')
            } else {
              navigate('/app')
            }
          } else {
            setError('Account created! Please check your email to confirm your account, then sign in.')
            setIsSignUp(false)
            setPassword('')
          }
          setLoading(false)
          return
        }
      } else {
        // Sign in existing user - ensure clean session
        await supabase.auth.signOut()
        
        // Small delay to ensure session is cleared
        await new Promise(resolve => setTimeout(resolve, 500))
        
        await withTimeout(
          () => signInWithPassword({ email, password }),
          20000,
          'Sign-in timed out. Check your credentials and try again.',
        )

        // Get fresh session
        const { data } = await withTimeout(
          () => supabase.auth.getSession(),
          8000,
          'Signed in, but session was not established. Try again.',
        )

        if (!data?.session) {
          throw new Error('Signed in, but no session was stored. Try again.')
        }

        // Check if user is admin
        const isAdmin = data.session.user.app_metadata?.role === 'admin'
        
        if (isAdmin) {
          navigate('/admin')
        } else {
          navigate('/app')
        }
      }
    } catch (err) {
      setError(err?.message || (isSignUp ? 'Unable to create account' : 'Unable to sign in'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Shell
      title="Ghost Rider: Apex Operations"
      subtitle="Secure client portal"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
          <div className="font-orbitron text-sm tracking-wide text-white/90">Access</div>
          <div className="mt-2 font-rajdhani text-white/60">
            {isSignUp 
              ? 'Create your account to access the portal.' 
              : 'Sign in with your account credentials.'
            }
          </div>
          <img
            src="/images/hero-truck.png"
            alt=""
            className="mt-6 h-44 w-full rounded-xl object-cover opacity-90"
          />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Email">
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@company.com" required />
          </Field>

          <Field label="Password">
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" required />
          </Field>

          {error ? (
            <div className={`rounded-xl border p-3 font-rajdhani ${
              error.includes('created') 
                ? 'border-green-400/20 bg-green-500/10 text-green-200'
                : 'border-red-400/20 bg-red-500/10 text-red-200'
            }`}>
              {error}
            </div>
          ) : null}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (isSignUp ? 'Creating Account…' : 'Authenticating…') : (isSignUp ? 'Create Account' : 'Sign In')}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
                setPassword('')
              }}
              className="font-rajdhani text-sm text-white/60 hover:text-white/80 underline"
            >
              {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </button>
          </div>
        </form>
      </div>
    </Shell>
  )
}
