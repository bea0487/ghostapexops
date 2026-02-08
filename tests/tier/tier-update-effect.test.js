// Feature: ghost-apex-backend, Property 10: Immediate Tier Update Effect
// **Validates: Requirements 4.9**

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import * as fc from 'fast-check'
import { TierService, TIER_FEATURES } from '../../src/lib/TierService.js'
import { FeatureGate } from '../../src/lib/FeatureGate.js'

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

const tierService = new TierService()
const featureGate = new FeatureGate()

// Valid tiers in the system
const validTiers = Object.keys(TIER_FEATURES)

// Arbitrary for generating tier pairs (from tier -> to tier)
const tierPairArbitrary = fc.tuple(
  fc.constantFrom(...validTiers),
  fc.constantFrom(...validTiers)
).filter(([from, to]) => from !== to) // Ensure tiers are different

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

describe('Property 10: Immediate Tier Update Effect', () => {
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

  it('should immediately reflect new tier permissions after tier update', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          companyName: fc.string({ minLength: 3, maxLength: 50 }),
          tierPair: tierPairArbitrary
        }),
        async ({ email, companyName, tierPair }) => {
          const [fromTier, toTier] = tierPair
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

            // Create a test client with the initial tier
            const { data: clientData, error: clientError } = await supabase
              .from('clients')
              .insert({
                user_id: userId,
                email,
                company_name: companyName,
                client_id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                tier: fromTier,
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

            // Get features for both tiers
            const fromFeatures = tierService.getAvailableFeatures(fromTier)
            const toFeatures = tierService.getAvailableFeatures(toTier)

            // Verify initial tier access
            const initialTier = await tierService.getClientTier(clientId)
            expect(initialTier).toBe(fromTier)

            // Update the client's tier (simulating admin action)
            const { error: updateError } = await supabase
              .from('clients')
              .update({ tier: toTier })
              .eq('id', clientId)

            if (updateError) {
              console.warn('Failed to update client tier:', updateError)
              return true // Skip this iteration
            }

            // Immediately query the new tier
            const updatedTier = await tierService.getClientTier(clientId)
            expect(updatedTier).toBe(toTier)

            // Verify that feature access immediately reflects the new tier
            // Test a feature that's in the new tier
            if (toFeatures.length > 0) {
              const featureInNewTier = toFeatures[0]
              const hasAccess = await tierService.validateTierAccess(clientId, featureInNewTier)
              expect(hasAccess).toBe(true)
            }

            // Test a feature that was in the old tier but not in the new tier
            const featureOnlyInOldTier = fromFeatures.find(f => !toFeatures.includes(f))
            if (featureOnlyInOldTier) {
              const hasAccess = await tierService.validateTierAccess(clientId, featureOnlyInOldTier)
              expect(hasAccess).toBe(false)
            }

            // Test a feature that's in the new tier but not in the old tier
            const featureOnlyInNewTier = toFeatures.find(f => !fromFeatures.includes(f))
            if (featureOnlyInNewTier) {
              const hasAccess = await tierService.validateTierAccess(clientId, featureOnlyInNewTier)
              expect(hasAccess).toBe(true)
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

  it('should immediately grant access to new features after tier upgrade', async () => {
    // Requirement 4.9 - specific example: Wingman -> Guardian upgrade
    let userId = null
    let clientId = null

    try {
      const email = `test-upgrade-${Date.now()}@example.com`

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
          company_name: 'Test Upgrade Company',
          client_id: `test-upgrade-${Date.now()}`,
          tier: 'wingman',
          status: 'Active'
        })
        .select()
        .single()

      expect(clientError).toBeNull()
      expect(clientData).toBeDefined()

      clientId = clientData.id
      createdClients.push(clientId)

      // Verify initial access - Wingman should NOT have access to IFTA reports
      const initialAccess = await tierService.validateTierAccess(clientId, 'ifta_reports')
      expect(initialAccess).toBe(false)

      // Verify initial access via FeatureGate
      const initialCheck = await featureGate.checkFeatureAccess(userId, 'ifta_reports')
      expect(initialCheck.hasAccess).toBe(false)
      expect(initialCheck.tier).toBe('wingman')

      // Admin updates tier to Guardian
      const { error: updateError } = await supabase
        .from('clients')
        .update({ tier: 'guardian' })
        .eq('id', clientId)

      expect(updateError).toBeNull()

      // Immediately verify new access - Guardian SHOULD have access to IFTA reports
      const updatedAccess = await tierService.validateTierAccess(clientId, 'ifta_reports')
      expect(updatedAccess).toBe(true)

      // Verify updated access via FeatureGate
      const updatedCheck = await featureGate.checkFeatureAccess(userId, 'ifta_reports')
      expect(updatedCheck.hasAccess).toBe(true)
      expect(updatedCheck.tier).toBe('guardian')

      // Verify Guardian still has access to Wingman features
      const wingmanFeatureAccess = await tierService.validateTierAccess(clientId, 'support_tickets')
      expect(wingmanFeatureAccess).toBe(true)

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

  it('should immediately revoke access to features after tier downgrade', async () => {
    // Requirement 4.9 - specific example: Guardian -> Wingman downgrade
    let userId = null
    let clientId = null

    try {
      const email = `test-downgrade-${Date.now()}@example.com`

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
          company_name: 'Test Downgrade Company',
          client_id: `test-downgrade-${Date.now()}`,
          tier: 'guardian',
          status: 'Active'
        })
        .select()
        .single()

      expect(clientError).toBeNull()
      expect(clientData).toBeDefined()

      clientId = clientData.id
      createdClients.push(clientId)

      // Verify initial access - Guardian SHOULD have access to IFTA reports
      const initialAccess = await tierService.validateTierAccess(clientId, 'ifta_reports')
      expect(initialAccess).toBe(true)

      // Admin downgrades tier to Wingman
      const { error: updateError } = await supabase
        .from('clients')
        .update({ tier: 'wingman' })
        .eq('id', clientId)

      expect(updateError).toBeNull()

      // Immediately verify access is revoked - Wingman should NOT have access to IFTA reports
      const updatedAccess = await tierService.validateTierAccess(clientId, 'ifta_reports')
      expect(updatedAccess).toBe(false)

      // Verify revoked access via FeatureGate
      const updatedCheck = await featureGate.checkFeatureAccess(userId, 'ifta_reports')
      expect(updatedCheck.hasAccess).toBe(false)
      expect(updatedCheck.tier).toBe('wingman')

      // Verify Wingman still has access to its own features
      const wingmanFeatureAccess = await tierService.validateTierAccess(clientId, 'support_tickets')
      expect(wingmanFeatureAccess).toBe(true)

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

  it('should handle multiple rapid tier updates correctly', async () => {
    // Test that rapid tier changes are handled correctly
    let userId = null
    let clientId = null

    try {
      const email = `test-rapid-${Date.now()}@example.com`

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
          company_name: 'Test Rapid Update Company',
          client_id: `test-rapid-${Date.now()}`,
          tier: 'wingman',
          status: 'Active'
        })
        .select()
        .single()

      expect(clientError).toBeNull()
      expect(clientData).toBeDefined()

      clientId = clientData.id
      createdClients.push(clientId)

      // Perform rapid tier updates: wingman -> guardian -> apex_command
      const tiers = ['guardian', 'apex_command']
      
      for (const tier of tiers) {
        // Update tier
        const { error: updateError } = await supabase
          .from('clients')
          .update({ tier })
          .eq('id', clientId)

        expect(updateError).toBeNull()

        // Immediately verify the tier is updated
        const currentTier = await tierService.getClientTier(clientId)
        expect(currentTier).toBe(tier)

        // Verify feature access matches the current tier
        const features = tierService.getAvailableFeatures(tier)
        for (const feature of features) {
          if (feature !== '*') {
            const hasAccess = await tierService.validateTierAccess(clientId, feature)
            expect(hasAccess).toBe(true)
          }
        }
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
  })

  it('should reflect tier update in middleware authorization immediately', async () => {
    // Test that middleware checks reflect tier updates immediately
    let userId = null
    let clientId = null

    try {
      const email = `test-middleware-${Date.now()}@example.com`

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
          company_name: 'Test Middleware Company',
          client_id: `test-middleware-${Date.now()}`,
          tier: 'wingman',
          status: 'Active'
        })
        .select()
        .single()

      expect(clientError).toBeNull()
      expect(clientData).toBeDefined()

      clientId = clientData.id
      createdClients.push(clientId)

      // Create mock request
      const req = {
        user: {
          userId: userId,
          role: 'client'
        }
      }

      // Test initial access - should be denied for IFTA reports
      let responseStatus = null
      let responseBody = null

      const res1 = {
        status: (code) => {
          responseStatus = code
          return {
            json: (body) => {
              responseBody = body
            }
          }
        }
      }

      await featureGate.requireFeature('ifta_reports')(req, res1, () => {
        throw new Error('Should not call next() for unauthorized access')
      })

      expect(responseStatus).toBe(403)

      // Update tier to Guardian
      const { error: updateError } = await supabase
        .from('clients')
        .update({ tier: 'guardian' })
        .eq('id', clientId)

      expect(updateError).toBeNull()

      // Test access again - should now be granted
      let nextCalled = false

      const res2 = {
        status: (code) => {
          throw new Error(`Should not call res.status for authorized access, got ${code}`)
        }
      }

      await featureGate.requireFeature('ifta_reports')(req, res2, () => {
        nextCalled = true
      })

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
})
