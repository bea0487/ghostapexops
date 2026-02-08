/**
 * TierProtectionMiddleware - Server-side tier access validation
 * 
 * Validates that authenticated users have the required tier access for protected routes.
 * This middleware MUST be used on all tier-protected API endpoints to prevent
 * unauthorized access even if frontend components are bypassed.
 * 
 * Security Requirements:
 * - Never trust client-side tier checks
 * - Always validate tier access on the server
 * - Return 403 Forbidden for insufficient tier access
 * - Log unauthorized access attempts
 */

import { supabase } from './supabaseClient.js'
import { tierService } from './TierService.js'

export class TierProtectionMiddleware {
  /**
   * Validate that the authenticated user has access to a specific feature
   * 
   * @param {string} feature - Feature name to check (e.g., 'eld_reports', 'csa_scores')
   * @returns {Function} Express/Next.js middleware function
   * 
   * Usage:
   * app.get('/api/eld-reports', tierProtection.requireFeature('eld_reports'), handler)
   */
  requireFeature(feature) {
    return async (req, res, next) => {
      try {
        // Ensure user is authenticated (should be done by auth middleware first)
        if (!req.user || !req.user.userId) {
          return res.status(401).json({
            error: {
              code: 'UNAUTHORIZED',
              message: 'Authentication required',
              timestamp: new Date().toISOString()
            }
          })
        }

        // Get client ID from user
        const clientId = req.user.clientId

        if (!clientId) {
          // User is not associated with a client (might be admin)
          // Check if user has admin role
          if (req.user.role === 'admin') {
            // Admins have access to all features
            return next()
          }

          return res.status(403).json({
            error: {
              code: 'FORBIDDEN',
              message: 'No client association found',
              timestamp: new Date().toISOString()
            }
          })
        }

        // Validate tier access from database
        const hasAccess = await tierService.validateTierAccess(clientId, feature)

        if (!hasAccess) {
          // Log unauthorized access attempt
          console.warn(`Unauthorized tier access attempt: User ${req.user.userId}, Client ${clientId}, Feature ${feature}`)

          return res.status(403).json({
            error: {
              code: 'INSUFFICIENT_TIER',
              message: `Your current subscription tier does not include access to ${feature}. Please upgrade your plan.`,
              feature: feature,
              timestamp: new Date().toISOString()
            }
          })
        }

        // User has access, proceed to route handler
        next()
      } catch (error) {
        console.error('Tier protection middleware error:', error)
        return res.status(500).json({
          error: {
            code: 'SERVER_ERROR',
            message: 'Failed to validate tier access',
            timestamp: new Date().toISOString()
          }
        })
      }
    }
  }

  /**
   * Validate tier access for multiple features (user must have access to ALL)
   * 
   * @param {string[]} features - Array of feature names
   * @returns {Function} Express/Next.js middleware function
   */
  requireAllFeatures(features) {
    return async (req, res, next) => {
      try {
        if (!req.user || !req.user.userId) {
          return res.status(401).json({
            error: {
              code: 'UNAUTHORIZED',
              message: 'Authentication required',
              timestamp: new Date().toISOString()
            }
          })
        }

        const clientId = req.user.clientId

        if (!clientId && req.user.role !== 'admin') {
          return res.status(403).json({
            error: {
              code: 'FORBIDDEN',
              message: 'No client association found',
              timestamp: new Date().toISOString()
            }
          })
        }

        // Admins bypass tier checks
        if (req.user.role === 'admin') {
          return next()
        }

        // Check access for all features
        const accessChecks = await Promise.all(
          features.map(feature => tierService.validateTierAccess(clientId, feature))
        )

        const hasAllAccess = accessChecks.every(hasAccess => hasAccess)

        if (!hasAllAccess) {
          const deniedFeatures = features.filter((_, index) => !accessChecks[index])
          
          console.warn(`Unauthorized tier access attempt: User ${req.user.userId}, Client ${clientId}, Features ${deniedFeatures.join(', ')}`)

          return res.status(403).json({
            error: {
              code: 'INSUFFICIENT_TIER',
              message: 'Your current subscription tier does not include access to all required features',
              deniedFeatures: deniedFeatures,
              timestamp: new Date().toISOString()
            }
          })
        }

        next()
      } catch (error) {
        console.error('Tier protection middleware error:', error)
        return res.status(500).json({
          error: {
            code: 'SERVER_ERROR',
            message: 'Failed to validate tier access',
            timestamp: new Date().toISOString()
          }
        })
      }
    }
  }

  /**
   * Validate tier access for at least one of the specified features
   * 
   * @param {string[]} features - Array of feature names
   * @returns {Function} Express/Next.js middleware function
   */
  requireAnyFeature(features) {
    return async (req, res, next) => {
      try {
        if (!req.user || !req.user.userId) {
          return res.status(401).json({
            error: {
              code: 'UNAUTHORIZED',
              message: 'Authentication required',
              timestamp: new Date().toISOString()
            }
          })
        }

        const clientId = req.user.clientId

        if (!clientId && req.user.role !== 'admin') {
          return res.status(403).json({
            error: {
              code: 'FORBIDDEN',
              message: 'No client association found',
              timestamp: new Date().toISOString()
            }
          })
        }

        // Admins bypass tier checks
        if (req.user.role === 'admin') {
          return next()
        }

        // Check access for any feature
        const accessChecks = await Promise.all(
          features.map(feature => tierService.validateTierAccess(clientId, feature))
        )

        const hasAnyAccess = accessChecks.some(hasAccess => hasAccess)

        if (!hasAnyAccess) {
          console.warn(`Unauthorized tier access attempt: User ${req.user.userId}, Client ${clientId}, Features ${features.join(', ')}`)

          return res.status(403).json({
            error: {
              code: 'INSUFFICIENT_TIER',
              message: 'Your current subscription tier does not include access to any of the required features',
              requiredFeatures: features,
              timestamp: new Date().toISOString()
            }
          })
        }

        next()
      } catch (error) {
        console.error('Tier protection middleware error:', error)
        return res.status(500).json({
          error: {
            code: 'SERVER_ERROR',
            message: 'Failed to validate tier access',
            timestamp: new Date().toISOString()
          }
        })
      }
    }
  }

  /**
   * Validate that user has a minimum tier level
   * 
   * @param {string} minimumTier - Minimum required tier
   * @returns {Function} Express/Next.js middleware function
   */
  requireMinimumTier(minimumTier) {
    const tierHierarchy = {
      wingman: 1,
      guardian: 2,
      apex_command: 3,
      virtual_dispatcher: 3,
      dot_readiness_audit: 2,
      back_office_command: 4
    }

    return async (req, res, next) => {
      try {
        if (!req.user || !req.user.userId) {
          return res.status(401).json({
            error: {
              code: 'UNAUTHORIZED',
              message: 'Authentication required',
              timestamp: new Date().toISOString()
            }
          })
        }

        const clientId = req.user.clientId

        if (!clientId && req.user.role !== 'admin') {
          return res.status(403).json({
            error: {
              code: 'FORBIDDEN',
              message: 'No client association found',
              timestamp: new Date().toISOString()
            }
          })
        }

        // Admins bypass tier checks
        if (req.user.role === 'admin') {
          return next()
        }

        // Get client's current tier
        const currentTier = await tierService.getClientTier(clientId)

        if (!currentTier) {
          return res.status(403).json({
            error: {
              code: 'NO_TIER',
              message: 'No subscription tier found',
              timestamp: new Date().toISOString()
            }
          })
        }

        const currentLevel = tierHierarchy[currentTier.toLowerCase()] || 0
        const requiredLevel = tierHierarchy[minimumTier.toLowerCase()] || 0

        if (currentLevel < requiredLevel) {
          console.warn(`Insufficient tier level: User ${req.user.userId}, Client ${clientId}, Current ${currentTier}, Required ${minimumTier}`)

          return res.status(403).json({
            error: {
              code: 'INSUFFICIENT_TIER',
              message: `This feature requires ${minimumTier} tier or higher`,
              currentTier: currentTier,
              requiredTier: minimumTier,
              timestamp: new Date().toISOString()
            }
          })
        }

        next()
      } catch (error) {
        console.error('Tier protection middleware error:', error)
        return res.status(500).json({
          error: {
            code: 'SERVER_ERROR',
            message: 'Failed to validate tier access',
            timestamp: new Date().toISOString()
          }
        })
      }
    }
  }
}

// Export singleton instance
export const tierProtection = new TierProtectionMiddleware()

// Export convenience functions
export function requireFeature(feature) {
  return tierProtection.requireFeature(feature)
}

export function requireAllFeatures(features) {
  return tierProtection.requireAllFeatures(features)
}

export function requireAnyFeature(features) {
  return tierProtection.requireAnyFeature(features)
}

export function requireMinimumTier(minimumTier) {
  return tierProtection.requireMinimumTier(minimumTier)
}
