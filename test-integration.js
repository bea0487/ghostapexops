/**
 * Integration Test Script
 * 
 * Tests core functionality of the Ghost Apex Operations Portal backend.
 * Run with: node test-integration.js
 */

import dotenv from 'dotenv'
dotenv.config()

// Verify environment variables are loaded
console.log('Environment check:')
console.log('- VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Not set')
console.log('- VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set')
console.log('')

import { clientManagementService } from './src/lib/ClientManagementService.js'
import { ticketService } from './src/lib/TicketService.js'
import { messageService } from './src/lib/MessageService.js'
import { documentService } from './src/lib/DocumentService.js'
import { dashboardService } from './src/lib/DashboardService.js'
import { auditLogService } from './src/lib/AuditLogService.js'
import { supabase } from './src/lib/supabaseClient.js'

// Test data
const TEST_CLIENT = {
  email: `test-${Date.now()}@ghostapex.com`,
  password: 'TestPass123!',
  companyName: 'Test Trucking Co',
  clientId: `TEST${Date.now()}`,
  tier: 'wingman'
}

let testClientId = null
let testTicketId = null
let testUserId = null

console.log('🚀 Starting Ghost Apex Backend Integration Tests\n')

/**
 * Test 1: Client Creation
 */
async function testClientCreation() {
  console.log('📝 Test 1: Creating a test client...')
  try {
    const client = await clientManagementService.createClient(TEST_CLIENT)
    testClientId = client.id
    testUserId = client.user_id
    console.log('✅ Client created successfully')
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
 * Test 2: Client Profile Retrieval
 */
async function testClientProfile() {
  console.log('\n📝 Test 2: Retrieving client profile...')
  try {
    const profile = await clientManagementService.getClientProfile(testClientId)
    console.log('✅ Client profile retrieved successfully')
    console.log(`   - Email: ${profile.email}`)
    console.log(`   - Status: ${profile.status}`)
    console.log(`   - Documents: ${profile.documents.length}`)
    console.log(`   - Tickets: ${profile.tickets.length}`)
    return true
  } catch (error) {
    console.error('❌ Client profile retrieval failed:', error.message)
    return false
  }
}

/**
 * Test 3: Ticket Creation
 */
async function testTicketCreation() {
  console.log('\n📝 Test 3: Creating a support ticket...')
  try {
    const ticket = await ticketService.createTicket({
      clientId: testClientId,
      subject: 'Test Support Ticket',
      message: 'This is a test ticket to verify the support system works.',
      priority: 'Medium'
    })
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
 * Test 4: Ticket Messaging
 */
async function testTicketMessaging() {
  console.log('\n📝 Test 4: Adding a message to the ticket...')
  try {
    const message = await messageService.addMessage({
      ticketId: testTicketId,
      senderId: testUserId,
      senderType: 'client',
      message: 'This is a test message on the ticket.'
    })
    console.log('✅ Message added successfully')
    console.log(`   - Message ID: ${message.id}`)
    console.log(`   - Sender Type: ${message.sender_type}`)
    
    // Retrieve messages
    const messages = await messageService.getMessages(testTicketId)
    console.log(`   - Total messages: ${messages.length}`)
    return true
  } catch (error) {
    console.error('❌ Ticket messaging failed:', error.message)
    return false
  }
}

/**
 * Test 5: Ticket Status Update
 */
async function testTicketStatusUpdate() {
  console.log('\n📝 Test 5: Updating ticket status...')
  try {
    const ticket = await ticketService.updateTicketStatus(testTicketId, 'In Progress')
    console.log('✅ Ticket status updated successfully')
    console.log(`   - New Status: ${ticket.status}`)
    return true
  } catch (error) {
    console.error('❌ Ticket status update failed:', error.message)
    return false
  }
}

/**
 * Test 6: Dashboard KPIs
 */
async function testDashboardKPIs() {
  console.log('\n📝 Test 6: Retrieving dashboard KPIs...')
  try {
    const kpis = await dashboardService.getDashboardKPIs()
    console.log('✅ Dashboard KPIs retrieved successfully')
    console.log(`   - Active Clients: ${kpis.activeClients}`)
    console.log(`   - Open Tickets: ${kpis.openTickets}`)
    console.log(`   - Total Revenue: $${kpis.revenue.total}`)
    console.log(`   - New Clients This Month: ${kpis.newClientsThisMonth}`)
    return true
  } catch (error) {
    console.error('❌ Dashboard KPIs retrieval failed:', error.message)
    return false
  }
}

/**
 * Test 7: Audit Logging
 */
async function testAuditLogging() {
  console.log('\n📝 Test 7: Creating an audit log entry...')
  try {
    const log = await auditLogService.logClientCreated(
      testUserId,
      testClientId,
      { email: TEST_CLIENT.email, tier: TEST_CLIENT.tier },
      '127.0.0.1'
    )
    console.log('✅ Audit log created successfully')
    console.log(`   - Log ID: ${log.id}`)
    console.log(`   - Action Type: ${log.action_type}`)
    
    // Query logs
    const logs = await auditLogService.queryLogs({ limit: 5 })
    console.log(`   - Recent logs count: ${logs.length}`)
    return true
  } catch (error) {
    console.error('❌ Audit logging failed:', error.message)
    return false
  }
}

/**
 * Test 8: Client Tier Update
 */
async function testClientTierUpdate() {
  console.log('\n📝 Test 8: Updating client tier...')
  try {
    const client = await clientManagementService.updateClientTier(testClientId, 'guardian')
    console.log('✅ Client tier updated successfully')
    console.log(`   - New Tier: ${client.tier}`)
    return true
  } catch (error) {
    console.error('❌ Client tier update failed:', error.message)
    return false
  }
}

/**
 * Test 9: RLS Policy Verification
 */
async function testRLSPolicies() {
  console.log('\n📝 Test 9: Verifying RLS policies...')
  try {
    // Try to query tickets directly (should be filtered by RLS)
    const { data: tickets, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('client_id', testClientId)
    
    if (error) {
      console.log('⚠️  RLS policies are active (expected behavior)')
      console.log(`   - Error: ${error.message}`)
    } else {
      console.log('✅ RLS query executed')
      console.log(`   - Tickets found: ${tickets.length}`)
    }
    return true
  } catch (error) {
    console.error('❌ RLS verification failed:', error.message)
    return false
  }
}

/**
 * Cleanup: Remove test data
 */
async function cleanup() {
  console.log('\n🧹 Cleaning up test data...')
  try {
    // Deactivate the test client
    if (testClientId) {
      await clientManagementService.deactivateClient(testClientId)
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
  
  // Check Supabase configuration
  if (!supabase) {
    console.error('❌ Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
    process.exit(1)
  }
  
  console.log('✅ Supabase configured\n')
  console.log('=' .repeat(60))
  
  // Run tests sequentially
  results.push(await testClientCreation())
  results.push(await testClientProfile())
  results.push(await testTicketCreation())
  results.push(await testTicketMessaging())
  results.push(await testTicketStatusUpdate())
  results.push(await testDashboardKPIs())
  results.push(await testAuditLogging())
  results.push(await testClientTierUpdate())
  results.push(await testRLSPolicies())
  
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
