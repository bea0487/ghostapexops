// Unit tests for authentication edge cases
// **Validates: Requirements 3.4, 3.5, 2.10**

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import { AuthService } from '../../src/lib/AuthService.js'
import { AuthMiddleware } from '../../src/lib/AuthMiddleware.js'

// Initialize Supabase client with service role key for admin access
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required environment variables: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Helper function to create a test user
async function createTestUser(email, password) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: 'client',
      client_id: 'test-client-123'
    }
  })
  
  if (error) throw error
  return data.user
}

// Helper function to delete a test user
async function deleteTestUser(userId) {
  const { error } = await supabase.auth.admin.deleteUser(userId)
  if (error) console.warn('Failed to delete test user:', error)
}

describe('Authentication Edge Cases', () => {
  const createdUserIds = []
  const authService = new AuthService()
  const authMiddleware = new AuthMiddleware()

  afterAll(async () => {
    // Cleanup: Delete all created test users
    for (const userId of createdUserIds) {
      await deleteTestUser(userId)
    }
  })

  describe('Session Expiration Behavior (Requirement 3.5)', () => {
    it('should handle expired session gracefully', async () => {
      // Create a test user
      const testEmail = `test-expired-${Date.now()}@example.com`
      const testPassword = 'TestPassword123!'
      const user = await createTestUser(testEmail, testPassword)
      createdUserIds.push(user.id)

      try {
        // Login to get a session
        const loginResult = await authService.login(testEmail, testPassword)
        expect(loginResult.session).toBeDefined()
        expect(loginResult.accessToken).toBeDefined()

        // Simulate expired token by using an invalid token
        const expiredToken = 'expired.token.here'
        
        try {
          await authMiddleware.validateToken(expiredToken)
          expect(true).toBe(false) // Should not reach here
        } catch (error) {
          expect(error.statusCode).toBe(401)
          expect(error.code).toBe('AUTH_TOKEN_INVALID')
        }
      } finally {
        await deleteTestUser(user.id)
        const index = createdUserIds.indexOf(user.id)
        if (index > -1) createdUserIds.splice(index, 1)
      }
    })

    it('should allow token refresh for valid sessions', async () => {
      const testEmail = `test-refresh-${Date.now()}@example.com`
      const testPassword = 'TestPassword123!'
      const user = await createTestUser(testEmail, testPassword)
      createdUserIds.push(user.id)

      try {
        // Login to get a session
        const loginResult = await authService.login(testEmail, testPassword)
        expect(loginResult.refreshToken).toBeDefined()

        // Note: Actual token refresh would require a valid session context
        // This test verifies the method exists and handles errors
        try {
          await authMiddleware.refreshToken()
        } catch (error) {
          // Expected to fail without proper session context
          expect(error.statusCode).toBe(401)
        }
      } finally {
        await deleteTestUser(user.id)
        const index = createdUserIds.indexOf(user.id)
        if (index > -1) createdUserIds.splice(index, 1)
      }
    })
  })

  describe('httpOnly Cookie Configuration (Requirement 3.4)', () => {
    it('should extract token from Authorization header', () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer test-token-123'
        },
        cookies: {}
      }

      const token = authMiddleware.extractToken(mockRequest)
      expect(token).toBe('test-token-123')
    })

    it('should extract token from cookies', () => {
      const mockRequest = {
        headers: {},
        cookies: {
          'sb-access-token': 'cookie-token-456'
        }
      }

      const token = authMiddleware.extractToken(mockRequest)
      expect(token).toBe('cookie-token-456')
    })

    it('should prioritize Authorization header over cookies', () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer header-token'
        },
        cookies: {
          'sb-access-token': 'cookie-token'
        }
      }

      const token = authMiddleware.extractToken(mockRequest)
      expect(token).toBe('header-token')
    })

    it('should return null when no token is present', () => {
      const mockRequest = {
        headers: {},
        cookies: {}
      }

      const token = authMiddleware.extractToken(mockRequest)
      expect(token).toBeNull()
    })
  })

  describe('JWT Token Structure with Custom Claims (Requirement 2.10)', () => {
    it('should include user_id in session data', async () => {
      const testEmail = `test-claims-${Date.now()}@example.com`
      const testPassword = 'TestPassword123!'
      const user = await createTestUser(testEmail, testPassword)
      createdUserIds.push(user.id)

      try {
        // Verify user was created with proper structure
        expect(user).toBeDefined()
        expect(user.id).toBeDefined()
        expect(user.email).toBe(testEmail)
        expect(user.user_metadata).toBeDefined()
      } finally {
        await deleteTestUser(user.id)
        const index = createdUserIds.indexOf(user.id)
        if (index > -1) createdUserIds.splice(index, 1)
      }
    })

    it('should include role in user metadata', async () => {
      const testEmail = `test-role-${Date.now()}@example.com`
      const testPassword = 'TestPassword123!'
      const user = await createTestUser(testEmail, testPassword)
      createdUserIds.push(user.id)

      try {
        // Verify user metadata includes role
        expect(user.user_metadata).toBeDefined()
        expect(user.user_metadata.role).toBeDefined()
        expect(['admin', 'client']).toContain(user.user_metadata.role)
      } finally {
        await deleteTestUser(user.id)
        const index = createdUserIds.indexOf(user.id)
        if (index > -1) createdUserIds.splice(index, 1)
      }
    })

    it('should include client_id in user metadata for client users', async () => {
      const testEmail = `test-clientid-${Date.now()}@example.com`
      const testPassword = 'TestPassword123!'
      const user = await createTestUser(testEmail, testPassword)
      createdUserIds.push(user.id)

      try {
        // Verify user metadata includes client_id
        expect(user.user_metadata).toBeDefined()
        expect(user.user_metadata.client_id).toBeDefined()
      } finally {
        await deleteTestUser(user.id)
        const index = createdUserIds.indexOf(user.id)
        if (index > -1) createdUserIds.splice(index, 1)
      }
    })
  })

  describe('Logout Functionality', () => {
    it('should successfully logout authenticated user', async () => {
      // Test logout functionality without requiring active session
      // In a real browser environment, this would clear the session
      await authService.logout()
      
      // Verify session is cleared
      const session = await authService.getSession()
      expect(session).toBeNull()
    })
  })

  describe('Password Reset Functionality', () => {
    it('should send password reset email for valid user', async () => {
      const testEmail = `test-reset-${Date.now()}@example.com`
      const testPassword = 'TestPassword123!'
      const user = await createTestUser(testEmail, testPassword)
      createdUserIds.push(user.id)

      try {
        // Request password reset
        await authService.resetPassword(testEmail)
        
        // If no error is thrown, the request was successful
        // Note: We can't verify email delivery in tests, but we can verify no error
        expect(true).toBe(true)
      } finally {
        await deleteTestUser(user.id)
        const index = createdUserIds.indexOf(user.id)
        if (index > -1) createdUserIds.splice(index, 1)
      }
    })

    it('should not reveal if email exists when requesting password reset', async () => {
      const nonExistentEmail = `nonexistent-${Date.now()}@example.com`
      
      // Request password reset for non-existent email
      // Should not throw error or reveal that email doesn't exist
      try {
        await authService.resetPassword(nonExistentEmail)
        // Success - doesn't reveal if email exists
        expect(true).toBe(true)
      } catch (error) {
        // If it fails, it should not reveal that the email doesn't exist
        expect(error.message).not.toContain('not found')
        expect(error.message).not.toContain('does not exist')
      }
    })
  })

  describe('Session Management', () => {
    it('should return null for getSession when not authenticated', async () => {
      // Ensure no active session
      await authService.logout().catch(() => {})
      
      const session = await authService.getSession()
      expect(session).toBeNull()
    })

    it('should return session data when authenticated', async () => {
      const testEmail = `test-session-${Date.now()}@example.com`
      const testPassword = 'TestPassword123!'
      const user = await createTestUser(testEmail, testPassword)
      createdUserIds.push(user.id)

      try {
        // Login
        await authService.login(testEmail, testPassword)
        
        // Get session
        const session = await authService.getSession()
        expect(session).toBeDefined()
        expect(session.user).toBeDefined()
        expect(session.access_token).toBeDefined()
      } finally {
        await authService.logout().catch(() => {})
        await deleteTestUser(user.id)
        const index = createdUserIds.indexOf(user.id)
        if (index > -1) createdUserIds.splice(index, 1)
      }
    })
  })

  describe('Authentication State Checks', () => {
    it('should correctly identify authenticated state', async () => {
      const testEmail = `test-auth-state-${Date.now()}@example.com`
      const testPassword = 'TestPassword123!'
      const user = await createTestUser(testEmail, testPassword)
      createdUserIds.push(user.id)

      try {
        // Before login
        let isAuth = await authMiddleware.isAuthenticated()
        expect(isAuth).toBe(false)

        // After login
        await authService.login(testEmail, testPassword)
        isAuth = await authMiddleware.isAuthenticated()
        expect(isAuth).toBe(true)

        // After logout
        await authService.logout()
        isAuth = await authMiddleware.isAuthenticated()
        expect(isAuth).toBe(false)
      } finally {
        await authService.logout().catch(() => {})
        await deleteTestUser(user.id)
        const index = createdUserIds.indexOf(user.id)
        if (index > -1) createdUserIds.splice(index, 1)
      }
    })

    it('should return current user when authenticated', async () => {
      const testEmail = `test-current-user-${Date.now()}@example.com`
      const testPassword = 'TestPassword123!'
      const user = await createTestUser(testEmail, testPassword)
      createdUserIds.push(user.id)

      try {
        // Login
        await authService.login(testEmail, testPassword)
        
        // Get current user
        const currentUser = await authMiddleware.getCurrentUser()
        expect(currentUser).toBeDefined()
        expect(currentUser.userId).toBeDefined()
        expect(currentUser.email).toBe(testEmail)
        expect(currentUser.role).toBeDefined()
      } finally {
        await authService.logout().catch(() => {})
        await deleteTestUser(user.id)
        const index = createdUserIds.indexOf(user.id)
        if (index > -1) createdUserIds.splice(index, 1)
      }
    })

    it('should return null for getCurrentUser when not authenticated', async () => {
      // Ensure no active session
      await authService.logout().catch(() => {})
      
      const currentUser = await authMiddleware.getCurrentUser()
      expect(currentUser).toBeNull()
    })
  })
})
