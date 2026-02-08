/**
 * FeatureGate - Middleware for tier-based feature access control
 * 
 * Checks tier permissions before endpoint execution and returns 403 for unauthorized access.
 * Works in conjunction with AuthMiddleware to ensure both authentication and authorization.
 * 
 * Requirements: 4.7, 4.8
 */

import { tierService } from './TierService.js'
import { supabase } from './supabaseClient.js'

/**
 * FeatureGate class for tier-based access control
 */
export class FeatureGate {
  /**
   * Check if a user has access to a specific feature based on their tier
   * 
   * @param {string} userId - The user's ID
   * @param {string} feature - The feature to check
   * @returns {Promise<{hasAccess: boolean, tier: string|null, clientId: string|null}>}
   * 
   * Requirements: 4.7, 4.8
   */
  async checkFeatureAccess(userId, feature) {
    if (!userId || !feature) {
      return { hasAccess: false, tier: null, clientId: null }
    }

    try {
      // Get the client record for this user
      const { data: client, error } = await supabase
        .from('clients')
        .select('id, tier')
        .eq('user_id', userId)
        .single()

      if (error || !client) {
        console.error('Error fetching client for user:', error)
        return { hasAccess: false, tier: null, clientId: null }
      }

      // Check if the tier has access to the feature
      const hasAccess = tierService.hasFeatureAccess(client.tier, feature)

      return {
        hasAccess,
        tier: client.tier,
        clientId: client.id
      }
    } catch (error) {
      console.error('Error checking feature access:', error)
      return { hasAccess: false, tier: null, clientId: null }
    }
  }

  /**
   * Middleware function to require a specific feature
   * Returns a function that can be used as Express/Next.js middleware
   * 
   * @param {string} feature - The feature required for this endpoint
   * @returns {Function} Middleware function
   * 
   * Requirements: 4.7, 4.8
   * Requirement 4.7: Return 403 Forbidden for unauthorized access with tier upgrade message
   * Requirement 4.8: Validate tier access on every API endpoint
   */
  requireFeature(feature) {
    return async (req, res, next) => {
      try {
        // Ensure user is authenticated (should be set by AuthMiddleware)
        if (!req.user || !req.user.userId) {
          return res.status(401).json({
            error: {
              code: 'AUTH_REQUIRED',
              message: 'Authentication required',
              timestamp: new Date().toISOString()
            }
          })
        }

        // Check if user's role is admin (admins have access to all features)
        if (req.user.role === 'admin') {
          return next()
        }

        // Check feature access for client users
        const { hasAccess, tier } = await this.checkFeatureAccess(req.user.userId, feature)

        if (!hasAccess) {
          return res.status(403).json({
            error: {
              code: 'AUTHZ_TIER_UPGRADE_REQUIRED',
              message: `This feature requires a tier upgrade. Your current tier (${tier || 'unknown'}) does not include access to '${feature}'.`,
              feature,
              currentTier: tier,
              timestamp: new Date().toISOString()
            }
          })
        }

        // User has access, proceed to the endpoint
        next()
      } catch (error) {
        console.error('Error in FeatureGate middleware:', error)
        res.status(500).json({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An error occurred while checking feature access',
            timestamp: new Date().toISOString()
          }
        })
      }
    }
  }

  /**
   * Check if a user has admin role
   * 
   * @param {string} userId - The user's ID
   * @returns {Promise<boolean>} True if user is admin
   */
  async isAdmin(userId) {
    if (!userId) {
      return false
    }

    try {
      const { data: { user }, error } = await supabase.auth.admin.getUserById(userId)
      
      if (error || !user) {
        return false
      }

      return user.user_metadata?.role === 'admin'
    } catch (error) {
      console.error('Error checking admin status:', error)
      return false
    }
  }

  /**
   * Middleware to require admin role
   * 
   * @returns {Function} Middleware function
   */
  requireAdmin() {
    return async (req, res, next) => {
      try {
        // Ensure user is authenticated
        if (!req.user || !req.user.userId) {
          return res.status(401).json({
            error: {
              code: 'AUTH_REQUIRED',
              message: 'Authentication required',
              timestamp: new Date().toISOString()
            }
          })
        }

        // Check if user is admin
        if (req.user.role !== 'admin') {
          return res.status(403).json({
            error: {
              code: 'AUTHZ_ADMIN_ONLY',
              message: 'This endpoint requires admin privileges',
              timestamp: new Date().toISOString()
            }
          })
        }

        next()
      } catch (error) {
        console.error('Error in requireAdmin middleware:', error)
        res.status(500).json({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An error occurred while checking admin access',
            timestamp: new Date().toISOString()
          }
        })
      }
    }
  }
}

// Export singleton instance
export const featureGate = new FeatureGate()

// Export convenience functions
export function requireFeature(feature) {
  return featureGate.requireFeature(feature)
}

export function requireAdmin() {
  return featureGate.requireAdmin()
}

export async function checkFeatureAccess(userId, feature) {
  return featureGate.checkFeatureAccess(userId, feature)
}
