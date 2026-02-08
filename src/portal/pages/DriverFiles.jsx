import React from 'react'
import { Users, Plus, Download, Upload, FileText, Calendar, AlertCircle } from 'lucide-react'
import PortalLayout from '../components/PortalLayout'
import { useAuth } from '../context/AuthContext'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import Field from '../../components/Field'
import Input from '../../components/Input'
import { supabase } from '../../lib/supabaseClient'

export default function DriverFiles() {
  const { client, hasDriverFilesAccess } = useAuth()
  const [drivers, setDrivers] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [showModal, setShowModal] = React.useState(false)
  const [error, setError] = React.useState('')
  const [message, setMessage] = React.useState('')

  // Form state
  const [driverName, setDriverName] = React.useState('')
  const [licenseNumber, setLicenseNumber] = React.useState('')
  const [licenseState, setLicenseState] = React.useState('')
  const [licenseExpiry, setLicenseExpiry] = React.useState('')
  const [medicalExpiry, setMedicalExpiry] = React.useState('')
  const [phoneNumber, setPhoneNumber] = React.useState('')

  async function loadDrivers() {
    if (!client?.id || !hasDriverFilesAccess()) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('driver_files')
        .select('*')
        .eq('client_id', client.id)
        .order('driver_name', { ascending: true })

      if (error) throw error
      setDrivers(data || [])
    } catch (e) {
      console.error('Failed to load driver files:', e)
      setError('Failed to load driver files')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadDrivers()
  }, [client?.id])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!client?.id) return

    setError('')
    setMessage('')
    setSaving(true)

    try {
      const { error } = await supabase
        .from('driver_files')
        .insert({
          client_id: client.id,
          driver_name: driverName.trim(),
          license_number: licenseNumber.trim(),
          license_state: licenseState.toUpperCase(),
          license_expiry: licenseExpiry,
          medical_expiry: medicalExpiry,
          phone_number: phoneNumber.trim()
        })

      if (error) throw error

      setMessage('Driver added successfully!')
      setDriverName('')
      setLicenseNumber('')
      setLicenseState('')
      setLicenseExpiry('')
      setMedicalExpiry('')
      setPhoneNumber('')
      setShowModal(false)
      
      // Reload drivers
      setTimeout(() => {
        loadDrivers()
        setMessage('')
      }, 2000)
    } catch (e) {
      console.error('Failed to create driver:', e)
      setError(e.message || 'Failed to add driver')
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

  function isExpiringSoon(dateString, days = 30) {
    const expiryDate = new Date(dateString)
    const today = new Date()
    const diffTime = expiryDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= days && diffDays >= 0
  }

  function isExpired(dateString) {
    const expiryDate = new Date(dateString)
    const today = new Date()
    return expiryDate < today
  }

  function getExpiryStatus(dateString) {
    if (isExpired(dateString)) return 'expired'
    if (isExpiringSoon(dateString)) return 'expiring'
    return 'valid'
  }

  function getExpiryColor(status) {
    switch (status) {
      case 'expired': return 'text-red-400 bg-red-500/10 border-red-500/30'
      case 'expiring': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
      default: return 'text-green-400 bg-green-500/10 border-green-500/30'
    }
  }

  if (!hasDriverFilesAccess()) {
    return (
      <PortalLayout>
        <div className="space-y-6">
          <div>
            <h1 className="font-orbitron font-bold text-2xl text-white">Driver Files</h1>
            <p className="text-gray-400 font-rajdhani mt-1">Manage driver documentation and compliance</p>
          </div>
          
          <div className="bg-[#0d0d14] border border-yellow-500/20 rounded-xl p-6 text-center">
            <Users size={48} className="mx-auto text-yellow-400 mb-4" />
            <h3 className="font-orbitron text-white mb-2">Upgrade Required</h3>
            <p className="text-gray-400 font-rajdhani">
              Driver file management is available for Guardian, Apex Command, Virtual Dispatcher, and Back Office Command tiers.
            </p>
          </div>
        </div>
      </PortalLayout>
    )
  }

  const expiredCount = drivers.filter(d => isExpired(d.license_expiry) || isExpired(d.medical_expiry)).length
  const expiringCount = drivers.filter(d => isExpiringSoon(d.license_expiry) || isExpiringSoon(d.medical_expiry)).length

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-orbitron font-bold text-2xl text-white">Driver Files</h1>
            <p className="text-gray-400 font-rajdhani mt-1">Manage driver documentation and compliance tracking</p>
          </div>
          <Button 
            onClick={() => setShowModal(true)}
            className="bg-cyan-600 hover:bg-cyan-500"
          >
            <Plus size={16} className="mr-2" />
            Add Driver
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

        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Users size={20} className="text-cyan-400" />
              <span className="text-xs text-cyan-400 font-rajdhani">TOTAL DRIVERS</span>
            </div>
            <p className="text-2xl font-orbitron font-bold text-white">{drivers.length}</p>
            <p className="text-gray-400 font-rajdhani text-sm">Active Drivers</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle size={20} className="text-yellow-400" />
              <span className="text-xs text-yellow-400 font-rajdhani">EXPIRING SOON</span>
            </div>
            <p className="text-2xl font-orbitron font-bold text-white">{expiringCount}</p>
            <p className="text-gray-400 font-rajdhani text-sm">Within 30 Days</p>
          </div>

          <div className="bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Calendar size={20} className="text-red-400" />
              <span className="text-xs text-red-400 font-rajdhani">EXPIRED</span>
            </div>
            <p className="text-2xl font-orbitron font-bold text-white">{expiredCount}</p>
            <p className="text-gray-400 font-rajdhani text-sm">Need Renewal</p>
          </div>
        </div>

        <div className="bg-[#0d0d14] border border-cyan-500/20 rounded-xl p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-400 font-rajdhani">Loading driver files...</div>
            </div>
          ) : drivers.length === 0 ? (
            <div className="text-center py-8">
              <Users size={48} className="mx-auto text-gray-500 mb-4" />
              <h3 className="font-orbitron text-white mb-2">No Driver Files</h3>
              <p className="text-gray-400 font-rajdhani mb-4">Add your drivers to track their documentation and compliance.</p>
              <Button 
                onClick={() => setShowModal(true)}
                className="bg-cyan-600 hover:bg-cyan-500"
              >
                <Plus size={16} className="mr-2" />
                Add Your First Driver
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {drivers.map((driver) => {
                const licenseStatus = getExpiryStatus(driver.license_expiry)
                const medicalStatus = getExpiryStatus(driver.medical_expiry)
                const hasIssues = licenseStatus !== 'valid' || medicalStatus !== 'valid'
                
                return (
                  <div
                    key={driver.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      hasIssues ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-white/10 hover:border-cyan-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-orbitron text-white font-semibold text-lg">
                            {driver.driver_name}
                          </h3>
                          {hasIssues && (
                            <AlertCircle size={16} className="text-yellow-400" />
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-gray-400 font-rajdhani text-sm">License</p>
                            <p className="text-white font-rajdhani">{driver.license_number} ({driver.license_state})</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-gray-400 font-rajdhani text-sm">Expires:</span>
                              <span className={`px-2 py-1 rounded text-xs font-rajdhani border ${getExpiryColor(licenseStatus)}`}>
                                {formatDate(driver.license_expiry)}
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-gray-400 font-rajdhani text-sm">Medical Certificate</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-gray-400 font-rajdhani text-sm">Expires:</span>
                              <span className={`px-2 py-1 rounded text-xs font-rajdhani border ${getExpiryColor(medicalStatus)}`}>
                                {formatDate(driver.medical_expiry)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500 font-rajdhani">
                          <span>Phone: {driver.phone_number || 'Not provided'}</span>
                          <span>Added: {formatDate(driver.created_at)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => alert('File upload functionality will be implemented when file storage is set up.')}
                          className="bg-blue-600 hover:bg-blue-500 text-sm px-3 py-2"
                        >
                          <Upload size={14} className="mr-1" />
                          Upload
                        </Button>
                        <Button
                          onClick={() => alert('Download functionality will be implemented when file storage is set up.')}
                          className="bg-green-600 hover:bg-green-500 text-sm px-3 py-2"
                        >
                          <Download size={14} className="mr-1" />
                          Files
                        </Button>
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
            setDriverName('')
            setLicenseNumber('')
            setLicenseState('')
            setLicenseExpiry('')
            setMedicalExpiry('')
            setPhoneNumber('')
          }}
          title="Add Driver"
          widthClass="max-w-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Driver Name" required>
              <Input
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="Full name"
                required
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="License Number" required>
                <Input
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="CDL number"
                  required
                />
              </Field>
              
              <Field label="License State" required>
                <Input
                  value={licenseState}
                  onChange={(e) => setLicenseState(e.target.value)}
                  placeholder="CA, TX, NY, etc."
                  maxLength={2}
                  required
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="License Expiry" required>
                <Input
                  type="date"
                  value={licenseExpiry}
                  onChange={(e) => setLicenseExpiry(e.target.value)}
                  required
                />
              </Field>
              
              <Field label="Medical Certificate Expiry" required>
                <Input
                  type="date"
                  value={medicalExpiry}
                  onChange={(e) => setMedicalExpiry(e.target.value)}
                  required
                />
              </Field>
            </div>

            <Field label="Phone Number">
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="(555) 123-4567"
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
                disabled={saving || !driverName.trim() || !licenseNumber.trim() || !licenseState || !licenseExpiry || !medicalExpiry}
                className="bg-cyan-600 hover:bg-cyan-500"
              >
                {saving ? 'Adding...' : 'Add Driver'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </PortalLayout>
  )
}
