// Feature: ghost-apex-backend, Property 15: Document Deletion Removes Both Database and S3
// **Validates: Requirements 5.9**

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

async function createTestClient(email, tier = 'wingman') {
  // Create user
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password: 'TestPass123!',
    email_confirm: true,
    user_metadata: { role: 'client' }
  })

  if (userError || !userData.user) {
    throw new Error(`Failed to create test user: ${userError?.message}`)
  }

  const userId = userData.user.id

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

describe('Property 15: Document Deletion Removes Both Database and S3', () => {
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

  it('should remove both database record and S3 object when document is deleted', async () => {
    await fc.assert(
      fc.asyncProperty(
        validFileArbitrary,
        fc.emailAddress(),
        async (file, email) => {
          let userId = null
          let clientId = null
          let documentId = null

          try {
            // Create test client
            const testClient = await createTestClient(email)
            userId = testClient.userId
            clientId = testClient.clientId
            createdUsers.push(userId)
            createdClients.push(clientId)

            // Clear mock S3 before test
            mockS3Client.clear()

            // Create DocumentService with mock S3
            const documentService = new DocumentService(mockS3Client, supabase)

            // Upload document
            const document = await documentService.uploadDocument(file, clientId, userId)
            documentId = document.id
            createdDocuments.push(documentId)

            // Verify document exists in database
            const { data: beforeDelete, error: beforeError } = await supabase
              .from('documents')
              .select('*')
              .eq('id', documentId)
              .single()

            expect(beforeError).toBeNull()
            expect(beforeDelete).toBeDefined()

            // Verify S3 object exists
            const s3Key = document.s3_key
            const s3ExistsBefore = await mockS3Client.fileExists(s3Key)
            expect(s3ExistsBefore).toBe(true)

            // Delete document
            await documentService.deleteDocument(documentId)

            // Verify document is removed from database
            const { data: afterDelete, error: afterError } = await supabase
              .from('documents')
              .select('*')
              .eq('id', documentId)
              .single()

            expect(afterDelete).toBeNull()
            expect(afterError).toBeDefined()
            expect(afterError.code).toBe('PGRST116') // Supabase error code for no rows returned

            // Verify S3 object is removed
            const s3ExistsAfter = await mockS3Client.fileExists(s3Key)
            expect(s3ExistsAfter).toBe(false)

            // Remove from tracking since it's been deleted
            const index = createdDocuments.indexOf(documentId)
            if (index > -1) createdDocuments.splice(index, 1)
            documentId = null

          } finally {
            // Cleanup
            if (documentId) {
              await cleanupTestDocument(documentId)
              const index = createdDocuments.indexOf(documentId)
              if (index > -1) createdDocuments.splice(index, 1)
            }
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

  it('should handle deletion of multiple documents independently', async () => {
    const email = `test-${Date.now()}@example.com`
    let userId = null
    let clientId = null
    let doc1Id = null
    let doc2Id = null

    try {
      // Create test client
      const testClient = await createTestClient(email)
      userId = testClient.userId
      clientId = testClient.clientId
      createdUsers.push(userId)
      createdClients.push(clientId)

      // Clear mock S3
      mockS3Client.clear()

      // Create DocumentService with mock S3
      const documentService = new DocumentService(mockS3Client, supabase)

      // Upload two documents
      const file1 = {
        name: 'document1.pdf',
        type: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('document 1 content')
      }
      const doc1 = await documentService.uploadDocument(file1, clientId, userId)
      doc1Id = doc1.id
      createdDocuments.push(doc1Id)

      const file2 = {
        name: 'document2.pdf',
        type: 'application/pdf',
        size: 2048,
        buffer: Buffer.from('document 2 content')
      }
      const doc2 = await documentService.uploadDocument(file2, clientId, userId)
      doc2Id = doc2.id
      createdDocuments.push(doc2Id)

      // Verify both documents exist
      const s3Key1 = doc1.s3_key
      const s3Key2 = doc2.s3_key
      expect(await mockS3Client.fileExists(s3Key1)).toBe(true)
      expect(await mockS3Client.fileExists(s3Key2)).toBe(true)

      // Delete first document
      await documentService.deleteDocument(doc1Id)

      // Verify first document is deleted
      const { data: doc1After } = await supabase
        .from('documents')
        .select('*')
        .eq('id', doc1Id)
        .single()
      expect(doc1After).toBeNull()
      expect(await mockS3Client.fileExists(s3Key1)).toBe(false)

      // Verify second document still exists
      const { data: doc2After, error: doc2Error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', doc2Id)
        .single()
      expect(doc2Error).toBeNull()
      expect(doc2After).toBeDefined()
      expect(await mockS3Client.fileExists(s3Key2)).toBe(true)

      // Remove doc1 from tracking
      const index1 = createdDocuments.indexOf(doc1Id)
      if (index1 > -1) createdDocuments.splice(index1, 1)
      doc1Id = null

      // Delete second document
      await documentService.deleteDocument(doc2Id)

      // Verify second document is deleted
      const { data: doc2Final } = await supabase
        .from('documents')
        .select('*')
        .eq('id', doc2Id)
        .single()
      expect(doc2Final).toBeNull()
      expect(await mockS3Client.fileExists(s3Key2)).toBe(false)

      // Remove doc2 from tracking
      const index2 = createdDocuments.indexOf(doc2Id)
      if (index2 > -1) createdDocuments.splice(index2, 1)
      doc2Id = null

    } finally {
      // Cleanup
      if (doc1Id) await cleanupTestDocument(doc1Id)
      if (doc2Id) await cleanupTestDocument(doc2Id)
      if (clientId) await cleanupTestClient(clientId)
      if (userId) await cleanupTestUser(userId)
    }
  })

  it('should throw error when trying to delete non-existent document', async () => {
    const email = `test-${Date.now()}@example.com`
    let userId = null
    let clientId = null

    try {
      // Create test client
      const testClient = await createTestClient(email)
      userId = testClient.userId
      clientId = testClient.clientId
      createdUsers.push(userId)
      createdClients.push(clientId)

      // Clear mock S3
      mockS3Client.clear()

      // Create DocumentService with mock S3
      const documentService = new DocumentService(mockS3Client, supabase)

      // Try to delete non-existent document
      const fakeDocumentId = '00000000-0000-0000-0000-000000000000'
      
      let errorThrown = false
      let errorCode = null

      try {
        await documentService.deleteDocument(fakeDocumentId)
      } catch (error) {
        errorThrown = true
        errorCode = error.code
      }

      // Verify error was thrown
      expect(errorThrown).toBe(true)
      expect(errorCode).toBe('RESOURCE_NOT_FOUND')

    } finally {
      // Cleanup
      if (clientId) await cleanupTestClient(clientId)
      if (userId) await cleanupTestUser(userId)
    }
  })
})
