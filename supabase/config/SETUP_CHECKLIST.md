# Supabase Auth Setup Checklist

Use this checklist to ensure all authentication configuration steps are completed correctly.

## Pre-Setup

- [ ] Supabase project created at [app.supabase.com](https://app.supabase.com)
- [ ] Project URL and keys added to `.env` file
- [ ] Database migrations applied (`001_initial_schema.sql`)

## Database Configuration

- [ ] Run migration `002_auth_jwt_claims.sql` in SQL Editor
- [ ] Verify `custom_access_token_hook` function exists:
  ```sql
  SELECT proname FROM pg_proc WHERE proname = 'custom_access_token_hook';
  ```
- [ ] Verify RLS helper functions updated:
  ```sql
  SELECT proname FROM pg_proc WHERE proname IN ('is_admin', 'get_user_client_id');
  ```

## Supabase Dashboard Configuration

### Authentication Settings

Navigate to **Authentication** → **Settings**

#### JWT Settings
- [ ] JWT expiry: `86400` seconds (24 hours)
- [ ] JWT algorithm: `HS256` (default)

#### Session Settings
- [ ] Session timeout: `86400` seconds (24 hours)
- [ ] Inactivity timeout: `86400` seconds (24 hours)
- [ ] Refresh token rotation: **Enabled**
- [ ] Refresh token reuse interval: `10` seconds

#### Password Requirements
- [ ] Minimum password length: `8` characters
- [ ] Require uppercase: **Enabled**
- [ ] Require lowercase: **Enabled**
- [ ] Require numbers: **Enabled**
- [ ] Require special characters: **Disabled** (optional)

### Email Provider

Navigate to **Authentication** → **Providers**

- [ ] Email provider: **Enabled**
- [ ] Enable email signup: **Enabled**
- [ ] Confirm email: **Enabled** (production) / **Disabled** (development)
- [ ] Secure email change: **Enabled**

### Custom JWT Claims Hook

Navigate to **Authentication** → **Hooks**

- [ ] Custom Access Token Hook: **Enabled**
- [ ] Hook type: `pg-functions`
- [ ] Function: `public.custom_access_token_hook`

## Testing & Verification

### Create Test Admin User

- [ ] Create admin user in Supabase Dashboard or via API
- [ ] Set admin role:
  ```sql
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
  )
  WHERE email = 'admin@ghostapex.com';
  ```
- [ ] Verify admin can access admin-only endpoints

### Create Test Client User

- [ ] Create client user in Supabase Dashboard or via API
- [ ] Set client role (optional):
  ```sql
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"client"'
  )
  WHERE email = 'client@example.com';
  ```
- [ ] Create client record:
  ```sql
  INSERT INTO public.clients (user_id, email, company_name, client_id, tier)
  VALUES (
    (SELECT id FROM auth.users WHERE email = 'client@example.com'),
    'client@example.com',
    'Test Company',
    'TEST123',
    'wingman'
  );
  ```
- [ ] Verify client can only access their own data

### Verify JWT Claims

- [ ] Login as test client user
- [ ] Decode JWT token (use [jwt.io](https://jwt.io))
- [ ] Verify token contains:
  - [ ] `role` claim (should be `"client"`)
  - [ ] `client_id` claim (should be UUID)
  - [ ] `exp` claim (should be ~24 hours from `iat`)

### Test Authentication Flow

- [ ] Test login with valid credentials (should succeed)
- [ ] Test login with invalid credentials (should fail)
- [ ] Test password reset flow
- [ ] Test session expiration (after 24 hours)
- [ ] Test logout (session should be invalidated)

### Test Password Requirements

- [ ] Test password with < 8 characters (should fail)
- [ ] Test password without uppercase (should fail)
- [ ] Test password without lowercase (should fail)
- [ ] Test password without number (should fail)
- [ ] Test valid password (should succeed)

### Test RLS Policies

- [ ] Client can read their own data
- [ ] Client cannot read other clients' data
- [ ] Admin can read all data
- [ ] Unauthenticated requests are denied

## Production Deployment

- [ ] Enable email confirmation
- [ ] Configure custom email templates (optional)
- [ ] Set up custom SMTP server (optional)
- [ ] Configure redirect URLs for password reset
- [ ] Set up monitoring for auth errors
- [ ] Document admin user creation process
- [ ] Document client onboarding process

## Environment Variables

Verify these are set in production:

- [ ] `VITE_SUPABASE_URL` - Your Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (backend only)

## Documentation

- [ ] Review [Authentication Setup Guide](../../docs/AUTHENTICATION_SETUP.md)
- [ ] Review [Supabase Config README](./README.md)
- [ ] Share documentation with team
- [ ] Document any custom configurations

## Common Issues Checklist

If authentication is not working, check:

- [ ] JWT expiry is set to 86400 seconds
- [ ] Custom JWT claims hook is enabled
- [ ] Hook function exists in database
- [ ] User has correct role in metadata
- [ ] Client record exists for client users
- [ ] RLS policies are enabled on tables
- [ ] Environment variables are correct
- [ ] Supabase client is initialized correctly

## Sign-Off

- [ ] All checklist items completed
- [ ] Test users created and verified
- [ ] JWT claims verified
- [ ] RLS policies tested
- [ ] Documentation reviewed
- [ ] Team notified of completion

**Completed by:** ___________________  
**Date:** ___________________  
**Verified by:** ___________________  
**Date:** ___________________

