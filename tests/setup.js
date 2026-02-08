import { config } from 'dotenv'

// Load environment variables from .env file
config()

// Verify required environment variables
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Warning: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env file')
}
