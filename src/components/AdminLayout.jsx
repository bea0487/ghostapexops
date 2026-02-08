import React from 'react'

export default function AdminLayout({ children, right }) {
  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Ghost Rider Admin</h1>
          </div>
          {right && (
            <div>
              {right}
            </div>
          )}
        </div>
      </header>
      <main className="p-6">
        {children}
      </main>
    </div>
  )
}