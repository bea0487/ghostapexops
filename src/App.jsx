import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from './components/ui/toast'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './routes/Login'
import AuthCallback from './routes/AuthCallback'
import Setup from './routes/Setup'
import AdminDashboard from './routes/AdminDashboard'
import ClientDashboard from './routes/ClientDashboard'
import HomeRedirect from './routes/HomeRedirect'
import TestConnection from './routes/TestConnection'
import MarketingLayout from './marketing/components/MarketingLayout'
import MarketingHome from './marketing/pages/Home'
import MarketingServices from './marketing/pages/Services'
import MarketingTheWingman from './marketing/pages/TheWingman'
import MarketingTheGuardian from './marketing/pages/TheGuardian'
import MarketingApexCommand from './marketing/pages/ApexCommand'
import BootstrapAdmin from './routes/BootstrapAdmin'
import NotFound from './routes/NotFound'

// Portal pages
import PortalLogin from './portal/pages/Login'
import PortalRegister from './portal/pages/Register'
import PortalCheckout from './portal/pages/Checkout'

import AdminClients from './routes/admin/AdminClients'
import AdminEldReports from './routes/admin/AdminEldReports'
import AdminCsaScores from './routes/admin/AdminCsaScores'
import AdminIfta from './routes/admin/AdminIfta'
import AdminDataq from './routes/admin/AdminDataq'
import AdminDriverFiles from './routes/admin/AdminDriverFiles'
import AdminTickets from './routes/admin/AdminTickets'

import {
  PortalDashboard,
  PortalELDReports,
  PortalCSAScores,
  PortalIFTATracking,
  PortalDataQDisputes,
  PortalDriverFiles,
  PortalSupportTickets,
  PortalSettings,
} from './portal'

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        return failureCount < 3
      },
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Routes>
        <Route
          path="/"
          element={
            <MarketingLayout>
              <MarketingHome />
            </MarketingLayout>
          }
        />

        <Route
          path="/Services"
          element={
            <MarketingLayout>
              <MarketingServices />
            </MarketingLayout>
          }
        />

        <Route
          path="/TheWingman"
          element={
            <MarketingLayout>
              <MarketingTheWingman />
            </MarketingLayout>
          }
        />

        <Route
          path="/TheGuardian"
          element={
            <MarketingLayout>
              <MarketingTheGuardian />
            </MarketingLayout>
          }
        />

        <Route
          path="/ApexCommand"
          element={
            <MarketingLayout>
              <MarketingApexCommand />
            </MarketingLayout>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/portal/login" element={<PortalLogin />} />
        <Route path="/portal/register" element={<PortalRegister />} />
        <Route path="/portal/checkout" element={<PortalCheckout />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/test" element={<TestConnection />} />

        <Route
          path="/bootstrap-admin"
          element={
            <ProtectedRoute>
              <BootstrapAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/portal"
          element={
            <ProtectedRoute>
              <Navigate to="/app" replace />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/clients"
          element={
            <ProtectedRoute>
              <AdminClients />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/eld-reports"
          element={
            <ProtectedRoute>
              <AdminEldReports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/csa-scores"
          element={
            <ProtectedRoute>
              <AdminCsaScores />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/ifta"
          element={
            <ProtectedRoute>
              <AdminIfta />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dataq"
          element={
            <ProtectedRoute>
              <AdminDataq />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/driver-files"
          element={
            <ProtectedRoute>
              <AdminDriverFiles />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/tickets"
          element={
            <ProtectedRoute>
              <AdminTickets />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <PortalDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/eld-reports"
          element={
            <ProtectedRoute>
              <PortalELDReports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/csa-scores"
          element={
            <ProtectedRoute>
              <PortalCSAScores />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/ifta"
          element={
            <ProtectedRoute>
              <PortalIFTATracking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/dataq"
          element={
            <ProtectedRoute>
              <PortalDataQDisputes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/driver-files"
          element={
            <ProtectedRoute>
              <PortalDriverFiles />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/support"
          element={
            <ProtectedRoute>
              <PortalSupportTickets />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/settings"
          element={
            <ProtectedRoute>
              <PortalSettings />
            </ProtectedRoute>
          }
        />

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </QueryClientProvider>
  )
}
