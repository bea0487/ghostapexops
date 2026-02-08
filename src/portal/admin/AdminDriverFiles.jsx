import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import AdminLayout from './AdminLayout'
import { UserCheck, Plus, X, Trash2, AlertTriangle } from 'lucide-react'

const AdminDriverFiles = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [drivers, setDrivers] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(searchParams.get('new') === 'true')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const [formData, setFormData] = useState({
    client_id: '',
    driver_first_name: '',
    driver_last_name: '',
    cdl_number: '',
    cdl_state: '',
    cdl_expiration_date: '',
    medical_card_expiration_date: '',
    last_mvr_date: '',
    mvr_status: 'Clear',
    clearinghouse_query_date: '',
    clearinghouse_status: 'Not Checked',
    dq_file_status: 'Missing Documents',
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
      const { data: driversData } = await supabase
        .from('driver_qualification_files')
        .select('*, clients (company_name)')
        .order('driver_last_name')

      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, company_name')
        .in('service_tier', ['Guardian', 'Apex Command'])
        .eq('status', 'Active')
        .order('company_name')

      setDrivers(driversData || [])
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
      const { error } = await supabase.from('driver_qualification_files').insert([{
        client_id: formData.client_id,
        driver_first_name: formData.driver_first_name,
        driver_last_name: formData.driver_last_name,
        cdl_number: formData.cdl_number || null,
        cdl_state: formData.cdl_state || null,
        cdl_expiration_date: formData.cdl_expiration_date || null,
        medical_card_expiration_date: formData.medical_card_expiration_date || null,
        last_mvr_date: formData.last_mvr_date || null,
        mvr_status: formData.mvr_status,
        clearinghouse_query_date: formData.clearinghouse_query_date || null,
        clearinghouse_status: formData.clearinghouse_status,
        dq_file_status: formData.dq_file_status,
        notes: formData.notes || null
      }])
      if (error) throw error
      setMessage({ type: 'success', text: 'Driver added!' })
      setFormData({ client_id: '', driver_first_name: '', driver_last_name: '', cdl_number: '', cdl_state: '', cdl_expiration_date: '', medical_card_expiration_date: '', last_mvr_date: '', mvr_status: 'Clear', clearinghouse_query_date: '', clearinghouse_status: 'Not Checked', dq_file_status: 'Missing Documents', notes: '' })
      fetchData()
      setTimeout(() => { setShowModal(false); setMessage({ type: '', text: '' }) }, 1500)
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this driver file?')) return
    await supabase.from('driver_qualification_files').delete().eq('id', id)
    fetchData()
  }

  const getDaysUntil = (date) => {
    if (!date) return null
    const diff = new Date(date) - new Date()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const expirationClass = (days) => {
    if (days === null) return 'text-gray-400'
    if (days < 0) return 'text-red-400'
    if (days <= 30) return 'text-red-400'
    if (days <= 60) return 'text-yellow-400'
    return 'text-green-400'
  }

  const statusBadge = {
    'Complete': 'bg-green-500/20 text-green-400',
    'Missing Documents': 'bg-yellow-500/20 text-yellow-400',
    'Expired Items': 'bg-red-500/20 text-red-400'
  }

  // Count expiring documents
  const expiringCount = drivers.filter(d => {
    const cdl = getDaysUntil(d.cdl_expiration_date)
    const med = getDaysUntil(d.medical_card_expiration_date)
    return (cdl !== null && cdl <= 30) || (med !== null && med <= 30)
  }).length

  if (loading) return <AdminLayout><div className="flex items-center justify-center h-64"><div className="animate-pulse text-fuchsia-400 font-orbitron">Loading...</div></div></AdminLayout>

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-orbitron font-bold text-2xl text-white flex items-center gap-3">
              <UserCheck className="text-blue-400" /> Driver Files
            </h1>
            <p className="text-gray-400 font-rajdhani">Guardian & Apex Command clients</p>
          </div>
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-rajdhani font-semibold px-4 py-2 rounded-lg">
            <Plus size={20} /> Add Driver
          </button>
        </div>

        {expiringCount > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="text-red-400" size={20} />
            <p className="text-red-400 font-rajdhani">{expiringCount} driver(s) have documents expiring within 30 days</p>
          </div>
        )}

        {drivers.length > 0 ? (
          <div className="bg-[#0d0d14] border border-blue-500/20 rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-blue-500/20">
                  <th className="text-left p-4 text-blue-400 font-rajdhani">Driver</th>
                  <th className="text-left p-4 text-blue-400 font-rajdhani">Client</th>
                  <th className="text-left p-4 text-blue-400 font-rajdhani">CDL Exp</th>
                  <th className="text-left p-4 text-blue-400 font-rajdhani">Med Card Exp</th>
                  <th className="text-left p-4 text-blue-400 font-rajdhani">Status</th>
                  <th className="text-left p-4 text-blue-400 font-rajdhani">Actions</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((d) => {
                  const cdlDays = getDaysUntil(d.cdl_expiration_date)
                  const medDays = getDaysUntil(d.medical_card_expiration_date)
                  return (
                    <tr key={d.id} className="border-b border-blue-500/10 hover:bg-blue-500/5">
                      <td className="p-4 text-white font-rajdhani font-medium">{d.driver_first_name} {d.driver_last_name}</td>
                      <td className="p-4 text-gray-300 font-rajdhani">{d.clients?.company_name}</td>
                      <td className={`p-4 font-rajdhani ${expirationClass(cdlDays)}`}>
                        {d.cdl_expiration_date ? new Date(d.cdl_expiration_date).toLocaleDateString() : '-'}
                        {cdlDays !== null && cdlDays <= 30 && <span className="ml-1 text-xs">({cdlDays}d)</span>}
                      </td>
                      <td className={`p-4 font-rajdhani ${expirationClass(medDays)}`}>
                        {d.medical_card_expiration_date ? new Date(d.medical_card_expiration_date).toLocaleDateString() : '-'}
                        {medDays !== null && medDays <= 30 && <span className="ml-1 text-xs">({medDays}d)</span>}
                      </td>
                      <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-semibold ${statusBadge[d.dq_file_status]}`}>{d.dq_file_status}</span></td>
                      <td className="p-4"><button onClick={() => handleDelete(d.id)} className="p-2 text-gray-400 hover:text-red-400"><Trash2 size={16} /></button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-[#0d0d14] border border-blue-500/20 rounded-xl p-12 text-center">
            <UserCheck className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-500 font-rajdhani">No driver files yet</p>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0d0d14] border border-blue-500/30 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-blue-500/20">
                <h2 className="font-orbitron font-semibold text-white">Add Driver</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {message.text && <div className={`p-3 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{message.text}</div>}
                
                <div>
                  <label className="block text-gray-400 font-rajdhani text-sm mb-1">Client *</label>
                  <select required value={formData.client_id} onChange={(e) => setFormData({...formData, client_id: e.target.value})} className="w-full bg-[#0a0a0f] border border-blue-500/30 rounded-lg py-2 px-3 text-white font-rajdhani">
                    <option value="">Select client...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 font-rajdhani text-sm mb-1">First Name *</label>
                    <input type="text" required value={formData.driver_first_name} onChange={(e) => setFormData({...formData, driver_first_name: e.target.value})} className="w-full bg-[#0a0a0f] border border-blue-500/30 rounded-lg py-2 px-3 text-white font-rajdhani" />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-rajdhani text-sm mb-1">Last Name *</label>
                    <input type="text" required value={formData.driver_last_name} onChange={(e) => setFormData({...formData, driver_last_name: e.target.value})} className="w-full bg-[#0a0a0f] border border-blue-500/30 rounded-lg py-2 px-3 text-white font-rajdhani" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-gray-400 font-rajdhani text-sm mb-1">CDL Number</label>
                    <input type="text" value={formData.cdl_number} onChange={(e) => setFormData({...formData, cdl_number: e.target.value})} className="w-full bg-[#0a0a0f] border border-blue-500/30 rounded-lg py-2 px-3 text-white font-rajdhani" />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-rajdhani text-sm mb-1">State</label>
                    <input type="text" maxLength={2} value={formData.cdl_state} onChange={(e) => setFormData({...formData, cdl_state: e.target.value.toUpperCase()})} className="w-full bg-[#0a0a0f] border border-blue-500/30 rounded-lg py-2 px-3 text-white font-rajdhani" placeholder="AZ" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 font-rajdhani text-sm mb-1">CDL Expiration</label>
                    <input type="date" value={formData.cdl_expiration_date} onChange={(e) => setFormData({...formData, cdl_expiration_date: e.target.value})} className="w-full bg-[#0a0a0f] border border-blue-500/30 rounded-lg py-2 px-3 text-white font-rajdhani" />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-rajdhani text-sm mb-1">Medical Card Exp</label>
                    <input type="date" value={formData.medical_card_expiration_date} onChange={(e) => setFormData({...formData, medical_card_expiration_date: e.target.value})} className="w-full bg-[#0a0a0f] border border-blue-500/30 rounded-lg py-2 px-3 text-white font-rajdhani" />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 font-rajdhani text-sm mb-1">DQ File Status</label>
                  <select value={formData.dq_file_status} onChange={(e) => setFormData({...formData, dq_file_status: e.target.value})} className="w-full bg-[#0a0a0f] border border-blue-500/30 rounded-lg py-2 px-3 text-white font-rajdhani">
                    <option value="Complete">Complete</option>
                    <option value="Missing Documents">Missing Documents</option>
                    <option value="Expired Items">Expired Items</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-500/20 text-gray-400 font-rajdhani py-2.5 rounded-lg">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-rajdhani py-2.5 rounded-lg disabled:opacity-50">{submitting ? 'Adding...' : 'Add Driver'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminDriverFiles
