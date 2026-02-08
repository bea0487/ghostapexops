#!/usr/bin/env node

/**
 * Create Admin User Script
 * 
 * This script creates an admin user in Supabase Auth
 * 
 * Usage:
 *   node scripts/create-admin.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import readline from 'readline'

// Load environment variables
dotenv.config()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function createAdminUser() {
  log('\n🔐 Ghost Rider Admin User Setup', 'cyan')
  log('='.repeat(60), 'cyan')

  // Check environment variables
  if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    log('\n❌ Missing environment variables!', 'red')
    log('Please ensure .env file contains:', 'yellow')
    log('  - VITE_SUPABASE_URL', 'yellow')
    log('  - SUPABASE_SERVICE_ROLE_KEY', 'yellow')
    rl.close()
    process.exit(1)
  }

  // Get admin details from user
  log('\nEnter admin user details:', 'cyan')
  const email = await question('Email (default: admin@ghostrider.com): ') || 'admin@ghostrider.com'
  const password = await question('Password (default: Admin123!): ') || 'Admin123!'

  log('\n📝 Creating admin user...', 'cyan')

  try {
    // Create Supabase client with service role key
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create the user
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        role: 'admin'
      }
    })

    if (createError) {
      if (createError.message.includes('already registered')) {
        log('\n⚠️  User already exists. Updating to admin role...', 'yellow')
        
        // Get existing user
        const { data: users } = await supabase.auth.admin.listUsers()
        const existingUser = users.users.find(u => u.email === email)
        
        if (existingUser) {
          // Update user metadata to admin
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            {
              user_metadata: {
                role: 'admin'
              }
            }
          )
          
          if (updateError) {
            throw updateError
          }
          
          log('\n✅ User updated to admin role!', 'green')
        }
      } else {
        throw createError
      }
    } else {
      log('\n✅ Admin user created successfully!', 'green')
    }

    // Display login credentials
    log('\n' + '='.repeat(60), 'cyan')
    log('🎉 Admin Setup Complete!', 'green')
    log('='.repeat(60), 'cyan')
    log('\n📋 Admin Login Credentials:', 'magenta')
    log(`   Email:    ${email}`, 'cyan')
    log(`   Password: ${password}`, 'cyan')
    log('\n🌐 Admin Portal URL:', 'magenta')
    log('   http://localhost:3000/admin/login', 'cyan')
    log('\n💡 Next Steps:', 'yellow')
    log('   1. Visit the admin portal URL above')
    log('   2. Login with the credentials shown')
    log('   3. Start managing clients!')
    log('\n' + '='.repeat(60), 'cyan')

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red')
    log('\nTroubleshooting:', 'yellow')
    log('  1. Check your Supabase credentials in .env')
    log('  2. Ensure you have the service role key (not anon key)')
    log('  3. Verify your Supabase project is active')
  }

  rl.close()
}

// Run the script
createAdminUser().catch(error => {
  log(`\n❌ Script failed: ${error.message}`, 'red')
  rl.close()
  process.exit(1)
})
