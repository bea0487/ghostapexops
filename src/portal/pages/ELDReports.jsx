import React from 'react'
import { Download, FileText, Calendar, TrendingUp } from 'lucide-react'
import PortalLayout from '../components/PortalLayout'
import { useAuth } from '../context/AuthContext'
import Button from '../../components/Button'
import { supabase } from '../../lib/supabaseClient'

export default function ELDReports() {
  const { client } = useAuth()
  const [reports, setReports] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  async function loadReports() {
    if (!client?.id) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('eld_reports')
        .select('*')
        .eq('client_id', client.id)
        .order('report_date', { ascending: false })

      if (error) throw error
      setReports(data || [])
    } catch (e) {
      console.error('Failed to load ELD reports:', e)
      setError('Failed to load ELD reports')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadReports()
  }, [client?.id])

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  function getStatusColor(status) {
    switch (status) {
      case 'compliant':
        return 'text-green-400 bg-green-500/10 border-green-500/30'
      case 'warning':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
      case 'violation':
        return 'text-red-400 bg-red-500/10 border-red-500/30'
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30'
    }
  }

  async function downloadReport(reportId, filename) {
    try {
      // In a real implementation, this would download the actual file
      // For now, we'll show a placeholder
      alert(`Download functionality for ${filename} will be implemented when file storage is set up.`)
    } catch (e) {
      console.error('Download failed:', e)
    }
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-orbitron font-bold text-2xl text-white">ELD Reports</h1>
          <p className="text-gray-400 font-rajdhani mt-1">Electronic Logging Device compliance reports</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 font-rajdhani text-sm">{error}</p>
          </div>
        )}

        <div className="bg-[#0d0d14] border border-cyan-500/20 rounded-xl p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-400 font-rajdhani">Loading ELD reports...</div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={48} className="mx-auto text-gray-500 mb-4" />
              <h3 className="font-orbitron text-white mb-2">No ELD Reports</h3>
              <p className="text-gray-400 font-rajdhani">Your ELD reports will appear here once they're generated.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp size={20} className="text-green-400" />
                    <span className="text-xs text-green-400 font-rajdhani">COMPLIANT</span>
                  </div>
                  <p className="text-2xl font-orbitron font-bold text-white">
                    {reports.filter(r => r.status === 'compliant').length}
                  </p>
                  <p className="text-gray-400 font-rajdhani text-sm">Clean Reports</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Calendar size={20} className="text-yellow-400" />
                    <span className="text-xs text-yellow-400 font-rajdhani">WARNINGS</span>
                  </div>
                  <p className="text-2xl font-orbitron font-bold text-white">
                    {reports.filter(r => r.status === 'warning').length}
                  </p>
                  <p className="text-gray-400 font-rajdhani text-sm">Need Attention</p>
                </div>

                <div className="bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <FileText size={20} className="text-red-400" />
                    <span className="text-xs text-red-400 font-rajdhani">VIOLATIONS</span>
                  </div>
                  <p className="text-2xl font-orbitron font-bold text-white">
                    {reports.filter(r => r.status === 'violation').length}
                  </p>
                  <p className="text-gray-400 font-rajdhani text-sm">Critical Issues</p>
                </div>
              </div>

              <div className="space-y-3">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="border border-white/10 rounded-lg p-4 hover:border-cyan-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-orbitron text-white font-semibold">
                            ELD Report - {formatDate(report.report_date)}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-rajdhani border ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </div>
                        
                        {report.summary && (
                          <p className="text-gray-400 font-rajdhani text-sm mb-2">
                            {report.summary}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500 font-rajdhani">
                          <span>Period: {formatDate(report.period_start)} - {formatDate(report.period_end)}</span>
                          <span>Generated: {formatDate(report.created_at)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => downloadReport(report.id, `eld-report-${report.report_date}.pdf`)}
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
