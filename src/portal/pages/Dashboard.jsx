import React from 'react'
import { Link } from 'react-router-dom'
import { FileText, HelpCircle, TrendingUp, Shield, AlertTriangle, UserCheck, Fuel } from 'lucide-react'
import PortalLayout from '../components/PortalLayout'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'

export default function Dashboard() {
  const { client, user, isGuardian, isApexCommand, refreshClientProfile } = useAuth()
  const [loading, setLoading] = React.useState(true)
  const [stats, setStats] = React.useState({
    eldReports: 0,
    csaScores: 0,
    iftaReports: 0,
    dataqDisputes: 0,
    driverFiles: 0,
    supportTickets: 0
  })

  React.useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const clientUuid = client?.id

        if (clientUuid) {
          // Fetch all stats in parallel
          const [eld, csa, ifta, dataq, drivers, tickets] = await Promise.all([
            supabase.from('eld_log_reports').select('*', { count: 'exact', head: true }).eq('client_id', clientUuid),
            supabase.from('csa_scores').select('*', { count: 'exact', head: true }).eq('client_id', clientUuid),
            supabase.from('ifta_reports').select('*', { count: 'exact', head: true }).eq('client_id', clientUuid),
            supabase.from('dataq_disputes').select('*', { count: 'exact', head: true }).eq('client_id', clientUuid),
            supabase.from('driver_qualification_files').select('*', { count: 'exact', head: true }).eq('client_id', clientUuid),
            supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('client_id', clientUuid).in('status', ['Open', 'In Progress'])
          ])

          if (!mounted) return
          setStats({
            eldReports: eld.count || 0,
            csaScores: csa.count || 0,
            iftaReports: ifta.count || 0,
            dataqDisputes: dataq.count || 0,
            driverFiles: drivers.count || 0,
            supportTickets: tickets.count || 0
          })
        }
      } catch (_e) {
        console.error('Error loading dashboard stats:', _e)
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [client?.id])

  const needsRefresh = user && !client

  const cards = [
    {
      label: 'ELD Reports',
      value: stats.eldReports,
      icon: FileText,
      color: 'cyan',
      link: '/app/eld-reports',
      visible: true,
    },
    {
      label: 'CSA Scores',
      value: stats.csaScores,
      icon: Shield,
      color: 'purple',
      link: '/app/csa-scores',
      visible: isApexCommand,
    },
    {
      label: 'IFTA Tracking',
      value: stats.iftaReports,
      icon: Fuel,
      color: 'green',
      link: '/app/ifta',
      visible: isGuardian || isApexCommand,
    },
    {
      label: 'DataQ Disputes',
      value: stats.dataqDisputes,
      icon: AlertTriangle,
      color: 'orange',
      link: '/app/dataq',
      visible: isApexCommand,
    },
    {
      label: 'Driver Files',
      value: stats.driverFiles,
      icon: UserCheck,
      color: 'blue',
      link: '/app/driver-files',
      visible: isGuardian || isApexCommand,
    },
    {
      label: 'Support Tickets',
      value: stats.supportTickets,
      icon: HelpCircle,
      color: 'fuchsia',
      link: '/app/support',
      visible: true,
    },
  ]

  const colorClasses = {
    cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400',
    green: 'from-green-500/20 to-green-500/5 border-green-500/30 text-green-400',
    fuchsia: 'from-fuchsia-500/20 to-fuchsia-500/5 border-fuchsia-500/30 text-fuchsia-400',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400',
    orange: 'from-orange-500/20 to-orange-500/5 border-orange-500/30 text-orange-400',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400',
  }

  return (
    <PortalLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-orbitron font-bold text-2xl text-white mb-2">Dashboard</h1>
          <p className="text-gray-400 font-rajdhani">Welcome back. Here's your compliance overview.</p>

          {needsRefresh ? (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center justify-between">
              <p className="text-yellow-400 font-rajdhani text-sm">Client profile not found yet. Click refresh to reload.</p>
              <button
                onClick={refreshClientProfile}
                className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30 font-rajdhani text-sm"
                type="button"
              >
                Refresh
              </button>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards
            .filter((c) => c.visible)
            .map((card) => {
              const Icon = card.icon
              return (
                <Link
                  key={card.label}
                  to={card.link}
                  className={`bg-gradient-to-br ${colorClasses[card.color]} border rounded-xl p-6 hover:scale-[1.02] transition-transform duration-200`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Icon size={24} />
                    <TrendingUp size={16} className="opacity-50" />
                  </div>
                  <p className="text-3xl font-orbitron font-bold text-white mb-1">{loading ? '—' : card.value}</p>
                  <p className="text-gray-400 font-rajdhani">{card.label}</p>
                </Link>
              )
            })}
        </div>

        {client && (
          <div className="bg-[#0d0d14] border border-cyan-500/20 rounded-xl p-6">
            <h2 className="font-orbitron font-semibold text-white mb-2">Your Service Tier</h2>
            <p className="text-gray-400 font-rajdhani mb-4">
              You're currently on the <span className="text-cyan-400 font-semibold">{client.tier}</span> plan.
            </p>
            <Link
              to="/app/settings"
              className="inline-block px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 font-rajdhani transition-colors"
            >
              Manage Subscription
            </Link>
          </div>
        )}
      </div>
    </PortalLayout>
  )
}
