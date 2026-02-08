/**
 * Admin API
 * 
 * Provides admin-only endpoints for dashboard KPIs and audit logs.
 * 
 * Requirements: 13.17, 13.18
 */

import { dashboardService } from '../lib/DashboardService.js'
import { auditLogService } from '../lib/AuditLogService.js'
import { supabase } from '../lib/supabaseClient.js'

/**
 * Check if user is admin
 */
async function isAdmin() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.user_metadata?.role === 'admin'
}

/**
 * GET /api/admin/dashboard
 * Get dashboard KPIs (admin only)
 * 
 * @returns {Promise<Object>} - Dashboard KPIs
 * 
 * Requirements: 13.17
 */
export async function getDashboard() {
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

    const kpis = await dashboardService.getDashboardKPIs()

    return {
      data: kpis,
      status: 200
    }
  } catch (error) {
    return {
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to get dashboard KPIs',
        status: 500
      }
    }
  }
}

/**
 * GET /api/admin/audit-logs
 * Get audit logs with optional filters (admin only)
 * 
 * @param {Object} filters - Optional filters
 * @returns {Promise<Object>} - Audit logs
 * 
 * Requirements: 13.18
 */
export async function getAuditLogs(filters = {}) {
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

    const logs = await auditLogService.queryLogs(filters)

    return {
      data: logs,
      status: 200
    }
  } catch (error) {
    return {
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to get audit logs',
        status: 500
      }
    }
  }
}

/**
 * GET /api/admin/stats
 * Get various admin statistics
 * 
 * @returns {Promise<Object>} - Admin statistics
 */
export async function getStats() {
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

    const [
      clientDistribution,
      ticketStats,
      recentActivity
    ] = await Promise.all([
      dashboardService.getClientDistributionByTier(),
      dashboardService.getTicketStatistics(),
      dashboardService.getRecentActivity()
    ])

    return {
      data: {
        clientDistribution,
        ticketStats,
        recentActivity
      },
      status: 200
    }
  } catch (error) {
    return {
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to get admin stats',
        status: 500
      }
    }
  }
}

/**
 * GET /api/admin/audit-logs/stats
 * Get audit log statistics
 * 
 * @param {Object} filters - Optional filters (startDate, endDate)
 * @returns {Promise<Object>} - Audit log statistics
 */
export async function getAuditLogStats(filters = {}) {
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

    const stats = await auditLogService.getLogStatistics(filters)

    return {
      data: stats,
      status: 200
    }
  } catch (error) {
    return {
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to get audit log stats',
        status: 500
      }
    }
  }
}

/**
 * GET /api/admin/clients/:id/audit-logs
 * Get audit logs for a specific client
 * 
 * @param {string} clientId - Client ID
 * @returns {Promise<Object>} - Audit logs for client
 */
export async function getClientAuditLogs(clientId) {
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

    const logs = await auditLogService.getLogsForTarget('clients', clientId)

    return {
      data: logs,
      status: 200
    }
  } catch (error) {
    return {
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to get client audit logs',
        status: 500
      }
    }
  }
}
