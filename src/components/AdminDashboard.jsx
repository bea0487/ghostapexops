import React, { useState, useEffect } from 'react'
import { useAuth } from '../portal/context/AuthContext'
import { getAllClients, createClient, updateClientTier, createELDReport } from '../lib/clientManagement'
import { supabase } from '../lib/supabaseClient'
import { useToast } from '../hooks/use-toast'
import AdminLayout from '../components/AdminLayout'
import AdminSetup from '../components/AdminSetup'
import ClientCreationDebug from '../components/ClientCreationDebug'
import Button from './Button'
import Input from './Input'
import Field from './Field'
import Modal from './Modal'

const TIER_OPTIONS = [
  { value: 'wingman', label: 'Wingman' },
  { value: 'guardian', label: 'Guardian' },
  { value: 'apex_command', label: 'Apex Command' },
  { value: 'virtual_dispatcher', label: 'Virtual Dispatcher' },
  { value: 'ala_carte', label: 'A La Carte' },
  { value: 'eld_monitoring_only', label: 'ELD Monitoring Only' },
  { value: 'back_office_command', label: 'Back Office Command' },
  { value: 'dot_readiness_audit', label: 'DOT Readiness Audit' }
]

export default function AdminDashboard() {
  const { isAdmin } = useAuth()
  const { toast } = useToast()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // New client form
  const [newClient, setNewClient] = useState({
    email: '',
    companyName: '',
    clientId: '',
    tier: 'wingman'
  })

  // New report form
  const [newReport, setNewReport] = useState({
    weekStart: '',
    violations: 0,
    correctiveActions: '',
    reportNotes: ''
  })

  useEffect(() => {
    if (isAdmin) {
      loadClients()
    }
  }, [isAdmin])

  // Form validation function
  const validateForm = (data) => {
    const errors = {}
    
    // Email validation
    if (!data.email?.trim()) {
      errors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errors.email = 'Please enter a valid email address'
    }
    
    // Company name validation
    if (!data.companyName?.trim()) {
      errors.companyName = 'Company name is required'
    } else if (data.companyName.trim().length < 2) {
      errors.companyName = 'Company name must be at least 2 characters'
    }
    
    // Client ID validation
    if (!data.clientId?.trim()) {
      errors.clientId = 'Client ID is required'
    } else if (!/^[A-Za-z0-9-]+$/.test(data.clientId.trim())) {
      errors.clientId = 'Client ID can only contain letters, numbers, and hyphens'
    } else if (data.clientId.trim().length < 3) {
      errors.clientId = 'Client ID must be at least 3 characters'
    }
    
    return errors
  }

  // Handle form input changes with real-time validation
  const handleInputChange = (field, value) => {
    const updatedClient = { ...newClient, [field]: value }
    setNewClient(updatedClient)
    
    // Clear specific field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
    
    // Real-time validation for the changed field
    const fieldErrors = validateForm(updatedClient)
    if (fieldErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: fieldErrors[field] }))
    }
  }

  const loadClients = async () => {
    setLoading(true)
    const result = await getAllClients()
    if (result.success) {
      setClients(result.clients)
    } else {
      setError(result.error)
      toast({
        title: "Error loading clients",
        description: result.error,
        variant: "destructive"
      })
    }
    setLoading(false)
  }

  const handleCreateClient = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    console.log('=== CLIENT CREATION DEBUG ===')
    console.log('Form data:', newClient)

    try {
      // Validate form
      const validationErrors = validateForm(newClient)
      if (Object.keys(validationErrors).length > 0) {
        setFormErrors(validationErrors)
        setError('Please fix the form errors before submitting')
        return
      }

      // Clear any previous form errors
      setFormErrors({})

      // Check if user is actually admin
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Current session user:', session?.user?.email)
      console.log('User app_metadata:', session?.user?.app_metadata)
      console.log('Is admin check:', session?.user?.app_metadata?.role === 'admin')
      
      if (session?.user?.app_metadata?.role !== 'admin') {
        setError('You must be an admin to create clients. Please refresh the page after setting up admin access.')
        return
      }

      console.log('Calling createClient function...')
      const result = await createClient(newClient)
      console.log('Client creation result:', result)
      
      if (result.success) {
        const successMsg = result.message || `Client created successfully! Invitation sent to ${newClient.email}`
        setSuccess(successMsg)
        toast({
          title: "Client Created",
          description: successMsg,
          variant: "success"
        })
        setNewClient({ email: '', companyName: '', clientId: '', tier: 'wingman' })
        setShowCreateModal(false)
        loadClients()
      } else {
        console.error('Client creation failed:', result.error)
        
        // Handle specific error types
        let errorMsg = result.error
        if (result.error.includes('already exists') || result.error.includes('duplicate')) {
          errorMsg = 'A client with this email or ID already exists. Please use different values.'
        } else if (result.error.includes('invalid email') || result.error.includes('email')) {
          errorMsg = 'The email address format is invalid. Please check and try again.'
        } else if (result.error.includes('unauthorized') || result.error.includes('forbidden')) {
          errorMsg = 'You do not have permission to create clients. Please contact an administrator.'
        } else if (result.error.includes('network') || result.error.includes('fetch')) {
          errorMsg = 'Network error. Please check your connection and try again.'
        }
        
        setError(errorMsg)
        toast({
          title: "Client Creation Failed",
          description: errorMsg,
          variant: "destructive"
        })
      }
    } catch (err) {
      console.error('Client creation exception:', err)
      const errorMsg = 'An unexpected error occurred. Please try again or contact support.'
      setError(errorMsg)
      toast({
        title: "Unexpected Error",
        description: errorMsg,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateTier = async (clientId, newTier) => {
    const result = await updateClientTier(clientId, newTier)
    if (result.success) {
      setSuccess('Client tier updated successfully!')
      loadClients()
    } else {
      setError(result.error)
    }
  }

  const handleCreateReport = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const result = await createELDReport({
      clientId: selectedClient.id,
      ...newReport
    })

    if (result.success) {
      setSuccess('ELD Report created successfully!')
      setNewReport({ weekStart: '', violations: 0, correctiveActions: '', reportNotes: '' })
      setShowReportModal(false)
      setSelectedClient(null)
    } else {
      setError(result.error)
    }
  }

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="p-8">
          <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>
          <AdminSetup />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <div className="flex space-x-3">
          <Button onClick={() => window.location.reload()} variant="cyberOutline">
            Refresh Page
          </Button>
          <Button onClick={() => setShowCreateModal(true)} variant="cyber">
            Create New Client
          </Button>
        </div>
      </div>

      <ClientCreationDebug />

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="text-gray-400">Loading clients...</div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Client ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {client.company_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {client.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {client.client_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <label htmlFor={`tier-select-${client.id}`} className="sr-only">
                      Change tier for {client.company_name}
                    </label>
                    <select
                      id={`tier-select-${client.id}`}
                      name={`tier-${client.id}`}
                      value={client.tier}
                      onChange={(e) => handleUpdateTier(client.id, e.target.value)}
                      className="bg-gray-600 text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      aria-label={`Change service tier for ${client.company_name}`}
                    >
                      {TIER_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Button
                      size="sm"
                      variant="cyberOutline"
                      onClick={() => {
                        setSelectedClient(client)
                        setShowReportModal(true)
                      }}
                    >
                      Create Report
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Client Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setFormErrors({})
          setError('')
          setSuccess('')
        }}
        title="Create New Client"
      >
        <form onSubmit={handleCreateClient} noValidate className="space-y-4">
          <Field 
            label="Email Address" 
            htmlFor="client-email"
            required
            error={formErrors.email}
          >
            <Input
              id="client-email"
              name="email"
              type="email"
              value={newClient.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="client@company.com"
              required
              disabled={isSubmitting}
            />
          </Field>
          
          <Field 
            label="Company Name" 
            htmlFor="client-company"
            required
            error={formErrors.companyName}
          >
            <Input
              id="client-company"
              name="companyName"
              value={newClient.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              placeholder="Company Name"
              required
              disabled={isSubmitting}
            />
          </Field>
          
          <Field 
            label="Client ID" 
            htmlFor="client-id"
            required
            error={formErrors.clientId}
            hint="Letters, numbers, and hyphens only"
          >
            <Input
              id="client-id"
              name="clientId"
              value={newClient.clientId}
              onChange={(e) => handleInputChange('clientId', e.target.value)}
              placeholder="DOT-12345 or CUSTOM-ID"
              pattern="[A-Za-z0-9-]+"
              title="Client ID can only contain letters, numbers, and hyphens"
              required
              disabled={isSubmitting}
            />
          </Field>
          
          <Field 
            label="Service Tier" 
            htmlFor="client-tier"
          >
            <select
              id="client-tier"
              name="tier"
              value={newClient.tier}
              onChange={(e) => handleInputChange('tier', e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
            >
              {TIER_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="cyberGhost" 
              onClick={() => {
                setShowCreateModal(false)
                setFormErrors({})
                setError('')
                setSuccess('')
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="cyber"
              disabled={isSubmitting || Object.keys(formErrors).length > 0}
            >
              {isSubmitting ? 'Creating Client...' : 'Create Client'}
            </Button>
          </div>
          
          {error && (
            <div className="mt-4 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mt-4 bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded">
              {success}
            </div>
          )}
        </form>
      </Modal>

      {/* Create Report Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false)
          setSelectedClient(null)
        }}
        title={`Create ELD Report for ${selectedClient?.company_name}`}
      >
        <form onSubmit={handleCreateReport} className="space-y-4">
          <Field 
            label="Week Start Date" 
            htmlFor="report-week-start"
            required
          >
            <Input
              id="report-week-start"
              name="weekStart"
              type="date"
              value={newReport.weekStart}
              onChange={(e) => setNewReport({ ...newReport, weekStart: e.target.value })}
              required
            />
          </Field>
          
          <Field 
            label="Violations Count" 
            htmlFor="report-violations"
          >
            <Input
              id="report-violations"
              name="violations"
              type="number"
              min="0"
              value={newReport.violations}
              onChange={(e) => setNewReport({ ...newReport, violations: parseInt(e.target.value) || 0 })}
            />
          </Field>
          
          <Field 
            label="Corrective Actions" 
            htmlFor="report-actions"
          >
            <textarea
              id="report-actions"
              name="correctiveActions"
              value={newReport.correctiveActions}
              onChange={(e) => setNewReport({ ...newReport, correctiveActions: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              rows="3"
              placeholder="Describe any corrective actions taken..."
            />
          </Field>
          
          <Field 
            label="Report Notes" 
            htmlFor="report-notes"
          >
            <textarea
              id="report-notes"
              name="reportNotes"
              value={newReport.reportNotes}
              onChange={(e) => setNewReport({ ...newReport, reportNotes: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              rows="3"
              placeholder="Additional notes about this report..."
            />
          </Field>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="cyberGhost" 
              onClick={() => {
                setShowReportModal(false)
                setSelectedClient(null)
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="cyber">Create Report</Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  )
}