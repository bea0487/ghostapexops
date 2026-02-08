import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkDatabase() {
  console.log('Checking database schema...\n')
  
  // Check if clients table exists
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error('❌ Database schema not found!')
    console.error('Error:', error.message)
    console.log('\n📋 You need to apply the migration:')
    console.log('1. Go to your Supabase dashboard: https://dsquakmspzspgvfoouqy.supabase.co')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Copy and paste the contents of: supabase/migrations/001_initial_schema.sql')
    console.log('4. Run the migration')
    process.exit(1)
  }
  
  console.log('✅ Database schema is ready!')
  console.log('Found clients table with', data?.length || 0, 'records')
}

checkDatabase()
