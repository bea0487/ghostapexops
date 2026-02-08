# Database Migrations

## Overview

This directory contains SQL migration files for the Ghost Apex Operations Portal database schema.

## Migration Files

### 001_initial_schema.sql

Creates the complete database schema including:

**Tables Created:**
- `clients` - Client organizations with subscription tiers
- `documents` - Document storage metadata with S3 references
- `support_tickets` - Support ticket system
- `ticket_messages` - Threaded messages within tickets
- `eld_reports` - Weekly ELD violation reports
- `ifta_records` - Quarterly IFTA tax calculations
- `driver_files` - Driver qualification files
- `csa_scores` - CSA safety scores tracking
- `dataq_disputes` - DataQ violation dispute tracking
- `load_schedules` - Load scheduling and dispatch
- `broker_packets` - Broker documentation
- `weekly_revenue_reports` - Weekly revenue tracking
- `dot_audits` - DOT audit findings
- `audit_logs` - Immutable audit trail (non-deletable)
- `ifta_tax_rates` - IFTA tax rates configuration

**Features:**
- ✅ All tables with proper constraints and foreign keys
- ✅ Comprehensive indexes on frequently queried fields
- ✅ Row-Level Security (RLS) policies for multi-tenant isolation
- ✅ Helper functions for RLS (`is_admin()`, `get_user_client_id()`)
- ✅ Automatic `updated_at` timestamp triggers
- ✅ Seed data for IFTA tax rates (all US states and Canadian provinces)
- ✅ Audit log deletion prevention

**RLS Policy Summary:**
- **Clients**: Can only read their own record; admins have full access
- **Documents**: Clients can manage their own; admins have full access
- **Support Tickets**: Clients can manage their own; admins have full access
- **Ticket Messages**: Access based on ticket ownership
- **Reports** (ELD, IFTA, CSA, etc.): Clients can read their own; admins can manage all
- **Audit Logs**: Admin-only access; deletion prevented at database level

## Running Migrations

### Using Supabase CLI

```bash
# Apply all pending migrations
supabase db push

# Reset database and reapply all migrations
supabase db reset
```

### Manual Application

If you need to apply migrations manually:

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# Run the migration
\i supabase/migrations/001_initial_schema.sql
```

## Verification

After running the migration, verify:

1. **All tables exist:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

2. **RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

3. **Indexes are created:**
   ```sql
   SELECT tablename, indexname 
   FROM pg_indexes 
   WHERE schemaname = 'public' 
   ORDER BY tablename, indexname;
   ```

4. **IFTA tax rates are seeded:**
   ```sql
   SELECT COUNT(*) FROM ifta_tax_rates;
   -- Should return 63 (50 US states + DC + 12 Canadian provinces/territories)
   ```

## Multi-Tenant Architecture

The schema implements a **shared database, shared schema** multi-tenant model:

- Each client has a unique `client_id` in the `clients` table
- All data tables include a `client_id` foreign key
- RLS policies automatically filter queries by `client_id`
- Admin users bypass RLS filters (checked via `is_admin()` function)
- JWT tokens include user role and client_id for RLS enforcement

## Security Features

1. **Row-Level Security**: All tables have RLS enabled with appropriate policies
2. **Audit Trail**: All admin actions logged in immutable `audit_logs` table
3. **Cascade Deletes**: Client deletion cascades to all related data
4. **Check Constraints**: Enum-like constraints on status fields
5. **Unique Constraints**: Prevent duplicate client_ids and emails

## Notes

- The `auth.users` table is managed by Supabase Auth
- User metadata should include `role` field ('admin' or 'client')
- Client records link to auth.users via `user_id` foreign key
- All timestamps use `TIMESTAMPTZ` for timezone awareness
- JSONB fields used for flexible data storage (metadata, violation_data, etc.)
