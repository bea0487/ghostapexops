/**
 * Authentication API
 * 
 * Provides authentication endpoints for login, logout, and password reset.
 * 
 * Requirements: 13.1, 13.2, 13.3
 */

import { authService } from '../lib/AuthService.js'

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 * 
 * @param {Object} credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} - User and session data
 * 
 * Requirements: 13.1
 */
export async function login(credentials) {
  try {
    const { email, password } = credentials

    if (!email || !password) {
      return {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required',
          status: 400
        }
      }
    }

    const result = await authService.login(email, password)

    return {
      data: {
        user: result.user,
        session: result.session,
        accessToken: result.accessToken
      },
      status: 200
    }
  } catch (error) {
    return {
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: error.message || 'Invalid credentials',
        status: 401
      }
    }
  }
}

/**
 * POST /api/auth/logout
 * Log out current user and invalidate session
 * 
 * @returns {Promise<Object>} - Success response
 * 
 * Requirements: 13.2
 */
export async function logout() {
  try {
    await authService.logout()

    return {
      data: {
        message: 'Logged out successfully'
      },
      status: 200
    }
  } catch (error) {
    return {
      error: {
        code: 'LOGOUT_ERROR',
        message: error.message || 'Logout failed',
        status: 500
      }
    }
  }
}

/**
 * POST /api/auth/reset-password
 * Send password reset email
 * 
 * @param {Object} data
 * @param {string} data.email - User email
 * @param {string} data.redirectUrl - Optional redirect URL
 * @returns {Promise<Object>} - Success response
 * 
 * Requirements: 13.3
 */
export async function resetPassword(data) {
  try {
    const { email, redirectUrl } = data

    if (!email) {
      return {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email is required',
          status: 400
        }
      }
    }

    await authService.resetPassword(email, redirectUrl)

    return {
      data: {
        message: 'Password reset email sent successfully'
      },
      status: 200
    }
  } catch (error) {
    return {
      error: {
        code: 'PASSWORD_RESET_ERROR',
        message: error.message || 'Password reset failed',
        status: 500
      }
    }
  }
}

/**
 * GET /api/auth/session
 * Get current session
 * 
 * @returns {Promise<Object>} - Session data
 */
export async function getSession() {
  try {
    const session = await authService.getSession()

    if (!session) {
      return {
        error: {
          code: 'UNAUTHORIZED',
          message: 'No active session',
          status: 401
        }
      }
    }

    return {
      data: { session },
      status: 200
    }
  } catch (error) {
    return {
      error: {
        code: 'SESSION_ERROR',
        message: error.message || 'Failed to get session',
        status: 500
      }
    }
  }
}
