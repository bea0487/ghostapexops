/**
 * DashboardService - Admin dashboard KPI aggregation
 * 
 * Calculates and aggregates key performance indicators for the admin dashboard.
 * Provides metrics on clients, tickets, violations, revenue, and system activity.
 * 
 * Requirements: 9.1-9.4
 */

import { supabase } from './supabaseClient.js'

/**
 * DashboardService class for KPI calculations
 */
export class DashboardService {
  constructor(supabaseInstance = supabase) {
    this.supabase = supabaseInstance
  }

  /**
   * Get total active clients count
   * 
   * @returns {Promise<number>} - Count of active clients
   * 
   * Requirements: 9.1
   */
  async getTotalActiveClients() {
    try {
      const { count, error } = await this.supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Active')

      if (error) {
        throw new Error(`Failed to get active clients count: ${error.message}`)
      }

      return count || 0
    } catch (error) {
      console.error('Error getting active clients count:', error)
      throw error
    }
  }

  /**
   * Get total open support tickets count
   * 
   * @returns {Promise<number>} - Count of open tickets
   * 
   * Requirements: 9.2
   */
  async getTotalOpenTickets() {
    try {
      const { count, error } = await this.supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .in('status', ['Open', 'In Progress'])

      if (error) {
        throw new Error(`Failed to get open tickets count: ${error.message}`)
      }

      return count || 0
    } catch (error) {
      console.error('Error getting open tickets count:', error)
      throw error
    }
  }

  /**
   * Get total violations flagged this week
   * 
   * @returns {Promise<number>} - Count of violations this week
   * 
   * Requirements: 9.3
   */
  async getViolationsThisWeek() {
    try {
      // Calculate start of current week (Sunday)
      const now = new Date()
      const dayOfWeek = now.getDay()
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - dayOfWeek)
      weekStart.setHours(0, 0, 0, 0)

      const { data: reports, error } = await this.supabase
        .from('eld_reports')
        .select('violations')
        .gte('week_start', weekStart.toISOString().split('T')[0])

      if (error) {
        throw new Error(`Failed to get violations this week: ${error.message}`)
      }

      // Sum up all violations
      const totalViolations = reports?.reduce((sum, report) => sum + (report.violations || 0), 0) || 0
      return totalViolations
    } catch (error) {
      console.error('Error getting violations this week:', error)
      throw error
    }
  }

  /**
   * Get revenue metrics by service tier
   * 
   * @returns {Promise<Object>} - Revenue breakdown by tier
   * 
   * Requirements: 9.4
   */
  async getRevenueByTier() {
    try {
      const { data: clients, error } = await this.supabase
        .from('clients')
        .select('tier, status')
        .eq('status', 'Active')

      if (error) {
        throw new Error(`Failed to get revenue by tier: ${error.message}`)
      }

      // Tier pricing (monthly)
      const tierPricing = {
        wingman: 299,
        guardian: 499,
        apex_command: 799,
        virtual_dispatcher: 599,
        dot_readiness_audit: 399,
        back_office_command: 999
      }

      // Calculate revenue by tier
      const revenueByTier = {}
      let totalRevenue = 0

      clients?.forEach(client => {
        const tier = client.tier
        const price = tierPricing[tier] || 0
        
        if (!revenueByTier[tier]) {
          revenueByTier[tier] = {
            count: 0,
            revenue: 0
          }
        }
        
        revenueByTier[tier].count++
        revenueByTier[tier].revenue += price
        totalRevenue += price
      })

      return {
        byTier: revenueByTier,
        total: totalRevenue
      }
    } catch (error) {
      console.error('Error getting revenue by tier:', error)
      throw error
    }
  }

  /**
   * Get new clients this month
   * 
   * @returns {Promise<number>} - Count of new clients this month
   */
  async getNewClientsThisMonth() {
    try {
      // Calculate start of current month
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

      const { count, error } = await this.supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthStart.toISOString())

      if (error) {
        throw new Error(`Failed to get new clients this month: ${error.message}`)
      }

      return count || 0
    } catch (error) {
      console.error('Error getting new clients this month:', error)
      throw error
    }
  }

  /**
   * Get average ticket resolution time (in hours)
   * 
   * @returns {Promise<number>} - Average resolution time in hours
   */
  async getAverageTicketResolutionTime() {
    try {
      const { data: tickets, error } = await this.supabase
        .from('support_tickets')
        .select('created_at, resolved_at')
        .eq('status', 'Resolved')
        .not('resolved_at', 'is', null)

      if (error) {
        throw new Error(`Failed to get ticket resolution times: ${error.message}`)
      }

      if (!tickets || tickets.length === 0) {
        return 0
      }

      // Calculate resolution times in hours
      const resolutionTimes = tickets.map(ticket => {
        const created = new Date(ticket.created_at)
        const resolved = new Date(ticket.resolved_at)
        return (resolved - created) / (1000 * 60 * 60) // Convert to hours
      })

      // Calculate average
      const average = resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
      return Math.round(average * 10) / 10 // Round to 1 decimal place
    } catch (error) {
      console.error('Error getting average ticket resolution time:', error)
      throw error
    }
  }

  /**
   * Get comprehensive dashboard KPIs
   * 
   * @returns {Promise<Object>} - All dashboard KPIs
   * 
   * Requirements: 9.1-9.4
   */
  async getDashboardKPIs() {
    try {
      const [
        activeClients,
        openTickets,
        violationsThisWeek,
        revenueData,
        newClientsThisMonth,
        avgResolutionTime
      ] = await Promise.all([
        this.getTotalActiveClients(),
        this.getTotalOpenTickets(),
        this.getViolationsThisWeek(),
        this.getRevenueByTier(),
        this.getNewClientsThisMonth(),
        this.getAverageTicketResolutionTime()
      ])

      return {
        activeClients,
        openTickets,
        violationsThisWeek,
        revenue: revenueData,
        newClientsThisMonth,
        avgTicketResolutionTime: avgResolutionTime
      }
    } catch (error) {
      console.error('Error getting dashboard KPIs:', error)
      throw error
    }
  }

  /**
   * Get client distribution by tier
   * 
   * @returns {Promise<Object>} - Client count by tier
   */
  async getClientDistributionByTier() {
    try {
      const { data: clients, error } = await this.supabase
        .from('clients')
        .select('tier')
        .eq('status', 'Active')

      if (error) {
        throw new Error(`Failed to get client distribution: ${error.message}`)
      }

      const distribution = {}
      clients?.forEach(client => {
        const tier = client.tier
        distribution[tier] = (distribution[tier] || 0) + 1
      })

      return distribution
    } catch (error) {
      console.error('Error getting client distribution by tier:', error)
      throw error
    }
  }

  /**
   * Get ticket statistics
   * 
   * @returns {Promise<Object>} - Ticket statistics
   */
  async getTicketStatistics() {
    try {
      const { data: tickets, error } = await this.supabase
        .from('support_tickets')
        .select('status, priority')

      if (error) {
        throw new Error(`Failed to get ticket statistics: ${error.message}`)
      }

      const stats = {
        byStatus: {},
        byPriority: {},
        total: tickets?.length || 0
      }

      tickets?.forEach(ticket => {
        // Count by status
        stats.byStatus[ticket.status] = (stats.byStatus[ticket.status] || 0) + 1
        
        // Count by priority
        stats.byPriority[ticket.priority] = (stats.byPriority[ticket.priority] || 0) + 1
      })

      return stats
    } catch (error) {
      console.error('Error getting ticket statistics:', error)
      throw error
    }
  }

  /**
   * Get recent activity (last 30 days)
   * 
   * @returns {Promise<Object>} - Recent activity metrics
   */
  async getRecentActivity() {
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const dateString = thirtyDaysAgo.toISOString()

      const [
        { count: newClients },
        { count: newTickets },
        { count: newDocuments }
      ] = await Promise.all([
        this.supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', dateString),
        this.supabase
          .from('support_tickets')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', dateString),
        this.supabase
          .from('documents')
          .select('*', { count: 'exact', head: true })
          .gte('uploaded_at', dateString)
      ])

      return {
        newClients: newClients || 0,
        newTickets: newTickets || 0,
        newDocuments: newDocuments || 0
      }
    } catch (error) {
      console.error('Error getting recent activity:', error)
      throw error
    }
  }
}

// Export singleton instance
export const dashboardService = new DashboardService()
