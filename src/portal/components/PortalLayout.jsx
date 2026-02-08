import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Shield,
  Fuel,
  AlertTriangle,
  Users,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Settings,
  Key,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { signOutAndRedirect } from '../../lib/signOutUtils'

export default function PortalLayout({ children }) {
  const { client, signOut, isAdmin } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  const navItems = [
    { name: 'Dashboard', path: '/app', icon: LayoutDashboard, tiers: ['wingman', 'guardian', 'apex_command'] },
    { name: 'ELD Reports', path: '/app/eld-reports', icon: FileText, tiers: ['wingman', 'guardian', 'apex_command'] },
    { name: 'CSA Scores', path: '/app/csa-scores', icon: Shield, tiers: ['apex_command'] },
    { name: 'IFTA Tracking', path: '/app/ifta', icon: Fuel, tiers: ['guardian', 'apex_command'] },
    { name: 'DataQ Disputes', path: '/app/dataq', icon: AlertTriangle, tiers: ['apex_command'] },
    { name: 'Driver Files', path: '/app/driver-files', icon: Users, tiers: ['guardian', 'apex_command'] },
    { name: 'Support', path: '/app/support', icon: HelpCircle, tiers: ['wingman', 'guardian', 'apex_command'] },
  ]

  const tier = client?.tier
  const accessibleNavItems = navItems.filter((item) => item.tiers.includes(tier))

  const tierBadgeColor = {
    wingman: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50',
    guardian: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    apex_command: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/50',
  }

  async function handleSignOut() {
    try {
      console.log('Portal sign out initiated...')
      setSidebarOpen(false)
      
      // Use the comprehensive sign out utility
      await signOutAndRedirect()
      
    } catch (e) {
      console.error('Sign out error:', e)
      // Fallback: force redirect even if sign out fails
      window.location.href = `/login?_cb=${Date.now()}`
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {sidebarOpen ? (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      ) : null}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#0d0d14] border-r border-cyan-500/20
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-cyan-500/20">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center">
                <span className="font-orbitron font-bold text-black">GR</span>
              </div>
              <div>
                <h1 className="font-orbitron font-bold text-white text-sm">GHOST RIDER</h1>
                <p className="text-cyan-400 text-xs">Client Portal</p>
              </div>
            </Link>

            <button
              className="absolute top-4 right-4 lg:hidden text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
              type="button"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-4 border-b border-cyan-500/20">
            <p className="text-white font-rajdhani font-semibold truncate">{client?.company_name || 'Client Portal'}</p>
            <span
              className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full border ${tierBadgeColor[tier] || 'bg-gray-500/20 text-gray-400 border-white/10'}`}
            >
              {tier ? (tier === 'apex_command' ? 'Apex Command' : tier === 'guardian' ? 'Guardian' : 'Wingman') : 'No Tier'}
            </span>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {accessibleNavItems.map((item) => {
                const isActive = location.pathname === item.path
                const Icon = item.icon

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg font-rajdhani font-medium
                        transition-all duration-200
                        ${isActive ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                      `}
                    >
                      <Icon size={20} />
                      <span>{item.name}</span>
                      {isActive ? <ChevronRight size={16} className="ml-auto" /> : null}
                    </Link>
                  </li>
                )
              })}
            </ul>

            {isAdmin ? (
              <div className="mt-6 pt-4 border-t border-fuchsia-500/30">
                <p className="text-xs text-fuchsia-400 font-rajdhani uppercase tracking-wider mb-2 px-4">Admin</p>
                <Link
                  to="/admin"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-rajdhani font-medium bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30 hover:bg-fuchsia-500/20 transition-all duration-200"
                >
                  <Settings size={20} />
                  <span>Admin Panel</span>
                  <ChevronRight size={16} className="ml-auto" />
                </Link>
              </div>
            ) : null}
          </nav>

          <div className="p-4 border-t border-cyan-500/20">
            <Link
              to="/app/settings"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-rajdhani font-medium mb-2 transition-all duration-200 ${
                location.pathname === '/app/settings'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Key size={20} />
              <span>Change Password</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg font-rajdhani font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
              type="button"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-[#0a0a0f]/95 backdrop-blur-sm border-b border-cyan-500/20 px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(true)} type="button">
              <Menu size={24} />
            </button>

            <div className="ml-auto text-right">
              <p className="text-sm text-gray-400 font-rajdhani">Welcome back,</p>
              <p className="text-white font-rajdhani font-semibold">{client?.company_name || 'Client'}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>

        <footer className="border-t border-cyan-500/20 px-4 py-4 lg:px-8">
          <p className="text-center text-gray-500 text-sm font-rajdhani">
            © 2026 Ghost Rider: Apex Operations •
            <a href="mailto:ghostrider.apexops@zohomail.com" className="text-cyan-400 hover:text-cyan-300 ml-1">
              Support
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}
