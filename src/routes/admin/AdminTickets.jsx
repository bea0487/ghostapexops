import React from 'react'
import { Ticket, Plus, Search, Filter } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import Field from '../../components/Field'
import Input from '../../components/Input'
import TextArea from '../../components/TextArea'
import ClientSelect from '../../components/ClientSelect'
import { supabase } from '../../lib/supabaseClient'

export default function AdminTickets() {
  const [open, setOpen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState('Active')
  
  const [tickets, setTickets] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState('')
  const [query, setQuery] = React.useState('')

  // Form
  const [clientId, setClientId] = React.useState('')
  const [subject, setSubject] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [priority, setPriority] = React.useState('Normal')
  const [status, setStatus] = React.useState('Open')

  const tabs = ['Active', 'All', 'Open', 'In Progress', 'Waiting on Client', 'Resolved', 'Closed']

  async function loadTickets() {
    if (!supabase) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          clients (
            company_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
      if (error) throw error
      setTickets(data || [])
    } catch (e) {
      console.error('Failed to load tickets', e)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadTickets()
  }, [])

  function resetForm() {
    setClientId('')
    setSubject('')
    setDescription('')
    setPriority('Normal')
    setStatus('Open')
    setError('')
  }

  async function onSave(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (!clientId) throw new Error('Client UUID is required')
      if (!subject) throw new Error('Subject is required')

      const { error: insertError } = await supabase.from('tickets').insert({
        client_id: clientId,
        subject,
        description,
        priority,
        status
      })
      if (insertError) throw insertError

      await loadTickets()
      setOpen(false)
      resetForm()
    } catch (e) {
      setError(e.message || 'Failed to create ticket')
    } finally {
      setSaving(false)
    }
  }

  const filtered = tickets.filter(t => {
    // Tab filtering
    if (activeTab === 'Active') {
      if (['Resolved', 'Closed'].includes(t.status)) return false
    } else if (activeTab !== 'All') {
      if (t.status !== activeTab) return false
    }

    // Search query
    const q = query.toLowerCase()
    const s = t.subject?.toLowerCase() || ''
    const c = t.clients?.company_name?.toLowerCase() || ''
    const st = t.status?.toLowerCase() || ''
    const uuid = t.client_id?.toLowerCase() || ''
    
    return s.includes(q) || c.includes(q) || st.includes(q) || uuid.includes(q)
  })

  function getStatusColor(s) {
    switch (s) {
      case 'Open': return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      case 'In Progress': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      case 'Waiting on Client': return 'text-purple-400 bg-purple-500/10 border-purple-500/20'
      case 'Resolved': return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'Closed': return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
      default: return 'text-white bg-white/5 border-white/10'
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-orbitron font-bold text-2xl text-white">Support Tickets</h1>
            <p className="text-gray-400 font-rajdhani">Manage client requests & issues</p>
          </div>
          <Button onClick={() => { resetForm(); setOpen(true) }} className="bg-blue-600 hover:bg-blue-500">
            <span className="inline-flex items-center gap-2">
              <Plus size={16} />
              New Ticket
            </span>
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-white/10 pb-1">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap rounded-t-lg border-b-2 px-4 py-2 font-rajdhani text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tickets..."
            className="w-full max-w-md rounded-xl border border-white/10 bg-[#0d0d14] pl-10 pr-3 py-2 font-rajdhani text-white outline-none focus:border-blue-500/40"
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d0d14] p-6">
          {loading ? (
            <div className="font-rajdhani text-gray-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="mx-auto max-w-md text-center py-8">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
                <Ticket className="text-gray-400" size={24} />
              </div>
              <div className="font-orbitron text-sm text-white">No Tickets Found</div>
              <div className="mt-1 font-rajdhani text-gray-400">Create a ticket to get started</div>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(t => (
                <div key={t.id} className="flex flex-col gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:border-white/10 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-md border px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${getStatusColor(t.status)}`}>
                        {t.status}
                      </span>
                      {t.priority === 'High' && (
                        <span className="rounded-md border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-red-400">
                          High
                        </span>
                      )}
                      <span className="text-xs text-white/40">#{t.id.slice(0, 8)}</span>
                    </div>
                    <h3 className="font-orbitron font-medium text-white">{t.subject}</h3>
                    <p className="font-rajdhani text-sm text-gray-400">
                      {t.clients?.company_name || 'Unknown Client'} • {new Date(t.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Actions could go here */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Modal open={open} onClose={() => setOpen(false)} title="New Ticket" widthClass="max-w-xl">
          <form onSubmit={onSave} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 font-rajdhani text-red-200">
                {error}
              </div>
            )}

            <ClientSelect value={clientId} onChange={setClientId} />

            <Field label="Subject">
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} required placeholder="Issue summary" />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Priority">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0d0d14] px-4 py-3 font-rajdhani text-white outline-none focus:border-blue-500/50"
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </Field>
              <Field label="Status">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0d0d14] px-4 py-3 font-rajdhani text-white outline-none focus:border-blue-500/50"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Waiting on Client">Waiting on Client</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </Field>
            </div>

            <Field label="Description">
              <TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detailed description of the issue..." rows={4} />
            </Field>

            <div className="mt-5 flex justify-end gap-3">
              <Button type="button" onClick={() => setOpen(false)} className="bg-white/5 hover:bg-white/10">
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-500">
                {saving ? 'Creating...' : 'Create Ticket'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  )
}
