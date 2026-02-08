# Supabase Auth Configuration Guide

This directory contains configuration files for setting up Supabase Authentication for the Ghost Apex Operations Portal backend.

## Overview

The authentication system is configured to support:
- **Email/password authentication** as the primary authentication method
- **JWT tokens with custom claims** (client_id, role) for authorization
- **24-hour session timeout** for security
- **Password complexity requirements** (minimum 8 characters, uppercase, lowercase, number)

## Files in this Directory

### 1. `auth-config.sql`
SQL script that creates the custom JWT claims function. This function adds `role` and `client_id` to JWT tokens.

### 2. `config.toml`
Supabase CLI configuration file for local development. Contains all auth settings including JWT expiry, password requirements, and hook configuration.

## Setup Instructions

### For Production (Supabase Dashboard)

Follow these steps to configure authentication in your Supabase project:

#### Step 1: Configure JWT Settings

1. Log in to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **Settings**
4. Under **JWT Settings**, configure:
   - **JWT expiry**: `86400` (24 hours in seconds)
   - Keep the default JWT algorithm (HS256)

#### Step 2: Configure Password Requirements

1. In the same **Authentication** → **Settings** page
2. Scroll to **Password Requirements**
3. Configure:
   - **Minimum password length**: `8`
   - **Require uppercase**: ✓ Enabled
   - **Require lowercase**: ✓ Enabled
   - **Require numbers**: ✓ Enabled
   - **Require special characters**: ✗ Disabled (optional)

#### Step 3: Configure Session Settings

1. In **Authentication** → **Settings**
2. Under **Session Settings**, configure:
   - **Session timeout**: `86400` seconds (24 hours)
   - **Inactivity timeout**: `86400` seconds (24 hours)
   - **Refresh token rotation**: ✓ Enabled

#### Step 4: Enable Email Authentication

1. Navigate to **Authentication** → **Providers**
2. Ensure **Email** provider is enabled
3. Configure email settings:
   - **Enable email signup**: ✓ Enabled
   - **Confirm email**: ✓ Enabled (recommended for production)
   - **Secure email change**: ✓ Enabled

#### Step 5: Set Up Custom JWT Claims Hook

1. Navigate to **SQL Editor** in your Supabase Dashboard
2. Create a new query
3. Copy and paste the contents of `auth-config.sql`
4. Run the query to create the `custom_access_token_hook` function
5. Navigate to **Authentication** → **Hooks**
6. Under **Custom Access Token Hook**, configure:
   - **Enabled**: ✓ Yes
   - **Hook Type**: `pg-functions`
   - **Function**: `public.custom_access_token_hook`

#### Step 6: Verify Configuration

1. Create a test user through the Supabase Dashboard or your application
2. Set the user's metadata to include a role:
   ```sql
   UPDATE auth.users
   SET raw_user_meta_data = jsonb_set(
     COALESCE(raw_user_meta_data, '{}'::jsonb),
     '{role}',
     '"client"'
   )
   WHERE email = 'test@example.com';
   ```
3. Create a client record for the test user:
   ```sql
   INSERT INTO public.clients (user_id, email, company_name, client_id, tier)
   VALUES (
     (SELECT id FROM auth.users WHERE email = 'test@example.com'),
     'test@example.com',
     'Test Company',
     'TEST123',
     'wingman'
   );
   ```
4. Log in as the test user and inspect the JWT token
5. Verify the token contains `role` and `client_id` claims

### For Local Development (Supabase CLI)

If you're using Supabase CLI for local development:

#### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

#### Step 2: Initialize Supabase

```bash
supabase init
```

#### Step 3: Copy Configuration

Copy the `config.toml` file to your Supabase directory:

```bash
cp supabase/config/config.toml supabase/config.toml
```

#### Step 4: Start Supabase

```bash
supabase start
```

#### Step 5: Apply Auth Configuration

```bash
supabase db reset
```

This will apply all migrations including the custom JWT claims function.

## JWT Token Structure

After configuration, JWT tokens will have the following structure:

```json
{
  "aud": "authenticated",
  "exp": 1234567890,
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "client",
  "client_id": "client-uuid",
  "iat": 1234567890
}
```

### Custom Claims

- **`role`**: Either `"admin"` or `"client"` (defaults to `"client"`)
  - Set in the user's `raw_user_meta_data` field
  - Used by RLS policies to determine access level
  
- **`client_id`**: UUID of the client record (only for client users)
  - Automatically populated from the `clients` table
  - Used by RLS policies to filter data by tenant

## Setting User Roles

### For Admin Users

When creating an admin user, set their role in the metadata:

```sql
-- Create admin user (done through Supabase Auth)
-- Then update their metadata:
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@ghostapex.com';
```

Admin users do NOT need a record in the `clients` table.

### For Client Users

When creating a client user:

1. Create the user through Supabase Auth (or let them sign up)
2. Set their role to "client" (or leave default):
   ```sql
   UPDATE auth.users
   SET raw_user_meta_data = jsonb_set(
     COALESCE(raw_user_meta_data, '{}'::jsonb),
     '{role}',
     '"client"'
   )
   WHERE email = 'client@example.com';
   ```
3. Create a client record:
   ```sql
   INSERT INTO public.clients (user_id, email, company_name, client_id, tier)
   VALUES (
     (SELECT id FROM auth.users WHERE email = 'client@example.com'),
     'client@example.com',
     'Client Company Name',
     'UNIQUE_CLIENT_ID',
     'wingman'
   );
   ```

## Password Reset Flow

The password reset flow is handled by Supabase Auth:

1. User requests password reset through your application
2. Application calls Supabase Auth API: `supabase.auth.resetPasswordForEmail(email)`
3. Supabase sends a password reset email with a secure token
4. User clicks the link and is redirected to your application
5. Application calls `supabase.auth.updateUser({ password: newPassword })`

## Session Management

### Session Timeout

Sessions expire after 24 hours of inactivity. When a session expires:
- The JWT token becomes invalid
- API requests return 401 Unauthorized
- The frontend should redirect to the login page

### Refresh Tokens

Supabase automatically handles refresh token rotation:
- Refresh tokens are valid for 24 hours
- When a refresh token is used, a new one is issued
- Old refresh tokens are invalidated after the reuse interval (10 seconds)

### Logout

To log out a user:

```javascript
await supabase.auth.signOut()
```

This invalidates the session and clears all authentication cookies.

## Security Considerations

### Password Requirements

The system enforces the following password requirements:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

These requirements are enforced at the Supabase Auth level and should also be validated in the frontend.

### JWT Security

- JWT tokens are signed with HS256 algorithm
- Tokens expire after 24 hours
- Tokens should be stored in httpOnly cookies (not localStorage)
- Never expose the JWT secret key

### RLS Policies

Row-Level Security policies use the JWT claims to filter data:
- `auth.uid()` returns the user's UUID from the JWT
- `auth.jwt()` returns the full JWT payload
- Custom claims (`role`, `client_id`) are accessible via `auth.jwt()`

## Troubleshooting

### JWT Claims Not Appearing

If custom claims are not appearing in JWT tokens:

1. Verify the hook function is created:
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'custom_access_token_hook';
   ```

2. Verify the hook is enabled in Supabase Dashboard:
   - Go to **Authentication** → **Hooks**
   - Check that **Custom Access Token Hook** is enabled

3. Check the function logs for errors:
   ```sql
   SELECT * FROM pg_stat_statements WHERE query LIKE '%custom_access_token_hook%';
   ```

4. Ensure the user has the correct metadata:
   ```sql
   SELECT raw_user_meta_data FROM auth.users WHERE email = 'user@example.com';
   ```

5. Ensure the client record exists:
   ```sql
   SELECT * FROM public.clients WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com');
   ```

### Session Expiring Too Quickly

If sessions are expiring before 24 hours:

1. Check the JWT expiry setting in Supabase Dashboard
2. Verify the `config.toml` has the correct `exp` value (86400)
3. Check that refresh token rotation is enabled

### Password Requirements Not Enforced

If password requirements are not being enforced:

1. Verify the settings in Supabase Dashboard under **Authentication** → **Settings**
2. Ensure frontend validation matches backend requirements
3. Check that the Supabase client library is up to date

## Environment Variables

Ensure the following environment variables are set in your `.env` file:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The anon key is safe to expose in the frontend. The service role key should NEVER be exposed to the frontend and should only be used in backend/server-side code.

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase JWT Documentation](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Custom Claims Documentation](https://supabase.com/docs/guides/auth/auth-hooks)

