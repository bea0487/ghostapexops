-- Ghost Apex Operations Portal - Initial Database Schema
-- This migration creates all tables, constraints, indexes, and RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Clients table (extends Supabase auth.users)
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  company_name TEXT,
  client_id TEXT UNIQUE NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('wingman', 'guardian', 'apex_command', 'virtual_dispatcher', 'dot_readiness_audit', 'back_office_command')),
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Payment Failed', 'Canceled')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  eld_provider TEXT CHECK (eld_provider IN ('samsara', 'motive')),
  eld_api_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  s3_key TEXT NOT NULL,
  s3_bucket TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Support tickets table
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed')),
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Ticket messages table
CREATE TABLE ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  sender_type TEXT NOT NULL CHECK (sender_type IN ('admin', 'client')),
  message TEXT NOT NULL,
  attachment_s3_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ELD reports table
CREATE TABLE eld_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  violations INTEGER DEFAULT 0,
  violation_data JSONB DEFAULT '[]'::jsonb,
  corrective_actions TEXT,
  report_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- IFTA records table
CREATE TABLE ifta_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  quarter INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  year INTEGER NOT NULL,
  total_miles NUMERIC(10, 2) NOT NULL,
  taxable_miles NUMERIC(10, 2) NOT NULL,
  fuel_gallons NUMERIC(10, 2) NOT NULL,
  tax_owed NUMERIC(10, 2) NOT NULL,
  jurisdiction_breakdown JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Approved', 'Filed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, quarter, year)
);

-- Driver files table
CREATE TABLE driver_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  driver_name TEXT NOT NULL,
  license_number TEXT NOT NULL,
  expiration_date DATE,
  file_type TEXT NOT NULL CHECK (file_type IN ('license', 'medical_card', 'application', 'mvr', 'clearinghouse')),
  s3_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CSA scores table
CREATE TABLE csa_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  score_date DATE NOT NULL,
  unsafe_driving NUMERIC(5, 2),
  hos_compliance NUMERIC(5, 2),
  vehicle_maintenance NUMERIC(5, 2),
  controlled_substances NUMERIC(5, 2),
  driver_fitness NUMERIC(5, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DataQ disputes table
CREATE TABLE dataq_disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  violation_date DATE NOT NULL,
  dispute_reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Submitted', 'Under Review', 'Approved', 'Denied')),
  submitted_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  outcome TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Load schedules table
CREATE TABLE load_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  load_number TEXT NOT NULL,
  pickup_date TIMESTAMPTZ NOT NULL,
  pickup_location TEXT NOT NULL,
  delivery_date TIMESTAMPTZ NOT NULL,
  delivery_location TEXT NOT NULL,
  driver_assigned TEXT,
  status TEXT NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'In Transit', 'Delivered', 'Canceled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Broker packets table
CREATE TABLE broker_packets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  broker_name TEXT NOT NULL,
  rate_confirmation_s3_key TEXT,
  bol_s3_key TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected'))
);

-- Weekly revenue reports table
CREATE TABLE weekly_revenue_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  total_revenue NUMERIC(10, 2) NOT NULL,
  total_miles NUMERIC(10, 2) NOT NULL,
  revenue_per_mile NUMERIC(5, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, week_start)
);

-- DOT audits table
CREATE TABLE dot_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  audit_date DATE NOT NULL,
  audit_type TEXT NOT NULL CHECK (audit_type IN ('Compliance Review', 'New Entrant Audit', 'Focused Audit')),
  findings JSONB DEFAULT '[]'::jsonb,
  recommendations TEXT,
  status TEXT NOT NULL DEFAULT 'In Progress' CHECK (status IN ('Scheduled', 'In Progress', 'Completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs table (non-deletable)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id UUID,
  changes JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- IFTA tax rates configuration table
CREATE TABLE ifta_tax_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jurisdiction TEXT NOT NULL,
  tax_rate NUMERIC(5, 4) NOT NULL,
  effective_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(jurisdiction, effective_date)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Clients indexes
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_client_id ON clients(client_id);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_created_at ON clients(created_at);

-- Documents indexes
CREATE INDEX idx_documents_client_id ON documents(client_id);
CREATE INDEX idx_documents_uploaded_at ON documents(uploaded_at);

-- Support tickets indexes
CREATE INDEX idx_support_tickets_client_id ON support_tickets(client_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at);

-- Ticket messages indexes
CREATE INDEX idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX idx_ticket_messages_created_at ON ticket_messages(created_at);

-- ELD reports indexes
CREATE INDEX idx_eld_reports_client_id ON eld_reports(client_id);
CREATE INDEX idx_eld_reports_week_start ON eld_reports(week_start);

-- IFTA records indexes
CREATE INDEX idx_ifta_records_client_id ON ifta_records(client_id);
CREATE INDEX idx_ifta_records_year_quarter ON ifta_records(year, quarter);

-- Driver files indexes
CREATE INDEX idx_driver_files_client_id ON driver_files(client_id);
CREATE INDEX idx_driver_files_expiration_date ON driver_files(expiration_date);

-- CSA scores indexes
CREATE INDEX idx_csa_scores_client_id ON csa_scores(client_id);
CREATE INDEX idx_csa_scores_score_date ON csa_scores(score_date);

-- DataQ disputes indexes
CREATE INDEX idx_dataq_disputes_client_id ON dataq_disputes(client_id);
CREATE INDEX idx_dataq_disputes_status ON dataq_disputes(status);

-- Load schedules indexes
CREATE INDEX idx_load_schedules_client_id ON load_schedules(client_id);
CREATE INDEX idx_load_schedules_pickup_date ON load_schedules(pickup_date);

-- Broker packets indexes
CREATE INDEX idx_broker_packets_client_id ON broker_packets(client_id);
CREATE INDEX idx_broker_packets_uploaded_at ON broker_packets(uploaded_at);

-- Weekly revenue reports indexes
CREATE INDEX idx_weekly_revenue_reports_client_id ON weekly_revenue_reports(client_id);
CREATE INDEX idx_weekly_revenue_reports_week_start ON weekly_revenue_reports(week_start);

-- DOT audits indexes
CREATE INDEX idx_dot_audits_client_id ON dot_audits(client_id);
CREATE INDEX idx_dot_audits_audit_date ON dot_audits(audit_date);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_action_type ON audit_logs(action_type);

-- IFTA tax rates indexes
CREATE INDEX idx_ifta_tax_rates_jurisdiction ON ifta_tax_rates(jurisdiction);

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE eld_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ifta_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE csa_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE dataq_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_packets ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_revenue_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE dot_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role')::TEXT = 'admin',
      false
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get client_id for current user
CREATE OR REPLACE FUNCTION get_user_client_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id FROM clients WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CLIENTS TABLE RLS POLICIES
-- ============================================================================

-- Clients can read their own record
CREATE POLICY "clients_select_own" ON clients
  FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

-- Admins can insert clients
CREATE POLICY "clients_insert_admin" ON clients
  FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update clients
CREATE POLICY "clients_update_admin" ON clients
  FOR UPDATE
  USING (is_admin());

-- Admins can delete clients
CREATE POLICY "clients_delete_admin" ON clients
  FOR DELETE
  USING (is_admin());

-- ============================================================================
-- DOCUMENTS TABLE RLS POLICIES
-- ============================================================================

-- Clients can read their own documents, admins can read all
CREATE POLICY "documents_select" ON documents
  FOR SELECT
  USING (client_id = get_user_client_id() OR is_admin());

-- Clients and admins can insert documents
CREATE POLICY "documents_insert" ON documents
  FOR INSERT
  WITH CHECK (client_id = get_user_client_id() OR is_admin());

-- Clients can update their own documents, admins can update all
CREATE POLICY "documents_update" ON documents
  FOR UPDATE
  USING (client_id = get_user_client_id() OR is_admin());

-- Clients can delete their own documents, admins can delete all
CREATE POLICY "documents_delete" ON documents
  FOR DELETE
  USING (client_id = get_user_client_id() OR is_admin());

-- ============================================================================
-- SUPPORT TICKETS TABLE RLS POLICIES
-- ============================================================================

-- Clients can read their own tickets, admins can read all
CREATE POLICY "support_tickets_select" ON support_tickets
  FOR SELECT
  USING (client_id = get_user_client_id() OR is_admin());

-- Clients and admins can insert tickets
CREATE POLICY "support_tickets_insert" ON support_tickets
  FOR INSERT
  WITH CHECK (client_id = get_user_client_id() OR is_admin());

-- Clients can update their own tickets, admins can update all
CREATE POLICY "support_tickets_update" ON support_tickets
  FOR UPDATE
  USING (client_id = get_user_client_id() OR is_admin());

-- ============================================================================
-- TICKET MESSAGES TABLE RLS POLICIES
-- ============================================================================

-- Users can read messages for tickets they have access to
CREATE POLICY "ticket_messages_select" ON ticket_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_messages.ticket_id
      AND (support_tickets.client_id = get_user_client_id() OR is_admin())
    )
  );

-- Users can insert messages for tickets they have access to
CREATE POLICY "ticket_messages_insert" ON ticket_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_messages.ticket_id
      AND (support_tickets.client_id = get_user_client_id() OR is_admin())
    )
  );

-- ============================================================================
-- ELD REPORTS TABLE RLS POLICIES
-- ============================================================================

-- Clients can read their own reports, admins can read all
CREATE POLICY "eld_reports_select" ON eld_reports
  FOR SELECT
  USING (client_id = get_user_client_id() OR is_admin());

-- Admins can insert reports
CREATE POLICY "eld_reports_insert" ON eld_reports
  FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update reports
CREATE POLICY "eld_reports_update" ON eld_reports
  FOR UPDATE
  USING (is_admin());

-- ============================================================================
-- IFTA RECORDS TABLE RLS POLICIES
-- ============================================================================

-- Clients can read their own records, admins can read all
CREATE POLICY "ifta_records_select" ON ifta_records
  FOR SELECT
  USING (client_id = get_user_client_id() OR is_admin());

-- Admins can insert records
CREATE POLICY "ifta_records_insert" ON ifta_records
  FOR INSERT
  WITH CHECK (is_admin());

-- Clients can update their own records (for approval), admins can update all
CREATE POLICY "ifta_records_update" ON ifta_records
  FOR UPDATE
  USING (client_id = get_user_client_id() OR is_admin());

-- ============================================================================
-- DRIVER FILES TABLE RLS POLICIES
-- ============================================================================

-- Clients can read their own files, admins can read all
CREATE POLICY "driver_files_select" ON driver_files
  FOR SELECT
  USING (client_id = get_user_client_id() OR is_admin());

-- Clients and admins can insert files
CREATE POLICY "driver_files_insert" ON driver_files
  FOR INSERT
  WITH CHECK (client_id = get_user_client_id() OR is_admin());

-- Clients can update their own files, admins can update all
CREATE POLICY "driver_files_update" ON driver_files
  FOR UPDATE
  USING (client_id = get_user_client_id() OR is_admin());

-- Clients can delete their own files, admins can delete all
CREATE POLICY "driver_files_delete" ON driver_files
  FOR DELETE
  USING (client_id = get_user_client_id() OR is_admin());

-- ============================================================================
-- CSA SCORES TABLE RLS POLICIES
-- ============================================================================

-- Clients can read their own scores, admins can read all
CREATE POLICY "csa_scores_select" ON csa_scores
  FOR SELECT
  USING (client_id = get_user_client_id() OR is_admin());

-- Admins can insert scores
CREATE POLICY "csa_scores_insert" ON csa_scores
  FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update scores
CREATE POLICY "csa_scores_update" ON csa_scores
  FOR UPDATE
  USING (is_admin());

-- ============================================================================
-- DATAQ DISPUTES TABLE RLS POLICIES
-- ============================================================================

-- Clients can read their own disputes, admins can read all
CREATE POLICY "dataq_disputes_select" ON dataq_disputes
  FOR SELECT
  USING (client_id = get_user_client_id() OR is_admin());

-- Clients and admins can insert disputes
CREATE POLICY "dataq_disputes_insert" ON dataq_disputes
  FOR INSERT
  WITH CHECK (client_id = get_user_client_id() OR is_admin());

-- Clients can update their own disputes, admins can update all
CREATE POLICY "dataq_disputes_update" ON dataq_disputes
  FOR UPDATE
  USING (client_id = get_user_client_id() OR is_admin());

-- ============================================================================
-- LOAD SCHEDULES TABLE RLS POLICIES
-- ============================================================================

-- Clients can read their own schedules, admins can read all
CREATE POLICY "load_schedules_select" ON load_schedules
  FOR SELECT
  USING (client_id = get_user_client_id() OR is_admin());

-- Clients and admins can insert schedules
CREATE POLICY "load_schedules_insert" ON load_schedules
  FOR INSERT
  WITH CHECK (client_id = get_user_client_id() OR is_admin());

-- Clients can update their own schedules, admins can update all
CREATE POLICY "load_schedules_update" ON load_schedules
  FOR UPDATE
  USING (client_id = get_user_client_id() OR is_admin());

-- Clients can delete their own schedules, admins can delete all
CREATE POLICY "load_schedules_delete" ON load_schedules
  FOR DELETE
  USING (client_id = get_user_client_id() OR is_admin());

-- ============================================================================
-- BROKER PACKETS TABLE RLS POLICIES
-- ============================================================================

-- Clients can read their own packets, admins can read all
CREATE POLICY "broker_packets_select" ON broker_packets
  FOR SELECT
  USING (client_id = get_user_client_id() OR is_admin());

-- Clients and admins can insert packets
CREATE POLICY "broker_packets_insert" ON broker_packets
  FOR INSERT
  WITH CHECK (client_id = get_user_client_id() OR is_admin());

-- Clients can update their own packets, admins can update all
CREATE POLICY "broker_packets_update" ON broker_packets
  FOR UPDATE
  USING (client_id = get_user_client_id() OR is_admin());

-- ============================================================================
-- WEEKLY REVENUE REPORTS TABLE RLS POLICIES
-- ============================================================================

-- Clients can read their own reports, admins can read all
CREATE POLICY "weekly_revenue_reports_select" ON weekly_revenue_reports
  FOR SELECT
  USING (client_id = get_user_client_id() OR is_admin());

-- Admins can insert reports
CREATE POLICY "weekly_revenue_reports_insert" ON weekly_revenue_reports
  FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update reports
CREATE POLICY "weekly_revenue_reports_update" ON weekly_revenue_reports
  FOR UPDATE
  USING (is_admin());

-- ============================================================================
-- DOT AUDITS TABLE RLS POLICIES
-- ============================================================================

-- Clients can read their own audits, admins can read all
CREATE POLICY "dot_audits_select" ON dot_audits
  FOR SELECT
  USING (client_id = get_user_client_id() OR is_admin());

-- Admins can insert audits
CREATE POLICY "dot_audits_insert" ON dot_audits
  FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update audits
CREATE POLICY "dot_audits_update" ON dot_audits
  FOR UPDATE
  USING (is_admin());

-- ============================================================================
-- AUDIT LOGS TABLE RLS POLICIES
-- ============================================================================

-- Only admins can read audit logs
CREATE POLICY "audit_logs_select" ON audit_logs
  FOR SELECT
  USING (is_admin());

-- Only admins can insert audit logs
CREATE POLICY "audit_logs_insert" ON audit_logs
  FOR INSERT
  WITH CHECK (is_admin());

-- Prevent deletion of audit logs (no DELETE policy)
-- This ensures audit logs are immutable

-- ============================================================================
-- DATABASE FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Seed IFTA tax rates (2024 rates - sample data)
INSERT INTO ifta_tax_rates (jurisdiction, tax_rate, effective_date) VALUES
  ('AL', 0.2900, '2024-01-01'),
  ('AK', 0.0895, '2024-01-01'),
  ('AZ', 0.1900, '2024-01-01'),
  ('AR', 0.2450, '2024-01-01'),
  ('CA', 0.5390, '2024-01-01'),
  ('CO', 0.2200, '2024-01-01'),
  ('CT', 0.4940, '2024-01-01'),
  ('DE', 0.2300, '2024-01-01'),
  ('FL', 0.3590, '2024-01-01'),
  ('GA', 0.3290, '2024-01-01'),
  ('ID', 0.3300, '2024-01-01'),
  ('IL', 0.4700, '2024-01-01'),
  ('IN', 0.5400, '2024-01-01'),
  ('IA', 0.3250, '2024-01-01'),
  ('KS', 0.2600, '2024-01-01'),
  ('KY', 0.2640, '2024-01-01'),
  ('LA', 0.2000, '2024-01-01'),
  ('ME', 0.3140, '2024-01-01'),
  ('MD', 0.3750, '2024-01-01'),
  ('MA', 0.2400, '2024-01-01'),
  ('MI', 0.2780, '2024-01-01'),
  ('MN', 0.2860, '2024-01-01'),
  ('MS', 0.1880, '2024-01-01'),
  ('MO', 0.1750, '2024-01-01'),
  ('MT', 0.3375, '2024-01-01'),
  ('NE', 0.2910, '2024-01-01'),
  ('NV', 0.2750, '2024-01-01'),
  ('NH', 0.2380, '2024-01-01'),
  ('NJ', 0.4950, '2024-01-01'),
  ('NM', 0.1875, '2024-01-01'),
  ('NY', 0.4525, '2024-01-01'),
  ('NC', 0.3800, '2024-01-01'),
  ('ND', 0.2300, '2024-01-01'),
  ('OH', 0.4700, '2024-01-01'),
  ('OK', 0.1900, '2024-01-01'),
  ('OR', 0.3800, '2024-01-01'),
  ('PA', 0.7770, '2024-01-01'),
  ('RI', 0.3500, '2024-01-01'),
  ('SC', 0.2800, '2024-01-01'),
  ('SD', 0.3000, '2024-01-01'),
  ('TN', 0.2800, '2024-01-01'),
  ('TX', 0.2000, '2024-01-01'),
  ('UT', 0.3650, '2024-01-01'),
  ('VT', 0.3100, '2024-01-01'),
  ('VA', 0.2720, '2024-01-01'),
  ('WA', 0.5190, '2024-01-01'),
  ('WV', 0.3570, '2024-01-01'),
  ('WI', 0.3290, '2024-01-01'),
  ('WY', 0.2400, '2024-01-01'),
  ('DC', 0.2390, '2024-01-01'),
  ('AB', 0.0900, '2024-01-01'),
  ('BC', 0.1500, '2024-01-01'),
  ('MB', 0.1100, '2024-01-01'),
  ('NB', 0.1530, '2024-01-01'),
  ('NL', 0.1650, '2024-01-01'),
  ('NT', 0.1060, '2024-01-01'),
  ('NS', 0.1540, '2024-01-01'),
  ('NU', 0.1060, '2024-01-01'),
  ('ON', 0.1430, '2024-01-01'),
  ('PE', 0.1750, '2024-01-01'),
  ('QC', 0.2020, '2024-01-01'),
  ('SK', 0.1500, '2024-01-01'),
  ('YT', 0.0620, '2024-01-01')
ON CONFLICT (jurisdiction, effective_date) DO NOTHING;

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

-- Revoke DELETE permission on audit_logs to prevent deletion
REVOKE DELETE ON audit_logs FROM PUBLIC;
REVOKE DELETE ON audit_logs FROM authenticated;
REVOKE DELETE ON audit_logs FROM anon;

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE clients IS 'Client organizations with subscription tiers and ELD integration settings';
COMMENT ON TABLE documents IS 'Document storage metadata with S3 references';
COMMENT ON TABLE support_tickets IS 'Support ticket system for client-admin communication';
COMMENT ON TABLE ticket_messages IS 'Threaded messages within support tickets';
COMMENT ON TABLE eld_reports IS 'Weekly ELD violation reports from integrated ELD providers';
COMMENT ON TABLE ifta_records IS 'Quarterly IFTA tax calculations and filings';
COMMENT ON TABLE driver_files IS 'Driver qualification files and compliance documents';
COMMENT ON TABLE csa_scores IS 'CSA safety scores tracking over time';
COMMENT ON TABLE dataq_disputes IS 'DataQ violation dispute tracking';
COMMENT ON TABLE load_schedules IS 'Load scheduling and dispatch board';
COMMENT ON TABLE broker_packets IS 'Broker documentation (rate confirmations, BOLs)';
COMMENT ON TABLE weekly_revenue_reports IS 'Weekly revenue and mileage tracking';
COMMENT ON TABLE dot_audits IS 'DOT audit findings and recommendations';
COMMENT ON TABLE audit_logs IS 'Immutable audit trail of all admin actions';
COMMENT ON TABLE ifta_tax_rates IS 'IFTA tax rates by jurisdiction and effective date';

COMMENT ON FUNCTION is_admin() IS 'Helper function to check if current user has admin role';
COMMENT ON FUNCTION get_user_client_id() IS 'Helper function to get client_id for current authenticated user';
COMMENT ON FUNCTION update_updated_at_column() IS 'Trigger function to automatically update updated_at timestamp';
