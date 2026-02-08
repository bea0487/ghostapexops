import React from 'react'
import { Link } from 'react-router-dom'
import { FileText, HelpCircle, TrendingUp } from 'lucide-react'
import PortalLayout from '../components/PortalLayout'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'

export default function Dashboard() {
  const { client, user, isGuardian, isApexCommand, refreshClientProfile } = useAuth()
  const [loading, setLoading] = React.useState(true)
  const [stats, setStats] = React.useState({ eldReports: 0 })

  React.useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const clientUuid = client?.id

        // Error-free-first: only query tables we know exist.
        if (clientUuid) {
          const { count } = await supabase
            .from('eld_reports')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', clientUuid)

          if (!mounted) return
          setStats({ eldReports: count || 0 })
        }
      } catch (_e) {
        // swallow to avoid console noise
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
      label: 'IFTA Tracking',
      value: 0,
      icon: TrendingUp,
      color: 'green',
      link: '/app/ifta',
      visible: isGuardian || isApexCommand,
    },
    {
      label: 'Support',
      value: 0,
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

        <div className="bg-[#0d0d14] border border-cyan-500/20 rounded-xl p-6">
          <h2 className="font-orbitron font-semibold text-white mb-2">Next</h2>
          <p className="text-gray-400 font-rajdhani">
            We’ll wire the remaining portal pages (CSA/IFTA/DataQ/Driver Files/Support) to live data once the backend tables are ready.
          </p>
        </div>
      </div>
    </PortalLayout>
  )
}
