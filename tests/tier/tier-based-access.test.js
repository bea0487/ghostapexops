// Feature: ghost-apex-backend, Property 8: Tier-Based Feature Access Control
// **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6**

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import * as fc from 'fast-check'
import { TierService, TIER_FEATURES, ALL_FEATURES } from '../../src/lib/TierService.js'

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

// Valid tiers in the system
const validTiers = Object.keys(TIER_FEATURES)

// Arbitrary for generating valid tiers
const tierArbitrary = fc.constantFrom(...validTiers)

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

describe('Property 8: Tier-Based Feature Access Control', () => {
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

  it('should grant access to features included in the tier', async () => {
    await fc.assert(
      fc.asyncProperty(
        tierArbitrary,
        async (tier) => {
          // Get the features for this tier
          const expectedFeatures = TIER_FEATURES[tier]
          
          // For each feature in the tier, hasFeatureAccess should return true
          for (const feature of expectedFeatures) {
            if (feature === '*') {
              // Back Office Command has access to all features
              for (const testFeature of ALL_FEATURES) {
                const hasAccess = tierService.hasFeatureAccess(tier, testFeature)
                expect(hasAccess).toBe(true)
              }
            } else {
              const hasAccess = tierService.hasFeatureAccess(tier, feature)
              expect(hasAccess).toBe(true)
            }
          }
        }
      ),
      { numRuns: 1 }
    )
  })

  it('should deny access to features not included in the tier', async () => {
    await fc.assert(
      fc.asyncProperty(
        tierArbitrary,
        featureArbitrary,
        async (tier, feature) => {
          const tierFeatures = TIER_FEATURES[tier]
          
          // Skip if tier has wildcard access (back_office_command)
          if (tierFeatures.includes('*')) {
            return true
          }
          
          // Check if feature is in the tier
          const shouldHaveAccess = tierFeatures.includes(feature)
          const actualHasAccess = tierService.hasFeatureAccess(tier, feature)
          
          // Access should match whether feature is in tier
          expect(actualHasAccess).toBe(shouldHaveAccess)
        }
      ),
      { numRuns: 1 }
    )
  })

  it('should return correct available features for each tier', async () => {
    await fc.assert(
      fc.asyncProperty(
        tierArbitrary,
        async (tier) => {
          const availableFeatures = tierService.getAvailableFeatures(tier)
          const expectedFeatures = TIER_FEATURES[tier]
          
          if (expectedFeatures.includes('*')) {
            // Back Office Command should have all features
            expect(availableFeatures).toEqual(ALL_FEATURES)
          } else {
            // Should match the tier's feature list
            expect(availableFeatures.sort()).toEqual(expectedFeatures.sort())
          }
        }
      ),
      { numRuns: 1 }
    )
  })

  it('should validate tier access correctly for database clients', async () => {
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

            // Validate tier access
            const hasAccess = await tierService.validateTierAccess(clientId, feature)
            const expectedAccess = tierService.hasFeatureAccess(tier, feature)

            // Should match the expected access
            expect(hasAccess).toBe(expectedAccess)

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

  it('should grant Wingman tier access to support_tickets, eld_reports, and dispatch_board', () => {
    // Requirement 4.1
    expect(tierService.hasFeatureAccess('wingman', 'support_tickets')).toBe(true)
    expect(tierService.hasFeatureAccess('wingman', 'eld_reports')).toBe(true)
    expect(tierService.hasFeatureAccess('wingman', 'dispatch_board')).toBe(true)
    
    // Should not have access to other features
    expect(tierService.hasFeatureAccess('wingman', 'ifta_reports')).toBe(false)
    expect(tierService.hasFeatureAccess('wingman', 'csa_scores')).toBe(false)
  })

  it('should grant Guardian tier access to all Wingman features plus ifta_reports and driver_files', () => {
    // Requirement 4.2
    // Wingman features
    expect(tierService.hasFeatureAccess('guardian', 'support_tickets')).toBe(true)
    expect(tierService.hasFeatureAccess('guardian', 'eld_reports')).toBe(true)
    expect(tierService.hasFeatureAccess('guardian', 'dispatch_board')).toBe(true)
    
    // Additional Guardian features
    expect(tierService.hasFeatureAccess('guardian', 'ifta_reports')).toBe(true)
    expect(tierService.hasFeatureAccess('guardian', 'driver_files')).toBe(true)
    
    // Should not have access to higher tier features
    expect(tierService.hasFeatureAccess('guardian', 'csa_scores')).toBe(false)
    expect(tierService.hasFeatureAccess('guardian', 'dataq_disputes')).toBe(false)
  })

  it('should grant Apex Command tier access to all Guardian features plus csa_scores and dataq_disputes', () => {
    // Requirement 4.3
    // Guardian features
    expect(tierService.hasFeatureAccess('apex_command', 'support_tickets')).toBe(true)
    expect(tierService.hasFeatureAccess('apex_command', 'eld_reports')).toBe(true)
    expect(tierService.hasFeatureAccess('apex_command', 'dispatch_board')).toBe(true)
    expect(tierService.hasFeatureAccess('apex_command', 'ifta_reports')).toBe(true)
    expect(tierService.hasFeatureAccess('apex_command', 'driver_files')).toBe(true)
    
    // Additional Apex Command features
    expect(tierService.hasFeatureAccess('apex_command', 'csa_scores')).toBe(true)
    expect(tierService.hasFeatureAccess('apex_command', 'dataq_disputes')).toBe(true)
  })

  it('should grant Virtual Dispatcher tier access to specific features', () => {
    // Requirement 4.4
    expect(tierService.hasFeatureAccess('virtual_dispatcher', 'support_tickets')).toBe(true)
    expect(tierService.hasFeatureAccess('virtual_dispatcher', 'eld_reports')).toBe(true)
    expect(tierService.hasFeatureAccess('virtual_dispatcher', 'ifta_reports')).toBe(true)
    expect(tierService.hasFeatureAccess('virtual_dispatcher', 'driver_files')).toBe(true)
    expect(tierService.hasFeatureAccess('virtual_dispatcher', 'dispatch_board')).toBe(true)
    expect(tierService.hasFeatureAccess('virtual_dispatcher', 'load_schedules')).toBe(true)
    expect(tierService.hasFeatureAccess('virtual_dispatcher', 'broker_packets')).toBe(true)
    expect(tierService.hasFeatureAccess('virtual_dispatcher', 'revenue_reports')).toBe(true)
    
    // Should not have access to CSA or DataQ
    expect(tierService.hasFeatureAccess('virtual_dispatcher', 'csa_scores')).toBe(false)
    expect(tierService.hasFeatureAccess('virtual_dispatcher', 'dataq_disputes')).toBe(false)
  })

  it('should grant DOT Readiness Audit tier access to dot_audits only', () => {
    // Requirement 4.5
    expect(tierService.hasFeatureAccess('dot_readiness_audit', 'dot_audits')).toBe(true)
    
    // Should not have access to other features
    expect(tierService.hasFeatureAccess('dot_readiness_audit', 'support_tickets')).toBe(false)
    expect(tierService.hasFeatureAccess('dot_readiness_audit', 'eld_reports')).toBe(false)
  })

  it('should grant Back Office Command tier access to all features', () => {
    // Requirement 4.6
    for (const feature of ALL_FEATURES) {
      expect(tierService.hasFeatureAccess('back_office_command', feature)).toBe(true)
    }
  })

  it('should return empty array for invalid tier', () => {
    const features = tierService.getAvailableFeatures('invalid_tier')
    expect(features).toEqual([])
  })

  it('should return false for null or undefined inputs', () => {
    expect(tierService.hasFeatureAccess(null, 'support_tickets')).toBe(false)
    expect(tierService.hasFeatureAccess('wingman', null)).toBe(false)
    expect(tierService.hasFeatureAccess(undefined, undefined)).toBe(false)
  })
})
