// Feature: ghost-apex-backend, Property 4: Admin Full Access
// **Validates: Requirements 2.2**

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
async function createTestUser(email, password = 'TestPassword123!', role = 'client') {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role }
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

// Helper function to insert test IFTA records
async function insertTestIFTARecords(records) {
  const { data, error } = await supabaseAdmin
    .from('ifta_records')
    .insert(records)
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

describe('Property 4: Admin Full Access', () => {
  const createdUserIds = []
  const createdClientIds = []
  const createdDocumentIds = []
  const createdTicketIds = []
  const createdELDReportIds = []
  const createdIFTARecordIds = []

  afterAll(async () => {
    // Cleanup: Delete all created test data
    await deleteTestData('documents', createdDocumentIds)
    await deleteTestData('support_tickets', createdTicketIds)
    await deleteTestData('eld_reports', createdELDReportIds)
    await deleteTestData('ifta_records', createdIFTARecordIds)
    
    for (const clientId of createdClientIds) {
      await deleteClient(clientId)
    }
    for (const userId of createdUserIds) {
      await deleteTestUser(userId)
    }
  })

  it('should return all documents without client_id filtering for admin users', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate test data for admin and multiple clients with documents
        fc.record({
          adminEmail: fc.emailAddress(),
          numClients: fc.integer({ min: 2, max: 4 }),
          docsPerClient: fc.integer({ min: 1, max: 3 })
        }),
        async ({ adminEmail, numClients, docsPerClient }) => {
          let adminUser, adminConnection, clients = [], documents = []

          try {
            // Create admin user with admin role
            adminUser = await createTestUser(adminEmail, 'AdminPassword123!', 'admin')
            createdUserIds.push(adminUser.id)

            // Create multiple clients with documents
            for (let i = 0; i < numClients; i++) {
              const clientEmail = `client${i}-${Date.now()}@test.com`
              const clientId = `client-${i}-${Date.now()}`
              
              const clientUser = await createTestUser(clientEmail)
              createdUserIds.push(clientUser.id)
              
              const client = await createTestClient(clientUser.id, clientEmail, clientId)
              createdClientIds.push(client.id)
              clients.push(client)

              // Insert documents for this client
              const clientDocs = Array.from({ length: docsPerClient }, (_, j) => ({
                client_id: client.id,
                file_name: `client${i}-doc-${j}.pdf`,
                file_type: 'pdf',
                s3_key: `${clientId}/doc-${j}.pdf`,
                s3_bucket: 'test-bucket'
              }))

              const insertedDocs = await insertTestDocuments(clientDocs)
              documents.push(...insertedDocs)
              createdDocumentIds.push(...insertedDocs.map(d => d.id))
            }

            const totalExpectedDocs = numClients * docsPerClient

            // Sign in as admin and query all documents
            const { supabaseClient } = await signInAsUser(adminEmail, 'AdminPassword123!')
            adminConnection = supabaseClient

            const { data: adminResults, error } = await supabaseClient
              .from('documents')
              .select('*')

            // Should succeed without error
            expect(error).toBeNull()
            expect(adminResults).toBeDefined()

            // Admin should see ALL documents from all clients
            expect(adminResults.length).toBeGreaterThanOrEqual(totalExpectedDocs)
            
            // Verify admin can see documents from all created clients
            for (const client of clients) {
              const clientDocs = adminResults.filter(doc => doc.client_id === client.id)
              expect(clientDocs.length).toBe(docsPerClient)
            }

          } finally {
            // Cleanup for this iteration
            if (adminConnection) {
              await adminConnection.auth.signOut()
            }
            if (documents.length > 0) {
              await deleteTestData('documents', documents.map(d => d.id))
              documents.forEach(d => {
                const index = createdDocumentIds.indexOf(d.id)
                if (index > -1) createdDocumentIds.splice(index, 1)
              })
            }
            for (const client of clients) {
              await deleteClient(client.id)
              const index = createdClientIds.indexOf(client.id)
              if (index > -1) createdClientIds.splice(index, 1)
            }
            // Delete all users (admin + clients)
            const allUsers = [adminUser, ...clients.map(c => ({ id: c.user_id }))]
            for (const user of allUsers) {
              if (user) {
                await deleteTestUser(user.id)
                const index = createdUserIds.indexOf(user.id)
                if (index > -1) createdUserIds.splice(index, 1)
              }
            }
          }
        }
      ),
      { numRuns: 1 }
    )
  })

  it('should return all support_tickets without client_id filtering for admin users', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate test data for admin and multiple clients with tickets
        fc.record({
          adminEmail: fc.emailAddress(),
          numClients: fc.integer({ min: 2, max: 4 }),
          ticketsPerClient: fc.integer({ min: 1, max: 3 })
        }),
        async ({ adminEmail, numClients, ticketsPerClient }) => {
          let adminUser, adminConnection, clients = [], tickets = []

          try {
            // Create admin user with admin role
            adminUser = await createTestUser(adminEmail, 'AdminPassword123!', 'admin')
            createdUserIds.push(adminUser.id)

            // Create multiple clients with tickets
            for (let i = 0; i < numClients; i++) {
              const clientEmail = `client${i}-${Date.now()}@test.com`
              const clientId = `client-${i}-${Date.now()}`
              
              const clientUser = await createTestUser(clientEmail)
              createdUserIds.push(clientUser.id)
              
              const client = await createTestClient(clientUser.id, clientEmail, clientId)
              createdClientIds.push(client.id)
              clients.push(client)

              // Insert tickets for this client
              const clientTickets = Array.from({ length: ticketsPerClient }, (_, j) => ({
                client_id: client.id,
                subject: `Client${i} Ticket ${j}`,
                message: `This is ticket ${j} for client ${i}`,
                priority: 'Medium'
              }))

              const insertedTickets = await insertTestTickets(clientTickets)
              tickets.push(...insertedTickets)
              createdTicketIds.push(...insertedTickets.map(t => t.id))
            }

            const totalExpectedTickets = numClients * ticketsPerClient

            // Sign in as admin and query all tickets
            const { supabaseClient } = await signInAsUser(adminEmail, 'AdminPassword123!')
            adminConnection = supabaseClient

            const { data: adminResults, error } = await supabaseClient
              .from('support_tickets')
              .select('*')

            // Should succeed without error
            expect(error).toBeNull()
            expect(adminResults).toBeDefined()

            // Admin should see ALL tickets from all clients
            expect(adminResults.length).toBeGreaterThanOrEqual(totalExpectedTickets)
            
            // Verify admin can see tickets from all created clients
            for (const client of clients) {
              const clientTickets = adminResults.filter(ticket => ticket.client_id === client.id)
              expect(clientTickets.length).toBe(ticketsPerClient)
            }

          } finally {
            // Cleanup for this iteration
            if (adminConnection) {
              await adminConnection.auth.signOut()
            }
            if (tickets.length > 0) {
              await deleteTestData('support_tickets', tickets.map(t => t.id))
              tickets.forEach(t => {
                const index = createdTicketIds.indexOf(t.id)
                if (index > -1) createdTicketIds.splice(index, 1)
              })
            }
            for (const client of clients) {
              await deleteClient(client.id)
              const index = createdClientIds.indexOf(client.id)
              if (index > -1) createdClientIds.splice(index, 1)
            }
            // Delete all users (admin + clients)
            const allUsers = [adminUser, ...clients.map(c => ({ id: c.user_id }))]
            for (const user of allUsers) {
              if (user) {
                await deleteTestUser(user.id)
                const index = createdUserIds.indexOf(user.id)
                if (index > -1) createdUserIds.splice(index, 1)
              }
            }
          }
        }
      ),
      { numRuns: 1 }
    )
  })

  it('should return all eld_reports without client_id filtering for admin users', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate test data for admin and multiple clients with ELD reports
        fc.record({
          adminEmail: fc.emailAddress(),
          numClients: fc.integer({ min: 2, max: 4 }),
          reportsPerClient: fc.integer({ min: 1, max: 3 })
        }),
        async ({ adminEmail, numClients, reportsPerClient }) => {
          let adminUser, adminConnection, clients = [], reports = []

          try {
            // Create admin user with admin role
            adminUser = await createTestUser(adminEmail, 'AdminPassword123!', 'admin')
            createdUserIds.push(adminUser.id)

            // Create multiple clients with ELD reports
            for (let i = 0; i < numClients; i++) {
              const clientEmail = `client${i}-${Date.now()}@test.com`
              const clientId = `client-${i}-${Date.now()}`
              
              const clientUser = await createTestUser(clientEmail)
              createdUserIds.push(clientUser.id)
              
              const client = await createTestClient(clientUser.id, clientEmail, clientId)
              createdClientIds.push(client.id)
              clients.push(client)

              // Insert ELD reports for this client
              const baseDate = new Date('2024-01-01')
              const clientReports = Array.from({ length: reportsPerClient }, (_, j) => {
                const weekStart = new Date(baseDate)
                weekStart.setDate(baseDate.getDate() + (j * 7) + (i * 100))
                return {
                  client_id: client.id,
                  week_start: weekStart.toISOString().split('T')[0],
                  violations: j + i
                }
              })

              const insertedReports = await insertTestELDReports(clientReports)
              reports.push(...insertedReports)
              createdELDReportIds.push(...insertedReports.map(r => r.id))
            }

            const totalExpectedReports = numClients * reportsPerClient

            // Sign in as admin and query all ELD reports
            const { supabaseClient } = await signInAsUser(adminEmail, 'AdminPassword123!')
            adminConnection = supabaseClient

            const { data: adminResults, error } = await supabaseClient
              .from('eld_reports')
              .select('*')

            // Should succeed without error
            expect(error).toBeNull()
            expect(adminResults).toBeDefined()

            // Admin should see ALL reports from all clients
            expect(adminResults.length).toBeGreaterThanOrEqual(totalExpectedReports)
            
            // Verify admin can see reports from all created clients
            for (const client of clients) {
              const clientReports = adminResults.filter(report => report.client_id === client.id)
              expect(clientReports.length).toBe(reportsPerClient)
            }

          } finally {
            // Cleanup for this iteration
            if (adminConnection) {
              await adminConnection.auth.signOut()
            }
            if (reports.length > 0) {
              await deleteTestData('eld_reports', reports.map(r => r.id))
              reports.forEach(r => {
                const index = createdELDReportIds.indexOf(r.id)
                if (index > -1) createdELDReportIds.splice(index, 1)
              })
            }
            for (const client of clients) {
              await deleteClient(client.id)
              const index = createdClientIds.indexOf(client.id)
              if (index > -1) createdClientIds.splice(index, 1)
            }
            // Delete all users (admin + clients)
            const allUsers = [adminUser, ...clients.map(c => ({ id: c.user_id }))]
            for (const user of allUsers) {
              if (user) {
                await deleteTestUser(user.id)
                const index = createdUserIds.indexOf(user.id)
                if (index > -1) createdUserIds.splice(index, 1)
              }
            }
          }
        }
      ),
      { numRuns: 1 }
    )
  })

  it('should return all ifta_records without client_id filtering for admin users', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate test data for admin and multiple clients with IFTA records
        fc.record({
          adminEmail: fc.emailAddress(),
          numClients: fc.integer({ min: 2, max: 4 }),
          recordsPerClient: fc.integer({ min: 1, max: 2 })
        }),
        async ({ adminEmail, numClients, recordsPerClient }) => {
          let adminUser, adminConnection, clients = [], records = []

          try {
            // Create admin user with admin role
            adminUser = await createTestUser(adminEmail, 'AdminPassword123!', 'admin')
            createdUserIds.push(adminUser.id)

            // Create multiple clients with IFTA records
            for (let i = 0; i < numClients; i++) {
              const clientEmail = `client${i}-${Date.now()}@test.com`
              const clientId = `client-${i}-${Date.now()}`
              
              const clientUser = await createTestUser(clientEmail)
              createdUserIds.push(clientUser.id)
              
              const client = await createTestClient(clientUser.id, clientEmail, clientId)
              createdClientIds.push(client.id)
              clients.push(client)

              // Insert IFTA records for this client
              const clientRecords = Array.from({ length: recordsPerClient }, (_, j) => ({
                client_id: client.id,
                quarter: (j % 4) + 1,
                year: 2024,
                total_miles: 1000 + (i * 100) + (j * 10),
                taxable_miles: 900 + (i * 100) + (j * 10),
                fuel_gallons: 200 + (i * 20) + (j * 5),
                tax_owed: 50 + (i * 5) + j
              }))

              const insertedRecords = await insertTestIFTARecords(clientRecords)
              records.push(...insertedRecords)
              createdIFTARecordIds.push(...insertedRecords.map(r => r.id))
            }

            const totalExpectedRecords = numClients * recordsPerClient

            // Sign in as admin and query all IFTA records
            const { supabaseClient } = await signInAsUser(adminEmail, 'AdminPassword123!')
            adminConnection = supabaseClient

            const { data: adminResults, error } = await supabaseClient
              .from('ifta_records')
              .select('*')

            // Should succeed without error
            expect(error).toBeNull()
            expect(adminResults).toBeDefined()

            // Admin should see ALL records from all clients
            expect(adminResults.length).toBeGreaterThanOrEqual(totalExpectedRecords)
            
            // Verify admin can see records from all created clients
            for (const client of clients) {
              const clientRecords = adminResults.filter(record => record.client_id === client.id)
              expect(clientRecords.length).toBe(recordsPerClient)
            }

          } finally {
            // Cleanup for this iteration
            if (adminConnection) {
              await adminConnection.auth.signOut()
            }
            if (records.length > 0) {
              await deleteTestData('ifta_records', records.map(r => r.id))
              records.forEach(r => {
                const index = createdIFTARecordIds.indexOf(r.id)
                if (index > -1) createdIFTARecordIds.splice(index, 1)
              })
            }
            for (const client of clients) {
              await deleteClient(client.id)
              const index = createdClientIds.indexOf(client.id)
              if (index > -1) createdClientIds.splice(index, 1)
            }
            // Delete all users (admin + clients)
            const allUsers = [adminUser, ...clients.map(c => ({ id: c.user_id }))]
            for (const user of allUsers) {
              if (user) {
                await deleteTestUser(user.id)
                const index = createdUserIds.indexOf(user.id)
                if (index > -1) createdUserIds.splice(index, 1)
              }
            }
          }
        }
      ),
      { numRuns: 1 }
    )
  })

  it('should return all clients records without filtering for admin users', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate test data for admin and multiple clients
        fc.record({
          adminEmail: fc.emailAddress(),
          numClients: fc.integer({ min: 2, max: 4 })
        }),
        async ({ adminEmail, numClients }) => {
          let adminUser, adminConnection, clients = []

          try {
            // Create admin user with admin role
            adminUser = await createTestUser(adminEmail, 'AdminPassword123!', 'admin')
            createdUserIds.push(adminUser.id)

            // Create multiple clients
            for (let i = 0; i < numClients; i++) {
              const clientEmail = `client${i}-${Date.now()}@test.com`
              const clientId = `client-${i}-${Date.now()}`
              
              const clientUser = await createTestUser(clientEmail)
              createdUserIds.push(clientUser.id)
              
              const client = await createTestClient(clientUser.id, clientEmail, clientId)
              createdClientIds.push(client.id)
              clients.push(client)
            }

            // Sign in as admin and query all clients
            const { supabaseClient } = await signInAsUser(adminEmail, 'AdminPassword123!')
            adminConnection = supabaseClient

            const { data: adminResults, error } = await supabaseClient
              .from('clients')
              .select('*')

            // Should succeed without error
            expect(error).toBeNull()
            expect(adminResults).toBeDefined()

            // Admin should see ALL clients
            expect(adminResults.length).toBeGreaterThanOrEqual(numClients)
            
            // Verify admin can see all created clients
            for (const client of clients) {
              const foundClient = adminResults.find(c => c.id === client.id)
              expect(foundClient).toBeDefined()
              expect(foundClient.client_id).toBe(client.client_id)
            }

          } finally {
            // Cleanup for this iteration
            if (adminConnection) {
              await adminConnection.auth.signOut()
            }
            for (const client of clients) {
              await deleteClient(client.id)
              const index = createdClientIds.indexOf(client.id)
              if (index > -1) createdClientIds.splice(index, 1)
            }
            // Delete all users (admin + clients)
            const allUsers = [adminUser, ...clients.map(c => ({ id: c.user_id }))]
            for (const user of allUsers) {
              if (user) {
                await deleteTestUser(user.id)
                const index = createdUserIds.indexOf(user.id)
                if (index > -1) createdUserIds.splice(index, 1)
              }
            }
          }
        }
      ),
      { numRuns: 1 }
    )
  })
})
