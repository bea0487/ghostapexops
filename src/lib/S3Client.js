/**
 * S3Client - AWS S3 SDK wrapper for document storage
 * 
 * Provides methods for uploading, downloading, and deleting files from S3.
 * Supports server-side encryption and pre-signed URL generation.
 * 
 * Requirements: 5.1, 5.4
 */

import { S3Client as AWSS3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

/**
 * S3Client class for AWS S3 operations
 */
export class S3Client {
  constructor(config = {}) {
    // Allow configuration override for testing
    this.region = config.region || process.env.AWS_REGION || 'us-east-1'
    this.bucket = config.bucket || process.env.AWS_S3_BUCKET
    this.accessKeyId = config.accessKeyId || process.env.AWS_ACCESS_KEY_ID
    this.secretAccessKey = config.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY

    // Check if S3 is configured
    this.isConfigured = Boolean(this.bucket && this.accessKeyId && this.secretAccessKey)

    if (this.isConfigured) {
      // Initialize AWS S3 client
      this.client = new AWSS3Client({
        region: this.region,
        credentials: {
          accessKeyId: this.accessKeyId,
          secretAccessKey: this.secretAccessKey
        }
      })
    } else {
      console.warn('S3Client: AWS credentials not configured. S3 operations will fail.')
      this.client = null
    }
  }

  /**
   * Upload a file to S3 with server-side encryption
   * 
   * @param {string} key - S3 object key (path)
   * @param {Buffer} buffer - File content as buffer
   * @param {string} contentType - MIME type of the file
   * @returns {Promise<void>}
   * 
   * Requirements: 5.1
   */
  async uploadFile(key, buffer, contentType) {
    if (!this.isConfigured) {
      throw new Error('S3Client is not configured. Please set AWS credentials.')
    }

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ServerSideEncryption: 'AES256' // Enable server-side encryption
      })

      await this.client.send(command)
    } catch (error) {
      console.error('Error uploading file to S3:', error)
      throw new Error(`Failed to upload file to S3: ${error.message}`)
    }
  }

  /**
   * Generate a pre-signed URL for downloading a file
   * 
   * @param {string} key - S3 object key (path)
   * @param {number} expiresIn - URL expiration time in seconds (default: 300 = 5 minutes)
   * @returns {Promise<string>} - Pre-signed URL
   * 
   * Requirements: 5.4
   */
  async getSignedUrl(key, expiresIn = 300) {
    if (!this.isConfigured) {
      throw new Error('S3Client is not configured. Please set AWS credentials.')
    }

    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key
      })

      // Generate pre-signed URL for GET operation
      const url = await getSignedUrl(this.client, command, { expiresIn })
      return url
    } catch (error) {
      console.error('Error generating signed URL:', error)
      throw new Error(`Failed to generate signed URL: ${error.message}`)
    }
  }

  /**
   * Delete a file from S3
   * 
   * @param {string} key - S3 object key (path)
   * @returns {Promise<void>}
   * 
   * Requirements: 5.9
   */
  async deleteFile(key) {
    if (!this.isConfigured) {
      throw new Error('S3Client is not configured. Please set AWS credentials.')
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      })

      await this.client.send(command)
    } catch (error) {
      console.error('Error deleting file from S3:', error)
      throw new Error(`Failed to delete file from S3: ${error.message}`)
    }
  }

  /**
   * Check if a file exists in S3
   * 
   * @param {string} key - S3 object key (path)
   * @returns {Promise<boolean>} - True if file exists
   */
  async fileExists(key) {
    if (!this.isConfigured) {
      return false
    }

    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key
      })

      await this.client.send(command)
      return true
    } catch (error) {
      if (error.name === 'NotFound') {
        return false
      }
      throw error
    }
  }

  /**
   * Get the S3 bucket name
   * 
   * @returns {string} - Bucket name
   */
  getBucket() {
    return this.bucket
  }

  /**
   * Check if S3 is configured
   * 
   * @returns {boolean} - True if configured
   */
  isS3Configured() {
    return this.isConfigured
  }
}

// Export singleton instance
export const s3Client = new S3Client()
