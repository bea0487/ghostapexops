import React from 'react'
import { Plus, MessageSquare, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import PortalLayout from '../components/PortalLayout'
import { useAuth } from '../context/AuthContext'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import Field from '../../components/Field'
import Input from '../../components/Input'
import TextArea from '../../components/TextArea'
import DebugInfo from '../../components/DebugInfo'
import { supabase } from '../../lib/supabaseClient'

const statusIcons = {
  open: AlertCircle,
  in_progress: Clock,
  resolved: CheckCircle,
}

const statusColors = {
  open: 'text-red-400 bg-red-500/10 border-red-500/30',
  in_progress: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  resolved: 'text-green-400 bg-green-500/10 border-green-500/30',
}

export default function SupportTickets() {
  const { client } = useAuth()
  const [tickets, setTickets] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [showModal, setShowModal] = React.useState(false)
  const [error, setError] = React.useState('')
  const [message, setMessage] = React.useState('')

  // Form state
  const [subject, setSubject] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [priority, setPriority] = React.useState('medium')

  async function loadTickets() {
    if (!client?.id) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTickets(data || [])
    } catch (e) {
      console.error('Failed to load tickets:', e)
      setError('Failed to load support tickets')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadTickets()
  }, [client?.id])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!client?.id) {
      setError('No client ID found. Please refresh and try again.')
      return
    }

    console.log('Submitting support ticket:', {
      client_id: client.id,
      subject: subject.trim(),
      description: description.trim(),
      priority,
      status: 'open'
    })

    setError('')
    setMessage('')
    setSaving(true)

    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          client_id: client.id,
          subject: subject.trim(),
          description: description.trim(),
          priority,
          status: 'open'
        })
        .select()

      console.log('Supabase response:', { data, error })

      if (error) {
        console.error('Supabase error details:', error)
        throw error
      }

      setMessage('Support ticket created successfully!')
      setSubject('')
      setDescription('')
      setPriority('medium')
      setShowModal(false)
      
      // Reload tickets
      setTimeout(() => {
        loadTickets()
        setMessage('')
      }, 2000)
    } catch (e) {
      console.error('Failed to create ticket:', e)
      setError(`Failed to create support ticket: ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-orbitron font-bold text-2xl text-white">Support Tickets</h1>
            <p className="text-gray-400 font-rajdhani mt-1">Submit and track your support requests</p>
          </div>
          <Button 
            onClick={() => setShowModal(true)}
            className="bg-cyan-600 hover:bg-cyan-500"
          >
            <Plus size={16} className="mr-2" />
            New Ticket
          </Button>
        </div>

        {message && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-green-400 font-rajdhani text-sm">{message}</p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 font-rajdhani text-sm">{error}</p>
          </div>
        )}

        <div className="bg-[#0d0d14] border border-cyan-500/20 rounded-xl p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-400 font-rajdhani">Loading tickets...</div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare size={48} className="mx-auto text-gray-500 mb-4" />
              <h3 className="font-orbitron text-white mb-2">No Support Tickets</h3>
              <p className="text-gray-400 font-rajdhani mb-4">You haven't submitted any support tickets yet.</p>
              <Button 
                onClick={() => setShowModal(true)}
                className="bg-cyan-600 hover:bg-cyan-500"
              >
                <Plus size={16} className="mr-2" />
                Create Your First Ticket
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => {
                const StatusIcon = statusIcons[ticket.status] || AlertCircle
                return (
                  <div
                    key={ticket.id}
                    className="border border-white/10 rounded-lg p-4 hover:border-cyan-500/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-orbitron text-white font-semibold">
                            {ticket.subject}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-rajdhani border ${statusColors[ticket.status]}`}>
                            <StatusIcon size={12} />
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-gray-400 font-rajdhani text-sm mb-2">
                          {ticket.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 font-rajdhani">
                          <span>Priority: {ticket.priority}</span>
                          <span>Created: {formatDate(ticket.created_at)}</span>
                          {ticket.updated_at !== ticket.created_at && (
                            <span>Updated: {formatDate(ticket.updated_at)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <Modal
          open={showModal}
          onClose={() => {
            setShowModal(false)
            setError('')
            setSubject('')
            setDescription('')
            setPriority('medium')
          }}
          title="Create Support Ticket"
          widthClass="max-w-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Subject" required>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                required
              />
            </Field>

            <Field label="Priority">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-rajdhani text-white outline-none focus:border-cyan-500/40"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </Field>

            <Field label="Description" required>
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide detailed information about your issue..."
                rows={6}
                required
              />
            </Field>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                onClick={() => setShowModal(false)}
                className="bg-white/5 hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || !subject.trim() || !description.trim()}
                className="bg-cyan-600 hover:bg-cyan-500"
              >
                {saving ? 'Creating...' : 'Create Ticket'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
      <DebugInfo />
    </PortalLayout>
  )
}
