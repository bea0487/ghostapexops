import React from 'react'
import { FileText, Plus, Search } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import Field from '../../components/Field'
import Input from '../../components/Input'
import TextArea from '../../components/TextArea'
import ClientSelect from '../../components/ClientSelect'
import { supabase } from '../../lib/supabaseClient'

export default function AdminDataq() {
  const [open, setOpen] = React.useState(false)
  const [disputes, setDisputes] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [query, setQuery] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState('')

  // Form
  const [clientId, setClientId] = React.useState('')
  const [reportNumber, setReportNumber] = React.useState('')
  const [violationCode, setViolationCode] = React.useState('')
  const [status, setStatus] = React.useState('Open')
  const [details, setDetails] = React.useState('')

  async function loadDisputes() {
    if (!supabase) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('dataq_disputes')
        .select(`
          *,
          clients (
            company_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDisputes(data || [])
    } catch (e) {
      console.error('Failed to load DataQ disputes', e)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadDisputes()
  }, [])

  function resetForm() {
    setClientId('')
    setReportNumber('')
    setViolationCode('')
    setStatus('Open')
    setDetails('')
    setError('')
  }

  async function onSave(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (!clientId) throw new Error('Client UUID is required')
      if (!reportNumber) throw new Error('Report Number is required')

      const { error: insertError } = await supabase.from('dataq_disputes').insert({
        client_id: clientId,
        report_number: reportNumber,
        violation_code: violationCode,
        status,
        details,
      })
      if (insertError) throw insertError

      await loadDisputes()
      setOpen(false)
      resetForm()
    } catch (e) {
      setError(e.message || 'Failed to create dispute')
    } finally {
      setSaving(false)
    }
  }

  const filtered = disputes.filter(d => {
    const q = query.toLowerCase()
    const company = d.clients?.company_name?.toLowerCase() || ''
    const report = d.report_number?.toLowerCase() || ''
    const uuid = d.client_id?.toLowerCase() || ''
    const s = d.status?.toLowerCase() || ''
    return company.includes(q) || report.includes(q) || uuid.includes(q) || s.includes(q)
  })

  function getStatusColor(s) {
    switch (s) {
      case 'Open': return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      case 'Submitted': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      case 'Won': return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'Lost': return 'text-red-400 bg-red-500/10 border-red-500/20'
      default: return 'text-white bg-white/5 border-white/10'
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-orbitron font-bold text-2xl text-white">DataQ Disputes</h1>
            <p className="text-gray-400 font-rajdhani">Guardian & Apex Command clients</p>
          </div>
          <Button onClick={() => { resetForm(); setOpen(true) }} className="bg-blue-600 hover:bg-blue-500">
            <span className="inline-flex items-center gap-2">
              <Plus size={16} />
              Add Dispute
            </span>
          </Button>
        </div>

        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by company, report #, or status..."
            className="w-full max-w-md rounded-xl border border-white/10 bg-[#0d0d14] pl-10 pr-3 py-2 font-rajdhani text-white outline-none focus:border-blue-500/40"
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d0d14] p-6">
          {loading ? (
             <div className="font-rajdhani text-gray-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="mx-auto max-w-md text-center py-8">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
                <FileText className="text-gray-400" size={24} />
              </div>
              <div className="font-orbitron text-sm text-white">No Disputes Found</div>
              <div className="mt-1 font-rajdhani text-gray-400">Add a dispute to get started</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="text-left text-xs font-orbitron tracking-wide text-white/70">
                    <th className="py-3 pr-4">Report #</th>
                    <th className="py-3 pr-4">Company</th>
                    <th className="py-3 pr-4">Violation</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filtered.map((d) => (
                    <tr key={d.id} className="font-rajdhani text-sm text-white/80">
                      <td className="py-3 pr-4 font-medium text-white">{d.report_number}</td>
                      <td className="py-3 pr-4">
                        <div className="text-white">{d.clients?.company_name || 'Unknown'}</div>
                        <div className="text-xs text-white/50">{d.client_id}</div>
                      </td>
                      <td className="py-3 pr-4">{d.violation_code || '—'}</td>
                      <td className="py-3 pr-4">
                        <span className={`rounded-md border px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${getStatusColor(d.status)}`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="py-3 text-white/50 text-xs">
                        {new Date(d.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Modal open={open} onClose={() => setOpen(false)} title="Add DataQ Dispute" widthClass="max-w-xl">
          <form onSubmit={onSave} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 font-rajdhani text-red-200">
                {error}
              </div>
            )}
            
            <ClientSelect value={clientId} onChange={setClientId} />

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Report Number">
                <Input value={reportNumber} onChange={(e) => setReportNumber(e.target.value)} required placeholder="Report #" />
              </Field>
              <Field label="Violation Code">
                <Input value={violationCode} onChange={(e) => setViolationCode(e.target.value)} placeholder="e.g. 395.8(e)" />
              </Field>
            </div>

            <Field label="Status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0d0d14] px-4 py-3 font-rajdhani text-white outline-none focus:border-blue-500/50"
              >
                <option value="Open">Open</option>
                <option value="Submitted">Submitted</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </Field>

            <Field label="Details">
              <TextArea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Dispute details..." rows={4} />
            </Field>

            <div className="mt-5 flex justify-end gap-3">
              <Button type="button" onClick={() => setOpen(false)} className="bg-white/5 hover:bg-white/10">
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-500">
                {saving ? 'Saving...' : 'Add Dispute'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  )
}
