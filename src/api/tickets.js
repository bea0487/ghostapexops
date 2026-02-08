/**
 * Ticket API
 * 
 * Provides support ticket endpoints for creating, listing, and messaging.
 * 
 * Requirements: 13.12, 13.13, 13.14
 */

import { ticketService } from '../lib/TicketService.js'
import { messageService } from '../lib/MessageService.js'
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
 * Get current user ID
 */
async function getCurrentUserId() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id || null
}

/**
 * GET /api/tickets
 * Get support tickets for authenticated client
 * 
 * @param {Object} filters - Optional filters
 * @returns {Promise<Object>} - List of tickets
 * 
 * Requirements: 13.12
 */
export async function listTickets(filters = {}) {
  try {
    const admin = await isAdmin()
    const clientId = admin ? null : await getCurrentClientId()

    if (!admin && !clientId) {
      return {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
          status: 401
        }
      }
    }

    const tickets = await ticketService.listTickets(clientId, filters)

    return {
      data: tickets,
      status: 200
    }
  } catch (error) {
    return {
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to list tickets',
        status: 500
      }
    }
  }
}

/**
 * POST /api/tickets
 * Create a new support ticket
 * 
 * @param {Object} ticketData - Ticket data
 * @returns {Promise<Object>} - Created ticket
 * 
 * Requirements: 13.13
 */
export async function createTicket(ticketData) {
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

    const { subject, message, priority } = ticketData

    if (!subject || !message) {
      return {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Subject and message are required',
          status: 400
        }
      }
    }

    const ticket = await ticketService.createTicket({
      clientId,
      subject,
      message,
      priority
    })

    return {
      data: ticket,
      status: 201
    }
  } catch (error) {
    return {
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to create ticket',
        status: 500
      }
    }
  }
}

/**
 * GET /api/tickets/:id
 * Get a specific ticket
 * 
 * @param {string} ticketId - Ticket ID
 * @returns {Promise<Object>} - Ticket record
 */
export async function getTicket(ticketId) {
  try {
    if (!ticketId) {
      return {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Ticket ID is required',
          status: 400
        }
      }
    }

    const ticket = await ticketService.getTicket(ticketId)

    return {
      data: ticket,
      status: 200
    }
  } catch (error) {
    if (error.code === 'RESOURCE_NOT_FOUND') {
      return {
        error: {
          code: 'NOT_FOUND',
          message: 'Ticket not found',
          status: 404
        }
      }
    }

    return {
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to get ticket',
        status: 500
      }
    }
  }
}

/**
 * POST /api/tickets/:id/messages
 * Add a message to a ticket
 * 
 * @param {string} ticketId - Ticket ID
 * @param {Object} messageData - Message data
 * @returns {Promise<Object>} - Created message
 * 
 * Requirements: 13.14
 */
export async function addMessage(ticketId, messageData) {
  try {
    const userId = await getCurrentUserId()
    const admin = await isAdmin()

    if (!userId) {
      return {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
          status: 401
        }
      }
    }

    if (!ticketId) {
      return {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Ticket ID is required',
          status: 400
        }
      }
    }

    const { message, attachment } = messageData

    if (!message) {
      return {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Message is required',
          status: 400
        }
      }
    }

    const newMessage = await messageService.addMessage({
      ticketId,
      senderId: userId,
      senderType: admin ? 'admin' : 'client',
      message,
      attachment
    })

    return {
      data: newMessage,
      status: 201
    }
  } catch (error) {
    if (error.code === 'RESOURCE_NOT_FOUND') {
      return {
        error: {
          code: 'NOT_FOUND',
          message: 'Ticket not found',
          status: 404
        }
      }
    }

    return {
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to add message',
        status: 500
      }
    }
  }
}

/**
 * GET /api/tickets/:id/messages
 * Get all messages for a ticket
 * 
 * @param {string} ticketId - Ticket ID
 * @returns {Promise<Object>} - List of messages
 */
export async function getMessages(ticketId) {
  try {
    if (!ticketId) {
      return {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Ticket ID is required',
          status: 400
        }
      }
    }

    const messages = await messageService.getMessages(ticketId)

    return {
      data: messages,
      status: 200
    }
  } catch (error) {
    return {
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to get messages',
        status: 500
      }
    }
  }
}

/**
 * PATCH /api/tickets/:id/status
 * Update ticket status (admin only)
 * 
 * @param {string} ticketId - Ticket ID
 * @param {string} status - New status
 * @returns {Promise<Object>} - Updated ticket
 */
export async function updateTicketStatus(ticketId, status) {
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

    if (!ticketId || !status) {
      return {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Ticket ID and status are required',
          status: 400
        }
      }
    }

    const ticket = await ticketService.updateTicketStatus(ticketId, status)

    return {
      data: ticket,
      status: 200
    }
  } catch (error) {
    return {
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to update ticket status',
        status: 500
      }
    }
  }
}

/**
 * PATCH /api/tickets/:id/assign
 * Assign ticket to admin (admin only)
 * 
 * @param {string} ticketId - Ticket ID
 * @param {string} adminId - Admin user ID
 * @returns {Promise<Object>} - Updated ticket
 */
export async function assignTicket(ticketId, adminId) {
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

    if (!ticketId || !adminId) {
      return {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Ticket ID and admin ID are required',
          status: 400
        }
      }
    }

    const ticket = await ticketService.assignTicket(ticketId, adminId)

    return {
      data: ticket,
      status: 200
    }
  } catch (error) {
    return {
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to assign ticket',
        status: 500
      }
    }
  }
}
