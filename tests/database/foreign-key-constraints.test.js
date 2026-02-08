// Feature: ghost-apex-backend, Property 2: Database Foreign Key Enforcement
// **Validates: Requirements 1.17**

import { describe, it, expect, afterAll } from 'vitest'
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

// Helper function to delete a support ticket
async function deleteTicket(ticketId) {
  const { error } = await supabase
    .from('support_tickets')
    .delete()
    .eq('id', ticketId)
  if (error) console.warn('Failed to delete ticket:', error)
}

describe('Property 2: Database Foreign Key Enforcement', () => {
  const createdUserIds = []
  const createdClientIds = []
  const createdTicketIds = []

  afterAll(async () => {
    // Cleanup: Delete all created test data
    for (const ticketId of createdTicketIds) {
      await deleteTicket(ticketId)
    }
    for (const clientId of createdClientIds) {
      await deleteClient(clientId)
    }
    for (const userId of createdUserIds) {
      await deleteTestUser(userId)
    }
  })

  it('should reject document insertion with non-existent client_id', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random document data with non-existent client_id
        fc.record({
          nonExistentClientId: fc.uuid(),
          fileName: fc.string({ minLength: 3, maxLength: 50 }),
          fileType: fc.constantFrom('pdf', 'docx', 'xlsx', 'png', 'jpg', 'csv'),
          s3Key: fc.string({ minLength: 10, maxLength: 100 }),
          s3Bucket: fc.constant('ghost-apex-documents')
        }),
        async ({ nonExistentClientId, fileName, fileType, s3Key, s3Bucket }) => {
          // Attempt to insert document with non-existent client_id
          const { data, error } = await supabase
            .from('documents')
            .insert({
              client_id: nonExistentClientId,
              file_name: fileName,
              file_type: fileType,
              s3_key: s3Key,
              s3_bucket: s3Bucket
            })
            .select()
            .single()

          // Should fail with foreign key constraint violation
          expect(error).toBeDefined()
          expect(error.code).toBe('23503') // PostgreSQL foreign key violation error code
          expect(error.message).toContain('violates foreign key constraint')
          expect(data).toBeNull()
        }
      ),
      { numRuns: 1 }
    )
  })

  it('should reject support_ticket insertion with non-existent client_id', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random ticket data with non-existent client_id
        fc.record({
          nonExistentClientId: fc.uuid(),
          subject: fc.string({ minLength: 5, maxLength: 100 }),
          message: fc.string({ minLength: 10, maxLength: 500 }),
          priority: fc.constantFrom('Low', 'Medium', 'High', 'Urgent')
        }),
        async ({ nonExistentClientId, subject, message, priority }) => {
          // Attempt to insert ticket with non-existent client_id
          const { data, error } = await supabase
            .from('support_tickets')
            .insert({
              client_id: nonExistentClientId,
              subject: subject,
              message: message,
              priority: priority
            })
            .select()
            .single()

          // Should fail with foreign key constraint violation
          expect(error).toBeDefined()
          expect(error.code).toBe('23503') // PostgreSQL foreign key violation error code
          expect(error.message).toContain('violates foreign key constraint')
          expect(data).toBeNull()
        }
      ),
      { numRuns: 1 }
    )
  })

  it('should reject ticket_message insertion with non-existent ticket_id', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random message data with non-existent ticket_id
        fc.record({
          nonExistentTicketId: fc.uuid(),
          message: fc.string({ minLength: 10, maxLength: 500 }),
          senderType: fc.constantFrom('admin', 'client')
        }),
        async ({ nonExistentTicketId, message, senderType }) => {
          let user

          try {
            // Create a test user for sender_id (required foreign key)
            user = await createTestUser(`test-${Date.now()}-${Math.random()}@example.com`)
            createdUserIds.push(user.id)

            // Attempt to insert message with non-existent ticket_id
            const { data, error } = await supabase
              .from('ticket_messages')
              .insert({
                ticket_id: nonExistentTicketId,
                sender_id: user.id,
                sender_type: senderType,
                message: message
              })
              .select()
              .single()

            // Should fail with foreign key constraint violation
            expect(error).toBeDefined()
            expect(error.code).toBe('23503') // PostgreSQL foreign key violation error code
            expect(error.message).toContain('violates foreign key constraint')
            expect(data).toBeNull()

          } finally {
            // Cleanup for this iteration
            if (user) {
              await deleteTestUser(user.id)
              const index = createdUserIds.indexOf(user.id)
              if (index > -1) createdUserIds.splice(index, 1)
            }
          }
        }
      ),
      { numRuns: 1 }
    )
  })

  it('should reject eld_report insertion with non-existent client_id', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random ELD report data with non-existent client_id
        fc.record({
          nonExistentClientId: fc.uuid(),
          weekStart: fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
          violations: fc.integer({ min: 0, max: 50 })
        }),
        async ({ nonExistentClientId, weekStart, violations }) => {
          // Format date as YYYY-MM-DD
          const formattedDate = weekStart.toISOString().split('T')[0]

          // Attempt to insert ELD report with non-existent client_id
          const { data, error } = await supabase
            .from('eld_reports')
            .insert({
              client_id: nonExistentClientId,
              week_start: formattedDate,
              violations: violations
            })
            .select()
            .single()

          // Should fail with foreign key constraint violation
          expect(error).toBeDefined()
          expect(error.code).toBe('23503') // PostgreSQL foreign key violation error code
          expect(error.message).toContain('violates foreign key constraint')
          expect(data).toBeNull()
        }
      ),
      { numRuns: 1 }
    )
  })

  it('should reject ifta_record insertion with non-existent client_id', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random IFTA record data with non-existent client_id
        fc.record({
          nonExistentClientId: fc.uuid(),
          quarter: fc.integer({ min: 1, max: 4 }),
          year: fc.integer({ min: 2020, max: 2030 }),
          totalMiles: fc.float({ min: 100, max: 100000 }),
          taxableMiles: fc.float({ min: 100, max: 100000 }),
          fuelGallons: fc.float({ min: 10, max: 10000 }),
          taxOwed: fc.float({ min: 0, max: 10000 })
        }),
        async ({ nonExistentClientId, quarter, year, totalMiles, taxableMiles, fuelGallons, taxOwed }) => {
          // Attempt to insert IFTA record with non-existent client_id
          const { data, error } = await supabase
            .from('ifta_records')
            .insert({
              client_id: nonExistentClientId,
              quarter: quarter,
              year: year,
              total_miles: totalMiles,
              taxable_miles: taxableMiles,
              fuel_gallons: fuelGallons,
              tax_owed: taxOwed
            })
            .select()
            .single()

          // Should fail with foreign key constraint violation
          expect(error).toBeDefined()
          expect(error.code).toBe('23503') // PostgreSQL foreign key violation error code
          expect(error.message).toContain('violates foreign key constraint')
          expect(data).toBeNull()
        }
      ),
      { numRuns: 1 }
    )
  })

  it('should reject driver_file insertion with non-existent client_id', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random driver file data with non-existent client_id
        fc.record({
          nonExistentClientId: fc.uuid(),
          driverName: fc.string({ minLength: 3, maxLength: 50 }),
          licenseNumber: fc.string({ minLength: 5, maxLength: 20 }),
          fileType: fc.constantFrom('license', 'medical_card', 'application', 'mvr', 'clearinghouse'),
          s3Key: fc.string({ minLength: 10, maxLength: 100 })
        }),
        async ({ nonExistentClientId, driverName, licenseNumber, fileType, s3Key }) => {
          // Attempt to insert driver file with non-existent client_id
          const { data, error } = await supabase
            .from('driver_files')
            .insert({
              client_id: nonExistentClientId,
              driver_name: driverName,
              license_number: licenseNumber,
              file_type: fileType,
              s3_key: s3Key
            })
            .select()
            .single()

          // Should fail with foreign key constraint violation
          expect(error).toBeDefined()
          expect(error.code).toBe('23503') // PostgreSQL foreign key violation error code
          expect(error.message).toContain('violates foreign key constraint')
          expect(data).toBeNull()
        }
      ),
      { numRuns: 1 }
    )
  })

  it('should reject csa_score insertion with non-existent client_id', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random CSA score data with non-existent client_id
        fc.record({
          nonExistentClientId: fc.uuid(),
          scoreDate: fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
          unsafeDriving: fc.float({ min: 0, max: 100 }),
          hosCompliance: fc.float({ min: 0, max: 100 })
        }),
        async ({ nonExistentClientId, scoreDate, unsafeDriving, hosCompliance }) => {
          // Format date as YYYY-MM-DD
          const formattedDate = scoreDate.toISOString().split('T')[0]

          // Attempt to insert CSA score with non-existent client_id
          const { data, error } = await supabase
            .from('csa_scores')
            .insert({
              client_id: nonExistentClientId,
              score_date: formattedDate,
              unsafe_driving: unsafeDriving,
              hos_compliance: hosCompliance
            })
            .select()
            .single()

          // Should fail with foreign key constraint violation
          expect(error).toBeDefined()
          expect(error.code).toBe('23503') // PostgreSQL foreign key violation error code
          expect(error.message).toContain('violates foreign key constraint')
          expect(data).toBeNull()
        }
      ),
      { numRuns: 1 }
    )
  })

  it('should allow insertion with valid foreign key references', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate valid client and document data
        fc.record({
          email: fc.emailAddress(),
          clientId: fc.string({ minLength: 6, maxLength: 20 }).filter(s => /^[A-Za-z0-9-]+$/.test(s)),
          companyName: fc.string({ minLength: 3, maxLength: 50 }),
          tier: fc.constantFrom('wingman', 'guardian', 'apex_command', 'virtual_dispatcher', 'dot_readiness_audit', 'back_office_command'),
          fileName: fc.string({ minLength: 3, maxLength: 50 }),
          fileType: fc.constantFrom('pdf', 'docx', 'xlsx', 'png', 'jpg', 'csv'),
          s3Key: fc.string({ minLength: 10, maxLength: 100 }),
          s3Bucket: fc.constant('ghost-apex-documents')
        }),
        async ({ email, clientId, companyName, tier, fileName, fileType, s3Key, s3Bucket }) => {
          let user, client, documentId

          try {
            // Create a test user
            user = await createTestUser(email)
            createdUserIds.push(user.id)

            // Create a client record
            const { data: clientData, error: clientError } = await supabase
              .from('clients')
              .insert({
                user_id: user.id,
                email: email,
                company_name: companyName,
                client_id: clientId,
                tier: tier
              })
              .select()
              .single()

            expect(clientError).toBeNull()
            expect(clientData).toBeDefined()
            client = clientData
            createdClientIds.push(client.id)

            // Insert document with VALID client_id reference
            const { data: documentData, error: documentError } = await supabase
              .from('documents')
              .insert({
                client_id: client.id,
                file_name: fileName,
                file_type: fileType,
                s3_key: s3Key,
                s3_bucket: s3Bucket
              })
              .select()
              .single()

            // Should succeed
            expect(documentError).toBeNull()
            expect(documentData).toBeDefined()
            expect(documentData.client_id).toBe(client.id)
            documentId = documentData.id

          } finally {
            // Cleanup for this iteration
            if (documentId) {
              await supabase.from('documents').delete().eq('id', documentId)
            }
            if (client) {
              await deleteClient(client.id)
              const index = createdClientIds.indexOf(client.id)
              if (index > -1) createdClientIds.splice(index, 1)
            }
            if (user) {
              await deleteTestUser(user.id)
              const index = createdUserIds.indexOf(user.id)
              if (index > -1) createdUserIds.splice(index, 1)
            }
          }
        }
      ),
      { numRuns: 1 }
    )
  })
})
