import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Shield, 
  Fuel, 
  AlertTriangle, 
  UserCheck,
  HelpCircle,
  Menu,
  X,
  Home,
  ChevronRight
} from 'lucide-react'

const AdminLayout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Clients', path: '/admin/clients', icon: Users },
    { name: 'ELD Reports', path: '/admin/eld-reports', icon: FileText },
    { name: 'CSA Scores', path: '/admin/csa-scores', icon: Shield },
    { name: 'IFTA Tracking', path: '/admin/ifta', icon: Fuel },
    { name: 'DataQ Disputes', path: '/admin/dataq', icon: AlertTriangle },
    { name: 'Driver Files', path: '/admin/driver-files', icon: UserCheck },
    { name: 'Support Tickets', path: '/admin/tickets', icon: HelpCircle },
  ]

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
            <Link to="/admin" className="flex items-center gap-3">
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
                const isActive = location.pathname === item.path
                const Icon = item.icon
                
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
                      {isActive && <ChevronRight size={14} className="ml-auto" />}
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
              <span className="text-xs bg-fuchsia-500/20 text-fuchsia-400 px-2 py-1 rounded font-rajdhani">
                ADMIN MODE
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
