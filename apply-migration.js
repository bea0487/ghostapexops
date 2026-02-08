import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import dotenv from 'dotenv'

dotenv.config()

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

async function applyMigration() {
  console.log('📋 Applying database migration...\n')
  
  try {
    // Read the migration file
    const migrationSQL = readFileSync('supabase/migrations/001_initial_schema.sql', 'utf8')
    
    console.log('Executing migration SQL...')
    
    // Execute the migration using Supabase's RPC
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      console.error('❌ Migration failed!')
      console.error('Error:', error.message)
      console.log('\n📋 Please apply the migration manually:')
      console.log('1. Go to: https://dsquakmspzspgvfoouqy.supabase.co/project/_/sql')
      console.log('2. Copy and paste the contents of: supabase/migrations/001_initial_schema.sql')
      console.log('3. Click "Run"')
      process.exit(1)
    }
    
    console.log('✅ Migration applied successfully!')
    
  } catch (err) {
    console.error('❌ Error reading migration file:', err.message)
    console.log('\n📋 Please apply the migration manually:')
    console.log('1. Go to: https://dsquakmspzspgvfoouqy.supabase.co/project/_/sql')
    console.log('2. Copy and paste the contents of: supabase/migrations/001_initial_schema.sql')
    console.log('3. Click "Run"')
    process.exit(1)
  }
}

applyMigration()
