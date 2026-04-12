import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { role } = useAuth()

  if (!role) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/student/dashboard" replace />
  }

  return children
}

export default ProtectedRoute

