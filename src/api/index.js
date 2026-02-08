/**
 * API Index
 * 
 * Central export point for all API endpoints.
 * Provides a clean interface for frontend components to interact with backend services.
 */

// Authentication API
export * as authAPI from './auth.js'

// Client API
export * as clientAPI from './clients.js'

// Document API
export * as documentAPI from './documents.js'

// Ticket API
export * as ticketAPI from './tickets.js'

// Admin API
export * as adminAPI from './admin.js'

// Stripe API
export * as stripeAPI from './stripe.js'

/**
 * Standard error response format
 * 
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @returns {Object} - Formatted error response
 */
export function createErrorResponse(code, message, status) {
  return {
    error: {
      code,
      message,
      status
    }
  }
}

/**
 * Standard success response format
 * 
 * @param {*} data - Response data
 * @param {number} status - HTTP status code (default 200)
 * @returns {Object} - Formatted success response
 */
export function createSuccessResponse(data, status = 200) {
  return {
    data,
    status
  }
}

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
}

/**
 * Error Codes
 */
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND'
}
