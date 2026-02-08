import React from 'react'
import { Key, User, Mail } from 'lucide-react'
import PortalLayout from '../components/PortalLayout'
import { useAuth } from '../context/AuthContext'
import Button from '../../components/Button'
import Field from '../../components/Field'
import Input from '../../components/Input'
import { supabase } from '../../lib/supabaseClient'

export default function Settings() {
  const { user, client } = useAuth()
  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState('')
  const [error, setError] = React.useState('')
  const [currentPassword, setCurrentPassword] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')

  async function handlePasswordChange(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (newPassword !== confirmPassword) {
        throw new Error('New passwords do not match')
      }

      if (newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long')
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      setMessage('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (e) {
      setError(e.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-orbitron font-bold text-2xl text-white">Account Settings</h1>
          <p className="text-gray-400 font-rajdhani mt-1">Manage your account preferences</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Account Information */}
          <div className="bg-[#0d0d14] border border-cyan-500/20 rounded-xl p-6">
            <h2 className="font-orbitron font-semibold text-white mb-4 flex items-center gap-2">
              <User size={20} />
              Account Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-rajdhani text-gray-400 mb-1">Email</label>
                <div className="flex items-center gap-2 p-3 bg-black/40 rounded-lg border border-white/10">
                  <Mail size={16} className="text-gray-500" />
                  <span className="text-white font-rajdhani">{user?.email}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-rajdhani text-gray-400 mb-1">Company</label>
                <div className="p-3 bg-black/40 rounded-lg border border-white/10">
                  <span className="text-white font-rajdhani">{client?.company_name || 'Not specified'}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-rajdhani text-gray-400 mb-1">Service Tier</label>
                <div className="p-3 bg-black/40 rounded-lg border border-white/10">
                  <span className="text-cyan-400 font-rajdhani capitalize">
                    {client?.tier?.replace('_', ' ') || 'Not assigned'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-[#0d0d14] border border-cyan-500/20 rounded-xl p-6">
            <h2 className="font-orbitron font-semibold text-white mb-4 flex items-center gap-2">
              <Key size={20} />
              Change Password
            </h2>

            {message && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-400 font-rajdhani text-sm">{message}</p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 font-rajdhani text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Field label="New Password">
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
              </Field>

              <Field label="Confirm New Password">
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
              </Field>

              <Button
                type="submit"
                disabled={loading || !newPassword || !confirmPassword}
                className="w-full bg-cyan-600 hover:bg-cyan-500"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </PortalLayout>
  )
}
