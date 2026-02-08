import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MarketingLayout from './components/MarketingLayout'
import Home from './pages/Home'

export default function MarketingRoutes() {
  return (
    <MarketingLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MarketingLayout>
  )
}
