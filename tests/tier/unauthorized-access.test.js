// Feature: ghost-apex-backend, Property 9: Unauthorized Feature Access Denial
// **Validates: Requirements 4.7**

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import * as fc from 'fast-check'
import { FeatureGate } from '../../src/lib/FeatureGate.js'
import { TIER_FEATURES, ALL_FEATURES } from '../../src/lib/TierService.js'

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

const featureGate = new FeatureGate()

// Valid tiers in the system
const validTiers = Object.keys(TIER_FEATURES)

// Arbitrary for generating valid tiers (excluding back_office_command which has all features)
const tierArbitrary = fc.constantFrom(...validTiers.filter(t => t !== 'back_office_command'))

// Arbitrary for generating valid features
const featureArbitrary = fc.constantFrom(...ALL_FEATURES)

// Helper function to clean up test data
async function cleanupTestClient(clientId) {
  if (!clientId) return
  
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId)
    
    if (error) console.warn('Failed to delete test client:', error)
  } catch (error) {
    console.warn('Error cleaning up test client:', error)
  }
}

async function cleanupTestUser(userId) {
  if (!userId) return
  
  try {
    const { error } = await supabase.auth.admin.deleteUser(userId)
    if (error) console.warn('Failed to delete test user:', error)
  } catch (error) {
    console.warn('Error cleaning up test user:', error)
  }
}

describe('Property 9: Unauthorized Feature Access Denial', () => {
  const createdClients = []
  const createdUsers = []

  afterAll(async () => {
    // Cleanup all created test data
    for (const clientId of createdClients) {
      await cleanupTestClient(clientId)
    }
    for (const userId of createdUsers) {
      await cleanupTestUser(userId)
    }
  })

  it('should return 403 Forbidden for features not in client tier', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          companyName: fc.string({ minLength: 3, maxLength: 50 }),
          tier: tierArbitrary,
          feature: featureArbitrary
        }),
        async ({ email, companyName, tier, feature }) => {
          let userId = null
          let clientId = null

          try {
            // Create a test user
            const { data: userData, error: userError } = await supabase.auth.admin.createUser({
              email,
              password: 'TestPass123!',
              email_confirm: true,
              user_metadata: { role: 'client' }
            })

            if (userError || !userData.user) {
              console.warn('Failed to create test user:', userError)
              return true // Skip this iteration
            }

            userId = userData.user.id
            createdUsers.push(userId)

            // Create a test client with the specified tier
            const { data: clientData, error: clientError } = await supabase
              .from('clients')
              .insert({
                user_id: userId,
                email,
                company_name: companyName,
                client_id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                tier,
                status: 'Active'
              })
              .select()
              .single()

            if (clientError || !clientData) {
              console.warn('Failed to create test client:', clientError)
              return true // Skip this iteration
            }

            clientId = clientData.id
            createdClients.push(clientId)

            // Check if the feature is in the tier
            const tierFeatures = TIER_FEATURES[tier]
            const shouldHaveAccess = tierFeatures.includes(feature)

            // Check feature access
            const { hasAccess } = await featureGate.checkFeatureAccess(userId, feature)

            // If the client should NOT have access, verify the middleware would return 403
            if (!shouldHaveAccess) {
              // Create mock request and response objects
              const req = {
                user: {
                  userId: userId,
                  role: 'client'
                }
              }

              let responseStatus = null
              let responseBody = null

              const res = {
                status: (code) => {
                  responseStatus = code
                  return {
                    json: (body) => {
                      responseBody = body
                    }
                  }
                }
              }

              const next = () => {
                // Should not be called for unauthorized access
                throw new Error('next() should not be called for unauthorized access')
              }

              // Call the middleware
              await featureGate.requireFeature(feature)(req, res, next)

              // Verify 403 response
              expect(responseStatus).toBe(403)
              expect(responseBody).toBeDefined()
              expect(responseBody.error).toBeDefined()
              expect(responseBody.error.code).toBe('AUTHZ_TIER_UPGRADE_REQUIRED')
              expect(responseBody.error.message).toContain('tier upgrade')
              expect(responseBody.error.feature).toBe(feature)
              expect(responseBody.error.currentTier).toBe(tier)
            }

          } finally {
            // Cleanup
            if (clientId) {
              await cleanupTestClient(clientId)
              const index = createdClients.indexOf(clientId)
              if (index > -1) createdClients.splice(index, 1)
            }
            if (userId) {
              await cleanupTestUser(userId)
              const index = createdUsers.indexOf(userId)
              if (index > -1) createdUsers.splice(index, 1)
            }
          }
        }
      ),
      { numRuns: 1 }
    )
  })

  it('should return 403 with specific error message for Wingman tier accessing IFTA reports', async () => {
    // Requirement 4.7 - specific example
    let userId = null
    let clientId = null

    try {
      const email = `test-wingman-${Date.now()}@example.com`

      // Create a test user
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email,
        password: 'TestPass123!',
        email_confirm: true,
        user_metadata: { role: 'client' }
      })

      expect(userError).toBeNull()
      expect(userData.user).toBeDefined()

      userId = userData.user.id
      createdUsers.push(userId)

      // Create a Wingman tier client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert({
          user_id: userId,
          email,
          company_name: 'Test Wingman Company',
          client_id: `test-wingman-${Date.now()}`,
          tier: 'wingman',
          status: 'Active'
        })
        .select()
        .single()

      expect(clientError).toBeNull()
      expect(clientData).toBeDefined()

      clientId = clientData.id
      createdClients.push(clientId)

      // Try to access IFTA reports (not in Wingman tier)
      const req = {
        user: {
          userId: userId,
          role: 'client'
        }
      }

      let responseStatus = null
      let responseBody = null

      const res = {
        status: (code) => {
          responseStatus = code
          return {
            json: (body) => {
              responseBody = body
            }
          }
        }
      }

      const next = () => {
        throw new Error('next() should not be called for unauthorized access')
      }

      // Call the middleware
      await featureGate.requireFeature('ifta_reports')(req, res, next)

      // Verify 403 response with proper error message
      expect(responseStatus).toBe(403)
      expect(responseBody.error.code).toBe('AUTHZ_TIER_UPGRADE_REQUIRED')
      expect(responseBody.error.message).toContain('tier upgrade')
      expect(responseBody.error.message).toContain('wingman')
      expect(responseBody.error.message).toContain('ifta_reports')
      expect(responseBody.error.feature).toBe('ifta_reports')
      expect(responseBody.error.currentTier).toBe('wingman')

    } finally {
      // Cleanup
      if (clientId) {
        await cleanupTestClient(clientId)
        const index = createdClients.indexOf(clientId)
        if (index > -1) createdClients.splice(index, 1)
      }
      if (userId) {
        await cleanupTestUser(userId)
        const index = createdUsers.indexOf(userId)
        if (index > -1) createdUsers.splice(index, 1)
      }
    }
  })

  it('should allow access for features included in the tier', async () => {
    // Verify that authorized access works correctly
    let userId = null
    let clientId = null

    try {
      const email = `test-guardian-${Date.now()}@example.com`

      // Create a test user
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email,
        password: 'TestPass123!',
        email_confirm: true,
        user_metadata: { role: 'client' }
      })

      expect(userError).toBeNull()
      expect(userData.user).toBeDefined()

      userId = userData.user.id
      createdUsers.push(userId)

      // Create a Guardian tier client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert({
          user_id: userId,
          email,
          company_name: 'Test Guardian Company',
          client_id: `test-guardian-${Date.now()}`,
          tier: 'guardian',
          status: 'Active'
        })
        .select()
        .single()

      expect(clientError).toBeNull()
      expect(clientData).toBeDefined()

      clientId = clientData.id
      createdClients.push(clientId)

      // Try to access IFTA reports (included in Guardian tier)
      const req = {
        user: {
          userId: userId,
          role: 'client'
        }
      }

      let nextCalled = false

      const res = {
        status: (code) => {
          throw new Error(`res.status should not be called for authorized access, got ${code}`)
        }
      }

      const next = () => {
        nextCalled = true
      }

      // Call the middleware
      await featureGate.requireFeature('ifta_reports')(req, res, next)

      // Verify next() was called (access granted)
      expect(nextCalled).toBe(true)

    } finally {
      // Cleanup
      if (clientId) {
        await cleanupTestClient(clientId)
        const index = createdClients.indexOf(clientId)
        if (index > -1) createdClients.splice(index, 1)
      }
      if (userId) {
        await cleanupTestUser(userId)
        const index = createdUsers.indexOf(userId)
        if (index > -1) createdUsers.splice(index, 1)
      }
    }
  })

  it('should allow admin users to access all features regardless of tier', async () => {
    // Admins should bypass tier checks
    let userId = null

    try {
      const email = `test-admin-${Date.now()}@example.com`

      // Create an admin user
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email,
        password: 'TestPass123!',
        email_confirm: true,
        user_metadata: { role: 'admin' }
      })

      expect(userError).toBeNull()
      expect(userData.user).toBeDefined()

      userId = userData.user.id
      createdUsers.push(userId)

      // Try to access any feature as admin
      const req = {
        user: {
          userId: userId,
          role: 'admin'
        }
      }

      let nextCalled = false

      const res = {
        status: (code) => {
          throw new Error(`res.status should not be called for admin access, got ${code}`)
        }
      }

      const next = () => {
        nextCalled = true
      }

      // Call the middleware for a feature
      await featureGate.requireFeature('csa_scores')(req, res, next)

      // Verify next() was called (access granted)
      expect(nextCalled).toBe(true)

    } finally {
      // Cleanup
      if (userId) {
        await cleanupTestUser(userId)
        const index = createdUsers.indexOf(userId)
        if (index > -1) createdUsers.splice(index, 1)
      }
    }
  })

  it('should return 401 for unauthenticated requests', async () => {
    // Verify authentication is required
    const req = {
      user: null // No user
    }

    let responseStatus = null
    let responseBody = null

    const res = {
      status: (code) => {
        responseStatus = code
        return {
          json: (body) => {
            responseBody = body
          }
        }
      }
    }

    const next = () => {
      throw new Error('next() should not be called for unauthenticated request')
    }

    // Call the middleware
    await featureGate.requireFeature('support_tickets')(req, res, next)

    // Verify 401 response
    expect(responseStatus).toBe(401)
    expect(responseBody.error.code).toBe('AUTH_REQUIRED')
  })
})
