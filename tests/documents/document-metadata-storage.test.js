// Feature: ghost-apex-backend, Property 16: Document Metadata Storage
// **Validates: Requirements 5.10**

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

describe('Property 16: Document Metadata Storage', () => {
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

  it('should store document metadata (file size, mime type, uploader) in metadata JSONB field', async () => {
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

            // Verify document metadata is stored correctly
            expect(document.metadata).toBeDefined()
            expect(document.metadata).toBeTypeOf('object')

            // Verify file size is stored in metadata
            expect(document.metadata.fileSize).toBeDefined()
            expect(document.metadata.fileSize).toBe(file.size)

            // Verify mime type is stored in metadata
            expect(document.metadata.mimeType).toBeDefined()
            expect(document.metadata.mimeType).toBe(file.type)

            // Verify uploader is stored in uploaded_by field (not in metadata)
            expect(document.uploaded_by).toBeDefined()
            expect(document.uploaded_by).toBe(userId)

            // Verify metadata in database
            const { data: dbDocument, error } = await supabase
              .from('documents')
              .select('*')
              .eq('id', documentId)
              .single()

            expect(error).toBeNull()
            expect(dbDocument).toBeDefined()
            expect(dbDocument.metadata).toBeDefined()
            expect(dbDocument.metadata.fileSize).toBe(file.size)
            expect(dbDocument.metadata.mimeType).toBe(file.type)
            expect(dbDocument.uploaded_by).toBe(userId)

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

  it('should store metadata for documents with different file sizes', async () => {
    const email = `test-${Date.now()}@example.com`
    let userId = null
    let clientId = null
    const documentIds = []

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

      // Test different file sizes
      const fileSizes = [100, 1024, 10240, 102400, 1048576] // 100B, 1KB, 10KB, 100KB, 1MB

      for (const size of fileSizes) {
        const file = {
          name: `test-${size}.pdf`,
          type: 'application/pdf',
          size: size,
          buffer: Buffer.alloc(size)
        }

        const document = await documentService.uploadDocument(file, clientId, userId)
        documentIds.push(document.id)
        createdDocuments.push(document.id)

        // Verify metadata contains correct file size
        expect(document.metadata.fileSize).toBe(size)
        expect(document.metadata.mimeType).toBe('application/pdf')
        expect(document.uploaded_by).toBe(userId)
      }

      // Verify all documents were created with correct metadata
      expect(documentIds.length).toBe(fileSizes.length)

    } finally {
      // Cleanup
      for (const documentId of documentIds) {
        await cleanupTestDocument(documentId)
      }
      if (clientId) await cleanupTestClient(clientId)
      if (userId) await cleanupTestUser(userId)
    }
  })

  it('should store metadata for documents with different MIME types', async () => {
    const email = `test-${Date.now()}@example.com`
    let userId = null
    let clientId = null
    const documentIds = []

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

      // Test each allowed file type
      for (const fileType of allowedFileTypes) {
        const file = {
          name: `test-document.${fileType.ext}`,
          type: fileType.mime,
          size: 1024,
          buffer: Buffer.from('test content')
        }

        const document = await documentService.uploadDocument(file, clientId, userId)
        documentIds.push(document.id)
        createdDocuments.push(document.id)

        // Verify metadata contains correct MIME type
        expect(document.metadata.mimeType).toBe(fileType.mime)
        expect(document.metadata.fileSize).toBe(1024)
        expect(document.uploaded_by).toBe(userId)
      }

      // Verify all file types were processed
      expect(documentIds.length).toBe(allowedFileTypes.length)

    } finally {
      // Cleanup
      for (const documentId of documentIds) {
        await cleanupTestDocument(documentId)
      }
      if (clientId) await cleanupTestClient(clientId)
      if (userId) await cleanupTestUser(userId)
    }
  })

  it('should preserve metadata when retrieving document from database', async () => {
    const email = `test-${Date.now()}@example.com`
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

      // Clear mock S3
      mockS3Client.clear()

      // Create DocumentService with mock S3
      const documentService = new DocumentService(mockS3Client, supabase)

      // Upload document
      const file = {
        name: 'test-document.pdf',
        type: 'application/pdf',
        size: 2048,
        buffer: Buffer.from('test content')
      }

      const uploadedDocument = await documentService.uploadDocument(file, clientId, userId)
      documentId = uploadedDocument.id
      createdDocuments.push(documentId)

      // Retrieve document from database
      const retrievedDocument = await documentService.getDocument(documentId)

      // Verify metadata is preserved
      expect(retrievedDocument.metadata).toBeDefined()
      expect(retrievedDocument.metadata.fileSize).toBe(file.size)
      expect(retrievedDocument.metadata.mimeType).toBe(file.type)
      expect(retrievedDocument.uploaded_by).toBe(userId)

      // Verify metadata matches original upload
      expect(retrievedDocument.metadata.fileSize).toBe(uploadedDocument.metadata.fileSize)
      expect(retrievedDocument.metadata.mimeType).toBe(uploadedDocument.metadata.mimeType)
      expect(retrievedDocument.uploaded_by).toBe(uploadedDocument.uploaded_by)

    } finally {
      // Cleanup
      if (documentId) await cleanupTestDocument(documentId)
      if (clientId) await cleanupTestClient(clientId)
      if (userId) await cleanupTestUser(userId)
    }
  })

  it('should store metadata when admin uploads document for client', async () => {
    const adminEmail = `admin-${Date.now()}@example.com`
    const clientEmail = `client-${Date.now()}@example.com`
    let adminUserId = null
    let clientUserId = null
    let clientId = null
    let documentId = null

    try {
      // Create admin user
      const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: 'TestPass123!',
        email_confirm: true,
        user_metadata: { role: 'admin' }
      })

      if (adminError || !adminData.user) {
        throw new Error(`Failed to create admin user: ${adminError?.message}`)
      }

      adminUserId = adminData.user.id
      createdUsers.push(adminUserId)

      // Create client
      const testClient = await createTestClient(clientEmail)
      clientUserId = testClient.userId
      clientId = testClient.clientId
      createdUsers.push(clientUserId)
      createdClients.push(clientId)

      // Clear mock S3
      mockS3Client.clear()

      // Create DocumentService with mock S3
      const documentService = new DocumentService(mockS3Client, supabase)

      // Admin uploads document for client
      const file = {
        name: 'admin-uploaded.pdf',
        type: 'application/pdf',
        size: 3072,
        buffer: Buffer.from('admin uploaded content')
      }

      const document = await documentService.uploadDocumentForClient(file, clientId, adminUserId)
      documentId = document.id
      createdDocuments.push(documentId)

      // Verify metadata is stored correctly
      expect(document.metadata).toBeDefined()
      expect(document.metadata.fileSize).toBe(file.size)
      expect(document.metadata.mimeType).toBe(file.type)
      
      // Verify uploader is admin, not client
      expect(document.uploaded_by).toBe(adminUserId)
      expect(document.uploaded_by).not.toBe(clientUserId)
      
      // Verify document is associated with client
      expect(document.client_id).toBe(clientId)

    } finally {
      // Cleanup
      if (documentId) await cleanupTestDocument(documentId)
      if (clientId) await cleanupTestClient(clientId)
      if (clientUserId) await cleanupTestUser(clientUserId)
      if (adminUserId) await cleanupTestUser(adminUserId)
    }
  })
})
