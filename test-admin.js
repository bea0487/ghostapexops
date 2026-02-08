/**
 * Admin Integration Test
 * 
 * Tests admin operations using service role key.
 * Run with: node test-admin.js
 */

import dotenv from 'dotenv'
dotenv.config()

import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

console.log('🚀 Ghost Apex Backend - Admin Integration Test\n')
console.log('=' .repeat(60))

let testClientId = null
let testUserId = null
let testTicketId = null

/**
 * Test 1: Create Test Client (Admin Operation)
 */
async function testCreateClient() {
  console.log('\n📝 Test 1: Creating a test client (admin operation)...')
  try {
    const testEmail = `test-${Date.now()}@ghostapex.com`
    const testPassword = 'TestPass123!'
    
    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        role: 'client'
      }
    })
    
    if (authError) throw authError
    
    testUserId = authData.user.id
    console.log('✅ Auth user created')
    console.log(`   - User ID: ${authData.user.id}`)
    
    // Create client record
    const { data: client, error: clientError} = await supabaseAdmin
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
    
    testClientId = client.id
    console.log('✅ Client record created')
    console.log(`   - Client ID: ${client.id}`)
    console.log(`   - Company: ${client.company_name}`)
    console.log(`   - Tier: ${client.tier}`)
    
    return true
  } catch (error) {
    console.error('❌ Client creation failed:', error.message)
    return false
  }
}

/**
 * Test 2: Create Support Ticket
 */
async function testCreateTicket() {
  console.log('\n📝 Test 2: Creating a support ticket...')
  try {
    const { data: ticket, error } = await supabaseAdmin
      .from('support_tickets')
      .insert({
        client_id: testClientId,
        subject: 'Test Support Ticket',
        message: 'This is a test ticket to verify the support system works.',
        priority: 'Medium',
        status: 'Open'
      })
      .select()
      .single()
    
    if (error) throw error
    
    testTicketId = ticket.id
    console.log('✅ Ticket created successfully')
    console.log(`   - Ticket ID: ${ticket.id}`)
    console.log(`   - Status: ${ticket.status}`)
    console.log(`   - Priority: ${ticket.priority}`)
    
    return true
  } catch (error) {
    console.error('❌ Ticket creation failed:', error.message)
    return false
  }
}

/**
 * Test 3: Add Message to Ticket
 */
async function testAddMessage() {
  console.log('\n📝 Test 3: Adding a message to the ticket...')
  try {
    const { data: message, error } = await supabaseAdmin
      .from('ticket_messages')
      .insert({
        ticket_id: testTicketId,
        sender_id: testUserId,
        sender_type: 'client',
        message: 'This is a test message on the ticket.'
      })
      .select()
      .single()
    
    if (error) throw error
    
    console.log('✅ Message added successfully')
    console.log(`   - Message ID: ${message.id}`)
    console.log(`   - Sender Type: ${message.sender_type}`)
    
    // Retrieve all messages
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', testTicketId)
      .order('created_at', { ascending: true })
    
    if (messagesError) throw messagesError
    
    console.log(`   - Total messages: ${messages.length}`)
    
    return true
  } catch (error) {
    console.error('❌ Message creation failed:', error.message)
    return false
  }
}

/**
 * Test 4: Update Ticket Status
 */
async function testUpdateTicketStatus() {
  console.log('\n📝 Test 4: Updating ticket status...')
  try {
    const { data: ticket, error } = await supabaseAdmin
      .from('support_tickets')
      .update({ status: 'In Progress' })
      .eq('id', testTicketId)
      .select()
      .single()
    
    if (error) throw error
    
    console.log('✅ Ticket status updated successfully')
    console.log(`   - New Status: ${ticket.status}`)
    
    return true
  } catch (error) {
    console.error('❌ Ticket status update failed:', error.message)
    return false
  }
}

/**
 * Test 5: Query Dashboard KPIs
 */
async function testDashboardKPIs() {
  console.log('\n📝 Test 5: Querying dashboard KPIs...')
  try {
    // Get active clients count
    const { count: activeClients, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Active')
    
    if (clientError) throw clientError
    
    // Get open tickets count
    const { count: openTickets, error: ticketError } = await supabaseAdmin
      .from('support_tickets')
      .select('*', { count: 'exact', head: true })
      .in('status', ['Open', 'In Progress'])
    
    if (ticketError) throw ticketError
    
    // Get clients by tier
    const { data: clients, error: tiersError } = await supabaseAdmin
      .from('clients')
      .select('tier')
      .eq('status', 'Active')
    
    if (tiersError) throw tiersError
    
    const tierCounts = {}
    clients.forEach(c => {
      tierCounts[c.tier] = (tierCounts[c.tier] || 0) + 1
    })
    
    console.log('✅ Dashboard KPIs retrieved')
    console.log(`   - Active Clients: ${activeClients}`)
    console.log(`   - Open Tickets: ${openTickets}`)
    console.log(`   - Clients by Tier:`, tierCounts)
    
    return true
  } catch (error) {
    console.error('❌ Dashboard KPIs query failed:', error.message)
    return false
  }
}

/**
 * Test 6: Create Audit Log
 */
async function testAuditLog() {
  console.log('\n📝 Test 6: Creating an audit log entry...')
  try {
    const { data: log, error } = await supabaseAdmin
      .from('audit_logs')
      .insert({
        admin_id: testUserId,
        action_type: 'client_created',
        target_table: 'clients',
        target_id: testClientId,
        changes: { created: { email: 'test@example.com', tier: 'wingman' } },
        ip_address: '127.0.0.1'
      })
      .select()
      .single()
    
    if (error) throw error
    
    console.log('✅ Audit log created successfully')
    console.log(`   - Log ID: ${log.id}`)
    console.log(`   - Action Type: ${log.action_type}`)
    
    return true
  } catch (error) {
    console.error('❌ Audit log creation failed:', error.message)
    return false
  }
}

/**
 * Test 7: Update Client Tier
 */
async function testUpdateClientTier() {
  console.log('\n📝 Test 7: Updating client tier...')
  try {
    const { data: client, error } = await supabaseAdmin
      .from('clients')
      .update({ tier: 'guardian' })
      .eq('id', testClientId)
      .select()
      .single()
    
    if (error) throw error
    
    console.log('✅ Client tier updated successfully')
    console.log(`   - New Tier: ${client.tier}`)
    
    return true
  } catch (error) {
    console.error('❌ Client tier update failed:', error.message)
    return false
  }
}

/**
 * Cleanup: Deactivate test client
 */
async function cleanup() {
  console.log('\n🧹 Cleaning up test data...')
  try {
    if (testClientId) {
      await supabaseAdmin
        .from('clients')
        .update({ status: 'Inactive' })
        .eq('id', testClientId)
      
      console.log('✅ Test client deactivated')
    }
    return true
  } catch (error) {
    console.error('⚠️  Cleanup warning:', error.message)
    return false
  }
}

/**
 * Run all tests
 */
async function runTests() {
  const results = []
  
  results.push(await testCreateClient())
  results.push(await testCreateTicket())
  results.push(await testAddMessage())
  results.push(await testUpdateTicketStatus())
  results.push(await testDashboardKPIs())
  results.push(await testAuditLog())
  results.push(await testUpdateClientTier())
  
  // Cleanup
  await cleanup()
  
  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('\n📊 Test Summary:')
  const passed = results.filter(r => r).length
  const total = results.length
  console.log(`   ✅ Passed: ${passed}/${total}`)
  console.log(`   ❌ Failed: ${total - passed}/${total}`)
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Your backend is working correctly.\n')
    console.log('✨ Core functionality verified:')
    console.log('   - Client management')
    console.log('   - Support ticket system')
    console.log('   - Ticket messaging')
    console.log('   - Dashboard KPIs')
    console.log('   - Audit logging')
    console.log('   - Tier management\n')
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
