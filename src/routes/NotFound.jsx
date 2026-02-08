import React from 'react'
import { Link } from 'react-router-dom'
import Shell from '../components/Shell'
import Button from '../components/Button'

export default function NotFound() {
  return (
    <Shell title="Route Not Found" subtitle="Ghost Rider: Apex Operations">
      <div className="flex items-center justify-between gap-4">
        <div className="font-rajdhani text-white/70">The page you requested does not exist.</div>
        <Link to="/">
          <Button>Return</Button>
        </Link>
      </div>
    </Shell>
  )
}
