/**
 * TicketService - Business logic for support ticket operations
 * 
 * Handles ticket creation, retrieval, updates, assignment, and status management.
 * Enforces RLS policies for multi-tenant data isolation.
 * 
 * Requirements: 6.1, 6.5, 6.7, 6.8
 */

import { supabase } from './supabaseClient.js'

/**
 * Valid ticket statuses
 */
export const TICKET_STATUS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed'
}

/**
 * Valid ticket priorities
 */
export const TICKET_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent'
}

/**
 * TicketService class for support ticket management
 */
export class TicketService {
  constructor(supabaseInstance = supabase) {
    this.supabase = supabaseInstance
  }

  /**
   * Create a new support ticket
   * 
   * @param {Object} ticketData - Ticket data
   * @param {string} ticketData.clientId - Client ID
   * @param {string} ticketData.subject - Ticket subject
   * @param {string} ticketData.message - Initial message
   * @param {string} ticketData.priority - Ticket priority (Low, Medium, High, Urgent)
   * @returns {Promise<Object>} - Created ticket record
   * 
   * Requirements: 6.1
   */
  async createTicket(ticketData) {
    const { clientId, subject, message, priority = TICKET_PRIORITY.MEDIUM } = ticketData

    if (!clientId || !subject || !message) {
      throw new Error('Missing required fields: clientId, subject, or message')
    }

    // Validate priority
    if (!Object.values(TICKET_PRIORITY).includes(priority)) {
      throw new Error(`Invalid priority. Must be one of: ${Object.values(TICKET_PRIORITY).join(', ')}`)
    }

    try {
      // Create ticket with status "Open"
      const { data: ticket, error } = await this.supabase
        .from('support_tickets')
        .insert({
          client_id: clientId,
          subject,
          message,
          priority,
          status: TICKET_STATUS.OPEN
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create ticket: ${error.message}`)
      }

      return ticket
    } catch (error) {
      console.error('Error creating ticket:', error)
      throw error
    }
  }

  /**
   * Get a single ticket by ID
   * 
   * @param {string} ticketId - Ticket ID
   * @returns {Promise<Object>} - Ticket record
   * 
   * Requirements: 6.5
   */
  async getTicket(ticketId) {
    if (!ticketId) {
      throw new Error('Ticket ID is required')
    }

    try {
      const { data: ticket, error } = await this.supabase
        .from('support_tickets')
        .select('*')
        .eq('id', ticketId)
        .single()

      if (error || !ticket) {
        const notFoundError = new Error('Ticket not found')
        notFoundError.code = 'RESOURCE_NOT_FOUND'
        throw notFoundError
      }

      return ticket
    } catch (error) {
      console.error('Error getting ticket:', error)
      throw error
    }
  }

  /**
   * List tickets with optional filters
   * 
   * @param {string} clientId - Client ID (optional for admins)
   * @param {Object} filters - Optional filters
   * @param {string} filters.status - Filter by status
   * @param {string} filters.priority - Filter by priority
   * @param {string} filters.assignedTo - Filter by assigned admin
   * @param {number} filters.limit - Limit results
   * @param {number} filters.offset - Offset for pagination
   * @returns {Promise<Array>} - Array of ticket records
   * 
   * Requirements: 6.5
   */
  async listTickets(clientId = null, filters = {}) {
    try {
      let query = this.supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false })

      // Filter by client_id if provided (for client users)
      if (clientId) {
        query = query.eq('client_id', clientId)
      }

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.priority) {
        query = query.eq('priority', filters.priority)
      }

      if (filters.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo)
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data: tickets, error } = await query

      if (error) {
        throw new Error(`Failed to list tickets: ${error.message}`)
      }

      return tickets || []
    } catch (error) {
      console.error('Error listing tickets:', error)
      throw error
    }
  }

  /**
   * Update ticket status
   * 
   * @param {string} ticketId - Ticket ID
   * @param {string} status - New status
   * @returns {Promise<Object>} - Updated ticket record
   * 
   * Requirements: 6.8
   */
  async updateTicketStatus(ticketId, status) {
    if (!ticketId || !status) {
      throw new Error('Ticket ID and status are required')
    }

    // Validate status
    if (!Object.values(TICKET_STATUS).includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${Object.values(TICKET_STATUS).join(', ')}`)
    }

    try {
      const updateData = { status }

      // Set resolved_at timestamp when status is Resolved
      if (status === TICKET_STATUS.RESOLVED) {
        updateData.resolved_at = new Date().toISOString()
      }

      const { data: ticket, error } = await this.supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', ticketId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update ticket status: ${error.message}`)
      }

      return ticket
    } catch (error) {
      console.error('Error updating ticket status:', error)
      throw error
    }
  }

  /**
   * Assign a ticket to an admin
   * 
   * @param {string} ticketId - Ticket ID
   * @param {string} adminId - Admin user ID
   * @returns {Promise<Object>} - Updated ticket record
   * 
   * Requirements: 6.7
   */
  async assignTicket(ticketId, adminId) {
    if (!ticketId || !adminId) {
      throw new Error('Ticket ID and admin ID are required')
    }

    try {
      const { data: ticket, error } = await this.supabase
        .from('support_tickets')
        .update({ assigned_to: adminId })
        .eq('id', ticketId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to assign ticket: ${error.message}`)
      }

      return ticket
    } catch (error) {
      console.error('Error assigning ticket:', error)
      throw error
    }
  }

  /**
   * Update ticket priority
   * 
   * @param {string} ticketId - Ticket ID
   * @param {string} priority - New priority
   * @returns {Promise<Object>} - Updated ticket record
   */
  async updateTicketPriority(ticketId, priority) {
    if (!ticketId || !priority) {
      throw new Error('Ticket ID and priority are required')
    }

    // Validate priority
    if (!Object.values(TICKET_PRIORITY).includes(priority)) {
      throw new Error(`Invalid priority. Must be one of: ${Object.values(TICKET_PRIORITY).join(', ')}`)
    }

    try {
      const { data: ticket, error } = await this.supabase
        .from('support_tickets')
        .update({ priority })
        .eq('id', ticketId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update ticket priority: ${error.message}`)
      }

      return ticket
    } catch (error) {
      console.error('Error updating ticket priority:', error)
      throw error
    }
  }

  /**
   * Get ticket statistics for a client
   * 
   * @param {string} clientId - Client ID
   * @returns {Promise<Object>} - Ticket statistics
   */
  async getTicketStats(clientId) {
    if (!clientId) {
      throw new Error('Client ID is required')
    }

    try {
      const { data: tickets, error } = await this.supabase
        .from('support_tickets')
        .select('status, priority')
        .eq('client_id', clientId)

      if (error) {
        throw new Error(`Failed to get ticket stats: ${error.message}`)
      }

      const stats = {
        total: tickets.length,
        byStatus: {},
        byPriority: {}
      }

      // Count by status
      Object.values(TICKET_STATUS).forEach(status => {
        stats.byStatus[status] = tickets.filter(t => t.status === status).length
      })

      // Count by priority
      Object.values(TICKET_PRIORITY).forEach(priority => {
        stats.byPriority[priority] = tickets.filter(t => t.priority === priority).length
      })

      return stats
    } catch (error) {
      console.error('Error getting ticket stats:', error)
      throw error
    }
  }
}

// Export singleton instance
export const ticketService = new TicketService()
