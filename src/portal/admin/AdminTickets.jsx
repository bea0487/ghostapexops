import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import AdminLayout from './AdminLayout'
import { HelpCircle, X, CheckCircle, Clock, AlertCircle, MessageSquare } from 'lucide-react'

const AdminTickets = () => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('active')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [resolution, setResolution] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const { data } = await supabase
        .from('support_tickets')
        .select('*, clients (company_name, email)')
        .order('created_at', { ascending: false })

      setTickets(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTicketStatus = async (ticketId, newStatus, notes = null) => {
    setUpdating(true)
    try {
      const updateData = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      }
      if (notes) updateData.resolution_notes = notes

      const { error } = await supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', ticketId)

      if (error) throw error
      
      fetchTickets()
      setSelectedTicket(null)
      setResolution('')
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setUpdating(false)
    }
  }

  const filteredTickets = tickets.filter(t => {
    if (statusFilter === 'all') return true
    if (statusFilter === 'active') return ['Open', 'In Progress', 'Waiting on Client'].includes(t.status)
    return t.status === statusFilter
  })

  const statusIcon = (status) => {
    switch (status) {
      case 'Resolved':
      case 'Closed': return <CheckCircle className="text-green-400" size={16} />
      case 'In Progress': return <Clock className="text-blue-400" size={16} />
      case 'Waiting on Client': return <AlertCircle className="text-yellow-400" size={16} />
      default: return <MessageSquare className="text-cyan-400" size={16} />
    }
  }

  const statusBadge = (status) => {
    const classes = {
      'Open': 'bg-cyan-500/20 text-cyan-400',
      'In Progress': 'bg-blue-500/20 text-blue-400',
      'Waiting on Client': 'bg-yellow-500/20 text-yellow-400',
      'Resolved': 'bg-green-500/20 text-green-400',
      'Closed': 'bg-gray-500/20 text-gray-400'
    }
    return classes[status] || 'bg-gray-500/20 text-gray-400'
  }

  const priorityBadge = (priority) => {
    const classes = {
      'Urgent': 'bg-red-500/20 text-red-400',
      'High': 'bg-orange-500/20 text-orange-400',
      'Medium': 'bg-yellow-500/20 text-yellow-400',
      'Low': 'bg-gray-500/20 text-gray-400'
    }
    return classes[priority] || 'bg-gray-500/20 text-gray-400'
  }

  const openCount = tickets.filter(t => ['Open', 'In Progress'].includes(t.status)).length

  if (loading) return <AdminLayout><div className="flex items-center justify-center h-64"><div className="animate-pulse text-fuchsia-400 font-orbitron">Loading...</div></div></AdminLayout>

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-orbitron font-bold text-2xl text-white flex items-center gap-3">
              <HelpCircle className="text-fuchsia-400" /> Support Tickets
            </h1>
            <p className="text-gray-400 font-rajdhani">{openCount} open ticket(s)</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {['active', 'all', 'Open', 'In Progress', 'Waiting on Client', 'Resolved', 'Closed'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg font-rajdhani text-sm transition-colors ${
                statusFilter === status
                  ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/50'
                  : 'bg-[#0d0d14] text-gray-400 border border-fuchsia-500/20 hover:border-fuchsia-500/40'
              }`}
            >
              {status === 'active' ? 'Active' : status}
            </button>
          ))}
        </div>

        {/* Tickets List */}
        {filteredTickets.length > 0 ? (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <div 
                key={ticket.id}
                className="bg-[#0d0d14] border border-fuchsia-500/20 rounded-xl p-5 hover:border-fuchsia-500/40 transition-colors cursor-pointer"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      {statusIcon(ticket.status)}
                      <h3 className="text-white font-rajdhani font-semibold">{ticket.subject}</h3>
                    </div>
                    <p className="text-gray-500 font-rajdhani text-sm">
                      {ticket.clients?.company_name} • {new Date(ticket.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${priorityBadge(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${statusBadge(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                </div>
                {ticket.description && (
                  <p className="text-gray-400 font-rajdhani text-sm line-clamp-2">{ticket.description}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#0d0d14] border border-fuchsia-500/20 rounded-xl p-12 text-center">
            <HelpCircle className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-500 font-rajdhani">No tickets found</p>
          </div>
        )}

        {/* Ticket Detail Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0d0d14] border border-fuchsia-500/30 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-fuchsia-500/20">
                <h2 className="font-orbitron font-semibold text-white">Ticket Details</h2>
                <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-white"><X size={24} /></button>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <p className="text-gray-500 font-rajdhani text-xs uppercase">Subject</p>
                  <p className="text-white font-rajdhani font-semibold">{selectedTicket.subject}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 font-rajdhani text-xs uppercase">Client</p>
                    <p className="text-white font-rajdhani">{selectedTicket.clients?.company_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-rajdhani text-xs uppercase">Category</p>
                    <p className="text-white font-rajdhani">{selectedTicket.category}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 font-rajdhani text-xs uppercase">Priority</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${priorityBadge(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500 font-rajdhani text-xs uppercase">Current Status</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${statusBadge(selectedTicket.status)}`}>
                      {selectedTicket.status}
                    </span>
                  </div>
                </div>

                {selectedTicket.description && (
                  <div>
                    <p className="text-gray-500 font-rajdhani text-xs uppercase">Description</p>
                    <p className="text-gray-300 font-rajdhani text-sm whitespace-pre-wrap">{selectedTicket.description}</p>
                  </div>
                )}

                <div>
                  <p className="text-gray-500 font-rajdhani text-xs uppercase mb-2">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {['Open', 'In Progress', 'Waiting on Client', 'Resolved', 'Closed'].map(status => (
                      <button
                        key={status}
                        onClick={() => status === 'Resolved' ? null : updateTicketStatus(selectedTicket.id, status)}
                        disabled={updating || selectedTicket.status === status || status === 'Resolved'}
                        className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors disabled:opacity-50 ${
                          selectedTicket.status === status 
                            ? statusBadge(status) + ' ring-2 ring-white/30'
                            : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {!['Resolved', 'Closed'].includes(selectedTicket.status) && (
                  <div>
                    <p className="text-gray-500 font-rajdhani text-xs uppercase mb-2">Resolve with Notes</p>
                    <textarea
                      rows={3}
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder="Resolution notes..."
                      className="w-full bg-[#0a0a0f] border border-fuchsia-500/30 rounded-lg py-2 px-3 text-white font-rajdhani focus:outline-none focus:border-fuchsia-400 resize-none mb-2"
                    />
                    <button
                      onClick={() => updateTicketStatus(selectedTicket.id, 'Resolved', resolution)}
                      disabled={updating || !resolution.trim()}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-rajdhani py-2 rounded-lg disabled:opacity-50"
                    >
                      {updating ? 'Updating...' : 'Mark as Resolved'}
                    </button>
                  </div>
                )}

                {selectedTicket.resolution_notes && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <p className="text-green-400 font-rajdhani text-sm">
                      <strong>Resolution:</strong> {selectedTicket.resolution_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminTickets
