/**
 * FileValidator - File type and size validation
 * 
 * Validates uploaded files against allowed types and size limits.
 * 
 * Requirements: 5.7, 5.8
 */

/**
 * Allowed file extensions and their MIME types
 * Requirements: 5.7
 */
export const ALLOWED_FILE_TYPES = {
  'pdf': ['application/pdf'],
  'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  'xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  'png': ['image/png'],
  'jpg': ['image/jpeg', 'image/jpg'],
  'jpeg': ['image/jpeg', 'image/jpg'],
  'csv': ['text/csv', 'application/csv']
}

/**
 * Maximum file size in bytes (10MB)
 * Requirements: 5.8
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * FileValidator class for validating file uploads
 */
export class FileValidator {
  /**
   * Validate file type against allowed extensions
   * 
   * @param {string} fileName - Original file name
   * @param {string} mimeType - MIME type of the file
   * @returns {boolean} - True if file type is allowed
   * 
   * Requirements: 5.7
   */
  validateFileType(fileName, mimeType) {
    if (!fileName || !mimeType) {
      return false
    }

    // Extract file extension
    const extension = this.getFileExtension(fileName)
    if (!extension) {
      return false
    }

    // Check if extension is allowed
    const allowedMimeTypes = ALLOWED_FILE_TYPES[extension.toLowerCase()]
    if (!allowedMimeTypes) {
      return false
    }

    // Check if MIME type matches
    return allowedMimeTypes.includes(mimeType.toLowerCase())
  }

  /**
   * Validate file size against maximum limit
   * 
   * @param {number} fileSize - File size in bytes
   * @returns {boolean} - True if file size is within limit
   * 
   * Requirements: 5.8
   */
  validateFileSize(fileSize) {
    if (typeof fileSize !== 'number' || fileSize < 0) {
      return false
    }

    return fileSize <= MAX_FILE_SIZE
  }

  /**
   * Validate both file type and size
   * 
   * @param {string} fileName - Original file name
   * @param {string} mimeType - MIME type of the file
   * @param {number} fileSize - File size in bytes
   * @returns {{valid: boolean, error: string|null}} - Validation result
   * 
   * Requirements: 5.7, 5.8
   */
  validate(fileName, mimeType, fileSize) {
    // Validate file type
    if (!this.validateFileType(fileName, mimeType)) {
      return {
        valid: false,
        error: 'VALIDATION_INVALID_FILE_TYPE',
        message: `File type not supported. Allowed types: ${Object.keys(ALLOWED_FILE_TYPES).join(', ').toUpperCase()}`
      }
    }

    // Validate file size
    if (!this.validateFileSize(fileSize)) {
      return {
        valid: false,
        error: 'VALIDATION_FILE_TOO_LARGE',
        message: `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      }
    }

    return {
      valid: true,
      error: null,
      message: null
    }
  }

  /**
   * Get file extension from file name
   * 
   * @param {string} fileName - File name
   * @returns {string|null} - File extension (without dot) or null
   */
  getFileExtension(fileName) {
    if (!fileName || typeof fileName !== 'string') {
      return null
    }

    const parts = fileName.split('.')
    if (parts.length < 2) {
      return null
    }

    return parts[parts.length - 1].toLowerCase()
  }

  /**
   * Get allowed file extensions
   * 
   * @returns {string[]} - Array of allowed extensions
   */
  getAllowedExtensions() {
    return Object.keys(ALLOWED_FILE_TYPES)
  }

  /**
   * Get maximum file size
   * 
   * @returns {number} - Maximum file size in bytes
   */
  getMaxFileSize() {
    return MAX_FILE_SIZE
  }
}

// Export singleton instance
export const fileValidator = new FileValidator()
