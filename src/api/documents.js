/**
 * Document API
 * 
 * Provides document management endpoints for upload, download, list, and delete operations.
 * 
 * Requirements: 13.8, 13.9, 13.10, 13.11
 */

import { documentService } from '../lib/DocumentService.js'
import { supabase } from '../lib/supabaseClient.js'

/**
 * Get current user's client ID
 */
async function getCurrentClientId() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', session.user.id)
    .single()

  return client?.id || null
}

/**
 * Get current user ID
 */
async function getCurrentUserId() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id || null
}

/**
 * GET /api/documents
 * Get documents for authenticated client
 * 
 * @param {Object} filters - Optional filters
 * @returns {Promise<Object>} - List of documents
 * 
 * Requirements: 13.8
 */
export async function listDocuments(filters = {}) {
  try {
    const clientId = await getCurrentClientId()

    if (!clientId) {
      return {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authenticated as a client',
          status: 401
        }
      }
    }

    const documents = await documentService.listDocuments(clientId, filters)

    return {
      data: documents,
      status: 200
    }
  } catch (error) {
    return {
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to list documents',
        status: 500
      }
    }
  }
}

/**
 * POST /api/documents/upload
 * Upload a document
 * 
 * @param {Object} file - File object with buffer, name, type, size
 * @param {string} targetClientId - Optional target client ID (for admin uploads)
 * @returns {Promise<Object>} - Created document record
 * 
 * Requirements: 13.9
 */
export async function uploadDocument(file, targetClientId = null) {
  try {
    const userId = await getCurrentUserId()
    const clientId = targetClientId || await getCurrentClientId()

    if (!userId) {
      return {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
          status: 401
        }
      }
    }

    if (!clientId) {
      return {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authenticated as a client',
          status: 401
        }
      }
    }

    if (!file) {
      return {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'File is required',
          status: 400
        }
      }
    }

    const document = await documentService.uploadDocument(file, clientId, userId)

    return {
      data: document,
      status: 201
    }
  } catch (error) {
    if (error.code === 'FILE_TOO_LARGE') {
      return {
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          status: 400
        }
      }
    }

    if (error.code === 'INVALID_FILE_TYPE') {
      return {
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          status: 400
        }
      }
    }

    return {
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to upload document',
        status: 500
      }
    }
  }
}

/**
 * GET /api/documents/:id/download
 * Get pre-signed download URL for a document
 * 
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} - Pre-signed URL
 * 
 * Requirements: 13.10
 */
export async function getDownloadUrl(documentId) {
  try {
    if (!documentId) {
      return {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Document ID is required',
          status: 400
        }
      }
    }

    const url = await documentService.getDownloadUrl(documentId)

    return {
      data: { url },
      status: 200
    }
  } catch (error) {
    if (error.code === 'RESOURCE_NOT_FOUND') {
      return {
        error: {
          code: 'NOT_FOUND',
          message: 'Document not found',
          status: 404
        }
      }
    }

    return {
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to get download URL',
        status: 500
      }
    }
  }
}

/**
 * DELETE /api/documents/:id
 * Delete a document
 * 
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} - Success response
 * 
 * Requirements: 13.11
 */
export async function deleteDocument(documentId) {
  try {
    if (!documentId) {
      return {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Document ID is required',
          status: 400
        }
      }
    }

    await documentService.deleteDocument(documentId)

    return {
      data: {
        message: 'Document deleted successfully'
      },
      status: 200
    }
  } catch (error) {
    if (error.code === 'RESOURCE_NOT_FOUND') {
      return {
        error: {
          code: 'NOT_FOUND',
          message: 'Document not found',
          status: 404
        }
      }
    }

    return {
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to delete document',
        status: 500
      }
    }
  }
}

/**
 * GET /api/documents/:id
 * Get a specific document
 * 
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} - Document record
 */
export async function getDocument(documentId) {
  try {
    if (!documentId) {
      return {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Document ID is required',
          status: 400
        }
      }
    }

    const document = await documentService.getDocument(documentId)

    return {
      data: document,
      status: 200
    }
  } catch (error) {
    if (error.code === 'RESOURCE_NOT_FOUND') {
      return {
        error: {
          code: 'NOT_FOUND',
          message: 'Document not found',
          status: 404
        }
      }
    }

    return {
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to get document',
        status: 500
      }
    }
  }
}
