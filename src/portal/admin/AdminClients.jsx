import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import AdminLayout from './AdminLayout'
import { 
  Users, 
  Plus, 
  X, 
  Search,
  Mail,
  Phone,
  Building,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

const AdminClients = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(searchParams.get('new') === 'true')
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [tierFilter, setTierFilter] = useState('all')
  const [message, setMessage] = useState({ type: '', text: '' })

  const [formData, setFormData] = useState({
    company_name: '',
    email: '',
    password: '',
    phone: '',
    dot_number: '',
    mc_number: '',
    service_tier: 'Wingman',
    address: '',
    city: '',
    state: '',
    zip: '',
    contact_first_name: '',
    contact_last_name: '',
    notes: ''
  })

  useEffect(() => {
    fetchClients()
  }, [])

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setShowModal(true)
      setSearchParams({})
    }
  }, [searchParams])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching clients:', error)
        setMessage({ 
          type: 'error', 
          text: `Failed to load clients: ${error.message}` 
        })
        setClients([])
      } else {
        setClients(data || [])
        setMessage({ type: '', text: '' })
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
      setClients([])
      setMessage({ 
        type: 'error', 
        text: 'Failed to load clients. Please refresh the page.' 
      })
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
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      const accessToken = sessionData?.session?.access_token
      if (!accessToken) {
        throw new Error('Not authenticated. Please log in again.')
      }

      const response = await fetch('/api/admin/create-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          company_name: formData.company_name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          dot_number: formData.dot_number,
          mc_number: formData.mc_number,
          service_tier: formData.service_tier,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          contact_first_name: formData.contact_first_name,
          contact_last_name: formData.contact_last_name,
          notes: formData.notes
        })
      })

      const rawText = await response.text().catch(() => '')
      let result = {}
      try {
        result = rawText ? JSON.parse(rawText) : {}
      } catch {
        result = { raw: rawText }
      }

      if (!response.ok) {
        const serverMsg = result?.error
          ? result.error
          : rawText
            ? rawText.slice(0, 500)
            : 'Failed to create client'

        throw new Error(`[${response.status}] ${serverMsg}`)
      }

      const createdClient = result?.client
      const needsConfirmation = true
      setMessage({ 
        type: 'success', 
        text: needsConfirmation
          ? `✅ Client "${createdClient?.company_name || formData.company_name}" created successfully!\n\n📧 The client will receive an email with login instructions.\n\nClient can log in with:\n• Email: ${formData.email}\n• Temporary Password: ${formData.password}`
          : `✅ Client "${createdClient?.company_name || formData.company_name}" created successfully!`
      })

      // Reset form immediately
      setFormData({
        company_name: '',
        email: '',
        password: '',
        phone: '',
        dot_number: '',
        mc_number: '',
        service_tier: 'Wingman',
        address: '',
        city: '',
        state: '',
        zip: '',
        contact_first_name: '',
        contact_last_name: '',
        notes: ''
      })
      
      // Refresh client list immediately
      fetchClients()
      
      // Close modal after showing success message
      setTimeout(() => {
        setShowModal(false)
        setMessage({ type: '', text: '' })
        // Refresh one more time to ensure the new client appears
        fetchClients()
      }, 3000) // Give user time to read the success message

    } catch (error) {
      console.error('Error creating client:', error)
      const errorMessage = error.message || 'Failed to create client. Please try again.'
      
      setMessage({ 
        type: 'error', 
        text: `❌ Error creating client: ${errorMessage}\n\nNext steps to diagnose:\n• Open DevTools → Network → create-client request\n• Confirm response status is 200 and response is JSON\n• If status is 401/403, your logged-in user is not in the admins table\n• If status is 500, check Vercel function logs\n\nTry again after checking the above.`
      })
      
      // Reset form and close modal after showing error
      setTimeout(() => {
        setFormData({
          company_name: '',
          email: '',
          password: '',
          phone: '',
          dot_number: '',
          mc_number: '',
          service_tier: 'Wingman',
          address: '',
          city: '',
          state: '',
          zip: '',
          contact_first_name: '',
          contact_last_name: '',
          notes: ''
        })
        setShowModal(false)
        setMessage({ type: '', text: '' })
      }, 4000) // Give user time to read the error
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (client) => {
    if (!confirm(`Are you sure you want to delete ${client.company_name}? This cannot be undone.`)) {
      return
    }

    try {
      // Delete client record (auth user will remain but can't access portal)
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', client.id)

      if (error) throw error
      
      fetchClients()
    } catch (error) {
      console.error('Error deleting client:', error)
      alert('Failed to delete client')
    }
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.dot_number?.includes(searchTerm)
    
    const matchesTier = tierFilter === 'all' || client.service_tier === tierFilter
    
    return matchesSearch && matchesTier
  })

  const tierBadge = {
    'Wingman': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Guardian': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Apex Command': 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30'
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-fuchsia-400 font-orbitron">Loading clients...</div>
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
              <Users className="text-fuchsia-400" />
              Clients
            </h1>
            <p className="text-gray-400 font-rajdhani">Manage your client accounts</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-rajdhani font-semibold px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-fuchsia-500/30 transition-all"
          >
            <Plus size={20} />
            Add Client
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search by company, email, or DOT#..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0d0d14] border border-fuchsia-500/30 rounded-lg py-2.5 pl-10 pr-4 text-white font-rajdhani focus:outline-none focus:border-fuchsia-400 transition-colors"
            />
          </div>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-[#0d0d14] border border-fuchsia-500/30 rounded-lg py-2.5 px-4 text-white font-rajdhani focus:outline-none focus:border-fuchsia-400 cursor-pointer"
          >
            <option value="all">All Tiers</option>
            <option value="Wingman">Wingman</option>
            <option value="Guardian">Guardian</option>
            <option value="Apex Command">Apex Command</option>
          </select>
        </div>

        {/* Clients Table */}
        {filteredClients.length > 0 ? (
          <div className="bg-[#0d0d14] border border-fuchsia-500/20 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-fuchsia-500/20">
                    <th className="text-left p-4 text-fuchsia-400 font-rajdhani font-semibold">Company</th>
                    <th className="text-left p-4 text-fuchsia-400 font-rajdhani font-semibold">Contact</th>
                    <th className="text-left p-4 text-fuchsia-400 font-rajdhani font-semibold">DOT#</th>
                    <th className="text-left p-4 text-fuchsia-400 font-rajdhani font-semibold">Tier</th>
                    <th className="text-left p-4 text-fuchsia-400 font-rajdhani font-semibold">Status</th>
                    <th className="text-left p-4 text-fuchsia-400 font-rajdhani font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="border-b border-fuchsia-500/10 hover:bg-fuchsia-500/5 transition-colors">
                      <td className="p-4">
                        <p className="text-white font-rajdhani font-medium">{client.company_name}</p>
                        <p className="text-gray-500 text-sm font-rajdhani">{client.email}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-gray-300 font-rajdhani">
                          {client.contact_first_name} {client.contact_last_name}
                        </p>
                        <p className="text-gray-500 text-sm font-rajdhani">{client.phone || '-'}</p>
                      </td>
                      <td className="p-4 text-gray-300 font-rajdhani">
                        {client.dot_number || '-'}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${tierBadge[client.service_tier]}`}>
                          {client.service_tier}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          client.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                          client.status === 'On Hold' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(client)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-[#0d0d14] border border-fuchsia-500/20 rounded-xl p-12 text-center">
            <Users className="mx-auto text-gray-600 mb-4" size={48} />
            <h3 className="text-white font-rajdhani font-semibold text-lg mb-2">No Clients Found</h3>
            <p className="text-gray-500 font-rajdhani mb-4">
              {searchTerm || tierFilter !== 'all' ? 'No clients match your search.' : 'Add your first client to get started.'}
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-400 hover:bg-fuchsia-500/30 px-4 py-2 rounded-lg font-rajdhani font-medium transition-colors"
            >
              <Plus size={18} />
              Add Your First Client
            </button>
          </div>
        )}

        {/* Add Client Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0d0d14] border border-fuchsia-500/30 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-fuchsia-500/20 sticky top-0 bg-[#0d0d14]">
                <h2 className="font-orbitron font-semibold text-white">Add New Client</h2>
                <button 
                  onClick={() => {
                    setShowModal(false)
                    setMessage({ type: '', text: '' })
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {message.text && (
                  <div className={`p-4 rounded-lg ${
                    message.type === 'success' 
                      ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
                      : 'bg-red-500/10 border border-red-500/30 text-red-400'
                  }`}>
                    <div className="flex items-start gap-3">
                      {message.type === 'success' ? <CheckCircle size={20} className="flex-shrink-0 mt-0.5" /> : <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />}
                      <div className="flex-1">
                        <p className="font-rajdhani font-semibold mb-2">
                          {message.type === 'success' ? 'Client Created Successfully!' : 'Error Creating Client'}
                        </p>
                        <div className="text-sm font-rajdhani whitespace-pre-line leading-relaxed">
                          {message.text}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info Box */}
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
                  <p className="text-cyan-400 font-rajdhani text-sm">
                    <strong>💡 Quick Setup:</strong> This form automatically creates the auth user and client record. The client will receive a welcome email with their temporary password and login instructions. They can log in immediately (after email confirmation) and change their password in Settings.
                  </p>
                </div>

                {/* Login Credentials Section */}
                <div className="bg-[#0a0a0f] rounded-lg p-4 border border-fuchsia-500/10">
                  <h3 className="font-rajdhani font-semibold text-fuchsia-400 mb-3 flex items-center gap-2">
                    <Mail size={16} />
                    Login Credentials
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 font-rajdhani text-sm mb-1">Email *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-[#0d0d14] border border-fuchsia-500/30 rounded-lg py-2 px-3 text-white font-rajdhani focus:outline-none focus:border-fuchsia-400"
                        placeholder="client@company.com"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 font-rajdhani text-sm mb-1">Temporary Password *</label>
                      <input
                        type="text"
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full bg-[#0d0d14] border border-fuchsia-500/30 rounded-lg py-2 px-3 text-white font-rajdhani focus:outline-none focus:border-fuchsia-400"
                        placeholder="Welcome2025!"
                      />
                    </div>
                  </div>
                </div>

                {/* Company Info Section */}
                <div className="bg-[#0a0a0f] rounded-lg p-4 border border-fuchsia-500/10">
                  <h3 className="font-rajdhani font-semibold text-fuchsia-400 mb-3 flex items-center gap-2">
                    <Building size={16} />
                    Company Information
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-gray-400 font-rajdhani text-sm mb-1">Company Name *</label>
                      <input
                        type="text"
                        name="company_name"
                        required
                        value={formData.company_name}
                        onChange={handleInputChange}
                        className="w-full bg-[#0d0d14] border border-fuchsia-500/30 rounded-lg py-2 px-3 text-white font-rajdhani focus:outline-none focus:border-fuchsia-400"
                        placeholder="ABC Trucking LLC"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 font-rajdhani text-sm mb-1">DOT Number</label>
                      <input
                        type="text"
                        name="dot_number"
                        value={formData.dot_number}
                        onChange={handleInputChange}
                        className="w-full bg-[#0d0d14] border border-fuchsia-500/30 rounded-lg py-2 px-3 text-white font-rajdhani focus:outline-none focus:border-fuchsia-400"
                        placeholder="1234567"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 font-rajdhani text-sm mb-1">MC Number</label>
                      <input
                        type="text"
                        name="mc_number"
                        value={formData.mc_number}
                        onChange={handleInputChange}
                        className="w-full bg-[#0d0d14] border border-fuchsia-500/30 rounded-lg py-2 px-3 text-white font-rajdhani focus:outline-none focus:border-fuchsia-400"
                        placeholder="MC-987654"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 font-rajdhani text-sm mb-1">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full bg-[#0d0d14] border border-fuchsia-500/30 rounded-lg py-2 px-3 text-white font-rajdhani focus:outline-none focus:border-fuchsia-400"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 font-rajdhani text-sm mb-1">Service Tier *</label>
                      <select
                        name="service_tier"
                        required
                        value={formData.service_tier}
                        onChange={handleInputChange}
                        className="w-full bg-[#0d0d14] border border-fuchsia-500/30 rounded-lg py-2 px-3 text-white font-rajdhani focus:outline-none focus:border-fuchsia-400 cursor-pointer"
                      >
                        <option value="Wingman">Wingman ($150/mo)</option>
                        <option value="Guardian">Guardian ($275/mo)</option>
                        <option value="Apex Command">Apex Command ($450/mo)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact Person Section */}
                <div className="bg-[#0a0a0f] rounded-lg p-4 border border-fuchsia-500/10">
                  <h3 className="font-rajdhani font-semibold text-fuchsia-400 mb-3">Contact Person</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 font-rajdhani text-sm mb-1">First Name</label>
                      <input
                        type="text"
                        name="contact_first_name"
                        value={formData.contact_first_name}
                        onChange={handleInputChange}
                        className="w-full bg-[#0d0d14] border border-fuchsia-500/30 rounded-lg py-2 px-3 text-white font-rajdhani focus:outline-none focus:border-fuchsia-400"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 font-rajdhani text-sm mb-1">Last Name</label>
                      <input
                        type="text"
                        name="contact_last_name"
                        value={formData.contact_last_name}
                        onChange={handleInputChange}
                        className="w-full bg-[#0d0d14] border border-fuchsia-500/30 rounded-lg py-2 px-3 text-white font-rajdhani focus:outline-none focus:border-fuchsia-400"
                        placeholder="Smith"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div className="bg-[#0a0a0f] rounded-lg p-4 border border-fuchsia-500/10">
                  <h3 className="font-rajdhani font-semibold text-fuchsia-400 mb-3">Address</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-gray-400 font-rajdhani text-sm mb-1">Street Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full bg-[#0d0d14] border border-fuchsia-500/30 rounded-lg py-2 px-3 text-white font-rajdhani focus:outline-none focus:border-fuchsia-400"
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 font-rajdhani text-sm mb-1">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full bg-[#0d0d14] border border-fuchsia-500/30 rounded-lg py-2 px-3 text-white font-rajdhani focus:outline-none focus:border-fuchsia-400"
                        placeholder="Phoenix"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 font-rajdhani text-sm mb-1">State</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full bg-[#0d0d14] border border-fuchsia-500/30 rounded-lg py-2 px-3 text-white font-rajdhani focus:outline-none focus:border-fuchsia-400"
                          placeholder="AZ"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 font-rajdhani text-sm mb-1">ZIP</label>
                        <input
                          type="text"
                          name="zip"
                          value={formData.zip}
                          onChange={handleInputChange}
                          className="w-full bg-[#0d0d14] border border-fuchsia-500/30 rounded-lg py-2 px-3 text-white font-rajdhani focus:outline-none focus:border-fuchsia-400"
                          placeholder="85001"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-gray-400 font-rajdhani text-sm mb-1">Internal Notes</label>
                  <textarea
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full bg-[#0a0a0f] border border-fuchsia-500/30 rounded-lg py-2 px-3 text-white font-rajdhani focus:outline-none focus:border-fuchsia-400 resize-none"
                    placeholder="Any internal notes about this client..."
                  />
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setMessage({ type: '', text: '' })
                    }}
                    className="flex-1 bg-gray-500/20 text-gray-400 font-rajdhani font-semibold py-2.5 rounded-lg hover:bg-gray-500/30 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-rajdhani font-semibold py-2.5 rounded-lg hover:shadow-lg hover:shadow-fuchsia-500/30 transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Create Client'}
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

export default AdminClients
