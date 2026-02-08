import React from 'react'
import { RefreshCw } from 'lucide-react'
import { clearAllCaches, getAppVersion } from '../lib/cacheUtils'

export default function VersionInfo({ className = '' }) {
  const [version] = React.useState(() => getAppVersion())
  const [clearing, setClearing] = React.useState(false)

  async function handleClearCache() {
    if (clearing) return
    
    setClearing(true)
    try {
      await clearAllCaches()
    } catch (e) {
      console.error('Failed to clear cache:', e)
      // Fallback: just reload
      window.location.reload(true)
    }
  }

  return (
    <div className={`text-xs text-gray-500 ${className}`}>
      <div className="flex items-center gap-2">
        <span>Build: {version.buildTime.slice(0, 16)}</span>
        <button
          onClick={handleClearCache}
          disabled={clearing}
          className="flex items-center gap-1 px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 transition-colors disabled:opacity-50"
          title="Clear cache and reload"
        >
          <RefreshCw size={12} className={clearing ? 'animate-spin' : ''} />
          {clearing ? 'Clearing...' : 'Refresh'}
        </button>
      </div>
    </div>
  )
}