'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Ticket {
  id: string
  subject: string
  status: string
  priority: string
  created_at: string
}

interface Document {
  id: string
  file_name: string
  file_type: string
  uploaded_at: string
}

interface ClientProfile {
  company_name: string
  tier: string
  status: string
  email: string
}

export default function ClientDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<ClientProfile | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'tickets' | 'documents'>('overview')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Check if user is logged in
      const session = localStorage.getItem('ghost_apex_session')
      if (!session) {
        router.push('/login')
        return
      }

      // Import APIs
      const { getMyProfile } = await import('@/api/clients')
      const { listTickets } = await import('@/api/tickets')
      const { listDocuments } = await import('@/api/documents')

      // Load data in parallel
      const [profileResult, ticketsResult, documentsResult] = await Promise.all([
        getMyProfile(),
        listTickets({ limit: 5 }),
        listDocuments({ limit: 5 })
      ])

      if (profileResult.data) {
        setProfile(profileResult.data)
      }

      if (ticketsResult.data) {
        setTickets(ticketsResult.data)
      }

      if (documentsResult.data) {
        setDocuments(documentsResult.data)
      }

      setLoading(false)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('ghost_apex_session')
    router.push('/login')
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'text-cyber-teal'
      case 'in progress':
        return 'text-yellow-400'
      case 'resolved':
        return 'text-green-400'
      case 'closed':
        return 'text-gray-400'
      default:
        return 'text-gray-400'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'text-red-400'
      case 'high':
        return 'text-orange-400'
      case 'medium':
        return 'text-yellow-400'
      case 'low':
        return 'text-green-400'
      default:
        return 'text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2" 
               style={{ borderColor: 'hsl(var(--cyber-teal))' }}></div>
          <p className="mt-4 font-shoulders text-xl glow-text-cyan" style={{ color: 'hsl(var(--cyber-teal))' }}>
            LOADING PORTAL...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass border-b" style={{ borderColor: 'hsl(var(--cyber-teal) / 0.3)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-black-ops">
                <span className="glow-text-cyan" style={{ color: 'hsl(var(--cyber-teal))' }}>GHOST</span>{' '}
                <span className="glow-text-purple" style={{ color: 'hsl(var(--cyber-purple))' }}>RIDER</span>
              </h1>
              <span className="text-xs uppercase tracking-widest border-l pl-4" 
                    style={{ 
                      color: 'hsl(var(--cyber-teal))',
                      borderColor: 'hsl(var(--cyber-teal) / 0.5)'
                    }}>
                Client Portal
              </span>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {profile?.company_name}
                </p>
                <p className="text-xs uppercase" style={{ color: 'hsl(var(--cyber-teal))' }}>
                  {profile?.tier} Tier
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm rounded-lg transition-all duration-300"
                style={{
                  border: '1px solid hsl(var(--cyber-teal) / 0.5)',
                  color: 'hsl(var(--cyber-teal))'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'hsl(var(--cyber-teal) / 0.1)'
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
          <h2 className="text-4xl font-shoulders mb-2 glow-text-cyan" 
              style={{ color: 'hsl(var(--cyber-teal))' }}>
            WELCOME BACK
          </h2>
          <p style={{ color: 'hsl(var(--muted-foreground))' }}>
            Your compliance dashboard at a glance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass rounded-xl p-6 cyber-hover animate-slide-up" 
               style={{ border: '1px solid hsl(var(--cyber-teal) / 0.3)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Open Tickets
                </p>
                <p className="text-4xl font-bold mt-2 glow-text-cyan" style={{ color: 'hsl(var(--cyber-teal))' }}>
                  {tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length}
                </p>
              </div>
              <div className="w-16 h-16 rounded-full flex items-center justify-center" 
                   style={{ background: 'hsl(var(--cyber-teal) / 0.2)' }}>
                <svg className="w-8 h-8" fill="none" stroke="hsl(var(--cyber-teal))" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-6 cyber-hover animate-slide-up delay-100" 
               style={{ border: '1px solid hsl(var(--cyber-purple) / 0.3)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Documents
                </p>
                <p className="text-4xl font-bold mt-2 glow-text-purple" style={{ color: 'hsl(var(--cyber-purple))' }}>
                  {documents.length}
                </p>
              </div>
              <div className="w-16 h-16 rounded-full flex items-center justify-center" 
                   style={{ background: 'hsl(var(--cyber-purple) / 0.2)' }}>
                <svg className="w-8 h-8" fill="none" stroke="hsl(var(--cyber-purple))" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-6 cyber-hover animate-slide-up delay-200" 
               style={{ border: '1px solid hsl(var(--cyber-pink) / 0.3)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Compliance
                </p>
                <p className="text-4xl font-bold mt-2 glow-text-pink" style={{ color: 'hsl(var(--cyber-pink))' }}>
                  100%
                </p>
              </div>
              <div className="w-16 h-16 rounded-full flex items-center justify-center" 
                   style={{ background: 'hsl(var(--cyber-pink) / 0.2)' }}>
                <svg className="w-8 h-8" fill="none" stroke="hsl(var(--cyber-pink))" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6" style={{ borderBottom: '1px solid hsl(var(--cyber-teal) / 0.3)' }}>
          <div className="flex space-x-8">
            {['overview', 'tickets', 'documents'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className="pb-4 px-2 font-shoulders uppercase tracking-wider transition-all"
                style={{
                  color: activeTab === tab ? 'hsl(var(--cyber-teal))' : 'hsl(var(--muted-foreground))',
                  borderBottom: activeTab === tab ? '2px solid hsl(var(--cyber-teal))' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab) {
                    e.currentTarget.style.color = 'hsl(var(--cyber-teal))'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab) {
                    e.currentTarget.style.color = 'hsl(var(--muted-foreground))'
                  }
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Tickets */}
            <div className="bg-cyber-dark/60 border border-cyber-teal/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-shoulders neon-text-teal">RECENT TICKETS</h3>
                <Link href="#" className="text-sm text-cyber-teal hover:text-cyber-purple transition-colors">
                  View All →
                </Link>
              </div>
              <div className="space-y-3">
                {tickets.slice(0, 3).map((ticket) => (
                  <div key={ticket.id} className="bg-cyber-gray/50 rounded-lg p-4 hover:bg-cyber-gray/70 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-white mb-1">{ticket.subject}</p>
                        <div className="flex items-center space-x-3 text-xs">
                          <span className={`${getStatusColor(ticket.status)} uppercase`}>{ticket.status}</span>
                          <span className="text-gray-500">•</span>
                          <span className={`${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {tickets.length === 0 && (
                  <p className="text-gray-400 text-center py-8">No tickets yet</p>
                )}
              </div>
            </div>

            {/* Recent Documents */}
            <div className="bg-cyber-dark/60 border border-cyber-purple/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-shoulders neon-text-purple">RECENT DOCUMENTS</h3>
                <Link href="#" className="text-sm text-cyber-purple hover:text-cyber-pink transition-colors">
                  View All →
                </Link>
              </div>
              <div className="space-y-3">
                {documents.slice(0, 3).map((doc) => (
                  <div key={doc.id} className="bg-cyber-gray/50 rounded-lg p-4 hover:bg-cyber-gray/70 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-cyber-purple/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-cyber-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white text-sm">{doc.file_name}</p>
                        <p className="text-xs text-gray-400">{doc.file_type.toUpperCase()}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {documents.length === 0 && (
                  <p className="text-gray-400 text-center py-8">No documents yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="bg-cyber-dark/60 border border-cyber-teal/30 rounded-xl p-6">
            <h3 className="text-xl font-shoulders neon-text-teal mb-4">ALL SUPPORT TICKETS</h3>
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="bg-cyber-gray/50 rounded-lg p-4 hover:bg-cyber-gray/70 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-white mb-2">{ticket.subject}</p>
                      <div className="flex items-center space-x-4 text-xs">
                        <span className={`${getStatusColor(ticket.status)} uppercase font-medium`}>{ticket.status}</span>
                        <span className="text-gray-500">•</span>
                        <span className={`${getPriorityColor(ticket.priority)}`}>{ticket.priority} Priority</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400">{new Date(ticket.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button className="text-cyber-teal hover:text-cyber-purple transition-colors">
                      View →
                    </button>
                  </div>
                </div>
              ))}
              {tickets.length === 0 && (
                <p className="text-gray-400 text-center py-12">No tickets found</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-cyber-dark/60 border border-cyber-purple/30 rounded-xl p-6">
            <h3 className="text-xl font-shoulders neon-text-purple mb-4">ALL DOCUMENTS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <div key={doc.id} className="bg-cyber-gray/50 rounded-lg p-4 hover:bg-cyber-gray/70 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-cyber-purple/20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-cyber-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white text-sm truncate">{doc.file_name}</p>
                      <p className="text-xs text-gray-400">{doc.file_type.toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                    <button className="text-cyber-purple hover:text-cyber-pink transition-colors">
                      Download
                    </button>
                  </div>
                </div>
              ))}
              {documents.length === 0 && (
                <div className="col-span-full text-gray-400 text-center py-12">
                  No documents found
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
