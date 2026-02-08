import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import AdminLayout from './AdminLayout'
import { AlertTriangle, Plus, X, Trash2 } from 'lucide-react'

const AdminDataQ = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [disputes, setDisputes] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(searchParams.get('new') === 'true')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const [formData, setFormData] = useState({
    client_id: '',
    inspection_report_number: '',
    inspection_date: '',
    violation_code: '',
    violation_description: '',
    dispute_reason: '',
    filed_date: '',
    status: 'Not Filed',
    resolution_date: '',
    resolution_notes: ''
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
      const { data: disputesData } = await supabase
        .from('dataq_disputes')
        .select('*, clients (company_name)')
        .order('created_at', { ascending: false })

      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, company_name')
        .eq('service_tier', 'Apex Command')
        .eq('status', 'Active')
        .order('company_name')

      setDisputes(disputesData || [])
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
      const { error } = await supabase.from('dataq_disputes').insert([{
        client_id: formData.client_id,
        inspection_report_number: formData.inspection_report_number || null,
        inspection_date: formData.inspection_date || null,
        violation_code: formData.violation_code || null,
        violation_description: formData.violation_description || null,
        dispute_reason: formData.dispute_reason || null,
        filed_date: formData.filed_date || null,
        status: formData.status,
        resolution_date: formData.resolution_date || null,
        resolution_notes: formData.resolution_notes || null
      }])
      if (error) throw error
      setMessage({ type: 'success', text: 'DataQ dispute added!' })
      fetchData()
      setTimeout(() => { setShowModal(false); setMessage({ type: '', text: '' }) }, 1500)
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this dispute?')) return
    await supabase.from('dataq_disputes').delete().eq('id', id)
    fetchData()
  }

  const statusBadge = {
    'Not Filed': 'bg-gray-500/20 text-gray-400',
    'Pending': 'bg-yellow-500/20 text-yellow-400',
    'Under Review': 'bg-blue-500/20 text-blue-400',
    'Won': 'bg-green-500/20 text-green-400',
    'Lost': 'bg-red-500/20 text-red-400'
  }

  if (loading) return <AdminLayout><div className="flex items-center justify-center h-64"><div className="animate-pulse text-fuchsia-400 font-orbitron">Loading...</div></div></AdminLayout>

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-orbitron font-bold text-2xl text-white flex items-center gap-3">
              <AlertTriangle className="text-orange-400" /> DataQ Disputes
            </h1>
            <p className="text-gray-400 font-rajdhani">Apex Command clients only</p>
          </div>
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-rajdhani font-semibold px-4 py-2 rounded-lg">
            <Plus size={20} /> Add Dispute
          </button>
        </div>

        {disputes.length > 0 ? (
          <div className="bg-[#0d0d14] border border-orange-500/20 rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-orange-500/20">
                  <th className="text-left p-4 text-orange-400 font-rajdhani">Client</th>
                  <th className="text-left p-4 text-orange-400 font-rajdhani">Report #</th>
                  <th className="text-left p-4 text-orange-400 font-rajdhani">Violation</th>
                  <th className="text-left p-4 text-orange-400 font-rajdhani">Status</th>
                  <th className="text-left p-4 text-orange-400 font-rajdhani">Actions</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((d) => (
                  <tr key={d.id} className="border-b border-orange-500/10 hover:bg-orange-500/5">
                    <td className="p-4 text-white font-rajdhani">{d.clients?.company_name}</td>
                    <td className="p-4 text-gray-300 font-rajdhani">{d.inspection_report_number || '-'}</td>
                    <td className="p-4 text-gray-300 font-rajdhani">{d.violation_code || '-'}</td>
                    <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-semibold ${statusBadge[d.status]}`}>{d.status}</span></td>
                    <td className="p-4"><button onClick={() => handleDelete(d.id)} className="p-2 text-gray-400 hover:text-red-400"><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-[#0d0d14] border border-orange-500/20 rounded-xl p-12 text-center">
            <AlertTriangle className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-500 font-rajdhani">No DataQ disputes yet</p>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0d0d14] border border-orange-500/30 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-orange-500/20">
                <h2 className="font-orbitron font-semibold text-white">Add DataQ Dispute</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {message.text && <div className={`p-3 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{message.text}</div>}
                
                <div>
                  <label className="block text-gray-400 font-rajdhani text-sm mb-1">Client *</label>
                  <select required value={formData.client_id} onChange={(e) => setFormData({...formData, client_id: e.target.value})} className="w-full bg-[#0a0a0f] border border-orange-500/30 rounded-lg py-2 px-3 text-white font-rajdhani">
                    <option value="">Select client...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 font-rajdhani text-sm mb-1">Inspection Report #</label>
                    <input type="text" value={formData.inspection_report_number} onChange={(e) => setFormData({...formData, inspection_report_number: e.target.value})} className="w-full bg-[#0a0a0f] border border-orange-500/30 rounded-lg py-2 px-3 text-white font-rajdhani" />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-rajdhani text-sm mb-1">Inspection Date</label>
                    <input type="date" value={formData.inspection_date} onChange={(e) => setFormData({...formData, inspection_date: e.target.value})} className="w-full bg-[#0a0a0f] border border-orange-500/30 rounded-lg py-2 px-3 text-white font-rajdhani" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 font-rajdhani text-sm mb-1">Violation Code</label>
                    <input type="text" value={formData.violation_code} onChange={(e) => setFormData({...formData, violation_code: e.target.value})} className="w-full bg-[#0a0a0f] border border-orange-500/30 rounded-lg py-2 px-3 text-white font-rajdhani" placeholder="e.g. 395.8" />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-rajdhani text-sm mb-1">Status</label>
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-[#0a0a0f] border border-orange-500/30 rounded-lg py-2 px-3 text-white font-rajdhani">
                      <option value="Not Filed">Not Filed</option>
                      <option value="Pending">Pending</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Won">Won</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 font-rajdhani text-sm mb-1">Violation Description</label>
                  <textarea rows={2} value={formData.violation_description} onChange={(e) => setFormData({...formData, violation_description: e.target.value})} className="w-full bg-[#0a0a0f] border border-orange-500/30 rounded-lg py-2 px-3 text-white font-rajdhani resize-none" />
                </div>

                <div>
                  <label className="block text-gray-400 font-rajdhani text-sm mb-1">Dispute Reason</label>
                  <textarea rows={2} value={formData.dispute_reason} onChange={(e) => setFormData({...formData, dispute_reason: e.target.value})} className="w-full bg-[#0a0a0f] border border-orange-500/30 rounded-lg py-2 px-3 text-white font-rajdhani resize-none" />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-500/20 text-gray-400 font-rajdhani py-2.5 rounded-lg">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-rajdhani py-2.5 rounded-lg disabled:opacity-50">{submitting ? 'Adding...' : 'Add Dispute'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminDataQ
