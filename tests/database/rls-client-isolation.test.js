// Feature: ghost-apex-backend, Property 3: Multi-Tenant Data Isolation (Client Access)
// **Validates: Requirements 2.1**

import { describe, it, expect, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import * as fc from 'fast-check'

// Initialize Supabase clients
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  throw new Error('Missing required environment variables: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and VITE_SUPABASE_ANON_KEY')
}

// Admin client (bypasses RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Helper function to create a test user in auth.users
async function createTestUser(email, password = 'TestPassword123!') {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })
  
  if (error) throw error
  return data.user
}

// Helper function to create a client record
async function createTestClient(userId, email, clientId, tier = 'wingman') {
  const { data, error } = await supabaseAdmin
    .from('clients')
    .insert({
      user_id: userId,
      email: email,
      client_id: clientId,
      company_name: `Test Company ${clientId}`,
      tier: tier
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Helper function to sign in as a user and get authenticated client
async function signInAsUser(email, password = 'TestPassword123!') {
  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) throw error
  return { supabaseClient, session: data.session, user: data.user }
}

// Helper function to delete a test user
async function deleteTestUser(userId) {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  if (error) console.warn('Failed to delete test user:', error)
}

// Helper function to delete a client record
async function deleteClient(clientId) {
  const { error } = await supabaseAdmin
    .from('clients')
    .delete()
    .eq('id', clientId)
  if (error) console.warn('Failed to delete client:', error)
}

// Helper function to insert test documents
async function insertTestDocuments(documents) {
  const { data, error } = await supabaseAdmin
    .from('documents')
    .insert(documents)
    .select()
  
  if (error) throw error
  return data
}

// Helper function to insert test support tickets
async function insertTestTickets(tickets) {
  const { data, error } = await supabaseAdmin
    .from('support_tickets')
    .insert(tickets)
    .select()
  
  if (error) throw error
  return data
}

// Helper function to insert test ELD reports
async function insertTestELDReports(reports) {
  const { data, error } = await supabaseAdmin
    .from('eld_reports')
    .insert(reports)
    .select()
  
  if (error) throw error
  return data
}

// Helper function to insert test driver files
async function insertTestDriverFiles(files) {
  const { data, error } = await supabaseAdmin
    .from('driver_files')
    .insert(files)
    .select()
  
  if (error) throw error
  return data
}

// Helper function to delete test data from a table
async function deleteTestData(table, ids) {
  if (ids.length === 0) return
  const { error } = await supabaseAdmin
    .from(table)
    .delete()
    .in('id', ids)
  if (error) console.warn(`Failed to delete test data from ${table}:`, error)
}

describe('Property 3: Multi-Tenant Data Isolation (Client Access)', () => {
  const createdUserIds = []
  const createdClientIds = []
  const createdDocumentIds = []
  const createdTicketIds = []
  const createdELDReportIds = []
  const createdDriverFileIds = []

  afterAll(async () => {
    // Cleanup: Delete all created test data
    await deleteTestData('documents', createdDocumentIds)
    await deleteTestData('support_tickets', createdTicketIds)
    await deleteTestData('eld_reports', createdELDReportIds)
    await deleteTestData('driver_files', createdDriverFileIds)
    
    for (const clientId of createdClientIds) {
      await deleteClient(clientId)
    }
    for (const userId of createdUserIds) {
      await deleteTestUser(userId)
    }
  })

  it('should filter documents by client_id for client users', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate test data for two clients with documents
        fc.record({
          client1Email: fc.emailAddress(),
          client2Email: fc.emailAddress(),
          client1Id: fc.string({ minLength: 6, maxLength: 20 }).filter(s => /^[A-Za-z0-9-]+$/.test(s)),
          client2Id: fc.string({ minLength: 6, maxLength: 20 }).filter(s => /^[A-Za-z0-9-]+$/.test(s)),
          numClient1Docs: fc.integer({ min: 1, max: 5 }),
          numClient2Docs: fc.integer({ min: 1, max: 5 })
        }).filter(({ client1Email, client2Email, client1Id, client2Id }) => 
          client1Email !== client2Email && client1Id !== client2Id
        ),
        async ({ client1Email, client2Email, client1Id, client2Id, numClient1Docs, numClient2Docs }) => {
          let user1, user2, client1, client2, client1Connection, documents = []

          try {
            // Create two test users and clients
            user1 = await createTestUser(client1Email)
            createdUserIds.push(user1.id)
            
            user2 = await createTestUser(client2Email)
            createdUserIds.push(user2.id)

            client1 = await createTestClient(user1.id, client1Email, client1Id)
            createdClientIds.push(client1.id)
            
            client2 = await createTestClient(user2.id, client2Email, client2Id)
            createdClientIds.push(client2.id)

            // Insert documents for both clients
            const client1Docs = Array.from({ length: numClient1Docs }, (_, i) => ({
              client_id: client1.id,
              file_name: `client1-doc-${i}.pdf`,
              file_type: 'pdf',
              s3_key: `${client1Id}/doc-${i}.pdf`,
              s3_bucket: 'test-bucket'
            }))

            const client2Docs = Array.from({ length: numClient2Docs }, (_, i) => ({
              client_id: client2.id,
              file_name: `client2-doc-${i}.pdf`,
              file_type: 'pdf',
              s3_key: `${client2Id}/doc-${i}.pdf`,
              s3_bucket: 'test-bucket'
            }))

            const allDocs = [...client1Docs, ...client2Docs]
            documents = await insertTestDocuments(allDocs)
            createdDocumentIds.push(...documents.map(d => d.id))

            // Sign in as client1 and query documents
            const { supabaseClient } = await signInAsUser(client1Email)
            client1Connection = supabaseClient

            const { data: client1Results, error } = await supabaseClient
              .from('documents')
              .select('*')

            // Should succeed without error
            expect(error).toBeNull()
            expect(client1Results).toBeDefined()

            // All returned documents should belong to client1
            expect(client1Results.length).toBe(numClient1Docs)
            expect(client1Results.every(doc => doc.client_id === client1.id)).toBe(true)
            
            // Should not see any of client2's documents
            expect(client1Results.some(doc => doc.client_id === client2.id)).toBe(false)

          } finally {
            // Cleanup for this iteration
            if (client1Connection) {
              await client1Connection.auth.signOut()
            }
            if (documents.length > 0) {
              await deleteTestData('documents', documents.map(d => d.id))
              documents.forEach(d => {
                const index = createdDocumentIds.indexOf(d.id)
                if (index > -1) createdDocumentIds.splice(index, 1)
              })
            }
            if (client1) {
              await deleteClient(client1.id)
              const index = createdClientIds.indexOf(client1.id)
              if (index > -1) createdClientIds.splice(index, 1)
            }
            if (client2) {
              await deleteClient(client2.id)
              const index = createdClientIds.indexOf(client2.id)
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
      { numRuns: 10 }
    )
  })

  it('should filter support_tickets by client_id for client users', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate test data for two clients with tickets
        fc.record({
          client1Email: fc.emailAddress(),
          client2Email: fc.emailAddress(),
          client1Id: fc.string({ minLength: 6, maxLength: 20 }).filter(s => /^[A-Za-z0-9-]+$/.test(s)),
          client2Id: fc.string({ minLength: 6, maxLength: 20 }).filter(s => /^[A-Za-z0-9-]+$/.test(s)),
          numClient1Tickets: fc.integer({ min: 1, max: 5 }),
          numClient2Tickets: fc.integer({ min: 1, max: 5 })
        }).filter(({ client1Email, client2Email, client1Id, client2Id }) => 
          client1Email !== client2Email && client1Id !== client2Id
        ),
        async ({ client1Email, client2Email, client1Id, client2Id, numClient1Tickets, numClient2Tickets }) => {
          let user1, user2, client1, client2, client1Connection, tickets = []

          try {
            // Create two test users and clients
            user1 = await createTestUser(client1Email)
            createdUserIds.push(user1.id)
            
            user2 = await createTestUser(client2Email)
            createdUserIds.push(user2.id)

            client1 = await createTestClient(user1.id, client1Email, client1Id)
            createdClientIds.push(client1.id)
            
            client2 = await createTestClient(user2.id, client2Email, client2Id)
            createdClientIds.push(client2.id)

            // Insert tickets for both clients
            const client1Tickets = Array.from({ length: numClient1Tickets }, (_, i) => ({
              client_id: client1.id,
              subject: `Client1 Ticket ${i}`,
              message: `This is ticket ${i} for client 1`,
              priority: 'Medium'
            }))

            const client2Tickets = Array.from({ length: numClient2Tickets }, (_, i) => ({
              client_id: client2.id,
              subject: `Client2 Ticket ${i}`,
              message: `This is ticket ${i} for client 2`,
              priority: 'Medium'
            }))

            const allTickets = [...client1Tickets, ...client2Tickets]
            tickets = await insertTestTickets(allTickets)
            createdTicketIds.push(...tickets.map(t => t.id))

            // Sign in as client1 and query tickets
            const { supabaseClient } = await signInAsUser(client1Email)
            client1Connection = supabaseClient

            const { data: client1Results, error } = await supabaseClient
              .from('support_tickets')
              .select('*')

            // Should succeed without error
            expect(error).toBeNull()
            expect(client1Results).toBeDefined()

            // All returned tickets should belong to client1
            expect(client1Results.length).toBe(numClient1Tickets)
            expect(client1Results.every(ticket => ticket.client_id === client1.id)).toBe(true)
            
            // Should not see any of client2's tickets
            expect(client1Results.some(ticket => ticket.client_id === client2.id)).toBe(false)

          } finally {
            // Cleanup for this iteration
            if (client1Connection) {
              await client1Connection.auth.signOut()
            }
            if (tickets.length > 0) {
              await deleteTestData('support_tickets', tickets.map(t => t.id))
              tickets.forEach(t => {
                const index = createdTicketIds.indexOf(t.id)
                if (index > -1) createdTicketIds.splice(index, 1)
              })
            }
            if (client1) {
              await deleteClient(client1.id)
              const index = createdClientIds.indexOf(client1.id)
              if (index > -1) createdClientIds.splice(index, 1)
            }
            if (client2) {
              await deleteClient(client2.id)
              const index = createdClientIds.indexOf(client2.id)
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
      { numRuns: 10 }
    )
  })

  it('should filter eld_reports by client_id for client users', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate test data for two clients with ELD reports
        fc.record({
          client1Email: fc.emailAddress(),
          client2Email: fc.emailAddress(),
          client1Id: fc.string({ minLength: 6, maxLength: 20 }).filter(s => /^[A-Za-z0-9-]+$/.test(s)),
          client2Id: fc.string({ minLength: 6, maxLength: 20 }).filter(s => /^[A-Za-z0-9-]+$/.test(s)),
          numClient1Reports: fc.integer({ min: 1, max: 5 }),
          numClient2Reports: fc.integer({ min: 1, max: 5 })
        }).filter(({ client1Email, client2Email, client1Id, client2Id }) => 
          client1Email !== client2Email && client1Id !== client2Id
        ),
        async ({ client1Email, client2Email, client1Id, client2Id, numClient1Reports, numClient2Reports }) => {
          let user1, user2, client1, client2, client1Connection, reports = []

          try {
            // Create two test users and clients
            user1 = await createTestUser(client1Email)
            createdUserIds.push(user1.id)
            
            user2 = await createTestUser(client2Email)
            createdUserIds.push(user2.id)

            client1 = await createTestClient(user1.id, client1Email, client1Id)
            createdClientIds.push(client1.id)
            
            client2 = await createTestClient(user2.id, client2Email, client2Id)
            createdClientIds.push(client2.id)

            // Insert ELD reports for both clients
            const baseDate = new Date('2024-01-01')
            const client1Reports = Array.from({ length: numClient1Reports }, (_, i) => {
              const weekStart = new Date(baseDate)
              weekStart.setDate(baseDate.getDate() + (i * 7))
              return {
                client_id: client1.id,
                week_start: weekStart.toISOString().split('T')[0],
                violations: i
              }
            })

            const client2Reports = Array.from({ length: numClient2Reports }, (_, i) => {
              const weekStart = new Date(baseDate)
              weekStart.setDate(baseDate.getDate() + (i * 7))
              return {
                client_id: client2.id,
                week_start: weekStart.toISOString().split('T')[0],
                violations: i + 10
              }
            })

            const allReports = [...client1Reports, ...client2Reports]
            reports = await insertTestELDReports(allReports)
            createdELDReportIds.push(...reports.map(r => r.id))

            // Sign in as client1 and query ELD reports
            const { supabaseClient } = await signInAsUser(client1Email)
            client1Connection = supabaseClient

            const { data: client1Results, error } = await supabaseClient
              .from('eld_reports')
              .select('*')

            // Should succeed without error
            expect(error).toBeNull()
            expect(client1Results).toBeDefined()

            // All returned reports should belong to client1
            expect(client1Results.length).toBe(numClient1Reports)
            expect(client1Results.every(report => report.client_id === client1.id)).toBe(true)
            
            // Should not see any of client2's reports
            expect(client1Results.some(report => report.client_id === client2.id)).toBe(false)

          } finally {
            // Cleanup for this iteration
            if (client1Connection) {
              await client1Connection.auth.signOut()
            }
            if (reports.length > 0) {
              await deleteTestData('eld_reports', reports.map(r => r.id))
              reports.forEach(r => {
                const index = createdELDReportIds.indexOf(r.id)
                if (index > -1) createdELDReportIds.splice(index, 1)
              })
            }
            if (client1) {
              await deleteClient(client1.id)
              const index = createdClientIds.indexOf(client1.id)
              if (index > -1) createdClientIds.splice(index, 1)
            }
            if (client2) {
              await deleteClient(client2.id)
              const index = createdClientIds.indexOf(client2.id)
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
      { numRuns: 10 }
    )
  })

  it('should filter driver_files by client_id for client users', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate test data for two clients with driver files
        fc.record({
          client1Email: fc.emailAddress(),
          client2Email: fc.emailAddress(),
          client1Id: fc.string({ minLength: 6, maxLength: 20 }).filter(s => /^[A-Za-z0-9-]+$/.test(s)),
          client2Id: fc.string({ minLength: 6, maxLength: 20 }).filter(s => /^[A-Za-z0-9-]+$/.test(s)),
          numClient1Files: fc.integer({ min: 1, max: 5 }),
          numClient2Files: fc.integer({ min: 1, max: 5 })
        }).filter(({ client1Email, client2Email, client1Id, client2Id }) => 
          client1Email !== client2Email && client1Id !== client2Id
        ),
        async ({ client1Email, client2Email, client1Id, client2Id, numClient1Files, numClient2Files }) => {
          let user1, user2, client1, client2, client1Connection, files = []

          try {
            // Create two test users and clients
            user1 = await createTestUser(client1Email)
            createdUserIds.push(user1.id)
            
            user2 = await createTestUser(client2Email)
            createdUserIds.push(user2.id)

            client1 = await createTestClient(user1.id, client1Email, client1Id)
            createdClientIds.push(client1.id)
            
            client2 = await createTestClient(user2.id, client2Email, client2Id)
            createdClientIds.push(client2.id)

            // Insert driver files for both clients
            const client1Files = Array.from({ length: numClient1Files }, (_, i) => ({
              client_id: client1.id,
              driver_name: `Driver ${i}`,
              license_number: `LIC-${client1Id}-${i}`,
              file_type: 'license',
              s3_key: `${client1Id}/driver-${i}.pdf`
            }))

            const client2Files = Array.from({ length: numClient2Files }, (_, i) => ({
              client_id: client2.id,
              driver_name: `Driver ${i}`,
              license_number: `LIC-${client2Id}-${i}`,
              file_type: 'license',
              s3_key: `${client2Id}/driver-${i}.pdf`
            }))

            const allFiles = [...client1Files, ...client2Files]
            files = await insertTestDriverFiles(allFiles)
            createdDriverFileIds.push(...files.map(f => f.id))

            // Sign in as client1 and query driver files
            const { supabaseClient } = await signInAsUser(client1Email)
            client1Connection = supabaseClient

            const { data: client1Results, error } = await supabaseClient
              .from('driver_files')
              .select('*')

            // Should succeed without error
            expect(error).toBeNull()
            expect(client1Results).toBeDefined()

            // All returned files should belong to client1
            expect(client1Results.length).toBe(numClient1Files)
            expect(client1Results.every(file => file.client_id === client1.id)).toBe(true)
            
            // Should not see any of client2's files
            expect(client1Results.some(file => file.client_id === client2.id)).toBe(false)

          } finally {
            // Cleanup for this iteration
            if (client1Connection) {
              await client1Connection.auth.signOut()
            }
            if (files.length > 0) {
              await deleteTestData('driver_files', files.map(f => f.id))
              files.forEach(f => {
                const index = createdDriverFileIds.indexOf(f.id)
                if (index > -1) createdDriverFileIds.splice(index, 1)
              })
            }
            if (client1) {
              await deleteClient(client1.id)
              const index = createdClientIds.indexOf(client1.id)
              if (index > -1) createdClientIds.splice(index, 1)
            }
            if (client2) {
              await deleteClient(client2.id)
              const index = createdClientIds.indexOf(client2.id)
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
      { numRuns: 10 }
    )
  })
})
