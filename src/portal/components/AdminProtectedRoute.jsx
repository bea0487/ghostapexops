import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const AdminProtectedRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth()

  if (loading) return null

  if (!user) {
    return <Navigate to="/portal/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/portal/dashboard" replace />
  }

  return children
}
