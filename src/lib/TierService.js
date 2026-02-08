/**
 * TierService - Service Tier Access Control
 * 
 * Manages feature access based on client subscription tiers.
 * Validates tier permissions and provides feature availability information.
 * 
 * Requirements: 4.1-4.6, 4.10
 */

import { supabase } from './supabaseClient.js'

/**
 * Feature matrix mapping tiers to available features
 * Based on Requirements 4.1-4.6
 */
export const TIER_FEATURES = {
  wingman: ['support_tickets', 'eld_reports', 'dispatch_board'],
  guardian: ['support_tickets', 'eld_reports', 'dispatch_board', 'ifta_reports', 'driver_files'],
  apex_command: ['support_tickets', 'eld_reports', 'dispatch_board', 'ifta_reports', 'driver_files', 'csa_scores', 'dataq_disputes'],
  virtual_dispatcher: ['support_tickets', 'eld_reports', 'ifta_reports', 'driver_files', 'dispatch_board', 'load_schedules', 'broker_packets', 'revenue_reports'],
  dot_readiness_audit: ['dot_audits'],
  back_office_command: ['*'] // All features
}

/**
 * All available features in the system
 */
export const ALL_FEATURES = [
  'support_tickets',
  'eld_reports',
  'dispatch_board',
  'ifta_reports',
  'driver_files',
  'csa_scores',
  'dataq_disputes',
  'load_schedules',
  'broker_packets',
  'revenue_reports',
  'dot_audits'
]

export class TierService {
  /**
   * Check if a tier has access to a specific feature
   * 
   * @param {string} tier - The service tier (e.g., 'wingman', 'guardian')
   * @param {string} feature - The feature to check (e.g., 'eld_reports')
   * @returns {boolean} - True if the tier has access to the feature
   * 
   * Requirements: 4.1-4.6
   */
  hasFeatureAccess(tier, feature) {
    if (!tier || !feature) {
      return false
    }

    const normalizedTier = tier.toLowerCase()
    const features = TIER_FEATURES[normalizedTier]

    if (!features) {
      return false
    }

    // Back Office Command has access to all features
    if (features.includes('*')) {
      return true
    }

    return features.includes(feature)
  }

  /**
   * Get all available features for a specific tier
   * 
   * @param {string} tier - The service tier
   * @returns {string[]} - Array of feature names available to the tier
   * 
   * Requirements: 4.1-4.6
   */
  getAvailableFeatures(tier) {
    if (!tier) {
      return []
    }

    const normalizedTier = tier.toLowerCase()
    const features = TIER_FEATURES[normalizedTier]

    if (!features) {
      return []
    }

    // Back Office Command has access to all features
    if (features.includes('*')) {
      return [...ALL_FEATURES]
    }

    return [...features]
  }

  /**
   * Validate tier access for a specific client and feature
   * Queries the database to get the client's current tier
   * 
   * @param {string} clientId - The client's ID
   * @param {string} feature - The feature to check
   * @returns {Promise<boolean>} - True if the client has access to the feature
   * 
   * Requirements: 4.1-4.10
   */
  async validateTierAccess(clientId, feature) {
    if (!clientId || !feature) {
      return false
    }

    try {
      // Query the client's tier from the database
      const { data: client, error } = await supabase
        .from('clients')
        .select('tier')
        .eq('id', clientId)
        .single()

      if (error || !client) {
        console.error('Error fetching client tier:', error)
        return false
      }

      return this.hasFeatureAccess(client.tier, feature)
    } catch (error) {
      console.error('Error validating tier access:', error)
      return false
    }
  }

  /**
   * Get the client's tier from the database
   * 
   * @param {string} clientId - The client's ID
   * @returns {Promise<string|null>} - The client's tier or null if not found
   */
  async getClientTier(clientId) {
    if (!clientId) {
      return null
    }

    try {
      const { data: client, error } = await supabase
        .from('clients')
        .select('tier')
        .eq('id', clientId)
        .single()

      if (error || !client) {
        console.error('Error fetching client tier:', error)
        return null
      }

      return client.tier
    } catch (error) {
      console.error('Error getting client tier:', error)
      return null
    }
  }
}

// Export singleton instance
export const tierService = new TierService()
