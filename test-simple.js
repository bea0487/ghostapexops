/**
 * Simple Integration Test
 * 
 * Quick test to verify core services work.
 * Run with: node test-simple.js
 */

import dotenv from 'dotenv'
dotenv.config()

import { createClient } from '@supabase/supabase-js'

// Create Supabase client directly
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

console.log('🚀 Ghost Apex Backend - Quick Integration Test\n')
console.log('=' .repeat(60))

/**
 * Test 1: Database Connection
 */
async function testDatabaseConnection() {
  console.log('\n📝 Test 1: Testing database connection...')
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('count')
      .limit(1)
    
    if (error) throw error
    
    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    return false
  }
}

/**
 * Test 2: Create Test Client
 */
async function testCreateClient() {
  console.log('\n📝 Test 2: Creating a test client...')
  try {
    const testEmail = `test-${Date.now()}@ghostapex.com`
    const testPassword = 'TestPass123!'
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          role: 'client'
        }
      }
    })
    
    if (authError) throw authError
    
    console.log('✅ Auth user created')
    console.log(`   - User ID: ${authData.user.id}`)
    
    // Create client record
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        user_id: authData.user.id,
        email: testEmail,
        company_name: 'Test Trucking Co',
        client_id: `TEST${Date.now()}`,
        tier: 'wingman',
        status: 'Active'
      })
      .select()
      .single()
    
    if (clientError) throw clientError
    
    console.log('✅ Client record created')
    console.log(`   - Client ID: ${client.id}`)
    console.log(`   - Company: ${client.company_name}`)
    console.log(`   - Tier: ${client.tier}`)
    
    return { success: true, clientId: client.id, userId: authData.user.id }
  } catch (error) {
    console.error('❌ Client creation failed:', error.message)
    return { success: false }
  }
}

/**
 * Test 3: Create Support Ticket
 */
async function testCreateTicket(clientId) {
  console.log('\n📝 Test 3: Creating a support ticket...')
  try {
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .insert({
        client_id: clientId,
        subject: 'Test Support Ticket',
        message: 'This is a test ticket.',
        priority: 'Medium',
        status: 'Open'
      })
      .select()
      .single()
    
    if (error) throw error
    
    console.log('✅ Ticket created successfully')
    console.log(`   - Ticket ID: ${ticket.id}`)
    console.log(`   - Status: ${ticket.status}`)
    console.log(`   - Priority: ${ticket.priority}`)
    
    return { success: true, ticketId: ticket.id }
  } catch (error) {
    console.error('❌ Ticket creation failed:', error.message)
    return { success: false }
  }
}

/**
 * Test 4: Query Dashboard Data
 */
async function testDashboardQuery() {
  console.log('\n📝 Test 4: Querying dashboard data...')
  try {
    // Get active clients count
    const { count: activeClients, error: clientError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Active')
    
    if (clientError) throw clientError
    
    // Get open tickets count
    const { count: openTickets, error: ticketError } = await supabase
      .from('support_tickets')
      .select('*', { count: 'exact', head: true })
      .in('status', ['Open', 'In Progress'])
    
    if (ticketError) throw ticketError
    
    console.log('✅ Dashboard data retrieved')
    console.log(`   - Active Clients: ${activeClients}`)
    console.log(`   - Open Tickets: ${openTickets}`)
    
    return true
  } catch (error) {
    console.error('❌ Dashboard query failed:', error.message)
    return false
  }
}

/**
 * Run all tests
 */
async function runTests() {
  const results = []
  
  // Test 1: Database Connection
  results.push(await testDatabaseConnection())
  
  // Test 2: Create Client
  const clientResult = await testCreateClient()
  results.push(clientResult.success)
  
  // Test 3: Create Ticket (if client was created)
  if (clientResult.success && clientResult.clientId) {
    const ticketResult = await testCreateTicket(clientResult.clientId)
    results.push(ticketResult.success)
  } else {
    results.push(false)
  }
  
  // Test 4: Dashboard Query
  results.push(await testDashboardQuery())
  
  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('\n📊 Test Summary:')
  const passed = results.filter(r => r).length
  const total = results.length
  console.log(`   ✅ Passed: ${passed}/${total}`)
  console.log(`   ❌ Failed: ${total - passed}/${total}`)
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Your backend is working correctly.\n')
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.\n')
  }
  
  process.exit(passed === total ? 0 : 1)
}

// Run the tests
runTests().catch(error => {
  console.error('\n💥 Test suite crashed:', error)
  process.exit(1)
})
