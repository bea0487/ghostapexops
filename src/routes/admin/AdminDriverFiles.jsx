import React from 'react'
import { UserCheck, Plus, Search } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import Field from '../../components/Field'
import Input from '../../components/Input'
import ClientSelect from '../../components/ClientSelect'
import { supabase } from '../../lib/supabaseClient'

export default function AdminDriverFiles() {
  const [open, setOpen] = React.useState(false)
  const [files, setFiles] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [query, setQuery] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState('')

  // Form state
  const [clientId, setClientId] = React.useState('')
  const [driverName, setDriverName] = React.useState('')
  const [licenseNumber, setLicenseNumber] = React.useState('')
  const [cdlExpiration, setCdlExpiration] = React.useState('')
  const [medExpiration, setMedExpiration] = React.useState('')

  async function loadFiles() {
    if (!supabase) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('driver_files')
        .select(`
          *,
          clients (
            company_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setFiles(data || [])
    } catch (e) {
      console.error('Failed to load driver files', e)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadFiles()
  }, [])

  function resetForm() {
    setClientId('')
    setDriverName('')
    setLicenseNumber('')
    setCdlExpiration('')
    setMedExpiration('')
    setError('')
  }

  async function onSave(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      if (!clientId) throw new Error('Client UUID is required')
      if (!driverName) throw new Error('Driver Name is required')

      const { error: insertError } = await supabase.from('driver_files').insert({
        client_id: clientId,
        driver_name: driverName,
        license_number: licenseNumber || null,
        cdl_expiration: cdlExpiration || null,
        medical_card_expiration: medExpiration || null,
      })
      if (insertError) throw insertError

      await loadFiles()
      setOpen(false)
      resetForm()
    } catch (e) {
      setError(e.message || 'Failed to create driver file')
    } finally {
      setSaving(false)
    }
  }

  const filtered = files.filter(f => {
    const q = query.toLowerCase()
    const company = f.clients?.company_name?.toLowerCase() || ''
    const driver = f.driver_name?.toLowerCase() || ''
    const uuid = f.client_id?.toLowerCase() || ''
    return company.includes(q) || driver.includes(q) || uuid.includes(q)
  })

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-orbitron font-bold text-2xl text-white">Driver Files</h1>
            <p className="text-gray-400 font-rajdhani">Guardian & Apex Command clients</p>
          </div>
          <Button onClick={() => { resetForm(); setOpen(true) }} className="bg-blue-600 hover:bg-blue-500">
            <span className="inline-flex items-center gap-2">
              <Plus size={16} />
              Add Driver
            </span>
          </Button>
        </div>

        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by company, driver, or client UUID..."
            className="w-full max-w-md rounded-xl border border-white/10 bg-[#0d0d14] pl-10 pr-3 py-2 font-rajdhani text-white outline-none focus:border-blue-500/40"
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d0d14] p-6">
          {loading ? (
             <div className="font-rajdhani text-gray-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="mx-auto max-w-md text-center py-8">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
                <UserCheck className="text-gray-400" size={24} />
              </div>
              <div className="font-orbitron text-sm text-white">No Driver Files Found</div>
              <div className="mt-1 font-rajdhani text-gray-400">Add a driver to get started</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="text-left text-xs font-orbitron tracking-wide text-white/70">
                    <th className="py-3 pr-4">Driver Name</th>
                    <th className="py-3 pr-4">Company</th>
                    <th className="py-3 pr-4">License #</th>
                    <th className="py-3 pr-4">CDL Exp</th>
                    <th className="py-3 pr-4">Med Exp</th>
                    <th className="py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filtered.map((f) => (
                    <tr key={f.id} className="font-rajdhani text-sm text-white/80">
                      <td className="py-3 pr-4 font-medium text-white">{f.driver_name}</td>
                      <td className="py-3 pr-4">
                        <div className="text-white">{f.clients?.company_name || 'Unknown'}</div>
                        <div className="text-xs text-white/50">{f.client_id}</div>
                      </td>
                      <td className="py-3 pr-4">{f.license_number || '—'}</td>
                      <td className="py-3 pr-4">{f.cdl_expiration || '—'}</td>
                      <td className="py-3 pr-4">{f.medical_card_expiration || '—'}</td>
                      <td className="py-3 text-white/50 text-xs">
                        {new Date(f.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Modal open={open} onClose={() => setOpen(false)} title="Add Driver File" widthClass="max-w-xl">
          <form onSubmit={onSave} className="space-y-4">
             {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 font-rajdhani text-red-200">
                {error}
              </div>
            )}
            
            <ClientSelect value={clientId} onChange={setClientId} />

            <Field label="Driver Name">
              <Input value={driverName} onChange={(e) => setDriverName(e.target.value)} required placeholder="John Doe" />
            </Field>

            <Field label="License Number">
              <Input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="DL12345678" />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="CDL Expiration">
                <Input value={cdlExpiration} onChange={(e) => setCdlExpiration(e.target.value)} type="date" />
              </Field>
              <Field label="Medical Card Expiration">
                <Input value={medExpiration} onChange={(e) => setMedExpiration(e.target.value)} type="date" />
              </Field>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <Button type="button" onClick={() => setOpen(false)} className="bg-white/5 hover:bg-white/10">
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-500">
                {saving ? 'Saving...' : 'Add Driver'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  )
}
