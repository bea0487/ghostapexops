'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Client {
  id: string
  company_name: string
  email: string
  client_id: string
  tier: string
  status: string
  created_at: string
}

interface DashboardKPIs {
  totalClients: number
  activeClients: number
  openTickets: number
  pendingDocuments: number
}

const TIER_OPTIONS = [
  { value: 'wingman', label: 'Wingman' },
  { value: 'guardian', label: 'Guardian' },
  { value: 'apex_command', label: 'Apex Command' },
  { value: 'virtual_dispatcher', label: 'Virtual Dispatcher' },
  { value: 'ala_carte', label: 'A La Carte' },
  { value: 'eld_monitoring_only', label: 'ELD Monitoring Only' },
  { value: 'back_office_command', label: 'Back Office Command' },
  { value: 'dot_readiness_audit', label: 'DOT Readiness Audit' }
]

export default function AdminDashboard() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [kpis, setKPIs] = useState<DashboardKPIs | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // New client form
  const [newClient, setNewClient] = useState({
    email: '',
    companyName: '',
    clientId: '',
    tier: 'wingman'
  })

  useEffect(() => {
    checkAdminAccess()
    loadDashboardData()
  }, [])

  const checkAdminAccess = () => {
    const session = localStorage.getItem('ghost_apex_session')
    if (!session) {
      router.push('/admin/login')
      return
    }

    try {
      const sessionData = JSON.parse(session)
      const userRole = sessionData.user?.user_metadata?.role || sessionData.user?.app_metadata?.role
      
      if (userRole !== 'admin') {
        router.push('/admin/login')
      }
    } catch (err) {
      router.push('/admin/login')
    }
  }

  const loadDashboardData = async () => {
    try {
      const { getDashboard } = await import('@/api/admin')
      const { getAllClients } = await import('@/lib/clientManagement')

      const [kpisResult, clientsResult] = await Promise.all([
        getDashboard(),
        getAllClients()
      ])

      if (kpisResult.data) {
        setKPIs(kpisResult.data)
      }

      if (clientsResult.success) {
        setClients(clientsResult.clients)
      }

      setLoading(false)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('ghost_apex_session')
    router.push('/admin/login')
  }

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const { createClient } = await import('@/lib/clientManagement')
      const result = await createClient(newClient)

      if (result.success) {
        setSuccess('Client created successfully!')
        setNewClient({ email: '', companyName: '', clientId: '', tier: 'wingman' })
        setShowCreateModal(false)
        loadDashboardData()
      } else {
        setError(result.error || 'Failed to create client')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    }
  }

  const handleUpdateTier = async (clientId: string, newTier: string) => {
    try {
      const { updateClientTier } = await import('@/lib/clientManagement')
      const result = await updateClientTier(clientId, newTier)

      if (result.success) {
        setSuccess('Client tier updated successfully!')
        loadDashboardData()
      } else {
        setError(result.error || 'Failed to update tier')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2" 
               style={{ borderColor: 'hsl(var(--cyber-purple))' }}></div>
          <p className="mt-4 font-shoulders text-xl glow-text-purple" style={{ color: 'hsl(var(--cyber-purple))' }}>
            LOADING ADMIN PORTAL...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass border-b" style={{ borderColor: 'hsl(var(--cyber-purple) / 0.3)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-black-ops">
                <span className="glow-text-purple" style={{ color: 'hsl(var(--cyber-purple))' }}>ADMIN</span>{' '}
                <span className="glow-text-pink" style={{ color: 'hsl(var(--cyber-pink))' }}>PORTAL</span>
              </h1>
              <span className="text-xs uppercase tracking-widest border-l pl-4" 
                    style={{ 
                      color: 'hsl(var(--cyber-purple))',
                      borderColor: 'hsl(var(--cyber-purple) / 0.5)'
                    }}>
                Ghost Rider Apex
              </span>
            </div>

            <div className="flex items-center space-x-6">
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm rounded-lg transition-all duration-300"
                style={{
                  border: '1px solid hsl(var(--cyber-purple) / 0.5)',
                  color: 'hsl(var(--cyber-purple))'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'hsl(var(--cyber-purple) / 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-slide-up">
          <h2 className="text-4xl font-shoulders mb-2 glow-text-purple" 
              style={{ color: 'hsl(var(--cyber-purple))' }}>
            ADMIN DASHBOARD
          </h2>
          <p style={{ color: 'hsl(var(--muted-foreground))' }}>
            Manage clients, view analytics, and monitor system health
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-lg animate-slide-up" style={{ 
            background: 'hsl(var(--destructive) / 0.2)', 
            border: '1px solid hsl(var(--destructive) / 0.5)' 
          }}>
            <p className="text-sm" style={{ color: 'hsl(var(--destructive))' }}>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-lg animate-slide-up" style={{ 
            background: 'hsl(var(--cyber-teal) / 0.2)', 
            border: '1px solid hsl(var(--cyber-teal) / 0.5)' 
          }}>
            <p className="text-sm" style={{ color: 'hsl(var(--cyber-teal))' }}>{success}</p>
          </div>
        )}

        {/* KPI Cards */}
        {kpis && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="glass rounded-xl p-6 cyber-hover animate-slide-up" 
                 style={{ border: '1px solid hsl(var(--cyber-purple) / 0.3)' }}>
              <p className="text-sm uppercase tracking-wide" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Total Clients
              </p>
              <p className="text-4xl font-bold mt-2 glow-text-purple" style={{ color: 'hsl(var(--cyber-purple))' }}>
                {kpis.totalClients}
              </p>
            </div>

            <div className="glass rounded-xl p-6 cyber-hover animate-slide-up delay-100" 
                 style={{ border: '1px solid hsl(var(--cyber-teal) / 0.3)' }}>
              <p className="text-sm uppercase tracking-wide" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Active Clients
              </p>
              <p className="text-4xl font-bold mt-2 glow-text-cyan" style={{ color: 'hsl(var(--cyber-teal))' }}>
                {kpis.activeClients}
              </p>
            </div>

            <div className="glass rounded-xl p-6 cyber-hover animate-slide-up delay-200" 
                 style={{ border: '1px solid hsl(var(--cyber-pink) / 0.3)' }}>
              <p className="text-sm uppercase tracking-wide" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Open Tickets
              </p>
              <p className="text-4xl font-bold mt-2 glow-text-pink" style={{ color: 'hsl(var(--cyber-pink))' }}>
                {kpis.openTickets}
              </p>
            </div>

            <div className="glass rounded-xl p-6 cyber-hover animate-slide-up delay-300" 
                 style={{ border: '1px solid hsl(var(--cyber-purple) / 0.3)' }}>
              <p className="text-sm uppercase tracking-wide" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Pending Docs
              </p>
              <p className="text-4xl font-bold mt-2 glow-text-purple" style={{ color: 'hsl(var(--cyber-purple))' }}>
                {kpis.pendingDocuments}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-shoulders glow-text-purple" style={{ color: 'hsl(var(--cyber-purple))' }}>
            CLIENT MANAGEMENT
          </h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-cyber-primary"
          >
            Create New Client
          </button>
        </div>

        {/* Clients Table */}
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full">
            <thead style={{ background: 'hsl(var(--muted) / 0.5)' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" 
                    style={{ color: 'hsl(var(--cyber-purple))' }}>
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" 
                    style={{ color: 'hsl(var(--cyber-purple))' }}>
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" 
                    style={{ color: 'hsl(var(--cyber-purple))' }}>
                  Client ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" 
                    style={{ color: 'hsl(var(--cyber-purple))' }}>
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" 
                    style={{ color: 'hsl(var(--cyber-purple))' }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client, index) => (
                <tr key={client.id} 
                    className="transition-colors"
                    style={{ 
                      borderTop: index > 0 ? '1px solid hsl(var(--border))' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'hsl(var(--muted) / 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'hsl(var(--foreground))' }}>
                    {client.company_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {client.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {client.client_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <select
                      value={client.tier}
                      onChange={(e) => handleUpdateTier(client.id, e.target.value)}
                      className="rounded px-2 py-1 text-sm focus:outline-none focus:ring-2"
                      style={{
                        background: 'hsl(var(--input))',
                        border: '1px solid hsl(var(--border))',
                        color: 'hsl(var(--foreground))',
                        focusRing: 'hsl(var(--cyber-purple))'
                      }}
                    >
                      {TIER_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 py-1 rounded text-xs uppercase" 
                          style={{ 
                            background: client.status === 'active' 
                              ? 'hsl(var(--cyber-teal) / 0.2)' 
                              : 'hsl(var(--muted) / 0.2)',
                            color: client.status === 'active' 
                              ? 'hsl(var(--cyber-teal))' 
                              : 'hsl(var(--muted-foreground))'
                          }}>
                      {client.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Create Client Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" 
             style={{ background: 'hsl(var(--background) / 0.8)' }}
             onClick={() => setShowCreateModal(false)}>
          <div className="glass rounded-2xl p-8 max-w-md w-full animate-slide-up" 
               onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-sirin mb-6 glow-text-purple" style={{ color: 'hsl(var(--cyber-purple))' }}>
              CREATE NEW CLIENT
            </h3>

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 uppercase tracking-wide" 
                       style={{ color: 'hsl(var(--cyber-purple))' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-lg"
                  style={{
                    background: 'hsl(var(--input))',
                    border: '2px solid hsl(var(--border))',
                    color: 'hsl(var(--foreground))'
                  }}
                  placeholder="client@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 uppercase tracking-wide" 
                       style={{ color: 'hsl(var(--cyber-purple))' }}>
                  Company Name
                </label>
                <input
                  type="text"
                  value={newClient.companyName}
                  onChange={(e) => setNewClient({ ...newClient, companyName: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-lg"
                  style={{
                    background: 'hsl(var(--input))',
                    border: '2px solid hsl(var(--border))',
                    color: 'hsl(var(--foreground))'
                  }}
                  placeholder="Company Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 uppercase tracking-wide" 
                       style={{ color: 'hsl(var(--cyber-purple))' }}>
                  Client ID
                </label>
                <input
                  type="text"
                  value={newClient.clientId}
                  onChange={(e) => setNewClient({ ...newClient, clientId: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-lg"
                  style={{
                    background: 'hsl(var(--input))',
                    border: '2px solid hsl(var(--border))',
                    color: 'hsl(var(--foreground))'
                  }}
                  placeholder="DOT-12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 uppercase tracking-wide" 
                       style={{ color: 'hsl(var(--cyber-purple))' }}>
                  Service Tier
                </label>
                <select
                  value={newClient.tier}
                  onChange={(e) => setNewClient({ ...newClient, tier: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg"
                  style={{
                    background: 'hsl(var(--input))',
                    border: '2px solid hsl(var(--border))',
                    color: 'hsl(var(--foreground))'
                  }}
                >
                  {TIER_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 rounded-lg transition-colors"
                  style={{
                    border: '1px solid hsl(var(--border))',
                    color: 'hsl(var(--muted-foreground))'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-cyber-primary"
                >
                  Create Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
