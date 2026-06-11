import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const ProtectedRoute = ({ element }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <div>Loading...</div>

  if (!isAuthenticated) return <Navigate to="/login" replace />

  // якщо element переданий — рендеримо його (для layout-wrapper-ів)
  // якщо ні — рендеримо Outlet (для голих захищених груп)
  return element ?? <Outlet />
}

export default ProtectedRoute