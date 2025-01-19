import { Navigate } from 'react-router-dom'
import * as Sentry from "@sentry/react";

interface ProtectedRouteProps {
  children: React.ReactNode
  isAuthenticated: boolean | null
}

export const ProtectedRoute = ({ children, isAuthenticated }: ProtectedRouteProps) => {
  if (isAuthenticated === null) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    Sentry.addBreadcrumb({
      category: 'auth',
      message: 'Unauthorized access attempt to protected route',
      level: 'warning'
    });
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
} 