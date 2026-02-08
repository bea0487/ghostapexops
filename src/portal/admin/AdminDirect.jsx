import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Shield, 
  Fuel, 
  AlertTriangle, 
  UserCheck,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Home,
  ChevronRight,
  TrendingUp,
  Plus
} from 'lucide-react'

const AdminDirect = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState({
    totalClients: 0,
    wingmanClients: 0,
    guardianClients: 0,
    apexClients: 0,
    totalEldReports: 0,
    openTickets: 0
  })
  const [recentClients, setRecentClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const { data: clients } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

      const wingman = clients?.filter(c => c.service_tier === 'Wingman').length || 0
      const guardian = clients?.filter(c => c.service_tier === 'Guardian').length || 0
      const apex = clients?.filter(c => c.service_tier === 'Apex Command').length || 0

      const { count: eldCount } = await supabase
        .from('eld_log_reports')
        .select('*', { count: 'exact', head: true })

      const { count: ticketCount } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .in('status', ['Open', 'In Progress'])

      setStats({
        totalClients: clients?.length || 0,
        wingmanClients: wingman,
        guardianClients: guardian,
        apexClients: apex,
        totalEldReports: eldCount || 0,
        openTickets: ticketCount || 0
      })

      setRecentClients(clients?.slice(0, 5) || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin-direct', icon: LayoutDashboard },
    { name: 'Clients', path: '/admin/clients', icon: Users },
    { name: 'ELD Reports', path: '/admin/eld-reports', icon: FileText },
    { name: 'CSA Scores', path: '/admin/csa-scores', icon: Shield },
    { name: 'IFTA Tracking', path: '/admin/ifta', icon: Fuel },
    { name: 'DataQ Disputes', path: '/admin/dataq', icon: AlertTriangle },
    { name: 'Driver Files', path: '/admin/driver-files', icon: UserCheck },
    { name: 'Support Tickets', path: '/admin/tickets', icon: HelpCircle },
  ]

  const statCards = [
    { label: 'Total Clients', value: stats.totalClients, icon: Users, color: 'cyan' },
    { label: 'Wingman', value: stats.wingmanClients, icon: Users, color: 'blue' },
    { label: 'Guardian', value: stats.guardianClients, icon: Users, color: 'purple' },
    { label: 'Apex Command', value: stats.apexClients, icon: Users, color: 'fuchsia' },
    { label: 'ELD Reports', value: stats.totalEldReports, icon: FileText, color: 'green' },
    { label: 'Open Tickets', value: stats.openTickets, icon: HelpCircle, color: 'yellow' },
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

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0d0d14] border-r border-fuchsia-500/20
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-fuchsia-500/20">
            <Link to="/admin-direct" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center">
                <span className="font-orbitron font-bold text-white text-sm">GR</span>
              </div>
              <div>
                <h1 className="font-orbitron font-bold text-white text-sm">ADMIN PANEL</h1>
                <p className="text-fuchsia-400 text-xs">Ghost Rider Ops</p>
              </div>
            </Link>
            
            <button 
              className="absolute top-4 right-4 lg:hidden text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = item.path === '/admin-direct'
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg font-rajdhani text-sm font-medium
                        transition-all duration-200
                        ${isActive 
                          ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/50' 
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }
                      `}
                    >
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>

            {/* Quick Links */}
            <div className="mt-6 pt-4 border-t border-fuchsia-500/20">
              <p className="text-xs text-gray-500 font-rajdhani uppercase tracking-wider mb-2 px-3">Quick Links</p>
              <Link
                to="/"
                className="flex items-center gap-3 px-3 py-2 rounded-lg font-rajdhani text-sm text-gray-400 hover:bg-white/5 hover:text-white"
              >
                <Home size={18} />
                Main Website
              </Link>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[#0a0a0f]/95 backdrop-blur-sm border-b border-fuchsia-500/20 px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <button
              className="lg:hidden text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            
            <div className="ml-auto flex items-center gap-4">
              <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded font-rajdhani">
                DIRECT ACCESS
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-pulse text-fuchsia-400 font-orbitron">Loading dashboard...</div>
            </div>
          ) : (
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

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {statCards.map((card) => {
                  const Icon = card.icon
                  return (
                    <div 
                      key={card.label}
                      className={`bg-gradient-to-br ${colorClasses[card.color]} border rounded-xl p-4`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon size={20} />
                        <TrendingUp size={14} className="opacity-50" />
                      </div>
                      <p className="text-2xl font-orbitron font-bold text-white">{card.value}</p>
                      <p className="text-gray-400 font-rajdhani text-sm">{card.label}</p>
                    </div>
                  )
                })}
              </div>

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
          )}
        </main>
      </div>
    </div>
  )
}

export default AdminDirect
