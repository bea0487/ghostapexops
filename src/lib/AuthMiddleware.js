/**
 * AuthMiddleware - JWT validation middleware for protected routes
 * 
 * Validates JWT tokens on protected routes and handles token expiration.
 * Extracts user information from JWT claims for authorization.
 * 
 * Requirements: 3.5, 3.6, 2.9
 */

import { isSupabaseConfigured, supabase } from './supabaseClient'

/**
 * Ensures Supabase is properly configured
 * @throws {Error} If Supabase is not configured
 */
function ensureSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then redeploy.')
  }
}

/**
 * AuthMiddleware class for JWT validation
 */
export class AuthMiddleware {
  /**
   * Validate JWT token and extract user information
   * 
   * @param {string} token - JWT token to validate
   * @returns {Promise<{userId: string, clientId: string|null, role: string, email: string}>}
   * @throws {Error} If token is invalid, expired, or missing
   * 
   * Requirement 2.9: Deny access without valid authentication and return 401 error
   * Requirement 3.5: Handle token expiration and automatic logout
   * Requirement 3.6: Validate session tokens
   */
  async validateToken(token) {
    ensureSupabase()
    
    if (!token) {
      const error = new Error('Authentication required')
      error.statusCode = 401
      error.code = 'AUTH_TOKEN_MISSING'
      throw error
    }
    
    try {
      // Get user from token
      const { data: { user }, error } = await supabase.auth.getUser(token)
      
      if (error || !user) {
        const authError = new Error('Invalid or expired token')
        authError.statusCode = 401
        authError.code = 'AUTH_TOKEN_INVALID'
        throw authError
      }
      
      // Extract user information from JWT claims
      return {
        userId: user.id,
        clientId: user.user_metadata?.client_id || null,
        role: user.user_metadata?.role || 'client',
        email: user.email
      }
    } catch (error) {
      if (error.statusCode === 401) {
        throw error
      }
      
      const authError = new Error('Token validation failed')
      authError.statusCode = 401
      authError.code = 'AUTH_TOKEN_INVALID'
      throw authError
    }
  }

  /**
   * Middleware function to protect routes
   * Returns a function that can be used as Express/Next.js middleware
   * 
   * @returns {Function} Middleware function
   */
  requireAuth() {
    return async (req, res, next) => {
      try {
        // Extract token from Authorization header or cookies
        const token = this.extractToken(req)
        
        // Validate token and attach user info to request
        const userInfo = await this.validateToken(token)
        req.user = userInfo
        
        next()
      } catch (error) {
        res.status(error.statusCode || 401).json({
          error: {
            code: error.code || 'AUTH_REQUIRED',
            message: error.message,
            timestamp: new Date().toISOString()
          }
        })
      }
    }
  }

  /**
   * Extract JWT token from request
   * Checks Authorization header and cookies
   * 
   * @param {Object} req - Request object
   * @returns {string|null} JWT token or null if not found
   */
  extractToken(req) {
    // Check Authorization header (Bearer token)
    const authHeader = req.headers?.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7)
    }
    
    // Check cookies
    const cookies = req.cookies || {}
    if (cookies['sb-access-token']) {
      return cookies['sb-access-token']
    }
    
    return null
  }

  /**
   * Check if current session is valid
   * 
   * @returns {Promise<boolean>} True if session is valid, false otherwise
   */
  async isAuthenticated() {
    ensureSupabase()
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      return !error && session !== null
    } catch (error) {
      return false
    }
  }

  /**
   * Get current user information from session
   * 
   * @returns {Promise<Object|null>} User information or null if not authenticated
   */
  async getCurrentUser() {
    ensureSupabase()
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        return null
      }
      
      return {
        userId: session.user.id,
        clientId: session.user.user_metadata?.client_id || null,
        role: session.user.user_metadata?.role || 'client',
        email: session.user.email
      }
    } catch (error) {
      return null
    }
  }

  /**
   * Refresh expired token
   * 
   * @returns {Promise<{accessToken: string, refreshToken: string}>}
   * @throws {Error} If token refresh fails
   */
  async refreshToken() {
    ensureSupabase()
    
    const { data, error } = await supabase.auth.refreshSession()
    
    if (error || !data.session) {
      const authError = new Error('Session expired')
      authError.statusCode = 401
      authError.code = 'AUTH_SESSION_EXPIRED'
      throw authError
    }
    
    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token
    }
  }
}

// Export singleton instance
export const authMiddleware = new AuthMiddleware()

// Export convenience functions
export async function validateToken(token) {
  return authMiddleware.validateToken(token)
}

export async function isAuthenticated() {
  return authMiddleware.isAuthenticated()
}

export async function getCurrentUser() {
  return authMiddleware.getCurrentUser()
}

export function requireAuth() {
  return authMiddleware.requireAuth()
}
