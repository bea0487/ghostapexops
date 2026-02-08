import React from 'react'
import PortalLayout from '../components/PortalLayout'

export default function PlaceholderPage({ title, subtitle }) {
  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-orbitron font-bold text-2xl text-white">{title}</h1>
          {subtitle ? <p className="text-gray-400 font-rajdhani mt-1">{subtitle}</p> : null}
        </div>

        <div className="bg-[#0d0d14] border border-cyan-500/20 rounded-xl p-6">
          <p className="text-gray-400 font-rajdhani">Coming soon. This page is ready for UI, but we’re intentionally not calling backend tables yet to avoid errors.</p>
        </div>
      </div>
    </PortalLayout>
  )
}
