-- ============================================================================
-- Create Admin User for Ghost Rider Apex Operations
-- ============================================================================
-- Run this script in your Supabase SQL Editor to create an admin user
-- ============================================================================

-- OPTION 1: Create a new admin user with Supabase Auth
-- Note: This requires using the Supabase Dashboard or API
-- Go to: Authentication > Users > Add User
-- Then run the following to set admin role:

-- Replace 'admin@ghostrider.com' with your admin email
UPDATE auth.users
SET raw_user_metadata = jsonb_set(
  COALESCE(raw_user_metadata, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@ghostrider.com';

-- Verify the admin user was created
SELECT 
  id,
  email,
  raw_user_metadata->>'role' as role,
  created_at
FROM auth.users
WHERE raw_user_metadata->>'role' = 'admin';

-- ============================================================================
-- OPTION 2: Convert an existing user to admin
-- ============================================================================

-- Replace 'existing-user@example.com' with the email of the user you want to make admin
UPDATE auth.users
SET raw_user_metadata = jsonb_set(
  COALESCE(raw_user_metadata, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'existing-user@example.com';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- List all admin users
SELECT 
  id,
  email,
  raw_user_metadata->>'role' as role,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE raw_user_metadata->>'role' = 'admin'
ORDER BY created_at DESC;

-- ============================================================================
-- NOTES
-- ============================================================================
-- 
-- Default Admin Credentials (if you create manually in Dashboard):
--   Email: admin@ghostrider.com
--   Password: Admin123! (or whatever you set)
--
-- Admin Portal URL:
--   http://localhost:3000/admin/login
--
-- Important:
--   - Admin users do NOT need a record in the 'clients' table
--   - Only users with role='admin' can access the admin portal
--   - The role is stored in user_metadata and added to JWT claims
--
-- ============================================================================
