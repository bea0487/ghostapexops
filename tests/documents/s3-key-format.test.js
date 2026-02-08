// Feature: ghost-apex-backend, Property 12: S3 Key Format Consistency
// **Validates: Requirements 5.2**

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

describe('Property 12: S3 Key Format Consistency', () => {
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

  it('should generate S3 keys matching pattern {client_id}/{timestamp}_{original_filename}', async () => {
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

            // Verify S3 key format
            const s3Key = document.s3_key
            
            // S3 key should match pattern: {client_id}/{timestamp}_{sanitized_filename}
            const keyPattern = new RegExp(`^${clientId}/\\d+_[a-zA-Z0-9._-]+$`)
            expect(s3Key).toMatch(keyPattern)

            // Verify key starts with client_id
            expect(s3Key.startsWith(`${clientId}/`)).toBe(true)

            // Extract timestamp and filename parts
            const parts = s3Key.split('/')
            expect(parts.length).toBe(2)
            expect(parts[0]).toBe(clientId)

            const filenamePart = parts[1]
            const underscoreIndex = filenamePart.indexOf('_')
            expect(underscoreIndex).toBeGreaterThan(0)

            const timestamp = filenamePart.substring(0, underscoreIndex)
            expect(timestamp).toMatch(/^\d+$/)
            expect(parseInt(timestamp)).toBeGreaterThan(0)

            // Verify sanitized filename is present
            const sanitizedFilename = filenamePart.substring(underscoreIndex + 1)
            expect(sanitizedFilename.length).toBeGreaterThan(0)

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

  it('should sanitize special characters in filenames', async () => {
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

      // Upload document with special characters in filename
      const file = {
        name: 'test document (with) special@chars!.pdf',
        type: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('test content')
      }

      const document = await documentService.uploadDocument(file, clientId, userId)
      documentId = document.id
      createdDocuments.push(documentId)

      // Verify S3 key has sanitized filename
      const s3Key = document.s3_key
      const parts = s3Key.split('/')
      const filenamePart = parts[1]
      
      // Should not contain special characters (except allowed ones: . _ -)
      expect(filenamePart).toMatch(/^[\d]+_[a-zA-Z0-9._-]+$/)
      
      // Should not contain spaces, parentheses, @ or !
      expect(filenamePart).not.toContain(' ')
      expect(filenamePart).not.toContain('(')
      expect(filenamePart).not.toContain(')')
      expect(filenamePart).not.toContain('@')
      expect(filenamePart).not.toContain('!')

    } finally {
      // Cleanup
      if (documentId) await cleanupTestDocument(documentId)
      if (clientId) await cleanupTestClient(clientId)
      if (userId) await cleanupTestUser(userId)
    }
  })
})
