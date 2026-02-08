// Feature: ghost-apex-backend, Property 6: Invalid Credentials Error Handling
// **Validates: Requirements 3.2**

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import * as fc from 'fast-check'
import { AuthService } from '../../src/lib/AuthService.js'

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
    email_confirm: true
  })
  
  if (error) throw error
  return data.user
}

// Helper function to delete a test user
async function deleteTestUser(userId) {
  const { error } = await supabase.auth.admin.deleteUser(userId)
  if (error) console.warn('Failed to delete test user:', error)
}

describe('Property 6: Invalid Credentials Error Handling', () => {
  const createdUserIds = []
  const authService = new AuthService()

  afterAll(async () => {
    // Cleanup: Delete all created test users
    for (const userId of createdUserIds) {
      await deleteTestUser(userId)
    }
  })

  it('should return generic error for wrong password without revealing which credential was incorrect', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          correctPassword: fc.string({ minLength: 8, maxLength: 20 }),
          wrongPassword: fc.string({ minLength: 8, maxLength: 20 })
        }).filter(({ correctPassword, wrongPassword }) => correctPassword !== wrongPassword),
        async ({ email, correctPassword, wrongPassword }) => {
          let userId = null

          try {
            // Create a test user with correct password
            const user = await createTestUser(email, correctPassword)
            userId = user.id
            createdUserIds.push(userId)

            // Attempt login with wrong password
            try {
              await authService.login(email, wrongPassword)
              // Should not reach here
              expect(true).toBe(false)
            } catch (error) {
              // Should return generic error message
              expect(error.message).toBe('Invalid credentials')
              // Should NOT reveal that password was incorrect
              expect(error.message.toLowerCase()).not.toContain('password')
              expect(error.message.toLowerCase()).not.toContain('email')
            }

          } finally {
            // Cleanup
            if (userId) {
              await deleteTestUser(userId)
              const index = createdUserIds.indexOf(userId)
              if (index > -1) createdUserIds.splice(index, 1)
            }
          }
        }
      ),
      { numRuns: 1 }
    )
  })

  it('should return generic error for non-existent email without revealing which credential was incorrect', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 20 })
        }),
        async ({ email, password }) => {
          // Attempt login with non-existent email (no user created)
          try {
            await authService.login(email, password)
            // Should not reach here
            expect(true).toBe(false)
          } catch (error) {
            // Should return generic error message
            expect(error.message).toBe('Invalid credentials')
            // Should NOT reveal that email doesn't exist
            expect(error.message.toLowerCase()).not.toContain('password')
            expect(error.message.toLowerCase()).not.toContain('email')
            expect(error.message.toLowerCase()).not.toContain('not found')
            expect(error.message.toLowerCase()).not.toContain('does not exist')
          }
        }
      ),
      { numRuns: 1 }
    )
  })

  it('should return same generic error for both wrong email and wrong password', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 20 }),
          wrongEmail: fc.emailAddress(),
          wrongPassword: fc.string({ minLength: 8, maxLength: 20 })
        }).filter(({ email, wrongEmail, password, wrongPassword }) => 
          email !== wrongEmail && password !== wrongPassword
        ),
        async ({ email, password, wrongEmail, wrongPassword }) => {
          let userId = null

          try {
            // Create a test user
            const user = await createTestUser(email, password)
            userId = user.id
            createdUserIds.push(userId)

            let wrongEmailError = null
            let wrongPasswordError = null

            // Attempt login with wrong email
            try {
              await authService.login(wrongEmail, password)
            } catch (error) {
              wrongEmailError = error.message
            }

            // Attempt login with wrong password
            try {
              await authService.login(email, wrongPassword)
            } catch (error) {
              wrongPasswordError = error.message
            }

            // Both errors should be identical generic messages
            expect(wrongEmailError).toBe('Invalid credentials')
            expect(wrongPasswordError).toBe('Invalid credentials')
            expect(wrongEmailError).toBe(wrongPasswordError)

          } finally {
            // Cleanup
            if (userId) {
              await deleteTestUser(userId)
              const index = createdUserIds.indexOf(userId)
              if (index > -1) createdUserIds.splice(index, 1)
            }
          }
        }
      ),
      { numRuns: 1 }
    )
  })
})
