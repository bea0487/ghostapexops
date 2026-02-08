import React, { useState, useEffect } from 'react'
import { useAuth } from '../portal/context/AuthContext'
import { supabase } from '../lib/supabaseClient'

export default function UserDebugInfo() {
  const { user, isAdmin, client } = useAuth()
  const [sessionInfo, setSessionInfo] = useState(null)

  useEffect(() => {
    const getSessionInfo = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSessionInfo(session)
    }
    getSessionInfo()
  }, [])

  const copyDebugInfo = () => {
    const debugInfo = {
      user: {
        id: user?.id,
        email: user?.email,
        app_metadata: user?.app_metadata,
        user_metadata: user?.user_metadata
      },
      isAdmin,
      client,
      sessionExists: !!sessionInfo
    }
    
    navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2))
    alert('Debug info copied to clipboard!')
  }

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">🔍 Debug Information</h3>
        <button 
          onClick={copyDebugInfo}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Copy Debug Info
        </button>
      </div>
      
      <div className="space-y-3 text-sm">
        <div>
          <span className="text-gray-400">User ID:</span>
          <span className="ml-2 text-white font-mono">{user?.id || 'Not found'}</span>
        </div>
        
        <div>
          <span className="text-gray-400">Email:</span>
          <span className="ml-2 text-white">{user?.email || 'Not found'}</span>
        </div>
        
        <div>
          <span className="text-gray-400">Admin Status:</span>
          <span className={`ml-2 font-semibold ${isAdmin ? 'text-green-400' : 'text-red-400'}`}>
            {isAdmin ? '✅ Admin' : '❌ Not Admin'}
          </span>
        </div>
        
        <div>
          <span className="text-gray-400">App Metadata:</span>
          <pre className="ml-2 text-xs text-gray-300 bg-gray-900 p-2 rounded mt-1 overflow-x-auto">
            {JSON.stringify(user?.app_metadata || {}, null, 2)}
          </pre>
        </div>
        
        <div>
          <span className="text-gray-400">Client Record:</span>
          <pre className="ml-2 text-xs text-gray-300 bg-gray-900 p-2 rounded mt-1 overflow-x-auto">
            {JSON.stringify(client || {}, null, 2)}
          </pre>
        </div>
        
        <div>
          <span className="text-gray-400">Session Active:</span>
          <span className={`ml-2 ${sessionInfo ? 'text-green-400' : 'text-red-400'}`}>
            {sessionInfo ? '✅ Yes' : '❌ No'}
          </span>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/50 rounded">
        <p className="text-yellow-200 text-sm">
          <strong>Instructions:</strong> Copy this debug info and use it with the SQL queries in 
          <code className="bg-gray-700 px-1 rounded mx-1">debug-admin-setup.sql</code> 
          to properly set up admin access.
        </p>
      </div>
    </div>
  )
}