// Feature: ghost-apex-backend, Property 13: Admin Document Upload Association
// **Validates: Requirements 5.6**

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import * as fc from 'fast-check'
import { DocumentService } from '../../src/lib/DocumentService.js'

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

// Mock S3 client for testing
class MockS3Client {
  constructor() {
    this.uploadedFiles = new Map()
    this.bucket = 'test-bucket'
  }

  async uploadFile(key, buffer, contentType) {
    this.uploadedFiles.set(key, { buffer, contentType })
  }

  async getSignedUrl(key, expiresIn) {
    if (!this.uploadedFiles.has(key)) {
      throw new Error('File not found')
    }
    return `https://test-bucket.s3.amazonaws.com/${key}?expires=${expiresIn}`
  }

  async deleteFile(key) {
    this.uploadedFiles.delete(key)
  }

  async fileExists(key) {
    return this.uploadedFiles.has(key)
  }

  getBucket() {
    return this.bucket
  }

  isS3Configured() {
    return true
  }

  clear() {
    this.uploadedFiles.clear()
  }
}

// Allowed file types for testing
const allowedFileTypes = [
  { ext: 'pdf', mime: 'application/pdf' },
  { ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  { ext: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  { ext: 'png', mime: 'image/png' },
  { ext: 'jpg', mime: 'image/jpeg' },
  { ext: 'csv', mime: 'text/csv' }
]

// Arbitrary for generating valid file data
const validFileArbitrary = fc.record({
  name: fc.constantFrom(...allowedFileTypes).chain(type => 
    fc.string({ minLength: 1, maxLength: 20 }).map(name => `${name}.${type.ext}`)
  ),
  type: fc.constantFrom(...allowedFileTypes).map(type => type.mime),
  size: fc.integer({ min: 1, max: 10 * 1024 * 1024 }),
  buffer: fc.uint8Array({ minLength: 10, maxLength: 1000 })
})

// Helper functions
async function cleanupTestDocument(documentId) {
  if (!documentId) return
  
  try {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)
    
    if (error) console.warn('Failed to delete test document:', error)
  } catch (error) {
    console.warn('Error cleaning up test document:', error)
  }
}

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

async function createTestUser(email, role = 'client') {
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password: 'TestPass123!',
    email_confirm: true,
    user_metadata: { role }
  })

  if (userError || !userData.user) {
    throw new Error(`Failed to create test user: ${userError?.message}`)
  }

  return userData.user.id
}

async function createTestClient(email, tier = 'wingman') {
  // Create user
  const userId = await createTestUser(email, 'client')

  // Create client
  const { data: clientData, error: clientError } = await supabase
    .from('clients')
    .insert({
      user_id: userId,
      email,
      company_name: 'Test Company',
      client_id: `test-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      tier,
      status: 'Active'
    })
    .select()
    .single()

  if (clientError || !clientData) {
    await cleanupTestUser(userId)
    throw new Error(`Failed to create test client: ${clientError?.message}`)
  }

  return { userId, clientId: clientData.id }
}

describe('Property 13: Admin Document Upload Association', () => {
  const createdDocuments = []
  const createdClients = []
  const createdUsers = []
  let mockS3Client

  beforeAll(() => {
    mockS3Client = new MockS3Client()
  })

  afterAll(async () => {
    // Cleanup all created test data
    for (const documentId of createdDocuments) {
      await cleanupTestDocument(documentId)
    }
    for (const clientId of createdClients) {
      await cleanupTestClient(clientId)
    }
    for (const userId of createdUsers) {
      await cleanupTestUser(userId)
    }
  })

  it('should associate document with specified client when admin uploads for client', async () => {
    await fc.assert(
      fc.asyncProperty(
        validFileArbitrary,
        fc.emailAddress(),
        fc.emailAddress(),
        async (file, adminEmail, clientEmail) => {
          // Skip if emails are the same
          if (adminEmail === clientEmail) return

          let adminUserId = null
          let targetClientUserId = null
          let targetClientId = null
          let documentId = null

          try {
            // Create admin user
            adminUserId = await createTestUser(adminEmail, 'admin')
            createdUsers.push(adminUserId)

            // Create target client
            const testClient = await createTestClient(clientEmail)
            targetClientUserId = testClient.userId
            targetClientId = testClient.clientId
            createdUsers.push(targetClientUserId)
            createdClients.push(targetClientId)

            // Clear mock S3 before test
            mockS3Client.clear()

            // Create DocumentService with mock S3
            const documentService = new DocumentService(mockS3Client, supabase)

            // Admin uploads document for the target client
            const document = await documentService.uploadDocumentForClient(
              file,
              targetClientId,
              adminUserId
            )
            documentId = document.id
            createdDocuments.push(documentId)

            // Verify document is associated with target client, not admin
            expect(document.client_id).toBe(targetClientId)
            expect(document.uploaded_by).toBe(adminUserId)

            // Verify in database
            const { data: dbDocument, error } = await supabase
              .from('documents')
              .select('*')
              .eq('id', documentId)
              .single()

            expect(error).toBeNull()
            expect(dbDocument).toBeDefined()
            expect(dbDocument.client_id).toBe(targetClientId)
            expect(dbDocument.uploaded_by).toBe(adminUserId)

            // Verify S3 key uses target client ID
            expect(dbDocument.s3_key.startsWith(`${targetClientId}/`)).toBe(true)

          } finally {
            // Cleanup
            if (documentId) {
              await cleanupTestDocument(documentId)
              const index = createdDocuments.indexOf(documentId)
              if (index > -1) createdDocuments.splice(index, 1)
            }
            if (targetClientId) {
              await cleanupTestClient(targetClientId)
              const index = createdClients.indexOf(targetClientId)
              if (index > -1) createdClients.splice(index, 1)
            }
            if (targetClientUserId) {
              await cleanupTestUser(targetClientUserId)
              const index = createdUsers.indexOf(targetClientUserId)
              if (index > -1) createdUsers.splice(index, 1)
            }
            if (adminUserId) {
              await cleanupTestUser(adminUserId)
              const index = createdUsers.indexOf(adminUserId)
              if (index > -1) createdUsers.splice(index, 1)
            }
          }
        }
      ),
      { numRuns: 1 }
    )
  })

  it('should allow admin to upload documents for multiple different clients', async () => {
    let adminUserId = null
    let client1UserId = null
    let client1Id = null
    let client2UserId = null
    let client2Id = null
    let doc1Id = null
    let doc2Id = null

    try {
      // Create admin user
      const adminEmail = `admin-${Date.now()}@example.com`
      adminUserId = await createTestUser(adminEmail, 'admin')
      createdUsers.push(adminUserId)

      // Create two different clients
      const client1Email = `client1-${Date.now()}@example.com`
      const testClient1 = await createTestClient(client1Email)
      client1UserId = testClient1.userId
      client1Id = testClient1.clientId
      createdUsers.push(client1UserId)
      createdClients.push(client1Id)

      const client2Email = `client2-${Date.now()}@example.com`
      const testClient2 = await createTestClient(client2Email)
      client2UserId = testClient2.userId
      client2Id = testClient2.clientId
      createdUsers.push(client2UserId)
      createdClients.push(client2Id)

      // Clear mock S3
      mockS3Client.clear()

      // Create DocumentService with mock S3
      const documentService = new DocumentService(mockS3Client, supabase)

      // Admin uploads document for client 1
      const file1 = {
        name: 'client1-doc.pdf',
        type: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('client 1 content')
      }
      const doc1 = await documentService.uploadDocumentForClient(file1, client1Id, adminUserId)
      doc1Id = doc1.id
      createdDocuments.push(doc1Id)

      // Admin uploads document for client 2
      const file2 = {
        name: 'client2-doc.pdf',
        type: 'application/pdf',
        size: 2048,
        buffer: Buffer.from('client 2 content')
      }
      const doc2 = await documentService.uploadDocumentForClient(file2, client2Id, adminUserId)
      doc2Id = doc2.id
      createdDocuments.push(doc2Id)

      // Verify both documents are associated with correct clients
      expect(doc1.client_id).toBe(client1Id)
      expect(doc1.uploaded_by).toBe(adminUserId)
      expect(doc1.s3_key.startsWith(`${client1Id}/`)).toBe(true)

      expect(doc2.client_id).toBe(client2Id)
      expect(doc2.uploaded_by).toBe(adminUserId)
      expect(doc2.s3_key.startsWith(`${client2Id}/`)).toBe(true)

      // Verify documents are separate
      expect(doc1.id).not.toBe(doc2.id)
      expect(doc1.client_id).not.toBe(doc2.client_id)

    } finally {
      // Cleanup
      if (doc1Id) await cleanupTestDocument(doc1Id)
      if (doc2Id) await cleanupTestDocument(doc2Id)
      if (client1Id) await cleanupTestClient(client1Id)
      if (client2Id) await cleanupTestClient(client2Id)
      if (client1UserId) await cleanupTestUser(client1UserId)
      if (client2UserId) await cleanupTestUser(client2UserId)
      if (adminUserId) await cleanupTestUser(adminUserId)
    }
  })
})
