/**
 * AuditLogService - Audit logging for admin actions
 * 
 * Tracks all admin actions with immutable audit logs.
 * Provides querying and filtering capabilities for compliance tracking.
 * 
 * Requirements: 9.8, 10.1-10.10
 */

import { supabase } from './supabaseClient.js'

/**
 * Action types for audit logging
 */
export const ACTION_TYPES = {
  CLIENT_CREATED: 'client_created',
  CLIENT_UPDATED: 'client_updated',
  CLIENT_DEACTIVATED: 'client_deactivated',
  CLIENT_REACTIVATED: 'client_reactivated',
  TIER_UPDATED: 'tier_updated',
  DOCUMENT_DELETED: 'document_deleted',
  DOCUMENT_UPLOADED: 'document_uploaded',
  TICKET_ASSIGNED: 'ticket_assigned',
  TICKET_STATUS_UPDATED: 'ticket_status_updated',
  USER_CREATED: 'user_created',
  USER_DELETED: 'user_deleted',
  SETTINGS_UPDATED: 'settings_updated'
}

/**
 * AuditLogService class for audit logging
 */
export class AuditLogService {
  constructor(supabaseInstance = supabase) {
    this.supabase = supabaseInstance
  }

  /**
   * Log an admin action
   * 
   * @param {Object} logData - Log data
   * @param {string} logData.adminId - Admin user ID
   * @param {string} logData.actionType - Type of action (from ACTION_TYPES)
   * @param {string} logData.targetTable - Table affected by the action
   * @param {string} logData.targetId - ID of the affected record
   * @param {Object} logData.changes - Changes made (before/after values)
   * @param {string} logData.ipAddress - IP address of the admin
   * @returns {Promise<Object>} - Created audit log record
   * 
   * Requirements: 10.1-10.6
   */
  async logAction(logData) {
    const { adminId, actionType, targetTable, targetId, changes = {}, ipAddress } = logData

    if (!adminId || !actionType || !targetTable) {
      throw new Error('Missing required fields: adminId, actionType, or targetTable')
    }

    // Validate action type
    if (!Object.values(ACTION_TYPES).includes(actionType)) {
      throw new Error(`Invalid action type. Must be one of: ${Object.values(ACTION_TYPES).join(', ')}`)
    }

    try {
      const { data: log, error } = await this.supabase
        .from('audit_logs')
        .insert({
          admin_id: adminId,
          action_type: actionType,
          target_table: targetTable,
          target_id: targetId,
          changes,
          ip_address: ipAddress
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create audit log: ${error.message}`)
      }

      return log
    } catch (error) {
      console.error('Error logging action:', error)
      throw error
    }
  }

  /**
   * Query audit logs with filters
   * 
   * @param {Object} filters - Optional filters
   * @param {string} filters.adminId - Filter by admin user ID
   * @param {string} filters.actionType - Filter by action type
   * @param {string} filters.targetTable - Filter by target table
   * @param {string} filters.startDate - Filter by start date
   * @param {string} filters.endDate - Filter by end date
   * @param {number} filters.limit - Limit results
   * @param {number} filters.offset - Offset for pagination
   * @returns {Promise<Array>} - Array of audit log records in reverse chronological order
   * 
   * Requirements: 10.8, 10.9
   */
  async queryLogs(filters = {}) {
    try {
      let query = this.supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false }) // Reverse chronological order

      // Apply filters
      if (filters.adminId) {
        query = query.eq('admin_id', filters.adminId)
      }

      if (filters.actionType) {
        query = query.eq('action_type', filters.actionType)
      }

      if (filters.targetTable) {
        query = query.eq('target_table', filters.targetTable)
      }

      if (filters.startDate) {
        query = query.gte('timestamp', filters.startDate)
      }

      if (filters.endDate) {
        query = query.lte('timestamp', filters.endDate)
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data: logs, error } = await query

      if (error) {
        throw new Error(`Failed to query audit logs: ${error.message}`)
      }

      return logs || []
    } catch (error) {
      console.error('Error querying audit logs:', error)
      throw error
    }
  }

  /**
   * Get audit logs for a specific target record
   * 
   * @param {string} targetTable - Target table name
   * @param {string} targetId - Target record ID
   * @returns {Promise<Array>} - Array of audit log records
   */
  async getLogsForTarget(targetTable, targetId) {
    if (!targetTable || !targetId) {
      throw new Error('Target table and target ID are required')
    }

    try {
      const { data: logs, error } = await this.supabase
        .from('audit_logs')
        .select('*')
        .eq('target_table', targetTable)
        .eq('target_id', targetId)
        .order('timestamp', { ascending: false })

      if (error) {
        throw new Error(`Failed to get logs for target: ${error.message}`)
      }

      return logs || []
    } catch (error) {
      console.error('Error getting logs for target:', error)
      throw error
    }
  }

  /**
   * Get audit logs for a specific admin
   * 
   * @param {string} adminId - Admin user ID
   * @param {number} limit - Limit results (default 50)
   * @returns {Promise<Array>} - Array of audit log records
   */
  async getLogsForAdmin(adminId, limit = 50) {
    if (!adminId) {
      throw new Error('Admin ID is required')
    }

    try {
      const { data: logs, error } = await this.supabase
        .from('audit_logs')
        .select('*')
        .eq('admin_id', adminId)
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (error) {
        throw new Error(`Failed to get logs for admin: ${error.message}`)
      }

      return logs || []
    } catch (error) {
      console.error('Error getting logs for admin:', error)
      throw error
    }
  }

  /**
   * Get recent audit logs
   * 
   * @param {number} limit - Number of logs to retrieve (default 100)
   * @returns {Promise<Array>} - Array of recent audit log records
   */
  async getRecentLogs(limit = 100) {
    try {
      const { data: logs, error } = await this.supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (error) {
        throw new Error(`Failed to get recent logs: ${error.message}`)
      }

      return logs || []
    } catch (error) {
      console.error('Error getting recent logs:', error)
      throw error
    }
  }

  /**
   * Get audit log statistics
   * 
   * @param {Object} filters - Optional filters (startDate, endDate)
   * @returns {Promise<Object>} - Audit log statistics
   */
  async getLogStatistics(filters = {}) {
    try {
      let query = this.supabase
        .from('audit_logs')
        .select('action_type, admin_id')

      if (filters.startDate) {
        query = query.gte('timestamp', filters.startDate)
      }

      if (filters.endDate) {
        query = query.lte('timestamp', filters.endDate)
      }

      const { data: logs, error } = await query

      if (error) {
        throw new Error(`Failed to get log statistics: ${error.message}`)
      }

      const stats = {
        total: logs?.length || 0,
        byActionType: {},
        byAdmin: {},
        uniqueAdmins: new Set()
      }

      logs?.forEach(log => {
        // Count by action type
        stats.byActionType[log.action_type] = (stats.byActionType[log.action_type] || 0) + 1
        
        // Count by admin
        stats.byAdmin[log.admin_id] = (stats.byAdmin[log.admin_id] || 0) + 1
        
        // Track unique admins
        stats.uniqueAdmins.add(log.admin_id)
      })

      stats.uniqueAdmins = stats.uniqueAdmins.size

      return stats
    } catch (error) {
      console.error('Error getting log statistics:', error)
      throw error
    }
  }

  /**
   * Helper method to log client creation
   * 
   * @param {string} adminId - Admin user ID
   * @param {string} clientId - Created client ID
   * @param {Object} clientData - Client data
   * @param {string} ipAddress - IP address
   * @returns {Promise<Object>} - Audit log record
   * 
   * Requirements: 10.1
   */
  async logClientCreated(adminId, clientId, clientData, ipAddress) {
    return this.logAction({
      adminId,
      actionType: ACTION_TYPES.CLIENT_CREATED,
      targetTable: 'clients',
      targetId: clientId,
      changes: { created: clientData },
      ipAddress
    })
  }

  /**
   * Helper method to log client update
   * 
   * @param {string} adminId - Admin user ID
   * @param {string} clientId - Updated client ID
   * @param {Object} before - Before values
   * @param {Object} after - After values
   * @param {string} ipAddress - IP address
   * @returns {Promise<Object>} - Audit log record
   * 
   * Requirements: 10.2
   */
  async logClientUpdated(adminId, clientId, before, after, ipAddress) {
    return this.logAction({
      adminId,
      actionType: ACTION_TYPES.CLIENT_UPDATED,
      targetTable: 'clients',
      targetId: clientId,
      changes: { before, after },
      ipAddress
    })
  }

  /**
   * Helper method to log document deletion
   * 
   * @param {string} adminId - Admin user ID
   * @param {string} documentId - Deleted document ID
   * @param {Object} documentData - Document data
   * @param {string} ipAddress - IP address
   * @returns {Promise<Object>} - Audit log record
   * 
   * Requirements: 10.3
   */
  async logDocumentDeleted(adminId, documentId, documentData, ipAddress) {
    return this.logAction({
      adminId,
      actionType: ACTION_TYPES.DOCUMENT_DELETED,
      targetTable: 'documents',
      targetId: documentId,
      changes: { deleted: documentData },
      ipAddress
    })
  }

  /**
   * Helper method to log ticket assignment
   * 
   * @param {string} adminId - Admin user ID
   * @param {string} ticketId - Assigned ticket ID
   * @param {string} assignedTo - Assigned admin ID
   * @param {string} ipAddress - IP address
   * @returns {Promise<Object>} - Audit log record
   * 
   * Requirements: 10.4
   */
  async logTicketAssigned(adminId, ticketId, assignedTo, ipAddress) {
    return this.logAction({
      adminId,
      actionType: ACTION_TYPES.TICKET_ASSIGNED,
      targetTable: 'support_tickets',
      targetId: ticketId,
      changes: { assigned_to: assignedTo },
      ipAddress
    })
  }

  /**
   * Helper method to log tier update
   * 
   * @param {string} adminId - Admin user ID
   * @param {string} clientId - Client ID
   * @param {string} oldTier - Old tier
   * @param {string} newTier - New tier
   * @param {string} ipAddress - IP address
   * @returns {Promise<Object>} - Audit log record
   * 
   * Requirements: 10.5
   */
  async logTierUpdated(adminId, clientId, oldTier, newTier, ipAddress) {
    return this.logAction({
      adminId,
      actionType: ACTION_TYPES.TIER_UPDATED,
      targetTable: 'clients',
      targetId: clientId,
      changes: { before: { tier: oldTier }, after: { tier: newTier } },
      ipAddress
    })
  }
}

// Export singleton instance
export const auditLogService = new AuditLogService()
