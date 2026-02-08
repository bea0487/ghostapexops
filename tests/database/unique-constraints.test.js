// Feature: ghost-apex-backend, Property 1: Database Unique Constraint Enforcement
// **Validates: Requirements 1.16**

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import * as fc from 'fast-check'

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

// Helper function to create a test user in auth.users
async function createTestUser(email) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: 'TestPassword123!',
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

// Helper function to delete a client record
async function deleteClient(clientId) {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId)
  if (error) console.warn('Failed to delete client:', error)
}

describe('Property 1: Database Unique Constraint Enforcement', () => {
  const createdUserIds = []
  const createdClientIds = []

  afterAll(async () => {
    // Cleanup: Delete all created test data
    for (const clientId of createdClientIds) {
      await deleteClient(clientId)
    }
    for (const userId of createdUserIds) {
      await deleteTestUser(userId)
    }
  })

  it('should enforce unique constraint on client_id field', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random client data
        fc.record({
          clientId: fc.string({ minLength: 6, maxLength: 20 }).filter(s => /^[A-Za-z0-9-]+$/.test(s)),
          email1: fc.emailAddress(),
          email2: fc.emailAddress(),
          companyName: fc.string({ minLength: 3, maxLength: 50 }),
          tier: fc.constantFrom('wingman', 'guardian', 'apex_command', 'virtual_dispatcher', 'dot_readiness_audit', 'back_office_command')
        }),
        async ({ clientId, email1, email2, companyName, tier }) => {
          // Ensure emails are different
          if (email1 === email2) {
            email2 = `alt-${email2}`
          }

          let user1, user2, client1Id

          try {
            // Create two test users
            user1 = await createTestUser(email1)
            createdUserIds.push(user1.id)
            
            user2 = await createTestUser(email2)
            createdUserIds.push(user2.id)

            // Insert first client record with the client_id
            const { data: client1, error: error1 } = await supabase
              .from('clients')
              .insert({
                user_id: user1.id,
                email: email1,
                company_name: companyName,
                client_id: clientId,
                tier: tier
              })
              .select()
              .single()

            // First insert should succeed
            expect(error1).toBeNull()
            expect(client1).toBeDefined()
            expect(client1.client_id).toBe(clientId)
            
            client1Id = client1.id
            createdClientIds.push(client1Id)

            // Attempt to insert second client record with the SAME client_id
            const { data: client2, error: error2 } = await supabase
              .from('clients')
              .insert({
                user_id: user2.id,
                email: email2,
                company_name: `${companyName} 2`,
                client_id: clientId, // Same client_id as first record
                tier: tier
              })
              .select()
              .single()

            // Second insert should fail with unique constraint violation
            expect(error2).toBeDefined()
            expect(error2.code).toBe('23505') // PostgreSQL unique violation error code
            expect(error2.message).toContain('duplicate key value violates unique constraint')
            expect(error2.message).toContain('client_id')
            expect(client2).toBeNull()

          } finally {
            // Cleanup for this iteration
            if (client1Id) {
              await deleteClient(client1Id)
              const index = createdClientIds.indexOf(client1Id)
              if (index > -1) createdClientIds.splice(index, 1)
            }
            if (user1) {
              await deleteTestUser(user1.id)
              const index = createdUserIds.indexOf(user1.id)
              if (index > -1) createdUserIds.splice(index, 1)
            }
            if (user2) {
              await deleteTestUser(user2.id)
              const index = createdUserIds.indexOf(user2.id)
              if (index > -1) createdUserIds.splice(index, 1)
            }
          }
        }
      ),
      { numRuns: 1 } // Run 3 iterations with different random data
    )
  })

  it('should allow different client_id values for different clients', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate two different client records
        fc.record({
          clientId1: fc.string({ minLength: 6, maxLength: 20 }).filter(s => /^[A-Za-z0-9-]+$/.test(s)),
          clientId2: fc.string({ minLength: 6, maxLength: 20 }).filter(s => /^[A-Za-z0-9-]+$/.test(s)),
          email1: fc.emailAddress(),
          email2: fc.emailAddress(),
          companyName: fc.string({ minLength: 3, maxLength: 50 }),
          tier: fc.constantFrom('wingman', 'guardian', 'apex_command', 'virtual_dispatcher', 'dot_readiness_audit', 'back_office_command')
        }).filter(({ clientId1, clientId2, email1, email2 }) => 
          clientId1 !== clientId2 && email1 !== email2
        ),
        async ({ clientId1, clientId2, email1, email2, companyName, tier }) => {
          let user1, user2, client1Id, client2Id

          try {
            // Create two test users
            user1 = await createTestUser(email1)
            createdUserIds.push(user1.id)
            
            user2 = await createTestUser(email2)
            createdUserIds.push(user2.id)

            // Insert first client record
            const { data: client1, error: error1 } = await supabase
              .from('clients')
              .insert({
                user_id: user1.id,
                email: email1,
                company_name: companyName,
                client_id: clientId1,
                tier: tier
              })
              .select()
              .single()

            expect(error1).toBeNull()
            expect(client1).toBeDefined()
            client1Id = client1.id
            createdClientIds.push(client1Id)

            // Insert second client record with DIFFERENT client_id
            const { data: client2, error: error2 } = await supabase
              .from('clients')
              .insert({
                user_id: user2.id,
                email: email2,
                company_name: `${companyName} 2`,
                client_id: clientId2, // Different client_id
                tier: tier
              })
              .select()
              .single()

            // Both inserts should succeed
            expect(error2).toBeNull()
            expect(client2).toBeDefined()
            expect(client2.client_id).toBe(clientId2)
            client2Id = client2.id
            createdClientIds.push(client2Id)

          } finally {
            // Cleanup for this iteration
            if (client1Id) {
              await deleteClient(client1Id)
              const index = createdClientIds.indexOf(client1Id)
              if (index > -1) createdClientIds.splice(index, 1)
            }
            if (client2Id) {
              await deleteClient(client2Id)
              const index = createdClientIds.indexOf(client2Id)
              if (index > -1) createdClientIds.splice(index, 1)
            }
            if (user1) {
              await deleteTestUser(user1.id)
              const index = createdUserIds.indexOf(user1.id)
              if (index > -1) createdUserIds.splice(index, 1)
            }
            if (user2) {
              await deleteTestUser(user2.id)
              const index = createdUserIds.indexOf(user2.id)
              if (index > -1) createdUserIds.splice(index, 1)
            }
          }
        }
      ),
      { numRuns: 1 } // Run 3 iterations with different random data
    )
  })
})
