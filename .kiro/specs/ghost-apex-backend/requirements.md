# Requirements Document: Ghost Apex Operations Portal Backend

## Introduction

The Ghost Apex Operations Portal is a multi-tenant trucking compliance management platform that requires a complete backend infrastructure to support three main areas: Public Website, Client Portal, and Admin Portal. The frontend exists with design layouts and UI components already implemented. This specification covers the backend system that will power authentication, data management, external integrations, and API endpoints to connect the existing frontend to a robust PostgreSQL database with Supabase, AWS S3 storage, and third-party service integrations.

## Glossary

- **System**: The Ghost Apex Operations Portal backend infrastructure
- **Client**: A trucking company customer using the portal
- **Admin**: Ghost Apex staff member managing clients and operations
- **Tenant**: An isolated client organization with dedicated data access
- **Service_Tier**: Subscription level (Wingman, Guardian, Apex Command, Virtual Dispatcher, DOT Readiness Audit, Back Office Command)
- **RLS**: Row-Level Security policies in PostgreSQL
- **ELD**: Electronic Logging Device for Hours of Service tracking
- **IFTA**: International Fuel Tax Agreement reporting
- **DataQ**: FMCSA system for disputing violations
- **CSA**: Compliance Safety Accountability scores
- **DQ_File**: Driver Qualification file
- **HOS**: Hours of Service regulations
- **Supabase**: Backend-as-a-Service platform providing PostgreSQL, Auth, and APIs
- **S3**: Amazon Simple Storage Service for encrypted file storage
- **Edge_Function**: Serverless function running on Supabase infrastructure
- **Audit_Log**: Non-erasable record of admin actions

## Requirements

### Requirement 1: Database Schema and Multi-Tenant Architecture

**User Story:** As a system architect, I want a comprehensive PostgreSQL database schema with multi-tenant isolation, so that client data remains secure and properly segregated.

#### Acceptance Criteria

1. THE System SHALL create a users table with fields for id, email, role (admin/client), created_at, and updated_at
2. THE System SHALL create a clients table with fields for id, user_id, email, company_name, client_id (unique identifier), tier, status, created_at, and updated_at
3. THE System SHALL create a documents table with fields for id, client_id, file_name, file_type, s3_key, s3_bucket, uploaded_by, uploaded_at, and metadata (JSONB)
4. THE System SHALL create a support_tickets table with fields for id, client_id, subject, message, status, priority, assigned_to, created_at, updated_at, and resolved_at
5. THE System SHALL create an eld_reports table with fields for id, client_id, week_start, violations (integer), violation_data (JSONB), corrective_actions, report_notes, and created_at
6. THE System SHALL create an ifta_records table with fields for id, client_id, quarter, year, total_miles, taxable_miles, fuel_gallons, tax_owed, status, and created_at
7. THE System SHALL create a driver_files table with fields for id, client_id, driver_name, license_number, expiration_date, file_type, s3_key, and created_at
8. THE System SHALL create a csa_scores table with fields for id, client_id, score_date, unsafe_driving, hos_compliance, vehicle_maintenance, controlled_substances, driver_fitness, and created_at
9. THE System SHALL create a dataq_disputes table with fields for id, client_id, violation_date, dispute_reason, status, submitted_at, resolved_at, and outcome
10. THE System SHALL create a load_schedules table with fields for id, client_id, load_number, pickup_date, pickup_location, delivery_date, delivery_location, driver_assigned, and status
11. THE System SHALL create a broker_packets table with fields for id, client_id, broker_name, rate_confirmation_s3_key, bol_s3_key, uploaded_at, and status
12. THE System SHALL create a weekly_revenue_reports table with fields for id, client_id, week_start, week_end, total_revenue, total_miles, revenue_per_mile, and created_at
13. THE System SHALL create a dot_audits table with fields for id, client_id, audit_date, audit_type, findings (JSONB), recommendations, status, and created_at
14. THE System SHALL create an audit_logs table with fields for id, admin_id, action_type, target_table, target_id, changes (JSONB), ip_address, and timestamp
15. THE System SHALL create a ticket_messages table with fields for id, ticket_id, sender_id, sender_type (admin/client), message, attachment_s3_key, and created_at
16. THE System SHALL enforce unique constraints on client_id in the clients table
17. THE System SHALL enforce foreign key relationships between all tables and their parent entities
18. THE System SHALL create indexes on frequently queried fields (client_id, email, status, created_at)

### Requirement 2: Row-Level Security and Access Control

**User Story:** As a security architect, I want Row-Level Security policies enforced at the database level, so that clients can only access their own data and admins have appropriate elevated access.

#### Acceptance Criteria

1. WHEN a client queries any table, THE System SHALL filter results to only include rows where client_id matches their authenticated client_id
2. WHEN an admin queries any table, THE System SHALL return all rows without client_id filtering
3. THE System SHALL create RLS policies for the clients table allowing users to read only their own client record
4. THE System SHALL create RLS policies for the documents table allowing clients to access only documents where client_id matches their authenticated client_id
5. THE System SHALL create RLS policies for the support_tickets table allowing clients to access only tickets where client_id matches their authenticated client_id
6. THE System SHALL create RLS policies for all report tables (eld_reports, ifta_records, driver_files, csa_scores, dataq_disputes, load_schedules, broker_packets, weekly_revenue_reports, dot_audits) allowing clients to access only records where client_id matches their authenticated client_id
7. THE System SHALL create RLS policies allowing admins full read and write access to all tables
8. THE System SHALL enable RLS on all tables containing client-specific data
9. WHEN a user attempts to access data without proper authentication, THE System SHALL deny access and return an authentication error
10. THE System SHALL store the authenticated user's role in the JWT token claims for RLS policy evaluation

### Requirement 3: Authentication and Session Management

**User Story:** As a user, I want secure authentication with automatic session management, so that my account remains protected and I'm automatically logged out after inactivity.

#### Acceptance Criteria

1. WHEN a user submits valid credentials, THE System SHALL authenticate them using Supabase Auth and return a session token
2. WHEN a user submits invalid credentials, THE System SHALL return an authentication error without revealing whether the email or password was incorrect
3. THE System SHALL support email/password authentication as the primary method
4. THE System SHALL store session tokens securely using httpOnly cookies
5. WHEN a session token expires, THE System SHALL automatically log out the user and redirect to the login page
6. THE System SHALL set session timeout to 24 hours of inactivity
7. WHEN a user logs out, THE System SHALL invalidate their session token and clear all authentication cookies
8. THE System SHALL support password reset via email with secure token-based verification
9. WHEN a new client is invited, THE System SHALL send an email invitation with a secure signup link
10. THE System SHALL enforce password complexity requirements (minimum 8 characters, at least one uppercase, one lowercase, one number)

### Requirement 4: Service Tier Feature Access Control

**User Story:** As a product manager, I want service tier-based feature access control, so that clients only access features included in their subscription tier.

#### Acceptance Criteria

1. WHEN a Wingman tier client accesses the portal, THE System SHALL grant access to Support Tickets, ELD Reports, and Dispatch Board features
2. WHEN a Guardian tier client accesses the portal, THE System SHALL grant access to all Wingman features plus IFTA Reports and Driver Qualification Files
3. WHEN an Apex Command tier client accesses the portal, THE System SHALL grant access to all Guardian features plus CSA Scores and DataQ Disputes
4. WHEN a Virtual Dispatcher tier client accesses the portal, THE System SHALL grant access to Support Tickets, ELD Reports, IFTA Reports, Driver Qualification Files, and Dispatch Board features
5. WHEN a DOT Readiness Audit tier client accesses the portal, THE System SHALL grant access to DOT Audit reports and findings
6. WHEN a Back Office Command tier client accesses the portal, THE System SHALL grant access to all features from all tiers
7. WHEN a client attempts to access a feature not included in their tier, THE System SHALL return a 403 Forbidden error with a message indicating the feature requires a tier upgrade
8. THE System SHALL validate tier access on every API endpoint that serves tier-specific features
9. WHEN an admin updates a client's tier, THE System SHALL immediately apply the new feature access permissions
10. THE System SHALL store tier information in the clients table and reference it for all authorization checks

### Requirement 5: Document Management with S3 Integration

**User Story:** As a client, I want to upload, download, and manage compliance documents securely, so that all my trucking documentation is centralized and accessible.

#### Acceptance Criteria

1. WHEN a client uploads a document, THE System SHALL store the file in AWS S3 with server-side encryption enabled
2. WHEN a document is uploaded, THE System SHALL generate a unique S3 key using the pattern: {client_id}/{timestamp}_{original_filename}
3. WHEN a document is uploaded, THE System SHALL create a record in the documents table with file metadata
4. WHEN a client requests to download a document, THE System SHALL generate a pre-signed S3 URL valid for 5 minutes
5. WHEN a client requests to list their documents, THE System SHALL return all documents where client_id matches their authenticated client_id
6. WHEN an admin uploads a document for a client, THE System SHALL associate the document with the specified client_id
7. THE System SHALL support document types: PDF, DOCX, XLSX, PNG, JPG, and CSV
8. WHEN a document upload exceeds 10MB, THE System SHALL reject the upload and return a file size error
9. WHEN a client deletes a document, THE System SHALL mark the document as deleted in the database and remove the file from S3
10. THE System SHALL store document metadata (file size, mime type, uploader) in the documents table metadata JSONB field

### Requirement 6: Support Ticket System with Messaging

**User Story:** As a client, I want to create support tickets and communicate with admins through threaded messages, so that I can get help with compliance issues.

#### Acceptance Criteria

1. WHEN a client creates a support ticket, THE System SHALL create a record in the support_tickets table with status set to "Open"
2. WHEN a support ticket is created, THE System SHALL send an email notification to the admin team
3. WHEN a client or admin adds a message to a ticket, THE System SHALL create a record in the ticket_messages table
4. WHEN a message is added to a ticket, THE System SHALL send an email notification to the other party
5. WHEN a client views a ticket, THE System SHALL return all messages in chronological order
6. THE System SHALL support ticket priorities: Low, Medium, High, Urgent
7. WHEN an admin assigns a ticket, THE System SHALL update the assigned_to field with the admin's user_id
8. WHEN an admin resolves a ticket, THE System SHALL update the status to "Resolved" and set the resolved_at timestamp
9. WHEN a message includes a file attachment, THE System SHALL store the file in S3 and record the s3_key in the ticket_messages table
10. THE System SHALL allow clients to reopen resolved tickets by adding a new message

### Requirement 7: ELD Data Integration and Violation Tracking

**User Story:** As a compliance manager, I want to integrate with ELD providers to automatically sync Hours of Service data and flag violations, so that I can proactively manage driver compliance.

#### Acceptance Criteria

1. WHEN the System syncs with an ELD provider API, THE System SHALL retrieve HOS data for all drivers associated with the client
2. WHEN HOS data is retrieved, THE System SHALL parse the data and identify violations (driving over 11 hours, on-duty over 14 hours, missing logs)
3. WHEN violations are detected, THE System SHALL store violation details in the eld_reports table violation_data JSONB field
4. WHEN violations are detected, THE System SHALL send an email notification to the client
5. THE System SHALL support integration with Samsara ELD API
6. THE System SHALL support integration with Motive (formerly KeepTruckin) ELD API
7. WHEN ELD data sync fails, THE System SHALL log the error and retry up to 3 times with exponential backoff
8. THE System SHALL sync ELD data automatically every 24 hours for all active clients with ELD integration enabled
9. WHEN a client views their ELD report, THE System SHALL display violation count, violation details, and corrective actions
10. THE System SHALL allow admins to manually trigger ELD data sync for a specific client

### Requirement 8: IFTA Calculation and Quarterly Reporting

**User Story:** As a client, I want automated IFTA calculations from my ELD data, so that I can easily file quarterly fuel tax reports without manual data entry.

#### Acceptance Criteria

1. WHEN the System calculates IFTA for a quarter, THE System SHALL retrieve all ELD trip data for that quarter
2. WHEN calculating IFTA, THE System SHALL aggregate total miles driven by jurisdiction
3. WHEN calculating IFTA, THE System SHALL aggregate total fuel purchased by jurisdiction
4. WHEN calculating IFTA, THE System SHALL calculate taxable miles and tax owed per jurisdiction using current IFTA rates
5. WHEN IFTA calculation is complete, THE System SHALL create a record in the ifta_records table with status "Draft"
6. WHEN a client reviews and approves IFTA data, THE System SHALL update the status to "Approved"
7. WHEN IFTA data is approved, THE System SHALL generate a PDF report with all jurisdiction breakdowns
8. THE System SHALL store IFTA tax rates in a configuration table that admins can update
9. WHEN IFTA data is missing or incomplete, THE System SHALL flag the record and notify the client
10. THE System SHALL allow clients to download IFTA reports as PDF or CSV

### Requirement 9: Admin Dashboard and Client Management

**User Story:** As an admin, I want a comprehensive dashboard with KPIs and client management tools, so that I can efficiently oversee all client accounts and operations.

#### Acceptance Criteria

1. WHEN an admin views the dashboard, THE System SHALL display total active clients count
2. WHEN an admin views the dashboard, THE System SHALL display total open support tickets count
3. WHEN an admin views the dashboard, THE System SHALL display total violations flagged this week
4. WHEN an admin views the dashboard, THE System SHALL display revenue metrics by service tier
5. WHEN an admin creates a new client, THE System SHALL create records in both the users and clients tables
6. WHEN an admin creates a new client, THE System SHALL send an invitation email with signup instructions
7. WHEN an admin updates a client's tier, THE System SHALL update the tier field in the clients table
8. WHEN an admin updates a client's tier, THE System SHALL log the change in the audit_logs table
9. WHEN an admin deactivates a client, THE System SHALL update the status field to "Inactive" and revoke access
10. WHEN an admin views a client's profile, THE System SHALL display all associated data (documents, tickets, reports)
11. THE System SHALL allow admins to bulk upload documents and assign them to multiple clients
12. WHEN an admin performs any action, THE System SHALL create an audit log entry with action details

### Requirement 10: Audit Logging and Compliance Tracking

**User Story:** As a compliance officer, I want comprehensive audit logs of all admin actions, so that we maintain accountability and can track all system changes.

#### Acceptance Criteria

1. WHEN an admin creates a client, THE System SHALL create an audit log entry with action_type "client_created"
2. WHEN an admin updates a client, THE System SHALL create an audit log entry with action_type "client_updated" and store the changes in the changes JSONB field
3. WHEN an admin deletes a document, THE System SHALL create an audit log entry with action_type "document_deleted"
4. WHEN an admin assigns a support ticket, THE System SHALL create an audit log entry with action_type "ticket_assigned"
5. WHEN an admin updates a client's tier, THE System SHALL create an audit log entry with action_type "tier_updated"
6. THE System SHALL store the admin's user_id, IP address, and timestamp for every audit log entry
7. THE System SHALL prevent deletion of audit log entries (no DELETE permission on audit_logs table)
8. WHEN an admin views audit logs, THE System SHALL display entries in reverse chronological order
9. THE System SHALL allow filtering audit logs by admin, action_type, date range, and target_table
10. THE System SHALL retain audit logs indefinitely for compliance purposes

### Requirement 11: Email Notification System

**User Story:** As a user, I want to receive email notifications for important events, so that I stay informed about compliance issues and system updates.

#### Acceptance Criteria

1. WHEN a new support ticket is created, THE System SHALL send an email to the admin team with ticket details
2. WHEN a support ticket receives a new message, THE System SHALL send an email to the other party (client or admin)
3. WHEN ELD violations are detected, THE System SHALL send an email to the client with violation summary
4. WHEN a client is invited to the portal, THE System SHALL send an invitation email with signup link
5. WHEN a password reset is requested, THE System SHALL send a password reset email with secure token
6. WHEN a client's tier is upgraded, THE System SHALL send a confirmation email with new feature access details
7. THE System SHALL use SendGrid API for sending transactional emails
8. THE System SHALL use branded email templates with Ghost Apex logo and styling
9. WHEN an email fails to send, THE System SHALL log the error and retry up to 3 times
10. THE System SHALL include unsubscribe links in all non-critical notification emails

### Requirement 12: Stripe Subscription and Billing Integration

**User Story:** As a business owner, I want automated subscription billing through Stripe, so that client payments are processed reliably and tier access is managed automatically.

#### Acceptance Criteria

1. WHEN a new client signs up, THE System SHALL create a Stripe customer record with the client's email
2. WHEN a client selects a service tier, THE System SHALL create a Stripe subscription with the corresponding price_id
3. WHEN a subscription payment succeeds, THE System SHALL update the client's status to "Active"
4. WHEN a subscription payment fails, THE System SHALL update the client's status to "Payment Failed" and send a notification email
5. WHEN a subscription is canceled, THE System SHALL update the client's status to "Canceled" and revoke portal access
6. THE System SHALL listen for Stripe webhook events (invoice.payment_succeeded, invoice.payment_failed, customer.subscription.deleted)
7. WHEN a Stripe webhook is received, THE System SHALL verify the webhook signature before processing
8. THE System SHALL store Stripe customer_id and subscription_id in the clients table
9. WHEN an admin upgrades a client's tier, THE System SHALL update the Stripe subscription to the new price_id
10. THE System SHALL allow clients to view their billing history and download invoices from Stripe

### Requirement 13: API Endpoints for Frontend Integration

**User Story:** As a frontend developer, I want well-documented REST API endpoints, so that I can connect the existing UI components to the backend services.

#### Acceptance Criteria

1. THE System SHALL provide a POST /api/auth/login endpoint that accepts email and password and returns a session token
2. THE System SHALL provide a POST /api/auth/logout endpoint that invalidates the current session
3. THE System SHALL provide a POST /api/auth/reset-password endpoint that sends a password reset email
4. THE System SHALL provide a GET /api/clients/me endpoint that returns the authenticated client's profile
5. THE System SHALL provide a GET /api/clients endpoint (admin only) that returns all clients
6. THE System SHALL provide a POST /api/clients endpoint (admin only) that creates a new client
7. THE System SHALL provide a PATCH /api/clients/:id endpoint (admin only) that updates a client's information
8. THE System SHALL provide a GET /api/documents endpoint that returns documents for the authenticated client
9. THE System SHALL provide a POST /api/documents/upload endpoint that uploads a document to S3
10. THE System SHALL provide a GET /api/documents/:id/download endpoint that returns a pre-signed S3 URL
11. THE System SHALL provide a DELETE /api/documents/:id endpoint that deletes a document
12. THE System SHALL provide a GET /api/tickets endpoint that returns support tickets for the authenticated client
13. THE System SHALL provide a POST /api/tickets endpoint that creates a new support ticket
14. THE System SHALL provide a POST /api/tickets/:id/messages endpoint that adds a message to a ticket
15. THE System SHALL provide a GET /api/reports/eld endpoint that returns ELD reports for the authenticated client
16. THE System SHALL provide a GET /api/reports/ifta endpoint that returns IFTA records for the authenticated client
17. THE System SHALL provide a GET /api/admin/dashboard endpoint (admin only) that returns dashboard KPIs
18. THE System SHALL provide a GET /api/admin/audit-logs endpoint (admin only) that returns audit log entries
19. THE System SHALL return appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 500)
20. THE System SHALL return error responses in a consistent JSON format with error message and error code

### Requirement 14: Data Validation and Error Handling

**User Story:** As a developer, I want comprehensive input validation and error handling, so that the system remains stable and provides clear feedback on invalid requests.

#### Acceptance Criteria

1. WHEN an API endpoint receives invalid input, THE System SHALL return a 400 Bad Request error with validation details
2. WHEN an API endpoint receives a request without authentication, THE System SHALL return a 401 Unauthorized error
3. WHEN an API endpoint receives a request without proper authorization, THE System SHALL return a 403 Forbidden error
4. WHEN an API endpoint cannot find a requested resource, THE System SHALL return a 404 Not Found error
5. WHEN an API endpoint encounters an unexpected error, THE System SHALL return a 500 Internal Server Error and log the error details
6. THE System SHALL validate email format using regex pattern before creating users or clients
7. THE System SHALL validate client_id format (alphanumeric, 6-20 characters) before creating clients
8. THE System SHALL validate file types against allowed extensions before accepting document uploads
9. THE System SHALL validate date formats (ISO 8601) for all date fields
10. THE System SHALL sanitize all user input to prevent SQL injection and XSS attacks
11. WHEN a database constraint violation occurs, THE System SHALL return a user-friendly error message
12. THE System SHALL log all errors with stack traces to a centralized logging service

### Requirement 15: Performance and Scalability

**User Story:** As a system administrator, I want the backend to handle concurrent requests efficiently, so that the portal remains responsive as the client base grows.

#### Acceptance Criteria

1. WHEN multiple clients access the portal simultaneously, THE System SHALL handle at least 100 concurrent requests without performance degradation
2. WHEN a client queries their dashboard, THE System SHALL return results within 500ms
3. WHEN a document is uploaded, THE System SHALL process the upload within 2 seconds for files up to 10MB
4. THE System SHALL use database connection pooling to efficiently manage database connections
5. THE System SHALL implement caching for frequently accessed data (service tier configurations, tax rates)
6. WHEN ELD data sync runs, THE System SHALL process data in batches to avoid memory issues
7. THE System SHALL use database indexes on all foreign key columns and frequently queried fields
8. WHEN generating reports, THE System SHALL use streaming responses for large datasets
9. THE System SHALL implement rate limiting on API endpoints (100 requests per minute per client)
10. THE System SHALL use CDN for serving static assets and document downloads
