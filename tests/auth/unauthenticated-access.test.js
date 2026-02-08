// Feature: ghost-apex-backend, Property 5: Unauthenticated Access Denial
// **Validates: Requirements 2.9**

import { describe, it, expect } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import * as fc from 'fast-check'
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

describe('Property 5: Unauthenticated Access Denial', () => {
  const authMiddleware = new AuthMiddleware()

  it('should return 401 error when token is missing', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null),
        async (token) => {
          try {
            await authMiddleware.validateToken(token)
            // Should not reach here
            expect(true).toBe(false)
          } catch (error) {
            // Should return 401 Unauthorized error
            expect(error.statusCode).toBe(401)
            expect(error.code).toBe('AUTH_TOKEN_MISSING')
            expect(error.message).toBe('Authentication required')
          }
        }
      ),
      { numRuns: 1 }
    )
  })

  it('should return 401 error when token is undefined', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(undefined),
        async (token) => {
          try {
            await authMiddleware.validateToken(token)
            // Should not reach here
            expect(true).toBe(false)
          } catch (error) {
            // Should return 401 Unauthorized error
            expect(error.statusCode).toBe(401)
            expect(error.code).toBe('AUTH_TOKEN_MISSING')
            expect(error.message).toBe('Authentication required')
          }
        }
      ),
      { numRuns: 1 }
    )
  })

  it('should return 401 error when token is empty string', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(''),
        async (token) => {
          try {
            await authMiddleware.validateToken(token)
            // Should not reach here
            expect(true).toBe(false)
          } catch (error) {
            // Should return 401 Unauthorized error
            expect(error.statusCode).toBe(401)
            expect(error.code).toBe('AUTH_TOKEN_MISSING')
            expect(error.message).toBe('Authentication required')
          }
        }
      ),
      { numRuns: 1 }
    )
  })

  it('should return 401 error when token is invalid', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random invalid tokens
        fc.oneof(
          fc.string({ minLength: 10, maxLength: 50 }),
          fc.hexaString({ minLength: 20, maxLength: 100 }),
          fc.base64String({ minLength: 20, maxLength: 100 })
        ),
        async (invalidToken) => {
          try {
            await authMiddleware.validateToken(invalidToken)
            // Should not reach here
            expect(true).toBe(false)
          } catch (error) {
            // Should return 401 Unauthorized error
            expect(error.statusCode).toBe(401)
            expect(error.code).toBe('AUTH_TOKEN_INVALID')
            expect(error.message).toContain('Invalid or expired')
          }
        }
      ),
      { numRuns: 1 }
    )
  })

  it('should return 401 error when token is malformed JWT', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate malformed JWT-like strings
        fc.tuple(
          fc.base64String({ minLength: 10, maxLength: 50 }),
          fc.base64String({ minLength: 10, maxLength: 50 }),
          fc.base64String({ minLength: 10, maxLength: 50 })
        ).map(([header, payload, signature]) => `${header}.${payload}.${signature}`),
        async (malformedToken) => {
          try {
            await authMiddleware.validateToken(malformedToken)
            // Should not reach here
            expect(true).toBe(false)
          } catch (error) {
            // Should return 401 Unauthorized error
            expect(error.statusCode).toBe(401)
            expect(error.code).toBe('AUTH_TOKEN_INVALID')
          }
        }
      ),
      { numRuns: 1 }
    )
  })

  it('should deny access to protected resources without valid token', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant(null),
          fc.constant(undefined),
          fc.constant(''),
          fc.string({ minLength: 10, maxLength: 50 })
        ),
        async (token) => {
          // Simulate accessing a protected resource
          const mockRequest = {
            headers: token ? { authorization: `Bearer ${token}` } : {},
            cookies: {}
          }

          const mockResponse = {
            statusCode: null,
            jsonData: null,
            status: function(code) {
              this.statusCode = code
              return this
            },
            json: function(data) {
              this.jsonData = data
              return this
            }
          }

          const mockNext = () => {
            throw new Error('Next should not be called for unauthenticated requests')
          }

          // Call middleware
          const middleware = authMiddleware.requireAuth()
          await middleware(mockRequest, mockResponse, mockNext)

          // Should return 401 status
          expect(mockResponse.statusCode).toBe(401)
          expect(mockResponse.jsonData).toBeDefined()
          expect(mockResponse.jsonData.error).toBeDefined()
          expect(mockResponse.jsonData.error.code).toMatch(/AUTH_/)
        }
      ),
      { numRuns: 1 }
    )
  })

  it('should include proper error structure in 401 response', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null),
        async (token) => {
          try {
            await authMiddleware.validateToken(token)
          } catch (error) {
            // Verify error structure
            expect(error).toBeDefined()
            expect(error.message).toBeDefined()
            expect(error.statusCode).toBe(401)
            expect(error.code).toBeDefined()
            expect(error.code).toMatch(/^AUTH_/)
          }
        }
      ),
      { numRuns: 1 }
    )
  })
})
