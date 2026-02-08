#!/usr/bin/env node

/**
 * Supabase Auth Setup Script
 * 
 * This script helps verify and document the Supabase Auth configuration.
 * It checks that all required settings are in place and provides guidance
 * for any missing configuration.
 * 
 * Usage:
 *   node scripts/setup-auth.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables
dotenv.config()

const REQUIRED_ENV_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
]

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function checkEnvironmentVariables() {
  log('\n📋 Checking Environment Variables...', 'cyan')
  
  let allPresent = true
  
  for (const varName of REQUIRED_ENV_VARS) {
    if (process.env[varName]) {
      log(`  ✓ ${varName} is set`, 'green')
    } else {
      log(`  ✗ ${varName} is missing`, 'red')
      allPresent = false
    }
  }
  
  if (!allPresent) {
    log('\n⚠️  Missing environment variables. Please check your .env file.', 'yellow')
    log('   See .env.example for required variables.', 'yellow')
    return false
  }
  
  return true
}

async function checkDatabaseConnection() {
  log('\n🔌 Checking Database Connection...', 'cyan')
  
  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    const { data, error } = await supabase
      .from('clients')
      .select('count')
      .limit(1)
    
    if (error) {
      log(`  ✗ Database connection failed: ${error.message}`, 'red')
      return false
    }
    
    log('  ✓ Database connection successful', 'green')
    return true
  } catch (error) {
    log(`  ✗ Database connection failed: ${error.message}`, 'red')
    return false
  }
}

async function checkCustomJWTFunction() {
  log('\n🔧 Checking Custom JWT Claims Function...', 'cyan')
  
  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    const { data, error } = await supabase.rpc('custom_access_token_hook', {
      event: {
        user_id: '00000000-0000-0000-0000-000000000000',
        user_metadata: { role: 'client' },
        claims: { aud: 'authenticated' }
      }
    })
    
    if (error) {
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        log('  ✗ Custom JWT claims function not found', 'red')
        log('    Run migration: supabase/migrations/002_auth_jwt_claims.sql', 'yellow')
        return false
      }
      log(`  ✗ Function check failed: ${error.message}`, 'red')
      return false
    }
    
    log('  ✓ Custom JWT claims function exists', 'green')
    return true
  } catch (error) {
    log(`  ✗ Function check failed: ${error.message}`, 'red')
    return false
  }
}

async function checkRLSHelperFunctions() {
  log('\n🛡️  Checking RLS Helper Functions...', 'cyan')
  
  const functions = ['is_admin', 'get_user_client_id']
  let allPresent = true
  
  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    for (const funcName of functions) {
      const { data, error } = await supabase
        .from('pg_proc')
        .select('proname')
        .eq('proname', funcName)
        .limit(1)
      
      if (error || !data || data.length === 0) {
        log(`  ✗ Function ${funcName} not found`, 'red')
        allPresent = false
      } else {
        log(`  ✓ Function ${funcName} exists`, 'green')
      }
    }
    
    if (!allPresent) {
      log('    Run migration: supabase/migrations/001_initial_schema.sql', 'yellow')
    }
    
    return allPresent
  } catch (error) {
    log(`  ✗ Function check failed: ${error.message}`, 'red')
    return false
  }
}

function printConfigurationGuide() {
  log('\n📖 Configuration Guide', 'cyan')
  log('=' .repeat(60), 'cyan')
  
  log('\nTo complete the Supabase Auth setup:', 'blue')
  
  log('\n1. Apply Database Migrations:', 'yellow')
  log('   • Run: supabase/migrations/001_initial_schema.sql')
  log('   • Run: supabase/migrations/002_auth_jwt_claims.sql')
  
  log('\n2. Configure Supabase Dashboard:', 'yellow')
  log('   • Go to Authentication → Settings')
  log('   • Set JWT expiry to 86400 seconds (24 hours)')
  log('   • Set session timeout to 86400 seconds')
  log('   • Enable refresh token rotation')
  
  log('\n3. Configure Password Requirements:', 'yellow')
  log('   • Minimum length: 8 characters')
  log('   • Require uppercase: Yes')
  log('   • Require lowercase: Yes')
  log('   • Require numbers: Yes')
  
  log('\n4. Enable Custom JWT Claims Hook:', 'yellow')
  log('   • Go to Authentication → Hooks')
  log('   • Enable "Custom Access Token Hook"')
  log('   • Set function: public.custom_access_token_hook')
  
  log('\n5. Enable Email Provider:', 'yellow')
  log('   • Go to Authentication → Providers')
  log('   • Enable Email provider')
  log('   • Configure email settings')
  
  log('\n📚 Documentation:', 'blue')
  log('   • Setup Guide: docs/AUTHENTICATION_SETUP.md')
  log('   • Config README: supabase/config/README.md')
  log('   • Setup Checklist: supabase/config/SETUP_CHECKLIST.md')
  
  log('\n' + '='.repeat(60), 'cyan')
}

async function main() {
  log('\n🚀 Supabase Auth Setup Verification', 'cyan')
  log('='.repeat(60), 'cyan')
  
  // Check environment variables
  const envOk = checkEnvironmentVariables()
  if (!envOk) {
    printConfigurationGuide()
    process.exit(1)
  }
  
  // Check database connection
  const dbOk = await checkDatabaseConnection()
  if (!dbOk) {
    printConfigurationGuide()
    process.exit(1)
  }
  
  // Check custom JWT function
  const jwtFuncOk = await checkCustomJWTFunction()
  
  // Check RLS helper functions
  const rlsFuncsOk = await checkRLSHelperFunctions()
  
  // Print summary
  log('\n📊 Summary', 'cyan')
  log('='.repeat(60), 'cyan')
  
  if (envOk && dbOk && jwtFuncOk && rlsFuncsOk) {
    log('\n✅ All checks passed!', 'green')
    log('\nNext steps:', 'blue')
    log('  1. Configure settings in Supabase Dashboard')
    log('  2. Enable Custom JWT Claims Hook')
    log('  3. Create test users')
    log('  4. Verify JWT claims')
    log('\nSee docs/AUTHENTICATION_SETUP.md for detailed instructions.')
  } else {
    log('\n⚠️  Some checks failed. Please review the issues above.', 'yellow')
    printConfigurationGuide()
  }
  
  log('\n' + '='.repeat(60), 'cyan')
}

// Run the script
main().catch(error => {
  log(`\n❌ Script failed: ${error.message}`, 'red')
  process.exit(1)
})

