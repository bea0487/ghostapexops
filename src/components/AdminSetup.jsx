import React, { useState, useEffect } from 'react'
import { useAuth } from '../portal/context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import UserDebugInfo from './UserDebugInfo'
import Button from './Button'
import Input from './Input'
import Field from './Field'

export default function AdminSetup() {
  const { user, isAdmin } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [bootstrapSecret, setBootstrapSecret] = useState('')

  const testEdgeFunction = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      console.log('Testing Edge Function with session:', session.user.email)

      const { data, error } = await supabase.functions.invoke('invite-user', {
        body: {
          email: 'test@example.com',
          company_name: 'Test Company',
          client_id: 'TEST-001',
          tier: 'wingman'
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      console.log('Edge Function test result:', { data, error })

      if (error) {
        setError(`Edge Function Error: ${error.message}`)
      } else if (data?.ok) {
        setMessage('✅ Edge Function is working! You can create clients.')
      } else {
        setError(`Edge Function returned: ${JSON.stringify(data)}`)
      }
    } catch (err) {
      console.error('Edge Function test error:', err)
      setError(`Test failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleBootstrapAdmin = async (e) => {
    e.preventDefault()
    if (!bootstrapSecret.trim()) {
      setError('Bootstrap secret is required')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      const { data, error } = await supabase.functions.invoke('bootstrap-admin', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'x-bootstrap-secret': bootstrapSecret.trim(),
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      if (data?.ok) {
        setMessage(data.already ? 'You are already an admin!' : 'Successfully promoted to admin! Please refresh the page.')
      } else {
        throw new Error(data?.error || 'Bootstrap failed')
      }
    } catch (err) {
      console.error('Bootstrap admin error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyUserInfo = () => {
    if (user?.id) {
      const info = `User ID: ${user.id}\nEmail: ${user.email}`
      navigator.clipboard.writeText(info)
      setMessage('User info copied to clipboard!')
    }
  }

  if (isAdmin) {
    return (
      <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-6">
        <h3 className="text-xl font-bold text-green-400 mb-2">✅ Admin Access Confirmed</h3>
        <p className="text-green-200">You have admin privileges and can create clients.</p>
      </div>
    )
  }

  return (
    <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-6">
      <h3 className="text-xl font-bold text-yellow-400 mb-4">🔧 Admin Setup Required</h3>
      
      <UserDebugInfo />
      
      {user && (
        <div className="mb-6 p-4 bg-gray-800/50 rounded border">
          <h4 className="font-semibold text-white mb-2">Current User Info:</h4>
          <p className="text-gray-300 text-sm mb-2">ID: <code className="bg-gray-700 px-1 rounded">{user.id}</code></p>
          <p className="text-gray-300 text-sm mb-3">Email: <code className="bg-gray-700 px-1 rounded">{user.email}</code></p>
          <Button size="sm" variant="cyberOutline" onClick={copyUserInfo}>
            Copy User Info
          </Button>
        </div>
      )}

      <div className="mb-6">
        <h4 className="font-semibold text-white mb-2">Option 1: Use Bootstrap Function</h4>
        <p className="text-gray-300 text-sm mb-3">
          If you have the bootstrap secret, you can promote yourself to admin:
        </p>
        <form onSubmit={handleBootstrapAdmin} className="space-y-3">
          <Field label="Bootstrap Secret">
            <Input
              type="password"
              value={bootstrapSecret}
              onChange={(e) => setBootstrapSecret(e.target.value)}
              placeholder="Enter bootstrap secret"
            />
          </Field>
          <Button type="submit" variant="cyber" disabled={loading}>
            {loading ? 'Processing...' : 'Promote to Admin'}
          </Button>
          <Button type="button" variant="cyberOutline" onClick={testEdgeFunction} disabled={loading}>
            Test Edge Function
          </Button>
        </form>
      </div>

      <div className="border-t border-gray-600 pt-4">
        <h4 className="font-semibold text-white mb-2">Option 2: Manual SQL Update</h4>
        <p className="text-gray-300 text-sm mb-2">
          Run this SQL in your Supabase SQL Editor:
        </p>
        <div className="bg-gray-900 p-3 rounded text-xs text-gray-300 font-mono overflow-x-auto">
          <div className="mb-2">-- Make user admin</div>
          <div className="mb-2">UPDATE auth.users</div>
          <div className="mb-2">SET raw_app_meta_data = '{`{"role": "admin"}`}'::jsonb</div>
          <div className="mb-4">WHERE id = '{user?.id}' AND email = '{user?.email}';</div>
          
          <div className="mb-2">-- Create admin client record</div>
          <div className="mb-2">INSERT INTO public.clients (user_id, email, company_name, client_id, tier)</div>
          <div>VALUES ('{user?.id}', '{user?.email}', 'Admin User', 'ADMIN-001', 'apex_command');</div>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-4 bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded">
          {message}
        </div>
      )}
    </div>
  )
}