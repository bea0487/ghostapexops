import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function TestConnection() {
  const [status, setStatus] = useState('Testing...')
  const [details, setDetails] = useState([])

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    const results = []
    
    try {
      // Test 1: Supabase client configuration
      if (!supabase) {
        results.push({ test: 'Supabase Client', status: 'FAIL', message: 'Supabase not configured' })
        setStatus('Configuration Error')
        setDetails(results)
        return
      }
      results.push({ test: 'Supabase Client', status: 'PASS', message: 'Client configured' })

      // Test 2: Database connection
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('count')
          .limit(1)
        
        if (error) {
          results.push({ test: 'Database Connection', status: 'FAIL', message: error.message })
        } else {
          results.push({ test: 'Database Connection', status: 'PASS', message: 'Connected successfully' })
        }
      } catch (err) {
        results.push({ test: 'Database Connection', status: 'FAIL', message: err.message })
      }

      // Test 3: Authentication status
      try {
        const { data: session } = await supabase.auth.getSession()
        if (session?.session) {
          results.push({ 
            test: 'Authentication', 
            status: 'PASS', 
            message: `Logged in as: ${session.session.user.email}` 
          })
          
          // Test 4: Admin status
          const isAdmin = session.session.user.app_metadata?.role === 'admin'
          results.push({ 
            test: 'Admin Status', 
            status: isAdmin ? 'PASS' : 'INFO', 
            message: isAdmin ? 'Admin privileges confirmed' : 'Not an admin user' 
          })
        } else {
          results.push({ test: 'Authentication', status: 'INFO', message: 'Not logged in' })
        }
      } catch (err) {
        results.push({ test: 'Authentication', status: 'FAIL', message: err.message })
      }

      // Test 5: Edge Functions
      try {
        const { data, error } = await supabase.functions.invoke('bootstrap-admin', {
          headers: { 'x-bootstrap-secret': 'test' }
        })
        
        if (error && error.message.includes('Forbidden')) {
          results.push({ test: 'Edge Functions', status: 'PASS', message: 'Functions deployed and responding' })
        } else if (error) {
          results.push({ test: 'Edge Functions', status: 'WARN', message: `Functions responding: ${error.message}` })
        } else {
          results.push({ test: 'Edge Functions', status: 'PASS', message: 'Functions working' })
        }
      } catch (err) {
        results.push({ test: 'Edge Functions', status: 'FAIL', message: err.message })
      }

      const failCount = results.filter(r => r.status === 'FAIL').length
      if (failCount === 0) {
        setStatus('All Systems Operational')
      } else {
        setStatus(`${failCount} Issues Found`)
      }

    } catch (err) {
      results.push({ test: 'General', status: 'FAIL', message: err.message })
      setStatus('System Error')
    }

    setDetails(results)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PASS': return 'text-green-400'
      case 'WARN': return 'text-yellow-400'
      case 'INFO': return 'text-blue-400'
      case 'FAIL': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusBg = (status) => {
    switch (status) {
      case 'PASS': return 'bg-green-900/20 border-green-500/20'
      case 'WARN': return 'bg-yellow-900/20 border-yellow-500/20'
      case 'INFO': return 'bg-blue-900/20 border-blue-500/20'
      case 'FAIL': return 'bg-red-900/20 border-red-500/20'
      default: return 'bg-gray-900/20 border-gray-500/20'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">System Status Check</h1>
          <p className="text-gray-300">Ghost Rider Apex Operations Backend Test</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-2">{status}</div>
            <button 
              onClick={testConnection}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors"
            >
              Retest Connection
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {details.map((detail, index) => (
            <div key={index} className={`p-4 rounded-lg border ${getStatusBg(detail.status)}`}>
              <div className="flex justify-between items-center">
                <div className="font-semibold text-white">{detail.test}</div>
                <div className={`font-bold ${getStatusColor(detail.status)}`}>
                  {detail.status}
                </div>
              </div>
              <div className="text-gray-300 text-sm mt-1">{detail.message}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-gray-800/30 rounded-lg">
          <h3 className="text-xl font-bold text-white mb-4">Next Steps</h3>
          <div className="space-y-2 text-gray-300">
            <p>1. If database connection fails: Check your .env file and Supabase project status</p>
            <p>2. If not logged in: Go to <a href="/login" className="text-teal-400 hover:underline">/login</a> and sign up with your admin email</p>
            <p>3. If not admin: Run the bootstrap-admin script after logging in</p>
            <p>4. If edge functions fail: Deploy your Supabase functions</p>
            <p>5. Once everything passes: Go to <a href="/admin" className="text-teal-400 hover:underline">/admin</a> to manage clients</p>
          </div>
        </div>
      </div>
    </div>
  )
}