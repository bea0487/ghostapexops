/**
 * AuthService - Core authentication logic for Ghost Apex Operations Portal
 * 
 * Handles user authentication, session management, and password reset functionality.
 * Uses Supabase Auth for backend authentication services.
 * 
 * Requirements: 3.1, 3.2, 3.7, 3.8
 */

import { isSupabaseConfigured, supabase } from './supabaseClient'

/**
 * Ensures Supabase is properly configured before operations
 * @throws {Error} If Supabase is not configured
 */
function ensureSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then redeploy.')
  }
}

/**
 * AuthService class providing authentication operations
 */
export class AuthService {
  /**
   * Authenticate user with email and password
   * 
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<{user: Object, session: Object, accessToken: string, refreshToken: string}>}
   * @throws {Error} Generic authentication error (doesn't reveal which credential was incorrect)
   * 
   * Requirement 3.1: Authenticate using Supabase Auth and return session token
   * Requirement 3.2: Return generic error without revealing which credential was incorrect
   */
  async login(email, password) {
    ensureSupabase()
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })
      
      if (error) {
        // Return generic error message without revealing whether email or password was incorrect
        throw new Error('Invalid credentials')
      }
      
      if (!data.session || !data.user) {
        throw new Error('Invalid credentials')
      }
      
      return {
        user: data.user,
        session: data.session,
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token
      }
    } catch (error) {
      // Ensure we always return a generic error message
      if (error.message === 'Invalid credentials') {
        throw error
      }
      throw new Error('Invalid credentials')
    }
  }

  /**
   * Log out the current user and invalidate their session
   * 
   * @param {string} sessionToken - Optional session token to invalidate
   * @returns {Promise<void>}
   * @throws {Error} If logout fails
   * 
   * Requirement 3.7: Invalidate session token and clear authentication cookies
   */
  async logout(sessionToken) {
    ensureSupabase()
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw new Error(`Logout failed: ${error.message}`)
    }
  }

  /**
   * Initiate password reset process by sending reset email
   * 
   * @param {string} email - User's email address
   * @param {string} redirectUrl - Optional redirect URL for password reset (defaults to /reset-password)
   * @returns {Promise<void>}
   * @throws {Error} If password reset request fails
   * 
   * Requirement 3.8: Support password reset via email with secure token-based verification
   */
  async resetPassword(email, redirectUrl) {
    ensureSupabase()
    
    // Use provided redirectUrl or construct from window.location if available
    const resetUrl = redirectUrl || 
      (typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined)
    
    const options = resetUrl ? { redirectTo: resetUrl } : {}
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, options)
    
    if (error) {
      throw new Error(`Password reset failed: ${error.message}`)
    }
  }

  /**
   * Verify and retrieve current session data
   * 
   * @param {string} token - JWT token to verify
   * @returns {Promise<{userId: string, clientId: string|null, role: string, email: string}>}
   * @throws {Error} If session verification fails
   */
  async verifySession(token) {
    ensureSupabase()
    
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      throw new Error('Invalid or expired session')
    }
    
    return {
      userId: session.user.id,
      clientId: session.user.user_metadata?.client_id || null,
      role: session.user.user_metadata?.role || 'client',
      email: session.user.email
    }
  }

  /**
   * Get current session
   * 
   * @returns {Promise<Object|null>} Current session or null if not authenticated
   */
  async getSession() {
    ensureSupabase()
    
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      throw new Error(`Failed to get session: ${error.message}`)
    }
    
    return session
  }
}

// Export singleton instance
export const authService = new AuthService()

// Export individual functions for backward compatibility
export async function signInWithPassword({ email, password }) {
  return authService.login(email, password)
}

export async function signOut() {
  return authService.logout()
}

export async function getSession() {
  return authService.getSession()
}
