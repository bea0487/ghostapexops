import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../portal/context/AuthContext'

export default function ClientCreationDebug() {
  const { user, isAdmin } = useAuth()
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(false)

  const runDiagnostics = async () => {
    setLoading(true)
    const diagnostics = {}

    try {
      // 1. Check session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      diagnostics.session = {
        exists: !!session,
        userEmail: session?.user?.email,
        userId: session?.user?.id,
        appMetadata: session?.user?.app_metadata,
        error: sessionError?.message
      }

      // 2. Check admin status
      diagnostics.adminCheck = {
        isAdminFromContext: isAdmin,
        roleFromMetadata: session?.user?.app_metadata?.role,
        isActuallyAdmin: session?.user?.app_metadata?.role === 'admin'
      }

      // 3. Test Edge Function availability
      try {
        const { data, error } = await supabase.functions.invoke('invite-user', {
          body: { test: true },
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        })
        diagnostics.edgeFunction = {
          available: true,
          response: data,
          error: error?.message
        }
      } catch (err) {
        diagnostics.edgeFunction = {
          available: false,
          error: err.message
        }
      }

      // 4. Test direct client table access
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('count(*)')
          .limit(1)
        
        diagnostics.clientTable = {
          accessible: !error,
          count: data?.[0]?.count,
          error: error?.message
        }
      } catch (err) {
        diagnostics.clientTable = {
          accessible: false,
          error: err.message
        }
      }

      // 5. Check environment
      diagnostics.environment = {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing',
        supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
      }

      setResults(diagnostics)
    } catch (err) {
      setResults({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const testDirectClientCreation = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          email: 'directtest@example.com',
          company_name: 'Direct Test Company',
          client_id: 'DIRECT-TEST-001',
          tier: 'wingman',
          user_id: null
        })
        .select()
        .single()

      setResults(prev => ({
        ...prev,
        directCreation: {
          success: !error,
          data,
          error: error?.message
        }
      }))
    } catch (err) {
      setResults(prev => ({
        ...prev,
        directCreation: {
          success: false,
          error: err.message
        }
      }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-white mb-4">🔧 Client Creation Diagnostics</h3>
      
      <div className="flex space-x-3 mb-4">
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Running...' : 'Run Diagnostics'}
        </button>
        
        <button
          onClick={testDirectClientCreation}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Test Direct Creation
        </button>
      </div>

      {Object.keys(results).length > 0 && (
        <div className="bg-gray-900 p-4 rounded">
          <h4 className="text-lg font-semibold text-white mb-2">Results:</h4>
          <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}