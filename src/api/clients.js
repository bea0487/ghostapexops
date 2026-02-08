/**
 * Client API
 * 
 * Provides client management endpoints for retrieving and managing client data.
 * 
 * Requirements: 13.4, 13.5, 13.6, 13.7
 */

import { clientManagementService } from '../lib/ClientManagementService.js'
import { supabase } from '../lib/supabaseClient.js'

/**
 * Check if user is admin
 */
async function isAdmin() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.user_metadata?.role === 'admin'
}

/**
 * Get current user's client ID
 */
async function getCurrentClientId() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', session.user.id)
    .single()

  return client?.id || null
}

/**
 * GET /api/clients/me
 * Get authenticated client's profile
 * 
 * @returns {Promise<Object>} - Client profile data
 * 
 * Requirements: 13.4
 */
export async function getMyProfile() {
  try {
    const clientId = await getCurrentClientId()

    if (!clientId) {
      return {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authenticated as a client',
          status: 401
        }
      }
    }

    const profile = await clientManagementService.getClientProfile(clientId)

    return {
      data: profile,
      status: 200
    }
  } catch (error) {
    if (error.code === 'RESOURCE_NOT_FOUND') {
      return {
        error: {
          code: 'NOT_FOUND',
          message: 'Client profile not found',
          status: 404
        }
      }
    }

    return {
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to get client profile',
        status: 500
      }
    }
  }
}

/**
 * GET /api/clients
 * Get all clients (admin only)
 * 
 * @param {Object} filters - Optional filters
 * @returns {Promise<Object>} - List of clients
 * 
 * Requirements: 13.5
 */
export async function listClients(filters = {}) {
  try {
    const admin = await isAdmin()

    if (!admin) {
      return {
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required',
          status: 403
        }
      }
    }

    const clients = await clientManagementService.listClients(filters)

    return {
      data: clients,
      status: 200
    }
  } catch (error) {
    return {
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to list clients',
        status: 500
      }
    }
  }
}

/**
 * POST /api/clients
 * Create a new client (admin only)
 * 
 * @param {Object} clientData - Client data
 * @returns {Promise<Object>} - Created client
 * 
 * Requirements: 13.6
 */
export async function createClient(clientData) {
  try {
    const admin = await isAdmin()

    if (!admin) {
      return {
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required',
          status: 403
        }
      }
    }

    const { email, password, companyName, clientId, tier } = clientData

    if (!email || !password || !companyName || !clientId || !tier) {
      return {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: email, password, companyName, clientId, or tier',
          status: 400
        }
      }
    }

    const client = await clientManagementService.createClient(clientData)

    return {
      data: client,
      status: 201
    }
  } catch (error) {
    return {
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to create client',
        status: 500
      }
    }
  }
}

/**
 * PATCH /api/clients/:id
 * Update a client's information (admin only)
 * 
 * @param {string} clientId - Client ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} - Updated client
 * 
 * Requirements: 13.7
 */
export async function updateClient(clientId, updates) {
  try {
    const admin = await isAdmin()

    if (!admin) {
      return {
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required',
          status: 403
        }
      }
    }

    if (!clientId) {
      return {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Client ID is required',
          status: 400
        }
      }
    }

    const client = await clientManagementService.updateClient(clientId, updates)

    return {
      data: client,
      status: 200
    }
  } catch (error) {
    if (error.code === 'RESOURCE_NOT_FOUND') {
      return {
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found',
          status: 404
        }
      }
    }

    return {
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to update client',
        status: 500
      }
    }
  }
}

/**
 * GET /api/clients/:id
 * Get a specific client's profile (admin only)
 * 
 * @param {string} clientId - Client ID
 * @returns {Promise<Object>} - Client profile
 */
export async function getClient(clientId) {
  try {
    const admin = await isAdmin()

    if (!admin) {
      return {
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required',
          status: 403
        }
      }
    }

    if (!clientId) {
      return {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Client ID is required',
          status: 400
        }
      }
    }

    const profile = await clientManagementService.getClientProfile(clientId)

    return {
      data: profile,
      status: 200
    }
  } catch (error) {
    if (error.code === 'RESOURCE_NOT_FOUND') {
      return {
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found',
          status: 404
        }
      }
    }

    return {
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to get client',
        status: 500
      }
    }
  }
}

/**
 * POST /api/clients/:id/deactivate
 * Deactivate a client (admin only)
 * 
 * @param {string} clientId - Client ID
 * @returns {Promise<Object>} - Updated client
 */
export async function deactivateClient(clientId) {
  try {
    const admin = await isAdmin()

    if (!admin) {
      return {
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required',
          status: 403
        }
      }
    }

    if (!clientId) {
      return {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Client ID is required',
          status: 400
        }
      }
    }

    const client = await clientManagementService.deactivateClient(clientId)

    return {
      data: client,
      status: 200
    }
  } catch (error) {
    return {
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to deactivate client',
        status: 500
      }
    }
  }
}

/**
 * POST /api/clients/:id/reactivate
 * Reactivate a client (admin only)
 * 
 * @param {string} clientId - Client ID
 * @returns {Promise<Object>} - Updated client
 */
export async function reactivateClient(clientId) {
  try {
    const admin = await isAdmin()

    if (!admin) {
      return {
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required',
          status: 403
        }
      }
    }

    if (!clientId) {
      return {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Client ID is required',
          status: 400
        }
      }
    }

    const client = await clientManagementService.reactivateClient(clientId)

    return {
      data: client,
      status: 200
    }
  } catch (error) {
    return {
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to reactivate client',
        status: 500
      }
    }
  }
}
