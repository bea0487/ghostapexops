import React from 'react'
import { Fuel, Plus, Search } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import Field from '../../components/Field'
import Input from '../../components/Input'
import ClientSelect from '../../components/ClientSelect'
import { supabase } from '../../lib/supabaseClient'

export default function AdminIfta() {
  const [open, setOpen] = React.useState(false)
  const [records, setRecords] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [query, setQuery] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState('')

  // Form
  const [clientId, setClientId] = React.useState('')
  const [quarter, setQuarter] = React.useState('')
  const [totalMiles, setTotalMiles] = React.useState('')
  const [taxableGallons, setTaxableGallons] = React.useState('')

  async function loadRecords() {
    if (!supabase) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('ifta_records')
        .select(`
          *,
          clients (
            company_name,
            email
          )
        `)
        .order('quarter', { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (e) {
      console.error('Failed to load IFTA records', e)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadRecords()
  }, [])

  function resetForm() {
    setClientId('')
    setQuarter('')
    setTotalMiles('')
    setTaxableGallons('')
    setError('')
  }

  async function onSave(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (!clientId) throw new Error('Client UUID is required')
      if (!quarter) throw new Error('Quarter is required')

      const { error: insertError } = await supabase.from('ifta_records').insert({
        client_id: clientId,
        quarter,
        total_miles: totalMiles ? parseFloat(totalMiles) : 0,
        taxable_gallons: taxableGallons ? parseFloat(taxableGallons) : 0,
      })
      if (insertError) throw insertError

      await loadRecords()
      setOpen(false)
      resetForm()
    } catch (e) {
      setError(e.message || 'Failed to create IFTA record')
    } finally {
      setSaving(false)
    }
  }

  const filtered = records.filter(r => {
    const q = query.toLowerCase()
    const company = r.clients?.company_name?.toLowerCase() || ''
    const qt = r.quarter?.toLowerCase() || ''
    const uuid = r.client_id?.toLowerCase() || ''
    return company.includes(q) || qt.includes(q) || uuid.includes(q)
  })

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-orbitron font-bold text-2xl text-white">IFTA Tracking</h1>
            <p className="text-gray-400 font-rajdhani">Guardian & Apex Command clients</p>
          </div>
          <Button onClick={() => { resetForm(); setOpen(true) }} className="bg-green-600 hover:bg-green-500">
            <span className="inline-flex items-center gap-2">
              <Plus size={16} />
              Add Record
            </span>
          </Button>
        </div>

        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by company, quarter, or client UUID..."
            className="w-full max-w-md rounded-xl border border-white/10 bg-[#0d0d14] pl-10 pr-3 py-2 font-rajdhani text-white outline-none focus:border-green-500/40"
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d0d14] p-6">
          {loading ? (
             <div className="font-rajdhani text-gray-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="mx-auto max-w-md text-center py-8">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
                <Fuel className="text-gray-400" size={24} />
              </div>
              <div className="font-orbitron text-sm text-white">No IFTA Records</div>
              <div className="mt-1 font-rajdhani text-gray-400">Add a record to get started</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="text-left text-xs font-orbitron tracking-wide text-white/70">
                    <th className="py-3 pr-4">Quarter</th>
                    <th className="py-3 pr-4">Company</th>
                    <th className="py-3 pr-4">Total Miles</th>
                    <th className="py-3 pr-4">Taxable Gallons</th>
                    <th className="py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filtered.map((r) => (
                    <tr key={r.id} className="font-rajdhani text-sm text-white/80">
                      <td className="py-3 pr-4 font-medium text-white">{r.quarter}</td>
                      <td className="py-3 pr-4">
                        <div className="text-white">{r.clients?.company_name || 'Unknown'}</div>
                        <div className="text-xs text-white/50">{r.client_id}</div>
                      </td>
                      <td className="py-3 pr-4">{r.total_miles?.toLocaleString() || '0'}</td>
                      <td className="py-3 pr-4">{r.taxable_gallons?.toLocaleString() || '0'}</td>
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

        <Modal open={open} onClose={() => setOpen(false)} title="Add IFTA Record" widthClass="max-w-xl">
          <form onSubmit={onSave} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 font-rajdhani text-red-200">
                {error}
              </div>
            )}
            
            <ClientSelect value={clientId} onChange={setClientId} />

            <Field label="Quarter" hint="e.g. 2024-Q1">
              <Input value={quarter} onChange={(e) => setQuarter(e.target.value)} required placeholder="YYYY-Q#" />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Total Miles">
                <Input type="number" step="0.1" value={totalMiles} onChange={(e) => setTotalMiles(e.target.value)} placeholder="0.0" />
              </Field>
              <Field label="Taxable Gallons">
                <Input type="number" step="0.1" value={taxableGallons} onChange={(e) => setTaxableGallons(e.target.value)} placeholder="0.0" />
              </Field>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <Button type="button" onClick={() => setOpen(false)} className="bg-white/5 hover:bg-white/10">
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-500">
                {saving ? 'Saving...' : 'Add Record'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  )
}
