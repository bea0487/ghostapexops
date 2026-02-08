#!/usr/bin/env node

/**
 * Test Admin Login
 * Quick script to test if admin user exists and can login
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('\n🔍 Testing Admin Login Setup\n')
console.log('Supabase URL:', supabaseUrl ? '✓ Configured' : '✗ Missing')
console.log('Service Key:', supabaseKey ? '✓ Configured' : '✗ Missing')

if (!supabaseUrl || !supabaseKey) {
  console.log('\n❌ Missing environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAdminUser() {
  try {
    // Check if user exists
    const { data: users, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      console.log('\n❌ Error listing users:', error.message)
      return
    }

    const adminUser = users.users.find(u => u.email === 'britneymstovall@gmail.com')
    
    if (!adminUser) {
      console.log('\n❌ User britneymstovall@gmail.com does NOT exist')
      console.log('\n📝 To create this user:')
      console.log('   1. Go to Supabase Dashboard → Authentication → Users')
      console.log('   2. Click "Add User"')
      console.log('   3. Email: britneymstovall@gmail.com')
      console.log('   4. Password: (choose a strong password)')
      console.log('   5. Check "Auto Confirm User"')
      console.log('   6. Then run this SQL:')
      console.log(`
      UPDATE auth.users
      SET raw_user_meta_data = '{"role": "admin"}'::jsonb
      WHERE email = 'britneymstovall@gmail.com';
      `)
      return
    }

    console.log('\n✅ User exists!')
    console.log('   Email:', adminUser.email)
    console.log('   ID:', adminUser.id)
    console.log('   Created:', new Date(adminUser.created_at).toLocaleString())
    console.log('   Confirmed:', adminUser.email_confirmed_at ? 'Yes' : 'No')
    
    const role = adminUser.raw_user_meta_data?.role || adminUser.user_metadata?.role
    console.log('   Role:', role || '(not set)')
    
    if (role !== 'admin') {
      console.log('\n⚠️  User does NOT have admin role!')
      console.log('\n📝 To fix this, run this SQL in Supabase:')
      console.log(`
      UPDATE auth.users
      SET raw_user_meta_data = '{"role": "admin"}'::jsonb
      WHERE email = 'britneymstovall@gmail.com';
      `)
    } else {
      console.log('\n✅ User has admin role!')
      console.log('\n🎉 Everything looks good! You should be able to login at:')
      console.log('   http://localhost:3000/admin/login')
      console.log('\n   Email: britneymstovall@gmail.com')
      console.log('   Password: (the password you set)')
    }

  } catch (error) {
    console.log('\n❌ Error:', error.message)
  }
}

checkAdminUser()
