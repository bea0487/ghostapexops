import React from 'react'
import { useAuth } from '../portal/context/AuthContext'
import { supabase } from '../lib/supabaseClient'

export default function DebugInfo() {
  const { user, client, isAdmin } = useAuth()
  const [debugInfo, setDebugInfo] = React.useState(null)

  React.useEffect(() => {
    async function getDebugInfo() {
      try {
        // Test database connection
        const { data: testData, error: testError } = await supabase
          .from('clients')
          .select('count')
          .limit(1)

        // Test support tickets table
        const { data: ticketsData, error: ticketsError } = await supabase
          .from('support_tickets')
          .select('count')
          .limit(1)

        setDebugInfo({
          user: user ? { id: user.id, email: user.email } : null,
          client: client,
          isAdmin,
          supabaseConnected: !testError,
          testError: testError?.message,
          supportTicketsTable: !ticketsError,
          ticketsError: ticketsError?.message,
          timestamp: new Date().toISOString()
        })
      } catch (e) {
        setDebugInfo({
          error: e.message,
          timestamp: new Date().toISOString()
        })
      }
    }

    getDebugInfo()
  }, [user, client, isAdmin])

  if (!debugInfo) return null

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <pre className="whitespace-pre-wrap text-xs">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  )
}