# Authentication Setup Guide

This guide provides step-by-step instructions for setting up Supabase Authentication for the Ghost Apex Operations Portal.

## Quick Start

### Prerequisites

- Supabase project created at [app.supabase.com](https://app.supabase.com)
- Database migrations applied (see [Database Setup](../supabase/migrations/README.md))
- Environment variables configured (see [.env.example](../.env.example))

### 5-Minute Setup

1. **Apply Database Migrations**
   ```bash
   npm run db:migrate
   ```

2. **Configure Supabase Dashboard**
   - Go to **Authentication** → **Settings**
   - Set **JWT expiry** to `86400` (24 hours)
   - Enable **Email** provider
   - Configure password requirements (see below)

3. **Enable Custom JWT Claims Hook**
   - Go to **SQL Editor**
   - Run the migration: `supabase/migrations/002_auth_jwt_claims.sql`
   - Go to **Authentication** → **Hooks**
   - Enable **Custom Access Token Hook**
   - Set function: `public.custom_access_token_hook`

4. **Create Test Users**
   ```bash
   npm run db:seed
   ```

## Detailed Configuration

### 1. Email/Password Authentication

#### Dashboard Configuration

1. Navigate to **Authentication** → **Providers**
2. Ensure **Email** is enabled
3. Configure settings:
   - ✓ Enable email signup
   - ✓ Confirm email (production only)
   - ✓ Secure email change

#### Password Requirements

Configure in **Authentication** → **Settings**:

| Setting | Value |
|---------|-------|
| Minimum length | 8 characters |
| Require uppercase | ✓ Yes |
| Require lowercase | ✓ Yes |
| Require numbers | ✓ Yes |
| Require special chars | ✗ No |

### 2. JWT Token Configuration

#### Session Settings

Configure in **Authentication** → **Settings**:

| Setting | Value | Description |
|---------|-------|-------------|
| JWT expiry | 86400 seconds | 24 hours |
| Session timeout | 86400 seconds | 24 hours |
| Inactivity timeout | 86400 seconds | 24 hours |
| Refresh token rotation | ✓ Enabled | Security feature |

#### Custom Claims

The JWT token includes custom claims for authorization:

```json
{
  "role": "client",
  "client_id": "uuid-here"
}
```

**Setup:**

1. Run migration `002_auth_jwt_claims.sql`
2. Enable hook in **Authentication** → **Hooks**
3. Verify by logging in and inspecting the JWT token

### 3. User Role Management

#### Creating Admin Users

```sql
-- 1. Create user through Supabase Auth or Dashboard
-- 2. Set admin role
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@ghostapex.com';
```

**Note:** Admin users do NOT need a record in the `clients` table.

#### Creating Client Users

```sql
-- 1. Create user through Supabase Auth or Dashboard
-- 2. Set client role (optional, defaults to 'client')
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"client"'
)
WHERE email = 'client@example.com';

-- 3. Create client record
INSERT INTO public.clients (user_id, email, company_name, client_id, tier)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'client@example.com'),
  'client@example.com',
  'Example Trucking Co',
  'EXAMPLE123',
  'wingman'
);
```

## Frontend Integration

### Initialize Supabase Client

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
```

### Login

```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'SecurePass123'
})

if (error) {
  console.error('Login failed:', error.message)
} else {
  console.log('Logged in:', data.user)
  console.log('JWT claims:', data.session.access_token)
}
```

### Logout

```javascript
const { error } = await supabase.auth.signOut()

if (error) {
  console.error('Logout failed:', error.message)
} else {
  console.log('Logged out successfully')
}
```

### Password Reset

```javascript
// Request password reset
const { error } = await supabase.auth.resetPasswordForEmail(
  'user@example.com',
  {
    redirectTo: 'https://yourapp.com/reset-password'
  }
)

// Update password (after user clicks reset link)
const { error } = await supabase.auth.updateUser({
  password: 'NewSecurePass123'
})
```

### Get Current User

```javascript
const { data: { user } } = await supabase.auth.getUser()

if (user) {
  console.log('Current user:', user.email)
  console.log('Role:', user.user_metadata.role)
}
```

### Access JWT Claims

```javascript
const { data: { session } } = await supabase.auth.getSession()

if (session) {
  // Decode JWT to access custom claims
  const token = session.access_token
  const payload = JSON.parse(atob(token.split('.')[1]))
  
  console.log('Role:', payload.role)
  console.log('Client ID:', payload.client_id)
}
```

## Testing

### Manual Testing

1. **Create Test User**
   ```bash
   # Through Supabase Dashboard or API
   ```

2. **Set User Role**
   ```sql
   UPDATE auth.users
   SET raw_user_meta_data = '{"role": "client"}'::jsonb
   WHERE email = 'test@example.com';
   ```

3. **Create Client Record**
   ```sql
   INSERT INTO clients (user_id, email, company_name, client_id, tier)
   VALUES (
     (SELECT id FROM auth.users WHERE email = 'test@example.com'),
     'test@example.com',
     'Test Company',
     'TEST123',
     'wingman'
   );
   ```

4. **Login and Verify JWT**
   - Login through your application
   - Inspect the JWT token
   - Verify `role` and `client_id` claims are present

### Automated Testing

See [tests/auth/](../tests/auth/) for authentication test suites.

## Troubleshooting

### Issue: JWT Claims Not Appearing

**Solution:**
1. Verify hook function exists:
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'custom_access_token_hook';
   ```
2. Check hook is enabled in Dashboard
3. Verify user has correct metadata:
   ```sql
   SELECT raw_user_meta_data FROM auth.users WHERE email = 'user@example.com';
   ```
4. Ensure client record exists:
   ```sql
   SELECT * FROM clients WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com');
   ```

### Issue: Session Expiring Too Quickly

**Solution:**
1. Check JWT expiry in Dashboard (should be 86400)
2. Verify refresh token rotation is enabled
3. Check browser console for token refresh errors

### Issue: Password Requirements Not Enforced

**Solution:**
1. Verify settings in Dashboard under **Authentication** → **Settings**
2. Ensure frontend validation matches backend requirements
3. Update Supabase client library to latest version

### Issue: RLS Policies Not Working

**Solution:**
1. Verify RLS is enabled on tables:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
   ```
2. Check policies exist:
   ```sql
   SELECT * FROM pg_policies WHERE schemaname = 'public';
   ```
3. Test JWT claims are accessible:
   ```sql
   SELECT auth.jwt();
   ```

## Security Best Practices

### ✓ DO

- Store JWT tokens in httpOnly cookies
- Use HTTPS in production
- Enable email confirmation in production
- Rotate refresh tokens
- Set appropriate session timeouts
- Validate passwords on both frontend and backend
- Use RLS policies for all data access

### ✗ DON'T

- Store JWT tokens in localStorage
- Expose service role key to frontend
- Disable email confirmation in production
- Use weak passwords
- Trust client-side validation alone
- Bypass RLS policies in application code

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [JWT Best Practices](https://supabase.com/docs/guides/auth/auth-helpers)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Custom Claims Documentation](https://supabase.com/docs/guides/auth/auth-hooks)

## Support

For issues or questions:
1. Check the [troubleshooting section](#troubleshooting)
2. Review [Supabase documentation](https://supabase.com/docs)
3. Contact the development team

