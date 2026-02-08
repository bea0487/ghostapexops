import React from 'react'
import { AlertTriangle, Plus, Clock, CheckCircle, XCircle, FileText } from 'lucide-react'
import PortalLayout from '../components/PortalLayout'
import { useAuth } from '../context/AuthContext'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import Field from '../../components/Field'
import Input from '../../components/Input'
import TextArea from '../../components/TextArea'
import { supabase } from '../../lib/supabaseClient'

const statusIcons = {
  pending: Clock,
  under_review: AlertTriangle,
  approved: CheckCircle,
  denied: XCircle,
}

const statusColors = {
  pending: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  under_review: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  approved: 'text-green-400 bg-green-500/10 border-green-500/30',
  denied: 'text-red-400 bg-red-500/10 border-red-500/30',
}

export default function DataQDisputes() {
  const { client, hasDataQAccess } = useAuth()
  const [disputes, setDisputes] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [showModal, setShowModal] = React.useState(false)
  const [error, setError] = React.useState('')
  const [message, setMessage] = React.useState('')

  // Form state
  const [violationDate, setViolationDate] = React.useState('')
  const [violationType, setViolationType] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [disputeReason, setDisputeReason] = React.useState('')

  async function loadDisputes() {
    if (!client?.id || !hasDataQAccess()) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('dataq_disputes')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDisputes(data || [])
    } catch (e) {
      console.error('Failed to load DataQ disputes:', e)
      setError('Failed to load DataQ disputes')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadDisputes()
  }, [client?.id])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!client?.id) return

    setError('')
    setMessage('')
    setSaving(true)

    try {
      const { error } = await supabase
        .from('dataq_disputes')
        .insert({
          client_id: client.id,
          violation_date: violationDate,
          violation_type: violationType,
          description: description.trim(),
          dispute_reason: disputeReason.trim(),
          status: 'pending'
        })

      if (error) throw error

      setMessage('DataQ dispute submitted successfully!')
      setViolationDate('')
      setViolationType('')
      setDescription('')
      setDisputeReason('')
      setShowModal(false)
      
      // Reload disputes
      setTimeout(() => {
        loadDisputes()
        setMessage('')
      }, 2000)
    } catch (e) {
      console.error('Failed to create dispute:', e)
      setError(e.message || 'Failed to submit DataQ dispute')
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

  if (!hasDataQAccess()) {
    return (
      <PortalLayout>
        <div className="space-y-6">
          <div>
            <h1 className="font-orbitron font-bold text-2xl text-white">DataQ Disputes</h1>
            <p className="text-gray-400 font-rajdhani mt-1">Challenge inaccurate safety records</p>
          </div>
          
          <div className="bg-[#0d0d14] border border-yellow-500/20 rounded-xl p-6 text-center">
            <AlertTriangle size={48} className="mx-auto text-yellow-400 mb-4" />
            <h3 className="font-orbitron text-white mb-2">Upgrade Required</h3>
            <p className="text-gray-400 font-rajdhani">
              DataQ dispute management is available for Apex Command, Back Office Command, and A La Carte tiers.
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
            <h1 className="font-orbitron font-bold text-2xl text-white">DataQ Disputes</h1>
            <p className="text-gray-400 font-rajdhani mt-1">Challenge inaccurate safety records and violations</p>
          </div>
          <Button 
            onClick={() => setShowModal(true)}
            className="bg-cyan-600 hover:bg-cyan-500"
          >
            <Plus size={16} className="mr-2" />
            New Dispute
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock size={20} className="text-yellow-400" />
              <span className="text-xs text-yellow-400 font-rajdhani">PENDING</span>
            </div>
            <p className="text-2xl font-orbitron font-bold text-white">
              {disputes.filter(d => d.status === 'pending').length}
            </p>
            <p className="text-gray-400 font-rajdhani text-sm">Awaiting Review</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle size={20} className="text-blue-400" />
              <span className="text-xs text-blue-400 font-rajdhani">REVIEWING</span>
            </div>
            <p className="text-2xl font-orbitron font-bold text-white">
              {disputes.filter(d => d.status === 'under_review').length}
            </p>
            <p className="text-gray-400 font-rajdhani text-sm">Under Review</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle size={20} className="text-green-400" />
              <span className="text-xs text-green-400 font-rajdhani">APPROVED</span>
            </div>
            <p className="text-2xl font-orbitron font-bold text-white">
              {disputes.filter(d => d.status === 'approved').length}
            </p>
            <p className="text-gray-400 font-rajdhani text-sm">Successful</p>
          </div>

          <div className="bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <XCircle size={20} className="text-red-400" />
              <span className="text-xs text-red-400 font-rajdhani">DENIED</span>
            </div>
            <p className="text-2xl font-orbitron font-bold text-white">
              {disputes.filter(d => d.status === 'denied').length}
            </p>
            <p className="text-gray-400 font-rajdhani text-sm">Unsuccessful</p>
          </div>
        </div>

        <div className="bg-[#0d0d14] border border-cyan-500/20 rounded-xl p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-400 font-rajdhani">Loading DataQ disputes...</div>
            </div>
          ) : disputes.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={48} className="mx-auto text-gray-500 mb-4" />
              <h3 className="font-orbitron text-white mb-2">No DataQ Disputes</h3>
              <p className="text-gray-400 font-rajdhani mb-4">Submit disputes for inaccurate safety records.</p>
              <Button 
                onClick={() => setShowModal(true)}
                className="bg-cyan-600 hover:bg-cyan-500"
              >
                <Plus size={16} className="mr-2" />
                Submit Your First Dispute
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {disputes.map((dispute) => {
                const StatusIcon = statusIcons[dispute.status] || Clock
                return (
                  <div
                    key={dispute.id}
                    className="border border-white/10 rounded-lg p-4 hover:border-cyan-500/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-orbitron text-white font-semibold">
                            {dispute.violation_type} - {formatDate(dispute.violation_date)}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-rajdhani border ${statusColors[dispute.status]}`}>
                            <StatusIcon size={12} />
                            {dispute.status.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <p className="text-gray-400 font-rajdhani text-sm mb-2">
                          <strong>Description:</strong> {dispute.description}
                        </p>
                        
                        <p className="text-gray-400 font-rajdhani text-sm mb-2">
                          <strong>Dispute Reason:</strong> {dispute.dispute_reason}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500 font-rajdhani">
                          <span>Submitted: {formatDate(dispute.created_at)}</span>
                          {dispute.updated_at !== dispute.created_at && (
                            <span>Updated: {formatDate(dispute.updated_at)}</span>
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
            setViolationDate('')
            setViolationType('')
            setDescription('')
            setDisputeReason('')
          }}
          title="Submit DataQ Dispute"
          widthClass="max-w-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Violation Date" required>
                <Input
                  type="date"
                  value={violationDate}
                  onChange={(e) => setViolationDate(e.target.value)}
                  required
                />
              </Field>
              
              <Field label="Violation Type" required>
                <select
                  value={violationType}
                  onChange={(e) => setViolationType(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-rajdhani text-white outline-none focus:border-cyan-500/40"
                  required
                >
                  <option value="">Select violation type...</option>
                  <option value="Hours of Service">Hours of Service</option>
                  <option value="Vehicle Maintenance">Vehicle Maintenance</option>
                  <option value="Driver Qualification">Driver Qualification</option>
                  <option value="Hazmat">Hazmat</option>
                  <option value="Other">Other</option>
                </select>
              </Field>
            </div>

            <Field label="Violation Description" required>
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the violation that appears on your record..."
                rows={3}
                required
              />
            </Field>

            <Field label="Dispute Reason" required>
              <TextArea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Explain why this violation is inaccurate and should be removed..."
                rows={4}
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
                disabled={saving || !violationDate || !violationType || !description.trim() || !disputeReason.trim()}
                className="bg-cyan-600 hover:bg-cyan-500"
              >
                {saving ? 'Submitting...' : 'Submit Dispute'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </PortalLayout>
  )
}
