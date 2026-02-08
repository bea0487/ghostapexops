#!/usr/bin/env node

/**
 * Interactive script to set up .env file for testing
 * Run with: node setup-env.js
 */

import { createInterface } from 'readline'
import { writeFileSync, existsSync } from 'fs'

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

async function main() {
  console.log('\n🚀 Ghost Apex Backend - Environment Setup\n')
  console.log('This script will help you create a .env file for running tests.\n')
  
  if (existsSync('.env')) {
    const overwrite = await question('.env file already exists. Overwrite? (y/N): ')
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.')
      rl.close()
      return
    }
  }

  console.log('\nPlease provide your Supabase credentials.')
  console.log('You can find these in your Supabase project settings under API.\n')

  const supabaseUrl = await question('VITE_SUPABASE_URL: ')
  const supabaseAnonKey = await question('VITE_SUPABASE_ANON_KEY: ')
  const supabaseServiceKey = await question('SUPABASE_SERVICE_ROLE_KEY: ')

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    console.error('\n❌ Error: All credentials are required.')
    rl.close()
    return
  }

  const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}
`

  try {
    writeFileSync('.env', envContent)
    console.log('\n✅ .env file created successfully!')
    console.log('\nYou can now run tests with: npm test')
  } catch (error) {
    console.error('\n❌ Error creating .env file:', error.message)
  }

  rl.close()
}

main()
