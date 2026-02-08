# Implementation Plan: Ghost Apex Operations Portal Backend

## Overview

This implementation plan breaks down the Ghost Apex Operations Portal backend into discrete, incremental tasks. The approach follows a bottom-up strategy: database schema → core services → API endpoints → integrations → testing. Each task builds on previous work, ensuring the system remains functional and testable at every step.

**Technology Stack:**
- Next.js 14 (App Router with API routes)
- PostgreSQL 15 via Supabase
- TypeScript for type safety
- AWS SDK for S3 integration
- Stripe SDK for payments
- SendGrid SDK for emails
- fast-check for property-based testing
- Vitest for unit testing

## Tasks

- [x] 1. Database Schema and RLS Setup
  - Create all database tables with proper constraints and indexes
  - Implement Row-Level Security (RLS) policies for multi-tenant isolation
  - Create database functions for common operations
  - Seed initial data (service tiers, tax rates)
  - _Requirements: 1.1-1.18, 2.1-2.10_

- [x] 1.1 Write property test for database unique constraints
  - **Property 1: Database Unique Constraint Enforcement**
  - **Validates: Requirements 1.16**

- [x] 1.2 Write property test for foreign key enforcement
  - **Property 2: Database Foreign Key Enforcement**
  - **Validates: Requirements 1.17**

- [x] 1.3 Write property test for RLS client data isolation
  - **Property 3: Multi-Tenant Data Isolation (Client Access)**
  - **Validates: Requirements 2.1**

- [x] 1.4 Write property test for RLS admin full access
  - **Property 4: Admin Full Access**
  - **Validates: Requirements 2.2**

- [x] 2. Authentication Module
  - [x] 2.1 Set up Supabase Auth configuration
    - Configure email/password authentication
    - Set up JWT token generation with custom claims (client_id, role)
    - Configure session timeout (24 hours)
    - _Requirements: 3.1, 3.3, 3.6_
  
  - [x] 2.2 Implement AuthService with login, logout, and password reset
    - Create login endpoint that validates credentials and returns session
    - Create logout endpoint that invalidates session
    - Create password reset endpoint that sends reset email
    - _Requirements: 3.1, 3.2, 3.7, 3.8_
  
  - [x] 2.3 Write property test for invalid credentials handling
    - **Property 6: Invalid Credentials Error Handling**
    - **Validates: Requirements 3.2**
  
  - [x] 2.4 Write property test for password complexity enforcement
    - **Property 7: Password Complexity Enforcement**
    - **Validates: Requirements 3.10**
  
  - [x] 2.5 Implement AuthMiddleware for JWT validation
    - Create middleware to extract and verify JWT tokens
    - Add middleware to protected API routes
    - Handle token expiration and refresh
    - _Requirements: 3.5, 3.6_
  
  - [x] 2.6 Write property test for unauthenticated access denial
    - **Property 5: Unauthenticated Access Denial**
    - **Validates: Requirements 2.9**
  
  - [x] 2.7 Write unit tests for authentication edge cases
    - Test session expiration behavior
    - Test httpOnly cookie configuration
    - Test JWT token structure with custom claims
    - _Requirements: 3.4, 3.5, 2.10_

- [x] 3. Checkpoint - Verify authentication and database setup
  - Ensure all tests pass, verify RLS policies work correctly, ask the user if questions arise.

- [x] 4. Service Tier Access Control Module
  - [x] 4.1 Implement TierService with feature access validation
    - Create feature matrix mapping tiers to features
    - Implement hasFeatureAccess method
    - Implement getAvailableFeatures method
    - _Requirements: 4.1-4.6, 4.10_
  
  - [x] 4.2 Implement FeatureGate middleware
    - Create middleware to check tier permissions before endpoint execution
    - Return 403 Forbidden for unauthorized access
    - _Requirements: 4.7, 4.8_
  
  - [x] 4.3 Write property test for tier-based feature access
    - **Property 8: Tier-Based Feature Access Control**
    - **Validates: Requirements 4.1-4.6**
  
  - [x] 4.4 Write property test for unauthorized feature access denial
    - **Property 9: Unauthorized Feature Access Denial**
    - **Validates: Requirements 4.7**
  
  - [x] 4.5 Write property test for immediate tier update effect
    - **Property 10: Immediate Tier Update Effect**
    - **Validates: Requirements 4.9**

- [x] 5. Document Storage Module with S3 Integration
  - [x] 5.1 Set up AWS S3 client and bucket configuration
    - Configure S3 client with credentials
    - Set up bucket with server-side encryption
    - Configure CORS for frontend uploads
    - _Requirements: 5.1_
  
  - [x] 5.2 Implement DocumentService for upload, download, list, delete
    - Create uploadDocument method with S3 upload and database record creation
    - Create getDownloadUrl method with pre-signed URL generation (5 min expiry)
    - Create listDocuments method with RLS filtering
    - Create deleteDocument method with S3 and database deletion
    - _Requirements: 5.1-5.6, 5.9_
  
  - [x] 5.3 Implement FileValidator for type and size validation
    - Validate file types against allowed extensions
    - Validate file size (max 10MB)
    - _Requirements: 5.7, 5.8_
  
  - [x] 5.4 Write property test for document upload creates S3 and DB record
    - **Property 11: Document Upload Creates S3 Object and Database Record**
    - **Validates: Requirements 5.1, 5.3**
  
  - [x] 5.5 Write property test for S3 key format consistency
    - **Property 12: S3 Key Format Consistency**
    - **Validates: Requirements 5.2**
  
  - [x] 5.6 Write property test for admin document upload association
    - **Property 13: Admin Document Upload Association**
    - **Validates: Requirements 5.6**
  
  - [x] 5.7 Write property test for document type validation
    - **Property 14: Document Type Validation**
    - **Validates: Requirements 5.7**
  
  - [x] 5.8 Write property test for document deletion removes both DB and S3
    - **Property 15: Document Deletion Removes Both Database and S3**
    - **Validates: Requirements 5.9**
  
  - [-] 5.9 Write property test for document metadata storage
    - **Property 16: Document Metadata Storage**
    - **Validates: Requirements 5.10**
  
  - [ ] 5.10 Write unit tests for document edge cases
    - Test file size limit enforcement
    - Test pre-signed URL expiration
    - Test S3 error handling
    - _Requirements: 5.4, 5.8_

- [-] 6. Support Ticket System
  - [x] 6.1 Implement TicketService for CRUD operations
    - Create createTicket method with status "Open"
    - Create getTicket method with RLS filtering
    - Create listTickets method with filters (status, priority)
    - Create updateTicketStatus method
    - Create assignTicket method
    - _Requirements: 6.1, 6.5, 6.7, 6.8_
  
  - [x] 6.2 Implement MessageService for ticket messaging
    - Create addMessage method with sender information
    - Create getMessages method with chronological ordering
    - Handle file attachments via S3
    - Implement ticket reopening logic (status change on new message)
    - _Requirements: 6.3, 6.5, 6.9, 6.10_
  
  - [ ] 6.3 Write property test for ticket creation with Open status
    - **Property 17: Support Ticket Creation with Open Status**
    - **Validates: Requirements 6.1**
  
  - [ ] 6.4 Write property test for ticket message creation
    - **Property 18: Ticket Message Creation**
    - **Validates: Requirements 6.3**
  
  - [ ] 6.5 Write property test for messages chronological ordering
    - **Property 19: Ticket Messages Chronological Ordering**
    - **Validates: Requirements 6.5**
  
  - [ ] 6.6 Write property test for ticket assignment
    - **Property 20: Ticket Assignment Updates Field**
    - **Validates: Requirements 6.7**
  
  - [ ] 6.7 Write property test for ticket resolution
    - **Property 21: Ticket Resolution Updates Status and Timestamp**
    - **Validates: Requirements 6.8**
  
  - [ ] 6.8 Write property test for message attachment storage
    - **Property 22: Ticket Message Attachment Storage**
    - **Validates: Requirements 6.9**
  
  - [ ] 6.9 Write property test for ticket reopening
    - **Property 23: Ticket Reopening on New Message**
    - **Validates: Requirements 6.10**
  
  - [ ] 6.10 Write unit tests for ticket edge cases
    - Test ticket priority values
    - Test ticket filtering
    - Test concurrent message additions
    - _Requirements: 6.6_

- [ ] 7. Checkpoint - Verify core services
  - Ensure all tests pass, verify document and ticket operations work correctly, ask the user if questions arise.

- [ ]* 8. ELD Integration Module (OPTIONAL - Defer for later)
  - [ ]* 8.1 Create ELDClient abstract interface
    - Define interface methods: getDrivers, getHOSLogs, getViolations
    - _Requirements: 7.1_
  
  - [ ]* 8.2 Implement SamsaraClient for Samsara API
    - Implement API authentication
    - Implement getDrivers method
    - Implement getHOSLogs method
    - Implement getViolations method
    - _Requirements: 7.5_
  
  - [ ]* 8.3 Implement MotiveClient for Motive API
    - Implement API authentication
    - Implement getDrivers method
    - Implement getHOSLogs method
    - Implement getViolations method
    - _Requirements: 7.6_
  
  - [ ]* 8.4 Implement ViolationDetector for HOS violation analysis
    - Detect driving over 11 hours violations
    - Detect on-duty over 14 hours violations
    - Detect missing log violations
    - _Requirements: 7.2_
  
  - [ ]* 8.5 Implement ELDSyncService for orchestrating sync
    - Create syncClient method with retry logic (3 attempts, exponential backoff)
    - Create createELDReport method
    - Store violations in eld_reports table
    - _Requirements: 7.3, 7.7, 7.10_
  
  - [ ]* 8.6 Write property test for HOS violation detection
    - **Property 24: HOS Violation Detection**
    - **Validates: Requirements 7.2**
  
  - [ ]* 8.7 Write property test for violation data storage
    - **Property 25: Violation Data Storage**
    - **Validates: Requirements 7.3**
  
  - [ ]* 8.8 Write property test for ELD sync retry logic
    - **Property 26: ELD Sync Retry Logic**
    - **Validates: Requirements 7.7**
  
  - [ ]* 8.9 Write property test for ELD report completeness
    - **Property 27: ELD Report Completeness**
    - **Validates: Requirements 7.9**
  
  - [ ]* 8.10 Write unit tests for ELD integration edge cases
    - Test API authentication failures
    - Test malformed API responses
    - Test empty HOS data
    - _Requirements: 7.7_

- [ ]* 9. IFTA Calculation Engine (OPTIONAL - Defer for later)
  - [ ]* 9.1 Implement TaxRateService for managing jurisdiction tax rates
    - Create getTaxRate method with effective date lookup
    - Create updateTaxRate method (admin only)
    - Seed initial tax rates for all jurisdictions
    - _Requirements: 8.8_
  
  - [ ]* 9.2 Implement IFTACalculator for tax calculations
    - Create calculateQuarter method
    - Implement aggregateMilesByJurisdiction from trip data
    - Implement aggregateFuelByJurisdiction from fuel purchases
    - Implement calculateTaxOwed using IFTA formula
    - Create IFTA record with status "Draft"
    - _Requirements: 8.1-8.5_
  
  - [ ]* 9.3 Implement IFTA approval and status management
    - Create approveIFTA method to update status to "Approved"
    - Implement incomplete data detection and flagging
    - _Requirements: 8.6, 8.9_
  
  - [ ]* 9.4 Write property test for IFTA jurisdiction aggregation
    - **Property 28: IFTA Jurisdiction Aggregation**
    - **Validates: Requirements 8.2, 8.3**
  
  - [ ]* 9.5 Write property test for IFTA tax calculation accuracy
    - **Property 29: IFTA Tax Calculation Accuracy**
    - **Validates: Requirements 8.4**
  
  - [ ]* 9.6 Write property test for IFTA record creation with Draft status
    - **Property 30: IFTA Record Creation with Draft Status**
    - **Validates: Requirements 8.5**
  
  - [ ]* 9.7 Write property test for IFTA approval status update
    - **Property 31: IFTA Approval Status Update**
    - **Validates: Requirements 8.6**
  
  - [ ]* 9.8 Write property test for IFTA incomplete data flagging
    - **Property 32: IFTA Incomplete Data Flagging**
    - **Validates: Requirements 8.9**
  
  - [ ]* 9.9 Write unit tests for IFTA edge cases
    - Test zero miles in jurisdiction
    - Test missing fuel data
    - Test quarter boundary dates
    - _Requirements: 8.9_

- [ ]* 10. Checkpoint - Verify ELD and IFTA modules (OPTIONAL)
  - Ensure all tests pass, verify violation detection and IFTA calculations work correctly, ask the user if questions arise.

- [-] 11. Admin Dashboard and Client Management
  - [x] 11.1 Implement DashboardService for KPI aggregation
    - Calculate total active clients
    - Calculate total open tickets
    - Calculate violations this week
    - Calculate revenue by tier
    - Calculate new clients this month
    - Calculate average ticket resolution time
    - _Requirements: 9.1-9.4_
  
  - [x] 11.2 Implement client management operations
    - Create createClient method (creates user and client records)
    - Create updateClientTier method
    - Create deactivateClient method (updates status, revokes access)
    - Create getClientProfile method (returns all associated data)
    - _Requirements: 9.5, 9.7, 9.9, 9.10_
  
  - [x] 11.3 Implement AuditLogService for tracking admin actions
    - Create logAction method
    - Create queryLogs method with filtering
    - Ensure audit logs are sorted in reverse chronological order
    - Prevent deletion of audit logs (database permission)
    - _Requirements: 9.8, 10.1-10.10_
  
  - [ ] 11.4 Write property test for dashboard KPI accuracy
    - **Property 33: Dashboard KPI Accuracy**
    - **Validates: Requirements 9.1-9.4**
  
  - [ ] 11.5 Write property test for client creation
    - **Property 34: Client Creation Creates Both User and Client Records**
    - **Validates: Requirements 9.5**
  
  - [ ] 11.6 Write property test for client tier update
    - **Property 35: Client Tier Update**
    - **Validates: Requirements 9.7**
  
  - [ ] 11.7 Write property test for audit log creation
    - **Property 36: Audit Log Creation on Admin Actions**
    - **Validates: Requirements 9.8, 10.1-10.5**
  
  - [ ] 11.8 Write property test for client deactivation
    - **Property 37: Client Deactivation Updates Status and Revokes Access**
    - **Validates: Requirements 9.9**
  
  - [ ] 11.9 Write property test for client profile data completeness
    - **Property 38: Client Profile Data Completeness**
    - **Validates: Requirements 9.10**
  
  - [ ] 11.10 Write property test for audit log completeness
    - **Property 39: Audit Log Completeness**
    - **Validates: Requirements 10.6**
  
  - [ ] 11.11 Write property test for audit log deletion prevention
    - **Property 40: Audit Log Deletion Prevention**
    - **Validates: Requirements 10.7**
  
  - [ ] 11.12 Write property test for audit log ordering
    - **Property 41: Audit Log Reverse Chronological Ordering**
    - **Validates: Requirements 10.8**
  
  - [ ] 11.13 Write property test for audit log filtering
    - **Property 42: Audit Log Filtering**
    - **Validates: Requirements 10.9**

- [ ]* 12. Email Notification Module (OPTIONAL - Defer for later)
  - [ ]* 12.1 Set up SendGrid client and email templates
    - Configure SendGrid API key
    - Create email templates (invitation, ticket notifications, violations, password reset, tier upgrade, payment failed)
    - _Requirements: 11.7, 11.8_
  
  - [ ]* 12.2 Implement EmailService for sending emails
    - Create sendEmail method
    - Create sendTemplateEmail method
    - Implement retry logic (3 attempts, 1s delay)
    - Add unsubscribe links to non-critical emails
    - _Requirements: 11.1-11.6, 11.9, 11.10_
  
  - [ ]* 12.3 Write property test for email retry logic
    - **Property 43: Email Retry Logic**
    - **Validates: Requirements 11.9**
  
  - [ ]* 12.4 Write property test for unsubscribe link presence
    - **Property 44: Unsubscribe Link Presence**
    - **Validates: Requirements 11.10**
  
  - [ ]* 12.5 Write unit tests for email edge cases
    - Test email template rendering
    - Test SendGrid API errors
    - Test email queue processing
    - _Requirements: 11.9_

- [ ]* 13. Stripe Integration Module (OPTIONAL - Defer for later)
  - [ ]* 13.1 Set up Stripe client and webhook endpoint
    - Configure Stripe API key
    - Create webhook endpoint at /api/webhooks/stripe
    - Implement webhook signature verification
    - _Requirements: 12.6, 12.7_
  
  - [ ]* 13.2 Implement SubscriptionService for billing operations
    - Create createCustomer method
    - Create createSubscription method
    - Create updateSubscription method (for tier changes)
    - Create cancelSubscription method
    - Create getBillingHistory method
    - _Requirements: 12.1, 12.2, 12.9, 12.10_
  
  - [ ]* 13.3 Implement WebhookHandler for Stripe events
    - Handle invoice.payment_succeeded (update status to Active)
    - Handle invoice.payment_failed (update status to Payment Failed)
    - Handle customer.subscription.deleted (update status to Canceled, revoke access)
    - _Requirements: 12.3, 12.4, 12.5_
  
  - [ ]* 13.4 Write property test for payment success handling
    - **Property 45: Stripe Webhook Payment Success Handling**
    - **Validates: Requirements 12.3**
  
  - [ ]* 13.5 Write property test for payment failure handling
    - **Property 46: Stripe Webhook Payment Failure Handling**
    - **Validates: Requirements 12.4**
  
  - [ ]* 13.6 Write property test for subscription cancellation handling
    - **Property 47: Stripe Webhook Subscription Cancellation Handling**
    - **Validates: Requirements 12.5**
  
  - [ ]* 13.7 Write property test for webhook signature verification
    - **Property 48: Stripe Webhook Signature Verification**
    - **Validates: Requirements 12.7**
  
  - [ ]* 13.8 Write unit tests for Stripe integration edge cases
    - Test Stripe API errors
    - Test webhook replay attacks
    - Test subscription tier changes
    - _Requirements: 12.7, 12.9_

- [ ]* 14. Checkpoint - Verify integrations (OPTIONAL)
  - Ensure all tests pass, verify email and Stripe integrations work correctly, ask the user if questions arise.

- [-] 15. API Endpoints Implementation
  - [x] 15.1 Implement authentication API endpoints
    - POST /api/auth/login
    - POST /api/auth/logout
    - POST /api/auth/reset-password
    - _Requirements: 13.1, 13.2, 13.3_
  
  - [x] 15.2 Implement client API endpoints
    - GET /api/clients/me
    - GET /api/clients (admin only)
    - POST /api/clients (admin only)
    - PATCH /api/clients/:id (admin only)
    - _Requirements: 13.4, 13.5, 13.6, 13.7_
  
  - [x] 15.3 Implement document API endpoints
    - GET /api/documents
    - POST /api/documents/upload
    - GET /api/documents/:id/download
    - DELETE /api/documents/:id
    - _Requirements: 13.8, 13.9, 13.10, 13.11_
  
  - [x] 15.4 Implement ticket API endpoints
    - GET /api/tickets
    - POST /api/tickets
    - POST /api/tickets/:id/messages
    - _Requirements: 13.12, 13.13, 13.14_
  
  - [ ]* 15.5 Implement report API endpoints (OPTIONAL - for ELD/IFTA)
    - GET /api/reports/eld
    - GET /api/reports/ifta
    - _Requirements: 13.15, 13.16_
  
  - [x] 15.6 Implement admin API endpoints
    - GET /api/admin/dashboard
    - GET /api/admin/audit-logs
    - _Requirements: 13.17, 13.18_
  
  - [ ] 15.7 Write unit tests for API endpoint responses
    - Test correct HTTP status codes (200, 201, 400, 401, 403, 404, 500)
    - Test error response format consistency
    - Test request validation
    - _Requirements: 13.19, 13.20_

- [ ] 16. Input Validation and Error Handling
  - [ ] 16.1 Implement comprehensive input validation
    - Email format validation
    - Client ID format validation (alphanumeric, 6-20 chars)
    - Date format validation (ISO 8601)
    - File type validation
    - SQL injection prevention (parameterized queries)
    - XSS prevention (input sanitization)
    - _Requirements: 14.6, 14.7, 14.8, 14.9, 14.10_
  
  - [ ] 16.2 Implement error handling and logging
    - Create centralized error handler
    - Implement error logging with stack traces
    - Return user-friendly error messages
    - Handle database constraint violations
    - _Requirements: 14.5, 14.11, 14.12_
  
  - [ ] 16.3 Write property test for invalid input error response
    - **Property 49: Invalid Input Error Response**
    - **Validates: Requirements 14.1**
  
  - [ ] 16.4 Write property test for resource not found error
    - **Property 50: Resource Not Found Error Response**
    - **Validates: Requirements 14.4**
  
  - [ ] 16.5 Write property test for email format validation
    - **Property 51: Email Format Validation**
    - **Validates: Requirements 14.6**
  
  - [ ] 16.6 Write property test for client ID format validation
    - **Property 52: Client ID Format Validation**
    - **Validates: Requirements 14.7**
  
  - [ ] 16.7 Write property test for date format validation
    - **Property 53: Date Format Validation**
    - **Validates: Requirements 14.9**
  
  - [ ] 16.8 Write property test for SQL injection prevention
    - **Property 54: SQL Injection Prevention**
    - **Validates: Requirements 14.10**
  
  - [ ] 16.9 Write property test for error logging
    - **Property 55: Error Logging with Stack Traces**
    - **Validates: Requirements 14.12**
  
  - [ ] 16.10 Write unit tests for error handling edge cases
    - Test 401 Unauthorized responses
    - Test 403 Forbidden responses
    - Test 500 Internal Server Error responses
    - Test database constraint error messages
    - _Requirements: 14.2, 14.3, 14.5, 14.11_

- [ ] 17. Frontend Integration
  - [ ] 17.1 Update existing frontend components to use new API endpoints
    - Update authentication context to use /api/auth endpoints
    - Update client management utilities to use /api/clients endpoints
    - Update document components to use /api/documents endpoints
    - Update ticket components to use /api/tickets endpoints
    - _Requirements: 13.1-13.18_
  
  - [ ] 17.2 Add error handling and loading states to frontend
    - Display user-friendly error messages
    - Add loading spinners for async operations
    - Handle authentication errors (redirect to login)
    - Handle authorization errors (show upgrade prompt)
    - _Requirements: 14.1-14.5_
  
  - [ ] 17.3 Implement tier-based feature gating in UI
    - Hide/disable features not included in client's tier
    - Show upgrade prompts for locked features
    - Display current tier and available features
    - _Requirements: 4.1-4.7_

- [ ] 18. Performance Optimization
  - [ ] 18.1 Implement database connection pooling
    - Configure Supabase connection pool settings
    - _Requirements: 15.4_
  
  - [ ] 18.2 Add caching for frequently accessed data
    - Cache service tier configurations
    - Cache IFTA tax rates
    - Implement cache invalidation strategy
    - _Requirements: 15.5_
  
  - [ ] 18.3 Implement rate limiting on API endpoints
    - Add rate limiting middleware (100 requests/min per client)
    - Return 429 Too Many Requests when limit exceeded
    - _Requirements: 15.9_
  
  - [ ] 18.4 Optimize database queries with indexes
    - Verify all indexes are created (already in schema)
    - Analyze slow queries and add additional indexes if needed
    - _Requirements: 15.7_

- [ ] 19. Final Checkpoint - End-to-end testing
  - [ ] 19.1 Test complete user flows
    - Client signup and authentication flow
    - Document upload and download flow
    - Support ticket creation and messaging flow
    - Admin client management flow
  
  - [ ] 19.2 Test external integrations
    - Verify S3 uploads and downloads work
    - Verify Stripe webhooks are processed correctly (if implemented)
    - Verify SendGrid emails are sent (if implemented)
  
  - [ ] 19.3 Verify security and access control
    - Test RLS policies prevent cross-tenant data access
    - Test tier-based feature access control
    - Test admin-only endpoints reject client users
    - Test authentication and session management
  
  - [ ] 19.4 Performance and load testing
    - Test concurrent user access
    - Test API response times
    - Test database query performance
    - Verify rate limiting works correctly

- [ ] 20. Documentation and Deployment Preparation
  - [ ] 20.1 Create API documentation
    - Document all API endpoints with request/response examples
    - Document authentication flow
    - Document error codes and messages
  
  - [ ] 20.2 Create deployment guide
    - Document environment variables needed
    - Document database migration steps
    - Document Supabase setup steps
    - Document AWS S3 setup steps
    - Document Stripe webhook configuration (if implemented)
    - Document SendGrid setup steps (if implemented)
  
  - [ ] 20.3 Create developer onboarding guide
    - Document local development setup
    - Document testing procedures
    - Document code organization and architecture

## Notes

- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties (minimum 100 iterations each)
- Unit tests validate specific examples, edge cases, and error conditions
- All property tests must be tagged with: `// Feature: ghost-apex-backend, Property {number}: {property_text}`
- External service integrations (S3, Stripe, SendGrid, ELD APIs) should be mocked in tests
- Use fast-check library for property-based testing in TypeScript
- Use Vitest for unit testing
- Ensure all tests pass before moving to the next checkpoint
