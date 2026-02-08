/**
 * MessageService - Business logic for ticket messaging
 * 
 * Handles adding messages to tickets, retrieving messages, and managing attachments.
 * Implements ticket reopening logic when new messages are added to resolved tickets.
 * 
 * Requirements: 6.3, 6.5, 6.9, 6.10
 */

import { supabase } from './supabaseClient.js'
import { s3Client } from './S3Client.js'
import { TICKET_STATUS } from './TicketService.js'

/**
 * Valid sender types
 */
export const SENDER_TYPE = {
  ADMIN: 'admin',
  CLIENT: 'client'
}

/**
 * MessageService class for ticket messaging
 */
export class MessageService {
  constructor(supabaseInstance = supabase, s3ClientInstance = s3Client) {
    this.supabase = supabaseInstance
    this.s3 = s3ClientInstance
  }

  /**
   * Add a message to a ticket
   * 
   * @param {Object} messageData - Message data
   * @param {string} messageData.ticketId - Ticket ID
   * @param {string} messageData.senderId - Sender user ID
   * @param {string} messageData.senderType - Sender type (admin or client)
   * @param {string} messageData.message - Message text
   * @param {Object} messageData.attachment - Optional file attachment
   * @returns {Promise<Object>} - Created message record
   * 
   * Requirements: 6.3, 6.9, 6.10
   */
  async addMessage(messageData) {
    const { ticketId, senderId, senderType, message, attachment } = messageData

    if (!ticketId || !senderId || !senderType || !message) {
      throw new Error('Missing required fields: ticketId, senderId, senderType, or message')
    }

    // Validate sender type
    if (!Object.values(SENDER_TYPE).includes(senderType)) {
      throw new Error(`Invalid sender type. Must be one of: ${Object.values(SENDER_TYPE).join(', ')}`)
    }

    try {
      // Get the ticket to check its status
      const { data: ticket, error: ticketError } = await this.supabase
        .from('support_tickets')
        .select('*')
        .eq('id', ticketId)
        .single()

      if (ticketError || !ticket) {
        const notFoundError = new Error('Ticket not found')
        notFoundError.code = 'RESOURCE_NOT_FOUND'
        throw notFoundError
      }

      let attachmentS3Key = null

      // Handle file attachment if provided
      if (attachment) {
        attachmentS3Key = await this.uploadAttachment(ticketId, attachment)
      }

      // Create the message
      const { data: newMessage, error: messageError } = await this.supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticketId,
          sender_id: senderId,
          sender_type: senderType,
          message,
          attachment_s3_key: attachmentS3Key
        })
        .select()
        .single()

      if (messageError) {
        // If message creation fails and we uploaded an attachment, try to clean it up
        if (attachmentS3Key) {
          try {
            await this.s3.deleteFile(attachmentS3Key)
          } catch (cleanupError) {
            console.error('Failed to clean up attachment after message error:', cleanupError)
          }
        }
        throw new Error(`Failed to create message: ${messageError.message}`)
      }

      // Reopen ticket if it was resolved and a new message is added
      // Requirements: 6.10
      if (ticket.status === TICKET_STATUS.RESOLVED || ticket.status === TICKET_STATUS.CLOSED) {
        await this.supabase
          .from('support_tickets')
          .update({ 
            status: TICKET_STATUS.OPEN,
            resolved_at: null
          })
          .eq('id', ticketId)
      }

      return newMessage
    } catch (error) {
      console.error('Error adding message:', error)
      throw error
    }
  }

  /**
   * Upload a message attachment to S3
   * 
   * @param {string} ticketId - Ticket ID
   * @param {Object} file - File object with buffer, name, type
   * @returns {Promise<string>} - S3 key
   * 
   * Requirements: 6.9
   */
  async uploadAttachment(ticketId, file) {
    if (!file || !file.buffer || !file.name) {
      throw new Error('Invalid file object')
    }

    try {
      const timestamp = Date.now()
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const s3Key = `ticket-attachments/${ticketId}/${timestamp}_${sanitizedFileName}`

      await this.s3.uploadFile(s3Key, file.buffer, file.type)

      return s3Key
    } catch (error) {
      console.error('Error uploading attachment:', error)
      throw new Error(`Failed to upload attachment: ${error.message}`)
    }
  }

  /**
   * Get all messages for a ticket in chronological order
   * 
   * @param {string} ticketId - Ticket ID
   * @returns {Promise<Array>} - Array of message records
   * 
   * Requirements: 6.5
   */
  async getMessages(ticketId) {
    if (!ticketId) {
      throw new Error('Ticket ID is required')
    }

    try {
      const { data: messages, error } = await this.supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true }) // Chronological order

      if (error) {
        throw new Error(`Failed to get messages: ${error.message}`)
      }

      return messages || []
    } catch (error) {
      console.error('Error getting messages:', error)
      throw error
    }
  }

  /**
   * Get a pre-signed URL for downloading a message attachment
   * 
   * @param {string} messageId - Message ID
   * @returns {Promise<string>} - Pre-signed URL (valid for 5 minutes)
   * 
   * Requirements: 6.9
   */
  async getAttachmentUrl(messageId) {
    if (!messageId) {
      throw new Error('Message ID is required')
    }

    try {
      // Get message record (RLS will filter by ticket access)
      const { data: message, error } = await this.supabase
        .from('ticket_messages')
        .select('*')
        .eq('id', messageId)
        .single()

      if (error || !message) {
        const notFoundError = new Error('Message not found')
        notFoundError.code = 'RESOURCE_NOT_FOUND'
        throw notFoundError
      }

      if (!message.attachment_s3_key) {
        throw new Error('Message has no attachment')
      }

      // Generate pre-signed URL (valid for 5 minutes)
      const url = await this.s3.getSignedUrl(message.attachment_s3_key, 300)
      return url
    } catch (error) {
      console.error('Error getting attachment URL:', error)
      throw error
    }
  }

  /**
   * Get message count for a ticket
   * 
   * @param {string} ticketId - Ticket ID
   * @returns {Promise<number>} - Message count
   */
  async getMessageCount(ticketId) {
    if (!ticketId) {
      throw new Error('Ticket ID is required')
    }

    try {
      const { count, error } = await this.supabase
        .from('ticket_messages')
        .select('*', { count: 'exact', head: true })
        .eq('ticket_id', ticketId)

      if (error) {
        throw new Error(`Failed to get message count: ${error.message}`)
      }

      return count || 0
    } catch (error) {
      console.error('Error getting message count:', error)
      throw error
    }
  }

  /**
   * Get the latest message for a ticket
   * 
   * @param {string} ticketId - Ticket ID
   * @returns {Promise<Object|null>} - Latest message or null
   */
  async getLatestMessage(ticketId) {
    if (!ticketId) {
      throw new Error('Ticket ID is required')
    }

    try {
      const { data: message, error } = await this.supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw new Error(`Failed to get latest message: ${error.message}`)
      }

      return message || null
    } catch (error) {
      console.error('Error getting latest message:', error)
      throw error
    }
  }

  /**
   * Delete a message attachment from S3
   * 
   * @param {string} messageId - Message ID
   * @returns {Promise<void>}
   */
  async deleteAttachment(messageId) {
    if (!messageId) {
      throw new Error('Message ID is required')
    }

    try {
      // Get message record
      const { data: message, error: fetchError } = await this.supabase
        .from('ticket_messages')
        .select('*')
        .eq('id', messageId)
        .single()

      if (fetchError || !message) {
        const notFoundError = new Error('Message not found')
        notFoundError.code = 'RESOURCE_NOT_FOUND'
        throw notFoundError
      }

      if (!message.attachment_s3_key) {
        throw new Error('Message has no attachment')
      }

      // Delete from S3
      await this.s3.deleteFile(message.attachment_s3_key)

      // Update message record to remove attachment reference
      await this.supabase
        .from('ticket_messages')
        .update({ attachment_s3_key: null })
        .eq('id', messageId)
    } catch (error) {
      console.error('Error deleting attachment:', error)
      throw error
    }
  }
}

// Export singleton instance
export const messageService = new MessageService()
