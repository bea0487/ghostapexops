import React from 'react'
import { Fuel, Plus, Download, MapPin, Calendar } from 'lucide-react'
import PortalLayout from '../components/PortalLayout'
import { useAuth } from '../context/AuthContext'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import Field from '../../components/Field'
import Input from '../../components/Input'
import { supabase } from '../../lib/supabaseClient'

export default function IFTATracking() {
  const { client, hasIFTAAccess } = useAuth()
  const [records, setRecords] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [showModal, setShowModal] = React.useState(false)
  const [error, setError] = React.useState('')
  const [message, setMessage] = React.useState('')

  // Form state
  const [date, setDate] = React.useState('')
  const [state, setState] = React.useState('')
  const [miles, setMiles] = React.useState('')
  const [gallons, setGallons] = React.useState('')
  const [fuelCost, setFuelCost] = React.useState('')

  async function loadIFTARecords() {
    if (!client?.id || !hasIFTAAccess()) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('ifta_records')
        .select('*')
        .eq('client_id', client.id)
        .order('record_date', { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (e) {
      console.error('Failed to load IFTA records:', e)
      setError('Failed to load IFTA records')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadIFTARecords()
  }, [client?.id])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!client?.id) return

    setError('')
    setMessage('')
    setSaving(true)

    try {
      const { error } = await supabase
        .from('ifta_records')
        .insert({
          client_id: client.id,
          record_date: date,
          state: state.toUpperCase(),
          miles: parseFloat(miles),
          gallons: parseFloat(gallons),
          fuel_cost: parseFloat(fuelCost)
        })

      if (error) throw error

      setMessage('IFTA record added successfully!')
      setDate('')
      setState('')
      setMiles('')
      setGallons('')
      setFuelCost('')
      setShowModal(false)
      
      // Reload records
      setTimeout(() => {
        loadIFTARecords()
        setMessage('')
      }, 2000)
    } catch (e) {
      console.error('Failed to create IFTA record:', e)
      setError(e.message || 'Failed to create IFTA record')
    } finally {
      setSaving(false)
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  function calculateTotalMiles() {
    return records.reduce((sum, record) => sum + (record.miles || 0), 0)
  }

  function calculateTotalGallons() {
    return records.reduce((sum, record) => sum + (record.gallons || 0), 0)
  }

  function calculateTotalCost() {
    return records.reduce((sum, record) => sum + (record.fuel_cost || 0), 0)
  }

  if (!hasIFTAAccess()) {
    return (
      <PortalLayout>
        <div className="space-y-6">
          <div>
            <h1 className="font-orbitron font-bold text-2xl text-white">IFTA Tracking</h1>
            <p className="text-gray-400 font-rajdhani mt-1">International Fuel Tax Agreement reporting</p>
          </div>
          
          <div className="bg-[#0d0d14] border border-yellow-500/20 rounded-xl p-6 text-center">
            <Fuel size={48} className="mx-auto text-yellow-400 mb-4" />
            <h3 className="font-orbitron text-white mb-2">Upgrade Required</h3>
            <p className="text-gray-400 font-rajdhani">
              IFTA tracking is available for Guardian, Apex Command, Virtual Dispatcher, Back Office Command, and A La Carte tiers.
            </p>
          </div>
        </div>
      </PortalLayout>
    )
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-orbitron font-bold text-2xl text-white">IFTA Tracking</h1>
            <p className="text-gray-400 font-rajdhani mt-1">Track fuel purchases and mileage by state</p>
          </div>
          <Button 
            onClick={() => setShowModal(true)}
            className="bg-cyan-600 hover:bg-cyan-500"
          >
            <Plus size={16} className="mr-2" />
            Add Record
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <MapPin size={20} className="text-cyan-400" />
              <span className="text-xs text-cyan-400 font-rajdhani">TOTAL MILES</span>
            </div>
            <p className="text-2xl font-orbitron font-bold text-white">{calculateTotalMiles().toLocaleString()}</p>
            <p className="text-gray-400 font-rajdhani text-sm">This Quarter</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Fuel size={20} className="text-green-400" />
              <span className="text-xs text-green-400 font-rajdhani">TOTAL GALLONS</span>
            </div>
            <p className="text-2xl font-orbitron font-bold text-white">{calculateTotalGallons().toFixed(1)}</p>
            <p className="text-gray-400 font-rajdhani text-sm">Fuel Purchased</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Calendar size={20} className="text-purple-400" />
              <span className="text-xs text-purple-400 font-rajdhani">TOTAL COST</span>
            </div>
            <p className="text-2xl font-orbitron font-bold text-white">${calculateTotalCost().toFixed(2)}</p>
            <p className="text-gray-400 font-rajdhani text-sm">Fuel Expenses</p>
          </div>
        </div>

        <div className="bg-[#0d0d14] border border-cyan-500/20 rounded-xl p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-400 font-rajdhani">Loading IFTA records...</div>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-8">
              <Fuel size={48} className="mx-auto text-gray-500 mb-4" />
              <h3 className="font-orbitron text-white mb-2">No IFTA Records</h3>
              <p className="text-gray-400 font-rajdhani mb-4">Start tracking your fuel purchases and mileage by state.</p>
              <Button 
                onClick={() => setShowModal(true)}
                className="bg-cyan-600 hover:bg-cyan-500"
              >
                <Plus size={16} className="mr-2" />
                Add Your First Record
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-orbitron text-white font-semibold">Recent Records</h3>
                <Button
                  onClick={() => alert('Export functionality will be implemented when file storage is set up.')}
                  className="bg-green-600 hover:bg-green-500 text-sm px-3 py-2"
                >
                  <Download size={14} className="mr-1" />
                  Export
                </Button>
              </div>
              
              {records.map((record) => (
                <div
                  key={record.id}
                  className="border border-white/10 rounded-lg p-4 hover:border-cyan-500/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-orbitron text-white font-semibold">
                          {record.state} - {formatDate(record.record_date)}
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400 font-rajdhani">Miles:</span>
                          <span className="text-white ml-2">{record.miles?.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-rajdhani">Gallons:</span>
                          <span className="text-white ml-2">{record.gallons?.toFixed(1)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-rajdhani">Cost:</span>
                          <span className="text-white ml-2">${record.fuel_cost?.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-rajdhani">MPG:</span>
                          <span className="text-white ml-2">{(record.miles / record.gallons).toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Modal
          open={showModal}
          onClose={() => {
            setShowModal(false)
            setError('')
            setDate('')
            setState('')
            setMiles('')
            setGallons('')
            setFuelCost('')
          }}
          title="Add IFTA Record"
          widthClass="max-w-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Date" required>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </Field>
              
              <Field label="State" required>
                <Input
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="CA, TX, NY, etc."
                  maxLength={2}
                  required
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Miles" required>
                <Input
                  type="number"
                  step="0.1"
                  value={miles}
                  onChange={(e) => setMiles(e.target.value)}
                  placeholder="0.0"
                  required
                />
              </Field>
              
              <Field label="Gallons" required>
                <Input
                  type="number"
                  step="0.01"
                  value={gallons}
                  onChange={(e) => setGallons(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </Field>
              
              <Field label="Fuel Cost" required>
                <Input
                  type="number"
                  step="0.01"
                  value={fuelCost}
                  onChange={(e) => setFuelCost(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </Field>
            </div>

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
                disabled={saving || !date || !state || !miles || !gallons || !fuelCost}
                className="bg-cyan-600 hover:bg-cyan-500"
              >
                {saving ? 'Adding...' : 'Add Record'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </PortalLayout>
  )
}
