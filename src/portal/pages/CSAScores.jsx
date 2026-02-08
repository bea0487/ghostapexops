import React from 'react'
import { Shield, TrendingUp, AlertTriangle, CheckCircle, Download } from 'lucide-react'
import PortalLayout from '../components/PortalLayout'
import { useAuth } from '../context/AuthContext'
import Button from '../../components/Button'
import { supabase } from '../../lib/supabaseClient'

export default function CSAScores() {
  const { client, hasCSAAccess } = useAuth()
  const [scores, setScores] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  async function loadCSAScores() {
    if (!client?.id || !hasCSAAccess()) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('csa_scores')
        .select('*')
        .eq('client_id', client.id)
        .order('score_date', { ascending: false })

      if (error) throw error
      setScores(data || [])
    } catch (e) {
      console.error('Failed to load CSA scores:', e)
      setError('Failed to load CSA scores')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadCSAScores()
  }, [client?.id])

  function getScoreColor(score) {
    if (score >= 80) return 'text-red-400 bg-red-500/10 border-red-500/30'
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
    return 'text-green-400 bg-green-500/10 border-green-500/30'
  }

  function getScoreStatus(score) {
    if (score >= 80) return 'High Risk'
    if (score >= 60) return 'Moderate Risk'
    return 'Low Risk'
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!hasCSAAccess()) {
    return (
      <PortalLayout>
        <div className="space-y-6">
          <div>
            <h1 className="font-orbitron font-bold text-2xl text-white">CSA Scores</h1>
            <p className="text-gray-400 font-rajdhani mt-1">Compliance, Safety, Accountability monitoring</p>
          </div>
          
          <div className="bg-[#0d0d14] border border-yellow-500/20 rounded-xl p-6 text-center">
            <Shield size={48} className="mx-auto text-yellow-400 mb-4" />
            <h3 className="font-orbitron text-white mb-2">Upgrade Required</h3>
            <p className="text-gray-400 font-rajdhani">
              CSA Score monitoring is available for Apex Command, Back Office Command, and A La Carte tiers.
            </p>
          </div>
        </div>
      </PortalLayout>
    )
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-orbitron font-bold text-2xl text-white">CSA Scores</h1>
          <p className="text-gray-400 font-rajdhani mt-1">Monitor your Compliance, Safety, Accountability scores</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 font-rajdhani text-sm">{error}</p>
          </div>
        )}

        <div className="bg-[#0d0d14] border border-cyan-500/20 rounded-xl p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-400 font-rajdhani">Loading CSA scores...</div>
            </div>
          ) : scores.length === 0 ? (
            <div className="text-center py-8">
              <Shield size={48} className="mx-auto text-gray-500 mb-4" />
              <h3 className="font-orbitron text-white mb-2">No CSA Scores</h3>
              <p className="text-gray-400 font-rajdhani">Your CSA scores will appear here once they're available.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Current Score Summary */}
              {scores[0] && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className={`rounded-xl p-4 border ${getScoreColor(scores[0].unsafe_driving || 0)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <AlertTriangle size={20} />
                      <span className="text-xs font-rajdhani">UNSAFE DRIVING</span>
                    </div>
                    <p className="text-2xl font-orbitron font-bold text-white">{scores[0].unsafe_driving || 0}%</p>
                    <p className="text-gray-400 font-rajdhani text-sm">{getScoreStatus(scores[0].unsafe_driving || 0)}</p>
                  </div>

                  <div className={`rounded-xl p-4 border ${getScoreColor(scores[0].fatigued_driving || 0)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <Shield size={20} />
                      <span className="text-xs font-rajdhani">FATIGUED DRIVING</span>
                    </div>
                    <p className="text-2xl font-orbitron font-bold text-white">{scores[0].fatigued_driving || 0}%</p>
                    <p className="text-gray-400 font-rajdhani text-sm">{getScoreStatus(scores[0].fatigued_driving || 0)}</p>
                  </div>

                  <div className={`rounded-xl p-4 border ${getScoreColor(scores[0].driver_fitness || 0)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <CheckCircle size={20} />
                      <span className="text-xs font-rajdhani">DRIVER FITNESS</span>
                    </div>
                    <p className="text-2xl font-orbitron font-bold text-white">{scores[0].driver_fitness || 0}%</p>
                    <p className="text-gray-400 font-rajdhani text-sm">{getScoreStatus(scores[0].driver_fitness || 0)}</p>
                  </div>

                  <div className={`rounded-xl p-4 border ${getScoreColor(scores[0].vehicle_maintenance || 0)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp size={20} />
                      <span className="text-xs font-rajdhani">VEHICLE MAINT</span>
                    </div>
                    <p className="text-2xl font-orbitron font-bold text-white">{scores[0].vehicle_maintenance || 0}%</p>
                    <p className="text-gray-400 font-rajdhani text-sm">{getScoreStatus(scores[0].vehicle_maintenance || 0)}</p>
                  </div>
                </div>
              )}

              {/* Historical Scores */}
              <div className="space-y-3">
                <h3 className="font-orbitron text-white font-semibold">Score History</h3>
                {scores.map((score) => (
                  <div
                    key={score.id}
                    className="border border-white/10 rounded-lg p-4 hover:border-cyan-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-orbitron text-white font-semibold">
                            CSA Score Report - {formatDate(score.score_date)}
                          </h4>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400 font-rajdhani">Unsafe Driving:</span>
                            <span className="text-white ml-2">{score.unsafe_driving || 0}%</span>
                          </div>
                          <div>
                            <span className="text-gray-400 font-rajdhani">Fatigued Driving:</span>
                            <span className="text-white ml-2">{score.fatigued_driving || 0}%</span>
                          </div>
                          <div>
                            <span className="text-gray-400 font-rajdhani">Driver Fitness:</span>
                            <span className="text-white ml-2">{score.driver_fitness || 0}%</span>
                          </div>
                          <div>
                            <span className="text-gray-400 font-rajdhani">Vehicle Maint:</span>
                            <span className="text-white ml-2">{score.vehicle_maintenance || 0}%</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500 font-rajdhani mt-2">
                          <span>Generated: {formatDate(score.created_at)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => alert('Download functionality will be implemented when file storage is set up.')}
                          className="bg-cyan-600 hover:bg-cyan-500 text-sm px-3 py-2"
                        >
                          <Download size={14} className="mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  )
}
