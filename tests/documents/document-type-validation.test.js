// Feature: ghost-apex-backend, Property 14: Document Type Validation
// **Validates: Requirements 5.7**

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

// Allowed file types (Requirements 5.7)
const allowedFileTypes = [
  { ext: 'pdf', mime: 'application/pdf' },
  { ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  { ext: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  { ext: 'png', mime: 'image/png' },
  { ext: 'jpg', mime: 'image/jpeg' },
  { ext: 'csv', mime: 'text/csv' }
]

// Disallowed file types for testing
const disallowedFileTypes = [
  { ext: 'exe', mime: 'application/x-msdownload' },
  { ext: 'bat', mime: 'application/x-bat' },
  { ext: 'sh', mime: 'application/x-sh' },
  { ext: 'zip', mime: 'application/zip' },
  { ext: 'tar', mime: 'application/x-tar' },
  { ext: 'js', mime: 'application/javascript' },
  { ext: 'html', mime: 'text/html' },
  { ext: 'php', mime: 'application/x-httpd-php' },
  { ext: 'mp4', mime: 'video/mp4' },
  { ext: 'mp3', mime: 'audio/mpeg' }
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

// Arbitrary for generating invalid file data
const invalidFileArbitrary = fc.record({
  name: fc.constantFrom(...disallowedFileTypes).chain(type => 
    fc.string({ minLength: 1, maxLength: 20 }).map(name => `${name}.${type.ext}`)
  ),
  type: fc.constantFrom(...disallowedFileTypes).map(type => type.mime),
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
      client_id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

describe('Property 14: Document Type Validation', () => {
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

  it('should accept files with allowed extensions (PDF, DOCX, XLSX, PNG, JPG, CSV)', async () => {
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

            // Upload document - should succeed for allowed file types
            const document = await documentService.uploadDocument(file, clientId, userId)
            documentId = document.id
            createdDocuments.push(documentId)

            // Verify document was created
            expect(document).toBeDefined()
            expect(document.id).toBeDefined()
            expect(document.file_name).toBe(file.name)

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

  it('should reject files with disallowed extensions with validation error', async () => {
    await fc.assert(
      fc.asyncProperty(
        invalidFileArbitrary,
        fc.emailAddress(),
        async (file, email) => {
          let userId = null
          let clientId = null

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

            // Try to upload document - should fail for disallowed file types
            let errorThrown = false
            let errorCode = null

            try {
              await documentService.uploadDocument(file, clientId, userId)
            } catch (error) {
              errorThrown = true
              errorCode = error.code
            }

            // Verify error was thrown
            expect(errorThrown).toBe(true)
            expect(errorCode).toBe('VALIDATION_INVALID_FILE_TYPE')

            // Verify no S3 file was created
            const s3Key = documentService.generateS3Key(clientId, file.name)
            const s3FileExists = await mockS3Client.fileExists(s3Key)
            expect(s3FileExists).toBe(false)

            // Verify no database record was created
            const { data: documents } = await supabase
              .from('documents')
              .select('*')
              .eq('client_id', clientId)
              .eq('file_name', file.name)

            expect(documents).toEqual([])

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

  it('should reject files with mismatched extension and MIME type', async () => {
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

      // Try to upload file with .pdf extension but wrong MIME type
      const file = {
        name: 'test-document.pdf',
        type: 'application/zip', // Wrong MIME type
        size: 1024,
        buffer: Buffer.from('test content')
      }

      // Should throw validation error
      await expect(
        documentService.uploadDocument(file, clientId, userId)
      ).rejects.toThrow()

      // Verify error code
      try {
        await documentService.uploadDocument(file, clientId, userId)
      } catch (error) {
        expect(error.code).toBe('VALIDATION_INVALID_FILE_TYPE')
      }

    } finally {
      // Cleanup
      if (clientId) await cleanupTestClient(clientId)
      if (userId) await cleanupTestUser(userId)
    }
  })

  it('should accept all specifically allowed file types', async () => {
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

        // Verify document was created
        expect(document).toBeDefined()
        expect(document.id).toBeDefined()
        expect(document.file_name).toBe(file.name)
      }

      // Verify all 6 file types were accepted
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
})
