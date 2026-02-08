# Admin User Setup Guide

You need to create an admin user to access the admin portal. Here are three ways to do it:

## Option 1: Using Supabase Dashboard (Easiest)

1. **Go to your Supabase Dashboard**
   - Visit [app.supabase.com](https://app.supabase.com)
   - Select your project

2. **Create a new user**
   - Go to **Authentication** → **Users**
   - Click **Add User**
   - Enter:
     - Email: `admin@ghostrider.com` (or your preferred email)
     - Password: `Admin123!` (or your preferred password)
     - Check "Auto Confirm User"
   - Click **Create User**

3. **Set admin role**
   - Go to **SQL Editor**
   - Run this query (replace email if needed):
   ```sql
   UPDATE auth.users
   SET raw_user_metadata = jsonb_set(
     COALESCE(raw_user_metadata, '{}'::jsonb),
     '{role}',
     '"admin"'
   )
   WHERE email = 'admin@ghostrider.com';
   ```

4. **Login to admin portal**
   - Visit: `http://localhost:3000/admin/login`
   - Email: `admin@ghostrider.com`
   - Password: `Admin123!` (or whatever you set)

---

## Option 2: Using the Setup Script

1. **Run the admin creation script**
   ```bash
   node scripts/create-admin.js
   ```

2. **Follow the prompts**
   - Enter email (or press Enter for default: `admin@ghostrider.com`)
   - Enter password (or press Enter for default: `Admin123!`)

3. **Login with the credentials shown**
   - Visit: `http://localhost:3000/admin/login`

---

## Option 3: Using SQL Script

1. **Open Supabase SQL Editor**
   - Go to your Supabase Dashboard
   - Navigate to **SQL Editor**

2. **Run the SQL script**
   - Open `scripts/create-admin.sql`
   - Copy and paste into SQL Editor
   - Modify the email if needed
   - Execute the query

3. **Create the user in Dashboard first**
   - Go to **Authentication** → **Users** → **Add User**
   - Then run the SQL to set admin role

---

## Default Admin Credentials

If you use the defaults:

```
Email:    admin@ghostrider.com
Password: Admin123!
URL:      http://localhost:3000/admin/login
```

---

## Verify Admin Access

After creating the admin user, verify it worked:

```sql
-- Run in Supabase SQL Editor
SELECT 
  id,
  email,
  raw_user_metadata->>'role' as role,
  created_at
FROM auth.users
WHERE raw_user_metadata->>'role' = 'admin';
```

You should see your admin user listed with `role = 'admin'`.

---

## Troubleshooting

### "Access denied. Admin privileges required."

**Solution:** The user doesn't have admin role. Run this SQL:

```sql
UPDATE auth.users
SET raw_user_metadata = jsonb_set(
  COALESCE(raw_user_metadata, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'your-email@example.com';
```

### "Invalid login credentials"

**Solution:** 
1. Check you're using the correct email/password
2. Verify the user exists in **Authentication** → **Users**
3. Try resetting the password in the Dashboard

### Can't access admin portal

**Solution:**
1. Make sure you're visiting `/admin/login` (not `/login`)
2. Clear browser cache and localStorage
3. Check browser console for errors

---

## Security Notes

- **Change the default password** in production
- Use a strong password (min 8 chars, uppercase, lowercase, numbers)
- Admin users do NOT need a record in the `clients` table
- Only users with `role='admin'` can access the admin portal
- The role is stored in `user_metadata` and added to JWT claims

---

## Next Steps

After logging in as admin, you can:

1. ✅ View dashboard KPIs
2. ✅ Manage all clients
3. ✅ Create new clients
4. ✅ Update client tiers
5. ✅ View system analytics

---

## Need Help?

- Check the [Authentication Setup Guide](docs/AUTHENTICATION_SETUP.md)
- Review [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- Contact the development team
