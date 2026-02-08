import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import AdminLayout from './AdminLayout'
import { 
  Users, 
  FileText, 
  Shield, 
  Fuel, 
  AlertTriangle, 
  UserCheck,
  HelpCircle,
  TrendingUp,
  Plus,
  Clock
} from 'lucide-react'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    wingmanClients: 0,
    guardianClients: 0,
    apexClients: 0,
    totalEldReports: 0,
    openTickets: 0,
    expiringDocs: 0
  })
  const [recentClients, setRecentClients] = useState([])
  const [recentTickets, setRecentTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Get client counts by tier
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (clientsError) {
        console.error('Clients error:', clientsError)
        setError(`Failed to load clients: ${clientsError.message}`)
        setLoading(false)
        return
      }

      const wingman = clients?.filter(c => c.service_tier === 'Wingman').length || 0
      const guardian = clients?.filter(c => c.service_tier === 'Guardian').length || 0
      const apex = clients?.filter(c => c.service_tier === 'Apex Command').length || 0

      // Get ELD report count
      const { count: eldCount } = await supabase
        .from('eld_log_reports')
        .select('*', { count: 'exact', head: true })

      // Get open tickets
      const { count: ticketCount } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .in('status', ['Open', 'In Progress'])

      // Get expiring documents (within 30 days)
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      
      const { count: expiringCount } = await supabase
        .from('driver_files')
        .select('*', { count: 'exact', head: true })
        .or(`license_expiry.lte.${thirtyDaysFromNow.toISOString()},medical_expiry.lte.${thirtyDaysFromNow.toISOString()}`)

      // Get recent tickets
      const { data: tickets } = await supabase
        .from('support_tickets')
        .select(`
          *,
          clients (company_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      setStats({
        totalClients: clients?.length || 0,
        wingmanClients: wingman,
        guardianClients: guardian,
        apexClients: apex,
        totalEldReports: eldCount || 0,
        openTickets: ticketCount || 0,
        expiringDocs: expiringCount || 0
      })

      setRecentClients(clients?.slice(0, 5) || [])
      setRecentTickets(tickets || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { label: 'Total Clients', value: stats.totalClients, icon: Users, color: 'cyan', link: '/admin/clients' },
    { label: 'Wingman', value: stats.wingmanClients, icon: Users, color: 'blue', link: '/admin/clients' },
    { label: 'Guardian', value: stats.guardianClients, icon: Users, color: 'purple', link: '/admin/clients' },
    { label: 'Apex Command', value: stats.apexClients, icon: Users, color: 'fuchsia', link: '/admin/clients' },
    { label: 'ELD Reports', value: stats.totalEldReports, icon: FileText, color: 'green', link: '/admin/eld-reports' },
    { label: 'Open Tickets', value: stats.openTickets, icon: HelpCircle, color: 'yellow', link: '/admin/tickets' },
  ]

  const colorClasses = {
    cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400',
    fuchsia: 'from-fuchsia-500/20 to-fuchsia-500/5 border-fuchsia-500/30 text-fuchsia-400',
    green: 'from-green-500/20 to-green-500/5 border-green-500/30 text-green-400',
    yellow: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30 text-yellow-400',
  }

  const tierBadge = {
    'Wingman': 'bg-blue-500/20 text-blue-400',
    'Guardian': 'bg-purple-500/20 text-purple-400',
    'Apex Command': 'bg-fuchsia-500/20 text-fuchsia-400'
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-fuchsia-400 font-orbitron">Loading dashboard...</div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-red-400 font-orbitron">Error Loading Dashboard</div>
          <div className="text-gray-400 font-rajdhani text-center max-w-md">{error}</div>
          <p className="text-gray-500 text-sm">This is likely an RLS policy issue in Supabase. Check browser console for details.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-fuchsia-500/20 text-fuchsia-400 rounded-lg hover:bg-fuchsia-500/30"
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-orbitron font-bold text-2xl text-white">Admin Dashboard</h1>
            <p className="text-gray-400 font-rajdhani">Manage your clients and compliance data</p>
          </div>
          <Link
            to="/admin/clients?new=true"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-rajdhani font-semibold px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-fuchsia-500/30 transition-all"
          >
            <Plus size={20} />
            Add New Client
          </Link>
        </div>

        {/* Alert for expiring docs */}
        {stats.expiringDocs > 0 && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-center gap-4">
            <AlertTriangle className="text-orange-400 flex-shrink-0" size={24} />
            <div>
              <p className="text-orange-400 font-rajdhani font-semibold">Driver Documents Expiring</p>
              <p className="text-gray-400 font-rajdhani text-sm">
                {stats.expiringDocs} driver document(s) expiring within 30 days.{' '}
                <Link to="/admin/driver-files" className="text-orange-400 hover:text-orange-300 underline">
                  Review now
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon
            return (
              <Link 
                key={card.label}
                to={card.link}
                className={`bg-gradient-to-br ${colorClasses[card.color]} border rounded-xl p-4 hover:scale-[1.02] transition-transform duration-200`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon size={20} />
                  <TrendingUp size={14} className="opacity-50" />
                </div>
                <p className="text-2xl font-orbitron font-bold text-white">{card.value}</p>
                <p className="text-gray-400 font-rajdhani text-sm">{card.label}</p>
              </Link>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Clients */}
          <div className="bg-[#0d0d14] border border-fuchsia-500/20 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-orbitron font-semibold text-white flex items-center gap-2">
                <Users size={20} className="text-fuchsia-400" />
                Recent Clients
              </h2>
              <Link to="/admin/clients" className="text-fuchsia-400 hover:text-fuchsia-300 text-sm font-rajdhani">
                View All →
              </Link>
            </div>
            
            {recentClients.length > 0 ? (
              <div className="space-y-3">
                {recentClients.map((client) => (
                  <div 
                    key={client.id}
                    className="flex items-center justify-between p-3 bg-[#0a0a0f] rounded-lg border border-fuchsia-500/10"
                  >
                    <div>
                      <p className="text-white font-rajdhani font-medium">{client.company_name}</p>
                      <p className="text-gray-500 text-sm font-rajdhani">{client.email}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${tierBadge[client.service_tier]}`}>
                      {client.service_tier}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 font-rajdhani text-center py-8">No clients yet</p>
            )}
          </div>

          {/* Recent Tickets */}
          <div className="bg-[#0d0d14] border border-fuchsia-500/20 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-orbitron font-semibold text-white flex items-center gap-2">
                <HelpCircle size={20} className="text-fuchsia-400" />
                Recent Tickets
              </h2>
              <Link to="/admin/tickets" className="text-fuchsia-400 hover:text-fuchsia-300 text-sm font-rajdhani">
                View All →
              </Link>
            </div>
            
            {recentTickets.length > 0 ? (
              <div className="space-y-3">
                {recentTickets.map((ticket) => (
                  <div 
                    key={ticket.id}
                    className="flex items-center justify-between p-3 bg-[#0a0a0f] rounded-lg border border-fuchsia-500/10"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-rajdhani font-medium truncate">{ticket.subject}</p>
                      <p className="text-gray-500 text-sm font-rajdhani">{ticket.clients?.company_name}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ml-2 ${
                      ticket.status === 'Open' ? 'bg-cyan-500/20 text-cyan-400' :
                      ticket.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 font-rajdhani text-center py-8">No tickets yet</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#0d0d14] border border-fuchsia-500/20 rounded-xl p-5">
          <h2 className="font-orbitron font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link 
              to="/admin/clients?new=true"
              className="flex flex-col items-center gap-2 p-4 bg-[#0a0a0f] rounded-lg border border-fuchsia-500/10 hover:border-fuchsia-500/30 transition-colors"
            >
              <Users className="text-fuchsia-400" size={24} />
              <span className="text-white font-rajdhani text-sm text-center">Add Client</span>
            </Link>
            <Link 
              to="/admin/eld-reports?new=true"
              className="flex flex-col items-center gap-2 p-4 bg-[#0a0a0f] rounded-lg border border-fuchsia-500/10 hover:border-fuchsia-500/30 transition-colors"
            >
              <FileText className="text-cyan-400" size={24} />
              <span className="text-white font-rajdhani text-sm text-center">Add ELD Report</span>
            </Link>
            <Link 
              to="/admin/csa-scores?new=true"
              className="flex flex-col items-center gap-2 p-4 bg-[#0a0a0f] rounded-lg border border-fuchsia-500/10 hover:border-fuchsia-500/30 transition-colors"
            >
              <Shield className="text-purple-400" size={24} />
              <span className="text-white font-rajdhani text-sm text-center">Add CSA Report</span>
            </Link>
            <Link 
              to="/admin/driver-files?new=true"
              className="flex flex-col items-center gap-2 p-4 bg-[#0a0a0f] rounded-lg border border-fuchsia-500/10 hover:border-fuchsia-500/30 transition-colors"
            >
              <UserCheck className="text-green-400" size={24} />
              <span className="text-white font-rajdhani text-sm text-center">Add Driver</span>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
