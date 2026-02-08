import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import AdminLayout from './AdminLayout'
import { Shield, Plus, X, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'

const AdminCSAScores = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [reports, setReports] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(searchParams.get('new') === 'true')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const [formData, setFormData] = useState({
    client_id: '',
    report_date: new Date().toISOString().split('T')[0],
    unsafe_driving_score: '',
    hos_compliance_score: '',
    vehicle_maintenance_score: '',
    controlled_substances_score: '',
    hazmat_score: '',
    driver_fitness_score: '',
    crash_indicator_score: '',
    overall_status: 'Good Standing',
    recommendations: ''
  })

  useEffect(() => {
    fetchData()
    if (searchParams.get('new') === 'true') {
      setShowModal(true)
      setSearchParams({})
    }
  }, [])

  const fetchData = async () => {
    try {
      const { data: reportsData } = await supabase
        .from('csa_score_reports')
        .select('*, clients (company_name)')
        .order('report_date', { ascending: false })

      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, company_name')
        .eq('service_tier', 'Apex Command')
        .eq('status', 'Active')
        .order('company_name')

      setReports(reportsData || [])
      setClients(clientsData || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { error } = await supabase.from('csa_score_reports').insert([{
        client_id: formData.client_id,
        report_date: formData.report_date,
        unsafe_driving_score: formData.unsafe_driving_score || null,
        hos_compliance_score: formData.hos_compliance_score || null,
        vehicle_maintenance_score: formData.vehicle_maintenance_score || null,
        controlled_substances_score: formData.controlled_substances_score || null,
        hazmat_score: formData.hazmat_score || null,
        driver_fitness_score: formData.driver_fitness_score || null,
        crash_indicator_score: formData.crash_indicator_score || null,
        overall_status: formData.overall_status,
        recommendations: formData.recommendations || null
      }])
      if (error) throw error
      setMessage({ type: 'success', text: 'CSA Report added!' })
      fetchData()
      setTimeout(() => { setShowModal(false); setMessage({ type: '', text: '' }) }, 1500)
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this CSA report?')) return
    await supabase.from('csa_score_reports').delete().eq('id', id)
    fetchData()
  }

  const statusBadge = {
    'Good Standing': 'bg-green-500/20 text-green-400',
    'Alert': 'bg-yellow-500/20 text-yellow-400',
    'Critical': 'bg-red-500/20 text-red-400'
  }

  if (loading) return <AdminLayout><div className="flex items-center justify-center h-64"><div className="animate-pulse text-fuchsia-400 font-orbitron">Loading...</div></div></AdminLayout>

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-orbitron font-bold text-2xl text-white flex items-center gap-3">
              <Shield className="text-purple-400" /> CSA Score Reports
            </h1>
            <p className="text-gray-400 font-rajdhani">Apex Command clients only</p>
          </div>
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-rajdhani font-semibold px-4 py-2 rounded-lg">
            <Plus size={20} /> Add Report
          </button>
        </div>

        {reports.length > 0 ? (
          <div className="bg-[#0d0d14] border border-purple-500/20 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-purple-500/20">
                  <th className="text-left p-4 text-purple-400 font-rajdhani">Client</th>
                  <th className="text-left p-4 text-purple-400 font-rajdhani">Date</th>
                  <th className="text-left p-4 text-purple-400 font-rajdhani">Status</th>
                  <th className="text-left p-4 text-purple-400 font-rajdhani">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} className="border-b border-purple-500/10 hover:bg-purple-500/5">
                    <td className="p-4 text-white font-rajdhani">{r.clients?.company_name}</td>
                    <td className="p-4 text-gray-300 font-rajdhani">{new Date(r.report_date).toLocaleDateString()}</td>
                    <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-semibold ${statusBadge[r.overall_status]}`}>{r.overall_status}</span></td>
                    <td className="p-4"><button onClick={() => handleDelete(r.id)} className="p-2 text-gray-400 hover:text-red-400"><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-[#0d0d14] border border-purple-500/20 rounded-xl p-12 text-center">
            <Shield className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-500 font-rajdhani">No CSA reports yet</p>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0d0d14] border border-purple-500/30 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-purple-500/20">
                <h2 className="font-orbitron font-semibold text-white">Add CSA Report</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {message.text && <div className={`p-3 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{message.text}</div>}
                
                <div>
                  <label className="block text-gray-400 font-rajdhani text-sm mb-1">Client (Apex Command only) *</label>
                  <select name="client_id" required value={formData.client_id} onChange={(e) => setFormData({...formData, client_id: e.target.value})} className="w-full bg-[#0a0a0f] border border-purple-500/30 rounded-lg py-2 px-3 text-white font-rajdhani">
                    <option value="">Select client...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 font-rajdhani text-sm mb-1">Report Date *</label>
                    <input type="date" required value={formData.report_date} onChange={(e) => setFormData({...formData, report_date: e.target.value})} className="w-full bg-[#0a0a0f] border border-purple-500/30 rounded-lg py-2 px-3 text-white font-rajdhani" />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-rajdhani text-sm mb-1">Overall Status *</label>
                    <select value={formData.overall_status} onChange={(e) => setFormData({...formData, overall_status: e.target.value})} className="w-full bg-[#0a0a0f] border border-purple-500/30 rounded-lg py-2 px-3 text-white font-rajdhani">
                      <option value="Good Standing">Good Standing</option>
                      <option value="Alert">Alert</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <p className="text-gray-500 font-rajdhani text-sm">BASIC Scores (0-100, leave blank if N/A):</p>
                <div className="grid grid-cols-2 gap-3">
                  {['unsafe_driving_score', 'hos_compliance_score', 'vehicle_maintenance_score', 'controlled_substances_score', 'hazmat_score', 'driver_fitness_score', 'crash_indicator_score'].map(field => (
                    <div key={field}>
                      <label className="block text-gray-400 font-rajdhani text-xs mb-1">{field.replace(/_/g, ' ').replace('score', '').trim()}</label>
                      <input type="number" min="0" max="100" step="0.1" value={formData[field]} onChange={(e) => setFormData({...formData, [field]: e.target.value})} className="w-full bg-[#0a0a0f] border border-purple-500/30 rounded-lg py-1.5 px-2 text-white font-rajdhani text-sm" />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-gray-400 font-rajdhani text-sm mb-1">Recommendations</label>
                  <textarea rows={2} value={formData.recommendations} onChange={(e) => setFormData({...formData, recommendations: e.target.value})} className="w-full bg-[#0a0a0f] border border-purple-500/30 rounded-lg py-2 px-3 text-white font-rajdhani resize-none" />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-500/20 text-gray-400 font-rajdhani py-2.5 rounded-lg">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-rajdhani py-2.5 rounded-lg disabled:opacity-50">{submitting ? 'Adding...' : 'Add Report'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminCSAScores
