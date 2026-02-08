import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import AdminLayout from './AdminLayout'
import { 
  FileText, 
  Plus, 
  X, 
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  Trash2
} from 'lucide-react'

const AdminELDReports = () => {
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
    week_ending: '',
    driver_name: '',
    violations_found: 0,
    violation_details: '',
    status: 'Pending Review',
    corrective_actions: '',
    report_file_url: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setShowModal(true)
      setSearchParams({})
    }
  }, [searchParams])

  const fetchData = async () => {
    try {
      // Fetch reports with client info
      const { data: reportsData } = await supabase
        .from('eld_log_reports')
        .select(`
          *,
          clients (company_name, email)
        `)
        .order('report_date', { ascending: false })

      // Fetch all clients for dropdown
      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, company_name, email')
        .eq('status', 'Active')
        .order('company_name')

      setReports(reportsData || [])
      setClients(clientsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage({ type: '', text: '' })

    try {
      const { error } = await supabase
        .from('eld_log_reports')
        .insert([{
          client_id: formData.client_id,
          report_date: formData.report_date,
          week_ending: formData.week_ending || null,
          driver_name: formData.driver_name || null,
          violations_found: parseInt(formData.violations_found) || 0,
          violation_details: formData.violation_details || null,
          status: formData.status,
          corrective_actions: formData.corrective_actions || null,
          report_file_url: formData.report_file_url || null
        }])

      if (error) throw error

      setMessage({ type: 'success', text: 'ELD Report added successfully!' })
      
      // Reset form
      setFormData({
        client_id: '',
        report_date: new Date().toISOString().split('T')[0],
        week_ending: '',
        driver_name: '',
        violations_found: 0,
        violation_details: '',
        status: 'Pending Review',
        corrective_actions: '',
        report_file_url: ''
      })
      
      fetchData()
      
      setTimeout(() => {
        setShowModal(false)
        setMessage({ type: '', text: '' })
      }, 1500)

    } catch (error) {
      console.error('Error creating report:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to create report' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (report) => {
    if (!confirm('Delete this ELD report?')) return

    try {
      const { error } = await supabase
        .from('eld_log_reports')
        .delete()
        .eq('id', report.id)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Error deleting report:', error)
    }
  }

  const statusIcon = (status) => {
    switch (status) {
      case 'Clean': return <CheckCircle className="text-green-400" size={16} />
      case 'Violations Found': return <AlertCircle className="text-red-400" size={16} />
      default: return <Clock className="text-yellow-400" size={16} />
    }
  }

  const statusBadge = (status) => {
    const classes = {
      'Clean': 'bg-green-500/20 text-green-400',
      'Violations Found': 'bg-red-500/20 text-red-400',
      'Pending Review': 'bg-yellow-500/20 text-yellow-400'
    }
    return classes[status] || 'bg-gray-500/20 text-gray-400'
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-fuchsia-400 font-orbitron">Loading...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-orbitron font-bold text-2xl text-white flex items-center gap-3">
              <FileText className="text-cyan-400" />
              ELD Reports
            </h1>
            <p className="text-gray-400 font-rajdhani">Manage ELD log compliance reports</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-rajdhani font-semibold px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
          >
            <Plus size={20} />
            Add Report
          </button>
        </div>

        {/* Reports List */}
        {reports.length > 0 ? (
          <div className="bg-[#0d0d14] border border-cyan-500/20 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cyan-500/20">
                    <th className="text-left p-4 text-cyan-400 font-rajdhani font-semibold">Client</th>
                    <th className="text-left p-4 text-cyan-400 font-rajdhani font-semibold">Date</th>
                    <th className="text-left p-4 text-cyan-400 font-rajdhani font-semibold">Driver</th>
                    <th className="text-left p-4 text-cyan-400 font-rajdhani font-semibold">Violations</th>
                    <th className="text-left p-4 text-cyan-400 font-rajdhani font-semibold">Status</th>
                    <th className="text-left p-4 text-cyan-400 font-rajdhani font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-b border-cyan-500/10 hover:bg-cyan-500/5">
                      <td className="p-4">
                        <p className="text-white font-rajdhani font-medium">{report.clients?.company_name}</p>
                      </td>
                      <td className="p-4 text-gray-300 font-rajdhani">
                        {new Date(report.report_date).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-gray-300 font-rajdhani">
                        {report.driver_name || 'All Drivers'}
                      </td>
                      <td className="p-4">
                        <span className={`font-rajdhani font-semibold ${report.violations_found > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {report.violations_found}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${statusBadge(report.status)}`}>
                          {statusIcon(report.status)}
                          {report.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDelete(report)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-[#0d0d14] border border-cyan-500/20 rounded-xl p-12 text-center">
            <FileText className="mx-auto text-gray-600 mb-4" size={48} />
            <h3 className="text-white font-rajdhani font-semibold text-lg mb-2">No ELD Reports</h3>
            <p className="text-gray-500 font-rajdhani mb-4">Add your first ELD report</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 px-4 py-2 rounded-lg font-rajdhani"
            >
              <Plus size={18} />
              Add Report
            </button>
          </div>
        )}

        {/* Add Report Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0d0d14] border border-cyan-500/30 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-cyan-500/20">
                <h2 className="font-orbitron font-semibold text-white">Add ELD Report</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {message.text && (
                  <div className={`p-3 rounded-lg flex items-center gap-2 ${
                    message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    {message.text}
                  </div>
                )}

                <div>
                  <label className="block text-gray-400 font-rajdhani text-sm mb-1">Client *</label>
                  <select
                    name="client_id"
                    required
                    value={formData.client_id}
                    onChange={handleInputChange}
                    className="w-full bg-[#0a0a0f] border border-cyan-500/30 rounded-lg py-2 px-3 text-white font-rajdhani focus:outline-none focus:border-cyan-400"
                  >
                    <option value="">Select a client...</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.company_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 font-rajdhani text-sm mb-1">Report Date *</label>
                    <input
                      type="date"
                      name="report_date"
                      required
                      value={formData.report_date}
                      onChange={handleInputChange}
                      className="w-full bg-[#0a0a0f] border border-cyan-500/30 rounded-lg py-2 px-3 text-white font-rajdhani focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-rajdhani text-sm mb-1">Week Ending</label>
                    <input
                      type="date"
                      name="week_ending"
                      value={formData.week_ending}
                      onChange={handleInputChange}
                      className="w-full bg-[#0a0a0f] border border-cyan-500/30 rounded-lg py-2 px-3 text-white font-rajdhani focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 font-rajdhani text-sm mb-1">Driver Name</label>
                  <input
                    type="text"
                    name="driver_name"
                    value={formData.driver_name}
                    onChange={handleInputChange}
                    className="w-full bg-[#0a0a0f] border border-cyan-500/30 rounded-lg py-2 px-3 text-white font-rajdhani focus:outline-none focus:border-cyan-400"
                    placeholder="Leave blank for all drivers"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 font-rajdhani text-sm mb-1">Violations Found</label>
                    <input
                      type="number"
                      name="violations_found"
                      min="0"
                      value={formData.violations_found}
                      onChange={handleInputChange}
                      className="w-full bg-[#0a0a0f] border border-cyan-500/30 rounded-lg py-2 px-3 text-white font-rajdhani focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-rajdhani text-sm mb-1">Status *</label>
                    <select
                      name="status"
                      required
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full bg-[#0a0a0f] border border-cyan-500/30 rounded-lg py-2 px-3 text-white font-rajdhani focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Pending Review">Pending Review</option>
                      <option value="Clean">Clean</option>
                      <option value="Violations Found">Violations Found</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 font-rajdhani text-sm mb-1">Violation Details</label>
                  <textarea
                    name="violation_details"
                    rows={2}
                    value={formData.violation_details}
                    onChange={handleInputChange}
                    className="w-full bg-[#0a0a0f] border border-cyan-500/30 rounded-lg py-2 px-3 text-white font-rajdhani focus:outline-none focus:border-cyan-400 resize-none"
                    placeholder="Details of any violations found..."
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-rajdhani text-sm mb-1">Corrective Actions</label>
                  <textarea
                    name="corrective_actions"
                    rows={2}
                    value={formData.corrective_actions}
                    onChange={handleInputChange}
                    className="w-full bg-[#0a0a0f] border border-cyan-500/30 rounded-lg py-2 px-3 text-white font-rajdhani focus:outline-none focus:border-cyan-400 resize-none"
                    placeholder="Actions taken to address violations..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-500/20 text-gray-400 font-rajdhani font-semibold py-2.5 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-rajdhani font-semibold py-2.5 rounded-lg disabled:opacity-50"
                  >
                    {submitting ? 'Adding...' : 'Add Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminELDReports
