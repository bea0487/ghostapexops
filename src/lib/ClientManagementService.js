/**
 * ClientManagementService - Admin client management operations
 * 
 * Handles creating, updating, deactivating clients and retrieving client profiles.
 * Manages both user and client records for complete account setup.
 * 
 * Requirements: 9.5, 9.7, 9.9, 9.10
 */

import { supabase } from './supabaseClient.js'

/**
 * ClientManagementService class for admin client operations
 */
export class ClientManagementService {
  constructor(supabaseInstance = supabase) {
    this.supabase = supabaseInstance
  }

  /**
   * Create a new client (creates both user and client records)
   * 
   * @param {Object} clientData - Client data
   * @param {string} clientData.email - Client email
   * @param {string} clientData.password - Initial password
   * @param {string} clientData.companyName - Company name
   * @param {string} clientData.clientId - Unique client identifier
   * @param {string} clientData.tier - Service tier
   * @returns {Promise<Object>} - Created client record
   * 
   * Requirements: 9.5
   */
  async createClient(clientData) {
    const { email, password, companyName, clientId, tier } = clientData

    if (!email || !password || !companyName || !clientId || !tier) {
      throw new Error('Missing required fields: email, password, companyName, clientId, or tier')
    }

    // Validate tier
    const validTiers = ['wingman', 'guardian', 'apex_command', 'virtual_dispatcher', 'dot_readiness_audit', 'back_office_command']
    if (!validTiers.includes(tier)) {
      throw new Error(`Invalid tier. Must be one of: ${validTiers.join(', ')}`)
    }

    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'client'
          }
        }
      })

      if (authError) {
        throw new Error(`Failed to create user: ${authError.message}`)
      }

      if (!authData.user) {
        throw new Error('User creation failed - no user returned')
      }

      // Create client record
      const { data: client, error: clientError } = await this.supabase
        .from('clients')
        .insert({
          user_id: authData.user.id,
          email,
          company_name: companyName,
          client_id: clientId,
          tier,
          status: 'Active'
        })
        .select()
        .single()

      if (clientError) {
        // If client creation fails, try to delete the auth user
        // Note: This requires admin privileges
        console.error('Failed to create client record, auth user may be orphaned:', clientError)
        throw new Error(`Failed to create client record: ${clientError.message}`)
      }

      return client
    } catch (error) {
      console.error('Error creating client:', error)
      throw error
    }
  }

  /**
   * Update a client's tier
   * 
   * @param {string} clientId - Client ID (UUID)
   * @param {string} newTier - New service tier
   * @returns {Promise<Object>} - Updated client record
   * 
   * Requirements: 9.7
   */
  async updateClientTier(clientId, newTier) {
    if (!clientId || !newTier) {
      throw new Error('Client ID and new tier are required')
    }

    // Validate tier
    const validTiers = ['wingman', 'guardian', 'apex_command', 'virtual_dispatcher', 'dot_readiness_audit', 'back_office_command']
    if (!validTiers.includes(newTier)) {
      throw new Error(`Invalid tier. Must be one of: ${validTiers.join(', ')}`)
    }

    try {
      const { data: client, error } = await this.supabase
        .from('clients')
        .update({ tier: newTier })
        .eq('id', clientId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update client tier: ${error.message}`)
      }

      return client
    } catch (error) {
      console.error('Error updating client tier:', error)
      throw error
    }
  }

  /**
   * Deactivate a client (updates status and revokes access)
   * 
   * @param {string} clientId - Client ID (UUID)
   * @returns {Promise<Object>} - Updated client record
   * 
   * Requirements: 9.9
   */
  async deactivateClient(clientId) {
    if (!clientId) {
      throw new Error('Client ID is required')
    }

    try {
      const { data: client, error } = await this.supabase
        .from('clients')
        .update({ status: 'Inactive' })
        .eq('id', clientId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to deactivate client: ${error.message}`)
      }

      // Note: To fully revoke access, we would also need to invalidate their session
      // This can be done by calling supabase.auth.admin.deleteUser() or similar
      // For now, we just update the status which will be checked on subsequent requests

      return client
    } catch (error) {
      console.error('Error deactivating client:', error)
      throw error
    }
  }

  /**
   * Reactivate a client
   * 
   * @param {string} clientId - Client ID (UUID)
   * @returns {Promise<Object>} - Updated client record
   */
  async reactivateClient(clientId) {
    if (!clientId) {
      throw new Error('Client ID is required')
    }

    try {
      const { data: client, error } = await this.supabase
        .from('clients')
        .update({ status: 'Active' })
        .eq('id', clientId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to reactivate client: ${error.message}`)
      }

      return client
    } catch (error) {
      console.error('Error reactivating client:', error)
      throw error
    }
  }

  /**
   * Get a client's complete profile with all associated data
   * 
   * @param {string} clientId - Client ID (UUID)
   * @returns {Promise<Object>} - Client profile with associated data
   * 
   * Requirements: 9.10
   */
  async getClientProfile(clientId) {
    if (!clientId) {
      throw new Error('Client ID is required')
    }

    try {
      // Get client record
      const { data: client, error: clientError } = await this.supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single()

      if (clientError || !client) {
        const notFoundError = new Error('Client not found')
        notFoundError.code = 'RESOURCE_NOT_FOUND'
        throw notFoundError
      }

      // Get associated data in parallel
      const [
        { data: documents },
        { data: tickets },
        { data: eldReports },
        { data: iftaRecords },
        { data: driverFiles },
        { data: csaScores }
      ] = await Promise.all([
        this.supabase.from('documents').select('*').eq('client_id', clientId).order('uploaded_at', { ascending: false }).limit(10),
        this.supabase.from('support_tickets').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(10),
        this.supabase.from('eld_reports').select('*').eq('client_id', clientId).order('week_start', { ascending: false }).limit(5),
        this.supabase.from('ifta_records').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(5),
        this.supabase.from('driver_files').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(10),
        this.supabase.from('csa_scores').select('*').eq('client_id', clientId).order('score_date', { ascending: false }).limit(5)
      ])

      return {
        ...client,
        documents: documents || [],
        tickets: tickets || [],
        eldReports: eldReports || [],
        iftaRecords: iftaRecords || [],
        driverFiles: driverFiles || [],
        csaScores: csaScores || []
      }
    } catch (error) {
      console.error('Error getting client profile:', error)
      throw error
    }
  }

  /**
   * Get all clients with optional filters
   * 
   * @param {Object} filters - Optional filters
   * @param {string} filters.status - Filter by status
   * @param {string} filters.tier - Filter by tier
   * @param {number} filters.limit - Limit results
   * @param {number} filters.offset - Offset for pagination
   * @returns {Promise<Array>} - Array of client records
   */
  async listClients(filters = {}) {
    try {
      let query = this.supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.tier) {
        query = query.eq('tier', filters.tier)
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data: clients, error } = await query

      if (error) {
        throw new Error(`Failed to list clients: ${error.message}`)
      }

      return clients || []
    } catch (error) {
      console.error('Error listing clients:', error)
      throw error
    }
  }

  /**
   * Update client information
   * 
   * @param {string} clientId - Client ID (UUID)
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} - Updated client record
   */
  async updateClient(clientId, updates) {
    if (!clientId) {
      throw new Error('Client ID is required')
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new Error('No updates provided')
    }

    // Prevent updating certain fields
    const allowedFields = ['company_name', 'tier', 'status', 'eld_provider', 'eld_api_key', 'stripe_customer_id', 'stripe_subscription_id']
    const filteredUpdates = {}
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key]
      }
    })

    if (Object.keys(filteredUpdates).length === 0) {
      throw new Error('No valid fields to update')
    }

    try {
      const { data: client, error } = await this.supabase
        .from('clients')
        .update(filteredUpdates)
        .eq('id', clientId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update client: ${error.message}`)
      }

      return client
    } catch (error) {
      console.error('Error updating client:', error)
      throw error
    }
  }

  /**
   * Get client by client_id (unique identifier)
   * 
   * @param {string} clientId - Client unique identifier (not UUID)
   * @returns {Promise<Object>} - Client record
   */
  async getClientByClientId(clientId) {
    if (!clientId) {
      throw new Error('Client ID is required')
    }

    try {
      const { data: client, error } = await this.supabase
        .from('clients')
        .select('*')
        .eq('client_id', clientId)
        .single()

      if (error || !client) {
        const notFoundError = new Error('Client not found')
        notFoundError.code = 'RESOURCE_NOT_FOUND'
        throw notFoundError
      }

      return client
    } catch (error) {
      console.error('Error getting client by client_id:', error)
      throw error
    }
  }

  /**
   * Get client by email
   * 
   * @param {string} email - Client email
   * @returns {Promise<Object>} - Client record
   */
  async getClientByEmail(email) {
    if (!email) {
      throw new Error('Email is required')
    }

    try {
      const { data: client, error } = await this.supabase
        .from('clients')
        .select('*')
        .eq('email', email)
        .single()

      if (error || !client) {
        const notFoundError = new Error('Client not found')
        notFoundError.code = 'RESOURCE_NOT_FOUND'
        throw notFoundError
      }

      return client
    } catch (error) {
      console.error('Error getting client by email:', error)
      throw error
    }
  }
}

// Export singleton instance
export const clientManagementService = new ClientManagementService()
