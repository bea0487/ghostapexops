import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import AdminLayout from './AdminLayout'
import { Fuel, Plus, X, Trash2 } from 'lucide-react'

const AdminIFTA = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [records, setRecords] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(searchParams.get('new') === 'true')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const [formData, setFormData] = useState({
    client_id: '',
    quarter: 'Q1',
    year: new Date().getFullYear(),
    total_miles: '',
    total_gallons: '',
    fuel_tax_owed: '',
    fuel_tax_credit: '',
    filing_status: 'Not Filed',
    filing_date: '',
    notes: ''
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
      const { data: recordsData } = await supabase
        .from('ifta_tracking')
        .select('*, clients (company_name)')
        .order('year', { ascending: false })
        .order('quarter', { ascending: false })

      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, company_name, service_tier')
        .in('service_tier', ['Guardian', 'Apex Command'])
        .eq('status', 'Active')
        .order('company_name')

      setRecords(recordsData || [])
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
      const { error } = await supabase.from('ifta_tracking').insert([{
        client_id: formData.client_id,
        quarter: formData.quarter,
        year: parseInt(formData.year),
        total_miles: formData.total_miles || null,
        total_gallons: formData.total_gallons || null,
        fuel_tax_owed: formData.fuel_tax_owed || null,
        fuel_tax_credit: formData.fuel_tax_credit || null,
        filing_status: formData.filing_status,
        filing_date: formData.filing_date || null,
        notes: formData.notes || null
      }])
      if (error) throw error
      setMessage({ type: 'success', text: 'IFTA record added!' })
      fetchData()
      setTimeout(() => { setShowModal(false); setMessage({ type: '', text: '' }) }, 1500)
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this IFTA record?')) return
    await supabase.from('ifta_tracking').delete().eq('id', id)
    fetchData()
  }

  const statusBadge = {
    'Not Filed': 'bg-gray-500/20 text-gray-400',
    'Filed': 'bg-blue-500/20 text-blue-400',
    'Accepted': 'bg-green-500/20 text-green-400',
    'Amended': 'bg-yellow-500/20 text-yellow-400'
  }

  if (loading) return <AdminLayout><div className="flex items-center justify-center h-64"><div className="animate-pulse text-fuchsia-400 font-orbitron">Loading...</div></div></AdminLayout>

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-orbitron font-bold text-2xl text-white flex items-center gap-3">
              <Fuel className="text-green-400" /> IFTA Tracking
            </h1>
            <p className="text-gray-400 font-rajdhani">Guardian & Apex Command clients</p>
          </div>
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-rajdhani font-semibold px-4 py-2 rounded-lg">
            <Plus size={20} /> Add Record
          </button>
        </div>

        {records.length > 0 ? (
          <div className="bg-[#0d0d14] border border-green-500/20 rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-green-500/20">
                  <th className="text-left p-4 text-green-400 font-rajdhani">Client</th>
                  <th className="text-left p-4 text-green-400 font-rajdhani">Period</th>
                  <th className="text-left p-4 text-green-400 font-rajdhani">Miles</th>
                  <th className="text-left p-4 text-green-400 font-rajdhani">Net Tax</th>
                  <th className="text-left p-4 text-green-400 font-rajdhani">Status</th>
                  <th className="text-left p-4 text-green-400 font-rajdhani">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-green-500/10 hover:bg-green-500/5">
                    <td className="p-4 text-white font-rajdhani">{r.clients?.company_name}</td>
                    <td className="p-4 text-gray-300 font-rajdhani">{r.quarter} {r.year}</td>
                    <td className="p-4 text-gray-300 font-rajdhani">{r.total_miles?.toLocaleString() || '-'}</td>
                    <td className="p-4 text-gray-300 font-rajdhani">${r.net_tax?.toFixed(2) || '0.00'}</td>
                    <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-semibold ${statusBadge[r.filing_status]}`}>{r.filing_status}</span></td>
                    <td className="p-4"><button onClick={() => handleDelete(r.id)} className="p-2 text-gray-400 hover:text-red-400"><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-[#0d0d14] border border-green-500/20 rounded-xl p-12 text-center">
            <Fuel className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-500 font-rajdhani">No IFTA records yet</p>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0d0d14] border border-green-500/30 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-green-500/20">
                <h2 className="font-orbitron font-semibold text-white">Add IFTA Record</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {message.text && <div className={`p-3 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{message.text}</div>}
                
                <div>
                  <label className="block text-gray-400 font-rajdhani text-sm mb-1">Client *</label>
                  <select required value={formData.client_id} onChange={(e) => setFormData({...formData, client_id: e.target.value})} className="w-full bg-[#0a0a0f] border border-green-500/30 rounded-lg py-2 px-3 text-white font-rajdhani">
                    <option value="">Select client...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-400 font-rajdhani text-sm mb-1">Quarter *</label>
                    <select value={formData.quarter} onChange={(e) => setFormData({...formData, quarter: e.target.value})} className="w-full bg-[#0a0a0f] border border-green-500/30 rounded-lg py-2 px-3 text-white font-rajdhani">
                      <option value="Q1">Q1</option>
                      <option value="Q2">Q2</option>
                      <option value="Q3">Q3</option>
                      <option value="Q4">Q4</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 font-rajdhani text-sm mb-1">Year *</label>
                    <input type="number" required value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} className="w-full bg-[#0a0a0f] border border-green-500/30 rounded-lg py-2 px-3 text-white font-rajdhani" />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-rajdhani text-sm mb-1">Status</label>
                    <select value={formData.filing_status} onChange={(e) => setFormData({...formData, filing_status: e.target.value})} className="w-full bg-[#0a0a0f] border border-green-500/30 rounded-lg py-2 px-3 text-white font-rajdhani">
                      <option value="Not Filed">Not Filed</option>
                      <option value="Filed">Filed</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Amended">Amended</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 font-rajdhani text-sm mb-1">Total Miles</label>
                    <input type="number" value={formData.total_miles} onChange={(e) => setFormData({...formData, total_miles: e.target.value})} className="w-full bg-[#0a0a0f] border border-green-500/30 rounded-lg py-2 px-3 text-white font-rajdhani" />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-rajdhani text-sm mb-1">Total Gallons</label>
                    <input type="number" value={formData.total_gallons} onChange={(e) => setFormData({...formData, total_gallons: e.target.value})} className="w-full bg-[#0a0a0f] border border-green-500/30 rounded-lg py-2 px-3 text-white font-rajdhani" />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-rajdhani text-sm mb-1">Tax Owed ($)</label>
                    <input type="number" step="0.01" value={formData.fuel_tax_owed} onChange={(e) => setFormData({...formData, fuel_tax_owed: e.target.value})} className="w-full bg-[#0a0a0f] border border-green-500/30 rounded-lg py-2 px-3 text-white font-rajdhani" />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-rajdhani text-sm mb-1">Tax Credit ($)</label>
                    <input type="number" step="0.01" value={formData.fuel_tax_credit} onChange={(e) => setFormData({...formData, fuel_tax_credit: e.target.value})} className="w-full bg-[#0a0a0f] border border-green-500/30 rounded-lg py-2 px-3 text-white font-rajdhani" />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-500/20 text-gray-400 font-rajdhani py-2.5 rounded-lg">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-rajdhani py-2.5 rounded-lg disabled:opacity-50">{submitting ? 'Adding...' : 'Add Record'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminIFTA
