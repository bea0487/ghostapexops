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

async function callEdgeFunction(path, body) {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase.functions.invoke(path, {
    body,
  })
  if (error) throw new Error(error?.message || 'Request failed')
  return data
}

export default function AdminEldReports() {
  const [open, setOpen] = React.useState(false)
  const [reports, setReports] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [query, setQuery] = React.useState('')

  // Form state
  const [clientId, setClientId] = React.useState('')
  const [weekStart, setWeekStart] = React.useState('')
  const [violations, setViolations] = React.useState(0)
  const [correctiveActions, setCorrectiveActions] = React.useState('')
  const [reportNotes, setReportNotes] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState('')

  async function loadReports() {
    if (!supabase) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('eld_reports')
        .select(`
          *,
          clients (
            company_name,
            email
          )
        `)
        .order('week_start', { ascending: false })

      if (error) throw error
      setReports(data || [])
    } catch (e) {
      console.error('Failed to load reports', e)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadReports()
  }, [])

  function resetForm() {
    setClientId('')
    setWeekStart('')
    setViolations(0)
    setCorrectiveActions('')
    setReportNotes('')
    setError('')
  }

  function validateReport() {
    const v = Number(violations)
    if (!clientId) return 'Client UUID is required'
    if (!weekStart) return 'Week Start is required'
    if (Number.isNaN(v) || v < 0) return 'Violations must be a non-negative number'
    if (v > 0 && !String(correctiveActions || '').trim()) {
      return 'Corrective Actions is required when Violations > 0'
    }
    return ''
  }

  async function onSave(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const validation = validateReport()
    if (validation) {
      setError(validation)
      setSaving(false)
      return
    }

    try {
      const { data: newReport, error: insertError } = await supabase.from('eld_reports').insert({
        client_id: clientId,
        week_start: weekStart,
        violations: Number(violations),
        corrective_actions: String(correctiveActions || '').trim() || null,
        report_notes: String(reportNotes || '').trim() || null,
      }).select().single()

      if (insertError) throw insertError

      // Trigger email notification manually (since database webhooks might not be configured)
      try {
        await callEdgeFunction('notify-new-eld-report', { record: newReport })
      } catch (notifyError) {
        console.warn('Failed to send email notification', notifyError)
        // Don't block UI success for notification failure
      }

      await loadReports()
      setOpen(false)
      resetForm()
    } catch (e) {
      setError(e.message || 'Failed to create report')
    } finally {
      setSaving(false)
    }
  }


  const filtered = reports.filter(r => {
    const q = query.toLowerCase()
    const company = r.clients?.company_name?.toLowerCase() || ''
    const email = r.clients?.email?.toLowerCase() || ''
    const uuid = r.client_id?.toLowerCase() || ''
    return company.includes(q) || email.includes(q) || uuid.includes(q)
  })

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-orbitron font-bold text-2xl text-white">ELD Reports</h1>
            <p className="text-gray-400 font-rajdhani">Manage ELD log compliance reports</p>
          </div>
          <Button onClick={() => { resetForm(); setOpen(true) }} className="bg-cyan-600 hover:bg-cyan-500">
            <span className="inline-flex items-center gap-2">
              <Plus size={16} />
              Add Report
            </span>
          </Button>
        </div>

        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by company or client UUID..."
            className="w-full max-w-md rounded-xl border border-white/10 bg-[#0d0d14] pl-10 pr-3 py-2 font-rajdhani text-white outline-none focus:border-cyan-500/40"
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
              <div className="font-orbitron text-sm text-white">No ELD Reports Found</div>
              <div className="mt-1 font-rajdhani text-gray-400">Add a report to get started</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="text-left text-xs font-orbitron tracking-wide text-white/70">
                    <th className="py-3 pr-4">Week Start</th>
                    <th className="py-3 pr-4">Company</th>
                    <th className="py-3 pr-4">Violations</th>
                    <th className="py-3 pr-4">Actions</th>
                    <th className="py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filtered.map((r) => (
                    <tr key={r.id} className="font-rajdhani text-sm text-white/80">
                      <td className="py-3 pr-4">{r.week_start}</td>
                      <td className="py-3 pr-4">
                        <div className="text-white">{r.clients?.company_name || 'Unknown'}</div>
                        <div className="text-xs text-white/50">{r.client_id}</div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          r.violations > 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
                        }`}>
                          {r.violations}
                        </span>
                      </td>
                      <td className="py-3 pr-4 max-w-xs truncate" title={r.corrective_actions}>
                        {r.corrective_actions || '—'}
                      </td>
                      <td className="py-3 text-white/50 text-xs">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Modal open={open} onClose={() => setOpen(false)} title="Add ELD Report" widthClass="max-w-xl">
          <form onSubmit={onSave} className="space-y-4">
             {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 font-rajdhani text-red-200">
                {error}
              </div>
            )}
            
            <ClientSelect value={clientId} onChange={setClientId} />

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Week Start">
                <Input value={weekStart} onChange={(e) => setWeekStart(e.target.value)} type="date" required />
              </Field>
              <Field label="Violations">
                <Input value={violations} onChange={(e) => setViolations(e.target.value)} type="number" min="0" />
              </Field>
            </div>

            <Field label="Corrective Actions" hint={Number(violations) > 0 ? 'Required' : 'Optional'}>
              <TextArea
                value={correctiveActions}
                onChange={(e) => setCorrectiveActions(e.target.value)}
                placeholder="Describe corrective actions..."
              />
            </Field>

            <Field label="Report Notes">
              <TextArea value={reportNotes} onChange={(e) => setReportNotes(e.target.value)} placeholder="Internal notes..." />
            </Field>

            <div className="mt-5 flex justify-end gap-3">
              <Button type="button" onClick={() => setOpen(false)} className="bg-white/5 hover:bg-white/10">
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-cyan-600 hover:bg-cyan-500">
                {saving ? 'Saving...' : 'Create Report'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  )
}
