import React from 'react'
import { Activity, Plus, Search } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import Field from '../../components/Field'
import Input from '../../components/Input'
import ClientSelect from '../../components/ClientSelect'
import { supabase } from '../../lib/supabaseClient'

export default function AdminCsaScores() {
  const [open, setOpen] = React.useState(false)
  const [scores, setScores] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [query, setQuery] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState('')

  // Form
  const [clientId, setClientId] = React.useState('')
  const [scoreDate, setScoreDate] = React.useState('')
  const [unsafeDriving, setUnsafeDriving] = React.useState('')
  const [crashIndicator, setCrashIndicator] = React.useState('')
  const [hosCompliance, setHosCompliance] = React.useState('')
  const [vehicleMaint, setVehicleMaint] = React.useState('')
  const [substances, setSubstances] = React.useState('')
  const [hazmat, setHazmat] = React.useState('')
  const [driverFitness, setDriverFitness] = React.useState('')

  async function loadScores() {
    if (!supabase) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('csa_scores')
        .select(`
          *,
          clients (
            company_name,
            email
          )
        `)
        .order('score_date', { ascending: false })

      if (error) throw error
      setScores(data || [])
    } catch (e) {
      console.error('Failed to load CSA scores', e)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadScores()
  }, [])

  function resetForm() {
    setClientId('')
    setScoreDate(new Date().toISOString().split('T')[0])
    setUnsafeDriving('')
    setCrashIndicator('')
    setHosCompliance('')
    setVehicleMaint('')
    setSubstances('')
    setHazmat('')
    setDriverFitness('')
    setError('')
  }

  async function onSave(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (!clientId) throw new Error('Client UUID is required')
      if (!scoreDate) throw new Error('Score Date is required')

      const { error: insertError } = await supabase.from('csa_scores').insert({
        client_id: clientId,
        score_date: scoreDate,
        unsafe_driving: unsafeDriving ? parseFloat(unsafeDriving) : 0,
        crash_indicator: crashIndicator ? parseFloat(crashIndicator) : 0,
        hos_compliance: hosCompliance ? parseFloat(hosCompliance) : 0,
        vehicle_maint: vehicleMaint ? parseFloat(vehicleMaint) : 0,
        substances: substances ? parseFloat(substances) : 0,
        hazmat: hazmat ? parseFloat(hazmat) : 0,
        driver_fitness: driverFitness ? parseFloat(driverFitness) : 0,
      })
      if (insertError) throw insertError

      await loadScores()
      setOpen(false)
      resetForm()
    } catch (e) {
      setError(e.message || 'Failed to create CSA score')
    } finally {
      setSaving(false)
    }
  }

  const filtered = scores.filter(s => {
    const q = query.toLowerCase()
    const company = s.clients?.company_name?.toLowerCase() || ''
    const uuid = s.client_id?.toLowerCase() || ''
    return company.includes(q) || uuid.includes(q)
  })

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-orbitron font-bold text-2xl text-white">CSA Scores</h1>
            <p className="text-gray-400 font-rajdhani">Apex Command clients</p>
          </div>
          <Button onClick={() => { resetForm(); setOpen(true) }} className="bg-red-600 hover:bg-red-500">
            <span className="inline-flex items-center gap-2">
              <Plus size={16} />
              Add Score
            </span>
          </Button>
        </div>

        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by company or client UUID..."
            className="w-full max-w-md rounded-xl border border-white/10 bg-[#0d0d14] pl-10 pr-3 py-2 font-rajdhani text-white outline-none focus:border-red-500/40"
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d0d14] p-6">
          {loading ? (
             <div className="font-rajdhani text-gray-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="mx-auto max-w-md text-center py-8">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
                <Activity className="text-gray-400" size={24} />
              </div>
              <div className="font-orbitron text-sm text-white">No CSA Scores Found</div>
              <div className="mt-1 font-rajdhani text-gray-400">Add a score to get started</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="text-left text-xs font-orbitron tracking-wide text-white/70">
                    <th className="py-3 pr-4">Company</th>
                    <th className="py-3 pr-4">Date</th>
                    <th className="py-3 pr-4">Unsafe</th>
                    <th className="py-3 pr-4">Crash</th>
                    <th className="py-3 pr-4">HOS</th>
                    <th className="py-3 pr-4">Maint</th>
                    <th className="py-3 pr-4">Drugs</th>
                    <th className="py-3 pr-4">Hazmat</th>
                    <th className="py-3">Fitness</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filtered.map((s) => (
                    <tr key={s.id} className="font-rajdhani text-sm text-white/80">
                      <td className="py-3 pr-4">
                        <div className="text-white font-medium">{s.clients?.company_name || 'Unknown'}</div>
                        <div className="text-xs text-white/50">{s.client_id}</div>
                      </td>
                      <td className="py-3 pr-4 text-white/60">
                        {new Date(s.score_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 pr-4">{s.unsafe_driving}</td>
                      <td className="py-3 pr-4">{s.crash_indicator}</td>
                      <td className="py-3 pr-4">{s.hos_compliance}</td>
                      <td className="py-3 pr-4">{s.vehicle_maint}</td>
                      <td className="py-3 pr-4">{s.substances}</td>
                      <td className="py-3 pr-4">{s.hazmat}</td>
                      <td className="py-3">{s.driver_fitness}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Modal open={open} onClose={() => setOpen(false)} title="Add CSA Score" widthClass="max-w-2xl">
          <form onSubmit={onSave} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 font-rajdhani text-red-200">
                {error}
              </div>
            )}
            
            <div className="grid gap-4 md:grid-cols-2">
              <ClientSelect value={clientId} onChange={setClientId} />
              <Field label="Score Date">
                <Input type="date" value={scoreDate} onChange={(e) => setScoreDate(e.target.value)} required />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Unsafe Driving">
                <Input type="number" step="0.01" value={unsafeDriving} onChange={(e) => setUnsafeDriving(e.target.value)} placeholder="0.00" />
              </Field>
              <Field label="Crash Indicator">
                <Input type="number" step="0.01" value={crashIndicator} onChange={(e) => setCrashIndicator(e.target.value)} placeholder="0.00" />
              </Field>
              <Field label="HOS Compliance">
                <Input type="number" step="0.01" value={hosCompliance} onChange={(e) => setHosCompliance(e.target.value)} placeholder="0.00" />
              </Field>
              <Field label="Vehicle Maint">
                <Input type="number" step="0.01" value={vehicleMaint} onChange={(e) => setVehicleMaint(e.target.value)} placeholder="0.00" />
              </Field>
              <Field label="Substances/Alc">
                <Input type="number" step="0.01" value={substances} onChange={(e) => setSubstances(e.target.value)} placeholder="0.00" />
              </Field>
              <Field label="Hazmat">
                <Input type="number" step="0.01" value={hazmat} onChange={(e) => setHazmat(e.target.value)} placeholder="0.00" />
              </Field>
              <Field label="Driver Fitness">
                <Input type="number" step="0.01" value={driverFitness} onChange={(e) => setDriverFitness(e.target.value)} placeholder="0.00" />
              </Field>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <Button type="button" onClick={() => setOpen(false)} className="bg-white/5 hover:bg-white/10">
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-red-600 hover:bg-red-500">
                {saving ? 'Saving...' : 'Add Score'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  )
}
