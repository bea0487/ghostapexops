/**
 * DocumentService - Business logic for document operations
 * 
 * Handles file uploads, downloads, listing, and deletion with S3 integration.
 * Manages document metadata in the database and enforces RLS policies.
 * 
 * Requirements: 5.1-5.6, 5.9, 5.10
 */

import { supabase } from './supabaseClient.js'
import { s3Client } from './S3Client.js'
import { fileValidator } from './FileValidator.js'

/**
 * DocumentService class for document management
 */
export class DocumentService {
  constructor(s3ClientInstance = s3Client, supabaseInstance = supabase) {
    this.s3 = s3ClientInstance
    this.supabase = supabaseInstance
  }

  /**
   * Generate S3 key for a document
   * Format: {client_id}/{timestamp}_{original_filename}
   * 
   * @param {string} clientId - Client ID
   * @param {string} fileName - Original file name
   * @returns {string} - S3 key
   * 
   * Requirements: 5.2
   */
  generateS3Key(clientId, fileName) {
    const timestamp = Date.now()
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
    return `${clientId}/${timestamp}_${sanitizedFileName}`
  }

  /**
   * Upload a document to S3 and create database record
   * 
   * @param {Object} file - File object with buffer, name, type, size
   * @param {string} clientId - Client ID
   * @param {string} uploadedBy - User ID of uploader
   * @returns {Promise<Object>} - Document record
   * 
   * Requirements: 5.1, 5.2, 5.3, 5.10
   */
  async uploadDocument(file, clientId, uploadedBy) {
    if (!file || !clientId || !uploadedBy) {
      throw new Error('Missing required parameters: file, clientId, or uploadedBy')
    }

    // Validate file type and size
    const validation = fileValidator.validate(file.name, file.type, file.size)
    if (!validation.valid) {
      const error = new Error(validation.message)
      error.code = validation.error
      throw error
    }

    // Generate S3 key
    const s3Key = this.generateS3Key(clientId, file.name)
    const bucket = this.s3.getBucket()

    try {
      // Upload to S3 with server-side encryption
      await this.s3.uploadFile(s3Key, file.buffer, file.type)

      // Create database record
      const { data: document, error } = await this.supabase
        .from('documents')
        .insert({
          client_id: clientId,
          file_name: file.name,
          file_type: fileValidator.getFileExtension(file.name),
          s3_key: s3Key,
          s3_bucket: bucket,
          uploaded_by: uploadedBy,
          metadata: {
            fileSize: file.size,
            mimeType: file.type,
            originalName: file.name
          }
        })
        .select()
        .single()

      if (error) {
        // If database insert fails, try to clean up S3 object
        try {
          await this.s3.deleteFile(s3Key)
        } catch (cleanupError) {
          console.error('Failed to clean up S3 object after database error:', cleanupError)
        }
        throw new Error(`Failed to create document record: ${error.message}`)
      }

      return document
    } catch (error) {
      console.error('Error uploading document:', error)
      throw error
    }
  }

  /**
   * Get a pre-signed URL for downloading a document
   * 
   * @param {string} documentId - Document ID
   * @returns {Promise<string>} - Pre-signed URL (valid for 5 minutes)
   * 
   * Requirements: 5.4
   */
  async getDownloadUrl(documentId) {
    if (!documentId) {
      throw new Error('Document ID is required')
    }

    try {
      // Get document record from database (RLS will filter by client_id)
      const { data: document, error } = await this.supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single()

      if (error || !document) {
        const notFoundError = new Error('Document not found')
        notFoundError.code = 'RESOURCE_NOT_FOUND'
        throw notFoundError
      }

      // Generate pre-signed URL (valid for 5 minutes)
      const url = await this.s3.getSignedUrl(document.s3_key, 300)
      return url
    } catch (error) {
      console.error('Error getting download URL:', error)
      throw error
    }
  }

  /**
   * List documents for a client
   * 
   * @param {string} clientId - Client ID
   * @param {Object} filters - Optional filters (file_type, date_range, limit, offset)
   * @returns {Promise<Array>} - Array of document records
   * 
   * Requirements: 5.5
   */
  async listDocuments(clientId, filters = {}) {
    if (!clientId) {
      throw new Error('Client ID is required')
    }

    try {
      let query = this.supabase
        .from('documents')
        .select('*')
        .eq('client_id', clientId)
        .order('uploaded_at', { ascending: false })

      // Apply filters
      if (filters.file_type) {
        query = query.eq('file_type', filters.file_type)
      }

      if (filters.date_range) {
        if (filters.date_range.start) {
          query = query.gte('uploaded_at', filters.date_range.start)
        }
        if (filters.date_range.end) {
          query = query.lte('uploaded_at', filters.date_range.end)
        }
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data: documents, error } = await query

      if (error) {
        throw new Error(`Failed to list documents: ${error.message}`)
      }

      return documents || []
    } catch (error) {
      console.error('Error listing documents:', error)
      throw error
    }
  }

  /**
   * Delete a document (removes both database record and S3 object)
   * 
   * @param {string} documentId - Document ID
   * @returns {Promise<void>}
   * 
   * Requirements: 5.9
   */
  async deleteDocument(documentId) {
    if (!documentId) {
      throw new Error('Document ID is required')
    }

    try {
      // Get document record first (RLS will filter by client_id)
      const { data: document, error: fetchError } = await this.supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single()

      if (fetchError || !document) {
        const notFoundError = new Error('Document not found')
        notFoundError.code = 'RESOURCE_NOT_FOUND'
        throw notFoundError
      }

      // Delete from S3
      try {
        await this.s3.deleteFile(document.s3_key)
      } catch (s3Error) {
        console.error('Error deleting from S3:', s3Error)
        // Continue with database deletion even if S3 deletion fails
      }

      // Delete from database
      const { error: deleteError } = await this.supabase
        .from('documents')
        .delete()
        .eq('id', documentId)

      if (deleteError) {
        throw new Error(`Failed to delete document record: ${deleteError.message}`)
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      throw error
    }
  }

  /**
   * Get a single document by ID
   * 
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} - Document record
   */
  async getDocument(documentId) {
    if (!documentId) {
      throw new Error('Document ID is required')
    }

    try {
      const { data: document, error } = await this.supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single()

      if (error || !document) {
        const notFoundError = new Error('Document not found')
        notFoundError.code = 'RESOURCE_NOT_FOUND'
        throw notFoundError
      }

      return document
    } catch (error) {
      console.error('Error getting document:', error)
      throw error
    }
  }

  /**
   * Upload a document for a specific client (admin function)
   * 
   * @param {Object} file - File object
   * @param {string} targetClientId - Target client ID
   * @param {string} uploadedBy - Admin user ID
   * @returns {Promise<Object>} - Document record
   * 
   * Requirements: 5.6
   */
  async uploadDocumentForClient(file, targetClientId, uploadedBy) {
    // This is the same as uploadDocument but explicitly for admin use
    // The client_id is set to the target client, not the uploader's client
    return this.uploadDocument(file, targetClientId, uploadedBy)
  }
}

// Export singleton instance
export const documentService = new DocumentService()
